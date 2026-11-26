# Voilà! — Fransuz tili o'zbekcha

Fransuz tilini o'zbek tilida so'zlashuvchilar uchun o'rgatadigan, o'yin elementlari bor (gamifikatsiyalangan) PWA ilova.
Nomi, maskoti (Vivi — yoqimtoy parijlik mushukcha), dizayni va kurs mazmuni original. To'g'ri javobda Vivi «Voilà !» deb sehr ko'rsatadi.

## Imkoniyatlar

- **Kurs (A1 → C2):** 50 ta bo'lim, CEFR darajalari bo'yicha (A1, A2, B1, B2, C1, C2), har birida grammatika
  qo'llanmasi. Dastlabki 6 bo'lim qo'lda yozilgan, qolganlari `src/data/course-ext.ts` (o'quv reja + AI yaratish +
  AI muharrir tekshiruvi + avtomatik tozalash). Darajadan sakrash testi (15 savol, ≤3 xato).
- **Qiyinlashib boruvchi mashqlar:** yuqori darajalarda bo'sh joyni to'ldirish (fe'l shakllari), diktant
  (eshitib to'liq yozish) va ko'proq erkin tarjima.
- **Mashq turlari:** so'z tanlash (rasmli), juftliklar, so'z banki (fr→uz va uz→fr), tinglab yozish,
  to'g'ri tarjimani tanlash, erkin yozish (urg'u klaviaturasi bilan). So'z ustiga bossangiz, tarjimasi chiqadi.
- **Javob tekshirish:** muqobil tarjimalar, o'zbekcha apostrof variantlari (o' / oʻ / o‘), urg'u belgisiz yozilgan javob
  va kichik harf xatolari izoh bilan qabul qilinadi.
- **Vivi ustoz (AI):** o'zbekcha ravon va hazil bilan gaplashadigan fransuz tili ustozi (Gemini).
  O'quvchining o'tgan darslari, biladigan so'zlari va xatolarini biladi; 5 stsenariy (erkin suhbat, Parij kafesi,
  tanishuv, grammatika, xatolar tahlili); fransuzcha iboralar bosilganda talaffuz qilinadi; mikrofon (uz/fr); oqimli javob.
- **Vivi AI — jonli ovozli suhbat:** Vivini (yoki Space) bosib turib gapirish yoki qo'lsiz rejim (ovoz faolligini
  aniqlash, Vivi gapirayotganda gapini bo'lish). Javob gap-gap bo'lib ovozlanadi (birinchi gap tayyor bo'lishi bilan),
  keyingi gap ovozi oldindan yuklanadi. Vivi 15 xil shaklga kiradi va 8 xil imo-ishora qiladi (javobdagi belgilar
  bo'yicha). 4 xarakter (Klassik, Professor — rozilik bilan, Mehribon, Hazilkash), 8 tayyor rol + o'z rolingiz,
  tushuntirish tili (uz/ru/en), ovoz tanlash, subtitrlar, suhbat matni, sessiya taymeri va "Vivi dam olyapti" tanaffusi,
  oxirgi 10 ta replika xotirasi. Suhbatdan keyin tahlil: so'z/gap/gapirish vaqti/turli so'zlar, shaxsiy rekordlar,
  kuchli va zaif tomonlar, yangi so'zlarni takrorlash tizimiga qo'shish.
- **O'yin elementlari:** ball, kunlik maqsad, quyosh seriyasi (soyabon bilan), kofe ☕ (xato qilinsa kamayadi,
  30 daqiqada bitta chashka tayyorlanadi), tangalar 🪙, sovg'a bekatlari, Fransiya shaharlari bo'ylab haftalik turnir
  (Ruandan Parijgacha), 15 ta yutuq.
- **Dizayn:** GoTopic ranglari (to'q siyoh-ko'k fon, feruza → indigo → binafsha gradient) va "liquid glass"
  uslubi: shishasimon xira kartalar, yorug' chegaralar, aurora fon. Kuchsiz telefonlar uchun "Yengil rejim"
  (Profil) — blur o'chadi, animatsiyalar kamayadi, ilova qotmaydi.
- **Hisoblar:** Google bilan kirish (veb — Google Identity Services, Android — Credential Manager), email + parol,
  yoki mehmon sifatida. Progress serverga sinxronlanadi va istalgan qurilmada davom etadi. Hisobni o'chirish.
- **Super obunasi:** oylik / yillik, Payme va Click orqali. Cheksiz kofe, reklamasiz, Vivi bilan 30 daqiqalik
  suhbatlar tanaffussiz, seriyani bepul tiklash, har oy bepul soyabon.
- **Reklama:** Android ilovada AdMob (banner, interstitial, mukofotli video), vebda AdSense. Darsda, qo'ng'iroqda
  va Super a'zolarida reklama ko'rsatilmaydi. Sozlamalar: `public/ads-config.js`, `public/app-ads.txt`.
- **Kunlik vazifalar, 2x ball kuchaytirgichi, seriyani tiklash.**
- **Huquqiy sahifalar:** `privacy.html`, `terms.html` (Play Market va AdMob talab qiladi).
- **Takrorlash:** so'z kuchi vaqt o'tishi bilan susayadi (spaced repetition); "Aqlli takrorlash",
  "Xatolar ustida ishlash" va "Tinglash" mashqlari.
- **Talaffuz:** brauzerning fransuzcha ovozi (Web Speech API), sekin tinglash rejimi.
- **PWA:** telefonga o'rnatiladi, internetsiz ishlaydi; qorong'i rejim; mobil va kompyuter uchun moslashgan.
- Progress qurilmada saqlanadi (`localStorage`); hisob ochilsa — serverda ham (SQLite).

## Ishga tushirish

```bash
# repo ildizida:
npm install
npm test                                  # dvigatel, kurs mazmuni va AI server testlari
npm run build                             # dist/
GEMINI_API_KEY=... npm start              # http://localhost:8787 — ilova + AI ustoz
```

Ishlab chiqishda: bir terminalda `GEMINI_API_KEY=... npm run server`, ikkinchisida `npm run dev`
(Vite `/api` so'rovlarini 8787-portga yo'naltiradi). Kalitsiz ham ilova to'liq ishlaydi — faqat Ustoz bo'limi
"server sozlanmagan" deb javob beradi.

### Server sozlamalari (muhit o'zgaruvchilari)

| O'zgaruvchi | Standart | Ma'nosi |
|---|---|---|
| `GEMINI_API_KEY` | — | Google AI Studio kaliti (faqat serverda saqlanadi, brauzerga chiqmaydi) |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Model (eng tez: birinchi so'z ~0,55 s) |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.1-flash-lite` | Zaxira model (asosiysi 5xx qaytarsa) |
| `PORT` | `8787` | Port |
| `TUTOR_PER_MINUTE` / `TUTOR_PER_DAY` | `8` / `150` | Bitta IP uchun limitlar |
| `TUTOR_CONCURRENCY` | `8` | Bir vaqtdagi AI so'rovlar |
| `TRUST_PROXY` | — | `1` — reverse proxy ortida `X-Forwarded-For` ga ishonish |
| `ALLOWED_ORIGINS` | — | Boshqa domendan so'rovga ruxsat (vergul bilan) |
| `ELEVENLABS_API_KEY` | — | Tabiiy ovoz (o'zbekcha ham). Bo'lmasa — qurilmadagi brauzer ovozi |
| `ELEVENLABS_VOICES` | — | `Nomi:voiceId` ro'yxati, masalan `Vivi:abc123,Professor:def456` |
| `ELEVENLABS_MODEL_ID` | `eleven_v4` | o'zbek tilini qo'llaydi (v3 qo'llamaydi) |
| `VOICE_SESSION_MINUTES` / `VOICE_COOLDOWN_MINUTES` | `10` / `20` | Sessiya uzunligi va undan keyingi tanaffus |
| `TTS_CHARS_PER_DAY` | `12000` | Bitta IP uchun kunlik ovoz belgilari |
| `STT_PER_MINUTE` / `TTS_PER_MINUTE` / `FEEDBACK_PER_DAY` | `20` / `60` / `40` | Ovoz yo'nalishlari limitlari |
| `VOICE_SESSION_MINUTES_SUPER` | `30` | Super a'zolari uchun sessiya (tanaffussiz) |
| `GEMINI_HEDGE_MS` | `1500` | Birinchi so'z kechiksa parallel zaxira so'rov |
| `SESSION_SECRET` | avtomatik | Sessiya imzosi (bo'sh bo'lsa `data/` da yaratiladi) |
| `SALUT_DATA_DIR` | `data` | SQLite bazasi papkasi (doimiy disk) |
| `GOOGLE_CLIENT_ID` | — | Google OAuth Web client ID (vergul bilan bir nechta) |
| `PUBLIC_ORIGIN` | — | Ochiq manzil, masalan `https://salut.uz` |
| `PRICE_UZS_MONTH` / `PRICE_UZS_YEAR` | `49000` / `399000` | Narxlar (so'm) |
| `PAYME_MERCHANT_ID` / `PAYME_KEY` / `PAYME_TEST` | — | Payme kassa; `PAYME_TEST=1` — test |
| `CLICK_SERVICE_ID` / `CLICK_MERCHANT_ID` / `CLICK_SECRET_KEY` | — | Click Merchant |

### Bepul rejim

- Gemini limiti (429) tugasa, Vivi avtomatik ravishda navbatdagi modelga o'tadi (`GEMINI_ROTATION`); barchasi tugasa —
  ixtiyoriy zaxira xizmatga (`FALLBACK_LLM_*`, OpenAI bilan mos API).
- Bepul foydalanuvchilar: kuniga `FREE_MESSAGES_PER_DAY` ta AI xabar va `FREE_VOICE_MINUTES` daqiqalik ovozli suhbat,
  ovoz — Gemini TTS. Super: cheksiz, Dilzoda ovozi (ElevenLabs), uzun sessiyalar.

### To'lov tizimlarini ulash

- **Payme:** Payme Business kabinetida kassa yarating, endpoint: `https://<domen>/api/billing/payme`.
  `PAYME_MERCHANT_ID` va `PAYME_KEY` (test uchun test kaliti va `PAYME_TEST=1`) ni kiriting.
- **Click:** Click Merchant'da xizmat yarating. Prepare URL: `https://<domen>/api/billing/click/prepare`,
  Complete URL: `https://<domen>/api/billing/click/complete`.
- Kalitlar kiritilmasa, obuna sahifasida "To'lov tizimi tez orada ulanadi" deb chiqadi — ilova ishlashda davom etadi.

### Android ilova (APK / AAB)

`android/` — ilovani WebView'da ochadigan qobiq (AdMob va Google kirish ko'priklari bilan). Yig'ish GitHub Actions'da:
**Actions → "Salut Android APK" → Run workflow**, `start_url` ga ilova manzilini yozing. AdMob App ID ni
repo Secrets'ga `SALUT_ADMOB_APP_ID` nomi bilan qo'shing. Reklama bloklari ID'lari — `public/ads-config.js`.

Nutqni aniqlash: brauzerning o'zi (Chrome/Edge/Safari) ishlatiladi. Brauzer ishlamasa yoki jim qolsa, o'sha replika
yozuvi avtomatik ravishda Gemini orqali aniqlanadi (`/api/stt`), shuning uchun hech bir gap yo'qolmaydi.

## Tuzilma

```
server/tutor.ts         Vivi personasi, prompt, kiruvchi ma'lumot tekshiruvi, Gemini SSE oqimi
server/voice.ts         STT (Gemini audio), TTS (ElevenLabs proksi), suhbat tahlili
server/main.ts          HTTP server: statik fayllar + barcha /api yo'nalishlari (limitlar, xatolar)
server/accounts.ts      hisoblar: scrypt parol, imzolangan sessiya, Google ID token tekshiruvi, progress
server/billing.ts       Super: Payme (JSON-RPC) va Click (prepare/complete) to'lovlari
server/db.ts            SQLite (node:sqlite) jadvallari
src/data/course.ts      kurs mazmuni (so'zlar, gaplar, qo'llanmalar)
src/engine/             sof mantiq: mashq generatori, tekshiruv, o'yin qoidalari, SRS, ovoz
src/engine/voice/       ovozli suhbat: mikrofon+VAD, STT, TTS navbati, belgilar, boshqaruvchi (call.ts)
src/state/store.tsx     global holat + saqlash
src/screens/            ekranlar (O'rganish, Dars, Natija, Mashq, Liga, Do'kon, Profil, Onboarding)
src/components/         mashq komponentlari, maskot, konfetti
```

Yangi dars qo'shish uchun `course.ts` dagi kerakli bo'limga `words` va `sentences` qo'shing.
Testlar har bir gapni so'z bankidan yig'ish mumkinligini avtomatik tekshiradi.
