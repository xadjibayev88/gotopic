import { afterEach, describe, expect, it, vi } from 'vitest';
import { askTutor, tutorFailureMessage } from './tutor';

const payload = { scenario: 'free' as const, message: 'Bonjour', history: [], context: {} as never };
const response = (events: string[]) => new Response(events.map((event) => `data: ${event}\n\n`).join(''), {
  headers: { 'content-type': 'text/event-stream' },
});

afterEach(() => vi.unstubAllGlobals());

describe('client tutor SSE contract', () => {
  it('delivers learner-facing text and the separately validated cue through distinct callbacks', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([
      JSON.stringify({ t: 'Bonjour !' }),
      JSON.stringify({ cue: { state: 'speaking', face: 'happy', action: 'hop' } }),
      JSON.stringify({ done: true }),
    ])));
    const onText = vi.fn();
    const onCue = vi.fn();

    await askTutor(payload, onText, undefined, onCue);

    expect(onText).toHaveBeenCalledOnce();
    expect(onText).toHaveBeenCalledWith('Bonjour !');
    expect(onCue).toHaveBeenCalledOnce();
    expect(onCue).toHaveBeenCalledWith({ state: 'speaking', face: 'happy', action: 'hop' });
  });

  it('maps an invalid cue event to the neutral cue without changing text', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([
      JSON.stringify({ t: 'Je voudrais un café.' }),
      JSON.stringify({ cue: { state: 'speaking', face: 'angry', action: 'slap' } }),
      JSON.stringify({ done: true }),
    ])));
    const onText = vi.fn();
    const onCue = vi.fn();

    await askTutor(payload, onText, undefined, onCue);

    expect(onText).toHaveBeenCalledWith('Je voudrais un café.');
    expect(onCue).toHaveBeenCalledWith({ state: 'idle', face: 'neutral' });
  });

  it('maps a cue with an unknown field to neutral without changing text', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([
      JSON.stringify({ t: 'La réponse reste inchangée.' }),
      JSON.stringify({ cue: { state: 'speaking', face: 'happy', action: 'hop', injected: 'ignored' } }),
      JSON.stringify({ done: true }),
    ])));
    const onText = vi.fn();
    const onCue = vi.fn();

    await askTutor(payload, onText, undefined, onCue);

    expect(onText).toHaveBeenCalledWith('La réponse reste inchangée.');
    expect(onCue).toHaveBeenCalledWith({ state: 'idle', face: 'neutral' });
  });

  it('rejects a stream that closes without the explicit done event', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response([JSON.stringify({ t: 'Réponse partielle.' })])));

    await expect(askTutor(payload, vi.fn())).rejects.toMatchObject({ code: 'incomplete_response' });
  });

  it.each([
    { label: 'missing text', events: [JSON.stringify({ done: true })] },
    { label: 'empty text', events: [JSON.stringify({ t: '' }), JSON.stringify({ done: true })] },
    { label: 'whitespace-only text', events: [JSON.stringify({ t: ' \n\t ' }), JSON.stringify({ done: true })] },
  ])('rejects a completed stream with $label and maps it to an error entry', async ({ events }) => {
    vi.stubGlobal('fetch', vi.fn(async () => response(events)));
    const onText = vi.fn();
    let failure: unknown;
    try {
      await askTutor(payload, onText);
    } catch (error) {
      failure = error;
    }

    const errorEntry = tutorFailureMessage(failure);
    expect(failure).toMatchObject({ code: 'empty_response' });
    expect(errorEntry).toMatchObject({ role: 'tutor', error: true });
    expect(errorEntry?.text).not.toBe('...');
    expect(onText.mock.calls.flat().join('').trim()).toBe('');
  });

  it('keeps partial tutor text out of chat history when the stream fails before done', async () => {
    const partial = 'Réponse partielle.';
    vi.stubGlobal('fetch', vi.fn(async () => response([JSON.stringify({ t: partial })])));
    const onText = vi.fn();
    let failure: unknown;
    try {
      await askTutor(payload, onText);
    } catch (error) {
      failure = error;
    }

    const historyEntry = tutorFailureMessage(failure);
    expect(onText).toHaveBeenCalledWith(partial);
    expect(historyEntry).toMatchObject({ role: 'tutor', error: true, text: 'Tutor javobi to‘liq kelmadi. Qayta urinib ko‘ring.' });
    expect(historyEntry?.text).not.toContain(partial);
  });

  it('does not persist partial text when a text-chat request is aborted', () => {
    expect(tutorFailureMessage(new DOMException('Aborted', 'AbortError'))).toBeNull();
  });
});

describe('client tutor transient retry', () => {
  const sse = () => new Response([JSON.stringify({ t: 'Merci !' }), JSON.stringify({ done: true })].map((e) => `data: ${e}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } });
  const err = (status: number, code: string) => new Response(JSON.stringify({ code, message: 'x' }), { status, headers: { 'content-type': 'application/json' } });

  it('asks once more after a brief Google overload and shows the reply', async () => {
    vi.useFakeTimers();
    try {
      const fetchMock = vi.fn().mockResolvedValueOnce(err(503, 'ai_upstream_error')).mockResolvedValueOnce(sse());
      vi.stubGlobal('fetch', fetchMock);
      const onText = vi.fn();
      const done = askTutor(payload, onText);
      await vi.advanceTimersByTimeAsync(1300);
      await done;
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(onText).toHaveBeenCalledWith('Merci !');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not retry limits, consent or a second failure', async () => {
    const limit = vi.fn().mockResolvedValue(err(429, 'ai_quota_exhausted'));
    vi.stubGlobal('fetch', limit);
    await expect(askTutor(payload, vi.fn())).rejects.toMatchObject({ code: 'ai_quota_exhausted' });
    expect(limit).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    try {
      const twice = vi.fn().mockResolvedValueOnce(err(503, 'ai_upstream_error')).mockResolvedValueOnce(err(504, 'ai_timeout'));
      vi.stubGlobal('fetch', twice);
      const p = askTutor(payload, vi.fn());
      const check = expect(p).rejects.toMatchObject({ code: 'ai_timeout' });
      await vi.advanceTimersByTimeAsync(1300);
      await check;
      expect(twice).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
