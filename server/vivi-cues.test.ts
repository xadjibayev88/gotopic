import { describe, expect, it } from 'vitest';
import { validateViviCue as validateSharedViviCue } from '../src/shared/vivi-cue.ts';
import { NEUTRAL_VIVI_CUE, validateViviCue, type ViviCue } from './vivi-cues.ts';

describe('ViviCue server boundary', () => {
  it('re-exports the exact shared versioned validator rather than defining a mirror', () => {
    expect(validateViviCue).toBe(validateSharedViviCue);
  });

  it('accepts the complete approved cue', () => {
    const valid: ViviCue = { state: 'speaking', face: 'supportive', action: 'tail_wag', ornament: 'thought_dots' };
    expect(validateViviCue(valid)).toEqual(valid);
  });

  it.each([
    { state: 'running', face: 'happy' },
    { state: 'speaking', face: 'angry' },
    { state: 'speaking', face: 'happy', action: 'unknown' },
    { state: 'speaking', face: 'happy', action: 'slap' },
    { state: 'speaking', face: 'happy', action: 'punch' },
    { state: 'speaking', face: 'happy', action: 'spit' },
    { state: 'speaking', face: 'happy', action: 'flip' },
    { state: 'speaking', face: 'happy', action: 'eval("bad")' },
    { state: 'speaking', face: 'happy', action: 'shape:heart' },
    { state: 'speaking', face: 'happy', ornament: 'sound:slap' },
    { state: 'speaking', face: 'happy', shape: 'heart' },
    { state: 'speaking', face: 'happy', soundEffect: 'slap' },
    null,
    '[[do:slap]]',
  ])('maps malformed, unapproved, extended, or command-like input to neutral', (input) => {
    expect(validateViviCue(input)).toEqual(NEUTRAL_VIVI_CUE);
  });

  it('returns a fresh neutral value for every invalid cue', () => {
    const one = validateViviCue({ action: 'slap' });
    const two = validateViviCue({ action: 'slap' });
    expect(one).toEqual(NEUTRAL_VIVI_CUE);
    expect(one).not.toBe(two);
  });
});
