// Hori — ilovaning original maskoti: yoqimtoy seullik yo'lbarscha.
import type { CSSProperties } from 'react';
import { NEUTRAL_VIVI_CUE, validateViviCue, type ViviCue } from '../shared/vivi-cue';

export type Mood = 'happy' | 'sad' | 'cheer' | 'think' | 'sleep';

export const FUR = '#FBFAFF';
export const FUR_SHADE = '#E4E6F4';
export const LINE = '#3B3760';
export const INK = '#1B2A4A';
/** Oq yo'lbars chiziqlari (ko'mir-binafsha). */
export const STRIPE = '#2E2A4A';
const EAR_IN = '#FBCFE8';
const CHEEK = '#F9A8D4';
/** Oq Amur yo'lbarsiga xos muzdek ko'k ko'zlar. */
const EYE = '#1E3A6E';

/** Yumaloq yo'lbars quloqlari — ortida qora dog' (200×200 koordinatada). */
export function CatEars({ fill = FUR }: { fill?: string }) {
  return (
    <g strokeLinejoin="round">
      <g className="vivi-ear-l">
        <path d="M44 66 C30 50 34 20 58 20 C74 20 86 32 90 44 Z" fill={fill} stroke={LINE} strokeWidth="4" />
        <path d="M52 56 C44 46 46 30 58 30 C67 30 74 37 77 44 Z" fill={EAR_IN} />
        <path d="M40 40 C42 28 50 22 58 21 C50 27 46 34 46 42 Z" fill={STRIPE} opacity=".85" />
      </g>
      <g className="vivi-ear-r">
        <path d="M156 66 C170 50 166 20 142 20 C126 20 114 32 110 44 Z" fill={fill} stroke={LINE} strokeWidth="4" />
        <path d="M148 56 C156 46 154 30 142 30 C133 30 126 37 123 44 Z" fill={EAR_IN} />
        <path d="M160 40 C158 28 150 22 142 21 C150 27 154 34 154 42 Z" fill={STRIPE} opacity=".85" />
      </g>
    </g>
  );
}

/** Oq tumshuq, pushti burun va mo'ylovlar — Horining tanib olinadigan yuzi. */
export function CatMuzzle({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-11" cy="12" rx="15" ry="11" fill="#FFFFFF" />
      <ellipse cx="11" cy="12" rx="15" ry="11" fill="#FFFFFF" />
      <g fill={STRIPE} opacity=".55">
        <circle cx="-15" cy="10" r="1.3" /><circle cx="-9" cy="14" r="1.3" /><circle cx="-17" cy="16" r="1.2" />
        <circle cx="15" cy="10" r="1.3" /><circle cx="9" cy="14" r="1.3" /><circle cx="17" cy="16" r="1.2" />
      </g>
      <g stroke={LINE} strokeWidth="2.4" strokeLinecap="round" opacity=".7" className="vivi-whiskers">
        <path d="M-40 6 L-70 0" />
        <path d="M-40 13 L-71 15" />
        <path d="M40 6 L70 0" />
        <path d="M40 13 L71 15" />
      </g>
      <path d="M-8 4 Q0 -1 8 4 Q0 13 -8 4 Z" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
}

/** Oq Amur yo'lbarschasi: tana, halqali dum, panjalar va bosh — peshonada «王» belgisi. */
export function CatBase() {
  return (
    <g strokeLinejoin="round">
      <g className="vivi-tail vivi-cue-tail">
        <path d="M138 164 C170 166 186 140 178 112 C175 102 164 104 166 114 C171 134 160 150 136 148 Z" fill={FUR} stroke={LINE} strokeWidth="4" />
        <g fill={STRIPE}>
          <path d="M150 149 C155 152 159 156 161 160 L155 161 C153 157 150 154 146 151 Z" />
          <path d="M166 136 C171 137 175 140 177 144 L172 147 C170 143 167 140 163 139 Z" />
          <path d="M171 122 C176 121 180 122 182 125 L178 130 C176 127 173 126 169 127 Z" />
          <path d="M178 112 C175 102 164 104 166 114 C167 117 168 119 169 121 C175 120 180 117 178 112 Z" />
        </g>
      </g>
      <g className="vivi-cue-torso">
        <path d="M58 182 C50 150 64 124 100 124 C136 124 150 150 142 182 Z" fill={FUR} stroke={LINE} strokeWidth="4" />
        <path d="M82 182 C80 160 88 146 100 146 C112 146 120 160 118 182 Z" fill="#FFFFFF" />
        <g fill={STRIPE} opacity=".9">
          <path d="M62 150 C70 148 76 151 80 156 C73 155 67 156 61 159 Z" />
          <path d="M58 166 C66 164 73 167 77 172 C70 171 64 172 58 175 Z" />
          <path d="M138 150 C130 148 124 151 120 156 C127 155 133 156 139 159 Z" />
          <path d="M142 166 C134 164 127 167 123 172 C130 171 136 172 142 175 Z" />
        </g>
        <ellipse cx="80" cy="182" rx="15" ry="9" fill={FUR} stroke={LINE} strokeWidth="4" />
        <g className="vivi-cue-wave-paw">
          <ellipse cx="120" cy="182" rx="15" ry="9" fill={FUR} stroke={LINE} strokeWidth="4" />
        </g>
      </g>
      <g className="vivi-cue-head">
        <CatEars />
        <ellipse cx="100" cy="92" rx="68" ry="57" fill={FUR} stroke={LINE} strokeWidth="4" />
        {/* Peshonadagi «王» — yo'lbarsning mashhur belgisi */}
        <g fill={STRIPE}>
          <path d="M84 46 C92 44 108 44 116 46 C110 49 90 49 84 46 Z" />
          <path d="M86 56 C93 54 107 54 114 56 C108 59 92 59 86 56 Z" />
          <path d="M88 66 C94 64 106 64 112 66 C106 68.5 94 68.5 88 66 Z" />
          <path d="M98 44 C99.5 52 99.5 60 98.6 67 L101.4 67 C100.5 60 100.5 52 102 44 Z" />
        </g>
        {/* Yonoq chiziqlari */}
        <g fill={STRIPE} opacity=".92">
          <path d="M34 82 C44 80 52 82 58 87 C50 87 42 88 35 91 Z" />
          <path d="M33 98 C42 97 49 99 54 103 C47 103 40 104 34 107 Z" />
          <path d="M166 82 C156 80 148 82 142 87 C150 87 158 88 165 91 Z" />
          <path d="M167 98 C158 97 151 99 146 103 C153 103 160 104 166 107 Z" />
          <path d="M60 52 C64 56 66 61 66 66 C62 62 58 58 54 56 Z" />
          <path d="M140 52 C136 56 134 61 134 66 C138 62 142 58 146 56 Z" />
        </g>
      </g>
    </g>
  );
}

function faceForMood(mood: Mood): ViviCue['face'] {
  if (mood === 'sad') return 'supportive';
  if (mood === 'cheer') return 'proud';
  if (mood === 'think') return 'curious';
  return 'happy';
}

function actionForFace(face: ViviCue['face']): NonNullable<ViviCue['action']> | undefined {
  if (face === 'happy' || face === 'proud') return 'hop';
  if (face === 'amused') return 'giggle';
  if (face === 'supportive') return 'tail_wag';
  return undefined;
}

/**
 * Ovozga bog'langan og'iz: `level` (0..1) audio balandligidan keladi.
 * Pauzada og'iz yopiladi, baland bo'g'inda keng ochiladi, katta ochilishda til ko'rinadi.
 */
function SpeakingMouth({ level }: { level: number }) {
  const open = Math.max(0, Math.min(1, level));
  if (open < 0.06) {
    return <path className="vivi-mouth-closed" d="M90 120 q10 5 20 0" stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round" />;
  }
  const ry = 2.5 + open * 9.5;
  const rx = 9.5 - open * 2.2;
  const cy = 119 + ry * 0.45;
  return (
    <g className="vivi-cue-mouth-speaking">
      <ellipse cx="100" cy={cy} rx={rx} ry={ry} fill="#9D174D" stroke={INK} strokeWidth="2.5" />
      {open > 0.35 && <ellipse cx="100" cy={cy + ry * 0.45} rx={rx * 0.62} ry={ry * 0.38} fill="#F472B6" />}
    </g>
  );
}

export function Mascot({
  mood = 'happy',
  size = 120,
  className = '',
  cue,
  level = 0,
}: {
  mood?: Mood;
  size?: number;
  className?: string;
  /** Runtime input is treated as untrusted and validated before any cue class is emitted. */
  cue?: unknown;
  level?: number;
}) {
  const hasCue = cue !== undefined;
  const safeCue = hasCue ? validateViviCue(cue) : NEUTRAL_VIVI_CUE;
  const face = hasCue ? safeCue.face : faceForMood(mood);
  const state = hasCue ? safeCue.state : 'idle';
  const action = hasCue ? safeCue.action ?? actionForFace(safeCue.face) : undefined;
  const ornament = hasCue ? safeCue.ornament : undefined;
  const cueClasses = hasCue
    ? `vivi-cue-motion vivi-cue-state-${state} vivi-cue-face-${face}${action ? ` vivi-cue-action-${action}` : ''}${ornament ? ` vivi-cue-ornament-${ornament}` : ''}`
    : `mascot-${mood}`;
  const numericLevel = Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0;
  const classes = `mascot vivi ${cueClasses} ${className}`.trim();

  const closedEyes = (kind: 'sleep' | 'cheer') => (
    <g className="vivi-eyes" stroke={INK} strokeWidth={kind === 'sleep' ? 4.5 : 5} strokeLinecap="round" fill="none">
      <path d={kind === 'sleep' ? 'M64 94 q10 7 20 0' : 'M64 98 q10 -13 20 0'} />
      <path d={kind === 'sleep' ? 'M116 94 q10 7 20 0' : 'M116 98 q10 -13 20 0'} />
    </g>
  );

  const eyes = !hasCue && mood === 'sleep' ? closedEyes('sleep')
    : !hasCue && mood === 'cheer' ? closedEyes('cheer')
      : hasCue && (face === 'amused' || face === 'proud') ? (
        <g className="vivi-eyes vivi-cue-smile-eyes" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M64 98 q10 -13 20 0" />
          <path d="M116 98 q10 -13 20 0" />
        </g>
      ) : (
        <g className={`vivi-eyes ${(!hasCue && mood === 'think') || (hasCue && face === 'curious') ? 'vivi-look-up' : ''}`}>
          <ellipse className="vivi-eye" cx="74" cy="92" rx="12" ry={hasCue && face === 'surprised' ? 17 : !hasCue && mood === 'sad' ? 11 : 14} fill={hasCue && face === 'supportive' ? '#2C3E63' : EYE} />
          <ellipse className="vivi-eye" cx="126" cy="92" rx="12" ry={hasCue && face === 'surprised' ? 17 : !hasCue && mood === 'sad' ? 11 : 14} fill={hasCue && face === 'supportive' ? '#2C3E63' : EYE} />
          <g>
            <circle cx="78" cy="86" r="4.8" fill="#fff" />
            <circle cx="130" cy="86" r="4.8" fill="#fff" />
            <circle cx="70" cy="98" r="2.2" fill="#fff" opacity=".85" />
            <circle cx="122" cy="98" r="2.2" fill="#fff" opacity=".85" />
          </g>
          {((hasCue && face === 'confused') || (!hasCue && mood === 'sad')) && (
            <g className="vivi-cue-brows" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
              <path d="M60 72 l18 6" />
              <path d="M140 72 l-18 6" />
            </g>
          )}
        </g>
      );

  const mouth = hasCue
    ? state === 'speaking' ? <SpeakingMouth level={numericLevel} />
      : face === 'surprised' ? <ellipse className="vivi-cue-mouth-surprised" cx="100" cy="121" rx="7" ry="9" fill="#BE185D" stroke={INK} strokeWidth="2.5" />
        : face === 'neutral' || face === 'curious' ? <path d="M92 121 h16" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          : face === 'confused' ? <path d="M90 124 q10-8 20 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            : <path d="M88 116 q6 8 12 0 q6 8 12 0" stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    : mood === 'sad' ? <path d="M90 124 q10 -8 20 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      : mood === 'think' ? <path d="M93 120 h14" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        : mood === 'sleep' ? <path d="M90 116 q5 5 10 0 q5 5 10 0" stroke={INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          : mood === 'cheer' ? <path d="M88 115 q12 20 24 0 z" fill="#BE185D" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            : <path d="M88 115 q6 7 12 0 q6 7 12 0" stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />;

  return (
    <svg className={classes} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Hori maskoti" style={{ '--vivi-level': String(numericLevel) } as CSSProperties}>
      <ellipse cx="100" cy="190" rx="62" ry="7" fill="rgba(0,0,0,.14)" />
      <g className="vivi-bob vivi-cue-body">
        <CatBase />
        {eyes}
        <ellipse cx="56" cy="112" rx="10" ry="6" fill={CHEEK} opacity=".55" />
        <ellipse cx="144" cy="112" rx="10" ry="6" fill={CHEEK} opacity=".55" />
        <CatMuzzle x={100} y={104} />
        {mouth}
      </g>
      {ornament === 'sparkle' && (
        <g className="vivi-cue-ornament vivi-cue-sparkle" fill="#FDE68A" aria-hidden="true">
          <path d="M24 46 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" />
          <path d="M176 32 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />
        </g>
      )}
      {ornament === 'thought_dots' && (
        <g className="vivi-cue-ornament vivi-cue-thought-dots" fill="#A5B4FC" aria-hidden="true">
          <circle cx="153" cy="42" r="6" />
          <circle cx="165" cy="30" r="4" />
          <circle cx="174" cy="21" r="2.5" />
        </g>
      )}
      {ornament === 'heart' && (
        <path className="vivi-cue-ornament vivi-cue-heart" d="M164 44c-10-7-18 4 0 17c18-13 10-24 0-17z" fill="#F472B6" aria-hidden="true" />
      )}
      {!hasCue && mood === 'cheer' && (
        <g fill="#FDE68A" className="vivi-sparkles">
          <path d="M18 44 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" />
          <path d="M180 26 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />
          <path d="M184 150 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5 z" />
        </g>
      )}
      {!hasCue && mood === 'sleep' && (
        <text x="150" y="40" fontSize="26" fontWeight="800" fill="#A5B4FC" fontFamily="Onest, sans-serif" className="vivi-z">
          z<tspan dy="-10" fontSize="20">z</tspan>
        </text>
      )}
    </svg>
  );
}
