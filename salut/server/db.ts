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
  `);
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
