// Do'kon «ilgich»i (kiyim do'koni uslubi): mahsulotlar arqonga ilingan, surganda chayqaladi;
// bosilsa mahsulot katta oynada ochiladi. Ichidagi suyuqlik — mahsulot darajasi (masalan, akvariumdagi suv/baliqchalar);
// sotib olinganda suyuqlik to'lqin bilan yangi darajaga ko'tariladi. Faqat transform/opacity.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CoinIcon } from './TopBarIcons';
import { createPortal } from 'react-dom';
import { motionAllowed } from '../engine/motion';

export interface RailItem {
  id: string;
  icon: ReactNode;
  name: string;
  desc: string;
  price: number;
  /** 0..1 — suyuqlik darajasi */
  level: number;
  levelLabel: string;
  color: string;
  color2: string;
  canBuy: boolean;
  whyNot?: string;
  buy: () => boolean;
}

function Liquid({ level, color, color2 }: { level: number; color: string; color2: string }) {
  const l = Math.max(0, Math.min(1, level));
  return (
    <span className="liq" aria-hidden="true" style={{ '--lc': color, '--lc2': color2 } as CSSProperties}>
      <span className="liq-body" style={{ transform: `translateY(${(1 - l) * 100}%)` }}>
        <svg className="liq-wave" viewBox="0 0 120 12" preserveAspectRatio="none">
          <path d="M0 6 Q15 0 30 6 T60 6 T90 6 T120 6 V12 H0 Z" />
        </svg>
        <svg className="liq-wave w2" viewBox="0 0 120 12" preserveAspectRatio="none">
          <path d="M0 6 Q15 12 30 6 T60 6 T90 6 T120 6 V12 H0 Z" />
        </svg>
      </span>
    </span>
  );
}

function Hook() {
  return (
    <svg className="hook" viewBox="0 0 40 30" width="40" height="30" aria-hidden="true">
      <path d="M20 2 C26 2 27 9 21 11 L20 13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 13 L4 26 Q2 28 5 28 H35 Q38 28 36 26 Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

export function ShopRail({ items }: { items: RailItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  // Surish tezligiga qarab ilgichlar qiyshayadi; to'xtaganda prujinadek qaytadi.
  useEffect(() => {
    const el = track.current;
    if (!el || !motionAllowed()) return;
    let last = el.scrollLeft;
    let t = 0;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const v = el.scrollLeft - last;
        last = el.scrollLeft;
        el.style.setProperty('--swing', `${Math.max(-16, Math.min(16, -v * 0.9))}deg`);
        clearTimeout(t);
        t = window.setTimeout(() => el.style.setProperty('--swing', '0deg'), 90);
      });
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => {
      el.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div className="rail">
        <span className="rail-rope" aria-hidden="true" />
        <div className="rail-track" ref={track}>
          {items.map((it, i) => (
            <button key={it.id} type="button" className={`hanger ${it.canBuy ? '' : 'dim'}`} style={{ '--hi': i } as CSSProperties} onClick={() => setOpen(i)} aria-label={`${it.name} — ${it.price} tanga`}>
              <span className="hanger-swing">
                <Hook />
                <span className="hang-card" style={{ '--lc': it.color, '--lc2': it.color2 } as CSSProperties}>
                  <Liquid level={it.level} color={it.color} color2={it.color2} />
                  <span className="hang-icon">{it.icon}</span>
                  <b className="hang-name">{it.name}</b>
                  <small className="hang-level">{it.levelLabel}</small>
                  <span className="hang-tag">
                    <CoinIcon /> {it.price}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {open !== null && <ItemSheet items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

function ItemSheet({ items, index, onIndex, onClose }: { items: RailItem[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const it = items[index];
  const [stage, setStage] = useState<'idle' | 'busy' | 'done'>('idle');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => setStage('idle'), [index]);
  const buy = () => {
    if (!it.canBuy || stage !== 'idle') return;
    setStage('busy');
    timers.current.push(
      window.setTimeout(() => {
        if (it.buy()) {
          setStage('done');
          timers.current.push(window.setTimeout(() => setStage('idle'), 1700));
        } else setStage('idle');
      }, 650),
    );
  };
  return createPortal(
    <div className="modal-back item-back" onClick={onClose}>
      <div className="sheet item-sheet" onClick={(e) => e.stopPropagation()} style={{ '--lc': it.color, '--lc2': it.color2 } as CSSProperties}>
        <button type="button" className="item-close" onClick={onClose} aria-label="Yopish">
          ✕
        </button>
        <div className="item-stage">
          <span className="item-rope" aria-hidden="true" />
          <span className="item-hang" key={it.id}>
            <Hook />
            <span className="item-big">
              <Liquid level={it.level} color={it.color} color2={it.color2} />
              <span className="item-icon">{it.icon}</span>
            </span>
          </span>
        </div>
        <small className="item-index">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </small>
        <h3 className="item-name">{it.name}</h3>
        <b className="item-price"><CoinIcon /> {it.price}</b>
        <p className="item-desc muted">{it.desc}</p>
        <div className="item-dots" role="tablist" aria-label="Mahsulotlar">
          {items.map((x, i) => (
            <button key={x.id} type="button" role="tab" aria-selected={i === index} className={i === index ? 'on' : ''} onClick={() => onIndex(i)} aria-label={x.name}>
              {x.icon}
            </button>
          ))}
        </div>
        <span className="item-level">{it.levelLabel}</span>
        <button type="button" className={`item-buy ib-${stage}`} disabled={(!it.canBuy && stage === 'idle') || stage === 'busy'} onClick={buy}>
          {stage === 'busy' ? (
            <>
              <span className="ib-spin" aria-hidden="true" /> Olinmoqda…
            </>
          ) : stage === 'done' ? (
            '✓ Olindi'
          ) : it.canBuy ? (
            <>Sotib olish · <CoinIcon /> {it.price}</>
          ) : (
            it.whyNot ?? 'Hozir olib bo‘lmaydi'
          )}
        </button>
      </div>
    </div>,
    document.body,
  );
}
