// Telegram Mini App: kirish ma'lumoti (initData) Telegram URL'ning #tgWebAppData qismida keladi.
// index.html uni sahifa ochilishi bilan saqlab qo'yadi — Telegram skripti (telegram.org) sekin yoki
// umuman yuklanmasa ham ilova qotmaydi va avtomatik kirish ishlaydi.
type TgWebApp = { initData?: string; ready?: () => void; expand?: () => void };

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
