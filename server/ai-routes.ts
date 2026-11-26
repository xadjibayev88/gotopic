import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  AI_CONSENT_POLICY_VERSION,
  AI_ROUTE_REQUIREMENTS,
  type AiConsent,
  type AiGrant,
  type AiProviderName,
  type AiRouteRequirement,
  type AiScope,
  type AiSubject,
} from './ai-consent.ts';
import type {
  AiQuotaReservation,
  AiQuotaReservationResult,
  AiQuotaSettlementResult,
  AiUsage,
} from './ai-quota.ts';

export type AiRouteKey = keyof typeof AI_ROUTE_REQUIREMENTS & string;
export type HttpRouteHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;

export interface AiRoutePrepared {
  readonly input: unknown;
  readonly usage: AiUsage;
}

export interface AiRouteResult {
  readonly status?: number;
  readonly body: unknown;
  readonly actualUsage?: AiUsage;
  /** Optional server-encoded SSE frames, used only after the operation has normalized its result. */
  readonly sseEvents?: readonly string[];
  /** Optional binary body (e.g. synthesized WAV audio) sent with its validated content type. */
  readonly binary?: { readonly data: Uint8Array; readonly contentType: 'audio/wav' };
}

export interface AiRouteExecutionContext {
  readonly providerInput: unknown;
  readonly signal: AbortSignal;
  /** Exactly one upstream attempt is permitted. The middleware does not retry or hedge POST requests. */
  providerCall(): Promise<unknown>;
}

export interface AiRouteOperation {
  readonly maxBodyBytes: number;
  prepare(body: unknown): AiRoutePrepared | string;
  /** Return only fields allowed by the approved route data-minimization matrix. */
  minimize(input: unknown): unknown;
  run(input: unknown, context: AiRouteExecutionContext): Promise<AiRouteResult>;
}

export interface AiRouteQuota {
  reserveAiUsage(subject: AiSubject, usage: AiUsage, requestId: string): AiQuotaReservationResult;
  settleAiUsage(reservation: AiQuotaReservation, actualUsage: AiUsage): AiQuotaSettlementResult;
  abortAiUsage(reservation: AiQuotaReservation): AiQuotaSettlementResult;
}

export interface AiRouteDependencies {
  readonly policyVersion: string;
  readonly subject: (req: IncomingMessage) => AiSubject | null;
  readonly hasConsent: (subject: AiSubject, requirement: AiRouteRequirement, policyVersion: string) => boolean;
  readonly configReady: (route: AiRouteKey) => boolean;
  readonly killSwitchActive: () => boolean;
  /** Strict same-origin/allowlist protection for AI POSTs; missing Origin must fail closed. */
  readonly requestOriginAllowed?: (req: IncomingMessage) => boolean;
  /** Apply consent-dependent route sanitization before parsing or reserving usage. */
  readonly sanitizeBody?: (route: AiRouteKey, subject: AiSubject, body: unknown) => unknown;
  /** Bounded provider/operation attempt. Values are clamped to a safe upper bound. */
  readonly deadlineMs?: number;
  /** Bounded grace period for cancellation to settle an already-started provider attempt. */
  readonly cancellationGraceMs?: number;
  readonly readBody: (req: IncomingMessage, maxBytes: number) => Promise<unknown>;
  readonly respond: (res: ServerResponse, status: number, body: unknown) => void;
  readonly quota: AiRouteQuota;
  readonly requestId: () => string;
  readonly operations: Readonly<Record<AiRouteKey, AiRouteOperation>>;
  /** This is the sole upstream-call hook; production must inject it only after every readiness gate is verified. */
  readonly providerCall: (
    route: AiRouteKey,
    provider: AiProviderName,
    payload: unknown,
    signal: AbortSignal,
  ) => Promise<unknown>;
}

const LIVE_DISABLED = Object.freeze({ code: 'live_disabled', message: 'Jonli rejim hozircha o‘chiq. Oddiy darslardan davom eting.' });
const AI_CONFIG_UNAVAILABLE = Object.freeze({ code: 'ai_config_unavailable', message: 'AI xizmatlari hozircha yoqilmagan.' });
const AI_CONSENT_REQUIRED = Object.freeze({ code: 'ai_consent_required', message: 'Bu AI vazifasi uchun amaldagi rozilik kerak.' });
const AI_QUOTA_UNAVAILABLE = Object.freeze({ code: 'ai_quota_unavailable', message: 'AI quota xizmati hozircha mavjud emas.' });
const AI_UPSTREAM_ERROR = Object.freeze({ code: 'ai_upstream_error', message: 'AI xizmati so‘rovni bajara olmadi.' });
const AI_EXECUTION_ERROR = Object.freeze({ code: 'ai_execution_error', message: 'AI so‘rovini xavfsiz bajarib bo‘lmadi.' });
const AI_TIMEOUT_ERROR = Object.freeze({ code: 'ai_timeout', message: 'AI so‘rovi vaqtida javob bermadi.' });
const AI_ROUTE_DEADLINE_MAX_MS = 120_000;
const AI_CANCEL_GRACE_MAX_MS = 5_000;

function boundedMs(value: number | undefined, fallback: number, maximum: number): number {
  return Number.isFinite(value) && (value as number) > 0
    ? Math.min(maximum, Math.floor(value as number))
    : fallback;
}

function quotaDenial(reason: string): { status: number; body: unknown } {
  if (reason === 'subject_limit' || reason === 'global_limit') {
    return { status: 429, body: { code: 'ai_quota_exhausted', message: 'AI kunlik limiti tugadi.' } };
  }
  return { status: 503, body: AI_QUOTA_UNAVAILABLE };
}

function safeRequestBodyError(error: unknown): { status: number; body: unknown } {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'too_large') return { status: 413, body: { code: 'bad_request', message: 'So‘rov hajmi juda katta.' } };
  return { status: 400, body: { code: 'bad_request', message: 'So‘rov noto‘g‘ri.' } };
}

function safeRespond(res: ServerResponse, respond: AiRouteDependencies['respond'], status: number, body: unknown): void {
  if (res.writableEnded) return;
  respond(res, status, body);
}

function safeRespondBinary(res: ServerResponse, status: number, binary: NonNullable<AiRouteResult['binary']>): void {
  if (res.writableEnded) return;
  res.writeHead(status, {
    'content-type': binary.contentType,
    'content-length': String(binary.data.byteLength),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(Buffer.from(binary.data.buffer, binary.data.byteOffset, binary.data.byteLength));
}

function safeRespondSse(res: ServerResponse, status: number, events: readonly string[]): void {
  if (res.writableEnded) return;
  res.writeHead(status, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    connection: 'keep-alive',
  });
  for (const event of events) res.write(event);
  res.end();
}

/**
 * Build all seven server-side AI routes around one fail-closed gate. The Live token route is an
 * unconditional disabled response and never evaluates consent/config/quota or calls a provider.
 */
export function createAiRoutes(deps: AiRouteDependencies): Readonly<Record<AiRouteKey, HttpRouteHandler>> {
  const routes = {} as Record<AiRouteKey, HttpRouteHandler>;
  for (const route of Object.keys(AI_ROUTE_REQUIREMENTS) as AiRouteKey[]) {
    if (route === 'POST /api/live/token') {
      routes[route] = (_req, res) => safeRespond(res, deps.respond, 503, LIVE_DISABLED);
      continue;
    }
    const operation = deps.operations[route];
    routes[route] = async (req, res) => {
      let subject: AiSubject | null;
      try { subject = deps.subject(req); } catch {
        return safeRespond(res, deps.respond, 503, { code: 'auth_unavailable', message: 'Hisobni tekshirish vaqtincha mavjud emas.' });
      }
      if (!subject) return safeRespond(res, deps.respond, 401, { code: 'auth', message: 'AI ustoz uchun hisobga kiring.' });

      const requirement = AI_ROUTE_REQUIREMENTS[route];
      try {
        if (!deps.hasConsent(subject, requirement, deps.policyVersion))
          return safeRespond(res, deps.respond, 403, { ...AI_CONSENT_REQUIRED, scope: requirement.scope, provider: requirement.provider });
      } catch {
        return safeRespond(res, deps.respond, 503, { code: 'ai_consent_unavailable', message: 'AI roziligini tekshirish vaqtincha mavjud emas.' });
      }

      try {
        if (deps.requestOriginAllowed && !deps.requestOriginAllowed(req))
          return safeRespond(res, deps.respond, 403, { code: 'origin', message: 'Ruxsat etilmagan manba.' });
      } catch {
        return safeRespond(res, deps.respond, 403, { code: 'origin', message: 'Ruxsat etilmagan manba.' });
      }

      try {
        if (!deps.configReady(route)) return safeRespond(res, deps.respond, 503, AI_CONFIG_UNAVAILABLE);
        if (deps.killSwitchActive()) return safeRespond(res, deps.respond, 503, { code: 'ai_kill_switch', message: 'AI so‘rovlari vaqtincha o‘chirilgan.' });
      } catch {
        return safeRespond(res, deps.respond, 503, AI_CONFIG_UNAVAILABLE);
      }

      let body: unknown;
      try {
        body = await deps.readBody(req, operation.maxBodyBytes);
      } catch (error) {
        const failure = safeRequestBodyError(error);
        return safeRespond(res, deps.respond, failure.status, failure.body);
      }

      let sanitizedBody: unknown;
      try {
        sanitizedBody = deps.sanitizeBody ? deps.sanitizeBody(route, subject, body) : body;
      } catch {
        return safeRespond(res, deps.respond, 503, { code: 'ai_consent_unavailable', message: 'AI ma’lumotlari xavfsiz tekshirilmadi.' });
      }
      let prepared: AiRoutePrepared | string;
      try { prepared = operation.prepare(sanitizedBody); }
      catch { return safeRespond(res, deps.respond, 400, { code: 'bad_request', message: 'So‘rov noto‘g‘ri.' }); }
      if (typeof prepared === 'string')
        return safeRespond(res, deps.respond, 400, { code: 'bad_request', message: 'So‘rov noto‘g‘ri.' });

      const requestId = deps.requestId();
      let reservationResult: AiQuotaReservationResult;
      try {
        reservationResult = deps.quota.reserveAiUsage(subject, prepared.usage, requestId);
      } catch {
        return safeRespond(res, deps.respond, 503, AI_QUOTA_UNAVAILABLE);
      }
      if (!reservationResult.ok) {
        const failure = quotaDenial(reservationResult.reason);
        return safeRespond(res, deps.respond, failure.status, failure.body);
      }
      // A replay may represent an in-flight or previously attempted billable request. Never invoke it twice.
      if (reservationResult.replayed)
        return safeRespond(res, deps.respond, 503, { code: 'ai_quota_in_flight', message: 'AI so‘rovi holati tekshirilmoqda; qayta yuborilmadi.' });

      const reservation = reservationResult.reservation;
      let providerAttempts = 0;
      let result: AiRouteResult | undefined;
      let operationFailed = false;
      let cancellationReason: 'deadline' | 'disconnect' | null = null;
      let lifecyclePending = false;
      const abortController = new AbortController();
      let cancel!: (reason: 'deadline' | 'disconnect') => void;
      const cancelled = new Promise<'deadline' | 'disconnect'>((resolve) => {
        cancel = (reason) => {
          if (cancellationReason !== null) return;
          cancellationReason = reason;
          abortController.abort();
          resolve(reason);
        };
      });
      const onClose = () => cancel('disconnect');
      res.on('close', onClose);
      const deadline = setTimeout(() => cancel('deadline'), boundedMs(deps.deadlineMs, 20_000, AI_ROUTE_DEADLINE_MAX_MS));
      const operationPromise: Promise<{ readonly ok: true; readonly result: AiRouteResult } | { readonly ok: false }> =
        Promise.resolve().then(async () => {
          const providerInput = operation.minimize(prepared.input);
          // Keep the payload sent upstream isolated from any later mutation of the operation's working copy.
          const providerPayload = structuredClone(providerInput);
          return operation.run(prepared.input, {
            providerInput,
            signal: abortController.signal,
            providerCall: async () => {
              if (abortController.signal.aborted) throw new Error('request aborted before provider attempt');
              if (providerAttempts !== 0) throw new Error('multiple provider attempts denied');
              providerAttempts = 1;
              try {
                return await deps.providerCall(route, requirement.provider, providerPayload, abortController.signal);
              } catch {
                throw new Error('AI upstream operation failed');
              }
            },
          });
        }).then(
          (value) => ({ ok: true as const, result: value }),
          () => ({ ok: false as const }),
        );
      type OperationOutcome = Awaited<typeof operationPromise> | { readonly cancelled: 'deadline' | 'disconnect' };
      try {
        const outcome: OperationOutcome = await Promise.race([
          operationPromise,
          cancelled.then((reason) => ({ cancelled: reason } as const)),
        ]);
        if ('cancelled' in outcome) {
          if (providerAttempts === 0) {
            operationFailed = true;
          } else {
            const graceMs = boundedMs(deps.cancellationGraceMs, 1_000, AI_CANCEL_GRACE_MAX_MS);
            let graceTimer: ReturnType<typeof setTimeout> | undefined;
            const graceExpired = new Promise<null>((resolve) => { graceTimer = setTimeout(() => resolve(null), graceMs); });
            const afterAbort = await Promise.race([operationPromise, graceExpired]);
            if (graceTimer) clearTimeout(graceTimer);
            if (afterAbort === null) {
              // An upstream attempt is ambiguous. Keep its reservation held; never auto-release it.
              lifecyclePending = true;
              operationFailed = true;
            } else {
              if (afterAbort.ok) result = afterAbort.result;
              else operationFailed = true;
            }
          }
        } else if (outcome.ok) {
          result = outcome.result;
        } else {
          operationFailed = true;
        }
      } finally {
        clearTimeout(deadline);
        res.removeListener('close', onClose);
      }

      let lifecycle: AiQuotaSettlementResult | null = null;
      if (!lifecyclePending) {
        try {
          lifecycle = providerAttempts > 0
            ? deps.quota.settleAiUsage(reservation, result?.actualUsage ?? prepared.usage)
            : deps.quota.abortAiUsage(reservation);
        } catch {
          lifecycle = { ok: false, reason: 'store_error' };
        }
      }
      if (lifecycle && !lifecycle.ok) return safeRespond(res, deps.respond, 503, AI_QUOTA_UNAVAILABLE);
      if (lifecyclePending) {
        if (cancellationReason === 'disconnect') return;
        return safeRespond(res, deps.respond, 504, AI_TIMEOUT_ERROR);
      }
      if (cancellationReason === 'disconnect') return;
      if (cancellationReason === 'deadline') return safeRespond(res, deps.respond, 504, AI_TIMEOUT_ERROR);
      if (operationFailed) {
        const body = providerAttempts > 0 ? AI_UPSTREAM_ERROR : AI_EXECUTION_ERROR;
        return safeRespond(res, deps.respond, 503, body);
      }
      if (result?.sseEvents) return safeRespondSse(res, result.status ?? 200, result.sseEvents);
      if (result?.binary) return safeRespondBinary(res, result.status ?? 200, result.binary);
      return safeRespond(res, deps.respond, result?.status ?? 200, result?.body ?? null);
    };
  }
  return Object.freeze(routes);
}

export interface AiConsentHttpDependencies {
  readonly policyVersion: string;
  readonly subject: (req: IncomingMessage) => AiSubject | null;
  readonly getConsent: (subject: AiSubject) => AiConsent | null;
  readonly grantConsent: (subject: AiSubject, grants: readonly AiGrant[], policyVersion: string) => AiConsent;
  /** Scope → provider pairs the server currently enforces (shown in the consent UI). */
  readonly requirements?: () => readonly AiGrant[];
  readonly revokeConsent: (subject: AiSubject) => AiConsent | null;
  readonly deleteMemory: (subject: AiSubject) => boolean;
  readonly readBody: (req: IncomingMessage, maxBytes: number) => Promise<unknown>;
  readonly respond: (res: ServerResponse, status: number, body: unknown) => void;
  readonly allowedOrigins?: readonly string[];
  readonly trustedOrigin?: (req: IncomingMessage) => string | null;
}

function validGrantList(value: unknown): value is AiGrant[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > Object.keys(AI_ROUTE_REQUIREMENTS).length) return false;
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== 'object') return false;
    const grant = item as Partial<AiGrant>;
    if (typeof grant.scope !== 'string' || typeof grant.provider !== 'string' || seen.has(grant.scope)) return false;
    const requirement = Object.values(AI_ROUTE_REQUIREMENTS).find((entry) => entry.scope === grant.scope);
    if (!requirement || requirement.provider !== grant.provider) return false;
    seen.add(grant.scope);
  }
  return true;
}

function normalizedOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') || parsed.username || parsed.password
      || parsed.origin === 'null' || parsed.pathname !== '/' || parsed.search || parsed.hash) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Derive the public origin only from an explicit PUBLIC_ORIGIN or trusted proxy headers.
 * Do not infer an external scheme from Origin or an untrusted Host header.
 */
export function deriveTrustedExternalOrigin(
  req: IncomingMessage,
  options: { readonly publicOrigin?: string; readonly trustProxy?: boolean } = {},
): string | null {
  if (options.publicOrigin) return normalizedOrigin(options.publicOrigin);
  if (!options.trustProxy) return null;
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(',')[0]?.trim();
  const hostHeader = forwardedHost ?? req.headers.host;
  const host = (Array.isArray(hostHeader) ? hostHeader[0] : hostHeader)?.split(',')[0]?.trim();
  if ((proto !== 'https' && proto !== 'http') || !host || /[\s/@?#]/.test(host)) return null;
  return normalizedOrigin(`${proto}://${host}`);
}

/** Strict Origin/Fetch-Metadata gate shared by AI POSTs and consent mutations. */
export function strictRequestOriginAllowed(
  req: IncomingMessage,
  allowedOrigins: readonly string[] = [],
  trustedExternalOrigin: string | null = null,
): boolean {
  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite === 'cross-site' || (fetchSite !== undefined && fetchSite !== 'same-origin' && fetchSite !== 'same-site')) return false;
  const origin = normalizedOrigin(req.headers.origin);
  if (!origin) return false;
  const trusted = normalizedOrigin(trustedExternalOrigin);
  if (fetchSite === 'same-origin') return trusted !== null && origin === trusted;
  return origin === trusted || allowedOrigins.some((candidate) => normalizedOrigin(candidate) === origin);
}

/** Cross-site writes are rejected even when callers otherwise have a signed session cookie. */
export function consentMutationOriginAllowed(
  req: IncomingMessage,
  allowedOrigins: readonly string[] = [],
  trustedExternalOrigin: string | null = null,
): boolean {
  return strictRequestOriginAllowed(req, allowedOrigins, trustedExternalOrigin);
}

function consentBodyError(error: unknown): { status: number; body: unknown } {
  const code = (error as { code?: unknown } | null)?.code;
  return code === 'too_large'
    ? { status: 413, body: { code: 'bad_request', message: 'So‘rov hajmi juda katta.' } }
    : { status: 400, body: { code: 'bad_request', message: 'So‘rov noto‘g‘ri.' } };
}

/** Testable HTTP boundary for consent reads, writes, revocation, and saved-memory deletion. */
export function createAiConsentRoutes(deps: AiConsentHttpDependencies): Readonly<Record<string, HttpRouteHandler>> {
  const json = (res: ServerResponse, status: number, body: unknown) => safeRespond(res, deps.respond, status, body);
  const signedSubject = (req: IncomingMessage, res: ServerResponse, action: string): AiSubject | null => {
    try {
      const subject = deps.subject(req);
      if (!subject) json(res, 401, { code: 'auth', message: `${action} uchun hisobga kiring.` });
      return subject;
    } catch {
      json(res, 503, { code: 'ai_consent_unavailable', message: 'AI roziligini tekshirish vaqtincha mavjud emas.' });
      return null;
    }
  };
  const mutationAllowed = (req: IncomingMessage, res: ServerResponse): boolean => {
    let trustedOrigin: string | null = null;
    try { trustedOrigin = deps.trustedOrigin?.(req) ?? null; } catch { /* Fail closed below. */ }
    if (consentMutationOriginAllowed(req, deps.allowedOrigins, trustedOrigin)) return true;
    json(res, 403, { code: 'origin', message: 'Ruxsat etilmagan manba.' });
    return false;
  };

  return Object.freeze({
    'GET /api/ai/consent': (req, res) => {
      const subject = signedSubject(req, res, 'Rozilik sozlamalari');
      if (!subject) return;
      try { return json(res, 200, { policyVersion: deps.policyVersion, requirements: deps.requirements?.() ?? [], consent: deps.getConsent(subject) }); }
      catch { return json(res, 503, { code: 'ai_consent_unavailable', message: 'AI roziligi vaqtincha mavjud emas.' }); }
    },
    'PUT /api/ai/consent': async (req, res) => {
      if (!mutationAllowed(req, res)) return;
      const subject = signedSubject(req, res, 'Rozilik berish');
      if (!subject) return;
      let body: unknown;
      try { body = await deps.readBody(req, 8 * 1024); } catch (error) {
        const failure = consentBodyError(error);
        return json(res, failure.status, failure.body);
      }
      const input = (body ?? {}) as { policyVersion?: unknown; grants?: unknown };
      if (input.policyVersion !== deps.policyVersion)
        return json(res, 409, { code: 'policy_version', policyVersion: deps.policyVersion });
      if (!validGrantList(input.grants)) return json(res, 400, { code: 'bad_request', message: 'Rozilik doiralari noto‘g‘ri.' });
      try {
        const consent = deps.grantConsent(subject, input.grants, deps.policyVersion);
        return json(res, 200, { policyVersion: deps.policyVersion, consent });
      } catch {
        return json(res, 503, { code: 'ai_consent_unavailable', message: 'Rozilikni saqlash vaqtincha mavjud emas.' });
      }
    },
    'DELETE /api/ai/consent': (req, res) => {
      if (!mutationAllowed(req, res)) return;
      const subject = signedSubject(req, res, 'Rozilikni bekor qilish');
      if (!subject) return;
      try { return json(res, 200, { consent: deps.revokeConsent(subject) }); }
      catch { return json(res, 503, { code: 'ai_consent_unavailable', message: 'Rozilikni bekor qilish vaqtincha mavjud emas.' }); }
    },
    'DELETE /api/ai/memory': (req, res) => {
      if (!mutationAllowed(req, res)) return;
      const subject = signedSubject(req, res, 'Vivi xotirasini o‘chirish');
      if (!subject) return;
      try { return json(res, 200, { deleted: deps.deleteMemory(subject) }); }
      catch { return json(res, 503, { code: 'ai_memory_unavailable', message: 'Vivi xotirasini o‘chirish vaqtincha mavjud emas.' }); }
    },
  });
}

export interface AiRouteGates {
  readonly providerEnabled: boolean;
  /** Must be true only after every provider handler reserves quota before calling upstream. */
  readonly quotaReservationReady: boolean;
}

export interface AiRouteReadiness {
  readonly providerReady: boolean;
  readonly quotaMiddlewareReady: boolean;
  readonly sharedDurableStoreReady: boolean;
  readonly operationsReady: boolean;
  readonly killSwitchActive: boolean;
}

/** Effective readiness is true only when every required route runtime component is proven ready. */
export function effectiveAiRouteReady(readiness: AiRouteReadiness): boolean {
  return readiness.providerReady
    && readiness.quotaMiddlewareReady
    && readiness.sharedDurableStoreReady
    && readiness.operationsReady
    && !readiness.killSwitchActive;
}

/** Keep AI endpoints out of the route table unless all route-level readiness gates are complete. */
export function enabledAiRoutes<T>(handlers: Readonly<Record<string, T>>, gates: AiRouteGates): Readonly<Record<string, T>> {
  const routes = Object.fromEntries(Object.entries(handlers).filter(([key]) => {
    if (!Object.prototype.hasOwnProperty.call(AI_ROUTE_REQUIREMENTS, key)) return true;
    // Live stays outside the production route table even though createAiRoutes exposes a disabled test handler.
    if (key === 'POST /api/live/token') return false;
    if (!gates.providerEnabled || !gates.quotaReservationReady) return false;
    return true;
  })) as Record<string, T>;
  return Object.freeze(routes);
}

export const AI_ROUTE_POLICY_VERSION = AI_CONSENT_POLICY_VERSION;
export type { AiScope };
