# Android chiqarish

Go Topic Android ilovasi native WebView ichida Manus’dagi production saytni ochadi. Native Google Mobile Ads SDK banner va Rewarded video reklamalarni JavaScript bridge orqali boshqaradi.

Production manzil: `https://gotopic-jmqzyljc.manus.space/`. DEFAULT_URL shu joriy publish domeniga ulangan. Sayt Public ruxsatida bo‘lishi kerak; Private sayt 500–1000 foydalanuvchi yoki Android’ning domain-verification so‘rovlariga ochilmaydi.

## Sinov APK

Yangi versiya: 2.1.0, versionCode 2100, applicationId `uz.hangeulmaktabi.app`, compile/target SDK 35, min SDK 23. Bu debug-signed APK, Play Store release emas. Debug build Google’ning test App ID va test ad unitlaridan foydalanadi. Yig‘ilgandan keyin `/home/ubuntu/output/GoTopic-debug.apk` sifatida yetkaziladi.

Bu versiya TWA emas, shuning uchun browser chrome yoki Digital Asset Links verificationga bog‘liq emas. Sayt Public bo‘lishi kerak, chunki WebView production URL’ni to‘g‘ridan-to‘g‘ri yuklaydi.

Manifestda INTERNET va RECORD_AUDIO ruxsatlari bor; mikrofon ruxsati native WebView tomonidan so‘raladi. Dizayn, ranglar va darslar saytdan keladi. Rewarded video kuniga ko‘pi bilan 5 marta ko‘rsatiladi va muvaffaqiyatli yakunda 20 XP beradi.

## Yig‘ish

Android SDK 35 va Gradle 8.9+ o‘rnatilgan muhitda:

```sh
VERSION_CODE=2100 VERSION_NAME=2.1.0 ./scripts/build-android.sh
```

`OUTPUT_DIR` orqali artefact katalogi beriladi. Release signing to‘liq berilmasa, script debug APK yig‘adi. Debug build test reklamalardan foydalanadi. Release’da haqiqiy AdMob App ID berish uchun `-PadmobAppId=ca-app-pub-...~...` qo‘shiladi. `RELEASE_KEYSTORE_FILE`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD` to‘liq va to‘g‘ri berilsa signed release yig‘iladi.

GitHub Actions faqat manual workflow_dispatch. GitHub secretlari uchun `RELEASE_KEYSTORE_BASE64`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD` ishlatiladi. APK build, signing va release output nomi alohida belgilanadi.

## Rasmiy yangilanish va ma’lumotlar

Eski APK ustiga yangilash uchun aynan oldingi production keystore kerak. Boshqa sertifikatli debug APK update bo‘la olmasligi mumkin; foydalanuvchidan ilovani yoki ma’lumotlarni avtomatik o‘chirish talab qilinmaydi. Production fingerprint assetlinks fayliga qo‘shilishi kerak. Keystore/parollar Git yoki APK manba fayllariga qo‘yilmaydi.

Eski GitHub Pages sahifasi o‘zgartirilmagan va uning Chrome’dagi local progressi o‘sha origin uchun saqlanib qoladi. Yangi Manus originiga localStorage avtomatik ko‘chmaydi. Cloud progress yangi hisob orqali sinxronlanadi; eski origin progressini ko‘chirish alohida migration/export bosqichini talab qiladi. Bu build ma’lumotlarni o‘chirib yoki yashirin ko‘chirmaydi.

SDK 35 kelajakdagi Play siyosatiga moslik kafolati emas. Rasmiy Store release uchun production signing va o‘sha paytdagi Store talablarini tekshirish zarur.
