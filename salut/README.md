# Salut! — Fransuz tili o'zbekcha

Fransuz tilini o'zbek tilida so'zlashuvchilar uchun o'rgatadigan, o'yin elementlari bor (gamifikatsiyalangan) PWA ilova.
Nomi, maskoti (Krua — beretli kruasan), dizayni va kurs mazmuni original.

## Imkoniyatlar

- **Kurs (A1):** 6 bo'lim, 20 dars, ~120 so'z, ~95 gap. Har bir bo'lim uchun grammatika qo'llanmasi va lug'at.
- **Mashq turlari:** so'z tanlash (rasmli), juftliklar, so'z banki (fr→uz va uz→fr), tinglab yozish,
  to'g'ri tarjimani tanlash, erkin yozish (urg'u klaviaturasi bilan). So'z ustiga bossangiz, tarjimasi chiqadi.
- **Javob tekshirish:** muqobil tarjimalar, o'zbekcha apostrof variantlari (o' / oʻ / o‘), urg'u belgisiz yozilgan javob
  va kichik harf xatolari izoh bilan qabul qilinadi.
- **Gamifikatsiya:** XP, kunlik maqsad, streak (muzlatgich bilan), yuraklar (30 daqiqada bittadan tiklanadi),
  olmoslar, sandiqlar, 10 bosqichli haftalik liga (ko'tarilish/tushish), 13 ta yutuq.
- **Takrorlash:** so'z kuchi vaqt o'tishi bilan susayadi (spaced repetition); "Aqlli takrorlash",
  "Xatolar ustida ishlash" va "Tinglash" mashqlari.
- **Talaffuz:** brauzerning fransuzcha ovozi (Web Speech API), sekin tinglash rejimi.
- **PWA:** telefonga o'rnatiladi, internetsiz ishlaydi; qorong'i rejim; mobil va kompyuter uchun moslashgan.
- Progress qurilmada saqlanadi (`localStorage`), server shart emas.

## Ishga tushirish

```bash
cd salut
npm install
npm run dev       # http://localhost:5173
npm test          # dvigatel va kurs mazmuni testlari
npm run build     # dist/ — istalgan statik hostingga joylash mumkin
```

## Tuzilma

```
src/data/course.ts      kurs mazmuni (so'zlar, gaplar, qo'llanmalar)
src/engine/             sof mantiq: mashq generatori, tekshiruv, o'yin qoidalari, SRS, ovoz
src/state/store.tsx     global holat + saqlash
src/screens/            ekranlar (O'rganish, Dars, Natija, Mashq, Liga, Do'kon, Profil, Onboarding)
src/components/         mashq komponentlari, maskot, konfetti
```

Yangi dars qo'shish uchun `course.ts` dagi kerakli bo'limga `words` va `sentences` qo'shing.
Testlar har bir gapni so'z bankidan yig'ish mumkinligini avtomatik tekshiradi.
