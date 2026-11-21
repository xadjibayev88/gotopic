// Krua xarakterlari va rol o'yinlari (ovozli va matnli suhbat uchun umumiy).

export type CharacterId = 'classic' | 'strict' | 'kind' | 'witty';
export type RoleId = 'free' | 'cafe' | 'meet' | 'shop' | 'hotel' | 'exam' | 'grammar' | 'mistakes' | 'custom';
export type ExplainLang = 'uz' | 'ru' | 'en';

export interface Character {
  id: CharacterId;
  name: string;
  tagline: string;
  description: string;
  sample: string;
  color: string;
  icon: string;
  consent?: boolean;
}

export const CHARACTERS: Character[] = [
  {
    id: 'classic',
    name: 'Klassik Krua',
    tagline: 'Muvozanatli ustoz',
    description: "Do'stona, aniq va sabrli. Kundalik mashq uchun eng yaxshi tanlov.",
    sample: "Keling, bugun kafeda buyurtma berishni mashq qilamiz. Birinchi so'z — «Bonjour»!",
    color: '#2B3A9B',
    icon: '🥐',
  },
  {
    id: 'strict',
    name: 'Professor Krua',
    tagline: 'Talabchan murabbiy',
    description: "Bo'sh maqtov yo'q. Har bir javobni to'liq gap bilan talab qiladi.",
    sample: 'Yetarli emas. Qaytadan — bu safar to\'liq gap bilan.',
    color: '#B42335',
    icon: '🎩',
    consent: true,
  },
  {
    id: 'kind',
    name: 'Mehribon Krua',
    tagline: 'Iliq va rag\'batlantiruvchi',
    description: "Har bir urinishingizni qadrlaydi va o'zingizga ishonchni oshiradi.",
    sample: 'Deyarli to\'g\'ri! Shoshilmang — juda yaxshi ketyapsiz.',
    color: '#0B7A59',
    icon: '🫶',
  },
  {
    id: 'witty',
    name: 'Hazilkash Krua',
    tagline: 'Hozirjavob va kinoyali',
    description: 'Aqlli hazillar bilan sizni hushyor tutadi. Zerikish taqiqlangan.',
    sample: "Voy, zo'r gap! Endi buni fransuzcha ayting — o'zbekchasini o'zim ham bilaman.",
    color: '#C2410C',
    icon: '😏',
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
      `${n ? `${n}, ` : ''}[fr]Salut ![/fr] (salyu) Men Krua — beretli kruasan va sizning fransuz tili ustozingizman. Xohlagan narsangizni so'rang: so'z, grammatika, Parij... Faqat meni choyga botirmang, iltimos 😄 Bugun nimadan boshlaymiz?`,
    voiceGreet: (n) => `[[do:wave]] [fr]Salut ![/fr] ${n ? `${n}, ` : ''}men Krua. Bugun nima haqida gaplashamiz?`,
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
      `[fr]Salut ! Je m'appelle Krua. Et toi ?[/fr] (Salom! Mening ismim Krua. Seningchi?) Tasavvur qiling, Parijdagi parkda tanishdik. Fransuzcha javob berishga harakat qiling — bilmasangiz o'zbekcha ayting, birga tuzamiz.`,
    voiceGreet: () => `[[do:wave]] [fr]Salut ! Je m'appelle Krua. Et toi ?[/fr] Ismingizni fransuzcha ayting!`,
    suggestions: ["Je m'appelle Ali.", 'Je suis ouzbek.', "Qanday tanishtiraman o'zimni?"],
    micLang: 'fr-FR',
  },
  {
    id: 'shop',
    title: "Kiyim do'koni",
    icon: '🛍️',
    greet: () => `[fr]Bonjour ! Je peux vous aider ?[/fr] (Salom! Yordam bera olamanmi?) Men sotuvchiman. Nima qidiryapsiz — ko'ylakmi, shimmi, beretmi? Beret tavsiya qilaman, o'zimda ham bor 😄`,
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
    greet: () => `Grammatika — fransuz tilining eng nozik qismi, xuddi mening qatlamlarim kabi 🥐 Savolingizni bering: artikllar, rod, fe'llar, inkor — hammasini oddiy misollar bilan tushuntiraman.`,
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
];

export const CUSTOM_ROLE_MIN = 20;
export const CUSTOM_ROLE_MAX = 600;
