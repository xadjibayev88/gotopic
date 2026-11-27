import { StrictMode } from 'react';
import { installVisitPing } from './engine/visit';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './state/store';
import { AccountProvider } from './state/account';
import { AppLockGate } from './components/AppLockGate';
import { IconDefs } from './components/Icons';
import { installSheetDrag } from './engine/sheetDrag';
import { installLiveTick } from './engine/liveTick';
import './styles.css';
import { initTheme } from './engine/theme';
import { initI18n } from './i18n';

initTheme();
installSheetDrag();
installLiveTick();
installVisitPing();

// Yengil rejim: sekin qurilmalarda (kam xotira/protsessor) shisha blur o'chiriladi — ilova qotmaydi.
try {
  const saved = localStorage.getItem('salut.lite');
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.deviceMemory ?? 8) <= 3 || (navigator.hardwareConcurrency ?? 8) <= 3;
  // Android ilova (WebView) ichida doim yengil rejim: WebView blur va cheksiz animatsiyalarni sekin chizadi.
  const w = window as Window & { AndroidAuth?: unknown; AndroidAdMob?: unknown };
  const inApp = !!w.AndroidAuth || !!w.AndroidAdMob || /; wv\)/.test(navigator.userAgent);
  if (inApp) document.documentElement.classList.add('app');
  if (inApp || saved === '1' || (saved !== '0' && weak)) document.documentElement.classList.add('lite');
} catch {
  /* e'tiborsiz */
}

// Interfeys tili: o'zbekchadan boshqa bo'lsa — lug'at yuklangach chiziladi (o'zbekcha matn «miltillamasin»).
void initI18n()
  .catch(() => undefined)
  .then(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <StoreProvider>
          <AccountProvider>
            <IconDefs />
            <AppLockGate>
              <App />
            </AppLockGate>
          </AccountProvider>
        </StoreProvider>
      </StrictMode>,
    ),
  );

declare const __BUILD__: string;

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // Versiya sw.js manzilida — har build'da yangi service worker o'rnatiladi va eski kesh o'chadi.
    navigator.serviceWorker.register(`./sw.js?v=${__BUILD__}`).catch(() => undefined);
  });
  // Eslatma: yangi service worker boshqaruvni olganda sahifani QAYTA YUKLAMAYMIZ — sahifa (index.html) har doim
  // tarmoqdan yangi olinadi, ya'ni allaqachon yangi versiyada. Avval bu yerdagi reload birinchi kirishda va har
  // deploydan keyin ilovani ikki marta ochardi (PIN ekrani ikki marta chiqardi).
}

// Yangi versiya chiqdimi? Ochilganda, ekranga qaytganda va har 5 daqiqada tekshiriladi.
if (import.meta.env.PROD) {
  let checking = false;
  const check = async () => {
    if (checking || document.visibilityState !== 'visible') return;
    checking = true;
    try {
      const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
      const v = (await r.json()) as { build?: string };
      if (v.build && v.build !== __BUILD__) {
        // Dars yoki suhbat o'rtasida bo'lmasa — darhol yangilaymiz.
        // PIN ekrani ochiq bo'lsa ham kutamiz — aks holda qulf ekrani ikki marta chiqadi.
        const busy = document.querySelector('.call, .session, .lock-screen');
        if (!busy) {
          const reg = await navigator.serviceWorker?.getRegistration();
          await reg?.update().catch(() => undefined);
          location.reload();
        }
      }
    } catch {
      /* internet yo'q — keyinroq */
    } finally {
      checking = false;
    }
  };
  window.addEventListener('load', () => setTimeout(check, 1500));
  document.addEventListener('visibilitychange', check);
  setInterval(check, 5 * 60_000);
}
