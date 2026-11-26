// Interfeys matnlarini (o'zbekcha) koddan yig'adi → src/i18n/source.json
// Ishlatish: node scripts/i18n-extract.mjs
// Yig'iladi: JSX matnlari, title/aria-label/placeholder/alt atributlari, foydalanuvchiga ko'rinadigan satr
// literallari va shablon satrlar (o'zgaruvchilar {0}, {1}… bilan). Kurs mazmuni (src/data) olinmaydi.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const ROOT = new URL('..', import.meta.url).pathname;
const DIRS = ['src/App.tsx', 'src/screens', 'src/components', 'src/state', 'src/engine/game.ts', 'src/engine/ads.ts', 'src/engine/applock.ts'];
const files = [];
const walk = (p) => {
  const abs = join(ROOT, p);
  if (statSync(abs).isDirectory()) for (const f of readdirSync(abs)) walk(join(p, f));
  else if (/\.(tsx?|mts)$/.test(p) && !/\.test\.|\.d\.ts$/.test(p)) files.push(p);
};
DIRS.forEach(walk);

const ATTRS = new Set(['title', 'aria-label', 'placeholder', 'alt', 'label', 'summary', 'subtitle', 'successTitle', 'successNote', 'doneLabel', 'busyLabel', 'note', 'text', 'message']);
// Foydalanuvchiga ko'rinmaydigan identifikatorlar (CSS klass, kalit, URL, kod).
const looksCode = (s) => /^[a-z0-9_.:/#?=&%-]+$/.test(s) || /^(https?:|data:|\.\/|\/)/.test(s) || /[{}<>;]|=>|\bvar\(|px\b|rgba?\(/.test(s) || /^[A-Z_0-9]+$/.test(s);
const hasWords = (s) => /\p{L}{2,}/u.test(s);
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Turnir botlari ismlari — tarjima qilinmaydi (Zoé, Hugo…).
const gameSrc = readFileSync(join(ROOT, 'src/engine/game.ts'), 'utf8');
const NAMES = new Set([...(/const BOT_NAMES = \[([\s\S]*?)\];/.exec(gameSrc)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]));
const WORDS = new Set(['tanga', 'liga', 'XP']);
const out = new Map(); // matn → birinchi joy
const add = (s, where) => {
  // {n}, {name} kabi nomli belgilar ham shablon: {0}, {1}… ga aylantiriladi (game.ts dagi vazifalar).
  let k = 0;
  const v = norm(s).replace(/\{[a-z]+\}/g, () => `{${k++}}`);
  if (!v || v.length > 400 || NAMES.has(v)) return;
  // Shablonlarda {0} belgilari bor — «kod»mi yo'qmi, faqat qolgan statik matnga qarab hal qilamiz.
  const statics = v.replace(/\{\d+\}/g, ' ').trim();
  if (/\{\d+\}/.test(v)) {
    if (!/\p{L}{3,}/u.test(statics) || /[<>;=]|https?:|\/\/|\bpx\b|rgba?\(|var\(/.test(statics) || /^\.?\//.test(v) || /^[\s\p{P}\d]*[a-z]+[\s\p{P}\d]*$/u.test(statics) && !/[a-z]{4,}/.test(statics)) return;
  } else if (!WORDS.has(v) && (!hasWords(v) || looksCode(v))) return;
  if (!out.has(v)) out.set(v, where);
};

for (const f of files) {
  const src = readFileSync(join(ROOT, f), 'utf8');
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const where = (n) => `${relative(ROOT, join(ROOT, f))}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
  const visit = (n) => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return;
    if (ts.isJsxText(n)) add(n.text, where(n));
    else if (ts.isJsxAttribute(n)) {
      const name = n.name.getText();
      if (name === 'className' || name === 'key' || name === 'id' || name === 'type' || name === 'role' || name === 'href' || name.startsWith('data-')) return;
      if (n.initializer && ts.isStringLiteral(n.initializer) && ATTRS.has(name)) add(n.initializer.text, where(n));
    } else if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const p = n.parent;
      // kalit, switch-case, taqqoslash, CSS klasslari va h.k. emas — faqat «gap»ga o'xshaganlari
      const isProp = p && ts.isPropertyAssignment(p) && p.name === n;
      const inClass = p && ts.isJsxAttribute(p);
      const isCmp = p && ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind);
      const isCase = p && ts.isCaseClause(p);
      const isIndex = p && ts.isElementAccessExpression(p);
      const t = n.text;
      if (!isProp && !inClass && !isCmp && !isCase && !isIndex && (/[ ''‘ʻ]/.test(t) || /^[A-ZА-ЯЎҚҒҲ]/.test(t) || /[‘’ʻ]/.test(t))) add(t, where(n));
    } else if (ts.isTemplateExpression(n)) {
      let pat = n.head.text;
      n.templateSpans.forEach((sp, i) => { pat += `{${i}}` + sp.literal.text; });
      add(pat, where(n));
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

// Kurs xaritasidagi sarlavhalar: bo'lim nomi, tavsifi, dars nomlari, qo'llanma sarlavhalari
// (darsning o'zidagi so'z/gap tarjimalari emas — ular hozircha o'zbekcha).
const { COURSE } = await import(join(ROOT, 'src/data/course.ts'));
for (const u of COURSE) {
  add(u.title, 'course');
  add(u.description, 'course');
  for (const l of u.lessons) add(l.title, 'course');
  for (const g of u.guide ?? []) add(g.title, 'course');
}

mkdirSync(join(ROOT, 'src/i18n'), { recursive: true });
const list = [...out.keys()].sort((a, b) => a.localeCompare(b));
writeFileSync(join(ROOT, 'src/i18n/source.json'), JSON.stringify(list, null, 1) + '\n');
console.log(`${list.length} ta matn → src/i18n/source.json (${files.length} fayl)`);
