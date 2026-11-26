// Voilà Telegram to'lov boti: tariflar → karta raqami → chek (rasm/PDF) → admin ✅/❌ → Super faollashadi.
// Long polling (webhook shart emas). Faqat TELEGRAM_BOT_TOKEN bo'lsa ishga tushadi.
// Hisob bog'lash: ilovadagi «Telegram orqali to'lash» → t.me/<bot>?start=pay_<kod> (kod 30 daqiqa amal qiladi).
// Kodsiz kirgan foydalanuvchi uchun Telegram hisobi ochiladi (ilovaga «Telegram bilan kirish» orqali shu hisob bilan kiradi).
import { randomBytes } from 'node:crypto';
import { db } from './db.ts';
import { decideReview } from './social.ts';
import { getUser, upsertSocialUser } from './accounts.ts';
import { cardBrand, groupCardNumber } from '../src/shared/card.ts';
import { PLANS, activePlan, toUsd, usdRate, createCardOrder, createOrder, decideOrder, oldPriceUzs, onGrant, plansPayload, priceUzs, providers, visiblePlans, type PlanId } from './billing.ts';

type Tg = (method: string, body: Record<string, unknown>) => Promise<any>;
type From = { id: number; first_name?: string; last_name?: string; username?: string };

const env = (k: string) => (process.env[k] ?? '').trim();
const som = (n: number) => n.toLocaleString('ru-RU').replace(/ /g, ' ');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const appUrl = () => env('PUBLIC_URL') || 'https://voila-fr.up.railway.app';

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
    [{ text: '👤 Mening obunam', callback_data: 'me' }],
  ],
});

/** Kutib olish xabari: og'riqli nuqtalar → yechim → narx → ikki tugma. */
function welcomeText(name: string): string {
  return [
    `Assalomu alaykum, <b>${esc(name)}</b>! 👋`,
    "",
    "Fransuz tilini oylab o'rgansangiz ham, nega hali erkin gapira olmaysiz? 🤔",
    "",
    "Ko'pchilik til o'rganishda eng qimmatli narsasi — <b>VAQTINI</b> yo'qotadi:",
    "❌ Grammatika jadvallarini quruq yodlash bilan soatlab vaqt ketadi;",
    "❌ Yodlangan so'zlar 3 kunda unutiladi, chunki amaliyotda ishlatilmaydi;",
    "❌ Gapirishga kelganda esa sherik yo'q yoki xato qilishdan qo'rquv to'sqinlik qiladi.",
    "",
    "Bizning maqsadimiz — <b>fransuz tilini qiziqarli va vaqtingizni tejaydigan qilish!</b> 🚀",
    "",
    "<b>Voilà!</b> da hammasi yangicha ishlaydi:",
    "",
    "🗺 <b>1. O'yin tariqasidagi darslar — bepul</b>",
    "A1 dan C2 gacha 50 ta liniya: pastdan tepaga boriladigan xarita, yulduzlar, Sirli qutilar, mashq va diktant — so'zlar o'zi yodda qoladi.",
    "",
    "🏆 <b>2. Haftalik turnir</b>",
    "20 kishilik guruhlarda XP yig'ing: Kurtak ligasidan Afsonagacha ko'tariling, kunlik seriyani uzmang 🔥",
    "",
    "🐱 <b>3. Vivi AI — jonli ustoz (Super)</b>",
    "Vivi bilan istalgan mavzuda ovozli va matnli gaplashasiz, Gemini Live'da real vaqtda. U xatolaringizni hazil bilan (ba'zan qattiq 😼) to'g'rilaydi.",
    "",
    "🎭 <b>4. Har xil xarakterlar</b>",
    "Romantik Vivi 💘, qattiqqo'l Professor, hazilkash yoki 18+ «bezori» Vivi — kim bilan o'rganishni o'zingiz tanlaysiz.",
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
    '💎 <b>Voilà Super</b> — fransuz tilini Vivi bilan cheksiz o\'rgan!',
    '',
    '🐱 Vivi AI — faqat Super\'da: ovozli va matnli suhbat, xatolar tahlili',
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
      ? `🎉 <b>To'lov tasdiqlandi!</b>\n💎 Super faollashdi — ${esc(meText(userId).split('\n').slice(2).join(' '))}\n\nIlovani oching: Vivi AI, Gemini Live va cheksiz baliqcha endi siz uchun ochiq!`
      : "❌ Chek tasdiqlanmadi. Summa yoki chek noto'g'ri bo'lishi mumkin. Savol bo'lsa shu yerga yozing.";
    const extra = { reply_markup: approve ? { inline_keyboard: [[{ text: '📱 Ilovani ochish', url: appUrl() }]] } : mainKb() };
    if (!approve) return void (await send(chat, text, extra).catch(() => {}));
    // Ilovadagi «Confetti → burst» ning Telegram'dagi muqobili: xabar 🎉 effekti bilan keladi.
    // Effekt qo'llab-quvvatlanmasa — oddiy xabar.
    await send(chat, text, { ...extra, message_effect_id: CONFETTI_EFFECT_ID }).catch(() => send(chat, text, extra).catch(() => {}));
  }

  async function onMessage(msg: any) {
    const chat = String(msg.chat.id);
    if (msg.chat.type !== 'private') return;
    const from: From = msg.from;
    const text: string = msg.text ?? '';

    if (text.startsWith('/start')) {
      const arg = text.split(/\s+/)[1] ?? '';
      let uid: string | null = null;
      if (arg.startsWith('pay_')) uid = linkByCode(arg.slice(4), String(from.id));
      const linked = !!uid;
      uid ??= userOf(from);
      const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || "do'stim";
      if (linked) await send(chat, "✅ Ilovadagi hisobingiz botga bog'landi.");
      if (arg.startsWith('pay_') || arg === 'plans') return send(chat, plansText(), { reply_markup: plansKb() });
      await send(chat, welcomeText(name), { reply_markup: mainKb() });
      return;
    }
    if (text === '/plans' || text === '/tariflar') return send(chat, plansText(), { reply_markup: plansKb() });
    if (text === '/id' || text === '/myid') return send(chat, `Sizning chat ID: <code>${chat}</code>`);
    if (text === '/me') return send(chat, meText(userOf(from)), { reply_markup: mainKb() });

    const file = msg.photo?.length ? { id: msg.photo[msg.photo.length - 1].file_id, mime: 'image/jpeg' } : msg.document ? { id: msg.document.file_id, mime: msg.document.mime_type || '' } : null;
    if (file) {
      const st = planOf(chat);
      if (!st) return send(chat, '📸 Chekni yuborishdan oldin tarifni tanlang 👇', { reply_markup: plansKb() });
      if (!/^(image\/(png|jpe?g|webp|heic)|application\/pdf)$/.test(file.mime)) return send(chat, '⚠️ Chekni rasm yoki PDF ko\'rinishida yuboring.');
      // Ilovadagi yuklash zonasi kabi: bitta xabar bosqichma-bosqich yangilanadi (▰▱▱ → ▰▰▱ → ✅).
      void tg('sendChatAction', { chat_id: chat, action: 'upload_photo' }).catch(() => {});
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
      await update(`✅ Chek qabul qilindi (#${r.id}) ${bar(3)}\n⏱ Admin tekshirgach, Super avtomatik yoqiladi va sizga xabar beraman.`);
      const who = [from.first_name, from.last_name].filter(Boolean).join(' ') + (from.username ? ` @${from.username}` : '') + ` (tg ${from.id})`;
      await notifyReceipt(r.id, r.plan, r.amountUzs, `${who}${st.kind === 'visa' ? ' · VISA' : ''}`, receipt);
      return;
    }
    return send(chat, 'Quyidagi tugmalardan foydalaning 👇', { reply_markup: mainKb() });
  }

  async function onCallback(q: any) {
    const chat = String(q.message?.chat?.id ?? q.from.id);
    const data: string = q.data ?? '';
    const ack = (text = '', alert = false) => tg('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: alert }).catch(() => {});

    if (data === 'plans') return ack(), send(chat, plansText(), { reply_markup: plansKb() });
    if (data === 'home') return ack(), send(chat, 'Asosiy menyu 👇', { reply_markup: mainKb() });
    if (data === 'me') return ack(), send(chat, meText(userOf(q.from)), { reply_markup: mainKb() });
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

  async function handle(update: any) {
    try {
      if (update.message) await onMessage(update.message);
      else if (update.callback_query) await onCallback(update.callback_query);
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

  return { handle, notifyReceipt, notifyDecision, notifyReview, notifyAdmins };
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
    await tg('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Voilà App 🚀', web_app: { url } } }).catch(() => {});
    await tg('setMyShortDescription', { short_description: "Voilà! — fransuz tilini o'yin tariqasida o'rganing 🇫🇷 A1→C2. Vivi AI ustoz — Super'da 🐱" }).catch(() => {});
    await tg('setMyDescription', { description: "🇫🇷 Voilà! — fransuz tilini o'zbek tilida o'rganing.\n\n🗺 O'yin tariqasida darslar A1→C2 — bepul\n🏆 Haftalik turnir va kunlik seriya\n🐱 Vivi AI va Gemini Live — Super obunada\n💎 Super: 1 hafta, 1 oy yoki 3 oy — Payme, Click, karta yoki Visa\n\nBoshlash uchun «Start» ni bosing 👇" }).catch(() => {});
    await tg('setMyCommands', { commands: [{ command: 'start', description: 'Boshlash' }, { command: 'plans', description: '💎 Super tariflari' }, { command: 'me', description: 'Mening obunam' }] }).catch(() => {});
    let offset = 0;
    for (;;) {
      try {
        const ups = (await tg('getUpdates', { offset, timeout: 50, allowed_updates: ['message', 'callback_query'] })) as { update_id: number }[];
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
  console.log('Telegram bot ishga tushdi');
  return b;
}
