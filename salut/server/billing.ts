// Salut Super obunasi: Payme (Merchant API, JSON-RPC) va Click (SHOP API prepare/complete).
// Har bir provayder faqat uning kalitlari muhitda bo'lsa yoqiladi. Kalitlar kodga yozilmaydi.
// Mantiq GoTopic billing modulidan ko'chirilgan (protokol javoblari va xato kodlari o'sha).
import { createHash, timingSafeEqual } from 'node:crypto';
import { db, tx } from './db.ts';

export type PlanId = 'month' | 'year';
export type Provider = 'payme' | 'click';

export const PLANS: Record<PlanId, { id: PlanId; name: string; days: number; defaultUzs: number; period: string }> = {
  month: { id: 'month', name: 'Super — oylik', days: 30, defaultUzs: 49_000, period: 'oy' },
  year: { id: 'year', name: 'Super — yillik', days: 365, defaultUzs: 399_000, period: 'yil' },
};
const PAYME_TIMEOUT_MS = 12 * 3600_000;

const env = (name: string) => (process.env[name] ?? '').trim();

export function priceUzs(plan: PlanId): number {
  const explicit = Number(env(plan === 'month' ? 'PRICE_UZS_MONTH' : 'PRICE_UZS_YEAR'));
  return Number.isSafeInteger(explicit) && explicit > 0 ? explicit : PLANS[plan].defaultUzs;
}

export function providers(): Provider[] {
  const list: Provider[] = [];
  if (env('PAYME_MERCHANT_ID') && env('PAYME_KEY')) list.push('payme');
  if (env('CLICK_SERVICE_ID') && env('CLICK_MERCHANT_ID') && env('CLICK_SECRET_KEY')) list.push('click');
  return list;
}

export function plansPayload() {
  return {
    plans: Object.values(PLANS).map((p) => ({ id: p.id, name: p.name, uzs: priceUzs(p.id), days: p.days, period: p.period })),
    providers: providers(),
  };
}

// ---------- Obuna ----------

export function activePlan(userId: string | null): { plan: PlanId | 'free'; expiresAt: number | null } {
  if (!userId) return { plan: 'free', expiresAt: null };
  const r = db().prepare('SELECT plan, expires_at FROM subscriptions WHERE user_id = ?').get(userId) as { plan: PlanId; expires_at: number } | undefined;
  if (!r || r.expires_at <= Date.now()) return { plan: 'free', expiresAt: null };
  return { plan: r.plan, expiresAt: r.expires_at };
}

/** Buyurtmani to'langan deb belgilaydi va obunani uzaytiradi. Idempotent — faqat bir marta ishlaydi. */
function grant(orderId: number): boolean {
  const o = db().prepare('SELECT user_id, plan, status FROM orders WHERE id = ?').get(orderId) as { user_id: string; plan: PlanId; status: string } | undefined;
  if (!o || o.status !== 'pending') return false;
  const now = Date.now();
  db().prepare("UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ?").run(now, orderId);
  const cur = db().prepare('SELECT plan, expires_at FROM subscriptions WHERE user_id = ?').get(o.user_id) as { plan: PlanId; expires_at: number } | undefined;
  const base = cur && cur.expires_at > now ? cur.expires_at : now;
  const plan: PlanId = cur && cur.expires_at > now && cur.plan === 'year' ? 'year' : o.plan;
  db()
    .prepare('INSERT INTO subscriptions (user_id, plan, expires_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET plan = excluded.plan, expires_at = excluded.expires_at')
    .run(o.user_id, plan, base + PLANS[o.plan].days * 86_400_000);
  return true;
}

// ---------- Buyurtmalar ----------

type OrderRow = {
  id: number; user_id: string; plan: PlanId; provider: Provider; amount_uzs: number; status: string;
  tx_id: string | null; tx_state: number | null; tx_time: number | null; tx_create: number | null;
  tx_perform: number | null; tx_cancel: number | null; tx_reason: number | null; created_at: number;
};
const orderById = (id: number) => db().prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined;
const orderByTx = (txId: string) => db().prepare('SELECT * FROM orders WHERE tx_id = ?').get(txId) as OrderRow | undefined;

export function createOrder(userId: string, planRaw: unknown, providerRaw: unknown, origin: string) {
  const plan = planRaw === 'month' || planRaw === 'year' ? planRaw : null;
  const provider = providerRaw === 'payme' || providerRaw === 'click' ? providerRaw : null;
  if (!plan || !provider) return { error: "Tarif yoki to'lov usuli noto'g'ri", status: 400 } as const;
  if (!providers().includes(provider)) return { error: "Bu to'lov usuli hozircha yoqilmagan", status: 400 } as const;
  const amountUzs = priceUzs(plan);
  const r = db().prepare('INSERT INTO orders (user_id, plan, provider, amount_uzs, created_at) VALUES (?, ?, ?, ?, ?)').run(userId, plan, provider, amountUzs, Date.now());
  const id = Number(r.lastInsertRowid);
  const back = `${origin.replace(/\/$/, '')}/#/shop?paid=${id}`;
  if (provider === 'payme') {
    const host = env('PAYME_TEST') === '1' ? 'https://checkout.test.paycom.uz' : 'https://checkout.paycom.uz';
    const params = `m=${env('PAYME_MERCHANT_ID')};ac.order_id=${id};a=${amountUzs * 100};c=${back};l=uz`;
    return { id, provider, plan, amountUzs, payUrl: `${host}/${Buffer.from(params).toString('base64')}` } as const;
  }
  const url = new URL('https://my.click.uz/services/pay');
  url.searchParams.set('service_id', env('CLICK_SERVICE_ID'));
  url.searchParams.set('merchant_id', env('CLICK_MERCHANT_ID'));
  url.searchParams.set('amount', String(amountUzs));
  url.searchParams.set('transaction_param', String(id));
  url.searchParams.set('return_url', back);
  return { id, provider, plan, amountUzs, payUrl: url.toString() } as const;
}

export function orderStatus(userId: string, id: number): string | null {
  const o = orderById(id);
  return o && o.user_id === userId ? o.status : null;
}

// ---------- Payme Merchant API ----------

const PaymeError = (code: number, uz: string, data?: string) => ({ code, message: { uz, ru: uz, en: uz }, ...(data ? { data } : {}) });

export function paymeAuthorized(header: string | undefined): boolean {
  const expected = Buffer.from(`Basic ${Buffer.from(`Paycom:${env('PAYME_KEY')}`).toString('base64')}`);
  const given = Buffer.from(header ?? '');
  return env('PAYME_KEY') !== '' && given.length === expected.length && timingSafeEqual(given, expected);
}

function paymeTx(o: OrderRow) {
  return {
    create_time: Number(o.tx_create ?? 0), perform_time: Number(o.tx_perform ?? 0), cancel_time: Number(o.tx_cancel ?? 0),
    transaction: String(o.id), state: Number(o.tx_state ?? 0), reason: o.tx_reason === null ? null : Number(o.tx_reason),
  };
}

function paymeOrderFor(params: { amount?: number; account?: { order_id?: string | number } }) {
  const id = Number(params.account?.order_id);
  const o = Number.isSafeInteger(id) ? orderById(id) : undefined;
  if (!o || o.provider !== 'payme') return { error: PaymeError(-31050, 'Buyurtma topilmadi', 'order_id') };
  if (o.status !== 'pending') return { error: PaymeError(-31051, "Buyurtma to'langan yoki bekor qilingan", 'order_id') };
  if (Number(params.amount) !== o.amount_uzs * 100) return { error: PaymeError(-31001, "Summa noto'g'ri") };
  return { o };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function payme(method: string, params: Record<string, any>): { result?: unknown; error?: unknown } {
  if (method === 'CheckPerformTransaction') {
    const f = paymeOrderFor(params);
    return f.error ? { error: f.error } : { result: { allow: true } };
  }
  if (method === 'CreateTransaction') {
    return tx(() => {
      const existing = orderByTx(`payme:${params.id}`);
      if (existing) {
        if (Number(existing.tx_state) !== 1) return { error: PaymeError(-31008, "Tranzaksiyani bajarib bo'lmaydi") };
        if (Date.now() - Number(existing.tx_time) > PAYME_TIMEOUT_MS) {
          db().prepare("UPDATE orders SET tx_state = -1, tx_cancel = ?, tx_reason = 4, status = 'cancelled' WHERE id = ?").run(Date.now(), existing.id);
          return { error: PaymeError(-31008, "Tranzaksiya muddati o'tgan") };
        }
        return { result: { create_time: Number(existing.tx_create), transaction: String(existing.id), state: 1 } };
      }
      const f = paymeOrderFor(params);
      if (f.error) return { error: f.error };
      if (f.o.tx_id && Number(f.o.tx_state) === 1) return { error: PaymeError(-31050, 'Buyurtma boshqa tranzaksiyada kutilmoqda', 'order_id') };
      const now = Date.now();
      db().prepare('UPDATE orders SET tx_id = ?, tx_state = 1, tx_time = ?, tx_create = ? WHERE id = ?').run(`payme:${params.id}`, Number(params.time) || now, now, f.o.id);
      return { result: { create_time: now, transaction: String(f.o.id), state: 1 } };
    });
  }
  if (method === 'PerformTransaction') {
    return tx(() => {
      const o = orderByTx(`payme:${params.id}`);
      if (!o) return { error: PaymeError(-31003, 'Tranzaksiya topilmadi') };
      if (Number(o.tx_state) === 2) return { result: { transaction: String(o.id), perform_time: Number(o.tx_perform), state: 2 } };
      if (Number(o.tx_state) !== 1) return { error: PaymeError(-31008, "Tranzaksiyani bajarib bo'lmaydi") };
      if (Date.now() - Number(o.tx_time) > PAYME_TIMEOUT_MS) {
        db().prepare("UPDATE orders SET tx_state = -1, tx_cancel = ?, tx_reason = 4, status = 'cancelled' WHERE id = ?").run(Date.now(), o.id);
        return { error: PaymeError(-31008, "Tranzaksiya muddati o'tgan") };
      }
      const now = Date.now();
      db().prepare('UPDATE orders SET tx_state = 2, tx_perform = ? WHERE id = ?').run(now, o.id);
      grant(o.id);
      return { result: { transaction: String(o.id), perform_time: now, state: 2 } };
    });
  }
  if (method === 'CancelTransaction') {
    return tx(() => {
      const o = orderByTx(`payme:${params.id}`);
      if (!o) return { error: PaymeError(-31003, 'Tranzaksiya topilmadi') };
      if (Number(o.tx_state) === 1) {
        const now = Date.now();
        db().prepare("UPDATE orders SET tx_state = -1, tx_cancel = ?, tx_reason = ?, status = 'cancelled' WHERE id = ?").run(now, Number(params.reason) || null, o.id);
        return { result: { transaction: String(o.id), cancel_time: now, state: -1 } };
      }
      if (Number(o.tx_state) === 2) return { error: PaymeError(-31007, "Xizmat ko'rsatilgan, bekor qilib bo'lmaydi") };
      return { result: { transaction: String(o.id), cancel_time: Number(o.tx_cancel), state: Number(o.tx_state) } };
    });
  }
  if (method === 'CheckTransaction') {
    const o = orderByTx(`payme:${params.id}`);
    return o ? { result: paymeTx(o) } : { error: PaymeError(-31003, 'Tranzaksiya topilmadi') };
  }
  if (method === 'GetStatement') {
    const rows = db()
      .prepare("SELECT * FROM orders WHERE provider = 'payme' AND tx_id IS NOT NULL AND tx_time BETWEEN ? AND ? ORDER BY tx_time")
      .all(Number(params.from) || 0, Number(params.to) || 0) as OrderRow[];
    return {
      result: {
        transactions: rows.map((o) => ({ id: String(o.tx_id).slice(6), time: Number(o.tx_time), amount: o.amount_uzs * 100, account: { order_id: String(o.id) }, ...paymeTx(o) })),
      },
    };
  }
  return { error: PaymeError(-32601, 'Metod topilmadi') };
}

export const paymeAuthError = () => PaymeError(-32504, "Ruxsat yo'q");
export const paymeInternalError = () => PaymeError(-32400, 'Ichki xato');

// ---------- Click SHOP API ----------

const md5 = (v: string) => createHash('md5').update(v).digest('hex');

export function click(body: Record<string, string>, action: 0 | 1) {
  const reply = (error: number, error_note: string, extra: Record<string, unknown> = {}) => ({
    click_trans_id: body.click_trans_id, merchant_trans_id: body.merchant_trans_id, error, error_note, ...extra,
  });
  const signBase =
    action === 0
      ? `${body.click_trans_id}${body.service_id}${env('CLICK_SECRET_KEY')}${body.merchant_trans_id}${body.amount}${body.action}${body.sign_time}`
      : `${body.click_trans_id}${body.service_id}${env('CLICK_SECRET_KEY')}${body.merchant_trans_id}${body.merchant_prepare_id}${body.amount}${body.action}${body.sign_time}`;
  if (!env('CLICK_SECRET_KEY') || !body.sign_string || md5(signBase) !== body.sign_string || body.service_id !== env('CLICK_SERVICE_ID')) return reply(-1, 'SIGN CHECK FAILED');
  if (Number(body.action) !== action) return reply(-3, 'Action not found');
  const id = Number(body.merchant_trans_id);
  return tx(() => {
    const o = Number.isSafeInteger(id) ? orderById(id) : undefined;
    if (!o || o.provider !== 'click') return reply(-5, 'Order not found');
    if (o.status === 'paid') return reply(-4, 'Already paid');
    if (o.status !== 'pending') return reply(-9, 'Transaction cancelled');
    if (Math.abs(Number(body.amount) - o.amount_uzs) > 0.009) return reply(-2, 'Incorrect parameter amount');
    if (action === 0) {
      db().prepare('UPDATE orders SET tx_id = ?, tx_state = 1, tx_time = ? WHERE id = ?').run(`click:${body.click_trans_id}`, Date.now(), id);
      return reply(0, 'Success', { merchant_prepare_id: id });
    }
    if (Number(body.merchant_prepare_id) !== id || o.tx_id !== `click:${body.click_trans_id}`) return reply(-6, 'Transaction does not exist');
    if (Number(body.error) < 0) {
      db().prepare("UPDATE orders SET status = 'cancelled', tx_state = -1, tx_cancel = ? WHERE id = ?").run(Date.now(), id);
      return reply(-9, 'Transaction cancelled');
    }
    db().prepare('UPDATE orders SET tx_state = 2, tx_perform = ? WHERE id = ?').run(Date.now(), id);
    grant(id);
    return reply(0, 'Success', { merchant_confirm_id: id });
  });
}
