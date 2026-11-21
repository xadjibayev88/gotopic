// Ovozli suhbat sozlamalari, dam olish (cooldown) va suhbatlar tarixi — qurilmada saqlanadi.
import type { CharacterId, ExplainLang, RoleId } from '../../data/characters';
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

export const loadPrefs = (): VoicePrefs => ({ ...DEFAULT_PREFS, ...read<Partial<VoicePrefs>>(PREFS_KEY, {}) });
export const savePrefs = (p: VoicePrefs) => write(PREFS_KEY, p);

export const loadHistory = (): SessionRecord[] => read<SessionRecord[]>(HISTORY_KEY, []);
export function saveSession(rec: SessionRecord) {
  const list = loadHistory().filter((r) => r.id !== rec.id);
  list.unshift(rec);
  write(HISTORY_KEY, list.slice(0, 30));
}

/** Krua dam olish vaqti (sessiya limiti tugagach). */
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
