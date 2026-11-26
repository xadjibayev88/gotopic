// Hori xarakterlari va rol o'yinlari (ovozli va matnli suhbat uchun umumiy).

export type CharacterId = 'classic' | 'strict' | 'kind' | 'witty' | 'adult';
export type RoleId = 'free' | 'cafe' | 'meet' | 'shop' | 'hotel' | 'exam' | 'grammar' | 'mistakes' | 'custom';
export type ExplainLang = 'uz' | 'ru' | 'en' | 'kk' | 'ky' | 'tg' | 'tr' | 'zh' | 'hi' | 'ko' | 'ja' | 'id';

export interface Character {
  id: CharacterId;
  name: string;
  tagline: string;
  description: string;
  sample: string;
  color: string;
  icon: string;
  consent?: boolean;
  /** Faqat 18 yoshdan kattalar uchun (yoshni tasdiqlash kerak). */
  adult?: boolean;
}

export const CHARACTERS: Character[] = [
  {
    id: 'classic',
    name: 'Klassik Hori',
    tagline: 'Muvozanatli ustoz',
    description: "Do'stona, aniq va sabrli. Kundalik mashq uchun eng yaxshi tanlov.",
    sample: "Keling, bugun kafeda buyurtma berishni mashq qilamiz. Birinchi ibora — «안녕하세요»!",
    color: '#2B3A9B',
    icon: '🐯',
  },
  {
    id: 'strict',
    name: 'Professor Hori',
    tagline: 'Talabchan murabbiy',
    description: "Bo'sh maqtov yo'q. Har bir javobni to'liq gap bilan talab qiladi.",
    sample: 'Yetarli emas. Qaytadan — bu safar to\'liq gap bilan.',
    color: '#B42335',
    icon: '🎩',
    consent: true,
  },
  {
    id: 'kind',
    name: 'Romantik Hori',
    tagline: 'Sevgi va iliqlik bilan',
    description: "«Jonim, asalim, farishtam» — har bir so'zingizni sevgi bilan qadrlaydi, yurakchalar va o'pichlar bilan o'rgatadi.",
    sample: "Voy, asalim, zo'r aytding! 자기야, yana bir marta ayt-chi — ovozingga to'yib bo'lmaydi 💕",
    color: '#E11D74',
    icon: '💘',
  },
  {
    id: 'witty',
    name: 'Hazilkash Hori',
    tagline: 'Hozirjavob va kinoyali',
    description: 'Aqlli hazillar bilan sizni hushyor tutadi. Zerikish taqiqlangan.',
    sample: "Voy, zo'r gap! Endi buni koreyscha ayting — o'zbekchasini o'zim ham bilaman.",
    color: '#C2410C',
    icon: '😏',
  },
  {
    id: 'adult',
    name: 'Bezori Hori 18+',
    tagline: 'Faqat kattalar uchun',
    description: "Tili achchiq, uyalmas yo'lbars: so'kinadi, qovuradi, ko'cha jargoni va kattalar mavzularini o'rgatadi.",
    sample: "아이고! Yana «저는» o'rniga «저가» deding-a? Eshak ham bunaqa qilmaydi. Qani, qaytadan!",
    color: '#7F1D1D',
    icon: '😼',
    consent: true,
    adult: true,
  },
];

export interface Role {
  id: RoleId;
  title: string;
  icon: string;
  /** Matnli chatdagi birinchi xabar. */
  greet: (name: string) => string;
  /** Ovozli suhbatdagi birinchi gap (qisqa). */
  voiceGreet: (name: string) => string;
  suggestions: string[];
  micLang: 'uz-UZ' | 'ko-KR';
}

export const ROLES: Role[] = [
  {
    id: 'free',
    title: 'Erkin suhbat',
    icon: '💬',
    greet: (n) =>
      `${n ? `${n}, ` : ''}[fr]안녕하세요![/fr] (annyeonghaseyo) Men Hori — oq Amur yo'lbarschasi va sizning koreys tili ustozingizman. Xohlagan narsangizni so'rang: Hangul, so'z, grammatika, TOPIK, K-drama iboralari... Faqat dumimni bosmang, xafa bo'laman 😸 Bugun nimadan boshlaymiz?`,
    voiceGreet: (n) => `[[do:wave]] [fr]안녕하세요![/fr] ${n ? `${n}, ` : ''}men Hori. Bugun nima haqida gaplashamiz?`,
    suggestions: ['Koreyslar qanday salomlashadi?', "Menga 3 ta foydali ibora o'rgat", 'Hangulni qanday tez o\'rgansam bo\'ladi?'],
    micLang: 'uz-UZ',
  },
  {
    id: 'cafe',
    title: 'Seul kafesi',
    icon: '☕',
    greet: () =>
      `[fr]어서 오세요![/fr] (eoseo oseyo — Xush kelibsiz!) Men bugun Seuldagi kafeda ofitsiantman. Buyurtmani koreyscha bering — qo'rqmang, men faqat narxni baland aytaman, xatoni emas. [fr]뭐 드릴까요?[/fr] (mwo deurilkkayo — Nima beray?)`,
    voiceGreet: () => `[[do:wave]] [fr]어서 오세요![/fr] Kafega xush kelibsiz. [fr]뭐 드릴까요?[/fr]`,
    suggestions: ['아메리카노 한 잔 주세요.', '메뉴 좀 주세요.', 'Qanday javob beraman?'],
    micLang: 'ko-KR',
  },
  {
    id: 'meet',
    title: 'Tanishuv',
    icon: '🤝',
    greet: () =>
      `[fr]안녕하세요! 저는 호리예요. 이름이 뭐예요?[/fr] (Salom! Men Horiman. Ismingiz nima?) Tasavvur qiling, Hangang bo'yidagi parkda tanishdik. Koreyscha javob berishga harakat qiling — bilmasangiz o'zbekcha ayting, birga tuzamiz.`,
    voiceGreet: () => `[[do:wave]] [fr]안녕하세요! 저는 호리예요. 이름이 뭐예요?[/fr] Ismingizni koreyscha ayting!`,
    suggestions: ['저는 알리예요.', '저는 우즈베키스탄 사람이에요.', "Qanday tanishtiraman o'zimni?"],
    micLang: 'ko-KR',
  },
  {
    id: 'shop',
    title: "Kiyim do'koni",
    icon: '🛍️',
    greet: () => `[fr]어서 오세요! 뭘 찾으세요?[/fr] (Xush kelibsiz! Nima qidiryapsiz?) Men Myeongdongdagi do'konda sotuvchiman. Ko'ylakmi, shimmi, hanbokmi? Hanbok tavsiya qilaman — yo'lbarschalarga ham juda yarashadi 😸`,
    voiceGreet: () => `[[shape:card]] [fr]어서 오세요! 뭘 찾으세요?[/fr] Nima qidiryapsiz?`,
    suggestions: ['티셔츠 있어요?', '이거 얼마예요?', "Qanday so'rayman narxini?"],
    micLang: 'ko-KR',
  },
  {
    id: 'hotel',
    title: 'Mehmonxona',
    icon: '🏨',
    greet: () => `[fr]안녕하세요! 예약하셨어요?[/fr] (Assalomu alaykum! Bron qilganmisiz?) Pusandagi mehmonxonaga xush kelibsiz. Ro'yxatdan o'tamiz!`,
    voiceGreet: () => `[fr]안녕하세요! 예약하셨어요?[/fr] Bron qilganmisiz?`,
    suggestions: ['네, 예약했어요.', '아침은 몇 시예요?', 'Qanday javob beraman?'],
    micLang: 'ko-KR',
  },
  {
    id: 'exam',
    title: 'TOPIK gapirish mashqi',
    icon: '🎓',
    greet: () => `TOPIK gapirish imtihoni mashqi! Men savol beraman, siz koreyscha javob berasiz, keyin qisqa baho olasiz. Birinchi savol: [fr]자기소개를 해 보세요.[/fr] (O'zingizni tanishtiring.)`,
    voiceGreet: () => `[[shape:slab]] Imtihon mashqi. Birinchi savol: [fr]자기소개를 해 보세요.[/fr]`,
    suggestions: ['저는 알리예요. 스무 살이에요.', 'Savolni tushunmadim'],
    micLang: 'ko-KR',
  },
  {
    id: 'grammar',
    title: 'Grammatika',
    icon: '📐',
    greet: () => `Grammatika — koreys tilining eng qiziq qismi: fe'l doim oxirida, xuddi o'zbek tilidagidek! 🧶 Savolingizni bering: 은/는 va 이/가 farqi, kelishiklar, zamonlar, hurmat shakllari — hammasini oddiy misollar bilan tushuntiraman.`,
    voiceGreet: () => `[[shape:book]] Grammatika vaqti! Qaysi mavzu qiynayapti?`,
    suggestions: ['은/는 va 이/가 ning farqi nima?', "-아요/-어요 qachon ishlatiladi?", 'Inkor gap qanday tuziladi?'],
    micLang: 'uz-UZ',
  },
  {
    id: 'mistakes',
    title: 'Xatolarim',
    icon: '🩹',
    greet: () => `Darslardagi xatolaringizni ko'rib chiqamiz. Xato — bu o'rganishning eng mazali qismi, xuddi kimchidek 🌶️ Tayyormisiz?`,
    voiceGreet: () => `[[shape:pencil]] Xatolaringizni birga ko'rib chiqamiz. Tayyormisiz?`,
    suggestions: ['Ha, xatolarimni tushuntir', "Eng ko'p qaysi xatoni qilyapman?"],
    micLang: 'uz-UZ',
  },
  {
    id: 'custom',
    title: "O'z rolim",
    icon: '✍️',
    greet: () => `Siz yozgan rolda gaplashamiz. Boshladik!`,
    voiceGreet: () => `Siz yozgan rolda gaplashamiz. Boshladik!`,
    suggestions: ['Boshladik!'],
    micLang: 'uz-UZ',
  },
];

export const EXPLAIN_LANGS: { id: ExplainLang; label: string; mic: string }[] = [
  { id: 'uz', label: "O'zbekcha", mic: 'uz-UZ' },
  { id: 'ru', label: 'Русский', mic: 'ru-RU' },
  { id: 'en', label: 'English', mic: 'en-US' },
  { id: 'kk', label: 'Қазақша', mic: 'kk-KZ' },
  { id: 'ky', label: 'Кыргызча', mic: 'ky-KG' },
  { id: 'tg', label: 'Тоҷикӣ', mic: 'tg-TJ' },
  { id: 'tr', label: 'Türkçe', mic: 'tr-TR' },
  { id: 'zh', label: '中文', mic: 'zh-CN' },
  { id: 'hi', label: 'हिन्दी', mic: 'hi-IN' },
  { id: 'ko', label: '한국어', mic: 'ko-KR' },
  { id: 'ja', label: '日本語', mic: 'ja-JP' },
  { id: 'id', label: 'Bahasa Indonesia', mic: 'id-ID' },
];

export const CUSTOM_ROLE_MIN = 20;
export const CUSTOM_ROLE_MAX = 600;
