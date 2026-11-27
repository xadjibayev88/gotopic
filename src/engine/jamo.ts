// Yakka Hangul harflari (ㄱ, ㅏ …) uchun ovoz: telefon TTS dvigatellari yakka harfni
// ko'pincha o'qimaydi yoki noto'g'ri o'qiydi, shuning uchun aniq bo'g'in / harf nomi beriladi.

/** Unli → jim ㅇ bilan bo'g'in (ㅏ → 아). */
export const VOWEL_SPEECH: Record<string, string> = {
  ㅏ: '아', ㅓ: '어', ㅗ: '오', ㅜ: '우', ㅡ: '으', ㅣ: '이', ㅑ: '야', ㅕ: '여', ㅛ: '요', ㅠ: '유',
  ㅐ: '애', ㅔ: '에', ㅒ: '얘', ㅖ: '예', ㅘ: '와', ㅙ: '왜', ㅚ: '외', ㅝ: '워', ㅞ: '웨', ㅟ: '위', ㅢ: '의',
};

/** Undosh → harfning koreyscha nomi (ㄱ → 기역). */
export const CONSONANT_SPEECH: Record<string, string> = {
  ㄱ: '기역', ㄴ: '니은', ㄷ: '디귿', ㄹ: '리을', ㅁ: '미음', ㅂ: '비읍', ㅅ: '시옷', ㅇ: '이응', ㅈ: '지읒', ㅊ: '치읓',
  ㅋ: '키읔', ㅌ: '티읕', ㅍ: '피읖', ㅎ: '히읗', ㄲ: '쌍기역', ㄸ: '쌍디귿', ㅃ: '쌍비읍', ㅆ: '쌍시옷', ㅉ: '쌍지읒',
};

/** TTS'ga beriladigan matn: yakka harf bo'lsa — uning o'qilishi, aks holda matnning o'zi. */
export function speakable(text: string): string {
  const t = text.trim();
  return VOWEL_SPEECH[t] ?? CONSONANT_SPEECH[t] ?? text;
}
