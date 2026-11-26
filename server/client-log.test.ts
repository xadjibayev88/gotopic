import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { registerClientLogRoute } from './client-log.ts';

function request(body: unknown) {
  return { method: 'POST', url: '/api/client-log', headers: {}, body } as unknown as IncomingMessage;
}

const response = {} as ServerResponse;

function registeredHandler(deps: Parameters<typeof registerClientLogRoute>[1]) {
  return registerClientLogRoute({}, deps)['POST /api/client-log'];
}

describe('client telemetry discard route', () => {
  it('consumes the free-form payload, returns a generic acknowledgement, and emits no logs', async () => {
    const payload = { message: 'PRIVATE TRANSCRIPT: Je voudrais un café', prompt: 'PRIVATE PROMPT: learner memory' };
    const req = request(payload);
    const readBody = vi.fn(async () => payload);
    const respond = vi.fn();
    const handler = registeredHandler({ isRateLimited: () => false, readBody, respond });
    const logs = (['log', 'info', 'warn', 'error'] as const).map((method) => vi.spyOn(console, method));

    try {
      await handler(req, response);
      expect(readBody).toHaveBeenCalledOnce();
      expect(readBody).toHaveBeenCalledWith(req, 4096);
      expect(respond).toHaveBeenCalledOnce();
      expect(respond).toHaveBeenCalledWith(response, 200, { ok: true });
      for (const log of logs) expect(log).not.toHaveBeenCalled();
      expect(JSON.stringify(respond.mock.calls)).not.toContain('PRIVATE TRANSCRIPT');
      expect(JSON.stringify(respond.mock.calls)).not.toContain('PRIVATE PROMPT');
    } finally {
      for (const log of logs) log.mockRestore();
    }
  });

  it('returns a generic acknowledgement if the request body cannot be parsed', async () => {
    const req = request(undefined);
    const readBody = vi.fn(async () => { throw new Error('PRIVATE BODY PARSE FAILURE'); });
    const respond = vi.fn();
    const handler = registeredHandler({ isRateLimited: () => false, readBody, respond });

    await handler(req, response);
    expect(respond).toHaveBeenCalledWith(response, 200, { ok: true });
    expect(JSON.stringify(respond.mock.calls)).not.toContain('PRIVATE BODY PARSE FAILURE');
  });

  it('applies the existing rate limit before consuming telemetry', async () => {
    const req = request({ message: 'PRIVATE TRANSCRIPT' });
    const readBody = vi.fn(async () => (req as unknown as { body: unknown }).body);
    const respond = vi.fn();
    const handler = registeredHandler({ isRateLimited: () => true, readBody, respond });

    await handler(req, response);
    expect(readBody).not.toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith(response, 429, { ok: false });
  });

  it('uses the shared route-registration helper in production', () => {
    const main = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    expect(main).toContain('Object.freeze(registerClientLogRoute({');
  });
});
