import { describe, expect, it, vi } from 'vitest';
import { AI_ROUTE_REQUIREMENTS } from './ai-consent.ts';
import { createAiProviderRegistry, type AiProvider } from './ai-provider.ts';

const createFakeProvider = (
  name = 'google-agent-platform',
  serviceNames: readonly string[] = [name],
): AiProvider => ({
  name: name as AiProvider['name'],
  serviceNames: serviceNames as AiProvider['serviceNames'],
  async *streamTutor() {
    yield 'bonjour';
  },
  async generateJson() {
    return { ok: true };
  },
  async transcribe() {
    return { segments: [] };
  },
  async synthesize() {
    return { audio: new Uint8Array([1]), mimeType: 'audio/wav' };
  },
});

describe('AI provider registry', () => {
  it('returns the explicitly registered Google provider', () => {
    const google = createFakeProvider();
    const registry = createAiProviderRegistry([google]);

    expect(registry.get('google-agent-platform')).toBe(google);
    expect(registry.names()).toEqual(['google-agent-platform']);
  });

  it('resolves the STT consent identity only through the explicitly declared Google adapter', async () => {
    const google = createFakeProvider('google-agent-platform', [
      'google-agent-platform',
      'google-cloud-speech-to-text',
    ]);
    const registry = createAiProviderRegistry([google]);
    const sttIdentity = AI_ROUTE_REQUIREMENTS['POST /api/stt'].provider;
    const transcribe = vi.spyOn(google, 'transcribe');

    expect(registry.get(sttIdentity)).toBe(google);
    await expect(registry.get(sttIdentity).transcribe({ audio: new Uint8Array([1]), languageCode: 'uz-UZ' }))
      .resolves.toEqual({ segments: [] });
    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(registry.names()).toEqual(['google-agent-platform', 'google-cloud-speech-to-text']);
  });

  it('fails closed for an unknown provider without calling any provider method', async () => {
    const method = vi.fn();
    const google: AiProvider = {
      ...createFakeProvider(),
      streamTutor: method,
      generateJson: method,
      transcribe: method,
      synthesize: method,
    };
    const registry = createAiProviderRegistry([google]);

    expect(() => registry.get('openai-compatible')).toThrowError(expect.objectContaining({ code: 'unsupported_provider' }));
    expect(method).not.toHaveBeenCalled();
  });

  it('does not substitute another provider when Google is absent', () => {
    const registry = createAiProviderRegistry([]);

    expect(() => registry.get('google-agent-platform')).toThrowError(expect.objectContaining({ code: 'provider_unavailable' }));
    expect(registry.names()).toEqual([]);
  });

  it('rejects attempts to register an unsupported provider', () => {
    expect(() => createAiProviderRegistry([createFakeProvider('azure')])).toThrowError(
      expect.objectContaining({ code: 'unsupported_provider' }),
    );
  });

  it('rejects duplicate Google registrations instead of selecting one implicitly', () => {
    expect(() => createAiProviderRegistry([createFakeProvider(), createFakeProvider()])).toThrowError(
      expect.objectContaining({ code: 'duplicate_provider' }),
    );
  });
});
