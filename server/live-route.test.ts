import { describe, expect, it, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createLiveTokenRoute, LIVE_REACT_TOOL, mintGeminiLiveToken, type LiveRouteDeps } from './live-route.ts';

const req = {} as IncomingMessage;
const res = {} as ServerResponse;

function deps(over: Partial<LiveRouteDeps> = {}) {
  const respond = vi.fn();
  const mintToken = vi.fn(async () => 'auth_tokens/abc');
  const d: LiveRouteDeps = {
    enabled: () => true,
    originAllowed: () => true,
    subject: () => ({ kind: 'account', userId: 'u1' }),
    hasConsent: () => true,
    killSwitchActive: () => false,
    rateLimited: () => null,
    premium: () => false,
    minutesLeft: () => 10,
    markStarted: vi.fn(),
    premiumMinutes: 30,
    readBody: async () => ({ react: true, vad: 'manual' }),
    instruction: () => 'Sen Vivi.',
    mintToken,
    model: 'gemini-3.8-live',
    voice: 'Leda',
    respond,
    ...over,
  };
  return { d, respond, mintToken };
}

describe('Gemini Live token route', () => {
  it('returns a one-use token and a setup with safe mimicry tools', async () => {
    const { d, respond, mintToken } = deps();
    await createLiveTokenRoute(d)(req, res);
    expect(mintToken).toHaveBeenCalledWith(10, expect.anything());
    const [, status, body] = respond.mock.calls[0];
    expect(status).toBe(200);
    expect(body.token).toBe('auth_tokens/abc');
    expect(body.setup.model).toBe('models/gemini-3.8-live');
    expect(body.setup.tools[0].functionDeclarations[0]).toBe(LIVE_REACT_TOOL);
    expect(body.setup.realtimeInputConfig.automaticActivityDetection.disabled).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/slap|punch|angry|spit/);
    expect(d.markStarted).toHaveBeenCalled();
  });

  it.each([
    ['disabled', { enabled: () => false }, 503],
    ['bad origin', { originAllowed: () => false }, 403],
    ['signed out', { subject: () => null }, 401],
    ['no live consent', { hasConsent: () => false }, 403],
    ['kill switch', { killSwitchActive: () => true }, 503],
    ['rate limited', { rateLimited: () => 'tez' }, 429],
    ['out of free minutes', { minutesLeft: () => 0 }, 429],
  ] as const)('never mints a token when %s', async (_name, over, status) => {
    const { d, respond, mintToken } = deps(over as Partial<LiveRouteDeps>);
    await createLiveTokenRoute(d)(req, res);
    expect(mintToken).not.toHaveBeenCalled();
    expect(respond.mock.calls[0][1]).toBe(status);
  });

  it('gives premium users their full session even with no free minutes left', async () => {
    const { d, mintToken } = deps({ premium: () => true, minutesLeft: () => 0 });
    await createLiveTokenRoute(d)(req, res);
    expect(mintToken).toHaveBeenCalledWith(30, expect.anything());
  });

  it('mints with the key only in a server-side header', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ name: 'auth_tokens/xyz' }), { status: 200 }));
    await expect(mintGeminiLiveToken('SERVER-KEY', 5, new AbortController().signal, fetchImpl as unknown as typeof fetch)).resolves.toBe('auth_tokens/xyz');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain('SERVER-KEY');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('SERVER-KEY');
    expect(JSON.parse(String(init.body)).uses).toBe(1);
  });
});
