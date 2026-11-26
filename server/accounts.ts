// Hisoblar: email + parol (scrypt), Google (ID token), sessiya cookie (HMAC), progress sinxronlash.
import { createHash, createHmac, createPublicKey, randomBytes, randomUUID, scryptSync, timingSafeEqual, verify as cryptoVerify } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { IncomingMessage } from 'node:http';
import { db } from './db.ts';
import type { AiSubject } from './ai-consent.ts';

export const SESSION_COOKIE = 'salut_session';
const SESSION_DAYS = 60;

export interface User {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  provider: 'email' | 'google';
  createdAt: number;
}

// ---------- Sessiya kaliti ----------

let secretCache: Buffer | null = null;
function sessionSecret(): Buffer {
  if (secretCache) return secretCache;
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 32) return (secretCache = Buffer.from(fromEnv));
  // Kalit berilmagan bo'lsa — ma'lumotlar papkasida bir marta yaratiladi va saqlanadi.
  const dir = resolve(process.env.SALUT_DATA_DIR ?? 'data');
  const file = join(dir, 'session.secret');
  if (process.env.SALUT_DB === ':memory:') return (secretCache = randomBytes(48));
  if (!existsSync(file)) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, randomBytes(48).toString('base64url'), { mode: 0o600 });
  }
  return (secretCache = Buffer.from(readFileSync(file, 'utf8').trim()));
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const sign = (data: string) => createHmac('sha256', sessionSecret()).update(data).digest('base64url');

const tokenVersion = (userId: string): number | null => {
  const r = db().prepare('SELECT token_version AS v FROM users WHERE id = ?').get(userId) as { v: number } | undefined;
  return r ? r.v : null;
};
/** Foydalanuvchining barcha sessiyalarini bekor qiladi (masalan, hisob boshqa usul bilan egallanganda). */
export function revokeSessions(userId: string) {
  db().prepare('UPDATE users SET token_version = token_version + 1 WHERE id = ?').run(userId);
}

export function createSessionToken(userId: string, now = Date.now()): string {
  const payload = b64(JSON.stringify({ u: userId, e: now + SESSION_DAYS * 86_400_000, v: tokenVersion(userId) ?? 0 }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): string | null {
  if (!token || token.length > 512) return null;
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(mac);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    const { u, e, v } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { u?: string; e?: number; v?: number };
    if (typeof u !== 'string' || typeof e !== 'number' || e <= now) return null;
    // Hisob o'chirilgan yoki sessiyalar bekor qilingan bo'lsa — token yaroqsiz.
    const cur = tokenVersion(u);
    return cur !== null && (v ?? 0) === cur ? u : null;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string, secure: boolean): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure ? '; Secure' : ''}`;
}
export const clearCookie = (secure: boolean) => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;

export function readCookie(req: IncomingMessage, name: string): string | undefined {
  const raw = req.headers.cookie ?? '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

export function currentUserId(req: IncomingMessage): string | null {
  const bearer = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization ?? ''))?.[1];
  return verifySessionToken(bearer ?? readCookie(req, SESSION_COOKIE));
}

/** AI consent comes only from the HMAC-signed account session; there is no IP or guest fallback. */
export function currentAiSubject(req: IncomingMessage): AiSubject | null {
  const userId = currentUserId(req);
  return userId ? { kind: 'account', userId } : null;
}

// ---------- Parollar ----------

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function checkPassword(password: string, stored: string | null): boolean {
  if (!stored?.startsWith('scrypt$')) return false;
  const [, saltB64, hashB64] = stored.split('$');
  const hash = Buffer.from(hashB64, 'base64url');
  const test = scryptSync(password, Buffer.from(saltB64, 'base64url'), hash.length, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(hash, test);
}

// ---------- Foydalanuvchilar ----------

type Row = { id: string; email: string | null; name: string; avatar: string | null; password_hash: string | null; google_sub: string | null; created_at: number };

function toUser(r: Row): User {
  return { id: r.id, email: r.email, name: r.name, avatar: r.avatar, provider: r.google_sub ? 'google' : 'email', createdAt: r.created_at };
}

export function getUser(id: string): User | null {
  const r = db().prepare('SELECT * FROM users WHERE id = ?').get(id) as Row | undefined;
  return r ? toUser(r) : null;
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export type AuthResult = { ok: true; user: User } | { ok: false; status: number; message: string };

export function register(emailRaw: unknown, passwordRaw: unknown, nameRaw: unknown): AuthResult {
  const email = String(emailRaw ?? '').trim().toLowerCase();
  const password = String(passwordRaw ?? '');
  const name = String(nameRaw ?? '').trim().slice(0, 40);
  if (!EMAIL.test(email)) return { ok: false, status: 400, message: "Email manzil noto'g'ri" };
  if (password.length < 8 || password.length > 200) return { ok: false, status: 400, message: "Parol kamida 8 ta belgidan iborat bo'lsin" };
  if (db().prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return { ok: false, status: 409, message: "Bu email bilan hisob allaqachon bor — kiring" };
  const id = randomUUID();
  db().prepare('INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(id, email, name, hashPassword(password), Date.now());
  return { ok: true, user: getUser(id)! };
}

// Parolni tanlab buzishga qarshi: bitta email uchun 15 daqiqada 6 ta xato — 15 daqiqa qulf.
const failures = new Map<string, { n: number; first: number; lockedUntil: number }>();
const LOCK_AFTER = 6;
const LOCK_MS = 15 * 60_000;

export function login(emailRaw: unknown, passwordRaw: unknown): AuthResult {
  const email = String(emailRaw ?? '').trim().toLowerCase().slice(0, 254);
  const f = failures.get(email);
  if (f && f.lockedUntil > Date.now()) return { ok: false, status: 429, message: `Juda ko'p urinish. ${Math.ceil((f.lockedUntil - Date.now()) / 60_000)} daqiqadan so'ng qayta urinib ko'ring.` };
  const r = db().prepare('SELECT * FROM users WHERE email = ?').get(email) as Row | undefined;
  // Vaqt bo'yicha ma'lumot sizdirmaslik uchun foydalanuvchi bo'lmasa ham xeshlash bajariladi.
  const ok = checkPassword(String(passwordRaw ?? ''), r?.password_hash ?? 'scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  if (!r || !ok) {
    const now = Date.now();
    const cur = f && now - f.first < LOCK_MS ? f : { n: 0, first: now, lockedUntil: 0 };
    cur.n++;
    if (cur.n >= LOCK_AFTER) cur.lockedUntil = now + LOCK_MS;
    failures.set(email, cur);
    if (failures.size > 50_000) for (const [k, v] of failures) if (now - v.first > LOCK_MS && v.lockedUntil < now) failures.delete(k);
    return { ok: false, status: 401, message: "Email yoki parol noto'g'ri" };
  }
  failures.delete(email);
  return { ok: true, user: toUser(r) };
}

export function upsertGoogleUser(sub: string, email: string | null, name: string, avatar: string | null): User {
  const bySub = db().prepare('SELECT * FROM users WHERE google_sub = ?').get(sub) as Row | undefined;
  if (bySub) {
    db().prepare('UPDATE users SET avatar = COALESCE(?, avatar) WHERE id = ?').run(avatar, bySub.id);
    return getUser(bySub.id)!;
  }
  // Shu email bilan oldin ochilgan hisob bo'lsa — Google'ni unga bog'laymiz (email Google tomonidan tasdiqlangan).
  const byEmail = email ? (db().prepare('SELECT * FROM users WHERE email = ?').get(email) as Row | undefined) : undefined;
  if (byEmail) {
    // Email'ni Google tasdiqladi. Agar hisob avval parol bilan ochilgan bo'lsa, u boshqa odam tomonidan oldindan
    // ochilgan bo'lishi mumkin — parol o'chiriladi va eski sessiyalar bekor qilinadi (hisobni egallab olishning oldi olinadi).
    db().prepare('UPDATE users SET google_sub = ?, avatar = COALESCE(?, avatar), password_hash = NULL WHERE id = ?').run(sub, avatar, byEmail.id);
    if (byEmail.password_hash) revokeSessions(byEmail.id);
    return getUser(byEmail.id)!;
  }
  const id = randomUUID();
  db().prepare('INSERT INTO users (id, email, name, google_sub, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, email, name.slice(0, 40), sub, avatar, Date.now());
  return getUser(id)!;
}

/** Facebook / Apple / Telegram hisobi: identities jadvali orqali bog'lanadi. */
export function upsertSocialUser(provider: 'facebook' | 'apple' | 'telegram', subject: string, email: string | null, name: string, avatar: string | null): User {
  const link = db().prepare('SELECT user_id FROM identities WHERE provider = ? AND subject = ?').get(provider, subject) as { user_id: string } | undefined;
  if (link && getUser(link.user_id)) {
    if (avatar) db().prepare('UPDATE users SET avatar = COALESCE(avatar, ?) WHERE id = ?').run(avatar, link.user_id);
    return getUser(link.user_id)!;
  }
  // Tasdiqlangan email bilan oldin ochilgan hisob bo'lsa — unga bog'laymiz.
  const byEmail = email ? (db().prepare('SELECT * FROM users WHERE email = ?').get(email) as Row | undefined) : undefined;
  if (byEmail?.password_hash) {
    // Tasdiqlangan email (Facebook/Apple) parolli hisobga bog'lanmoqda — oldindan egallashdan himoya.
    db().prepare('UPDATE users SET password_hash = NULL WHERE id = ?').run(byEmail.id);
    revokeSessions(byEmail.id);
  }
  const id = byEmail?.id ?? randomUUID();
  if (!byEmail) db().prepare('INSERT INTO users (id, email, name, avatar, created_at) VALUES (?, ?, ?, ?, ?)').run(id, email, name.slice(0, 40), avatar, Date.now());
  db().prepare('INSERT OR REPLACE INTO identities (provider, subject, user_id) VALUES (?, ?, ?)').run(provider, subject, id);
  return getUser(id)!;
}

export function deleteUser(id: string) {
  db().prepare('DELETE FROM users WHERE id = ?').run(id);
}

// ---------- Google ID token ----------

type Jwk = { kid: string; kty: string; n: string; e: string; alg?: string };
let jwksCache: { keys: Jwk[]; until: number } | null = null;

async function googleKeys(fetchImpl: typeof fetch = fetch): Promise<Jwk[]> {
  if (jwksCache && jwksCache.until > Date.now()) return jwksCache.keys;
  const res = await fetchImpl('https://www.googleapis.com/oauth2/v3/certs');
  if (!res.ok) throw new Error(`Google certs HTTP ${res.status}`);
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '')?.[1] ?? 3600);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  jwksCache = { keys, until: Date.now() + Math.min(maxAge, 86400) * 1000 };
  return keys;
}

export interface GoogleProfile {
  sub: string;
  email: string | null;
  name: string;
  picture: string | null;
}

/** Google Identity Services / Credential Manager bergan ID tokenni tekshiradi (RS256, iss, aud, exp). */
export async function verifyGoogleIdToken(token: string, audiences: string[], opts: { now?: number; keys?: Jwk[]; fetchImpl?: typeof fetch } = {}): Promise<GoogleProfile> {
  const parts = token.split('.');
  if (parts.length !== 3 || token.length > 4096) throw new Error('bad token');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as { alg?: string; kid?: string };
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, unknown>;
  if (header.alg !== 'RS256') throw new Error('bad alg');
  const keys = opts.keys ?? (await googleKeys(opts.fetchImpl));
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('unknown key');
  const key = createPublicKey({ key: { kty: jwk.kty, n: jwk.n, e: jwk.e }, format: 'jwk' });
  const valid = cryptoVerify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], 'base64url'));
  if (!valid) throw new Error('bad signature');
  const now = Math.floor((opts.now ?? Date.now()) / 1000);
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(String(payload.iss))) throw new Error('bad iss');
  if (!audiences.includes(String(payload.aud))) throw new Error('bad aud');
  if (typeof payload.exp !== 'number' || payload.exp < now - 60) throw new Error('expired');
  if (payload.email_verified === false) throw new Error('email not verified');
  return {
    sub: String(payload.sub),
    email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
    name: String(payload.given_name ?? payload.name ?? '').slice(0, 40),
    picture: typeof payload.picture === 'string' ? payload.picture.slice(0, 500) : null,
  };
}

// ---------- Apple ID token ----------

let appleJwks: { keys: Jwk[]; until: number } | null = null;
async function appleKeys(fetchImpl: typeof fetch = fetch): Promise<Jwk[]> {
  if (appleJwks && appleJwks.until > Date.now()) return appleJwks.keys;
  const res = await fetchImpl('https://appleid.apple.com/auth/keys');
  if (!res.ok) throw new Error(`Apple keys HTTP ${res.status}`);
  const j = (await res.json()) as { keys: Jwk[] };
  appleJwks = { keys: j.keys, until: Date.now() + 3600_000 };
  return j.keys;
}

export async function verifyAppleIdToken(token: string, audiences: string[], opts: { now?: number; keys?: Jwk[]; fetchImpl?: typeof fetch } = {}): Promise<{ sub: string; email: string | null }> {
  const parts = token.split('.');
  if (parts.length !== 3 || token.length > 4096) throw new Error('bad token');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as { alg?: string; kid?: string };
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, unknown>;
  if (header.alg !== 'RS256') throw new Error('bad alg');
  const keys = opts.keys ?? (await appleKeys(opts.fetchImpl));
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('unknown key');
  const key = createPublicKey({ key: { kty: jwk.kty, n: jwk.n, e: jwk.e }, format: 'jwk' });
  if (!cryptoVerify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], 'base64url'))) throw new Error('bad signature');
  const now = Math.floor((opts.now ?? Date.now()) / 1000);
  if (payload.iss !== 'https://appleid.apple.com') throw new Error('bad iss');
  if (!audiences.includes(String(payload.aud))) throw new Error('bad aud');
  if (typeof payload.exp !== 'number' || payload.exp < now - 60) throw new Error('expired');
  const verified = payload.email_verified === true || payload.email_verified === 'true';
  return { sub: String(payload.sub), email: verified && typeof payload.email === 'string' ? payload.email.toLowerCase() : null };
}

// ---------- Facebook ----------

export async function verifyFacebookToken(
  accessToken: string,
  appId: string,
  appSecret: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ id: string; name: string; email: string | null; picture: string | null }> {
  if (!/^[A-Za-z0-9]{20,600}$/.test(accessToken)) throw new Error('bad token');
  const dbg = await fetchImpl(`https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`);
  const d = (await dbg.json()) as { data?: { is_valid?: boolean; app_id?: string; user_id?: string } };
  if (!d.data?.is_valid || d.data.app_id !== appId) throw new Error('invalid token');
  const me = await fetchImpl(`https://graph.facebook.com/me?fields=id,first_name,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`);
  const m = (await me.json()) as { id?: string; first_name?: string; name?: string; email?: string; picture?: { data?: { url?: string } } };
  if (!m.id || m.id !== d.data.user_id) throw new Error('user mismatch');
  return { id: m.id, name: String(m.first_name ?? m.name ?? '').slice(0, 40), email: m.email ? m.email.toLowerCase() : null, picture: m.picture?.data?.url?.slice(0, 500) ?? null };
}

// ---------- Telegram ----------
// Login Widget: hash = HMAC_SHA256(data_check_string, SHA256(bot_token)).
// Mini App (Telegram ichida): hash = HMAC_SHA256(data_check_string, HMAC_SHA256(bot_token, "WebAppData")).

export function verifyTelegramLogin(data: Record<string, unknown>, botToken: string, now = Date.now()): { id: string; name: string; avatar: string | null } {
  const hash = String(data.hash ?? '');
  const fields = Object.entries(data)
    .filter(([k, v]) => k !== 'hash' && v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');
  const secret = createHash('sha256').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(fields).digest('hex');
  if (!hash || !safeEqualHex(hash, expected)) throw new Error('bad hash');
  if (now / 1000 - Number(data.auth_date) > 86400) throw new Error('expired');
  return { id: String(data.id), name: String(data.first_name ?? data.username ?? '').slice(0, 40), avatar: typeof data.photo_url === 'string' ? data.photo_url.slice(0, 500) : null };
}

export function verifyTelegramWebApp(initData: string, botToken: string, now = Date.now()): { id: string; name: string; avatar: string | null } {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash') ?? '';
  params.delete('hash');
  const check = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(check).digest('hex');
  if (!hash || !safeEqualHex(hash, expected)) throw new Error('bad hash');
  if (now / 1000 - Number(params.get('auth_date')) > 86400) throw new Error('expired');
  const user = JSON.parse(params.get('user') ?? '{}') as { id?: number; first_name?: string; username?: string; photo_url?: string };
  if (!user.id) throw new Error('no user');
  return { id: String(user.id), name: String(user.first_name ?? user.username ?? '').slice(0, 40), avatar: user.photo_url?.slice(0, 500) ?? null };
}

function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

// ---------- Progress ----------

const MAX_STATE = 400 * 1024;

export function getProgress(userId: string): { state: unknown; updatedAt: number } | null {
  const r = db().prepare('SELECT state, updated_at FROM progress WHERE user_id = ?').get(userId) as { state: string; updated_at: number } | undefined;
  return r ? { state: JSON.parse(r.state), updatedAt: r.updated_at } : null;
}

/** Oxirgi yozuv yutadi: mijoz yuborgan updatedAt serverdagidan eski bo'lsa — rad etiladi (409). */
export function putProgress(userId: string, state: unknown, updatedAt: unknown): { ok: true; updatedAt: number } | { ok: false; status: number; message: string; server?: unknown } {
  if (typeof state !== 'object' || state === null || Array.isArray(state)) return { ok: false, status: 400, message: "Progress noto'g'ri" };
  const json = JSON.stringify(state);
  if (json.length > MAX_STATE) return { ok: false, status: 413, message: 'Progress juda katta' };
  const ts = typeof updatedAt === 'number' && Number.isFinite(updatedAt) ? Math.min(updatedAt, Date.now() + 60_000) : Date.now();
  const cur = getProgress(userId);
  if (cur && cur.updatedAt > ts) return { ok: false, status: 409, message: 'Serverda yangiroq progress bor', server: cur };
  db().prepare('INSERT INTO progress (user_id, state, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at').run(userId, json, ts);
  return { ok: true, updatedAt: ts };
}

/** Bot ID — tokenning ':' gacha bo'lgan raqamli qismi (Telegram uni ochiq ko'rsatadi); sir qismi hech qachon yuborilmaydi. */
export function telegramBotId(token: string | undefined): number | null {
  const m = /^(\d{5,15}):[A-Za-z0-9_-]{20,}$/.exec((token ?? '').trim());
  return m ? Number(m[1]) : null;
}
