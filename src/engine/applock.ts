// Ilova qulfi (shaxsiy PIN). Bu qurilma darajasidagi maxfiylik qulfi: PIN o'zi hech qayerda saqlanmaydi —
// faqat tasodifiy tuz bilan PBKDF2-SHA256 (150 000 marta) xeshi localStorage'da turadi.
// Ketma-ket xatolarda kutish vaqti oshib boradi.

const KEY = 'voila.applock.v1';
const ITERATIONS = 150_000;
export const PIN_LENGTH = 4;
/** Ilova shuncha vaqt yashirin turgandan keyin qayta qulflanadi. */
export const RELOCK_AFTER_MS = 5 * 60 * 1000;

interface LockRecord {
  salt: string;
  hash: string;
  fails: number;
  lockedUntil: number;
}

function read(): LockRecord | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as Partial<LockRecord>;
    if (typeof r.salt !== 'string' || typeof r.hash !== 'string') return null;
    return { salt: r.salt, hash: r.hash, fails: Number(r.fails) || 0, lockedUntil: Number(r.lockedUntil) || 0 };
  } catch {
    return null;
  }
}

function write(r: LockRecord | null) {
  try {
    if (r) localStorage.setItem(KEY, JSON.stringify(r));
    else localStorage.removeItem(KEY);
  } catch {
    /* saqlash bloklangan */
  }
}

const hex = (buf: ArrayBuffer | Uint8Array) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s: string) => new Uint8Array((s.match(/../g) ?? []).map((h) => parseInt(h, 16)));

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

export async function hashPin(pin: string, saltHex: string, iterations = ITERATIONS): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations }, key, 256);
  return hex(bits);
}

export function hasPin(): boolean {
  return read() !== null;
}

export async function setPin(pin: string): Promise<void> {
  if (!isValidPin(pin)) throw new Error('PIN 4 ta raqam bo‘lishi kerak');
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  write({ salt, hash: await hashPin(pin, salt), fails: 0, lockedUntil: 0 });
}

export function clearPin(): void {
  write(null);
}

/** Ketma-ket xatolardan keyingi kutish: 5-xatodan boshlab 30 s, 60 s, 120 s … (ko'pi bilan 15 daqiqa). */
export function cooldownFor(fails: number): number {
  if (fails < 5) return 0;
  return Math.min(15 * 60_000, 30_000 * 2 ** (fails - 5));
}

export function lockedForMs(now = Date.now()): number {
  const r = read();
  return r ? Math.max(0, r.lockedUntil - now) : 0;
}

export type VerifyResult = { ok: true } | { ok: false; waitMs: number; fails: number };

export async function verifyPin(pin: string, now = Date.now()): Promise<VerifyResult> {
  const r = read();
  if (!r) return { ok: true };
  if (r.lockedUntil > now) return { ok: false, waitMs: r.lockedUntil - now, fails: r.fails };
  const ok = isValidPin(pin) && (await hashPin(pin, r.salt)) === r.hash;
  if (ok) {
    write({ ...r, fails: 0, lockedUntil: 0 });
    return { ok: true };
  }
  const fails = r.fails + 1;
  const wait = cooldownFor(fails);
  write({ ...r, fails, lockedUntil: wait ? now + wait : 0 });
  return { ok: false, waitMs: wait, fails };
}
