// src/i18n/source.json dagi o'zbekcha interfeys matnlarini Gemini API bilan tarjima qiladi →
// src/i18n/locales/<til>.json ({ "o'zbekcha matn": "tarjima" }). Mavjud tarjimalar qayta so'ralmaydi.
// Ishlatish: GEMINI_API_KEY=... node scripts/i18n-translate.mjs [til ...]
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const env = Object.fromEntries(
  existsSync(join(ROOT, '.env'))
    ? readFileSync(join(ROOT, '.env'), 'utf8').split('\n').filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
    : [],
);
const KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
if (!KEY) throw new Error('GEMINI_API_KEY topilmadi');
// Navbat bilan: biri band (503) bo'lsa — keyingisi.
const MODELS = (process.env.I18N_MODEL || 'gemini-3.5-flash-lite,gemini-3.6-flash').split(',');

export const LANGS = {
  ru: 'Russian', en: 'English', kk: 'Kazakh (Cyrillic)', ky: 'Kyrgyz (Cyrillic)', tg: 'Tajik (Cyrillic)', tr: 'Turkish',
  zh: 'Simplified Chinese', hi: 'Hindi', ko: 'Korean', ja: 'Japanese', id: 'Indonesian',
};

const source = JSON.parse(readFileSync(join(ROOT, 'src/i18n/source.json'), 'utf8'));
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LANGS);
mkdirSync(join(ROOT, 'src/i18n/locales'), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(lang, items, depth = 0) {
  const prompt = [
    `You translate the user interface of "Voilà!", a mobile app where Uzbek speakers learn French with an AI cat tutor named Vivi.`,
    `Translate each Uzbek UI string into ${LANGS[lang]}. Rules:`,
    `- Natural, short, friendly app UI wording (like Duolingo) in ${LANGS[lang]}.`,
    `- Keep placeholders like {0}, {1} exactly, and keep emojis, numbers, punctuation and leading/trailing spaces or symbols.`,
    `- Keep French words and phrases, people's names, "Vivi", "Voilà!", "Super", "XP", "PIN", "AI", "Telegram", "Google", "Payme", "Click", "Visa" unchanged.`,
    `- Strings that start/end mid-sentence are fragments: translate them as fragments.`,
    `- "Vivi" is a cat (female mascot). "kofe" = coffee cups that work as lives/hearts. "tanga" = coins. "seriya" = daily streak. "liga/turnir" = weekly league. "bekat" = lesson stop on the map. "dars" = lesson.`,
    `- Never leave Uzbek words (tanga, liga, seriya, kofe, bekat, dars, liniya…) untranslated — always use the ${LANGS[lang]} word.`,
    `Return JSON: {"t": [translations in the same order, same count]}.`,
    '',
    JSON.stringify(items),
  ].join('\n');
  let badFormat = 0;
  for (let attempt = 0; attempt < 10; attempt++) {
    const MODEL = MODELS[attempt % MODELS.length];
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } }),
      signal: AbortSignal.timeout(120_000),
    }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
    if (r.ok) {
      const j = await r.json();
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
      try {
        const t = JSON.parse(text).t;
        if (Array.isArray(t) && t.length === items.length) return t.map(String);
      } catch { /* qayta so'raymiz */ }
      console.warn(`  ${lang}: javob noto'g'ri formatda, qayta…`);
      // Ikki marta soni mos kelmasa — bo'lakni ikkiga bo'lamiz.
      if (++badFormat >= 2 && items.length > 6 && depth < 4) {
        const half = Math.ceil(items.length / 2);
        return [...(await translate(lang, items.slice(0, half), depth + 1)), ...(await translate(lang, items.slice(half), depth + 1))];
      }
    } else {
      const full = await r.text();
      const body = full.slice(0, 160);
      console.warn(`  ${lang}: HTTP ${r.status} ${body}`);
      // Kunlik kvota tugasa — to'xtaymiz (ilovaning o'zi ishlatadigan kalit; uni quritmaslik kerak).
      if (r.status === 429 && /PerDay/i.test(full)) throw new Error(`${MODEL}: kunlik kvota tugadi — to'xtatildi`);
      await sleep(r.status === 429 ? 20_000 * (attempt + 1) : 2500 * (attempt + 1));
      continue;
    }
    await sleep(3000);
  }
  throw new Error(`${lang}: tarjima bo'lmadi`);
}

for (const lang of want) {
  if (!LANGS[lang]) { console.warn('noma\'lum til', lang); continue; }
  const file = join(ROOT, `src/i18n/locales/${lang}.json`);
  const dict = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const todo = source.filter((s) => !(s in dict));
  console.log(`${lang}: ${todo.length} ta tarjima qilinadi`);
  for (let i = 0; i < todo.length; i += 60) {
    const chunk = todo.slice(i, i + 60);
    const t = await translate(lang, chunk);
    // {0} belgilari mos kelmagan tarjima saqlanmaydi (keyingi ishga tushirishda qayta so'raladi).
    const ph = (x) => (x.match(/\{\d+\}/g) ?? []).sort().join();
    chunk.forEach((s, k) => { if (ph(s) === ph(t[k])) dict[s] = t[k]; else console.warn(`  ${lang}: belgilar mos emas — ${s.slice(0, 40)}`); });
    // har bo'lakdan keyin saqlaymiz — uzilsa davom ettirish mumkin
    const sorted = Object.fromEntries(source.filter((s) => s in dict).map((s) => [s, dict[s]]));
    writeFileSync(file, JSON.stringify(sorted, null, 1) + '\n');
    process.stdout.write(`  ${lang}: ${Math.min(i + 60, todo.length)}/${todo.length}\n`);
    await sleep(4000);
  }
}
console.log('tayyor');
