# MOTION.md — Go Topic

Har qanday video, animatsiya yoki harakatli grafika qilishdan oldin shu faylni to'liq o'qing. Ranglar `brand.md` dan, harakat qoidalari shu yerdan olinadi. Namuna kadrlar: `media/motion-examples/ref-1…5.jpg`.

## 1. Ranglar
| Hex | Vazifasi |
|---|---|
| `#0B0D24` | Asosiy qorong'i fon (tungi sahnalar, yakuniy logo kartasi) |
| `#12153A` | Qorong'i fondagi kartalar, shisha panellar osti |
| `#F3F1FB` | Yorug' fon (kunduzgi, UI sahnalari) |
| `#E9E6F8` | Yorug' fondagi kartalar |
| `#B49CFF` / `#7B5CF0` | Asosiy binafsha: tugmalar, faol holat, gradient boshi (qorong'i / yorug' fonda) |
| `#FF8FD0` / `#E0479E` | Pushti urg'u: bitta asosiy so'z, kursor nuri, gradient oxiri |
| `#FFD23F` / `#E0A100` | Oltin: faqat XP, mukofot, seriya |
| `#EEF0FF` / `#1A1640` | Matn |

Gradient faqat binafsha → pushti (ref-1 va ref-3 dagi iridessent nur kabi). Fon gradienti — sekin harakatlanuvchi yumshoq nur, «tayyor shablon» gradienti emas.

## 2. Shrift va o'lchamlar
- Sarlavha: Unbounded 800–900, kadr kengligining 8–14% balandlikda. Bir kadrda 1–4 so'z.
- Matn va UI: Onest 500–700. UI ichidagi matn ≥ 28 px (1080 kenglikda).
- Koreyscha (Hangul) matn: Noto Sans KR 700–900 (Unbounded va Onest'da Hangul yo'q). Hangul — Go Topic'ning asosiy vizual qahramoni: ㅇ ㅁ ㅅ kabi harflarni shakl sifatida ishlating.
- Shu uchta shriftdan boshqasi yo'q.

## 3. Vaqt
- 9:16, 30 yoki 60 fps. Reels uzunligi 12–30 s.
- Birinchi 1 soniyada ilmoq: katta so'z yoki kursor bosishi.
- Har sahna 1.2–2.5 s, bitta g'oya. Bir holatda 0.5 s dan ortiq qotib turmaydi: doim sekin push-in yoki suzish bor.
- Kirish 0.35–0.6 s, chiqish 0.25–0.4 s (chiqish kirishdan tezroq).
- Musiqa zarbiga tushadi: kesish va urilishlar zarbda.
- Oxirida 1–1.5 s logo kartasi va havola.

## 4. Harakat
Namunalardan olingan asosiy usullar (har videoda kamida 3 tasi):
1. **Kursor bilan UI** (ref-2, ref-3, ref-5): kursor kirib keladi, tugmani bosadi (tugma 0.95 ga siqilib qaytadi), matn yoziladi, so'z belgilanadi.
2. **3D perspektivadagi suzuvchi ekranlar** (ref-3, ref-5): ilova ekranlari 15–30° egilib, chuqurlikda suzadi, kamera ular orasidan o'tadi.
3. **Sarlavha atrofidagi halqa** (ref-2, ref-4): darslar, so'zlar yoki kartalar sarlavha atrofida aylanadi va yig'iladi.
4. **Faol nuqtali ro'yxat** (ref-1): so'zlar ustma-ust, nuqta biridan boshqasiga sakraydi, faol so'z to'q, qolganlari xira.
5. **Niqobli va kinetik matn**: so'z chiziq yoki shakl ortidan chiqadi, harflar bo'linadi, matn keyingi sahnaga aylanadi.
6. **Shisha pill va nur** (ref-5): shisha tugma, ichida yumshoq binafsha-pushti shar.
7. **Bo'lim paneli** (ref-4): tepada yoki pastda Intro / Muammo / Yechim / Boshlash progress paneli.
8. **Logo morfi** (ref-3): oxirgi shakl Hori yoki logoga aylanadi.

His: dadil va quvnoq — Voilà'dan tezroq ritm, kattaroq urilishlar, yorqinroq urg'u.

Easing: eksponensial ease-out yoki kritik so'ndirilgan prujina; sakrovchi (bouncy) easing yo'q. Harakat xiraligi tezlik va yo'nalishga mos. Har sahna oldingisidan yasaladi: crossfade o'rniga morf, niqob, kamera o'tishi, urilish.

Ovoz: `media/sfx/` (whoosh — o'tish, click/pop — bosish, success — natija).

## 5. Tekstura va yakun
Yumshoq soyalar, katta radiusli kartalar (24–40 px), shisha panellar (fon xiraligi, ingichka oq chegara). Shovqin yoki eski plyonka teksturasi yo'q. Yakuniy kadr toza: logo, bitta qator, havola.

## 6. Hech qachon
1. Oddiy slayd-shou: rasm + matn + fade.
2. Crossfade va standart shablon o'tishlari (wipe, zoom-blur preset).
3. Sakrovchi, multfilmga o'xshash easing.
4. Bir kadrda 6 so'zdan ortiq matn yoki o'qib bo'lmaydigan mayda UI.
5. Brenddan tashqari ranglar, lens flare, uchqun portlashi, kamera titrashi.

## 7. To'g'ri qilinganiga misol (15 s, 9:16)
- 0.0–1.0 s: qorong'i fon, kursor kirib «안녕하세요» yozadi, Enter bosiladi.
- 1.0–3.0 s: Hangul harflari ㅇ ㅁ ㅅ shakllariga bo'linib, sarlavha atrofida halqa bo'lib aylanadi; markazda «Koreys tili — o'yin kabi».
- 3.0–6.0 s: shakllar 3D ustunlarga o'sib TOPIK 1 → 6 grafigiga aylanadi, raqamlar sanaladi.
- 6.0–9.0 s: grafik telefon ekraniga yig'iladi, ekran 20° egilib suzadi; kursor so'zni bosadi, lug'at kartasi ochiladi, +10 XP oltin.
- 9.0–12.0 s: Hori AI karta to'liq ekranga o'sadi, chat pufaklari zarb bilan chiqadi, shisha mikrofon shar yonadi.
- 12.0–15.0 s: shar Go Topic logosiga morf bo'ladi, ostida havola; oxirgi kadr birinchisiga ulanadi.

## ASK ME
- Ilova palitrasi ishlatilsinmi, yoki Go Topic showreel'idagi palitra (`#6D4AFF`, `#FF3B5C`, `#2BB8F0`) ham ruxsat etilsinmi?
- Musiqa: har safar `media/sfx/music` dan, yoki har video uchun alohida?
