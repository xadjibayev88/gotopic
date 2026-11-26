// Ma'lumotlar bazasi: Node'ning o'rnatilgan SQLite (node:sqlite) — tashqi bog'liqliksiz.
// Fayl: SALUT_DATA_DIR/salut.db (standart: ./data). Sinovlar uchun SALUT_DB=':memory:'.
import type { DatabaseSync as DatabaseSyncT } from 'node:sqlite';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

// createRequire: Vite/Vitest 'node:sqlite' ni statik importda tanimaydi (faqat prefiks bilan mavjud modul).
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');
type DatabaseSync = DatabaseSyncT;

let instance: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (instance) return instance;
  const file = process.env.SALUT_DB ?? join(resolve(process.env.SALUT_DATA_DIR ?? 'data'), 'salut.db');
  if (file !== ':memory:') mkdirSync(resolve(file, '..'), { recursive: true });
  const d = new DatabaseSync(file);
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      password_hash TEXT,
      google_sub TEXT UNIQUE,
      avatar TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS identities (
      provider TEXT NOT NULL,
      subject TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (provider, subject)
    );
    CREATE TABLE IF NOT EXISTS progress (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS receipts (
      order_id INTEGER PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tg_links (
      code TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tg_state (
      chat_id TEXT PRIMARY KEY,
      plan TEXT,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      provider TEXT NOT NULL,
      amount_uzs INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      tx_id TEXT UNIQUE,
      tx_state INTEGER,
      tx_time INTEGER,
      tx_create INTEGER,
      tx_perform INTEGER,
      tx_cancel INTEGER,
      tx_reason INTEGER,
      created_at INTEGER NOT NULL,
      paid_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS ai_consents (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scope TEXT NOT NULL,
      provider TEXT NOT NULL,
      policy_version TEXT NOT NULL,
      granted_at INTEGER NOT NULL,
      revoked_at INTEGER,
      PRIMARY KEY (user_id, scope)
    );
    CREATE TABLE IF NOT EXISTS ai_quota_usage (
      day TEXT NOT NULL,
      scope_key TEXT NOT NULL,
      scope_type TEXT NOT NULL CHECK (scope_type IN ('global', 'subject')),
      subject_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      requests INTEGER NOT NULL DEFAULT 0 CHECK (requests >= 0),
      tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0),
      stt_audio_seconds INTEGER NOT NULL DEFAULT 0 CHECK (stt_audio_seconds >= 0),
      tts_characters INTEGER NOT NULL DEFAULT 0 CHECK (tts_characters >= 0),
      tts_audio_seconds INTEGER NOT NULL DEFAULT 0 CHECK (tts_audio_seconds >= 0),
      PRIMARY KEY (day, scope_key),
      CHECK ((scope_type = 'global' AND scope_key = 'global' AND subject_id IS NULL)
        OR (scope_type = 'subject' AND subject_id IS NOT NULL AND scope_key = 'subject:' || subject_id))
    );
    CREATE TABLE IF NOT EXISTS ai_quota_reservations (
      request_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day TEXT NOT NULL,
      reserved_requests INTEGER NOT NULL CHECK (reserved_requests >= 0),
      reserved_tokens INTEGER NOT NULL CHECK (reserved_tokens >= 0),
      reserved_stt_audio_seconds INTEGER NOT NULL CHECK (reserved_stt_audio_seconds >= 0),
      reserved_tts_characters INTEGER NOT NULL CHECK (reserved_tts_characters >= 0),
      reserved_tts_audio_seconds INTEGER NOT NULL CHECK (reserved_tts_audio_seconds >= 0),
      actual_requests INTEGER,
      actual_tokens INTEGER,
      actual_stt_audio_seconds INTEGER,
      actual_tts_characters INTEGER,
      actual_tts_audio_seconds INTEGER,
      status TEXT NOT NULL CHECK (status IN ('reserved', 'settled')),
      aborted INTEGER NOT NULL DEFAULT 0 CHECK (aborted IN (0, 1)),
      overrun INTEGER NOT NULL DEFAULT 0 CHECK (overrun IN (0, 1)),
      created_at INTEGER NOT NULL,
      settled_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS ai_quota_reservations_user_day ON ai_quota_reservations(user_id, day);
    CREATE TABLE IF NOT EXISTS ai_quota_controls (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      kill_switch_active INTEGER NOT NULL DEFAULT 1 CHECK (kill_switch_active IN (0, 1)),
      updated_at INTEGER NOT NULL
    );
    INSERT OR IGNORE INTO ai_quota_controls (id, kill_switch_active, updated_at) VALUES (1, 1, 0);
  `);
  // Migratsiya: sessiyalarni bekor qilish uchun versiya (parol o'zgarsa / hisob egallansa — eski tokenlar o'ladi).
  const cols = d.prepare('PRAGMA table_info(users)').all() as { name: string }[];
  if (!cols.some((c) => c.name === 'token_version')) d.exec('ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0');
  const quotaReservationCols = new Set((d.prepare('PRAGMA table_info(ai_quota_reservations)').all() as { name: string }[]).map((c) => c.name));
  if (!quotaReservationCols.has('overrun')) {
    d.exec('ALTER TABLE ai_quota_reservations ADD COLUMN overrun INTEGER NOT NULL DEFAULT 0 CHECK (overrun IN (0, 1))');
    quotaReservationCols.add('overrun');
  }
  if (!quotaReservationCols.has('aborted')) {
    d.exec('ALTER TABLE ai_quota_reservations ADD COLUMN aborted INTEGER NOT NULL DEFAULT 0 CHECK (aborted IN (0, 1))');
    quotaReservationCols.add('aborted');
  }
  const requiredQuotaReservationCols = [
    'request_id', 'user_id', 'day', 'reserved_requests', 'reserved_tokens', 'reserved_stt_audio_seconds',
    'reserved_tts_characters', 'reserved_tts_audio_seconds', 'actual_requests', 'actual_tokens',
    'actual_stt_audio_seconds', 'actual_tts_characters', 'actual_tts_audio_seconds', 'status', 'aborted',
    'overrun', 'created_at', 'settled_at',
  ];
  const missingQuotaReservationCols = requiredQuotaReservationCols.filter((column) => !quotaReservationCols.has(column));
  if (missingQuotaReservationCols.length)
    throw new Error(`ai_quota_reservations schema missing required columns: ${missingQuotaReservationCols.join(', ')}`);
  instance = d;
  return d;
}

/** Bir nechta so'rovni atomar bajaradi (BEGIN IMMEDIATE — yozuvchilar navbatga turadi). */
export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec('BEGIN IMMEDIATE');
  try {
    const r = fn();
    d.exec('COMMIT');
    return r;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

/** Faqat sinovlar uchun. */
export function resetDbForTests() {
  instance?.close();
  instance = null;
}
