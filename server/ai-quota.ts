import type { DatabaseSync } from 'node:sqlite';
import { join, resolve } from 'node:path';
import { db } from './db.ts';
import { loadAiRuntimeConfig } from './ai-config.ts';
import type { AiSubject } from './ai-consent.ts';

export interface AiUsage {
  readonly requests: number;
  readonly tokens: number;
  readonly sttAudioSeconds: number;
  readonly ttsCharacters: number;
  readonly ttsAudioSeconds: number;
}

export interface AiUsageCaps extends AiUsage {}

export interface AiQuotaLimits {
  readonly subject: AiUsageCaps;
  readonly global: AiUsageCaps;
}

export interface AiQuotaReservation {
  readonly requestId: string;
  readonly subjectId: string;
  readonly day: string;
  readonly reservedUsage: AiUsage;
}

export type AiQuotaDenialReason =
  | 'invalid_input'
  | 'limits_unconfigured'
  | 'store_unverified'
  | 'kill_switch'
  | 'subject_limit'
  | 'global_limit'
  | 'idempotency_conflict'
  | 'already_settled'
  | 'reservation_not_found'
  | 'settlement_conflict'
  | 'store_error';

export type AiQuotaReservationResult =
  | { readonly ok: true; readonly replayed: boolean; readonly reservation: AiQuotaReservation }
  | { readonly ok: false; readonly reason: AiQuotaDenialReason };

export type AiQuotaSettlementResult =
  | { readonly ok: true; readonly replayed: boolean; readonly overrun: boolean }
  | { readonly ok: false; readonly reason: AiQuotaDenialReason };

export interface AiQuotaStoreOptions {
  readonly database?: () => DatabaseSync;
  readonly limits: AiQuotaLimits;
  /** Explicit deployment attestation; not inferred from SQLite/WAL or a file path. */
  readonly sharedStorageVerified: () => boolean;
  /** Separate outer kill switch, usually VIVI_AI_KILL_SWITCH. */
  readonly envKillSwitchActive: () => boolean;
  readonly now?: () => number;
}

const USAGE_FIELDS = ['requests', 'tokens', 'sttAudioSeconds', 'ttsCharacters', 'ttsAudioSeconds'] as const;
interface UsageRow {
  requests: number;
  tokens: number;
  stt_audio_seconds: number;
  tts_characters: number;
  tts_audio_seconds: number;
}
interface ReservationRow {
  request_id: string;
  user_id: string;
  day: string;
  reserved_requests: number;
  reserved_tokens: number;
  reserved_stt_audio_seconds: number;
  reserved_tts_characters: number;
  reserved_tts_audio_seconds: number;
  actual_requests: number | null;
  actual_tokens: number | null;
  actual_stt_audio_seconds: number | null;
  actual_tts_characters: number | null;
  actual_tts_audio_seconds: number | null;
  status: 'reserved' | 'settled';
  aborted: number;
  overrun: number;
}

const ZERO_USAGE: AiUsage = Object.freeze({ requests: 0, tokens: 0, sttAudioSeconds: 0, ttsCharacters: 0, ttsAudioSeconds: 0 });

function isUsage(value: unknown): value is AiUsage {
  if (!value || typeof value !== 'object') return false;
  const usage = value as Partial<AiUsage>;
  return usage.requests === 1
    && USAGE_FIELDS.slice(1).every((field) => Number.isSafeInteger(usage[field]) && (usage[field] as number) >= 0);
}

function isCaps(value: unknown): value is AiUsageCaps {
  if (!value || typeof value !== 'object') return false;
  const caps = value as Partial<AiUsageCaps>;
  return USAGE_FIELDS.every((field) => Number.isSafeInteger(caps[field]) && (caps[field] as number) > 0);
}

function validLimits(limits: AiQuotaLimits): boolean {
  return !!limits && isCaps(limits.subject) && isCaps(limits.global);
}

function usageArray(usage: AiUsage): readonly number[] {
  return [usage.requests, usage.tokens, usage.sttAudioSeconds, usage.ttsCharacters, usage.ttsAudioSeconds];
}

function usageFromRow(row: UsageRow | undefined): AiUsage {
  if (!row) return ZERO_USAGE;
  return {
    requests: Number(row.requests),
    tokens: Number(row.tokens),
    sttAudioSeconds: Number(row.stt_audio_seconds),
    ttsCharacters: Number(row.tts_characters),
    ttsAudioSeconds: Number(row.tts_audio_seconds),
  };
}

function usageFromReservation(row: ReservationRow): AiUsage {
  return {
    requests: Number(row.reserved_requests),
    tokens: Number(row.reserved_tokens),
    sttAudioSeconds: Number(row.reserved_stt_audio_seconds),
    ttsCharacters: Number(row.reserved_tts_characters),
    ttsAudioSeconds: Number(row.reserved_tts_audio_seconds),
  };
}

function actualFromReservation(row: ReservationRow): AiUsage | null {
  if (row.actual_requests === null || row.actual_tokens === null || row.actual_stt_audio_seconds === null
    || row.actual_tts_characters === null || row.actual_tts_audio_seconds === null) return null;
  return {
    requests: Number(row.actual_requests),
    tokens: Number(row.actual_tokens),
    sttAudioSeconds: Number(row.actual_stt_audio_seconds),
    ttsCharacters: Number(row.actual_tts_characters),
    ttsAudioSeconds: Number(row.actual_tts_audio_seconds),
  };
}

function usageMatches(left: AiUsage, right: AiUsage): boolean {
  const a = usageArray(left);
  const b = usageArray(right);
  return a.every((value, index) => value === b[index]);
}

function exceeds(current: AiUsage, requested: AiUsage, caps: AiUsageCaps): boolean {
  const have = usageArray(current);
  const add = usageArray(requested);
  const max = usageArray(caps);
  return have.some((value, index) => value + add[index] > max[index]);
}

function isSubject(subject: AiSubject): boolean {
  return !!subject && subject.kind === 'account'
    && typeof subject.userId === 'string' && subject.userId.length > 0 && subject.userId.length <= 128;
}

function validRequestId(requestId: string): boolean {
  return typeof requestId === 'string' && requestId.length > 0 && requestId.length <= 200 && requestId.trim() === requestId;
}

function isReservation(value: AiQuotaReservation): boolean {
  return !!value && validRequestId(value.requestId)
    && typeof value.subjectId === 'string' && value.subjectId.length > 0
    && /^\d{4}-\d{2}-\d{2}$/.test(value.day) && isUsage(value.reservedUsage);
}

function dailyKey(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp < 0) throw new Error('invalid clock');
  return new Date(timestamp).toISOString().slice(0, 10);
}

function asReservation(row: ReservationRow): AiQuotaReservation {
  return Object.freeze({
    requestId: row.request_id,
    subjectId: row.user_id,
    day: row.day,
    reservedUsage: Object.freeze(usageFromReservation(row)),
  });
}

function withImmediateTransaction<T>(database: DatabaseSync, fn: () => T): T {
  database.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    try { database.exec('ROLLBACK'); } catch { /* Preserve the original transaction error. */ }
    throw error;
  }
}

function loadUsage(database: DatabaseSync, day: string, scopeKey: string): AiUsage {
  const row = database.prepare(`SELECT requests, tokens, stt_audio_seconds, tts_characters, tts_audio_seconds
    FROM ai_quota_usage WHERE day = ? AND scope_key = ?`).get(day, scopeKey) as UsageRow | undefined;
  return usageFromRow(row);
}

function addUsage(database: DatabaseSync, day: string, scopeKey: string, scopeType: 'global' | 'subject', subjectId: string | null, usage: AiUsage) {
  database.prepare(`INSERT INTO ai_quota_usage
    (day, scope_key, scope_type, subject_id, requests, tokens, stt_audio_seconds, tts_characters, tts_audio_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(day, scope_key) DO UPDATE SET
      requests = ai_quota_usage.requests + excluded.requests,
      tokens = ai_quota_usage.tokens + excluded.tokens,
      stt_audio_seconds = ai_quota_usage.stt_audio_seconds + excluded.stt_audio_seconds,
      tts_characters = ai_quota_usage.tts_characters + excluded.tts_characters,
      tts_audio_seconds = ai_quota_usage.tts_audio_seconds + excluded.tts_audio_seconds`)
    .run(day, scopeKey, scopeType, subjectId, usage.requests, usage.tokens, usage.sttAudioSeconds, usage.ttsCharacters, usage.ttsAudioSeconds);
}

function applySettlementDelta(database: DatabaseSync, day: string, scopeKey: string, reserved: AiUsage, actual: AiUsage) {
  const current = loadUsage(database, day, scopeKey);
  const before = usageArray(current);
  const held = usageArray(reserved);
  const settled = usageArray(actual);
  const next = before.map((value, index) => value + settled[index] - held[index]);
  if (next.some((value) => !Number.isSafeInteger(value) || value < 0)) throw new Error('invalid quota settlement counter');
  const result = database.prepare(`UPDATE ai_quota_usage SET requests = ?, tokens = ?, stt_audio_seconds = ?, tts_characters = ?, tts_audio_seconds = ?
    WHERE day = ? AND scope_key = ?`).run(next[0], next[1], next[2], next[3], next[4], day, scopeKey);
  if (Number(result.changes) !== 1) throw new Error('quota usage row missing during settlement');
}

function overReserved(reserved: AiUsage, actual: AiUsage): boolean {
  const held = usageArray(reserved);
  const used = usageArray(actual);
  return held.some((value, index) => used[index] > value);
}

export function createAiQuotaStore(options: AiQuotaStoreOptions) {
  const database = options.database ?? db;
  const now = options.now ?? Date.now;

  function persistedKillSwitchIsActive(connection: DatabaseSync): boolean {
    const row = connection.prepare('SELECT kill_switch_active FROM ai_quota_controls WHERE id = 1').get() as { kill_switch_active: number } | undefined;
    return !row || Number(row.kill_switch_active) !== 0;
  }

  function isKillSwitchActive(): boolean {
    try {
      if (options.envKillSwitchActive()) return true;
      return persistedKillSwitchIsActive(database());
    } catch { return true; }
  }

  function setKillSwitchActive(active: boolean): boolean {
    try {
      const connection = database();
      return withImmediateTransaction(connection, () => {
        const result = connection.prepare('UPDATE ai_quota_controls SET kill_switch_active = ?, updated_at = ? WHERE id = 1')
          .run(active ? 1 : 0, now());
        return Number(result.changes) === 1;
      });
    } catch {
      return false;
    }
  }

  function reserveAiUsage(subject: AiSubject, usage: AiUsage, requestId: string): AiQuotaReservationResult {
    if (!isSubject(subject) || !isUsage(usage) || !validRequestId(requestId)) return { ok: false, reason: 'invalid_input' };
    if (!validLimits(options.limits)) return { ok: false, reason: 'limits_unconfigured' };

    try {
      if (!options.sharedStorageVerified()) return { ok: false, reason: 'store_unverified' };
      const today = dailyKey(now());
      const connection = database();
      return withImmediateTransaction(connection, () => {
        if (options.envKillSwitchActive() || persistedKillSwitchIsActive(connection)) return { ok: false, reason: 'kill_switch' } as const;

        const existing = connection.prepare(`SELECT request_id, user_id, day, reserved_requests, reserved_tokens,
          reserved_stt_audio_seconds, reserved_tts_characters, reserved_tts_audio_seconds, actual_requests, actual_tokens,
          actual_stt_audio_seconds, actual_tts_characters, actual_tts_audio_seconds, status, aborted, overrun
          FROM ai_quota_reservations WHERE request_id = ?`).get(requestId) as ReservationRow | undefined;
        if (existing) {
          const oldUsage = usageFromReservation(existing);
          if (existing.user_id !== subject.userId || existing.day !== today || !usageMatches(oldUsage, usage))
            return { ok: false, reason: 'idempotency_conflict' } as const;
          if (existing.status !== 'reserved') return { ok: false, reason: 'already_settled' } as const;
          return { ok: true, replayed: true, reservation: asReservation(existing) } as const;
        }

        const subjectKey = `subject:${subject.userId}`;
        if (exceeds(loadUsage(connection, today, subjectKey), usage, options.limits.subject))
          return { ok: false, reason: 'subject_limit' } as const;
        if (exceeds(loadUsage(connection, today, 'global'), usage, options.limits.global))
          return { ok: false, reason: 'global_limit' } as const;

        addUsage(connection, today, subjectKey, 'subject', subject.userId, usage);
        addUsage(connection, today, 'global', 'global', null, usage);
        connection.prepare(`INSERT INTO ai_quota_reservations
          (request_id, user_id, day, reserved_requests, reserved_tokens, reserved_stt_audio_seconds,
            reserved_tts_characters, reserved_tts_audio_seconds, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'reserved', ?)`)
          .run(requestId, subject.userId, today, usage.requests, usage.tokens, usage.sttAudioSeconds, usage.ttsCharacters, usage.ttsAudioSeconds, now());
        return {
          ok: true,
          replayed: false,
          reservation: Object.freeze({ requestId, subjectId: subject.userId, day: today, reservedUsage: Object.freeze({ ...usage }) }),
        } as const;
      });
    } catch {
      return { ok: false, reason: 'store_error' };
    }
  }

  function settleAiUsage(reservation: AiQuotaReservation, actualUsage: AiUsage): AiQuotaSettlementResult {
    if (!isReservation(reservation) || !isUsage(actualUsage))
      return { ok: false, reason: 'invalid_input' };
    if (!validLimits(options.limits)) return { ok: false, reason: 'limits_unconfigured' };

    try {
      if (!options.sharedStorageVerified()) return { ok: false, reason: 'store_unverified' };
      const connection = database();
      return withImmediateTransaction(connection, () => {
        const row = connection.prepare(`SELECT request_id, user_id, day, reserved_requests, reserved_tokens,
          reserved_stt_audio_seconds, reserved_tts_characters, reserved_tts_audio_seconds, actual_requests, actual_tokens,
          actual_stt_audio_seconds, actual_tts_characters, actual_tts_audio_seconds, status, aborted, overrun
          FROM ai_quota_reservations WHERE request_id = ?`).get(reservation.requestId) as ReservationRow | undefined;
        if (!row || row.user_id !== reservation.subjectId || row.day !== reservation.day) return { ok: false, reason: 'reservation_not_found' } as const;
        const held = usageFromReservation(row);
        if (!usageMatches(held, reservation.reservedUsage)) return { ok: false, reason: 'settlement_conflict' } as const;
        if (row.status === 'settled') {
          const savedActual = actualFromReservation(row);
          return row.aborted !== 1 && savedActual && usageMatches(savedActual, actualUsage)
            ? { ok: true, replayed: true, overrun: row.overrun === 1 } as const
            : { ok: false, reason: 'settlement_conflict' } as const;
        }
        if (row.status !== 'reserved') return { ok: false, reason: 'settlement_conflict' } as const;

        const overrun = overReserved(held, actualUsage);
        const subjectKey = `subject:${row.user_id}`;
        applySettlementDelta(connection, row.day, subjectKey, held, actualUsage);
        applySettlementDelta(connection, row.day, 'global', held, actualUsage);
        const settled = connection.prepare(`UPDATE ai_quota_reservations SET actual_requests = ?, actual_tokens = ?,
          actual_stt_audio_seconds = ?, actual_tts_characters = ?, actual_tts_audio_seconds = ?,
          status = 'settled', aborted = 0, overrun = ?, settled_at = ? WHERE request_id = ? AND status = 'reserved'`)
          .run(actualUsage.requests, actualUsage.tokens, actualUsage.sttAudioSeconds, actualUsage.ttsCharacters,
            actualUsage.ttsAudioSeconds, overrun ? 1 : 0, now(), reservation.requestId);
        if (Number(settled.changes) !== 1) throw new Error('quota reservation changed during settlement');
        if (overrun) {
          const switchUpdate = connection.prepare('UPDATE ai_quota_controls SET kill_switch_active = 1, updated_at = ? WHERE id = 1').run(now());
          if (Number(switchUpdate.changes) !== 1) throw new Error('quota kill-switch row missing during overrun settlement');
        }
        return { ok: true, replayed: false, overrun } as const;
      });
    } catch {
      return { ok: false, reason: 'store_error' };
    }
  }

  function abortAiUsage(reservation: AiQuotaReservation): AiQuotaSettlementResult {
    if (!isReservation(reservation)) return { ok: false, reason: 'invalid_input' };
    if (!validLimits(options.limits)) return { ok: false, reason: 'limits_unconfigured' };

    try {
      if (!options.sharedStorageVerified()) return { ok: false, reason: 'store_unverified' };
      const connection = database();
      return withImmediateTransaction(connection, () => {
        const row = connection.prepare(`SELECT request_id, user_id, day, reserved_requests, reserved_tokens,
          reserved_stt_audio_seconds, reserved_tts_characters, reserved_tts_audio_seconds, actual_requests, actual_tokens,
          actual_stt_audio_seconds, actual_tts_characters, actual_tts_audio_seconds, status, aborted, overrun
          FROM ai_quota_reservations WHERE request_id = ?`).get(reservation.requestId) as ReservationRow | undefined;
        if (!row || row.user_id !== reservation.subjectId || row.day !== reservation.day)
          return { ok: false, reason: 'reservation_not_found' } as const;
        const held = usageFromReservation(row);
        if (!usageMatches(held, reservation.reservedUsage)) return { ok: false, reason: 'settlement_conflict' } as const;
        if (row.status === 'settled') {
          const savedActual = actualFromReservation(row);
          return row.aborted === 1 && savedActual && usageMatches(savedActual, ZERO_USAGE)
            ? { ok: true, replayed: true, overrun: false } as const
            : { ok: false, reason: 'settlement_conflict' } as const;
        }
        if (row.status !== 'reserved') return { ok: false, reason: 'settlement_conflict' } as const;

        const subjectKey = `subject:${row.user_id}`;
        applySettlementDelta(connection, row.day, subjectKey, held, ZERO_USAGE);
        applySettlementDelta(connection, row.day, 'global', held, ZERO_USAGE);
        const aborted = connection.prepare(`UPDATE ai_quota_reservations SET actual_requests = 0, actual_tokens = 0,
          actual_stt_audio_seconds = 0, actual_tts_characters = 0, actual_tts_audio_seconds = 0,
          status = 'settled', aborted = 1, overrun = 0, settled_at = ?
          WHERE request_id = ? AND status = 'reserved'`).run(now(), reservation.requestId);
        if (Number(aborted.changes) !== 1) throw new Error('quota reservation changed during abort');
        return { ok: true, replayed: false, overrun: false } as const;
      });
    } catch {
      return { ok: false, reason: 'store_error' };
    }
  }

  return Object.freeze({ reserveAiUsage, settleAiUsage, abortAiUsage, isKillSwitchActive, setKillSwitchActive });
}

function quotaLimitsFromRuntime(): AiQuotaLimits {
  const quota = loadAiRuntimeConfig(process.env).quota;
  return {
    subject: {
      requests: quota.subjectRequestsPerDay ?? 0,
      tokens: quota.subjectTokensPerDay ?? 0,
      sttAudioSeconds: quota.subjectSttAudioSecondsPerDay ?? 0,
      ttsCharacters: quota.subjectTtsCharactersPerDay ?? 0,
      ttsAudioSeconds: quota.subjectTtsAudioSecondsPerDay ?? 0,
    },
    global: {
      requests: quota.requestsPerDay ?? 0,
      tokens: quota.tokensPerDay ?? 0,
      sttAudioSeconds: quota.sttAudioSecondsPerDay ?? 0,
      ttsCharacters: quota.ttsCharactersPerDay ?? 0,
      ttsAudioSeconds: quota.ttsAudioSecondsPerDay ?? 0,
    },
  };
}

function sharedDurableStorageAttested(env: NodeJS.ProcessEnv): boolean {
  const file = env.SALUT_DB ?? join(resolve(env.SALUT_DATA_DIR ?? 'data'), 'salut.db');
  return env.VIVI_AI_QUOTA_STORE_SHARED_DURABLE_VERIFIED === 'true' && file !== ':memory:' && file.trim().length > 0;
}

const defaultStore = createAiQuotaStore({
  database: db,
  limits: quotaLimitsFromRuntime(),
  sharedStorageVerified: () => sharedDurableStorageAttested(process.env),
  envKillSwitchActive: () => process.env.VIVI_AI_KILL_SWITCH !== 'off',
});

/** The store is not considered shared merely because SQLite uses WAL/BEGIN IMMEDIATE. */
export function isAiQuotaStorageSharedDurableAttested(env: NodeJS.ProcessEnv = process.env): boolean {
  return sharedDurableStorageAttested(env);
}

/** Runtime readiness fails closed if the operator attestation is absent or the DB schema is unavailable. */
export function isAiQuotaStorageReady(): boolean {
  if (!sharedDurableStorageAttested(process.env)) return false;
  try {
    const row = db().prepare('SELECT id FROM ai_quota_controls WHERE id = 1').get() as { id: number } | undefined;
    return row?.id === 1;
  } catch {
    return false;
  }
}

export function isAiQuotaKillSwitchActive(): boolean {
  return defaultStore.isKillSwitchActive();
}

export function setAiQuotaKillSwitchActive(active: boolean): boolean {
  return defaultStore.setKillSwitchActive(active);
}

/**
 * A freshly created database starts with the persisted switch ON (`updated_at = 0`, never touched).
 * On hosts without a persistent volume (e.g. a Railway redeploy) that would silently disable AI after every
 * deploy, so an untouched row follows the operator's explicit `VIVI_AI_KILL_SWITCH=off`. A switch that an
 * operator or a quota overrun has set (`updated_at > 0`) is never changed here.
 */
export function applyFreshKillSwitchFromEnv(env: NodeJS.ProcessEnv, connection: DatabaseSync = db(), now = Date.now()): boolean {
  if (env.VIVI_AI_KILL_SWITCH !== 'off') return false;
  try {
    const result = connection.prepare('UPDATE ai_quota_controls SET kill_switch_active = 0, updated_at = ? WHERE id = 1 AND updated_at = 0 AND kill_switch_active = 1')
      .run(Math.max(1, now));
    return Number(result.changes) === 1;
  } catch {
    return false;
  }
}

export function reserveAiUsage(subject: AiSubject, usage: AiUsage, requestId: string): AiQuotaReservationResult {
  return defaultStore.reserveAiUsage(subject, usage, requestId);
}

export function settleAiUsage(reservation: AiQuotaReservation, actualUsage: AiUsage): AiQuotaSettlementResult {
  return defaultStore.settleAiUsage(reservation, actualUsage);
}

/** Release a reservation only when no upstream provider attempt was made. */
export function abortAiUsage(reservation: AiQuotaReservation): AiQuotaSettlementResult {
  return defaultStore.abortAiUsage(reservation);
}
