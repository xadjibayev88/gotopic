// Nutqni aniqlash (STT): ikki dvigatel, bitta interfeys.
//  1) WebSpeechStt — brauzerning o'zi (Chrome/Edge/Safari): eng tez, oraliq subtitr bilan.
//  2) CloudStt — MediaRecorder + /api/stt (Gemini audio): har qanday brauzer, aralash tillar.
import { reviewSttResult, type SttResult } from './stt-result';

export type { DetectedSpeechLanguage, SttResult, SttReviewMetadata, SttReviewReason } from './stt-result';
export { reviewSttResult } from './stt-result';

export type SttError = 'no-speech' | 'network' | 'denied' | 'quota' | 'failed' | 'too-long';

export interface Stt {
  readonly kind: 'browser' | 'cloud';
  start(lang: string): void;
  /** Gapni tugatish — yakuniy matn onFinal orqali keladi. */
  stop(): void;
  /** Bekor qilish — natija kelmaydi. */
  abort(): void;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (e: SttError, message?: string) => void;
}

export interface ReviewedStt {
  readonly kind: 'cloud';
  start(lang: string): void;
  stop(): void;
  abort(): void;
  onPartial?: (text: string) => void;
  onFinal?: (result: SttResult) => void;
  onError?: (e: SttError, message?: string) => void;
}

type SRInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

function SR(): (new () => SRInstance) | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => SRInstance) | undefined;
}

export function browserSttSupported(): boolean {
  return !!SR();
}

export class WebSpeechStt implements Stt {
  readonly kind = 'browser' as const;
  private rec: SRInstance | null = null;
  private finalText = '';
  private interim = '';
  private cancelled = false;
  private delivered = false;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (e: SttError, message?: string) => void;

  start(lang: string) {
    const C = SR();
    if (!C) return this.onError?.('failed', 'Brauzer nutqni aniqlashni qo\'llamaydi');
    this.abort();
    this.cancelled = false;
    this.delivered = false;
    this.finalText = '';
    this.interim = '';
    const rec = new C();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interim = '';
      let fin = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript;
        else interim += r[0].transcript;
      }
      this.finalText = fin;
      this.interim = interim;
      this.onPartial?.((fin + ' ' + interim).replace(/\s+/g, ' ').trim());
    };
    rec.onerror = (e) => {
      if (this.cancelled) return;
      if (e.error === 'no-speech' || e.error === 'aborted') return; // onend hal qiladi
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') this.onError?.('denied');
      else if (e.error === 'network') this.onError?.('network');
      else this.onError?.('failed', e.error);
      this.delivered = true;
    };
    rec.onend = () => {
      if (this.cancelled || this.delivered) return;
      this.delivered = true;
      this.onFinal?.((this.finalText + ' ' + this.interim).replace(/\s+/g, ' ').trim());
    };
    this.rec = rec;
    try {
      rec.start();
    } catch {
      this.onError?.('failed');
    }
  }

  stop() {
    const rec = this.rec;
    try {
      rec?.stop();
    } catch {
      /* allaqachon to'xtagan */
    }
    // Ba'zi brauzerlar (va headless) stop()dan keyin onend yubormaydi — navbat osilib qolmasin.
    window.setTimeout(() => {
      if (this.rec !== rec || this.cancelled || this.delivered) return;
      rec?.onend?.();
    }, 1500);
  }

  abort() {
    this.cancelled = true;
    try {
      this.rec?.abort();
    } catch {
      /* e'tiborsiz */
    }
    this.rec = null;
  }
}

function pickMime(): string {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const m of options) if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(m)) return m;
  return '';
}

export function cloudSttSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!pickMime();
}

async function blobToBase64(b: Blob): Promise<string> {
  const buf = new Uint8Array(await b.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

export class CloudStt implements ReviewedStt {
  readonly kind = 'cloud' as const;
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private cancelled = false;
  private startedAt = 0;
  private ac: AbortController | null = null;
  private limitTimer = 0;
  onPartial?: (text: string) => void;
  onFinal?: (result: SttResult) => void;
  onError?: (e: SttError, message?: string) => void;
  /** Ustozning oxirgi gapi — server aniqroq tanishi uchun kontekst. */
  context: () => string = () => '';

  constructor(private stream: () => MediaStream | null, private maxMs = 60_000) {}

  start(lang: string) {
    const stream = this.stream();
    if (!stream) return this.onError?.('failed', "Mikrofon ochilmagan");
    this.abort();
    this.cancelled = false;
    this.chunks = [];
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    rec.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    rec.onstop = () => void this.finish(rec.mimeType || mime, lang);
    this.rec = rec;
    this.startedAt = Date.now();
    rec.start(250);
    this.onPartial?.('…');
    this.limitTimer = window.setTimeout(() => {
      this.onError?.('too-long');
      this.stop();
    }, this.maxMs);
  }

  private async finish(mime: string, lang: string) {
    clearTimeout(this.limitTimer);
    if (this.cancelled) return;
    const blob = new Blob(this.chunks, { type: mime });
    if (Date.now() - this.startedAt < 350 || blob.size < 1200) {
      const languageCodes = lang.startsWith('fr') ? ['fr-FR'] : lang.startsWith('uz') ? ['uz-UZ'] : [];
      return this.onFinal?.(reviewSttResult({ text: '', languageCodes }));
    }
    this.ac = new AbortController();
    try {
      const res = await fetch('./api/stt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ audio: await blobToBase64(blob), mime: mime.split(';')[0], hint: lang === 'auto' ? 'auto' : lang.startsWith('fr') ? 'fr' : lang.startsWith('uz') ? 'uz' : 'auto', context: this.context().slice(-600) }),
        signal: this.ac.signal,
      });
      const body = (await res.json().catch(() => ({}))) as { text?: unknown; detectedLanguage?: unknown; confidence?: unknown; alternatives?: unknown; reviewReasons?: unknown; code?: string; message?: string };
      if (this.cancelled) return;
      if (!res.ok) return this.onError?.(res.status === 429 ? 'quota' : 'failed', body.message);
      const detectedLanguage = body.detectedLanguage === 'uz-UZ' || body.detectedLanguage === 'fr-FR' || body.detectedLanguage === 'unknown'
        ? body.detectedLanguage
        : null;
      const alternatives = Array.isArray(body.alternatives) && body.alternatives.every((value) => typeof value === 'string')
        ? body.alternatives as string[]
        : null;
      const allowedReasons = new Set(['confidence_missing', 'alternatives_conflict', 'language_unknown', 'code_switch', 'language_mismatch', 'possible_noise', 'target_phrase_mismatch', 'empty_transcript']);
      const reviewReasons = Array.isArray(body.reviewReasons) && body.reviewReasons.every((value) => typeof value === 'string' && allowedReasons.has(value))
        ? body.reviewReasons as SttResult['reviewReasons']
        : null;
      const confidenceValid = body.confidence === undefined || (typeof body.confidence === 'number' && Number.isFinite(body.confidence) && body.confidence >= 0 && body.confidence <= 1);
      if (typeof body.text !== 'string' || !detectedLanguage || !alternatives || !reviewReasons || !confidenceValid) {
        return this.onError?.('failed', 'STT natijasi notoʻgʻri formatda');
      }
      this.onFinal?.({
        text: body.text,
        detectedLanguage,
        ...(typeof body.confidence === 'number' ? { confidence: body.confidence } : {}),
        alternatives,
        reviewReasons,
      });
    } catch (e) {
      if (!this.cancelled && (e as Error).name !== 'AbortError') this.onError?.('network');
    }
  }

  stop() {
    if (this.rec && this.rec.state !== 'inactive') this.rec.stop();
  }

  abort() {
    this.cancelled = true;
    clearTimeout(this.limitTimer);
    this.ac?.abort();
    if (this.rec && this.rec.state !== 'inactive') this.rec.stop();
    this.rec = null;
  }
}

/**
 * Gibrid aniqlash: brauzer STT (tez) + parallel yozib olish (zaxira).
 * Brauzer bo'sh natija qaytarsa yoki xato bersa, lekin o'quvchi gapirgan bo'lsa (spokeHint),
 * o'sha yozuv AI'ga yuboriladi va keyingi replikalar to'g'ridan-to'g'ri AI bilan aniqlanadi.
 * Natijada hech bir replika yo'qolmaydi, ishlaydigan brauzerda esa kechikish qo'shilmaydi.
 */
export class HybridStt implements Stt {
  private web = new WebSpeechStt();
  private cloud: CloudStt;
  private broken = false;
  private settled = false;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (e: SttError, message?: string) => void;
  /** Tashqaridan: shu replika davomida nutq eshitildimi (mikrofon darajasi bo'yicha). */
  spokeHint: () => boolean = () => false;
  onDegrade?: () => void;

  constructor(stream: () => MediaStream | null) {
    this.cloud = new CloudStt(stream);
    this.web.onPartial = (t) => this.onPartial?.(t);
    this.web.onFinal = (t) => {
      if (this.settled) return;
      if (t.trim() || !this.spokeHint()) {
        this.settled = true;
        this.cloud.abort();
        this.onFinal?.(t);
      } else this.fallback();
    };
    this.web.onError = (e, m) => {
      if (this.settled) return;
      if (e === 'too-long') return this.onError?.(e, m);
      this.fallback();
    };
    this.cloud.onPartial = () => undefined;
    this.cloud.onFinal = (t) => {
      if (this.settled) return;
      this.settled = true;
      this.onFinal?.(t.text);
    };
    this.cloud.onError = (e, m) => {
      if (this.settled) return;
      this.settled = true;
      this.onError?.(e, m);
    };
  }

  get kind(): 'browser' | 'cloud' {
    return this.broken ? 'cloud' : 'browser';
  }

  private fallback() {
    if (!this.broken) {
      this.broken = true;
      this.onDegrade?.();
    }
    this.onPartial?.('');
    this.cloud.stop(); // yozuv AI'ga yuboriladi
  }

  start(lang: string) {
    this.settled = false;
    this.cloud.start(lang);
    if (!this.broken) this.web.start(lang);
  }

  stop() {
    if (this.broken) this.cloud.stop();
    else this.web.stop();
  }

  abort() {
    this.settled = true;
    this.web.abort();
    this.cloud.abort();
  }
}
