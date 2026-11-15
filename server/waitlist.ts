/** Play Market'dan oldingi navbat (waitlist): ism, aloqa (Telegram / telefon / email), til, daraja, manba. */
import { createHash } from "node:crypto";
import type { Request } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { consumeBudget, db } from "./database.js";

export const waitlistInput = z.object({
  name: z.string().trim().min(1).max(60),
  contact: z.string().trim().min(3).max(120),
  lang: z.enum(["uz", "ru", "en"]).default("uz"),
  level: z.enum(["0", "1", "2", "3", "4", "5", "6"]).default("0"),
  goal: z.enum(["talk", "topik", "work", "study", "fun"]).optional(),
  source: z.string().trim().max(40).regex(/^[A-Za-z0-9_.-]*$/u).optional(),
}).strict();

/** Kontaktni bir xil ko'rinishga keltiradi: @username, +998..., yoki email. */
export function normalizeContact(raw: string): string | null {
  const value = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value)) return value.toLowerCase();
  const tg = value.replace(/^(https?:\/\/)?t\.me\//iu, "").replace(/^@/u, "");
  if (/^[A-Za-z][A-Za-z0-9_]{4,31}$/u.test(tg)) return `@${tg.toLowerCase()}`;
  const digits = value.replace(/[^\d+]/gu, "");
  if (/^\+?\d{9,15}$/u.test(digits)) return digits.startsWith("+") ? digits : digits.length === 9 ? `+998${digits}` : `+${digits}`;
  return null;
}

function clientKey(req: Request): string {
  const ip = (req.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.socket.remoteAddress || "unknown";
  return createHash("sha256").update(`waitlist:${ip}`).digest("hex").slice(0, 32);
}

export async function joinWaitlist(req: Request, input: z.infer<typeof waitlistInput>): Promise<{ ok: true; position: number; already: boolean }> {
  const contact = normalizeContact(input.contact);
  if (!contact) throw Object.assign(new Error("invalid_contact"), { status: 400 });
  const day = new Date().toISOString().slice(0, 10);
  if (!await consumeBudget(`waitlist:${clientKey(req)}`, day, 10)) throw Object.assign(new Error("rate_limited"), { status: 429 });
  const [result] = await db().execute<ResultSetHeader>(
    `INSERT INTO waitlist (name, contact, lang, level, goal, source) VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), lang = VALUES(lang), level = VALUES(level), goal = VALUES(goal)`,
    [input.name, contact, input.lang, Number(input.level), input.goal ?? null, input.source || null]);
  const [rows] = await db().execute<(RowDataPacket & { id: number })[]>("SELECT id FROM waitlist WHERE contact = ?", [contact]);
  const [pos] = await db().execute<(RowDataPacket & { n: number })[]>("SELECT COUNT(*) AS n FROM waitlist WHERE id <= ?", [rows[0].id]);
  return { ok: true, position: Number(pos[0].n), already: result.affectedRows !== 1 };
}

export async function waitlistCount(): Promise<number> {
  const [rows] = await db().execute<(RowDataPacket & { n: number })[]>("SELECT COUNT(*) AS n FROM waitlist");
  return Number(rows[0].n);
}

export async function waitlistCsv(): Promise<string> {
  const [rows] = await db().execute<RowDataPacket[]>("SELECT id, created_at, name, contact, lang, level, goal, source FROM waitlist ORDER BY id");
  const cell = (v: unknown) => { const s = v instanceof Date ? v.toISOString() : String(v ?? ""); return /[",\n]/u.test(s) || /^[=+\-@]/u.test(s) ? `"${s.replace(/^([=+\-@])/u, "'$1").replace(/"/gu, '""')}"` : s; };
  return ["id,created_at,name,contact,lang,level,goal,source", ...rows.map((r) => [r.id, r.created_at, r.name, r.contact, r.lang, r.level, r.goal, r.source].map(cell).join(","))].join("\n");
}
