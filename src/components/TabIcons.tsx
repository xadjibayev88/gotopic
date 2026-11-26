// Pastki menyu ikonkalari — koreys mavzusida, chiziqli (iOS uslubi), rang `currentColor` dan.
// Faol holatda ichi yengil to'ldiriladi; bosilganda har biri o'ziga xos harakat qiladi (styles.css → .ti-*).
import type { ReactNode } from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ICONS: Record<string, (on: boolean) => ReactNode> = {
  // Darslar xaritasi — buklangan xarita va nuqtali yo'l
  learn: (on) => (
    <>
      <path d="M3.2 6.4 8.8 4l6.4 2.4L20.8 4v13.6L15.2 20l-6.4-2.4-5.6 2.4z" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path d="M8.8 4v13.6M15.2 6.4V20" {...S} strokeWidth={1.4} opacity={0.55} />
      <path className="ti-m" d="M6 15.6c1.8-1 2.4-3.4 4.6-3.6s2.6 1.6 4.6.4 1.6-3.6 2.8-4.4" {...S} strokeWidth={1.7} strokeDasharray="0.1 2.8" />
      <circle cx="18" cy="8" r="1.6" fill={on ? '#FF6B9A' : 'currentColor'} stroke="none" />
    </>
  ),
  // Hori — yo'lbarscha boshi
  tutor: (on) => (
    <>
      {/* Hori — oq yo'lbars boshi: yumaloq quloqlar, peshonada 王 */}
      <path className="ti-ear-l" d="M5.6 9.4C3.8 7.6 4 4.2 6.6 3.8c1.6-.2 2.8.8 3.4 2" {...S} />
      <path className="ti-ear-r" d="M18.4 9.4c1.8-1.8 1.6-5.2-1-5.6-1.6-.2-2.8.8-3.4 2" {...S} />
      <path d="M12 20.6c-4.6 0-8.2-2.6-8.2-6.8 0-4.2 3.7-7.6 8.2-7.6s8.2 3.4 8.2 7.6c0 4.2-3.6 6.8-8.2 6.8z" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path d="M10 8.6h4M10.4 10.2h3.2M12 8.4v2.6" {...S} strokeWidth={1.2} />
      <path d="M4.6 12.6l2 .4M4.8 15l1.8-.2M19.4 12.6l-2 .4M19.2 15l-1.8-.2" {...S} strokeWidth={1.2} />
      <g className="ti-eyes">
        <circle cx="9.2" cy="13.4" r="1.15" fill="currentColor" />
        <circle cx="14.8" cy="13.4" r="1.15" fill="currentColor" />
      </g>
      <path d="M11 16h2l-1 1z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </>
  ),
  // Buchae — koreys an'anaviy yelpig'ichi: har kungi mashq
  practice: (on) => (
    <>
      <path d="M3 15.4A9 9 0 0 1 21 15.4L12 18.6z" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path d="M12 18.6 6.2 8.6M12 18.6 9 7.2M12 18.6 12 6.6M12 18.6l3-11.4M12 18.6l5.8-10" {...S} strokeWidth={1.2} />
      <path d="M12 18.6v2.6" {...S} />
      <circle cx="12" cy="21.4" r=".9" fill="currentColor" />
    </>
  ),
  // N Seoul (Namsan) minorasi — turnir
  leagues: (on) => (
    <>
      <path d="M12 1.6v4" {...S} />
      <path d="M8.6 7.4c0-1.1.9-1.8 2-1.8h2.8c1.1 0 2 .7 2 1.8v.6c0 1-.9 1.8-2 1.8h-2.8c-1.1 0-2-.8-2-1.8z" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path d="M11 9.8 10.4 18.4M13 9.8l.6 8.6" {...S} />
      <path d="M6.2 21.4c.6-1.8 2.2-3 5.8-3s5.2 1.2 5.8 3" {...S} />
      <path className="ti-spark" d="M19.4 3.4v2.4M18.2 4.6h2.4" {...S} strokeWidth={1.5} />
    </>
  ),
  // Butik sumkasi — do'kon
  shop: (on) => (
    <>
      <path d="M5.4 8h13.2l-1 12.4H6.4z" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path className="ti-handle" d="M9 10.4V7a3 3 0 0 1 6 0v3.4" {...S} />
      <path d="M10.2 14.6c.6.8 1.2 1.2 1.8 1.2s1.2-.4 1.8-1.2" {...S} strokeWidth={1.5} />
    </>
  ),
  // Odam — profil
  profile: (on) => (
    <>
      <circle cx="12" cy="9.6" r="3.9" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path className="ti-beret" d="M8.4 8.4c.8-2 2.2-2.9 3.8-2.9 1.8 0 3.1 1 3.6 2.6" {...S} strokeWidth={1.6} />
      <path d="M4.8 20.6c.8-3.4 3.6-5.4 7.2-5.4s6.4 2 7.2 5.4" {...S} />
    </>
  ),
};

export function TabIcon({ id, on }: { id: string; on: boolean }) {
  return (
    <svg className={`tab-ico ti-${id}`} viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      {ICONS[id]?.(on)}
    </svg>
  );
}
