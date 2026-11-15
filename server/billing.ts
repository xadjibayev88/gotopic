/**
 * Tariflar va to'lovlar: Pro (oylik) va Topic (yillik).
 * - Payme (Uzcard, Humo; Visa/Mastercard — merchant shartnomasida yoqilgan bo'lsa): Merchant API, JSON-RPC.
 * - Click (Uzcard, Humo; Visa — merchantda yoqilgan bo'lsa): SHOP API prepare/complete.
 * - USDT TRC20: egasining hamyoniga to'g'ridan-to'g'ri o'tkazma, TronGrid orqali tekshiriladi.
 * Har bir provayder faqat uning kalitlari environmentda bo'lsa yoqiladi. Kalitlar kodga yozilmaydi.
 */
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { Router, urlencoded, type Request, type Response } from "express";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { db } from "./database.js";

export type PlanId = "pro" | "topic";
export type Provider = "payme" | "click" | "usdt";
type Plan = { id: PlanId; name: string; usd: number; days: number; period: string };

export const PLANS: Record<PlanId, Plan> = {
  pro: { id: "pro", name: "Pro", usd: 10, days: 30, period: "oy" },
  topic: { id: "topic", name: "Topic", usd: 99, days: 365, period: "yil" },
};
const RANK: Record<string, number> = { free: 0, pro: 1, topic: 2 };
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDT_ORDER_TTL_MS = 60 * 60_000;
const PAYME_TIMEOUT_MS = 12 * 3600_000;

const env = (name: string) => (process.env[name] ?? "").trim();
function intEnv(name: string, fallback: number): number {
  const value = Number(env(name));
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

/** So'mdagi narx: PRICE_UZS_PRO / PRICE_UZS_TOPIC, bo'lmasa USD_UZS_RATE bo'yicha 1000 so'mga yaxlitlanadi. */
export function priceUzs(plan: PlanId): number {
  const explicit = intEnv(plan === "pro" ? "PRICE_UZS_PRO" : "PRICE_UZS_TOPIC", 0);
  if (explicit) return explicit;
  return Math.round((PLANS[plan].usd * intEnv("USD_UZS_RATE", 12800)) / 1000) * 1000;
}

export function providers(): Provider[] {
  const list: Provider[] = [];
  if (env("PAYME_MERCHANT_ID") && env("PAYME_KEY")) list.push("payme");
  if (env("CLICK_SERVICE_ID") && env("CLICK_MERCHANT_ID") && env("CLICK_SECRET_KEY")) list.push("click");
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/u.test(env("USDT_TRC20_ADDRESS"))) list.push("usdt");
  return list;
}

function publicOrigin(): string {
  return (env("PUBLIC_ORIGIN") || "https://gotopic-jmqzyljc.manus.space").replace(/\/$/u, "");
}

// ---------------------------------------------------------------- obuna (entitlement)

type SubRow = RowDataPacket & { plan: PlanId; expires_at: Date };

export async function activePlan(userId: string): Promise<{ plan: PlanId | "free"; expiresAt: string | null }> {
  const [rows] = await db().execute<SubRow[]>("SELECT plan, expires_at FROM subscriptions WHERE user_id = ? LIMIT 1", [userId]);
  const row = rows[0];
  if (!row || new Date(row.expires_at).getTime() <= Date.now()) return { plan: "free", expiresAt: null };
  return { plan: row.plan, expiresAt: new Date(row.expires_at).toISOString() };
}

/** Pro va Topic: AI ustoz kunlik limiti kattaroq (AI_DAILY_LIMIT_PRO, standart 400). */
export async function aiDailyLimitFor(userId: string, freeLimit: number): Promise<number> {
  const { plan } = await activePlan(userId).catch(() => ({ plan: "free" as const }));
  return plan === "free" ? freeLimit : Math.max(freeLimit, intEnv("AI_DAILY_LIMIT_PRO", 400));
}

/** Buyurtmani to'langan deb belgilaydi va obunani uzaytiradi. Faqat bir marta ishlaydi (idempotent). */
async function grant(connection: PoolConnection, orderId: number): Promise<boolean> {
  const [orders] = await connection.execute<(RowDataPacket & { user_id: string; plan: PlanId; status: string })[]>(
    "SELECT user_id, plan, status FROM billing_orders WHERE id = ? FOR UPDATE", [orderId]);
  const order = orders[0];
  if (!order || order.status !== "pending") return false;
  await connection.execute("UPDATE billing_orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP(6) WHERE id = ?", [orderId]);
  const [subs] = await connection.execute<SubRow[]>("SELECT plan, expires_at FROM subscriptions WHERE user_id = ? FOR UPDATE", [order.user_id]);
  const now = Date.now();
  const current = subs[0];
  const base = current && new Date(current.expires_at).getTime() > now ? new Date(current.expires_at).getTime() : now;
  const expires = new Date(base + PLANS[order.plan].days * 86_400_000);
  const plan = current && new Date(current.expires_at).getTime() > now && RANK[current.plan] > RANK[order.plan] ? current.plan : order.plan;
  await connection.execute(
    `INSERT INTO subscriptions (user_id, plan, expires_at) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE plan = VALUES(plan), expires_at = VALUES(expires_at)`,
    [order.user_id, plan, expires]);
  return true;
}

async function inTransaction<T>(fn: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await db().getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

// ---------------------------------------------------------------- buyurtmalar

type OrderRow = RowDataPacket & {
  id: number; user_id: string; plan: PlanId; provider: Provider; amount_uzs: number; amount_usdt_micro: number | null;
  status: "pending" | "paid" | "cancelled" | "expired"; created_at: Date; paid_at: Date | null;
  tx_id: string | null; tx_state: number | null; tx_time: number | null; tx_create: number | null;
  tx_perform: number | null; tx_cancel: number | null; tx_reason: number | null;
};

async function order(id: number, connection?: PoolConnection): Promise<OrderRow | undefined> {
  const [rows] = await (connection ?? db()).execute<OrderRow[]>(`SELECT * FROM billing_orders WHERE id = ?${connection ? " FOR UPDATE" : ""}`, [id]);
  return rows[0];
}

/** USDT uchun noyob summa: 10.01–10.99 (har bir kutilayotgan buyurtma o'z sentiga ega, shu bilan to'lov aniqlanadi). */
async function uniqueUsdtMicro(plan: PlanId): Promise<number> {
  const [rows] = await db().execute<(RowDataPacket & { amount_usdt_micro: number })[]>(
    "SELECT amount_usdt_micro FROM billing_orders WHERE provider = 'usdt' AND status = 'pending' AND created_at > ?",
    [new Date(Date.now() - USDT_ORDER_TTL_MS)]);
  const used = new Set(rows.map((r) => Number(r.amount_usdt_micro)));
  for (let attempt = 0; attempt < 60; attempt++) {
    const micro = PLANS[plan].usd * 1_000_000 + randomInt(1, 100) * 10_000;
    if (!used.has(micro)) return micro;
  }
  throw new Error("usdt_busy");
}

export async function createOrder(userId: string, plan: PlanId, provider: Provider) {
  if (!providers().includes(provider)) throw Object.assign(new Error("provider_disabled"), { status: 400 });
  const amountUzs = priceUzs(plan);
  const usdt = provider === "usdt" ? await uniqueUsdtMicro(plan) : null;
  const [result] = await db().execute<ResultSetHeader>(
    "INSERT INTO billing_orders (user_id, plan, provider, amount_uzs, amount_usdt_micro) VALUES (?, ?, ?, ?, ?)",
    [userId, plan, provider, amountUzs, usdt]);
  const id = result.insertId;
  const back = `${publicOrigin()}/#tariflar`;
  if (provider === "payme") {
    const host = env("PAYME_TEST") === "1" ? "https://checkout.test.paycom.uz" : "https://checkout.paycom.uz";
    const params = `m=${env("PAYME_MERCHANT_ID")};ac.order_id=${id};a=${amountUzs * 100};c=${back};l=uz`;
    return { id, provider, plan, amountUzs, payUrl: `${host}/${Buffer.from(params).toString("base64")}` };
  }
  if (provider === "click") {
    const url = new URL("https://my.click.uz/services/pay");
    url.searchParams.set("service_id", env("CLICK_SERVICE_ID"));
    url.searchParams.set("merchant_id", env("CLICK_MERCHANT_ID"));
    url.searchParams.set("amount", String(amountUzs));
    url.searchParams.set("transaction_param", String(id));
    url.searchParams.set("return_url", back);
    return { id, provider, plan, amountUzs, payUrl: url.toString() };
  }
  return {
    id, provider, plan, address: env("USDT_TRC20_ADDRESS"), network: "TRC20",
    amountUsdt: (Number(usdt) / 1_000_000).toFixed(2), expiresAt: new Date(Date.now() + USDT_ORDER_TTL_MS).toISOString(),
  };
}

/** USDT: TronGrid'dan hamyonga kelgan tasdiqlangan o'tkazmalarni ko'radi va aniq summani topsa buyurtmani to'laydi. */
export async function checkUsdt(userId: string, id: number): Promise<{ status: string }> {
  const row = await order(id);
  if (!row || row.user_id !== userId) throw Object.assign(new Error("not_found"), { status: 404 });
  if (row.status !== "pending" || row.provider !== "usdt") return { status: row.status };
  const created = new Date(row.created_at).getTime();
  if (Date.now() - created > USDT_ORDER_TTL_MS + 30 * 60_000) {
    await db().execute("UPDATE billing_orders SET status = 'expired' WHERE id = ? AND status = 'pending'", [id]);
    return { status: "expired" };
  }
  const url = new URL(`https://api.trongrid.io/v1/accounts/${env("USDT_TRC20_ADDRESS")}/transactions/trc20`);
  url.searchParams.set("only_confirmed", "true");
  url.searchParams.set("only_to", "true");
  url.searchParams.set("contract_address", USDT_CONTRACT);
  url.searchParams.set("min_timestamp", String(created - 60_000));
  url.searchParams.set("limit", "200");
  const headers: Record<string, string> = { accept: "application/json" };
  if (env("TRONGRID_API_KEY")) headers["TRON-PRO-API-KEY"] = env("TRONGRID_API_KEY");
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw Object.assign(new Error("tron_unavailable"), { status: 503 });
  const body = await response.json() as { data?: Array<{ transaction_id: string; value: string; to: string; token_info?: { address?: string; decimals?: number } }> };
  const want = String(row.amount_usdt_micro);
  const hit = (body.data ?? []).find((t) => t.token_info?.address === USDT_CONTRACT && t.token_info?.decimals === 6 &&
    t.to === env("USDT_TRC20_ADDRESS") && t.value === want);
  if (!hit) return { status: "pending" };
  try {
    await inTransaction(async (connection) => {
      await connection.execute("UPDATE billing_orders SET tx_id = ? WHERE id = ? AND status = 'pending'", [`usdt:${hit.transaction_id}`, id]);
      await grant(connection, id);
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") return { status: "pending" }; // bu tranzaksiya boshqa buyurtmaga ishlatilgan
    throw error;
  }
  return { status: "paid" };
}

// ---------------------------------------------------------------- Payme Merchant API

const PaymeError = (code: number, uz: string, data?: string) =>
  ({ code, message: { uz, ru: uz, en: uz }, ...(data ? { data } : {}) });

function paymeAuthorized(req: Request): boolean {
  const header = req.get("authorization") ?? "";
  const expected = Buffer.from(`Basic ${Buffer.from(`Paycom:${env("PAYME_KEY")}`).toString("base64")}`);
  const given = Buffer.from(header);
  return env("PAYME_KEY") !== "" && given.length === expected.length && timingSafeEqual(given, expected);
}

function paymeTx(row: OrderRow) {
  return {
    create_time: Number(row.tx_create ?? 0), perform_time: Number(row.tx_perform ?? 0), cancel_time: Number(row.tx_cancel ?? 0),
    transaction: String(row.id), state: Number(row.tx_state ?? 0), reason: row.tx_reason === null ? null : Number(row.tx_reason),
  };
}

async function paymeOrderFor(params: { amount?: number; account?: { order_id?: string | number } }, connection?: PoolConnection) {
  const id = Number(params.account?.order_id);
  const row = Number.isSafeInteger(id) ? await order(id, connection) : undefined;
  if (!row || row.provider !== "payme") return { error: PaymeError(-31050, "Buyurtma topilmadi", "order_id") };
  if (row.status !== "pending") return { error: PaymeError(-31051, "Buyurtma to'langan yoki bekor qilingan", "order_id") };
  if (Number(params.amount) !== Number(row.amount_uzs) * 100) return { error: PaymeError(-31001, "Summa noto'g'ri") };
  return { row };
}

async function payme(method: string, params: Record<string, any>): Promise<{ result?: unknown; error?: unknown }> {
  if (method === "CheckPerformTransaction") {
    const found = await paymeOrderFor(params);
    return found.error ? { error: found.error } : { result: { allow: true } };
  }
  if (method === "CreateTransaction") {
    return inTransaction(async (connection) => {
      const [existing] = await connection.execute<OrderRow[]>("SELECT * FROM billing_orders WHERE tx_id = ? FOR UPDATE", [`payme:${params.id}`]);
      if (existing[0]) {
        const row = existing[0];
        if (Number(row.tx_state) !== 1) return { error: PaymeError(-31008, "Tranzaksiyani bajarib bo'lmaydi") };
        if (Date.now() - Number(row.tx_time) > PAYME_TIMEOUT_MS) {
          await connection.execute("UPDATE billing_orders SET tx_state = -1, tx_cancel = ?, tx_reason = 4, status = 'cancelled' WHERE id = ?", [Date.now(), row.id]);
          return { error: PaymeError(-31008, "Tranzaksiya muddati o'tgan") };
        }
        return { result: { create_time: Number(row.tx_create), transaction: String(row.id), state: 1 } };
      }
      const found = await paymeOrderFor(params, connection);
      if (found.error) return { error: found.error };
      if (found.row.tx_id && Number(found.row.tx_state) === 1) return { error: PaymeError(-31050, "Buyurtma boshqa tranzaksiyada kutilmoqda", "order_id") };
      const now = Date.now();
      await connection.execute("UPDATE billing_orders SET tx_id = ?, tx_state = 1, tx_time = ?, tx_create = ? WHERE id = ?",
        [`payme:${params.id}`, Number(params.time) || now, now, found.row.id]);
      return { result: { create_time: now, transaction: String(found.row.id), state: 1 } };
    });
  }
  const byTx = async (connection?: PoolConnection) => {
    const [rows] = await (connection ?? db()).execute<OrderRow[]>(`SELECT * FROM billing_orders WHERE tx_id = ?${connection ? " FOR UPDATE" : ""}`, [`payme:${params.id}`]);
    return rows[0];
  };
  if (method === "PerformTransaction") {
    return inTransaction(async (connection) => {
      const row = await byTx(connection);
      if (!row) return { error: PaymeError(-31003, "Tranzaksiya topilmadi") };
      if (Number(row.tx_state) === 2) return { result: { transaction: String(row.id), perform_time: Number(row.tx_perform), state: 2 } };
      if (Number(row.tx_state) !== 1) return { error: PaymeError(-31008, "Tranzaksiyani bajarib bo'lmaydi") };
      if (Date.now() - Number(row.tx_time) > PAYME_TIMEOUT_MS) {
        await connection.execute("UPDATE billing_orders SET tx_state = -1, tx_cancel = ?, tx_reason = 4, status = 'cancelled' WHERE id = ?", [Date.now(), row.id]);
        return { error: PaymeError(-31008, "Tranzaksiya muddati o'tgan") };
      }
      const now = Date.now();
      await connection.execute("UPDATE billing_orders SET tx_state = 2, tx_perform = ? WHERE id = ?", [now, row.id]);
      await grant(connection, row.id);
      return { result: { transaction: String(row.id), perform_time: now, state: 2 } };
    });
  }
  if (method === "CancelTransaction") {
    return inTransaction(async (connection) => {
      const row = await byTx(connection);
      if (!row) return { error: PaymeError(-31003, "Tranzaksiya topilmadi") };
      if (Number(row.tx_state) === 1) {
        const now = Date.now();
        await connection.execute("UPDATE billing_orders SET tx_state = -1, tx_cancel = ?, tx_reason = ?, status = 'cancelled' WHERE id = ?",
          [now, Number(params.reason) || null, row.id]);
        return { result: { transaction: String(row.id), cancel_time: now, state: -1 } };
      }
      if (Number(row.tx_state) === 2) return { error: PaymeError(-31007, "Xizmat ko'rsatilgan, bekor qilib bo'lmaydi") };
      return { result: { transaction: String(row.id), cancel_time: Number(row.tx_cancel), state: Number(row.tx_state) } };
    });
  }
  if (method === "CheckTransaction") {
    const row = await byTx();
    return row ? { result: paymeTx(row) } : { error: PaymeError(-31003, "Tranzaksiya topilmadi") };
  }
  if (method === "GetStatement") {
    const [rows] = await db().execute<OrderRow[]>(
      "SELECT * FROM billing_orders WHERE provider = 'payme' AND tx_id IS NOT NULL AND tx_time BETWEEN ? AND ? ORDER BY tx_time",
      [Number(params.from) || 0, Number(params.to) || 0]);
    return {
      result: {
        transactions: rows.map((row) => ({
          id: String(row.tx_id).slice(6), time: Number(row.tx_time), amount: Number(row.amount_uzs) * 100,
          account: { order_id: String(row.id) }, ...paymeTx(row),
        })),
      },
    };
  }
  return { error: PaymeError(-32601, "Metod topilmadi") };
}

// ---------------------------------------------------------------- Click SHOP API

const md5 = (value: string) => createHash("md5").update(value).digest("hex");

async function click(body: Record<string, string>, action: 0 | 1) {
  const reply = (error: number, error_note: string, extra: Record<string, unknown> = {}) =>
    ({ click_trans_id: body.click_trans_id, merchant_trans_id: body.merchant_trans_id, error, error_note, ...extra });
  const signBase = action === 0
    ? `${body.click_trans_id}${body.service_id}${env("CLICK_SECRET_KEY")}${body.merchant_trans_id}${body.amount}${body.action}${body.sign_time}`
    : `${body.click_trans_id}${body.service_id}${env("CLICK_SECRET_KEY")}${body.merchant_trans_id}${body.merchant_prepare_id}${body.amount}${body.action}${body.sign_time}`;
  if (!body.sign_string || md5(signBase) !== body.sign_string || body.service_id !== env("CLICK_SERVICE_ID")) return reply(-1, "SIGN CHECK FAILED");
  if (Number(body.action) !== action) return reply(-3, "Action not found");
  const id = Number(body.merchant_trans_id);
  return inTransaction(async (connection) => {
    const row = Number.isSafeInteger(id) ? await order(id, connection) : undefined;
    if (!row || row.provider !== "click") return reply(-5, "Order not found");
    if (row.status === "paid") return reply(-4, "Already paid");
    if (row.status !== "pending") return reply(-9, "Transaction cancelled");
    if (Math.abs(Number(body.amount) - Number(row.amount_uzs)) > 0.009) return reply(-2, "Incorrect parameter amount");
    if (action === 0) {
      await connection.execute("UPDATE billing_orders SET tx_id = ?, tx_state = 1, tx_time = ? WHERE id = ?", [`click:${body.click_trans_id}`, Date.now(), id]);
      return reply(0, "Success", { merchant_prepare_id: id });
    }
    if (Number(body.merchant_prepare_id) !== id || row.tx_id !== `click:${body.click_trans_id}`) return reply(-6, "Transaction does not exist");
    if (Number(body.error) < 0) {
      await connection.execute("UPDATE billing_orders SET status = 'cancelled', tx_state = -1, tx_cancel = ? WHERE id = ?", [Date.now(), id]);
      return reply(-9, "Transaction cancelled");
    }
    await connection.execute("UPDATE billing_orders SET tx_state = 2, tx_perform = ? WHERE id = ?", [Date.now(), id]);
    await grant(connection, id);
    return reply(0, "Success", { merchant_confirm_id: id });
  });
}

// ---------------------------------------------------------------- HTTP

/** Provayderlardan keladigan so'rovlar: CSRF sarlavhasisiz, o'z imzosi bilan himoyalangan. app.ts'da CSRF tekshiruvidan oldin ulanadi. */
export const billingWebhooks = Router();
billingWebhooks.post("/payme", async (req: Request, res: Response) => {
  const id = req.body?.id ?? null;
  if (!paymeAuthorized(req)) { res.json({ id, error: PaymeError(-32504, "Ruxsat yo'q") }); return; }
  try { res.json({ id, ...(await payme(String(req.body?.method ?? ""), req.body?.params ?? {})) }); }
  catch { res.json({ id, error: PaymeError(-32400, "Ichki xato") }); }
});
billingWebhooks.post(["/click/prepare", "/click/complete"], urlencoded({ extended: false, limit: "16kb" }), async (req: Request, res: Response) => {
  try { res.json(await click(req.body ?? {}, req.path.endsWith("prepare") ? 0 : 1)); }
  catch { res.json({ error: -7, error_note: "Failed to update order" }); }
});

export const orderInput = z.object({ plan: z.enum(["pro", "topic"]), provider: z.enum(["payme", "click", "usdt"]) }).strict();

export function plansPayload() {
  return {
    plans: (Object.values(PLANS)).map((p) => ({ id: p.id, name: p.name, usd: p.usd, uzs: priceUzs(p.id), days: p.days, period: p.period })),
    providers: providers(),
  };
}
