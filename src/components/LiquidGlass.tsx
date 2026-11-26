// Liquid Glass (Apple iOS 26 uslubi) — .claude/skills/liquid-glass texnikasi asosida:
// backdrop-filter: blur() + url(#svg-filter), filtr ichida feImage (displacement map) → feDisplacementMap.
// Shisha chetida orqadagi tasvir linzadek egiladi (refraksiya), markaz tekis qoladi.
//
// Displacement map elementning aniq o'lchamida canvas'da quriladi (SDF, «spine» bo'ylab ichkariga yo'nalish),
// faqat o'lcham o'zgarganda qayta hisoblanadi. Hech narsa animatsiya qilinmaydi — filtr qiymatlari o'zgarmaydi.
// To'liq effekt faqat Chromium'da (Android Chrome, Edge, desktop Chrome); boshqa joyda oddiy blur qoladi.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

const KEY = 'voila.liquidGlass';
const EVENT = 'voila:liquid-glass';

/** Brauzer backdrop-filter ichida SVG url() ni qo'llab-quvvatlaydimi (faqat Chromium). */
export function liquidGlassSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iOS'dagi barcha brauzerlar WebKit — url() ishlamaydi. Firefox ham.
  if (/iPhone|iPad|iPod|CriOS|FxiOS|Firefox\//.test(ua)) return false;
  if (!/Chrome\/|Chromium\/|Edg\//.test(ua)) return false;
  const css = window.CSS;
  return !!css?.supports && (css.supports('backdrop-filter', 'url(#a)') || css.supports('-webkit-backdrop-filter', 'url(#a)'));
}

export function readLiquidGlass(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function saveLiquidGlass(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* saqlash bloklangan */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }));
}

/** Yoqilgan + brauzer qo'llaydi + yengil rejim emas. */
export function useLiquidGlassOn(): boolean {
  const [on, setOn] = useState(() => readLiquidGlass());
  const [lite, setLite] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('lite'));
  useEffect(() => {
    const onPref = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, onPref);
    const mo = new MutationObserver(() => setLite(document.documentElement.classList.contains('lite')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener(EVENT, onPref);
      mo.disconnect();
    };
  }, []);
  return on && !lite && liquidGlassSupported();
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Displacement map piksellari (RGBA). R = gorizontal, G = vertikal siljish, 128 = neytral.
 * Bezel (chet) zonasida vektor ichkariga — eng yaqin «umurtqa» (markaziy kesma) nuqtasiga qaraydi;
 * kuch chetda 1, bezel chuqurligida 0 (smoothstep). Uzun tabletka shaklida ham normal to'g'ri chiqadi.
 */
export function displacementPixels(w: number, h: number, radius: number, bezel: number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4);
  const r = Math.min(radius, w / 2, h / 2);
  const hx = w / 2 - r;
  const hy = h / 2 - r;
  // Markaziy kesma: uzun tomon bo'ylab.
  const sx = Math.max(0, w / 2 - h / 2);
  const sy = Math.max(0, h / 2 - w / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const cx = x + 0.5 - w / 2;
      const cy = y + 0.5 - h / 2;
      const qx = Math.abs(cx) - hx;
      const qy = Math.abs(cy) - hy;
      const dist = Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
      let R = 128;
      let G = 128;
      if (dist <= 0 && dist >= -bezel) {
        const t = smoothstep(-bezel, 0, dist);
        const nxp = Math.max(-sx, Math.min(sx, cx));
        const nyp = Math.max(-sy, Math.min(sy, cy));
        const dx = nxp - cx;
        const dy = nyp - cy;
        const len = Math.hypot(dx, dy);
        if (len > 1e-6) {
          R = 128 + (t * dx * 127) / len;
          G = 128 + (t * dy * 127) / len;
        }
      }
      px[i] = R;
      px[i + 1] = G;
      px[i + 2] = 128;
      px[i + 3] = 255;
    }
  }
  return px;
}

function mapDataUrl(w: number, h: number, radius: number, bezel: number): string | null {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.putImageData(new ImageData(displacementPixels(w, h, radius, bezel), w, h), 0, 0);
  return c.toDataURL('image/png');
}

/**
 * Shisha qatlami: ota element ichiga birinchi bola sifatida qo'yiladi (absolute, inset 0).
 * Ota elementga `lg-on` klassini qo'shing — uning o'z blur'i o'chadi, shu qatlam o'rnini bosadi.
 */
export function GlassRefraction({ radius, scale, bezel = 30, blur = 0.4, className = '' }: { radius: number; scale?: number; bezel?: number; blur?: number; className?: string }) {
  const [eff, setEff] = useState({ bezel, scale: Math.abs(scale ?? 30) });
  const id = `lg-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const layer = useRef<HTMLSpanElement>(null);
  const [map, setMap] = useState<{ w: number; h: number; href: string } | null>(null);

  // useLayoutEffect: xarita birinchi chizishdan OLDIN quriladi — panel «oddiy blur → shisha» bo'lib silkinmaydi.
  useLayoutEffect(() => {
    const el = layer.current;
    if (!el) return;
    let timer = 0;
    let lastW = 0;
    let lastH = 0;
    const build = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (w < 8 || h < 8) return;
      // Mayda o'zgarishlarda (shrift yuklanishi, ixcham panel) qayta qurmaymiz — har qayta qurish filtrni almashtiradi.
      if (Math.abs(w - lastW) < 8 && Math.abs(h - lastH) < 8) return;
      lastW = w;
      lastH = h;
      const b = Math.min(bezel, h / 2 - 1);
      // Namuna faqat ichkaridan olinadi (musbat scale + ichkariga vektor): tashqaridan olinsa brauzer chetdagi
      // piksellarni cho'zib, shisha ichida chiziqlar chizadi. Buklanmaslik sharti: chetdan d masofadagi piksel
      // d + k·f(d) dan namuna oladi, k·max|f'| < 1; smoothstep uchun max|f'| = 1.5/b, k = scale/2 → scale < 2b/1.5.
      const safe = Math.round(((2 * b) / 1.5) * 0.85);
      setEff({ bezel: b, scale: scale === undefined ? safe : Math.min(Math.abs(scale), safe) });
      const href = mapDataUrl(w, h, Math.min(radius, h / 2), b);
      if (href) setMap({ w, h, href });
    };
    build();
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = window.setTimeout(build, 300);
    });
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [radius, bezel, scale]);

  // iPhone kabi: tiniq (kam blur), yorug' va to'yingan rang.
  const filter = map ? `blur(${blur}px) url(#${id}) saturate(1.5) brightness(1.06)` : `blur(${blur}px) saturate(1.5) brightness(1.06)`;
  return (
    <span ref={layer} className={`lg-refract ${className}`} style={{ backdropFilter: filter, WebkitBackdropFilter: filter }} aria-hidden="true">
      {map && (
        <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} focusable="false">
          <defs>
            <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width={map.w} height={map.h} filterUnits="userSpaceOnUse">
              <feImage result="map" x="0" y="0" width={map.w} height={map.h} preserveAspectRatio="none" href={map.href} />
              {/* Chetda kamalakdek rang ajralishi (chromatic aberration): R/G/B kanallari biroz farqli egiladi. */}
              <feDisplacementMap in="SourceGraphic" in2="map" scale={eff.scale} xChannelSelector="R" yChannelSelector="G" result="dr" />
              <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={eff.scale * 1.04} xChannelSelector="R" yChannelSelector="G" result="dg" />
              <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={eff.scale * 1.08} xChannelSelector="R" yChannelSelector="G" result="db" />
              <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
              <feBlend in="r" in2="g" mode="screen" result="rg" />
              <feBlend in="rg" in2="b" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}
    </span>
  );
}
