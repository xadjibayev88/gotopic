import { beforeEach, describe, expect, it } from 'vitest';
process.env.SALUT_DB = ':memory:';
process.env.SESSION_SECRET = 'x'.repeat(40);
import { resetDbForTests } from './db.ts';
import { register } from './accounts.ts';
import { collectStats, dashOf, recordVisit, statsText, statsTokenOk } from './stats.ts';
import { createBot } from './bot.ts';

beforeEach(() => {
  resetDbForTests();
  delete process.env.PEER_STATS_URL;
  delete process.env.ADMIN_EMAILS;
  process.env.ADMIN_TELEGRAM_CHAT_ID = '900';
});

describe('admin statistics', () => {
  it('counts devices per day, online and by source; ignores bad ids', () => {
    const now = Date.now();
    expect(recordVisit('bad id', null, 'web', now)).toBe(false);
    recordVisit('deviceAAAAAAAAAA', null, 'web', now);
    recordVisit('deviceAAAAAAAAAA', null, 'web', now + 1000); // bir kunda bir marta sanaladi
    recordVisit('deviceBBBBBBBBBB', null, 'app', now - 10 * 60_000);
    recordVisit('deviceCCCCCCCCCC', null, 'tg', now - 86_400_000 * 2);
    register('a@b.uz', '12345678', 'Ali');
    const s = collectStats(now + 1000);
    expect(s.visitorsToday).toBe(2);
    expect(s.online).toBe(1);
    expect(s.bySrc).toEqual({ web: 1, app: 1, tg: 0 });
    expect(s.visitors7d).toBe(3);
    expect(s.users).toBe(1);
    expect(s.newToday).toBe(1);
    expect(statsText(s, null)).toContain('Bugun kirganlar');
  });

  it('peer token must match exactly', () => {
    process.env.STATS_TOKEN = 'y'.repeat(32);
    expect(statsTokenOk(`Bearer ${'y'.repeat(32)}`)).toBe(true);
    expect(statsTokenOk('Bearer nope')).toBe(false);
    expect(statsTokenOk(undefined)).toBe(false);
  });

  it('dashboard: sends + pins once, then edits; /stats only for admin', async () => {
    const calls: { method: string; body: Record<string, any> }[] = [];
    let id = 10;
    const tg = async (method: string, body: Record<string, unknown>) => {
      calls.push({ method, body: body as Record<string, any> });
      return method === 'sendMessage' ? { message_id: ++id } : true;
    };
    const bot = createBot(tg, async () => null);
    const t = Date.parse('2026-11-27T07:00:00Z');
    await bot.refreshDashboard(t);
    expect(calls.filter((c) => c.method === 'sendMessage')).toHaveLength(1);
    expect(calls.some((c) => c.method === 'pinChatMessage' && c.body.chat_id === '900')).toBe(true);
    recordVisit('deviceDDDDDDDDDD', null, 'web', t + 60_000);
    await bot.refreshDashboard(t + 120_000);
    expect(calls.filter((c) => c.method === 'editMessageText')).toHaveLength(1);
    expect(dashOf('900')?.message_id).toBe(11);
    // Kun oxirida kunlik hisobot (bir marta)
    await bot.refreshDashboard(Date.parse('2026-11-27T18:55:00Z'));
    await bot.refreshDashboard(Date.parse('2026-11-27T18:58:00Z'));
    expect(calls.filter((c) => c.method === 'sendMessage' && String(c.body.text).includes('Kunlik hisobot'))).toHaveLength(1);
    const before = calls.length;
    await bot.handle({ message: { chat: { id: 5, type: 'private' }, from: { id: 5, first_name: 'X' }, text: '/stats' } });
    expect(calls.length).toBe(before); // admin emas — javob yo'q
    await bot.handle({ message: { chat: { id: 900, type: 'private' }, from: { id: 900, first_name: 'Boss' }, text: '/stats' } });
    expect(String(calls.at(-1)!.body.text)).toContain('Jonli statistika');
  });
});
