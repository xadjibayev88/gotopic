// AdMob mukofotli reklama: server tomonida tekshirish (SSV) va reklama sozlamasini env'dan berish.
// SSV: reklama oxirigacha ko'rilganda Google o'zi serverimizga GET so'rov yuboradi (imzolangan).
// Imzo Google ochiq kalitlari bilan tekshiriladi: https://www.gstatic.com/admob/reward/verifier-keys.json
// custom_data — ilova reklama boshlanishidan oldin serverdan olgan bir martalik chipta (nonce).
import { createPublicKey, verify, type KeyObject } from 'node:crypto';

export const ADMOB_KEYS_URL = 'https://www.gstatic.com/admob/reward/verifier-keys.json';

export type SsvKeys = Map<string, KeyObject>;

export function parseVerifierKeys(body: unknown): SsvKeys {
  const out: SsvKeys = new Map();
  const keys = (body as { keys?: unknown })?.keys;
  if (!Array.isArray(keys)) return out;
  for (const k of keys) {
    const id = String((k as { keyId?: unknown }).keyId ?? '');
    const pem = (k as { pem?: unknown }).pem;
    if (!id || typeof pem !== 'string') continue;
    try {
      out.set(id, createPublicKey(pem));
    } catch {
      /* buzilgan kalit — o'tkazib yuboriladi */
    }
  }
  return out;
}

export interface SsvResult {
  ok: boolean;
  reason?: string;
  customData?: string;
  userId?: string;
  transactionId?: string;
  adUnit?: string;
}

/**
 * rawQuery — URL'dagi "?" dan keyingi qism, o'zgartirilmagan holda.
 * Google qoidasi: imzolangan matn — "signature=" dan oldingi hamma narsa (oxirgi "&" siz),
 * signature va key_id esa har doim oxirida keladi.
 */
export function verifySsv(rawQuery: string, getKeys: (id: string) => KeyObject | undefined): SsvResult {
  const at = rawQuery.indexOf('&signature=');
  if (at <= 0) return { ok: false, reason: 'no_signature' };
  const message = rawQuery.slice(0, at);
  const tail = new URLSearchParams(rawQuery.slice(at + 1));
  const sig = tail.get('signature') ?? '';
  const keyId = tail.get('key_id') ?? '';
  const key = getKeys(keyId);
  if (!sig || !key) return { ok: false, reason: 'unknown_key' };
  let good = false;
  try {
    good = verify('sha256', Buffer.from(message, 'utf8'), key, Buffer.from(sig, 'base64url'));
  } catch {
    good = false;
  }
  if (!good) return { ok: false, reason: 'bad_signature' };
  const q = new URLSearchParams(message);
  return {
    ok: true,
    customData: q.get('custom_data') ?? undefined,
    userId: q.get('user_id') ?? undefined,
    transactionId: q.get('transaction_id') ?? undefined,
    adUnit: q.get('ad_unit') ?? undefined,
  };
}

/** Google kalitlarini yuklab, 12 soat keshlaydi. */
export function createKeyCache(fetchImpl: typeof fetch = fetch, ttlMs = 12 * 3600_000) {
  let keys: SsvKeys = new Map();
  let at = 0;
  let loading: Promise<void> | null = null;
  const refresh = async () => {
    const r = await fetchImpl(ADMOB_KEYS_URL, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`keys ${r.status}`);
    const parsed = parseVerifierKeys(await r.json());
    if (parsed.size) {
      keys = parsed;
      at = Date.now();
    }
  };
  return async (keyId: string): Promise<KeyObject | undefined> => {
    if (!keys.has(keyId) || Date.now() - at > ttlMs) {
      loading ??= refresh().catch(() => undefined).finally(() => (loading = null));
      await loading;
    }
    return keys.get(keyId);
  };
}

// ---------- Reklama sozlamasi env'dan (Railway Variables) ----------

const UNIT = /^ca-app-pub-\d{10,20}\/\d{6,20}$/;
const PUB = /^(?:ca-app-)?pub-(\d{10,20})$/;

/** ADMOB_* / ADSENSE_* o'zgaruvchilaridan ads-config.js matni. Hech biri berilmasa — null (statik fayl ishlaydi). */
export function adsConfigScript(env: Record<string, string | undefined>, globalName: string): string | null {
  const v = (k: string) => (env[k] ?? '').trim();
  const keys = ['ADMOB_BANNER_ID', 'ADMOB_REWARDED_ID', 'ADMOB_INTERSTITIAL_ID', 'ADMOB_TEST_ADS', 'ADSENSE_CLIENT', 'ADSENSE_SLOT', 'ADSENSE_REWARDED'];
  if (!keys.some((k) => v(k))) return null;
  const unit = (k: string) => (UNIT.test(v(k)) ? v(k) : '');
  const cfg = {
    admobBanner: unit('ADMOB_BANNER_ID'),
    admobRewarded: unit('ADMOB_REWARDED_ID'),
    admobInterstitial: unit('ADMOB_INTERSTITIAL_ID'),
    admobTestAds: v('ADMOB_TEST_ADS') === '1',
    adsenseClient: /^ca-pub-\d{10,20}$/.test(v('ADSENSE_CLIENT')) ? v('ADSENSE_CLIENT') : '',
    adsenseSlot: /^\d{4,20}$/.test(v('ADSENSE_SLOT')) ? v('ADSENSE_SLOT') : '',
    adsenseRewarded: v('ADSENSE_REWARDED') === '1',
  };
  return `window.${globalName} = ${JSON.stringify(cfg)};\n`;
}

/** app-ads.txt: ADMOB_PUBLISHER_ID (pub-XXXXXXXXXXXXXXXX) berilsa. */
export function appAdsTxt(env: Record<string, string | undefined>): string | null {
  const m = PUB.exec((env.ADMOB_PUBLISHER_ID ?? '').trim());
  return m ? `google.com, pub-${m[1]}, DIRECT, f08c47fec0942fa0\n` : null;
}
