// Kunduzgi / tungi rejim kaliti (neomorfik). Bosilganda: kichkina odamcha paydo bo'lib, teshik tomon yuradi,
// sakrab teshikka tushadi — teshik qorayib ochiladi, so'ng butun ilova mavzusi almashadi, quyosh ↔ oy.
import { useEffect, useRef, useState } from 'react';
import { motionAllowed } from '../engine/motion';

const W = 240;
const H = 96;
const GROUND = 70;
const HOLE_X = 196;
const START_X = 104;

/** Odamchaning t (s) vaqtdagi holati. */
export function stickPose(t: number) {
  if (t < 0.3) {
    // paydo bo'ladi: yuqoridan tushib, yerga qo'nadi
    const k = t / 0.3;
    return { x: START_X, y: GROUND - 30 * (1 - k * k), leg: 0, arm: 0.5 + (1 - k) * 1.2, swing: 0, sink: 0, visible: true };
  }
  if (t < 1.35) {
    // teshik tomon yuradi
    const k = (t - 0.3) / 1.05;
    const swing = Math.sin((t - 0.3) * 15);
    return { x: START_X + (HOLE_X - 18 - START_X) * k, y: GROUND - Math.abs(swing) * 1.5, leg: swing * 0.5, arm: 0.45, swing: swing * 0.45, sink: 0, visible: true };
  }
  if (t < 1.75) {
    // qo'llarini ko'tarib sakraydi
    const k = (t - 1.35) / 0.4;
    return { x: HOLE_X - 18 + 18 * k, y: GROUND - Math.sin(k * Math.PI) * 18, leg: 0.35, arm: 0.45 + k * 2.2, swing: 0, sink: 0, visible: true };
  }
  if (t < 2.05) {
    // teshikka tushib ketadi
    const k = (t - 1.75) / 0.3;
    return { x: HOLE_X, y: GROUND, leg: 0.2, arm: 2.7, swing: 0, sink: k * 34, visible: true };
  }
  return { x: HOLE_X, y: GROUND, leg: 0, arm: 0, swing: 0, sink: 34, visible: false };
}

/** Teshik: avval oddiy chuqurcha; odamcha tushayotganda qorayib kengayadi, so'ng yumshoq yopiladi. */
export function holeState(t: number) {
  if (t < 1.5) return { rx: 15, dark: 0 };
  if (t < 2.05) {
    const k = (t - 1.5) / 0.55;
    return { rx: 15 + 6 * k, dark: Math.min(1, k * 1.4) };
  }
  const k = Math.min(1, (t - 2.05) / 0.7);
  return { rx: 21 - 6 * k, dark: 1 - k };
}

const TOTAL = 2.75;
const SWITCH_AT = 2.05;

/** Oy tugmachasining o'ng cheti (stage koordinatasida) — odamcha shu yerga yetib, chiroqni yoqadi. */
const KNOB_REACH_X = 92;

/**
 * Tungi → kunduzgi: odamcha qo'llarini yoyib teshikdan sakrab chiqadi, qo'nadi, chapdagi oy tugmachasi
 * tomon yuradi, yetib borib qo'lini cho'zadi — shu payt chiroq yonadi (rejim yorug'ga o'tadi).
 */
export function wakePose(t: number) {
  const landX = HOLE_X - 28;
  if (t < 0.5) {
    const k = t / 0.5;
    // teshik ichidan yoy bo'ylab chiqib, chaproqqa qo'nadi
    return { x: HOLE_X - 28 * k, y: GROUND + 26 * (1 - k) - Math.sin(k * Math.PI) * 30, leg: 0.45, arm: 1.55, swing: 0, sink: 0, visible: true };
  }
  if (t < 1.7) {
    const k = (t - 0.5) / 1.2;
    const swing = Math.sin((t - 0.5) * 15);
    return { x: landX + (KNOB_REACH_X - landX) * k, y: GROUND - Math.abs(swing) * 1.5, leg: swing * 0.5, arm: 0.45, swing: swing * 0.45, sink: 0, visible: true };
  }
  if (t < 2.05) {
    // to'xtab, qo'lini tugmachaga cho'zadi
    const k = Math.min(1, (t - 1.7) / 0.2);
    return { x: KNOB_REACH_X, y: GROUND, leg: 0, arm: 0.45 + k * 1.1, swing: k * 0.9, sink: 0, visible: true };
  }
  return { x: KNOB_REACH_X, y: GROUND, leg: 0, arm: 1.55, swing: 0.9, sink: 0, visible: t < 2.3 };
}

/** Tungi → kunduzgi teshik: odamcha chiqayotganda qora, chiroq yongach yorug' chuqurchaga aylanadi. */
export function wakeHole(t: number) {
  if (t < WAKE_SWITCH_AT) return { rx: t < 0.5 ? 15 + 4 * Math.sin((t / 0.5) * Math.PI) : 15, dark: 1 };
  const k = Math.min(1, (t - WAKE_SWITCH_AT) / 0.5);
  return { rx: 15, dark: 1 - k };
}

const WAKE_SWITCH_AT = 2.05;
const WAKE_TOTAL = 2.7;

export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: (next: boolean) => void }) {
  const [running, setRunning] = useState(false);
  const g = useRef<SVGGElement>(null);
  const parts = useRef<Record<string, SVGElement | null>>({});
  const hole = useRef<SVGEllipseElement>(null);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const draw = (t: number, wake: boolean) => {
    const p = wake ? wakePose(t) : stickPose(t);
    const h = wake ? wakeHole(t) : holeState(t);
    const el = g.current;
    if (el) {
      el.style.opacity = p.visible ? '1' : '0';
      el.setAttribute('transform', `translate(${p.x} ${p.y + p.sink})`);
    }
    // Oyoq va qo'llar: son burchaklari (radian), bo'g'imlardan chiziq
    const leg = (a: number) => `M0 -12 L${Math.sin(a) * 9} 0`;
    // Qo'l: burchak pastga osilgan holatdan (0 — pastga, π — tepaga); s — chap/o'ng.
    const arm = (a: number, side: number) => `M0 -21 L${side * Math.sin(a) * 8} ${-21 + Math.cos(a) * 8}`;
    parts.current.legL?.setAttribute('d', leg(p.leg));
    parts.current.legR?.setAttribute('d', leg(-p.leg));
    parts.current.armL?.setAttribute('d', arm(p.arm + p.swing, -1));
    parts.current.armR?.setAttribute('d', arm(p.arm - p.swing, 1));
    if (hole.current) {
      hole.current.setAttribute('rx', String(h.rx));
      hole.current.style.setProperty('--dark', String(h.dark));
    }
  };

  const toggle = () => {
    if (running) return;
    const next = !dark;
    if (!motionAllowed()) {
      onToggle(next);
      return;
    }
    setRunning(true);
    // Tungidan kunduzgiga: odamcha teshikdan chiqib chiroqni yoqadi; aks holda — teshikka sakrab kiradi.
    const wake = dark;
    const t0 = performance.now();
    let switched = false;
    const step = (now: number) => {
      const t = (now - t0) / 1000;
      draw(t, wake);
      if (!switched && t >= (wake ? WAKE_SWITCH_AT : SWITCH_AT)) {
        switched = true;
        onToggle(next);
      }
      if (t < (wake ? WAKE_TOTAL : TOTAL)) raf.current = requestAnimationFrame(step);
      else setRunning(false);
    };
    raf.current = requestAnimationFrame(step);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${dark ? 'is-dark' : 'is-light'} ${running ? 'running' : ''}`}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Tungi rejim yoqilgan — kunduzgiga o‘tish' : 'Kunduzgi rejim yoqilgan — tungiga o‘tish'}
      onClick={toggle}
    >
      <span className="tt-knob" aria-hidden="true">
        <svg className="tt-sun" viewBox="0 0 24 24" width="26" height="26">
          <circle cx="12" cy="12" r="4.6" fill="#f59e0b" />
          <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7" />
          </g>
        </svg>
        <svg className="tt-moon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z" fill="#38bdf8" />
        </svg>
      </span>
      <svg className="tt-stage" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <clipPath id="ttAboveGround">
            {/* Yer ustidagi hamma narsa + teshik ichi: tushayotgan odamcha teshik chetidan pastda yo'qoladi. */}
            <rect x="0" y="0" width={W} height={GROUND + 1} />
            <ellipse cx={HOLE_X} cy={GROUND + 1} rx="14" ry="5" />
          </clipPath>
        </defs>
        <ellipse ref={hole} className="tt-hole" cx={HOLE_X} cy={GROUND + 2} rx="15" ry="5" />
        <g clipPath="url(#ttAboveGround)">
          <g ref={g} className="tt-stick" style={{ opacity: 0 }}>
            <circle cx="0" cy="-26" r="3.6" />
            <path d="M0 -22 L0 -12" />
            <path ref={(e) => { parts.current.legL = e; }} d="M0 -12 L-4 0" />
            <path ref={(e) => { parts.current.legR = e; }} d="M0 -12 L4 0" />
            <path ref={(e) => { parts.current.armL = e; }} d="M0 -21 L-6 -15" />
            <path ref={(e) => { parts.current.armR = e; }} d="M0 -21 L6 -15" />
          </g>
        </g>
      </svg>
    </button>
  );
}
