import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloudStt } from './stt';
import type { SttResult } from './stt-result';

afterEach(() => vi.unstubAllGlobals());

describe('CloudStt typed response contract (mock transport)', () => {
  it('forwards transcript metadata and review reasons from a synthetic server response', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      text: 'Je veux un café',
      detectedLanguage: 'fr-FR',
      confidence: 0.12,
      alternatives: ['Je veux un gâteau'],
      reviewReasons: ['alternatives_conflict', 'language_mismatch'],
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const stt = new CloudStt(() => null);
    const onFinal = vi.fn<(result: SttResult) => void>();
    stt.onFinal = onFinal;
    const internal = stt as unknown as {
      chunks: Blob[];
      startedAt: number;
      finish: (mime: string, lang: string) => Promise<void>;
    };
    // Synthetic bytes stay inside this mocked client test; no provider or network is used.
    internal.chunks = [new Blob([new Uint8Array(1600)], { type: 'audio/webm' })];
    internal.startedAt = Date.now() - 1000;

    await internal.finish('audio/webm', 'uz-UZ');

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(onFinal).toHaveBeenCalledWith({
      text: 'Je veux un café',
      detectedLanguage: 'fr-FR',
      confidence: 0.12,
      alternatives: ['Je veux un gâteau'],
      reviewReasons: ['alternatives_conflict', 'language_mismatch'],
    });
  });

  it('rejects a plain-text-only legacy response instead of weakening the review gate', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ text: 'Bonjour' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const stt = new CloudStt(() => null);
    const onFinal = vi.fn();
    const onError = vi.fn();
    stt.onFinal = onFinal;
    stt.onError = onError;
    const internal = stt as unknown as {
      chunks: Blob[];
      startedAt: number;
      finish: (mime: string, lang: string) => Promise<void>;
    };
    internal.chunks = [new Blob([new Uint8Array(1600)], { type: 'audio/webm' })];
    internal.startedAt = Date.now() - 1000;

    await internal.finish('audio/webm', 'fr-FR');

    expect(onFinal).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('failed', 'STT natijasi notoʻgʻri formatda');
  });
});
