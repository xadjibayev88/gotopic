#!/usr/bin/env python3
"""Go Topic kursini yaratadi: legacy/public/catalog.json (mavzular, so'zlar, TOPIK darajasi) +
scripts/korean-course-data.py (mualliflik gaplari, qo'llanmalar, emoji) → src/data/course.ts

Ishga tushirish: python3 scripts/build-korean-course.py
"""
import json, os, re, runpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = runpy.run_path(os.path.join(ROOT, 'scripts', 'korean-course-data.py'))
cat = json.load(open(os.path.join(ROOT, 'legacy', 'public', 'catalog.json')))['data']

LEVEL = {1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2'}
COLORS = ['#B49CFF', '#FF8FD0', '#7FE3FF', '#FFB84D', '#FF6B9A', '#9B5CFF', '#4ADE80', '#38BDF8', '#F472B6', '#A78BFA', '#FB923C', '#2DD4BF']
DESC = {
 'Salomlashish': "Salom bering, rahmat va kechirasiz deng", 'Raqamlar': "Xitoycha-koreys sonlari: narx, sana, telefon",
 'Oila': "Oila a'zolari va yaqinlaringiz", 'Ovqat': "Taomlar, ichimliklar va buyurtma berish", 'Vaqt va joy': "Bugun, ertaga va qayerda",
 "Fe'llar": "Eng kerakli kundalik fe'llar", 'Koreys sonlari': "Sof koreys sonlari: sanash, yosh, soat", "Savol so'zlari": "Kim? Nima? Qayerda? Qachon?",
 'Ranglar': "Atrofdagi ranglar", 'Tana': "Tana a'zolari va shifokorda", 'Kiyim': "Kiyimlar va kiyinish fe'llari", 'Uy ichi': "Uy jihozlari va joylashuv",
 'Transport': "Avtobus, metro, taksi — yo'lda", 'Shahar': "Shahardagi joylar", 'Hafta va kun': "Hafta kunlari va kun vaqtlari",
 'Ob-havo va tabiat': "Fasllar, ob-havo va tabiat", 'Hayvonlar': "Uy va yovvoyi hayvonlar", 'Meva va sabzavot': "Bozordagi meva va sabzavotlar",
 'Maktab': "Dars, imtihon va o'quv buyumlari", 'Kasblar': "Kasblar va «men …man»", 'Sifatlar': "Katta-kichik, arzon-qimmat",
 "Fe'llar 2": "Muloqot va kundalik harakatlar", "TOPIK 3 so'zlari": "O'rta daraja: tajriba, reja, natija", "Ish va o'qish": "Ish, o'qish va karyera",
 "His-tuyg'u va hayot": "Kayfiyat va hayotiy vaziyatlar", "TOPIK 4 so'zlari": "Ta'lim, texnologiya, jamiyat", 'Jamiyat va iqtisod': "Aholi, iqtisod va ijtimoiy hayot",
 'Fikr bildirish': "Rozilik, e'tiroz va munozara", "TOPIK 5 so'zlari": "Ilg'or: hodisa, qadriyat, siyosat", 'Ilmiy va rasmiy': "Tadqiqot va rasmiy uslub",
 "Murakkab fe'l va sifatlar": "Rasmiy matnlardagi kuchli fe'llar", 'Akademik nutq · T6': "Eng yuqori daraja: akademik ifodalar", 'Jamiyat tahlili · T6': "Zamonaviy jamiyat muammolari",
}
SKIP = {'TOPIK 6 so\'zlari', 'Ilmiy tahlil · T6', 'Murakkab ifoda · T6'}

def clean_uz(s):
    return s.replace('’', "'").replace('‘', "'").strip()

def alts(uz):
    out = []
    base = re.sub(r'\s*\([^)]*\)', '', uz).strip()
    if base and base != uz: out.append(base)
    for part in re.split(r'[;,]', base):
        p = part.strip()
        if p and p != uz and p not in out: out.append(p)
    return out

def short(uz):
    return re.split(r'[;,(]', uz)[0].strip()

def chunk(words):
    n = len(words)
    k = max(1, round(n / 5))
    size = -(-n // k)
    parts = [words[i:i + size] for i in range(0, n, size)]
    while len(parts) > 1 and len(parts[-1]) < 4:
        parts[-2] += parts.pop()
    return parts

units = []

def add_unit(title, level, words, sentences, guide, desc):
    uid = f"u{len(units) + 1}"
    lessons = []
    parts = chunk(words)
    for i, ws in enumerate(parts):
        n = len(sentences)
        start = (i * 3) % n
        sents = [sentences[(start + j) % n] for j in range(min(5, n))]
        title_l = ', '.join(short(w['uz']) for w in ws[:2]).capitalize()
        lessons.append({'id': f"{uid}l{i + 1}", 'title': title_l, 'words': ws, 'sentences': sents})
    units.append({'id': uid, 'level': level, 'title': title, 'description': desc, 'color': COLORS[len(units) % len(COLORS)],
                  'guide': guide, 'lessons': lessons})

def word(ko, ro, uz, emoji=None):
    uz = clean_uz(uz)
    w = {'fr': ko, 'uz': uz, 'ro': ro}
    e = emoji or D['EMOJI'].get(ko)
    if e: w['emoji'] = e
    a = alts(uz)
    if a: w['alt'] = a
    return w

def sent(ko, ro, uz):
    return {'fr': ko, 'uz': clean_uz(uz), 'ro': ro}

def guide(title):
    return [{'title': t, 'text': x, **({'examples': [[a, b] for a, b in ex]} if ex else {})} for t, x, ex in D['GUIDES'].get(title, [])]

# 1-2. Hangul
vow = [word(l, r, f"«{r}» tovushi") for l, r, _, _ in D['HANGUL_VOWELS']]
vs = [sent(k, r, u) for k, r, u, _ in D['HANGUL_SYLLABLE_WORDS_V']]
add_unit('Hangul: unlilar', 'A1', vow, vs, guide('Hangul: unlilar'), "Koreys alifbosi: 10 ta asosiy unli")
con = [word(l, r.split(' ')[0], f"«{r}» tovushi") for l, r, _, _ in D['HANGUL_CONSONANTS']]
cs = [sent(k, r, u) for k, r, u, _ in D['HANGUL_SYLLABLE_WORDS_C']]
add_unit('Hangul: undoshlar', 'A1', con, cs, guide('Hangul: undoshlar'), "14 ta undosh va birinchi so'zlar")

# 3+. Mavzular: TOPIK darajasi bo'yicha tartib
topics = [(t, cat['LVMAP'][t]) for t in cat['TOPICS'] if t not in SKIP]
topics.sort(key=lambda x: x[1])
for t, lv in topics:
    ws = [word(k, r, u) for k, r, u in cat['TOPICS'][t]]
    ss = [sent(*x) for x in D['SENTENCES'][t]]
    add_unit(t, LEVEL[lv], ws, ss, guide(t), DESC.get(t, t))
for t, items in D['T6_TOPICS'].items():
    ws = [word(k, r, u) for k, r, u in items]
    ss = [sent(*x) for x in D['SENTENCES'][t]]
    add_unit(t, 'C2', ws, ss, guide(t), DESC.get(t, t))

header = '''// Kurs mazmuni: Koreys tili (TOPIK 1 → 6) — o'zbek tilida so'zlashuvchilar uchun.
// AVTOMATIK yaratilgan: python3 scripts/build-korean-course.py (manba: legacy/public/catalog.json + scripts/korean-course-data.py).
// Tarixiy sabab bilan maydon nomi `fr` — unda koreyscha (Hangul) matn turadi; `ro` — o'qilishi (romanizatsiya).

export interface Word {
  fr: string;
  uz: string;
  /** O'qilishi (Revised Romanization). */
  ro?: string;
  emoji?: string;
  alt?: string[];
}

export interface Sentence {
  fr: string;
  uz: string;
  ro?: string;
  frAlt?: string[];
  uzAlt?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  words: Word[];
  sentences: Sentence[];
}

/** Ichki daraja kodi (A1…C2) — interfeysda TOPIK 1…6 sifatida ko'rsatiladi (levelLabel). */
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const CEFR: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TOPIK: Record<Cefr, string> = { A1: 'TOPIK 1', A2: 'TOPIK 2', B1: 'TOPIK 3', B2: 'TOPIK 4', C1: 'TOPIK 5', C2: 'TOPIK 6' };
/** Interfeysdagi daraja nomi: «TOPIK 1» … «TOPIK 6». */
export const levelLabel = (c: Cefr): string => TOPIK[c];

export interface Unit {
  id: string;
  /** Daraja (A1…C2 = TOPIK 1…6). */
  level?: Cefr;
  title: string;
  description: string;
  color: string;
  guide: { title: string; text: string; examples?: [string, string][] }[];
  lessons: Lesson[];
}

'''
footer = '''
export const ALL_LESSONS: Lesson[] = COURSE.flatMap((u) => u.lessons);

export function findLesson(id: string): { unit: Unit; lesson: Lesson; index: number } | null {
  for (const unit of COURSE) {
    const index = unit.lessons.findIndex((l) => l.id === id);
    if (index >= 0) return { unit, lesson: unit.lessons[index], index };
  }
  return null;
}
'''
out = header + 'export const COURSE: Unit[] = ' + json.dumps(units, ensure_ascii=False, indent=1) + ';\n' + footer
open(os.path.join(ROOT, 'src', 'data', 'course.ts'), 'w').write(out)
nw = sum(len(l['words']) for u in units for l in u['lessons'])
ns = sum(len(D['SENTENCES'].get(u['title'], [])) for u in units)
print(f"{len(units)} bo'lim, {sum(len(u['lessons']) for u in units)} dars, {nw} so'z, {ns}+ gap")
