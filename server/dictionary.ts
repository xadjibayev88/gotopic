// 30 000 so'zlik koreyscha–o'zbekcha lug'at (manba: Wiktionary/Kaikki.org, CC BY-SA 4.0 — content/dictionary/DICTIONARY-LICENSE.md).
// Ma'lumot birinchi so'rovda xotiraga yuklanadi; qidiruv sahifalangan (telefon 30 ming qatorni bir yo'la olmaydi).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface DictEntry {
  id: string;
  word: string;
  pos: string;
  /** O'zbekcha izoh (AI tarjima; status bilan). */
  uz: string;
  /** Asl inglizcha ma'no (Wiktionary). */
  en: string;
  status: 'ai_draft' | 'legacy_ai' | 'source_only' | string;
  url: string;
  /** Ishlatilish chastotasi bo'yicha o'rin (0 — eng ko'p); ro'yxatda yo'q so'z — Infinity. */
  rank: number;
}

export interface DictPage {
  items: DictEntry[];
  total: number;
  page: number;
  pages: number;
}

const PAGE = 30;
let cache: DictEntry[] | null = null;

/** JSONL fayllardan lug'atni quradi (sof funksiya — testlanadi). */
export function buildDictionary(sourceJsonl: string, uzJsonl: string, frequency: readonly string[] = []): DictEntry[] {
  const rankOf = new Map(frequency.map((w, i) => [w, i]));
  const uz = new Map<string, { uz: string; status: string }>();
  for (const line of uzJsonl.split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as { id: string; uz?: string; status?: string };
    uz.set(r.id, { uz: r.uz ?? '', status: r.status ?? 'source_only' });
  }
  const out: DictEntry[] = [];
  for (const line of sourceJsonl.split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as { id: string; word: string; pos?: string; sourceGloss?: string; sourceUrl?: string };
    const t = uz.get(r.id);
    out.push({
      id: r.id,
      word: r.word,
      pos: r.pos ?? '',
      uz: t?.status === 'source_only' ? '' : t?.uz ?? '',
      en: (r.sourceGloss ?? '').slice(0, 400),
      status: t?.status ?? 'source_only',
      url: r.sourceUrl ?? '',
      rank: rankOf.get(r.word) ?? Number.POSITIVE_INFINITY,
    });
  }
  // Eng ko'p ishlatiladigan so'zlar oldinda (bo'sh qidiruvda shu tartib ko'rinadi).
  out.sort((a, b) => a.rank - b.rank || a.word.localeCompare(b.word, 'ko'));
  return out;
}

export function loadDictionary(dir = join(process.cwd(), 'content', 'dictionary')): DictEntry[] {
  if (!cache) {
    let freq: string[] = [];
    try {
      freq = JSON.parse(readFileSync(join(dir, 'frequency.json'), 'utf8')) as string[];
    } catch {
      /* chastota ro'yxati ixtiyoriy */
    }
    cache = buildDictionary(readFileSync(join(dir, 'korean-dictionary-source.jsonl'), 'utf8'), readFileSync(join(dir, 'dictionary-uz.jsonl'), 'utf8'), freq);
  }
  return cache;
}

const HANGUL = /[ㄱ-ㆎ가-힣]/;

/**
 * Qidiruv: koreyscha yozilsa — so'z bo'yicha (aniq → boshlanishi → ichida), aks holda o'zbekcha/inglizcha ma'no bo'yicha.
 * Bo'sh so'rov — eng ko'p ishlatiladigan so'zlar birinchi.
 */
export function searchDictionary(all: readonly DictEntry[], q: string, page = 1, pos = ''): DictPage {
  const query = q.trim().toLowerCase().slice(0, 60);
  let list = pos ? all.filter((e) => e.pos === pos) : all;
  if (query) {
    const scored: { e: DictEntry; s: number }[] = [];
    const ko = HANGUL.test(query);
    for (const e of list) {
      let s = -1;
      if (ko) {
        if (e.word === query) s = 0;
        else if (e.word.startsWith(query)) s = 1;
        else if (e.word.includes(query)) s = 2;
      } else {
        const uz = e.uz.toLowerCase();
        const en = e.en.toLowerCase();
        if (uz.split(/[;,]\s*/).includes(query)) s = 0;
        else if (uz.startsWith(query)) s = 1;
        else if (new RegExp(`(^|[\\s;,(])${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(uz)) s = 2;
        else if (uz.includes(query)) s = 3;
        else if (en.split(/[;,]\s*/).includes(query)) s = 4;
        else if (en.includes(query)) s = 5;
      }
      if (s >= 0) scored.push({ e, s });
    }
    scored.sort((a, b) => a.s - b.s || Math.min(a.e.rank, 1e6) - Math.min(b.e.rank, 1e6) || a.e.word.length - b.e.word.length || a.e.word.localeCompare(b.e.word, 'ko'));
    list = scored.map((x) => x.e);
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const p = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return { items: list.slice((p - 1) * PAGE, p * PAGE), total, page: p, pages };
}
