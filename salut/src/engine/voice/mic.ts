// Mikrofon: ruxsat, ovoz darajasi va ovoz faolligini aniqlash (VAD).
// Echo-cancellation yoqilgan — Krua ovozi mikrofonga qaytib tushmasligi uchun.

export type MicError = 'denied' | 'notfound' | 'busy' | 'unsupported' | 'blocked';

export function micErrorCode(e: unknown): MicError {
  const name = (e as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'notfound';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  return 'unsupported';
}

export interface VadOptions {
  /** Shovqindan necha marta baland bo'lsa — nutq. */
  ratio?: number;
  /** Nutq boshlandi deyish uchun minimal davomiylik (ms). */
  startMs?: number;
  /** Nutq tugadi deyish uchun jimlik (ms). */
  endMs?: number;
}

export class Mic {
  stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private raf = 0;
  private data = new Float32Array(1024);
  private noise = 0.006;
  private speaking = false;
  private aboveSince = 0;
  private belowSince = 0;
  level = 0;
  onLevel?: (level: number) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  vad: Required<VadOptions> = { ratio: 3.2, startMs: 220, endMs: 850 };
  /** VAD vaqtincha o'chirilishi mumkin (masalan, bosib gapirish rejimida). */
  vadEnabled = true;

  static supported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }

  async open(): Promise<void> {
    if (this.stream) return;
    if (!Mic.supported()) throw Object.assign(new Error('unsupported'), { code: 'unsupported' as MicError });
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch (e) {
      throw Object.assign(new Error('mic'), { code: micErrorCode(e) });
    }
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new C();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.data = new Float32Array(this.analyser.fftSize);
    src.connect(this.analyser);
    const started = performance.now();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      if (!this.analyser) return;
      this.analyser.getFloatTimeDomainData(this.data);
      let sum = 0;
      for (let i = 0; i < this.data.length; i++) sum += this.data[i] * this.data[i];
      const rms = Math.sqrt(sum / this.data.length);
      const now = performance.now();
      // Shovqin darajasini sekin moslashtiramiz (faqat jim paytda).
      if (!this.speaking) this.noise = now - started < 600 ? Math.max(0.002, (this.noise + rms) / 2) : this.noise * 0.995 + Math.min(rms, this.noise * 2) * 0.005;
      this.level = Math.min(1, rms / Math.max(0.02, this.noise * 8));
      this.onLevel?.(this.level);
      if (!this.vadEnabled) return;
      const threshold = Math.max(0.012, this.noise * this.vad.ratio);
      if (rms > threshold) {
        this.belowSince = 0;
        if (!this.aboveSince) this.aboveSince = now;
        if (!this.speaking && now - this.aboveSince >= this.vad.startMs) {
          this.speaking = true;
          this.onSpeechStart?.();
        }
      } else {
        this.aboveSince = 0;
        if (this.speaking) {
          if (!this.belowSince) this.belowSince = now;
          if (now - this.belowSince >= this.vad.endMs) {
            this.speaking = false;
            this.onSpeechEnd?.();
          }
        }
      }
    };
    loop();
  }

  resetVad() {
    this.speaking = false;
    this.aboveSince = 0;
    this.belowSince = 0;
  }

  close() {
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close().catch(() => undefined);
    this.stream = null;
    this.ctx = null;
    this.analyser = null;
  }
}
