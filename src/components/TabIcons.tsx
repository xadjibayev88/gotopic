// Pastki menyu ikonkalari — fransuz mavzusida, chiziqli (iOS uslubi), rang `currentColor` dan.
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
  // Vivi — mushukcha boshi
  tutor: (on) => (
    <>
      <path className="ti-ear-l" d="M5.2 9.6 4.6 3.8l4.6 2.9" {...S} />
      <path className="ti-ear-r" d="M18.8 9.6l.6-5.8-4.6 2.9" {...S} />
      <path d="M12 20.6c-4.6 0-8-2.6-8-6.6 0-4.2 3.6-7.6 8-7.6s8 3.4 8 7.6c0 4-3.4 6.6-8 6.6z" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <g className="ti-eyes">
        <circle cx="9" cy="13" r="1.15" fill="currentColor" />
        <circle cx="15" cy="13" r="1.15" fill="currentColor" />
      </g>
      <path d="M11 15.6h2l-1 1z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M2.4 14.6l3.4.4M2.8 17.4l3.2-.9M21.6 14.6l-3.4.4M21.2 17.4l-3.2-.9" {...S} strokeWidth={1.4} />
    </>
  ),
  // Kruassan — har kungi mashq
  practice: (on) => (
    <>
      <path
        d="M3.2 15.4c1.2-5.6 5-9 8.8-9s7.6 3.4 8.8 9c-1.8 1-3.4 1.2-4.6.6L12 18.4l-4.2-2.4c-1.2.6-2.8.4-4.6-.6z"
        {...S}
        fill={on ? 'url(#ic-candy)' : 'none'}
      />
      <path d="M12 6.6v11.6M8.2 8.4l-.4 7.6M15.8 8.4l.4 7.6" {...S} strokeWidth={1.5} />
    </>
  ),
  // Eyfel minorasi — turnir
  leagues: (on) => (
    <>
      <path d="M12 2.2v2.6" {...S} />
      <path d="M10.6 4.8h2.8l1 5.2h-4.8z" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path d="M9.2 10h5.6M9.6 10 6.4 21.4M14.4 10l3.2 11.4M8.2 14.6h7.6" {...S} />
      <path d="M8.4 21.4c.4-2.6 1.8-4 3.6-4s3.2 1.4 3.6 4" {...S} />
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
  // Beretli odam — profil
  profile: (on) => (
    <>
      <circle cx="12" cy="10" r="3.8" {...S} fill={on ? 'url(#ic-candy)' : 'none'} />
      <path className="ti-beret" d="M7.4 7.6c.6-2.2 2.6-3.4 4.8-3.4 2.4 0 4.2 1 4.6 2.6-1.4.6-3 .9-4.8.9s-3.4-.1-4.6-.1zM12.4 4.2l.6-1.4" {...S} fill="currentColor" fillOpacity={0.9} />
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
