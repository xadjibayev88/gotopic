// Ovozlashtirish navbati (gap-gap bo'yicha, kechikishsiz):
//  - ElevenLabs (server /api/tts): har bir gap darhol yuklana boshlaydi (prefetch),
//    oldingisi tugashi bilan keyingisi uziluvsiz ijro etiladi.
//  - Brauzer ovozi (speechSynthesis): fransuzcha qism — fr ovoz, qolgani — tushuntirish tilidagi ovoz (bo'lsa).
// Barge-in: stop() hamma narsani darhol to'xtatadi.
import { displayText, langSegments, speechText } from './markers';

export type TtsEngine = 'elevenlabs' | 'browser';

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
  }

  push(raw: string) {
    if (this.stopped) return;
    this.items.push({ raw });
    this.prefetch();
    if (!this.playing) void this.next();
  }

  /** Javob matni tugadi — navbat bo'shaganda onDrain chaqiriladi. */
  end() {
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
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch('./api/tts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text, voice: this.voiceId }),
          signal,
        });
        if (res.status === 429) {
          const b = (await res.json().catch(() => ({}))) as { code?: string };
          if (b.code === 'tts_quota') {
            this.onFail?.('tts_quota');
            return null;
          }
          // Bir vaqtdagi so'rovlar limiti — qisqa kutib, qayta urinamiz.
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 350));
            continue;
          }
          this.onFail?.('tts_failed');
          return null;
        }
        if (!res.ok) throw new Error(`tts ${res.status}`);
        return await res.blob();
      } catch (e) {
        if ((e as Error).name === 'AbortError') return null;
        if (attempt === 1) {
          this.onFail?.('tts_failed');
          return null;
        }
      }
    }
    return null;
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
        // Maskot shakli va "gapirmoqda" holati ovoz aynan boshlanganda o'zgaradi.
        this.onSentence?.(item.raw);
        if (blob) await this.playBlob(blob);
        else await this.speakBrowser(item.raw); // ovoz xizmati ishlamasa — brauzer ovozi bilan davom etamiz
      } else {
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
    const meter = () => {
      this.raf = requestAnimationFrame(meter);
      if (!this.analyser) return this.onLevel?.(0.5);
      this.analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i] - 128));
      this.onLevel?.(Math.min(1, peak / 64));
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
        u.onboundary = () => {
          this.onLevel?.(0.8);
          setTimeout(() => this.onLevel?.(0.25), 120);
        };
        u.onend = speakNext;
        u.onerror = speakNext;
        this.onLevel?.(0.4);
        speechSynthesis.speak(u);
      };
      speakNext();
    });
  }
}
