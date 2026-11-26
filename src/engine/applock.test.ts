import { beforeEach, describe, expect, it } from 'vitest';
import { clearPin, cooldownFor, hashPin, hasPin, isValidPin, lockedForMs, setPin, verifyPin } from './applock';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as Storage;
});

describe('app lock PIN', () => {
  it('stores only a salted hash, never the PIN itself', async () => {
    await setPin('2580');
    expect(hasPin()).toBe(true);
    const raw = [...store.values()].join('');
    expect(Object.values(JSON.parse(raw))).not.toContain('2580');
    expect(JSON.parse(raw).hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('accepts the right PIN and rejects a wrong one', async () => {
    await setPin('2580');
    expect(await verifyPin('1111')).toMatchObject({ ok: false, fails: 1 });
    expect(await verifyPin('2580')).toEqual({ ok: true });
  });

  it('locks out after repeated failures and resets the counter on success', async () => {
    await setPin('2580');
    const now = 1_000_000;
    for (let i = 0; i < 4; i++) expect((await verifyPin('0000', now)).ok).toBe(false);
    const fifth = await verifyPin('0000', now);
    expect(fifth).toMatchObject({ ok: false, waitMs: 30_000 });
    // even the correct PIN is refused during the cooldown
    expect((await verifyPin('2580', now + 1000)).ok).toBe(false);
    expect(lockedForMs(now + 1000)).toBeGreaterThan(0);
    expect(await verifyPin('2580', now + 31_000)).toEqual({ ok: true });
  });

  it('uses a growing, capped cooldown', () => {
    expect(cooldownFor(4)).toBe(0);
    expect(cooldownFor(5)).toBe(30_000);
    expect(cooldownFor(6)).toBe(60_000);
    expect(cooldownFor(30)).toBe(15 * 60_000);
  });

  it('validates PIN shape and salts each hash', async () => {
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('1234')).toBe(true);
    const a = await hashPin('2580', '00'.repeat(16), 1000);
    const b = await hashPin('2580', '01'.repeat(16), 1000);
    expect(a).not.toBe(b);
    clearPin();
    expect(hasPin()).toBe(false);
  });
});
