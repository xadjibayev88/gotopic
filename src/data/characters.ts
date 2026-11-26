// Vivi xarakterlari va rol o'yinlari (ovozli va matnli suhbat uchun umumiy).

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
    name: 'Klassik Vivi',
    tagline: 'Muvozanatli ustoz',
    description: "Do'stona, aniq va sabrli. Kundalik mashq uchun eng yaxshi tanlov.",
    sample: "Keling, bugun kafeda buyurtma berishni mashq qilamiz. Birinchi so'z — «Bonjour»!",
    color: '#2B3A9B',
    icon: '🐱',
  },
  {
    id: 'strict',
    name: 'Professor Vivi',
    tagline: 'Talabchan murabbiy',
    description: "Bo'sh maqtov yo'q. Har bir javobni to'liq gap bilan talab qiladi.",
    sample: 'Yetarli emas. Qaytadan — bu safar to\'liq gap bilan.',
    color: '#B42335',
    icon: '🎩',
    consent: true,
  },
  {
    id: 'kind',
    name: 'Romantik Vivi',
    tagline: 'Sevgi va iliqlik bilan',
    description: "«Jonim, asalim, farishtam» — har bir so'zingizni sevgi bilan qadrlaydi, yurakchalar va o'pichlar bilan o'rgatadi.",
    sample: "Voy, asalim, zo'r aytding! Mon cœur, yana bir marta ayt-chi — ovozingga to'yib bo'lmaydi 💕",
    color: '#E11D74',
    icon: '💘',
  },
  {
    id: 'witty',
    name: 'Hazilkash Vivi',
    tagline: 'Hozirjavob va kinoyali',
    description: 'Aqlli hazillar bilan sizni hushyor tutadi. Zerikish taqiqlangan.',
    sample: "Voy, zo'r gap! Endi buni fransuzcha ayting — o'zbekchasini o'zim ham bilaman.",
    color: '#C2410C',
    icon: '😏',
  },
  {
    id: 'adult',
    name: 'Bezori Vivi 18+',
    tagline: 'Faqat kattalar uchun',
    description: "Tili achchiq, uyalmas mushuk: so'kinadi, qovuradi, ko'cha jargoni va kattalar mavzularini o'rgatadi.",
    sample: "Putain ! Yana «je suis» o'rniga «je es» deding-a? Eshak ham bunaqa qilmaydi. Qani, qaytadan!",
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
  micLang: 'uz-UZ' | 'fr-FR';
}

export const ROLES: Role[] = [
  {
    id: 'free',
    title: 'Erkin suhbat',
    icon: '💬',
    greet: (n) =>
      `${n ? `${n}, ` : ''}[fr]Salut ![/fr] (salyu) Men Vivi — parijlik mushukcha va sizning fransuz tili ustozingizman. Xohlagan narsangizni so'rang: so'z, grammatika, Parij... Faqat qornimni silamang, darsni unutib qo'yaman 😸 Bugun nimadan boshlaymiz?`,
    voiceGreet: (n) => `[[do:wave]] [fr]Salut ![/fr] ${n ? `${n}, ` : ''}men Vivi. Bugun nima haqida gaplashamiz?`,
    suggestions: ['Fransuzlar qanday salomlashadi?', "Menga 3 ta foydali ibora o'rgat", 'Fransuzcha bir hazil aytib ber'],
    micLang: 'uz-UZ',
  },
  {
    id: 'cafe',
    title: 'Parij kafesi',
    icon: '☕',
    greet: () =>
      `[fr]Bonjour ! Bienvenue au café ![/fr] (Salom! Kafega xush kelibsiz!) Men bugun ofitsiantman. Buyurtmani fransuzcha bering — qo'rqmang, men faqat narxni baland aytaman, xatoni emas. [fr]Qu'est-ce que vous voulez ?[/fr] (Nima xohlaysiz?)`,
    voiceGreet: () => `[[do:wave]] [fr]Bonjour ! Bienvenue au café ![/fr] Kafega xush kelibsiz. [fr]Qu'est-ce que vous voulez ?[/fr]`,
    suggestions: ["Bonjour ! Un café, s'il vous plaît.", "Le menu, s'il vous plaît.", 'Qanday javob beraman?'],
    micLang: 'fr-FR',
  },
  {
    id: 'meet',
    title: 'Tanishuv',
    icon: '🤝',
    greet: () =>
      `[fr]Salut ! Je m'appelle Vivi. Et toi ?[/fr] (Salom! Mening ismim Vivi. Seningchi?) Tasavvur qiling, Parijdagi parkda tanishdik. Fransuzcha javob berishga harakat qiling — bilmasangiz o'zbekcha ayting, birga tuzamiz.`,
    voiceGreet: () => `[[do:wave]] [fr]Salut ! Je m'appelle Vivi. Et toi ?[/fr] Ismingizni fransuzcha ayting!`,
    suggestions: ["Je m'appelle Ali.", 'Je suis ouzbek.', "Qanday tanishtiraman o'zimni?"],
    micLang: 'fr-FR',
  },
  {
    id: 'shop',
    title: "Kiyim do'koni",
    icon: '🛍️',
    greet: () => `[fr]Bonjour ! Je peux vous aider ?[/fr] (Salom! Yordam bera olamanmi?) Men sotuvchiman. Nima qidiryapsiz — ko'ylakmi, shimmi, beretmi? Beret tavsiya qilaman — mushukchalarga ham juda yarashadi 😸`,
    voiceGreet: () => `[[shape:card]] [fr]Bonjour ! Je peux vous aider ?[/fr] Nima qidiryapsiz?`,
    suggestions: ['Je voudrais un t-shirt.', "C'est combien ?", 'Qanday so\'rayman narxini?'],
    micLang: 'fr-FR',
  },
  {
    id: 'hotel',
    title: 'Mehmonxona',
    icon: '🏨',
    greet: () => `[fr]Bonsoir ! Vous avez une réservation ?[/fr] (Xayrli kech! Bron qilganmisiz?) Lion shahridagi mehmonxonaga xush kelibsiz. Ro'yxatdan o'tamiz!`,
    voiceGreet: () => `[fr]Bonsoir ! Vous avez une réservation ?[/fr] Bron qilganmisiz?`,
    suggestions: ["Oui, j'ai une réservation.", 'Le petit-déjeuner, c\'est à quelle heure ?', 'Qanday javob beraman?'],
    micLang: 'fr-FR',
  },
  {
    id: 'exam',
    title: 'DELF A1 mashqi',
    icon: '🎓',
    greet: () => `Og'zaki imtihon mashqi! Men savol beraman, siz fransuzcha javob berasiz, keyin qisqa baho olasiz. Birinchi savol: [fr]Présentez-vous, s'il vous plaît.[/fr] (O'zingizni tanishtiring.)`,
    voiceGreet: () => `[[shape:slab]] Imtihon mashqi. Birinchi savol: [fr]Présentez-vous, s'il vous plaît.[/fr]`,
    suggestions: ["Je m'appelle Ali, j'ai vingt ans.", 'Savolni tushunmadim'],
    micLang: 'fr-FR',
  },
  {
    id: 'grammar',
    title: 'Grammatika',
    icon: '📐',
    greet: () => `Grammatika — fransuz tilining eng nozik qismi, xuddi kalava ipidek chigal, lekin birga yechamiz 🧶 Savolingizni bering: artikllar, rod, fe'llar, inkor — hammasini oddiy misollar bilan tushuntiraman.`,
    voiceGreet: () => `[[shape:book]] Grammatika vaqti! Qaysi mavzu qiynayapti?`,
    suggestions: ['un va une ning farqi nima?', "être fe'lini tushuntir", 'Inkor gap qanday tuziladi?'],
    micLang: 'uz-UZ',
  },
  {
    id: 'mistakes',
    title: 'Xatolarim',
    icon: '🩹',
    greet: () => `Darslardagi xatolaringizni ko'rib chiqamiz. Xato — bu o'rganishning eng mazali qismi. Tayyormisiz?`,
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
