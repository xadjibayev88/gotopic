// Reklama: Android ilovada AdMob (WebView JS ko'prigi), saytda AdSense.
// Sozlama — public/ads-config.js (window.SALUT_ADS), qayta build qilmasdan o'zgartiriladi.
// Super obunachilari va dars/suhbat paytida reklama ko'rsatilmaydi.

export interface AdsConfig {
  admobBanner?: string;
  admobRewarded?: string;
  admobInterstitial?: string;
  adsenseClient?: string;
  adsenseSlot?: string;
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
const dayKey = () => `salut.rv.${new Date().toISOString().slice(0, 10)}`;
const usedToday = () => {
  try {
    return Number(localStorage.getItem(dayKey())) || 0;
  } catch {
    return 0;
  }
};

export function rewardedState() {
  return { available: isNativeApp() && !premium, ready: rewardedReady, left: Math.max(0, REWARD_DAILY_LIMIT - usedToday()) };
}

/** Video oxirigacha ko'rilsa true. */
export async function showRewarded(): Promise<{ ok: boolean; reason?: 'limit' | 'no_ad' | 'not_finished' }> {
  if (!isNativeApp() || premium) return { ok: false, reason: 'no_ad' };
  if (usedToday() >= REWARD_DAILY_LIMIT) return { ok: false, reason: 'limit' };
  let granted = false;
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
  if (granted) {
    try {
      localStorage.setItem(dayKey(), String(usedToday() + 1));
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
  document.head.appendChild(s);
}
