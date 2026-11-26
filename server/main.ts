// Voilà! serves dist/ and keeps AI routes disabled until provider and shared-quota readiness are verified.
// AI credentials are server-only; no legacy provider fallback routes are registered.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { telegramBotId } from './accounts.ts';
import { clearCookie, createSessionToken, currentAiSubject, currentUserId, deleteUser, getProgress, getUser, login, putProgress, register, sessionCookie, upsertGoogleUser, verifyGoogleIdToken, upsertSocialUser, verifyAppleIdToken, verifyFacebookToken, verifyTelegramLogin, verifyTelegramWebApp } from './accounts.ts';
import { activePlan, click, createCardOrder, createOrder, decideOrder, isAdmin, orderStatus, receiptOf, receiptOwner, reviewOrders, payme, paymeAuthError, paymeAuthorized, paymeInternalError, plansPayload } from './billing.ts';
import { bot, botUsername, createLinkCode, startBot } from './bot.ts';
import { decideReview, myReview, pendingReviews, publicReviews, recentPurchases, stats, submitReview } from './social.ts';
import { aiConfigProblems, loadAiRuntimeConfig } from './ai-config.ts';
import { AI_CONSENT_POLICY_VERSION, AI_PROVIDER_MODE, aiConsentRequirements, deleteAiMemory, getAiConsent, grantAiConsent, hasAiConsent, revokeAiConsent, sanitizeTutorBodyForMemoryConsent } from './ai-consent.ts';
import { createAiConsentRoutes, createAiRoutes, deriveTrustedExternalOrigin, effectiveAiRouteReady, enabledAiRoutes, strictRequestOriginAllowed } from './ai-routes.ts';
import { abortAiUsage, applyFreshKillSwitchFromEnv, isAiQuotaKillSwitchActive, isAiQuotaStorageReady, reserveAiUsage, settleAiUsage } from './ai-quota.ts';
import { createAiRouteOperations } from './ai-route-operations.ts';
import { createGoogleCloudProvider } from './google-cloud-provider.ts';
import { createGoogleAdcTokenSource } from './google-auth.ts';
import { createProviderCall, geminiApiProviderConfigFromEnv, googleProviderConfigFromEnv } from './ai-runtime.ts';
import { createGeminiApiProvider } from './gemini-api-provider.ts';
import { createAiKeyAlerter } from './ai-alerts.ts';
import { createLiveTokenRoute, mintGeminiLiveToken } from './live-route.ts';
import { liveInstruction, parseTutorRequest } from './tutor.ts';
import { registerClientLogRoute, type RouteTable } from './client-log.ts';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const env = process.env;
const AI_RUNTIME_CONFIG = loadAiRuntimeConfig(env);
const AI_CONFIG_PROBLEMS = aiConfigProblems(env);
const num = (k: string, d: number) => (Number(env[k]) > 0 ? Number(env[k]) : d);
const PORT = num('PORT', 8787);
const TRUST_PROXY = env.TRUST_PROXY === '1';
const SESSION_MIN = num('VOICE_SESSION_MINUTES', 10);
const COOLDOWN_MIN = num('VOICE_COOLDOWN_MINUTES', 20);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// ---------- Xotiradagi limitlar (har bir yo'nalish uchun alohida) ----------
interface Bucket {
  perMinute: number;
  perDay: number;
}
const BUCKETS: Record<string, Bucket> = {
  feedback: { perMinute: 4, perDay: num('FEEDBACK_PER_DAY', 40) },
  reward: { perMinute: 6, perDay: 40 },
  auth: { perMinute: 10, perDay: 200 },
  billing: { perMinute: 10, perDay: 100 },
  live: { perMinute: 4, perDay: num('LIVE_TOKENS_PER_DAY', 40) },
};
const hits = new Map<string, number[]>();
const daily = new Map<string, { day: string; n: number }>();

function clientIp(req: IncomingMessage): string {
  // Proksi (Railway) haqiqiy IP'ni ro'yxat OXIRIGA qo'shadi; birinchi qiymatni mijoz o'zi yozishi mumkin (soxtalashtirish).
  const fwd = TRUST_PROXY ? String(req.headers['x-forwarded-for'] ?? '').split(',').map((x) => x.trim()).filter(Boolean).pop() ?? '' : '';
  return fwd || req.socket.remoteAddress || 'unknown';
}

function take(bucket: string, ip: string, amount = 1, dayLimit?: number): string | null {
  const b = BUCKETS[bucket];
  const now = Date.now();
  const k = `${bucket}:${ip}`;
  const recent = (hits.get(k) ?? []).filter((t) => now - t < 60_000);
  // Belgilar kvotasi (dayLimit) daqiqalik hisobga qo'shilmaydi.
  if (!dayLimit && recent.length >= b.perMinute) return 'Juda tez — bir daqiqa nafas oling, keyin davom etamiz.';
  const today = new Date().toISOString().slice(0, 10);
  const dk = `${bucket}${dayLimit ? ':chars' : ''}:${ip}`;
  const d = daily.get(dk);
  const n = d && d.day === today ? d.n : 0;
  if (n + amount > (dayLimit ?? b.perDay)) return 'Bugungi limit tugadi. Ertaga davom etamiz — darslar esa ishlayveradi!';
  if (!dayLimit) {
    recent.push(now);
    hits.set(k, recent);
  }
  daily.set(dk, { day: today, n: n + amount });
  return null;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (!v.some((t) => now - t < 60_000)) hits.delete(k);
}, 120_000).unref();

// ---------- Yordamchilar ----------
function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage, max = 64 * 1024): Promise<unknown> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > max) throw Object.assign(new Error('too large'), { code: 'too_large' });
    chunks.push(c as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function originOk(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin || !req.headers.host) return true;
  try {
    return new URL(origin).host === req.headers.host || (env.ALLOWED_ORIGINS ?? '').split(',').includes(origin);
  } catch {
    return false;
  }
}

const AI_ALLOWED_ORIGINS = (env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
const aiTrustedOrigin = (req: IncomingMessage) => deriveTrustedExternalOrigin(req, {
  publicOrigin: env.PUBLIC_ORIGIN,
  trustProxy: TRUST_PROXY,
});
const aiRequestOriginAllowed = (req: IncomingMessage) =>
  strictRequestOriginAllowed(req, AI_ALLOWED_ORIGINS, aiTrustedOrigin(req));

const SECURITY: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'microphone=(self), camera=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
  'cross-origin-opener-policy': 'same-origin-allow-popups',
  'x-permitted-cross-domain-policies': 'none',
};

// Kontent xavfsizlik siyosati (CSP): faqat ruxsat etilgan manbalardan skript/ulanish; ichki skriptlar — xesh bilan.
const CSP_BASE = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self' https://checkout.paycom.uz https://checkout.test.paycom.uz https://my.click.uz",
  // Telegram Mini App (web.telegram.org) ichida ochilishi mumkin, boshqa saytlar iframe'ga ololmaydi.
  "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "connect-src 'self' https://*.wikipedia.org https://*.wikimedia.org https://accounts.google.com https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://telegram.org https://oauth.telegram.org",
  "frame-src 'self' https://accounts.google.com https://oauth.telegram.org https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://www.facebook.com https://appleid.apple.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
];
const SCRIPT_HOSTS = "https://accounts.google.com https://apis.google.com https://telegram.org https://oauth.telegram.org https://connect.facebook.net https://appleid.cdn-apple.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.gstatic.com https://*.doubleclick.net https://*.adtrafficquality.google";
const cspCache = new Map<string, string>();
function cspFor(html: string): string {
  const hit = cspCache.get(html);
  if (hit) return hit;
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
  const csp = [...CSP_BASE, `script-src 'self' ${hashes.join(' ')} ${SCRIPT_HOSTS}`].join('; ');
  cspCache.set(html, csp);
  return csp;
}

// ---------- Bepul foydalanuvchilar uchun kunlik limit ----------
// Super obunachilarda cheklov yo'q. Hisob bo'lsa — foydalanuvchi bo'yicha, mehmonlarda — IP bo'yicha.
const FREE_MSGS = num('FREE_MESSAGES_PER_DAY', 30);
const FREE_VOICE_MIN = num('FREE_VOICE_MINUTES', 5);
const dailyUse = new Map<string, { day: string; n: number }>();
const tashkentDay = () => new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
const minutesToTashkentMidnight = () => {
  const t = new Date(Date.now() + 5 * 3600_000);
  return Math.max(1, 24 * 60 - (t.getUTCHours() * 60 + t.getUTCMinutes()));
};
function quotaKey(req: IncomingMessage) {
  const uid = currentUserId(req);
  return uid ? `u:${uid}` : `ip:${clientIp(req)}`;
}
const isPremium = (req: IncomingMessage) => activePlan(currentUserId(req)).plan !== 'free';
/** Bugun qolgan bepul xabarlar (Super — null, ya'ni cheklovsiz). */
function freeLeft(req: IncomingMessage): number | null {
  if (isPremium(req)) return null;
  const r = dailyUse.get(quotaKey(req));
  return Math.max(0, FREE_MSGS - (r && r.day === tashkentDay() ? r.n : 0));
}
// Reklama ko'rib olingan qo'shimcha daqiqalar (kuniga REWARD_VIVI_PER_DAY marta, har biri REWARD_VIVI_MIN daqiqa).
const REWARD_VIVI_MIN = num('REWARD_VIVI_MINUTES', 2);
const REWARD_VIVI_PER_DAY = num('REWARD_VIVI_PER_DAY', 3);
const adBonus = new Map<string, { day: string; claims: number }>();
const rewardNonces = new Map<string, { key: string; at: number }>();
const REWARD_MIN_WATCH_MS = num('REWARD_MIN_WATCH_SECONDS', 15) * 1000;
function bonusMin(req: IncomingMessage): number {
  const r = adBonus.get(quotaKey(req));
  return r && r.day === tashkentDay() ? r.claims * REWARD_VIVI_MIN : 0;
}
// Jonli rejim (Gemini Live) uchun alohida kunlik bepul vaqt: birinchi sessiya boshlangan paytdan hisoblanadi.
const FREE_LIVE_MIN = num('FREE_LIVE_MINUTES', 10);
const liveUse = new Map<string, { day: string; start: number }>();
function liveMinutesLeft(req: IncomingMessage): number {
  const r = liveUse.get(quotaKey(req));
  if (!r || r.day !== tashkentDay()) return FREE_LIVE_MIN + bonusMin(req);
  return Math.max(0, Math.floor(FREE_LIVE_MIN + bonusMin(req) - (Date.now() - r.start) / 60_000));
}
function markLiveStarted(req: IncomingMessage) {
  const k = quotaKey(req);
  const day = tashkentDay();
  const r = liveUse.get(k);
  if (!r || r.day !== day) liveUse.set(k, { day, start: Date.now() });
  if (liveUse.size > 50_000) for (const [key, v] of liveUse) if (v.day !== day) liveUse.delete(key);
}
function bonusClaimsLeft(req: IncomingMessage): number {
  const r = adBonus.get(quotaKey(req));
  return Math.max(0, REWARD_VIVI_PER_DAY - (r && r.day === tashkentDay() ? r.claims : 0));
}

/** Yangi chek haqida admin Telegram'iga xabar (TELEGRAM_BOT_TOKEN + ADMIN_TELEGRAM_CHAT_ID bo'lsa). */
async function notifyAdmin(text: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.ADMIN_TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.ADMIN_TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    /* xabar yetmasa ham to'lov qabul qilinadi */
  }
}

// ---------- Yo'nalishlar ----------
const googleClientIds = () => (env.GOOGLE_CLIENT_ID ?? '').split(',').map((v) => v.trim()).filter(Boolean);
const isSecure = (req: IncomingMessage) =>
  (TRUST_PROXY && String(req.headers['x-forwarded-proto'] ?? '').startsWith('https')) || (env.PUBLIC_ORIGIN ?? '').startsWith('https://');
const publicOrigin = (req: IncomingMessage) => env.PUBLIC_ORIGIN || `${isSecure(req) ? 'https' : 'http'}://${req.headers.host ?? 'localhost'}`;

type AuthOut = { ok: true; user: NonNullable<ReturnType<typeof getUser>> } | { ok: false; status: number; message: string };
async function authRoute(req: IncomingMessage, res: ServerResponse, fn: (b: Record<string, unknown>) => AuthOut | Promise<AuthOut>) {
  if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
  const limited = take('auth', clientIp(req));
  if (limited) return json(res, 429, { message: limited });
  let body: Record<string, unknown>;
  try {
    body = (await readBody(req, 16 * 1024)) as Record<string, unknown>;
  } catch {
    return json(res, 400, { message: "So'rov noto'g'ri" });
  }
  const r = await fn(body ?? {});
  if (!r.ok) return json(res, r.status, { message: r.message });
  const token = createSessionToken(r.user.id);
  res.setHeader('set-cookie', sessionCookie(token, isSecure(req)));
  const sub = activePlan(r.user.id);
  // token — Android ilova uchun (cookie bilan birga Authorization: Bearer ham qabul qilinadi).
  json(res, 200, { user: r.user, plan: sub.plan, expiresAt: sub.expiresAt, token });
}

async function clickRoute(req: IncomingMessage, res: ServerResponse, action: 0 | 1) {
  let raw = '';
  for await (const c of req) {
    raw += c;
    if (raw.length > 16 * 1024) return json(res, 413, { error: -8, error_note: 'Too large' });
  }
  const body = Object.fromEntries(new URLSearchParams(raw)) as Record<string, string>;
  try {
    json(res, 200, click(body, action));
  } catch (e) {
    console.error('click', e);
    json(res, 200, { error: -7, error_note: 'Failed to update order' });
  }
}

const routeHandlers: RouteTable = Object.freeze(registerClientLogRoute({
  // Reklama boshlanishidan oldin: bir martalik chipta (kamida 15 s o'tgach, faqat shu foydalanuvchi ishlatadi).
  'POST /api/reward/start': (req, res) => {
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const limited = take('reward', clientIp(req));
    if (limited) return json(res, 429, { message: limited });
    const nonce = randomBytes(18).toString('base64url');
    rewardNonces.set(nonce, { key: quotaKey(req), at: Date.now() });
    if (rewardNonces.size > 20_000) for (const [k, v] of rewardNonces) if (Date.now() - v.at > 15 * 60_000) rewardNonces.delete(k);
    json(res, 200, { nonce });
  },

  // Reklama (rewarded video) oxirigacha ko'rilgach: Vivi bilan qo'shimcha daqiqalar.
  'POST /api/reward/vivi': async (req, res) => {
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const limited = take('reward', clientIp(req));
    if (limited) return json(res, 429, { message: limited });
    const nb = (await readBody(req, 1024).catch(() => ({}))) as { nonce?: unknown };
    const n = typeof nb.nonce === 'string' ? rewardNonces.get(nb.nonce) : undefined;
    if (typeof nb.nonce === 'string') rewardNonces.delete(nb.nonce);
    const age = n ? Date.now() - n.at : -1;
    if (!n || n.key !== quotaKey(req) || age < REWARD_MIN_WATCH_MS || age > 10 * 60_000) return json(res, 403, { code: 'reward_invalid', message: "Reklama oxirigacha ko'rilmadi" });
    if (bonusClaimsLeft(req) <= 0) return json(res, 429, { code: 'limit', message: "Bugungi reklama mukofotlari tugadi — ertaga yana ko'ring" });
    const k = quotaKey(req);
    const day = tashkentDay();
    const r = adBonus.get(k);
    adBonus.set(k, { day, claims: (r && r.day === day ? r.claims : 0) + 1 });
    json(res, 200, { ok: true, minutes: REWARD_VIVI_MIN, left: bonusClaimsLeft(req) });
  },

  // ---------- Ijtimoiy isbot (faqat haqiqiy ma'lumot) ----------
  'GET /api/social': (_req, res) => {
    const st = stats();
    const support = (env.SUPPORT_TELEGRAM ?? '').replace(/^@/, '').trim() || botUsername() || '';
    res.setHeader('cache-control', 'public, max-age=60');
    json(res, 200, { ...publicReviews(), recent: recentPurchases(), users: st.users, supers: st.supers, support: /^[A-Za-z0-9_]{4,32}$/.test(support) ? support : null });
  },

  'GET /api/reviews/mine': (req, res) => {
    const uid = currentUserId(req);
    json(res, 200, { review: uid ? myReview(uid) : null });
  },

  'POST /api/reviews': async (req, res) => {
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: 'Izoh qoldirish uchun hisobga kiring' });
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const limited = take('billing', clientIp(req));
    if (limited) return json(res, 429, { message: limited });
    const b = (await readBody(req, 4096).catch(() => ({}))) as { rating?: unknown; text?: unknown };
    const r = submitReview(uid, b.rating, b.text);
    if (!r.ok) return json(res, r.status, { message: r.message });
    void bot()?.notifyReview(r.id, Number(b.rating), String(b.text ?? '').slice(0, 400), getUser(uid)?.name ?? '');
    json(res, 200, { ok: true, status: 'pending' });
  },

  'GET /api/admin/reviews': (req, res) => {
    const uid = currentUserId(req);
    if (!uid || !isAdmin(uid)) return json(res, 403, { message: "Ruxsat yo'q" });
    json(res, 200, { reviews: pendingReviews() });
  },

  'POST /api/admin/review': async (req, res) => {
    const uid = currentUserId(req);
    if (!uid || !isAdmin(uid)) return json(res, 403, { message: "Ruxsat yo'q" });
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const b = (await readBody(req).catch(() => ({}))) as { id?: unknown; action?: unknown };
    const ok = decideReview(Number(b.id), b.action === 'approve');
    console.log('audit', JSON.stringify({ at: new Date().toISOString(), admin: uid, review: Number(b.id), action: b.action === 'approve' ? 'approve' : 'reject', ok }));
    json(res, ok ? 200 : 409, { ok });
  },

  'GET /api/health': (_q, res) => {
    const ai = aiRoutesEffectivelyReady();
    json(res, 200, {
      ok: true,
      ai,
      model: ai ? AI_RUNTIME_CONFIG.model : null,
      exhausted: [],
      // Names only (never values) of what keeps Vivi AI closed, for hosts without log access.
      ...(ai ? {} : { aiProblems: [
        ...AI_CONFIG_PROBLEMS,
        ...(isAiQuotaStorageReady() ? [] : ['VIVI_AI_QUOTA_STORE_SHARED_DURABLE_VERIFIED (yoki baza)']),
        ...(isAiQuotaKillSwitchActive() && !AI_CONFIG_PROBLEMS.includes('VIVI_AI_KILL_SWITCH') ? ['bazadagi kill switch (npm run ai:on)'] : []),
      ] }),
    });
  },

  'GET /api/voice/config': (req, res) => {
    const premium = isPremium(req);
    const aiReady = aiRoutesEffectivelyReady();
    // Voice is advertised only when the matching Google service was explicitly verified by the operator.
    // Gemini API mode transcribes and speaks with the same key; Vertex needs each service verified.
    const sttReady = aiReady && (AI_PROVIDER_MODE === 'gemini-api' || process.env.VIVI_STT_VERIFIED === 'true');
    const ttsReady = aiReady && (AI_PROVIDER_MODE === 'gemini-api' || process.env.VIVI_TTS_VERIFIED === 'true');
    json(res, 200, {
      ai: aiReady,
      aiProvider: aiReady ? AI_RUNTIME_CONFIG.provider : null,
      stt: sttReady,
      sttProvider: sttReady ? (AI_PROVIDER_MODE === 'gemini-api' ? 'google-gemini-api' : 'google-cloud-speech-to-text') : null,
      // 'elevenlabs' is the client's name for the server-audio engine; the server speaks via Gemini TTS.
      tts: ttsReady ? 'elevenlabs' : 'text',
      ttsTier: ttsReady ? 'gemini' : 'text',
      ttsProvider: ttsReady ? (AI_PROVIDER_MODE === 'gemini-api' ? 'google-gemini-api' : 'google-agent-platform') : null,
      audioTags: false,
      voices: ttsReady ? [{ name: 'Vivi', id: GOOGLE_TTS_VOICE }] : [],
      sessionMinutes: premium ? Math.max(SESSION_MIN, num('VOICE_SESSION_MINUTES_SUPER', 30)) : Math.min(SESSION_MIN, FREE_VOICE_MIN) + bonusMin(req),
      rewardMinutes: REWARD_VIVI_MIN,
      rewardsLeft: premium ? 0 : bonusClaimsLeft(req),
      cooldownMinutes: premium ? 0 : Math.max(COOLDOWN_MIN, minutesToTashkentMidnight()),
      messagesLeft: freeLeft(req),
      live: liveReady(),
      liveMinutes: liveReady() ? (premium ? Math.max(SESSION_MIN, num('VOICE_SESSION_MINUTES_SUPER', 30)) : liveMinutesLeft(req)) : 0,
      messagesPerDay: premium ? null : FREE_MSGS,
      premium,
      superRequired: superOnly() && !superAllowed(req),
    });
  },

  'GET /api/me': (req, res) => {
    const uid = currentUserId(req);
    const user = uid ? getUser(uid) : null;
    const sub = activePlan(user?.id ?? null);
    json(res, 200, { user, plan: sub.plan, expiresAt: sub.expiresAt, googleClientId: googleClientIds()[0] ?? null,
      // Boshqa kirish usullari: faqat sozlanganlari mijozga ko'rinadi (maxfiy kalitlar yuborilmaydi).
      auth: {
        appleClientId: (env.APPLE_CLIENT_ID ?? '').split(',')[0]?.trim() || null,
        facebookAppId: env.FACEBOOK_APP_SECRET ? env.FACEBOOK_APP_ID || null : null,
        telegramBot: env.TELEGRAM_BOT_TOKEN ? botUsername() || env.TELEGRAM_BOT_USERNAME || null : null,
        // Botning ochiq raqamli ID'si (token ':' dan oldingi qismi) — maxfiy emas; Telegram.Login.auth uchun kerak.
        telegramBotId: telegramBotId(env.TELEGRAM_BOT_TOKEN),
      },
      admin: user ? isAdmin(user.id) : false,
      billing: { ...plansPayload(), telegram: !!botUsername() && plansPayload().providers.includes('card') } });
  },

  'POST /api/auth/register': (req, res) =>
    authRoute(req, res, (b) => register(b.email, b.password, b.name)),

  'POST /api/auth/login': (req, res) => authRoute(req, res, (b) => login(b.email, b.password)),

  'POST /api/auth/google': (req, res) =>
    authRoute(req, res, async (b) => {
      const ids = googleClientIds();
      if (!ids.length) return { ok: false, status: 503, message: 'Google bilan kirish sozlanmagan' } as const;
      try {
        const p = await verifyGoogleIdToken(String(b.credential ?? ''), ids);
        return { ok: true, user: upsertGoogleUser(p.sub, p.email, p.name, p.picture) } as const;
      } catch {
        return { ok: false, status: 401, message: "Google tokeni tasdiqlanmadi — qayta urinib ko'ring" } as const;
      }
    }),

  'POST /api/auth/apple': (req, res) =>
    authRoute(req, res, async (b) => {
      const ids = (env.APPLE_CLIENT_ID ?? '').split(',').map((v) => v.trim()).filter(Boolean);
      if (!ids.length) return { ok: false, status: 503, message: 'Apple bilan kirish sozlanmagan' } as const;
      try {
        const p = await verifyAppleIdToken(String(b.idToken ?? ''), ids);
        // Apple ismni faqat birinchi kirishda (mijozga) beradi.
        const name = typeof b.name === 'string' ? b.name.slice(0, 40) : '';
        return { ok: true, user: upsertSocialUser('apple', p.sub, p.email, name, null) } as const;
      } catch {
        return { ok: false, status: 401, message: "Apple tokeni tasdiqlanmadi — qayta urinib ko'ring" } as const;
      }
    }),

  'POST /api/auth/facebook': (req, res) =>
    authRoute(req, res, async (b) => {
      if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) return { ok: false, status: 503, message: 'Facebook bilan kirish sozlanmagan' } as const;
      try {
        const p = await verifyFacebookToken(String(b.accessToken ?? ''), env.FACEBOOK_APP_ID, env.FACEBOOK_APP_SECRET);
        return { ok: true, user: upsertSocialUser('facebook', p.id, p.email, p.name, p.picture) } as const;
      } catch {
        return { ok: false, status: 401, message: "Facebook orqali kirib bo'lmadi — qayta urinib ko'ring" } as const;
      }
    }),

  'POST /api/auth/telegram': (req, res) =>
    authRoute(req, res, async (b) => {
      if (!env.TELEGRAM_BOT_TOKEN) return { ok: false, status: 503, message: 'Telegram bilan kirish sozlanmagan' } as const;
      try {
        const p = typeof b.initData === 'string' ? verifyTelegramWebApp(b.initData, env.TELEGRAM_BOT_TOKEN) : verifyTelegramLogin((b.data ?? {}) as Record<string, unknown>, env.TELEGRAM_BOT_TOKEN);
        return { ok: true, user: upsertSocialUser('telegram', p.id, null, p.name, p.avatar) } as const;
      } catch {
        return { ok: false, status: 401, message: "Telegram ma'lumoti tasdiqlanmadi — qayta urinib ko'ring" } as const;
      }
    }),

  'POST /api/auth/logout': (req, res) => {
    res.setHeader('set-cookie', clearCookie(isSecure(req)));
    json(res, 200, { ok: true });
  },

  'DELETE /api/account': (req, res) => {
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: 'Kirilmagan' });
    deleteUser(uid);
    res.setHeader('set-cookie', clearCookie(isSecure(req)));
    json(res, 200, { ok: true });
  },

  'GET /api/progress': (req, res) => {
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: 'Kirilmagan' });
    json(res, 200, getProgress(uid) ?? { state: null, updatedAt: 0 });
  },

  'PUT /api/progress': async (req, res) => {
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: 'Kirilmagan' });
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    let body: { state?: unknown; updatedAt?: unknown };
    try {
      body = (await readBody(req, 512 * 1024)) as typeof body;
    } catch {
      return json(res, 413, { message: 'Progress juda katta' });
    }
    const r = putProgress(uid, body.state, body.updatedAt);
    json(res, r.ok ? 200 : r.status, r);
  },

  // ---------- Obuna va to'lovlar ----------
  'POST /api/billing/order': async (req, res) => {
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: "Obuna uchun avval hisobga kiring" });
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const limited = take('billing', clientIp(req));
    if (limited) return json(res, 429, { message: limited });
    const b = (await readBody(req).catch(() => ({}))) as { plan?: unknown; provider?: unknown };
    const r = createOrder(uid, b.plan, b.provider, publicOrigin(req));
    if ('error' in r) return json(res, (r as { status: number }).status, { message: r.error });
    json(res, 200, r);
  },

  // Karta orqali to'lov: chek yuklanadi, admin tasdiqlaydi.
  'POST /api/billing/card': async (req, res) => {
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: 'Obuna uchun avval hisobga kiring' });
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const limited = take('billing', clientIp(req));
    if (limited) return json(res, 429, { message: limited });
    const b = (await readBody(req, 4_500_000).catch(() => ({}))) as { plan?: unknown; receipt?: unknown; kind?: unknown };
    const r = createCardOrder(uid, b.plan, b.receipt, b.kind === 'visa' ? 'visa' : 'card');
    if ('error' in r) return json(res, (r as { status: number }).status, { message: r.error });
    const b2 = bot();
    if (b2) void b2.notifyReceipt(r.id, r.plan, r.amountUzs, `${getUser(uid)?.name ?? ''} · ${getUser(uid)?.email ?? uid} (ilova)`, b.receipt as string);
    else void notifyAdmin(`🧾 Yangi chek: #${r.id} · ${r.plan} · ${r.amountUzs.toLocaleString('ru-RU')} so'm · ${getUser(uid)?.email ?? uid}\n${publicOrigin(req)}/#/admin`);
    json(res, 200, r);
  },

  'GET /api/admin/orders': (req, res) => {
    const uid = currentUserId(req);
    if (!uid || !isAdmin(uid)) return json(res, 403, { message: "Ruxsat yo'q" });
    const status = new URL(req.url ?? '/', 'http://x').searchParams.get('status') || 'review';
    json(res, 200, { orders: reviewOrders(['review', 'paid', 'rejected'].includes(status) ? status : 'review') });
  },

  'GET /api/admin/receipt': (req, res) => {
    const uid = currentUserId(req);
    if (!uid || !isAdmin(uid)) return json(res, 403, { message: "Ruxsat yo'q" });
    const data = receiptOf(Number(new URL(req.url ?? '/', 'http://x').searchParams.get('id')));
    const m = data && /^data:([^;]+);base64,(.*)$/.exec(data);
    if (!m) return json(res, 404, { message: 'Chek topilmadi' });
    // Chek fayli alohida «qum qutisi»da ochiladi — ichida skript bo'lsa ham ishlamaydi.
    res.writeHead(200, { 'content-type': m[1], 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'content-security-policy': "sandbox; default-src 'none'; img-src data:; style-src 'unsafe-inline'", 'content-disposition': 'inline' });
    res.end(Buffer.from(m[2], 'base64'));
  },

  'POST /api/admin/order': async (req, res) => {
    const uid = currentUserId(req);
    if (!uid || !isAdmin(uid)) return json(res, 403, { message: "Ruxsat yo'q" });
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const b = (await readBody(req).catch(() => ({}))) as { id?: unknown; action?: unknown };
    const orderUser = (receiptOwner(Number(b.id)));
    const ok = decideOrder(Number(b.id), b.action === 'approve');
    console.log('audit', JSON.stringify({ at: new Date().toISOString(), admin: uid, order: Number(b.id), action: b.action === 'approve' ? 'approve' : 'reject', ok }));
    if (!ok) return json(res, 409, { message: "Buyurtma allaqachon ko'rib chiqilgan yoki topilmadi" });
    if (orderUser && b.action !== 'approve') void bot()?.notifyDecision(orderUser, false);
    json(res, 200, { ok: true });
  },

  // Telegram bot orqali to'lash: hisobni bog'laydigan bir martalik havola.
  'POST /api/billing/telegram': (req, res) => {
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: "Avval hisobga kiring" });
    if (!originOk(req)) return json(res, 403, { message: 'Ruxsat etilmagan manba' });
    const name = botUsername();
    if (!name) return json(res, 503, { message: "Telegram bot hali sozlanmagan" });
    json(res, 200, { url: `https://t.me/${name}?start=pay_${createLinkCode(uid)}` });
  },

  'GET /api/billing/order': (req, res) => {
    const uid = currentUserId(req);
    if (!uid) return json(res, 401, { message: 'Kirilmagan' });
    const id = Number(new URL(req.url ?? '/', 'http://x').searchParams.get('id'));
    const status = Number.isSafeInteger(id) ? orderStatus(uid, id) : null;
    if (!status) return json(res, 404, { message: 'Buyurtma topilmadi' });
    const sub = activePlan(uid);
    json(res, 200, { status, plan: sub.plan, expiresAt: sub.expiresAt });
  },

  // Payme va Click webhook'lari: o'z imzosi bilan himoyalangan (cookie/origin talab qilinmaydi).
  'POST /api/billing/payme': async (req, res) => {
    let body: { id?: unknown; method?: unknown; params?: Record<string, unknown> } = {};
    try {
      body = (await readBody(req, 32 * 1024)) as typeof body;
    } catch {
      /* bo'sh */
    }
    const id = body.id ?? null;
    if (!paymeAuthorized(req.headers.authorization)) return json(res, 200, { id, error: paymeAuthError() });
    try {
      json(res, 200, { id, ...payme(String(body.method ?? ''), body.params ?? {}) });
    } catch (e) {
      console.error('payme', e);
      json(res, 200, { id, error: paymeInternalError() });
    }
  },
  'POST /api/billing/click/prepare': (req, res) => clickRoute(req, res, 0),
  'POST /api/billing/click/complete': (req, res) => clickRoute(req, res, 1),
}, {
  isRateLimited: (req) => Boolean(take('feedback', clientIp(req))),
  readBody,
  respond: json,
}));

// The Google transport (server-only ADC), quota reservation middleware and route operations are installed.
// Routes still stay closed until the operator config (VIVI_AI_*), shared durable quota store attestation and
// kill switch all pass — see `.env.example`.
const AI_QUOTA_RESERVATION_MIDDLEWARE_READY = true;
if (applyFreshKillSwitchFromEnv(process.env)) console.log("AI: yangi bazada kill switch VIVI_AI_KILL_SWITCH=off bo'yicha o'chirildi.");
const AI_ROUTE_OPERATIONS_READY = true;
const GOOGLE_PROVIDER_CONFIG = googleProviderConfigFromEnv(process.env);
const GOOGLE_TTS_VOICE = AI_PROVIDER_MODE === 'gemini-api'
  ? geminiApiProviderConfigFromEnv(process.env).voice
  : GOOGLE_PROVIDER_CONFIG.textToSpeech?.voice ?? 'Leda';
// VIVI_AI_PROVIDER=google-gemini-api → no-cost Gemini Developer API (AI Studio key); otherwise billed Vertex.
const googleProvider = AI_PROVIDER_MODE === 'gemini-api'
  ? createGeminiApiProvider({
    ...geminiApiProviderConfigFromEnv(process.env),
    // Limit reached / key rejected → Telegram message to ADMIN_TELEGRAM_CHAT_ID (or admin accounts linked to the bot).
    onKeyProblem: createAiKeyAlerter((html) => bot()?.notifyAdmins(html)),
  }, fetch)
  : createGoogleCloudProvider(GOOGLE_PROVIDER_CONFIG, {
    auth: createGoogleAdcTokenSource(),
    fetchImpl: fetch,
  });
function aiRoutesEffectivelyReady(): boolean {
  return effectiveAiRouteReady({
    providerReady: AI_RUNTIME_CONFIG.providerEnabled,
    quotaMiddlewareReady: AI_QUOTA_RESERVATION_MIDDLEWARE_READY,
    sharedDurableStoreReady: isAiQuotaStorageReady(),
    operationsReady: AI_ROUTE_OPERATIONS_READY,
    killSwitchActive: isAiQuotaKillSwitchActive(),
  });
}
const aiRouteOperations = createAiRouteOperations({ geminiAudioHints: AI_PROVIDER_MODE === 'gemini-api' });
const aiRouteHandlers = createAiRoutes({
  policyVersion: AI_CONSENT_POLICY_VERSION,
  subject: currentAiSubject,
  hasConsent: (subject, requirement) => hasAiConsent(subject, requirement.scope, requirement.provider),
  configReady: () => AI_RUNTIME_CONFIG.providerEnabled,
  killSwitchActive: isAiQuotaKillSwitchActive,
  requestOriginAllowed: aiRequestOriginAllowed,
  sanitizeBody: (route, subject, body) => route === 'POST /api/tutor'
    ? sanitizeTutorBodyForMemoryConsent(subject, body)
    : body,
  deadlineMs: num('VIVI_AI_ROUTE_DEADLINE_MS', 30_000),
  cancellationGraceMs: num('VIVI_AI_CANCEL_GRACE_MS', 1_000),
  readBody,
  respond: json,
  quota: { reserveAiUsage, settleAiUsage, abortAiUsage },
  requestId: () => randomBytes(18).toString('base64url'),
  operations: aiRouteOperations,
  providerCall: createProviderCall(googleProvider),
});
const consentRouteHandlers = createAiConsentRoutes({
  policyVersion: AI_CONSENT_POLICY_VERSION,
  subject: currentAiSubject,
  getConsent: getAiConsent,
  grantConsent: grantAiConsent,
  requirements: aiConsentRequirements,
  revokeConsent: revokeAiConsent,
  deleteMemory: deleteAiMemory,
  readBody,
  respond: json,
  allowedOrigins: AI_ALLOWED_ORIGINS,
  trustedOrigin: aiTrustedOrigin,
});
const gatedAiRoutes = enabledAiRoutes(aiRouteHandlers, {
  providerEnabled: aiRoutesEffectivelyReady(),
  quotaReservationReady: AI_QUOTA_RESERVATION_MIDDLEWARE_READY,
});
// Gemini Live: faqat bepul Gemini API rejimida, AI to'liq yoqilganda va LIVE_DISABLED=1 bo'lmaganda.
const LIVE_MODEL = env.GEMINI_LIVE_MODEL || 'gemini-3.8-live';
// Kalit faqat AI sozlamalari modulidan olinadi (main.ts o'zi provayder kalitlarini o'qimaydi).
const LIVE_API_KEY = geminiApiProviderConfigFromEnv(process.env).apiKey ?? '';
function liveReady(): boolean {
  return AI_PROVIDER_MODE === 'gemini-api' && env.LIVE_DISABLED !== '1' && !!LIVE_API_KEY && aiRoutesEffectivelyReady();
}
const liveTokenRoute = createLiveTokenRoute({
  enabled: liveReady,
  originAllowed: aiRequestOriginAllowed,
  subject: currentAiSubject,
  hasConsent: (subject) => hasAiConsent(subject, 'live_session', 'google-gemini-api'),
  killSwitchActive: isAiQuotaKillSwitchActive,
  rateLimited: (req) => take('live', clientIp(req)),
  premium: isPremium,
  minutesLeft: liveMinutesLeft,
  markStarted: markLiveStarted,
  premiumMinutes: Math.max(SESSION_MIN, num('VOICE_SESSION_MINUTES_SUPER', 30)),
  readBody,
  instruction: (subject, body) => {
    const raw = (body ?? {}) as Record<string, unknown>;
    const parsed = parseTutorRequest(sanitizeTutorBodyForMemoryConsent(subject, { ...raw, message: typeof raw.message === 'string' && raw.message ? raw.message : 'jonli suhbat', mode: 'voice' }));
    return typeof parsed === 'string' ? { text: parsed } : liveInstruction(parsed);
  },
  mintToken: (minutes, signal) => mintGeminiLiveToken(LIVE_API_KEY, minutes, signal),
  model: LIVE_MODEL,
  voice: GOOGLE_TTS_VOICE,
  respond: json,
});
const routes = Object.freeze({ ...routeHandlers, ...consentRouteHandlers, ...gatedAiRoutes });

// ---------- Statik fayllar ----------
async function serveStatic(req: IncomingMessage, res: ServerResponse) {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  let file = normalize(join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) return json(res, 403, { message: 'forbidden' });
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(ROOT, 'index.html'); // SPA fallback
  }
  try {
    const data = await readFile(file);
    const isHtml = extname(file) === '.html';
    res.writeHead(200, {
      ...SECURITY,
      ...(isHtml ? { 'content-security-policy': cspFor(data.toString('utf8')) } : {}),
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'cache-control': file.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(data);
  } catch {
    json(res, 404, { message: 'topilmadi' });
  }
}

// Vivi AI (suhbat, ovoz, tarjima chiplari, xotira) va Gemini Live — faqat Super obunachilar va adminlar uchun.
// AI_SUPER_ONLY=0 bilan o'chirish mumkin. Darslar AI ishlatmaydi — ular bepul qoladi.
const SUPER_ONLY_ROUTES = new Set([
  'POST /api/tutor', 'POST /api/tutor/feedback', 'POST /api/tutor/memory', 'POST /api/stt', 'POST /api/tts', 'POST /api/translate', 'POST /api/live/token',
]);
const superOnly = () => (process.env.AI_SUPER_ONLY ?? '1').trim() !== '0';
function superAllowed(req: IncomingMessage): boolean {
  const uid = currentUserId(req);
  return isPremium(req) || (!!uid && isAdmin(uid));
}

const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0];
  const routeKey = `${req.method} ${path}`;
  if (SUPER_ONLY_ROUTES.has(routeKey) && superOnly() && !superAllowed(req)) {
    return json(res, 402, { code: 'super_required', message: 'Vivi AI faqat Super obunachilar uchun. Super oling 💎' });
  }
  // Gemini Live: o'z darvozasi bor (rejim/rozilik/limit); shartlar bajarilmasa — token berilmaydi.
  if (routeKey === 'POST /api/live/token') {
    return void liveTokenRoute(req, res).catch(() => {
      if (!res.headersSent) json(res, 500, { message: 'Server xatosi' });
    });
  }
  const route = routes[routeKey];
  if (route) {
    return void Promise.resolve(route(req, res)).catch(() => {
      if (!res.headersSent) json(res, 500, { message: 'Server xatosi' });
    });
  }
  if (path.startsWith('/api/')) return json(res, 404, { message: 'topilmadi' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { message: 'method' });
  void serveStatic(req, res);
});
server.keepAliveTimeout = 65_000;

startBot();
server.listen(PORT, () =>
  console.log(`Voilà! server: http://localhost:${PORT} · AI: ${aiRoutesEffectivelyReady()
    ? `yoqilgan (${AI_PROVIDER_MODE === 'gemini-api' ? 'Gemini API, bepul' : 'Google Cloud Vertex'} · ${AI_RUNTIME_CONFIG.model})`
    : "o'chiq (.env.example va `npm run ai:status` ni tekshiring)"}`),
);
