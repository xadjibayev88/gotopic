import { describe, expect, it } from 'vitest';
import { cardBrand, groupCardNumber } from './StripeFx';

describe('payment card display', () => {
  it('groups card digits by four', () => {
    expect(groupCardNumber('8600123412341234')).toBe('8600 1234 1234 1234');
    expect(groupCardNumber('8600 1234-1234 1234')).toBe('8600 1234 1234 1234');
    expect(groupCardNumber('abc')).toBe('abc');
  });
  it('guesses the card network from the prefix', () => {
    expect(cardBrand('8600 0000 0000 0000', 'card')).toBe('UZCARD');
    expect(cardBrand('9860 0000 0000 0000', 'card')).toBe('HUMO');
    expect(cardBrand('4000 0000 0000 0000', 'visa')).toBe('VISA');
    expect(cardBrand('5100 0000 0000 0000', 'visa')).toBe('MASTERCARD');
    expect(cardBrand('1234', 'card')).toBe('KARTA');
  });
});
