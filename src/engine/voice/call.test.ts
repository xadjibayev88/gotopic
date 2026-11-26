import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceCall, VOICE_REPLY_WATCHDOG_MS, type CallOptions } from './call';
import type { SttResult, SttReviewReason } from './stt';

const result = (text: string, reviewReasons: SttReviewReason[] = []): SttResult => ({
  text,
  detectedLanguage: 'fr-FR',
  confidence: 0.82,
  alternatives: [],
  reviewReasons,
});

const options = (): CallOptions => ({
  character: 'classic',
  role: 'free',
  customRole: '',
  lang: 'uz',
  voiceId: '',
  inputMode: 'ptt',
  stt: 'browser',
  micLang: 'uz-UZ',
  rate: 1,
  name: 'Ali',
  context: () => ({}),
  config: {
    ai: true,
    stt: false,
    tts: 'browser',
    audioTags: false,
    voices: [],
    sessionMinutes: 10,
    cooldownMinutes: 0,
  },
});

beforeEach(() => {
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('VoiceCall speech review', () => {
  it('keeps the memory greeting local and makes no tutor or TTS request at startup', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const base = options();
    const call = new VoiceCall({
      ...base,
      context: () => ({ memory: 'The learner is practicing greetings.' }),
      config: { ...base.config, tts: 'elevenlabs' },
    });
    const internal = call as unknown as {
      mic: { open: () => Promise<void> };
      setupStt: (preference: string) => void;
      stt: { abort: () => void } | null;
      tts: { unlock: () => void; push: (text: string) => void };
    };
    vi.spyOn(internal.mic, 'open').mockResolvedValue();
    vi.spyOn(internal, 'setupStt').mockImplementation(() => { internal.stt = { abort: vi.fn() }; });
    vi.spyOn(internal.tts, 'unlock').mockImplementation(() => undefined);
    const push = vi.spyOn(internal.tts, 'push');

    await call.start();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(call.snap.phase).toBe('ready');
    expect(call.snap.turns).toHaveLength(1);
    expect(call.snap.turns[0]).toMatchObject({ role: 'tutor' });
    call.dispose();
  });

  it('keeps recognized speech editable instead of sending it immediately (autoSend off)', async () => {
    const call = new VoiceCall({ ...options(), autoSend: false });
    call.snap = { ...call.snap, phase: 'user' };

    await (call as unknown as { onFinal: (result: SttResult) => Promise<void> }).onFinal(result('  Salom, Vivi  ', ['confidence_missing']));

    expect(call.snap.phase).toBe('review');
    expect(call.snap.draft).toBe('Salom, Vivi');
    expect(call.snap.sttResult?.reviewReasons).toEqual(['confidence_missing']);
    expect(call.snap.turns).toEqual([]);
    call.dispose();
  });

  it('sends recognized speech to Vivi right away by default (auto-send)', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ code: 'blocked', message: 'blocked' }), { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    const onUserTurn = vi.fn();
    call.onUserTurn = onUserTurn;
    call.snap = { ...call.snap, phase: 'user' };
    await (call as unknown as { onFinal: (result: SttResult) => Promise<void> }).onFinal(result('Bonjour Vivi', []));
    expect(onUserTurn).toHaveBeenCalledOnce();
    expect(call.snap.turns.at(-1)).toMatchObject({ role: 'user', text: 'Bonjour Vivi' });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('api/tutor');
  });

  it('returns to listening without a review box when nothing was heard', async () => {
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'user' };
    await (call as unknown as { onFinal: (result: SttResult) => Promise<void> }).onFinal(result('   ', []));
    expect(call.snap.phase).not.toBe('review');
    expect(call.snap.turns).toHaveLength(0);
  });

  it('does not call the tutor or record a scored turn until the learner confirms the edited text (autoSend off)', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ code: 'blocked', message: 'blocked' }), { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall({ ...options(), autoSend: false });
    const onUserTurn = vi.fn();
    call.onUserTurn = onUserTurn;
    call.snap = { ...call.snap, phase: 'user' };

    await (call as unknown as { onFinal: (result: SttResult) => Promise<void> }).onFinal(result('Je m’appelle Ali', ['alternatives_conflict']));
    call.setDraft('Je m’appelle Alix');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onUserTurn).not.toHaveBeenCalled();
    expect(call.snap.turns).toEqual([]);

    call.submitDraft();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({ message: 'Je m’appelle Alix' });
    expect(onUserTurn).toHaveBeenCalledOnce();
    expect(call.snap.turns.filter((turn) => turn.role === 'user').map((turn) => turn.text)).toEqual(['Je m’appelle Alix']);
    call.dispose();
  });

  it('re-record discards the unconfirmed transcript without tutor, scoring, correction, or memory effects', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    const onUserTurn = vi.fn();
    call.onUserTurn = onUserTurn;
    (call as unknown as { startedAt: number }).startedAt = Date.now();
    call.snap = { ...call.snap, phase: 'review', draft: 'Men suis prêt', turns: [], sttResult: result('Men suis prêt', ['code_switch']) };

    call.discardDraft();

    expect(call.snap.phase).toBe('ready');
    expect(call.snap.draft).toBe('');
    expect(call.snap.turns).toEqual([]);
    expect(onUserTurn).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    call.dispose();
  });

  it('cancel ends the call without submitting an unconfirmed transcript', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    const onUserTurn = vi.fn();
    call.onUserTurn = onUserTurn;
    call.snap = { ...call.snap, phase: 'review', draft: 'Je vais au marché', turns: [], sttResult: result('Je vais au marché') };

    call.cancelDraft();

    expect(call.snap.phase).toBe('ended');
    expect(call.snap.turns).toEqual([]);
    expect(onUserTurn).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    call.dispose();
  });

  it('uses only Cloud STT even if browser SpeechRecognition is present', () => {
    vi.stubGlobal('SpeechRecognition', class { start() {} stop() {} abort() {} });
    vi.stubGlobal('MediaRecorder', class { static isTypeSupported() { return true; } });
    const call = new VoiceCall({ ...options(), stt: 'browser', config: { ...options().config, stt: true } });

    (call as unknown as { setupStt: (pref: string) => void }).setupStt('browser');

    expect(call.snap.sttKind).toBe('cloud');
    call.dispose();
  });

  it('returns to review with the edited draft after a request failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ code: 'blocked', message: 'blocked' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    })));
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Boshlang\'ich matn' };

    call.setDraft('  Tahrirlangan matn  ');
    call.submitDraft();
    await vi.waitFor(() => expect(call.snap.phase).toBe('review'));

    expect(call.snap.draft).toBe('Tahrirlangan matn');
    expect(call.snap.turns.filter((turn) => turn.role === 'user').map((turn) => turn.text)).toEqual(['Tahrirlangan matn']);
    call.setDraft('Yana tahrirlangan');
    call.submitDraft();
    await vi.waitFor(() => expect(call.snap.phase).toBe('review'));
    expect(call.snap.turns.filter((turn) => turn.role === 'user').map((turn) => turn.text)).toEqual(['Yana tahrirlangan']);
    call.dispose();
  });

  it('does not retry a failed tutor POST after the learner begins a newer turn', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      const abort = () => reject(new DOMException('Aborted', 'AbortError'));
      if (signal?.aborted) abort();
      else signal?.addEventListener('abort', abort, { once: true });
    }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Birinchi matn' };

    call.submitDraft();
    call.pressStart();
    await vi.advanceTimersByTimeAsync(700);

    expect(call.snap.phase).toBe('user');
    expect(fetchMock).toHaveBeenCalledOnce();
    call.dispose();
  });

  it('sends at most one POST after a first-token stall and retries only after the learner asks', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      const abort = () => reject(new DOMException('Aborted', 'AbortError'));
      if (signal?.aborted) abort();
      else signal?.addEventListener('abort', abort, { once: true });
    }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Qayta tekshiriladigan matn' };

    call.submitDraft();
    await vi.advanceTimersByTimeAsync(VOICE_REPLY_WATCHDOG_MS);

    expect(call.snap.phase).toBe('review');
    expect(call.snap.retryAvailable).toBe(true);
    expect(call.snap.draft).toBe('Qayta tekshiriladigan matn');
    expect(fetchMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(fetchMock).toHaveBeenCalledOnce();

    call.submitDraft();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    call.dispose();
  });

  it('does not automatically repeat an ambiguous network failure before the first token', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => { throw new TypeError('network'); });
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Tasdiqlangan matn' };

    call.submitDraft();
    await vi.advanceTimersByTimeAsync(0);
    expect(call.snap.phase).toBe('review');
    expect(call.snap.retryAvailable).toBe(true);
    expect(call.snap.draft).toBe('Tasdiqlangan matn');
    expect(fetchMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledOnce();
    call.dispose();
  });
});


describe('Task 7 sequential text and cue handling', () => {
  it('waits for complete tutor text before queuing speech and stores cue separately', async () => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => { release = resolve; });
    const encoder = new TextEncoder();
    const fetchMock = vi.fn(async () => new Response(new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode('data: {"t":"[fr]Bonjour ![/fr] Salom."}\n\n'));
        await held;
        controller.enqueue(encoder.encode('data: {"cue":{"state":"speaking","face":"happy","action":"hop"}}\n\n'));
        controller.enqueue(encoder.encode('data: {"done":true}\n\n'));
        controller.close();
      },
    }), { headers: { 'content-type': 'text/event-stream' } }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Je voudrais un café.' };
    const queue = (call as unknown as { tts: { push: (text: string) => void } }).tts;
    const push = vi.spyOn(queue, 'push');

    call.submitDraft();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(push).not.toHaveBeenCalled();

    release();
    await vi.waitFor(() => expect(push).toHaveBeenCalled());
    expect(call.snap.cue).toEqual({ state: 'speaking', face: 'happy', action: 'hop' });
    call.dispose();
  });

  it('does not persist or speak a partial tutor response when the completion event is missing', async () => {
    const encoder = new TextEncoder();
    const fetchMock = vi.fn(async () => new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"t":"[fr]Bonjour ![/fr] Salom."}\n\n'));
        controller.enqueue(encoder.encode('data: {"cue":{"state":"speaking","face":"happy","action":"hop"}}\n\n'));
        controller.close();
      },
    }), { headers: { 'content-type': 'text/event-stream' } }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Je voudrais un café.' };
    const queue = (call as unknown as { tts: { push: (text: string) => void } }).tts;
    const push = vi.spyOn(queue, 'push');

    call.submitDraft();
    await vi.waitFor(() => expect(call.snap.phase).toBe('review'));

    expect(call.snap.retryAvailable).toBe(true);
    expect(call.snap.draft).toBe('Je voudrais un café.');
    expect(call.snap.turns.map((turn) => turn.role)).toEqual(['user']);
    expect(call.snap.live).toBe('');
    expect(call.snap.cue).toEqual({ state: 'idle', face: 'neutral' });
    expect(push).not.toHaveBeenCalled();
    call.dispose();
  });

  it('preserves the confirmed draft and creates no assistant turn or TTS for blank completed replies', async () => {
    const cases: unknown[][] = [
      [{ done: true }],
      [{ t: '' }, { done: true }],
      [{ t: ' \n\t ' }, { done: true }],
    ];
    const fetchMock = vi.fn(async () => {
      const events = cases.shift()!;
      return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''), {
        headers: { 'content-type': 'text/event-stream' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    for (let i = 0; i < 3; i++) {
      const call = new VoiceCall(options());
      call.snap = { ...call.snap, phase: 'review', draft: 'Je voudrais un café.' };
      const queue = (call as unknown as { tts: { push: (text: string) => void } }).tts;
      const push = vi.spyOn(queue, 'push');

      call.submitDraft();
      await vi.waitFor(() => expect(call.snap.phase).toBe('review'));

      expect(call.snap.draft).toBe('Je voudrais un café.');
      expect(call.snap.retryAvailable).toBe(true);
      expect(call.snap.turns.map((turn) => turn.role)).toEqual(['user']);
      expect(call.snap.live).toBe('');
      expect(call.snap.cue).toEqual({ state: 'idle', face: 'neutral' });
      expect(push).not.toHaveBeenCalled();
      call.dispose();
    }
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('discards an in-flight partial tutor response when the learner interrupts', async () => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => { release = resolve; });
    const encoder = new TextEncoder();
    const fetchMock = vi.fn(async () => new Response(new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode('data: {"t":"[fr]Bonjour ![/fr]"}\n\n'));
        controller.enqueue(encoder.encode('data: {"cue":{"state":"speaking","face":"happy","action":"hop"}}\n\n'));
        await held;
        controller.close();
      },
    }), { headers: { 'content-type': 'text/event-stream' } }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Je voudrais un café.' };
    const queue = (call as unknown as { tts: { push: (text: string) => void } }).tts;
    const push = vi.spyOn(queue, 'push');

    call.submitDraft();
    await vi.waitFor(() => {
      expect(call.snap.live).toContain('Bonjour !');
      expect(call.snap.cue).toEqual({ state: 'speaking', face: 'happy', action: 'hop' });
    });
    call.interrupt();

    expect(call.snap.live).toBe('');
    expect(call.snap.cue).toEqual({ state: 'idle', face: 'neutral' });
    expect(call.snap.turns.map((turn) => turn.role)).toEqual(['user']);
    expect(call.snap.turns.some((turn) => turn.text.includes('Bonjour'))).toBe(false);
    expect(push).not.toHaveBeenCalled();
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    call.dispose();
  });
});


describe('Task 8 strict client cue validation', () => {
  it('maps an otherwise valid cue carrying a shape or sound command to neutral', async () => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => { release = resolve; });
    const encoder = new TextEncoder();
    const fetchMock = vi.fn(async () => new Response(new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode('data: {"t":"Bonjour."}\n\n'));
        controller.enqueue(encoder.encode('data: {"cue":{"state":"speaking","face":"happy","action":"hop","shape":"heart","soundEffect":"slap"}}\n\n'));
        await held;
        controller.enqueue(encoder.encode('data: {"done":true}\n\n'));
        controller.close();
      },
    }), { headers: { 'content-type': 'text/event-stream' } }));
    vi.stubGlobal('fetch', fetchMock);
    const call = new VoiceCall(options());
    call.snap = { ...call.snap, phase: 'review', draft: 'Je voudrais un café.' };

    try {
      call.submitDraft();
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
      await vi.waitFor(() => expect(call.snap.live).toContain('Bonjour.'));
      expect(call.snap.cue).toEqual({ state: 'idle', face: 'neutral' });
    } finally {
      release();
      call.dispose();
    }
  });
});
