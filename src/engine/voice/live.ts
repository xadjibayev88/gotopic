// Gemini Live: real vaqtli ovozli suhbat. Brauzer to'g'ridan-to'g'ri Gemini bilan WebSocket orqali gaplashadi
// (server bergan bir martalik token bilan — API kalit brauzerga chiqmaydi). Mikrofon: PCM16 16 kHz,
// Vivi ovozi: PCM16 24 kHz. Gapni bo'lish, subtitrlar (transkripsiya), taymer va suhbat yozuvi.
import type { CharacterId, ExplainLang, RoleId } from '../../data/characters';
import type { InputMode, SessionRecord } from './prefs';
import { talkStats } from './markers';
import { NEUTRAL_VIVI_CUE, validateViviCue, type ViviCue } from '../../shared/vivi-cue';
import type { SttResult } from './stt-result';

/** Live cue data uses the same strict versioned semantic contract as the rest of the app. */
export type LiveCue = ViviCue;

export type LivePhase = 'connecting' | 'listening' | 'speaking' | 'ended';

export interface LiveSnap {
  phase: LivePhase;
  /** Vivi ovozi darajasi (0..1). */
  level: number;
  /** Mikrofon darajasi (0..1). */
  micLevel: number;
  turns: { role: 'user' | 'tutor'; text: string }[];
  liveUser: string;
  liveTutor: string;
  elapsedMs: number;
  limitMs: number;
  muted: boolean;
  error: string | null;
  endReason: 'user' | 'limit' | 'error' | null;
  cue: LiveCue;
  /** O'quvchi hozir gapiryapti (ilova aniqlagan). */
  userTalking: boolean;
}

export interface ReviewedLiveTranscript {
  readonly sttResult: SttResult;
  readonly confirmedText: string;
  readonly userConfirmed: boolean;
}

export interface LiveOptions {
  character: CharacterId;
  role: RoleId;
  customRole: string;
  explicit: boolean;
  lang: ExplainLang;
  inputMode: InputMode;
  context: () => unknown;
  /** Must be created only after the learner explicitly reviews and confirms a Cloud STT result. */
  reviewedTranscript?: ReviewedLiveTranscript;
}

const WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained';
function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromBase64(b64: string): Int16Array {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const u8 = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Int16Array(buf, 0, Math.floor(bin.length / 2));
}

/** Float32 [-1,1] → PCM16, kerak bo'lsa 16 kHz ga kamaytirib. */
function toPcm16(input: Float32Array, fromRate: number): Uint8Array {
  const ratio = fromRate / 16000;
  const len = Math.floor(input.length / ratio);
  const out = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    // Oyna bo'yicha o'rtacha (oddiy past chastotali filtr) — 48 kHz → 16 kHz da shovqin/buzilish bo'lmasin.
    const a = Math.floor(i * ratio);
    const b = Math.max(a + 1, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = a; j < b && j < input.length; j++) sum += input[j];
    const v = sum / (b - a);
    out[i] = Math.max(-1, Math.min(1, v)) * 0x7fff;
  }
  return new Uint8Array(out.buffer);
}

export class LiveSession {
  snap: LiveSnap;
  onUpdate?: (s: LiveSnap) => void;
  private ws: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private ctxIn: AudioContext | null = null;
  private proc: ScriptProcessorNode | null = null;
  private ctxOut: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gain: GainNode | null = null;
  private nextTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private timer = 0;
  private raf = 0;
  private startedAt = 0;
  private speakingMs = 0;
  private readonly id = `live-${Date.now()}`;

  constructor(private o: LiveOptions) {
    this.snap = { phase: 'connecting', level: 0, micLevel: 0, turns: [], liveUser: '', liveTutor: '', elapsedMs: 0, limitMs: 5 * 60_000, muted: false, error: null, endReason: null, cue: { ...NEUTRAL_VIVI_CUE }, userTalking: false };
  }

  private set(p: Partial<LiveSnap>) {
    this.snap = { ...this.snap, ...p };
    this.onUpdate?.(this.snap);
  }

  async start() {
    let tok: { token?: string; minutes?: number; setup?: unknown; code?: string; message?: string };
    try {
      const r = await fetch('./api/live/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          scenario: this.o.role,
          message: '[SUHBAT BOSHLANDI] jonli suhbat',
          character: this.o.character,
          lang: this.o.lang,
          customRole: this.o.customRole,
          explicit: this.o.explicit,
          react: true,
          vad: 'manual',
          context: this.o.context(),
        }),
      });
      tok = await r.json().catch(() => ({}));
      if (!r.ok || !tok.token) return this.fail(tok.message ?? "Jonli rejimga ulanib bo'lmadi.", tok.code === 'voice_limit' || tok.code === 'daily_limit' ? 'limit' : 'error');
    } catch {
      return this.fail("Internetga ulanib bo'lmadi.");
    }
    this.set({ limitMs: (tok.minutes ?? 5) * 60_000 });
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    } catch {
      return this.fail('Mikrofonga ruxsat berilmadi.');
    }
    // Qurilmaning o'z chastotasi (ba'zi telefonlar majburiy 24 kHz ni qo'llamaydi); bufer 24 kHz — brauzer o'zi o'giradi.
    this.ctxOut = new AudioContext();
    this.gain = this.ctxOut.createGain();
    this.analyser = this.ctxOut.createAnalyser();
    this.analyser.fftSize = 512;
    this.gain.connect(this.analyser);
    this.analyser.connect(this.ctxOut.destination);

    // Sahifa yopilsa ham suhbat to'g'ri tugaydi (va hisobot yuboriladi).
    window.addEventListener('pagehide', () => this.end('user'), { once: true });
    const ws = new WebSocket(`${WS_URL}?access_token=${encodeURIComponent(tok.token)}`);
    this.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({ setup: tok.setup }));
    ws.onmessage = (ev) => void this.onMessage(ev);
    ws.onerror = () => this.snap.phase !== 'ended' && this.fail("Jonli aloqa uzildi.");
    ws.onclose = (e) => {
      if (this.snap.phase === 'ended') return;
      if (e.code === 1000) this.end('user');
      else this.fail(this.snap.elapsedMs >= this.snap.limitMs - 5000 ? 'Suhbat vaqti tugadi.' : "Jonli aloqa uzildi — qayta urinib ko'ring.", this.snap.elapsedMs >= this.snap.limitMs - 5000 ? 'limit' : 'error');
    };
  }

  private async onMessage(ev: MessageEvent) {
    const raw = typeof ev.data === 'string' ? ev.data : await (ev.data as Blob).text();
    let m: {
      setupComplete?: unknown;
      goAway?: unknown;
      toolCall?: { functionCalls?: { id: string; name: string; args?: Record<string, string> }[] };
      serverContent?: {
        modelTurn?: { parts?: { inlineData?: { data: string; mimeType?: string } }[] };
        outputTranscription?: { text?: string };
        inputTranscription?: { text?: string };
        interrupted?: boolean;
        turnComplete?: boolean;
      };
    };
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }
    this.stats.msgs++;
    if (m.setupComplete) {
      this.startedAt = Date.now();
      this.startMic();
      this.timer = window.setInterval(() => this.tick(), 500);
      this.loop();
      this.set({ phase: 'listening' });
      // Vivi o'zi salomlashadi (xotiradan eslab).
      this.ws?.send(JSON.stringify({ realtimeInput: { text: '[SUHBAT BOSHLANDI]' } }));
      // Qo'riqchi: 7 soniyada Vivi ovozi kelmasa — salomlashishni qayta so'raymiz.
      window.setTimeout(() => {
        if (!this.heard && this.snap.phase !== 'ended') this.ws?.send(JSON.stringify({ realtimeInput: { text: '[SUHBAT BOSHLANDI] Salomlash.' } }));
      }, 7000);
      return;
    }
    if (m.goAway) return this.end('limit');
    if (m.toolCall?.functionCalls?.length) {
      // Avval javob — Vivi kutib qolmasin; effektlar keyin (xato bo'lsa ham suhbat davom etadi).
      this.stats.tools++;
      this.ws?.send(JSON.stringify({ toolResponse: { functionResponses: m.toolCall.functionCalls.map((f) => ({ id: f.id, name: f.name, response: { ok: true }, scheduling: 'WHEN_IDLE' })) } }));
      for (const f of m.toolCall.functionCalls) {
        try {
          this.react(f.args ?? {});
        } catch (e) {
          this.stats.errors.push(`react:${(e as Error).message}`.slice(0, 80));
        }
      }
      return;
    }
    const sc = m.serverContent;
    if (!sc) return;
    if (sc.interrupted) {
      // O'quvchi gapni bo'ldi — Vivi darhol jim bo'ladi.
      this.stopPlayback();
      if (this.snap.liveTutor) this.pushTurn('tutor', `${this.snap.liveTutor}…`);
      this.set({ liveTutor: '', phase: 'listening' });
    }
    for (const p of sc.modelTurn?.parts ?? [])
      if (p.inlineData?.data) {
        this.heard = true;
        this.stats.audio++;
        this.play(fromBase64(p.inlineData.data));
      }
    if (sc.inputTranscription?.text) {
      // Vivi gapira boshlasa, o'quvchining gapi yakunlangan hisoblanadi.
      this.stats.heardUser = true;
      this.set({ liveUser: this.snap.liveUser + sc.inputTranscription.text });
      if (this.snap.liveUser.length < 400) this.guessCueOnce();
    }
    if (sc.outputTranscription?.text) {
      if (this.snap.liveUser.trim()) {
        this.pushTurn('user', this.snap.liveUser.trim());
        this.set({ liveUser: '' });
      }
      this.set({ liveTutor: this.snap.liveTutor + sc.outputTranscription.text });
    }
    if (sc.turnComplete) {
      if (this.snap.liveUser.trim()) this.pushTurn('user', this.snap.liveUser.trim());
      if (this.snap.liveTutor.trim()) this.pushTurn('tutor', this.snap.liveTutor.trim());
      this.set({ liveUser: '', liveTutor: '' });
    }
  }

  // ---------- Gapni aniqlash (ilova tomonida) ----------
  // Ba'zi telefonlarda Gemini'ning avtomatik aniqlagichi nutqni sezmaydi, shuning uchun gap boshlanishi/tugashini
  // ilovaning o'zi aniqlaydi va activityStart/activityEnd yuboradi. «Bosib gapirish» tugmasi ham shu orqali ishlaydi.
  private vad = { on: false, ptt: false, floor: 0.01, loud: 0, quiet: 0, len: 0, pre: [] as Uint8Array[] };

  private sendAudio(pcm: Uint8Array) {
    this.ws?.send(JSON.stringify({ realtimeInput: { audio: { data: toBase64(pcm), mimeType: 'audio/pcm;rate=16000' } } }));
  }

  /** Gap boshlandi / tugadi — Gemini'ga signal. */
  private activity(start: boolean) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (start === this.vad.on) return;
    this.vad.on = start;
    this.vad.len = 0;
    this.vad.quiet = 0;
    if (start) {
      // Vivi gapirayotgan bo'lsa — darhol jim bo'ladi (gapni bo'lish).
      if (this.sources.size) {
        this.stopPlayback();
        if (this.snap.liveTutor) this.pushTurn('tutor', `${this.snap.liveTutor}…`);
        this.set({ liveTutor: '' });
      }
      this.ws.send(JSON.stringify({ realtimeInput: { activityStart: {} } }));
      // Gap boshi kesilib qolmasin: oxirgi ~0.4 s ni ham yuboramiz.
      for (const c of this.vad.pre) this.sendAudio(c);
      this.vad.pre = [];
    } else {
      this.ws.send(JSON.stringify({ realtimeInput: { activityEnd: {} } }));
    }
    this.set({ userTalking: start });
  }

  private vadStep(rms: number, chunkMs: number, pcm: Uint8Array) {
    const v = this.vad;
    // PTT must never be activated by microphone level (including speaker echo).
    // Audio is sent only after the user explicitly toggles PTT on.
    if (this.o.inputMode === 'ptt') {
      if (!v.on) return;
      this.sendAudio(pcm);
      v.len += chunkMs;
      return;
    }
    const playing = this.sources.size > 0;
    // Shovqin darajasi: tez pasayadi, sekin ko'tariladi.
    v.floor = rms < v.floor ? v.floor * 0.7 + rms * 0.3 : v.floor + (rms - v.floor) * 0.003;
    // Vivi gapirayotganda karnay ovozi mikrofonga tushmasligi uchun chegara balandroq.
    const thr = playing ? Math.max(0.07, v.floor * 7) : Math.max(0.014, v.floor * 3.2);
    if (v.on) {
      this.sendAudio(pcm);
      v.len += chunkMs;
      if (v.ptt) return;
      v.quiet = rms < thr * 0.75 ? v.quiet + chunkMs : 0;
      if (v.quiet > 850 || v.len > 25_000) this.activity(false);
      return;
    }
    v.pre.push(pcm);
    if (v.pre.length > Math.ceil(400 / chunkMs)) v.pre.shift();
    v.loud = rms > thr ? v.loud + chunkMs : 0;
    if (v.loud >= (playing ? 260 : 120)) this.activity(true);
  }

  /** Push-to-talk is click-to-toggle so a pointer release cannot cut speech off. */
  togglePushToTalk() {
    if (this.o.inputMode !== 'ptt' || this.snap.phase === 'ended' || this.snap.phase === 'connecting') return;
    if (this.vad.ptt) {
      this.vad.ptt = false;
      if (this.vad.on) this.activity(false);
      return;
    }
    if (this.snap.muted) this.set({ muted: false });
    // Do not leak audio captured before the user deliberately activates PTT.
    this.vad.pre = [];
    this.vad.ptt = true;
    if (!this.vad.on) this.activity(true);
  }

  /** Old Live function-call payloads are translated only at this strict semantic boundary. */
  private react(a: Record<string, string>) {
    const state = this.snap.phase === 'speaking' ? 'speaking' : this.snap.phase === 'listening' ? 'listening' : 'idle';
    const neutralize = () => this.set({ cue: { ...NEUTRAL_VIVI_CUE } });
    try {
      if (typeof a !== 'object' || a === null || Array.isArray(a)) return neutralize();
      const prototype = Object.getPrototypeOf(a) as object | null;
      if (prototype !== Object.prototype && prototype !== null) return neutralize();
      const keys = Reflect.ownKeys(a);
      if (keys.some((key) => typeof key !== 'string' || !['face', 'gesture'].includes(key))) return neutralize();
      const descriptors = Object.getOwnPropertyDescriptors(a) as Record<string, PropertyDescriptor>;
      if (keys.some((key) => !('value' in (descriptors[key as string] ?? {})))) return neutralize();
      const face = descriptors.face?.value;
      const gesture = descriptors.gesture?.value;
      if (typeof face !== 'string') return neutralize();
      this.set({
        cue: validateViviCue({
          state,
          face,
          ...(gesture !== undefined && gesture !== 'none' ? { action: gesture } : {}),
        }),
      });
    } catch {
      this.set({ cue: { ...NEUTRAL_VIVI_CUE } });
    }
  }

  /** Funksiya chaqirilmasa ham: matndan oddiy his-tuyg'ularni taxmin qilamiz. */
  private guessCue(text: string) {
    const t = text.toLowerCase();
    if (/(chatgpt|chat gpt|duolingo|gemini|boshqa ustoz)/.test(t)) this.react({ face: 'angry' });
  }

  private guessed = '';
  private lastEmit = 0;
  private heard = false;
  /** Texnik hisobot (shaxsiy ma'lumotsiz) — telefonlarda nosozlikni topish uchun. */
  private stats = { msgs: 0, audio: 0, tools: 0, micChunks: 0, micPeak: 0, heardUser: false, errors: [] as string[], rateIn: 0, rateOut: 0, outState: '' };
  private guessCueOnce() {
    // Bir gapda bir marta: o'quvchi ChatGPT'ni tilga olsa — rashk (model chaqirmasa ham).
    const u = this.snap.liveUser;
    if (this.guessed && u.startsWith(this.guessed)) return;
    if (/(chatgpt|chat gpt|duolingo)/i.test(u)) {
      this.guessed = u;
      this.guessCue(u);
    }
  }

  private pushTurn(role: 'user' | 'tutor', text: string) {
    this.set({ turns: [...this.snap.turns, { role, text }].slice(-60) });
  }

  private startMic() {
    if (!this.stream) return;
    // Mikrofon qurilmaning o'z chastotasida; 16 kHz ga toPcm16 o'giradi.
    this.ctxIn = new AudioContext();
    this.stats.rateIn = this.ctxIn.sampleRate;
    this.stats.rateOut = this.ctxOut?.sampleRate ?? 0;
    void this.ctxIn.resume().catch(() => undefined);
    const src = this.ctxIn.createMediaStreamSource(this.stream);
    const proc = this.ctxIn.createScriptProcessor(2048, 1, 1);
    const rate = this.ctxIn.sampleRate;
    const chunkMs = (2048 / rate) * 1000;
    proc.onaudioprocess = (e) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const ch = e.inputBuffer.getChannelData(0);
      let peak = 0;
      let sq = 0;
      for (let i = 0; i < ch.length; i += 4) {
        const a = Math.abs(ch[i]);
        if (a > peak) peak = a;
        sq += ch[i] * ch[i];
      }
      const rms = Math.sqrt(sq / (ch.length / 4));
      this.snap.micLevel = this.snap.muted ? 0 : Math.min(1, peak * 2.5);
      this.stats.micPeak = Math.max(this.stats.micPeak, peak);
      this.stats.micChunks++;
      if (this.snap.muted) {
        if (this.vad.on && !this.vad.ptt) this.activity(false);
        return;
      }
      if (peak > 0.04) this.speakingMs += chunkMs;
      const pcm = toPcm16(ch, rate);
      this.vadStep(rms, chunkMs, pcm);
    };
    src.connect(proc);
    proc.connect(this.ctxIn.destination);
    this.proc = proc;
  }

  private play(pcm: Int16Array) {
    const ctx = this.ctxOut;
    if (!ctx || !this.gain || !pcm.length) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const buf = ctx.createBuffer(1, pcm.length, 24000);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.connect(this.gain);
    const at = Math.max(ctx.currentTime + 0.03, this.nextTime);
    s.start(at);
    this.nextTime = at + buf.duration;
    this.sources.add(s);
    s.onended = () => this.sources.delete(s);
    if (this.snap.phase !== 'speaking') this.set({ phase: 'speaking' });
  }

  private stopPlayback() {
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* allaqachon tugagan */
      }
    }
    this.sources.clear();
    this.nextTime = 0;
  }

  private loop() {
    const data = new Uint8Array(256);
    const step = () => {
      if (this.snap.phase === 'ended') return;
      let level = 0;
      if (this.analyser) {
        this.analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
        level = Math.min(1, peak / 64);
      }
      const playing = this.ctxOut ? this.nextTime > this.ctxOut.currentTime : false;
      const phase: LivePhase = playing ? 'speaking' : 'listening';
      // Telefonda qotmasligi uchun: ekran ~15 marta/soniya yangilanadi, holat o'zgarsa — darhol.
      const now = performance.now();
      if (phase !== this.snap.phase || (now - this.lastEmit > 66 && Math.abs(level - this.snap.level) > 0.06)) {
        this.lastEmit = now;
        this.set({ phase, level });
      }
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private tick() {
    const elapsedMs = Date.now() - this.startedAt;
    this.set({ elapsedMs });
    if (elapsedMs >= this.snap.limitMs) this.end('limit');
  }

  toggleMute() {
    const muted = !this.snap.muted;
    if (muted) {
      this.vad.pre = [];
      this.vad.ptt = false;
      if (this.vad.on) this.activity(false);
    }
    this.set({ muted, micLevel: 0 });
  }

  private fail(message: string, reason: 'error' | 'limit' = 'error') {
    this.set({ error: message });
    this.end(reason);
  }

  end(reason: 'user' | 'limit' | 'error' = 'user') {
    if (this.snap.phase === 'ended') return;
    try {
      const body = JSON.stringify({
        event: 'live_end', reason, error: this.snap.error, secs: Math.round(this.snap.elapsedMs / 1000), ...this.stats,
        micPeak: Math.round(this.stats.micPeak * 1000) / 1000, outState: this.ctxOut?.state, ua: navigator.userAgent.slice(0, 120),
      });
      navigator.sendBeacon?.('./api/client-log', new Blob([body], { type: 'application/json' }));
    } catch {
      /* hisobot yetmasa ham bo'ladi */
    }
    clearInterval(this.timer);
    cancelAnimationFrame(this.raf);
    if (this.snap.liveUser.trim()) this.pushTurn('user', this.snap.liveUser.trim());
    if (this.snap.liveTutor.trim()) this.pushTurn('tutor', this.snap.liveTutor.trim());
    try {
      this.ws?.close(1000);
    } catch {
      /* e'tiborsiz */
    }
    this.ws = null;
    this.proc?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stopPlayback();
    void this.ctxIn?.close().catch(() => undefined);
    void this.ctxOut?.close().catch(() => undefined);
    this.set({ phase: 'ended', endReason: reason, level: 0, micLevel: 0, liveUser: '', liveTutor: '' });
  }

  record(): SessionRecord {
    const userTurns = this.snap.turns.filter((t) => t.role === 'user').map((t) => t.text);
    return {
      id: this.id,
      at: this.startedAt || Date.now(),
      character: this.o.character,
      role: this.o.role,
      durationMs: this.snap.elapsedMs,
      speakingMs: this.speakingMs,
      stats: talkStats(userTurns),
      turns: this.snap.turns,
      feedback: undefined,
    };
  }
}
