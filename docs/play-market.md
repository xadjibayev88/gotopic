# Go Topic — Play Market'ga chiqarish

Ilova: `uz.gotopik.app` (Capacitor, AdMob banner + mukofotli video). Yig'ish: `xadjibayev88/hangeul-maktabi` → Actions → "Go Topic APK (AdMob)".

## 1. Bir martalik tayyorgarlik (egasi)

1. **Imzo kaliti.** `hangeul-maktabi` → Settings → Secrets and variables → Actions da 3 ta secret: `RELEASE_KEY_ALIAS`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_PASSWORD` (qo'shilgan). Kalitning o'zi repoda shifrlangan (`gotopik-app/upload-keystore.enc`); `gotopic-upload.jks` nusxasini ham xavfsiz joyda saqlang.
2. **Workflow'ni ishga tushiring** (Run workflow). Tugagach Releases → "Go Topic APK (AdMob)" ichida `GoTopic-play.aab` (Play uchun) va `GoTopic-release.apk` (telefonga o'rnatish uchun).
3. **Play Console** (play.google.com/console): hisob ochish 25 $ (bir marta) + shaxsni tasdiqlash.
4. **Create app** → nomi "Go Topic", til: o'zbek, turi: App, bepul.
5. **Maxfiylik siyosati URL:** `https://gotopik-a749akip.manus.space/privacy.html` (oldin sahifadagi `[ELEKTRON POCHTA]` o'rniga aloqa pochtasi qo'yilsin va sayt Publish qilinsin).
6. `GoTopic-play.aab` ni yuklang (Play App Signing — yoqilgan holda qoldiring).

## 2. Do'kon matnlari

**Nomi (30 belgigacha):** Go Topic: Koreys tili va TOPIK

**Qisqa tavsif (80 belgigacha):** Koreys tilini AI ustoz bilan o'rganing: so'zlar, grammatika, TOPIK 1–6.

**To'liq tavsif:**

Go Topic — koreys tilini o'zbek tilida o'rganish uchun ilova. Hangeul alifbosidan TOPIK 6 darajasigacha.

Ilovada nimalar bor:
• AI ustoz — koreyscha gapirasiz, u javob beradi, xatoni tuzatadi va o'zbekcha tarjima qiladi
• 30 000 so'zli lug'at, qidiruv va talaffuz bilan
• 34 mavzu va 90 grammatika qoidasi, har biriga mashqlar
• TOPIK 1–6 darajalari uchun tinglash, o'qish, yozish va gapirish vazifalari
• Daraja, tajriba ballari va haftalik liga
• Yorug' va qorong'i rejim

Kimlar uchun: Koreyaga o'qish yoki ishga tayyorlanayotganlar, TOPIK imtihoniga tayyorlanayotganlar va tilni noldan boshlayotganlar.

Ilova bepul. Reklama ko'rsatiladi. Vazifalar TOPIK formatiga o'xshatib tuzilgan, rasmiy TOPIK savollari emas.

**Kategoriya:** Education. **Teglar:** Language learning. **Aloqa pochtasi:** egasi kiritadi.

## 3. Play Console savollariga javoblar

- **Ads:** Yes, contains ads.
- **App access:** AI ustoz uchun kirish (login) kerak — sinov hisobi yoki "All functionality available without special access" emas; kirish yo'riqnomasini yozing.
- **Content rating:** so'rovnoma — zo'ravonlik, qimor, 18+ yo'q → Everyone.
- **Target audience:** 13+ (13 yoshdan kichiklarni tanlamang — reklama va hisob bor).
- **Data safety:** yig'iladi — hisob ma'lumoti (ism/pochta, kirish uchun), ilovadagi faollik (o'quv natijalari), qurilma/reklama identifikatori (AdMob). Ovoz: mikrofon yozuvi nutqni matnga aylantirish uchun ishlatiladi, serverda saqlanmaydi. Uzatishda shifrlangan (HTTPS). O'chirish so'rovi: aloqa pochtasi orqali.
- **Permissions:** RECORD_AUDIO — gapirish mashqlari uchun.
- **News / Covid / Government / Financial:** No.

## 4. Grafika

Ikonka 512×512 (`public/icon-512.png`), feature graphic 1024×500, kamida 2 ta telefon skrinshoti (9:16). Skrinshotlar ilovaning haqiqiy ekranlaridan olinadi.

## 5. Muddat haqida

- Yangi **shaxsiy** Play hisoblari (2023-yil noyabrdan keyin ochilgan) uchun majburiy: yopiq test — **kamida 12 sinovchi, 14 kun**; shundan keyingina production'ga chiqarishga ruxsat so'raladi. Tashkilot (yuridik shaxs) hisoblarida bu talab yo'q.
- Google tekshiruvi odatda bir necha kun (yangi hisoblarda 7 kungacha).
- Shu kunning o'zida tarqatish yo'li: imzolangan `GoTopic-release.apk` ni sayt/Telegram orqali berish.
