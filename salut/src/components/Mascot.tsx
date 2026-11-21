// Krua — ilovaning original maskoti (kulgan kruasan).
export type Mood = 'happy' | 'sad' | 'cheer' | 'think' | 'sleep';

export function Mascot({ mood = 'happy', size = 120, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const eyes =
    mood === 'sleep' ? (
      <g stroke="#3B2314" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M70 92 q8 6 16 0" />
        <path d="M112 92 q8 6 16 0" />
      </g>
    ) : mood === 'cheer' ? (
      <g stroke="#3B2314" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M70 96 q8 -10 16 0" />
        <path d="M112 96 q8 -10 16 0" />
      </g>
    ) : (
      <g>
        <ellipse cx="78" cy="92" rx="9" ry={mood === 'sad' ? 8 : 11} fill="#fff" />
        <ellipse cx="120" cy="92" rx="9" ry={mood === 'sad' ? 8 : 11} fill="#fff" />
        <circle cx={mood === 'think' ? 81 : 79} cy={mood === 'think' ? 88 : 94} r="5" fill="#3B2314" />
        <circle cx={mood === 'think' ? 123 : 121} cy={mood === 'think' ? 88 : 94} r="5" fill="#3B2314" />
        <circle cx="80.5" cy="91" r="1.6" fill="#fff" />
        <circle cx="122.5" cy="91" r="1.6" fill="#fff" />
        {mood === 'sad' && (
          <g stroke="#3B2314" strokeWidth="3" strokeLinecap="round">
            <path d="M68 78 l16 4" />
            <path d="M130 78 l-16 4" />
          </g>
        )}
      </g>
    );
  const mouth =
    mood === 'sad' ? (
      <path d="M86 122 q13 -10 26 0" stroke="#3B2314" strokeWidth="4" fill="none" strokeLinecap="round" />
    ) : mood === 'think' ? (
      <path d="M90 120 h18" stroke="#3B2314" strokeWidth="4" strokeLinecap="round" />
    ) : mood === 'sleep' ? (
      <ellipse cx="99" cy="120" rx="5" ry="4" fill="#3B2314" />
    ) : (
      <path d="M84 114 q15 18 30 0 z" fill="#3B2314" stroke="#3B2314" strokeWidth="3" strokeLinejoin="round" />
    );
  return (
    <svg className={`mascot mascot-${mood} ${className}`} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Krua maskoti">
      <ellipse cx="100" cy="178" rx="62" ry="8" fill="rgba(0,0,0,.12)" />
      {/* Kruasan tanasi: segmentlar */}
      <path d="M22 128 C10 104 26 76 50 74 L64 140 C46 150 30 144 22 128 Z" fill="#E59A3C" stroke="#B86A1E" strokeWidth="4" strokeLinejoin="round" />
      <path d="M178 128 C190 104 174 76 150 74 L136 140 C154 150 170 144 178 128 Z" fill="#E59A3C" stroke="#B86A1E" strokeWidth="4" strokeLinejoin="round" />
      <path d="M46 72 C56 46 78 38 100 38 C122 38 144 46 154 72 L144 146 C120 160 80 160 56 146 Z" fill="#F4B860" stroke="#B86A1E" strokeWidth="4" strokeLinejoin="round" />
      <path d="M70 48 C76 70 74 120 66 148" stroke="#D98B30" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M130 48 C124 70 126 120 134 148" stroke="#D98B30" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M84 42 C88 50 92 54 100 54 C108 54 112 50 116 42" stroke="#FCD9A0" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Beret */}
      <path d="M66 50 C66 26 134 22 138 44 C126 52 80 56 66 50 Z" fill="#818CF8" stroke="#4F46E5" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="104" cy="22" r="5" fill="#4F46E5" />
      {eyes}
      <ellipse cx="66" cy="112" rx="8" ry="5" fill="#F28B82" opacity=".6" />
      <ellipse cx="132" cy="112" rx="8" ry="5" fill="#F28B82" opacity=".6" />
      {mouth}
      {mood === 'cheer' && (
        <g fill="#FFD43B">
          <path d="M20 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" />
          <path d="M176 30 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />
        </g>
      )}
      {mood === 'sleep' && (
        <text x="150" y="40" fontSize="26" fontWeight="800" fill="#A5B4FC" fontFamily="Onest, sans-serif">
          z<tspan dy="-10" fontSize="20">z</tspan>
        </text>
      )}
    </svg>
  );
}
