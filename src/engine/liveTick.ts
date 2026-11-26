// «Jonlanish» taymeri: SVG ichidagi mayda bezak animatsiyalari (dum, quloq, ko'z qisish, tanga yaltirog'i,
// baliqcha dumi, olov uchqunlari) to'xtovsiz emas — har 8 soniyada ~2,6 s qisqa to'lqin bo'lib ishlaydi.
// SVG ichidagi animatsiyalar GPU'da emas, asosiy oqimda har kadr hisoblanadi; shu taymer ilova bo'sh
// turgandagi protsessor yukini bir necha barobar kamaytiradi. Ilova fonda bo'lsa — umuman ishlamaydi.
const PERIOD = 8000;

export function installLiveTick(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const pulse = () => {
    if (document.hidden) return;
    root.classList.remove('live');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('live')));
  };
  root.classList.add('live');
  window.setInterval(pulse, PERIOD);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) pulse();
  });
}
