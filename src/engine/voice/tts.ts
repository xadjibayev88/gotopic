// Ovozlashtirish navbati (gap-gap bo'yicha, kechikishsiz):
//  - ElevenLabs (server /api/tts): har bir gap darhol yuklana boshlaydi (prefetch),
//    oldingisi tugashi bilan keyingisi uziluvsiz ijro etiladi.
//  - Brauzer ovozi faqat alohida engine sifatida tanlansa ishlaydi; TTS xatosi unga yashirincha o'tmaydi.
// Barge-in: stop() hamma narsani darhol to'xtatadi.
import { displayText, langSegments, speechText } from './markers';

export type TtsEngine = 'elevenlabs' | 'browser' | 'text';

interface Item {
  raw: string;
  audio?: Promise<Blob | null>;
  ac?: AbortController;
}

function voiceFor(lang: string): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  const l = lang.toLowerCase();
  const match = voices.filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith(l));
  return match.find((v) => /natural|neural|online|enhanced|premium|google/i.test(v.name)) ?? match[0] ?? null;
}

export function browserVoiceAvailable(lang: string): boolean {
  return !!voiceFor(lang);
}

/** 0,05 s jim 8 kHz WAV (data URI) — audio elementni foydalanuvchi bosganda «ochish» uchun. */
const SILENT_WAV = (() => {
  const n = 400;
  const b = new Uint8Array(44 + n);
  const v = new DataView(b.buffer);
  const str = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, n, true); b.fill(128, 44);
  let bin = '';
  b.forEach((x) => (bin += String.fromCharCode(x)));
  return 'data:audio/wav;base64,' + btoa(bin);
})();

export class TtsQueue {
  private items: Item[] = [];
  private playing = false;
  private stopped = false;
  private el: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private raf = 0;
  private url = '';
  private ended = false;
  engine: TtsEngine;
  voiceId = '';
  rate = 1;
  explainLang = 'uz';
  audioTags = false;
  onSentence?: (raw: string) => void;
  onLevel?: (level: number) => void;
  onDrain?: () => void;
  onFail?: (code: 'tts_quota' | 'tts_failed') => void;
  /**
   * Birinchi gapdan keyingilarni bitta so'rovga birlashtirish (bepul Gemini ovozi daqiqasiga
   * bir necha so'rovga ruxsat beradi — gap-gap so'rash limitni darhol tugatadi).
   */
  merge = false;
  private pending = '';
  private pushed = 0;

  constructor(engine: TtsEngine) {
    this.engine = engine;
  }

  get busy(): boolean {
    return this.playing || this.items.length > 0;
  }

  /** Yangi javob boshlanishi oldidan. */
  reset() {
    this.stop();
    this.stopped = false;
    this.ended = false;
    this.pending = '';
    this.pushed = 0;
  }

  push(raw: string) {
    if (this.stopped) return;
    if (this.merge && this.engine === 'elevenlabs' && this.pushed++ > 0) {
      // Birinchi gap darhol; qolganlari ~260 belgigacha yig'iladi.
      this.pending = this.pending ? `${this.pending} ${raw}` : raw;
      if (this.pending.length < 260) return;
      raw = this.pending;
      this.pending = '';
    }
    this.items.push({ raw });
    this.prefetch();
    if (!this.playing) void this.next();
  }

  /** Javob matni tugadi — navbat bo'shaganda onDrain chaqiriladi. */
  end() {
    if (this.pending && !this.stopped) {
      const raw = this.pending;
      this.pending = '';
      this.items.push({ raw });
      this.prefetch();
      if (!this.playing) void this.next();
    }
    this.ended = true;
    if (!this.playing && !this.items.length) this.onDrain?.();
  }

  stop() {
    this.stopped = true;
    for (const it of this.items) it.ac?.abort();
    this.items = [];
    this.playing = false;
    if (this.el) {
      this.el.pause();
      this.el.removeAttribute('src');
    }
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    cancelAnimationFrame(this.raf);
    this.onLevel?.(0);
  }

  dispose() {
    this.stop();
    if (this.url) URL.revokeObjectURL(this.url);
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }

  /**
   * Ovoz faqat navbatdagi 2 ta gap uchun oldindan so'raladi (hozirgisi + keyingisi).
   * ElevenLabs tarifida bir vaqtdagi so'rovlar soni cheklangan — hammasini birdan so'rash 429 beradi.
   */
  private prefetch() {
    if (this.engine !== 'elevenlabs') return;
    const inflight = (this.playing ? 1 : 0) + 0;
    let budget = Math.max(0, 2 - inflight);
    for (const it of this.items) {
      if (budget <= 0) break;
      if (!it.audio) {
        it.ac = new AbortController();
        it.audio = this.fetchAudio(it.raw, it.ac.signal);
      }
      budget--;
    }
  }

  private async fetchAudio(raw: string, signal: AbortSignal): Promise<Blob | null> {
    const text = speechText(raw, this.audioTags);
    if (!/[\p{L}\p{N}]/u.test(text)) return null;
    try {
      const res = await fetch('./api/tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, raw: raw.slice(0, 900), voice: this.voiceId }),
        signal,
      });
      if (res.status === 429 || res.status === 503) {
        const b = (await res.json().catch(() => ({}))) as { code?: string };
        if (b.code === 'tts_quota' || b.code === 'ai_quota_exhausted') {
          this.onFail?.('tts_quota');
          return null;
        }
        this.onFail?.('tts_failed');
        return null;
      }
      if (!res.ok) throw new Error(`tts ${res.status}`);
      return await res.blob();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') this.onFail?.('tts_failed');
      return null;
    }
  }

  private async next() {
    const item = this.items.shift();
    if (!item || this.stopped) {
      this.playing = false;
      if (this.ended && !this.stopped) this.onDrain?.();
      return;
    }
    this.playing = true;
    if (this.engine === 'elevenlabs' && !item.audio) {
      item.ac = new AbortController();
      item.audio = this.fetchAudio(item.raw, item.ac.signal);
    }
    this.prefetch(); // keyingi gap ovozi shu gap ijro etilayotganda tayyorlanadi
    try {
      if (this.engine === 'elevenlabs' && item.audio) {
        const blob = await item.audio;
        if (this.stopped) return;
        if (blob) {
          // "Gapirmoqda" holati faqat audio ijro etilayotganda o'zgaradi.
          this.onSentence?.(item.raw);
          await this.playBlob(blob);
        }
      } else if (this.engine === 'browser') {
        this.onSentence?.(item.raw);
        await this.speakBrowser(item.raw);
      }
    } catch {
      /* bitta gap xatosi butun javobni to'xtatmaydi */
    }
    if (!this.stopped) void this.next();
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.el) return this.el;
    const el = new Audio();
    el.preload = 'auto';
    this.el = el;
    try {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new C();
      const src = this.ctx.createMediaElementSource(el);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      src.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch {
      this.analyser = null;
    }
    return el;
  }

  /** Foydalanuvchi bosgan paytda chaqiriladi (iOS audio cheklovlari uchun). */
  unlock() {
    const el = this.ensureAudio();
    void this.ctx?.resume();
    // Mobil brauzerlar audio'ni faqat bosish paytida «ochadi»: manbasiz play() hech narsani ochmaydi,
    // shuning uchun qisqa jim WAV bilan o'ynatamiz — keyin (TTS javobi kelganda) ijro bloklanmaydi.
    if (!el.src) el.src = SILENT_WAV;
    el.muted = true;
    void el.play().catch(() => undefined).finally(() => {
      el.pause();
      el.muted = false;
    });
  }

  private playBlob(blob: Blob): Promise<void> {
    const el = this.ensureAudio();
    void this.ctx?.resume();
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = URL.createObjectURL(blob);
    el.src = this.url;
    el.playbackRate = this.rate;
    const data = new Uint8Array(this.analyser?.fftSize ?? 512);
    // Lab-sinxron: RMS + tez ochilish / sekin yopilish (attack/release) va shovqin darvozasi.
    let env = 0;
    let floor = 0.02;
    const t0 = performance.now();
    const meter = () => {
      this.raf = requestAnimationFrame(meter);
      let target: number;
      if (!this.analyser) {
        // Analizator yo'q (masalan, iOS yoki CORS): bo'g'inlarga o'xshash sun'iy to'lqin.
        target = syllableWave(performance.now() - t0);
      } else {
        this.analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        floor = Math.min(floor * 0.995 + rms * 0.005, 0.05);
        target = Math.max(0, Math.min(1, (rms - floor * 1.2) * 5.5));
      }
      env += (target - env) * (target > env ? 0.55 : 0.22);
      this.onLevel?.(env < 0.03 ? 0 : env);
    };
    return new Promise((resolve) => {
      const done = () => {
        cancelAnimationFrame(this.raf);
        this.onLevel?.(0);
        el.onended = el.onerror = el.onpause = null;
        resolve();
      };
      el.onended = done;
      el.onerror = done;
      el.onpause = () => {
        if (this.stopped) done();
      };
      void el.play().then(meter, done);
    });
  }

  private speakBrowser(raw: string): Promise<void> {
    if (typeof speechSynthesis === 'undefined') return Promise.resolve();
    const segs = langSegments(displayText(raw).replace(/\*\*/g, ''));
    const mainVoice = voiceFor(this.explainLang);
    const frVoice = voiceFor('fr');
    const queue = segs.filter((s) => s.fr || mainVoice);
    if (!queue.length) return new Promise((r) => setTimeout(r, Math.min(2500, 60 * raw.length)));
    return new Promise((resolve) => {
      let i = 0;
      const speakNext = () => {
        if (this.stopped || i >= queue.length) {
          this.onLevel?.(0);
          return resolve();
        }
        const s = queue[i++];
        const u = new SpeechSynthesisUtterance(s.text);
        const v = s.fr ? frVoice : mainVoice;
        u.lang = s.fr ? 'fr-FR' : v?.lang ?? this.explainLang;
        if (v) u.voice = v;
        u.rate = s.fr ? Math.min(1, this.rate * 0.92) : this.rate;
        // Brauzer ovozida audio signal yo'q — og'iz bo'g'in ritmida harakatlanadi, so'z chegarasida urg'u.
        let boost = 0;
        const t0 = performance.now();
        const anim = () => {
          this.raf = requestAnimationFrame(anim);
          boost *= 0.86;
          this.onLevel?.(Math.min(1, syllableWave(performance.now() - t0) * 0.85 + boost));
        };
        const next = () => {
          cancelAnimationFrame(this.raf);
          this.onLevel?.(0);
          speakNext();
        };
        u.onstart = () => {
          cancelAnimationFrame(this.raf);
          anim();
        };
        u.onboundary = () => {
          boost = 0.35;
        };
        u.onend = next;
        u.onerror = next;
        speechSynthesis.speak(u);
      };
      speakNext();
    });
  }
}

/** Nutqqa o'xshash bo'g'in to'lqini (~5 bo'g'in/soniya), sun'iy lab harakati uchun. 0..1 */
export function syllableWave(ms: number): number {
  const t = ms / 1000;
  const a = Math.abs(Math.sin(t * Math.PI * 4.7));
  const b = Math.abs(Math.sin(t * Math.PI * 2.3 + 1.1));
  const pause = Math.sin(t * Math.PI * 0.55) > 0.86 ? 0.15 : 1; // vaqti-vaqti bilan nafas pauzasi
  return Math.max(0, Math.min(1, (0.25 + 0.6 * a * (0.55 + 0.45 * b)) * pause));
}
