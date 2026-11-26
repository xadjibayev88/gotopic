// Vivi matnidagi maxsus belgilar: xavfsiz imo-ishoralar faqat shared whitelist orqali; shakl va tovush buyruqlari ijro etilmaydi.
import { VIVI_CUE_ACTIONS, type ViviCueAction } from '../../shared/vivi-cue';

export const ACTIONS = VIVI_CUE_ACTIONS;
export type Action = ViviCueAction;

const AUDIO_TAGS = /\[(laughs|laughing|chuckles|giggles|sighs|whispers|excited|curious|happy|sad|surprised|crying|cries|sobs|sobbing|coughs|yawns|gasps|screams|shouts|angry|sarcastic)\]/gi;
/** Faqat matndan olib tashlanadi; bu teglar harakat yoki tovush effektini ishga tushirmaydi. */
const SILENT_TAGS = /\[{1,2}(?:fuck|boundaries|sneeze|spit|punch|slap|drama|kiss|burps?|farts?|angry|flip|sfx|sound(?:[-_\s]?effect)?|fx)(?:\b[^\]\s]*)?\]{0,2}/gi;
/** Legacy cue namespaces are never executable; strip even malformed single-bracket forms. */
const COMMAND_TAGS = /\[(?:shape|action|actions|face|state|mood|emotion|cue|do)\b[^\]]*\]/gi;

function tagCues(text: string, cue: Cue) {
  if (/\[(laughs|laughing|giggles|chuckles)\]/i.test(text)) cue.actions.push('giggle');
}

export interface Cue {
  /** Only actions shared with src/shared/vivi-cue.ts are retained. */
  actions: ViviCueAction[];
  /** [[img:...]] — standalone image display, not a Vivi cue. */
  image?: string;
}

/** Malformed markers are removed rather than repaired into executable commands. */
export function normalizeMarkers(text: string): string {
  return text
    .replace(/\[\/(laughs|laughing|chuckles|giggles|sighs|whispers|excited|curious|happy|sad|surprised|crying|sarcastic|angry|shouts|screams)\]/gi, '')
    .replace(/\[\[(\/?fr)\]\]?/gi, '[$1]')
    .replace(/\[(\/fr)\]\]/gi, '[$1]')
    .replace(/(^|[^[])\[\s*(shape|do|img|ans)\s*:\s*([^\]\[]{1,80})\](?!\])/gi, '$1[[$2:$3]]');
}

/** Parse only whitelisted gesture markers and images; never create shape/SFX cues. */
export function extractCues(text: string): { clean: string; cue: Cue } {
  const cue: Cue = { actions: [] };
  const clean = normalizeMarkers(text)
    .replace(SILENT_TAGS, '')
    .replace(/\[\[\s*img\s*:\s*([^\]]{2,80})\]\]/gi, (_m, q: string) => {
      cue.image ??= q.trim();
      return '';
    })
    .replace(/\[\[\s*(?:(shape|do)\s*:\s*)?([a-z]+)\s*\]\]/gi, (_m, kind: string | undefined, name: string) => {
      const n = name.toLowerCase();
      const k = kind?.toLowerCase();
      if (k !== 'shape' && (!k || k === 'do') && (VIVI_CUE_ACTIONS as readonly string[]).includes(n)) {
        cue.actions.push(n as ViviCueAction);
      }
      return '';
    })
    .replace(/\[\[[^\]]*\]\]/g, '')
    .replace(/\[\[[^\]]*$/, '')
    .replace(COMMAND_TAGS, '')
    .replace(/[ \t]{2,}/g, ' ');
  tagCues(text, cue);
  return { clean, cue };
}

/** Display text without voice tags or command markers. */
export function displayText(text: string): string {
  return extractCues(text).clean.replace(AUDIO_TAGS, '').replace(/[ \t]{2,}/g, ' ').trim();
}

/** audioTags controls only voice-performance tags; unsafe sound-effect markers are already removed. */
export function speechText(text: string, audioTags: boolean): string {
  let t = extractCues(text)
    .clean.replace(/(\[\/fr\])\s*\([^)]{1,80}\)/gi, '$1')
    .replace(/\[\/?fr\]/gi, '')
    .replace(/\*\*/g, '');
  if (!audioTags) t = t.replace(AUDIO_TAGS, '');
  return t.replace(/\s+/g, ' ').trim();
}

/** Split streaming text into sentences without cutting inside a [fr] segment. */
export class SentenceSplitter {
  private buf = '';
  private emitted = 0;
  push(delta: string): string[] {
    this.buf += delta;
    const out: string[] = [];
    if (this.emitted === 0) {
      const m = /^([\s\S]{40,}[^\d][,;—–])\s+/.exec(this.buf);
      if (m && !/[.!?…]/.test(m[1]) && (m[1].match(/\[fr\]/gi) ?? []).length === (m[1].match(/\[\/fr\]/gi) ?? []).length) {
        out.push(m[1].trim());
        this.buf = this.buf.slice(m[0].length);
        this.emitted++;
      }
    }
    for (;;) {
      const re = /([.!?…]+["»)]?)(\s+)|\n+/g;
      let m: RegExpExecArray | null;
      let cut = -1;
      while ((m = re.exec(this.buf))) {
        const end = m.index + (m[1] ? m[1].length : 0);
        const before = this.buf.slice(0, end);
        const opens = (before.match(/\[fr\]/gi) ?? []).length;
        const closes = (before.match(/\[\/fr\]/gi) ?? []).length;
        if (opens === closes && before.trim().length >= 6) {
          cut = m.index + m[0].length;
          break;
        }
      }
      if (cut < 0) break;
      const s = this.buf.slice(0, cut).trim();
      this.buf = this.buf.slice(cut);
      if (s) {
        out.push(s);
        this.emitted++;
      }
    }
    return out;
  }
  flush(): string[] {
    const s = this.buf.trim();
    this.buf = '';
    return s ? [s] : [];
  }
}

/** Split text into French ([fr]) and base-language segments. */
export function langSegments(text: string): { fr: boolean; text: string }[] {
  const out: { fr: boolean; text: string }[] = [];
  const re = /\[fr\]([\s\S]*?)(?:\[\/fr\]|$)/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ fr: false, text: text.slice(last, m.index) });
    out.push({ fr: true, text: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ fr: false, text: text.slice(last) });
  return out.map((s) => ({ ...s, text: s.text.replace(/\s+/g, ' ').trim() })).filter((s) => /[\p{L}\p{N}]/u.test(s.text));
}

export interface TalkStats {
  words: number;
  sentences: number;
  unique: number;
}

export function talkStats(utterances: string[]): TalkStats {
  const words = utterances.flatMap((u) => u.toLowerCase().match(/[\p{L}'’-]+/gu) ?? []);
  const sentences = utterances.reduce((n, u) => n + Math.max(1, (u.match(/[.!?…]+/g) ?? []).length), 0);
  return { words: words.length, sentences: utterances.length ? sentences : 0, unique: new Set(words).size };
}

/** Infer whether Vivi expects the learner to answer in French or Uzbek. */
export function answerLang(raw: string): 'fr' | 'uz' | null {
  const m = /\[\[\s*ans\s*:\s*(fr|uz|ru|en)\s*\]\]/i.exec(raw);
  const tail = raw.replace(/\[\[[^\]]*\]\]/g, '').trim().slice(-260);
  const lastFr = /\[fr\]([^[]*)\[\/fr\]([^[]*)$/i.exec(tail);
  if (lastFr && /\?\s*$/.test(lastFr[1]) && lastFr[2].length < 90) return 'fr';
  if (m) return m[1].toLowerCase() === 'fr' ? 'fr' : 'uz';
  if (/(fransuzcha|frantsuzcha|fransuz tilida)[^.?!]{0,30}(ayt|yoz|javob|takrorla|qaytar|tuz|gapir)/i.test(tail)) return 'fr';
  if (/\b(takrorlang|qaytaring|takrorla)\b/i.test(tail) && /\[fr\]/i.test(tail)) return 'fr';
  if (/\?\s*\[\/fr\]\s*(\([^)]*\))?\s*$/i.test(tail)) return 'fr';
  return null;
}
