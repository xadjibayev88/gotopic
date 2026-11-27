// UI motion yordamchilari: skrollda paydo bo'lish (blur-in + tilt-in) va raqamlarning sanab chiqishi (count-up).
// Yengil rejim (html.lite) va «prefers-reduced-motion» da hech narsa yashirilmaydi va animatsiya qilinmaydi.

const REVEAL_SELECTOR = [
  '.scard',
  '.pcard',
  '.st-card',
  '.panel',
  '.unit-wrap',
  '.word-row',
  '.setting',
  '.section-title',
  '.stats-grid > *',
  '.lb-row',
  '.shop-item',
].join(',');

/**
 * Yengil UI harakatlari (transform/opacity: ro'yxat↔kartalar o'tishi, menyu, tugmalar) — Android ilovada ham ishlaydi.
 * Faqat qurilma sekinligi sabab yoqilgan yengil rejim yoki «prefers-reduced-motion» da o'chadi.
 */
export function uiMotionAllowed(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const c = document.documentElement.classList;
  if (c.contains('lite') && !c.contains('app')) return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function motionAllowed(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (document.documentElement.classList.contains('lite')) return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

let started = false;

/**
 * Sahifadagi kartalarni kuzatadi. Birinchi marta ko'ringan paytda ekranda bo'lganlari tegilmaydi
 * (miltillash yo'q); ekrandan pastdagilari yashirinadi va skroll qilinganda xiralikdan aniqlikka,
 * biroz egilgan holatdan to'g'rilanib chiqadi.
 */
export function startScrollReveal(root: HTMLElement = document.body): () => void {
  if (started || typeof IntersectionObserver === 'undefined' || typeof MutationObserver === 'undefined') return () => undefined;
  started = true;
  const decided = new WeakSet<Element>();
  const tracked = new WeakSet<Element>();
  let batch = 0;
  let batchTimer = 0;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (!el.getClientRects().length) continue; // yashirin bo'limda — keyinroq hal qilinadi
        if (!decided.has(el)) {
          decided.add(el);
          if (e.isIntersecting || !motionAllowed()) {
            io.unobserve(el);
            continue;
          }
          el.classList.add('rv');
          continue;
        }
        if (e.isIntersecting) {
          const delay = Math.min(batch++, 5) * 55;
          el.style.setProperty('--rv-delay', `${delay}ms`);
          el.classList.add('rv-in');
          io.unobserve(el);
          window.clearTimeout(batchTimer);
          batchTimer = window.setTimeout(() => (batch = 0), 120);
          el.addEventListener('animationend', () => {
            el.classList.remove('rv', 'rv-in');
            el.style.removeProperty('--rv-delay');
          }, { once: true });
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
  );

  const scan = () => {
    root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      if (tracked.has(el) || el.closest('.call, .modal-back, .session')) return;
      tracked.add(el);
      io.observe(el);
    });
  };
  let raf = 0;
  const mo = new MutationObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(scan);
  });
  mo.observe(root, { childList: true, subtree: true });
  scan();
  return () => {
    mo.disconnect();
    io.disconnect();
    started = false;
  };
}

/** Yumshoq tugash (ease-out-expo). */
export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** `from` dan `to` gacha oraliq qiymat, butun songa yaxlitlangan. */
export function countValue(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * easeOutExpo(Math.max(0, Math.min(1, t))));
}
