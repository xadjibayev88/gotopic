// Hangul alifbosi bo'limlari uchun to'liq tekshiruv: har bir harf, o'qilishi, yorlig'i, ovozi,
// darslardagi so'zlar va «Qaysi biri …?» savollari. Biror harf xato bo'lsa — test yiqiladi.
import { describe, expect, it } from 'vitest';
import { COURSE } from '../data/course';
import { buildLesson, hidePickRomanization, makePick, makeSentenceExercise, withoutNotes } from './exercises';
import { evaluate } from './evaluate';
import { CONSONANT_SPEECH, speakable, VOWEL_SPEECH } from './jamo';
import { rng } from './random';
import { checkAnswer, tokenize } from './text';

// Revised Romanization (rasmiy) bo'yicha to'g'ri qiymatlar.
const VOWELS: Record<string, string> = { ㅏ: 'a', ㅓ: 'eo', ㅗ: 'o', ㅜ: 'u', ㅡ: 'eu', ㅣ: 'i', ㅑ: 'ya', ㅕ: 'yeo', ㅛ: 'yo', ㅠ: 'yu' };
// [o'qilishi (bo'g'in boshida), darsdagi yorliq]
const CONSONANTS: Record<string, [string, string]> = {
  ㄱ: ['g', 'g / k'], ㄴ: ['n', 'n'], ㄷ: ['d', 'd / t'], ㄹ: ['r', 'r / l'], ㅁ: ['m', 'm'], ㅂ: ['b', 'b / p'], ㅅ: ['s', 's'],
  ㅇ: ['', '– / ng'], ㅈ: ['j', 'j'], ㅊ: ['ch', 'ch'], ㅋ: ['k', 'k (nafasli)'], ㅌ: ['t', 't (nafasli)'], ㅍ: ['p', 'p (nafasli)'], ㅎ: ['h', 'h'],
};
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';

/** Batchimsiz bo'g'inni harflarga ajratadi (alifbo darslarida batchim yo'q — bu ham tekshiriladi). */
function syllables(text: string): [string, string][] {
  return [...text].map((c) => {
    const o = c.charCodeAt(0) - 0xac00;
    expect(o >= 0 && o < 11172, `«${text}» faqat Hangul bo'g'inlaridan iborat bo'lishi kerak`).toBe(true);
    expect(o % 28, `«${text}» alifbo darsida batchimli bo'g'in bo'lmasin`).toBe(0);
    return [CHO[Math.floor(o / 588)], JUNG[Math.floor((o % 588) / 28)]];
  });
}
const romanize = (text: string) => syllables(text).map(([c, v]) => CONSONANTS[c][0] + VOWELS[v]).join('');

const vowelUnit = COURSE.find((u) => u.title === 'Hangul: unlilar')!;
const consUnit = COURSE.find((u) => u.title === 'Hangul: undoshlar')!;
const hangulUnits = [vowelUnit, consUnit];

describe('Hangul alifbosi', () => {
  it('ikkala bo\'lim mavjud va kursning boshida', () => {
    expect(COURSE[0]).toBe(vowelUnit);
    expect(COURSE[1]).toBe(consUnit);
  });

  it('10 ta unli va 14 ta undosh — har biri bir martadan, to\'g\'ri o\'qilish va yorliq bilan', () => {
    const vowels = vowelUnit.lessons.flatMap((l) => l.words);
    const cons = consUnit.lessons.flatMap((l) => l.words);
    expect(vowels.map((w) => w.fr).sort()).toEqual(Object.keys(VOWELS).sort());
    expect(cons.map((w) => w.fr).sort()).toEqual(Object.keys(CONSONANTS).sort());
    for (const w of vowels) {
      expect(w.ro, w.fr).toBe(VOWELS[w.fr]);
      expect(w.uz, w.fr).toBe(VOWELS[w.fr]);
    }
    for (const w of cons) {
      const [ro, label] = CONSONANTS[w.fr];
      expect(w.uz, w.fr).toBe(label);
      expect(w.ro, w.fr).toBe(ro || '–');
    }
  });

  it('dars sarlavhasi darsdagi harflarga mos', () => {
    for (const u of hangulUnits) for (const l of u.lessons) expect(l.title).toBe(l.words.map((w) => w.fr).join(' '));
  });

  it('har bir harf uchun ovoz bor (yakka harf TTS ga to\'g\'ri bo\'g\'in / nom bo\'lib boradi)', () => {
    for (const v of Object.keys(VOWELS)) {
      expect(VOWEL_SPEECH[v]).toBe(String.fromCharCode(0xac00 + 11 * 588 + JUNG.indexOf(v) * 28));
      expect(speakable(v)).toBe(VOWEL_SPEECH[v]);
    }
    for (const c of Object.keys(CONSONANTS)) {
      expect(CONSONANT_SPEECH[c], c).toBeTruthy();
      expect(speakable(c)).toBe(CONSONANT_SPEECH[c]);
    }
    expect(speakable('나무')).toBe('나무');
  });

  it("darsdagi so'zlar faqat o'rgatilgan harflardan va o'qilishi to'g'ri", () => {
    for (const u of hangulUnits) {
      const known = new Set(['ㅇ', ...(u === consUnit ? Object.keys(VOWELS) : [])]);
      for (const l of u.lessons) {
        l.words.forEach((w) => known.add(w.fr));
        expect(l.sentences.length, l.id).toBeGreaterThanOrEqual(3);
        for (const s of l.sentences) {
          for (const [c, v] of syllables(s.fr)) {
            expect(known.has(c), `${l.id}: «${s.fr}» dagi ${c} hali o'rgatilmagan`).toBe(true);
            expect(known.has(v), `${l.id}: «${s.fr}» dagi ${v} hali o'rgatilmagan`).toBe(true);
          }
          expect(s.ro, s.fr).toBe(romanize(s.fr));
          expect(s.uz.trim(), s.fr).not.toBe('');
        }
      }
    }
  });

  it("«Qaysi biri …?» savolida hech bir variant o'qilish bilan javobni oshkor qilmaydi", () => {
    for (const u of hangulUnits) {
      for (const l of u.lessons) {
        for (const w of l.words) {
          for (let seed = 1; seed <= 30; seed++) {
            const ex = makePick(w, l.words, rng(seed));
            if (ex.kind !== 'pick') throw new Error('pick');
            expect(ex.options).toContain(w);
            expect(new Set(ex.options.map((o) => o.fr)).size).toBe(ex.options.length);
            expect(new Set(ex.options.map((o) => o.uz)).size).toBe(ex.options.length);
            // Yorliqlar ko'rsatilsa, ular javobni aytib qo'yadi — shuning uchun hammasi yashirilishi kerak.
            expect(hidePickRomanization(ex), `${w.fr} «${w.uz}»`).toBe(true);
            const right = evaluate(ex, { kind: 'pick', fr: w.fr });
            expect(right.correct).toBe(true);
            expect(right.solution).toBe(`${w.fr} — «${w.uz}»`);
            for (const o of ex.options) if (o !== w) expect(evaluate(ex, { kind: 'pick', fr: o.fr }).correct).toBe(false);
          }
        }
      }
    }
  });

  it("harf yorlig'ini yozganda istalgan variant qabul qilinadi", () => {
    expect(checkAnswer('g', ['g / k']).verdict).toBe('correct');
    expect(checkAnswer('K', ['g / k']).verdict).toBe('correct');
    expect(checkAnswer('ng', ['– / ng']).verdict).toBe('correct');
    expect(checkAnswer('k', ['k (nafasli)']).verdict).toBe('correct');
    expect(checkAnswer('p', ['g / k']).verdict).toBe('wrong');
  });

  it("alifbo darslaridagi barcha mashqlar to'g'ri javob bilan o'tadi va boshqa darsning harflarini ishlatmaydi", () => {
    for (const u of hangulUnits) {
      u.lessons.forEach((l, i) => {
        const allowed = new Set(u.lessons.slice(0, i + 1).flatMap((x) => x.sentences.map((s) => s.fr)));
        for (let seed = 1; seed <= 20; seed++) {
          for (const level of [0, 1, 2, 3, 4]) {
            for (const ex of buildLesson(l, u, { rand: rng(seed), tts: true, level })) {
              if (ex.kind === 'build' || ex.kind === 'listen') {
                const ok = evaluate(ex, { kind: 'tokens', text: ex.accepted[0] });
                expect(ok.correct, `${l.id} ${ex.kind}`).toBe(true);
                if (ex.kind === 'listen' || ex.dir === 'uz2fr') for (const t of ex.tokens) expect(allowed.has(t), `${l.id}: ${t}`).toBe(true);
              }
              if (ex.kind === 'type') expect(evaluate(ex, { kind: 'type', text: ex.accepted[0] }).correct).toBe(true);
              if (ex.kind === 'choose') expect(evaluate(ex, { kind: 'choose', text: ex.answer }).correct).toBe(true);
            }
          }
        }
      });
    }
  });
});

describe("so'z-plitkalar (butun kurs)", () => {
  it("qavsdagi izoh plitka bo'lmaydi va plitkalardan yig'ilgan javob qabul qilinadi", () => {
    for (const u of COURSE) {
      const pool = u.lessons.flatMap((l) => l.sentences);
      const vocab = u.lessons.flatMap((l) => l.words);
      for (const s of pool) {
        const ex = makeSentenceExercise('build-fr2uz', s, pool, vocab, rng(7));
        if (ex.kind !== 'build') throw new Error('build');
        for (const t of ex.tokens) expect(t, `${s.fr} → ${t}`).not.toMatch(/[()]/);
        const built = tokenize(withoutNotes(s.uz)).join(' ');
        expect(evaluate(ex, { kind: 'tokens', text: built }).correct, `${s.fr}: «${built}»`).toBe(true);
      }
    }
  });
});

describe("darslar sahifasi (butun kurs)", () => {
  it("bir bo'limda so'z takrorlanmaydi va dars nomlari har xil", () => {
    for (const u of COURSE) {
      const frs = u.lessons.flatMap((l) => l.words.map((w) => w.fr));
      expect(new Set(frs).size, `${u.title}: takroriy so'z`).toBe(frs.length);
      const titles = u.lessons.map((l) => l.title);
      expect(new Set(titles).size, `${u.title}: bir xil dars nomlari ${titles.join(' / ')}`).toBe(titles.length);
      for (const t of titles) {
        const parts = t.toLowerCase().split(', ');
        expect(new Set(parts).size, `${u.title}: «${t}»`).toBe(parts.length);
      }
      for (const l of u.lessons) expect(l.words.length, l.id).toBeGreaterThanOrEqual(4);
    }
  });
});
