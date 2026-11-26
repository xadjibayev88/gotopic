import { beforeEach, describe, expect, it } from 'vitest';
process.env.SALUT_DB = ':memory:';
process.env.SESSION_SECRET = 'x'.repeat(40);
import { resetDbForTests } from './db.ts';
import { register, upsertGoogleUser } from './accounts.ts';
import { activePlan } from './billing.ts';
import { CONFETTI_EFFECT_ID, adminChats, createBot, createLinkCode } from './bot.ts';

type Call = { method: string; body: Record<string, any> };

function setup() {
  const calls: Call[] = [];
  const tg = async (method: string, body: Record<string, unknown>) => {
    calls.push({ method, body: body as Record<string, any> });
    return true;
  };
  const bot = createBot(tg, async () => ({ mime: 'image/jpeg', data: Buffer.from('fakejpeg') }));
  return { calls, bot };
}
const msg = (id: number, extra: Record<string, unknown>) => ({ message: { chat: { id, type: 'private' }, from: { id, first_name: 'Ali' }, ...extra } });
const cb = (id: number, data: string, message?: unknown) => ({ callback_query: { id: 'q', from: { id, first_name: 'Boss' }, data, message: message ?? { chat: { id }, message_id: 1, text: 't' } } });

beforeEach(() => {
  resetDbForTests();
  process.env.PAY_CARD_NUMBER = '9860 0000 0000 0000';
  process.env.PAY_CARD_OWNER = 'TEST';
  process.env.PAY_VISA_NUMBER = '4111 1111 1111 1111';
  process.env.ADMIN_EMAILS = 'boss@example.com';
  delete process.env.ADMIN_TELEGRAM_CHAT_ID;
});

describe('telegram bot', () => {
  it('sends receipts only to ADMIN_TELEGRAM_CHAT_ID when it is set, not to other Telegram accounts linked to the admin', async () => {
    const { calls, bot } = setup();
    const boss = upsertGoogleUser('g-boss2', 'boss@example.com', 'Boss', null);
    // Begona odam admin hisobining bog'lash havolasini ochdi — u admin bo'lib qolmasligi kerak.
    await bot.handle(msg(555, { text: `/start pay_${createLinkCode(boss.id)}` }));
    process.env.ADMIN_TELEGRAM_CHAT_ID = '900';
    try {
      expect(adminChats()).toEqual(['900']);
      await bot.handle(cb(8, 'pay:card:week'));
      await bot.handle(msg(8, { photo: [{ file_id: 'big' }] }));
      const photos = calls.filter((c) => c.method === 'sendPhoto').map((c) => (c.body.__form as FormData).get('chat_id'));
      expect(photos).toEqual(['900']);
      // Bog'langan begona akkaunt chekni tasdiqlay olmaydi.
      await bot.handle(cb(555, 'ok:1'));
      expect(calls.at(-1)!.body.text ?? calls.at(-1)!.body.callback_query_id).toBeTruthy();
      expect(calls.some((c) => c.method === 'answerCallbackQuery' && /Ruxsat/.test(String(c.body.text)))).toBe(true);
    } finally {
      delete process.env.ADMIN_TELEGRAM_CHAT_ID;
    }
  });

  it('shows the card like the app: grouped digits, network, bank and a copy button', async () => {
    const { calls, bot } = setup();
    process.env.PAY_CARD_NUMBER = '9860170112762613';
    process.env.PAY_CARD_BANK = 'Test Bank';
    try {
      await bot.handle(cb(5, 'pay:card:month'));
      const last = calls.at(-1)!.body;
      expect(last.text).toContain('<code>9860 1701 1276 2613</code>');
      expect(last.text).toContain('<b>HUMO</b> · Test Bank');
      expect(JSON.stringify(last.reply_markup)).toContain('"copy_text":{"text":"9860170112762613"}');
      await bot.handle(cb(5, 'pay:visa:month'));
      expect(calls.at(-1)!.body.text).toContain('<b>VISA</b>');
      expect(calls.at(-1)!.body.text).toContain('Kurs: 1$');
    } finally {
      delete process.env.PAY_CARD_BANK;
    }
  });

  it('updates one progress message while a receipt is processed', async () => {
    const calls: Call[] = [];
    let mid = 40;
    const tg = async (method: string, body: Record<string, unknown>) => {
      calls.push({ method, body: body as Record<string, any> });
      return method === 'sendMessage' ? { message_id: ++mid } : true;
    };
    const bot = createBot(tg, async () => ({ mime: 'image/jpeg', data: Buffer.from('fakejpeg') }));
    await bot.handle(cb(8, 'pay:card:week'));
    await bot.handle(msg(8, { photo: [{ file_id: 'big' }] }));
    const mine = calls.filter((c) => c.body.chat_id === '8');
    const start = mine.find((c) => c.method === 'sendMessage' && String(c.body.text).includes('yuklanmoqda'));
    expect(start).toBeTruthy();
    const edits = mine.filter((c) => c.method === 'editMessageText');
    expect(edits.map((e) => e.body.message_id)).toEqual([42, 42]);
    expect(edits.at(-1)!.body.text).toContain('Chek qabul qilindi');
    expect(edits.at(-1)!.body.text).toContain('▰▰▰');
  });

  it('shows tariffs with old prices and the card after choosing a plan', async () => {
    const { calls, bot } = setup();
    await bot.handle(msg(5, { text: '/plans' }));
    const t = calls.at(-1)!.body.text as string;
    expect(t).toContain('<s>99 000</s>');
    expect(t).toContain("69 000 so'm");
    await bot.handle(cb(5, 'plan:month'));
    const kb = JSON.stringify(calls.at(-1)!.body.reply_markup);
    expect(kb).toContain('pay:card:month');
    expect(kb).toContain('pay:visa:month');
    await bot.handle(cb(5, 'pay:card:month'));
    expect(calls.at(-1)!.body.text).toContain('9860 0000 0000 0000');
    await bot.handle(cb(5, 'pay:visa:month'));
    expect(calls.at(-1)!.body.text).toContain('4111');
  });

  it('links an app account by code, takes a receipt, admin approves → Super', async () => {
    const { calls, bot } = setup();
    const user = register('ali@example.com', 'parol12345', 'Ali');
    if (!user.ok) throw new Error('register');
    const boss = { user: upsertGoogleUser('g-boss', 'boss@example.com', 'Boss', null) };
    // Admin o'z hisobini bog'laydi — cheklar unga keladi.
    await bot.handle(msg(900, { text: `/start pay_${createLinkCode(boss.user.id)}` }));
    expect(adminChats()).toContain('900');

    await bot.handle(msg(7, { text: `/start pay_${createLinkCode(user.user.id)}` }));
    expect(calls.some((c) => String(c.body.text).includes('bog'))).toBe(true);
    await bot.handle(cb(7, 'plan:week'));
    await bot.handle(cb(7, 'pay:card:week'));
    await bot.handle(msg(7, { photo: [{ file_id: 'small' }, { file_id: 'big' }] }));
    const toAdmin = calls.find((c) => c.method === 'sendPhoto');
    expect(toAdmin).toBeTruthy();
    expect((toAdmin!.body.__form as FormData).get('chat_id')).toBe('900');

    // Admin bo'lmagan odam tasdiqlay olmaydi.
    await bot.handle(cb(7, 'ok:1'));
    expect(activePlan(user.user.id).plan).toBe('free');
    await bot.handle(cb(900, 'ok:1', { chat: { id: 900 }, message_id: 3, caption: 'chek' }));
    expect(activePlan(user.user.id).plan).toBe('week');
    expect(calls.some((c) => c.body.chat_id === '7' && String(c.body.text).includes('tasdiqlandi'))).toBe(true);
    // Super yoqilgani haqidagi xabar 🎉 konfetti effekti bilan keladi.
    expect(calls.find((c) => c.body.chat_id === '7' && String(c.body.text).includes('tasdiqlandi'))!.body.message_effect_id).toBe(CONFETTI_EFFECT_ID);
    // Ikkinchi marta bosish hech narsa o'zgartirmaydi.
    await bot.handle(cb(900, 'no:1'));
    expect(activePlan(user.user.id).plan).toBe('week');
  });

  it('welcome message has the app button and the Super offer', async () => {
    const { calls, bot } = setup();
    await bot.handle(msg(9, { text: '/start' }));
    const last = calls.at(-1)!;
    expect(last.body.text).toContain('Assalomu alaykum');
    expect(JSON.stringify(last.body.reply_markup)).toContain('web_app');
  });

  it('asks to choose a plan before a receipt', async () => {
    const { calls, bot } = setup();
    await bot.handle(msg(8, { photo: [{ file_id: 'x' }] }));
    expect(calls.at(-1)!.body.text).toContain('tarifni tanlang');
  });
});
