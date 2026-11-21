// Matnni solishtirish uchun normallashtirish va javob tekshiruvi.

const APOSTROPHES = /[‘’ʻʼ`´′]/g;
const PUNCT = /[.,!?;:«»"()… ]|\s[-—–]\s/g;

export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(APOSTROPHES, "'")
    .replace(PUNCT, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export type CheckVerdict = 'correct' | 'typo' | 'accent' | 'wrong';

export interface CheckResult {
  verdict: CheckVerdict;
  /** Eng yaqin to'g'ri javob (ko'rsatish uchun). */
  best: string;
}

/**
 * Foydalanuvchi javobini qabul qilinadigan variantlar bilan solishtiradi.
 * - aniq mos (normallashtirilgandan keyin) → correct
 * - faqat urg'u belgilari farq qiladi → accent (to'g'ri deb hisoblanadi)
 * - bitta harf xatosi (uzun javoblarda) → typo (to'g'ri deb hisoblanadi)
 */
export function checkAnswer(input: string, accepted: string[]): CheckResult {
  const n = normalize(input);
  const best = accepted[0];
  if (!n) return { verdict: 'wrong', best };
  for (const a of accepted) if (normalize(a) === n) return { verdict: 'correct', best: a };
  const nn = stripAccents(n);
  for (const a of accepted) if (stripAccents(normalize(a)) === nn) return { verdict: 'accent', best: a };
  for (const a of accepted) {
    const na = stripAccents(normalize(a));
    const tolerance = na.length >= 16 ? 2 : na.length >= 6 ? 1 : 0;
    if (tolerance && levenshtein(nn, na) <= tolerance) return { verdict: 'typo', best: a };
  }
  return { verdict: 'wrong', best };
}

/** Gapni so'z-plitkalarga ajratadi (tinish belgilarisiz). */
export function tokenize(s: string): string[] {
  return s
    .replace(/[.,!?;:«»"…]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
