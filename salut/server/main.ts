// Salut! serveri: dist/ ni tarqatadi va Krua ustozni (matn + ovoz) Gemini / ElevenLabs bilan ulaydi.
// Ishga tushirish: GEMINI_API_KEY=... [ELEVENLABS_API_KEY=... ELEVENLABS_VOICES="Krua:id"] node server/main.ts
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { friendlyError, generateJson, parseTutorRequest, streamTutor } from './tutor.ts';
import { cleanFeedback, elevenLabsTts, feedbackBody, parseFeedbackRequest, parseSttRequest, parseVoices, sttBody, ttsText } from './voice.ts';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const env = process.env;
const num = (k: string, d: number) => (Number(env[k]) > 0 ? Number(env[k]) : d);
const PORT = num('PORT', 8787);
const MODEL = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
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

const gem = (signal: AbortSignal) => ({ apiKey: env.GEMINI_API_KEY!, model: MODEL, base: env.GEMINI_API_BASE, signal });

// ---------- Yo'nalishlar ----------
const routes: Record<string, (req: IncomingMessage, res: ServerResponse) => Promise<void> | void> = {
  'GET /api/health': (_q, res) => json(res, 200, { ok: true, ai: !!env.GEMINI_API_KEY, model: MODEL }),

  'GET /api/voice/config': (_q, res) =>
    json(res, 200, {
      ai: !!env.GEMINI_API_KEY,
      stt: !!env.GEMINI_API_KEY,
      tts: env.ELEVENLABS_API_KEY && VOICES.length ? 'elevenlabs' : 'browser',
      audioTags: !!(env.ELEVENLABS_API_KEY && VOICES.length && /v[34]/.test(TTS_MODEL)),
      voices: env.ELEVENLABS_API_KEY ? VOICES.map((v) => ({ id: v.id, name: v.name })) : [],
      sessionMinutes: SESSION_MIN,
      cooldownMinutes: COOLDOWN_MIN,
    }),

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
