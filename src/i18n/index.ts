// Interfeys tillari. Manba tili — o'zbekcha (kodda yozilgan matnlar). Boshqa tilda DOM'dagi matnlar
// lug'at bo'yicha almashtiriladi: aniq moslik yoki shablon ({0}, {1} — o'zgaruvchi qismlar).
// Lug'atlar (src/i18n/locales/*.json) scripts/i18n-extract.mjs + scripts/i18n-translate.mjs bilan yaratiladi.
// Kurs mazmuni (so'z/gap tarjimalari) hozircha o'zbekcha qoladi.

export type Lang = 'uz' | 'ru' | 'en' | 'kk' | 'ky' | 'tg' | 'tr' | 'zh' | 'hi' | 'ko' | 'ja' | 'id';

export const LANGUAGES: readonly { id: Lang; name: string; flag: string }[] = [
  { id: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { id: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
  { id: 'tg', name: 'Тоҷикӣ', flag: '🇹🇯' },
  { id: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { id: 'zh', name: '中文', flag: '🇨🇳' },
  { id: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { id: 'ko', name: '한국어', flag: '🇰🇷' },
  { id: 'ja', name: '日本語', flag: '🇯🇵' },
  { id: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
];

const KEY = 'voila.lang';
const EVENT = 'voila:lang';
const loaders = import.meta.glob<Record<string, string>>('./locales/*.json', { import: 'default' });

/** Saqlangan til; bo'lmasa — telefon/brauzer tili (qo'llab-quvvatlansa), aks holda o'zbekcha. */
export function readLang(): Lang {
  try {
    const v = localStorage.getItem(KEY) as Lang | null;
    if (v && LANGUAGES.some((l) => l.id === v)) return v;
  } catch {
    /* saqlash bloklangan */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.languages?.[0] || navigator.language : '') || '';
  const code = nav.toLowerCase().split('-')[0];
  return (LANGUAGES.find((l) => l.id === code)?.id ?? 'uz') as Lang;
}

// ---------- Tarjimon ----------

type Pattern = { re: RegExp; out: string; anchor: string };
let current: Lang = 'uz';
let exact = new Map<string, string>();
let patterns: Pattern[] = [];

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Lug'atdan aniq va shablon jadvallarini quradi (sof funksiya — testlanadi). */
export function compile(dict: Record<string, string>): { exact: Map<string, string>; patterns: Pattern[] } {
  const ex = new Map<string, string>();
  const pats: Pattern[] = [];
  for (const [src, out] of Object.entries(dict)) {
    if (!out) continue;
    const k = norm(src);
    if (/\{\d+\}/.test(k)) {
      const parts = k.split(/(\{\d+\})/);
      const statics = parts.filter((p) => !/^\{\d+\}$/.test(p));
      const anchor = statics.reduce((a, b) => (b.trim().length > a.length ? b.trim() : a), '');
      if (anchor.length < 2) continue;
      const order: number[] = [];
      const body = parts.map((p) => {
        const m = /^\{(\d+)\}$/.exec(p);
        if (m) { order.push(Number(m[1])); return '(.+?)'; }
        return esc(p).replace(/ /g, '\\s*');
      }).join('');
      // guruh raqamlari shablondagi {n} tartibiga moslanadi
      const re = new RegExp(`^${body}$`, 's');
      pats.push({ re, out: out.replace(/\{(\d+)\}/g, (_, n) => `\u0000${order.indexOf(Number(n))}\u0000`), anchor });
    } else ex.set(k, out);
  }
  // uzunroq shablonlar birinchi — aniqrog'i ustun
  pats.sort((a, b) => b.anchor.length - a.anchor.length);
  return { exact: ex, patterns: pats };
}

/** Bitta matnni tarjima qiladi (bosh/oxirgi bo'sh joylar saqlanadi). Mos kelmasa — null. */
export function translateText(text: string, tables = { exact, patterns }): string | null {
  const core = norm(text);
  if (!core || !/\p{L}/u.test(core)) return null;
  const lead = /^\s*/.exec(text)![0] ? ' ' : '';
  const trail = /\s*$/.exec(text)![0] ? ' ' : '';
  const hit = tables.exact.get(core);
  if (hit !== undefined) return lead + hit.trim() + trail;
  if (core.length > 500) return null;
  for (const p of tables.patterns) {
    if (!core.includes(p.anchor)) continue;
    const m = p.re.exec(core);
    if (!m) continue;
    const out = p.out.replace(/\u0000(\d+)\u0000/g, (_, i) => {
      const v = m[Number(i) + 1] ?? '';
      return tables.exact.get(norm(v)) ?? v; // ichki qism ham tarjima bo'lishi mumkin (masalan liga nomi)
    });
    return lead + out.trim() + trail;
  }
  return null;
}

// ---------- DOM ----------

const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
const src = new WeakMap<Node, { src: string; out: string }>();
const srcAttr = new WeakMap<Element, Map<string, { src: string; out: string }>>();
let observer: MutationObserver | null = null;
let busy = false;

const SKIP = 'script, style, textarea, code, [data-no-i18n], [translate="no"], [contenteditable="true"]';
// Brauzerning o'z closest() — ota elementlarni JS siklida aylanishdan ancha tez.
const skip = (el: Element | null): boolean => !el || el.closest(SKIP) !== null;

// Bir xil matn ko'p marta uchraydi (qayta chizishlarda) — natija keshlanadi.
let cache = new Map<string, string | null>();
const cachedTranslate = (text: string): string | null => {
  let r = cache.get(text);
  if (r === undefined) {
    r = translateText(text);
    if (cache.size > 5000) cache.clear();
    cache.set(text, r);
  }
  return r;
};

function applyText(node: Text) {
  const val = node.nodeValue ?? '';
  const rec = src.get(node);
  // React matnni yangilagan bo'lsa (bizning chiqishimizdan farqli) — bu yangi manba
  const source = rec && val === rec.out ? rec.src : val;
  if (current === 'uz') {
    if (rec && val === rec.out && val !== rec.src) node.nodeValue = rec.src;
    src.delete(node);
    return;
  }
  if (skip(node.parentElement)) return;
  const t = cachedTranslate(source);
  if (t === null) { src.delete(node); return; }
  src.set(node, { src: source, out: t });
  if (val !== t) node.nodeValue = t;
}

function applyAttrs(el: Element) {
  let map = srcAttr.get(el);
  for (const a of ATTRS) {
    const val = el.getAttribute(a);
    if (val === null) continue;
    const rec = map?.get(a);
    const source = rec && val === rec.out ? rec.src : val;
    if (current === 'uz') {
      if (rec && val === rec.out && val !== rec.src) el.setAttribute(a, rec.src);
      map?.delete(a);
      continue;
    }
    if (skip(el)) continue;
    const t = cachedTranslate(source);
    if (t === null) continue;
    if (!map) srcAttr.set(el, (map = new Map()));
    map.set(a, { src: source, out: t.trim() });
    if (val !== t.trim()) el.setAttribute(a, t.trim());
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) return applyText(root as Text);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (skip(el)) return;
  applyAttrs(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) applyText(n as Text);
    else applyAttrs(n as Element);
  }
}

function startObserver() {
  if (observer || typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver((list) => {
    if (busy) return;
    busy = true;
    try {
      for (const m of list) {
        if (m.type === 'characterData') applyText(m.target as Text);
        else if (m.type === 'attributes') applyAttrs(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
    } finally {
      busy = false;
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

async function loadDict(lang: Lang): Promise<Record<string, string>> {
  if (lang === 'uz') return {};
  const load = loaders[`./locales/${lang}.json`];
  return load ? await load() : {};
}

/** Tilni o'rnatadi: lug'atni yuklab, butun sahifani qayta tarjima qiladi. */
export async function setLang(lang: Lang, save = true): Promise<void> {
  const dict = await loadDict(lang);
  ({ exact, patterns } = compile(dict));
  cache = new Map();
  current = lang;
  if (save) {
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* e'tiborsiz */
    }
  }
  document.documentElement.lang = lang;
  startObserver();
  busy = true;
  try {
    walk(document.body);
    const t = translateText(document.title);
    if (t) document.title = t.trim();
  } finally {
    busy = false;
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: lang }));
}

/** Ilova ishga tushganda: saqlangan til lug'atini yuklaydi (o'zbekcha bo'lsa — darhol). */
export function initI18n(): Promise<void> {
  const lang = readLang();
  return lang === 'uz' ? Promise.resolve() : setLang(lang, false);
}

export const currentLang = () => current;
export const LANG_EVENT = EVENT;
