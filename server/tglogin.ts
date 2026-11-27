// Telegram orqali kirish (sayt/brauzer): tugma → t.me/<bot>?start=login_<kod> → botda «Tasdiqlash» → sayt o'zi kiradi.
// Kod faqat so'ragan brauzerda bo'ladi; 10 daqiqa amal qiladi va bir marta ishlatiladi.
// Bot tasdiqlash tugmasini so'raydi: begona havola orqali kelgan foydalanuvchi o'z hisobini boshqaga bermasligi uchun.
import { randomBytes } from 'node:crypto';

export const TG_LOGIN_TTL = 10 * 60_000;
const MAX = 5000;
const pending = new Map<string, { created: number; userId?: string }>();

function sweep(now: number) {
  for (const [k, v] of pending) if (now - v.created > TG_LOGIN_TTL) pending.delete(k);
  while (pending.size >= MAX) pending.delete(pending.keys().next().value as string);
}

export function startTgLogin(now = Date.now()): string {
  sweep(now);
  const code = randomBytes(12).toString('base64url');
  pending.set(code, { created: now });
  return code;
}

export type TgLoginStatus = 'pending' | 'ok' | 'expired';
export function tgLoginStatus(code: string, now = Date.now()): TgLoginStatus {
  const p = pending.get(code);
  if (!p || now - p.created > TG_LOGIN_TTL) return 'expired';
  return p.userId ? 'ok' : 'pending';
}

/** Bot: foydalanuvchi «Tasdiqlash» ni bosdi. */
export function confirmTgLogin(code: string, userId: string, now = Date.now()): boolean {
  const p = pending.get(code);
  if (!p || now - p.created > TG_LOGIN_TTL || p.userId) return false;
  p.userId = userId;
  return true;
}

/** Sayt: tasdiqlangan kodni bir marta almashtiradi (keyin o'chadi). */
export function takeTgLogin(code: string, now = Date.now()): string | null {
  const p = pending.get(code);
  if (!p?.userId || now - p.created > TG_LOGIN_TTL) return null;
  pending.delete(code);
  return p.userId;
}
