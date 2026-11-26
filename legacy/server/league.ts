import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { db, type AppUser } from "./database.js";

/** Weekly leagues (Duolingo-style): users compete inside their tier; top 20% move up, bottom 20% move down next week. */
export const TIERS = ["Bronza", "Kumush", "Oltin", "Zumrad", "Yoqut", "Olmos"];
const OFFSET = 5 * 3600_000; // Asia/Tashkent, weeks start on Monday 00:00
const DAY = 86_400_000;
const MAX_WEEK_XP = 5000;
export const leagueInput = z.object({ xp: z.number().int().min(0).max(MAX_WEEK_XP), name: z.string().trim().max(24).optional() }).strict();

function weekStartMs(now: number): number {
  const d = new Date(now + OFFSET);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.getTime() - OFFSET;
}
export const weekId = (now = Date.now()) => new Date(weekStartMs(now) + OFFSET).toISOString().slice(0, 10);
export function zones(total: number, tier: number) {
  return { promote: total >= 3 && tier < TIERS.length - 1 ? Math.ceil(total * 0.2) : 0, demote: total >= 5 && tier > 0 ? Math.floor(total * 0.2) : 0 };
}
type Row = RowDataPacket & { tier: number; xp: number };
type Count = RowDataPacket & { n: number };

async function tierFor(userId: string, week: string, now: number): Promise<number> {
  const [cur] = await db().execute<Row[]>("SELECT tier, xp FROM league_scores WHERE week_id = ? AND user_id = ?", [week, userId]);
  if (cur[0]) return Number(cur[0].tier);
  const previous = weekId(now - 7 * DAY);
  const [prev] = await db().execute<Row[]>("SELECT tier, xp FROM league_scores WHERE week_id = ? AND user_id = ?", [previous, userId]);
  if (!prev[0]) return 0;
  const tier = Number(prev[0].tier), xp = Number(prev[0].xp);
  const [[all]] = await db().execute<Count[]>("SELECT COUNT(*) AS n FROM league_scores WHERE week_id = ? AND tier = ?", [previous, tier]);
  const [[better]] = await db().execute<Count[]>("SELECT COUNT(*) AS n FROM league_scores WHERE week_id = ? AND tier = ? AND xp > ?", [previous, tier, xp]);
  const total = Number(all.n), rank = Number(better.n), z = zones(total, tier);
  if (xp > 0 && rank < z.promote) return tier + 1;
  if (z.demote && rank >= total - z.demote) return tier - 1;
  return tier;
}

export async function recordLeagueXp(user: AppUser, xp: number, name?: string) {
  const now = Date.now(), week = weekId(now), tier = await tierFor(user.id, week, now);
  const display = (name || user.name || "O'quvchi").slice(0, 24);
  await db().execute(
    "INSERT INTO league_scores (week_id, user_id, tier, xp, name) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE xp = GREATEST(xp, ?), name = ?",
    [week, user.id, tier, Math.min(MAX_WEEK_XP, xp), display, Math.min(MAX_WEEK_XP, xp), display],
  );
  return { ok: true, weekId: week, tier };
}

export async function leagueStandings(user: AppUser) {
  const now = Date.now(), week = weekId(now), tier = await tierFor(user.id, week, now);
  const [rows] = await db().execute<(RowDataPacket & { user_id: string; name: string; xp: number })[]>(
    "SELECT user_id, name, xp FROM league_scores WHERE week_id = ? AND tier = ? ORDER BY xp DESC, updated_at ASC LIMIT 50", [week, tier]);
  const [[all]] = await db().execute<Count[]>("SELECT COUNT(*) AS n FROM league_scores WHERE week_id = ? AND tier = ?", [week, tier]);
  const total = Number(all.n);
  return {
    weekId: week, endsAt: weekStartMs(now) + 7 * DAY, tier, tierName: TIERS[tier], tiers: TIERS, total, ...zones(total, tier),
    rows: rows.map((row) => ({ name: row.name, xp: Number(row.xp), me: row.user_id === user.id })),
  };
}
