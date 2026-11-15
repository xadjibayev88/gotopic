import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import type { RowDataPacket } from "mysql2/promise";
import { closeDb, db } from "./database.js";

const MIGRATIONS: Array<{ id: string; statements: string[] }> = [
  {
    id: "001_core_tables",
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id CHAR(64) NOT NULL,
        open_id VARCHAR(255) NOT NULL,
        name VARCHAR(200) NOT NULL,
        is_admin TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY users_open_id_uq (open_id)
      ) ENGINE=InnoDB`,
      `CREATE TABLE IF NOT EXISTS progress (
        user_id CHAR(64) NOT NULL,
        state JSON NOT NULL,
        version BIGINT UNSIGNED NOT NULL DEFAULT 0,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (user_id),
        CONSTRAINT progress_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB`,
      `CREATE TABLE IF NOT EXISTS catalog (
        id VARCHAR(191) NOT NULL,
        kind VARCHAR(64) NOT NULL,
        title VARCHAR(500) NOT NULL,
        content JSON NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY catalog_kind_idx (kind)
      ) ENGINE=InnoDB`,
      `CREATE TABLE IF NOT EXISTS quota_buckets (
        budget_key VARCHAR(191) NOT NULL,
        window_id VARCHAR(191) NOT NULL,
        used BIGINT UNSIGNED NOT NULL DEFAULT 0,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (budget_key, window_id)
      ) ENGINE=InnoDB`,
      `CREATE TABLE IF NOT EXISTS resource_guards (
        resource_key VARCHAR(191) NOT NULL,
        capacity INT UNSIGNED NOT NULL,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (resource_key)
      ) ENGINE=InnoDB`,
      `CREATE TABLE IF NOT EXISTS leases (
        token CHAR(36) NOT NULL,
        resource_key VARCHAR(191) NOT NULL,
        state ENUM('queued', 'active') NOT NULL,
        expires_at DATETIME(6) NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (resource_key, token),
        KEY leases_token_idx (token),
        KEY leases_expiry_idx (resource_key, state, expires_at),
        CONSTRAINT leases_resource_fk FOREIGN KEY (resource_key) REFERENCES resource_guards(resource_key) ON DELETE CASCADE
      ) ENGINE=InnoDB`,
    ],
  },
  {
    id: "090_weekly_league",
    statements: [
      `CREATE TABLE IF NOT EXISTS league_scores (
        week_id CHAR(10) NOT NULL,
        user_id CHAR(64) NOT NULL,
        tier TINYINT UNSIGNED NOT NULL DEFAULT 0,
        xp INT UNSIGNED NOT NULL DEFAULT 0,
        name VARCHAR(40) NOT NULL,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (week_id, user_id),
        KEY league_week_tier_xp (week_id, tier, xp)
      ) ENGINE=InnoDB`,
    ],
  },
  {
    id: "100_billing",
    statements: [
      `CREATE TABLE IF NOT EXISTS billing_orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id CHAR(64) NOT NULL,
        plan VARCHAR(16) NOT NULL,
        provider VARCHAR(16) NOT NULL,
        amount_uzs BIGINT UNSIGNED NOT NULL,
        amount_usdt_micro BIGINT UNSIGNED NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'pending',
        tx_id VARCHAR(160) NULL,
        tx_state SMALLINT NULL,
        tx_time BIGINT NULL,
        tx_create BIGINT NULL,
        tx_perform BIGINT NULL,
        tx_cancel BIGINT NULL,
        tx_reason SMALLINT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        paid_at DATETIME(6) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY billing_tx_uq (tx_id),
        KEY billing_user (user_id, created_at),
        KEY billing_pending (provider, status, created_at),
        CONSTRAINT billing_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB`,
      `CREATE TABLE IF NOT EXISTS subscriptions (
        user_id CHAR(64) NOT NULL,
        plan VARCHAR(16) NOT NULL,
        expires_at DATETIME(6) NOT NULL,
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (user_id),
        CONSTRAINT subscriptions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB`,
    ],
  },
];

export async function migrate(): Promise<void> {
  const pool = db();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS app_migrations (
        id VARCHAR(191) NOT NULL,
        applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
    await connection.commit();
    for (const migration of MIGRATIONS) {
      const [rows] = await pool.execute<(RowDataPacket & { id: string })[]>(
        "SELECT id FROM app_migrations WHERE id = ? LIMIT 1",
        [migration.id],
      );
      if (rows.length > 0) continue;
      const migrationConnection = await pool.getConnection();
      try {
        await migrationConnection.beginTransaction();
        for (const statement of migration.statements) await migrationConnection.execute(statement);
        await migrationConnection.execute("INSERT INTO app_migrations (id) VALUES (?)", [migration.id]);
        await migrationConnection.commit();
      } catch (error) {
        try { await migrationConnection.rollback(); } catch { /* preserve original error */ }
        throw error;
      } finally {
        migrationConnection.release();
      }
    }
  } catch (error) {
    try { await connection.rollback(); } catch { /* preserve original error */ }
    throw error;
  } finally {
    connection.release();
  }
}

const invokedDirectly = process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  try {
    await migrate();
  } finally {
    await closeDb();
  }
}
