// Admin statistikasi: kiruvchilar (anonim qurilma ID — mehmonlar ham), ro'yxatdan o'tganlar, faollar, Super, to'lovlar, AI.
// Telegram botda admin chatiga qadalgan xabar sifatida har 5 daqiqada yangilanadi (bot.ts) va kunlik hisobot yuboriladi.
// Ikkinchi ilovaning (PEER_STATS_URL) raqamlari ham shu xabarga qo'shiladi — umumiy STATS_TOKEN bilan.
import { timingSafeEqual } from 'node:crypto';
import { db } from './db.ts';

export const APP_NAME = 'Go Topic';
const TZ_MS = 5 * 3600_000; // Toshkent (UTC+5)
export type VisitSource = 'web' | 'app' | 'tg';

let readyFor: unknown = null;
function ensure() {
  if (readyFor === db()) return;
  db().exec(`
    CREATE TABLE IF NOT EXISTS visits (
      day TEXT NOT NULL,
      device TEXT NOT NULL,
      user_id TEXT,
      src TEXT NOT NULL DEFAULT 'web',
      first_at INTEGER NOT NULL,
      last_at INTEGER NOT NULL,
      PRIMARY KEY (day, device)
    );
    CREATE INDEX IF NOT EXISTS visits_last ON visits(last_at);
    CREATE TABLE IF NOT EXISTS tg_dash (
      chat_id TEXT PRIMARY KEY,
      message_id INTEGER,
      text TEXT,
      report_day TEXT
    );
  `);
  readyFor = db();
}

/** Toshkent bo'yicha kun (YYYY-MM-DD). */
export const dayOf = (t: number) => new Date(t + TZ_MS).toISOString().slice(0, 10);
const dayStart = (t: number) => Date.parse(`${dayOf(t)}T00:00:00Z`) - TZ_MS;

/** Ilova ochilganda va har 5 daqiqada (ko'rinib turganda) chaqiriladi. Qurilma ID — tasodifiy, shaxsiy ma'lumot emas. */
export function recordVisit(device: string, userId: string | null, src: VisitSource, now = Date.now()): boolean {
  if (!/^[A-Za-z0-9_-]{12,64}$/.test(device)) return false;
  ensure();
  db()
    .prepare(
      `INSERT INTO visits (day, device, user_id, src, first_at, last_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(day, device) DO UPDATE SET last_at = excluded.last_at, user_id = COALESCE(excluded.user_id, visits.user_id), src = excluded.src`,
    )
    .run(dayOf(now), device, userId, src, now, now);
  // 60 kundan eski yozuvlar kerak emas.
  if (Math.random() < 0.01) db().prepare('DELETE FROM visits WHERE last_at < ?').run(now - 60 * 86_400_000);
  return true;
}

export interface AppStats {
  app: string;
  at: number;
  online: number;
  visitorsToday: number;
  visitorsYesterday: number;
  visitors7d: number;
  bySrc: Record<VisitSource, number>;
  users: number;
  newToday: number;
  new7d: number;
  activeToday: number;
  supers: number;
  paidToday: number;
  paidTodayUzs: number;
  paidMonthUzs: number;
  pending: number;
  aiUsersToday: number;
  aiRequestsToday: number;
  ttsCharsToday: number;
}

const one = (sql: string, ...args: (string | number)[]) => Number((db().prepare(sql).get(...args) as { n: number | null } | undefined)?.n ?? 0);

export function collectStats(now = Date.now()): AppStats {
  ensure();
  const today = dayOf(now);
  const start = dayStart(now);
  const yesterday = dayOf(start - 1);
  const week = dayOf(start - 6 * 86_400_000);
  const month = start - 29 * 86_400_000;
  const bySrc = { web: 0, app: 0, tg: 0 } as Record<VisitSource, number>;
  for (const r of db().prepare('SELECT src, COUNT(*) AS n FROM visits WHERE day = ? GROUP BY src').all(today) as { src: VisitSource; n: number }[]) {
    if (r.src in bySrc) bySrc[r.src] = r.n;
  }
  const aiDay = new Date(now).toISOString().slice(0, 10); // AI kvotasi UTC kun bo'yicha yuritiladi
  const aiGlobal = db().prepare("SELECT requests, tts_characters FROM ai_quota_usage WHERE day = ? AND scope_key = 'global'").get(aiDay) as { requests: number; tts_characters: number } | undefined;
  return {
    app: APP_NAME,
    at: now,
    online: one('SELECT COUNT(DISTINCT device) AS n FROM visits WHERE last_at > ?', now - 5 * 60_000),
    visitorsToday: one('SELECT COUNT(*) AS n FROM visits WHERE day = ?', today),
    visitorsYesterday: one('SELECT COUNT(*) AS n FROM visits WHERE day = ?', yesterday),
    visitors7d: one('SELECT COUNT(DISTINCT device) AS n FROM visits WHERE day >= ?', week),
    bySrc,
    users: one('SELECT COUNT(*) AS n FROM users'),
    newToday: one('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?', start),
    new7d: one('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?', start - 6 * 86_400_000),
    activeToday: one('SELECT COUNT(*) AS n FROM progress WHERE updated_at >= ?', start),
    supers: one('SELECT COUNT(*) AS n FROM subscriptions WHERE expires_at > ?', now),
    paidToday: one("SELECT COUNT(*) AS n FROM orders WHERE status = 'paid' AND paid_at >= ?", start),
    paidTodayUzs: one("SELECT COALESCE(SUM(amount_uzs), 0) AS n FROM orders WHERE status = 'paid' AND paid_at >= ?", start),
    paidMonthUzs: one("SELECT COALESCE(SUM(amount_uzs), 0) AS n FROM orders WHERE status = 'paid' AND paid_at >= ?", month),
    pending: one("SELECT COUNT(*) AS n FROM orders WHERE status = 'review'"),
    aiUsersToday: one("SELECT COUNT(*) AS n FROM ai_quota_usage WHERE day = ? AND scope_type = 'subject'", aiDay),
    aiRequestsToday: aiGlobal?.requests ?? 0,
    ttsCharsToday: aiGlobal?.tts_characters ?? 0,
  };
}

const n = (x: number) => x.toLocaleString('ru-RU').replace(/\s/g, ' ');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const trend = (a: number, b: number) => (b ? ` (${a >= b ? '▲' : '▼'} kecha ${n(b)})` : '');

function block(s: AppStats, emoji: string): string {
  return [
    `${emoji} <b>${esc(s.app)}</b>`,
    `🟢 Hozir ilovada: <b>${n(s.online)}</b>`,
    `👥 Bugun kirganlar: <b>${n(s.visitorsToday)}</b>${trend(s.visitorsToday, s.visitorsYesterday)}`,
    `     🌐 sayt ${n(s.bySrc.web)} · 📱 ilova ${n(s.bySrc.app)} · ✈️ Telegram ${n(s.bySrc.tg)}`,
    `📆 7 kunda: <b>${n(s.visitors7d)}</b> qurilma`,
    `👤 Ro'yxatdan o'tganlar: <b>${n(s.users)}</b> (bugun +${n(s.newToday)}, 7 kunda +${n(s.new7d)})`,
    `📚 Bugun dars qilganlar: <b>${n(s.activeToday)}</b>`,
    `💎 Super: <b>${n(s.supers)}</b> · bugun to'lov: <b>${n(s.paidToday)}</b> (${n(s.paidTodayUzs)} so'm)`,
    `💰 30 kunlik tushum: <b>${n(s.paidMonthUzs)} so'm</b>${s.pending ? ` · ⏳ kutilayotgan chek: <b>${s.pending}</b>` : ''}`,
    `🤖 AI bugun: <b>${n(s.aiUsersToday)}</b> kishi · ${n(s.aiRequestsToday)} so'rov · ovoz ${n(s.ttsCharsToday)} belgi`,
  ].join('\n');
}

/** Admin xabari: o'z ilovasi + ikkinchi ilova (bor bo'lsa). */
export function statsText(own: AppStats, peer: AppStats | null, title = '📊 Jonli statistika'): string {
  const time = new Date(own.at + TZ_MS).toISOString().slice(11, 16);
  const parts = [`${title} · ${time} (Toshkent)`, '', block(own, own.app.startsWith('Voil') ? '🇫🇷' : '🇰🇷')];
  if (peer) {
    parts.push('', block(peer, peer.app.startsWith('Voil') ? '🇫🇷' : '🇰🇷'));
    const sum = (k: keyof AppStats) => Number(own[k]) + Number(peer[k]);
    parts.push('', `Σ <b>Jami</b>: hozir ${n(sum('online'))} · bugun ${n(sum('visitorsToday'))} kirgan · ${n(sum('users'))} ro'yxatdan o'tgan · ${n(sum('supers'))} Super`);
  } else if (process.env.PEER_STATS_URL) {
    parts.push('', '⚠️ Ikkinchi ilova statistikasi hozir olinmadi.');
  }
  parts.push('', '<i>Har 5 daqiqada yangilanadi. «Kirganlar» — qurilmalar (mehmonlar ham).</i>');
  return parts.join('\n');
}

/** Ikkinchi ilova statistikasi uchun himoyalangan so'rov tokeni. */
export function statsTokenOk(header: string | undefined): boolean {
  const want = (process.env.STATS_TOKEN ?? '').trim();
  if (want.length < 24 || !header) return false;
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ''));
  const exp = Buffer.from(want);
  return given.length === exp.length && timingSafeEqual(given, exp);
}

export async function fetchPeerStats(): Promise<AppStats | null> {
  const url = (process.env.PEER_STATS_URL ?? '').trim();
  const token = (process.env.STATS_TOKEN ?? '').trim();
  if (!url || !token) return null;
  try {
    const r = await fetch(url, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const s = (await r.json()) as AppStats;
    return typeof s?.users === 'number' ? s : null;
  } catch {
    return null;
  }
}

// ---------- Qadalgan xabar holati ----------
export function dashOf(chat: string): { message_id: number | null; text: string | null; report_day: string | null } | null {
  ensure();
  return (db().prepare('SELECT message_id, text, report_day FROM tg_dash WHERE chat_id = ?').get(chat) as { message_id: number | null; text: string | null; report_day: string | null } | undefined) ?? null;
}
export function saveDash(chat: string, patch: { message_id?: number | null; text?: string | null; report_day?: string | null }) {
  ensure();
  const cur = dashOf(chat) ?? { message_id: null, text: null, report_day: null };
  const v = { ...cur, ...patch };
  db().prepare('INSERT INTO tg_dash (chat_id, message_id, text, report_day) VALUES (?, ?, ?, ?) ON CONFLICT(chat_id) DO UPDATE SET message_id = excluded.message_id, text = excluded.text, report_day = excluded.report_day').run(chat, v.message_id, v.text, v.report_day);
}
