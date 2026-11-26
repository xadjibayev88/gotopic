import { beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import type { DatabaseSync } from 'node:sqlite';
import { db, resetDbForTests } from './db.ts';
import type { AiSubject } from './ai-consent.ts';
import { applyFreshKillSwitchFromEnv, createAiQuotaStore, isAiQuotaStorageReady, isAiQuotaStorageSharedDurableAttested, type AiQuotaLimits, type AiUsage } from './ai-quota.ts';

const { DatabaseSync: SQLiteDatabase } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

const fixedNow = Date.parse('2026-11-24T12:00:00.000Z');
const oneRequest: AiUsage = { requests: 1, tokens: 1, sttAudioSeconds: 0, ttsCharacters: 0, ttsAudioSeconds: 0 };
const defaultLimits: AiQuotaLimits = {
  subject: { requests: 10, tokens: 100, sttAudioSeconds: 60, ttsCharacters: 1000, ttsAudioSeconds: 600 },
  global: { requests: 10, tokens: 1000, sttAudioSeconds: 600, ttsCharacters: 10000, ttsAudioSeconds: 6000 },
};
const first: AiSubject = { kind: 'account', userId: 'quota-user-one' };
const second: AiSubject = { kind: 'account', userId: 'quota-user-two' };

function addUser(subject: AiSubject) {
  db().prepare('INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)')
    .run(subject.userId, `${subject.userId}@example.test`, subject.userId, fixedNow);
}

function store(options: {
  limits?: AiQuotaLimits;
  database?: () => DatabaseSync;
  sharedStorageVerified?: () => boolean;
  envKillSwitchActive?: () => boolean;
  now?: () => number;
} = {}) {
  return createAiQuotaStore({
    database: options.database ?? db,
    limits: options.limits ?? defaultLimits,
    sharedStorageVerified: options.sharedStorageVerified ?? (() => true),
    envKillSwitchActive: options.envKillSwitchActive ?? (() => false),
    now: options.now ?? (() => fixedNow),
  });
}

beforeEach(() => {
  resetDbForTests();
  process.env.SALUT_DB = ':memory:';
  process.env.VIVI_AI_QUOTA_STORE_SHARED_DURABLE_VERIFIED = 'false';
  addUser(first);
  addUser(second);
  expect(store().setKillSwitchActive(false)).toBe(true);
});

describe('atomic shared AI quota', () => {
  it('enforces subject/day limits independently of global/day limits', () => {
    const limits: AiQuotaLimits = {
      subject: { requests: 1, tokens: 10, sttAudioSeconds: 10, ttsCharacters: 10, ttsAudioSeconds: 10 },
      global: { requests: 5, tokens: 50, sttAudioSeconds: 50, ttsCharacters: 50, ttsAudioSeconds: 50 },
    };
    const quota = store({ limits });
    expect(quota.reserveAiUsage(first, oneRequest, 'request-user-1').ok).toBe(true);
    expect(quota.reserveAiUsage(first, oneRequest, 'request-user-2')).toMatchObject({ ok: false, reason: 'subject_limit' });
    expect(quota.reserveAiUsage(second, oneRequest, 'request-user-3').ok).toBe(true);
  });

  it('enforces a global/day limit across distinct signed accounts', () => {
    const limits: AiQuotaLimits = {
      subject: { requests: 5, tokens: 50, sttAudioSeconds: 50, ttsCharacters: 50, ttsAudioSeconds: 50 },
      global: { requests: 1, tokens: 50, sttAudioSeconds: 50, ttsCharacters: 50, ttsAudioSeconds: 50 },
    };
    const quota = store({ limits });
    expect(quota.reserveAiUsage(first, oneRequest, 'request-global-1').ok).toBe(true);
    expect(quota.reserveAiUsage(second, oneRequest, 'request-global-2')).toMatchObject({ ok: false, reason: 'global_limit' });
  });

  it('applies TTS audio-second limits independently from TTS character limits', () => {
    const limits: AiQuotaLimits = {
      subject: { requests: 5, tokens: 50, sttAudioSeconds: 50, ttsCharacters: 100, ttsAudioSeconds: 1 },
      global: { requests: 5, tokens: 50, sttAudioSeconds: 50, ttsCharacters: 1000, ttsAudioSeconds: 10 },
    };
    const quota = store({ limits });
    expect(quota.reserveAiUsage(first, { ...oneRequest, ttsCharacters: 50, ttsAudioSeconds: 2 }, 'tts-duration-limit'))
      .toMatchObject({ ok: false, reason: 'subject_limit' });
    expect(quota.reserveAiUsage(first, { ...oneRequest, ttsCharacters: 50, ttsAudioSeconds: 1 }, 'tts-duration-ok').ok).toBe(true);
  });

  it('makes request IDs idempotent and rejects reuse with different subject or usage', () => {
    const quota = store();
    const firstAttempt = quota.reserveAiUsage(first, oneRequest, 'idempotent-request');
    const retry = quota.reserveAiUsage(first, oneRequest, 'idempotent-request');
    expect(firstAttempt).toMatchObject({ ok: true, replayed: false });
    expect(retry).toMatchObject({ ok: true, replayed: true });
    expect(quota.reserveAiUsage(second, oneRequest, 'idempotent-request')).toMatchObject({ ok: false, reason: 'idempotency_conflict' });
    expect(quota.reserveAiUsage(first, { ...oneRequest, tokens: 2 }, 'idempotent-request')).toMatchObject({ ok: false, reason: 'idempotency_conflict' });

    const rows = db().prepare("SELECT requests FROM ai_quota_usage WHERE scope_key = ?").get(`subject:${first.userId}`) as { requests: number };
    expect(rows.requests).toBe(1);
  });

  it('settles actual usage once and releases unused reserved quota', () => {
    const limits: AiQuotaLimits = {
      subject: { requests: 3, tokens: 10, sttAudioSeconds: 10, ttsCharacters: 10, ttsAudioSeconds: 10 },
      global: { requests: 3, tokens: 10, sttAudioSeconds: 10, ttsCharacters: 10, ttsAudioSeconds: 10 },
    };
    const quota = store({ limits });
    const reservation = quota.reserveAiUsage(first, { ...oneRequest, tokens: 8 }, 'settle-request');
    expect(reservation.ok).toBe(true);
    if (!reservation.ok) return;
    const actual: AiUsage = { ...oneRequest, tokens: 2 };
    expect(quota.settleAiUsage(reservation.reservation, actual)).toMatchObject({ ok: true, overrun: false });
    expect(quota.settleAiUsage(reservation.reservation, actual)).toMatchObject({ ok: true, replayed: true });
    expect(quota.settleAiUsage(reservation.reservation, { ...actual, tokens: 3 })).toMatchObject({ ok: false, reason: 'settlement_conflict' });
    expect(quota.reserveAiUsage(first, { ...oneRequest, tokens: 8 }, 'settle-followup').ok).toBe(true);
  });

  it('aborts only its own uncalled reservation and makes abort idempotent', () => {
    const limits: AiQuotaLimits = {
      subject: { requests: 2, tokens: 8, sttAudioSeconds: 10, ttsCharacters: 10, ttsAudioSeconds: 10 },
      global: { requests: 2, tokens: 8, sttAudioSeconds: 10, ttsCharacters: 10, ttsAudioSeconds: 10 },
    };
    const quota = store({ limits });
    const firstReservation = quota.reserveAiUsage(first, { ...oneRequest, tokens: 5 }, 'abort-first');
    const secondReservation = quota.reserveAiUsage(first, { ...oneRequest, tokens: 3 }, 'abort-second');
    expect(firstReservation.ok).toBe(true);
    expect(secondReservation.ok).toBe(true);
    if (!firstReservation.ok || !secondReservation.ok) return;

    expect(quota.abortAiUsage(firstReservation.reservation)).toMatchObject({ ok: true, replayed: false, overrun: false });
    expect(quota.abortAiUsage(firstReservation.reservation)).toMatchObject({ ok: true, replayed: true, overrun: false });
    expect(quota.settleAiUsage(firstReservation.reservation, { ...oneRequest, tokens: 5 }))
      .toMatchObject({ ok: false, reason: 'settlement_conflict' });
    expect(db().prepare('SELECT requests, tokens FROM ai_quota_usage WHERE scope_key = ?').get(`subject:${first.userId}`))
      .toMatchObject({ requests: 1, tokens: 3 });
    expect(quota.reserveAiUsage(first, { ...oneRequest, tokens: 5 }, 'abort-followup').ok).toBe(true);
  });

  it('does not release settled usage when an abort arrives afterward', () => {
    const quota = store();
    const reserved = quota.reserveAiUsage(first, oneRequest, 'settle-before-abort');
    expect(reserved.ok).toBe(true);
    if (!reserved.ok) return;

    expect(quota.settleAiUsage(reserved.reservation, oneRequest)).toMatchObject({ ok: true, replayed: false });
    expect(quota.abortAiUsage(reserved.reservation)).toMatchObject({ ok: false, reason: 'settlement_conflict' });
    expect(db().prepare('SELECT requests, tokens FROM ai_quota_usage WHERE scope_key = ?').get(`subject:${first.userId}`))
      .toMatchObject({ requests: 1, tokens: 1 });
  });

  it('records actual overrun and trips the separate global kill switch', () => {
    const quota = store();
    const reserved = quota.reserveAiUsage(first, oneRequest, 'overrun-request');
    expect(reserved.ok).toBe(true);
    if (!reserved.ok) return;
    const result = quota.settleAiUsage(reserved.reservation, { ...oneRequest, tokens: 101 });
    expect(result).toMatchObject({ ok: true, overrun: true });
    expect(quota.isKillSwitchActive()).toBe(true);
    expect(quota.reserveAiUsage(second, oneRequest, 'after-overrun')).toMatchObject({ ok: false, reason: 'kill_switch' });
    expect(db().prepare('SELECT kill_switch_active FROM ai_quota_controls WHERE id = 1').get()).toMatchObject({ kill_switch_active: 1 });
  });

  it('rolls back an overrun settlement if the kill-switch row cannot be activated', () => {
    const quota = store();
    const reserved = quota.reserveAiUsage(first, oneRequest, 'missing-control-row');
    expect(reserved.ok).toBe(true);
    if (!reserved.ok) return;
    db().prepare('DELETE FROM ai_quota_controls WHERE id = 1').run();

    expect(quota.settleAiUsage(reserved.reservation, { ...oneRequest, tokens: 101 }))
      .toMatchObject({ ok: false, reason: 'store_error' });
    expect(db().prepare('SELECT requests, tokens FROM ai_quota_usage WHERE scope_key = ?').get(`subject:${first.userId}`))
      .toMatchObject({ requests: 1, tokens: 1 });
    expect(db().prepare('SELECT status, actual_tokens FROM ai_quota_reservations WHERE request_id = ?').get('missing-control-row'))
      .toMatchObject({ status: 'reserved', actual_tokens: null });
    expect(quota.isKillSwitchActive()).toBe(true);
  });

  it('fails closed when the deployment has not verified shared durable SQLite storage', () => {
    const quota = store({ sharedStorageVerified: () => false });
    expect(quota.reserveAiUsage(first, oneRequest, 'unverified-storage')).toMatchObject({ ok: false, reason: 'store_unverified' });
  });

  it('does not mistake an in-memory database or an unset attestation for shared durable storage', () => {
    expect(isAiQuotaStorageSharedDurableAttested({ VIVI_AI_QUOTA_STORE_SHARED_DURABLE_VERIFIED: 'true', SALUT_DB: ':memory:' })).toBe(false);
    process.env.VIVI_AI_QUOTA_STORE_SHARED_DURABLE_VERIFIED = 'false';
    expect(isAiQuotaStorageReady()).toBe(false);
  });

  it('fails closed when the configured environment kill switch is active', () => {
    const quota = store({ envKillSwitchActive: () => true });
    expect(quota.reserveAiUsage(first, oneRequest, 'env-killed')).toMatchObject({ ok: false, reason: 'kill_switch' });
  });

  it('fails closed on SQLite errors rather than admitting a reservation', () => {
    const broken = {
      exec: () => { throw new Error('simulated SQLite outage'); },
      prepare: () => { throw new Error('simulated SQLite outage'); },
    } as unknown as DatabaseSync;
    const quota = store({ database: () => broken });
    expect(quota.reserveAiUsage(first, oneRequest, 'database-error')).toMatchObject({ ok: false, reason: 'store_error' });
    expect(quota.settleAiUsage({ requestId: 'missing', subjectId: first.userId, day: '2026-11-24', reservedUsage: oneRequest }, oneRequest))
      .toMatchObject({ ok: false, reason: 'store_error' });
  });

  it('persists counters after closing and reopening the SQLite database', () => {
    const directory = mkdtempSync(join(tmpdir(), 'voila-ai-quota-restart-'));
    const file = join(directory, 'quota.db');
    try {
      resetDbForTests();
      process.env.SALUT_DB = file;
      addUser(first);
      const quota = store({ limits: { ...defaultLimits, subject: { ...defaultLimits.subject, requests: 1 } } });
      expect(quota.setKillSwitchActive(false)).toBe(true);
      expect(quota.reserveAiUsage(first, oneRequest, 'restart-first').ok).toBe(true);
      resetDbForTests();
      const reopened = store({ limits: { ...defaultLimits, subject: { ...defaultLimits.subject, requests: 1 } } });
      expect(reopened.reserveAiUsage(first, oneRequest, 'restart-second')).toMatchObject({ ok: false, reason: 'subject_limit' });
    } finally {
      resetDbForTests();
      process.env.SALUT_DB = ':memory:';
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('migrates older reservation tables with safe overrun and abort defaults', () => {
    const directory = mkdtempSync(join(tmpdir(), 'voila-ai-quota-migration-'));
    const file = join(directory, 'quota.db');
    try {
      resetDbForTests();
      process.env.SALUT_DB = file;
      const legacy = new SQLiteDatabase(file);
      legacy.exec(`PRAGMA foreign_keys = ON;
        CREATE TABLE users (id TEXT PRIMARY KEY);
        CREATE TABLE ai_quota_reservations (
          request_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          day TEXT NOT NULL,
          reserved_requests INTEGER NOT NULL,
          reserved_tokens INTEGER NOT NULL,
          reserved_stt_audio_seconds INTEGER NOT NULL,
          reserved_tts_characters INTEGER NOT NULL,
          reserved_tts_audio_seconds INTEGER NOT NULL,
          actual_requests INTEGER,
          actual_tokens INTEGER,
          actual_stt_audio_seconds INTEGER,
          actual_tts_characters INTEGER,
          actual_tts_audio_seconds INTEGER,
          status TEXT NOT NULL CHECK (status IN ('reserved', 'settled')),
          created_at INTEGER NOT NULL,
          settled_at INTEGER
        );`);
      legacy.prepare('INSERT INTO users (id) VALUES (?)').run(first.userId);
      legacy.prepare(`INSERT INTO ai_quota_reservations (
        request_id, user_id, day, reserved_requests, reserved_tokens, reserved_stt_audio_seconds,
        reserved_tts_characters, reserved_tts_audio_seconds, actual_requests, actual_tokens,
        actual_stt_audio_seconds, actual_tts_characters, actual_tts_audio_seconds, status, created_at, settled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run('legacy-settled', first.userId, '2026-11-24', 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 'settled', fixedNow, fixedNow);
      legacy.close();

      const migrated = db();
      const columns = new Set((migrated.prepare('PRAGMA table_info(ai_quota_reservations)').all() as { name: string }[]).map((column) => column.name));
      expect(columns.has('overrun')).toBe(true);
      expect(columns.has('aborted')).toBe(true);
      expect(migrated.prepare('SELECT overrun, aborted FROM ai_quota_reservations WHERE request_id = ?').get('legacy-settled'))
        .toMatchObject({ overrun: 0, aborted: 0 });
      const quota = store();
      expect(quota.setKillSwitchActive(false)).toBe(true);
      expect(quota.reserveAiUsage(first, oneRequest, 'legacy-schema-after-migration').ok).toBe(true);
    } finally {
      resetDbForTests();
      process.env.SALUT_DB = ':memory:';
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('allows only one of two SQLite connections to reserve the final global unit concurrently', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'voila-ai-quota-race-'));
    const file = join(directory, 'quota.db');
    try {
      resetDbForTests();
      process.env.SALUT_DB = file;
      addUser(first);
      addUser(second);
      const limits = { ...defaultLimits, global: { ...defaultLimits.global, requests: 1 } };
      const mainStore = store({ limits });
      expect(mainStore.setKillSwitchActive(false)).toBe(true);
      const barrier = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
      const startWorker = (subject: AiSubject, requestId: string) => new Promise<unknown>((resolve, reject) => {
        const worker = new Worker(new URL('./ai-quota-concurrency-worker.ts', import.meta.url), {
          workerData: { dbPath: file, subject, requestId, usage: oneRequest, limits, barrier, parties: 2, now: fixedNow },
          execArgv: ['--experimental-strip-types'],
        });
        worker.once('message', resolve);
        worker.once('error', reject);
        worker.once('exit', (code) => { if (code !== 0) reject(new Error(`quota worker exited ${code}`)); });
      });
      const [left, right] = await Promise.all([
        startWorker(first, 'concurrent-request-left'),
        startWorker(second, 'concurrent-request-right'),
      ]);
      expect([left, right].filter((result) => (result as { ok?: boolean }).ok)).toHaveLength(1);
      expect([left, right].filter((result) => !(result as { ok?: boolean }).ok)).toHaveLength(1);
      resetDbForTests();
      process.env.SALUT_DB = file;
      const count = db().prepare("SELECT requests FROM ai_quota_usage WHERE scope_key = 'global'").get() as { requests: number };
      expect(count.requests).toBe(1);
    } finally {
      resetDbForTests();
      process.env.SALUT_DB = ':memory:';
      rmSync(directory, { recursive: true, force: true });
    }
  }, 20_000);

  it('serializes independent abort and settlement attempts for the same reservation', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'voila-ai-quota-abort-race-'));
    const file = join(directory, 'quota.db');
    try {
      resetDbForTests();
      process.env.SALUT_DB = file;
      addUser(first);
      const limits = defaultLimits;
      const quota = store({ limits });
      expect(quota.setKillSwitchActive(false)).toBe(true);
      const reserved = quota.reserveAiUsage(first, oneRequest, 'abort-settle-race');
      expect(reserved.ok).toBe(true);
      if (!reserved.ok) return;

      const barrier = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
      const runWorker = (action: 'settle' | 'abort') => new Promise<unknown>((resolve, reject) => {
        const worker = new Worker(new URL('./ai-quota-concurrency-worker.ts', import.meta.url), {
          workerData: {
            action,
            dbPath: file,
            subject: first,
            requestId: reserved.reservation.requestId,
            usage: oneRequest,
            reservation: reserved.reservation,
            actualUsage: oneRequest,
            limits,
            barrier,
            parties: 2,
            now: fixedNow,
          },
          execArgv: ['--experimental-strip-types'],
        });
        worker.once('message', resolve);
        worker.once('error', reject);
        worker.once('exit', (code) => { if (code !== 0) reject(new Error(`quota worker exited ${code}`)); });
      });
      const [settled, aborted] = await Promise.all([runWorker('settle'), runWorker('abort')]);
      const settleSucceeded = (settled as { ok?: boolean }).ok === true;
      const abortSucceeded = (aborted as { ok?: boolean }).ok === true;
      expect(Number(settleSucceeded) + Number(abortSucceeded)).toBe(1);
      expect(settleSucceeded ? aborted : settled).toMatchObject({ ok: false, reason: 'settlement_conflict' });

      const subjectUsage = db().prepare('SELECT requests, tokens FROM ai_quota_usage WHERE scope_key = ?').get(`subject:${first.userId}`);
      const globalUsage = db().prepare("SELECT requests, tokens FROM ai_quota_usage WHERE scope_key = 'global'").get();
      const state = db().prepare('SELECT status, aborted FROM ai_quota_reservations WHERE request_id = ?').get('abort-settle-race');
      expect(state).toMatchObject({ status: 'settled', aborted: settleSucceeded ? 0 : 1 });
      expect(subjectUsage).toMatchObject(settleSucceeded ? { requests: 1, tokens: 1 } : { requests: 0, tokens: 0 });
      expect(globalUsage).toMatchObject(settleSucceeded ? { requests: 1, tokens: 1 } : { requests: 0, tokens: 0 });
    } finally {
      resetDbForTests();
      process.env.SALUT_DB = ':memory:';
      rmSync(directory, { recursive: true, force: true });
    }
  }, 20_000);
});

describe('fresh database kill switch', () => {
  const killSwitch = () => db().prepare('SELECT kill_switch_active AS on_, updated_at FROM ai_quota_controls WHERE id = 1').get() as { on_: number; updated_at: number };

  it('follows VIVI_AI_KILL_SWITCH=off only on an untouched new database', () => {
    resetDbForTests();
    expect(killSwitch()).toEqual({ on_: 1, updated_at: 0 });
    expect(applyFreshKillSwitchFromEnv({}, db(), fixedNow)).toBe(false);
    expect(applyFreshKillSwitchFromEnv({ VIVI_AI_KILL_SWITCH: 'on' }, db(), fixedNow)).toBe(false);
    expect(killSwitch().on_).toBe(1);
    expect(applyFreshKillSwitchFromEnv({ VIVI_AI_KILL_SWITCH: 'off' }, db(), fixedNow)).toBe(true);
    expect(killSwitch()).toEqual({ on_: 0, updated_at: fixedNow });
  });

  it('never clears a switch that an operator or a quota overrun turned on', () => {
    resetDbForTests();
    expect(store().setKillSwitchActive(true)).toBe(true);
    expect(applyFreshKillSwitchFromEnv({ VIVI_AI_KILL_SWITCH: 'off' }, db(), fixedNow + 1)).toBe(false);
    expect(killSwitch().on_).toBe(1);
  });
});
