// TOPIK uslubidagi mashqlar (eski Go Topic katalogidan). AVTOMATIK: python3 scripts/build-topik-data.py
// Rasmiy TOPIK savollari emas — mualliflik mashqlari. Savollarda birinchi variant to'g'ri javob.

export interface GramItem { q: string; a: string; options: string[]; why: string; cat: string }
export interface TextQ { q: string; options: string[] }
export interface TopikText { title: string; lines: { who: number; ko: string }[]; uz: string; qs: TextQ[] }

export const GRAM_CATS: string[] = ["Kelishiklar", "Bog'lama va inkor", "Zamonlar", "Sonlar va sanoq", "Bog'lovchilar", "Iltimos va istak", "TOPIK 3", "TOPIK 4", "TOPIK 5", "TOPIK 6"];
export const GRAMMAR: GramItem[] = [
 {
  "q": "저___ 학생이에요.",
  "a": "는",
  "options": [
   "는",
   "은",
   "를",
   "에"
  ],
  "why": "Mavzu qo'shimchasi: unlidan keyin «는», undoshdan keyin «은».",
  "cat": "Kelishiklar"
 },
 {
  "q": "선생님___ 한국 사람이에요.",
  "a": "은",
  "options": [
   "은",
   "는",
   "를",
   "에서"
  ],
  "why": "«선생님» undosh bilan tugaydi, shuning uchun «은».",
  "cat": "Kelishiklar"
 },
 {
  "q": "친구___ 와요.",
  "a": "가",
  "options": [
   "가",
   "이",
   "을",
   "에서"
  ],
  "why": "Ega qo'shimchasi: unlidan keyin «가», undoshdan keyin «이».",
  "cat": "Kelishiklar"
 },
 {
  "q": "저는 물___ 마셔요.",
  "a": "을",
  "options": [
   "을",
   "를",
   "이",
   "에"
  ],
  "why": "Tushum kelishigi: undosh bilan tugasa «을», unli bilan tugasa «를».",
  "cat": "Kelishiklar"
 },
 {
  "q": "저는 커피___ 좋아해요.",
  "a": "를",
  "options": [
   "를",
   "을",
   "은",
   "에서"
  ],
  "why": "«커피» unli bilan tugaydi, shuning uchun «를».",
  "cat": "Kelishiklar"
 },
 {
  "q": "저는 학교___ 가요.",
  "a": "에",
  "options": [
   "에",
   "을",
   "가",
   "하고"
  ],
  "why": "Yo'nalish bildirganda «에» qo'shiladi: maktabga.",
  "cat": "Kelishiklar"
 },
 {
  "q": "도서관___ 책을 읽어요.",
  "a": "에서",
  "options": [
   "에서",
   "에",
   "를",
   "이"
  ],
  "why": "Ish-harakat sodir bo'ladigan joy «에서» bilan keladi: kutubxonada.",
  "cat": "Kelishiklar"
 },
 {
  "q": "이것은 친구___ 책이에요.",
  "a": "의",
  "options": [
   "의",
   "을",
   "에",
   "도"
  ],
  "why": "«의» — qaratqich kelishigi: do'stimning kitobi.",
  "cat": "Kelishiklar"
 },
 {
  "q": "저___ 학생이에요.  (men ham)",
  "a": "도",
  "options": [
   "도",
   "는",
   "를",
   "에"
  ],
  "why": "«도» — «ham» ma'nosini beradi va 은/는 o'rniga keladi.",
  "cat": "Kelishiklar"
 },
 {
  "q": "친구___ 선물을 줘요.",
  "a": "에게",
  "options": [
   "에게",
   "에서",
   "을",
   "이"
  ],
  "why": "Kimgadir berilganda «에게» ishlatiladi: do'stimga.",
  "cat": "Kelishiklar"
 },
 {
  "q": "저는 학생___.",
  "a": "입니다",
  "options": [
   "입니다",
   "을",
   "에서",
   "하고"
  ],
  "why": "«입니다» — «...man/...dir» ma'nosidagi rasmiy bog'lama.",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "저는 의사___.",
  "a": "예요",
  "options": [
   "예요",
   "이에요",
   "을",
   "에서"
  ],
  "why": "Unlidan keyin «예요», undoshdan keyin «이에요».",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "이것은 책___.",
  "a": "이에요",
  "options": [
   "이에요",
   "예요",
   "를",
   "가"
  ],
  "why": "«책» undosh bilan tugaydi, shuning uchun «이에요».",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "저는 학생이 ___.  (emasman)",
  "a": "아니에요",
  "options": [
   "아니에요",
   "없어요",
   "안 해요",
   "못해요"
  ],
  "why": "«이/가 아니에요» — «... emas».",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "집에 고양이가 ___.  (bor)",
  "a": "있어요",
  "options": [
   "있어요",
   "이에요",
   "아니에요",
   "해요"
  ],
  "why": "«있어요» — bor, mavjud.",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "지금 시간이 ___.  (yo'q)",
  "a": "없어요",
  "options": [
   "없어요",
   "아니에요",
   "있어요",
   "안 해요"
  ],
  "why": "«없어요» — yo'q, mavjud emas.",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "저는 고기를 ___ 먹어요.  (yemayman)",
  "a": "안",
  "options": [
   "안",
   "아니",
   "없",
   "는"
  ],
  "why": "Fe'l oldidan «안» qo'yilsa inkor bo'ladi: yemayman.",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "저는 수영을 ___ 해요.  (qila olmayman)",
  "a": "못",
  "options": [
   "못",
   "아니",
   "없",
   "도"
  ],
  "why": "«못» — qila olmaslikni bildiradi.",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "«Bu nima?» koreyscha qanday bo'ladi?",
  "a": "이것은 뭐예요?",
  "options": [
   "이것은 뭐예요?",
   "여기는 어디예요?",
   "누구예요?",
   "얼마예요?"
  ],
  "why": "이것 — bu, 뭐 — nima.",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "여기는 ___예요?  (qayer)",
  "a": "어디",
  "options": [
   "어디",
   "누구",
   "언제",
   "얼마"
  ],
  "why": "어디 — qayer, 누구 — kim, 언제 — qachon, 얼마 — qancha.",
  "cat": "Bog'lama va inkor"
 },
 {
  "q": "«가다» fe'lining hozirgi zamon (hurmat) shakli qaysi?",
  "a": "가요",
  "options": [
   "가요",
   "갔어요",
   "갈 거예요",
   "가고"
  ],
  "why": "가다 → 가요 (boraman/boradi).",
  "cat": "Zamonlar"
 },
 {
  "q": "«하다» fe'lining hozirgi zamon shakli qaysi?",
  "a": "해요",
  "options": [
   "해요",
   "하요",
   "했어요",
   "할 거예요"
  ],
  "why": "하다 alohida o'zgaradi: 하다 → 해요.",
  "cat": "Zamonlar"
 },
 {
  "q": "«마시다» fe'lining hozirgi zamon shakli qaysi?",
  "a": "마셔요",
  "options": [
   "마셔요",
   "마시요",
   "마셨어요",
   "마실 거예요"
  ],
  "why": "ㅣ + 어요 = ㅕ요: 마시다 → 마셔요.",
  "cat": "Zamonlar"
 },
 {
  "q": "«먹다» fe'lining o'tgan zamon shakli qaysi?",
  "a": "먹었어요",
  "options": [
   "먹었어요",
   "먹어요",
   "먹을 거예요",
   "먹고"
  ],
  "why": "O'tgan zamon: -았/었어요. 먹다 → 먹었어요 (yedim).",
  "cat": "Zamonlar"
 },
 {
  "q": "«보다» fe'lining o'tgan zamon shakli qaysi?",
  "a": "봤어요",
  "options": [
   "봤어요",
   "봐요",
   "볼 거예요",
   "보고"
  ],
  "why": "보다 → 봤어요 (ko'rdim).",
  "cat": "Zamonlar"
 },
 {
  "q": "«하다» fe'lining o'tgan zamon shakli qaysi?",
  "a": "했어요",
  "options": [
   "했어요",
   "해요",
   "할 거예요",
   "하고"
  ],
  "why": "하다 → 했어요 (qildim).",
  "cat": "Zamonlar"
 },
 {
  "q": "어제 친구를 ___.",
  "a": "만났어요",
  "options": [
   "만났어요",
   "만나요",
   "만날 거예요",
   "만나고"
  ],
  "why": "«어제» — kecha, shuning uchun o'tgan zamon: 만났어요.",
  "cat": "Zamonlar"
 },
 {
  "q": "내일 한국에 ___.  (kelasi zamon)",
  "a": "갈 거예요",
  "options": [
   "갈 거예요",
   "갔어요",
   "가요",
   "가고"
  ],
  "why": "Kelasi zamon: -(으)ㄹ 거예요. Ertaga Koreyaga boraman.",
  "cat": "Zamonlar"
 },
 {
  "q": "«먹다» fe'lining kelasi zamon shakli qaysi?",
  "a": "먹을 거예요",
  "options": [
   "먹을 거예요",
   "먹었어요",
   "먹어요",
   "먹고"
  ],
  "why": "Undoshdan keyin -을 거예요: 먹을 거예요 (yeyman).",
  "cat": "Zamonlar"
 },
 {
  "q": "지금 책을 읽고 ___.  (o'qiyapman)",
  "a": "있어요",
  "options": [
   "있어요",
   "없어요",
   "해요",
   "이에요"
  ],
  "why": "«-고 있어요» — hozir davom etayotgan harakat.",
  "cat": "Zamonlar"
 },
 {
  "q": "사과 세 ___ 주세요.",
  "a": "개",
  "options": [
   "개",
   "명",
   "권",
   "마리"
  ],
  "why": "«개» — narsalar uchun sanoq so'zi.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "학생 두 ___ 있어요.",
  "a": "명",
  "options": [
   "명",
   "개",
   "권",
   "마리"
  ],
  "why": "«명» — odamlar uchun sanoq so'zi.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "책 한 ___ 샀어요.",
  "a": "권",
  "options": [
   "권",
   "명",
   "마리",
   "병"
  ],
  "why": "«권» — kitoblar uchun sanoq so'zi.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "고양이 세 ___ 있어요.",
  "a": "마리",
  "options": [
   "마리",
   "명",
   "권",
   "장"
  ],
  "why": "«마리» — hayvonlar uchun sanoq so'zi.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "물 한 ___ 주세요.",
  "a": "병",
  "options": [
   "병",
   "명",
   "권",
   "마리"
  ],
  "why": "«병» — shisha (idish) uchun sanoq so'zi.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "커피 두 ___ 주세요.",
  "a": "잔",
  "options": [
   "잔",
   "명",
   "권",
   "마리"
  ],
  "why": "«잔» — piyola yoki stakan uchun sanoq so'zi.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "저는 스무 ___이에요.  (yosh)",
  "a": "살",
  "options": [
   "살",
   "개",
   "명",
   "시"
  ],
  "why": "Yosh «살» bilan va koreys sonlari bilan aytiladi: 스무 살 — 20 yosh.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "지금 세 ___예요.  (soat)",
  "a": "시",
  "options": [
   "시",
   "분",
   "살",
   "개"
  ],
  "why": "Soat «시» va koreys sonlari bilan: 세 시 — soat uch. Daqiqa — «분».",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "«5 000 von» qanday aytiladi?",
  "a": "오천 원",
  "options": [
   "오천 원",
   "다섯천 원",
   "오백 원",
   "다섯 원"
  ],
  "why": "Pul sino-koreys sonlari bilan aytiladi: 오 (5) + 천 (1 000).",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "«Uchta olma» qanday aytiladi?",
  "a": "사과 세 개",
  "options": [
   "사과 세 개",
   "사과 삼 개",
   "사과 셋 개",
   "사과 세 명"
  ],
  "why": "Sanashda koreys sonlari ishlatiladi; 셋 sanoq so'zi oldidan «세» bo'ladi.",
  "cat": "Sonlar va sanoq"
 },
 {
  "q": "밥을 먹___ 커피를 마셔요.  (yeb, keyin)",
  "a": "고",
  "options": [
   "고",
   "지만",
   "서",
   "면"
  ],
  "why": "«-고» — ikki harakatni ketma-ket bog'laydi: «va».",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "한국어는 어렵___ 재미있어요.  (lekin)",
  "a": "지만",
  "options": [
   "지만",
   "고",
   "면",
   "러"
  ],
  "why": "«-지만» — «lekin, ammo».",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "비가 오___ 집에 있어요.  (agar)",
  "a": "면",
  "options": [
   "면",
   "고",
   "지만",
   "러"
  ],
  "why": "«-(으)면» — shart: «agar ... bo'lsa».",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "배가 고파___ 밥을 먹어요.  (sababli)",
  "a": "서",
  "options": [
   "서",
   "고",
   "면",
   "지만"
  ],
  "why": "«-아/어서» — sabab: qornim och bo'lgani uchun.",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "책을 사___ 서점에 가요.  (olish uchun)",
  "a": "러",
  "options": [
   "러",
   "고",
   "면",
   "지만"
  ],
  "why": "«-(으)러 가다» — biror ish qilgani bormoq.",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "저는 사과___ 바나나를 좋아해요.  (va)",
  "a": "하고",
  "options": [
   "하고",
   "에서",
   "을",
   "는"
  ],
  "why": "Otlarni bog'lashda «하고» ishlatiladi: olma va banan.",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "집___ 학교까지 걸어가요.",
  "a": "에서",
  "options": [
   "에서",
   "에게",
   "을",
   "도"
  ],
  "why": "Joy: «...에서 ...까지» — «...dan ...gacha».",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "아홉 시___ 다섯 시까지 일해요.",
  "a": "부터",
  "options": [
   "부터",
   "에게",
   "을",
   "도"
  ],
  "why": "Vaqt: «...부터 ...까지» — «...dan ...gacha».",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "Koreys gapida fe'l qayerda turadi?",
  "a": "Gap oxirida",
  "options": [
   "Gap oxirida",
   "Gap boshida",
   "Egadan keyin",
   "Istalgan joyda"
  ],
  "why": "O'zbek tilidagi kabi: ega — to'ldiruvchi — fe'l.",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "«Men non yeyman» qaysi gapda to'g'ri yozilgan?",
  "a": "저는 빵을 먹어요.",
  "options": [
   "저는 빵을 먹어요.",
   "저는 먹어요 빵을.",
   "먹어요 저는 빵을.",
   "빵을 저는을 먹어요."
  ],
  "why": "Tartib: 저는 (men) + 빵을 (nonni) + 먹어요 (yeyman).",
  "cat": "Bog'lovchilar"
 },
 {
  "q": "여기 앉___.  (o'tiring)",
  "a": "으세요",
  "options": [
   "으세요",
   "세요",
   "고",
   "면"
  ],
  "why": "Hurmatli iltimos: undoshdan keyin «-으세요», unlidan keyin «-세요».",
  "cat": "Iltimos va istak"
 },
 {
  "q": "이쪽으로 오___.  (keling)",
  "a": "세요",
  "options": [
   "세요",
   "으세요",
   "을",
   "는"
  ],
  "why": "«오다» unli bilan tugaydi: 오세요.",
  "cat": "Iltimos va istak"
 },
 {
  "q": "한국에 가고 ___.  (bormoqchiman)",
  "a": "싶어요",
  "options": [
   "싶어요",
   "있어요",
   "없어요",
   "해요"
  ],
  "why": "«-고 싶어요» — xohish: bormoqchiman.",
  "cat": "Iltimos va istak"
 },
 {
  "q": "같이 영화를 ___?  (ko'ramizmi)",
  "a": "볼까요",
  "options": [
   "볼까요",
   "봤어요",
   "보고",
   "봐서"
  ],
  "why": "«-(으)ㄹ까요?» — taklif: «...mizmi?»",
  "cat": "Iltimos va istak"
 },
 {
  "q": "저는 한국어를 ___ 수 있어요.  (gapira olaman)",
  "a": "할",
  "options": [
   "할",
   "하는",
   "한",
   "해"
  ],
  "why": "«-(으)ㄹ 수 있어요» — qila olish.",
  "cat": "Iltimos va istak"
 },
 {
  "q": "여기에서 사진을 찍___ 돼요?  (mumkinmi)",
  "a": "어도",
  "options": [
   "어도",
   "고는",
   "지만",
   "으러"
  ],
  "why": "«-아/어도 돼요» — ruxsat: «...sam maylimi?»",
  "cat": "Iltimos va istak"
 },
 {
  "q": "내일 일찍 일어나___ 해요.  (kerak)",
  "a": "야",
  "options": [
   "야",
   "도",
   "고",
   "면"
  ],
  "why": "«-아/어야 해요» — majburiyat: turishim kerak.",
  "cat": "Iltimos va istak"
 },
 {
  "q": "물 좀 ___.  (bering)",
  "a": "주세요",
  "options": [
   "주세요",
   "줬어요",
   "주고",
   "줄 거예요"
  ],
  "why": "«주세요» — «bering, iltimos».",
  "cat": "Iltimos va istak"
 },
 {
  "q": "도서관에서 떠들___ 마세요.  (shovqin qilmang)",
  "a": "지",
  "options": [
   "지",
   "고",
   "면",
   "서"
  ],
  "why": "«-지 마세요» — taqiq: «...mang».",
  "cat": "Iltimos va istak"
 },
 {
  "q": "«Yana bir marta ayting, iltimos» qanday bo'ladi?",
  "a": "다시 말해 주세요.",
  "options": [
   "다시 말해 주세요.",
   "천천히 가세요.",
   "잘 먹겠습니다.",
   "안녕히 계세요."
  ],
  "why": "다시 — yana, 말해 주세요 — aytib bering.",
  "cat": "Iltimos va istak"
 },
 {
  "q": "비가 올 ___ 같아요.  (yog'adiganga o'xshaydi)",
  "a": "것",
  "options": [
   "것",
   "수",
   "때",
   "줄"
  ],
  "why": "«-(으)ㄹ 것 같다» — taxmin: «...ga o'xshaydi».",
  "cat": "TOPIK 3"
 },
 {
  "q": "한국에 온 ___ 일 년이 됐어요.",
  "a": "지",
  "options": [
   "지",
   "데",
   "것",
   "때"
  ],
  "why": "«-(으)ㄴ 지» — «...ganiga (shuncha vaqt) bo'ldi».",
  "cat": "TOPIK 3"
 },
 {
  "q": "바쁘___ 못 갔어요.  (band bo'lganim uchun)",
  "a": "기 때문에",
  "options": [
   "기 때문에",
   "기 위해서",
   "는 동안",
   "자마자"
  ],
  "why": "«-기 때문에» — sabab.",
  "cat": "TOPIK 3"
 },
 {
  "q": "한국어를 배우___ 한국에 왔어요.  (o'rganish maqsadida)",
  "a": "기 위해서",
  "options": [
   "기 위해서",
   "기 때문에",
   "는데도",
   "더니"
  ],
  "why": "«-기 위해서» — maqsad: «... uchun».",
  "cat": "TOPIK 3"
 },
 {
  "q": "집에 도착하___ 전화할게요.  (yetib borishim bilanoq)",
  "a": "자마자",
  "options": [
   "자마자",
   "는데",
   "지만",
   "거나"
  ],
  "why": "«-자마자» — «...shi bilanoq».",
  "cat": "TOPIK 3"
 },
 {
  "q": "주말에 영화를 보___ 책을 읽어요.  (yoki)",
  "a": "거나",
  "options": [
   "거나",
   "자마자",
   "려고",
   "면서"
  ],
  "why": "«-거나» — «yoki».",
  "cat": "TOPIK 3"
 },
 {
  "q": "음악을 들으___ 공부해요.  (bir vaqtning o'zida)",
  "a": "면서",
  "options": [
   "면서",
   "러",
   "니까",
   "려면"
  ],
  "why": "«-(으)면서» — ikki harakat bir vaqtda.",
  "cat": "TOPIK 3"
 },
 {
  "q": "시간이 없으___ 택시를 탑시다.",
  "a": "니까",
  "options": [
   "니까",
   "어서",
   "러",
   "면서"
  ],
  "why": "Taklif yoki buyruq oldidan sabab «-(으)니까» bilan aytiladi.",
  "cat": "TOPIK 3"
 },
 {
  "q": "이 옷을 입어 ___ 돼요?  (kiyib ko'rsam maylimi)",
  "a": "봐도",
  "options": [
   "봐도",
   "줘도",
   "와도",
   "가도"
  ],
  "why": "«-아/어 보다» — sinab ko'rmoq.",
  "cat": "TOPIK 3"
 },
 {
  "q": "한국 음식을 먹어 ___ 적이 있어요.",
  "a": "본",
  "options": [
   "본",
   "볼",
   "보는",
   "봐"
  ],
  "why": "«-아/어 본 적이 있다» — tajriba: «...ib ko'rganman».",
  "cat": "TOPIK 3"
 },
 {
  "q": "열심히 공부했는___ 시험에 떨어졌어요.  (shunga qaramay)",
  "a": "데도",
  "options": [
   "데도",
   "동안",
   "대로",
   "만큼"
  ],
  "why": "«-는데도» — «...ga qaramay».",
  "cat": "TOPIK 4"
 },
 {
  "q": "친구 ___ 한국 생활에 빨리 적응했어요.  (yaxshi sabab, minnatdorlik)",
  "a": "덕분에",
  "options": [
   "덕분에",
   "때문에",
   "탓에",
   "대신에"
  ],
  "why": "«덕분에» — ijobiy sabab. «때문에» betaraf, «탓에» salbiy sabab.",
  "cat": "TOPIK 4"
 },
 {
  "q": "늦잠을 자는 ___ 지각했어요.  (kutilmagan salbiy sabab)",
  "a": "바람에",
  "options": [
   "바람에",
   "덕분에",
   "김에",
   "대신에"
  ],
  "why": "«-는 바람에» — kutilmagan sabab bilan yomon natija.",
  "cat": "TOPIK 4"
 },
 {
  "q": "시장에 가는 ___ 우유도 사 왔어요.  (yo'l-yo'lakay)",
  "a": "김에",
  "options": [
   "김에",
   "바람에",
   "탓에",
   "반면에"
  ],
  "why": "«-는 김에» — bir ishni qilayotib, yo'l-yo'lakay boshqasini ham.",
  "cat": "TOPIK 4"
 },
 {
  "q": "그 영화는 볼 ___ 해요.  (ko'rishga arziydi)",
  "a": "만",
  "options": [
   "만",
   "뿐",
   "수",
   "줄"
  ],
  "why": "«-(으)ㄹ 만하다» — «...ga arziydi».",
  "cat": "TOPIK 4"
 },
 {
  "q": "한국어를 할 ___ 알아요.  (qilishni bilaman)",
  "a": "줄",
  "options": [
   "줄",
   "만",
   "뿐",
   "것"
  ],
  "why": "«-(으)ㄹ 줄 알다» — biror ishni qilishni bilmoq.",
  "cat": "TOPIK 4"
 },
 {
  "q": "약을 먹었___ 좀 나아졌어요.",
  "a": "더니",
  "options": [
   "더니",
   "거든",
   "도록",
   "든지"
  ],
  "why": "«-았/었더니» — qilgan ishdan keyingi natija.",
  "cat": "TOPIK 4"
 },
 {
  "q": "아이가 자___ 조용히 하세요.  (uxlashi uchun)",
  "a": "도록",
  "options": [
   "도록",
   "더니",
   "거든",
   "느라고"
  ],
  "why": "«-도록» — «...shi uchun, ...digan qilib».",
  "cat": "TOPIK 4"
 },
 {
  "q": "숙제를 하___ 못 잤어요.  (qilish bilan band bo'lib)",
  "a": "느라고",
  "options": [
   "느라고",
   "도록",
   "더니",
   "거든"
  ],
  "why": "«-느라고» — bir ish bilan band bo'lib, boshqasi bo'lmay qoldi.",
  "cat": "TOPIK 4"
 },
 {
  "q": "선생님이 내일 시험이 있다___ 했어요.  (deb aytdi)",
  "a": "고",
  "options": [
   "고",
   "를",
   "에",
   "면"
  ],
  "why": "Bilvosita nutq: «-다고 하다» — «... deb aytdi».",
  "cat": "TOPIK 4"
 },
 {
  "q": "나이가 들___ 건강이 중요해져요.  (...gan sari)",
  "a": "수록",
  "options": [
   "수록",
   "망정",
   "지언정",
   "더라도"
  ],
  "why": "«-(으)ㄹ수록» — «...gan sari».",
  "cat": "TOPIK 5"
 },
 {
  "q": "아무리 바쁘___ 밥은 먹어야 해요.",
  "a": "더라도",
  "options": [
   "더라도",
   "다시피",
   "는 한",
   "거니와"
  ],
  "why": "«아무리 -더라도» — «qanchalik ... bo'lmasin».",
  "cat": "TOPIK 5"
 },
 {
  "q": "여러분도 아시___ 경제가 어렵습니다.  (bilganingizdek)",
  "a": "다시피",
  "options": [
   "다시피",
   "더라도",
   "기에",
   "고자"
  ],
  "why": "«-다시피» — «...ganingizdek».",
  "cat": "TOPIK 5"
 },
 {
  "q": "노력하지 않는 ___ 성공할 수 없다.  (shart)",
  "a": "한",
  "options": [
   "한",
   "채",
   "탓",
   "김"
  ],
  "why": "«-는 한» — «... ekan, toki ...».",
  "cat": "TOPIK 5"
 },
 {
  "q": "문제를 해결하___ 회의를 열었습니다.  (maqsadida, rasmiy)",
  "a": "고자",
  "options": [
   "고자",
   "다시피",
   "더라도",
   "길래"
  ],
  "why": "«-고자» — rasmiy uslubda maqsad.",
  "cat": "TOPIK 5"
 },
 {
  "q": "옷을 입은 ___ 잠이 들었어요.  (kiygan holda)",
  "a": "채",
  "options": [
   "채",
   "한",
   "척",
   "김"
  ],
  "why": "«-(으)ㄴ 채» — «...gan holda».",
  "cat": "TOPIK 5"
 },
 {
  "q": "그는 아무것도 모르는 ___했다.  (o'zini bilmaganga soldi)",
  "a": "척",
  "options": [
   "척",
   "채",
   "한",
   "탓"
  ],
  "why": "«-는 척하다» — o'zini «...ganga solmoq».",
  "cat": "TOPIK 5"
 },
 {
  "q": "값이 비싼 ___ 품질이 좋다.  (shunga yarasha)",
  "a": "만큼",
  "options": [
   "만큼",
   "채",
   "척",
   "김"
  ],
  "why": "«-(으)ㄴ 만큼» — «...ga yarasha, ...chalik».",
  "cat": "TOPIK 5"
 },
 {
  "q": "통계에 ___ 인구가 감소하고 있다.  (...ga ko'ra)",
  "a": "따르면",
  "options": [
   "따르면",
   "대해서",
   "비해서",
   "관해서"
  ],
  "why": "«-에 따르면» — «...ga ko'ra».",
  "cat": "TOPIK 5"
 },
 {
  "q": "환경 문제는 우리 모두의 책임이라고 하지 않을 수 ___.",
  "a": "없다",
  "options": [
   "없다",
   "있다",
   "않다",
   "아니다"
  ],
  "why": "«-지 않을 수 없다» — ikki karra inkor: «...maslik mumkin emas».",
  "cat": "TOPIK 5"
 },
 {
  "q": "단기적인 여론에 흔들리지 않고 장기적 관점에서 정책을 ___ 사회적 합의를 이끌어 내야 한다.",
  "a": "검토하더라도",
  "options": [
   "검토하더라도",
   "검토할수록",
   "검토하는 한",
   "검토하고자"
  ],
  "why": "-더라도 “... bo‘lsa ham” qarama-qarshi shartini beradi; gapda siyosatni ko‘rib chiqish qiyin bo‘lsa ham, kelishuv zarurligi aytilgan.",
  "cat": "TOPIK 6"
 },
 {
  "q": "본 연구는 지역 간 교육 격차의 구조적 원인을 규명___ 다양한 자료를 비교·분석하였다.",
  "a": "하고자",
  "options": [
   "하고자",
   "하더라도",
   "하는 한",
   "할수록"
  ],
  "why": "-고자 rasmiy yozuvda maqsadni, ya’ni “... maqsadida”ni bildiradi.",
  "cat": "TOPIK 6"
 },
 {
  "q": "정책의 성패는 예산 규모에만 달려 있는 ___ 집행 과정의 투명성에도 달려 있다.",
  "a": "것이 아니라",
  "options": [
   "것이 아니라",
   "채",
   "척",
   "탓에"
  ],
  "why": "것이 아니라 “... emas, balki ...” tuzilmasi bir omil bilan cheklanmaslikni bildiradi.",
  "cat": "TOPIK 6"
 },
 {
  "q": "검증되지 않은 정보가 반복적으로 유통될 ___ 공공기관에 대한 불신이 커질 수 있다.",
  "a": "경우",
  "options": [
   "수록",
   "경우",
   "채",
   "척"
  ],
  "why": "-을 경우 “... holatida” shartini bildiradi va oqibatni ehtiyotkor bayon qilishga mos.",
  "cat": "TOPIK 6"
 },
 {
  "q": "선행 연구를 종합해 ___ 이 가설은 특정 조건에서만 성립한다.",
  "a": "보면",
  "options": [
   "보면",
   "더라도",
   "채",
   "고자"
  ],
  "why": "-에 따르면 emas, bu gapdagi “종합해 ___”dan keyin xulosa chiqaruvchi “보면” shakli “qaralsa/ko‘rilsa” ma’nosini beradi.",
  "cat": "TOPIK 6"
 },
 {
  "q": "규제를 전면적으로 강화하기보다는 위험이 큰 영역에 우선 적용하는 방안을 ___ 한다.",
  "a": "바람직하다고",
  "options": [
   "바람직하다고",
   "불가피하다고",
   "뚜렷하다고",
   "지나치다고"
  ],
  "why": "바람직하다 “maqbul” degani; -다고 한다 shakli rasmiy taklifni baholash uchun mos.",
  "cat": "TOPIK 6"
 }
];
export const READING: TopikText[] = [
 {
  "title": "O'zim haqimda",
  "lines": [
   {
    "who": 0,
    "ko": "저는 알리입니다. 우즈베키스탄 사람입니다. 지금 서울에 살아요. 한국어를 공부해요. 한국 음식을 좋아해요."
   }
  ],
  "uz": "Men Aliman. O'zbekistonlikman. Hozir Seulda yashayman. Koreys tilini o'rganyapman. Koreys taomlarini yoqtiraman.",
  "qs": [
   {
    "q": "Ali qayerdan?",
    "options": [
     "O'zbekistondan",
     "Koreyadan",
     "Xitoydan",
     "Yaponiyadan"
    ]
   },
   {
    "q": "Ali hozir qayerda yashaydi?",
    "options": [
     "Seulda",
     "Toshkentda",
     "Pusanda",
     "Tokioda"
    ]
   },
   {
    "q": "Ali nimani yoqtiradi?",
    "options": [
     "Koreys taomlarini",
     "Futbolni",
     "Kinoni",
     "Qahvani"
    ]
   }
  ]
 },
 {
  "title": "Dam olish kuni",
  "lines": [
   {
    "who": 0,
    "ko": "저는 주말에 보통 친구를 만나요. 지난 토요일에는 친구와 같이 영화를 봤어요. 영화가 아주 재미있었어요. 영화를 본 후에 식당에서 비빔밥을 먹었어요. 다음 주말에는 산에 갈 거예요."
   }
  ],
  "uz": "Dam olish kunlari odatda do'stim bilan uchrashaman. O'tgan shanba do'stim bilan kino ko'rdik. Kino juda qiziqarli edi. Kinodan keyin restoranda bibimbap yedik. Keyingi dam olish kuni toqqa boraman.",
  "qs": [
   {
    "q": "O'tgan shanba nima qilishdi?",
    "options": [
     "Kino ko'rishdi",
     "Toqqa chiqishdi",
     "Uyda dam olishdi",
     "Bozorga borishdi"
    ]
   },
   {
    "q": "Kinodan keyin nima yeyishdi?",
    "options": [
     "Bibimbap",
     "Kimchi",
     "Non",
     "Tovuq"
    ]
   },
   {
    "q": "Keyingi dam olish kuni qayerga boradi?",
    "options": [
     "Toqqa",
     "Dengizga",
     "Kinoga",
     "Kutubxonaga"
    ]
   }
  ]
 },
 {
  "title": "Sport va sog'liq",
  "lines": [
   {
    "who": 0,
    "ko": "요즘 건강을 위해서 운동을 시작하는 사람이 많습니다. 하지만 처음부터 무리하게 운동하면 오히려 몸에 좋지 않습니다. 자기에게 맞는 운동을 골라서 조금씩 시간을 늘리는 것이 좋습니다. 그리고 운동하기 전에 준비 운동을 꼭 해야 합니다."
   }
  ],
  "uz": "Hozirgi kunda sog'liq uchun sport bilan shug'ullanishni boshlayotganlar ko'p. Lekin boshidanoq haddan tashqari ko'p mashq qilish, aksincha, tanaga zarar. O'ziga mos mashqni tanlab, vaqtni oz-ozdan ko'paytirgan ma'qul. Mashqdan oldin albatta badan qizdirish kerak.",
  "qs": [
   {
    "q": "Matn nima haqida?",
    "options": [
     "To'g'ri sport qilish haqida",
     "Koreys taomlari haqida",
     "Kasalxona haqida",
     "Sayohat haqida"
    ]
   },
   {
    "q": "Boshidanoq haddan tashqari ko'p mashq qilish qanday?",
    "options": [
     "Tanaga zarar",
     "Juda foydali",
     "Majburiy",
     "Qiziqarli"
    ]
   },
   {
    "q": "Mashqdan oldin nima qilish kerak?",
    "options": [
     "Badan qizdirish",
     "Ko'p ovqat yeyish",
     "Uxlab olish",
     "Dori ichish"
    ]
   }
  ]
 },
 {
  "title": "Yolg'iz yashovchilar va xarid",
  "lines": [
   {
    "who": 0,
    "ko": "최근 혼자 사는 사람들이 늘어나면서 소비 방식도 달라지고 있다. 대형 마트 대신 집 근처 편의점에서 조금씩 사는 사람이 많아졌고, 한 사람을 위한 작은 포장 상품도 인기를 얻고 있다. 전문가들은 이러한 변화가 앞으로도 계속될 것으로 예상하고 있다."
   }
  ],
  "uz": "So'nggi paytlarda yolg'iz yashaydiganlar ko'paygani sari iste'mol usuli ham o'zgarmoqda. Katta market o'rniga uy yaqinidagi kichik do'kondan oz-ozdan xarid qiladiganlar ko'paydi, bir kishiga mo'ljallangan kichik qadoqli mahsulotlar ham ommalashmoqda. Mutaxassislar bu o'zgarish bundan keyin ham davom etadi deb taxmin qilmoqda.",
  "qs": [
   {
    "q": "Iste'mol usuli nega o'zgarmoqda?",
    "options": [
     "Yolg'iz yashaydiganlar ko'paygani uchun",
     "Narxlar tushgani uchun",
     "Marketlar yopilgani uchun",
     "Aholi kamaygani uchun"
    ]
   },
   {
    "q": "Qanday mahsulotlar ommalashmoqda?",
    "options": [
     "Kichik qadoqli mahsulotlar",
     "Katta qadoqli mahsulotlar",
     "Qimmat mahsulotlar",
     "Chet el mahsulotlari"
    ]
   },
   {
    "q": "Mutaxassislar fikricha, bu o'zgarish…",
    "options": [
     "Davom etadi",
     "Tez orada to'xtaydi",
     "Zararli",
     "Tasodifiy"
    ]
   }
  ]
 },
 {
  "title": "Texnologiya va uning oqibatlari",
  "lines": [
   {
    "who": 0,
    "ko": "기술의 발전은 우리 생활을 편리하게 만들었지만 그에 따른 부작용도 적지 않다. 특히 스마트폰에 지나치게 의존하는 현상은 세대를 가리지 않고 나타나고 있다. 이를 극복하기 위해서는 개인의 노력뿐만 아니라 사회적인 대책도 함께 마련되어야 한다는 주장이 설득력을 얻고 있다."
   }
  ],
  "uz": "Texnologiya rivoji hayotimizni qulay qildi, ammo uning salbiy oqibatlari ham kam emas. Ayniqsa, smartfonga haddan tashqari bog'lanib qolish hodisasi barcha avlodlarda kuzatilmoqda. Buni yengish uchun shaxsning harakatigina emas, jamiyat miqyosidagi choralar ham ishlab chiqilishi kerak degan fikr tobora ko'proq qo'llab-quvvatlanmoqda.",
  "qs": [
   {
    "q": "Muallif qaysi muammoni ta'kidlaydi?",
    "options": [
     "Smartfonga haddan tashqari bog'lanish",
     "Texnologiyaning qimmatligi",
     "Internetning sekinligi",
     "Ishsizlik"
    ]
   },
   {
    "q": "Bu hodisa kimlarda kuzatiladi?",
    "options": [
     "Barcha avlodlarda",
     "Faqat yoshlarda",
     "Faqat keksalarda",
     "Faqat bolalarda"
    ]
   },
   {
    "q": "Yechim sifatida nima taklif qilinadi?",
    "options": [
     "Shaxsiy harakat va jamiyat choralari birga",
     "Smartfonni taqiqlash",
     "Faqat shaxsiy harakat",
     "Hech narsa qilmaslik"
    ]
   }
  ]
 },
 {
  "title": "Raqamli xizmatlar va adolat",
  "lines": [
   {
    "who": 0,
    "ko": "공공 서비스의 디지털화는 처리 속도와 행정 효율을 높였지만, 모든 시민이 동일한 수준의 접근성을 확보한 것은 아니다. 고령층이나 장애인처럼 디지털 기기 활용에 제약이 있는 사람들은 오히려 서비스 이용에서 배제될 수 있다. 따라서 효율성만을 성과로 내세우기보다 대면 지원과 보조 수단을 병행하는 포용적 전환이 요구된다."
   }
  ],
  "uz": "Davlat xizmatlarini raqamlashtirish tezlik va samaradorlikni oshirdi, biroq barcha fuqarolar bir xil kirish imkoniga ega emas. Keksalar yoki nogironligi bo‘lganlar xizmatdan chetda qolishi mumkin. Shu sabab samaradorlik bilan cheklanmay, yuzma-yuz yordam va qo‘shimcha vositalarni birga qo‘llash zarur.",
  "qs": [
   {
    "q": "Muallif qanday yondashuvni talab qiladi?",
    "options": [
     "Faqat raqamli xizmatlarni tezlashtirishni",
     "Raqamli o‘tishni yuzma-yuz yordam bilan inklyuziv qilishni",
     "Keksalar uchun barcha xizmatlarni yopishni",
     "Samaradorlikni baholashdan voz kechishni"
    ]
   }
  ]
 }
];
export const LISTENING: TopikText[] = [
 {
  "title": "Kafeda",
  "lines": [
   {
    "who": 0,
    "ko": "안녕하세요? 뭘 드릴까요?"
   },
   {
    "who": 1,
    "ko": "커피 한 잔 주세요."
   },
   {
    "who": 0,
    "ko": "네, 삼천 원입니다."
   },
   {
    "who": 1,
    "ko": "여기 있어요. 감사합니다."
   }
  ],
  "uz": "— Assalomu alaykum, nima beray? — Bir piyola qahva bering. — Xo'p, uch ming von. — Marhamat. Rahmat.",
  "qs": [
   {
    "q": "Mijoz nima buyurdi?",
    "options": [
     "Qahva",
     "Choy",
     "Suv",
     "Sut"
    ]
   },
   {
    "q": "Nechta buyurdi?",
    "options": [
     "Bitta",
     "Ikkita",
     "Uchta",
     "To'rtta"
    ]
   },
   {
    "q": "Narxi qancha?",
    "options": [
     "3 000 von",
     "300 von",
     "30 000 von",
     "13 000 von"
    ]
   }
  ]
 },
 {
  "title": "Ertangi reja",
  "lines": [
   {
    "who": 0,
    "ko": "민수 씨, 내일 뭐 할 거예요?"
   },
   {
    "who": 1,
    "ko": "내일은 도서관에서 공부할 거예요. 다음 주에 시험이 있어요."
   },
   {
    "who": 0,
    "ko": "그래요? 그럼 저녁에 같이 밥 먹을까요?"
   },
   {
    "who": 1,
    "ko": "좋아요. 여섯 시에 학교 앞에서 만나요."
   }
  ],
  "uz": "— Minsu, ertaga nima qilasiz? — Ertaga kutubxonada dars qilaman. Keyingi hafta imtihon bor. — Shundaymi? Unda kechqurun birga ovqatlanamizmi? — Mayli. Soat oltida maktab oldida uchrashamiz.",
  "qs": [
   {
    "q": "Minsu ertaga nima qiladi?",
    "options": [
     "Kutubxonada dars qiladi",
     "Kinoga boradi",
     "Ishlaydi",
     "Uyda dam oladi"
    ]
   },
   {
    "q": "Imtihon qachon?",
    "options": [
     "Keyingi hafta",
     "Ertaga",
     "Bugun",
     "Keyingi oy"
    ]
   },
   {
    "q": "Ular qayerda uchrashadi?",
    "options": [
     "Maktab oldida",
     "Kutubxonada",
     "Restoranda",
     "Uyda"
    ]
   }
  ]
 },
 {
  "title": "Charchoq",
  "lines": [
   {
    "who": 0,
    "ko": "요즘 왜 이렇게 피곤해 보여요?"
   },
   {
    "who": 1,
    "ko": "회사 일이 많아서 매일 늦게까지 일하거든요."
   },
   {
    "who": 0,
    "ko": "그러면 건강이 나빠질 수 있으니까 주말에는 꼭 쉬세요."
   },
   {
    "who": 1,
    "ko": "네, 이번 주말에는 아무것도 안 하고 집에서 쉬려고요."
   }
  ],
  "uz": "— Keyingi paytda nega bunchalik charchagan ko'rinasiz? — Ishxonada ish ko'p, har kuni kechgacha ishlayman-da. — Unda sog'lig'ingiz yomonlashishi mumkin, dam olish kunlari albatta dam oling. — Ha, bu dam olish kuni hech narsa qilmay uyda dam olmoqchiman.",
  "qs": [
   {
    "q": "U nega charchagan?",
    "options": [
     "Har kuni kechgacha ishlagani uchun",
     "Kasal bo'lgani uchun",
     "Kechasi uxlamagani uchun",
     "Sayohatdan kelgani uchun"
    ]
   },
   {
    "q": "Unga qanday maslahat berildi?",
    "options": [
     "Dam olish kunlari dam olish",
     "Shifokorga borish",
     "Ishdan ketish",
     "Sport qilish"
    ]
   },
   {
    "q": "Bu dam olish kuni nima qilmoqchi?",
    "options": [
     "Uyda dam oladi",
     "Ishlaydi",
     "Toqqa chiqadi",
     "Do'sti bilan uchrashadi"
    ]
   }
  ]
 },
 {
  "title": "Binodagi e'lon",
  "lines": [
   {
    "who": 0,
    "ko": "안내 말씀 드리겠습니다. 오늘 오후 두 시부터 네 시까지 엘리베이터 점검이 있을 예정입니다."
   },
   {
    "who": 0,
    "ko": "점검하는 동안에는 엘리베이터를 이용하실 수 없으니 계단을 이용해 주시기 바랍니다. 불편을 드려 죄송합니다."
   }
  ],
  "uz": "E'lon. Bugun tushdan keyin soat ikkidan to'rtgacha liftni tekshirish rejalashtirilgan. Tekshiruv vaqtida liftdan foydalanib bo'lmaydi, zinadan foydalanishingizni so'raymiz. Noqulaylik uchun uzr.",
  "qs": [
   {
    "q": "E'lon nima haqida?",
    "options": [
     "Lift tekshiruvi",
     "Suv o'chirilishi",
     "Yong'in mashqi",
     "Yig'ilish"
    ]
   },
   {
    "q": "Qachon bo'ladi?",
    "options": [
     "14:00 dan 16:00 gacha",
     "12:00 dan 14:00 gacha",
     "16:00 dan 18:00 gacha",
     "Ertaga ertalab"
    ]
   },
   {
    "q": "Odamlardan nima so'raladi?",
    "options": [
     "Zinadan foydalanish",
     "Uyda qolish",
     "Kutib turish",
     "Qo'ng'iroq qilish"
    ]
   }
  ]
 },
 {
  "title": "Masofadan ishlash",
  "lines": [
   {
    "who": 0,
    "ko": "재택근무가 확대되면서 생산성이 떨어진다는 지적이 있는데, 어떻게 생각하십니까?"
   },
   {
    "who": 1,
    "ko": "저는 그렇게 보지 않습니다. 출퇴근 시간이 줄어든 만큼 업무에 집중할 수 있는 시간이 오히려 늘어났다고 봅니다."
   },
   {
    "who": 1,
    "ko": "다만 직원 간의 소통이 부족해질 수 있으므로 이를 보완할 제도가 필요합니다."
   }
  ],
  "uz": "— Masofadan ishlash kengaygani sari mehnat unumdorligi pasayadi degan tanqid bor, siz qanday fikrdasiz? — Men bunday deb o'ylamayman. Ishga borib-kelish vaqti qisqargani evaziga ishga diqqat qaratish vaqti, aksincha, ko'paydi. Biroq xodimlar o'rtasida muloqot kamayishi mumkin, shuning uchun buni to'ldiradigan tizim kerak.",
  "qs": [
   {
    "q": "Suhbat nima haqida?",
    "options": [
     "Masofadan ishlash",
     "Ish haqi",
     "Ishsizlik",
     "Ta'til"
    ]
   },
   {
    "q": "Ikkinchi so'zlovchi qanday fikrda?",
    "options": [
     "Diqqat qaratish vaqti ko'paydi",
     "Unumdorlik keskin pasaydi",
     "Masofadan ishlashni taqiqlash kerak",
     "Aniq fikri yo'q"
    ]
   },
   {
    "q": "U qanday kamchilikni aytadi?",
    "options": [
     "Xodimlar muloqoti kamayishi",
     "Internet narxi",
     "Ish vaqti uzayishi",
     "Maosh kamayishi"
    ]
   }
  ]
 },
 {
  "title": "Majlisdagi metodologik e’tiroz",
  "lines": [
   {
    "who": 0,
    "ko": "발표하신 결과에서 두 변수 사이의 인과관계를 확인했다고 하셨는데, 통제 집단도 설정하셨습니까?"
   },
   {
    "who": 1,
    "ko": "아니요. 관찰 자료에 기반했기 때문에 인과관계라기보다 상관관계가 나타났다고 보는 편이 타당합니다."
   },
   {
    "who": 0,
    "ko": "그렇다면 결론의 표현을 조금 완화할 필요가 있겠네요."
   }
  ],
  "uz": "A: Natijada ikki o‘zgaruvchi orasidagi sababiyatni aniqlaganingizni aytdingiz, nazorat guruhi ham bo‘ldimi? B: Yo‘q, kuzatuv ma’lumotiga asoslangani uchun sababiyatdan ko‘ra korrelyatsiya deyish to‘g‘ri. A: Unda xulosa ifodasini yumshatish kerak.",
  "qs": [
   {
    "q": "Nima o‘zgartirilishi kerak?",
    "options": [
     "Nazorat guruhini yashirish",
     "Xulosa ifodasini ehtiyotkorroq qilish",
     "Barcha ma’lumotni o‘chirish",
     "Ikki o‘zgaruvchini birlashtirish"
    ]
   }
  ]
 }
];
