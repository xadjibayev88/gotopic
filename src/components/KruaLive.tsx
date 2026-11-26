import type { CSSProperties } from 'react';
import { NEUTRAL_VIVI_CUE, validateViviCue, type ViviCueState } from '../shared/vivi-cue';
import { Mascot } from './Mascot';

export type LiveState = ViviCueState;

export function KruaLive({
  cue = NEUTRAL_VIVI_CUE,
  level = 0,
  size = 240,
  pressed = false,
  className = '',
}: {
  /** Untrusted input is revalidated here even when a caller already validated it. */
  cue?: unknown;
  level?: number;
  size?: number;
  pressed?: boolean;
  className?: string;
}) {
  const safeCue = validateViviCue(cue);
  const safeLevel = Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0;
  const style = {
    '--vivi-level': String(safeLevel),
    width: size,
    height: size,
  } as CSSProperties;

  return (
    <div
      className={`krua-live vivi-cue-motion vivi-cue-state-${safeCue.state} ${pressed ? 'pressed' : ''} ${className}`.trim()}
      style={style}
      data-vivi-state={safeCue.state}
    >
      <div className="krua-glow" aria-hidden="true" />
      <Mascot cue={safeCue} level={safeLevel} size={size} className="krua-mascot" />
      {safeCue.state === 'thinking' && safeCue.ornament !== 'thought_dots' && (
        <div className="krua-thinking" aria-hidden="true"><i /><i /><i /></div>
      )}
    </div>
  );
}
