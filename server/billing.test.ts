import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import express from "express";
import { billingWebhooks, plansPayload, priceUzs, providers } from "./billing.js";

function withEnv(values: Record<string, string>, fn: () => void | Promise<void>) {
  const saved = Object.fromEntries(Object.keys(values).map((k) => [k, process.env[k]]));
  Object.assign(process.env, values);
  return Promise.resolve(fn()).finally(() => {
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  });
}

async function serve(fn: (base: string) => Promise<void>) {
  const app = express(); app.use(express.json()); app.use("/hooks", billingWebhooks);
  const server = app.listen(0);
  const port = (server.address() as { port: number }).port;
  try { await fn(`http://127.0.0.1:${port}/hooks`); } finally { server.close(); }
}

test("plans: Pro $10/oy, Topic $99/yil va so'mdagi narx", () => withEnv({ USD_UZS_RATE: "12800", PRICE_UZS_PRO: "", PRICE_UZS_TOPIC: "" }, () => {
  const { plans } = plansPayload();
  assert.deepEqual(plans.map((p) => [p.id, p.usd, p.days]), [["pro", 10, 30], ["topic", 99, 365]]);
  assert.equal(priceUzs("pro"), 128000);
  assert.equal(priceUzs("topic"), 1267000);
}));

test("providers: faqat kalitlari bor provayderlar yoqiladi", () => withEnv({
  PAYME_MERCHANT_ID: "", PAYME_KEY: "", CLICK_SERVICE_ID: "", CLICK_MERCHANT_ID: "", CLICK_SECRET_KEY: "", USDT_TRC20_ADDRESS: "bad",
}, () => {
  assert.deepEqual(providers(), []);
  process.env.USDT_TRC20_ADDRESS = "TQ5NMqJjhpQGK7YJbESKtNCo86PJ89ujio";
  process.env.PAYME_MERCHANT_ID = "m"; process.env.PAYME_KEY = "k";
  assert.deepEqual(providers(), ["payme", "usdt"]);
}));

test("Payme: noto'g'ri kalit -32504 bilan rad etiladi", () => withEnv({ PAYME_KEY: "secret" }, () => serve(async (base) => {
  const response = await fetch(`${base}/payme`, {
    method: "POST", headers: { "content-type": "application/json", authorization: `Basic ${Buffer.from("Paycom:wrong").toString("base64")}` },
    body: JSON.stringify({ id: 7, method: "CheckPerformTransaction", params: {} }),
  });
  const body = await response.json() as { id: number; error: { code: number } };
  assert.equal(response.status, 200);
  assert.equal(body.id, 7);
  assert.equal(body.error.code, -32504);
})));

test("Click: imzosi noto'g'ri so'rov -1 bilan rad etiladi, bazaga tegmaydi", () => withEnv({ CLICK_SERVICE_ID: "1", CLICK_SECRET_KEY: "s" }, () => serve(async (base) => {
  const form = new URLSearchParams({ click_trans_id: "5", service_id: "1", merchant_trans_id: "9", amount: "128000", action: "0", sign_time: "2026-11-15 10:00:00", sign_string: createHash("md5").update("x").digest("hex") });
  const response = await fetch(`${base}/click/prepare`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  const body = await response.json() as { error: number };
  assert.equal(body.error, -1);
})));
