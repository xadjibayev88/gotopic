// Mikro-interaksiyalar («UI primitives» uslubida): bosib turib o'chirish, «Saqlandi» xatcho'pi,
// qiymati aylanib ko'rinadigan slayder. Faqat transform/opacity — qotmaydi.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { uiMotionAllowed as motionAllowed } from '../engine/motion';

/** Xavfli amal: bosib turilsa ichi qizil bilan to'ladi; oxirigacha ushlansa — bajariladi, qo'yib yuborilsa — qaytadi. */
export function HoldButton({
  children,
  holdingLabel = 'Bosib turing…',
  ms = 1400,
  onDone,
  className = '',
}: {
  children: ReactNode;
  holdingLabel?: string;
  ms?: number;
  onDone: () => void;
  className?: string;
}) {
  const [st, setSt] = useState<'idle' | 'hold' | 'done'>('idle');
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const start = () => {
    if (st === 'done') return;
    setSt('hold');
    if (navigator.vibrate) navigator.vibrate(8);
    timer.current = window.setTimeout(() => {
      setSt('done');
      if (navigator.vibrate) navigator.vibrate([20, 30, 40]);
      timer.current = window.setTimeout(onDone, motionAllowed() ? 380 : 0);
    }, ms);
  };
  const stop = () => {
    if (st !== 'hold') return;
    clearTimeout(timer.current);
    setSt('idle');
  };
  return (
    <button
      type="button"
      className={`hold-btn hb-${st} ${className}`}
      style={{ '--hold': `${ms}ms` } as CSSProperties}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        start();
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && (e.preventDefault(), start())}
      onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && stop()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="hb-fill" aria-hidden="true" />
      <span className="hb-label">
        <svg className="hb-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {st === 'done' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M4 7h16M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-12.5" />}
        </svg>
        {st === 'hold' ? holdingLabel : children}
      </span>
    </button>
  );
}

/** Raqam yangilanganda eskisi yuqoriga ketib, yangisi pastdan chiqadi. */
export function Roll({ value }: { value: string | number }) {
  const [pair, setPair] = useState<{ cur: string; prev: string | null; dir: 1 | -1; k: number }>({ cur: String(value), prev: null, dir: 1, k: 0 });
  useEffect(() => {
    setPair((p) => {
      const v = String(value);
      if (v === p.cur) return p;
      const dir = Number(v) < Number(p.cur) ? -1 : 1;
      return { cur: v, prev: p.cur, dir, k: p.k + 1 };
    });
  }, [value]);
  return (
    <span className={`vroll ${pair.dir < 0 ? 'down' : 'up'}`} key={pair.k}>
      {pair.prev !== null && motionAllowed() && <span className="vroll-old" aria-hidden="true">{pair.prev}</span>}
      <span className="vroll-new">{pair.cur}</span>
    </span>
  );
}

/** «Saqlandi» xatcho'pi: bosilganda to'ladi, atrofida halqa, yonidagi hisob aylanib o'zgaradi. */
export function SaveMark({ saved, count, onToggle, label = "Lug'atga", savedLabel = 'Saqlandi' }: { saved: boolean; count: number; onToggle: () => void; label?: string; savedLabel?: string }) {
  const [pop, setPop] = useState(0);
  return (
    <button
      type="button"
      className={`save-mark ${saved ? 'on' : ''}`}
      aria-pressed={saved}
      onClick={() => {
        if (!saved) setPop((n) => n + 1);
        if (navigator.vibrate) navigator.vibrate(10);
        onToggle();
      }}
    >
      <span className="sm-ico" key={pop}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4.6L5.5 21V4.5a1 1 0 0 1 1-1z" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        {pop > 0 && saved && <i className="sm-ring" aria-hidden="true" />}
      </span>
      <span className="sm-text">{saved ? savedLabel : label}</span>
      <span className="sm-count">
        <Roll value={count} />
      </span>
    </button>
  );
}

/** Slayder: tutqich ustida qiymat pufakchasi, qiymat o'zgarganda raqam aylanadi. */
export function RangeValue({
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => `${v.toFixed(2)}×`,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  ariaLabel?: string;
}) {
  const [active, setActive] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <span className={`range-val ${active ? 'active' : ''}`} style={{ '--p': `${pct}%` } as CSSProperties}>
      <span className="rv-bubble" aria-hidden="true">
        <Roll value={format(value)} />
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onPointerDown={() => setActive(true)}
        onPointerUp={() => setActive(false)}
        onBlur={() => setActive(false)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </span>
  );
}
