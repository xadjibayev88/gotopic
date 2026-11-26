export const VIVI_CUE_SCHEMA_VERSION = 1 as const;

export const VIVI_CUE_STATES = ['idle', 'listening', 'thinking', 'speaking'] as const;
export const VIVI_CUE_FACES = ['neutral', 'happy', 'amused', 'curious', 'confused', 'surprised', 'supportive', 'proud'] as const;
export const VIVI_CUE_ACTIONS = ['blink', 'head_tilt', 'ear_perk', 'tail_wag', 'giggle', 'hop', 'wave'] as const;
export const VIVI_CUE_ORNAMENTS = ['sparkle', 'thought_dots', 'heart'] as const;

export type ViviCueState = (typeof VIVI_CUE_STATES)[number];
export type ViviCueFace = (typeof VIVI_CUE_FACES)[number];
export type ViviCueAction = (typeof VIVI_CUE_ACTIONS)[number];
export type ViviCueOrnament = (typeof VIVI_CUE_ORNAMENTS)[number];

/** Version 1 deliberately contains only semantic presentation data, never commands or provider text. */
export interface ViviCue {
  readonly state: ViviCueState;
  readonly face: ViviCueFace;
  readonly action?: ViviCueAction;
  readonly ornament?: ViviCueOrnament;
}

export const NEUTRAL_VIVI_CUE: ViviCue = Object.freeze({ state: 'idle', face: 'neutral' });
const CUE_KEYS = new Set(['state', 'face', 'action', 'ornament']);

function isMember<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

function neutral(): ViviCue {
  return Object.freeze({ ...NEUTRAL_VIVI_CUE });
}

/**
 * Validate untrusted server/model/client cue data. Any unknown key or invalid value
 * rejects the entire cue to neutral; no arbitrary action, shape, code, or sound data survives.
 */
export function validateViviCue(value: unknown): ViviCue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return neutral();
  const input = value as Record<string, unknown>;
  try {
    const prototype = Object.getPrototypeOf(input) as object | null;
    if (prototype !== Object.prototype && prototype !== null) return neutral();

    const keys = Reflect.ownKeys(input);
    if (keys.some((key) => typeof key !== 'string' || !CUE_KEYS.has(key))) return neutral();
    const descriptors = Object.getOwnPropertyDescriptors(input) as Record<string, PropertyDescriptor>;
    if (keys.some((key) => !('value' in (descriptors[key as string] ?? {})))) return neutral();

    const state = descriptors.state?.value;
    const face = descriptors.face?.value;
    const action = descriptors.action?.value;
    const ornament = descriptors.ornament?.value;
    if (!isMember(state, VIVI_CUE_STATES) || !isMember(face, VIVI_CUE_FACES)) return neutral();
    if (action !== undefined && !isMember(action, VIVI_CUE_ACTIONS)) return neutral();
    if (ornament !== undefined && !isMember(ornament, VIVI_CUE_ORNAMENTS)) return neutral();

    return Object.freeze({
      state,
      face,
      ...(action !== undefined ? { action } : {}),
      ...(ornament !== undefined ? { ornament } : {}),
    });
  } catch {
    return neutral();
  }
}
