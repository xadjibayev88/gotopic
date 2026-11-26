import { db, tx } from './db.ts';

/**
 * Which Google service family receives AI data. `vertex` = billed Google Cloud (Vertex Gemini, Cloud STT,
 * Gemini TTS); `gemini-api` = Gemini Developer API / AI Studio key (has a no-cost tier). Each mode has its own
 * provider identity and policy version, so consent given for one never silently covers the other.
 */
export type AiProviderMode = 'vertex' | 'gemini-api';
export function aiProviderMode(env: NodeJS.ProcessEnv): AiProviderMode {
  return env.VIVI_AI_PROVIDER === 'google-gemini-api' ? 'gemini-api' : 'vertex';
}
export const AI_PROVIDER_MODE: AiProviderMode = aiProviderMode(process.env);
export function policyVersionFor(mode: AiProviderMode): string {
  return mode === 'gemini-api' ? '2026-11-25-gemini-api-v1' : '2026-11-24-v1';
}
export const AI_CONSENT_POLICY_VERSION: string = policyVersionFor(AI_PROVIDER_MODE);

export type AiScope =
  | 'text_tutor'
  | 'text_feedback'
  | 'live_session'
  | 'translation'
  | 'memory'
  | 'microphone_stt'
  | 'text_tts';

/** Only the named Google services from the approved plan; arbitrary provider URLs are rejected. */
export type AiProviderName = 'google-agent-platform' | 'google-cloud-speech-to-text' | 'google-gemini-api';

/** accounts.ts creates this only after validating a signed account session. */
export interface AiSubject {
  readonly kind: 'account';
  readonly userId: string;
}

export interface AiGrant {
  readonly scope: AiScope;
  readonly provider: AiProviderName;
}

export interface AiGrantRecord extends AiGrant {
  readonly policyVersion: string;
  readonly grantedAt: number;
  readonly revokedAt: number | null;
}

export interface AiConsent {
  readonly policyVersion: string;
  /** Includes each scope's current consent status and its own timestamps. */
  readonly grants: readonly AiGrantRecord[];
  readonly grantedAt: number;
  /** Null while any scope in the latest policy version remains active. */
  readonly revokedAt: number | null;
}

export interface AiRouteRequirement extends AiGrant {}

export function routeRequirementsFor(mode: AiProviderMode): Readonly<Record<string, AiRouteRequirement>> {
  const text: AiProviderName = mode === 'gemini-api' ? 'google-gemini-api' : 'google-agent-platform';
  const speech: AiProviderName = mode === 'gemini-api' ? 'google-gemini-api' : 'google-cloud-speech-to-text';
  return Object.freeze({
    'POST /api/tutor': Object.freeze({ scope: 'text_tutor', provider: text }),
    'POST /api/tutor/feedback': Object.freeze({ scope: 'text_feedback', provider: text }),
    'POST /api/live/token': Object.freeze({ scope: 'live_session', provider: text }),
    'POST /api/translate': Object.freeze({ scope: 'translation', provider: text }),
    'POST /api/tutor/memory': Object.freeze({ scope: 'memory', provider: text }),
    'POST /api/stt': Object.freeze({ scope: 'microphone_stt', provider: speech }),
    'POST /api/tts': Object.freeze({ scope: 'text_tts', provider: text }),
  }) as Readonly<Record<string, AiRouteRequirement>>;
}

export const AI_ROUTE_REQUIREMENTS: Readonly<Record<string, AiRouteRequirement>> = routeRequirementsFor(AI_PROVIDER_MODE);

const SCOPE_PROVIDER: Readonly<Record<AiScope, AiProviderName>> = Object.freeze(
  Object.fromEntries(Object.values(AI_ROUTE_REQUIREMENTS).map((r) => [r.scope, r.provider])) as Record<AiScope, AiProviderName>,
);
const SCOPES = new Set<AiScope>(Object.keys(SCOPE_PROVIDER) as AiScope[]);
const PROVIDERS = new Set<AiProviderName>(Object.values(SCOPE_PROVIDER));

/** Scope → provider list the consent UI shows, so labels always match what the server enforces. */
export function aiConsentRequirements(): readonly AiGrant[] {
  return Object.freeze((Object.keys(SCOPE_PROVIDER) as AiScope[]).map((scope) => Object.freeze({ scope, provider: SCOPE_PROVIDER[scope] })));
}

function isSubject(subject: AiSubject): boolean {
  return !!subject && subject.kind === 'account' && typeof subject.userId === 'string' && subject.userId.length > 0 && subject.userId.length <= 128;
}

function accountExists(subject: AiSubject): boolean {
  if (!isSubject(subject)) return false;
  return !!db().prepare('SELECT 1 FROM users WHERE id = ?').get(subject.userId);
}

function validGrant(grant: AiGrant): boolean {
  return !!grant
    && typeof grant.scope === 'string'
    && SCOPES.has(grant.scope)
    && typeof grant.provider === 'string'
    && PROVIDERS.has(grant.provider)
    && SCOPE_PROVIDER[grant.scope] === grant.provider;
}

function timestamp(now: number): number {
  return Number.isSafeInteger(now) && now >= 0 ? now : Date.now();
}

export function getAiConsent(subject: AiSubject): AiConsent | null {
  if (!accountExists(subject)) return null;
  const rows = db().prepare('SELECT scope, provider, policy_version, granted_at, revoked_at FROM ai_consents WHERE user_id = ?')
    .all(subject.userId) as { scope: string; provider: string; policy_version: string; granted_at: number; revoked_at: number | null }[];
  if (!rows.length) return null;
  const grants: AiGrantRecord[] = rows
    .filter((row) => validGrant({ scope: row.scope as AiScope, provider: row.provider as AiProviderName }))
    .map((row) => ({
      scope: row.scope as AiScope,
      provider: row.provider as AiProviderName,
      policyVersion: row.policy_version,
      grantedAt: row.granted_at,
      revokedAt: row.revoked_at,
    }));
  const latest = [...rows].sort((a, b) => Math.max(b.granted_at, b.revoked_at ?? 0) - Math.max(a.granted_at, a.revoked_at ?? 0))[0];
  const policyVersion = latest.policy_version;
  const active = grants.some((grant) => grant.policyVersion === policyVersion && grant.revokedAt === null);
  const revokedTimes = grants
    .filter((grant) => grant.policyVersion === policyVersion && grant.revokedAt !== null)
    .map((grant) => grant.revokedAt as number);
  return {
    policyVersion,
    grants,
    grantedAt: Math.max(...rows.map((row) => row.granted_at)),
    revokedAt: active || !revokedTimes.length ? null : Math.max(...revokedTimes),
  };
}

export function grantAiConsent(
  subject: AiSubject,
  grantsRaw: readonly AiGrant[],
  policyVersion: string,
  now = Date.now(),
): AiConsent {
  if (!accountExists(subject)) throw new Error('signed account required');
  if (policyVersion !== AI_CONSENT_POLICY_VERSION) throw new Error('policy version mismatch');
  if (!Array.isArray(grantsRaw) || grantsRaw.length < 1 || grantsRaw.length > SCOPES.size || !grantsRaw.every(validGrant))
    throw new Error('invalid consent scope or provider');
  const grants = grantsRaw.map((grant) => ({ scope: grant.scope, provider: grant.provider }));
  const scopes = grants.map((grant) => grant.scope);
  if (new Set(scopes).size !== scopes.length) throw new Error('duplicate consent grant');
  const grantedAt = timestamp(now);
  tx(() => {
    db().prepare(`UPDATE ai_consents SET policy_version = ?, revoked_at = COALESCE(revoked_at, ?)
      WHERE user_id = ?`).run(AI_CONSENT_POLICY_VERSION, grantedAt, subject.userId);
    const upsert = db().prepare(`INSERT INTO ai_consents (user_id, scope, provider, policy_version, granted_at, revoked_at)
      VALUES (?, ?, ?, ?, ?, NULL)
      ON CONFLICT(user_id, scope) DO UPDATE SET provider = excluded.provider,
        policy_version = excluded.policy_version, granted_at = excluded.granted_at, revoked_at = NULL`);
    for (const grant of grants) upsert.run(subject.userId, grant.scope, grant.provider, AI_CONSENT_POLICY_VERSION, grantedAt);
  });
  return getAiConsent(subject)!;
}

export function revokeAiConsent(subject: AiSubject, now = Date.now()): AiConsent | null {
  if (!accountExists(subject)) return null;
  const revokedAt = timestamp(now);
  tx(() => {
    db().prepare(`UPDATE ai_consents SET policy_version = ?, revoked_at = COALESCE(revoked_at, ?)
      WHERE user_id = ? AND revoked_at IS NULL`).run(AI_CONSENT_POLICY_VERSION, revokedAt, subject.userId);
  });
  return getAiConsent(subject);
}

/** Remove only the signed account's saved Vivi memory from its synced progress document. */
export function deleteAiMemory(subject: AiSubject, now = Date.now()): boolean {
  if (!accountExists(subject)) return false;
  const updatedAt = timestamp(now);
  return tx(() => {
    const row = db().prepare('SELECT state FROM progress WHERE user_id = ?').get(subject.userId) as { state: string } | undefined;
    if (!row) return false;
    const state = JSON.parse(row.state) as unknown;
    if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
    const next = { ...(state as Record<string, unknown>), memory: '' };
    db().prepare('UPDATE progress SET state = ?, updated_at = ? WHERE user_id = ?')
      .run(JSON.stringify(next), updatedAt, subject.userId);
    return true;
  });
}

export function hasAiConsent(
  subject: AiSubject,
  scope: AiScope,
  provider: AiProviderName,
  policyVersion = AI_CONSENT_POLICY_VERSION,
): boolean {
  if (!SCOPES.has(scope) || !PROVIDERS.has(provider) || SCOPE_PROVIDER[scope] !== provider) return false;
  const consent = getAiConsent(subject);
  return !!consent
    && consent.policyVersion === policyVersion
    && policyVersion === AI_CONSENT_POLICY_VERSION
    && consent.grants.some((grant) => grant.scope === scope && grant.provider === provider && grant.policyVersion === policyVersion && grant.revokedAt === null);
}

/** Remove client-supplied saved memory before any tutor prompt is parsed unless its own scope is active. */
export function sanitizeTutorBodyForMemoryConsent(subject: AiSubject | null, body: unknown): unknown {
  if (subject && hasAiConsent(subject, 'memory', SCOPE_PROVIDER.memory)) return body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return body;
  const request = body as Record<string, unknown>;
  const rawContext = request.context;
  if (typeof rawContext !== 'object' || rawContext === null || Array.isArray(rawContext)) return body;
  const context = { ...(rawContext as Record<string, unknown>) };
  delete context.memory;
  return { ...request, context };
}
