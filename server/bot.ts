// Go Topic Telegram to'lov boti: tariflar → karta raqami → chek (rasm/PDF) → admin ✅/❌ → Super faollashadi.
// Long polling (webhook shart emas). Faqat TELEGRAM_BOT_TOKEN bo'lsa ishga tushadi.
// Hisob bog'lash: ilovadagi «Telegram orqali to'lash» → t.me/<bot>?start=pay_<kod> (kod 30 daqiqa amal qiladi).
// Kodsiz kirgan foydalanuvchi uchun Telegram hisobi ochiladi (ilovaga «Telegram bilan kirish» orqali shu hisob bilan kiradi).
import { randomBytes } from 'node:crypto';
import { db } from './db.ts';
import { decideReview } from './social.ts';
import { collectStats, dashOf, dayOf, fetchPeerStats, saveDash, statsText } from './stats.ts';
import { confirmTgLogin, tgLoginStatus } from './tglogin.ts';
import { getUser, upsertSocialUser } from './accounts.ts';
import { loadDictionary, searchDictionary } from './dictionary.ts';
import { cardBrand, groupCardNumber } from '../src/shared/card.ts';
import { PLANS, activePlan, toUsd, usdRate, createCardOrder, createOrder, decideOrder, grantDays, oldPriceUzs, onGrant, revokeSuper, plansPayload, priceUzs, providers, visiblePlans, type PlanId } from './billing.ts';

type Tg = (method: string, body: Record<string, unknown>) => Promise<any>;
type From = { id: number; first_name?: string; last_name?: string; username?: string };

const env = (k: string) => (process.env[k] ?? '').trim();
const som = (n: number) => n.toLocaleString('ru-RU').replace(/ /g, ' ');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const BRAND = 'Go Topic';
const appUrl = () => env('PUBLIC_URL') || 'https://gotopic.up.railway.app';

// ---------- Hisob bog'lash ----------

/** Ilova uchun bir martalik bog'lash kodi. */
export function createLinkCode(userId: string): string {
  const code = randomBytes(9).toString('base64url');
  db().prepare('DELETE FROM tg_links WHERE expires_at < ?').run(Date.now());
  db().prepare('INSERT INTO tg_links (code, user_id, expires_at) VALUES (?, ?, ?)').run(code, userId, Date.now() + 30 * 60_000);
  return code;
}

function linkByCode(code: string, tgId: string): string | null {
  const r = db().prepare('SELECT user_id FROM tg_links WHERE code = ? AND expires_at > ?').get(code, Date.now()) as { user_id: string } | undefined;
  if (!r || !getUser(r.user_id)) return null;
  db().prepare('DELETE FROM tg_links WHERE code = ?').run(code);
  db().prepare('INSERT OR REPLACE INTO identities (provider, subject, user_id) VALUES (?, ?, ?)').run('telegram', tgId, r.user_id);
  return r.user_id;
}

function userOf(from: From): string {
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Telegram';
  return upsertSocialUser('telegram', String(from.id), null, name, null).id;
}

function chatOfUser(userId: string): string | null {
  const r = db().prepare("SELECT subject FROM identities WHERE provider = 'telegram' AND user_id = ?").get(userId) as { subject: string } | undefined;
  return r?.subject ?? null;
}

/** Cheklar yuboriladigan admin chatlari: ADMIN_TELEGRAM_CHAT_ID + ADMIN_EMAILS hisobiga bog'langan Telegramlar. */
/**
 * Cheklar, izohlar va «Tasdiqlash/Rad etish» huquqi kimga boradi.
 * ADMIN_TELEGRAM_CHAT_ID berilgan bo'lsa — FAQAT o'sha ID'lar. Admin hisobiga bog'langan boshqa Telegram
 * akkauntlar hisobga olinmaydi: kimdir admin qurilmasida o'z Telegrami bilan kirsa yoki admin hisobining
 * bog'lash havolasini ochsa, u cheklarni (shaxsiy ma'lumot) olib, ularni tasdiqlay olardi.
 * O'zgaruvchi bo'sh bo'lsa — faqat Google'da tasdiqlangan admin email hisobiga bog'langan Telegram.
 */
export function adminChats(): string[] {
  const explicit = env('ADMIN_TELEGRAM_CHAT_ID').split(',').map((s) => s.trim()).filter(Boolean);
  if (explicit.length) return [...new Set(explicit)];
  const emails = env('ADMIN_EMAILS').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!emails.length) return [];
  const rows = db()
    .prepare("SELECT i.subject, u.email, u.google_sub FROM identities i JOIN users u ON u.id = i.user_id WHERE i.provider = 'telegram'")
    .all() as { subject: string; email: string | null; google_sub: string | null }[];
  return [...new Set(rows.filter((r) => r.google_sub && r.email && emails.includes(r.email.toLowerCase())).map((r) => r.subject))];
}

// ---------- Admin: Super'ni qo'lda berish ----------

/** «/super» uchun foydalanuvchini topadi: Telegram ID (raqam) yoki email. Topilmasa null. */
export function findTarget(raw: string): { userId: string; chat: string | null } | null {
  const t = raw.trim().replace(/^tg/i, '');
  if (/^\d{1,15}$/.test(t)) {
    const r = db().prepare("SELECT user_id FROM identities WHERE provider = 'telegram' AND subject = ?").get(t) as { user_id: string } | undefined;
    return r && getUser(r.user_id) ? { userId: r.user_id, chat: t } : null;
  }
  if (raw.includes('@') && !raw.startsWith('@')) {
    const r = db().prepare('SELECT id FROM users WHERE lower(email) = ?').get(raw.trim().toLowerCase()) as { id: string } | undefined;
    return r ? { userId: r.id, chat: chatOfUser(r.id) } : null;
  }
  return null;
}

const dateUz = (ms: number) => new Date(ms).toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' });
const SUPER_HELP = [
  "🔐 <b>Super'ni qo'lda berish</b> (faqat admin)",
  '',
  '<code>/super 123456789 30</code> — Telegram ID egasiga 30 kun Super',
  '<code>/super ali@mail.uz 7</code> — email bo\'yicha ham bo\'ladi',
  "<code>/unsuper 123456789</code> — Super'ni olib qo'yish",
  '',
  "💡 ID'ni bilmasangiz — odamning istalgan xabarini shu botga <b>forward</b> qiling.",
].join('\n');

type Kind = 'card' | 'visa';
const setPlan = (chat: string, plan: `${PlanId}:${Kind}` | null) =>
  db().prepare('INSERT INTO tg_state (chat_id, plan, updated_at) VALUES (?, ?, ?) ON CONFLICT(chat_id) DO UPDATE SET plan = excluded.plan, updated_at = excluded.updated_at').run(chat, plan, Date.now());
function planOf(chat: string): { plan: PlanId; kind: Kind } | null {
  const v = (db().prepare('SELECT plan FROM tg_state WHERE chat_id = ?').get(chat) as { plan: string | null } | undefined)?.plan;
  if (!v) return null;
  const [plan, kind] = v.split(':') as [PlanId, Kind | undefined];
  return plan in PLANS ? { plan, kind: kind === 'visa' ? 'visa' : 'card' } : null;
}

// ---------- Matnlar ----------

const mainKb = () => ({
  inline_keyboard: [
    [{ text: '🚀 Ilovaga kirish (Bepul)', web_app: { url: appUrl() } }],
    [{ text: `💎 Super obuna olish (${som(priceUzs('month'))} so'm)`, callback_data: 'plans' }],
    [{ text: "📖 Lug'at: so'z qidirish", callback_data: 'dict' }, { text: '👤 Mening obunam', callback_data: 'me' }],
  ],
});

const POS_UZ: Record<string, string> = { noun: 'ot', verb: "fe'l", adj: 'sifat', adv: 'ravish', pron: 'olmosh', intj: 'undov', det: 'aniqlovchi', num: 'son', counter: "hisob so'zi" };

/** Botdagi lug'at: koreyscha, o'zbekcha yoki inglizcha so'z → 30 000 so'zlik lug'atdan 6 ta eng mos natija. */
export function dictText(q: string): string {
  const query = q.trim().slice(0, 60);
  if (!query) return "📖 <b>Lug'at</b> — 30 000 koreyscha so'z\n\nSo'zni shunchaki yozib yuboring: <code>사랑</code>, <code>sevgi</code> yoki <code>love</code>.";
  let r;
  try {
    r = searchDictionary(loadDictionary(), query);
  } catch {
    return "⚠️ Lug'at hozircha yuklanmadi. Birozdan keyin qayta urinib ko'ring.";
  }
  if (!r.total) return `🔎 «${esc(query)}» bo'yicha hech narsa topilmadi.\n\nKoreyscha (Hangul), o'zbekcha yoki inglizcha yozib ko'ring.`;
  const rows = r.items.slice(0, 6).map((e) => {
    const mean = (e.uz || e.en).split(';').slice(0, 2).join(';').trim().slice(0, 120);
    return `🇰🇷 <b>${esc(e.word)}</b>${e.pos ? ` <i>${esc(POS_UZ[e.pos] ?? e.pos)}</i>` : ''}\n     ${esc(mean)}`;
  });
  return [`📖 <b>${esc(query)}</b> — ${r.total} ta natija`, '', ...rows, '', r.total > 6 ? "Hammasini ilovadagi «Lug'at» bo'limida ko'ring 👇" : "Talaffuzni ilovada tinglang 👇"].join('\n');
}

const dictKb = () => ({ inline_keyboard: [[{ text: "📖 Lug'atni ilovada ochish", web_app: { url: `${appUrl()}/#/dict` } }], [{ text: '⬅️ Asosiy menyu', callback_data: 'home' }]] });

function helpText(): string {
  return [
    '🐯 <b>Go Topic bot — yordam</b>',
    '',
    "🚀 /start — asosiy menyu va ilovaga kirish",
    "📖 /lugat — lug'at (yoki shunchaki koreyscha/o'zbekcha so'z yozing)",
    '💎 /plans — Super tariflari va to\'lov',
    '👤 /me — obunangiz holati',
    '',
    "💳 To'lov: tarifni tanlang → kartaga o'tkazing → chek rasmini shu yerga yuboring. Admin tekshirgach Super o'zi yoqiladi.",
    '',
    `📸 Instagram: <a href="https://www.instagram.com/gotopic.uz/">@gotopic.uz</a> — Reels, darslar va yangiliklar`,
  ].join('\n');
}

/** Kutib olish xabari: og'riqli nuqtalar → yechim → narx → ikki tugma. */
function welcomeText(name: string): string {
  return [
    `Assalomu alaykum, <b>${esc(name)}</b>! 👋`,
    "",
    "Koreys tilini oylab o'rgansangiz ham, nega hali erkin gapira olmaysiz? 🤔",
    "",
    "Ko'pchilik til o'rganishda eng qimmatli narsasi — <b>VAQTINI</b> yo'qotadi:",
    "❌ Grammatika jadvallarini quruq yodlash bilan soatlab vaqt ketadi;",
    "❌ Yodlangan so'zlar 3 kunda unutiladi, chunki amaliyotda ishlatilmaydi;",
    "❌ Gapirishga kelganda esa sherik yo'q yoki xato qilishdan qo'rquv to'sqinlik qiladi.",
    "",
    "Bizning maqsadimiz — <b>koreys tilini qiziqarli va vaqtingizni tejaydigan qilish!</b> 🚀",
    "",
    "<b>Go Topic</b> da hammasi yangicha ishlaydi:",
    "",
    "🗺 <b>1. O'yin tariqasidagi darslar — bepul</b>",
    "TOPIK 1 dan 6 gacha 35 ta bo'lim, Hangul alifbosidan boshlab: pastdan tepaga boriladigan xarita, yulduzlar, Sirli qutilar, mashq va diktant — so'zlar o'zi yodda qoladi.",
    "",
    "📖 <b>2. 30 000 so'zlik lug'at va TOPIK mashqlari</b>",
    "Istalgan koreyscha so'zni o'zbekcha izohi bilan toping, tinglang va saqlang. Grammatika, o'qish va tinglash mashqlari — TOPIK imtihoniga tayyorgarlik.",
    "",
    "🏆 <b>3. Haftalik turnir</b>",
    "20 kishilik guruhlarda XP yig'ing: Kurtak ligasidan Afsonagacha ko'tariling, kunlik seriyani uzmang 🔥",
    "",
    "🐯 <b>4. Hori AI — jonli ustoz (Super)</b>",
    "Hori bilan istalgan mavzuda ovozli va matnli gaplashasiz, Gemini Live'da real vaqtda. U xatolaringizni hazil bilan (ba'zan qattiq 🐯) to'g'rilaydi.",
    "",
    "🎭 <b>5. Har xil xarakterlar</b>",
    "Romantik Hori 💘, qattiqqo'l Professor, hazilkash yoki 18+ «bezori» Hori — kim bilan o'rganishni o'zingiz tanlaysiz.",
    "",
    "🌐 Ilova 12 tilda: o'zbek, rus, ingliz, qozoq, qirg'iz, tojik, turk va boshqalar.",
    "",
    "Vaqtingizni qadrlang va tilni zamonaviy texnologiyalar bilan oson o'rganing! 💡",
    "",
    `💎 <b>1 oylik to'liq Super imkoniyat</b> — atigi <b>${som(priceUzs('month'))} so'm</b> (bitta kitob narxida).`,
    "",
    "Hoziroq birinchi darsni bepul sinab ko'ring: 👇",
  ].join('\n');
}

function plansText(): string {
  const anchor = plansPayload().anchor;
  const lines = visiblePlans().map((id) => {
    const now = priceUzs(id);
    const old = oldPriceUzs(id);
    const off = old > now ? ` <b>−${Math.round((1 - now / old) * 100)}%</b>` : '';
    const perDay = Math.round(now / PLANS[id].days / 100) * 100;
    return `${id === 'month' ? '🔥' : '▫️'} <b>${PLANS[id].label}</b> — ${old > now ? `<s>${som(old)}</s> ` : ''}<b>${som(now)} so'm</b>${off}\n     ≈ kuniga ${som(perDay)} so'm${id === 'month' ? ' · <i>eng ommabop</i>' : ''}`;
  });
  return [
    '💎 <b>Go Topic Super</b> — koreys tilini Hori bilan cheksiz o\'rgan!',
    '',
    '🐯 Hori AI — faqat Super\'da: ovozli va matnli suhbat, xatolar tahlili',
    '⚡ Gemini Live — jonli suhbat, 30 daqiqalik sessiyalar',
    '💬 Cheksiz xabarlar',
    '🐟 Cheksiz baliqcha — xato qilsangiz ham darsdan chiqmaysiz',
    '🚫 Reklamasiz',
    '🔥 Uzilgan seriyani bepul tiklash',
    '',
    `💸 ${esc(anchor.label)}: <s>${som(anchor.uzs)} so'm</s>`,
    '👇 Bizda esa:',
    '',
    ...lines,
    '',
    'Tarifni tanlang:',
  ].join('\n');
}

function plansKb() {
  return { inline_keyboard: [...visiblePlans().map((id) => [{ text: `${id === 'month' ? '🔥 ' : ''}${PLANS[id].label} — ${som(priceUzs(id))} so'm`, callback_data: `plan:${id}` }]), [{ text: '⬅️ Orqaga', callback_data: 'home' }]] };
}

function methodsText(plan: PlanId): string {
  return [`🧾 <b>${PLANS[plan].name}</b>`, `To'lov summasi: <b>${som(priceUzs(plan))} so'm</b>`, '', "To'lov usulini tanlang 👇"].join('\n');
}

/** Payme/Click — tayyor to'lov havolasi (to'lansa Super avtomatik yoqiladi); karta/Visa — chek orqali. */
function methodsKb(plan: PlanId, userId: string) {
  const on = providers();
  const rows: Record<string, unknown>[][] = [];
  for (const p of ['payme', 'click'] as const) {
    if (!on.includes(p)) continue;
    const r = createOrder(userId, plan, p, appUrl());
    if ('payUrl' in r && r.payUrl) rows.push([{ text: p === 'payme' ? '🟦 Payme orqali to\'lash' : '🔵 Click orqali to\'lash', url: r.payUrl }]);
  }
  if (on.includes('card')) rows.push([{ text: '💳 Uzcard / Humo karta', callback_data: `pay:card:${plan}` }]);
  if (on.includes('visa')) rows.push([{ text: '🌍 Visa / Mastercard', callback_data: `pay:visa:${plan}` }]);
  rows.push([{ text: '⬅️ Boshqa tarif', callback_data: 'plans' }]);
  return { inline_keyboard: rows };
}

/** Karta ma'lumoti ilovadagi shisha karta bilan bir xil: 4 talik guruhlar, karta turi, bank, egasi. */
function payText(plan: PlanId, kind: Kind = 'card'): string {
  const c = kind === 'visa' ? plansPayload().visa : plansPayload().card;
  const num = c?.number ? groupCardNumber(c.number) : '—';
  return [
    `🧾 <b>${PLANS[plan].name}</b>`,
    kind === 'visa' ? `To'lov summasi: <b>${'$'}${toUsd(priceUzs(plan))}</b> (${som(priceUzs(plan))} so'm)` : `To'lov summasi: <b>${som(priceUzs(plan))} so'm</b>`,
    ...(kind === 'visa' ? [`<i>Kurs: 1$ = ${som(usdRate())} so'm</i>`] : []),
    '',
    kind === 'visa' ? '🌍 Quyidagi Visa kartaga o\'tkazing:' : '💳 Quyidagi kartaga o\'tkazing:',
    '',
    `<b>${c?.number ? cardBrand(c.number, kind) : 'KARTA'}</b>${c?.bank ? ` · ${esc(c.bank)}` : ''}`,
    `<code>${esc(num)}</code>`,
    ...(c?.owner ? [`👤 ${esc(c.owner)}`] : []),
    '',
    '📋 Raqamni pastdagi tugma bilan nusxalang.',
    '📸 To\'lovdan so\'ng <b>chek rasmini (skrinshot yoki PDF)</b> shu yerga yuboring.',
    '⏱ Admin 5–30 daqiqada tekshiradi va Super avtomatik yoqiladi.',
  ].join('\n');
}

/** «Nusxalash» tugmasi (Telegram copy_text) — raqam bo'sh joysiz nusxalanadi. */
function payKb(plan: PlanId, kind: Kind) {
  const c = kind === 'visa' ? plansPayload().visa : plansPayload().card;
  const digits = (c?.number ?? '').replace(/\D/g, '');
  return {
    inline_keyboard: [
      ...(digits ? [[{ text: `📋 Karta raqamini nusxalash`, copy_text: { text: digits } }]] : []),
      [{ text: '⬅️ Boshqa usul', callback_data: `plan:${plan}` }],
    ],
  };
}

/** Matnli «progress» chizig'i: ▰▰▱ */
const bar = (step: number, of = 3) => '▰'.repeat(step) + '▱'.repeat(of - step);

/** Super yoqilganda Telegram'ning o'rnatilgan 🎉 konfetti effekti (faqat shaxsiy chatlarda). */
export const CONFETTI_EFFECT_ID = '5046509860389126442';

function meText(userId: string): string {
  const p = activePlan(userId);
  const u = getUser(userId);
  if (p.plan === 'free') return `👤 ${esc(u?.name || 'Foydalanuvchi')}\nObuna: <b>bepul</b>\n\nSuper olish uchun «💎 Super tariflari» ni bosing.`;
  return `👤 ${esc(u?.name || 'Foydalanuvchi')}\nObuna: <b>💎 Super</b>\nAmal qiladi: <b>${new Date(p.expiresAt!).toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' })}</b> gacha`;
}

/** Faqat admin chatida ko'rinadigan doimiy pastki tugma. */
export const ADMIN_STATS_BUTTON = '📊 Statistika';
/** Pastki doimiy menyu tugmalari (matni bo'yicha ushlanadi). */
export const MENU = {
  app: '🚀 Ilovani ochish',
  plans: '💎 Super tariflar',
  me: '👤 Mening obunam',
  dict: "📖 Lug'at",
  help: '❓ Yordam',
} as const;
const HAS_DICT = true;
/**
 * Pastki doimiy menyu — barcha foydalanuvchilarga bir xil; admin chatida qo'shimcha «📊 Statistika» qatori.
 * «Ilovani ochish» — Mini App tugmasi (web_app), bosilganda ilova Telegram ichida ochiladi.
 */
function menuKb(admin: boolean) {
  const rows: { text: string; web_app?: { url: string } }[][] = [
    [{ text: MENU.app, web_app: { url: appUrl() } }],
    [{ text: MENU.plans }, { text: MENU.me }],
    HAS_DICT ? [{ text: MENU.dict }, { text: MENU.help }] : [{ text: MENU.help }],
  ];
  if (admin) rows.push([{ text: ADMIN_STATS_BUTTON }]);
  return { keyboard: rows, resize_keyboard: true, is_persistent: true, input_field_placeholder: HAS_DICT ? "So'z yozing yoki menyudan tanlang" : 'Menyudan tanlang' };
}
const adminKb = () => menuKb(true);

// ---------- Bot mantiqi ----------

export function createBot(tg: Tg, download: (fileId: string) => Promise<{ mime: string; data: Buffer } | null>) {
  const send = (chat: string | number, text: string, extra: Record<string, unknown> = {}) =>
    tg('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });

  /** Yangi chekni adminlarga rasm + tugmalar bilan yuboradi (ilova va bot cheklari uchun). */
  async function notifyReceipt(orderId: number, plan: PlanId, amount: number, who: string, receipt: string) {
    const caption = `🧾 <b>Yangi chek #${orderId}</b>\n${esc(PLANS[plan].name)} · <b>${som(amount)} so'm</b>\n👤 ${esc(who)}`;
    const kb = { inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: `ok:${orderId}` }, { text: '❌ Rad etish', callback_data: `no:${orderId}` }]] };
    const m = /^data:([^;]+);base64,(.*)$/s.exec(receipt);
    for (const chat of adminChats()) {
      try {
        if (m) {
          const isPdf = m[1] === 'application/pdf';
          const form = new FormData();
          form.set('chat_id', chat);
          form.set('caption', caption);
          form.set('parse_mode', 'HTML');
          form.set('reply_markup', JSON.stringify(kb));
          form.set(isPdf ? 'document' : 'photo', new Blob([Buffer.from(m[2], 'base64')], { type: m[1] }), isPdf ? `chek-${orderId}.pdf` : `chek-${orderId}.jpg`);
          await tg(isPdf ? 'sendDocument' : 'sendPhoto', { __form: form });
        } else await send(chat, caption, { reply_markup: kb });
      } catch {
        await send(chat, caption, { reply_markup: kb }).catch(() => {});
      }
    }
  }

  /** Yangi izoh — adminlarga ✅/❌ tugmalari bilan (tasdiqlanmaguncha saytda ko'rinmaydi). */
  async function notifyReview(id: number, rating: number, text: string, name: string) {
    const kb = { inline_keyboard: [[{ text: '✅ Chiqarish', callback_data: `rvok:${id}` }, { text: '❌ Rad etish', callback_data: `rvno:${id}` }]] };
    for (const chat of adminChats()) await send(chat, `💬 <b>Yangi izoh #${id}</b> · ${'⭐'.repeat(Math.max(1, Math.min(5, rating)))}\n👤 ${esc(name || 'Foydalanuvchi')}\n\n«${esc(text)}»`, { reply_markup: kb }).catch(() => {});
  }

  /** Buyurtma hal qilinganda foydalanuvchiga xabar (ilovadagi admin sahifasidan ham chaqiriladi). */
  async function notifyDecision(userId: string, approve: boolean) {
    const chat = chatOfUser(userId);
    if (!chat) return;
    const text = approve
      ? `🎉 <b>To'lov tasdiqlandi!</b>\n💎 Super faollashdi — ${esc(meText(userId).split('\n').slice(2).join(' '))}\n\nIlovani oching: Hori AI, Gemini Live va cheksiz baliqcha endi siz uchun ochiq!`
      : "❌ Chek tasdiqlanmadi. Summa yoki chek noto'g'ri bo'lishi mumkin. Savol bo'lsa shu yerga yozing.";
    const extra = { reply_markup: approve ? { inline_keyboard: [[{ text: '📱 Ilovani ochish', url: appUrl() }]] } : mainKb() };
    if (!approve) return void (await send(chat, text, extra).catch(() => {}));
    // Ilovadagi «Confetti → burst» ning Telegram'dagi muqobili: xabar 🎉 effekti bilan keladi.
    // Effekt qo'llab-quvvatlanmasa — oddiy xabar.
    await send(chat, text, { ...extra, message_effect_id: CONFETTI_EFFECT_ID }).catch(() => send(chat, text, extra).catch(() => {}));
  }

  /** Admin qo'lda Super beradi va foydalanuvchiga xabar yuboradi. Admin uchun natija matnini qaytaradi. */
  async function adminGrant(target: { userId: string; chat: string | null }, days: number, by: From): Promise<string> {
    const until = grantDays(target.userId, days);
    console.log('audit', JSON.stringify({ at: new Date().toISOString(), admin: `tg:${by.id}`, user: target.userId, action: 'grant_super', days }));
    const name = esc(getUser(target.userId)?.name || 'Foydalanuvchi');
    if (target.chat) {
      const text = `🎁 <b>Sizga Super berildi!</b>\n💎 Amal qiladi: <b>${dateUz(until)}</b> gacha\n\nIlovani oching: Hori AI, Gemini Live va cheksiz baliqcha endi siz uchun ochiq!`;
      const extra = { reply_markup: { inline_keyboard: [[{ text: '📱 Ilovani ochish', url: appUrl() }]] } };
      await send(target.chat, text, { ...extra, message_effect_id: CONFETTI_EFFECT_ID }).catch(() => send(target.chat!, text, extra).catch(() => {}));
    }
    return `✅ <b>${name}</b> ga ${days} kun Super berildi.\n💎 ${dateUz(until)} gacha${target.chat ? '' : "\n<i>(Telegram bog'lanmagan — xabar yuborilmadi)</i>"}`;
  }

  async function adminRevoke(userId: string): Promise<string> {
    const had = revokeSuper(userId);
    console.log('audit', JSON.stringify({ at: new Date().toISOString(), user: userId, action: 'revoke_super', had }));
    const name = esc(getUser(userId)?.name || 'Foydalanuvchi');
    return had ? `🚫 <b>${name}</b> dan Super olib qo'yildi.` : `ℹ️ <b>${name}</b> da faol Super yo'q edi.`;
  }

  async function onMessage(msg: any) {
    const chat = String(msg.chat.id);
    if (msg.chat.type !== 'private') return;
    const from: From = msg.from;
    const text: string = msg.text ?? '';

    if (text.startsWith('/start')) {
      const arg = text.split(/\s+/)[1] ?? '';
      if (arg.startsWith('login_')) {
        const code = arg.slice(6);
        if (tgLoginStatus(code) !== 'pending') return send(chat, "⌛ Kirish havolasi eskirgan. Saytda «Telegram bilan davom etish» tugmasini qayta bosing.");
        return send(chat, [
          `🔐 <b>Saytga kirish</b>`,
          '',
          `${esc(from.first_name || "Do'stim")}, saytga shu Telegram hisobingiz bilan kirasiz. Tasdiqlang 👇`,
          '',
          "<i>⚠️ Agar hozir saytda tugmani o'zingiz bosmagan bo'lsangiz — tasdiqlamang.</i>",
        ].join('\n'), { reply_markup: { inline_keyboard: [[{ text: '✅ Tasdiqlash va kirish', callback_data: `tgl:${code}` }]] } });
      }
      let uid: string | null = null;
      if (arg.startsWith('pay_')) uid = linkByCode(arg.slice(4), String(from.id));
      const linked = !!uid;
      uid ??= userOf(from);
      const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || "do'stim";
      if (linked) await send(chat, "✅ Ilovadagi hisobingiz botga bog'landi.");
      if (arg.startsWith('pay_') || arg === 'plans') return send(chat, plansText(), { reply_markup: plansKb() });
      // Banner xabar tepasida katta rasm sifatida (link preview) — bitta chiroyli xabar.
      await tg('sendMessage', {
        chat_id: chat, text: welcomeText(name), parse_mode: 'HTML', reply_markup: mainKb(),
        link_preview_options: { url: `${appUrl()}/bot-banner.jpg`, prefer_large_media: true, show_above_text: true },
      }).catch(() => send(chat, welcomeText(name), { reply_markup: mainKb() }));
      const isAdmin = adminChats().includes(chat);
      await send(chat, isAdmin ? '⌨️ Menyu pastda. 🔐 Admin: «📊 Statistika» va /super (Super berish) — faqat sizga ko\'rinadi.' : '⌨️ Tezkor menyu pastda 👇', { reply_markup: menuKb(isAdmin) });
      return;
    }
    const isAdminChat = adminChats().includes(chat);
    if (/^\/(super|unsuper)(@\w+)?(\s|$)/.test(text)) {
      if (!isAdminChat) return; // faqat admin — boshqalarga hech narsa ko'rinmaydi
      const [cmd, who = '', daysRaw = '30'] = text.trim().split(/\s+/);
      if (!who) return send(chat, SUPER_HELP, { reply_markup: adminKb() });
      const target = findTarget(who);
      if (!target) return send(chat, `⚠️ <code>${esc(who)}</code> topilmadi. Odam avval botda /start bosgan bo'lishi kerak (yoki ilovaga shu email bilan kirgan bo'lishi).`);
      if (cmd.startsWith('/unsuper')) return send(chat, await adminRevoke(target.userId));
      const days = Number(daysRaw);
      if (!Number.isInteger(days) || days < 1 || days > 3650) return send(chat, "⚠️ Kunlar soni 1 dan 3650 gacha butun son bo'lsin. Masalan: <code>/super 123456789 30</code>");
      return send(chat, await adminGrant(target, days, from));
    }
    // Admin birovning xabarini forward qilsa — o'sha odamga Super berish tugmalari.
    const fwd = msg.forward_origin ?? (msg.forward_from ? { type: 'user', sender_user: msg.forward_from } : msg.forward_sender_name ? { type: 'hidden_user' } : null);
    if (isAdminChat && fwd) {
      if (fwd.type !== 'user' || !fwd.sender_user?.id) {
        return send(chat, "🙈 Bu odam Telegram sozlamalarida forward'da hisobini yashirgan. Undan botga /id yozishini so'rang va chiqqan raqam bilan: <code>/super RAQAM 30</code>");
      }
      const u = fwd.sender_user as From;
      const id = String(u.id);
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ') + (u.username ? ` @${u.username}` : '');
      const target = findTarget(id);
      if (!target) return send(chat, `👤 ${esc(name)} (ID <code>${id}</code>)\n\n⚠️ Bu odam hali botda /start bosmagan. Avval botni ochsin, keyin qayta forward qiling.`);
      const p = activePlan(target.userId);
      const now = p.plan === 'free' ? 'bepul' : `💎 Super, ${dateUz(p.expiresAt!)} gacha`;
      return send(chat, `👤 <b>${esc(name)}</b>\nID: <code>${id}</code>\nHozir: ${now}\n\nQancha Super beramiz?`, {
        reply_markup: { inline_keyboard: [
          [7, 30, 90, 365].map((d) => ({ text: d === 365 ? '1 yil' : `${d} kun`, callback_data: `sg:${id}:${d}` })),
          [{ text: "🚫 Super'ni olib qo'yish", callback_data: `su:${id}` }],
        ] },
      });
    }
    if (text === '/plans' || text === '/tariflar') return send(chat, plansText(), { reply_markup: plansKb() });
    if (text === '/id' || text === '/myid') return send(chat, `Sizning chat ID: <code>${chat}</code>`);
    if (text === '/stats' || text === '/statistika' || text === ADMIN_STATS_BUTTON) {
      if (!adminChats().includes(chat)) return; // faqat admin — boshqalarga hech narsa ko'rinmaydi
      void tg('sendChatAction', { chat_id: chat, action: 'typing' }).catch(() => {});
      const stats = statsText(collectStats(), await fetchPeerStats());
      await send(chat, stats, { reply_markup: adminKb() });
      return;
    }
    if (text === '/me' || text === MENU.me) return send(chat, meText(userOf(from)), { reply_markup: mainKb() });
    if (text === MENU.plans) return send(chat, plansText(), { reply_markup: plansKb() });
    if (text === '/menu') return send(chat, '⌨️ Menyu pastda 👇', { reply_markup: menuKb(adminChats().includes(chat)) });
    if (text === '/help' || text === '/yordam' || text === MENU.help) return send(chat, helpText(), { reply_markup: mainKb() });
    if (/^\/(lugat|dict)\b/.test(text) || text === MENU.dict) return send(chat, dictText(text === MENU.dict ? '' : text.replace(/^\/\S+\s*/, '')), { reply_markup: dictKb() });

    const file = msg.photo?.length ? { id: msg.photo[msg.photo.length - 1].file_id, mime: 'image/jpeg' } : msg.document ? { id: msg.document.file_id, mime: msg.document.mime_type || '' } : null;
    if (file) {
      const st = planOf(chat);
      if (!st) return send(chat, '📸 Chekni yuborishdan oldin tarifni tanlang 👇', { reply_markup: plansKb() });
      if (!/^(image\/(png|jpe?g|webp|heic)|application\/pdf)$/.test(file.mime)) return send(chat, '⚠️ Chekni rasm yoki PDF ko\'rinishida yuboring.');
      // Ilovadagi yuklash zonasi kabi: bitta xabar bosqichma-bosqich yangilanadi (▰▱▱ → ▰▰▱ → ✅).
      void tg('sendChatAction', { chat_id: chat, action: 'upload_photo' }).catch(() => {});
      void tg('setMessageReaction', { chat_id: chat, message_id: msg.message_id, reaction: [{ type: 'emoji', emoji: '👀' }] }).catch(() => {});
      const progress = (await send(chat, `⏳ Chek yuklanmoqda… ${bar(1)}`).catch(() => null)) as { message_id?: number } | null;
      const update = (text: string, extra: Record<string, unknown> = {}) =>
        progress?.message_id
          ? tg('editMessageText', { chat_id: chat, message_id: progress.message_id, text, parse_mode: 'HTML', ...extra }).catch(() => send(chat, text, extra))
          : send(chat, text, extra);
      const got = await download(file.id).catch(() => null);
      if (!got || got.data.length > 2_900_000) return update('⚠️ Faylni yuklab bo\'lmadi (3 MB gacha bo\'lsin). Qayta yuboring.');
      if (progress?.message_id) await update(`⏳ Chek tekshirilmoqda… ${bar(2)}`);
      const uid = userOf(from);
      const receipt = `data:${file.mime === 'image/jpg' ? 'image/jpeg' : file.mime || got.mime};base64,${got.data.toString('base64')}`;
      const r = createCardOrder(uid, st.plan, receipt, st.kind);
      if ('error' in r) return update(`⚠️ ${esc(r.error)}`);
      setPlan(chat, null);
      void tg('setMessageReaction', { chat_id: chat, message_id: msg.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] }).catch(() => {});
      await update(`✅ Chek qabul qilindi (#${r.id}) ${bar(3)}\n⏱ Admin tekshirgach, Super avtomatik yoqiladi va sizga xabar beraman.`);
      const who = [from.first_name, from.last_name].filter(Boolean).join(' ') + (from.username ? ` @${from.username}` : '') + ` (tg ${from.id})`;
      await notifyReceipt(r.id, r.plan, r.amountUzs, `${who}${st.kind === 'visa' ? ' · VISA' : ''}`, receipt);
      return;
    }
    // Oddiy matn — lug'atdan qidiramiz (so'z yoki qisqa ibora).
    if (text && !text.startsWith('/') && text.length <= 60) return send(chat, dictText(text), { reply_markup: dictKb() });
    return send(chat, 'Quyidagi tugmalardan foydalaning 👇', { reply_markup: mainKb() });
  }

  async function onCallback(q: any) {
    const chat = String(q.message?.chat?.id ?? q.from.id);
    const data: string = q.data ?? '';
    const ack = (text = '', alert = false) => tg('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: alert }).catch(() => {});

    if (data === 'plans') return ack(), send(chat, plansText(), { reply_markup: plansKb() });
    if (data === 'home') return ack(), send(chat, 'Asosiy menyu 👇', { reply_markup: mainKb() });
    if (data === 'me') return ack(), send(chat, meText(userOf(q.from)), { reply_markup: mainKb() });
    if (data === 'dict') return ack(), send(chat, dictText(''), { reply_markup: dictKb() });
    if (data.startsWith('tgl:')) {
      const ok = confirmTgLogin(data.slice(4), userOf(q.from));
      await ack(ok ? 'Tayyor!' : 'Havola eskirgan', !ok);
      const text = ok ? "✅ <b>Kirdingiz!</b>\n\nBrauzerga qayting — sayt o'zi ochiladi." : "⌛ Kirish havolasi eskirgan. Saytda tugmani qayta bosing.";
      if (q.message) await tg('editMessageText', { chat_id: q.message.chat.id, message_id: q.message.message_id, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } }).catch(() => send(chat, text));
      return;
    }
    if (data.startsWith('plan:')) {
      const plan = data.slice(5) as PlanId;
      if (!(plan in PLANS)) return ack();
      if (!providers().length) return ack("To'lov hozircha yoqilmagan", true);
      await ack();
      return send(chat, methodsText(plan), { reply_markup: methodsKb(plan, userOf(q.from)) });
    }
    const pay = /^pay:(card|visa):(\w+)$/.exec(data);
    if (pay) {
      const kind = pay[1] as Kind;
      const plan = pay[2] as PlanId;
      if (!(plan in PLANS) || !providers().includes(kind)) return ack("Bu usul yoqilmagan", true);
      setPlan(chat, `${plan}:${kind}`);
      await ack();
      // Nusxalash tugmasi rad etilsa ham karta ma'lumoti albatta yetib boradi.
      return send(chat, payText(plan, kind), { reply_markup: payKb(plan, kind) }).catch(() =>
        send(chat, payText(plan, kind), { reply_markup: { inline_keyboard: [[{ text: '⬅️ Boshqa usul', callback_data: `plan:${plan}` }]] } }),
      );
    }
    const sg = /^s(g|u):(\d+)(?::(\d+))?$/.exec(data);
    if (sg) {
      if (!adminChats().includes(String(q.from.id))) return ack("Ruxsat yo'q", true);
      const target = findTarget(sg[2]);
      if (!target) return ack('Foydalanuvchi topilmadi', true);
      const result = sg[1] === 'g' ? await adminGrant(target, Number(sg[3]), q.from) : await adminRevoke(target.userId);
      await ack(sg[1] === 'g' ? '✅ Super berildi' : 'Tayyor');
      if (q.message) await tg('editMessageText', { chat_id: q.message.chat.id, message_id: q.message.message_id, text: result, parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } }).catch(() => send(chat, result));
      else await send(chat, result);
      return;
    }
    const rv = /^rv(ok|no):(\d+)$/.exec(data);
    if (rv) {
      if (!adminChats().includes(String(q.from.id))) return ack("Ruxsat yo'q", true);
      const done = decideReview(Number(rv[2]), rv[1] === 'ok');
      await ack(done ? (rv[1] === 'ok' ? '✅ Saytga chiqdi' : '❌ Rad etildi') : 'Allaqachon hal qilingan', !done);
      if (done && q.message) await tg('editMessageText', { chat_id: q.message.chat.id, message_id: q.message.message_id, text: `${q.message.text ?? ''}\n\n${rv[1] === 'ok' ? '✅ Saytga chiqdi' : '❌ Rad etildi'}`, reply_markup: { inline_keyboard: [] } }).catch(() => {});
      return;
    }
    const m = /^(ok|no):(\d+)$/.exec(data);
    if (m) {
      if (!adminChats().includes(String(q.from.id))) return ack("Ruxsat yo'q", true);
      const id = Number(m[2]);
      const order = db().prepare('SELECT user_id FROM orders WHERE id = ?').get(id) as { user_id: string } | undefined;
      const approve = m[1] === 'ok';
      const done = decideOrder(id, approve);
      await ack(done ? (approve ? '✅ Tasdiqlandi' : '❌ Rad etildi') : 'Bu chek allaqachon hal qilingan', !done);
      if (done && q.message) {
        const note = `\n\n${approve ? '✅ Tasdiqlandi' : '❌ Rad etildi'} — ${esc(q.from.first_name ?? 'admin')}`;
        const cap = (q.message.caption ?? q.message.text ?? '') + note;
        await tg(q.message.caption !== undefined ? 'editMessageCaption' : 'editMessageText', {
          chat_id: q.message.chat.id, message_id: q.message.message_id, [q.message.caption !== undefined ? 'caption' : 'text']: cap, reply_markup: { inline_keyboard: [] },
        }).catch(() => {});
      }
      // Tasdiqlansa — xabarni onGrant yuboradi; rad etilsa — shu yerdan.
      if (done && order && !approve) await notifyDecision(order.user_id, false);
      return;
    }
    return ack();
  }


  /** Inline rejim: istalgan chatda «@bot so'z» — natijani do'stga yuborish mumkin (BotFather'da /setinline yoqilgan bo'lsa). */
  async function onInline(q: any) {
    const query = String(q.query ?? '').trim().slice(0, 60);
    const results: Record<string, unknown>[] = [];
    if (query) {
      try {
        const r = searchDictionary(loadDictionary(), query);
        for (const e of r.items.slice(0, 20)) {
          const mean = (e.uz || e.en).split(';').slice(0, 2).join(';').trim().slice(0, 120);
          results.push({
            type: 'article', id: `w${e.id}`.slice(0, 64), title: `${e.word} — ${mean}`.slice(0, 120), description: POS_UZ[e.pos] ?? e.pos ?? '',
            input_message_content: { message_text: `🇰🇷 <b>${esc(e.word)}</b>${e.pos ? ` <i>${esc(POS_UZ[e.pos] ?? e.pos)}</i>` : ''}\n${esc(mean)}`, parse_mode: 'HTML' },
            reply_markup: { inline_keyboard: [[{ text: "📖 Lug'atda ochish", url: `${appUrl()}/#/dict` }]] },
          });
        }
      } catch {
        /* lug'at yuklanmadi */
      }
    }
    results.push({
      type: 'article', id: 'app', title: '🚀 Ilovani ulashish', description: 'Do\'stingizga ilova havolasini yuboring',
      input_message_content: { message_text: `${esc(BRAND)} — tilni o'yin tariqasida o'rganing 👇\n${appUrl()}`, parse_mode: 'HTML' },
      reply_markup: { inline_keyboard: [[{ text: '🚀 Ilovani ochish', url: appUrl() }]] },
    });
    await tg('answerInlineQuery', { inline_query_id: q.id, results, cache_time: 300, is_personal: false }).catch(() => {});
  }

  async function handle(update: any) {
    try {
      if (update.message) await onMessage(update.message);
      else if (update.callback_query) await onCallback(update.callback_query);
      else if (update.inline_query) await onInline(update.inline_query);
    } catch (e) {
      console.error('bot:', (e as Error).message);
    }
  }

  // Har qanday usulda (Payme, Click, karta, Visa) obuna yoqilsa — foydalanuvchiga xabar.
  onGrant((userId) => void notifyDecision(userId, true));

  /** Oddiy xizmat ogohlantirishi barcha admin chatlariga (masalan, AI limiti tugadi). */
  async function notifyAdmins(html: string): Promise<number> {
    let sent = 0;
    for (const chat of adminChats()) {
      try {
        await send(chat, html);
        sent++;
      } catch { /* boshqa adminlarga yuborishda davom etamiz */ }
    }
    return sent;
  }

  /**
   * Admin statistikasi: har bir admin chatida bitta qadalgan xabar — har chaqirilganda yangilanadi
   * (o'zgarmagan bo'lsa tegilmaydi). Kun oxirida (23:5x Toshkent) alohida kunlik hisobot yuboriladi.
   */
  async function refreshDashboard(now = Date.now(), force = false) {
    const chats = adminChats();
    if (!chats.length) return;
    const own = collectStats(now);
    const peer = await fetchPeerStats();
    const text = statsText(own, peer);
    const clock = new Date(now + 5 * 3600_000).toISOString().slice(11, 16);
    for (const chat of chats) {
      try {
        const d = dashOf(chat);
        let mid = d?.message_id ?? null;
        if (mid && (force || d?.text !== text)) {
          const ok = await tg('editMessageText', { chat_id: chat, message_id: mid, text, parse_mode: 'HTML' }).then(() => true, (e: Error) => /not modified/i.test(e.message));
          if (!ok) mid = null; // xabar o'chirilgan — qaytadan yuboramiz
        }
        if (!mid) {
          const m = (await send(chat, text, { disable_notification: true })) as { message_id?: number };
          mid = m?.message_id ?? null;
          if (mid) await tg('pinChatMessage', { chat_id: chat, message_id: mid, disable_notification: true }).catch(() => {});
        }
        const today = dayOf(now);
        let report = d?.report_day ?? null;
        if (clock >= '23:50' && report !== today) {
          await send(chat, statsText(own, peer, `🗓 Kunlik hisobot · ${today}`));
          report = today;
        }
        saveDash(chat, { message_id: mid, text, report_day: report });
      } catch {
        /* keyingi safar qayta urinamiz */
      }
    }
  }

  return { handle, notifyReceipt, notifyDecision, notifyReview, notifyAdmins, refreshDashboard };
}

// ---------- Telegram API + polling ----------

export type Bot = ReturnType<typeof createBot>;
let active: Bot | null = null;
let username = env('TELEGRAM_BOT_USERNAME').replace(/^@/, '');
/** Ishlayotgan bot (token bo'lmasa null). */
export const bot = () => active;
/** Bot username (getMe orqali aniqlanadi). */
export const botUsername = () => (active ? username || null : null);

export function startBot(token = env('TELEGRAM_BOT_TOKEN')): Bot | null {
  if (!token) return null;
  const base = `https://api.telegram.org/bot${token}`;
  const tg: Tg = async (method, body) => {
    const form = body.__form as FormData | undefined;
    const res = await fetch(`${base}/${method}`, form ? { method: 'POST', body: form, signal: AbortSignal.timeout(30_000) } : {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(method === 'getUpdates' ? 65_000 : 15_000),
    });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: unknown; description?: string; error_code?: number };
    if (!j.ok) throw Object.assign(new Error(j.description || `telegram ${res.status}`), { code: j.error_code ?? res.status });
    return j.result;
  };
  const download = async (fileId: string) => {
    const f = (await tg('getFile', { file_id: fileId })) as { file_path?: string; file_size?: number };
    if (!f.file_path || (f.file_size ?? 0) > 3_000_000) return null;
    const r = await fetch(`https://api.telegram.org/file/bot${token}/${f.file_path}`, { signal: AbortSignal.timeout(20_000) });
    if (!r.ok) return null;
    return { mime: r.headers.get('content-type') || 'image/jpeg', data: Buffer.from(await r.arrayBuffer()) };
  };
  active = createBot(tg, download);
  const b = active;

  void (async () => {
    await tg('deleteWebhook', {}).catch(() => {});
    const me = (await tg('getMe', {}).catch(() => null)) as { username?: string } | null;
    if (me?.username) username = me.username;
    const url = appUrl();
    await tg('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Go Topic App 🚀', web_app: { url } } }).catch(() => {});
    await tg('setMyShortDescription', { short_description: "GoTopic — koreys tilini o'yin tariqasida o'rganing 🇰🇷 TOPIK 1→6. Hori AI ustoz — Super'da 🐯" }).catch(() => {});
    const methods = [providers().includes('payme') && 'Payme', providers().includes('click') && 'Click', providers().includes('card') && 'karta'].filter(Boolean) as string[];
    const pay = providers().includes('visa') ? (methods.length ? `${methods.join(', ')} yoki Visa` : 'Visa') : methods.join(' yoki ') || 'karta';
    await tg('setMyDescription', { description: `🇰🇷 GoTopic — koreys tilini o'zbek tilida o'rganing.\n\n🗺 O'yin tariqasida darslar TOPIK 1→6 — bepul\n📖 30 000 so'zlik lug'at — so'zni shu botga yozing\n📝 TOPIK mashqlari: grammatika, o'qish, tinglash\n🏆 Haftalik turnir va kunlik seriya\n🐯 Hori AI va Gemini Live — Super obunada\n💎 Super: 1 hafta, 1 oy yoki 3 oy — ${pay}\n📸 Instagram: @gotopic.uz\n\nBoshlash uchun «Start» ni bosing 👇` }).catch(() => {});
    await tg('setMyCommands', { commands: [{ command: 'start', description: '🚀 Boshlash va ilovaga kirish' }, { command: 'lugat', description: "📖 Lug'at: so'z qidirish" }, { command: 'plans', description: '💎 Super tariflari' }, { command: 'me', description: '👤 Mening obunam' }, { command: 'menu', description: '⌨️ Menyu' }, { command: 'help', description: '❓ Yordam' }] }).catch(() => {});
    // Admin chatida qo'shimcha /stats buyrug'i va doimiy «📊 Statistika» tugmasi (boshqalar ko'rmaydi).
    for (const chat of adminChats()) {
      await tg('setMyCommands', { commands: [...[{ command: 'start', description: '🚀 Boshlash va ilovaga kirish' }, { command: 'lugat', description: "📖 Lug'at: so'z qidirish" }, { command: 'plans', description: '💎 Super tariflari' }, { command: 'me', description: '👤 Mening obunam' }, { command: 'menu', description: '⌨️ Menyu' }, { command: 'help', description: '❓ Yordam' }], { command: 'stats', description: '📊 Statistika (admin)' }], scope: { type: 'chat', chat_id: chat } }).catch(() => {});
      if (!dashOf(chat)?.message_id) await tg('sendMessage', { chat_id: chat, text: '🔐 Admin paneli: «📊 Statistika» tugmasini bosing — hozirgi statistika keladi.', reply_markup: menuKb(true) }).catch(() => {});
    }
    let offset = 0;
    for (;;) {
      try {
        const ups = (await tg('getUpdates', { offset, timeout: 50, allowed_updates: ['message', 'callback_query', 'inline_query'] })) as { update_id: number }[];
        for (const u of ups) {
          offset = u.update_id + 1;
          await b.handle(u);
        }
      } catch (e) {
        // 409: deploy paytida eski nusxa hali ishlayapti — kutamiz.
        await new Promise((r) => setTimeout(r, (e as { code?: number }).code === 409 ? 5000 : 3000));
      }
    }
  })();
  // Admin statistikasi: ishga tushgandan 20 s keyin, so'ng har 5 daqiqada.
  setTimeout(() => void b.refreshDashboard().catch(() => {}), 20_000);
  setInterval(() => void b.refreshDashboard().catch(() => {}), 5 * 60_000).unref?.();
  console.log('Telegram bot ishga tushdi');
  return b;
}
