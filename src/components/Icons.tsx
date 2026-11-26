// Ilovaning yagona ikonka to'plami — emoji o'rniga. 24×24, yumaloq chiziqlar, «duotone»:
// kontur `currentColor`, ichki to'ldirish Cotton Candy / Sunset Sorbet gradientlarida.
// Gradientlar bir marta <IconDefs/> orqali sahifaga qo'yiladi (App ichida).
import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'close' | 'check' | 'lock' | 'play' | 'speaker' | 'mic' | 'chat' | 'book' | 'gear' | 'help' | 'trash'
  | 'warning' | 'info' | 'star' | 'trophy' | 'wheel' | 'arrow' | 'back' | 'gift' | 'target' | 'brain' | 'globe'
  | 'sparkle' | 'crown' | 'medal' | 'calendar' | 'logout' | 'user' | 'card' | 'receipt' | 'palette' | 'sun'
  | 'moon' | 'headphones' | 'pencil' | 'refresh' | 'mute' | 'history' | 'bolt' | 'heart' | 'flame' | 'puzzle'
  | 'shield' | 'bell' | 'clock' | 'film' | 'leaf' | 'compass' | 'letters';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const C = 'url(#ic-candy)';
const W = 'url(#ic-sunset)';
const G = 'url(#ic-gold)';

const P: Record<IconName, ReactNode> = {
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...S} strokeWidth={2.4} />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" {...S} strokeWidth={2.6} />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="3.2" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...S} />
      <circle cx="12" cy="15.4" r="1.6" fill="#fff" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />,
  speaker: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11" {...S} />
    </>
  ),
  mute: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" {...S} />
    </>
  ),
  mic: (
    <>
      <rect x="8.5" y="3" width="7" height="11.5" rx="3.5" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" {...S} />
    </>
  ),
  chat: (
    <>
      <path d="M4 6.5A3 3 0 0 1 7 3.5h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-4.5 4v-4H7a3 3 0 0 1-3-3z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx="8.5" cy="10" r="1.1" fill="#fff" /><circle cx="12" cy="10" r="1.1" fill="#fff" /><circle cx="15.5" cy="10" r="1.1" fill="#fff" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5c2.6-1.3 5.4-1.3 8 .5v14c-2.6-1.8-5.4-1.8-8-.5z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M20 5.5c-2.6-1.3-5.4-1.3-8 .5v14c2.6-1.8 5.4-1.8 8-.5z" fill={W} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    </>
  ),
  gear: (
    <>
      <path d="M12 2.8l2 1.9 2.7-.5 1 2.6 2.5 1.2-.4 2.7 1.6 2.3-2 1.9.2 2.7-2.7.7-1.4 2.4-2.6-.9-2.3 1.4-1.6-2.2-2.7-.3-.3-2.7-2.2-1.6 1.2-2.4-.8-2.6 2.4-1.3.8-2.6 2.7.2z" fill={C} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.2" fill="#fff" stroke="currentColor" strokeWidth={1.6} />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.25" fill="#fff" />
    </>
  ),
  trash: (
    <>
      <path d="M6 7.5h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.4h-7A1.5 1.5 0 0 1 7 20z" fill={W} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M4 7.5h16M9.5 7.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2.5M10 11v6.5M14 11v6.5" {...S} strokeWidth={1.8} />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 4.2a2 2 0 0 1 3.4 0l7.6 13.2a2 2 0 0 1-1.7 3H4.4a2 2 0 0 1-1.7-3z" fill={W} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M12 9.5v4.5" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" /><circle cx="12" cy="17" r="1.3" fill="#fff" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 11v5.5" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" /><circle cx="12" cy="7.8" r="1.35" fill="#fff" />
    </>
  ),
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z" fill={G} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />,
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill={G} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 14v3.5M8 20.5h8M9.5 17.5h5" {...S} strokeWidth={1.8} />
    </>
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke="#fff" strokeWidth={1.4} opacity={0.85} />
      <circle cx="12" cy="12" r="2.6" fill={W} stroke="currentColor" strokeWidth={1.4} />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" {...S} strokeWidth={2.2} />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" {...S} strokeWidth={2.2} />,
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11.5" rx="2" fill={W} stroke="currentColor" strokeWidth={1.8} />
      <path d="M3 9h18M12 9v11.5M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9c2 0 5.5-.5 5.5-1.5S13.5 5.5 12 9z" {...S} strokeWidth={1.7} />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" fill={W} stroke="currentColor" strokeWidth={1.8} />
      <circle cx="12" cy="12" r="5.2" fill="#fff" stroke="currentColor" strokeWidth={1.6} />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5.2a3.4 3.4 0 0 0-6.2 1.5 3.4 3.4 0 0 0-1.5 5.6 3.6 3.6 0 0 0 2.4 5.4A3.2 3.2 0 0 0 12 19.5zM12 5.2a3.4 3.4 0 0 1 6.2 1.5 3.4 3.4 0 0 1 1.5 5.6 3.6 3.6 0 0 1-2.4 5.4A3.2 3.2 0 0 1 12 19.5z" fill={C} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
      <path d="M12 5.5v14M8.6 9.5c1 .2 1.8 1 2 2M15.4 9.5c-1 .2-1.8 1-2 2" fill="none" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M3 12h18M12 3c2.6 2.8 3.6 5.8 3.6 9s-1 6.2-3.6 9c-2.6-2.8-3.6-5.8-3.6-9S9.4 5.8 12 3z" fill="none" stroke="#fff" strokeWidth={1.5} />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 3l1.9 5.2L18 10l-5.1 1.8L11 17l-1.9-5.2L4 10l5.1-1.8z" fill={C} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill={W} stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
    </>
  ),
  crown: <path d="M3.5 8l4.5 4 4-6.5 4 6.5 4.5-4-2 11h-13zM5.5 19h13" fill={G} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />,
  medal: (
    <>
      <path d="M8 3h3l1.5 5M16 3h-3L11.5 8" {...S} strokeWidth={1.8} />
      <circle cx="12" cy="14.5" r="6" fill={G} stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 11.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill="#fff" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M3.5 10h17M8 3v4M16 3v4" {...S} strokeWidth={1.8} />
      <circle cx="8.5" cy="14.5" r="1.2" fill="#fff" /><circle cx="12" cy="14.5" r="1.2" fill="#fff" /><circle cx="15.5" cy="14.5" r="1.2" fill="#fff" />
    </>
  ),
  logout: (
    <>
      <path d="M13.5 4H7a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 7 20h6.5" fill={W} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M10.5 12H21M17.5 8.5L21 12l-3.5 3.5" {...S} strokeWidth={2} />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="4.2" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M4.5 20.5c.9-3.8 3.8-6 7.5-6s6.6 2.2 7.5 6z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth={2.4} /><path d="M6 15h4" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  receipt: (
    <>
      <path d="M5.5 3h13v18l-2.2-1.5-2.1 1.5-2.2-1.5-2.2 1.5-2.1-1.5-2.2 1.5z" fill={C} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 1.5-2.2-.6-1.4.3-2.6 1.8-2.6H18a3 3 0 0 0 3-3C21 7 17 3 12 3z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx="7.5" cy="11" r="1.4" fill="#FFD23F" /><circle cx="10" cy="7" r="1.4" fill="#FF6B9A" /><circle cx="15" cy="7.2" r="1.4" fill="#7FE3FF" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" fill={G} stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...S} strokeWidth={1.8} />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />,
  headphones: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" {...S} strokeWidth={1.8} />
      <rect x="3" y="13.5" width="5" height="7" rx="2" fill={C} stroke="currentColor" strokeWidth={1.7} />
      <rect x="16" y="13.5" width="5" height="7" rx="2" fill={C} stroke="currentColor" strokeWidth={1.7} />
    </>
  ),
  pencil: (
    <>
      <path d="M15.5 4.5l4 4L9 19l-5 1 1-5z" fill={W} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M13.5 6.5l4 4" {...S} strokeWidth={1.8} />
    </>
  ),
  refresh: <path d="M19.5 8.5A8 8 0 0 0 5 7.5M4.5 15.5A8 8 0 0 0 19 16.5M5 3.5v4h4M19 20.5v-4h-4" {...S} strokeWidth={2} />,
  history: (
    <>
      <circle cx="12" cy="12" r="8.5" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 7.5V12l3 2" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" fill={W} stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 7.5V12l3 2" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  bolt: <path d="M13.5 2.5L5 13.5h6l-1.2 8L19 10h-6.2z" fill={G} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" fill={W} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />,
  flame: (
    <>
      <path d="M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.3 2.4-5.3 3.6-8.3.6 1.6 1.6 2.6 2.7 3.2.2-2.6 1.4-5 3.5-6.7-.1 3.5 3.2 5.6 3.2 10 0 4.6-2.6 8-6.5 8z" fill={W} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
      <path d="M12 18.5c-1.6 0-2.6-1-2.6-2.4 0-1.6 1.6-2.4 2.3-3.9.9 1.2 2.9 2 2.9 4 0 1.3-1 2.3-2.6 2.3z" fill="#FFD23F" />
    </>
  ),
  puzzle: <path d="M9 4h4v2a1.8 1.8 0 1 0 3.6 0V4H20v4h-2a1.8 1.8 0 1 0 0 3.6h2V20h-4v-2a1.8 1.8 0 1 0-3.6 0v2H4v-8h2a1.8 1.8 0 1 0 0-3.6H4V4z" fill={C} stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />,
  shield: (
    <>
      <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M8.5 12l2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" fill={W} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M10 21h4" {...S} strokeWidth={1.8} />
    </>
  ),
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M10 9v6l5-3z" fill="#fff" />
    </>
  ),
  leaf: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-13 15M5 19l8-8" fill={C} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" fill="#fff" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
    </>
  ),
  letters: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="4" fill={C} stroke="currentColor" strokeWidth={1.8} />
      <path d="M6.8 15.5l2.4-7 2.4 7M7.6 13.2h3.2M14 8.5h2.2a1.8 1.8 0 0 1 0 3.6H14zM14 12.1h2.6a1.7 1.7 0 0 1 0 3.4H14z" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function Ic({ name, size = 20, className = '', style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`ic ic-${name} ${className}`} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={style}>
      {P[name]}
    </svg>
  );
}

/** Gradientlar — sahifada bir marta (ko'rinmas). */
export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ic-candy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FE3FF" />
          <stop offset=".5" stopColor="#B49CFF" />
          <stop offset="1" stopColor="#FF8FD0" />
        </linearGradient>
        <linearGradient id="ic-sunset" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD23F" />
          <stop offset=".5" stopColor="#FF6B9A" />
          <stop offset="1" stopColor="#9B5CFF" />
        </linearGradient>
        <linearGradient id="ic-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE680" />
          <stop offset="1" stopColor="#FFB020" />
        </linearGradient>
      </defs>
    </svg>
  );
}
