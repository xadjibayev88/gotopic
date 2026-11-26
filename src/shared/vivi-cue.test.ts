import { describe, expect, it } from 'vitest';
import {
  NEUTRAL_VIVI_CUE,
  VIVI_CUE_ACTIONS,
  VIVI_CUE_FACES,
  VIVI_CUE_ORNAMENTS,
  VIVI_CUE_SCHEMA_VERSION,
  VIVI_CUE_STATES,
  validateViviCue,
} from './vivi-cue.ts';

describe('shared versioned ViviCue contract', () => {
  it('publishes a stable explicit schema version', () => {
    expect(VIVI_CUE_SCHEMA_VERSION).toBe(1);
  });

  it('accepts every approved state, face, action, and ornament', () => {
    for (const state of VIVI_CUE_STATES) {
      expect(validateViviCue({ state, face: 'neutral' })).toMatchObject({ state, face: 'neutral' });
    }
    for (const face of VIVI_CUE_FACES) {
      expect(validateViviCue({ state: 'idle', face })).toMatchObject({ state: 'idle', face });
    }
    for (const action of VIVI_CUE_ACTIONS) {
      expect(validateViviCue({ state: 'idle', face: 'neutral', action })).toMatchObject({ action });
    }
    for (const ornament of VIVI_CUE_ORNAMENTS) {
      expect(validateViviCue({ state: 'idle', face: 'neutral', ornament })).toMatchObject({ ornament });
    }
  });

  it('accepts the complete approved cue and retains no extra fields', () => {
    expect(validateViviCue({
      state: 'speaking',
      face: 'supportive',
      action: 'tail_wag',
      ornament: 'heart',
    })).toEqual({ state: 'speaking', face: 'supportive', action: 'tail_wag', ornament: 'heart' });
  });

  it.each([
    undefined,
    null,
    [],
    '[[do:wave]]',
    {},
    { state: 'running', face: 'happy' },
    { state: 'speaking', face: 'angry' },
    { state: 'speaking', face: 'happy', action: 'unknown' },
    { state: 'speaking', face: 'happy', action: 'slap' },
    { state: 'speaking', face: 'happy', action: 'punch' },
    { state: 'speaking', face: 'happy', action: 'spit' },
    { state: 'speaking', face: 'happy', action: 'flip' },
    { state: 'speaking', face: 'happy', action: 'shape:heart' },
    { state: 'speaking', face: 'happy', action: 'eval("unsafe")' },
    { state: 'speaking', face: 'happy', ornament: 'sound:slap' },
    { state: 'speaking', face: 'happy', ornament: ['heart', 'sparkle'] },
    { state: 'speaking', face: 'happy', shape: 'heart' },
    { state: 'speaking', face: 'happy', soundEffect: 'punch' },
    { state: 'speaking', face: 'happy', code: 'alert(1)' },
  ])('maps malformed, unknown, unsafe, or command-like data to neutral (%s)', (input) => {
    expect(validateViviCue(input)).toEqual(NEUTRAL_VIVI_CUE);
  });

  it('returns independent neutral objects for invalid values', () => {
    const one = validateViviCue({ state: 'idle', face: 'angry' });
    const two = validateViviCue({ state: 'idle', face: 'angry' });
    expect(one).toEqual(NEUTRAL_VIVI_CUE);
    expect(one).not.toBe(two);
  });

  it('fails closed for accessors, proxy traps, and hidden symbol fields', () => {
    const getter = Object.defineProperty({ face: 'neutral' }, 'state', {
      enumerable: true,
      get() { throw new Error('untrusted getter'); },
    });
    const proxy = new Proxy({ state: 'idle', face: 'neutral' }, {
      getPrototypeOf() { throw new Error('untrusted proxy'); },
    });
    const symbolField = { state: 'idle', face: 'neutral', [Symbol('shape')]: 'heart' };
    for (const value of [getter, proxy, symbolField]) {
      expect(validateViviCue(value)).toEqual(NEUTRAL_VIVI_CUE);
    }
  });
});
