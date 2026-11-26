import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveSession, type LiveOptions } from './live';


const options = (inputMode: LiveOptions['inputMode']): LiveOptions => ({
  character: 'classic',
  role: 'free',
  customRole: '',
  explicit: false,
  lang: 'uz',
  inputMode,
  context: () => ({}),
});

const internals = (session: LiveSession) => session as unknown as {
  vad: { on: boolean; ptt: boolean };
  ws: WebSocket | null;
  sendAudio: (pcm: Uint8Array) => void;
  vadStep: (rms: number, chunkMs: number, pcm: Uint8Array) => void;
};

beforeEach(() => {
  vi.stubGlobal('WebSocket', { OPEN: 1 });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => vi.unstubAllGlobals());

describe('Gemini Live input mode', () => {
  it('does not auto-open or send audio in PTT mode until deliberately activated', () => {
    const session = new LiveSession(options('ptt'));
    session.snap = { ...session.snap, phase: 'listening' };
    const inner = internals(session);
    inner.ws = { readyState: 1, send: vi.fn() } as unknown as WebSocket;
    const sendAudio = vi.fn();
    inner.sendAudio = sendAudio;
    const pcm = new Uint8Array([1, 2]);

    inner.vadStep(0.5, 100, pcm);
    expect(inner.vad.on).toBe(false);
    expect(sendAudio).not.toHaveBeenCalled();

    session.togglePushToTalk();
    expect(inner.vad.on).toBe(true);
    expect(inner.vad.ptt).toBe(true);
    inner.vadStep(0.5, 100, pcm);
    expect(sendAudio).toHaveBeenCalledOnce();

    session.togglePushToTalk();
    expect(inner.vad.on).toBe(false);
    expect(inner.vad.ptt).toBe(false);
  });

  it('keeps automatic voice activity detection in hands-free mode', () => {
    const session = new LiveSession(options('handsfree'));
    session.snap = { ...session.snap, phase: 'listening' };
    const inner = internals(session);
    inner.ws = { readyState: 1, send: vi.fn() } as unknown as WebSocket;

    inner.vadStep(0.1, 100, new Uint8Array([1]));
    inner.vadStep(0.1, 100, new Uint8Array([1]));

    expect(inner.vad.on).toBe(true);
    expect(inner.vad.ptt).toBe(false);
  });

  it('requests a Live token and the microphone as soon as the learner starts Live', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ token: 'mock-token' }), { status: 200 }));
    const getUserMedia = vi.fn(async () => { throw new Error('mock microphone only'); });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    const session = new LiveSession(options('ptt') as LiveOptions);

    await session.start();

    expect(String((fetchMock.mock.calls[0] as unknown as [string])[0])).toContain('api/live/token');
    expect(getUserMedia).toHaveBeenCalledOnce();
    expect(session.snap.phase).toBe('ended'); // the mocked microphone refuses
  });

  it('ends without opening the microphone when the server refuses a token', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ code: 'ai_consent_required', message: 'rozilik kerak' }), { status: 403 }));
    const getUserMedia = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    const session = new LiveSession(options('ptt') as LiveOptions);
    await session.start();
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(session.snap.error).toContain('rozilik');
  });
});


const { playSfxMock } = vi.hoisted(() => ({ playSfxMock: vi.fn() }));
vi.mock('../audio', () => ({ playSfx: playSfxMock }));
import { NEUTRAL_VIVI_CUE } from '../../shared/vivi-cue.ts';

describe('Task 8 Live cue safety boundary (unit-only; no Live session is started)', () => {
  it.each([
    ['angry face', { face: 'angry', gesture: 'wave' }],
    ['flip action', { face: 'happy', gesture: 'flip' }],
    ['punch action', { face: 'happy', gesture: 'punch' }],
    ['sound command', { face: 'happy', gesture: 'wave', sfx: 'slap' }],
    ['sound-command field even when none', { face: 'happy', gesture: 'wave', sfx: 'none' }],
    ['action without required face', { gesture: 'wave' }],
    ['shape morph', { face: 'happy', gesture: 'wave', shape: 'heart' }],
    ['arbitrary command', { face: 'happy', gesture: 'wave', code: 'alert(1)' }],
  ])('maps %s to neutral and dispatches no effect', (_label, cue) => {
    playSfxMock.mockClear();
    const session = new LiveSession(options('ptt'));
    const react = (session as unknown as { react: (value: Record<string, string>) => void }).react;
    react.call(session, cue);
    expect(session.snap.cue).toEqual(NEUTRAL_VIVI_CUE);
    expect(playSfxMock).not.toHaveBeenCalled();
  });

  it('keeps a valid semantic action inside the shared cue contract', () => {
    const session = new LiveSession(options('ptt'));
    const react = (session as unknown as { react: (value: Record<string, string>) => void }).react;
    react.call(session, { face: 'happy', gesture: 'wave' });
    expect(session.snap.cue).toEqual({ state: 'idle', face: 'happy', action: 'wave' });
    expect(playSfxMock).not.toHaveBeenCalled();
  });
});
