// Salut! serveri: dist/ ni tarqatadi va /api/tutor orqali Krua ustozni Gemini bilan ulaydi.
// Ishga tushirish: GEMINI_API_KEY=... node server/main.ts
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { friendlyError, parseTutorRequest, streamTutor } from './tutor.ts';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 8787;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const PER_MINUTE = Number(process.env.TUTOR_PER_MINUTE) || 8;
const PER_DAY = Number(process.env.TUTOR_PER_DAY) || 150;
const CONCURRENCY = Number(process.env.TUTOR_CONCURRENCY) || 8;
const TRUST_PROXY = process.env.TRUST_PROXY === '1';

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

// ---------- Oddiy xotiradagi limitlar ----------
const minuteHits = new Map<string, number[]>();
const dayHits = new Map<string, { day: string; n: number }>();
let active = 0;

function clientIp(req: IncomingMessage): string {
  const fwd = TRUST_PROXY ? String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
  return fwd || req.socket.remoteAddress || 'unknown';
}

function checkLimit(ip: string): string | null {
  const now = Date.now();
  const recent = (minuteHits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= PER_MINUTE) return 'Juda tez yozyapsiz — bir daqiqa nafas oling, keyin davom etamiz.';
  const today = new Date().toISOString().slice(0, 10);
  const d = dayHits.get(ip);
  const n = d && d.day === today ? d.n : 0;
  if (n >= PER_DAY) return 'Bugungi suhbat limiti tugadi. Ertaga davom etamiz — darslar esa ishlayveradi!';
  recent.push(now);
  minuteHits.set(ip, recent);
  dayHits.set(ip, { day: today, n: n + 1 });
  return null;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of minuteHits) if (!v.some((t) => now - t < 60_000)) minuteHits.delete(k);
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

const SECURITY = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
  'permissions-policy': 'microphone=(self), camera=()',
};

// ---------- /api/tutor ----------
async function handleTutor(req: IncomingMessage, res: ServerResponse) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return json(res, 503, { code: 'config', message: 'AI ustoz serveri sozlanmagan (GEMINI_API_KEY yo\'q).' });
  const origin = req.headers.origin;
  if (origin && req.headers.host && new URL(origin).host !== req.headers.host && !(process.env.ALLOWED_ORIGINS ?? '').split(',').includes(origin))
    return json(res, 403, { code: 'origin', message: 'Ruxsat etilmagan manba' });

  let body: unknown;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { code: 'bad_request', message: "So'rov noto'g'ri" });
  }
  const parsed = parseTutorRequest(body);
  if (typeof parsed === 'string') return json(res, 400, { code: 'bad_request', message: parsed });
  const limited = checkLimit(clientIp(req));
  if (limited) return json(res, 429, { code: 'rate_limited', message: limited });
  if (active >= CONCURRENCY) return json(res, 429, { code: 'busy', message: 'Krua hozir boshqa o\'quvchilar bilan gaplashyapti. Bir necha soniyadan keyin urinib ko\'ring.' });

  active++;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(Object.assign(new Error('timeout'), { name: 'TimeoutError' })), 30_000);
  res.on('close', () => ac.abort());
  let started = false;
  const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  try {
    for await (const text of streamTutor(parsed, { apiKey: key, model: MODEL, base: process.env.GEMINI_API_BASE, signal: ac.signal })) {
      if (!started) {
        started = true;
        res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', connection: 'keep-alive', 'x-accel-buffering': 'no' });
      }
      send({ t: text });
    }
    send({ done: true });
    res.end();
  } catch (e) {
    const f = friendlyError(e);
    if (!res.writableEnded) {
      if (started) {
        send({ error: f.code, message: f.message });
        res.end();
      } else json(res, f.status, { code: f.code, message: f.message });
    }
    if (f.code !== 'timeout') console.error(JSON.stringify({ type: 'tutor_error', code: f.code, err: String((e as Error)?.message ?? e) }));
  } finally {
    clearTimeout(timer);
    active--;
  }
}

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
    const ext = extname(file);
    res.writeHead(200, {
      ...SECURITY,
      'content-type': MIME[ext] ?? 'application/octet-stream',
      'cache-control': file.includes(`${'/'}assets${'/'}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(data);
  } catch {
    json(res, 404, { message: 'topilmadi' });
  }
}

const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0];
  if (path === '/api/health') return json(res, 200, { ok: true, ai: !!process.env.GEMINI_API_KEY, model: MODEL });
  if (path === '/api/tutor') {
    if (req.method !== 'POST') return json(res, 405, { message: 'POST kerak' });
    return void handleTutor(req, res).catch((e) => {
      console.error(e);
      if (!res.headersSent) json(res, 500, { message: 'Server xatosi' });
    });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { message: 'method' });
  void serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Salut! server: http://localhost:${PORT} (AI: ${process.env.GEMINI_API_KEY ? MODEL : "o'chiq"})`));
