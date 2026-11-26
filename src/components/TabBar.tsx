// Pastki menyu — 6 xil o'tish animatsiyasi (foydalanuvchi Profilda tanlaydi):
//  flip     — 3D Flip: bosilgan ikonka 3D da aylanib, binafsha→feruza tomoniga o'tadi
//  glow     — Glow Trail: nurli kometa yangi bo'limga uchib, so'nib boruvchi iz qoldiradi
//  particle — Particle Gather: eski ikonka zarrachalarga sochilib, yangisi joyida yig'iladi
//  string   — Elastic String: menyu ustidagi tor bosilgan joyda chertiladi, munchoq yangi joyga sirg'aladi
//  seesaw   — Seesaw Tilt: butun menyu bosilgan tomonga 3D da qiyshayib, prujinadek qaytadi
//  slot     — Slot Reel: har bir ikonka — o'yin avtomati g'ildiragi; bosilgani aylanib, faol yuzida to'xtaydi
//  bulge    — Liquid Bulge: gradient menyu faol bo'lim ustida suyuqlikdek bo'rtadi; bosilganda bo'rtiq
//             cho'zilib yangi bo'limga oqib o'tadi (prujina fizikasi), bosilgan ikonkadan halqa to'lqini chiqadi
//  drop     — Liquid Drop: bosilgan ikonka shisha pufakda suyuq «poya» bilan menyudan ko'tariladi, poya
//             ingichkalashib uziladi, pufak tomchidek qaytib tushadi; menyu rangi bo'limga qarab almashadi
import { GlassRefraction, useLiquidGlassOn } from './LiquidGlass';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motionAllowed } from '../engine/motion';

export type TabMotion = 'drop' | 'bulge' | 'notch' | 'pill' | 'fill' | 'label' | 'bubble' | 'flip' | 'glow' | 'particle' | 'string' | 'seesaw' | 'slot';

export const TAB_MOTIONS: readonly { id: TabMotion; name: string; note: string }[] = [
  { id: 'drop', name: 'Suyuq tomchi', note: 'Ikonka tomchidek ko‘tarilib, qaytib tushadi' },
  { id: 'bulge', name: 'Suyuq bo‘rtiq', note: 'Menyu faol bo‘lim ustida bo‘rtib, oqib o‘tadi' },
  { id: 'notch', name: 'Suzuvchi shar', note: 'Shar o‘yiq ustida sakrab o‘tadi' },
  { id: 'pill', name: 'Sirpanuvchi tabletka', note: 'Tabletka cho‘zilib sirpanadi' },
  { id: 'fill', name: 'Ikonka to‘lishi', note: 'Ikonka markazidan rangga to‘ladi' },
  { id: 'label', name: 'Ochiladigan yozuv', note: 'Faol bo‘lim yozuvi bilan kengayadi' },
  { id: 'bubble', name: 'Pufakchalar', note: 'Ikonkadan pufakchalar uchadi' },
  { id: 'string', name: 'Elastik tor', note: 'Tor chertiladi, munchoq sirg‘aladi' },
  { id: 'glow', name: 'Nurli kometa', note: 'Kometa yangi bo‘limga uchadi' },
  { id: 'flip', name: '3D aylanish', note: 'Ikonka 3D da aylanadi' },
  { id: 'particle', name: 'Zarrachalar', note: 'Ikonka sochilib, qayta yig‘iladi' },
  { id: 'seesaw', name: 'Arg‘imchoq', note: 'Menyu bosilgan tomonga qiyshayadi' },
  { id: 'slot', name: 'Avtomat g‘ildiragi', note: 'Ikonka g‘ildirakdek aylanadi' },
];

const KEY = 'voila.tabMotion';
const EVENT = 'voila:tab-motion';

export function readTabMotion(): TabMotion {
  try {
    const v = localStorage.getItem(KEY) as TabMotion | null;
    if (v && TAB_MOTIONS.some((m) => m.id === v)) return v;
  } catch {
    /* saqlash bloklangan */
  }
  return 'drop';
}

export function saveTabMotion(m: TabMotion) {
  try {
    localStorage.setItem(KEY, m);
  } catch {
    /* saqlash bloklangan — faqat shu sessiya uchun */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: m }));
}

export function useTabMotion(): TabMotion {
  const [m, setM] = useState<TabMotion>(readTabMotion);
  useEffect(() => {
    const on = (e: Event) => setM((e as CustomEvent<TabMotion>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return m;
}

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon: (on: boolean) => ReactNode;
}

interface Change {
  from: number;
  to: number;
  n: number;
}

/** Elastik tor: chertilgan nuqtada so'nuvchi tebranish; munchoq eski joydan yangisiga sirg'aladi. */
function ElasticString({ count, active, change }: { count: number; active: number; change: Change | null }) {
  const path = useRef<SVGPathElement>(null);
  const bead = useRef<SVGCircleElement>(null);
  const W = 1000;
  const xOf = (i: number) => ((i + 0.5) / count) * W;

  useLayoutEffect(() => {
    const p = path.current;
    const b = bead.current;
    if (!p || !b) return;
    const flat = `M6 10 Q ${W / 2} 10 ${W - 6} 10`;
    const target = xOf(active);
    if (!change || !motionAllowed() || active < 0) {
      p.setAttribute('d', flat);
      b.setAttribute('cx', String(target));
      b.setAttribute('cy', '10');
      return;
    }
    const pluckX = xOf(change.to);
    const startX = xOf(change.from);
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      // So'nuvchi tebranish: tor bosilgan joyda pastga tortiladi va prujinadek qaytadi.
      const amp = 16 * Math.exp(-t * 5.2) * Math.cos(t * 26);
      const left = Math.max(6, pluckX - 260);
      const right = Math.min(W - 6, pluckX + 260);
      p.setAttribute('d', `M6 10 L ${left} 10 Q ${pluckX} ${10 + amp * 2} ${right} 10 L ${W - 6} 10`);
      // Munchoq: tez boshlab, yumshoq to'xtaydi; tor egilgan joyda u ham pastga tushadi.
      const k = Math.min(1, t / 0.45);
      const e = 1 - Math.pow(1 - k, 3);
      const x = startX + (pluckX - startX) * e;
      const near = Math.max(0, 1 - Math.abs(x - pluckX) / 260);
      b.setAttribute('cx', String(x));
      b.setAttribute('cy', String(10 + amp * near));
      if (t < 1.1) raf = requestAnimationFrame(frame);
      else {
        p.setAttribute('d', flat);
        b.setAttribute('cy', '10');
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [change?.n, active, count]);

  return (
    <svg className="tab-string" viewBox={`0 0 ${W} 20`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="tabStringGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#6366f1" stopOpacity=".35" />
          <stop offset=".5" stopColor="#B49CFF" />
          <stop offset="1" stopColor="#6366f1" stopOpacity=".35" />
        </linearGradient>
      </defs>
      <circle cx="6" cy="10" r="3" className="ts-pin" />
      <circle cx={W - 6} cy="10" r="3" className="ts-pin" />
      <path ref={path} d={`M6 10 Q ${W / 2} 10 ${W - 6} 10`} stroke="url(#tabStringGrad)" strokeWidth="2.2" fill="none" vectorEffect="non-scaling-stroke" />
      <circle ref={bead} cx={xOf(Math.max(0, active))} cy="10" r="7" className="ts-bead" style={{ opacity: active < 0 ? 0 : 1 }} />
    </svg>
  );
}

const BUMP = 19;
const NOTCH_DEPTH = 15; // bo'rtiq balandligi (px)

/** Bo'rtiqli menyu shakli: pastki to'rtburchak (yumaloq burchakli) + faol bo'lim ustida silliq do'mboq. */
export function bulgePath(W: number, H: number, cx: number, w: number, h: number, r = 26): string {
  const top = BUMP;
  const bottom = BUMP + H;
  const rr = Math.min(r, H / 2);
  const xl = Math.max(rr, cx - w);
  const xr = Math.min(W - rr, cx + w);
  const peak = top - h;
  return [
    `M0 ${top + rr}`,
    `Q0 ${top} ${rr} ${top}`,
    `L${xl} ${top}`,
    // Yelkalar: avval tekis chiqadi, keyin yumaloq gumbaz — suyuqlik tomchisi kabi.
    `C${cx - w * 0.55} ${top} ${cx - w * 0.58} ${peak} ${cx} ${peak}`,
    `C${cx + w * 0.58} ${peak} ${cx + w * 0.55} ${top} ${xr} ${top}`,
    `L${W - rr} ${top}`,
    `Q${W} ${top} ${W} ${top + rr}`,
    `L${W} ${bottom - rr}`,
    `Q${W} ${bottom} ${W - rr} ${bottom}`,
    `L${rr} ${bottom}`,
    `Q0 ${bottom} 0 ${bottom - rr}`,
    'Z',
  ].join(' ');
}

/** Liquid Bulge: prujina fizikasi bilan bo'rtiq markazi yangi bo'limga oqadi; tezlikda cho'zilib pasayadi. */
function LiquidBulge({ count, active, notch = false, onFrame }: { count: number; active: number; notch?: boolean; onFrame?: (x: number, v: number) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const shine = useRef<SVGPathElement>(null);
  const sim = useRef({ x: -1, v: 0, raf: 0, W: 0, H: 0 });

  useLayoutEffect(() => {
    const el = svg.current?.parentElement;
    const p = path.current;
    if (!el || !p) return;
    const s = sim.current;
    const measure = () => {
      s.W = el.clientWidth;
      s.H = el.clientHeight;
      svg.current!.setAttribute('viewBox', `0 0 ${s.W} ${s.H + BUMP}`);
    };
    measure();
    const tabW = () => (s.W - 12) / count;
    const target = () => 6 + tabW() * (Math.max(0, active) + 0.5);
    const draw = () => {
      const base = tabW() * (notch ? 0.6 : 0.74);
      const stretch = Math.min(0.9, Math.abs(s.v) / 1400);
      // Floating Notch: xuddi shu shakl teskari — faol bo'lim ustida botiq o'yiq (shar uchun joy).
      const depth = notch ? -NOTCH_DEPTH * (1 - stretch * 0.35) : BUMP * (1 - stretch * 0.45);
      const d = bulgePath(s.W, s.H, s.x, base * (1 + stretch), depth);
      onFrame?.(s.x, s.v);
      p.setAttribute('d', d);
      shine.current?.setAttribute('d', d);
    };
    if (s.x < 0 || !motionAllowed()) {
      s.x = target();
      s.v = 0;
      draw();
    } else {
      cancelAnimationFrame(s.raf);
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(0.032, (now - last) / 1000);
        last = now;
        // Kritikga yaqin so'nuvchi prujina — suyuqlik «oqib» borib, ozgina chayqalib to'xtaydi.
        const k = 125;
        const c = 16.5;
        const a = k * (target() - s.x) - c * s.v;
        s.v += a * dt;
        s.x += s.v * dt;
        draw();
        if (Math.abs(target() - s.x) > 0.3 || Math.abs(s.v) > 4) s.raf = requestAnimationFrame(step);
        else {
          s.x = target();
          s.v = 0;
          draw();
        }
      };
      s.raf = requestAnimationFrame(step);
    }
    // ResizeObserver kuzatishni boshlaganda ham bir marta chaqiriladi — o'lcham o'zgarmagan bo'lsa,
    // oqayotgan bo'rtiqni oxirgi joyga sakratib yubormaslik kerak.
    const ro = new ResizeObserver(() => {
      const w0 = s.W;
      const h0 = s.H;
      measure();
      if (s.W === w0 && s.H === h0) return;
      s.x = target();
      s.v = 0;
      draw();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(s.raf);
    };
  }, [active, count]);

  return (
    <svg ref={svg} className={`tab-bulge ${notch ? 'is-notch' : ''}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="bulgeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset=".55" stopColor="#5b8cff" />
          <stop offset="1" stopColor="#38c8ff" />
        </linearGradient>
        <linearGradient id="notchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a40" />
          <stop offset="1" stopColor="#1b1b2b" />
        </linearGradient>
        <linearGradient id="bulgeShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path ref={path} className="tb-body" fill={notch ? 'url(#notchGrad)' : 'url(#bulgeGrad)'} />
      <path ref={shine} className="tb-shine" fill="url(#bulgeShine)" />
    </svg>
  );
}

/** Zarrachalar: eski ikonka joyidan sochilib, yoy bo'ylab yangi ikonka joyiga yig'iladi. */
function Particles({ change, count }: { change: Change; count: number }) {
  const parts = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      sx: (Math.random() - 0.5) * 34,
      sy: (Math.random() - 0.5) * 30,
      arc: -18 - Math.random() * 26,
      delay: Math.random() * 90,
      size: 2.5 + Math.random() * 3.5,
      hue: i % 3,
    })),
  );
  return (
    <span className="tab-particles" aria-hidden="true" key={change.n}>
      {parts.current.map((p, i) => (
        <i
          key={i}
          className={`tp tp-${p.hue}`}
          style={{
            // left — konteyner foizida (translate foizi zarrachaning o'z o'lchamiga nisbatan bo'lardi).
            '--l0': `${((change.from + 0.5) / count) * 100}%`,
            '--l1': `${((change.to + 0.5) / count) * 100}%`,
            '--lm': `${((change.from + change.to + 1) / 2 / count) * 100}%`,
            '--sx': `${p.sx}px`,
            '--y0': `${p.sy}px`,
            '--arc': `${p.arc}px`,
            '--d': `${p.delay}ms`,
            '--s': `${p.size}px`,
          } as CSSProperties}
        />
      ))}
    </span>
  );
}

export function TabBar<T extends string>({
  tabs,
  active,
  onSelect,
  motionOverride,
}: {
  tabs: readonly TabItem<T>[];
  active: T;
  onSelect: (id: T) => void;
  /** Profildagi oldindan ko'rish uchun. */
  motionOverride?: TabMotion;
}) {
  const saved = useTabMotion();
  const glass = useLiquidGlassOn();
  const motion = motionOverride ?? saved;
  const index = tabs.findIndex((t) => t.id === active);
  const [change, setChange] = useState<Change | null>(null);
  const [tapped, setTapped] = useState<{ id: T; n: number } | null>(null);
  const prev = useRef(index);
  const ball = useRef<HTMLSpanElement>(null);

  // Profilda uslub tanlanganda — menyu qo'shni bo'limdan joriy bo'limga «o'tib» ko'rsatadi.
  useEffect(() => {
    if (motionOverride) return;
    const demo = () => {
      const at = prev.current;
      if (at < 0) return;
      const from = at === 0 ? Math.min(2, tabs.length - 1) : 0;
      setChange((c) => ({ from, to: at, n: (c?.n ?? 0) + 1 }));
      setTapped((t) => ({ id: tabs[at].id, n: (t?.n ?? 0) + 1 }));
    };
    window.addEventListener(EVENT, demo);
    return () => window.removeEventListener(EVENT, demo);
  }, [tabs, motionOverride]);

  // Bo'lim tashqaridan (hash, tugma) almashsa ham animatsiya chiqadi.
  useEffect(() => {
    if (prev.current !== index && prev.current >= 0 && index >= 0) {
      setChange((c) => ({ from: prev.current, to: index, n: (c?.n ?? 0) + 1 }));
    }
    prev.current = index;
  }, [index]);

  const dir = change ? (change.to > change.from ? 1 : -1) : 1;
  const style = {
    '--tabs': tabs.length,
    '--i': Math.max(0, index),
    '--dir': dir,
  } as CSSProperties;

  return (
    <nav className={`bottombar tm-${motion}${change ? ` ss-${change.n % 2}` : ''}${glass ? ' lg-on' : ''}`} style={style}>
      {glass && <GlassRefraction radius={32} />}
      <span className="tab-clip" aria-hidden="true">
        {motion === 'drop' && <span className="drop-tint" />}
        <span className={`tab-lens ${index >= 0 ? '' : 'hidden'}`} />
        {motion === 'glow' && change && (
          <span
            key={change.n}
            className="tab-comet"
            style={{ '--from': change.from, '--to': change.to, '--dir': dir } as CSSProperties}
          />
        )}
      </span>
      {motion === 'bulge' && <LiquidBulge count={tabs.length} active={index} />}
      {motion === 'drop' && change && index >= 0 && (
        <span key={change.n} className="drop-fx" style={{ '--to': change.to } as CSSProperties} aria-hidden="true">
          <span className="drop-col">
            <svg className="drop-neck" viewBox="0 0 30 24" preserveAspectRatio="none">
              <path d="M0 24 C9 24 11 16 11 9 L11 0 L19 0 L19 9 C19 16 21 24 30 24 Z" />
            </svg>
            <span className="drop-bubble">{tabs[change.to].icon(true)}</span>
          </span>
        </span>
      )}
      {motion === 'notch' && (
        <>
          <LiquidBulge
            notch
            count={tabs.length}
            active={index}
            onFrame={(x, v) => {
              // Shar o'yiq markazida; tez harakatda yoy bo'ylab yuqoriga sakraydi.
              const lift = Math.min(26, Math.abs(v) / 38);
              if (ball.current) ball.current.style.transform = `translate(${x}px, ${-lift}px)`;
            }}
          />
          <span ref={ball} className="notch-ball" aria-hidden="true">
            {index >= 0 && <span key={index} className="notch-ball-ico">{tabs[index].icon(true)}</span>}
          </span>
        </>
      )}
      {motion === 'pill' && (
        <span className="tab-pill" aria-hidden="true">
          <span key={change?.n ?? 0} className="tab-pill-body" />
        </span>
      )}
      {motion === 'string' && <ElasticString count={tabs.length} active={index} change={change} />}
      {motion === 'particle' && change && <Particles key={change.n} change={change} count={tabs.length} />}
      {motion === 'seesaw' && <span className="seesaw-pivot" aria-hidden="true" />}
      {tabs.map((t, i) => {
        const on = i === index;
        const fresh = tapped?.id === t.id;
        return (
          <button
            key={t.id}
            type="button"
            className={`tab ${on ? 'active' : ''} ${fresh ? 'tapped' : ''}`}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              setTapped({ id: t.id, n: (tapped?.n ?? 0) + 1 });
              if (navigator.vibrate) navigator.vibrate(8);
              onSelect(t.id);
            }}
            onClick={(e) => {
              if (e.detail === 0) onSelect(t.id);
            }}
            aria-label={t.label}
            aria-current={on ? 'page' : undefined}
          >
            <span className="tab-ico-wrap" key={fresh ? tapped!.n : 0}>
              {motion === 'flip' && <span className="flip-tile" aria-hidden="true" />}
              {motion === 'slot' ? (
                <span className="slot-window">
                  <span className="slot-reel">
                    <span className="slot-face">{t.icon(false)}</span>
                    <span className="slot-face blur">{tabs[(i + 1) % tabs.length].icon(false)}</span>
                    <span className="slot-face blur">{tabs[(i + 2) % tabs.length].icon(false)}</span>
                    <span className="slot-face">{t.icon(on)}</span>
                  </span>
                </span>
              ) : (
                <span className="tab-ico-face">{t.icon(on)}</span>
              )}
            </span>
            {motion === 'bulge' && fresh && <span className="bulge-ripple" key={`r${tapped!.n}`} aria-hidden="true" />}
            {motion === 'fill' && <span className="fill-dot" aria-hidden="true" />}
            {motion === 'bubble' && fresh && (
              <span className="bubbles" key={`b${tapped!.n}`} aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((k) => <i key={k} style={{ '--k': k } as CSSProperties} />)}
              </span>
            )}
            <small>{t.label}</small>
            {(motion === 'string' || motion === 'seesaw' || motion === 'drop') && <span className="tab-dot" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
