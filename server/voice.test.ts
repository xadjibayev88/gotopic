import { describe, expect, it } from 'vitest';
import { parseTutorRequest, systemInstruction, tutorBehaviorContract, type TutorRequest } from './tutor.ts';
import { azureSsml, cleanFeedback, cleanMemory, feedbackBody, memoryBody, parseMemoryRequest, geminiTts, parseFeedbackRequest, parseSttRequest, parseVoices, sttBody, ttsText } from './voice.ts';
import { createAiRouteOperations } from './ai-route-operations.ts';

const base = { scenario: 'free', message: 'Salom', history: [], context: {} };

describe('voice-mode prompt', () => {
  it('adds character, language, concise voice rules and a separate cue contract', () => {
    const r = parseTutorRequest({ ...base, mode: 'voice', character: 'witty', lang: 'ru', audioTags: true }) as TutorRequest;
    const s = systemInstruction(r);
    expect(s).toContain('Uslub — hozirjavob');
    expect(s).toContain('rus tilida');
    expect(s).toContain("OG'ZAKI USLUB");
    expect(s).toContain('VIVI CUE');
    expect(s).toContain('state=idle|listening|thinking|speaking');
    expect(s).not.toContain('[[shape:');
    expect(s).not.toContain('[laughs]');
  });
  it('does not request audio tags and defaults unknown values', () => {
    const r = parseTutorRequest({ ...base, mode: 'voice', character: 'evil', lang: 'xx' }) as TutorRequest;
    expect(r.character).toBe('classic');
    expect(r.lang).toBe('uz');
    expect(systemInstruction(r)).toContain('[[do:...]]');
    expect(systemInstruction(r)).toContain('JSON qaytar');
  });
  it('strict character never allows insults', () => {
    const r = parseTutorRequest({ ...base, character: 'strict' }) as TutorRequest;
    expect(systemInstruction(r)).toMatch(/haqorat, uyaltirish, qo'rqitish/);
  });
  it('uses the same teaching behavior contract as text mode', () => {
    const voice = systemInstruction(parseTutorRequest({ ...base, mode: 'voice', lang: 'uz' }) as TutorRequest);
    expect(voice).toContain(tutorBehaviorContract('uz'));
  });
  it('validates custom roles', () => {
    expect(typeof parseTutorRequest({ ...base, scenario: 'custom', customRole: 'qisqa' })).toBe('string');
    const ok = parseTutorRequest({ ...base, scenario: 'custom', customRole: 'Sen Parijdagi taksi haydovchisisan, men turistman.' }) as TutorRequest;
    expect(systemInstruction(ok)).toContain('taksi haydovchisi');
  });
});

describe('voice server helpers', () => {
  it('parses ElevenLabs voices safely', () => {
    expect(parseVoices('Vivi:AbCdEf123456, Bad:!!, Prof:ZZZZZZZZZZ')).toEqual([
      { name: 'Vivi', id: 'AbCdEf123456' },
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
    expect(ok).toEqual({ audio: 'GkXfo59ChoEBQveBAULygQRC', mime: 'audio/webm', hint: 'fr', context: '' });
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

describe('STT kontekst', () => {
  it('ustoz gapidan belgilar tozalanadi va promptga qo\'shiladi', () => {
    const r = parseSttRequest({ audio: 'GkXfo59ChoEBQveBAULygQRC', mime: 'audio/webm', context: "Qani: [fr]Comment tu t'appelles ?[/fr] [[ans:fr]]" });
    expect(typeof r).not.toBe('string');
    const req = r as Exclude<typeof r, string>;
    expect(req.context).toBe("Qani: Comment tu t'appelles ?");
    expect(JSON.stringify(sttBody(req, 'gemini-3.5-flash'))).toContain("Comment tu t'appelles");
  });
});

describe('STT result review boundary', () => {
  it('preserves detected language, confidence, alternatives, and review reasons without applying a numeric cutoff', async () => {
    const operation = createAiRouteOperations()['POST /api/stt'];
    const prepared = operation.prepare({ audio: Buffer.from('synthetic metadata only').toString('base64'), mime: 'audio/webm', hint: 'uz' });
    expect(typeof prepared).not.toBe('string');
    if (typeof prepared === 'string') throw new Error(prepared);

    const result = await operation.run(prepared.input, {
      providerInput: operation.minimize(prepared.input),
      signal: new AbortController().signal,
      providerCall: async () => ({
        segments: [{ languageCode: 'fr-FR', alternatives: [
          { transcript: 'Je veux un café', confidence: 0.12 },
          { transcript: 'Je veux un gâteau', confidence: 0.08 },
        ] }],
      }),
    });

    expect(result.body).toEqual({
      text: 'Je veux un café',
      detectedLanguage: 'fr-FR',
      confidence: 0.12,
      alternatives: ['Je veux un gâteau'],
      reviewReasons: ['alternatives_conflict', 'language_mismatch'],
    });
  });

  it('marks mixed Uzbek–French segments for review and does not label them as one language', async () => {
    const operation = createAiRouteOperations()['POST /api/stt'];
    const prepared = operation.prepare({ audio: Buffer.from('metadata').toString('base64'), mime: 'audio/webm', hint: 'auto' });
    expect(typeof prepared).not.toBe('string');
    if (typeof prepared === 'string') throw new Error(prepared);

    const result = await operation.run(prepared.input, {
      providerInput: operation.minimize(prepared.input),
      signal: new AbortController().signal,
      providerCall: async () => ({ segments: [
        { languageCode: 'uz-UZ', alternatives: [{ transcript: 'Men' }] },
        { languageCode: 'fr-FR', alternatives: [{ transcript: 'vais au marché' }] },
      ] }),
    });

    expect(result.body).toEqual({
      text: 'Men vais au marché',
      detectedLanguage: 'unknown',
      alternatives: [],
      reviewReasons: ['confidence_missing', 'code_switch'],
    });
  });
});

describe('Gemini ovozi (bepul)', () => {
  it("429 da keyingi TTS modelga o'tadi va WAV qaytaradi", async () => {
    const seen: string[] = [];
    const quota: string[] = [];
    const pcm = Buffer.alloc(480).toString('base64');
    const fetchImpl = (async (url: string) => {
      const m = /models\/([^:]+):/.exec(url)![1];
      seen.push(m);
      if (m === 'tts-a') return new Response('{"error":{"message":"PerDay"}}', { status: 429 });
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: pcm } }] } }] }), { status: 200 });
    }) as unknown as typeof fetch;
    const r = await geminiTts('Salom', { apiKey: 'k', models: ['tts-a', 'tts-b'], voiceName: 'Leda', fetchImpl, onQuota: (m) => quota.push(m) });
    expect(seen).toEqual(['tts-a', 'tts-b']);
    expect(quota).toEqual(['tts-a']);
    expect(r.mime).toBe('audio/wav');
    expect(r.audio.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(r.audio.length).toBe(44 + 480);
  });
});

describe('xotira', () => {
  it("so'rovni tekshiradi va natijani tozalaydi", () => {
    expect(typeof parseMemoryRequest({ turns: [{ role: 'tutor', text: 'Salom' }] })).toBe('string');
    const r = parseMemoryRequest({ memory: '- Ali', name: 'Ali', turns: [{ role: 'user', text: "Men Toshkentda dasturchiman [[shape:star]]" }] });
    expect(typeof r).not.toBe('string');
    expect(JSON.stringify(memoryBody(r as never, 'gemini-3.5-flash-lite'))).toContain('Toshkentda dasturchiman');
    expect(cleanMemory({ memory: 'Ismi Ali\n- Dasturchi\n\n- Parijga bormoqchi' })).toBe('- Ismi Ali\n- Dasturchi\n- Parijga bormoqchi');
    expect(cleanMemory({})).toBe('');
  });
});

describe('xotira formati', () => {
  it('massiv va bitta qatorli matnni ham qatorlarga ajratadi', () => {
    expect(cleanMemory({ memory: ['Ismi Ali', '- Dasturchi'] })).toBe('- Ismi Ali\n- Dasturchi');
    expect(cleanMemory({ memory: '- Ismi: Ali. - Shahri: Toshkent. - Ishi: Dasturchi.' })).toBe('- Ismi: Ali.\n- Shahri: Toshkent.\n- Ishi: Dasturchi.');
  });
});

describe('Azure ovozi', () => {
  it("SSML: o'zbekcha va fransuzcha qismlar o'z ovozida, belgilar tozalanadi", () => {
    const x = azureSsml("[[shape:star]] Salom, jonim! [fr]Bonjour ![/fr] (bonjur) [laughs] Qani, ayt & takrorla.", 'uz-UZ-MadinaNeural', 'fr-FR-DeniseNeural');
    expect(x).toContain('<voice name="uz-UZ-MadinaNeural">');
    expect(x).toContain('<voice name="fr-FR-DeniseNeural">Bonjour !</voice>');
    expect(x).not.toContain('[[');
    expect(x).not.toContain('(bonjur)');
    expect(x).not.toContain('[laughs]');
    expect(x).toContain('&amp;');
  });
});
