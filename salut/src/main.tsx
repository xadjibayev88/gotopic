import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './state/store';
import { AccountProvider } from './state/account';
import './styles.css';

// Yengil rejim: sekin qurilmalarda (kam xotira/protsessor) shisha blur o'chiriladi — ilova qotmaydi.
try {
  const saved = localStorage.getItem('salut.lite');
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.deviceMemory ?? 8) <= 3 || (navigator.hardwareConcurrency ?? 8) <= 3;
  if (saved === '1' || (saved !== '0' && weak)) document.documentElement.classList.add('lite');
} catch {
  /* e'tiborsiz */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <AccountProvider>
        <App />
      </AccountProvider>
    </StoreProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
