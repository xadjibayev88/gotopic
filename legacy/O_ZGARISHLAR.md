# 2026-11-13 tuzatishlari

1. **Yozish maydoni** (`public/index.html`, `public/premium.css`)
   - Bir qatorli maydon o'rniga o'zi kengayadigan maydon: matn ko'payganda balandligi ekranning 32 foizigacha o'sadi, keyin ichida aylanadi.
   - Telefonda yozishni boshlaganda maydon butun qatorni egallaydi, tugmalar pastki qatorga tushadi.
   - Panel pastki menyu ustida turadi (oldin ustiga chiqib, uni yopib qo'yardi), foni shaffof emas.
   - "Yuborish" tugmasi ikonkaga aylandi; Enter yuboradi, Shift+Enter yangi qator.
   - Mikrofon bilan aytilgan gap ham maydonni kengaytiradi. Jonli suhbatdagi yozish maydoni ham shunday.
2. **Ovozli suhbatdagi sekinlik sababi** (`public/runtime-client.js`)
   - Qavslar tushib qolgani sababli har bir ovoz bo'lagi kelganda ekran qayta chizilardi (sekundiga o'nlab marta). Endi faqat matn kelganda yangilanadi.
3. **Qurilma ovozi tezroq** (`public/tutor-controller.js`)
   - Tabiiy ovoz ishlamaganda koreyscha javob to'liq kelishi bilanoq o'qila boshlaydi, tarjima va tuzatishlarni kutmaydi.

Server kodiga tegilmadi.

# 2026-11-13 (2) — daraja, liga, gapirish tugmasi

1. **Darajaga qarab murakkablashish**
   - Grammatika: har bir savolga daraja berildi (1: kelishiklar, bog'lama, zamonlar; 2: sanoq, bog'lovchilar, iltimos; 3–6: TOPIK 3–6). Daraja almashsa savollar va mavzu tugmalari almashadi.
   - Iboralar: daraja tugmalari qo'shildi; 3–6 darajalar uchun 32 ta yangi ibora (o'rta, rasmiy va ilmiy nutq).
   - AI ustoz (`server/tutor-session.ts`): har daraja uchun alohida grammatika va gap uzunligi (1-darajada 70, 6-darajada 240 belgigacha). Oldin har darajada "ikki qisqa gap" deb majburlangan edi. Birinchi xabar ham darajaga mos.
2. **Gapirish tugmasi** (jonli suhbat): AI endi o'zi tinglamaydi. Tugmani bosasiz → gapirasiz → yana bosasiz → 2 soniya ichida "Bekor qilish" mumkin, keyin yuboriladi. AI o'ylayotganda ham shu tugma bekor qiladi.
3. **Pastki menyu**: yangi SVG ikonkalar, faol bo'limda gradient, ko'tarilish va yulduzcha effekti.
4. **Daraja va haftalik liga** (`server/league.ts`, `/api/league`, migratsiya `090_weekly_league`): 6 liga (Bronza → Olmos), har hafta (dushanba, Toshkent vaqti) yuqori 20% keyingi ligaga chiqadi, pastki 20% tushadi. Sahifada daraja yo'li, liga, qolgan vaqt va reyting.

Nashrdan oldin: `pnpm migrate` (yangi jadval), keyin `pnpm test`. Testlar: 35 tadan 34 tasi o'tadi; "OAuth callback" testi asl kodda ham o'tmaydi (lokal OAuth sozlamasi yo'qligi sababli).

# 2026-11-13 (3) — AdSense tayyorgarligi

- `public/ads-config.js` — yagona sozlama: `client` (ca-pub-...) va ixtiyoriy `footerSlot`. Bo'sh bo'lsa reklama umuman yuklanmaydi.
- `public/ads.js` — AdSense skriptini faqat to'g'ri `client` bo'lganda yuklaydi; `footerSlot` berilsa footer ichida bitta reklama bloki chiqadi (dars, test va jonli suhbat ekranlari ichida reklama yo'q). Auto ads AdSense panelidan yoqiladi.
- `public/ads.txt` — namuna; tasdiqlangandan keyin pub raqami yoziladi.
- `public/privacy.html` — o'zbekcha maxfiylik siyosati (Gemini, ElevenLabs, AdSense, cookie, mikrofon). `[ELEKTRON POCHTA]` o'rniga aloqa manzilini yozing. Footerda havola bor.
- `public/sw.js` — yangi fayllar keshga qo'shildi, kesh versiyasi v7.

# 2026-11-13 (4) — Android ilova va AdMob

- `public/native-bridge.js` — Android ilovada (Capacitor) brauzerdagi ovozni tanish va ovoz chiqarish o'rniga telefonning o'z xizmatlari ishlaydi. Oddiy brauzerda hech narsa qilmaydi.
- `public/ads.js` — ilovada AdMob banneri (pastda, jonli suhbatda yashiriladi, Yevropa uchun rozilik oynasi), saytda AdSense. Ilova ichida AdSense ishlamaydi (qoidaga ko'ra).
- `public/ads-config.js` — yangi maydon `admobBanner`. Bo'sh bo'lsa ilovada Google'ning sinov banneri chiqadi.
- `public/premium.css` — ilovada pastki menyu va yozish paneli banner ustiga ko'tariladi.
- `public/sw.js` — kesh v8.
- Ilova kodi: github.com/xadjibayev88/hangeul-maktabi → `gotopik-app/`, yig'ish: Actions → "Go Topic APK (AdMob)".

# 2026-11-13 (5) — mukofotli video (AdMob)

- Android ilovada "Daraja va reyting" sahifasida "Video ko'ring — +20 XP" kartasi. Kuniga 5 ta. XP faqat video oxirigacha ko'rilganda beriladi.
- `ads-config.js` → `admobRewarded` (mukofotli video ID). Bo'sh bo'lsa Google sinov videosi.
- Saytda (brauzerda) bu karta ko'rinmaydi. APK'ni qayta yig'ish shart emas.
- Kesh v9.

# 2026-11-13 (6) — haqiqiy AdMob ID'lari

- `ads-config.js`: banner `ca-app-pub-2780590832331724/5710157407`, mukofotli video `ca-app-pub-2780590832331724/9280581802`.
- `public/app-ads.txt` — AdMob tasdiqlashi uchun (Publisher ID `pub-2780590832331724`).
- APK App ID: `ca-app-pub-2780590832331724~3171623975`. Kesh v10.
