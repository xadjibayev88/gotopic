// Ijtimoiy isbot — FAQAT haqiqiy ma'lumot: foydalanuvchilar yozgan izohlar (admin tasdiqlaydi),
// haqiqatan to'langan obunalar va haqiqiy statistika. Hech narsa to'qib chiqarilmaydi.
import { db } from './db.ts';
import { PLANS, type PlanId } from './billing.ts';

export interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  /** Muallif to'lov qilgan (haqiqiy Super obunachi). */
  verified: boolean;
  createdAt: number;
}

function ensure() {
  db().exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );
  `);
}

/** «Islomjon Xojibayev» → «Islomjon X.» (to'liq ism chiqmaydi). */
export function shortName(name: string | null | undefined): string {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Foydalanuvchi';
  const first = parts[0].slice(0, 20);
  return parts[1] ? `${first} ${parts[1][0].toUpperCase()}.` : first;
}

const hasPaid = (userId: string) => !!db().prepare("SELECT 1 FROM orders WHERE user_id = ? AND status = 'paid' LIMIT 1").get(userId);

/** Izoh yozish yoki yangilash (har foydalanuvchiga bitta). Yangilansa — qayta tekshiruvga tushadi. */
export function submitReview(userId: string, ratingRaw: unknown, textRaw: unknown): { ok: true; id: number } | { ok: false; status: number; message: string } {
  ensure();
  const rating = Number(ratingRaw);
  const text = String(textRaw ?? '').replace(/\s+/g, ' ').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, status: 400, message: 'Bahoni 1 dan 5 gacha tanlang' };
  if (text.length < 10) return { ok: false, status: 400, message: "Izoh kamida 10 ta belgidan iborat bo'lsin" };
  if (text.length > 400) return { ok: false, status: 400, message: 'Izoh 400 belgidan oshmasin' };
  if (/(https?:\/\/|www\.|t\.me\/|@\w{4,})/i.test(text)) return { ok: false, status: 400, message: "Izohda havola yoki reklama bo'lmasin" };
  db()
    .prepare("INSERT INTO reviews (user_id, rating, text, status, created_at) VALUES (?, ?, ?, 'pending', ?) ON CONFLICT(user_id) DO UPDATE SET rating = excluded.rating, text = excluded.text, status = 'pending', created_at = excluded.created_at")
    .run(userId, rating, text, Date.now());
  const r = db().prepare('SELECT id FROM reviews WHERE user_id = ?').get(userId) as { id: number };
  return { ok: true, id: r.id };
}

export function myReview(userId: string) {
  ensure();
  return (db().prepare('SELECT rating, text, status FROM reviews WHERE user_id = ?').get(userId) as { rating: number; text: string; status: string } | undefined) ?? null;
}

/** Tasdiqlangan izohlar + o'rtacha baho (faqat tasdiqlanganlar bo'yicha). */
export function publicReviews(limit = 12): { reviews: Review[]; avg: number | null; count: number } {
  ensure();
  const rows = db()
    .prepare("SELECT r.id, r.user_id, r.rating, r.text, r.created_at, u.name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.status = 'approved' ORDER BY r.created_at DESC LIMIT ?")
    .all(limit) as { id: number; user_id: string; rating: number; text: string; created_at: number; name: string }[];
  const agg = db().prepare("SELECT AVG(rating) AS avg, COUNT(*) AS n FROM reviews WHERE status = 'approved'").get() as { avg: number | null; n: number };
  return {
    reviews: rows.map((r) => ({ id: r.id, name: shortName(r.name), rating: r.rating, text: r.text, verified: hasPaid(r.user_id), createdAt: r.created_at })),
    avg: agg.n ? Math.round(agg.avg! * 10) / 10 : null,
    count: agg.n,
  };
}

export function pendingReviews() {
  ensure();
  return db()
    .prepare("SELECT r.id, r.rating, r.text, r.status, r.created_at AS createdAt, u.name, u.email FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.status = 'pending' ORDER BY r.id DESC LIMIT 100")
    .all() as { id: number; rating: number; text: string; status: string; createdAt: number; name: string; email: string | null }[];
}

export function decideReview(id: number, approve: boolean): boolean {
  ensure();
  return db().prepare("UPDATE reviews SET status = ? WHERE id = ? AND status = 'pending'").run(approve ? 'approved' : 'rejected', id).changes > 0;
}

/** So'nggi HAQIQIY xaridlar (7 kun ichida): qisqa ism, tarif, vaqt. Shahar ma'lumoti yig'ilmaydi. */
export function recentPurchases(limit = 8) {
  const rows = db()
    .prepare("SELECT o.plan, o.paid_at, u.name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.status = 'paid' AND o.paid_at > ? ORDER BY o.paid_at DESC LIMIT ?")
    .all(Date.now() - 7 * 86_400_000, limit) as { plan: PlanId; paid_at: number; name: string }[];
  return rows.map((r) => ({ name: shortName(r.name), plan: PLANS[r.plan]?.label ?? r.plan, at: r.paid_at }));
}

/** Haqiqiy statistika: ro'yxatdan o'tganlar va Super obunachilar soni. */
export function stats() {
  const users = (db().prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
  const supers = (db().prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE expires_at > ?').get(Date.now()) as { n: number }).n;
  return { users, supers };
}
