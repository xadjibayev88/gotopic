# To'lovlar va tariflar

| Tarif | Narx | Muddat | Nima beradi |
|---|---|---|---|
| Pro | 10 $ (≈ `PRICE_UZS_PRO` so'm) | 30 kun | AI ustoz kunlik limiti `AI_DAILY_LIMIT_PRO` (standart 400, bepulda 80), reklamasiz |
| Topic | 99 $ (≈ `PRICE_UZS_TOPIC` so'm) | 365 kun | Pro'dagi hammasi, 12 oy |

Obuna avtomatik yechilmaydi: to'lov muddatni uzaytiradi, tugaganda bepul tarifga qaytadi. Kod: `server/billing.ts`, sahifa: `public/billing.js` (`#tariflar`).

## Ishga tushirish
1. `pnpm migrate` — `billing_orders` va `subscriptions` jadvallari (migratsiya `100_billing`).
2. Manus Secrets'ga kerakli provayder kalitlarini kiriting (`.env.example`ga qarang). Kaliti yo'q provayder sahifada ko'rinmaydi.
3. `PUBLIC_ORIGIN` haqiqiy sayt manziliga teng bo'lsin (to'lovdan keyin qaytish shu manzilga).

## Payme (Uzcard, Humo; Visa — merchant shartnomasida yoqilsa)
- business.payme.uz da kassa oching (YaTT yoki MChJ kerak).
- Endpoint: `https://SAYT/api/billing/hooks/payme`; hisob maydoni: `order_id`.
- `PAYME_MERCHANT_ID` — kassa ID, `PAYME_KEY` — kassa kaliti. Sinov: `PAYME_TEST=1` va test kaliti.

## Click (Uzcard, Humo; Visa — merchantda yoqilsa)
- merchant.click.uz da xizmat oching.
- Prepare URL: `https://SAYT/api/billing/hooks/click/prepare`, Complete URL: `https://SAYT/api/billing/hooks/click/complete`.
- `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET_KEY`.

## USDT TRC20
- `USDT_TRC20_ADDRESS` — egasining TRON hamyoni (T... bilan boshlanadi). Hamyonning maxfiy kaliti hech qachon serverga berilmaydi.
- Har bir buyurtmaga noyob summa (masalan 10.37 USDT) beriladi; TronGrid orqali tasdiqlangan o'tkazma aniq summa bilan topilsa tarif yoqiladi. Bir tranzaksiya faqat bir marta hisoblanadi.
- `TRONGRID_API_KEY` ixtiyoriy (trongrid.io, bepul) — ko'p so'rovda limitdan qochish uchun.

## Google Play
Play'dan o'rnatilgan ilovada raqamli obunani faqat Google Play Billing orqali sotish mumkin. Shuning uchun Android ilovada narxlar va tashqi to'lov tugmalari ko'rsatilmaydi; saytda sotib olgan foydalanuvchi ilovada hisobiga kirsa, tarifi ishlaydi. Play ichida sotish uchun keyinroq Play Billing qo'shiladi (Play Console kerak).

# Navbat (waitlist) va tillar
- Sahifa: `/waitlist.html` (uz/ru/en, 22-dekabrgacha sanoq). Instagram uchun havola: `/waitlist.html?s=instagram` (manba hisobga olinadi).
- Ro'yxatni yuklab olish (admin): `/api/admin/waitlist.csv` — `ADMIN_OPEN_IDS` ga kirgan hisob bilan.
- Ilova tili: menyuda til tanlash (O'zbekcha / Русский / English). AI ustoz tarjima va izohlarni tanlangan tilda beradi; lug'atda rus va ingliz tilida inglizcha Wiktionary ma'nosi ko'rsatiladi. Grammatika izohlari va AI yaratgan mashqlar hozircha o'zbekcha.
