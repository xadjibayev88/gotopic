// Stripe uslubidagi motion to'plami (Glass → tilt, Button → pay, Number → roll, Line → draw,
// Confetti → burst, Words → kinetic). Qoida: faqat transform/opacity/stroke-dashoffset animatsiya
// qilinadi, backdrop-filter harakatlanuvchi qatlamda yo'q — telefonda ham 60 kadr, «qotmaydi».
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motionAllowed } from '../engine/motion';
import { cardBrand, groupCardNumber } from '../shared/card';

export { cardBrand, groupCardNumber };

/* ---------------- Glass → tilt: to'lov kartasi ---------------- */

export function GlassPayCard({ number, owner, bank, kind, amount }: { number: string; owner?: string; bank?: string; kind: 'card' | 'visa'; amount: string }) {
  const el = useRef<HTMLButtonElement>(null);
  const raf = useRef(0);
  const [copied, setCopied] = useState(false);
  const grouped = groupCardNumber(number);

  // Barmoq/sichqoncha bilan qiyalatish: rAF bilan bitta yozuv, faqat CSS o'zgaruvchilari.
  const move = (x: number, y: number) => {
    const node = el.current;
    if (!node || !motionAllowed()) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = node.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (x - r.left) / r.width));
      const py = Math.max(0, Math.min(1, (y - r.top) / r.height));
      node.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
      node.style.setProperty('--ry', `${(px - 0.5) * 18}deg`);
      node.style.setProperty('--gx', `${px * 100}%`);
      node.classList.add('touching');
    });
  };
  const leave = () => {
    cancelAnimationFrame(raf.current);
    const node = el.current;
    if (!node) return;
    node.classList.remove('touching');
    node.style.removeProperty('--rx');
    node.style.removeProperty('--ry');
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number.replace(/\s/g, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* nusxa olinmadi */
    }
  };

  return (
    <div className="gcard-stage">
      <span className="gcard-blob b1" aria-hidden="true" />
      <span className="gcard-blob b2" aria-hidden="true" />
      <span className="gcard-blob b3" aria-hidden="true" />
      <button
        ref={el}
        type="button"
        className={`gcard ${copied ? 'copied' : ''}`}
        onClick={copy}
        onPointerMove={(e) => move(e.clientX, e.clientY)}
        onPointerLeave={leave}
        onPointerCancel={leave}
        aria-label={`Karta raqami ${grouped}. Nusxa olish uchun bosing`}
      >
        <span className="gcard-shine" aria-hidden="true" />
        <span className="gcard-top">
          <span className="gcard-chip" aria-hidden="true" />
          <svg className="gcard-nfc" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17" />
          </svg>
          <span className="gcard-amount">{amount}</span>
        </span>
        <span className="gcard-number">
          {grouped.split(' ').map((g, i) => (
            <span key={i} style={{ '--gi': i } as CSSProperties}>
              {g}
            </span>
          ))}
        </span>
        <span className="gcard-bottom">
          <span className="gcard-owner">
            <small>{bank || 'Karta egasi'}</small>
            {owner || '—'}
          </span>
          <b className="gcard-brand">{cardBrand(number, kind)}</b>
        </span>
        <span className="gcard-copy" aria-live="polite">
          {copied ? '✓ Nusxa olindi' : 'Bosing — nusxa olinadi'}
        </span>
      </button>
    </div>
  );
}

/* ---------------- Button → pay ---------------- */

export type PayBtnStage = 'idle' | 'busy' | 'done';

/** Tugma bosilganda doiraga aylanadi, halqa foizni ko'rsatadi, so'ng yashil «✓» bilan qayta kengayadi. */
export function PayButton({ stage, progress, disabled, onClick, children, doneLabel }: { stage: PayBtnStage; progress: number; disabled?: boolean; onClick: () => void; children: ReactNode; doneLabel: string }) {
  const C = 2 * Math.PI * 20;
  const p = Math.max(0.25, Math.min(0.92, progress));
  return (
    <button type="button" className={`paybtn pb-${stage}`} disabled={disabled || stage !== 'idle'} onClick={onClick} aria-busy={stage === 'busy'}>
      <span className="pb-label">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        {children}
      </span>
      <svg className="pb-ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="20" className="pb-track" />
        <circle cx="24" cy="24" r="20" className="pb-fill" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - p) }} />
      </svg>
      <span className="pb-done">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        {doneLabel}
      </span>
    </button>
  );
}

/* ---------------- Send money: pul uchib chiqadigan yuborish tugmasi ---------------- */

/** Har bir pul qog'ozi uchun oldindan hisoblangan (deterministik) traektoriya — har renderda tasodif emas. */
const BILLS = Array.from({ length: 14 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const r = a - Math.floor(a);
  const b = Math.sin(i * 78.233) * 12345.678;
  const r2 = b - Math.floor(b);
  return {
    x: -(70 + r * 230), // chapga qancha uchadi (px)
    y: (r2 - 0.5) * 70, // yuqori/pastga
    rot: (r - 0.5) * 300,
    s: 0.75 + r2 * 0.45,
    d: (i % 7) * 0.13 + r * 0.05, // kechikish
  };
});

/**
 * Videodagi «Send money» effekti: to'q tabletka, o'ngda oq doira strelka bilan. Bosilganda doira ichidan
 * yashil pul qog'ozlari aylanib uchib chiqadi va tugma bo'ylab tarqaladi, yozuv «Yuborilmoqda… N%».
 * Tugagach doira yashil «✓» bo'ladi. Faqat transform/opacity.
 */
export function SendButton({ stage, progress, disabled, onClick, label, busyLabel, doneLabel }: { stage: PayBtnStage; progress: number; disabled?: boolean; onClick: () => void; label: string; busyLabel: string; doneLabel: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <button type="button" className={`sendbtn sb-${stage}`} disabled={disabled || stage !== 'idle'} onClick={onClick} aria-busy={stage === 'busy'}>
      <span className="sb-fill" style={{ transform: `scaleX(${stage === 'idle' ? 0 : stage === 'done' ? 1 : Math.max(0.08, progress)})` }} aria-hidden="true" />
      {stage === 'busy' && motionAllowed() && (
        <span className="sb-bills" aria-hidden="true">
          {BILLS.map((b, i) => (
            <i key={i} style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--r': `${b.rot}deg`, '--s': b.s, animationDelay: `${b.d}s` } as CSSProperties}>
              <svg viewBox="0 0 30 16" width="30" height="16">
                <rect x=".5" y=".5" width="29" height="15" rx="2.2" fill="#22c55e" stroke="#15803d" />
                <rect x="3" y="3" width="24" height="10" rx="1.4" fill="none" stroke="#bbf7d0" strokeWidth=".9" />
                <circle cx="15" cy="8" r="3.2" fill="#bbf7d0" />
                <rect x="13.6" y="0.5" width="2.8" height="15" fill="#f0fdf4" opacity=".9" />
              </svg>
            </i>
          ))}
        </span>
      )}
      <span className="sb-text" aria-live="polite">
        {stage === 'idle' ? label : stage === 'busy' ? (pct >= 3 && pct < 100 ? `${busyLabel} ${pct}%` : busyLabel) : doneLabel}
      </span>
      <span className="sb-knob" aria-hidden="true">
        {stage === 'done' ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path className="sb-tick" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg className="sb-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        )}
      </span>
    </button>
  );
}

/* ---------------- Number → roll ---------------- */

/** Har bir raqam o'z ustunida «aylanib» yangi qiymatga to'xtaydi (odometr). */
export function RollNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const text = format(value);
  const chars = text.split('');
  // Raqamlar o'ngdan hisoblanadi: uzunlik o'zgarganda ham birliklar joyida qoladi.
  return (
    <span className="roll" aria-label={text}>
      {chars.map((c, i) => {
        const fromRight = chars.length - i;
        if (!/\d/.test(c)) return <span key={`s${fromRight}`} className="roll-sep" aria-hidden="true">{c}</span>;
        const d = Number(c);
        return (
          <span key={`d${fromRight}`} className="roll-col" aria-hidden="true" style={{ '--d': d, '--ri': fromRight } as CSSProperties}>
            <span className="roll-strip">
              {'0123456789'.split('').map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* ---------------- Line → draw ---------------- */

/** Ustunlar ustidan o'zini chizadigan gradient chiziq + oxirida yonib turgan nuqta. */
export function DrawLine({ values, max }: { values: number[]; max: number }) {
  const W = 100;
  const H = 100;
  const n = values.length;
  const pts = values.map((v, i) => [((i + 0.5) / n) * W, H - (Math.min(v, max) / max) * H * 0.96 - 2] as const);
  // Silliq egri (Catmull-Rom → Bezier).
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const lo = Math.min(p1[1], p2[1]);
    const hi = Math.max(p1[1], p2[1]);
    const cy = (v: number) => Math.max(lo, Math.min(hi, v)); // egri nuqtalardan oshib ketmasin
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, cy(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, cy(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  const last = pts[pts.length - 1];
  const area = `${d} L${last[0]},${H} L${pts[0][0]},${H} Z`;
  const wrap = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = wrap.current;
    if (!node || !('IntersectionObserver' in window) || !motionAllowed()) return setShown(true);
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (setShown(true), io.disconnect()), { threshold: 0.4 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className={`dline ${shown ? 'on' : ''}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="dl-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#7FE3FF" />
            <stop offset=".55" stopColor="#B49CFF" />
            <stop offset="1" stopColor="#FF8FD0" />
          </linearGradient>
          <linearGradient id="dl-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#B49CFF" stopOpacity=".34" />
            <stop offset="1" stopColor="#B49CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="dl-area" d={area} fill="url(#dl-area)" />
        <path className="dl-path" d={d} pathLength={1} fill="none" stroke="url(#dl-stroke)" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="dl-dot" style={{ left: `${last[0]}%`, top: `${last[1]}%` }} />
    </div>
  );
}

/* ---------------- Confetti → burst ---------------- */

const BURST = ['#7FE3FF', '#B49CFF', '#FF8FD0', '#FF8FD0', '#FFD23F', '#FF6B9A'];

/** Gradient doira «pop» qiladi, ichida belgi chiziladi, atrofga ~60 bo'lak otiladi. */
export function BurstCheck({ label }: { label: string }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2 + Math.random() * 0.3;
        const r = 70 + Math.random() * 90;
        return {
          x: Math.cos(a) * r,
          y: Math.sin(a) * r * 0.8,
          fall: 40 + Math.random() * 70,
          rot: Math.random() * 720 - 360,
          c: BURST[i % BURST.length],
          w: 4 + Math.random() * 5,
          delay: Math.random() * 0.08,
        };
      }),
    [],
  );
  return (
    <div className="burst" role="status">
      <div className="burst-core">
        {motionAllowed() &&
          bits.map((b, i) => (
            <i
              key={i}
              style={
                {
                  '--x': `${b.x}px`,
                  '--y': `${b.y}px`,
                  '--f': `${b.fall}px`,
                  '--r': `${b.rot}deg`,
                  background: b.c,
                  width: b.w,
                  height: b.w * 0.5,
                  animationDelay: `${0.32 + b.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        <span className="burst-ball">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
          </svg>
        </span>
      </div>
      <b className="burst-label">{label}</b>
    </div>
  );
}

/* ---------------- Words → kinetic ---------------- */

/** Satrlar navbat bilan «urilib» tushadi, oxirgisi gradientda. */
export function KineticTitle({ lines }: { lines: string[] }) {
  return (
    <h2 className="kinetic" aria-label={lines.join(' ')}>
      {lines.map((l, i) => (
        <span key={i} className={i === lines.length - 1 ? 'kt-last' : ''} style={{ '--ki': i } as CSSProperties} aria-hidden="true">
          {l}
        </span>
      ))}
      <i className="kt-bar" style={{ '--ki': lines.length } as CSSProperties} aria-hidden="true" />
    </h2>
  );
}
