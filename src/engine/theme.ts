// Kunduzgi / tungi rejim. «auto» — telefon sozlamasiga qarab (kunduzi yorug', kechasi qorong'i).
export type ThemePref = 'auto' | 'light' | 'dark';
const KEY = 'salut.theme';

export function themePref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

function resolve(p: ThemePref): 'light' | 'dark' {
  if (p !== 'auto') return p;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(p: ThemePref = themePref()) {
  const t = resolve(p);
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#f3f1fb' : '#0b0d24');
}

export function setThemePref(p: ThemePref) {
  try {
    localStorage.setItem(KEY, p);
  } catch {
    /* saqlanmasa ham bo'ladi */
  }
  applyTheme(p);
}

/** Ilova ochilganda: mavzuni qo'llash va telefon sozlamasi o'zgarsa kuzatish. */
export function initTheme() {
  applyTheme();
  window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', () => themePref() === 'auto' && applyTheme());
}
