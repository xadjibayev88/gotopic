// Salut! serveri: dist/ ni tarqatadi va Krua ustozni (matn + ovoz) Gemini / ElevenLabs bilan ulaydi.
// Ishga tushirish: GEMINI_API_KEY=... [ELEVENLABS_API_KEY=... ELEVENLABS_VOICES="Krua:id"] node server/main.ts
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { friendlyError, generateJson, parseTutorRequest, streamTutor } from './tutor.ts';
import { clearCookie, createSessionToken, currentUserId, deleteUser, getProgress, getUser, login, putProgress, register, sessionCookie, upsertGoogleUser, verifyGoogleIdToken } from './accounts.ts';
import { activePlan, click, createOrder, orderStatus, payme, paymeAuthError, paymeAuthorized, paymeInternalError, plansPayload } from './billing.ts';
import { cleanFeedback, elevenLabsTts, feedbackBody, parseFeedbackRequest, parseSttRequest, parseVoices, sttBody, ttsText } from './voice.ts';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const env = process.env;
const num = (k: string, d: number) => (Number(env[k]) > 0 ? Number(env[k]) : d);
const PORT = num('PORT', 8787);
// gemini-3.5-flash-lite: sinovda birinchi so'z ~0,55 s (3.1-flash-lite: ~3,4 s) — ovozli suhbat uchun eng tezi.
const MODEL = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const TRUST_PROXY = env.TRUST_PROXY === '1';
const VOICES = parseVoices(env.ELEVENLABS_VOICES);
// eleven_v4: o'zbek tilini qo'llaydi (eleven_v3 — yo'q) va [laughs] kabi hissiyot teglarini tushunadi.
const TTS_MODEL = env.ELEVENLABS_MODEL_ID || 'eleven_v4';
const TTS_LANG = env.ELEVENLABS_LANGUAGE_CODE || '';
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
  tutor: { perMinute: num('TUTOR_PER_MINUTE', 12), perDay: num('TUTOR_PER_DAY', 300) },
  stt: { perMinute: num('STT_PER_MINUTE', 20), perDay: num('STT_PER_DAY', 400) },
  tts: { perMinute: num('TTS_PER_MINUTE', 60), perDay: num('TTS_PER_DAY', 1200) },
  feedback: { perMinute: 4, perDay: num('FEEDBACK_PER_DAY', 40) },
  auth: { perMinute: 10, perDay: 200 },
  billing: { perMinute: 10, perDay: 100 },
};
const TTS_CHARS_PER_DAY = num('TTS_CHARS_PER_DAY', 12000);
const hits = new Map<string, number[]>();
const daily = new Map<string, { day: string; n: number }>();
let active = 0;
const CONCURRENCY = num('TUTOR_CONCURRENCY', 12);

function clientIp(req: IncomingMessage): string {
  const fwd = TRUST_PROXY ? String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
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
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
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

const SECURITY = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
  'permissions-policy': 'microphone=(self), camera=()',
};

/** Umumiy himoya: kalit, manba, tana, limit, parallel so'rovlar. */
async function guarded<T>(
  req: IncomingMessage,
  res: ServerResponse,
  opts: { bucket: string; maxBody?: number; needKey: string | undefined; keyName: string; parse: (b: unknown) => T | string },
  run: (data: T, signal: AbortSignal) => Promise<void>,
) {
  if (!opts.needKey) return json(res, 503, { code: 'config', message: `Server sozlanmagan (${opts.keyName} yo'q).` });
  if (!originOk(req)) return json(res, 403, { code: 'origin', message: 'Ruxsat etilmagan manba' });
  let body: unknown;
  try {
    body = await readBody(req, opts.maxBody);
  } catch (e) {
    return json(res, (e as { code?: string }).code === 'too_large' ? 413 : 400, { code: 'bad_request', message: "So'rov noto'g'ri yoki juda katta" });
  }
  const parsed = opts.parse(body);
  if (typeof parsed === 'string') return json(res, 400, { code: 'bad_request', message: parsed });
  const limited = take(opts.bucket, clientIp(req));
  if (limited) return json(res, 429, { code: 'rate_limited', message: limited });
  if (active >= CONCURRENCY) return json(res, 429, { code: 'busy', message: "Krua hozir boshqa o'quvchilar bilan gaplashyapti. Bir necha soniyadan keyin urinib ko'ring." });
  active++;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(Object.assign(new Error('timeout'), { name: 'TimeoutError' })), 30_000);
  res.on('close', () => ac.abort());
  try {
    await run(parsed, ac.signal);
  } catch (e) {
    const f = friendlyError(e);
    if (!res.headersSent) json(res, f.status, { code: f.code, message: f.message });
    else if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: f.code, message: f.message })}\n\n`);
      res.end();
    }
    if (f.code !== 'timeout') console.error(JSON.stringify({ type: 'api_error', bucket: opts.bucket, code: f.code, err: String((e as Error)?.message ?? e) }));
  } finally {
    clearTimeout(timer);
    active--;
  }
}

const FALLBACK_MODEL = env.GEMINI_FALLBACK_MODEL ?? 'gemini-3.1-flash-lite';
const HEDGE_MS = env.GEMINI_HEDGE_MS !== undefined ? Number(env.GEMINI_HEDGE_MS) : 1500;
const gem = (signal: AbortSignal) => ({ apiKey: env.GEMINI_API_KEY!, model: MODEL, fallbackModel: FALLBACK_MODEL || undefined, hedgeMs: HEDGE_MS, base: env.GEMINI_API_BASE, signal });

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

const routes: Record<string, (req: IncomingMessage, res: ServerResponse) => Promise<void> | void> = {
  'GET /api/health': (_q, res) => json(res, 200, { ok: true, ai: !!env.GEMINI_API_KEY, model: MODEL }),

  'GET /api/voice/config': (req, res) => {
    const premium = activePlan(currentUserId(req)).plan !== 'free';
    json(res, 200, {
      ai: !!env.GEMINI_API_KEY,
      stt: !!env.GEMINI_API_KEY,
      tts: env.ELEVENLABS_API_KEY && VOICES.length ? 'elevenlabs' : 'browser',
      audioTags: !!(env.ELEVENLABS_API_KEY && VOICES.length && /v[34]/.test(TTS_MODEL)),
      voices: env.ELEVENLABS_API_KEY ? VOICES.map((v) => ({ id: v.id, name: v.name })) : [],
      // Super obunachilari: uzunroq sessiya, dam olish talab qilinmaydi.
      sessionMinutes: premium ? Math.max(SESSION_MIN, num('VOICE_SESSION_MINUTES_SUPER', 30)) : SESSION_MIN,
      cooldownMinutes: premium ? 0 : COOLDOWN_MIN,
      premium,
    });
  },

  // ---------- Hisob ----------
  'GET /api/me': (req, res) => {
    const uid = currentUserId(req);
    const user = uid ? getUser(uid) : null;
    const sub = activePlan(user?.id ?? null);
    json(res, 200, { user, plan: sub.plan, expiresAt: sub.expiresAt, googleClientId: googleClientIds()[0] ?? null, billing: plansPayload() });
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

  'POST /api/tutor': (req, res) =>
    guarded(req, res, { bucket: 'tutor', needKey: env.GEMINI_API_KEY, keyName: 'GEMINI_API_KEY', parse: parseTutorRequest }, async (data, signal) => {
      let started = false;
      const send = (o: unknown) => res.write(`data: ${JSON.stringify(o)}\n\n`);
      for await (const text of streamTutor(data, gem(signal))) {
        if (!started) {
          started = true;
          res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', connection: 'keep-alive', 'x-accel-buffering': 'no' });
        }
        send({ t: text });
      }
      send({ done: true });
      res.end();
    }),

  'POST /api/tutor/feedback': (req, res) =>
    guarded(req, res, { bucket: 'feedback', maxBody: 160 * 1024, needKey: env.GEMINI_API_KEY, keyName: 'GEMINI_API_KEY', parse: parseFeedbackRequest }, async (data, signal) => {
      const raw = await generateJson(feedbackBody(data, MODEL), gem(signal));
      json(res, 200, cleanFeedback(raw));
    }),

  'POST /api/stt': (req, res) =>
    guarded(req, res, { bucket: 'stt', maxBody: 3 * 1024 * 1024, needKey: env.GEMINI_API_KEY, keyName: 'GEMINI_API_KEY', parse: parseSttRequest }, async (data, signal) => {
      const raw = (await generateJson(sttBody(data, MODEL), gem(signal))) as { text?: unknown };
      json(res, 200, { text: typeof raw?.text === 'string' ? raw.text.trim().slice(0, 1200) : '' });
    }),

  'POST /api/tts': (req, res) =>
    guarded(
      req,
      res,
      {
        bucket: 'tts',
        maxBody: 8 * 1024,
        needKey: env.ELEVENLABS_API_KEY && VOICES.length ? env.ELEVENLABS_API_KEY : undefined,
        keyName: 'ELEVENLABS_API_KEY / ELEVENLABS_VOICES',
        parse: (b) => {
          const o = (b ?? {}) as Record<string, unknown>;
          const text = ttsText(o.text);
          if (!text) return "Matn bo'sh";
          const voice = VOICES.find((v) => v.id === o.voice) ?? VOICES[0];
          return { text, voice: voice.id };
        },
      },
      async (data, signal) => {
        const limited = take('tts', `${clientIp(req)}`, data.text.length, TTS_CHARS_PER_DAY);
        if (limited) return json(res, 429, { code: 'tts_quota', message: 'Bugungi ovoz limiti tugadi — Krua matn bilan davom etadi.' });
        const upstream = await elevenLabsTts(data.text, data.voice, { apiKey: env.ELEVENLABS_API_KEY!, model: TTS_MODEL, languageCode: TTS_LANG, signal, base: env.ELEVENLABS_API_BASE });
        res.writeHead(200, { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' });
        await new Promise<void>((ok, fail) => {
          const s = Readable.fromWeb(upstream.body as never);
          s.on('error', fail);
          s.on('end', () => ok());
          s.pipe(res);
        });
      },
    ),
};

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
    res.writeHead(200, {
      ...SECURITY,
      'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      'cache-control': file.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(data);
  } catch {
    json(res, 404, { message: 'topilmadi' });
  }
}

const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0];
  const route = routes[`${req.method} ${path}`];
  if (route) {
    return void Promise.resolve(route(req, res)).catch((e) => {
      console.error(e);
      if (!res.headersSent) json(res, 500, { message: 'Server xatosi' });
    });
  }
  if (path.startsWith('/api/')) return json(res, 404, { message: 'topilmadi' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { message: 'method' });
  void serveStatic(req, res);
});
server.keepAliveTimeout = 65_000;

server.listen(PORT, () =>
  console.log(`Salut! server: http://localhost:${PORT} · AI: ${env.GEMINI_API_KEY ? MODEL : "o'chiq"} · ovoz: ${env.ELEVENLABS_API_KEY && VOICES.length ? `ElevenLabs (${TTS_MODEL})` : 'brauzer'}`),
);
