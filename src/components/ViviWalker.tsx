// Yuqori panel ichida yuradigan kichkina Hori (yon tomondan). Yuradi, o'tiradi, ko'z qisadi, dumini
// silkitadi, uzoq tegilmasa uxlab qoladi; bosilsa sakraydi, tanga/seriya oshsa quvonib sakraydi.
// Qotmasligi uchun: harakat faqat transform (CSS transition/animation), JS esa faqat bir necha soniyada
// bir marta holatni almashtiradi. Sahifa yashirin bo'lsa yoki «kam harakat» yoqilgan bo'lsa — to'xtaydi.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motionAllowed } from '../engine/motion';
import { FUR, FUR_SHADE, LINE, INK, STRIPE } from './Mascot';

type Mode = 'walk' | 'sit' | 'sleep' | 'jump';

const CAT_W = 40; // px, ekrandagi kenglik
const SPEED = 26; // px/soniya
const SITS_BEFORE_SLEEP = 4;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function ViviWalker({ cheerKey }: { cheerKey: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('sit');
  const [x, setX] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [dur, setDur] = useState(0);
  const [heart, setHeart] = useState(0);
  const timer = useRef(0);
  const width = useRef(0);
  const xRef = useRef(0);
  const sits = useRef(0);
  const modeRef = useRef<Mode>('sit');
  const firstCheer = useRef(true);

  const set = (m: Mode) => {
    modeRef.current = m;
    setMode(m);
  };

  // Keyingi harakat: yo'lakda tasodifiy joyga yurib boradi, so'ng o'tirib dam oladi.
  const next = () => {
    clearTimeout(timer.current);
    if (!motionAllowed() || document.hidden) return;
    const free = Math.max(0, width.current - CAT_W);
    if (free < 12) {
      set('sit');
      return;
    }
    if (modeRef.current === 'walk') {
      sits.current++;
      if (sits.current >= SITS_BEFORE_SLEEP && Math.random() < 0.55) {
        set('sleep');
        timer.current = window.setTimeout(() => ((sits.current = 0), next()), rand(9000, 16000));
        return;
      }
      set('sit');
      timer.current = window.setTimeout(next, rand(6000, 12000));
      return;
    }
    let to = rand(0, free);
    if (Math.abs(to - xRef.current) < 24) to = xRef.current > free / 2 ? rand(0, free / 3) : rand((free * 2) / 3, free);
    const d = Math.abs(to - xRef.current) / SPEED;
    setDir(to >= xRef.current ? 1 : -1);
    setDur(d);
    xRef.current = to;
    setX(to);
    set('walk');
    timer.current = window.setTimeout(next, d * 1000 + 60);
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      width.current = el.clientWidth;
      const free = Math.max(0, width.current - CAT_W);
      if (xRef.current > free) {
        xRef.current = free;
        setDur(0);
        setX(free);
      }
    };
    measure();
    xRef.current = Math.max(0, (width.current - CAT_W) * 0.35);
    setX(xRef.current);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    timer.current = window.setTimeout(next, 1400);
    const vis = () => {
      if (document.hidden) {
        clearTimeout(timer.current);
        // Yashirin bo'lsa joyida o'tiradi (transition to'xtaydi).
        setDur(0);
        set('sit');
      } else timer.current = window.setTimeout(next, 800);
    };
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearTimeout(timer.current);
      ro.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const jump = () => {
    if (!motionAllowed()) return;
    clearTimeout(timer.current);
    // Yurib ketayotgan bo'lsa — turgan joyida to'xtaydi.
    const node = track.current?.querySelector<HTMLElement>('.vw-pos');
    if (node && modeRef.current === 'walk') {
      const m = new DOMMatrixReadOnly(getComputedStyle(node).transform);
      xRef.current = m.m41;
      setDur(0);
      setX(m.m41);
    }
    sits.current = 0;
    set('jump');
    setHeart((h) => h + 1);
    timer.current = window.setTimeout(() => {
      set('sit');
      timer.current = window.setTimeout(next, rand(1200, 2600));
    }, 750);
  };

  // Tanga yoki seriya oshsa — quvonib sakraydi.
  useEffect(() => {
    if (firstCheer.current) {
      firstCheer.current = false;
      return;
    }
    jump();
  }, [cheerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="vw-track" ref={track}>
      <button
        type="button"
        className={`vw-pos vw-${mode}`}
        style={{ transform: `translate3d(${x}px,0,0)`, transitionDuration: `${dur}s` } as CSSProperties}
        onClick={jump}
        aria-label="Hori — bosing, sakraydi"
        title="Hori"
      >
        {heart > 0 && (
          <span key={heart} className="vw-heart" aria-hidden="true">
            ♥
          </span>
        )}
        {mode === 'sleep' && (
          <span className="vw-z" aria-hidden="true">
            z<i>z</i>
          </span>
        )}
        <span className="vw-flip" style={{ transform: `scaleX(${dir})` }}>
          <span className="vw-wad">
            <CatSide />
          </span>
        </span>
      </button>
    </div>
  );
}

/** Yon tomondan Hori: oq Amur yo'lbarschasi — qora chiziqlar, halqali dum, yumaloq quloqlar. */
function CatSide() {
  return (
    <svg className="vw-cat" viewBox="0 0 44 32" width={CAT_W} height="29" aria-hidden="true">
      <ellipse className="vw-shadow" cx="20" cy="29.4" rx="13" ry="1.6" fill="#000" opacity=".22" />
      <g className="vw-bodyg">
        <g className="vw-tail">
          <path d="M9.5 17.5 C3 16.5 2.5 8 7 5.5" fill="none" stroke={LINE} strokeWidth="4.6" strokeLinecap="round" />
          <path d="M9.5 17.5 C3 16.5 2.5 8 7 5.5" fill="none" stroke={FUR} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M9.5 17.5 C3 16.5 2.5 8 7 5.5" fill="none" stroke={STRIPE} strokeWidth="2.6" strokeDasharray="1.4 2.4" />
        </g>
        {/* uzoqdagi oyoqlar */}
        <g className="vw-legs far">
          <rect className="vw-leg a" x="12.6" y="19" width="3" height="9" rx="1.5" fill={FUR_SHADE} stroke={LINE} strokeWidth="1.1" />
          <rect className="vw-leg b" x="25.6" y="19" width="3" height="9" rx="1.5" fill={FUR_SHADE} stroke={LINE} strokeWidth="1.1" />
        </g>
        <ellipse cx="19.5" cy="18" rx="11.5" ry="6.6" fill={FUR} stroke={LINE} strokeWidth="1.5" />
        <path d="M11 20.5 Q19 24.5 28 20.5" fill="none" stroke={FUR_SHADE} strokeWidth="2" strokeLinecap="round" />
        <g fill={STRIPE}>
          <path d="M14 12.2 C15.6 14 15.8 16.4 14.8 18.4 C14 16.6 13.4 14.4 14 12.2 Z" />
          <path d="M19 11.5 C20.6 13.5 20.8 16 19.8 18.2 C19 16.2 18.4 13.8 19 11.5 Z" />
          <path d="M24 12 C25.6 13.8 25.8 16.2 24.8 18.2 C24 16.4 23.4 14.2 24 12 Z" />
        </g>
        {/* yaqindagi oyoqlar */}
        <g className="vw-legs near">
          <rect className="vw-leg b" x="10" y="19.5" width="3.2" height="9" rx="1.6" fill={FUR} stroke={LINE} strokeWidth="1.2" />
          <rect className="vw-leg a" x="23.2" y="19.5" width="3.2" height="9" rx="1.6" fill={FUR} stroke={LINE} strokeWidth="1.2" />
        </g>
      </g>
      {/* O'tirgan Hori — alohida chizilgan siluet: tik ko'krak, yumaloq son, oldingi panjalar yerda,
          dum orqada jingalak. Yurish tanasi o'tirganda yashiriladi (qiyalatilmaydi). */}
      <g className="vw-sitpose">
        <g className="vw-tail2">
          <path d="M13 26.8 C5.5 27.4 3.2 19.5 6.8 15.2" fill="none" stroke={LINE} strokeWidth="4.6" strokeLinecap="round" />
          <path d="M13 26.8 C5.5 27.4 3.2 19.5 6.8 15.2" fill="none" stroke={FUR} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M13 26.8 C5.5 27.4 3.2 19.5 6.8 15.2" fill="none" stroke={STRIPE} strokeWidth="2.6" strokeDasharray="1.4 2.4" />
        </g>
        <rect x="27.3" y="17" width="3" height="11.6" rx="1.5" fill={FUR_SHADE} stroke={LINE} strokeWidth="1.1" />
        <path d="M24.5 10.8 C30.4 12 31 20 29.8 28.5 L14.2 28.5 C9.2 28.5 8.6 21.8 11.2 17.6 C13.6 13.8 18.2 11 24.5 10.8 Z" fill={FUR} stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M26.6 15.5 Q24.8 19 26.4 22.5" fill="none" stroke={FUR_SHADE} strokeWidth="1.8" strokeLinecap="round" />
        <g fill={STRIPE}>
          <path d="M14.5 15.6 C16.4 17 17 19.4 16.4 21.6 C15.4 19.8 14.6 17.8 14.5 15.6 Z" />
          <path d="M19.5 13.4 C21.4 14.8 22 17.2 21.4 19.4 C20.4 17.6 19.6 15.6 19.5 13.4 Z" />
        </g>
        <path d="M11.8 26.6 C10.8 20.4 18.8 18.6 20.8 25.4" fill="none" stroke={LINE} strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="17.4" cy="28.5" rx="3.4" ry="1.25" fill={FUR} stroke={LINE} strokeWidth="1.1" />
        <rect x="23.9" y="17.6" width="3.3" height="11" rx="1.65" fill={FUR} stroke={LINE} strokeWidth="1.2" />
        <ellipse cx="26" cy="28.6" rx="2.5" ry="1.15" fill={FUR} stroke={LINE} strokeWidth="1.1" />
      </g>
      <g className="vw-head">
        <path d="M25.6 7.6 C24.2 4.4 25.6 1.4 28.4 1.4 C30.6 1.4 31.8 3.2 31.6 5 Z" fill={FUR} stroke={LINE} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M26.9 5.9 C26.4 4.2 27.2 2.8 28.4 2.8 C29.5 2.8 30.2 3.7 30.2 4.8 Z" fill="#FBCFE8" />
        <path d="M33.2 4.6 C34 2.6 35.6 1.4 37.4 1.8 C39.2 2.4 39.4 5 38.6 7.6 Z" fill={FUR} stroke={LINE} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M34.6 4.6 C35.2 3.4 36.2 2.8 37.2 3.2 C38 3.6 38 4.9 37.6 6 Z" fill="#FBCFE8" />
        <circle cx="32" cy="11.2" r="7.4" fill={FUR} stroke={LINE} strokeWidth="1.5" />
        <g fill={STRIPE} className="vw-stripes">
          <path d="M30.2 4.4 C31 5.6 31.2 7 30.8 8.2 C30.2 7 29.9 5.7 30.2 4.4 Z" />
          <path d="M32.6 4.2 C33.4 5.4 33.6 6.8 33.2 8 C32.6 6.8 32.3 5.5 32.6 4.2 Z" />
          <path d="M25.4 10.4 C26.8 10.6 27.8 11.2 28.4 12.2 C27.2 12 26 12 25 12.4 Z" />
        </g>
        <ellipse className="vw-eye" cx="35" cy="10.4" rx="1.35" ry="1.8" fill={INK} />
        <circle cx="35.4" cy="9.8" r="0.45" fill="#fff" />
        <path className="vw-eye-shut" d="M33.6 10.8 Q35 12 36.4 10.8" fill="none" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="34.2" cy="14" r="1.5" fill="#F9A8D4" opacity=".7" />
        <path d="M38.6 12.4 l0.9 -0.5 l0.1 1 z" fill="#F472B6" />
        <g stroke={LINE} strokeWidth=".6" strokeLinecap="round" opacity=".6">
          <path d="M38.5 13.6 L43 12.8" />
          <path d="M38.5 14.6 L42.8 15.2" />
        </g>
      </g>
    </svg>
  );
}
