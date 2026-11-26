# Go Topic — Koreys tili o'zbekcha

Koreys tilini o'zbek tilida so'zlashuvchilar uchun o'rgatadigan, o'yin elementlari bor PWA ilova (React + Vite + Node).
Maskot — **Hori**, oq Amur yo'lbarschasi (호랑이 — Koreyaning ramzi). Ilova Voilà! (fransuz tili) platformasining 1:1
nusxasi asosida qurilgan va eski Go Topic'ning barcha o'quv boyliklari ko'chirilgan.

## Imkoniyatlar

- **Kurs (Hangul → TOPIK 6):** 35 bo'lim, 88 dars, 470 so'z, 264 koreyscha gap (Hangul + romanizatsiya + o'zbekcha),
  har bo'limda qo'llanma kartalari. Darajalar interfeysda TOPIK 1–6 (ichki kod A1–C2). Darajadan sakrash testi.
  Manba: `legacy/public/catalog.json` + `scripts/korean-course-data.py` → `python3 scripts/build-korean-course.py`.
- **Lug'at — 30 000 so'z:** Wiktionary/Kaikki.org (CC BY-SA 4.0), o'zbekcha AI izohlar bilan; serverda qidiruv
  (Hangul, o'zbekcha, inglizcha), turkum filtri, sahifalash, eng ko'p ishlatiladigan so'zlar birinchi (`GET /api/dict`).
- **TOPIK mashqlari:** 96 grammatika savoli (10 kategoriya, izohlar bilan), o'qish va tinglash matnlari savollari bilan.
- **Darslar xaritasi:** pastdan tepaga ilon izi yo'l, yulduzlar, Sirli qutilar, hozirgi darsga «pastga» tugmasi.
- **Hori AI ustoz (Super):** matnli va ovozli suhbat, Gemini Live, xarakterlar, Seul kafesi / Myeongdong do'koni /
  TOPIK gapirish mashqi kabi rollar; Hangul imlosi, kelishiklar va hurmat shakllarini tekshiradi.
- **O'yin elementlari:** XP, seriya, baliqcha «jonlar», tangalar, haftalik 20 kishilik turnir (Kurtak → Afsona), do'kon.
- **To'lov:** Super obuna (Payme, Click, karta/Visa chek orqali), Telegram bot.
- **12 interfeys tili**, kunduzgi/tungi rejim, PIN qulf, liquid glass dizayn, yengil rejim.

## Tuzilma

- `src/` — ilova; `server/` — Node server (SQLite, AI, to'lov, bot); `content/dictionary/` — lug'at ma'lumotlari.
- `legacy/` — eski Go Topic ilovasi (vanilla JS + Express + MySQL + Android TWA) **o'zgarishsiz** saqlangan.

## Ishga tushirish

```sh
npm ci
npm run dev        # ishlab chiqish
npm run build && node server/main.ts   # production
npx vitest run     # testlar
```

Sozlamalar `.env.example` da (Gemini kaliti, Telegram bot tokeni, to'lov kartalari, admin ID). Kalitlar Git'ga
qo'yilmaydi — faqat hosting (Railway) environment'ida.

## Tarjimalar

Interfeys matnlari `src/i18n/locales/*.json` da. Yangi matnlar:
`node scripts/i18n-extract.mjs && node scripts/i18n-translate.mjs` (Gemini kaliti kerak).
