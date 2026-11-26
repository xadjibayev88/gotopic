// Yuqori panel ikonkalari — emoji o'rniga bir uslubdagi SVG'lar (ikkala mavzuda ham aniq ko'rinadi).
// Animatsiyalar faqat transform/opacity (CSS'da), kam harakat rejimida to'xtaydi.

/** Dumaloq Fransiya bayrog'i nishoni, ustida shisha yaltirog'i. */
export function FlagIcon() {
  return (
    <svg className="tbi tbi-flag" viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
      <defs>
        <clipPath id="tbi-flag-clip">
          <circle cx="14" cy="14" r="11.5" />
        </clipPath>
        <linearGradient id="tbi-flag-gloss" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath="url(#tbi-flag-clip)">
        <rect x="0" y="0" width="10.5" height="28" fill="#2B59E0" />
        <rect x="10.5" y="0" width="7" height="28" fill="#F8FAFF" />
        <rect x="17.5" y="0" width="10.5" height="28" fill="#EF3B4B" />
        <ellipse cx="14" cy="7" rx="11" ry="6" fill="url(#tbi-flag-gloss)" />
      </g>
      <circle cx="14" cy="14" r="12.25" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.5" />
    </svg>
  );
}

/** Oltin tanga: chekka halqa, ichida «V», vaqti-vaqti bilan yaltiroq o'tadi. */
export function CoinIcon() {
  return (
    <svg className="tbi tbi-coin" viewBox="0 0 26 26" width="24" height="24" aria-hidden="true">
      <defs>
        <linearGradient id="tbi-coin-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#FFF1A6" />
          <stop offset=".45" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <clipPath id="tbi-coin-clip">
          <circle cx="13" cy="13" r="11" />
        </clipPath>
      </defs>
      <circle cx="13" cy="13" r="11" fill="url(#tbi-coin-g)" stroke="#B45309" strokeWidth="1.4" />
      <circle cx="13" cy="13" r="7.8" fill="none" stroke="#FDE68A" strokeWidth="1.2" opacity=".9" />
      <path d="M9.4 9.2 L13 17.2 L16.6 9.2" fill="none" stroke="#92400E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <g clipPath="url(#tbi-coin-clip)">
        <g transform="rotate(24 13 13)">
          <rect className="tbi-coin-shine" x="-8" y="-4" width="5" height="34" fill="#fff" opacity=".7" />
        </g>
      </g>
    </svg>
  );
}

/** Kofe finjoni; kofe bo'lsa — bug' ko'tariladi, tugasa — finjon bo'sh va xira. */
export function CupIcon({ full }: { full: boolean }) {
  return (
    <svg className={`tbi tbi-cup ${full ? 'full' : 'empty'}`} viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
      <g className="tbi-steam" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path className="s1" d="M10.5 9 C9 7 12 6 10.5 3.5" />
        <path className="s2" d="M15.5 9 C14 7 17 6 15.5 3.5" />
      </g>
      <path d="M20 13.2 h1.6 a3.1 3.1 0 0 1 0 6.2 H19.4" fill="none" stroke="#F5EDE4" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.5 11 H21 V17.5 A6.2 6.2 0 0 1 14.8 23.7 H11.7 A6.2 6.2 0 0 1 5.5 17.5 Z" fill="#FFF8F0" stroke="#E8D8C8" strokeWidth="1" />
      <path className="tbi-coffee" d="M7 12.4 H19.5 V13.8 Q13.25 15.6 7 13.8 Z" fill="#7C4A2A" />
      <ellipse cx="13.25" cy="24.6" rx="9.5" ry="1.6" fill="#E8D8C8" opacity=".9" />
    </svg>
  );
}

/** Baliqcha (Vivi'ning «joni»): ko'k gradient, dumi qimirlaydi, har 10 soniyada suzib aylanadi; tugasa — xira. */
export function FishIcon({ full = true }: { full?: boolean }) {
  return (
    <svg className={`tbi tbi-fish ${full ? 'full' : 'empty'}`} viewBox="0 0 30 26" width="27" height="24" aria-hidden="true">
      <defs>
        <linearGradient id="tbi-fish-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset=".55" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <g className="tbi-fish-body">
        <path className="tbi-fish-tail" d="M7.5 13 L1.5 6.5 Q1 12.5 2.2 13 Q1 13.5 1.5 19.5 Z" fill="#0ea5e9" stroke="#075985" strokeWidth="1" strokeLinejoin="round" />
        <path d="M6.5 13 C9 5.5 20 4 27 12 Q28 13 27 14 C20 22 9 20.5 6.5 13 Z" fill="url(#tbi-fish-g)" stroke="#075985" strokeWidth="1.1" />
        <path d="M14 7.5 Q16.5 3.5 20 6.5" fill="#0ea5e9" stroke="#075985" strokeWidth=".9" />
        <path d="M12 9.5 Q16 7.2 21 9" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
        <circle cx="22.2" cy="11.6" r="1.9" fill="#fff" />
        <circle cx="22.6" cy="11.7" r="1" fill="#0c1a3a" />
        <path d="M17 13.5 Q18.5 15.5 17 17.5" fill="none" stroke="#075985" strokeWidth=".9" strokeLinecap="round" opacity=".6" />
      </g>
      <g className="tbi-bubbles" fill="none" stroke="currentColor" strokeWidth=".9">
        <circle className="b1" cx="27" cy="7" r="1.3" />
        <circle className="b2" cx="25" cy="3.5" r=".9" />
      </g>
    </svg>
  );
}

/** Ikki barobar XP chaqmog'i. */
export function BoltIcon() {
  return (
    <svg className="tbi tbi-bolt" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M13.5 2 L5 13.5 H11 L9.8 22 L19 9.8 H12.8 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
