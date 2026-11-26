import { describe, expect, it } from 'vitest';
import { VOICE_CALL_NOTICES } from './VoiceCall';

describe('voice-call notices', () => {
  it('describes TTS quota exhaustion as text-only rather than browser speech', () => {
    expect(VOICE_CALL_NOTICES.ttsQuota).toContain('matn ko‘rinishida qoladi');
    expect(VOICE_CALL_NOTICES.ttsQuota).not.toMatch(/brauzer ovozida/i);
  });
});
