import { afterEach, describe, expect, it, vi } from 'vitest';
import { updateMemory } from './tutor';

afterEach(() => vi.unstubAllGlobals());

describe('explicit review before memory updates', () => {
  it('never calls the memory endpoint for unconfirmed turns', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await updateMemory('', [{ role: 'user', text: 'I live in Tashkent.' }], 'Learner', false);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends only the reviewed turn set after explicit confirmation', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ memory: '- Lives in Tashkent' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const turns = Array.from({ length: 45 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' as const : 'tutor' as const,
      text: `turn ${index + 1}`,
    }));

    const result = await updateMemory('old memory', turns, 'Learner', true);

    expect(fetchMock).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(init?.body))).toEqual({ memory: 'old memory', turns: turns.slice(-40), name: 'Learner' });
    expect(result).toBe('- Lives in Tashkent');
  });
});
