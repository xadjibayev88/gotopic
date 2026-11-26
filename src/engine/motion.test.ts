import { describe, expect, it } from 'vitest';
import { countValue, easeOutExpo } from './motion';
import { syllableWave } from './voice/tts';

describe('count up', () => {
  it('starts at the old value and lands exactly on the new one', () => {
    expect(countValue(10, 50, 0)).toBe(10);
    expect(countValue(10, 50, 1)).toBe(50);
    expect(countValue(10, 50, 2)).toBe(50);
    expect(countValue(50, 10, 1)).toBe(10);
  });
  it('eases out (most of the climb happens early)', () => {
    expect(easeOutExpo(0.3)).toBeGreaterThan(0.8);
    expect(countValue(0, 100, 0.5)).toBeGreaterThan(90);
  });
});

describe('synthetic lip-sync wave', () => {
  it('stays within 0..1 and actually opens and closes', () => {
    let min = 1;
    let max = 0;
    for (let ms = 0; ms < 6000; ms += 16) {
      const v = syllableWave(ms);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
    expect(max).toBeGreaterThan(0.6);
    expect(min).toBeLessThan(0.2);
  });
});
