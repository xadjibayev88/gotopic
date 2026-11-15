# AI ustoz: 20–30 soniyalik kutish tuzatmasi

Chrome skrinshotlari eski published `0fb55c3` versiyasini ko‘rsatadi. Yangi fon va vazifalar faqat Preview’da; owner yangi publicationni rad etgan. Chrome/PWA/APK’dagi production manzil yangilanmagan.

Oldingi ovoz route’i avval koreyscha plain-text Gemini, keyin TTS tugashi, keyin 12 soniyagacha ikkinchi Gemini feedback/translation so‘rovini kutgan. TTS xatosida browser yana Gemini JSON so‘rovi qilgan. Bu ketma-ketlik olib tashlandi: bitta Gemini JSON oqimi ko, uz, fixes maydonlarini beradi; TTS alohida va parallel. Ovoz ishlamasa, shu javob qurilma ovozi yoki matnga o‘tadi — ikkinchi model chaqiruvi yo‘q.

Qo‘shimcha: 768 output-token, minimal thinking, ko→uz→fixes tartibi, 1 soniyalik AI navbati, 200 ms tabiiy ovoz lease urinishi, 2 soniyalik WS connect limiti, 8 soniyalik first-text deadline, 20–22 soniyalik umumiy abort. UI koreyscha va o‘zbekcha partialni darhol chizadi; ijro tugashi microphone uchun kutiladi, lekin tarjima uchun emas.

Ichki ovoz hold’i har safar 400 belgi bo‘lgan; kuzatilgan user/global bucket 916, individual cap 1000 edi. Kichik qolgan quota mos reservation oladi; TTS’ga matn yuborilmagan xato hold’lari qaytariladi. Haqiqiy provider hisobida 82/10 000 belgi qayd etilgan. Provider tariflari yoki oldingi hisoblagichlar o‘zboshimchalik bilan reset qilinmagan.

Haqiqiy yangi text smoke-testda first Korean 2060 ms, first Uzbek 2298 ms, full JSON 2513 ms. Ikkinchi qisqa greeting testida first text 7748 ms, full 8091 ms. Bitta natural-voice smoke-test first-text deadline bilan to‘xtadi; shuning uchun barcha tarmoq/model/TTS holatlarida 2 soniya yoki tabiiy ovoz doim ishlaydi deb va’da berilmaydi. Provider kechiksa kutish chegaralanadi va sabab ko‘rsatiladi.

Gemini structured JSON streaming va thinking konfiguratsiyasi rasmiy manbalardan tekshirildi.[1] [2]

## References
[1]: https://aistudio.google.com/docs/models/gemini-3.1-flash-lite "Gemini 3.1 Flash-Lite model guide"
[2]: https://ai.google.dev/gemini-api/docs/structured-output "Gemini structured output and streaming"
