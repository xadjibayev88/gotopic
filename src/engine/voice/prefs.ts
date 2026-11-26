// Ovozli suhbat sozlamalari, dam olish (cooldown) va suhbatlar tarixi — qurilmada saqlanadi.
import { EXPLAIN_LANGS, type CharacterId, type ExplainLang, type RoleId } from '../../data/characters';

const EXPLAIN_IDS = new Set<string>(EXPLAIN_LANGS.map((l) => l.id));
import type { TalkStats } from './markers';

export type InputMode = 'ptt' | 'handsfree';
export type SttEngine = 'auto' | 'browser' | 'cloud';

export interface VoicePrefs {
  character: CharacterId;
  role: RoleId;
  customRole: string;
  lang: ExplainLang;
  voiceId: string;
  inputMode: InputMode;
  stt: SttEngine;
  micLang: 'auto' | 'uz-UZ' | 'fr-FR' | 'ru-RU' | 'en-US';
  subtitles: boolean;
  fullscreen: boolean;
  rate: number;
  introSeen: boolean;
  strictConsent: boolean;
  /** «Menga 18 yosh to'lgan» tasdig'i (Bezori Vivi 18+ uchun). */
  adultConfirmed: boolean;
  /** «Senzurasiz rejim (18+)» — har qanday xarakter keskinroq, filtrlanmagan bo'ladi. */
  explicit: boolean;
  /** «Qasos rejimi» mini-o'yini suhbat paytida. */
  game: boolean;
  /** Jonli rejim (Gemini Live). */
  live: boolean;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  growth: { text: string; example: string; better: string }[];
  words: { fr: string; uz: string }[];
}

export interface SessionRecord {
  id: string;
  at: number;
  character: CharacterId;
  role: RoleId;
  durationMs: number;
  speakingMs: number;
  stats: TalkStats;
  turns: { role: 'user' | 'tutor'; text: string }[];
  feedback?: Feedback | null;
}

const PREFS_KEY = 'salut.voice.prefs.v1';
const HISTORY_KEY = 'salut.voice.history.v1';
const REST_KEY = 'salut.voice.rest.v1';

export const DEFAULT_PREFS: VoicePrefs = {
  character: 'classic',
  role: 'free',
  customRole: '',
  lang: 'uz',
  voiceId: '',
  inputMode: 'ptt',
  stt: 'auto',
  micLang: 'auto',
  subtitles: true,
  fullscreen: false,
  rate: 1,
  introSeen: false,
  strictConsent: false,
  adultConfirmed: false,
  explicit: false,
  game: false,
  // Gemini Live qayta yoqildi — sukut bo'yicha jonli rejim (server ruxsat bergan bo'lsa).
  live: true,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* xotira to'la yoki bloklangan */
  }
}

const LIVE_ON_MIGRATION = 'salut.voice.liveOn.v2';

/** Live o'chirilgan paytda saqlangan «live: false» bir marta yangi sukutga (yoqilgan) o'tkaziladi. */
export function loadPrefs(): VoicePrefs {
  const saved = read<Partial<VoicePrefs>>(PREFS_KEY, {});
  let migrated = true;
  try {
    migrated = localStorage.getItem(LIVE_ON_MIGRATION) === '1';
    if (!migrated) localStorage.setItem(LIVE_ON_MIGRATION, '1');
  } catch {
    /* saqlash bloklangan */
  }
  // Tushuntirish tili hali tanlanmagan bo'lsa — ilova tili (12 tildan biri) olinadi.
  let uiLang: string | null = null;
  try {
    uiLang = localStorage.getItem('voila.lang');
  } catch {
    /* e'tiborsiz */
  }
  const lang = saved.lang ?? (uiLang && EXPLAIN_IDS.has(uiLang) ? (uiLang as VoicePrefs['lang']) : DEFAULT_PREFS.lang);
  return { ...DEFAULT_PREFS, ...saved, lang, ...(migrated ? {} : { live: true }) };
}
export const savePrefs = (p: VoicePrefs) => write(PREFS_KEY, p);

export const loadHistory = (): SessionRecord[] => read<SessionRecord[]>(HISTORY_KEY, []);
export function saveSession(rec: SessionRecord) {
  const list = loadHistory().filter((r) => r.id !== rec.id);
  list.unshift(rec);
  write(HISTORY_KEY, list.slice(0, 30));
}

/** Vivi dam olish vaqti (sessiya limiti tugagach). */
export const restUntil = (): number => read<number>(REST_KEY, 0);
export const setRestUntil = (t: number) => write(REST_KEY, t);

/** Rekordlar: oldingi sessiyalar bilan solishtirish. */
export function compareStats(current: { stats: TalkStats; speakingMs: number }, history: SessionRecord[], excludeId?: string) {
  const prev = history.filter((h) => h.id !== excludeId);
  const best = (f: (r: SessionRecord) => number) => Math.max(0, ...prev.map(f));
  const last = prev[0];
  const metric = (cur: number, f: (r: SessionRecord) => number) => ({
    record: prev.length > 0 && cur > best(f),
    up: !!last && cur > f(last),
  });
  return {
    words: metric(current.stats.words, (r) => r.stats.words),
    sentences: metric(current.stats.sentences, (r) => r.stats.sentences),
    speaking: metric(current.speakingMs, (r) => r.speakingMs),
    unique: metric(current.stats.unique, (r) => r.stats.unique),
  };
}
