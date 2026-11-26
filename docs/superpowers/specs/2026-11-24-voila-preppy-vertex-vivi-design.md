# Voilà! uchun Preppy’dan ilhomlangan Google AI va Vivi dizayni

**Holat:** egasi faqat dizayn spetsifikatsiyasini yozish va ko‘rib chiqishga ruxsat bergan. Bu implementatsiya yoki Google Cloud sozlamalarini o‘zgartirish ruxsati emas. Kod, maxfiylik sahifasi, Google Cloud loyihasi, billing va deploy ushbu ishda o‘zgartirilmaydi; hujjat commit qilinmaydi.

**Tekshiruv sanasi:** 2026-11-24. Model va xizmatlarning mavjudligi deploy vaqtida Google Cloud loyihasi, joylashuv, ruxsatlar va amaldagi lifecycle holatida qayta tekshiriladi.

## Qisqa qarorlar

- Voilà! fransuz tilining A1–C2 ilovasi bo‘lib qoladi. Vivi fransuz tilini o‘rgatishda davom etadi; tushuntirishni tabiiy o‘zbekcha beradi, vaziyatga mos hazil qiladi va mavjud mushukcha orqali hissiyot ko‘rsatadi.
- Asosiy yo‘l Google xizmatlari: matnli tutor uchun Vertex/Google Cloud Agent Platform’dagi Gemini, nutqni tanish uchun Cloud Speech-to-Text, ovoz chiqarish uchun Google Cloud Agent Platform’dagi Gemini TTS. Gemini TTS standart Cloud Text-to-Speech API emas, alohida model va API hisoblanadi.
- Har bir AI marshruti uchun rozilik server tomonda tekshiriladi va bekor qilinishi mumkin. AI yoki tashqi provayderga yuborish roziliksiz bajarilmaydi.
- Umumiy OpenAI-compatible tashqi LLM fallback **yangi Google-only oqimda o‘chirib qo‘yiladi**. Azure, ElevenLabs va brauzer nutq tanishi ham nomi, ma’lumoti va alohida roziligi aniq bo‘lmaguncha yangi oqimda sukut bo‘yicha yoqilmaydi.
- Vertex Live’ni brauzerga ulash uchun hozir transport/auth tanlovi yo‘q: Google server-proxy namunasini ko‘rsatadi, ammo bu loyihadagi Node server va hosting mosligi tasdiqlanmagan. Live faqat alohida texnik proof-of-concept (POC) muvaffaqiyatli bo‘lgandan keyin yoqilishi mumkin. Ungacha nutq navbatma-navbat STT → Gemini matn → TTS kaskadidan o‘tadi.
- O‘zbekcha Live qo‘llovi tasdiqlanmagan. O‘zbekcha va aralash o‘zbek-fransuz suhbat Live’ga jo‘natilmaydi; transcript ishonchsiz bo‘lsa, o‘quvchi uni tekshirmaguncha yoki audioni qayta yozmaguncha baho berilmaydi.
- Tutordagi emotsiya/action cue’lari yagona, cheklangan va serverda tekshiriladigan sxema bilan boshqariladi. Jahl, shapaloq, punch kabi cue’lar taqiqlanadi; Vivi silueti mushukcha bo‘lib qoladi.
- Protsess ichidagi xotira-kvotalar yoki parallel «hedged» dublikat AI chaqiruvlari sarf nazorati deb hisoblanmaydi. Kvota umumiy va atomar, chaqiruvlar esa ketma-ket bo‘lishi kerak. Cloud Budget alert’i hard cap emas.

## GoPrep haqida ochiq dalil va noma’lum joylar

[GoPrep maxfiylik siyosati](https://goprep.gg/en/privacy) Preppy’ning ovozli mashqlari, suhbatlari va boshqa AI vazifalari uchun Google Vertex AI (Gemini), Google Cloud Speech-to-Text va Google Cloud Text-to-Speech ishlatilishini aytadi. Siyosatda aniq Gemini model ID, TTS voice ID yoki mushukcha mimikasini boshqaruvchi kitobxona ochiqlanmagan. [GoPrep mahsulot tavsifi](https://goprep.gg/en/guides/exam/what-is-goprep) ovozli tutor va speaking/writing feedback xususiyatlarini bayon qiladi, ammo model versiyasini emas. Shu sabab bu hujjat Google xizmatlar oilasini Voilà!’ga moslaydi; GoPrep’ning yashirin model/ovoz ID’larini bilamiz yoki aynan ko‘chirdik, deb da’vo qilmaydi.

Google Live’ning hozirgi til/ovoz ro‘yxatida frantsuzcha bor, o‘zbekcha yo‘q. Google TTS’ning Gemini TTS tillar ro‘yxati “Northern Uzbek”ni ko‘rsatadi, ammo bu Toshkent talaffuzi, code-switch yoki aralash o‘zbek-frantsuz gaplar tabiiy eshitilishini kafolatlamaydi. Google Cloud’ning oddiy Text-to-Speech ovozlar ro‘yxatida `uz-UZ` ovozi ko‘rsatilmagan.

## Voilà!ning mavjud holati va chegarasi

Repozitoriy React/TypeScript + Vite frontend va Node/TypeScript server’dan iborat. Hozirgi AI route’lar: `/api/tutor`, `/api/tutor/feedback`, `/api/live/token`, `/api/translate`, `/api/tutor/memory`, `/api/stt` va `/api/tts` (`server/main.ts`, `server/tutor.ts`, `server/voice.ts`). `/api/live/token` hozir Gemini API ephemeral-token oqimiga tayanadi; bu Vertex Live uchun tayyor browser auth deb qabul qilinmaydi.

Read-only review quyidagilarni aniqladi: server’da kvota va limitlar process-local map’larda; tutor’ning ayrim so‘rovlari parallel hedge bilan takrorlanishi mumkin; STT ikki yo‘lni parallel poyga qilib sinashi mumkin. Ixtiyoriy OpenAI-compatible LLM fallback, Azure va ElevenLabs TTS fallback’lari, shuningdek browser speech recognition mavjud. `public/privacy.html` bu provayderlar va route’larning barchasini to‘liq hamda real ish vaqtidagi nomlari bilan bayon qilmaydi. Bu hujjatda mazkur faylga o‘zgartish kiritilmaydi; kelgusi ishda uni yangilash talabi sifatida belgilaydi.

`.env.example`da Gemini model ID va voice nomzodlari, shu jumladan `Leda`, hamda eski model rotation qiymatlari bor. Bu Voilà! repo konfiguratsiyasi, GoPrep ishlatayotgan modellar ro‘yxati emas. Hozirgi Gemini Developer API kaliti/URL’ini Vertex’ga teng deb hisoblamaslik kerak: Google Cloud Vertex, Gemini API va Gemini Enterprise Agent Platform alohida API/auth va ma’lumotni qayta ishlash shartlariga ega bo‘lishi mumkin.

## Hozirgi hujjatlarda modellar bo‘yicha tasdiqlangan holat

Quyidagilar Google’ning 2026-11-24 holatidagi joriy hujjatlari bilan taqqoslangan. “Hujjatda bor” degani Voilà!’ning Google Cloud loyihasida ishlaydi degani emas: ishga tushirishdan oldin project console’da model ID, API, location, quota, lifecycle va billing talablari alohida tekshiriladi.

| Vazifa/ID | Rasmiy manbadagi holat | Dizayn qarori |
|---|---|---|
| `gemini-3.5-flash-lite` | Agent Platform’da hujjatlangan, GA; `GenerateContent` API qo‘llanadi. | Google Cloud loyihasidagi location/access tekshiruvidan keyin matnli tutor uchun asosiy nomzod. GoPrep ID’si emas. |
| `gemini-3.1-flash-lite` | Agent Platform katalogi va model sahifasida bor. | Ikkinchi nomzod bo‘lishi mumkin, ammo lifecycle, project/location access va eski parametrlarga mosligi tekshirilmasdan production fallback bo‘lmaydi. |
| `gemini-3.5-flash` | Agent Platform katalogi/model sahifasida ko‘rsatilgan; API mahsulotlari bir xil emas. Gemini API hujjatida u AI Studio’da tanlanmaydi va Gemini API endpoint so‘rovlarni `gemini-3.6-flash`ga avtomatik yo‘naltiradi. | `gemini-3.5-flash`ni Gemini API barqaror fallback’i deb qo‘ymaslik; faqat Cloud project console’da aynan shu API/model ishlashi tasdiqlansa Agent Platform uchun ko‘rib chiqish. |
| `gemini-3.8-live` | Agent Platform’da Live model sifatida hujjatlangan; Live API sahifasi uni qo‘llab-quvvatlanadigan model sifatida ko‘rsatadi. | Faqat frantsuzcha Live POC va til/hosting talablari o‘tgandan keyin. O‘zbek Live deb ko‘rsatilmaydi. |
| `gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts` | Gemini Enterprise Agent Platform’da TTS uchun hujjatlangan. Bu modellar `generateContent`/`streamGenerateContent` bilan Gemini TTS’dir; standart Cloud Text-to-Speech API bilan bir xizmat emas. | O‘zbekcha/aralash frantsuzcha audio namunasi, latency va console access tasdiqlangandan keyingina tanlash. Lite yoki Flash tanlovi sifat/sarf sinoviga bog‘liq. |
| `Leda` | Gemini TTS rasmiy prebuilt voice ro‘yxatida “Youthful” ovoz sifatida bor. | Voilà! uchun sinov nomzodi; o‘zbekcha sifat kafolati emas va Preppy ovozi emas. |
| Cloud STT `chirp_2` | Google tili/joylashuv jadvalida `uz-UZ` uchun `asia-southeast1`, `fr-FR` uchun jumladan `europe-west4` kabi ro‘yxatlangan joylar mavjud. | Real deployment uchun o‘quvchi ma’lumoti qaerda qayta ishlanishiga qarab location aniq tanlanadi; aralash tilni avtomatik aniqlashga ishonch deb talqin qilinmaydi. |
| `gemini-3.1-flash-lite-preview` | Eski preview/rotation qiymati; joriy model lifecycle sahifasida to‘xtatilgan modellar qismida keladi. | Production default yoki fallback’dan chiqarish. |
| `gemini-3-flash-preview` | Hozirgi Gemini API model list’da preview sifatida ko‘rsatilgan. | Production uchun kafolatlangan barqaror ID sifatida ishlatmaslik. |
| `gemini-flash-latest` | Gemini API’dagi o‘zgaruvchan alias bo‘lishi mumkin; muayyan pinned model emas. | Yangi production konfiguratsiyasida pinned model o‘rnida ishlatmaslik. |
| `gemini-flash-lite-latest` | Hozirgi rasmiy catalog’da aynan shu yozilishda tasdiqlanmadi. | Noma’lum candidate; project console va amaldagi API reference tasdiqlamasa ishlatilmaydi. |

Bu ID’lar Google’ning joriy model kataloglari bo‘yicha tekshirilgan, lekin ayrimlari boshqa Google API yuzasida boshqa lifecycle’ga ega bo‘lishi mumkin. Agar Google Cloud project console’dagi model access yoki mintaqa jadvali manba hujjatidan farq qilsa, console’dagi real natija hamda joriy rasmiy API reference hal qiluvchi bo‘ladi; tekshirilmagan qiymat production’ga kirmaydi.

## Mahsulot va tutor xulqi

- Voilà! fransuz tili, CEFR A1–C2, DELF va mavjud kurslar/progress doirasini saqlaydi. IELTS kontenti qo‘shilmaydi.
- Vivi frantsuzcha mashqni olib boradi; qoida va yordamni o‘zbek (lotin) tilida tabiiy va ixcham tushuntiradi.
- Xazil vaziyatga mos va ixtiyoriy: har javobda bo‘lishi shart emas. Masxara qilish, o‘quvchini uyaltirish, noto‘g‘ri frantsuzchani tasdiqlash yoki to‘g‘ri frantsuzcha variantni xato deb belgilash mumkin emas.
- Oddiy suhbatda ko‘pi bilan bitta muhim, qisqa va muloyim tuzatish beriladi. Baholash uchun avval transcript ishonchliligi tasdiqlangan bo‘lishi shart.
- GoPrep aktivlari, ovozi yoki aniq maxfiy model ID’lari nusxalanmaydi; original Voilà! mushukchasi va Vivi uslubi ishlatiladi.

## Server tomondagi rozilik, marshrutlar va maxfiylik

AI roziligi faqat UI’dagi checkbox yoki client yuborgan `consent=true` qiymati bilan isbotlanmaydi. Server har bir AI route’da tashqi provayderga murojaat qilishdan oldin durable, versiyalangan rozilik yozuvini tekshirishi kerak. Yozuv aniq user account’ga bog‘lanadi; guest rejimi qolsa, faqat imzolangan session identity bilan beriladi — IP manzil rozilik yoki shaxs o‘rnini bosmaydi.

Rozilik hujjatida kamida siyosat versiyasi, berilgan/bekor qilingan vaqt, ruxsat doiralari va nomlangan provayderlar bo‘ladi. Masalan: matnli tutor/feedback; microphone audio → Google Cloud STT; text → Gemini TTS; suhbat xotirasini kontekstga qo‘shish; Live ovoz sessiyasi. Foydalanuvchi doiralarni tushunishi, rozilikni qaytarishi va o‘z xotirasi/suxbat ma’lumotini o‘chirishi mumkin. Rozilik o‘zgargan bo‘lsa, eski rozilikni yangi provayderga yoyib yuborilmaydi.

Quyidagi **har bir** route shu server gate’dan o‘tadi: `/api/tutor`, `/api/tutor/feedback`, `/api/live/token`, `/api/translate`, `/api/tutor/memory`, `/api/stt`, `/api/tts` va kelajakdagi har qanday Live WebSocket proxy. Rozilik mavjud bo‘lmasa yoki bekor qilingan bo‘lsa, provider client chaqirilmasdan route rad etadi; xotira, tarjima va feedback “ichki” degani uchun istisno qilinmaydi. Frontend ham AI funktsiyasi ishlamasligini tushuntiradi va mahalliy kurs/matn materiallarini qoldiradi.

Bekor qilishdan keyin yangi provider so‘rovlari va yangi Live sessiyalari darhol bloklanadi. Agar server-proxy Live sessiyasi bo‘lsa, bekor qilish uni yopishi shart. Hozirgi `/api/live/token` browser’ga Gemini API ephemeral token berishi Vertex Server Live’ga teng emas; token berilgandan keyingi to‘g‘ridan-to‘g‘ri brauzer trafigini server tomondan to‘liq bekor qilish kafolatlanmaydi. Shu sabab ushbu legacy direct-token yo‘li production’da to‘liq server-side revocation kafolatlanmaguncha o‘chirilishi/yangi Vertex yo‘liga ko‘chirilishi kerak; Vertex brauzerga ochiq credential berilmaydi.

**Provider siyosati:** yangi asosiy oqim faqat nomlangan Google Cloud/Agent Platform xizmatlariga ruxsat beradi. OpenAI-compatible `FALLBACK_LLM_URL`/istalgan URL fallback o‘chiriladi; Google xatosi avtomatik ravishda Groq yoki boshqa LLM’ga matnni yubormaydi. Joriy koddagi Azure, ElevenLabs va browser `SpeechRecognition` fallback’lari ham yangi oqimda default-off. Keyin ulardan birortasi saqlansa, aniq kompaniya/xizmat, yuboriladigan ma’lumot, ishlash maqsadi, retention va user control ochiqlanadi; provider’ga nomma-nom rozilik olinadi; `privacy.html` yangilanadi. Google Gemini Developer API’ga qolgan legacy so‘rov ham Vertex’ga teng hisoblanmaydi: provayder va ma’lumot shartlari alohida ochiqlanmasdan unga fallback qilinmaydi.

`public/privacy.html` kelgusi rollout’dan oldin quyidagilarni aniq va bir-biriga mos bayon qilishi shart: qaysi ma’lumot (prompt, memory summary, transcript, raw audio, generated audio) qaysi nomlangan provayderga va nima maqsadda beriladi; ishlatiladigan region/location va transchegaraviy qayta ishlash; saqlash/o‘chirish muddati; loglarda nimalar saqlanmasligi; third-party fallback’lar bor-yo‘qligi; rozilikni bekor qilish. Hozirgi privacy matnidagi “raw audio saqlanmaydi” kabi mutlaq da’vo faqat Voilà! serveridagi saqlashni anglatsa shu tarzda cheklanishi kerak; Google yoki boshqa provider retention’i shartnoma/hujjat bilan tekshirilmasdan ularga nisbatan kafolat berilmaydi. Vertex AI va Gemini Developer API ma’lumot siyosati bir xil deb yozilmaydi.

## Nutq marshruti va Vertex Live feasibility gate

### Hozir tanlanadigan yo‘l: kaskad

O‘zbekcha, code-switch va Live POC’dan o‘tmagan holatlarda voice turn server orqali ketma-ket bajariladi: (1) aniqlangan user consent bilan audio → Google Cloud STT; (2) tasdiqlangan transcript va kerakli CEFR/mashq context → Vertex Gemini text; (3) javob matni → Gemini TTS. Agar TTS Uzbek sifati talabdan past bo‘lsa, ruxsatli provider oldindan tanlanmagan bo‘lsa matn ko‘rsatiladi; boshqa kompaniyaga yashirin fallback qilinmaydi. Latency Preppy bilan teng deb va’da qilinmaydi; P50/P95 o‘lchanadi.

STT/translate/memory uchun ham minimal kontekst yuboriladi. Xotipaga qo‘shiladigan ma’lumot avval userga ko‘rsatiladi va uni o‘chirish mumkin. Ishonchsiz yoki tuzatilmagan transcript’dan learning score, correction yoki uzoq muddatli memory xulosasi chiqarilmaydi.

### Vertex Live: hozircha tanlov emas, POC sharti

Google’ning rasmiy Live API ma’lumoti: Live — server-to-server WebSocket; veb/mobil uchun Google hamkor integratsiyasini tavsiya qiladi. Rasmiy WebSocket tutorial JavaScript frontend’ni Python backend authentication/proxy namunasi bilan ko‘rsatadi. Bu namuna Voilà!’ning Node server’i yoki joriy hosting’ida WebSocket upgrade, ADC, ijrochi auth va session revoke ishlashini isbotlamaydi. Mavjud `/api/live/token` Gemini Developer API ephemeral-token flow’i Vertex auth’i emas.

Shuning uchun hozir browser ↔ Vertex Live transport/auth **tanlanmaydi**. Kelgusi POC’da quyidagilar amalda isbotlanmaguncha Live feature flag o‘chiq qoladi: joriy hosting WebSocket proxy’ni ishonchli ushlashi; Node backend Google’ning qo‘llab-quvvatlangan SDK/transport orqali ADC bilan autentifikatsiya qilishi; brauzerga service-account/API secret berilmasligi; server foydalanuvchi va sessiyani tasdiqlashi, kvotani tekshirishi; rozilik bekor qilinganda socket, provider sessiyasi va yangi ulanishlarni to‘xtatishi; timeout, interruption, retry va tarif/lokatsiya talablari. Agar bu shartlar tasdiqlanmasa, Vertex Live’ni joriy Node stack’da browser feature sifatida reliz qilmay, yuqoridagi STT → text → TTS cascade ishlatiladi.

Live POC’dan keyin ham Live faqat hujjatda qo‘llab-quvvatlangan frantsuzcha rejimga cheklanadi. O‘zbekchaga o‘tilsa yoki user o‘zbekcha izoh so‘rasa, Live’ni davom ettirmay kaskadga o‘tadi. O‘zbekcha Live til qo‘llovi rasmiylashmaguncha uni qo‘llab-quvvatlaydi deb yozilmaydi. Aralash tildagi nutq ham Live’ga avtomatik yuborilmaydi.

## STT ishonchliligi, code-switch va baholash

Cloud Speech-to-Text confidence qiymati har bir so‘rovda kelmasligi yoki to‘g‘riligiga kafolat yo‘q; bir nechta alternatives so‘ralganda ham API har doim ko‘p variant qaytarishini kafolatlamaydi. Shu sabab confidence yoki alternatives yakka holda “to‘g‘ri” degan hukm emas. Mahsulot uchun confidence threshold keyin belgilanadigan bo‘lsa, u Uzbek, French va aralash nutq namunalarida kalibrlanadi; hozircha sonli chegara to‘qib chiqarilmaydi.

Transkript UI’sida eshitilgan gap matn ko‘rinishida chiqadi va o‘quvchi uni tuzatishi yoki audioni qayta yozishi mumkin. Tekshirishni talab qiluvchi holatlarga quyidagilar kiradi: confidence yo‘q/ishonchsiz; alternatives mavjud bo‘lib bir-biriga yoki maqsad iboraga zid; til yoki tarkib noto‘g‘ri aniqlangan; mashq transcript’ning bir harf/so‘z farqiga sezgir; Uzbek-French code-switch. Bunday holatda tuzatilgan matn yoki qayta yozilgan audio tasdiqlanmaguncha score, ishonchli correction, memory yoki “xato qildi” degan natija berilmaydi.

Aralash Uzbek-French audio uchun avtomatik code-switch detection’ni joriy Google STT hujjatlari tasdiqlagan deb qabul qilmaymiz. Agar mashqda bitta til kutilsa, interfeys kutilgan tilni ko‘rsatadi; aralash nutqni mumkin qadar qismlarga bo‘lish yoki transcript’ni qo‘lda to‘g‘rilash taklif qilinadi. O‘quvchi ma’noni tasdiqlamasdan tanish algoritmidagi adashish uchun jazolanmaydi. Tanqidiy baho faqat tasdiqlangan French transcript’ning CEFR maqsadiga tegishli qismiga qo‘yiladi.

## Xotira, tarjima va provayder fallback’lari

`/api/tutor/memory` va `/api/translate` ham AI route hisoblanadi: ularga server-side consent, quota, provider policy, timeout, data minimization va privacy disclosure tatbiq qilinadi. Memory route user’ning o‘z akkaunti va o‘chirish nazorati bilan bog‘lanadi; boshqa user konteksti aralashmaydi. Translation’ga faqat zarur matn beriladi; sezgir ma’lumotni dars xotirasiga o‘z-o‘zidan kiritmaydi.

**Aniq fallback qarori:** generic OpenAI-compatible LLM fallback yangi Google-only arxitekturaga kirmaydi va yangi Google route’lardan chaqirilmaydi. `FALLBACK_LLM_URL` config bo‘lsa ham yopiq/ignor qilingan bo‘ladi; provider xatosi bo‘lganda text-only/matn javobga o‘tish yoki so‘rovni retry bo‘lmaguncha to‘xtatish mumkin. Azure/ElevenLabs va browser speech recognition yangi oqimda default-off; ularni keyin saqlash uchun nomma-nom disclosure, alohida user opt-in, data handling tekshiruvi va o‘chirish/bekor qilish UX kerak. Google Gemini Developer API ham Vertex uchun “sukutdagi fallback” emas.

## Yagona Vivi emotion/action schema va tutor prompt

Text tutor va kelajak Live ikkalasi bir xil versioned schema chiqaradi. Server JSON/schema validator’dan o‘tkazib, frontend faqat whitelist’dagi semantic cue’larni animation mapping’ga beradi. Arbitrary natural-language action/code to‘g‘ridan-to‘g‘ri yuborilmaydi; parse xato yoki unknown enum bo‘lsa `neutral` holati ishlatiladi.

Schema uchun ruxsat etilgan qiymatlar:

- `state`: `idle`, `listening`, `thinking`, `speaking`.
- `face`: `neutral`, `happy`, `amused`, `curious`, `confused`, `surprised`, `supportive`, `proud`.
- `action`: `blink`, `head_tilt`, `ear_perk`, `tail_wag`, `giggle`, `hop`, `wave`.
- Ixtiyoriy `ornament` (ko‘pi bilan bitta): `sparkle`, `thought_dots`, `heart`.

`angry`, `slap`, `punch`, `spit`, `flip`, shape-morphing va kamsituvchi yoki jarohat yetkazuvchi cue’lar schema’da yo‘q va validation’dan o‘tmaydi. Vivi hamisha taniladigan asl mushukcha siluetida qoladi; avvalgi ayrim kayfiyatlarda tanani boshqa shaklga aylantiruvchi animatsiyalar berilmaydi. Listening’da quloq, thinking’da bosh qiyshayishi/thought dots, speaking’da audio’ga mos og‘iz, to‘g‘ri javobda yengil quvonch/hop, hazilda yumshoq giggle, chalkashlikda bosh egish, qo‘llab-quvvatlashda iliq ko‘z/tail harakati ishlatiladi. `prefers-reduced-motion` hurmat qilinadi.

`server/tutor.ts` va `server/voice.ts`dagi prompt’lar bir xil mahsulot qoidasiga keltiriladi: hech qanday majburiy hazil; o‘quvchini masxara qilmaslik; maqbul French variantlarni xato deb belgilamaslik; A1–C2 darajaga mos French mashq; o‘zbekcha tabiiy va ixcham tushuntirish; oddiy suhbatda ko‘pi bilan bitta muhim muloyim correction; cue’lar uchun yuqoridagi schema’dan tashqari qiymat bermaslik.

## Kvota, duplicate call va xarajat cheklovi

Process-local map’lar har bir server protsessi/replikasi va restart’da mustaqil bo‘lgani uchun umumiy user quota yoki xarajat hard limit’i emas. Kelgusi implementation barcha server replikalari ko‘radigan shared durable store’da atomar increment/check qilishi shart. Joriy SQLite faqat deployment yagona yoki haqiqatan umumiy durable instance’dan foydalanishi tasdiqlansa yaroqli; aks holda bir necha replica’da umumiy limit deb qabul qilinmaydi. Store ishlamasa AI so‘rovi fail-closed qilinadi.

Quota kamida account/session bo‘yicha kunlik va umumiy request, model token, STT audio seconds, TTS characters/seconds’ni qamraydi; alohida global hard stop/feature kill switch ham bo‘ladi. Parallel duplicate tutor/STT hedging olib tashlanadi: bir user turn’ga bir provider request; zarur transient retry bitta, ketma-ket va idempotency/request ID bilan; streaming/audio javobi boshlangandan keyin avtomatik dublikat yo‘q. Ikkinchi provider’ga fallback faqat oldindan ruxsat berilgan bo‘lsa va rozilik/quota tekshiruvi qayta o‘tsa, ammo ushbu Google-only qarorda no-Google fallback o‘chirilgan.

Cloud Billing’ning alerts-only budget’i xarajatni to‘xtatmaydi. Google hujjatiga ko‘ra, bunday budget Google Cloud ishlatish yoki sarfni avtomatik cheklamaydi. Xizmat uchun spend cap mavjudligi va qo‘llanishi alohida tekshiriladi; barcha AI xizmatlariga tegishli deb faraz qilinmaydi. Shuning uchun dastur ichida request/token/audio qat’iy kvotasi va favqulodda o‘chirish talab qilinadi; haqiqiy pullik limitlar, notification va uzilish oqibati rollout’dan oldin belgilanadi. Aniq byudjet summasi ushbu spetsifikatsiyada tanlanmagan; Google Cloud API/billing yoqish, pullik modelni ishga tushirish yoki yangi provider xarid qilish uchun keyin alohida ega tasdig‘i zarur.

## Kelajakdagi rollout bosqichlari

Bu bosqichlar implementatsiya rejasining yuqori darajadagi tartibi; hozir ularni bajarishga ruxsat berilmagan.

1. **Tayyorgarlik va project verification.** Privacy policy/consent copy, data field bayonlari, model ID/location/permission, quota va numeric cost guard’larni loyihalash. Xizmatlar, API, billing yoqilmaydi; hamma pullik yoki barcha data-region tanlovlari egasi tasdig‘iga qoladi.
2. **Provider boundary + consent gate.** Server-side auth/consent middleware’ni barcha 7 route’da talab qilish; avvalgi direct-token route va har qanday provider bypass’ni cheklash; provider registry’ni faqat Google core path bilan ochish; privacy disclosure’ni yangilash. Shared atomic quotas va kill switch qo‘shish. Noma’lum fallback’lar default-off.
3. **STT transcript UX.** Cloud STT `chirp_2` uchun Uzbek/French joylashuv va region tekshiruvi; transcript review/edit/re-record qadami; tuzatilmagan yoki code-switch noaniq transcript’da scoring/memory o‘chiriladi.
4. **Text tutor va TTS sifat tasdig‘i.** Faqat console’da tasdiqlangan Agent Platform Gemini ID; structured cue response; Gemini TTS model/voice compatibility; Uzbek va aralash Uzbek-French namuna testlari. `Leda` va har bir candidate ovoz sifati ega tomonidan tinglab baholanadi.
5. **Vertex Live POC, alohida gate.** Google namunasidan farq qiluvchi Node/hosting imkoniyatini o‘z muhitida sinash. Barcha auth, WebSocket, consent revoke, quota/cancel shartlari o‘tmasa Live flag yopiq qoladi va 3-bosqich cascade asosiy ovoz yo‘li bo‘ladi.
6. **Staging va cheklangan rollout.** Privacy regression, cost/quota concurrency, latency, error fallback va avatar schema sinovlaridan keyin feature flag orqali kichik guruh; provider failure, sarf, no-consent va latency kuzatuvi; qabul mezonlari bajarilmasa rollout to‘xtatilib text-only yo‘lga qaytiladi.

## Qabul mezonlari va testlar

### Consent va privacy

- Har bir route (`/api/tutor`, `/api/tutor/feedback`, `/api/live/token`, `/api/translate`, `/api/tutor/memory`, `/api/stt`, `/api/tts`) uchun unit/integration test’lar: consent mavjud, yo‘q, bekor qilingan, eski versiya va boshqa account konteksti. Gate’dan o‘tmagan holatda provider stub chaqiruvlari soni nol.
- Revocation’dan keyin yangi AI calls/token/session ochilmaydi; Live proxy’da mavjud socket bekor qilinadi. Browser’ga ochiq Gemini/Vertex credential topilmaydi va direct Live token’ni Vertex auth sifatida ishlatishga yo‘l qo‘yilmaydi.
- Memory va translation ayni consent, quota, deletion va privacy qoidalari bilan tekshiriladi; boshqa akkaunt xotirasi qo‘shilmaydi.
- OpenAI-compatible URL, Azure, ElevenLabs yoki browser speech’ga yashirin fallback qilish testda taqiqlanadi. Privacy matni aktiv provider’lar va ma’lumot turlari bilan runtime’da mos keladi. Log’larda raw audio, transcript, prompt/memory, secret/API key yo‘q.
- Provider retention/processing haqida hujjatdan tashqari kafolat berilmagani, Google Gemini API va Agent Platform farqi ochiq yozilgani tekshiriladi.

### STT, tutor va voice

- Kamida 30 ta belgilangan Uzbek, French va code-switch audio set; confidence yo‘q/past, alternatives zid, noto‘g‘ri til, shovqin, transcript maqsad iboradan farq qiladigan holatlar. Har bir shubhali holat correction/re-record UI’ni ochadi; user tasdiqlaguncha score/correction/memory yaratilmaydi.
- O‘quvchi transcript’ni tahrirlaganda faqat tasdiqlangan matn baholanadi; qayta yozib yuborish yoki bekor qilish yo‘li bor.
- Kamida 20 ta o‘zbekcha va aralash Uzbek-French TTS javobi: talaffuz, tabiiylik, hazil ohangi va French ibora tushunarliligi inson tomonidan baholanadi. Uzbek ovoz talabdan past bo‘lsa, default’da yo‘q yoki text fallback ishlaydi.
- Frantsuz A1–C2 regression: IELTS yo‘q; to‘g‘ri/maqbul French noto‘g‘ri deb tuzatilmaydi; oddiy navbatda bittadan ko‘p muhim correction yo‘q; Vivi yumshoq o‘zbekcha yordam beradi.
- STT/TTS provider outage, 429, 5xx, timeout va quota exhaustion’da duplicate parallel request bo‘lmaydi; text fallback ochiladi. P50/P95 transcript, first-audio va umumiy voice-turn latency staging’da qayd etiladi.

### Live, quota va cue

- Live POC Node + joriy hosting’da WebSocket, ADC, server-only auth, user/session binding, atomic quota, cancel/revoke va timeout’ni real tekshiradi. POC o‘tmasa production flag disabled; Uzbek va mixed-mode Live chaqiruvi yo‘q.
- Bir user’ning concurrent so‘rovlari va bir nechta server replica orqali shared quota’ning atomarligini sinash; protsess restart’ida quota reset bo‘lmaydi. Budget alert’dan tashqari hard app-limit va global kill switch quota’dan oshganda provider call’ni to‘xtatadi.
- Bir turn uchun hedging yoki parallel STT race sababli provider chaqiruvi takrorlanmaydi; retry bitta va ketma-ket.
- Text va Live cue qiymatlari bir validator’dan o‘tadi; unknown/invalid cue `neutral`ga tushadi. `angry/slap/punch/spit/flip` rad etiladi; jism shakli/morph bo‘lmaydi; reduced-motion’da kuchli animatsiya chiqmaydi.

## Asosiy xatarlar va javob

1. **GoPrep model/ovoz ID’lari maxfiy.** Google umumiy stekka tayanish; aniq model yoki ovozni GoPrep’ga nisbat bermaslik.
2. **Vertex Live Node/hosting mosligi tasdiqlanmagan.** POC o‘tmaguncha Live’ni yoqmaslik; cascade fallback’ni asosiy qilish.
3. **O‘zbekcha Live qo‘llovi rasmiy ro‘yxatda yo‘q.** Uzbek va mixed so‘rovlarni Live’ga bermaslik; STT review → text Gemini → Gemini TTS/text.
4. **TTS “Northern Uzbek” mahalliy talaffuzni kafolatlamaydi.** Talaffuzni eshitib sinov; sifati etarli bo‘lmasa ovozni default qilmaslik.
5. **STT confidence xato yoki yo‘q bo‘lishi mumkin.** User transcript review yoki re-record’siz score/oshkora correction berilmaydi.
6. **Provider fallback/privacy tushunarsiz bo‘lishi mumkin.** Google-only default; Azure/ElevenLabs/browser/OpenAI-compatible oqimini ochiq, nomlangan consent’siz yoqmaslik; privacy matni runtime’ga mos.
7. **Budget alert sarfni to‘xtatmaydi va mahalliy quota replica’larda bir xil emas.** Shared atomic app quota, global kill switch va rollout oldidan belgilangan budget; alohida loyiha tasdig‘isiz GCP billing yoqilmaydi.

## Rasmiy manbalar

- [GoPrep Privacy Policy — provider’lar va rozilik](https://goprep.gg/en/privacy)
- [What is GoPrep? — ochiq mahsulot tavsifi](https://goprep.gg/en/guides/exam/what-is-goprep)
- [Google Cloud Agent Platform — joriy modellar indeksi](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models)
- [Gemini 3.5 Flash-Lite — model ID, GA va qo‘llab-quvvatlanadigan API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite)
- [Gemini 3.1 Flash-Lite](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-flash-lite) va [Gemini 3.5 Flash](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash)
- [Google Cloud model lifecycle](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions)
- [Gemini API model list](https://ai.google.dev/gemini-api/docs/models) va [Gemini API deprecations/auto-routing](https://ai.google.dev/gemini-api/docs/deprecations)
- [Gemini 3.8 Live](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-8-live)
- [Gemini Live API — server-to-server/WebSocket integratsiyasi va web/mobile yo‘rig‘i](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/models/live-api)
- [Gemini Live WebSocket tutorial — JavaScript client, Python proxy namunasi](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api/get-started-websocket)
- [Gemini Live — til va ovoz qo‘llovi](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api/configure-language-voice)
- [Gemini TTS — `gemini-3.8-*` model ID, Leda ovozi va til ro‘yxati](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/text-to-speech/overview)
- [Cloud Speech-to-Text — qo‘llab-quvvatlanadigan tillar, region va `chirp_2`](https://docs.cloud.google.com/speech-to-text/docs/speech-to-text-supported-languages)
- [Cloud Speech-to-Text overview — confidence cheklovlari](https://docs.cloud.google.com/speech-to-text/docs/overview) va [recognize API](https://docs.cloud.google.com/speech-to-text/docs/reference/rest/v2/projects.locations.recognizers/recognize)
- [Google Cloud Text-to-Speech — standart ovozlar](https://docs.cloud.google.com/text-to-speech/docs/voices)
- [Google Cloud Application Default Credentials](https://docs.cloud.google.com/docs/authentication/application-default-credentials)
- [Cloud Billing budgets — alerts-only budget hard cap emas](https://docs.cloud.google.com/billing/docs/how-to/budgets)
