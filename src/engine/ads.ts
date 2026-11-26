// Reklama: Android ilovada AdMob (WebView JS ko'prigi), saytda AdSense.
// Sozlama — public/ads-config.js (window.SALUT_ADS), qayta build qilmasdan o'zgartiriladi.
// Super obunachilari va dars/suhbat paytida reklama ko'rsatilmaydi.

export interface AdsConfig {
  admobBanner?: string;
  admobRewarded?: string;
  admobInterstitial?: string;
  adsenseClient?: string;
  adsenseSlot?: string;
  /** Saytda mukofotli video (AdSense Ad Placement API). AdSense'da «Ad placements» yoqilgan bo'lishi kerak. */
  adsenseRewarded?: boolean;
}

type Bridge = {
  initialize(id: string, testing: boolean): void;
  showBanner(id: string, unit: string, testing: boolean): void;
  hideBanner(id: string): void;
  resumeBanner(id: string): void;
  prepareRewardVideoAd(id: string, unit: string, testing: boolean): void;
  showRewardVideoAd(id: string): void;
  prepareInterstitial?(id: string, unit: string, testing: boolean): void;
  showInterstitial?(id: string): void;
};

declare global {
  interface Window {
    SALUT_ADS?: AdsConfig;
    AndroidAdMob?: Bridge;
    __gtAdResolve?: (id: string, value: unknown) => void;
    __gtAdReject?: (id: string, message: string) => void;
    __gtAdReward?: () => void;
    adsbygoogle?: unknown[];
    adBreak?: (o: Record<string, unknown>) => void;
    adConfig?: (o: Record<string, unknown>) => void;
  }
}

// Google'ning ochiq sinov birliklari — haqiqiy ID kiritilmaguncha (daromad bermaydi).
const TEST = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};
const UNIT = /^ca-app-pub-\d{10,20}\/\d{6,20}$/;
const cfg = (): AdsConfig => window.SALUT_ADS ?? {};
const unit = (v: string | undefined, test: string) => (v && UNIT.test(v.trim()) ? { id: v.trim(), testing: false } : { id: test, testing: true });

let seq = 0;
const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
let rewardHit: (() => void) | null = null;

function call(method: keyof Bridge, ...args: unknown[]): Promise<unknown> {
  const bridge = window.AndroidAdMob;
  if (!bridge || typeof bridge[method] !== 'function') return Promise.reject(new Error('no bridge'));
  return new Promise((resolve, reject) => {
    const id = String(++seq);
    pending.set(id, { resolve, reject });
    try {
      (bridge[method] as (...a: unknown[]) => void)(id, ...args);
    } catch (e) {
      pending.delete(id);
      reject(e as Error);
    }
    setTimeout(() => {
      if (pending.delete(id)) reject(new Error('timeout'));
    }, 30_000);
  });
}

if (typeof window !== 'undefined') {
  window.__gtAdResolve = (id, value) => {
    const p = pending.get(String(id));
    if (p) {
      pending.delete(String(id));
      p.resolve(value);
    }
  };
  window.__gtAdReject = (id, message) => {
    const p = pending.get(String(id));
    if (p) {
      pending.delete(String(id));
      p.reject(new Error(String(message)));
    }
  };
  window.__gtAdReward = () => rewardHit?.();
}

export const isNativeApp = () => typeof window !== 'undefined' && !!window.AndroidAdMob;

let premium = false;
let initialized = false;
let bannerShown = false;
let immersive = false;
let rewardedReady = false;
let interstitialReady = false;
let lastInterstitial = 0;
let lessonsSinceAd = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const onAdsChange = (l: () => void) => (listeners.add(l), () => listeners.delete(l));

async function prepareRewarded() {
  const u = unit(cfg().admobRewarded, TEST.rewarded);
  try {
    await call('prepareRewardVideoAd', u.id, u.testing);
    rewardedReady = true;
  } catch {
    rewardedReady = false;
  }
  emit();
}

async function prepareInterstitial() {
  if (!window.AndroidAdMob?.prepareInterstitial) return;
  const u = unit(cfg().admobInterstitial, TEST.interstitial);
  try {
    await call('prepareInterstitial', u.id, u.testing);
    interstitialReady = true;
  } catch {
    interstitialReady = false;
  }
}

/** Ilova ochilganda va obuna holati o'zgarganda chaqiriladi. */
export async function initAds(isPremium: boolean) {
  premium = isPremium;
  if (!isNativeApp()) return emit();
  if (premium) {
    if (bannerShown) await call('hideBanner').catch(() => undefined);
    bannerShown = false;
    return emit();
  }
  if (!initialized) {
    initialized = true;
    const b = unit(cfg().admobBanner, TEST.banner);
    await call('initialize', b.testing).catch(() => undefined);
    setTimeout(() => void prepareRewarded(), 2500);
    setTimeout(() => void prepareInterstitial(), 5000);
  }
  if (!immersive) await showBanner();
}

async function showBanner() {
  if (premium || !isNativeApp()) return;
  const b = unit(cfg().admobBanner, TEST.banner);
  await call(bannerShown ? 'resumeBanner' : 'showBanner', ...(bannerShown ? [] : [b.id, b.testing])).catch(() => undefined);
  bannerShown = true;
  document.documentElement.classList.add('has-banner');
}

/** Dars yoki ovozli suhbat paytida banner yashiriladi. */
export function setImmersive(on: boolean) {
  immersive = on;
  if (!isNativeApp() || premium || !bannerShown) return;
  if (on) {
    void call('hideBanner').catch(() => undefined);
    document.documentElement.classList.remove('has-banner');
  } else void showBanner();
}

// ---------- Mukofotli video: +1 chashka kofe, kuniga 5 tagacha ----------

export const REWARD_DAILY_LIMIT = 5;
export type RewardKind = 'coffee' | 'xp' | 'vivi';
const dayKey = (k: RewardKind = 'coffee') => `salut.rv${k === 'coffee' ? '' : `.${k}`}.${new Date().toISOString().slice(0, 10)}`;
const usedToday = (k: RewardKind = 'coffee') => {
  try {
    return Number(localStorage.getItem(dayKey(k))) || 0;
  } catch {
    return 0;
  }
};

/** Saytda mukofotli reklama mumkinmi (AdSense + Ad Placement API sozlangan). */
export function webRewardedAvailable(): boolean {
  return !isNativeApp() && !premium && !!adsenseClient() && cfg().adsenseRewarded === true;
}

export function rewardedState(k: RewardKind = 'coffee') {
  return { available: (isNativeApp() || webRewardedAvailable()) && !premium, ready: isNativeApp() ? rewardedReady : true, left: Math.max(0, REWARD_DAILY_LIMIT - usedToday(k)) };
}

/** Saytda: AdSense mukofotli video (adBreak type: 'reward'). */
function showWebRewarded(): Promise<{ ok: boolean; reason?: 'no_ad' | 'not_finished' }> {
  loadAdsense();
  return new Promise((resolve) => {
    if (!window.adBreak) return resolve({ ok: false, reason: 'no_ad' });
    let viewed = false;
    let settled = false;
    const done = (r: { ok: boolean; reason?: 'no_ad' | 'not_finished' }) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };
    setTimeout(() => done({ ok: false, reason: 'no_ad' }), 20_000);
    try {
      window.adBreak({
        type: 'reward',
        name: 'voila_reward',
        beforeReward: (showAdFn: () => void) => showAdFn(),
        adViewed: () => {
          viewed = true;
        },
        adDismissed: () => done({ ok: false, reason: 'not_finished' }),
        adBreakDone: () => done(viewed ? { ok: true } : { ok: false, reason: 'no_ad' }),
      });
    } catch {
      done({ ok: false, reason: 'no_ad' });
    }
  });
}

/** Video oxirigacha ko'rilsa true. Android — AdMob, sayt — AdSense. */
export async function showRewarded(kind: RewardKind = 'coffee'): Promise<{ ok: boolean; reason?: 'limit' | 'no_ad' | 'not_finished' }> {
  if (premium || (!isNativeApp() && !webRewardedAvailable())) return { ok: false, reason: 'no_ad' };
  if (kind !== 'vivi' && usedToday(kind) >= REWARD_DAILY_LIMIT) return { ok: false, reason: 'limit' };
  let granted = false;
  if (!isNativeApp()) {
    const r = await showWebRewarded();
    granted = r.ok;
    if (!granted) return { ok: false, reason: r.reason ?? 'no_ad' };
  } else {
    rewardHit = () => {
      granted = true;
    };
    try {
      if (!rewardedReady) await prepareRewarded();
      if (!rewardedReady) return { ok: false, reason: 'no_ad' };
      rewardedReady = false;
      await call('showRewardVideoAd');
    } catch {
      if (!granted) return { ok: false, reason: 'no_ad' };
    } finally {
      rewardHit = null;
      setTimeout(() => void prepareRewarded(), 1000);
    }
  }
  if (granted) {
    try {
      localStorage.setItem(dayKey(kind), String(usedToday(kind) + 1));
    } catch {
      /* e'tiborsiz */
    }
  }
  emit();
  return granted ? { ok: true } : { ok: false, reason: 'not_finished' };
}

// ---------- Darslar orasida to'liq ekranli reklama ----------

/** Dars tugaganda chaqiriladi: har 2-darsdan keyin, 3 daqiqada ko'pi bilan bir marta. */
export async function maybeInterstitial(): Promise<void> {
  if (!isNativeApp() || premium || !window.AndroidAdMob?.showInterstitial) return;
  lessonsSinceAd++;
  if (lessonsSinceAd < 2 || Date.now() - lastInterstitial < 180_000 || !interstitialReady) return;
  interstitialReady = false;
  lessonsSinceAd = 0;
  lastInterstitial = Date.now();
  await call('showInterstitial').catch(() => undefined);
  setTimeout(() => void prepareInterstitial(), 1500);
}

// ---------- Sayt: AdSense ----------

let adsenseLoaded = false;
export function adsenseClient(): string | null {
  const c = cfg().adsenseClient?.trim();
  return !isNativeApp() && !premium && c && /^ca-pub-\d{10,20}$/.test(c) ? c : null;
}
export function loadAdsense() {
  const c = adsenseClient();
  if (!c || adsenseLoaded) return;
  adsenseLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(c)}`;
  if (cfg().adsenseRewarded) {
    // Ad Placement API (mukofotli video uchun).
    s.setAttribute('data-ad-frequency-hint', '30s');
    window.adsbygoogle = window.adsbygoogle || [];
    window.adBreak = window.adConfig = (o: Record<string, unknown>) => (window.adsbygoogle as unknown[]).push(o);
    window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
  }
  document.head.appendChild(s);
}
