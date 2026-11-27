// Statistika uchun anonim «kirish» belgisi: tasodifiy qurilma ID (shaxsiy ma'lumot emas).
// Ilova ochilganda va ko'rinib turgan paytda har 5 daqiqada yuboriladi — admin «hozir ilovada» sonini ko'radi.

function deviceId(): string {
  try {
    let id = localStorage.getItem('salut.device');
    if (!id || !/^[A-Za-z0-9_-]{12,64}$/.test(id)) {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      id = btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      localStorage.setItem('salut.device', id);
    }
    return id;
  } catch {
    return '';
  }
}

function source(): 'web' | 'app' | 'tg' {
  const w = window as Window & { AndroidAuth?: unknown; AndroidAdMob?: unknown; Telegram?: { WebApp?: { initData?: string } } };
  if (w.Telegram?.WebApp?.initData || (window as Window & { __tgInitData?: string }).__tgInitData) return 'tg';
  if (w.AndroidAuth || w.AndroidAdMob || /; wv\)/.test(navigator.userAgent)) return 'app';
  return 'web';
}

export function installVisitPing(): void {
  if (typeof window === 'undefined' || navigator.webdriver) return;
  const ping = () => {
    if (document.hidden) return;
    const d = deviceId();
    if (!d) return;
    void fetch('./api/visit', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ d, s: source() }),
      keepalive: true,
    }).catch(() => undefined);
  };
  // Telegram WebApp skripti yuklanishi uchun biroz kutamiz.
  window.setTimeout(ping, 1500);
  window.setInterval(ping, 5 * 60_000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ping();
  });
}
