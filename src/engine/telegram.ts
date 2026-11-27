// Telegram Mini App: kirish ma'lumoti (initData) Telegram URL'ning #tgWebAppData qismida keladi.
// index.html uni sahifa ochilishi bilan saqlab qo'yadi — Telegram skripti (telegram.org) sekin yoki
// umuman yuklanmasa ham ilova qotmaydi va avtomatik kirish ishlaydi.
type TgWebApp = { initData?: string; platform?: string; ready?: () => void; expand?: () => void; openLink?: (url: string) => void };

export function tgWebApp(): TgWebApp | null {
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp ?? null;
}

export function tgInitData(): string {
  if (typeof window === 'undefined') return '';
  const fromSdk = tgWebApp()?.initData;
  if (fromSdk) return fromSdk;
  return (window as unknown as { __tgInitData?: string }).__tgInitData ?? '';
}

export const inTelegram = (): boolean => !!tgInitData();

/** Sahifa Telegram ichida ochilganmi (SDK hali yuklanmagan bo'lsa ham — URL'dagi tgWebApp belgisidan). */
export function inTelegramWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const tg = tgWebApp();
  if (tg?.platform && tg.platform !== 'unknown') return true;
  if ((window as unknown as { TelegramWebviewProxy?: unknown }).TelegramWebviewProxy) return true;
  return inTelegram() || /tgWebApp/.test(location.hash + location.search);
}

/**
 * Havolani tashqi brauzerda ochadi. Telegram ichidagi WebView yuklab olish (masalan, APK) havolalarini
 * o'zi ochmaydi — Telegram.WebApp.openLink telefon brauzerini ochadi, yuklab olish o'sha yerda boshlanadi.
 * Telegram tashqarisida false qaytaradi (oddiy havola ishlayversin).
 */
export function openExternal(url: string): boolean {
  if (!inTelegramWebView()) return false;
  const abs = new URL(url, location.href).href;
  const tg = tgWebApp();
  try {
    if (tg?.openLink) {
      tg.openLink(abs);
      return true;
    }
  } catch {
    /* pastdagi zaxira yo'l */
  }
  // SDK (telegram.org) yuklanmagan bo'lsa ham Telegram ilovasi o'z ko'prigini beradi.
  const w = window as unknown as {
    TelegramWebviewProxy?: { postEvent: (type: string, data: string) => void };
    external?: { notify?: (msg: string) => void };
  };
  const data = JSON.stringify({ url: abs });
  try {
    if (w.TelegramWebviewProxy?.postEvent) {
      w.TelegramWebviewProxy.postEvent('web_app_open_link', data);
      return true;
    }
    if (typeof w.external?.notify === 'function') {
      w.external.notify(JSON.stringify({ eventType: 'web_app_open_link', eventData: { url: abs } }));
      return true;
    }
  } catch {
    /* oddiy yo'l */
  }
  window.open(abs, '_blank');
  return true;
}
