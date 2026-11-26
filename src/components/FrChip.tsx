// Chatdagi yashil fransuzcha ibora: bosilganda o'qiladi va ustida o'zbekcha tarjimasi chiqadi.
// Avval kurs lug'atidan qidiriladi, topilmasa — serverdan (Gemini) so'raladi va keshlanadi.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Ic } from './Icons';
import { createPortal } from 'react-dom';
import { ALL_LESSONS } from '../data/course';
import { speak, ttsSupported } from '../engine/audio';

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[«»"“”!?.,;:…()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

let dict: Map<string, string> | null = null;
function local(text: string): string | null {
  if (!dict) {
    dict = new Map();
    for (const l of ALL_LESSONS) for (const w of l.words) dict.set(norm(w.fr), w.uz);
  }
  const k = norm(text);
  return dict.get(k) ?? dict.get(k.replace(/^(le|la|les|l'|un|une|des) /, '')) ?? null;
}

const CACHE_KEY = 'salut.tr.v1';
const cache: Record<string, { uz: string; say?: string }> = (() => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
})();
function remember(k: string, v: { uz: string; say?: string }) {
  cache[k] = v;
  try {
    const keys = Object.keys(cache);
    if (keys.length > 400) for (const old of keys.slice(0, keys.length - 400)) delete cache[old];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* saqlanmasa ham bo'ladi */
  }
}

async function translate(text: string, context: string): Promise<{ uz: string; say?: string } | null> {
  const k = norm(text);
  if (cache[k]) return cache[k];
  const l = local(text);
  if (l) return { uz: l };
  try {
    const r = await fetch('./api/translate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, context }) });
    if (!r.ok) return null;
    const j = (await r.json()) as { uz?: string; say?: string };
    if (!j.uz) return null;
    remember(k, { uz: j.uz, say: j.say });
    return { uz: j.uz, say: j.say };
  } catch {
    return null;
  }
}

export function FrChip({ text, context, rate }: { text: string; context: string; rate: number }) {
  const [open, setOpen] = useState(false);
  // Pufak body'da (portal) fixed joylashadi: chat oynasi (contain: paint) uni kesmaydi, ekrandan chiqmaydi.
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean; arrow: number } | null>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const [tr, setTr] = useState<{ uz: string; say?: string } | null | 'loading' | 'error'>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const t = setTimeout(() => setOpen(false), 7000);
    document.addEventListener('pointerdown', close);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  // Pufak o'lchami ma'lum bo'lgach — ekran chegarasiga sig'diramiz (8px chet), joy bo'lmasa — pastga.
  useLayoutEffect(() => {
    if (!open) return;
    const chip = ref.current?.querySelector('.fr-chip')?.getBoundingClientRect();
    const pop = popRef.current?.getBoundingClientRect();
    if (!chip || !pop) return;
    const vw = document.documentElement.clientWidth;
    const cx = chip.left + chip.width / 2;
    const left = Math.max(8, Math.min(vw - pop.width - 8, cx - pop.width / 2));
    const below = chip.top - pop.height - 12 < 8;
    const top = below ? chip.bottom + 10 : chip.top - pop.height - 10;
    const arrow = Math.max(14, Math.min(pop.width - 14, cx - left));
    setPos((p) => (p && p.left === left && p.top === top && p.below === below ? p : { left, top, below, arrow }));
  }, [open, tr]);

  const tap = async () => {
    speak(text, rate);
    setPos(null);
    setOpen((o) => !o);
    if (tr && tr !== 'error') return;
    setTr('loading');
    const r = await translate(text, context);
    setTr(r ?? 'error');
  };

  return (
    <span className="fr-chip-wrap" ref={ref}>
      <button type="button" className={`fr-chip ${open ? 'open' : ''}`} onClick={() => void tap()} title="Tarjima va talaffuz">
        {text}
        {ttsSupported() && <span className="fr-chip-icon"><Ic name="speaker" size={14} /></span>}
      </button>
      {open && createPortal(
        <span
          ref={popRef}
          className={`fr-pop ${pos?.below ? 'below' : ''}`}
          role="tooltip"
          style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, ['--arrow' as string]: `${pos?.arrow ?? 0}px`, visibility: pos ? 'visible' : 'hidden' }}
        >
          {tr === 'loading' || tr === null ? (
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
          ) : tr === 'error' ? (
            <span className="muted">Tarjima topilmadi</span>
          ) : (
            <>
              <b>{tr.uz}</b>
              {tr.say && <small>[{tr.say}]</small>}
            </>
          )}
        </span>,
        document.body,
      )}
    </span>
  );
}
