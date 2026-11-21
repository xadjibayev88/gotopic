import { describe, expect, it } from 'vitest';
import { parseTutorRequest, systemInstruction, type TutorRequest } from './tutor.ts';
import { cleanFeedback, feedbackBody, parseFeedbackRequest, parseSttRequest, parseVoices, sttBody, ttsText } from './voice.ts';

const base = { scenario: 'free', message: 'Salom', history: [], context: {} };

describe('voice-mode prompt', () => {
  it('adds character, language, voice rules and body markers', () => {
    const r = parseTutorRequest({ ...base, mode: 'voice', character: 'witty', lang: 'ru', audioTags: true }) as TutorRequest;
    const s = systemInstruction(r);
    expect(s).toContain('Hazilkash Krua');
    expect(s).toContain('rus tilida');
    expect(s).toContain('OVOZLI SUHBAT');
    expect(s).toContain('[[shape:');
    expect(s).toContain('[laughs]');
  });
  it('omits audio tags when TTS does not support them and defaults unknown values', () => {
    const r = parseTutorRequest({ ...base, mode: 'voice', character: 'evil', lang: 'xx' }) as TutorRequest;
    expect(r.character).toBe('classic');
    expect(r.lang).toBe('uz');
    expect(systemInstruction(r)).toContain('ovoz teglarini ishlatma');
  });
  it('strict character never allows insults', () => {
    const r = parseTutorRequest({ ...base, character: 'strict' }) as TutorRequest;
    expect(systemInstruction(r)).toMatch(/HECH QACHON haqorat/);
  });
  it('validates custom roles', () => {
    expect(typeof parseTutorRequest({ ...base, scenario: 'custom', customRole: 'qisqa' })).toBe('string');
    const ok = parseTutorRequest({ ...base, scenario: 'custom', customRole: 'Sen Parijdagi taksi haydovchisisan, men turistman.' }) as TutorRequest;
    expect(systemInstruction(ok)).toContain('taksi haydovchisi');
  });
});

describe('voice server helpers', () => {
  it('parses ElevenLabs voices safely', () => {
    expect(parseVoices('Krua:AbCdEf123456, Bad:!!, Prof:ZZZZZZZZZZ')).toEqual([
      { name: 'Krua', id: 'AbCdEf123456' },
      { name: 'Prof', id: 'ZZZZZZZZZZ' },
    ]);
    expect(parseVoices(undefined)).toEqual([]);
  });
  it('cleans TTS text from markers', () => {
    expect(ttsText('[[shape:star]] [fr]Bonjour ![/fr] Zo\'r! [[do:hop]]')).toBe("Bonjour ! Zo'r!");
    expect(ttsText('  ')).toBeNull();
  });
  it('validates STT audio payloads', () => {
    expect(typeof parseSttRequest({ audio: 'AAAA', mime: 'video/mp4' })).toBe('string');
    expect(typeof parseSttRequest({ audio: '<script>', mime: 'audio/webm' })).toBe('string');
    const ok = parseSttRequest({ audio: 'GkXfo59ChoEBQveBAULygQRC', mime: 'audio/webm;codecs=opus', hint: 'fr' });
    expect(ok).toEqual({ audio: 'GkXfo59ChoEBQveBAULygQRC', mime: 'audio/webm', hint: 'fr' });
    const body = sttBody(ok as never, 'gemini-3.1-flash-lite') as { contents: { parts: { inlineData?: { mimeType: string } }[] }[] };
    expect(body.contents[0].parts[0].inlineData?.mimeType).toBe('audio/webm');
  });
  it('requires enough conversation for feedback and sanitizes output', () => {
    expect(typeof parseFeedbackRequest({ turns: [{ role: 'user', text: 'salom' }] })).toBe('string');
    const req = parseFeedbackRequest({ turns: [{ role: 'user', text: 'Bonjour' }, { role: 'tutor', text: 'Salut' }, { role: 'user', text: 'Je suis Ali' }], lang: 'uz' });
    expect(typeof req).not.toBe('string');
    expect(JSON.stringify(feedbackBody(req as never, 'm'))).toContain('responseSchema');
    const fb = cleanFeedback({ summary: 'ok', strengths: ['a', 5, ''], growth: [{ text: 'x', example: 'e' }, {}], words: [{ fr: 'le chat', uz: 'mushuk' }, { fr: '' }], extra: 1 });
    expect(fb).toEqual({ summary: 'ok', strengths: ['a'], growth: [{ text: 'x', example: 'e', better: '' }], words: [{ fr: 'le chat', uz: 'mushuk' }] });
  });
});
