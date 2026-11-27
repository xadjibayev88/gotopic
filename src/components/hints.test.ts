import { describe, expect, it } from 'vitest';
import { hintFor } from './exercises';

const hint = (sentence: string, i: number) => {
  const raw = sentence.split(/\s+/);
  const clean = raw.map((t) => t.replace(/[.,!?;:«»]/g, ''));
  return hintFor(clean, i, raw)?.text;
};

describe("so'z ustidagi izohlar", () => {
  it("gapdagi ma'noga mos izoh beradi", () => {
    expect(hint('이 사람은 누구예요?', 0)).toBe('bu');
    expect(hint('이 더하기 삼은 오예요.', 0)).toBe('ikki (2)');
    expect(hint('이', 0)).toBe('ikki (2)');
    expect(hint('책 네 권을 샀어요.', 1)).toBe("to'rtta");
    expect(hint('네, 괜찮아요.', 0)).toBe('Ha');
    expect(hint('새 집이 아주 편해요.', 0)).toBe('yangi');
    expect(hint('사과 하나 주세요.', 0)).toBe('olma');
  });
});
