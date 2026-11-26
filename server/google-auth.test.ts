import { generateKeyPairSync, createVerify } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { createGoogleAdcTokenSource, parseServiceAccountKey, signedAssertion } from './google-auth.ts';
import { GOOGLE_CLOUD_PLATFORM_SCOPE } from './google-cloud-provider.ts';
import { createAiRouteOperations } from './ai-route-operations.ts';
import { createProviderCall, DEFAULT_TTS_STYLE, googleProviderConfigFromEnv } from './ai-runtime.ts';
import type { AiProvider } from './ai-provider.ts';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const keyJson = JSON.stringify({
  type: 'service_account',
  client_email: 'vivi@voila-ai-project.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  token_uri: 'https://oauth2.googleapis.com/token',
});

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('Google ADC token source', () => {
  it('signs a verifiable RS256 JWT bearer assertion for the requested scope', () => {
    const jwt = signedAssertion(parseServiceAccountKey(keyJson), GOOGLE_CLOUD_PLATFORM_SCOPE, 1_000);
    const [h, c, sig] = jwt.split('.');
    const verify = createVerify('RSA-SHA256');
    verify.update(`${h}.${c}`);
    expect(verify.verify(publicKey, Buffer.from(sig, 'base64url'))).toBe(true);
    expect(JSON.parse(Buffer.from(c, 'base64url').toString())).toMatchObject({
      iss: 'vivi@voila-ai-project.iam.gserviceaccount.com',
      scope: GOOGLE_CLOUD_PLATFORM_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: 1_000,
      exp: 4_600,
    });
  });

  it('rejects non-service-account credential files', () => {
    expect(() => parseServiceAccountKey('{"type":"authorized_user"}')).toThrow();
    expect(() => parseServiceAccountKey('not json')).toThrow();
  });

  it('exchanges the service-account assertion once and caches the token until near expiry', async () => {
    let now = 0;
    const fetchImpl = vi.fn(async () => json({ access_token: 'ya29.token', expires_in: 3600 }));
    const source = createGoogleAdcTokenSource({
      env: { GOOGLE_APPLICATION_CREDENTIALS: '/secret/key.json' },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => now,
      readCredentialFile: async () => keyJson,
    });
    const [a, b] = await Promise.all([source.getAccessToken(GOOGLE_CLOUD_PLATFORM_SCOPE), source.getAccessToken(GOOGLE_CLOUD_PLATFORM_SCOPE)]);
    expect(a).toBe('ya29.token');
    expect(b).toBe('ya29.token');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://oauth2.googleapis.com/token');
    expect(String(init.body)).toContain('grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer');
    now = 3_500_000; // inside the refresh margin
    await source.getAccessToken(GOOGLE_CLOUD_PLATFORM_SCOPE);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('falls back to the Cloud Run / GCE metadata server without a key file', async () => {
    const fetchImpl = vi.fn(async () => json({ access_token: 'meta-token', expires_in: 1800 }));
    const source = createGoogleAdcTokenSource({ env: {}, fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(source.getAccessToken(GOOGLE_CLOUD_PLATFORM_SCOPE)).resolves.toBe('meta-token');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token?scopes=');
    expect((init.headers as Record<string, string>)['metadata-flavor']).toBe('Google');
  });

  it('fails instead of returning an unusable token', async () => {
    const source = createGoogleAdcTokenSource({ env: {}, fetchImpl: (async () => json({}, 403)) as unknown as typeof fetch });
    await expect(source.getAccessToken(GOOGLE_CLOUD_PLATFORM_SCOPE)).rejects.toThrow();
  });
});

describe('AI runtime wiring', () => {
  it('builds per-language STT regions and an Uzbek-first TTS style from env', () => {
    const config = googleProviderConfigFromEnv({ VIVI_STT_VERIFIED: 'true', VIVI_TTS_VERIFIED: 'true' });
    expect(config.speechToText).toMatchObject({ model: 'chirp_2', verified: true, locations: { 'uz-UZ': 'asia-southeast1', 'fr-FR': 'europe-west4' } });
    expect(config.textToSpeech).toMatchObject({ model: 'gemini-3.8-flash-tts', voice: 'Leda', location: 'global', style: DEFAULT_TTS_STYLE });
    expect(googleProviderConfigFromEnv({ VIVI_TTS_STYLE: 'off' }).textToSpeech?.style).toBeUndefined();
  });

  it('routes each AI endpoint to exactly one matching provider method', async () => {
    const provider = {
      name: 'google-agent-platform',
      serviceNames: ['google-agent-platform', 'google-cloud-speech-to-text'],
      generateJson: vi.fn(async () => ({ ok: 'json' })),
      transcribe: vi.fn(async () => ({ segments: [] })),
      synthesize: vi.fn(async () => ({ audio: new Uint8Array(46), mimeType: 'audio/wav' })),
      streamTutor: vi.fn(),
    } as unknown as AiProvider;
    const call = createProviderCall(provider);
    const signal = new AbortController().signal;
    await call('POST /api/tutor', 'google-agent-platform', { contents: [] }, signal);
    await call('POST /api/tutor/memory', 'google-agent-platform', { contents: [] }, signal);
    await call('POST /api/stt', 'google-cloud-speech-to-text', { audio: new Uint8Array([1]), languageCode: 'uz-UZ' }, signal);
    await call('POST /api/tts', 'google-agent-platform', { text: 'Salom' }, signal);
    expect(provider.generateJson).toHaveBeenCalledTimes(2);
    expect(provider.transcribe).toHaveBeenCalledTimes(1);
    expect(provider.synthesize).toHaveBeenCalledTimes(1);
    await expect(call('POST /api/live/token', 'google-agent-platform', {}, signal)).rejects.toThrow();
  });

  it('returns TTS as WAV bytes and memory/translate in the shapes the client reads', async () => {
    const ops = createAiRouteOperations();
    const wav = Buffer.alloc(44 + 48_000 * 2);
    wav.writeUInt32LE(24_000, 24);
    const tts = await ops['POST /api/tts'].run({ text: 'Salom, men Viviman!' }, {
      providerInput: null,
      signal: new AbortController().signal,
      providerCall: async () => ({ audio: new Uint8Array(wav), mimeType: 'audio/wav' }),
    });
    expect(tts.binary?.contentType).toBe('audio/wav');
    expect(tts.binary?.data.byteLength).toBe(wav.length);
    expect(tts.actualUsage?.ttsAudioSeconds).toBe(2);
    const prepared = ops['POST /api/tts'].prepare({ text: 'Salom, men Viviman!' });
    expect(typeof prepared === 'object' && prepared.usage.ttsAudioSeconds).toBeGreaterThanOrEqual(tts.actualUsage?.ttsAudioSeconds ?? 0);

    const memory = await ops['POST /api/tutor/memory'].run({}, {
      providerInput: null,
      signal: new AbortController().signal,
      providerCall: async () => ({ memory: ['Ismi Ali'] }),
    });
    expect(memory.body).toEqual({ memory: '- Ismi Ali' });

    const translate = await ops['POST /api/translate'].run({}, {
      providerInput: null,
      signal: new AbortController().signal,
      providerCall: async () => ({ uz: 'salom', say: 'bonjur', extra: 'x' }),
    });
    expect(translate.body).toEqual({ uz: 'salom', say: 'bonjur' });
  });
});
