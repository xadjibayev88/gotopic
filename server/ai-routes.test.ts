import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { initialState } from '../src/engine/game.ts';
import { AI_CONSENT_POLICY_VERSION, AI_ROUTE_REQUIREMENTS, grantAiConsent, sanitizeTutorBodyForMemoryConsent, type AiGrant, type AiSubject } from './ai-consent.ts';
import { createAiConsentRoutes, createAiRoutes, deriveTrustedExternalOrigin, effectiveAiRouteReady, enabledAiRoutes, strictRequestOriginAllowed, type AiRouteKey, type AiRouteOperation } from './ai-routes.ts';
import type { AiQuotaReservation, AiQuotaReservationResult, AiQuotaSettlementResult, AiUsage } from './ai-quota.ts';
import { createAiRouteOperations } from './ai-route-operations.ts';
import { db, resetDbForTests } from './db.ts';

process.env.SALUT_DB = ':memory:';

const SUBJECT: AiSubject = { kind: 'account', userId: 'signed-user-1' };
const USAGE: AiUsage = { requests: 1, tokens: 12, sttAudioSeconds: 0, ttsCharacters: 0, ttsAudioSeconds: 0 };
const ROUTES = Object.keys(AI_ROUTE_REQUIREMENTS) as AiRouteKey[];
const LIVE = 'POST /api/live/token' as const;

function makeRequest(routeKey: string, body: unknown = { text: 'Bonjour', private: 'never forward' }, headers: Record<string, string> = {}) {
  const [method, url] = routeKey.split(' ');
  return { method, url, headers: { host: 'app.example.test', ...headers }, body, on: vi.fn() } as unknown as IncomingMessage;
}

function makeResponse() {
  const state: { status: number; headers: Record<string, string>; body: string } = { status: 0, headers: {}, body: '' };
  const response = {
    headersSent: false,
    writableEnded: false,
    writeHead(this: { headersSent: boolean }, status: number, headers: Record<string, string> = {}) { state.status = status; state.headers = headers; this.headersSent = true; return this; },
    setHeader(name: string, value: string) { state.headers[name] = value; return this; },
    write(body = '') { state.body += String(body); return true; },
    end(this: { writableEnded: boolean }, body = '') { if (body) state.body += String(body); this.writableEnded = true; return this; },
    on: vi.fn(),
    removeListener: vi.fn(),
  } as unknown as ServerResponse;
  return { response, state };
}

function routeOperations(runOverride?: AiRouteOperation['run']): Record<AiRouteKey, AiRouteOperation> {
  return Object.fromEntries(ROUTES.map((key) => [key, {
    maxBodyBytes: 2048,
    prepare: (body: unknown) => ({ input: body, usage: USAGE }),
    minimize: (input: unknown) => {
      const { private: _private, ...safe } = input as Record<string, unknown>;
      return safe;
    },
    run: runOverride ?? (async (_input, context) => ({
      status: 200,
      body: await context.providerCall(),
    })),
  }])) as Record<AiRouteKey, AiRouteOperation>;
}

function createRouteHarness(overrides: Partial<{
  subject: AiSubject | null;
  consent: boolean;
  consentGrant: { owner: string; scope: string; provider: string; policyVersion: string; revoked: boolean };
  originAllowed: boolean;
  requestOriginAllowed: (req: IncomingMessage) => boolean;
  sanitizeBody: (route: AiRouteKey, subject: AiSubject, body: unknown) => unknown;
  deadlineMs: number;
  cancellationGraceMs: number;
  providerCallOverride: (route: AiRouteKey, provider: string, payload: unknown, signal: AbortSignal) => Promise<unknown>;
  configReady: boolean;
  killSwitch: boolean;
  reserveResult: AiQuotaReservationResult;
  settleResult: AiQuotaSettlementResult;
  operations: Record<AiRouteKey, AiRouteOperation>;
}> = {}) {
  const reservation: AiQuotaReservation = { requestId: 'request-1', subjectId: SUBJECT.userId, day: '2026-11-24', reservedUsage: USAGE };
  const events: string[] = [];
  const providerCalls: { routeKey: AiRouteKey; provider: string; payload: unknown }[] = [];
  const consentChecks: unknown[] = [];
  const reserve = vi.fn(() => { events.push('reserve'); return overrides.reserveResult ?? { ok: true as const, replayed: false, reservation }; });
  const settle = vi.fn((_held: AiQuotaReservation, _actual: AiUsage) => { events.push('settle'); return overrides.settleResult ?? { ok: true as const, replayed: false, overrun: false }; });
  const abort = vi.fn(() => { events.push('abort'); return { ok: true as const, replayed: false, overrun: false }; });
  const readBody = vi.fn(async (req: IncomingMessage) => {
    events.push('read');
    return (req as unknown as { body: unknown }).body;
  });
  const rawOperations = overrides.operations ?? routeOperations();
  const operations = Object.fromEntries(Object.entries(rawOperations).map(([key, operation]) => [key, {
    maxBodyBytes: operation.maxBodyBytes,
    prepare: (body: unknown) => { events.push('prepare'); return operation.prepare(body); },
    minimize: (input: unknown) => { events.push('minimize'); return operation.minimize(input); },
    run: operation.run,
  }])) as Record<AiRouteKey, AiRouteOperation>;
  const routes = createAiRoutes({
    policyVersion: AI_CONSENT_POLICY_VERSION,
    subject: () => { events.push('identity'); return overrides.subject === undefined ? SUBJECT : overrides.subject; },
    hasConsent: (subject, requirement, version) => {
      events.push('consent');
      consentChecks.push({ subject, requirement, version });
      expect(version).toBe(AI_CONSENT_POLICY_VERSION);
      if (overrides.consentGrant) {
        const grant = overrides.consentGrant;
        return !grant.revoked && grant.owner === subject.userId && grant.scope === requirement.scope
          && grant.provider === requirement.provider && grant.policyVersion === version;
      }
      return overrides.consent ?? true;
    },
    configReady: () => { events.push('config'); return overrides.configReady ?? true; },
    killSwitchActive: () => { events.push('kill-switch'); return overrides.killSwitch ?? false; },
    requestOriginAllowed: (req) => {
      events.push('origin');
      return overrides.requestOriginAllowed ? overrides.requestOriginAllowed(req) : overrides.originAllowed ?? true;
    },
    sanitizeBody: overrides.sanitizeBody,
    deadlineMs: overrides.deadlineMs,
    cancellationGraceMs: overrides.cancellationGraceMs,
    readBody,
    respond: (res, status, body) => {
      const target = res as unknown as ReturnType<typeof makeResponse>['response'] & { __state?: ReturnType<typeof makeResponse>['state'] };
      // The response mock captures state through its methods; response body is JSON in end().
      target.writeHead(status, { 'content-type': 'application/json' });
      target.end(JSON.stringify(body));
    },
    quota: { reserveAiUsage: reserve, settleAiUsage: settle, abortAiUsage: abort },
    requestId: () => 'request-1',
    operations,
    providerCall: async (routeKey, provider, payload, signal) => {
      events.push('provider');
      providerCalls.push({ routeKey, provider, payload });
      if (overrides.providerCallOverride) return overrides.providerCallOverride(routeKey, provider, payload, signal);
      return { ok: true };
    },
  });
  return { routes, events, providerCalls, consentChecks, reserve, settle, abort, readBody, reservation };
}

async function invoke(
  routeKey: AiRouteKey,
  harness = createRouteHarness(),
  body: unknown = { text: 'Bonjour', private: 'never forward' },
  headers: Record<string, string> = {},
) {
  const { response, state } = makeResponse();
  await harness.routes[routeKey](makeRequest(routeKey, body, headers), response);
  return { state, harness };
}

describe('AI route consent/quota middleware', () => {
  it.each(ROUTES)('fails closed on missing signed identity for %s', async (routeKey) => {
    const harness = createRouteHarness({ subject: null });
    const { state } = await invoke(routeKey, harness);
    expect(state.status).toBe(routeKey === LIVE ? 503 : 401);
    expect(harness.providerCalls).toHaveLength(0);
    expect(harness.reserve).not.toHaveBeenCalled();
    if (routeKey !== LIVE) expect(harness.readBody).not.toHaveBeenCalled();
  });

  it.each(ROUTES)('passes signed identity and exact current route requirement to consent check for %s', async (routeKey) => {
    const harness = createRouteHarness();
    await invoke(routeKey, harness);
    if (routeKey === LIVE) expect(harness.consentChecks).toHaveLength(0);
    else expect(harness.consentChecks).toEqual([{
      subject: SUBJECT,
      requirement: AI_ROUTE_REQUIREMENTS[routeKey],
      version: AI_CONSENT_POLICY_VERSION,
    }]);
  });

  it.each(ROUTES)('blocks %s when the injected current-consent check denies access', async (routeKey) => {
    const harness = createRouteHarness({ consent: false });
    const { state } = await invoke(routeKey, harness);
    expect(state.status).toBe(routeKey === LIVE ? 503 : 403);
    expect(harness.providerCalls).toHaveLength(0);
    expect(harness.reserve).not.toHaveBeenCalled();
    if (routeKey !== LIVE) expect(harness.readBody).not.toHaveBeenCalled();
  });

  it.each([
    ['stale policy', { policyVersion: '2025-01-01-v1' }],
    ['revoked grant', { revoked: true }],
    ['wrong provider', { provider: 'google-cloud-speech-to-text' }],
    ['different account', { owner: 'signed-user-2' }],
  ])('rejects the tutor route for an explicit %s consent mismatch', async (_label, change) => {
    const consentGrant = {
      owner: SUBJECT.userId,
      scope: 'text_tutor',
      provider: 'google-agent-platform',
      policyVersion: AI_CONSENT_POLICY_VERSION,
      revoked: false,
      ...change,
    };
    const harness = createRouteHarness({ consentGrant });
    const { state } = await invoke('POST /api/tutor', harness);
    expect(state.status).toBe(403);
    expect(harness.providerCalls).toHaveLength(0);
    expect(harness.reserve).not.toHaveBeenCalled();
    expect(harness.readBody).not.toHaveBeenCalled();
  });

  it('rejects stale, revoked, wrong-scope/provider, and cross-account consent for every provider route', async () => {
    for (const routeKey of ROUTES.filter((route) => route !== LIVE)) {
      const requirement = AI_ROUTE_REQUIREMENTS[routeKey];
      const wrongProvider = requirement.provider === 'google-agent-platform'
        ? 'google-cloud-speech-to-text'
        : 'google-agent-platform';
      const wrongScope = requirement.scope === 'text_tutor' ? 'translation' : 'text_tutor';
      const mismatches: Array<[string, Record<string, unknown>]> = [
        ['stale policy', { policyVersion: '2025-01-01-v1' }],
        ['revoked', { revoked: true }],
        ['wrong provider', { provider: wrongProvider }],
        ['wrong scope', { scope: wrongScope }],
        ['another account', { owner: 'signed-user-2' }],
      ];

      for (const [label, change] of mismatches) {
        const consentGrant = {
          owner: SUBJECT.userId,
          scope: requirement.scope,
          provider: requirement.provider,
          policyVersion: AI_CONSENT_POLICY_VERSION,
          revoked: false,
          ...change,
        };
        const harness = createRouteHarness({ consentGrant });
        const { state } = await invoke(routeKey, harness);

        expect(state.status, `${routeKey} / ${label}`).toBe(403);
        expect(harness.readBody, `${routeKey} / ${label}`).not.toHaveBeenCalled();
        expect(harness.reserve, `${routeKey} / ${label}`).not.toHaveBeenCalled();
        expect(harness.providerCalls, `${routeKey} / ${label}`).toHaveLength(0);
      }
    }
  });

  it.each(ROUTES)('blocks %s when provider configuration is unready', async (routeKey) => {
    const harness = createRouteHarness({ configReady: false });
    const { state } = await invoke(routeKey, harness);
    expect(state.status).toBe(503);
    expect(harness.providerCalls).toHaveLength(0);
    expect(harness.reserve).not.toHaveBeenCalled();
  });

  it.each(ROUTES)('blocks %s when the emergency kill switch is active', async (routeKey) => {
    const harness = createRouteHarness({ killSwitch: true });
    const { state } = await invoke(routeKey, harness);
    expect(state.status).toBe(503);
    expect(harness.providerCalls).toHaveLength(0);
    expect(harness.reserve).not.toHaveBeenCalled();
  });

  it.each(ROUTES)('makes zero provider calls for %s when atomic quota denies or storage is unverified', async (routeKey) => {
    for (const reason of ['subject_limit', 'store_unverified', 'store_error'] as const) {
      const harness = createRouteHarness({ reserveResult: { ok: false, reason } });
      const { state } = await invoke(routeKey, harness);
      expect(state.status).toBe(routeKey === LIVE ? 503 : reason === 'subject_limit' ? 429 : 503);
      expect(harness.providerCalls).toHaveLength(0);
      if (routeKey !== LIVE) expect(harness.reserve).toHaveBeenCalledTimes(1);
    }
  });

  it('checks gates before reading or parsing data, reserves before the minimized provider payload, then settles', async () => {
    const harness = createRouteHarness();
    const { state } = await invoke('POST /api/tutor', harness);
    expect(state.status).toBe(200);
    expect(harness.events).toEqual(['identity', 'consent', 'origin', 'config', 'kill-switch', 'read', 'prepare', 'reserve', 'minimize', 'provider', 'settle']);
    expect(harness.providerCalls).toEqual([{
      routeKey: 'POST /api/tutor',
      provider: 'google-agent-platform',
      payload: { text: 'Bonjour' },
    }]);
    expect(harness.settle).toHaveBeenCalledWith(harness.reservation, USAGE);
    expect(harness.abort).not.toHaveBeenCalled();
  });

  it('emits sanitized tutor text and a validated cue as separate SSE events', async () => {
    const harness = createRouteHarness({
      operations: createAiRouteOperations(),
      providerCallOverride: async () => ({
        text: '[fr]Oui[/fr] [[do:hop]]',
        cue: { state: 'speaking', face: 'angry', action: 'slap', soundEffect: 'punch' },
      }),
    });
    const { state } = await invoke('POST /api/tutor', harness, { scenario: 'free', message: 'Est-ce correct ?', context: {} });
    const events = state.body.split(/\r?\n\r?\n/).filter(Boolean).map((frame) => JSON.parse(frame.replace(/^data:\s*/, '')));

    expect(state.status).toBe(200);
    expect(state.headers['content-type']).toContain('text/event-stream');
    expect(events).toEqual([
      { t: '[fr]Oui[/fr]' },
      { cue: { state: 'idle', face: 'neutral' } },
      { done: true },
    ]);
    expect(harness.providerCalls).toHaveLength(1);
  });

  it.each([
    { label: 'missing text', output: {} },
    { label: 'empty text', output: { text: '' } },
    { label: 'whitespace-only text', output: { text: ' \n\t ' } },
  ])('rejects tutor output with $label instead of emitting done', async ({ output }) => {
    const harness = createRouteHarness({
      operations: createAiRouteOperations(),
      providerCallOverride: async () => output,
    });
    const { state } = await invoke('POST /api/tutor', harness, { scenario: 'free', message: 'Bonjour', context: {} });

    expect(state.status).toBe(502);
    expect(state.headers['content-type']).toContain('application/json');
    expect(JSON.parse(state.body)).toMatchObject({ code: 'empty_tutor_reply' });
    expect(state.body).not.toContain('"done"');
    expect(harness.providerCalls).toHaveLength(1);
    expect(harness.settle).toHaveBeenCalledOnce();
  });

  it('isolates the minimized upstream snapshot from later operation mutation', async () => {
    const operations = routeOperations(async (_input, context) => {
      (context.providerInput as Record<string, unknown>).private = 'must not reach provider';
      await context.providerCall();
      return { status: 200, body: { ok: true } };
    });
    const harness = createRouteHarness({ operations });
    await invoke('POST /api/tutor', harness);
    expect(harness.providerCalls).toEqual([{
      routeKey: 'POST /api/tutor',
      provider: 'google-agent-platform',
      payload: { text: 'Bonjour' },
    }]);
  });

  it('minimizes tutor input to a prompt and excludes saved memory without separate consent', async () => {
    const operations = createAiRouteOperations();
    const harness = createRouteHarness({
      operations,
      providerCallOverride: async () => ({ text: 'Bonjour, je suis Vivi.', cue: { state: 'speaking', face: 'neutral' } }),
      sanitizeBody: (route, _subject, body) => {
        if (route !== 'POST /api/tutor' || typeof body !== 'object' || body === null) return body;
        const input = body as Record<string, unknown>;
        const context = { ...((input.context ?? {}) as Record<string, unknown>) };
        delete context.memory;
        return { ...input, context };
      },
    });
    const body = {
      scenario: 'free', message: 'Bonjour', history: [{ role: 'user', text: 'Salut' }],
      context: { name: 'Ali', lessons: ['lesson-1'], words: ['bonjour'], mistakes: [], streak: 2, memory: 'PRIVATE SAVED MEMORY' },
      mode: 'chat', character: 'classic', lang: 'uz', customRole: '', audioTags: false, explicit: false,
      apiKey: 'never forward', private: 'never forward',
    };
    const { state } = await invoke('POST /api/tutor', harness, body);
    expect(state.status).toBe(200);
    const payload = harness.providerCalls[0].payload as Record<string, unknown>;
    expect(payload).toHaveProperty('systemInstruction');
    expect(payload).toHaveProperty('contents');
    expect(JSON.stringify(payload)).not.toContain('PRIVATE SAVED MEMORY');
    expect(JSON.stringify(payload)).not.toContain('never forward');
  });

  it.each([
    ['without a memory grant', 'absent'],
    ['after memory grant revocation', 'revoked'],
    ['with active memory consent', 'active'],
  ])('handles tutor memory %s', async (_label, memoryConsentState) => {
    resetDbForTests();
    db().prepare('INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)')
      .run(SUBJECT.userId, 'signed-user-1@example.test', 'Learner', 1);
    const tutorGrant: AiGrant = { scope: 'text_tutor', provider: 'google-agent-platform' };
    const memoryGrant: AiGrant = { scope: 'memory', provider: 'google-agent-platform' };
    if (memoryConsentState === 'active') grantAiConsent(SUBJECT, [tutorGrant, memoryGrant], AI_CONSENT_POLICY_VERSION, 1000);
    else if (memoryConsentState === 'revoked') {
      grantAiConsent(SUBJECT, [tutorGrant, memoryGrant], AI_CONSENT_POLICY_VERSION, 1000);
      grantAiConsent(SUBJECT, [tutorGrant], AI_CONSENT_POLICY_VERSION, 2000);
    } else grantAiConsent(SUBJECT, [tutorGrant], AI_CONSENT_POLICY_VERSION, 1000);
    const operations = createAiRouteOperations();
    const harness = createRouteHarness({
      operations,
      providerCallOverride: async () => ({ text: 'Bonjour, je suis Vivi.', cue: { state: 'speaking', face: 'neutral' } }),
      sanitizeBody: (route, subject, body) => route === 'POST /api/tutor'
        ? sanitizeTutorBodyForMemoryConsent(subject, body)
        : body,
    });
    const body = { scenario: 'free', message: 'Bonjour', context: { memory: 'SHOULD NOT LEAVE ACCOUNT' } };
    const { state } = await invoke('POST /api/tutor', harness, body);
    expect(state.status).toBe(200);
    if (memoryConsentState === 'active') expect(JSON.stringify(harness.providerCalls[0].payload)).toContain('SHOULD NOT LEAVE ACCOUNT');
    else expect(JSON.stringify(harness.providerCalls[0].payload)).not.toContain('SHOULD NOT LEAVE ACCOUNT');
  });

  it('forwards only validated feedback turns, learner vocabulary, and language', async () => {
    const harness = createRouteHarness({ operations: createAiRouteOperations() });
    await invoke('POST /api/tutor/feedback', harness, {
      turns: [{ role: 'user', text: 'Bonjour' }, { role: 'tutor', text: 'Très bien' }, { role: 'user', text: 'Merci' }],
      lang: 'uz', known: ['bonjour'], secret: 'do not forward', unrelated: { value: 'private' },
    });
    const prompt = harness.providerCalls[0].payload as { contents: Array<{ parts: Array<{ text: string }> }> };
    const userData = JSON.parse(prompt.contents[0].parts[0].text) as Record<string, unknown>;
    expect(Object.keys(userData).sort()).toEqual(['biladigan_sozlar', 'suhbat']);
    expect(JSON.stringify(prompt)).not.toContain('do not forward');
  });

  it('forwards only the requested translation text and bounded disambiguating context', async () => {
    const harness = createRouteHarness({ operations: createAiRouteOperations() });
    await invoke('POST /api/translate', harness, { text: 'ça va', context: 'A greeting', secret: 'do not forward' });
    const payload = harness.providerCalls[0].payload as { contents: Array<{ parts: Array<{ text: string }> }> };
    expect(payload.contents[0].parts[0].text).toContain('Ibora: ça va');
    expect(payload.contents[0].parts[0].text).toContain('Kontekst: A greeting');
    expect(JSON.stringify(payload)).not.toContain('do not forward');
  });

  it('forwards only the user-confirmed memory update fields', async () => {
    const harness = createRouteHarness({ operations: createAiRouteOperations() });
    await invoke('POST /api/tutor/memory', harness, {
      memory: '- Learner likes football', name: 'Ali', turns: [{ role: 'user', text: 'I like football' }],
      accountId: 'another-user', apiKey: 'secret',
    });
    const payload = harness.providerCalls[0].payload as { contents: Array<{ parts: Array<{ text: string }> }> };
    expect(payload.contents[0].parts[0].text).toContain("O'quvchi ismi: Ali");
    expect(payload.contents[0].parts[0].text).toContain('I like football');
    expect(JSON.stringify(payload)).not.toContain('another-user');
    expect(JSON.stringify(payload)).not.toContain('secret');
  });

  it('forwards only STT audio bytes and an explicit provider language', async () => {
    const harness = createRouteHarness({ operations: createAiRouteOperations() });
    await invoke('POST /api/stt', harness, {
      audio: 'SGVsbG8=', mime: 'audio/webm', hint: 'fr', context: 'discard me', accountId: 'discard me',
    });
    expect(harness.providerCalls[0]).toEqual({
      routeKey: 'POST /api/stt',
      provider: 'google-cloud-speech-to-text',
      payload: { audio: new Uint8Array(Buffer.from('SGVsbG8=', 'base64')), languageCode: 'fr-FR' },
    });
  });

  it('forwards only cleaned TTS text and drops raw text, voice, and extra fields', async () => {
    const harness = createRouteHarness({ operations: createAiRouteOperations() });
    await invoke('POST /api/tts', harness, {
      text: '[fr]Bonjour[/fr] [[shape:star]]', raw: 'private raw transcript', voice: 'untrusted-voice', extra: 'do not forward',
    });
    expect(harness.providerCalls[0].payload).toEqual({ text: 'Bonjour' });
  });

  it('returns a client error when route payload parsing throws', async () => {
    const operations = routeOperations();
    operations['POST /api/translate'] = {
      ...operations['POST /api/translate'],
      prepare: () => { throw new SyntaxError('malformed request'); },
    };
    const harness = createRouteHarness({ operations });
    const { state } = await invoke('POST /api/translate', harness);
    expect(state.status).toBe(400);
    expect(harness.reserve).not.toHaveBeenCalled();
    expect(harness.providerCalls).toHaveLength(0);
  });

  it('fails closed as unavailable when consent-dependent sanitization throws', async () => {
    const harness = createRouteHarness({ sanitizeBody: () => { throw new Error('private store failure'); } });
    const { state } = await invoke('POST /api/tutor', harness);
    expect(state.status).toBe(503);
    expect(state.body).not.toContain('private store failure');
    expect(harness.reserve).not.toHaveBeenCalled();
    expect(harness.providerCalls).toHaveLength(0);
  });

  it('returns a sanitized error and settles a reservation after an upstream attempt without retrying', async () => {
    const operations = routeOperations(async (_input, context) => {
      await context.providerCall();
      throw new Error('secret=TOKEN raw upstream body and prompt');
    });
    const harness = createRouteHarness({ operations });
    const { state } = await invoke('POST /api/translate', harness);
    expect(harness.providerCalls).toHaveLength(1);
    expect(harness.settle).toHaveBeenCalledTimes(1);
    expect(harness.abort).not.toHaveBeenCalled();
    expect(state.body).not.toContain('TOKEN');
    expect(state.body).not.toContain('raw upstream body');
    expect(state.status).toBe(503);
  });

  it('aborts only when an operation fails before any provider attempt', async () => {
    const operations = routeOperations(async () => { throw new Error('local failure with private input'); });
    const harness = createRouteHarness({ operations });
    const { state } = await invoke('POST /api/tutor/feedback', harness);
    expect(state.status).toBe(503);
    expect(harness.providerCalls).toHaveLength(0);
    expect(harness.abort).toHaveBeenCalledTimes(1);
    expect(harness.settle).not.toHaveBeenCalled();
  });

  it('prevents a second provider call from an operation (no retry/hedge)', async () => {
    const operations = routeOperations(async (_input, context) => {
      await context.providerCall();
      await context.providerCall();
      return { status: 200, body: 'unexpected' };
    });
    const harness = createRouteHarness({ operations });
    const { state } = await invoke('POST /api/stt', harness);
    expect(state.status).toBe(503);
    expect(harness.providerCalls).toHaveLength(1);
    expect(harness.settle).toHaveBeenCalledTimes(1);
  });

  it('fails closed if settlement fails after provider call', async () => {
    const harness = createRouteHarness({ settleResult: { ok: false, reason: 'store_error' } });
    const { state } = await invoke('POST /api/tts', harness);
    expect(state.status).toBe(503);
    expect(harness.providerCalls).toHaveLength(1);
    expect(state.body).not.toContain('store_error');
  });

  it('aborts a reservation when the deadline fires before any provider attempt', async () => {
    const operations = routeOperations(async () => new Promise(() => undefined));
    const harness = createRouteHarness({ operations, deadlineMs: 5, cancellationGraceMs: 5 });
    const { state } = await invoke('POST /api/tutor', harness);
    expect(state.status).toBe(504);
    expect(harness.providerCalls).toHaveLength(0);
    expect(harness.abort).toHaveBeenCalledTimes(1);
    expect(harness.settle).not.toHaveBeenCalled();
  });

  it('settles the reserved usage after an attempted provider call observes cancellation', async () => {
    let providerSignal: AbortSignal | undefined;
    const operations = routeOperations(async (_input, context) => {
      await context.providerCall();
      return { status: 200, body: 'late response' };
    });
    const harness = createRouteHarness({
      operations,
      deadlineMs: 5,
      cancellationGraceMs: 100,
      providerCallOverride: async (_route, _provider, _payload, signal) => {
        providerSignal = signal;
        return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('cancelled')), { once: true }));
      },
    });
    const { state } = await invoke('POST /api/tutor', harness);
    expect(state.status).toBe(504);
    expect(providerSignal?.aborted).toBe(true);
    expect(harness.providerCalls).toHaveLength(1);
    expect(harness.settle).toHaveBeenCalledWith(harness.reservation, USAGE);
    expect(harness.abort).not.toHaveBeenCalled();
  });

  it('keeps an ambiguous in-flight reservation held after deadline and cancellation grace', async () => {
    let providerSignal: AbortSignal | undefined;
    let finishProvider!: (value: unknown) => void;
    const operations = routeOperations(async (_input, context) => {
      await context.providerCall();
      return { status: 200, body: 'late response' };
    });
    const harness = createRouteHarness({
      operations,
      deadlineMs: 5,
      cancellationGraceMs: 5,
      providerCallOverride: async (_route, _provider, _payload, signal) => {
        providerSignal = signal;
        return new Promise((resolve) => { finishProvider = resolve; });
      },
    });
    const { state } = await invoke('POST /api/tutor', harness);
    expect(state.status).toBe(504);
    expect(providerSignal?.aborted).toBe(true);
    expect(harness.settle).not.toHaveBeenCalled();
    expect(harness.abort).not.toHaveBeenCalled();
    finishProvider({ ok: true });
  });

  it.each([
    ['same-host scheme mismatch', { origin: 'http://app.example.test', 'sec-fetch-site': 'same-origin' }],
    ['missing Origin', {}],
    ['cross-site metadata', { origin: 'https://evil.example.test', 'sec-fetch-site': 'cross-site' }],
  ])('blocks AI POSTs when %s', async (_label, headers) => {
    const harness = createRouteHarness({
      requestOriginAllowed: (req) => strictRequestOriginAllowed(req, [], 'https://app.example.test'),
    });
    const { state } = await invoke('POST /api/tutor', harness, { message: 'Do not read this' }, headers);
    expect(state.status).toBe(403);
    expect(harness.readBody).not.toHaveBeenCalled();
    expect(harness.reserve).not.toHaveBeenCalled();
    expect(harness.providerCalls).toHaveLength(0);
  });

  it('allows only an exact trusted scheme/authority or explicit allowed origin and fails closed without trusted origin', () => {
    const correct = makeRequest('POST /api/tutor', {}, { origin: 'https://app.example.test', 'sec-fetch-site': 'same-origin' });
    const wrongScheme = makeRequest('POST /api/tutor', {}, { origin: 'http://app.example.test', 'sec-fetch-site': 'same-origin' });
    expect(strictRequestOriginAllowed(correct, [], 'https://app.example.test')).toBe(true);
    expect(strictRequestOriginAllowed(wrongScheme, [], 'https://app.example.test')).toBe(false);
    expect(strictRequestOriginAllowed(correct, [], null)).toBe(false);
    expect(strictRequestOriginAllowed(makeRequest('POST /api/tutor'), ['https://app.example.test'], null)).toBe(false);
    expect(deriveTrustedExternalOrigin(makeRequest('POST /api/tutor'), { trustProxy: false })).toBeNull();
    expect(deriveTrustedExternalOrigin(makeRequest('POST /api/tutor', {}, {
      'x-forwarded-proto': 'https', 'x-forwarded-host': 'public.example.test',
    }), { trustProxy: true })).toBe('https://public.example.test');
  });

  it('reports effective AI readiness only when every required component is ready and the kill switch is off', () => {
    const ready = {
      providerReady: true,
      quotaMiddlewareReady: true,
      sharedDurableStoreReady: true,
      operationsReady: true,
      killSwitchActive: false,
    };
    expect(effectiveAiRouteReady(ready)).toBe(true);
    for (const key of ['providerReady', 'quotaMiddlewareReady', 'sharedDurableStoreReady', 'operationsReady'] as const) {
      expect(effectiveAiRouteReady({ ...ready, [key]: false })).toBe(false);
    }
    expect(effectiveAiRouteReady({ ...ready, killSwitchActive: true })).toBe(false);
  });

  it('keeps Live disabled regardless of identity, consent, readiness, kill switch, and quota', async () => {
    const cases: Array<Partial<Parameters<typeof createRouteHarness>[0]>> = [
      { subject: null, consent: false, configReady: false, killSwitch: true },
      { subject: SUBJECT, consent: true, configReady: true, killSwitch: false, reserveResult: { ok: false, reason: 'global_limit' } },
    ];
    for (const overrides of cases) {
      const harness = createRouteHarness(overrides);
      const { state } = await invoke(LIVE, harness);
      expect(state.status).toBe(503);
      expect(harness.providerCalls).toHaveLength(0);
      expect(harness.reserve).not.toHaveBeenCalled();
    }
  });

  it('returns a token-free Live-disabled response before reading identity, consent, config, quota, or body', async () => {
    const harness = createRouteHarness();
    const { state } = await invoke(LIVE, harness, { token: 'must-not-be-read', secret: 'must-not-leak' });
    const body = JSON.parse(state.body) as Record<string, unknown>;

    expect(state.status).toBe(503);
    expect(body).toMatchObject({ code: 'live_disabled' });
    expect(body).not.toHaveProperty('token');
    expect(body).not.toHaveProperty('setup');
    expect(JSON.stringify(body)).not.toContain('must-not-leak');
    expect(harness.events).toEqual([]);
    expect(harness.readBody).not.toHaveBeenCalled();
    expect(harness.consentChecks).toHaveLength(0);
    expect(harness.reserve).not.toHaveBeenCalled();
    expect(harness.providerCalls).toHaveLength(0);
  });

  it('keeps the provider and quota readiness gates false in the production route registry', () => {
    const harness = createRouteHarness();
    const routes = enabledAiRoutes(harness.routes, {
      providerEnabled: false,
      quotaReservationReady: false,
    });
    for (const key of ROUTES) expect(routes).not.toHaveProperty(key);
  });

  it('never registers Live even when provider and quota readiness are true', () => {
    const harness = createRouteHarness();
    const routes = enabledAiRoutes(harness.routes, { providerEnabled: true, quotaReservationReady: true });
    expect(routes).not.toHaveProperty(LIVE);
    for (const key of ROUTES.filter((route) => route !== LIVE)) expect(routes).toHaveProperty(key);
  });

  it('keeps runtime and privacy disclosures aligned and excludes legacy provider fallbacks from main', () => {
    const main = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const config = readFileSync(new URL('./ai-config.ts', import.meta.url), 'utf8');
    const tutor = readFileSync(new URL('../src/screens/Tutor.tsx', import.meta.url), 'utf8');
    const privacy = readFileSync(new URL('../public/privacy.html', import.meta.url), 'utf8');
    expect(main).toContain('AI_QUOTA_RESERVATION_MIDDLEWARE_READY = true');
    expect(main).toContain('AI_ROUTE_OPERATIONS_READY = true');
    expect(config).toContain('GOOGLE_PROVIDER_TRANSPORT_READY = true');
    expect(main).toContain('providerCall: createProviderCall(googleProvider)');
    expect(main).toContain("stt: sttReady");
    // Live has its own gate (mode, consent, kill switch, limits) in server/live-route.ts.
    expect(main).toContain("if (routeKey === 'POST /api/live/token') {");
    expect(main).toContain("hasConsent: (subject) => hasAiConsent(subject, 'live_session', 'google-gemini-api')");
    expect(main).toContain('const ai = aiRoutesEffectivelyReady();');
    expect(main).toContain('ai: aiReady');
    expect(main).toContain("requestOriginAllowed: aiRequestOriginAllowed");
    expect(main).toContain("tts: ttsReady ? 'elevenlabs' : 'text'");
    expect(main).toContain('live: liveReady()');
    expect(initialState(0).settings.tutorVoice).toBe(true);
    expect(tutor).toContain('if (state.settings.tutorVoice) speakQueue(frenchParts(reply.text), state.settings.ttsRate);');
    expect(tutor).toContain('tutorVoice: !s.settings.tutorVoice');
    expect(privacy).toContain('server AI va STT o‘chiq');
    expect(privacy).toContain('server TTS inson tomonidan tekshirilmagan va runtime’da faqat matn rejimida');
    expect(privacy).toContain('Matnli tutor javobidagi fransuzcha qismlarni avtomatik o‘qish sozlamasi yangi profil uchun sukut bo‘yicha yoqilgan');
    expect(privacy).toContain('Matn tanlangan brauzer/qurilma SpeechSynthesis dvigateliga berilib');
    expect(privacy).toContain('Server TTS o‘chiq, sozlanmagan yoki xatoga uchraganida, server oqimida brauzer SpeechSynthesis’ga yashirin fallback qilinmaydi');
    expect(privacy).toContain('Live ham o‘chiq');
    for (const legacy of ['GEMINI_API_KEY', 'FALLBACK_LLM', 'azureTts(', 'elevenLabsTts(', 'auth_tokens']) {
      expect(main).not.toContain(legacy);
    }
  });

});

describe('AI consent HTTP route protections', () => {
  const grant: AiGrant = { scope: 'text_tutor', provider: 'google-agent-platform' };

  function consentHarness(subject: AiSubject | null = SUBJECT, failStore = false) {
    const granted: unknown[] = [];
    const revoked: unknown[] = [];
    const deleted: AiSubject[] = [];
    const readBody = vi.fn(async (req: IncomingMessage) => (req as unknown as { body: unknown }).body);
    const routes = createAiConsentRoutes({
      policyVersion: AI_CONSENT_POLICY_VERSION,
      subject: () => subject,
      getConsent: vi.fn(() => {
        if (failStore) throw new Error('private database path');
        return { policyVersion: AI_CONSENT_POLICY_VERSION, grants: [], grantedAt: 1, revokedAt: null };
      }),
      grantConsent: (s, grants, version) => {
        if (failStore) throw new Error('private database path');
        granted.push({ s, grants, version });
        return { policyVersion: version, grants: [], grantedAt: 1, revokedAt: null };
      },
      revokeConsent: (s) => {
        if (failStore) throw new Error('private database path');
        revoked.push(s);
        return { policyVersion: AI_CONSENT_POLICY_VERSION, grants: [], grantedAt: 1, revokedAt: 2 };
      },
      deleteMemory: (s) => {
        if (failStore) throw new Error('private database path');
        deleted.push(s);
        return true;
      },
      readBody,
      respond: (res, status, body) => {
        const target = res as unknown as ServerResponse;
        target.writeHead(status, { 'content-type': 'application/json' });
        target.end(JSON.stringify(body));
      },
      allowedOrigins: ['https://allowed.example.test'],
      trustedOrigin: () => 'https://app.example.test',
    });
    return { routes, granted, revoked, deleted, readBody };
  }

  it('requires a signed account for GET and returns the current policy version for an account', async () => {
    const signedOut = consentHarness(null);
    let res = makeResponse();
    await signedOut.routes['GET /api/ai/consent'](makeRequest('GET /api/ai/consent'), res.response);
    expect(res.state.status).toBe(401);

    const signedIn = consentHarness();
    res = makeResponse();
    await signedIn.routes['GET /api/ai/consent'](makeRequest('GET /api/ai/consent'), res.response);
    expect(res.state.status).toBe(200);
    expect(res.state.body).toContain(AI_CONSENT_POLICY_VERSION);
  });

  it('returns safe unavailable responses when consent or memory storage fails', async () => {
    const harness = consentHarness(SUBJECT, true);
    const cases: Array<[string, string, unknown, Record<string, string>]> = [
      ['GET /api/ai/consent', 'GET /api/ai/consent', undefined, {}],
      ['PUT /api/ai/consent', 'PUT /api/ai/consent', { policyVersion: AI_CONSENT_POLICY_VERSION, grants: [grant] }, { origin: 'https://allowed.example.test' }],
      ['DELETE /api/ai/consent', 'DELETE /api/ai/consent', {}, { origin: 'https://allowed.example.test' }],
      ['DELETE /api/ai/memory', 'DELETE /api/ai/memory', {}, { origin: 'https://allowed.example.test' }],
    ];
    for (const [key, requestKey, body, headers] of cases) {
      const response = makeResponse();
      await harness.routes[key](makeRequest(requestKey, body, headers), response.response);
      expect(response.state.status).toBe(503);
      expect(response.state.body).not.toContain('private database path');
    }
  });

  it.each([
    ['missing Origin', {}],
    ['untrusted Origin', { origin: 'https://evil.example.test' }],
    ['same host but wrong scheme', { origin: 'http://app.example.test', 'sec-fetch-site': 'same-origin' }],
    ['cross-site Fetch Metadata', { origin: 'https://app.example.test', 'sec-fetch-site': 'cross-site' }],
  ])('rejects consent PUT when %s', async (_label, headers) => {
    const harness = consentHarness();
    const res = makeResponse();
    await harness.routes['PUT /api/ai/consent'](makeRequest('PUT /api/ai/consent', { policyVersion: AI_CONSENT_POLICY_VERSION, grants: [grant] }, headers), res.response);
    expect(res.state.status).toBe(403);
    expect(harness.granted).toHaveLength(0);
  });

  it('allows consent PUT only for current policy with a same-origin or allow-listed Origin', async () => {
    const harness = consentHarness();
    const res = makeResponse();
    await harness.routes['PUT /api/ai/consent'](makeRequest('PUT /api/ai/consent', { policyVersion: AI_CONSENT_POLICY_VERSION, grants: [grant] }, { origin: 'https://app.example.test', 'sec-fetch-site': 'same-origin' }), res.response);
    expect(res.state.status).toBe(200);
    expect(harness.granted).toEqual([{ s: SUBJECT, grants: [grant], version: AI_CONSENT_POLICY_VERSION }]);
  });

  it('rejects stale policy versions and invalid grants at the HTTP boundary', async () => {
    const harness = consentHarness();
    let res = makeResponse();
    await harness.routes['PUT /api/ai/consent'](makeRequest('PUT /api/ai/consent', { policyVersion: 'old', grants: [grant] }, { origin: 'https://allowed.example.test' }), res.response);
    expect(res.state.status).toBe(409);
    expect(harness.granted).toHaveLength(0);

    res = makeResponse();
    await harness.routes['PUT /api/ai/consent'](makeRequest('PUT /api/ai/consent', { policyVersion: AI_CONSENT_POLICY_VERSION, grants: [{ scope: 'text_tutor', provider: 'unknown' }] }, { origin: 'https://allowed.example.test' }), res.response);
    expect(res.state.status).toBe(400);
    expect(harness.granted).toHaveLength(0);

    res = makeResponse();
    await harness.routes['PUT /api/ai/consent'](makeRequest('PUT /api/ai/consent', { policyVersion: AI_CONSENT_POLICY_VERSION, grants: [grant, grant] }, { origin: 'https://allowed.example.test' }), res.response);
    expect(res.state.status).toBe(400);
    expect(harness.granted).toHaveLength(0);
  });

  it('blocks consent DELETE on cross-site requests and revokes only the signed account when allowed', async () => {
    const harness = consentHarness();
    let res = makeResponse();
    await harness.routes['DELETE /api/ai/consent'](makeRequest('DELETE /api/ai/consent', {}, { origin: 'https://app.example.test', 'sec-fetch-site': 'cross-site' }), res.response);
    expect(res.state.status).toBe(403);
    expect(harness.revoked).toHaveLength(0);

    res = makeResponse();
    await harness.routes['DELETE /api/ai/consent'](makeRequest('DELETE /api/ai/consent', {}, { origin: 'https://allowed.example.test' }), res.response);
    expect(res.state.status).toBe(200);
    expect(harness.revoked).toEqual([SUBJECT]);

    const other: AiSubject = { kind: 'account', userId: 'signed-user-2' };
    const isolated = consentHarness(other);
    res = makeResponse();
    await isolated.routes['DELETE /api/ai/consent'](makeRequest('DELETE /api/ai/consent', {}, { origin: 'https://allowed.example.test' }), res.response);
    expect(isolated.revoked).toEqual([other]);
    expect(isolated.revoked).not.toContain(SUBJECT);
  });

  it.each(['DELETE /api/ai/consent', 'DELETE /api/ai/memory'])('rejects %s when Origin is missing or Fetch Metadata is cross-site', async (routeKey) => {
    const cases: Record<string, string>[] = [{}, { origin: 'https://app.example.test', 'sec-fetch-site': 'cross-site' }];
    for (const headers of cases) {
      const harness = consentHarness();
      const response = makeResponse();
      await harness.routes[routeKey](makeRequest(routeKey, {}, headers), response.response);
      expect(response.state.status).toBe(403);
      expect(harness.revoked).toHaveLength(0);
      expect(harness.deleted).toHaveLength(0);
    }
  });
});
