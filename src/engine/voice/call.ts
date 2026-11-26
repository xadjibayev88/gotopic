// Ovozli suhbat boshqaruvchisi (React'dan mustaqil). Bosqichlar:
//   connecting → ready ⇄ user (gapiryapti) → thinking → speaking → ready … → ended
// Qotmaslik uchun: hamma narsa asinxron va bekor qilinadigan; birinchi gap tayyor bo'lishi bilan ovoz;
// keyingi gap ovozi oldindan yuklanadi; tarmoq uzilsa bir marta avtomatik qayta urinadi.
import { ROLES, type CharacterId, type ExplainLang, type RoleId } from '../../data/characters';
import { answerLang, displayText, SentenceSplitter, talkStats } from './markers';
import { Mic, type MicError } from './mic';
import { cloudSttSupported, CloudStt, type ReviewedStt, type SttError, type SttResult } from './stt';
import { TtsQueue } from './tts';
import { NEUTRAL_VIVI_CUE, validateViviCue, type ViviCue } from '../../shared/vivi-cue';
import type { InputMode, SessionRecord, SttEngine } from './prefs';

/** Must exceed the server's free-tier retry plan (see server/gemini-api-provider.ts). */
export const VOICE_REPLY_WATCHDOG_MS = 28_000;

export type Phase = 'connecting' | 'ready' | 'user' | 'review' | 'thinking' | 'speaking' | 'ended';
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
  tts: 'elevenlabs' | 'browser' | 'text';
  audioTags: boolean;
  voices: { id: string; name: string }[];
  sessionMinutes: number;
  cooldownMinutes: number;
  /** Bugun qolgan bepul xabarlar (Super — null). */
  messagesLeft?: number | null;
  messagesPerDay?: number | null;
  premium?: boolean;
  /** Gemini Live mavjudmi. */
  live?: boolean;
  /** Jonli rejimda bugun qolgan daqiqalar. */
  liveMinutes?: number;
  /** Reklama ko'rib olinadigan qo'shimcha daqiqalar (bugun qolgan soni). */
  rewardsLeft?: number;
  rewardMinutes?: number;
  /** Ovoz manbai: Super — ElevenLabs (Dilzoda), bepul — Gemini ovozi. */
  ttsTier?: 'elevenlabs' | 'gemini' | 'browser' | 'text';
}

export interface CallOptions {
  character: CharacterId;
  role: RoleId;
  customRole: string;
  /** Senzurasiz rejim (18+). */
  explicit?: boolean;
  lang: ExplainLang;
  voiceId: string;
  inputMode: InputMode;
  /** Gapirilgan matnni tasdiqlash oynasisiz darhol yuborish (sukut bo'yicha yoqilgan). */
  autoSend?: boolean;
  stt: SttEngine;
  micLang: string;
  /** Mikrofon tili «Avto»: Vivi javobiga qarab o'zi almashadi. */
  autoMic?: boolean;
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
  /** Rasm effekti: so'nggi [[img:...]] (key — har safar yangidan chiqishi uchun). */
  image: { q: string; key: number } | null;
  level: number;
  partial: string;
  /** STT natijasi: Vivi'ga yuborishdan oldin tahrirlash uchun. */
  draft: string;
  /** Metadata-only result remains available through retry; it is never a submitted user turn. */
  sttResult: SttResult | null;
  retryAvailable: boolean;
  live: string;
  /** Validated semantic cue; never parsed from learner-facing text or executable markers. */
  cue: ViviCue;
  turns: Turn[];
  notice: Notice;
  noticeText: string;
  error: MicError | 'ai' | 'stt' | null;
  elapsedMs: number;
  limitMs: number;
  tired: boolean;
  sttKind: 'cloud' | null;
  micLang: string;
  endReason: 'user' | 'limit' | 'error' | null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export class VoiceCall {
  snap: Snapshot;
  private mic = new Mic();
  private stt: ReviewedStt | null = null;
  private tts: TtsQueue;
  private ac: AbortController | null = null;
  private turnStart = 0;
  private turnPeak = 0;
  private speakingMs = 0;
  private startedAt = 0;
  private timer = 0;
  private turnTimer = 0;
  private noticeTimer = 0;
  private bargeIns: number[] = [];
  private finishing = false;
  private lastLevelEmit = 0;
  private disposed = false;
  private requestSeq = 0;
  private responseWaitingForDrain = false;
  private draftSubmitted = false;
  private draftTurnId: string | null = null;
  readonly id = uid();
  onUpdate?: (s: Snapshot) => void;
  onUserTurn?: () => void;

  constructor(private o: CallOptions) {
    this.tts = new TtsQueue(o.config.tts);
    this.tts.voiceId = o.voiceId || o.config.voices[0]?.id || '';
    this.tts.rate = o.rate;
    this.tts.explainLang = o.lang;
    this.tts.audioTags = o.config.audioTags;
    // Bepul Gemini ovozida so'rovlar kam bo'lsin (daqiqalik limit) — gaplar birlashtiriladi.
    this.tts.merge = o.config.ttsTier === 'gemini';
    this.snap = {
      phase: 'connecting',
      image: null,
      level: 0,
      partial: '',
      draft: '',
      sttResult: null,
      retryAvailable: false,
      live: '',
      cue: { ...NEUTRAL_VIVI_CUE },
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
    this.tts.onSentence = () => this.set({ phase: 'speaking' });
    this.tts.onLevel = (l) => this.level(l);
    this.tts.onDrain = () => {
      if (this.snap.phase === 'speaking' || (this.snap.phase === 'thinking' && this.responseWaitingForDrain)) {
        this.responseWaitingForDrain = false;
        this.toReady();
      }
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
    // ~30 fps yetarli; 0 (og'iz yopilishi) hech qachon tashlab yuborilmaydi.
    if (l !== 0 && now - this.lastLevelEmit < 33 && Math.abs(l - this.snap.level) < 0.12) return;
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
    // A saved-memory greeting stays local and silent; only a confirmed learner turn may call the tutor.
    const memory = (this.o.context() as { memory?: string })?.memory;
    const role = ROLES.find((r) => r.id === this.o.role) ?? ROLES[0];
    const greet = role.voiceGreet(this.o.name);
    this.addTurn('tutor', greet);
    if (memory && memory.trim()) {
      this.set({ phase: 'ready', live: '', cue: { ...NEUTRAL_VIVI_CUE } });
      return;
    }
    // Salomlashish: LLM kutmasdan darhol gapiradi.
    this.set({ phase: 'speaking', live: '' });
    this.tts.reset();
    this.tts.push(greet);
    this.tts.end();
  }

  private setupStt(_pref: SttEngine) {
    const canCloud = this.o.config.stt && cloudSttSupported();
    this.stt?.abort();
    if (!canCloud) {
      this.stt = null;
      this.set({ sttKind: null });
      return;
    }
    const stt = new CloudStt(() => this.mic.stream);
    stt.context = () => [...this.snap.turns].reverse().find((t) => t.role === 'tutor')?.text ?? '';
    stt.onPartial = (t) => this.set({ partial: t === '…' ? '' : t });
    stt.onFinal = (result) => void this.onFinal(result);
    stt.onError = (e, m) => this.onSttError(e, m);
    this.stt = stt;
    this.set({ sttKind: 'cloud' });
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
      // Barge-in: Vivi gapirayotganda o'quvchi gapira boshladi.
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
    if (this.snap.phase === 'review') return;
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

  private async onFinal(result: SttResult) {
    const t = result.text.trim();
    if (this.snap.phase !== 'thinking' && this.snap.phase !== 'user') return;
    this.draftSubmitted = false;
    this.draftTurnId = null;
    if (!t) {
      // Hech narsa eshitilmadi — oynani ochmasdan qayta tinglashga qaytamiz.
      this.notice('nudgeSilence');
      this.set({ partial: '', live: '', level: 0 });
      this.toReady();
      return;
    }
    this.set({ phase: 'review', draft: t, sttResult: result, retryAvailable: false, partial: '', live: '', level: 0 });
    // Avto-yuborish: gapirgan matn tekshirish oynasisiz darhol Vivi'ga ketadi (suhbat matnida ko'rinadi).
    // Faqat «autoSend: false» bo'lsa, avvalgidek tasdiqlash oynasi qoladi.
    if (this.o.autoSend !== false) this.submitDraft(t);
  }

  /** STT matnini tahrirlash oynasida saqlash. */
  setDraft(text: string) {
    if (this.snap.phase !== 'review') return;
    this.set({ draft: text });
  }

  /** Tahrirlangan matnni Vivi'ga yuborish; qayta urinishda user turn takrorlanmaydi. */
  submitDraft(text = this.snap.draft) {
    if (this.snap.phase !== 'review') return;
    const draft = text.trim();
    if (!draft) return;
    this.set({ draft, retryAvailable: false, partial: '', live: '', phase: 'thinking', level: 0 });
    if (!this.draftSubmitted) {
      this.draftSubmitted = true;
      this.draftTurnId = uid();
      this.set({ turns: [...this.snap.turns, { id: this.draftTurnId, role: 'user', text: draft }] });
      this.onUserTurn?.();
    } else if (this.draftTurnId) {
      this.set({ turns: this.snap.turns.map((turn) => turn.id === this.draftTurnId ? { ...turn, text: draft } : turn) });
    }
    void this.ask(draft);
  }

  /** Discard the pending draft and return to listening without sending it. */
  discardDraft() {
    if (this.snap.phase !== 'review') return;
    if (this.draftTurnId) this.set({ turns: this.snap.turns.filter((turn) => turn.id !== this.draftTurnId) });
    this.draftSubmitted = false;
    this.draftTurnId = null;
    this.notice(null);
    this.set({ draft: '', sttResult: null, retryAvailable: false, live: '', level: 0 });
    this.toReady();
  }

  /** Cancel a pending transcript and close the call without creating a user turn. */
  cancelDraft() {
    if (this.snap.phase !== 'review') return;
    this.draftSubmitted = false;
    this.draftTurnId = null;
    this.set({ draft: '', sttResult: null, retryAvailable: false });
    this.end('user');
  }

  private onSttError(e: SttError, message?: string) {
    if (this.snap.phase === 'ended') return;
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

  // ---------- Vivi javobi ----------

  private history() {
    return this.snap.turns.filter((t) => t.id !== this.draftTurnId).slice(-20).map((t) => ({ role: t.role, text: t.text }));
  }

  private async ask(message: string): Promise<void> {
    const seq = ++this.requestSeq;
    this.ac?.abort();
    const ac = new AbortController();
    this.ac = ac;
    this.tts.reset();
    this.set({ phase: 'thinking', live: '', cue: { ...NEUTRAL_VIVI_CUE } });
    const split = new SentenceSplitter();
    let acc = '';
    let responseComplete = false;
    const weak = window.setTimeout(() => !acc && this.notice('weak'), 3500);
    // If no reply arrives in time, abort once and leave retry to the learner. The server may spend up to
    // ~25 s retrying an overloaded Gemini model (it answers in one piece, not token by token), so the
    // watchdog must outlast that plan or a reply the server did obtain would be thrown away.
    let stalled = false;
    const watchdog = window.setTimeout(() => {
      if (!acc && !ac.signal.aborted) {
        stalled = true;
        ac.abort();
      }
    }, VOICE_REPLY_WATCHDOG_MS);
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
          explicit: !!this.o.explicit,
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
          const ev = JSON.parse(line) as { t?: string; cue?: unknown; done?: boolean; error?: string; message?: string };
          if (ev.error) throw Object.assign(new Error(ev.message ?? 'upstream'), { code: ev.error });
          if (ev.t) {
            clearTimeout(watchdog);
            acc += ev.t;
            this.set({ live: displayText(acc) });
          }
          if (Object.prototype.hasOwnProperty.call(ev, 'cue')) this.set({ cue: validateViviCue(ev.cue) });
          if (ev.done) responseComplete = true;
        }
        if (done) break;
      }
      clearTimeout(weak);
      clearTimeout(watchdog);
      if (!responseComplete) throw Object.assign(new Error('Tutor response ended before done event'), { code: 'incomplete_response' });
      if (!acc.trim()) throw Object.assign(new Error('Tutor javobi bo‘sh. Qayta urinib ko‘ring.'), { code: 'empty_response' });
      if (ac.signal.aborted || seq !== this.requestSeq || this.snap.phase !== 'thinking') return;
      for (const s of split.push(acc)) this.tts.push(s);
      for (const s of split.flush()) this.tts.push(s);
      this.addTurn('tutor', acc.trim());
      this.autoMic(acc);
      this.draftSubmitted = false;
      this.draftTurnId = null;
      this.set({ draft: '', sttResult: null, retryAvailable: false });
      this.responseWaitingForDrain = true;
      this.tts.end();
    } catch (e) {
      clearTimeout(weak);
      clearTimeout(watchdog);
      if (seq !== this.requestSeq || this.snap.phase === 'ended') return;
      if (stalled) {
        this.notice('upstream', 'Vivi javob bermadi — matnni tekshirib, qayta yuboring.', 6000);
        this.responseWaitingForDrain = false;
        this.set({ phase: this.draftSubmitted ? 'review' : 'ready', draft: this.draftSubmitted ? this.snap.draft || message : this.snap.draft, retryAvailable: this.draftSubmitted, live: '', level: 0 });
        return;
      }
      if (ac.signal.aborted || (e as Error).name === 'AbortError') return;
      const code = (e as { code?: string }).code;
      if (!responseComplete || !acc.trim()) this.set({ live: '', cue: { ...NEUTRAL_VIVI_CUE } });
      if (responseComplete && acc.trim()) this.addTurn('tutor', acc.trim());
      this.tts.end();
      if (code === 'voice_limit') {
        // Bepul ovozli suhbat limiti tugadi — suhbat yakunlanadi (tahlil va dam olish ekrani).
        this.notice('upstream', (e as Error).message, 6000);
        return this.end('limit');
      }
      this.notice(code === 'rate_limited' || code === 'busy' ? 'rateLimited' : 'upstream', (e as Error).message, 6000);
      this.responseWaitingForDrain = false;
      if (this.draftSubmitted) this.set({ phase: 'review', draft: this.snap.draft || message, retryAvailable: true, live: '', level: 0 });
      else this.toReady();
    }
  }

  /** Vivi gapini bo'lish: ovoz va oqim darhol to'xtaydi. */
  interrupt() {
    this.tts.stop();
    this.ac?.abort();
    this.requestSeq++;
    this.responseWaitingForDrain = false;
    this.set({ live: '', level: 0, cue: { ...NEUTRAL_VIVI_CUE } });
  }

  private addTurn(role: 'user' | 'tutor', text: string) {
    if (!text) return;
    this.set({ turns: [...this.snap.turns, { id: uid(), role, text }] });
  }

  // ---------- Sozlamalar (suhbat davomida) ----------

  /** Avtomatik mikrofon tili: Vivi fransuzcha javob kutsa — fr-FR, aks holda asosiy til. */
  private autoMic(reply: string) {
    if (!this.o.autoMic) return;
    const want = answerLang(reply);
    if (!want) return;
    const next = want === 'fr' ? 'fr-FR' : this.o.micLang.startsWith('fr') ? 'uz-UZ' : this.o.micLang;
    if (next !== this.snap.micLang) this.set({ micLang: next });
  }

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
    this.requestSeq++;
    this.responseWaitingForDrain = false;
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
