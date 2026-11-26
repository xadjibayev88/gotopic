// Karta raqamini ko'rsatish — ilova (shisha karta) va Telegram bot uchun umumiy.

/** Karta raqamini 4 talik guruhlarga bo'ladi: «8600123412341234» → «8600 1234 1234 1234». */
export function groupCardNumber(n: string): string {
  const d = n.replace(/\D/g, '');
  return d.length >= 12 ? d.replace(/(.{4})(?=.)/g, '$1 ') : n.trim();
}

/** Raqamdan karta tizimini taxmin qiladi (faqat ko'rinish uchun). */
export function cardBrand(n: string, kind: 'card' | 'visa'): string {
  const d = n.replace(/\D/g, '');
  if (/^8600|^5614/.test(d)) return 'UZCARD';
  if (/^9860/.test(d)) return 'HUMO';
  if (/^4/.test(d)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'MASTERCARD';
  return kind === 'visa' ? 'VISA' : 'KARTA';
}
