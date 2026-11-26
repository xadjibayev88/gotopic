import { useEffect, useRef, useState } from 'react';
import { countValue, motionAllowed } from '../engine/motion';

/** Raqam o'zgarganda eski qiymatdan yangisiga «sanab» chiqadi (Count up). */
export function CountUp({ value, ms = 700 }: { value: number; ms?: number }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const shownRef = useRef(value);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const prevTarget = fromRef.current;
    fromRef.current = value;
    if (prevTarget === value) return;
    const from = shownRef.current; // yarim yo'lda o'zgarsa — ko'rinib turgan sondan davom etadi
    if (!motionAllowed()) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    if (value > prevTarget) setBump((b) => b + 1);
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = (now - t0) / ms;
      shownRef.current = countValue(from, value, t);
      setShown(shownRef.current);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);

  return (
    <span className={`count-up ${bump ? 'bumped' : ''}`} key={bump}>
      {shown}
    </span>
  );
}
