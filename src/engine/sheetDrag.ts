// Pastki oynalarni (bottom sheet) barmoq bilan pastga tortib yopish — butun ilova uchun bitta joyda.
// .modal-back ichidagi .sheet tepasida turib (ichki ro'yxat eng tepaga aylantirilgan bo'lsa) pastga tortilsa,
// oyna barmoq ortidan siljiydi; yetarlicha tortilsa — orqa fon bosilgandek yopiladi (har bir oynaning o'z onClose'i).
// Faqat transform — qotmaydi.

const SKIP = 'input[type="range"], textarea, select, .rail-track, .vh2-chars, .vh2-roles, [data-no-drag]';

function scrolledParent(from: Element, stop: Element): boolean {
  for (let el: Element | null = from; el && el !== stop.parentElement; el = el.parentElement) {
    const h = el as HTMLElement;
    if (h.scrollTop > 0 && h.scrollHeight > h.clientHeight) {
      const oy = getComputedStyle(h).overflowY;
      if (oy === 'auto' || oy === 'scroll') return true;
    }
  }
  return false;
}

export function installSheetDrag(): void {
  if (typeof window === 'undefined' || !('ontouchstart' in window)) return;
  let sheet: HTMLElement | null = null;
  let back: HTMLElement | null = null;
  let y0 = 0;
  let x0 = 0;
  let t0 = 0;
  let dy = 0;
  let dragging = false;

  const reset = () => {
    sheet = null;
    back = null;
    dragging = false;
    dy = 0;
  };

  window.addEventListener(
    'touchstart',
    (e) => {
      reset();
      if (e.touches.length !== 1) return;
      const target = e.target as Element | null;
      const s = target?.closest?.('.sheet') as HTMLElement | null;
      const b = s?.parentElement;
      if (!s || !b || !b.classList.contains('modal-back') || target!.closest(SKIP)) return;
      if (scrolledParent(target!, s)) return;
      sheet = s;
      back = b;
      y0 = e.touches[0].clientY;
      x0 = e.touches[0].clientX;
      t0 = performance.now();
    },
    { passive: true },
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (!sheet) return;
      const d = e.touches[0].clientY - y0;
      const dx = Math.abs(e.touches[0].clientX - x0);
      if (!dragging) {
        if (d < -4 || dx > Math.abs(d)) return reset(); // yuqoriga aylantirish yoki yonga surish — tegmaymiz
        if (d < 10) return;
        dragging = true;
        sheet.style.transition = 'none';
        sheet.style.animation = 'none';
      }
      dy = Math.max(0, d - 10);
      e.preventDefault();
      sheet.style.transform = `translate3d(0, ${dy}px, 0)`;
    },
    { passive: false },
  );

  const end = () => {
    if (!sheet || !dragging) return reset();
    const s = sheet;
    const b = back!;
    const v = dy / Math.max(1, performance.now() - t0); // px/ms
    const close = dy > Math.min(140, s.offsetHeight * 0.28) || (v > 0.6 && dy > 40);
    s.style.transition = 'transform .24s cubic-bezier(.3, .7, .4, 1)';
    if (close) {
      s.style.transform = 'translate3d(0, 110%, 0)';
      window.setTimeout(() => {
        b.click(); // oynaning o'z yopish mantig'i (orqa fonni bosish)
        // Oyna yopilmagan bo'lsa (masalan, jarayon ketayotgan) — joyiga qaytaramiz.
        window.setTimeout(() => {
          if (s.isConnected) {
            s.style.transform = '';
          }
        }, 60);
      }, 200);
    } else s.style.transform = '';
    reset();
  };
  window.addEventListener('touchend', end, { passive: true });
  window.addEventListener('touchcancel', end, { passive: true });
}
