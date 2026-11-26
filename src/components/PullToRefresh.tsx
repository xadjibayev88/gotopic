// Pull to Refresh — «Logo fill» + «Toast»: sahifa tepasida pastga tortilganda Vivi siluetti pastdan yuqoriga
// to'ladi; yetarli tortilsa qo'yib yuborishda progress sinxronlanadi, so'ng «Yangilandi» xabari chiqadi.
// Faqat sensorli ekranda va sahifa eng tepada bo'lganda ishlaydi; brauzerning o'z «tortib yangilash»i o'chiriladi.
import { useEffect, useRef, useState } from 'react';
import { motionAllowed } from '../engine/motion';

const THRESHOLD = 72; // shuncha tortilsa — yangilanadi
const MAX = 120;

/** Tortish masofasiga qarshilik (rubber-band): uzoqqa tortgan sari sekinlashadi. */
export function resist(dy: number): number {
  if (dy <= 0) return 0;
  return Math.min(MAX, MAX * (1 - Math.exp(-dy / 160)));
}

function ViviFill({ progress, spinning }: { progress: number; spinning: boolean }) {
  const h = 44 * Math.max(0, Math.min(1, progress));
  return (
    <svg className={`ptr-vivi ${spinning ? 'spinning' : ''}`} viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">
      <defs>
        <clipPath id="ptrHead">
          <path d="M8 22 L9.5 6 L19 13 Q24 11.5 29 13 L38.5 6 L40 22 Q42 40 24 42 Q6 40 8 22 Z" />
        </clipPath>
        <linearGradient id="ptrFill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g clipPath="url(#ptrHead)">
        <rect x="0" y="0" width="48" height="48" fill="rgba(255,255,255,.08)" />
        <rect className="ptr-level" x="0" y={46 - h} width="48" height={h + 2} fill="url(#ptrFill)" />
      </g>
      <path d="M8 22 L9.5 6 L19 13 Q24 11.5 29 13 L38.5 6 L40 22 Q42 40 24 42 Q6 40 8 22 Z" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="18" cy="25" r="2.2" fill={progress >= 1 ? '#fff' : '#c7d2fe'} />
      <circle cx="30" cy="25" r="2.2" fill={progress >= 1 ? '#fff' : '#c7d2fe'} />
      <path d="M22.5 30.5 h3 l-1.5 1.6z" fill="#f9a8d4" />
    </svg>
  );
}

export function PullToRefresh({ onRefresh, disabled = false }: { onRefresh: () => Promise<unknown>; disabled?: boolean }) {
  const [pull, setPull] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'pulling' | 'refreshing' | 'done'>('idle');
  const [toast, setToast] = useState(0);
  const start = useRef<{ y: number; x: number } | null>(null);
  const pullRef = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    if (disabled || !('ontouchstart' in window)) return;
    const html = document.documentElement;
    html.classList.add('ptr-on'); // brauzerning o'z overscroll-yangilashini o'chiradi
    const onStart = (e: TouchEvent) => {
      if (busy.current || window.scrollY > 0 || e.touches.length !== 1) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.modal-back, .sheet, .bottombar, input, textarea, [data-no-ptr]')) return;
      start.current = { y: e.touches[0].clientY, x: e.touches[0].clientX };
    };
    const onMove = (e: TouchEvent) => {
      if (!start.current) return;
      const dy = e.touches[0].clientY - start.current.y;
      const dx = Math.abs(e.touches[0].clientX - start.current.x);
      if (dy <= 0 || window.scrollY > 0 || dx > dy) {
        if (pullRef.current) {
          pullRef.current = 0;
          setPull(0);
          setPhase('idle');
        }
        if (dy <= 0 || dx > dy) start.current = null;
        return;
      }
      if (e.cancelable) e.preventDefault();
      const p = resist(dy);
      pullRef.current = p;
      setPull(p);
      setPhase('pulling');
    };
    const onEnd = async () => {
      if (!start.current) return;
      start.current = null;
      const p = pullRef.current;
      pullRef.current = 0;
      if (p < THRESHOLD) {
        setPull(0);
        setPhase('idle');
        return;
      }
      busy.current = true;
      setPhase('refreshing');
      setPull(56);
      if (navigator.vibrate) navigator.vibrate(10);
      const minWait = new Promise((r) => setTimeout(r, motionAllowed() ? 900 : 200));
      try {
        await Promise.all([onRefresh(), minWait]);
      } catch {
        /* xatoda ham indikator yopiladi */
      }
      setPhase('done');
      setPull(0);
      setToast((n) => n + 1);
      busy.current = false;
      setTimeout(() => setPhase('idle'), 350);
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);
    return () => {
      html.classList.remove('ptr-on');
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, [disabled, onRefresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(0), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const progress = phase === 'refreshing' ? 1 : pull / THRESHOLD;
  return (
    <>
      <div
        className={`ptr ${phase}`}
        style={{ transform: `translate(-50%, ${pull - 52}px)`, opacity: phase === 'idle' ? 0 : Math.min(1, pull / 30 + (phase === 'refreshing' ? 1 : 0)) }}
        aria-hidden={phase === 'idle'}
        role="status"
      >
        <ViviFill progress={progress} spinning={phase === 'refreshing'} />
        {phase === 'pulling' && <small>{progress >= 1 ? 'Qo‘yib yuboring' : 'Torting…'}</small>}
      </div>
      {toast > 0 && (
        <div className="ptr-toast" key={toast} role="status">
          ✨ Yangilandi — progressingiz sinxron
        </div>
      )}
    </>
  );
}
