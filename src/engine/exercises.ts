// Mashq generatori: darsdagi so'z va gaplardan turli xil mashqlar yasaydi.
import type { Lesson, Sentence, Unit, Word } from '../data/course';
import { sample, shuffle } from './random';
import { normalize, tokenize } from './text';

export type Direction = 'fr2uz' | 'uz2fr';

interface Base {
  id: string;
  /** SRS uchun bog'langan so'zlar (fr kalitlari). */
  wordRefs: string[];
  /** Xatolar ro'yxati uchun manba kaliti. */
  ref: string;
  /** Xato qilingan mashqning qayta berilishi. */
  retry?: boolean;
}

export type Exercise =
  | (Base & { kind: 'pick'; word: Word; options: Word[] })
  | (Base & { kind: 'match'; pairs: Word[] })
  | (Base & { kind: 'build'; dir: Direction; prompt: string; tokens: string[]; accepted: string[]; sentence: Sentence })
  | (Base & { kind: 'listen'; tokens: string[]; accepted: string[]; sentence: Sentence })
  | (Base & { kind: 'choose'; prompt: string; options: string[]; answer: string; sentence: Sentence })
  | (Base & {
      kind: 'type';
      dir: Direction;
      prompt: string;
      accepted: string[];
      sentence: Sentence;
      /** translate — tarjima; cloze — bo'sh joyni to'ldirish; dictation — eshitib yozish (diktant). */
      mode?: 'translate' | 'cloze' | 'dictation';
      /** cloze: «____» bilan ko'rsatiladigan fransuzcha gap. */
      display?: string;
    });

export type ExerciseKind = Exercise['kind'];

export interface GenOptions {
  rand?: () => number;
  /** Brauzer fransuzcha ovoz chiqara oladimi. */
  tts?: boolean;
  /** Dars necha marta o'tilgan (qiyinlik oshadi). */
  level?: number;
}

let seq = 0;
const nextId = () => `ex${++seq}`;

/** Gapdagi qaysi lug'at so'zlari ishtirok etayotganini aniqlaydi. */
export function wordsInSentence(sentence: Sentence, vocab: Word[]): string[] {
  const s = ` ${normalize(sentence.fr)} `;
  return vocab
    .filter((w) =>
      w.fr
        .split('/')
        .map((p) => normalize(p.replace(/^(le|la|l'|un|une)\s*/i, '')))
        .some((core) => core.length > 1 && s.includes(` ${core}`)),
    )
    .map((w) => w.fr);
}

function distractorTokens(answerTokens: string[], pool: string[], n: number, rand: () => number): string[] {
  const used = new Set(answerTokens.map((t) => normalize(t)));
  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const t of pool) {
    const k = normalize(t);
    if (!k || used.has(k) || seen.has(k)) continue;
    seen.add(k);
    uniq.push(t);
  }
  return sample(uniq, n, rand);
}

export function makePick(word: Word, pool: Word[], rand: () => number): Exercise {
  const others = sample(
    pool.filter((w) => w.fr !== word.fr && w.uz !== word.uz),
    3,
    rand,
  );
  return { id: nextId(), kind: 'pick', word, options: shuffle([word, ...others], rand), wordRefs: [word.fr], ref: `w:${word.fr}` };
}

export function makeMatch(words: Word[], rand: () => number): Exercise {
  const uniq: Word[] = [];
  for (const w of shuffle(words, rand)) {
    if (uniq.some((u) => u.uz === w.uz || u.fr === w.fr)) continue;
    uniq.push(w);
    if (uniq.length === 5) break;
  }
  return { id: nextId(), kind: 'match', pairs: uniq, wordRefs: uniq.map((w) => w.fr), ref: `m:${uniq.map((w) => w.fr).join('|')}` };
}

export function makeSentenceExercise(
  kind: 'build-fr2uz' | 'build-uz2fr' | 'listen' | 'choose' | 'type-fr2uz' | 'type-uz2fr' | 'cloze' | 'dictation',
  sentence: Sentence,
  pool: Sentence[],
  vocab: Word[],
  rand: () => number,
): Exercise {
  const base = { id: nextId(), wordRefs: wordsInSentence(sentence, vocab), ref: `s:${sentence.fr}`, sentence };
  const accUz = [sentence.uz, ...(sentence.uzAlt ?? [])];
  const accFr = [sentence.fr, ...(sentence.frAlt ?? [])];
  switch (kind) {
    case 'build-fr2uz': {
      const ans = tokenize(sentence.uz);
      const extra = distractorTokens(ans, pool.flatMap((s) => tokenize(s.uz)), Math.min(4, Math.max(2, 7 - ans.length)), rand);
      return { ...base, kind: 'build', dir: 'fr2uz', prompt: sentence.fr, tokens: shuffle([...ans, ...extra], rand), accepted: accUz };
    }
    case 'build-uz2fr': {
      const ans = tokenize(sentence.fr);
      const extra = distractorTokens(ans, pool.flatMap((s) => tokenize(s.fr)), Math.min(4, Math.max(2, 7 - ans.length)), rand);
      return { ...base, kind: 'build', dir: 'uz2fr', prompt: sentence.uz, tokens: shuffle([...ans, ...extra], rand), accepted: accFr };
    }
    case 'listen': {
      const ans = tokenize(sentence.fr);
      const extra = distractorTokens(ans, pool.flatMap((s) => tokenize(s.fr)), 3, rand);
      return { ...base, kind: 'listen', tokens: shuffle([...ans, ...extra], rand), accepted: accFr };
    }
    case 'choose': {
      const wrong = sample(
        pool.filter((s) => normalize(s.uz) !== normalize(sentence.uz)).map((s) => s.uz),
        2,
        rand,
      );
      return { ...base, kind: 'choose', prompt: sentence.fr, options: shuffle([sentence.uz, ...wrong], rand), answer: sentence.uz };
    }
    case 'type-fr2uz':
      return { ...base, kind: 'type', dir: 'fr2uz', prompt: sentence.fr, accepted: accUz };
    case 'type-uz2fr':
      return { ...base, kind: 'type', dir: 'uz2fr', prompt: sentence.uz, accepted: accFr };
    case 'dictation':
      return { ...base, kind: 'type', dir: 'uz2fr', mode: 'dictation', prompt: sentence.uz, accepted: accFr };
    case 'cloze': {
      const c = clozeOf(sentence.fr, rand);
      if (!c) return { ...base, kind: 'type', dir: 'uz2fr', prompt: sentence.uz, accepted: accFr };
      return { ...base, kind: 'type', dir: 'uz2fr', mode: 'cloze', prompt: sentence.uz, display: c.display, accepted: [c.answer] };
    }
  }
}

/**
 * Bo'sh joyli gap: fe'l shakli yoki asosiy so'z yashiriladi (o'quvchi o'zi yozadi).
 * Ism va juda qisqa so'zlar yashirilmaydi.
 */
export function clozeOf(fr: string, rand: () => number): { display: string; answer: string } | null {
  const re = /[A-Za-zÀ-ÖØ-öø-ÿœŒæÆ]+(?:-[A-Za-zÀ-ÖØ-öø-ÿœŒ]+)*/g;
  const toks: { w: string; i: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(fr))) toks.push({ w: m[0], i: m.index });
  const cands = toks.filter((t, k) => t.w.length >= 4 && !(k > 0 && /^[A-ZÀ-Ý]/.test(t.w)));
  if (!cands.length) return null;
  // Fe'l shakllari (tuslangan yoki participe) ustun.
  const verbish = cands.filter((t) => /(ais|ait|aient|ions|iez|ons|ez|ent|é|ée|és|ées|ai|as|ira|era|rai|ront|sse|it|is)$/i.test(t.w));
  const pool = verbish.length ? verbish : cands;
  const pick = pool[Math.floor(rand() * pool.length)];
  return { display: fr.slice(0, pick.i) + '_____' + fr.slice(pick.i + pick.w.length), answer: pick.w };
}

type SKind = Parameters<typeof makeSentenceExercise>[0];

const RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

/** Mashq turlari: dars necha marta o'tilgani (level) va CEFR darajasiga qarab qiyinlashadi. */
function sentenceKinds(level: number, tts: boolean, cefr = 'A1'): SKind[] {
  const r = RANK[cefr] ?? 0;
  const kinds: SKind[] = r >= 3 ? ['build-uz2fr', 'choose', 'type-fr2uz'] : ['build-fr2uz', 'build-uz2fr', 'choose', 'build-fr2uz', 'type-fr2uz'];
  if (tts) kinds.splice(2, 0, 'listen');
  if (level >= 1) kinds.push('type-uz2fr', 'build-uz2fr');
  if (level >= 2) kinds.push('type-uz2fr');
  if (r >= 1) kinds.push('cloze');
  if (r >= 2) kinds.push('cloze', 'type-uz2fr');
  if (r >= 2 && tts) kinds.push('dictation');
  if (r >= 3) kinds.push('cloze', 'type-uz2fr', ...(tts ? (['dictation'] as SKind[]) : []));
  if (r >= 4) kinds.push('type-uz2fr', 'cloze');
  return kinds;
}

/** Bitta dars sessiyasi (~12-14 mashq). */
export function buildLesson(lesson: Lesson, unit: Unit, opts: GenOptions = {}): Exercise[] {
  const rand = opts.rand ?? Math.random;
  const tts = opts.tts ?? false;
  const level = opts.level ?? 0;
  const unitWords = unit.lessons.flatMap((l) => l.words);
  const unitSentences = unit.lessons.flatMap((l) => l.sentences);
  const pickPool = lesson.words.length >= 4 ? lesson.words : unitWords;

  const words = shuffle(lesson.words, rand);
  const picks = words.slice(0, level === 0 ? 5 : 3).map((w) => makePick(w, pickPool, rand));
  const match = makeMatch(lesson.words, rand);

  const kinds = shuffle(sentenceKinds(level, tts, unit.level), rand);
  const sentences = shuffle(lesson.sentences, rand);
  const sentEx: Exercise[] = [];
  const target = (level === 0 ? 7 : 9) + Math.min(3, RANK[unit.level ?? 'A1'] ?? 0);
  for (let i = 0; i < target; i++) {
    const s = sentences[i % sentences.length];
    let k = kinds[i % kinds.length];
    // Yozish mashqini dars oxiriga yaqin qoldiramiz.
    if (i < 2 && k.startsWith('type')) k = 'build-fr2uz';
    sentEx.push(makeSentenceExercise(k, s, unitSentences, unitWords, rand));
  }

  // Tartib: avval so'zlar bilan tanishuv, keyin gaplar orasiga aralashtiriladi.
  const out: Exercise[] = [];
  out.push(picks[0], picks[1] ?? sentEx.shift()!);
  out.push(sentEx.shift()!);
  if (picks[2]) out.push(picks[2]);
  out.push(match);
  for (let i = 3; i < picks.length; i++) {
    out.push(sentEx.shift()!);
    out.push(picks[i]);
  }
  out.push(...sentEx);
  return out.filter(Boolean);
}

/** Takrorlash (amaliyot) sessiyasi: zaif so'zlar va gaplar asosida. */
export function buildPractice(
  words: Word[],
  sentences: Sentence[],
  vocabPool: Word[],
  sentencePool: Sentence[],
  opts: GenOptions = {},
): Exercise[] {
  const rand = opts.rand ?? Math.random;
  const tts = opts.tts ?? false;
  const out: Exercise[] = [];
  const ws = words.slice(0, 4);
  ws.forEach((w) => out.push(makePick(w, vocabPool, rand)));
  if (words.length >= 4) out.push(makeMatch(words.length >= 5 ? words : [...words, ...sample(vocabPool, 5 - words.length, rand)], rand));
  const kinds: SKind[] = shuffle(['build-fr2uz', 'build-uz2fr', 'choose', 'type-fr2uz', 'type-uz2fr', ...(tts ? (['listen'] as SKind[]) : [])], rand);
  sentences.slice(0, 7).forEach((s, i) => out.push(makeSentenceExercise(kinds[i % kinds.length], s, sentencePool, vocabPool, rand)));
  // Aralashtiramiz, lekin birinchi mashq oson bo'lsin.
  const [first, ...rest] = out;
  return first ? [first, ...shuffle(rest, rand)] : [];
}
