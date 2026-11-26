import { describe, expect, it } from 'vitest';
import { initialState, MAX_FREEZES, MAX_HEARTS, spinWheel, wheelPrizes } from './game';

describe('wheel of fortune station', () => {
  const s0 = { ...initialState(), gems: 100, hearts: 1, streakFreezes: 0 };
  it('lands on the rolled sector and gives that prize once', () => {
    const prizes = wheelPrizes('u1-chest');
    expect(prizes).toHaveLength(6);
    const a = spinWheel(s0, 'u1-chest', 0.01);
    expect(a.index).toBe(0);
    expect(a.state.gems).toBe(100 + (prizes[0] as { amount: number }).amount);
    expect(a.state.chests).toContain('u1-chest');
    // ikkinchi marta — hech narsa berilmaydi
    expect(spinWheel(a.state, 'u1-chest', 0.01).state.gems).toBe(a.state.gems);
  });
  it('fish never exceed the maximum, boost extends time, full umbrellas turn into coins', () => {
    expect(spinWheel(s0, 'x', 5.5 / 6).state.hearts).toBe(MAX_HEARTS);
    const b = spinWheel(s0, 'y', 2.5 / 6, 1_000);
    expect(b.state.xpBoostUntil).toBeGreaterThan(1_000);
    const full = spinWheel({ ...s0, streakFreezes: MAX_FREEZES }, 'z', 4.5 / 6);
    expect(full.prize.kind).toBe('gems');
    expect(full.state.gems).toBeGreaterThan(100);
  });
});
