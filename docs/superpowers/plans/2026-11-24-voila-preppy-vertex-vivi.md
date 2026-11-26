# Voilà! Preppy ruhidagi Google AI va Vivi — batafsil implementatsiya rejasi

> **Maqsad:** Voilà!ning fransuz tili A1–C2 tutorini server tomonidan tekshiriladigan rozilik, faqat nomlangan Google provider yo‘li, ko‘rib chiqiladigan transkript, xavfsiz Vivi cue’lari va atomar umumiy kvota bilan tayyorlash.
>
> **Ishlash tartibi:** Har bir vazifada avval failing test yoziladi; keyin testning yiqilishini ko‘rsatuvchi buyruq bajariladi; undan so‘ng minimal implementatsiya qilinadi; fokuslangan test va build/typecheck bajariladi. Har bir vazifa alohida kichik commit bo‘lishi mumkin.
>
> **Spetsifikatsiya:** `docs/superpowers/specs/2026-11-24-voila-preppy-vertex-vivi-design.md`
>
> **Hozirgi ruxsat chegarasi:** Bu faqat implementatsiya rejasidir. Google API yoqilmaydi, billing o‘zgartirilmaydi, pulli request yuborilmaydi, haqiqiy Live POC bajarilmaydi va deploy qilinmaydi. Bular alohida egasi tasdig‘ini talab qiladi.

## Umumiy majburiy chegaralar

- Voilà! fransuz tili, CEFR A1–C2, DELF va mavjud kurs/progressni saqlaydi; IELTS kontenti qo‘shilmaydi.
- Vivi fransuzcha mashqni boshqaradi, yordamni tabiiy o‘zbek lotin tilida beradi. Hazil ixtiyoriy, muloyim va vaziyatga mos; o‘quvchini masxara qilmaydi.
- Oddiy suhbatda ko‘pi bilan bitta muhim, qisqa correction beriladi. Maqbul fransuzcha variant xato deb belgilanmaydi.
- Yangi oqimda faqat aniq nomlangan Google Cloud/Agent Platform provider ishlaydi. OpenAI-compatible URL, Gemini Developer API, Azure, ElevenLabs va brauzer `SpeechRecognition` yashirin fallback bo‘lmaydi.
- Yetti AI route server-side, durable, versiyalangan consent va shared atomic quota gate’idan o‘tadi. Consent yoki quota store ishlamasa provider chaqirilmaydi.
- Model ID, voice, location, API access, lifecycle va quota faqat alohida verificationdan keyin konfiguratsiyaga kiritiladi; noma’lum qiymat AI’ni o‘chiradi.
- Live hozir va reja yakunida disabled qoladi. Browser direct token yoki credential berilmaydi. Node/hosting Live POC va alohida approval bo‘lmasa Live yoqilmaydi.
- Ovozning asosiy yo‘li ketma-ket `STT → Gemini text → Gemini TTS`. STT transcript user tomonidan tasdiqlanmaguncha score, correction yoki memory chiqarilmaydi.
- O‘zbekcha va aralash Uzbek–French nutq Live’ga avtomatik yuborilmaydi. TTS sifati yetarli bo‘lmasa text-only javob qaytadi; no-Google fallback yo‘q.
- Cloud Budget alert hard cap emas. Dastur ichidagi shared atomic quota va global kill switch qat’iy nazorat bo‘ladi.
- GoPrep aktivlari, ovozi yoki maxfiy model ID’lari nusxalanmaydi; mavjud original Voilà! mushukchasi saqlanadi.

## Fayllar xaritasi

**Yangi fayllar:** `server/ai-config.ts`, `server/ai-config.test.ts`, `server/ai-consent.ts`, `server/ai-consent.test.ts`, `server/ai-quota.ts`, `server/ai-quota.test.ts`, `server/ai-provider.ts`, `server/ai-provider.test.ts`, `server/google-cloud-provider.ts`, `server/google-cloud-provider.test.ts`, `server/ai-routes.ts`, `server/ai-routes.test.ts`, `server/vivi-cues.ts`, `server/vivi-cues.test.ts`, `src/shared/vivi-cue.ts`, `src/shared/vivi-cue.test.ts`, `src/state/ai-consent.ts`, `src/components/AiConsentDialog.tsx`.

**O‘zgartiriladigan fayllar:** `server/db.ts`, `server/accounts.ts`, `server/main.ts`, `server/tutor.ts`, `server/tutor.test.ts`, `server/voice.ts`, `server/voice.test.ts`, `public/privacy.html`, `src/App.tsx`, `src/state/account.tsx`, `src/screens/Tutor.tsx`, `src/screens/voice/VoiceHub.tsx`, `src/screens/Profile.tsx`, `src/engine/tutor.ts`, `src/engine/voice/stt.ts`, `src/engine/voice/call.ts`, `src/engine/voice/tts.ts`, `src/engine/voice/live.ts`, `src/engine/voice/markers.ts`, `src/screens/voice/FeedbackView.tsx`, `src/components/Mascot.tsx`, `src/components/KruaLive.tsx`, `src/screens/voice/VoiceCall.tsx`, `src/screens/voice/LiveCall.tsx`, `src/styles.css`, `package.json` va lock fayli faqat zarur bo‘lsa.

## Route va consent scope matritsasi

| Route | Kerakli scope | Providerga chiqadigan ma’lumot | Consent yo‘q/bekor bo‘lsa |
|---|---|---|---|
| `/api/tutor` | `text_tutor` | Minimal prompt va CEFR context | Provider chaqirilmaydi |
| `/api/tutor/feedback` | `text_feedback` | Tasdiqlangan javob va mashq contexti | Provider chaqirilmaydi |
| `/api/live/token` | `live_session` | Live session metadata | Token ham, session ham yo‘q; hozir disabled |
| `/api/translate` | `translation` | Faqat zarur matn | Provider chaqirilmaydi |
| `/api/tutor/memory` | `memory` | User ko‘rgan va saqlashga tasdiqlagan context | O‘qish/yozish yo‘q |
| `/api/stt` | `microphone_stt` | Audio, nomlangan Google STT’ga | Audio providerga yuborilmaydi |
| `/api/tts` | `text_tts` | Javob matni | Audio ishlab chiqilmaydi |

---

## Task 1: Fail-closed AI konfiguratsiyasi va feature gate

**Fayllar:** yangi `server/ai-config.ts`, `server/ai-config.test.ts`; ulash uchun `server/main.ts`, mavjud `.env.example` faqat nomlangan, tekshirilgan maydonlar bilan.

**Interfeys/kontrakt:** `AiRuntimeConfig` kamida `providerEnabled`, `liveEnabled`, verified provider/model/location qiymatlari, quota konfiguratsiyasi, kill switch va credential mavjudligi holatini ifodalaydi. `loadAiRuntimeConfig(env: NodeJS.ProcessEnv): AiRuntimeConfig` qat’iy parser bo‘ladi. `liveEnabled` bu bosqichda har doim `false`.

- [ ] `AiRuntimeConfig` uchun kerakli tiplarni yozing; noma’lum model, bo‘sh credential, manfiy yoki yetishmayotgan quota qiymati `disabled` natijaga aylanishini belgilang.
- [ ] Failing test yozing: provider flag yo‘q, credential yo‘q, quota config yo‘q, verified model/location yo‘q holatlarida `providerEnabled === false`; Live flag `true` berilsa ham `liveEnabled === false` bo‘lsin.
- [ ] Failing testni ishga tushiring: `npm test -- server/ai-config.test.ts`.
- [ ] Strict env parserni implement qiling; konfiguratsiya to‘liq bo‘lmasa pozitiv spend allowance bermang va AI route’lar fail-closed bo‘lsin.
- [ ] `server/main.ts` faqat shu immutable runtime gate orqali AI route’larni ro‘yxatdan o‘tkazsin; browserga secret yoki token chiqarmasin.
- [ ] Fokuslangan test va typecheckni bajaring: `npm test -- server/ai-config.test.ts` va `npm run typecheck`.
- [ ] Commit: `git add server/ai-config.ts server/ai-config.test.ts server/main.ts .env.example && git commit -m "feat(ai): add fail-closed runtime configuration"`.

## Task 2: Signed identity-ga bog‘langan durable AI consent

**Fayllar:** yangi `server/ai-consent.ts`, `server/ai-consent.test.ts`, `src/state/ai-consent.ts`, `src/components/AiConsentDialog.tsx`; o‘zgartirish `server/db.ts`, `server/accounts.ts`, `server/main.ts`, `src/state/account.tsx`, `src/App.tsx`, `src/screens/Profile.tsx`, `public/privacy.html`.

**Interfeys/kontrakt:** `AiSubject` IP emas, signed account/session identitydan tuziladi. `AiScope` yuqoridagi yetti route scope’larini; `AiProviderName` faqat nomlangan Google providerlarni bildiradi. `getAiConsent`, `grantAiConsent`, `revokeAiConsent`, `hasAiConsent` policy version, granted/revoked vaqt, scope va providerni tekshiradi.

- [ ] Consent record jadvali va subject bindingni loyihalang; boshqa account recordi ishlatilmasin, guest esa faqat signed session bilan ruxsat olsin.
- [ ] Failing testlar yozing: consent yo‘q, eski policy version, noto‘g‘ri scope/provider, boshqa account, revoke’dan keyingi request rad etilsin; IP yolg‘iz identity bo‘lmasin.
- [ ] Failing testni ishga tushiring: `npm test -- server/ai-consent.test.ts`.
- [ ] DB migration va server API’larini yozing: `GET/PUT/DELETE /api/ai/consent`; origin/security va CSRF mavjud amaliyotiga mos tekshirilsin.
- [ ] Revoke yangi provider request va yangi Live sessionni darhol bloklasin; mavjud server-proxy socket bo‘lsa yopish hook’i bo‘lsin.
- [ ] UI checkbox/scope’lari default tanlanmagan, policy version ko‘rsatilgan va revoke/delete-memory amali tushunarli bo‘lsin.
- [ ] Privacy matnida prompt, memory summary, transcript, raw audio, generated audio, provider, region, retention va revoke aniq ajratilsin; provider retentioni hujjatsiz va’da qilinmasin.
- [ ] Test, buildni bajaring: `npm test -- server/ai-consent.test.ts` va `npm run build`.
- [ ] Commit: `git add server/ai-consent.ts server/ai-consent.test.ts server/db.ts server/accounts.ts server/main.ts src/state/ai-consent.ts src/components/AiConsentDialog.tsx src/state/account.tsx src/App.tsx src/screens/Profile.tsx public/privacy.html && git commit -m "feat(ai): add versioned server-side consent"`.

## Task 3: Atomar shared AI usage quota va kill switch

**Fayllar:** yangi `server/ai-quota.ts`, `server/ai-quota.test.ts`; o‘zgartirish `server/db.ts`, `server/main.ts`.

**Interfeys/kontrakt:** `reserveAiUsage(subject, usage, requestId)` va `settleAiUsage(reservation, actualUsage)` shared durable store’da `BEGIN IMMEDIATE` bilan ishlaydi. Subject/day va global/day request, token, STT audio seconds, TTS character/seconds limitlari hamda global kill switch saqlanadi.

- [x] Usage counter, idempotency/request ID va reservation holatlarini belgilang; restartdan keyin counter nolga tushmasin.
- [x] Failing concurrency test yozing: ikki server instance bir vaqtda limitning oxirgi birligini reserve qilsa, faqat bittasi o‘tsin; store xatosida providerga chiqish bo‘lmasin.
- [x] Failing testni ishga tushiring: `npm test -- server/ai-quota.test.ts`.
- [x] SQLite umumiy durable instance ekanligi tasdiqlanmagan holatda quota’ni production hard limit deb qabul qilmaydigan fail-closed gate yozing; mavjud `BEGIN IMMEDIATE` uslubiga moslang.
- [ ] Reserve oldidan consent va config gate’dan keyin atomic check/increment qiling; provider call boshlanishidan oldin reservation majburiy bo‘lsin. **Task 5 gacha kechiktirildi:** barcha handler/fallback integratsiyasi kutilmoqda; Task 3 route-readiness gate `false` qoladi.
- [ ] Bitta transient retry uchun reservation/request ID qayta ishlatilsin; parallel hedge, duplicate STT race va streamingdan keyingi dublikat bo‘lmasin. **Task 5 gacha kechiktirildi:** handler middleware ulanmaguncha provider retry yo‘li faollashtirilmaydi.
- [x] Global emergency kill switch quota’dan alohida tekshirilsin; Cloud Budget alert uni almashtirmasin.
- [x] Fokuslangan concurrency/failure/restart testlarini, typecheckni va buildni bajaring.
- [x] Commit: `git add server/ai-quota.ts server/ai-quota.test.ts server/db.ts server/main.ts && git commit -m "feat(ai): enforce atomic shared usage quota"`.

## Task 4: Google-only provider boundary va ADC transport

**Fayllar:** yangi `server/ai-provider.ts`, `server/ai-provider.test.ts`, `server/google-cloud-provider.ts`, `server/google-cloud-provider.test.ts`; o‘zgartirish `server/tutor.ts`, `server/voice.ts`, ularning testlari va `server/main.ts`.

**Interfeys/kontrakt:** `AiProvider` `streamTutor`, `generateJson`, `transcribe`, `synthesize` metodlarini beradi. `createGoogleCloudProvider(config, { auth, fetchImpl })` server-only ADC transportni dependency injection bilan yaratadi. Model/voice ID’lar bu rejada to‘qilmaydi; faqat runtime verificationdan kelgan config qabul qilinadi.

- [ ] Failing fake-transport test yozing: auth bo‘lmasa, provider config verified bo‘lmasa, boshqa URL/provider chaqirilmasin; browser bundlega credential kirmasin.
- [ ] Failing testni ishga tushiring: `npm test -- server/ai-provider.test.ts server/google-cloud-provider.test.ts`.
- [ ] Google Agent Platform Gemini text, Cloud STT V2 `chirp_2` va Agent Platform Gemini TTS uchun typed request/response adapter yarating; rasmiy contract/runtime verificationdan tashqari API xatti-harakati o‘ylab topmang.
- [ ] Auth/fetch transportini injected fake bilan sinash imkonini qoldiring; haqiqiy API call testlardan chiqarilsin.
- [ ] Timeout, 429, 5xx va auth failure’da ko‘pi bilan bitta ketma-ket, idempotent retry bo‘lsin; boshqa providerga o‘tish bo‘lmasin.
- [ ] `FALLBACK_LLM_URL`, Gemini Developer API, Azure, ElevenLabs va browser STT yo‘llarini yangi provider registry’dan olib tashlang yoki default-off qilib unreachable test bilan mustahkamlang.
- [ ] Fokuslangan fake transport testlari va `npm run typecheck`ni bajaring.
- [ ] Commit: `git add server/ai-provider.ts server/ai-provider.test.ts server/google-cloud-provider.ts server/google-cloud-provider.test.ts server/tutor.ts server/voice.ts server/main.ts && git commit -m "feat(ai): isolate Google-only provider transport"`.

## Task 5: Yetti endpoint uchun consent/quota gate va privacy consistency

**Fayllar:** yangi `server/ai-routes.ts`, `server/ai-routes.test.ts`; o‘zgartirish `server/main.ts`, `server/tutor.ts`, `server/voice.ts`, `public/privacy.html`.

**Interfeys/kontrakt:** `createAiRoutes(deps): Record<string, RouteHandler>` barcha yetti route’ni bir xil tartibda tekshiradi: identity → consent/version/provider → config/kill switch → atomic quota → minimal data → provider. Gate rad etsa provider mock call count aniq `0`.

- [ ] Route matrix bo‘yicha har route uchun consent bor, yo‘q, revoke qilingan, eski version, boshqa account va quota exhausted testlarini yozing.
- [ ] Failing testni ishga tushiring: `npm test -- server/ai-routes.test.ts`.
- [ ] Handlerlarni yagona middleware orqali ulang; memory va translation “ichki” deb gate’dan chiqarilmasin.
- [ ] `/api/live/token` hozir disabled javob bersin va legacy Gemini Developer ephemeral token bermasin; browser direct Live traffic yo‘li qolmasin.
- [ ] Provider xatosida no-Google fallback qilmasdan text-only yoki xavfsiz xato qaytaring; raw audio, transcript, prompt, memory va secret logga yozilmasin.
- [ ] Privacy regression testini runtime provider registry va `public/privacy.html` provider/data-field bayonlari bilan moslang.
- [ ] `npm test -- server/ai-routes.test.ts server/tutor.test.ts server/voice.test.ts` va `npm run build`ni bajaring.
- [ ] Commit: `git add server/ai-routes.ts server/ai-routes.test.ts server/main.ts server/tutor.ts server/voice.ts public/privacy.html && git commit -m "feat(ai): gate all routes by consent and quota"`.

## Task 6: Cloud STT transcript review va baholash himoyasi

**Fayllar:** yangi yoki o‘zgartiriladigan `src/engine/voice/stt.ts`, `src/engine/voice/call.ts`, `src/screens/voice/FeedbackView.tsx`, `server/voice.ts`, `server/voice.test.ts` va kerak bo‘lsa `server/ai-provider.ts` testlari.

**Interfeys/kontrakt:** `SttResult = { text: string; detectedLanguage: 'uz-UZ' | 'fr-FR' | 'unknown'; confidence?: number; alternatives: string[]; reviewReasons: string[] }`. Confidence yo‘q/past, zid alternatives, noto‘g‘ri til, maqsad iboraga sezgir farq, shovqin yoki Uzbek–French code-switch review sababini beradi.

- [ ] Kamida 30 ta belgilangan Uzbek, French va mixed audio fixture/metadata test to‘plami uchun test kontraktini yozing; haqiqiy paid STT request ishlatmang.
- [ ] Failing test yozing: review talab qilingan transcript user confirm/edit/re-record qilmaguncha tutor, score, correction va memory chaqirilmasin.
- [ ] Failing testni ishga tushiring: `npm test -- server/voice.test.ts`.
- [ ] Cloud STT natijasini review state’iga o‘giring; transcript UI edit, re-record va cancel tugmalarini ko‘rsatsin.
- [ ] Confirm faqat user tasdiqlagan matnni keyingi routega uzatsin; corrected transcript ham tasdiqsiz baholanmasin.
- [ ] `SpeechRecognition` va `HybridStt` fallbacklarini yangi oqimdan olib tashlang; mixed mode Live’ga yuborilmasin.
- [ ] Confidence sonli thresholdi spetsifikatsiyada belgilanmaganini saqlang; threshold keyin kalibrlanadigan configuration bo‘lsin, hozir uydirma raqam kiritmang.
- [ ] Fokuslangan STT/review testlarini va `npm run build`ni bajaring.
- [ ] Commit: `git add server/voice.ts server/voice.test.ts src/engine/voice/stt.ts src/engine/voice/call.ts src/screens/voice/FeedbackView.tsx && git commit -m "feat(voice): require transcript review before scoring"`.

## Task 7: Tutor xatti-harakati, semantic cue wire format va TTS cascade

**Fayllar:** `server/tutor.ts`, `server/tutor.test.ts`, `server/voice.ts`, `src/engine/tutor.ts`, `src/engine/voice/tts.ts`, `src/engine/voice/call.ts`, yangi `server/vivi-cues.ts` va testlari.

**Interfeys/kontrakt:** Tutor text va cue alohida SSE event bo‘ladi: `{t: string}` va `{cue: ViviCue}`. Raw model action string frontend animationini bevosita ishga tushirmaydi. TTS xatosi yoki sifati yetarli emasligi text-only natijaga olib keladi.

- [x] Failing tutor regression testlarini yozing: A1–C2 French practice, tabiiy qisqa Uzbek explanation, optional hazil, maqbul French variantni rad etmaslik va bir turn’da ko‘pi bilan bitta muhim correction.
- [x] Failing testni ishga tushiring: `npm test -- server/tutor.test.ts`.
- [x] Prompt contractni `server/tutor.ts` va `server/voice.ts`da bir xil qiling; majburiy hazil, kamsituvchi gap yoki taqiqlangan cue so‘ralmasin.
- [x] Structured JSON cue’ni server validatoridan o‘tkazing va text eventdan alohida yuboring.
- [x] Ketma-ket cascade’ni saqlang: tasdiqlangan transcript → Gemini text → Gemini TTS. TTS fail bo‘lsa response matni va foydalanuvchi davom etish yo‘li qoladi.
- [x] Kamida 20 ta Uzbek/mixed TTS javob uchun insoniy audio baholash gate’ini hujjatlang; haqiqiy audio request bu ishda bajarilmaydi.
- [x] Fokuslangan tutor/voice testlari, typecheck va buildni bajaring.
- [ ] Commit: `git add server/tutor.ts server/tutor.test.ts server/voice.ts src/engine/tutor.ts src/engine/voice/tts.ts src/engine/voice/call.ts server/vivi-cues.ts server/vivi-cues.test.ts && git commit -m "feat(tutor): add validated cue and text-only voice cascade"`.

## Task 8: Bitta Vivi schema va taniladigan mushuk animation-i

**Fayllar:** yangi `src/shared/vivi-cue.ts`, `src/shared/vivi-cue.test.ts`, `server/vivi-cues.ts`, `server/vivi-cues.test.ts`; o‘zgartirish `src/components/Mascot.tsx`, `src/components/KruaLive.tsx`, `src/engine/voice/markers.ts`, `src/styles.css`, `src/screens/voice/VoiceCall.tsx`, `src/screens/voice/LiveCall.tsx`.

**Interfeys/kontrakt:** `ViviCue` state: `idle|listening|thinking|speaking`; face: `neutral|happy|amused|curious|confused|surprised|supportive|proud`; action: `blink|head_tilt|ear_perk|tail_wag|giggle|hop|wave`; ixtiyoriy bitta ornament: `sparkle|thought_dots|heart`. `validateViviCue(value): ViviCue` unknown qiymatni neutralga tushiradi.

- [x] Failing schema testlarini yozing: barcha whitelist qiymatlari o‘tadi; `angry`, `slap`, `punch`, `spit`, `flip`, arbitrary code, sound-effect command va shape morphing rad etiladi.
- [x] Failing testni ishga tushiring: `npm test -- src/shared/vivi-cue.test.ts server/vivi-cues.test.ts`.
- [x] Server va client ayni versioned schema/validatorni ishlatsin; unknown cue `neutral` bo‘lsin.
- [x] Mascot mapping faqat semantic cue’dan foydalanib, Vivi siluetini mushukcha qilib qoldirsin; tanani boshqa shaklga aylantiruvchi animatsiyalarni olib tashlang.
- [x] Listening’da quloq, thinking’da bosh qiyshayishi/thought dots, speaking’da audio og‘iz, to‘g‘ri javobda yengil hop, hazilda yumshoq giggle va support’da tail/ko‘z mappingini belgilang.
- [x] `prefers-reduced-motion`da kuchli animatsiya va motion effect’lar kamaytirilishini test/CSS bilan tekshiring.
- [x] Fokuslangan schema/UI testlari va buildni bajaring.
- [ ] Commit: `git add src/shared/vivi-cue.ts src/shared/vivi-cue.test.ts server/vivi-cues.ts server/vivi-cues.test.ts src/components/Mascot.tsx src/components/KruaLive.tsx src/engine/voice/markers.ts src/styles.css src/screens/voice/VoiceCall.tsx src/screens/voice/LiveCall.tsx && git commit -m "feat(vivi): enforce safe mascot cue schema"`.

## Task 9: Vertex Live-ni POC gacha o‘chirish

**Fayllar:** `server/ai-config.ts`, `server/ai-config.test.ts`, `server/ai-routes.ts`, `server/ai-routes.test.ts`, `server/main.ts`, `src/engine/voice/live.ts`, `src/screens/voice/LiveCall.tsx`.

**Interfeys/kontrakt:** `liveEnabled` qat’iy `false`; `/api/live/token` token bermaydi va Gemini Developer API ephemeral-token oqimini Vertex auth deb ko‘rsatmaydi. Browser Vertex WebSocket’ga bevosita ulanmaydi.

- [x] Failing regression test yozing: client Live token so‘rasa disabled javob, provider call count `0`, browser bundleda secret/token yo‘q.
- [x] Failing testni ishga tushiring: `npm test -- server/ai-config.test.ts server/ai-routes.test.ts src/engine/voice/live.test.ts`.
- [x] Live clientni disabled state va cascade yo‘liga ulang; Uzbek yoki mixed Uzbek–French turn Live’ga ketmasin.
- [x] Kelajak POC uchun faqat hujjatli gate’larni qoldiring: Node/hosting WebSocket, ADC server-only auth, user/session binding, revoke/cancel, timeout, atomic quota, location/lifecycle.
- [x] Bu vazifada haqiqiy Node/hosting WebSocket POC, GCP API enablement, billing yoki paid traffic bajarilmasligini saqlang.
- [x] Regression test va buildni bajaring.
- [x] Commit: `git add server/ai-config.ts server/ai-config.test.ts server/ai-routes.ts server/ai-routes.test.ts server/main.ts src/engine/voice/live.ts src/engine/voice/live.test.ts src/screens/voice/LiveCall.tsx && git commit -m "chore(live): keep Vertex Live disabled before POC"`.

## Task 10: Regression, rollout gate va yakuniy review

**Fayllar:** barcha yuqoridagi testlar; final regressiya uchun `server/ai-routes.test.ts`, `server/google-cloud-provider.test.ts`, hamda client-log discard’ini xatti-harakat bo‘yicha tekshirish uchun `server/client-log.ts`, `server/client-log.test.ts` va uning `server/main.ts` wiring’i; ichki rollout checklisti/report.

**Yakuniy test matritsasi:** yetti route uchun consent mavjud/yo‘q/revoke/old version/boshqa account; atomic quota concurrency va restart; fake provider transport; no-fallback; PII-free logging; Uzbek/French/mixed STT review; TTS cascade; correction limit; cue validator; reduced-motion; Live disabled.

- [x] Route-wide stale/revoked/wrong-scope/provider/cross-account regressions and fake-provider failure/cancel cases were added; every denied route asserts zero provider calls. The telemetry behavior test first failed because the testable handler did not exist. After independent review found a source-only production-wiring assertion, production and tests were changed to use a shared `registerClientLogRoute` helper, and tests now invoke the handler registered under the production route key.
- [x] Final full suite run after the shared registration-helper change: `npm test` PASS (24 files / 447 tests). `npm run typecheck` and `npm run build` PASS; no real Google credential, model request, or paid audio/text request was used.
- [x] Fixture/review evidence checked: 38 synthetic STT metadata cases and a 24-item Uzbek/mixed TTS text checklist exist. These are not recorded-audio fixtures or human TTS quality results; owner listening remains a release gate.
- [x] Fake transport/status, abort, auth, quota, and duplicate-attempt checks are covered; Task 4’s no-retry ruling remains because no provider idempotency contract is documented.
- [x] Privacy/logging regressions invoke the handler registered by the shared production helper and cover generic responses, rate-limit-before-read, the 4096-byte limit, body discard and console spies; sanitized upstream errors, route payload minimization, and runtime/privacy disclosure alignment are also covered.
- [x] `npm test`, `npm run typecheck`, `npm run build` ran sequentially and PASSed; `git diff --check` PASS.
- [ ] **Rollout gate NOT CLEARED:** automated consent/version/revoke, mocked quota/kill-switch, Google-only fake boundary, STT review, cue whitelist/reduced-motion tests PASS; however production shared-durable quota, actual Google/ADC/model/location/quota readiness are unverified, human TTS quality review is outstanding, and Live remains disabled. Provider and route readiness flags must remain `false`.
- [x] Failed release gates leave provider routes unavailable; local course/lesson materials remain available. AI provider operation and rollout remain stopped.
- [x] No staging/production deploy, Google API enablement, billing change, positive quota, real model/audio request, external Live POC, or paid traffic was performed; each remains subject to separate owner approval.
- [x] After independent ACCEPT, inspected `git status --short` and `git diff --cached`, staged only the Task 10 tests and approved plan/progress files, ran `git diff --cached --check`, and committed as `test(ai): add rollout gates for consent quota voice and vivi`. No secrets or unrelated files were staged.

## Rolloutdan oldingi qat’iy taqiqlar va tasdiq nuqtalari

1. Google Cloud API yoqilmaydi va billing o‘zgartirilmaydi.
2. Haqiqiy model ID, credential, location yoki quota qiymati tekshirilmasdan production configga kiritilmaydi.
3. Paid request, haqiqiy STT/TTS audio, haqiqiy Live POC va deploy bajarilmaydi.
4. Live `disabled` bo‘lib qoladi; browser direct token, service-account yoki API secret berilmaydi.
5. Google provider xatosi OpenAI-compatible, Azure, ElevenLabs, browser STT yoki boshqa yashirin provider bilan qoplanmaydi.
6. Consent durable, versioned, scope/provider-specific va revoke qilinadigan bo‘lmasa AI route ochilmaydi.
7. Quota shared atomic store va fail-closed bo‘lmasa provider call ochilmaydi; process-local map yoki Budget alert hard cap deb olinmaydi.
8. Transcript user tomonidan ko‘rilib tasdiqlanmasa Uzbek/French/mixed nutqdan score, correction yoki memory chiqarilmaydi.
9. Vivi faqat xavfsiz whitelist cue’larini qabul qiladi; original mushukcha silueti va reduced-motion qoidasiga rioya qiladi.
10. Shu rejaning o‘zi external amallarga ruxsat bermaydi; har bir keyingi approval alohida qayd etiladi.
