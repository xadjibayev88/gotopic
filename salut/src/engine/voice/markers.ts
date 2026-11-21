// Krua javobidagi maxsus belgilar:
//   [[shape:star]] — maskot shakli (keyingi replikagacha saqlanadi)
//   [[do:hop]]     — bir martalik imo-ishora
//   [laughs]       — ovoz tegi (faqat ElevenLabs v3 uchun; boshqa holatda olib tashlanadi)
//   [fr]...[/fr]   — fransuzcha qism

export const SHAPES = ['pill', 'circle', 'tall', 'puddle', 'star', 'heart', 'drop', 'bubble', 'cloud', 'book', 'pencil', 'headphones', 'bulb', 'card', 'slab'] as const;
export const ACTIONS = ['hop', 'wave', 'point', 'squish', 'stretch', 'roam', 'giggle', 'flare'] as const;
export type Shape = (typeof SHAPES)[number];
export type Action = (typeof ACTIONS)[number];

const AUDIO_TAGS = /\[(laughs|laughing|chuckles|giggles|sighs|whispers|excited|curious|happy|sad|surprised)\]/gi;

export interface Cue {
  shape?: Shape;
  actions: Action[];
}

/** Matndan belgilarni ajratadi: ko'rsatish uchun toza matn va maskot buyruqlari. */
export function extractCues(text: string): { clean: string; cue: Cue } {
  const cue: Cue = { actions: [] };
  const clean = text
    .replace(/\[\[(shape|do):([a-z]+)\]\]/gi, (_m, kind: string, name: string) => {
      const n = name.toLowerCase();
      if (kind.toLowerCase() === 'shape' && (SHAPES as readonly string[]).includes(n)) cue.shape = n as Shape;
      if (kind.toLowerCase() === 'do' && (ACTIONS as readonly string[]).includes(n)) cue.actions.push(n as Action);
      return '';
    })
    .replace(/\[\[[^\]]*$/, '') // oqim paytidagi chala belgi
    .replace(/[ \t]{2,}/g, ' ');
  return { clean, cue };
}

/** Subtitr / chat uchun: ovoz teglari va belgilarsiz matn. */
export function displayText(text: string): string {
  return extractCues(text).clean.replace(AUDIO_TAGS, '').replace(/[ \t]{2,}/g, ' ').trim();
}

/** TTS ga yuboriladigan matn. audioTags=false bo'lsa teglar olib tashlanadi. */
export function speechText(text: string, audioTags: boolean): string {
  let t = extractCues(text).clean.replace(/\[\/?fr\]/gi, '').replace(/\*\*/g, '');
  if (!audioTags) t = t.replace(AUDIO_TAGS, '');
  return t.replace(/\s+/g, ' ').trim();
}

/**
 * Oqimdagi matnni gaplarga bo'lib beradi — birinchi gap tayyor bo'lishi bilan ovoz boshlanadi
 * (javobni to'liq kutmasdan, kechikishsiz).
 */
export class SentenceSplitter {
  private buf = '';
  push(delta: string): string[] {
    this.buf += delta;
    const out: string[] = [];
    for (;;) {
      // [fr]...[/fr] ichida bo'lishmaymiz.
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
      if (s) out.push(s);
    }
    return out;
  }
  flush(): string[] {
    const s = this.buf.trim();
    this.buf = '';
    return s ? [s] : [];
  }
}

/** Matnni til bo'laklariga ajratadi: fransuzcha ([fr]) va asosiy til. */
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
