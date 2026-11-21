# Salut! — Fransuz tili o'zbekcha

Fransuz tilini o'zbek tilida so'zlashuvchilar uchun o'rgatadigan, o'yin elementlari bor (gamifikatsiyalangan) PWA ilova.
Nomi, maskoti (Krua — beretli kruasan), dizayni va kurs mazmuni original.

## Imkoniyatlar

- **Kurs (A1):** 6 bo'lim, 20 dars, ~120 so'z, ~95 gap. Har bir bo'lim uchun grammatika qo'llanmasi va lug'at.
- **Mashq turlari:** so'z tanlash (rasmli), juftliklar, so'z banki (fr→uz va uz→fr), tinglab yozish,
  to'g'ri tarjimani tanlash, erkin yozish (urg'u klaviaturasi bilan). So'z ustiga bossangiz, tarjimasi chiqadi.
- **Javob tekshirish:** muqobil tarjimalar, o'zbekcha apostrof variantlari (o' / oʻ / o‘), urg'u belgisiz yozilgan javob
  va kichik harf xatolari izoh bilan qabul qilinadi.
- **Krua ustoz (AI):** o'zbekcha ravon va hazil bilan gaplashadigan fransuz tili ustozi (Gemini).
  O'quvchining o'tgan darslari, biladigan so'zlari va xatolarini biladi; 5 stsenariy (erkin suhbat, Parij kafesi,
  tanishuv, grammatika, xatolar tahlili); fransuzcha iboralar bosilganda talaffuz qilinadi; mikrofon (uz/fr); oqimli javob.
- **O'yin elementlari:** ball, kunlik maqsad, quyosh seriyasi (soyabon bilan), kofe ☕ (xato qilinsa kamayadi,
  30 daqiqada bitta chashka tayyorlanadi), tangalar 🪙, sovg'a bekatlari, Fransiya shaharlari bo'ylab haftalik turnir
  (Ruandan Parijgacha), 15 ta yutuq.
- **Dizayn:** o'ziga xos "Parij" uslubi — darslar yo'li Parij metrosi xaritasi ko'rinishida (bo'lim = liniya,
  dars = bekat), krem fon, siyoh-ko'k va marjon ranglar, Onest shrifti.
- **Takrorlash:** so'z kuchi vaqt o'tishi bilan susayadi (spaced repetition); "Aqlli takrorlash",
  "Xatolar ustida ishlash" va "Tinglash" mashqlari.
- **Talaffuz:** brauzerning fransuzcha ovozi (Web Speech API), sekin tinglash rejimi.
- **PWA:** telefonga o'rnatiladi, internetsiz ishlaydi; qorong'i rejim; mobil va kompyuter uchun moslashgan.
- Progress qurilmada saqlanadi (`localStorage`), server shart emas.

## Ishga tushirish

```bash
cd salut
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
| `GEMINI_MODEL` | `gemini-3.1-flash-lite` | Model |
| `PORT` | `8787` | Port |
| `TUTOR_PER_MINUTE` / `TUTOR_PER_DAY` | `8` / `150` | Bitta IP uchun limitlar |
| `TUTOR_CONCURRENCY` | `8` | Bir vaqtdagi AI so'rovlar |
| `TRUST_PROXY` | — | `1` — reverse proxy ortida `X-Forwarded-For` ga ishonish |
| `ALLOWED_ORIGINS` | — | Boshqa domendan so'rovga ruxsat (vergul bilan) |

## Tuzilma

```
server/tutor.ts         Krua personasi, prompt, kiruvchi ma'lumot tekshiruvi, Gemini SSE oqimi
server/main.ts          HTTP server: statik fayllar + /api/tutor (limitlar, xatolarni tushunarli qilish)
src/data/course.ts      kurs mazmuni (so'zlar, gaplar, qo'llanmalar)
src/engine/             sof mantiq: mashq generatori, tekshiruv, o'yin qoidalari, SRS, ovoz
src/state/store.tsx     global holat + saqlash
src/screens/            ekranlar (O'rganish, Dars, Natija, Mashq, Liga, Do'kon, Profil, Onboarding)
src/components/         mashq komponentlari, maskot, konfetti
```

Yangi dars qo'shish uchun `course.ts` dagi kerakli bo'limga `words` va `sentences` qo'shing.
Testlar har bir gapni so'z bankidan yig'ish mumkinligini avtomatik tekshiradi.
