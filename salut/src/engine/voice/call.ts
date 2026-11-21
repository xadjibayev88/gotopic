// Ovozli suhbat boshqaruvchisi (React'dan mustaqil). Bosqichlar:
//   connecting → ready ⇄ user (gapiryapti) → thinking → speaking → ready … → ended
// Qotmaslik uchun: hamma narsa asinxron va bekor qilinadigan; birinchi gap tayyor bo'lishi bilan ovoz;
// keyingi gap ovozi oldindan yuklanadi; tarmoq uzilsa bir marta avtomatik qayta urinadi.
import { ROLES, type CharacterId, type ExplainLang, type RoleId } from '../../data/characters';
import { displayText, extractCues, SentenceSplitter, talkStats, type Action, type Shape } from './markers';
import { Mic, type MicError } from './mic';
import { browserSttSupported, cloudSttSupported, CloudStt, HybridStt, WebSpeechStt, type Stt, type SttError } from './stt';
import { TtsQueue } from './tts';
import type { InputMode, SessionRecord, SttEngine } from './prefs';

export type Phase = 'connecting' | 'ready' | 'user' | 'thinking' | 'speaking' | 'ended';
export type Notice =
  | 'weak'
  | 'reconnecting'
  | 'turnFailed'
  | 'nudgeSilence'
  | 'nudgeNoise'
  | 'tooLong'
  | 'ttsQuota'
  | 'sttFailed'
  | 'upstream'
  | 'rateLimited'
  | null;

export interface VoiceConfig {
  ai: boolean;
  stt: boolean;
  tts: 'elevenlabs' | 'browser';
  audioTags: boolean;
  voices: { id: string; name: string }[];
  sessionMinutes: number;
  cooldownMinutes: number;
}

export interface CallOptions {
  character: CharacterId;
  role: RoleId;
  customRole: string;
  lang: ExplainLang;
  voiceId: string;
  inputMode: InputMode;
  stt: SttEngine;
  micLang: string;
  rate: number;
  name: string;
  context: () => unknown;
  config: VoiceConfig;
}

export interface Turn {
  id: string;
  role: 'user' | 'tutor';
  text: string;
}

export interface Snapshot {
  phase: Phase;
  shape: Shape;
  action: Action | null;
  actionKey: number;
  level: number;
  partial: string;
  live: string;
  turns: Turn[];
  notice: Notice;
  noticeText: string;
  error: MicError | 'ai' | 'stt' | null;
  elapsedMs: number;
  limitMs: number;
  tired: boolean;
  sttKind: 'browser' | 'cloud' | null;
  micLang: string;
  endReason: 'user' | 'limit' | 'error' | null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export class VoiceCall {
  snap: Snapshot;
  private mic = new Mic();
  private stt: Stt | null = null;
  private tts: TtsQueue;
  private ac: AbortController | null = null;
  private turnStart = 0;
  private turnPeak = 0;
  private speakingMs = 0;
  private startedAt = 0;
  private timer = 0;
  private turnTimer = 0;
  private noticeTimer = 0;
  private silentFails = 0;
  private bargeIns: number[] = [];
  private finishing = false;
  private lastLevelEmit = 0;
  private disposed = false;
  readonly id = uid();
  onUpdate?: (s: Snapshot) => void;
  onUserTurn?: () => void;

  constructor(private o: CallOptions) {
    this.tts = new TtsQueue(o.config.tts);
    this.tts.voiceId = o.voiceId || o.config.voices[0]?.id || '';
    this.tts.rate = o.rate;
    this.tts.explainLang = o.lang;
    this.tts.audioTags = o.config.audioTags;
    this.snap = {
      phase: 'connecting',
      shape: 'pill',
      action: null,
      actionKey: 0,
      level: 0,
      partial: '',
      live: '',
      turns: [],
      notice: null,
      noticeText: '',
      error: null,
      elapsedMs: 0,
      limitMs: o.config.sessionMinutes * 60_000,
      tired: false,
      sttKind: null,
      micLang: o.micLang,
      endReason: null,
    };
    this.tts.onSentence = (raw) => {
      const { cue } = extractCues(raw);
      const patch: Partial<Snapshot> = { phase: 'speaking' };
      if (cue.shape) patch.shape = cue.shape;
      if (cue.actions.length) {
        patch.action = cue.actions[0];
        patch.actionKey = this.snap.actionKey + 1;
      }
      this.set(patch);
    };
    this.tts.onLevel = (l) => this.level(l);
    this.tts.onDrain = () => {
      if (this.snap.phase === 'speaking' || this.snap.phase === 'thinking') this.toReady();
    };
    this.tts.onFail = (code) => code === 'tts_quota' && this.notice('ttsQuota');
  }

  private set(p: Partial<Snapshot>) {
    if (this.disposed) return;
    this.snap = { ...this.snap, ...p };
    this.onUpdate?.(this.snap);
  }

  private level(l: number) {
    const now = performance.now();
    if (now - this.lastLevelEmit < 50 && Math.abs(l - this.snap.level) < 0.15) return; // ortiqcha render yo'q
    this.lastLevelEmit = now;
    this.set({ level: l });
  }

  private notice(n: Notice, text = '', ms = 4500) {
    clearTimeout(this.noticeTimer);
    this.set({ notice: n, noticeText: text });
    if (n) this.noticeTimer = window.setTimeout(() => this.set({ notice: null, noticeText: '' }), ms);
  }

  // ---------- Boshlash ----------

  async start() {
    this.tts.unlock();
    try {
      await this.mic.open();
    } catch (e) {
      return this.set({ error: (e as { code?: MicError }).code ?? 'unsupported', phase: 'ended', endReason: 'error' });
    }
    if (!this.o.config.ai) return this.set({ error: 'ai', phase: 'ended', endReason: 'error' });
    this.setupStt(this.o.stt);
    if (!this.stt) return this.set({ error: 'stt', phase: 'ended', endReason: 'error' });
    this.mic.onLevel = (l) => {
      if (this.snap.phase === 'user') {
        this.turnPeak = Math.max(this.turnPeak, l);
        this.level(l);
      }
    };
    this.mic.onSpeechStart = () => this.onVadStart();
    this.mic.onSpeechEnd = () => this.onVadEnd();
    this.mic.vadEnabled = this.o.inputMode === 'handsfree';
    this.startedAt = Date.now();
    this.timer = window.setInterval(() => this.tick(), 500);
    // Salomlashish: LLM kutmasdan darhol gapiradi.
    const role = ROLES.find((r) => r.id === this.o.role) ?? ROLES[0];
    const greet = role.voiceGreet(this.o.name);
    this.addTurn('tutor', greet);
    this.set({ phase: 'speaking', live: '' });
    this.tts.reset();
    this.tts.push(greet);
    this.tts.end();
  }

  private setupStt(pref: SttEngine) {
    const canBrowser = browserSttSupported();
    const canCloud = this.o.config.stt && cloudSttSupported();
    const kind = pref === 'cloud' ? (canCloud ? 'cloud' : canBrowser ? 'browser' : null) : pref === 'browser' ? (canBrowser ? 'browser' : canCloud ? 'cloud' : null) : canBrowser ? 'browser' : canCloud ? 'cloud' : null;
    this.stt?.abort();
    if (!kind) {
      this.stt = null;
      return;
    }
    let stt: Stt;
    if (kind === 'browser' && canCloud && pref === 'auto') {
      const h = new HybridStt(() => this.mic.stream);
      // Nutq bo'lgan: mikrofon darajasi ko'tarilgan yoki tugma 1,2 s dan ko'p bosib turilgan.
      h.spokeHint = () => this.turnPeak > 0.35 || Date.now() - this.turnStart > 1200;
      h.onDegrade = () => this.set({ sttKind: 'cloud' });
      stt = h;
    } else stt = kind === 'browser' ? new WebSpeechStt() : new CloudStt(() => this.mic.stream);
    stt.onPartial = (t) => this.set({ partial: t === '…' ? '' : t });
    stt.onFinal = (t) => void this.onFinal(t);
    stt.onError = (e, m) => this.onSttError(e, m);
    this.stt = stt;
    this.set({ sttKind: kind });
  }

  private tick() {
    const elapsed = Date.now() - this.startedAt;
    const limit = this.snap.limitMs;
    this.set({ elapsedMs: elapsed, tired: elapsed >= limit - 60_000 });
    if (elapsed >= limit && !this.finishing && (this.snap.phase === 'ready' || this.snap.phase === 'user')) this.end('limit');
    else if (elapsed >= limit + 45_000) this.end('limit'); // javob tugashini kutib ham bo'lmasa
  }

  // ---------- Foydalanuvchi navbati ----------

  /** Bosib gapirish: maskot yoki Space bosildi. */
  pressStart() {
    if (this.snap.phase === 'ended' || this.snap.phase === 'connecting') return;
    if (this.snap.phase === 'speaking' || this.snap.phase === 'thinking') this.interrupt();
    this.beginUserTurn();
  }

  /** Bosib gapirish: qo'yib yuborildi. */
  pressEnd() {
    if (this.snap.phase === 'user') this.endUserTurn();
  }

  private onVadStart() {
    if (this.o.inputMode !== 'handsfree') return;
    if (this.snap.phase === 'speaking') {
      // Barge-in: Krua gapirayotganda o'quvchi gapira boshladi.
      const now = Date.now();
      this.bargeIns = [...this.bargeIns.filter((t) => now - t < 20_000), now];
      if (this.bargeIns.length >= 3) this.notice('nudgeNoise');
      this.interrupt();
      this.beginUserTurn();
    } else if (this.snap.phase === 'ready') this.beginUserTurn();
  }

  private onVadEnd() {
    if (this.o.inputMode === 'handsfree' && this.snap.phase === 'user') this.endUserTurn();
  }

  private beginUserTurn() {
    this.tts.stop();
    this.ac?.abort();
    this.turnStart = Date.now();
    this.turnPeak = 0;
    this.set({ phase: 'user', partial: '', live: '', level: 0, notice: null });
    this.stt?.start(this.snap.micLang);
    clearTimeout(this.turnTimer);
    this.turnTimer = window.setTimeout(() => {
      this.notice('tooLong');
      this.endUserTurn();
    }, 60_000);
  }

  private endUserTurn() {
    clearTimeout(this.turnTimer);
    if (this.snap.phase !== 'user') return;
    this.speakingMs += Date.now() - this.turnStart;
    this.set({ phase: 'thinking', level: 0 });
    this.stt?.stop();
  }

  private async onFinal(text: string) {
    const t = text.trim();
    if (this.snap.phase !== 'thinking' && this.snap.phase !== 'user') return;
    if (!t) {
      this.silentFails++;
      this.notice(this.o.inputMode === 'handsfree' && this.silentFails >= 2 ? 'nudgeSilence' : 'turnFailed');
      return this.toReady();
    }
    this.silentFails = 0;
    this.addTurn('user', t);
    this.set({ partial: '' });
    this.onUserTurn?.();
    await this.ask(t);
  }

  private onSttError(e: SttError, message?: string) {
    if (this.snap.phase === 'ended') return;
    if (e !== 'too-long' && this.stt instanceof WebSpeechStt && this.o.config.stt && cloudSttSupported()) {
      // Brauzer nutq xizmati ishlamasa (tarmoq, ruxsat, xizmat yo'q) — AI aniqlashga o'tamiz.
      // Mikrofon allaqachon ochiq, shuning uchun o'quvchi gapirayotgan replika yo'qolmaydi:
      // yozish shu zahoti AI dvigatelida davom etadi.
      this.setupStt('cloud');
      if (this.snap.phase === 'user') {
        this.stt?.start(this.snap.micLang);
        return;
      }
      this.notice('sttFailed', "Brauzer nutqni aniqlay olmadi — AI aniqlashga o'tdik. Qayta gapiring.");
      return this.toReady();
    }
    if (e === 'denied') return this.set({ error: 'denied', phase: 'ended', endReason: 'error' });
    if (e === 'too-long') return this.notice('tooLong');
    this.notice(e === 'quota' ? 'rateLimited' : 'sttFailed', message ?? '');
    this.toReady();
  }

  private toReady() {
    if (this.snap.phase === 'ended') return;
    this.mic.resetVad();
    this.set({ phase: 'ready', level: 0, live: '' });
    if (this.finishing || Date.now() - this.startedAt >= this.snap.limitMs) this.end('limit');
  }

  // ---------- Krua javobi ----------

  private history() {
    return this.snap.turns.slice(-21, -1).map((t) => ({ role: t.role, text: t.text }));
  }

  private async ask(message: string, retry = 0): Promise<void> {
    this.ac?.abort();
    const ac = new AbortController();
    this.ac = ac;
    this.tts.reset();
    this.set({ phase: 'thinking', live: '' });
    const split = new SentenceSplitter();
    let acc = '';
    const weak = window.setTimeout(() => !acc && this.notice('weak'), 3500);
    try {
      const res = await fetch('./api/tutor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          scenario: this.o.role,
          message,
          history: this.history(),
          context: this.o.context(),
          mode: 'voice',
          character: this.o.character,
          lang: this.o.lang,
          customRole: this.o.customRole,
          audioTags: this.o.config.audioTags,
        }),
        signal: ac.signal,
      });
      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok || !ct.includes('text/event-stream') || !res.body) {
        const b = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
        throw Object.assign(new Error(b.message ?? 'upstream'), { code: b.code ?? 'upstream', http: res.status });
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        buf += dec.decode(value ?? new Uint8Array(), { stream: !done });
        let i: number;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const line = buf.slice(0, i).replace(/^data:\s?/, '');
          buf = buf.slice(i + 2);
          if (!line) continue;
          const ev = JSON.parse(line) as { t?: string; done?: boolean; error?: string; message?: string };
          if (ev.error) throw Object.assign(new Error(ev.message ?? 'upstream'), { code: ev.error });
          if (ev.t) {
            acc += ev.t;
            this.set({ live: displayText(acc) });
            for (const s of split.push(ev.t)) this.tts.push(s);
          }
        }
        if (done) break;
      }
      for (const s of split.flush()) this.tts.push(s);
      clearTimeout(weak);
      if (ac.signal.aborted) return;
      this.addTurn('tutor', acc.trim());
      this.tts.end();
    } catch (e) {
      clearTimeout(weak);
      if (ac.signal.aborted || (e as Error).name === 'AbortError') return;
      const code = (e as { code?: string }).code;
      const http = (e as { http?: number }).http;
      // Tarmoq uzilishi: hali hech narsa kelmagan bo'lsa — bir marta jimgina qayta urinamiz.
      if (!acc && retry === 0 && !http && code !== 'blocked') {
        this.notice('reconnecting');
        await new Promise((r) => setTimeout(r, 700));
        return this.ask(message, 1);
      }
      if (acc.trim()) this.addTurn('tutor', acc.trim());
      this.tts.end();
      this.notice(code === 'rate_limited' || code === 'busy' ? 'rateLimited' : 'upstream', (e as Error).message, 6000);
      if (!acc) this.toReady();
    }
  }

  /** Krua gapini bo'lish: ovoz va oqim darhol to'xtaydi. */
  interrupt() {
    const live = this.snap.live.trim();
    this.tts.stop();
    this.ac?.abort();
    if (live) {
      const last = this.snap.turns[this.snap.turns.length - 1];
      if (!last || last.role !== 'tutor' || displayText(last.text) !== live) this.addTurn('tutor', `${live}…`);
    }
    this.set({ live: '', level: 0 });
  }

  private addTurn(role: 'user' | 'tutor', text: string) {
    if (!text) return;
    this.set({ turns: [...this.snap.turns, { id: uid(), role, text }] });
  }

  // ---------- Sozlamalar (suhbat davomida) ----------

  setMicLang(lang: string) {
    this.set({ micLang: lang });
  }

  setVoice(id: string) {
    this.tts.voiceId = id;
  }

  // ---------- Tugatish ----------

  end(reason: 'user' | 'limit' | 'error' = 'user') {
    if (this.snap.phase === 'ended') return;
    this.finishing = true;
    clearInterval(this.timer);
    clearTimeout(this.turnTimer);
    this.stt?.abort();
    this.tts.stop();
    this.ac?.abort();
    this.mic.close();
    this.set({ phase: 'ended', endReason: reason, level: 0, partial: '', live: '' });
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
      turns: this.snap.turns.map((t) => ({ role: t.role, text: displayText(t.text) })),
      feedback: undefined,
    };
  }

  dispose() {
    this.end('user');
    this.tts.dispose();
    clearTimeout(this.noticeTimer);
    this.disposed = true;
  }
}
