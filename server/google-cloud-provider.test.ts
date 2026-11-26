import { describe, expect, it, vi } from 'vitest';
import { AI_ROUTE_REQUIREMENTS } from './ai-consent.ts';
import { createAiProviderRegistry } from './ai-provider.ts';
import {
  GOOGLE_CLOUD_PLATFORM_SCOPE,
  createGoogleCloudProvider,
  type GoogleCloudProviderConfig,
} from './google-cloud-provider.ts';

const validConfig = (): GoogleCloudProviderConfig => ({
  provider: 'google-agent-platform',
  projectId: 'voila-ai-project',
  projectAccessVerified: true,
  text: { model: 'gemini-3.5-flash-lite', location: 'asia-southeast1', verified: true },
  speechToText: { model: 'chirp_2', location: 'asia-southeast1', recognizer: '_', verified: true },
  textToSpeech: { model: 'gemini-3.8-flash-lite-tts', location: 'us', voice: 'Kore', verified: true },
});

function setup(response: Response, config = validConfig()) {
  const getAccessToken = vi.fn(async (_scope: string) => 'unit-test-access-token');
  const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response);
  const provider = createGoogleCloudProvider(config, { auth: { getAccessToken }, fetchImpl });
  return { provider, getAccessToken, fetchImpl };
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function validWav(): Buffer {
  const pcm = Buffer.from([0, 0, 0, 0]);
  const wav = Buffer.alloc(44 + pcm.length);
  wav.write('RIFF', 0, 'ascii');
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVE', 8, 'ascii');
  wav.write('fmt ', 12, 'ascii');
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(24_000, 24);
  wav.writeUInt32LE(48_000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36, 'ascii');
  wav.writeUInt32LE(pcm.length, 40);
  pcm.copy(wav, 44);
  return wav;
}

const ttsResponse = (audio: Buffer) =>
  jsonResponse({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/wav', data: audio.toString('base64') } }] } }] });

const textPrompt = {
  systemInstruction: 'Speak French at A1 level.',
  contents: [{ role: 'user' as const, parts: [{ text: 'Bonjour' }] }],
  generationConfig: { temperature: 0.2 },
};

describe('Google Cloud provider fake transport', () => {
  it('sends text JSON through the documented Agent Platform unary endpoint with injected cloud-platform auth', async () => {
    const { provider, getAccessToken, fetchImpl } = setup(
      jsonResponse({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] }),
    );

    await expect(provider.generateJson(textPrompt)).resolves.toEqual({ ok: true });
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(getAccessToken).toHaveBeenCalledWith(GOOGLE_CLOUD_PLATFORM_SCOPE);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe(
      'https://asia-southeast1-aiplatform.googleapis.com/v1/projects/voila-ai-project/locations/asia-southeast1/publishers/google/models/gemini-3.5-flash-lite:generateContent',
    );
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer unit-test-access-token');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      systemInstruction: { parts: [{ text: 'Speak French at A1 level.' }] },
      contents: [{ role: 'user', parts: [{ text: 'Bonjour' }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    });
  });

  it('exposes unary text output as one application chunk without assuming stream wire framing', async () => {
    const { provider, fetchImpl } = setup(jsonResponse({ candidates: [{ content: { parts: [{ text: 'Bonjour, comment allez-vous ?' }] } }] }));
    const chunks: string[] = [];

    for await (const chunk of provider.streamTutor(textPrompt)) chunks.push(chunk);

    expect(chunks).toEqual(['Bonjour, comment allez-vous ?']);
    expect(String(fetchImpl.mock.calls[0][0])).toContain(':generateContent');
    expect(String(fetchImpl.mock.calls[0][0])).not.toContain(':streamGenerateContent');
  });

  it('surfaces cancellation while the response JSON body is being consumed', async () => {
    const controller = new AbortController();
    const json = vi.fn(async () => {
      controller.abort();
      throw Object.assign(new Error('body read aborted'), { name: 'AbortError' });
    });
    const response = { ok: true, status: 200, json } as unknown as Response;
    const { provider, fetchImpl } = setup(response);

    await expect(provider.generateJson(textPrompt, controller.signal)).rejects.toMatchObject({ code: 'request_aborted' });
    expect(json).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not authenticate or fetch when the request is already cancelled', async () => {
    const { provider, getAccessToken, fetchImpl } = setup(jsonResponse({}));
    const controller = new AbortController();
    controller.abort();

    await expect(provider.generateJson(textPrompt, controller.signal)).rejects.toMatchObject({ code: 'request_aborted' });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('does not fetch when cancellation occurs while injected auth is pending', async () => {
    const controller = new AbortController();
    const getAccessToken = vi.fn(async () => {
      controller.abort();
      return 'unit-test-access-token';
    });
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse({}));
    const provider = createGoogleCloudProvider(validConfig(), { auth: { getAccessToken }, fetchImpl });

    await expect(provider.generateJson(textPrompt, controller.signal)).rejects.toMatchObject({ code: 'request_aborted' });
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('does not request auth or fetch when text config is missing or unverified', async () => {
    const config = { ...validConfig(), text: { model: 'gemini-3.5-flash-lite', location: 'asia-southeast1', verified: false } };
    const { provider, getAccessToken, fetchImpl } = setup(jsonResponse({}), config);

    await expect(provider.generateJson(textPrompt)).rejects.toMatchObject({ code: 'provider_unavailable' });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('does not request auth or fetch for an unsupported provider or model', async () => {
    const config = {
      ...validConfig(),
      provider: 'openai-compatible',
      text: { model: 'gemini-2.0-pro', location: 'asia-southeast1', verified: true },
    };
    const { provider, getAccessToken, fetchImpl } = setup(jsonResponse({}), config);

    await expect(provider.generateJson(textPrompt)).rejects.toMatchObject({ code: 'provider_unavailable' });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('does not request auth or fetch for STT unless recognizer, model, location and access are verified', async () => {
    const config = { ...validConfig(), speechToText: undefined };
    const { provider, getAccessToken, fetchImpl } = setup(jsonResponse({}), config);

    await expect(provider.transcribe({ audio: new Uint8Array([1, 2]), languageCode: 'uz-UZ' })).rejects.toMatchObject({
      code: 'provider_unavailable',
    });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('sends STT audio with explicit language and auto decoding, then returns documented result segments', async () => {
    const { provider, fetchImpl } = setup(
      jsonResponse({ results: [{ languageCode: 'uz-UZ', alternatives: [{ transcript: 'Bonjour', confidence: 0.9 }] }] }),
    );

    await expect(provider.transcribe({ audio: new Uint8Array([1, 2, 3]), languageCode: 'uz-UZ' })).resolves.toEqual({
      segments: [{
        languageCode: 'uz-UZ',
        alternatives: [{ transcript: 'Bonjour', confidence: 0.9 }],
      }],
    });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe('https://asia-southeast1-speech.googleapis.com/v2/projects/voila-ai-project/locations/asia-southeast1/recognizers/_:recognize');
    expect(JSON.parse(String(init?.body))).toEqual({
      config: { model: 'chirp_2', languageCodes: ['uz-UZ'], autoDecodingConfig: {} },
      content: Buffer.from([1, 2, 3]).toString('base64'),
    });
  });

  it('resolves the STT route consent identity to the Google adapter and dispatches to Cloud Speech', async () => {
    const { provider, fetchImpl } = setup(jsonResponse({ results: [] }));
    const registry = createAiProviderRegistry([provider]);
    const sttIdentity = AI_ROUTE_REQUIREMENTS['POST /api/stt'].provider;

    expect(provider.name).toBe('google-agent-platform');
    expect(provider.serviceNames).toEqual(['google-agent-platform', 'google-cloud-speech-to-text']);
    await expect(registry.get(sttIdentity).transcribe({ audio: new Uint8Array([1]), languageCode: 'uz-UZ' }))
      .resolves.toEqual({ segments: [] });
    expect(String(fetchImpl.mock.calls[0][0])).toBe(
      'https://asia-southeast1-speech.googleapis.com/v2/projects/voila-ai-project/locations/asia-southeast1/recognizers/_:recognize',
    );
  });

  it('fails closed on a documented-language/location mismatch before auth or fetch', async () => {
    const config = {
      ...validConfig(),
      speechToText: { model: 'chirp_2', location: 'europe-west4', recognizer: '_', verified: true },
    };
    const { provider, getAccessToken, fetchImpl } = setup(jsonResponse({}), config);

    await expect(provider.transcribe({ audio: new Uint8Array([1]), languageCode: 'uz-UZ' })).rejects.toMatchObject({
      code: 'provider_unavailable',
    });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('requires an explicitly verified TTS model, location and voice and uses the documented regional host', async () => {
    const wav = validWav();
    const { provider, fetchImpl } = setup(ttsResponse(wav));

    await expect(provider.synthesize({ text: 'Bonjour' })).resolves.toMatchObject({ mimeType: 'audio/wav', audio: expect.any(Uint8Array) });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe(
      'https://aiplatform.us.rep.googleapis.com/v1/projects/voila-ai-project/locations/us/publishers/google/models/gemini-3.8-flash-lite-tts:generateContent',
    );
    expect(JSON.parse(String(init?.body))).toMatchObject({
      contents: [{ role: 'user', parts: [{ text: 'Bonjour' }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
    });
  });

  it('wraps Gemini TTS raw L16 PCM into a playable WAV and prepends the delivery style', async () => {
    const pcm = Buffer.alloc(4800 * 2, 7);
    const response = jsonResponse({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: pcm.toString('base64') } }] } }] });
    const { provider, fetchImpl } = setup(response, {
      ...validConfig(),
      textToSpeech: { ...validConfig().textToSpeech, style: 'Read warmly in natural Uzbek:' },
    });
    const result = await provider.synthesize({ text: 'Salom!' });
    const wav = Buffer.from(result.audio);
    expect(result.mimeType).toBe('audio/wav');
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.readUInt32LE(24)).toBe(24_000);
    expect(wav.readUInt32LE(40)).toBe(pcm.length);
    expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body)).contents[0].parts[0].text).toBe('Read warmly in natural Uzbek:\n\nSalom!');
  });

  it('uses per-language STT regions so Uzbek and French both work', async () => {
    const ok = jsonResponse({ results: [{ alternatives: [{ transcript: 'Bonjour' }] }] });
    const { provider, fetchImpl } = setup(ok, {
      ...validConfig(),
      speechToText: { ...validConfig().speechToText, locations: { 'uz-UZ': 'asia-southeast1', 'fr-FR': 'europe-west4' } },
    });
    await provider.transcribe({ audio: new Uint8Array([1, 2]), languageCode: 'fr-FR' });
    expect(String(fetchImpl.mock.calls[0][0])).toBe('https://europe-west4-speech.googleapis.com/v2/projects/voila-ai-project/locations/europe-west4/recognizers/_:recognize');
  });

  it('rejects truncated headers and malformed RIFF/WAVE chunks', async () => {
    const invalidWavs = [
      Buffer.from('RIFF'),
      (() => {
        const wav = validWav();
        wav.write('NOPE', 8, 'ascii');
        return wav;
      })(),
      (() => {
        const wav = validWav();
        wav.writeUInt32LE(wav.length - 7, 4);
        return wav;
      })(),
      (() => {
        const wav = validWav();
        wav.writeUInt32LE(8, 16);
        return wav;
      })(),
      (() => {
        const wav = validWav();
        wav.writeUInt32LE(100, 40);
        return wav;
      })(),
    ];

    for (const wav of invalidWavs) {
      const { provider } = setup(ttsResponse(wav));
      await expect(provider.synthesize({ text: 'Bonjour' })).rejects.toMatchObject({ code: 'invalid_response' });
    }
  });

  it('does not invent TTS defaults and does not auth/fetch when the voice is absent', async () => {
    const config = {
      ...validConfig(),
      textToSpeech: { model: 'gemini-3.8-flash-lite-tts', location: 'us', voice: '', verified: true },
    };
    const { provider, getAccessToken, fetchImpl } = setup(jsonResponse({}), config);

    await expect(provider.synthesize({ text: 'Bonjour' })).rejects.toMatchObject({ code: 'provider_unavailable' });
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([429, 500, 502, 503, 504])('does not retry or fall back after HTTP %s and keeps its error free of secrets', async (status) => {
    const { provider, getAccessToken, fetchImpl } = setup(new Response('do-not-leak-upstream-body', { status }));
    const error = await provider.generateJson(textPrompt).then(
      () => {
        throw new Error('Expected provider failure.');
      },
      (value: unknown) => value as Error & { code?: string },
    );
    expect(error).toMatchObject({ code: 'upstream_error', status });
    expect(error.message).not.toContain('unit-test-access-token');
    expect(error.message).not.toContain('do-not-leak-upstream-body');
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('propagates cancellation during a pending fake fetch without issuing another request', async () => {
    const controller = new AbortController();
    let signalFetchStarted!: () => void;
    const fetchStarted = new Promise<void>((resolve) => { signalFetchStarted = resolve; });
    const getAccessToken = vi.fn(async (_scope: string) => 'unit-test-access-token');
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      signalFetchStarted();
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
      });
    });
    const provider = createGoogleCloudProvider(validConfig(), { auth: { getAccessToken }, fetchImpl });

    const pending = provider.generateJson(textPrompt, controller.signal);
    await fetchStarted;
    controller.abort();
    await expect(pending).rejects.toMatchObject({ code: 'request_aborted' });
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not fetch when injected auth fails and does not include auth errors in safe messages', async () => {
    const config = validConfig();
    const getAccessToken = vi.fn(async () => {
      throw new Error('secret-token-from-auth');
    });
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse({}));
    const provider = createGoogleCloudProvider(config, { auth: { getAccessToken }, fetchImpl });

    const error = await provider.generateJson(textPrompt).then(
      () => {
        throw new Error('Expected auth failure.');
      },
      (value: unknown) => value as Error & { code?: string },
    );
    expect(error).toMatchObject({ code: 'auth_unavailable' });
    expect(error.message).not.toContain('secret-token-from-auth');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
