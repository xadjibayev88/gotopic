// Kurs mazmuni: Koreys tili (TOPIK 1 → 6) — o'zbek tilida so'zlashuvchilar uchun.
// AVTOMATIK yaratilgan: python3 scripts/build-korean-course.py (manba: legacy/public/catalog.json + scripts/korean-course-data.py).
// Tarixiy sabab bilan maydon nomi `fr` — unda koreyscha (Hangul) matn turadi; `ro` — o'qilishi (romanizatsiya).

export interface Word {
  fr: string;
  uz: string;
  /** O'qilishi (Revised Romanization). */
  ro?: string;
  emoji?: string;
  alt?: string[];
}

export interface Sentence {
  fr: string;
  uz: string;
  ro?: string;
  frAlt?: string[];
  uzAlt?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  words: Word[];
  sentences: Sentence[];
}

/** Ichki daraja kodi (A1…C2) — interfeysda TOPIK 1…6 sifatida ko'rsatiladi (levelLabel). */
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const CEFR: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TOPIK: Record<Cefr, string> = { A1: 'TOPIK 1', A2: 'TOPIK 2', B1: 'TOPIK 3', B2: 'TOPIK 4', C1: 'TOPIK 5', C2: 'TOPIK 6' };
/** Interfeysdagi daraja nomi: «TOPIK 1» … «TOPIK 6». */
export const levelLabel = (c: Cefr): string => TOPIK[c];

export interface Unit {
  id: string;
  /** Daraja (A1…C2 = TOPIK 1…6). */
  level?: Cefr;
  title: string;
  description: string;
  color: string;
  guide: { title: string; text: string; examples?: [string, string][] }[];
  lessons: Lesson[];
}

export const COURSE: Unit[] = [
 {
  "id": "u1",
  "level": "A1",
  "title": "Hangul: unlilar",
  "description": "Koreys alifbosi: 10 ta asosiy unli",
  "color": "#B49CFF",
  "guide": [
   {
    "title": "Hangul — 24 harf",
    "text": "Koreys alifbosi Hangul 1443-yilda Sejong qirol tomonidan yaratilgan. 10 ta asosiy unli va 14 ta undosh bor. Harflar bo'g'in-bo'g'in qilib «quti» ichiga yoziladi.",
    "examples": [
     [
      "한글",
      "Hangul"
     ],
     [
      "가",
      "g + a = ga"
     ]
    ]
   },
   {
    "title": "Jim «ㅇ»",
    "text": "Bo'g'in unli bilan boshlansa, oldiga jim ㅇ yoziladi: 아, 오, 우. U o'qilmaydi — faqat joy egallaydi.",
    "examples": [
     [
      "아이",
      "ai — bola"
     ],
     [
      "우유",
      "uyu — sut"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u1l1",
    "title": "ㅏ ㅓ ㅗ ㅜ ㅣ",
    "words": [
     {
      "fr": "ㅏ",
      "uz": "a",
      "ro": "a"
     },
     {
      "fr": "ㅓ",
      "uz": "eo",
      "ro": "eo"
     },
     {
      "fr": "ㅗ",
      "uz": "o",
      "ro": "o"
     },
     {
      "fr": "ㅜ",
      "uz": "u",
      "ro": "u"
     },
     {
      "fr": "ㅣ",
      "uz": "i",
      "ro": "i"
     }
    ],
    "sentences": [
     {
      "fr": "아이",
      "uz": "bola",
      "ro": "ai"
     },
     {
      "fr": "오이",
      "uz": "bodring",
      "ro": "oi"
     },
     {
      "fr": "이",
      "uz": "tish; ikki",
      "ro": "i"
     },
     {
      "fr": "우아",
      "uz": "nafislik",
      "ro": "ua"
     },
     {
      "fr": "아우",
      "uz": "uka (eskicha)",
      "ro": "au"
     }
    ]
   },
   {
    "id": "u1l2",
    "title": "ㅡ ㅑ ㅕ ㅛ ㅠ",
    "words": [
     {
      "fr": "ㅡ",
      "uz": "eu",
      "ro": "eu"
     },
     {
      "fr": "ㅑ",
      "uz": "ya",
      "ro": "ya"
     },
     {
      "fr": "ㅕ",
      "uz": "yeo",
      "ro": "yeo"
     },
     {
      "fr": "ㅛ",
      "uz": "yo",
      "ro": "yo"
     },
     {
      "fr": "ㅠ",
      "uz": "yu",
      "ro": "yu"
     }
    ],
    "sentences": [
     {
      "fr": "우유",
      "uz": "sut",
      "ro": "uyu"
     },
     {
      "fr": "여우",
      "uz": "tulki",
      "ro": "yeou"
     },
     {
      "fr": "여유",
      "uz": "bo'sh vaqt",
      "ro": "yeoyu"
     },
     {
      "fr": "유아",
      "uz": "go'dak",
      "ro": "yua"
     },
     {
      "fr": "아이",
      "uz": "bola",
      "ro": "ai"
     },
     {
      "fr": "오이",
      "uz": "bodring",
      "ro": "oi"
     }
    ]
   }
  ]
 },
 {
  "id": "u2",
  "level": "A1",
  "title": "Hangul: undoshlar",
  "description": "14 ta undosh va birinchi so'zlar",
  "color": "#FF8FD0",
  "guide": [
   {
    "title": "Undosh + unli = bo'g'in",
    "text": "Har bir bo'g'in undosh bilan boshlanadi: ㄴ + ㅏ = 나, ㅁ + ㅜ = 무. Vertikal unlilar (ㅏ ㅣ) o'ngga, gorizontal unlilar (ㅗ ㅜ) pastga yoziladi.",
    "examples": [
     [
      "나무",
      "namu — daraxt"
     ],
     [
      "바다",
      "bada — dengiz"
     ]
    ]
   },
   {
    "title": "Nafasli undoshlar",
    "text": "ㅋ ㅌ ㅍ ㅊ — kuchli nafas bilan aytiladi. ㄱ ㄷ ㅂ ㅈ esa yumshoqroq: so'z boshida k/t/p/ch ga, unlilar orasida g/d/b/j ga yaqin.",
    "examples": [
     [
      "커피",
      "keopi — qahva"
     ],
     [
      "기차",
      "gicha — poyezd"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u2l1",
    "title": "ㄱ ㄴ ㄷ ㄹ ㅁ",
    "words": [
     {
      "fr": "ㄱ",
      "uz": "g / k",
      "ro": "g",
      "alt": [
       "g",
       "k"
      ]
     },
     {
      "fr": "ㄴ",
      "uz": "n",
      "ro": "n"
     },
     {
      "fr": "ㄷ",
      "uz": "d / t",
      "ro": "d",
      "alt": [
       "d",
       "t"
      ]
     },
     {
      "fr": "ㄹ",
      "uz": "r / l",
      "ro": "r",
      "alt": [
       "r",
       "l"
      ]
     },
     {
      "fr": "ㅁ",
      "uz": "m",
      "ro": "m"
     }
    ],
    "sentences": [
     {
      "fr": "나무",
      "uz": "daraxt",
      "ro": "namu"
     },
     {
      "fr": "고기",
      "uz": "go'sht",
      "ro": "gogi"
     },
     {
      "fr": "머리",
      "uz": "bosh",
      "ro": "meori"
     },
     {
      "fr": "누나",
      "uz": "opa (o'g'il bola aytadi)",
      "ro": "nuna"
     },
     {
      "fr": "어머니",
      "uz": "ona",
      "ro": "eomeoni"
     },
     {
      "fr": "다리",
      "uz": "oyoq",
      "ro": "dari"
     }
    ]
   },
   {
    "id": "u2l2",
    "title": "ㅂ ㅅ ㅇ ㅈ ㅊ",
    "words": [
     {
      "fr": "ㅂ",
      "uz": "b / p",
      "ro": "b",
      "alt": [
       "b",
       "p"
      ]
     },
     {
      "fr": "ㅅ",
      "uz": "s",
      "ro": "s"
     },
     {
      "fr": "ㅇ",
      "uz": "– / ng",
      "ro": "–",
      "alt": [
       "–",
       "ng"
      ]
     },
     {
      "fr": "ㅈ",
      "uz": "j",
      "ro": "j"
     },
     {
      "fr": "ㅊ",
      "uz": "ch",
      "ro": "ch"
     }
    ],
    "sentences": [
     {
      "fr": "어머니",
      "uz": "ona",
      "ro": "eomeoni"
     },
     {
      "fr": "바다",
      "uz": "dengiz",
      "ro": "bada"
     },
     {
      "fr": "모자",
      "uz": "bosh kiyim",
      "ro": "moja"
     },
     {
      "fr": "나비",
      "uz": "kapalak",
      "ro": "nabi"
     },
     {
      "fr": "지도",
      "uz": "xarita",
      "ro": "jido"
     },
     {
      "fr": "기차",
      "uz": "poyezd",
      "ro": "gicha"
     }
    ]
   },
   {
    "id": "u2l3",
    "title": "ㅋ ㅌ ㅍ ㅎ",
    "words": [
     {
      "fr": "ㅋ",
      "uz": "k (nafasli)",
      "ro": "k",
      "alt": [
       "k"
      ]
     },
     {
      "fr": "ㅌ",
      "uz": "t (nafasli)",
      "ro": "t",
      "alt": [
       "t"
      ]
     },
     {
      "fr": "ㅍ",
      "uz": "p (nafasli)",
      "ro": "p",
      "alt": [
       "p"
      ]
     },
     {
      "fr": "ㅎ",
      "uz": "h",
      "ro": "h"
     }
    ],
    "sentences": [
     {
      "fr": "커피",
      "uz": "qahva",
      "ro": "keopi"
     },
     {
      "fr": "토마토",
      "uz": "pomidor",
      "ro": "tomato"
     },
     {
      "fr": "포도",
      "uz": "uzum",
      "ro": "podo"
     },
     {
      "fr": "하나",
      "uz": "bitta",
      "ro": "hana"
     },
     {
      "fr": "하마",
      "uz": "begemot",
      "ro": "hama"
     },
     {
      "fr": "코",
      "uz": "burun",
      "ro": "ko"
     }
    ]
   }
  ]
 },
 {
  "id": "u3",
  "level": "A1",
  "title": "Salomlashish",
  "description": "Salom bering, rahmat va kechirasiz deng",
  "color": "#7FE3FF",
  "guide": [
   {
    "title": "안녕하세요 — universal salom",
    "text": "Kunning istalgan vaqtida aytiladi. Rasmiyroq: 안녕하십니까. Do'stlar orasida: 안녕.",
    "examples": [
     [
      "안녕하세요?",
      "Assalomu alaykum!"
     ],
     [
      "안녕!",
      "Salom! (do'stga)"
     ]
    ]
   },
   {
    "title": "Ikki xil «xayr»",
    "text": "Ketayotgan odamga — 안녕히 가세요 («tinch boring»), o'zingiz ketayotganda qolayotganga — 안녕히 계세요 («tinch qoling»).",
    "examples": [
     [
      "안녕히 가세요.",
      "Xayr (ketayotganga)"
     ],
     [
      "안녕히 계세요.",
      "Xayr (qolayotganga)"
     ]
    ]
   },
   {
    "title": "-요 — hurmat qo'shimchasi",
    "text": "Gap oxiridagi -요 muloyimlik bildiradi. Notanish va kattalar bilan doim -요 yoki -습니다 bilan gapiring.",
    "examples": [
     [
      "감사해요.",
      "Rahmat (muloyim)"
     ],
     [
      "감사합니다.",
      "Rahmat (rasmiy)"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u3l1",
    "title": "Assalomu alaykum, rahmat",
    "words": [
     {
      "fr": "안녕하세요",
      "uz": "Assalomu alaykum",
      "ro": "annyeonghaseyo",
      "emoji": "👋"
     },
     {
      "fr": "감사합니다",
      "uz": "Rahmat",
      "ro": "gamsahamnida",
      "emoji": "🙏"
     },
     {
      "fr": "죄송합니다",
      "uz": "Kechirasiz",
      "ro": "joesonghamnida",
      "emoji": "🙇"
     },
     {
      "fr": "네",
      "uz": "Ha",
      "ro": "ne",
      "emoji": "✅"
     },
     {
      "fr": "아니요",
      "uz": "Yo'q",
      "ro": "aniyo",
      "emoji": "❌"
     }
    ],
    "sentences": [
     {
      "fr": "안녕하세요? 저는 알리예요.",
      "uz": "Assalomu alaykum! Men Aliman.",
      "ro": "annyeonghaseyo? jeoneun alliyeyo."
     },
     {
      "fr": "만나서 반갑습니다.",
      "uz": "Tanishganimdan xursandman.",
      "ro": "mannaseo bangapseumnida."
     },
     {
      "fr": "감사합니다, 선생님.",
      "uz": "Rahmat, ustoz.",
      "ro": "gamsahamnida, seonsaengnim."
     },
     {
      "fr": "죄송합니다. 괜찮아요?",
      "uz": "Kechirasiz. Yaxshimisiz?",
      "ro": "joesonghamnida. gwaenchanayo?"
     },
     {
      "fr": "네, 괜찮아요.",
      "uz": "Ha, hechqisi yo'q.",
      "ro": "ne, gwaenchanayo."
     }
    ]
   },
   {
    "id": "u3l2",
    "title": "Xayr, tanishganimdan xursandman",
    "words": [
     {
      "fr": "안녕히 가세요",
      "uz": "Xayr (ketayotgan kishiga)",
      "ro": "annyeonghi gaseyo",
      "emoji": "🚶",
      "alt": [
       "Xayr"
      ]
     },
     {
      "fr": "안녕히 계세요",
      "uz": "Xayr (qolayotgan kishiga)",
      "ro": "annyeonghi gyeseyo",
      "emoji": "🏠",
      "alt": [
       "Xayr"
      ]
     },
     {
      "fr": "반갑습니다",
      "uz": "Tanishganimdan xursandman",
      "ro": "bangapseumnida",
      "emoji": "🤝"
     },
     {
      "fr": "괜찮아요",
      "uz": "Hechqisi yo'q",
      "ro": "gwaenchanayo",
      "emoji": "👌"
     },
     {
      "fr": "주세요",
      "uz": "Bering, iltimos",
      "ro": "juseyo",
      "emoji": "🤲",
      "alt": [
       "Bering",
       "iltimos"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "죄송합니다. 괜찮아요?",
      "uz": "Kechirasiz. Yaxshimisiz?",
      "ro": "joesonghamnida. gwaenchanayo?"
     },
     {
      "fr": "네, 괜찮아요.",
      "uz": "Ha, hechqisi yo'q.",
      "ro": "ne, gwaenchanayo."
     },
     {
      "fr": "물 좀 주세요.",
      "uz": "Suv bering, iltimos.",
      "ro": "mul jom juseyo."
     },
     {
      "fr": "안녕히 가세요!",
      "uz": "Xayr! (ketayotgan kishiga)",
      "ro": "annyeonghi gaseyo!"
     },
     {
      "fr": "아니요, 괜찮아요. 감사합니다.",
      "uz": "Yo'q, kerak emas. Rahmat.",
      "ro": "aniyo, gwaenchanayo. gamsahamnida."
     }
    ]
   }
  ]
 },
 {
  "id": "u4",
  "level": "A1",
  "title": "Raqamlar",
  "description": "Xitoycha-koreys sonlari: narx, sana, telefon",
  "color": "#FFB84D",
  "guide": [
   {
    "title": "Xitoycha-koreys sonlari",
    "text": "일, 이, 삼… — sana, pul, telefon raqami, qavat va daqiqalar uchun ishlatiladi.",
    "examples": [
     [
      "삼월 이십일",
      "21-mart"
     ],
     [
      "오천 원",
      "5 000 von"
     ]
    ]
   },
   {
    "title": "Katta sonlar",
    "text": "Koreyslar 10 000 (만) bo'yicha sanaydi: 만 = 10 000, 십만 = 100 000, 백만 = 1 000 000.",
    "examples": [
     [
      "만 원",
      "10 000 von"
     ],
     [
      "십만 원",
      "100 000 von"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u4l1",
    "title": "Bir, ikki",
    "words": [
     {
      "fr": "일",
      "uz": "bir (1)",
      "ro": "il",
      "emoji": "1️⃣",
      "alt": [
       "bir"
      ]
     },
     {
      "fr": "이",
      "uz": "ikki (2)",
      "ro": "i",
      "emoji": "2️⃣",
      "alt": [
       "ikki"
      ]
     },
     {
      "fr": "삼",
      "uz": "uch (3)",
      "ro": "sam",
      "emoji": "3️⃣",
      "alt": [
       "uch"
      ]
     },
     {
      "fr": "사",
      "uz": "to'rt (4)",
      "ro": "sa",
      "emoji": "4️⃣",
      "alt": [
       "to'rt"
      ]
     },
     {
      "fr": "오",
      "uz": "besh (5)",
      "ro": "o",
      "emoji": "5️⃣",
      "alt": [
       "besh"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "전화번호는 공일공이에요.",
      "uz": "Telefon raqami — 010.",
      "ro": "jeonhwabeonhoneun gong-il-gong-ieyo."
     },
     {
      "fr": "오늘은 삼월 이십일이에요.",
      "uz": "Bugun 21-mart.",
      "ro": "oneureun samwol isibirieyo."
     },
     {
      "fr": "이 책은 만 원이에요.",
      "uz": "Bu kitob o'n ming von.",
      "ro": "i chaegeun man wonieyo."
     },
     {
      "fr": "우리 반은 십오 층에 있어요.",
      "uz": "Bizning sinf 15-qavatda.",
      "ro": "uri baneun sibo cheunge isseoyo."
     },
     {
      "fr": "커피는 오천 원이에요.",
      "uz": "Qahva besh ming von.",
      "ro": "keopineun ocheon wonieyo."
     }
    ]
   },
   {
    "id": "u4l2",
    "title": "Olti, yetti",
    "words": [
     {
      "fr": "육",
      "uz": "olti (6)",
      "ro": "yuk",
      "emoji": "6️⃣",
      "alt": [
       "olti"
      ]
     },
     {
      "fr": "칠",
      "uz": "yetti (7)",
      "ro": "chil",
      "emoji": "7️⃣",
      "alt": [
       "yetti"
      ]
     },
     {
      "fr": "팔",
      "uz": "sakkiz (8)",
      "ro": "pal",
      "emoji": "8️⃣",
      "alt": [
       "sakkiz"
      ]
     },
     {
      "fr": "구",
      "uz": "to'qqiz (9)",
      "ro": "gu",
      "emoji": "9️⃣",
      "alt": [
       "to'qqiz"
      ]
     },
     {
      "fr": "십",
      "uz": "o'n (10)",
      "ro": "sip",
      "emoji": "🔟",
      "alt": [
       "o'n"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "우리 반은 십오 층에 있어요.",
      "uz": "Bizning sinf 15-qavatda.",
      "ro": "uri baneun sibo cheunge isseoyo."
     },
     {
      "fr": "커피는 오천 원이에요.",
      "uz": "Qahva besh ming von.",
      "ro": "keopineun ocheon wonieyo."
     },
     {
      "fr": "버스는 백 번이에요.",
      "uz": "Avtobus 100-raqamli.",
      "ro": "beoseuneun baek beonieyo."
     },
     {
      "fr": "이 더하기 삼은 오예요.",
      "uz": "Ikki qo'shuv uch — besh.",
      "ro": "i deohagi sameun oyeyo."
     },
     {
      "fr": "제 방은 칠 층이에요.",
      "uz": "Mening xonam 7-qavatda.",
      "ro": "je bangeun chil cheungieyo."
     }
    ]
   },
   {
    "id": "u4l3",
    "title": "Nol, yuz",
    "words": [
     {
      "fr": "영",
      "uz": "nol (0)",
      "ro": "yeong",
      "emoji": "0️⃣",
      "alt": [
       "nol"
      ]
     },
     {
      "fr": "백",
      "uz": "yuz (100)",
      "ro": "baek",
      "emoji": "💯",
      "alt": [
       "yuz"
      ]
     },
     {
      "fr": "천",
      "uz": "ming (1 000)",
      "ro": "cheon",
      "emoji": "🔢",
      "alt": [
       "ming"
      ]
     },
     {
      "fr": "만",
      "uz": "o'n ming (10 000)",
      "ro": "man",
      "emoji": "💴",
      "alt": [
       "o'n ming"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "이 더하기 삼은 오예요.",
      "uz": "Ikki qo'shuv uch — besh.",
      "ro": "i deohagi sameun oyeyo."
     },
     {
      "fr": "제 방은 칠 층이에요.",
      "uz": "Mening xonam 7-qavatda.",
      "ro": "je bangeun chil cheungieyo."
     },
     {
      "fr": "전화번호는 공일공이에요.",
      "uz": "Telefon raqami — 010.",
      "ro": "jeonhwabeonhoneun gong-il-gong-ieyo."
     },
     {
      "fr": "오늘은 삼월 이십일이에요.",
      "uz": "Bugun 21-mart.",
      "ro": "oneureun samwol isibirieyo."
     },
     {
      "fr": "이 책은 만 원이에요.",
      "uz": "Bu kitob o'n ming von.",
      "ro": "i chaegeun man wonieyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u5",
  "level": "A1",
  "title": "Oila",
  "description": "Oila a'zolari va yaqinlaringiz",
  "color": "#FF6B9A",
  "guide": [
   {
    "title": "Kim aytayotganiga qarab",
    "text": "Aka: o'g'il bola 형, qiz bola 오빠 deydi. Opa: o'g'il bola 누나, qiz bola 언니 deydi. Uka/singil — 동생.",
    "examples": [
     [
      "형",
      "aka (o'g'il aytadi)"
     ],
     [
      "언니",
      "opa (qiz aytadi)"
     ]
    ]
   },
   {
    "title": "우리 — «bizning»",
    "text": "Koreyslar oilasi haqida «mening» o'rniga ko'pincha «bizning» (우리) deydi: 우리 엄마 — onam.",
    "examples": [
     [
      "우리 가족",
      "oilam"
     ],
     [
      "우리 집",
      "uyim"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u5l1",
    "title": "Ona, ota",
    "words": [
     {
      "fr": "어머니",
      "uz": "ona",
      "ro": "eomeoni",
      "emoji": "👩"
     },
     {
      "fr": "아버지",
      "uz": "ota",
      "ro": "abeoji",
      "emoji": "👨"
     },
     {
      "fr": "형",
      "uz": "aka (o'g'il bola aytadi)",
      "ro": "hyeong",
      "emoji": "👦",
      "alt": [
       "aka"
      ]
     },
     {
      "fr": "누나",
      "uz": "opa (o'g'il bola aytadi)",
      "ro": "nuna",
      "emoji": "👧",
      "alt": [
       "opa"
      ]
     },
     {
      "fr": "동생",
      "uz": "uka yoki singil",
      "ro": "dongsaeng",
      "emoji": "🧒"
     }
    ],
    "sentences": [
     {
      "fr": "우리 가족은 다섯 명이에요.",
      "uz": "Oilamiz besh kishidan iborat.",
      "ro": "uri gajogeun daseot myeongieyo."
     },
     {
      "fr": "어머니는 선생님이에요.",
      "uz": "Onam o'qituvchi.",
      "ro": "eomeonineun seonsaengnimieyo."
     },
     {
      "fr": "아버지는 회사에 가요.",
      "uz": "Otam ishxonaga boradi.",
      "ro": "abeojineun hoesae gayo."
     },
     {
      "fr": "저는 형하고 누나가 있어요.",
      "uz": "Mening akam va opam bor.",
      "ro": "jeoneun hyeonghago nunaga isseoyo."
     },
     {
      "fr": "동생은 학생이에요.",
      "uz": "Ukam talaba.",
      "ro": "dongsaengeun haksaengieyo."
     }
    ]
   },
   {
    "id": "u5l2",
    "title": "Buvi, bobo",
    "words": [
     {
      "fr": "할머니",
      "uz": "buvi",
      "ro": "halmeoni",
      "emoji": "👵"
     },
     {
      "fr": "할아버지",
      "uz": "bobo",
      "ro": "harabeoji",
      "emoji": "👴"
     },
     {
      "fr": "친구",
      "uz": "do'st",
      "ro": "chingu",
      "emoji": "🧑‍🤝‍🧑"
     },
     {
      "fr": "가족",
      "uz": "oila",
      "ro": "gajok",
      "emoji": "👨‍👩‍👧"
     },
     {
      "fr": "아이",
      "uz": "bola",
      "ro": "ai",
      "emoji": "👶"
     }
    ],
    "sentences": [
     {
      "fr": "저는 형하고 누나가 있어요.",
      "uz": "Mening akam va opam bor.",
      "ro": "jeoneun hyeonghago nunaga isseoyo."
     },
     {
      "fr": "동생은 학생이에요.",
      "uz": "Ukam talaba.",
      "ro": "dongsaengeun haksaengieyo."
     },
     {
      "fr": "할머니는 집에 계세요.",
      "uz": "Buvim uyda.",
      "ro": "halmeonineun jibe gyeseyo."
     },
     {
      "fr": "제 친구는 한국 사람이에요.",
      "uz": "Do'stim koreys.",
      "ro": "je chinguneun hanguk saramieyo."
     },
     {
      "fr": "아이가 아주 귀여워요.",
      "uz": "Bola juda yoqimtoy.",
      "ro": "aiga aju gwiyeowoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u6",
  "level": "A1",
  "title": "Ovqat",
  "description": "Taomlar, ichimliklar va buyurtma berish",
  "color": "#9B5CFF",
  "guide": [
   {
    "title": "을/를 — tushum kelishigi",
    "text": "Fe'lning to'ldiruvchisiga qo'shiladi: unlidan keyin 를, undoshdan keyin 을.",
    "examples": [
     [
      "커피를 마셔요.",
      "Qahva ichaman."
     ],
     [
      "밥을 먹어요.",
      "Ovqat yeyman."
     ]
    ]
   },
   {
    "title": "주세요 — bering",
    "text": "Do'konda va kafeda eng kerakli so'z: [narsa] + 주세요.",
    "examples": [
     [
      "물 주세요.",
      "Suv bering."
     ],
     [
      "김치 주세요.",
      "Kimchi bering."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u6l1",
    "title": "Suv, pishgan guruch",
    "words": [
     {
      "fr": "물",
      "uz": "suv",
      "ro": "mul",
      "emoji": "💧"
     },
     {
      "fr": "밥",
      "uz": "pishgan guruch, ovqat",
      "ro": "bap",
      "emoji": "🍚",
      "alt": [
       "pishgan guruch",
       "ovqat"
      ]
     },
     {
      "fr": "빵",
      "uz": "non",
      "ro": "ppang",
      "emoji": "🍞"
     },
     {
      "fr": "고기",
      "uz": "go'sht",
      "ro": "gogi",
      "emoji": "🥩"
     },
     {
      "fr": "사과",
      "uz": "olma",
      "ro": "sagwa",
      "emoji": "🍎"
     }
    ],
    "sentences": [
     {
      "fr": "물을 마셔요.",
      "uz": "Suv ichaman.",
      "ro": "mureul masyeoyo."
     },
     {
      "fr": "아침에 빵을 먹어요.",
      "uz": "Ertalab non yeyman.",
      "ro": "achime ppangeul meogeoyo."
     },
     {
      "fr": "김치가 맛있어요.",
      "uz": "Kimchi mazali.",
      "ro": "gimchiga masisseoyo."
     },
     {
      "fr": "커피 한 잔 주세요.",
      "uz": "Bir piyola qahva bering.",
      "ro": "keopi han jan juseyo."
     },
     {
      "fr": "저는 고기를 좋아해요.",
      "uz": "Men go'shtni yaxshi ko'raman.",
      "ro": "jeoneun gogireul joahaeyo."
     }
    ]
   },
   {
    "id": "u6l2",
    "title": "Sut, choy",
    "words": [
     {
      "fr": "우유",
      "uz": "sut",
      "ro": "uyu",
      "emoji": "🥛"
     },
     {
      "fr": "차",
      "uz": "choy",
      "ro": "cha",
      "emoji": "🍵"
     },
     {
      "fr": "커피",
      "uz": "qahva",
      "ro": "keopi",
      "emoji": "☕"
     },
     {
      "fr": "김치",
      "uz": "kimchi",
      "ro": "gimchi",
      "emoji": "🥬"
     },
     {
      "fr": "계란",
      "uz": "tuxum",
      "ro": "gyeran",
      "emoji": "🥚"
     }
    ],
    "sentences": [
     {
      "fr": "커피 한 잔 주세요.",
      "uz": "Bir piyola qahva bering.",
      "ro": "keopi han jan juseyo."
     },
     {
      "fr": "저는 고기를 좋아해요.",
      "uz": "Men go'shtni yaxshi ko'raman.",
      "ro": "jeoneun gogireul joahaeyo."
     },
     {
      "fr": "우유하고 계란을 사요.",
      "uz": "Sut va tuxum sotib olaman.",
      "ro": "uyuhago gyeraneul sayo."
     },
     {
      "fr": "사과가 얼마예요?",
      "uz": "Olma qancha turadi?",
      "ro": "sagwaga eolmayeyo?"
     },
     {
      "fr": "밥을 먹었어요?",
      "uz": "Ovqatlandingizmi?",
      "ro": "babeul meogeosseoyo?"
     }
    ]
   }
  ]
 },
 {
  "id": "u7",
  "level": "A1",
  "title": "Vaqt va joy",
  "description": "Bugun, ertaga va qayerda",
  "color": "#4ADE80",
  "guide": [
   {
    "title": "에 — joy va vaqt",
    "text": "Borish joyi va vaqtga 에 qo'shiladi: 학교에 가요 (maktabga boraman), 세 시에 (soat uchda).",
    "examples": [
     [
      "집에 가요.",
      "Uyga boraman."
     ],
     [
      "내일 만나요.",
      "Ertaga ko'rishamiz."
     ]
    ]
   },
   {
    "title": "있어요 / 없어요",
    "text": "있어요 — bor, …da; 없어요 — yo'q.",
    "examples": [
     [
      "집에 있어요.",
      "Uydaman."
     ],
     [
      "시간이 없어요.",
      "Vaqtim yo'q."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u7l1",
    "title": "Bugun, ertaga",
    "words": [
     {
      "fr": "오늘",
      "uz": "bugun",
      "ro": "oneul",
      "emoji": "📅"
     },
     {
      "fr": "내일",
      "uz": "ertaga",
      "ro": "naeil",
      "emoji": "➡️"
     },
     {
      "fr": "어제",
      "uz": "kecha",
      "ro": "eoje",
      "emoji": "⬅️"
     },
     {
      "fr": "지금",
      "uz": "hozir",
      "ro": "jigeum",
      "emoji": "⏰"
     },
     {
      "fr": "학교",
      "uz": "maktab",
      "ro": "hakgyo",
      "emoji": "🏫"
     }
    ],
    "sentences": [
     {
      "fr": "오늘 학교에 가요.",
      "uz": "Bugun maktabga boraman.",
      "ro": "oneul hakgyoe gayo."
     },
     {
      "fr": "내일 시장에 가요.",
      "uz": "Ertaga bozorga boraman.",
      "ro": "naeil sijange gayo."
     },
     {
      "fr": "어제 집에 있었어요.",
      "uz": "Kecha uyda edim.",
      "ro": "eoje jibe isseosseoyo."
     },
     {
      "fr": "지금 회사에 있어요.",
      "uz": "Hozir ishxonadaman.",
      "ro": "jigeum hoesae isseoyo."
     },
     {
      "fr": "병원이 어디에 있어요?",
      "uz": "Shifoxona qayerda?",
      "ro": "byeongwoni eodie isseoyo?"
     }
    ]
   },
   {
    "id": "u7l2",
    "title": "Uy, kompaniya",
    "words": [
     {
      "fr": "집",
      "uz": "uy",
      "ro": "jip",
      "emoji": "🏠"
     },
     {
      "fr": "회사",
      "uz": "kompaniya, ishxona",
      "ro": "hoesa",
      "emoji": "🏢",
      "alt": [
       "kompaniya",
       "ishxona"
      ]
     },
     {
      "fr": "시장",
      "uz": "bozor",
      "ro": "sijang",
      "emoji": "🛒"
     },
     {
      "fr": "병원",
      "uz": "shifoxona",
      "ro": "byeongwon",
      "emoji": "🏥"
     },
     {
      "fr": "한국",
      "uz": "Koreya",
      "ro": "hanguk",
      "emoji": "🇰🇷"
     }
    ],
    "sentences": [
     {
      "fr": "지금 회사에 있어요.",
      "uz": "Hozir ishxonadaman.",
      "ro": "jigeum hoesae isseoyo."
     },
     {
      "fr": "병원이 어디에 있어요?",
      "uz": "Shifoxona qayerda?",
      "ro": "byeongwoni eodie isseoyo?"
     },
     {
      "fr": "저는 한국에 살아요.",
      "uz": "Men Koreyada yashayman.",
      "ro": "jeoneun hanguge sarayo."
     },
     {
      "fr": "내일 만나요!",
      "uz": "Ertaga ko'rishamiz!",
      "ro": "naeil mannayo!"
     },
     {
      "fr": "지금 몇 시예요?",
      "uz": "Hozir soat necha?",
      "ro": "jigeum myeot siyeyo?"
     }
    ]
   }
  ]
 },
 {
  "id": "u8",
  "level": "A1",
  "title": "Fe'llar",
  "description": "Eng kerakli kundalik fe'llar",
  "color": "#38BDF8",
  "guide": [
   {
    "title": "Lug'at shakli -다",
    "text": "Barcha fe'llar lug'atda -다 bilan tugaydi: 가다, 먹다. Gapda -다 tushib, -아요/-어요 qo'shiladi.",
    "examples": [
     [
      "가다 → 가요",
      "bormoq → boraman"
     ],
     [
      "먹다 → 먹어요",
      "yemoq → yeyman"
     ]
    ]
   },
   {
    "title": "Fe'l doim oxirida",
    "text": "Koreys tilida ham o'zbek tilidagidek fe'l gap oxirida keladi: Men kitob o'qiyman = 저는 책을 읽어요.",
    "examples": [
     [
      "저는 책을 읽어요.",
      "Men kitob o'qiyman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u8l1",
    "title": "Bormoq, kelmoq",
    "words": [
     {
      "fr": "가다",
      "uz": "bormoq",
      "ro": "gada",
      "emoji": "🚶"
     },
     {
      "fr": "오다",
      "uz": "kelmoq",
      "ro": "oda",
      "emoji": "🏃"
     },
     {
      "fr": "먹다",
      "uz": "yemoq",
      "ro": "meokda",
      "emoji": "🍽️"
     },
     {
      "fr": "마시다",
      "uz": "ichmoq",
      "ro": "masida",
      "emoji": "🥤"
     },
     {
      "fr": "보다",
      "uz": "ko'rmoq",
      "ro": "boda",
      "emoji": "👀"
     },
     {
      "fr": "하다",
      "uz": "qilmoq",
      "ro": "hada",
      "emoji": "✋"
     }
    ],
    "sentences": [
     {
      "fr": "저는 학교에 가요.",
      "uz": "Men maktabga boraman.",
      "ro": "jeoneun hakgyoe gayo."
     },
     {
      "fr": "친구가 집에 와요.",
      "uz": "Do'stim uyga keladi.",
      "ro": "chinguga jibe wayo."
     },
     {
      "fr": "밥을 먹어요.",
      "uz": "Ovqat yeyman.",
      "ro": "babeul meogeoyo."
     },
     {
      "fr": "책을 읽어요.",
      "uz": "Kitob o'qiyman.",
      "ro": "chaegeul ilgeoyo."
     },
     {
      "fr": "한국어를 배워요.",
      "uz": "Koreys tilini o'rganaman.",
      "ro": "hangugeoreul baewoyo."
     }
    ]
   },
   {
    "id": "u8l2",
    "title": "Uxlamoq, o'qimoq",
    "words": [
     {
      "fr": "자다",
      "uz": "uxlamoq",
      "ro": "jada",
      "emoji": "😴"
     },
     {
      "fr": "읽다",
      "uz": "o'qimoq",
      "ro": "ikda",
      "emoji": "📖"
     },
     {
      "fr": "쓰다",
      "uz": "yozmoq",
      "ro": "sseuda",
      "emoji": "✍️"
     },
     {
      "fr": "배우다",
      "uz": "o'rganmoq",
      "ro": "baeuda",
      "emoji": "🎓"
     },
     {
      "fr": "일하다",
      "uz": "ishlamoq",
      "ro": "ilhada",
      "emoji": "💼"
     },
     {
      "fr": "사다",
      "uz": "sotib olmoq",
      "ro": "sada",
      "emoji": "🛍️"
     }
    ],
    "sentences": [
     {
      "fr": "책을 읽어요.",
      "uz": "Kitob o'qiyman.",
      "ro": "chaegeul ilgeoyo."
     },
     {
      "fr": "한국어를 배워요.",
      "uz": "Koreys tilini o'rganaman.",
      "ro": "hangugeoreul baewoyo."
     },
     {
      "fr": "영화를 봐요.",
      "uz": "Kino ko'raman.",
      "ro": "yeonghwareul bwayo."
     },
     {
      "fr": "편지를 써요.",
      "uz": "Xat yozaman.",
      "ro": "pyeonjireul sseoyo."
     },
     {
      "fr": "열한 시에 자요.",
      "uz": "Soat o'n birda uxlayman.",
      "ro": "yeolhan sie jayo."
     }
    ]
   }
  ]
 },
 {
  "id": "u9",
  "level": "A1",
  "title": "Koreys sonlari",
  "description": "Sof koreys sonlari: sanash, yosh, soat",
  "color": "#F472B6",
  "guide": [
   {
    "title": "Sof koreys sonlari",
    "text": "하나, 둘, 셋… — narsalarni sanash, yosh va soat uchun. Hisob so'zidan oldin qisqaradi: 하나→한, 둘→두, 셋→세, 넷→네.",
    "examples": [
     [
      "한 개",
      "bitta (narsa)"
     ],
     [
      "두 시",
      "soat ikki"
     ]
    ]
   },
   {
    "title": "Hisob so'zlari",
    "text": "명 — kishi, 개 — narsa, 마리 — hayvon, 잔 — piyola, 권 — kitob, 살 — yosh.",
    "examples": [
     [
      "세 명",
      "uch kishi"
     ],
     [
      "커피 두 잔",
      "ikki piyola qahva"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u9l1",
    "title": "Bitta, ikkita",
    "words": [
     {
      "fr": "하나",
      "uz": "bitta",
      "ro": "hana",
      "emoji": "1️⃣"
     },
     {
      "fr": "둘",
      "uz": "ikkita",
      "ro": "dul",
      "emoji": "2️⃣"
     },
     {
      "fr": "셋",
      "uz": "uchta",
      "ro": "set",
      "emoji": "3️⃣"
     },
     {
      "fr": "넷",
      "uz": "to'rtta",
      "ro": "net",
      "emoji": "4️⃣"
     },
     {
      "fr": "다섯",
      "uz": "beshta",
      "ro": "daseot",
      "emoji": "5️⃣"
     },
     {
      "fr": "여섯",
      "uz": "oltita",
      "ro": "yeoseot",
      "emoji": "6️⃣"
     }
    ],
    "sentences": [
     {
      "fr": "사과 하나 주세요.",
      "uz": "Bitta olma bering.",
      "ro": "sagwa hana juseyo."
     },
     {
      "fr": "저는 스물한 살이에요.",
      "uz": "Men yigirma bir yoshdaman.",
      "ro": "jeoneun seumulhan sarieyo."
     },
     {
      "fr": "학생이 열 명 있어요.",
      "uz": "O'nta talaba bor.",
      "ro": "haksaengi yeol myeong isseoyo."
     },
     {
      "fr": "커피 두 잔 주세요.",
      "uz": "Ikki piyola qahva bering.",
      "ro": "keopi du jan juseyo."
     },
     {
      "fr": "지금 세 시예요.",
      "uz": "Hozir soat uch.",
      "ro": "jigeum se siyeyo."
     }
    ]
   },
   {
    "id": "u9l2",
    "title": "Yettita, sakkizta",
    "words": [
     {
      "fr": "일곱",
      "uz": "yettita",
      "ro": "ilgop",
      "emoji": "7️⃣"
     },
     {
      "fr": "여덟",
      "uz": "sakkizta",
      "ro": "yeodeol",
      "emoji": "8️⃣"
     },
     {
      "fr": "아홉",
      "uz": "to'qqizta",
      "ro": "ahop",
      "emoji": "9️⃣"
     },
     {
      "fr": "열",
      "uz": "o'nta",
      "ro": "yeol",
      "emoji": "🔟"
     },
     {
      "fr": "스물",
      "uz": "yigirmata",
      "ro": "seumul",
      "emoji": "2️⃣"
     }
    ],
    "sentences": [
     {
      "fr": "커피 두 잔 주세요.",
      "uz": "Ikki piyola qahva bering.",
      "ro": "keopi du jan juseyo."
     },
     {
      "fr": "지금 세 시예요.",
      "uz": "Hozir soat uch.",
      "ro": "jigeum se siyeyo."
     },
     {
      "fr": "고양이가 다섯 마리 있어요.",
      "uz": "Beshta mushuk bor.",
      "ro": "goyangiga daseot mari isseoyo."
     },
     {
      "fr": "책 네 권을 샀어요.",
      "uz": "To'rtta kitob sotib oldim.",
      "ro": "chaek ne gwoneul sasseoyo."
     },
     {
      "fr": "일곱 시에 일어나요.",
      "uz": "Soat yettida turaman.",
      "ro": "ilgop sie ireonayo."
     }
    ]
   }
  ]
 },
 {
  "id": "u10",
  "level": "A1",
  "title": "Savol so'zlari",
  "description": "Kim? Nima? Qayerda? Qachon?",
  "color": "#A78BFA",
  "guide": [
   {
    "title": "Savol ohangi",
    "text": "-요 bilan tugagan gap ohangni ko'tarib aytilsa, savolga aylanadi.",
    "examples": [
     [
      "괜찮아요?",
      "Yaxshimisiz?"
     ],
     [
      "괜찮아요.",
      "Yaxshiman."
     ]
    ]
   },
   {
    "title": "이게 뭐예요?",
    "text": "Eng foydali savol: «Bu nima?». Javob: 이것은 ___이에요/예요.",
    "examples": [
     [
      "이게 뭐예요?",
      "Bu nima?"
     ],
     [
      "얼마예요?",
      "Qancha turadi?"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u10l1",
    "title": "Kim, nima",
    "words": [
     {
      "fr": "누구",
      "uz": "kim",
      "ro": "nugu",
      "emoji": "🧑"
     },
     {
      "fr": "뭐",
      "uz": "nima",
      "ro": "mwo",
      "emoji": "❓"
     },
     {
      "fr": "어디",
      "uz": "qayer",
      "ro": "eodi",
      "emoji": "📍"
     },
     {
      "fr": "언제",
      "uz": "qachon",
      "ro": "eonje",
      "emoji": "🕒"
     },
     {
      "fr": "왜",
      "uz": "nega",
      "ro": "wae",
      "emoji": "🤔"
     }
    ],
    "sentences": [
     {
      "fr": "이 사람은 누구예요?",
      "uz": "Bu odam kim?",
      "ro": "i sarameun nuguyeyo?"
     },
     {
      "fr": "이게 뭐예요?",
      "uz": "Bu nima?",
      "ro": "ige mwoyeyo?"
     },
     {
      "fr": "화장실이 어디예요?",
      "uz": "Hojatxona qayerda?",
      "ro": "hwajangsiri eodiyeyo?"
     },
     {
      "fr": "생일이 언제예요?",
      "uz": "Tug'ilgan kuningiz qachon?",
      "ro": "saengiri eonjeyeyo?"
     },
     {
      "fr": "왜 한국어를 배워요?",
      "uz": "Nega koreys tilini o'rganasiz?",
      "ro": "wae hangugeoreul baewoyo?"
     }
    ]
   },
   {
    "id": "u10l2",
    "title": "Qanday qilib, qancha",
    "words": [
     {
      "fr": "어떻게",
      "uz": "qanday qilib",
      "ro": "eotteoke",
      "emoji": "🛠️"
     },
     {
      "fr": "얼마",
      "uz": "qancha (narx)",
      "ro": "eolma",
      "emoji": "💰",
      "alt": [
       "qancha"
      ]
     },
     {
      "fr": "몇",
      "uz": "nechta",
      "ro": "myeot",
      "emoji": "🔢"
     },
     {
      "fr": "어느",
      "uz": "qaysi",
      "ro": "eoneu",
      "emoji": "👉"
     },
     {
      "fr": "무슨",
      "uz": "qanaqa",
      "ro": "museun",
      "emoji": "❔"
     }
    ],
    "sentences": [
     {
      "fr": "생일이 언제예요?",
      "uz": "Tug'ilgan kuningiz qachon?",
      "ro": "saengiri eonjeyeyo?"
     },
     {
      "fr": "왜 한국어를 배워요?",
      "uz": "Nega koreys tilini o'rganasiz?",
      "ro": "wae hangugeoreul baewoyo?"
     },
     {
      "fr": "이거 얼마예요?",
      "uz": "Bu qancha turadi?",
      "ro": "igeo eolmayeyo?"
     },
     {
      "fr": "몇 살이에요?",
      "uz": "Necha yoshdasiz?",
      "ro": "myeot sarieyo?"
     },
     {
      "fr": "어느 나라 사람이에요?",
      "uz": "Qaysi davlatdansiz?",
      "ro": "eoneu nara saramieyo?"
     }
    ]
   }
  ]
 },
 {
  "id": "u11",
  "level": "A1",
  "title": "Ranglar",
  "description": "Atrofdagi ranglar",
  "color": "#FB923C",
  "guide": [
   {
    "title": "-색 — rang",
    "text": "Ranglar ko'pincha -색 (rang) bilan tugaydi: 빨간색 — qizil rang. Sifat sifatida: 빨간 사과 — qizil olma.",
    "examples": [
     [
      "빨간 사과",
      "qizil olma"
     ],
     [
      "파란 하늘",
      "ko'k osmon"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u11l1",
    "title": "Rang, qizil",
    "words": [
     {
      "fr": "색깔",
      "uz": "rang",
      "ro": "saekkkal",
      "emoji": "🎨"
     },
     {
      "fr": "빨간색",
      "uz": "qizil",
      "ro": "ppalgansaek",
      "emoji": "🔴"
     },
     {
      "fr": "파란색",
      "uz": "ko'k",
      "ro": "paransaek",
      "emoji": "🔵"
     },
     {
      "fr": "노란색",
      "uz": "sariq",
      "ro": "noransaek",
      "emoji": "🟡"
     },
     {
      "fr": "초록색",
      "uz": "yashil",
      "ro": "choroksaek",
      "emoji": "🟢"
     },
     {
      "fr": "검은색",
      "uz": "qora",
      "ro": "geomeunsaek",
      "emoji": "⚫"
     }
    ],
    "sentences": [
     {
      "fr": "무슨 색깔을 좋아해요?",
      "uz": "Qaysi rangni yoqtirasiz?",
      "ro": "museun saekkareul joahaeyo?"
     },
     {
      "fr": "저는 파란색을 좋아해요.",
      "uz": "Men ko'k rangni yoqtiraman.",
      "ro": "jeoneun paransaegeul joahaeyo."
     },
     {
      "fr": "사과는 빨간색이에요.",
      "uz": "Olma qizil rangda.",
      "ro": "sagwaneun ppalgansaegieyo."
     },
     {
      "fr": "바나나는 노란색이에요.",
      "uz": "Banan sariq.",
      "ro": "bananeun noransaegieyo."
     },
     {
      "fr": "흰색 셔츠를 샀어요.",
      "uz": "Oq ko'ylak sotib oldim.",
      "ro": "huinsaek syeocheureul sasseoyo."
     }
    ]
   },
   {
    "id": "u11l2",
    "title": "Oq, pushti",
    "words": [
     {
      "fr": "흰색",
      "uz": "oq",
      "ro": "huinsaek",
      "emoji": "⚪"
     },
     {
      "fr": "분홍색",
      "uz": "pushti",
      "ro": "bunhongsaek",
      "emoji": "🌸"
     },
     {
      "fr": "회색",
      "uz": "kulrang",
      "ro": "hoesaek",
      "emoji": "🩶"
     },
     {
      "fr": "갈색",
      "uz": "jigarrang",
      "ro": "galsaek",
      "emoji": "🟤"
     },
     {
      "fr": "주황색",
      "uz": "to'q sariq",
      "ro": "juhwangsaek",
      "emoji": "🟠"
     },
     {
      "fr": "보라색",
      "uz": "binafsha",
      "ro": "borasaek",
      "emoji": "🟣"
     }
    ],
    "sentences": [
     {
      "fr": "바나나는 노란색이에요.",
      "uz": "Banan sariq.",
      "ro": "bananeun noransaegieyo."
     },
     {
      "fr": "흰색 셔츠를 샀어요.",
      "uz": "Oq ko'ylak sotib oldim.",
      "ro": "huinsaek syeocheureul sasseoyo."
     },
     {
      "fr": "검은색 가방이 있어요.",
      "uz": "Qora sumkam bor.",
      "ro": "geomeunsaek gabangi isseoyo."
     },
     {
      "fr": "나무는 초록색이에요.",
      "uz": "Daraxt yashil.",
      "ro": "namuneun choroksaegieyo."
     },
     {
      "fr": "분홍색 꽃이 예뻐요.",
      "uz": "Pushti gul chiroyli.",
      "ro": "bunhongsaek kkochi yeppeoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u12",
  "level": "A1",
  "title": "Hayvonlar",
  "description": "Uy va yovvoyi hayvonlar",
  "color": "#2DD4BF",
  "guide": [
   {
    "title": "호랑이 — Koreya ramzi",
    "text": "Yo'lbars qadimdan Koreyaning ramzi. Go Topic maskoti ham — oq Amur yo'lbarscha!",
    "examples": [
     [
      "호랑이",
      "yo'lbars"
     ],
     [
      "귀여운 고양이",
      "yoqimtoy mushuk"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u12l1",
    "title": "It, mushuk",
    "words": [
     {
      "fr": "개",
      "uz": "it",
      "ro": "gae",
      "emoji": "🐶"
     },
     {
      "fr": "고양이",
      "uz": "mushuk",
      "ro": "goyangi",
      "emoji": "🐱"
     },
     {
      "fr": "새",
      "uz": "qush",
      "ro": "sae",
      "emoji": "🐦"
     },
     {
      "fr": "말",
      "uz": "ot (hayvon)",
      "ro": "mal",
      "emoji": "🐴",
      "alt": [
       "ot"
      ]
     },
     {
      "fr": "소",
      "uz": "sigir",
      "ro": "so",
      "emoji": "🐮"
     },
     {
      "fr": "돼지",
      "uz": "cho'chqa",
      "ro": "dwaeji",
      "emoji": "🐷"
     }
    ],
    "sentences": [
     {
      "fr": "저는 고양이를 좋아해요.",
      "uz": "Men mushukni yaxshi ko'raman.",
      "ro": "jeoneun goyangireul joahaeyo."
     },
     {
      "fr": "개가 공원에서 뛰어요.",
      "uz": "It bog'da yuguryapti.",
      "ro": "gaega gongwoneseo ttwieoyo."
     },
     {
      "fr": "호랑이는 한국의 상징이에요.",
      "uz": "Yo'lbars — Koreyaning ramzi.",
      "ro": "horangineun hangugui sangjingieyo."
     },
     {
      "fr": "새가 노래해요.",
      "uz": "Qush sayrayapti.",
      "ro": "saega noraehaeyo."
     },
     {
      "fr": "물고기가 물에 있어요.",
      "uz": "Baliq suvda.",
      "ro": "mulgogiga mure isseoyo."
     }
    ]
   },
   {
    "id": "u12l2",
    "title": "Tovuq, baliq",
    "words": [
     {
      "fr": "닭",
      "uz": "tovuq",
      "ro": "dak",
      "emoji": "🐔"
     },
     {
      "fr": "물고기",
      "uz": "baliq",
      "ro": "mulgogi",
      "emoji": "🐟"
     },
     {
      "fr": "토끼",
      "uz": "quyon",
      "ro": "tokki",
      "emoji": "🐰"
     },
     {
      "fr": "호랑이",
      "uz": "yo'lbars",
      "ro": "horangi",
      "emoji": "🐯"
     },
     {
      "fr": "곰",
      "uz": "ayiq",
      "ro": "gom",
      "emoji": "🐻"
     },
     {
      "fr": "양",
      "uz": "qo'y",
      "ro": "yang",
      "emoji": "🐑"
     }
    ],
    "sentences": [
     {
      "fr": "새가 노래해요.",
      "uz": "Qush sayrayapti.",
      "ro": "saega noraehaeyo."
     },
     {
      "fr": "물고기가 물에 있어요.",
      "uz": "Baliq suvda.",
      "ro": "mulgogiga mure isseoyo."
     },
     {
      "fr": "토끼가 귀여워요.",
      "uz": "Quyon yoqimtoy.",
      "ro": "tokkiga gwiyeowoyo."
     },
     {
      "fr": "곰은 커요.",
      "uz": "Ayiq katta.",
      "ro": "gomeun keoyo."
     },
     {
      "fr": "농장에 소하고 닭이 있어요.",
      "uz": "Fermada sigir va tovuq bor.",
      "ro": "nongjange sohago dalgi isseoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u13",
  "level": "A1",
  "title": "Meva va sabzavot",
  "description": "Bozordagi meva va sabzavotlar",
  "color": "#B49CFF",
  "guide": [
   {
    "title": "하고 — va",
    "text": "Ikki otni bog'lash uchun 하고: 사과하고 바나나 — olma va banan.",
    "examples": [
     [
      "감자하고 양파",
      "kartoshka va piyoz"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u13l1",
    "title": "Meva, sabzavot",
    "words": [
     {
      "fr": "과일",
      "uz": "meva",
      "ro": "gwail",
      "emoji": "🍓"
     },
     {
      "fr": "채소",
      "uz": "sabzavot",
      "ro": "chaeso",
      "emoji": "🥗"
     },
     {
      "fr": "바나나",
      "uz": "banan",
      "ro": "banana",
      "emoji": "🍌"
     },
     {
      "fr": "포도",
      "uz": "uzum",
      "ro": "podo",
      "emoji": "🍇"
     },
     {
      "fr": "수박",
      "uz": "tarvuz",
      "ro": "subak",
      "emoji": "🍉"
     }
    ],
    "sentences": [
     {
      "fr": "과일을 좋아해요.",
      "uz": "Mevani yaxshi ko'raman.",
      "ro": "gwaireul joahaeyo."
     },
     {
      "fr": "수박이 달아요.",
      "uz": "Tarvuz shirin.",
      "ro": "subagi darayo."
     },
     {
      "fr": "딸기 주스 주세요.",
      "uz": "Qulupnay sharbati bering.",
      "ro": "ttalgi juseu juseyo."
     },
     {
      "fr": "채소를 많이 먹어요.",
      "uz": "Sabzavotni ko'p yeyman.",
      "ro": "chaesoreul mani meogeoyo."
     },
     {
      "fr": "감자하고 양파를 샀어요.",
      "uz": "Kartoshka va piyoz sotib oldim.",
      "ro": "gamjahago yangpareul sasseoyo."
     }
    ]
   },
   {
    "id": "u13l2",
    "title": "Qulupnay, apelsin",
    "words": [
     {
      "fr": "딸기",
      "uz": "qulupnay",
      "ro": "ttalgi",
      "emoji": "🍓"
     },
     {
      "fr": "오렌지",
      "uz": "apelsin",
      "ro": "orenji",
      "emoji": "🍊"
     },
     {
      "fr": "감자",
      "uz": "kartoshka",
      "ro": "gamja",
      "emoji": "🥔"
     },
     {
      "fr": "양파",
      "uz": "piyoz",
      "ro": "yangpa",
      "emoji": "🧅"
     },
     {
      "fr": "당근",
      "uz": "sabzi",
      "ro": "danggeun",
      "emoji": "🥕"
     },
     {
      "fr": "토마토",
      "uz": "pomidor",
      "ro": "tomato",
      "emoji": "🍅"
     },
     {
      "fr": "오이",
      "uz": "bodring",
      "ro": "oi",
      "emoji": "🥒"
     },
     {
      "fr": "마늘",
      "uz": "sarimsoq",
      "ro": "maneul",
      "emoji": "🧄"
     }
    ],
    "sentences": [
     {
      "fr": "채소를 많이 먹어요.",
      "uz": "Sabzavotni ko'p yeyman.",
      "ro": "chaesoreul mani meogeoyo."
     },
     {
      "fr": "감자하고 양파를 샀어요.",
      "uz": "Kartoshka va piyoz sotib oldim.",
      "ro": "gamjahago yangpareul sasseoyo."
     },
     {
      "fr": "바나나 한 개에 천 원이에요.",
      "uz": "Bitta banan ming von.",
      "ro": "banana han gae-e cheon wonieyo."
     },
     {
      "fr": "포도가 정말 맛있어요.",
      "uz": "Uzum juda mazali.",
      "ro": "podoga jeongmal masisseoyo."
     },
     {
      "fr": "당근은 몸에 좋아요.",
      "uz": "Sabzi sog'liqqa foydali.",
      "ro": "danggeuneun mome joayo."
     }
    ]
   }
  ]
 },
 {
  "id": "u14",
  "level": "A2",
  "title": "Tana",
  "description": "Tana a'zolari va shifokorda",
  "color": "#FF8FD0",
  "guide": [
   {
    "title": "아파요 — og'riyapti",
    "text": "[tana a'zosi] + 이/가 아파요 — «…im og'riyapti». Shifokorda eng kerakli ibora.",
    "examples": [
     [
      "머리가 아파요.",
      "Boshim og'riyapti."
     ],
     [
      "배가 아파요.",
      "Qornim og'riyapti."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u14l1",
    "title": "Tana, bosh",
    "words": [
     {
      "fr": "몸",
      "uz": "tana",
      "ro": "mom",
      "emoji": "🧍"
     },
     {
      "fr": "머리",
      "uz": "bosh",
      "ro": "meori",
      "emoji": "🧠"
     },
     {
      "fr": "얼굴",
      "uz": "yuz",
      "ro": "eolgul",
      "emoji": "🙂"
     },
     {
      "fr": "눈",
      "uz": "ko'z",
      "ro": "nun",
      "emoji": "👁️"
     },
     {
      "fr": "코",
      "uz": "burun",
      "ro": "ko",
      "emoji": "👃"
     }
    ],
    "sentences": [
     {
      "fr": "머리가 아파요.",
      "uz": "Boshim og'riyapti.",
      "ro": "meoriga apayo."
     },
     {
      "fr": "눈이 커요.",
      "uz": "Ko'zlari katta.",
      "ro": "nuni keoyo."
     },
     {
      "fr": "손을 씻으세요.",
      "uz": "Qo'lingizni yuving.",
      "ro": "soneul ssiseuseyo."
     },
     {
      "fr": "다리가 길어요.",
      "uz": "Oyoqlari uzun.",
      "ro": "dariga gireoyo."
     },
     {
      "fr": "얼굴이 예뻐요.",
      "uz": "Yuzi chiroyli.",
      "ro": "eolguri yeppeoyo."
     }
    ]
   },
   {
    "id": "u14l2",
    "title": "Og'iz, quloq",
    "words": [
     {
      "fr": "입",
      "uz": "og'iz",
      "ro": "ip",
      "emoji": "👄"
     },
     {
      "fr": "귀",
      "uz": "quloq",
      "ro": "gwi",
      "emoji": "👂"
     },
     {
      "fr": "목",
      "uz": "bo'yin",
      "ro": "mok",
      "emoji": "🦒"
     },
     {
      "fr": "어깨",
      "uz": "yelka",
      "ro": "eokkae",
      "emoji": "💪"
     },
     {
      "fr": "손",
      "uz": "qo'l (kaft)",
      "ro": "son",
      "emoji": "✋",
      "alt": [
       "qo'l"
      ]
     },
     {
      "fr": "다리",
      "uz": "oyoq",
      "ro": "dari",
      "emoji": "🦵"
     },
     {
      "fr": "발",
      "uz": "oyoq panjasi",
      "ro": "bal",
      "emoji": "🦶"
     },
     {
      "fr": "허리",
      "uz": "bel",
      "ro": "heori",
      "emoji": "🧘"
     }
    ],
    "sentences": [
     {
      "fr": "다리가 길어요.",
      "uz": "Oyoqlari uzun.",
      "ro": "dariga gireoyo."
     },
     {
      "fr": "얼굴이 예뻐요.",
      "uz": "Yuzi chiroyli.",
      "ro": "eolguri yeppeoyo."
     },
     {
      "fr": "목이 아파서 병원에 가요.",
      "uz": "Tomog'im og'rigani uchun shifoxonaga boraman.",
      "ro": "mogi apaseo byeongwone gayo."
     },
     {
      "fr": "허리가 안 좋아요.",
      "uz": "Belim yaxshi emas.",
      "ro": "heoriga an joayo."
     },
     {
      "fr": "입을 크게 벌리세요.",
      "uz": "Og'zingizni katta oching.",
      "ro": "ibeul keuge beolliseyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u15",
  "level": "A2",
  "title": "Kiyim",
  "description": "Kiyimlar va kiyinish fe'llari",
  "color": "#7FE3FF",
  "guide": [
   {
    "title": "Kiyish fe'llari",
    "text": "Koreyschada kiyimga qarab fe'l o'zgaradi: 입다 (kiyim), 신다 (poyabzal), 쓰다 (bosh kiyim, ko'zoynak), 하다 (aksessuar).",
    "examples": [
     [
      "옷을 입어요.",
      "Kiyim kiyaman."
     ],
     [
      "모자를 써요.",
      "Bosh kiyim kiyaman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u15l1",
    "title": "Kiyim, shim",
    "words": [
     {
      "fr": "옷",
      "uz": "kiyim",
      "ro": "ot",
      "emoji": "👕"
     },
     {
      "fr": "바지",
      "uz": "shim",
      "ro": "baji",
      "emoji": "👖"
     },
     {
      "fr": "치마",
      "uz": "yubka",
      "ro": "chima",
      "emoji": "👗"
     },
     {
      "fr": "셔츠",
      "uz": "ko'ylak",
      "ro": "syeocheu",
      "emoji": "👔"
     },
     {
      "fr": "코트",
      "uz": "palto",
      "ro": "koteu",
      "emoji": "🧥"
     },
     {
      "fr": "신발",
      "uz": "poyabzal",
      "ro": "sinbal",
      "emoji": "👟"
     }
    ],
    "sentences": [
     {
      "fr": "이 옷이 예뻐요.",
      "uz": "Bu kiyim chiroyli.",
      "ro": "i osi yeppeoyo."
     },
     {
      "fr": "바지를 사고 싶어요.",
      "uz": "Shim sotib olmoqchiman.",
      "ro": "bajireul sago sipeoyo."
     },
     {
      "fr": "신발이 작아요.",
      "uz": "Poyabzal kichik.",
      "ro": "sinbari jagayo."
     },
     {
      "fr": "모자를 써요.",
      "uz": "Bosh kiyim kiyaman.",
      "ro": "mojareul sseoyo."
     },
     {
      "fr": "우산을 가지고 가세요.",
      "uz": "Soyabonni olib keting.",
      "ro": "usaneul gajigo gaseyo."
     }
    ]
   },
   {
    "id": "u15l2",
    "title": "Paypoq, bosh kiyim",
    "words": [
     {
      "fr": "양말",
      "uz": "paypoq",
      "ro": "yangmal",
      "emoji": "🧦"
     },
     {
      "fr": "모자",
      "uz": "bosh kiyim",
      "ro": "moja",
      "emoji": "🧢"
     },
     {
      "fr": "가방",
      "uz": "sumka",
      "ro": "gabang",
      "emoji": "👜"
     },
     {
      "fr": "안경",
      "uz": "ko'zoynak",
      "ro": "angyeong",
      "emoji": "👓"
     },
     {
      "fr": "시계",
      "uz": "soat (buyum)",
      "ro": "sigye",
      "emoji": "⌚",
      "alt": [
       "soat"
      ]
     },
     {
      "fr": "우산",
      "uz": "soyabon",
      "ro": "usan",
      "emoji": "☂️"
     }
    ],
    "sentences": [
     {
      "fr": "모자를 써요.",
      "uz": "Bosh kiyim kiyaman.",
      "ro": "mojareul sseoyo."
     },
     {
      "fr": "우산을 가지고 가세요.",
      "uz": "Soyabonni olib keting.",
      "ro": "usaneul gajigo gaseyo."
     },
     {
      "fr": "안경을 써요.",
      "uz": "Ko'zoynak taqaman.",
      "ro": "angyeongeul sseoyo."
     },
     {
      "fr": "이 가방은 얼마예요?",
      "uz": "Bu sumka qancha?",
      "ro": "i gabangeun eolmayeyo?"
     },
     {
      "fr": "겨울에는 코트를 입어요.",
      "uz": "Qishda palto kiyaman.",
      "ro": "gyeoureneun koteureul ibeoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u16",
  "level": "A2",
  "title": "Uy ichi",
  "description": "Uy jihozlari va joylashuv",
  "color": "#FFB84D",
  "guide": [
   {
    "title": "Joylashuv: 위, 아래, 옆, 안",
    "text": "[narsa] + 위에 (ustida), 아래에 (ostida), 옆에 (yonida), 안에 (ichida).",
    "examples": [
     [
      "책상 위에",
      "stol ustida"
     ],
     [
      "가방 안에",
      "sumka ichida"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u16l1",
    "title": "Xona, eshik",
    "words": [
     {
      "fr": "방",
      "uz": "xona",
      "ro": "bang",
      "emoji": "🛏️"
     },
     {
      "fr": "문",
      "uz": "eshik",
      "ro": "mun",
      "emoji": "🚪"
     },
     {
      "fr": "창문",
      "uz": "deraza",
      "ro": "changmun",
      "emoji": "🪟"
     },
     {
      "fr": "침대",
      "uz": "karavot",
      "ro": "chimdae",
      "emoji": "🛏️"
     },
     {
      "fr": "의자",
      "uz": "stul",
      "ro": "uija",
      "emoji": "🪑"
     },
     {
      "fr": "책상",
      "uz": "yozuv stoli",
      "ro": "chaeksang",
      "emoji": "🗄️"
     }
    ],
    "sentences": [
     {
      "fr": "방이 깨끗해요.",
      "uz": "Xona toza.",
      "ro": "bangi kkaekkeutaeyo."
     },
     {
      "fr": "문을 닫아 주세요.",
      "uz": "Eshikni yopib qo'ying.",
      "ro": "muneul dada juseyo."
     },
     {
      "fr": "창문을 열어요.",
      "uz": "Derazani ochaman.",
      "ro": "changmuneul yeoreoyo."
     },
     {
      "fr": "책상 위에 책이 있어요.",
      "uz": "Stol ustida kitob bor.",
      "ro": "chaeksang wie chaegi isseoyo."
     },
     {
      "fr": "냉장고에 우유가 있어요.",
      "uz": "Muzlatgichda sut bor.",
      "ro": "naengjanggoe uyuga isseoyo."
     }
    ]
   },
   {
    "id": "u16l2",
    "title": "Oshxona, hojatxona",
    "words": [
     {
      "fr": "부엌",
      "uz": "oshxona (uydagi)",
      "ro": "bueok",
      "emoji": "🍳",
      "alt": [
       "oshxona"
      ]
     },
     {
      "fr": "화장실",
      "uz": "hojatxona",
      "ro": "hwajangsil",
      "emoji": "🚻"
     },
     {
      "fr": "냉장고",
      "uz": "muzlatgich",
      "ro": "naengjanggo",
      "emoji": "🧊"
     },
     {
      "fr": "텔레비전",
      "uz": "televizor",
      "ro": "tellebijeon",
      "emoji": "📺"
     },
     {
      "fr": "열쇠",
      "uz": "kalit",
      "ro": "yeolsoe",
      "emoji": "🔑"
     },
     {
      "fr": "거울",
      "uz": "ko'zgu",
      "ro": "geoul",
      "emoji": "🪞"
     }
    ],
    "sentences": [
     {
      "fr": "책상 위에 책이 있어요.",
      "uz": "Stol ustida kitob bor.",
      "ro": "chaeksang wie chaegi isseoyo."
     },
     {
      "fr": "냉장고에 우유가 있어요.",
      "uz": "Muzlatgichda sut bor.",
      "ro": "naengjanggoe uyuga isseoyo."
     },
     {
      "fr": "화장실이 어디에 있어요?",
      "uz": "Hojatxona qayerda?",
      "ro": "hwajangsiri eodie isseoyo?"
     },
     {
      "fr": "의자에 앉으세요.",
      "uz": "Stulga o'tiring.",
      "ro": "uijae anjeuseyo."
     },
     {
      "fr": "열쇠를 잃어버렸어요.",
      "uz": "Kalitni yo'qotib qo'ydim.",
      "ro": "yeolsoereul ireobeoryeosseoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u17",
  "level": "A2",
  "title": "Transport",
  "description": "Avtobus, metro, taksi — yo'lda",
  "color": "#FF6B9A",
  "guide": [
   {
    "title": "(으)로 — vosita",
    "text": "Transport vositasiga (으)로 qo'shiladi: 버스로 (avtobusda), 지하철로 (metroda).",
    "examples": [
     [
      "버스로 가요.",
      "Avtobusda boraman."
     ],
     [
      "택시로 와요.",
      "Taksida kelaman."
     ]
    ]
   },
   {
    "title": "타다 — chiqmoq/minmoq",
    "text": "Transportga chiqish 타다: 버스를 타요. Tushish — 내리다.",
    "examples": [
     [
      "지하철을 타요.",
      "Metroga chiqaman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u17l1",
    "title": "Avtobus, metro",
    "words": [
     {
      "fr": "버스",
      "uz": "avtobus",
      "ro": "beoseu",
      "emoji": "🚌"
     },
     {
      "fr": "지하철",
      "uz": "metro",
      "ro": "jihacheol",
      "emoji": "🚇"
     },
     {
      "fr": "택시",
      "uz": "taksi",
      "ro": "taeksi",
      "emoji": "🚕"
     },
     {
      "fr": "기차",
      "uz": "poyezd",
      "ro": "gicha",
      "emoji": "🚆"
     },
     {
      "fr": "비행기",
      "uz": "samolyot",
      "ro": "bihaenggi",
      "emoji": "✈️"
     },
     {
      "fr": "자동차",
      "uz": "avtomobil",
      "ro": "jadongcha",
      "emoji": "🚗"
     }
    ],
    "sentences": [
     {
      "fr": "버스를 타요.",
      "uz": "Avtobusga chiqaman.",
      "ro": "beoseureul tayo."
     },
     {
      "fr": "지하철역이 어디예요?",
      "uz": "Metro bekati qayerda?",
      "ro": "jihacheollyeogi eodiyeyo?"
     },
     {
      "fr": "택시로 공항에 가요.",
      "uz": "Taksida aeroportga boraman.",
      "ro": "taeksiro gonghange gayo."
     },
     {
      "fr": "기차표를 샀어요.",
      "uz": "Poyezd chiptasini oldim.",
      "ro": "gichapyoreul sasseoyo."
     },
     {
      "fr": "비행기가 몇 시에 출발해요?",
      "uz": "Samolyot soat nechada uchadi?",
      "ro": "bihaenggiga myeot sie chulbalhaeyo?"
     }
    ]
   },
   {
    "id": "u17l2",
    "title": "Velosiped, stansiya",
    "words": [
     {
      "fr": "자전거",
      "uz": "velosiped",
      "ro": "jajeongeo",
      "emoji": "🚲"
     },
     {
      "fr": "역",
      "uz": "stansiya",
      "ro": "yeok",
      "emoji": "🚉"
     },
     {
      "fr": "정류장",
      "uz": "avtobus bekati",
      "ro": "jeongnyujang",
      "emoji": "🚏"
     },
     {
      "fr": "공항",
      "uz": "aeroport",
      "ro": "gonghang",
      "emoji": "🛫"
     },
     {
      "fr": "길",
      "uz": "yo'l",
      "ro": "gil",
      "emoji": "🛣️"
     },
     {
      "fr": "표",
      "uz": "chipta",
      "ro": "pyo",
      "emoji": "🎫"
     }
    ],
    "sentences": [
     {
      "fr": "기차표를 샀어요.",
      "uz": "Poyezd chiptasini oldim.",
      "ro": "gichapyoreul sasseoyo."
     },
     {
      "fr": "비행기가 몇 시에 출발해요?",
      "uz": "Samolyot soat nechada uchadi?",
      "ro": "bihaenggiga myeot sie chulbalhaeyo?"
     },
     {
      "fr": "자전거를 타고 학교에 가요.",
      "uz": "Velosipedda maktabga boraman.",
      "ro": "jajeongeoreul tago hakgyoe gayo."
     },
     {
      "fr": "정류장에서 기다려요.",
      "uz": "Bekatda kutaman.",
      "ro": "jeongnyujangeseo gidaryeoyo."
     },
     {
      "fr": "길이 막혀요.",
      "uz": "Yo'lda tirbandlik.",
      "ro": "giri makyeoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u18",
  "level": "A2",
  "title": "Shahar",
  "description": "Shahardagi joylar",
  "color": "#9B5CFF",
  "guide": [
   {
    "title": "에서 — harakat joyi",
    "text": "Harakat bajariladigan joyga 에서 qo'shiladi: 도서관에서 공부해요 — kutubxonada o'qiyman.",
    "examples": [
     [
      "식당에서 먹어요.",
      "Restoranda yeyman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u18l1",
    "title": "Bank, restoran",
    "words": [
     {
      "fr": "은행",
      "uz": "bank",
      "ro": "eunhaeng",
      "emoji": "🏦"
     },
     {
      "fr": "식당",
      "uz": "restoran",
      "ro": "sikdang",
      "emoji": "🍽️"
     },
     {
      "fr": "가게",
      "uz": "do'kon",
      "ro": "gage",
      "emoji": "🏪"
     },
     {
      "fr": "편의점",
      "uz": "kichik do'kon (kechayu kunduz)",
      "ro": "pyeonuijeom",
      "emoji": "🏪",
      "alt": [
       "kichik do'kon"
      ]
     },
     {
      "fr": "백화점",
      "uz": "univermag",
      "ro": "baekhwajeom",
      "emoji": "🏬"
     },
     {
      "fr": "도서관",
      "uz": "kutubxona",
      "ro": "doseogwan",
      "emoji": "📚"
     }
    ],
    "sentences": [
     {
      "fr": "은행에 가야 해요.",
      "uz": "Bankka borishim kerak.",
      "ro": "eunhaenge gaya haeyo."
     },
     {
      "fr": "식당에서 점심을 먹어요.",
      "uz": "Restoranda tushlik qilaman.",
      "ro": "sikdangeseo jeomsimeul meogeoyo."
     },
     {
      "fr": "편의점이 가까워요.",
      "uz": "Kichik do'kon yaqin.",
      "ro": "pyeonuijeomi gakkawoyo."
     },
     {
      "fr": "도서관에서 공부해요.",
      "uz": "Kutubxonada dars qilaman.",
      "ro": "doseogwaneseo gongbuhaeyo."
     },
     {
      "fr": "공원에서 산책해요.",
      "uz": "Bog'da sayr qilaman.",
      "ro": "gongwoneseo sanchaekaeyo."
     }
    ]
   },
   {
    "id": "u18l2",
    "title": "Istirohat bog'i, dorixona",
    "words": [
     {
      "fr": "공원",
      "uz": "istirohat bog'i",
      "ro": "gongwon",
      "emoji": "🌳"
     },
     {
      "fr": "약국",
      "uz": "dorixona",
      "ro": "yakguk",
      "emoji": "💊"
     },
     {
      "fr": "우체국",
      "uz": "pochta",
      "ro": "ucheguk",
      "emoji": "📮"
     },
     {
      "fr": "호텔",
      "uz": "mehmonxona",
      "ro": "hotel",
      "emoji": "🏨"
     },
     {
      "fr": "대학교",
      "uz": "universitet",
      "ro": "daehakgyo",
      "emoji": "🎓"
     },
     {
      "fr": "영화관",
      "uz": "kinoteatr",
      "ro": "yeonghwagwan",
      "emoji": "🎬"
     }
    ],
    "sentences": [
     {
      "fr": "도서관에서 공부해요.",
      "uz": "Kutubxonada dars qilaman.",
      "ro": "doseogwaneseo gongbuhaeyo."
     },
     {
      "fr": "공원에서 산책해요.",
      "uz": "Bog'da sayr qilaman.",
      "ro": "gongwoneseo sanchaekaeyo."
     },
     {
      "fr": "약국이 어디에 있어요?",
      "uz": "Dorixona qayerda?",
      "ro": "yakgugi eodie isseoyo?"
     },
     {
      "fr": "우체국은 은행 옆에 있어요.",
      "uz": "Pochta bank yonida.",
      "ro": "ucheguk-eun eunhaeng yeope isseoyo."
     },
     {
      "fr": "주말에 영화관에 가요.",
      "uz": "Dam olish kuni kinoteatrga boraman.",
      "ro": "jumare yeonghwagwane gayo."
     }
    ]
   }
  ]
 },
 {
  "id": "u19",
  "level": "A2",
  "title": "Hafta va kun",
  "description": "Hafta kunlari va kun vaqtlari",
  "color": "#4ADE80",
  "guide": [
   {
    "title": "-요일 — hafta kuni",
    "text": "Hafta kunlari tabiat elementlaridan: 월(oy) 화(olov) 수(suv) 목(daraxt) 금(oltin) 토(yer) 일(quyosh) + 요일.",
    "examples": [
     [
      "월요일",
      "dushanba"
     ],
     [
      "일요일",
      "yakshanba"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u19l1",
    "title": "Dushanba, seshanba",
    "words": [
     {
      "fr": "월요일",
      "uz": "dushanba",
      "ro": "woryoil",
      "emoji": "1️⃣"
     },
     {
      "fr": "화요일",
      "uz": "seshanba",
      "ro": "hwayoil",
      "emoji": "🔥"
     },
     {
      "fr": "수요일",
      "uz": "chorshanba",
      "ro": "suyoil",
      "emoji": "💧"
     },
     {
      "fr": "목요일",
      "uz": "payshanba",
      "ro": "mogyoil",
      "emoji": "🌳"
     },
     {
      "fr": "금요일",
      "uz": "juma",
      "ro": "geumyoil",
      "emoji": "🪙"
     }
    ],
    "sentences": [
     {
      "fr": "오늘은 월요일이에요.",
      "uz": "Bugun dushanba.",
      "ro": "oneureun woryoirieyo."
     },
     {
      "fr": "금요일에 친구를 만나요.",
      "uz": "Jumada do'stim bilan uchrashaman.",
      "ro": "geumyoire chingureul mannayo."
     },
     {
      "fr": "주말에 뭐 해요?",
      "uz": "Dam olish kunlari nima qilasiz?",
      "ro": "jumare mwo haeyo?"
     },
     {
      "fr": "아침에 운동해요.",
      "uz": "Ertalab sport qilaman.",
      "ro": "achime undonghaeyo."
     },
     {
      "fr": "점심을 같이 먹어요.",
      "uz": "Tushlikni birga qilaylik.",
      "ro": "jeomsimeul gachi meogeoyo."
     }
    ]
   },
   {
    "id": "u19l2",
    "title": "Shanba, yakshanba",
    "words": [
     {
      "fr": "토요일",
      "uz": "shanba",
      "ro": "toyoil",
      "emoji": "🌍"
     },
     {
      "fr": "일요일",
      "uz": "yakshanba",
      "ro": "iryoil",
      "emoji": "☀️"
     },
     {
      "fr": "주말",
      "uz": "dam olish kunlari",
      "ro": "jumal",
      "emoji": "🏖️"
     },
     {
      "fr": "아침",
      "uz": "ertalab",
      "ro": "achim",
      "emoji": "🌅"
     },
     {
      "fr": "점심",
      "uz": "tushlik",
      "ro": "jeomsim",
      "emoji": "🍱"
     }
    ],
    "sentences": [
     {
      "fr": "아침에 운동해요.",
      "uz": "Ertalab sport qilaman.",
      "ro": "achime undonghaeyo."
     },
     {
      "fr": "점심을 같이 먹어요.",
      "uz": "Tushlikni birga qilaylik.",
      "ro": "jeomsimeul gachi meogeoyo."
     },
     {
      "fr": "저녁에 한국어를 공부해요.",
      "uz": "Kechqurun koreys tilini o'qiyman.",
      "ro": "jeonyeoge hangugeoreul gongbuhaeyo."
     },
     {
      "fr": "시간이 없어요.",
      "uz": "Vaqtim yo'q.",
      "ro": "sigani eopseoyo."
     },
     {
      "fr": "올해 한국에 가요.",
      "uz": "Bu yil Koreyaga boraman.",
      "ro": "olhae hanguge gayo."
     }
    ]
   },
   {
    "id": "u19l3",
    "title": "Kechqurun, tun",
    "words": [
     {
      "fr": "저녁",
      "uz": "kechqurun",
      "ro": "jeonyeok",
      "emoji": "🌆"
     },
     {
      "fr": "밤",
      "uz": "tun",
      "ro": "bam",
      "emoji": "🌙"
     },
     {
      "fr": "시간",
      "uz": "vaqt",
      "ro": "sigan",
      "emoji": "⏳"
     },
     {
      "fr": "올해",
      "uz": "bu yil",
      "ro": "olhae",
      "emoji": "🗓️"
     }
    ],
    "sentences": [
     {
      "fr": "시간이 없어요.",
      "uz": "Vaqtim yo'q.",
      "ro": "sigani eopseoyo."
     },
     {
      "fr": "올해 한국에 가요.",
      "uz": "Bu yil Koreyaga boraman.",
      "ro": "olhae hanguge gayo."
     },
     {
      "fr": "오늘은 월요일이에요.",
      "uz": "Bugun dushanba.",
      "ro": "oneureun woryoirieyo."
     },
     {
      "fr": "금요일에 친구를 만나요.",
      "uz": "Jumada do'stim bilan uchrashaman.",
      "ro": "geumyoire chingureul mannayo."
     },
     {
      "fr": "주말에 뭐 해요?",
      "uz": "Dam olish kunlari nima qilasiz?",
      "ro": "jumare mwo haeyo?"
     }
    ]
   }
  ]
 },
 {
  "id": "u20",
  "level": "A2",
  "title": "Ob-havo va tabiat",
  "description": "Fasllar, ob-havo va tabiat",
  "color": "#38BDF8",
  "guide": [
   {
    "title": "비가 와요 — yomg'ir yog'yapti",
    "text": "Yomg'ir va qor uchun «kelmoq» fe'li ishlatiladi: 비가 와요, 눈이 와요.",
    "examples": [
     [
      "눈이 와요.",
      "Qor yog'yapti."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u20l1",
    "title": "Ob-havo, yomg'ir",
    "words": [
     {
      "fr": "날씨",
      "uz": "ob-havo",
      "ro": "nalssi",
      "emoji": "🌤️"
     },
     {
      "fr": "비",
      "uz": "yomg'ir",
      "ro": "bi",
      "emoji": "🌧️"
     },
     {
      "fr": "바람",
      "uz": "shamol",
      "ro": "baram",
      "emoji": "💨"
     },
     {
      "fr": "해",
      "uz": "quyosh",
      "ro": "hae",
      "emoji": "☀️"
     },
     {
      "fr": "구름",
      "uz": "bulut",
      "ro": "gureum",
      "emoji": "☁️"
     }
    ],
    "sentences": [
     {
      "fr": "오늘 날씨가 좋아요.",
      "uz": "Bugun ob-havo yaxshi.",
      "ro": "oneul nalssiga joayo."
     },
     {
      "fr": "비가 와요.",
      "uz": "Yomg'ir yog'yapti.",
      "ro": "biga wayo."
     },
     {
      "fr": "바람이 많이 불어요.",
      "uz": "Kuchli shamol esyapti.",
      "ro": "barami mani bureoyo."
     },
     {
      "fr": "하늘이 맑아요.",
      "uz": "Osmon tiniq.",
      "ro": "haneuri malgayo."
     },
     {
      "fr": "여름에 바다에 가요.",
      "uz": "Yozda dengizga boraman.",
      "ro": "yeoreume badae gayo."
     }
    ]
   },
   {
    "id": "u20l2",
    "title": "Osmon, tog'",
    "words": [
     {
      "fr": "하늘",
      "uz": "osmon",
      "ro": "haneul",
      "emoji": "🌌"
     },
     {
      "fr": "산",
      "uz": "tog'",
      "ro": "san",
      "emoji": "⛰️"
     },
     {
      "fr": "바다",
      "uz": "dengiz",
      "ro": "bada",
      "emoji": "🌊"
     },
     {
      "fr": "강",
      "uz": "daryo",
      "ro": "gang",
      "emoji": "🏞️"
     },
     {
      "fr": "나무",
      "uz": "daraxt",
      "ro": "namu",
      "emoji": "🌳"
     }
    ],
    "sentences": [
     {
      "fr": "하늘이 맑아요.",
      "uz": "Osmon tiniq.",
      "ro": "haneuri malgayo."
     },
     {
      "fr": "여름에 바다에 가요.",
      "uz": "Yozda dengizga boraman.",
      "ro": "yeoreume badae gayo."
     },
     {
      "fr": "가을에 산이 예뻐요.",
      "uz": "Kuzda tog'lar chiroyli.",
      "ro": "gaeure sani yeppeoyo."
     },
     {
      "fr": "봄에 꽃이 피어요.",
      "uz": "Bahorda gullar ochiladi.",
      "ro": "bome kkochi pieoyo."
     },
     {
      "fr": "겨울은 아주 추워요.",
      "uz": "Qish juda sovuq.",
      "ro": "gyeoureun aju chuwoyo."
     }
    ]
   },
   {
    "id": "u20l3",
    "title": "Gul, bahor",
    "words": [
     {
      "fr": "꽃",
      "uz": "gul",
      "ro": "kkot",
      "emoji": "🌸"
     },
     {
      "fr": "봄",
      "uz": "bahor",
      "ro": "bom",
      "emoji": "🌱"
     },
     {
      "fr": "여름",
      "uz": "yoz",
      "ro": "yeoreum",
      "emoji": "🌞"
     },
     {
      "fr": "가을",
      "uz": "kuz",
      "ro": "gaeul",
      "emoji": "🍁"
     },
     {
      "fr": "겨울",
      "uz": "qish",
      "ro": "gyeoul",
      "emoji": "❄️"
     }
    ],
    "sentences": [
     {
      "fr": "봄에 꽃이 피어요.",
      "uz": "Bahorda gullar ochiladi.",
      "ro": "bome kkochi pieoyo."
     },
     {
      "fr": "겨울은 아주 추워요.",
      "uz": "Qish juda sovuq.",
      "ro": "gyeoureun aju chuwoyo."
     },
     {
      "fr": "오늘 날씨가 좋아요.",
      "uz": "Bugun ob-havo yaxshi.",
      "ro": "oneul nalssiga joayo."
     },
     {
      "fr": "비가 와요.",
      "uz": "Yomg'ir yog'yapti.",
      "ro": "biga wayo."
     },
     {
      "fr": "바람이 많이 불어요.",
      "uz": "Kuchli shamol esyapti.",
      "ro": "barami mani bureoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u21",
  "level": "A2",
  "title": "Maktab",
  "description": "Dars, imtihon va o'quv buyumlari",
  "color": "#F472B6",
  "guide": [
   {
    "title": "-(으)세요 — iltimos",
    "text": "Muloyim buyruq: 읽으세요 (o'qing), 보세요 (qarang), 앉으세요 (o'tiring).",
    "examples": [
     [
      "책을 펴세요.",
      "Kitobni oching."
     ],
     [
      "따라 하세요.",
      "Takrorlang."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u21l1",
    "title": "Kitob, daftar",
    "words": [
     {
      "fr": "책",
      "uz": "kitob",
      "ro": "chaek",
      "emoji": "📕"
     },
     {
      "fr": "공책",
      "uz": "daftar",
      "ro": "gongchaek",
      "emoji": "📓"
     },
     {
      "fr": "연필",
      "uz": "qalam",
      "ro": "yeonpil",
      "emoji": "✏️"
     },
     {
      "fr": "볼펜",
      "uz": "ruchka",
      "ro": "bolpen",
      "emoji": "🖊️"
     },
     {
      "fr": "교실",
      "uz": "sinf xonasi",
      "ro": "gyosil",
      "emoji": "🏫"
     },
     {
      "fr": "수업",
      "uz": "dars",
      "ro": "sueop",
      "emoji": "👩‍🏫"
     }
    ],
    "sentences": [
     {
      "fr": "책을 펴세요.",
      "uz": "Kitobni oching.",
      "ro": "chaegeul pyeoseyo."
     },
     {
      "fr": "숙제를 했어요?",
      "uz": "Uy vazifasini qildingizmi?",
      "ro": "sukjereul haesseoyo?"
     },
     {
      "fr": "내일 시험이 있어요.",
      "uz": "Ertaga imtihon bor.",
      "ro": "naeil siheomi isseoyo."
     },
     {
      "fr": "질문이 있어요.",
      "uz": "Savolim bor.",
      "ro": "jilmuni isseoyo."
     },
     {
      "fr": "교실에 학생이 많아요.",
      "uz": "Sinfda o'quvchilar ko'p.",
      "ro": "gyosire haksaengi manayo."
     }
    ]
   },
   {
    "id": "u21l2",
    "title": "Uy vazifasi, imtihon",
    "words": [
     {
      "fr": "숙제",
      "uz": "uy vazifasi",
      "ro": "sukje",
      "emoji": "📝"
     },
     {
      "fr": "시험",
      "uz": "imtihon",
      "ro": "siheom",
      "emoji": "📋"
     },
     {
      "fr": "질문",
      "uz": "savol",
      "ro": "jilmun",
      "emoji": "❓"
     },
     {
      "fr": "대답",
      "uz": "javob",
      "ro": "daedap",
      "emoji": "💬"
     },
     {
      "fr": "단어",
      "uz": "so'z",
      "ro": "daneo",
      "emoji": "🔤"
     },
     {
      "fr": "한국어",
      "uz": "koreys tili",
      "ro": "hangugeo",
      "emoji": "🇰🇷"
     }
    ],
    "sentences": [
     {
      "fr": "질문이 있어요.",
      "uz": "Savolim bor.",
      "ro": "jilmuni isseoyo."
     },
     {
      "fr": "교실에 학생이 많아요.",
      "uz": "Sinfda o'quvchilar ko'p.",
      "ro": "gyosire haksaengi manayo."
     },
     {
      "fr": "연필하고 공책이 필요해요.",
      "uz": "Qalam va daftar kerak.",
      "ro": "yeonpilhago gongchaegi piryohaeyo."
     },
     {
      "fr": "한국어 수업이 재미있어요.",
      "uz": "Koreys tili darsi qiziqarli.",
      "ro": "hangugeo sueobi jaemiisseoyo."
     },
     {
      "fr": "이 단어를 몰라요.",
      "uz": "Bu so'zni bilmayman.",
      "ro": "i daneoreul mollayo."
     }
    ]
   }
  ]
 },
 {
  "id": "u22",
  "level": "A2",
  "title": "Kasblar",
  "description": "Kasblar va «men …man»",
  "color": "#A78BFA",
  "guide": [
   {
    "title": "이에요 / 예요 — …man",
    "text": "Ot + 이에요 (undoshdan keyin) yoki 예요 (unlidan keyin): 학생이에요, 의사예요.",
    "examples": [
     [
      "저는 학생이에요.",
      "Men talabaman."
     ],
     [
      "의사예요.",
      "Shifokorman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u22l1",
    "title": "O'qituvchi, o'quvchi",
    "words": [
     {
      "fr": "선생님",
      "uz": "o'qituvchi",
      "ro": "seonsaengnim",
      "emoji": "👩‍🏫"
     },
     {
      "fr": "학생",
      "uz": "o'quvchi, talaba",
      "ro": "haksaeng",
      "emoji": "🧑‍🎓",
      "alt": [
       "o'quvchi",
       "talaba"
      ]
     },
     {
      "fr": "의사",
      "uz": "shifokor",
      "ro": "uisa",
      "emoji": "🧑‍⚕️"
     },
     {
      "fr": "간호사",
      "uz": "hamshira",
      "ro": "ganhosa",
      "emoji": "👩‍⚕️"
     },
     {
      "fr": "회사원",
      "uz": "ofis xodimi",
      "ro": "hoesawon",
      "emoji": "🧑‍💼"
     },
     {
      "fr": "요리사",
      "uz": "oshpaz",
      "ro": "yorisa",
      "emoji": "🧑‍🍳"
     }
    ],
    "sentences": [
     {
      "fr": "저는 학생이에요.",
      "uz": "Men talabaman.",
      "ro": "jeoneun haksaengieyo."
     },
     {
      "fr": "아버지는 의사예요.",
      "uz": "Otam shifokor.",
      "ro": "abeojineun uisayeyo."
     },
     {
      "fr": "우리 선생님은 친절해요.",
      "uz": "Bizning ustozimiz mehribon.",
      "ro": "uri seonsaengnimeun chinjeolhaeyo."
     },
     {
      "fr": "언니는 간호사예요.",
      "uz": "Opam hamshira.",
      "ro": "eonnineun ganhosayeyo."
     },
     {
      "fr": "요리사가 음식을 만들어요.",
      "uz": "Oshpaz taom tayyorlaydi.",
      "ro": "yorisaga eumsigeul mandeureoyo."
     }
    ]
   },
   {
    "id": "u22l2",
    "title": "Politsiyachi, haydovchi",
    "words": [
     {
      "fr": "경찰",
      "uz": "politsiyachi",
      "ro": "gyeongchal",
      "emoji": "👮"
     },
     {
      "fr": "운전사",
      "uz": "haydovchi",
      "ro": "unjeonsa",
      "emoji": "🧑‍✈️"
     },
     {
      "fr": "가수",
      "uz": "qo'shiqchi",
      "ro": "gasu",
      "emoji": "🎤"
     },
     {
      "fr": "배우",
      "uz": "aktyor",
      "ro": "baeu",
      "emoji": "🎭"
     },
     {
      "fr": "기자",
      "uz": "jurnalist",
      "ro": "gija",
      "emoji": "📰"
     },
     {
      "fr": "농부",
      "uz": "dehqon",
      "ro": "nongbu",
      "emoji": "🧑‍🌾"
     }
    ],
    "sentences": [
     {
      "fr": "언니는 간호사예요.",
      "uz": "Opam hamshira.",
      "ro": "eonnineun ganhosayeyo."
     },
     {
      "fr": "요리사가 음식을 만들어요.",
      "uz": "Oshpaz taom tayyorlaydi.",
      "ro": "yorisaga eumsigeul mandeureoyo."
     },
     {
      "fr": "저는 회사원이에요.",
      "uz": "Men ofis xodimiman.",
      "ro": "jeoneun hoesawonieyo."
     },
     {
      "fr": "그 가수를 좋아해요.",
      "uz": "O'sha qo'shiqchini yoqtiraman.",
      "ro": "geu gasureul joahaeyo."
     },
     {
      "fr": "경찰이 길을 알려 줬어요.",
      "uz": "Politsiyachi yo'lni ko'rsatib berdi.",
      "ro": "gyeongchari gireul allyeo jwosseoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u23",
  "level": "A2",
  "title": "Sifatlar",
  "description": "Katta-kichik, arzon-qimmat",
  "color": "#FB923C",
  "guide": [
   {
    "title": "Sifat ham fe'l kabi",
    "text": "Koreys tilida sifatlar fe'l kabi tuslanadi: 크다 → 커요 (katta). Qo'shimcha «bo'lmoq» kerak emas.",
    "examples": [
     [
      "커요",
      "katta"
     ],
     [
      "비싸요",
      "qimmat"
     ]
    ]
   },
   {
    "title": "안 / -지 않아요 — inkor",
    "text": "Inkor: fe'ldan oldin 안 yoki oxiriga -지 않아요.",
    "examples": [
     [
      "안 비싸요.",
      "Qimmat emas."
     ],
     [
      "어렵지 않아요.",
      "Qiyin emas."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u23l1",
    "title": "Katta, kichik",
    "words": [
     {
      "fr": "크다",
      "uz": "katta",
      "ro": "keuda",
      "emoji": "🐘"
     },
     {
      "fr": "작다",
      "uz": "kichik",
      "ro": "jakda",
      "emoji": "🐜"
     },
     {
      "fr": "좋다",
      "uz": "yaxshi",
      "ro": "jota",
      "emoji": "👍"
     },
     {
      "fr": "나쁘다",
      "uz": "yomon",
      "ro": "nappeuda",
      "emoji": "👎"
     },
     {
      "fr": "많다",
      "uz": "ko'p",
      "ro": "manta",
      "emoji": "➕"
     },
     {
      "fr": "적다",
      "uz": "oz",
      "ro": "jeokda",
      "emoji": "➖"
     }
    ],
    "sentences": [
     {
      "fr": "이 가방은 너무 비싸요.",
      "uz": "Bu sumka juda qimmat.",
      "ro": "i gabangeun neomu bissayo."
     },
     {
      "fr": "한국어는 어렵지 않아요.",
      "uz": "Koreys tili qiyin emas.",
      "ro": "hangugeoneun eoryeopji anayo."
     },
     {
      "fr": "오늘은 너무 더워요.",
      "uz": "Bugun juda issiq.",
      "ro": "oneureun neomu deowoyo."
     },
     {
      "fr": "이 영화가 재미있어요.",
      "uz": "Bu kino qiziqarli.",
      "ro": "i yeonghwaga jaemiisseoyo."
     },
     {
      "fr": "요즘 아주 바빠요.",
      "uz": "Hozir juda bandman.",
      "ro": "yojeum aju bappayo."
     }
    ]
   },
   {
    "id": "u23l2",
    "title": "Qimmat, arzon",
    "words": [
     {
      "fr": "비싸다",
      "uz": "qimmat",
      "ro": "bissada",
      "emoji": "💎"
     },
     {
      "fr": "싸다",
      "uz": "arzon",
      "ro": "ssada",
      "emoji": "🏷️"
     },
     {
      "fr": "덥다",
      "uz": "issiq (havo)",
      "ro": "deopda",
      "emoji": "🥵",
      "alt": [
       "issiq"
      ]
     },
     {
      "fr": "춥다",
      "uz": "sovuq (havo)",
      "ro": "chupda",
      "emoji": "🥶",
      "alt": [
       "sovuq"
      ]
     },
     {
      "fr": "맛있다",
      "uz": "mazali",
      "ro": "masitda",
      "emoji": "😋"
     },
     {
      "fr": "예쁘다",
      "uz": "chiroyli",
      "ro": "yeppeuda",
      "emoji": "🌷"
     }
    ],
    "sentences": [
     {
      "fr": "이 영화가 재미있어요.",
      "uz": "Bu kino qiziqarli.",
      "ro": "i yeonghwaga jaemiisseoyo."
     },
     {
      "fr": "요즘 아주 바빠요.",
      "uz": "Hozir juda bandman.",
      "ro": "yojeum aju bappayo."
     },
     {
      "fr": "시장은 사람이 많아요.",
      "uz": "Bozorda odam ko'p.",
      "ro": "sijangeun sarami manayo."
     },
     {
      "fr": "이 문제는 쉬워요.",
      "uz": "Bu masala oson.",
      "ro": "i munjeneun swiwoyo."
     },
     {
      "fr": "이 집은 크고 좋아요.",
      "uz": "Bu uy katta va yaxshi.",
      "ro": "i jibeun keugo joayo."
     }
    ]
   },
   {
    "id": "u23l3",
    "title": "Band, qiziqarli",
    "words": [
     {
      "fr": "바쁘다",
      "uz": "band",
      "ro": "bappeuda",
      "emoji": "🏃"
     },
     {
      "fr": "재미있다",
      "uz": "qiziqarli",
      "ro": "jaemiitda",
      "emoji": "🤩"
     },
     {
      "fr": "어렵다",
      "uz": "qiyin",
      "ro": "eoryeopda",
      "emoji": "🧩"
     },
     {
      "fr": "쉽다",
      "uz": "oson",
      "ro": "swipda",
      "emoji": "✔️"
     }
    ],
    "sentences": [
     {
      "fr": "이 문제는 쉬워요.",
      "uz": "Bu masala oson.",
      "ro": "i munjeneun swiwoyo."
     },
     {
      "fr": "이 집은 크고 좋아요.",
      "uz": "Bu uy katta va yaxshi.",
      "ro": "i jibeun keugo joayo."
     },
     {
      "fr": "이 가방은 너무 비싸요.",
      "uz": "Bu sumka juda qimmat.",
      "ro": "i gabangeun neomu bissayo."
     },
     {
      "fr": "한국어는 어렵지 않아요.",
      "uz": "Koreys tili qiyin emas.",
      "ro": "hangugeoneun eoryeopji anayo."
     },
     {
      "fr": "오늘은 너무 더워요.",
      "uz": "Bugun juda issiq.",
      "ro": "oneureun neomu deowoyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u24",
  "level": "A2",
  "title": "Fe'llar 2",
  "description": "Muloqot va kundalik harakatlar",
  "color": "#2DD4BF",
  "guide": [
   {
    "title": "-아/어 주세요 — …ib bering",
    "text": "Iltimos: 기다려 주세요 (kutib turing), 말해 주세요 (aytib bering).",
    "examples": [
     [
      "도와 주세요.",
      "Yordam bering."
     ]
    ]
   },
   {
    "title": "O'tgan zamon -았/었어요",
    "text": "가요 → 갔어요 (bordim), 먹어요 → 먹었어요 (yedim).",
    "examples": [
     [
      "만났어요.",
      "Uchrashdim."
     ],
     [
      "받았어요.",
      "Oldim."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u24l1",
    "title": "Uchrashmoq, gapirmoq",
    "words": [
     {
      "fr": "만나다",
      "uz": "uchrashmoq",
      "ro": "mannada",
      "emoji": "🤝"
     },
     {
      "fr": "말하다",
      "uz": "gapirmoq",
      "ro": "malhada",
      "emoji": "🗣️"
     },
     {
      "fr": "듣다",
      "uz": "tinglamoq",
      "ro": "deutda",
      "emoji": "🎧"
     },
     {
      "fr": "주다",
      "uz": "bermoq",
      "ro": "juda",
      "emoji": "🎁"
     },
     {
      "fr": "받다",
      "uz": "qabul qilib olmoq",
      "ro": "batda",
      "emoji": "📥"
     },
     {
      "fr": "앉다",
      "uz": "o'tirmoq",
      "ro": "anda",
      "emoji": "🪑"
     }
    ],
    "sentences": [
     {
      "fr": "내일 친구를 만나요.",
      "uz": "Ertaga do'stim bilan uchrashaman.",
      "ro": "naeil chingureul mannayo."
     },
     {
      "fr": "음악을 들어요.",
      "uz": "Musiqa tinglayman.",
      "ro": "eumageul deureoyo."
     },
     {
      "fr": "천천히 말해 주세요.",
      "uz": "Sekinroq gapiring, iltimos.",
      "ro": "cheoncheonhi malhae juseyo."
     },
     {
      "fr": "선물을 받았어요.",
      "uz": "Sovg'a oldim.",
      "ro": "seonmureul badasseoyo."
     },
     {
      "fr": "여기 앉으세요.",
      "uz": "Bu yerga o'tiring.",
      "ro": "yeogi anjeuseyo."
     }
    ]
   },
   {
    "id": "u24l2",
    "title": "O'rnidan turmoq, kutmoq",
    "words": [
     {
      "fr": "일어나다",
      "uz": "o'rnidan turmoq",
      "ro": "ireonada",
      "emoji": "⏰"
     },
     {
      "fr": "기다리다",
      "uz": "kutmoq",
      "ro": "gidarida",
      "emoji": "⌛"
     },
     {
      "fr": "좋아하다",
      "uz": "yoqtirmoq",
      "ro": "joahada",
      "emoji": "❤️"
     },
     {
      "fr": "알다",
      "uz": "bilmoq",
      "ro": "alda",
      "emoji": "💡"
     },
     {
      "fr": "모르다",
      "uz": "bilmaslik",
      "ro": "moreuda",
      "emoji": "🤷"
     },
     {
      "fr": "살다",
      "uz": "yashamoq",
      "ro": "salda",
      "emoji": "🏡"
     }
    ],
    "sentences": [
     {
      "fr": "선물을 받았어요.",
      "uz": "Sovg'a oldim.",
      "ro": "seonmureul badasseoyo."
     },
     {
      "fr": "여기 앉으세요.",
      "uz": "Bu yerga o'tiring.",
      "ro": "yeogi anjeuseyo."
     },
     {
      "fr": "조금만 기다려 주세요.",
      "uz": "Biroz kutib turing.",
      "ro": "jogeumman gidaryeo juseyo."
     },
     {
      "fr": "저는 서울에 살아요.",
      "uz": "Men Seulda yashayman.",
      "ro": "jeoneun seoure sarayo."
     },
     {
      "fr": "저녁에 엄마한테 전화해요.",
      "uz": "Kechqurun onamga qo'ng'iroq qilaman.",
      "ro": "jeonyeoge eommahante jeonhwahaeyo."
     }
    ]
   },
   {
    "id": "u24l3",
    "title": "Dars qilmoq, ovqat pishirmoq",
    "words": [
     {
      "fr": "공부하다",
      "uz": "dars qilmoq",
      "ro": "gongbuhada",
      "emoji": "📚"
     },
     {
      "fr": "요리하다",
      "uz": "ovqat pishirmoq",
      "ro": "yorihada",
      "emoji": "🍳"
     },
     {
      "fr": "운동하다",
      "uz": "sport bilan shug'ullanmoq",
      "ro": "undonghada",
      "emoji": "🏋️"
     },
     {
      "fr": "전화하다",
      "uz": "qo'ng'iroq qilmoq",
      "ro": "jeonhwahada",
      "emoji": "📞"
     }
    ],
    "sentences": [
     {
      "fr": "저는 서울에 살아요.",
      "uz": "Men Seulda yashayman.",
      "ro": "jeoneun seoure sarayo."
     },
     {
      "fr": "저녁에 엄마한테 전화해요.",
      "uz": "Kechqurun onamga qo'ng'iroq qilaman.",
      "ro": "jeonyeoge eommahante jeonhwahaeyo."
     },
     {
      "fr": "내일 친구를 만나요.",
      "uz": "Ertaga do'stim bilan uchrashaman.",
      "ro": "naeil chingureul mannayo."
     },
     {
      "fr": "음악을 들어요.",
      "uz": "Musiqa tinglayman.",
      "ro": "eumageul deureoyo."
     },
     {
      "fr": "천천히 말해 주세요.",
      "uz": "Sekinroq gapiring, iltimos.",
      "ro": "cheoncheonhi malhae juseyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u25",
  "level": "B1",
  "title": "TOPIK 3 so'zlari",
  "description": "O'rta daraja: tajriba, reja, natija",
  "color": "#B49CFF",
  "guide": [
   {
    "title": "-기 위해서 — …ish uchun",
    "text": "Maqsadni bildiradi: 건강을 위해서 — sog'liq uchun; 배우기 위해서 — o'rganish uchun.",
    "examples": [
     [
      "건강을 위해서",
      "sog'liq uchun"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u25l1",
    "title": "Tajriba, madaniyat",
    "words": [
     {
      "fr": "경험",
      "uz": "tajriba",
      "ro": "gyeongheom"
     },
     {
      "fr": "문화",
      "uz": "madaniyat",
      "ro": "munhwa"
     },
     {
      "fr": "사회",
      "uz": "jamiyat",
      "ro": "sahoe"
     },
     {
      "fr": "환경",
      "uz": "atrof-muhit",
      "ro": "hwangyeong"
     },
     {
      "fr": "건강",
      "uz": "sog'liq",
      "ro": "geongang"
     }
    ],
    "sentences": [
     {
      "fr": "한국 문화에 관심이 많아요.",
      "uz": "Koreys madaniyatiga qiziqishim katta.",
      "ro": "hanguk munhwae gwansimi manayo."
     },
     {
      "fr": "건강을 위해서 운동하고 있어요.",
      "uz": "Sog'lik uchun sport bilan shug'ullanyapman.",
      "ro": "geongangeul wihaeseo undonghago isseoyo."
     },
     {
      "fr": "좋은 습관을 만들고 싶어요.",
      "uz": "Yaxshi odat shakllantirmoqchiman.",
      "ro": "joeun seupgwaneul mandeulgo sipeoyo."
     },
     {
      "fr": "이번 방학 계획을 세웠어요.",
      "uz": "Bu ta'til uchun reja tuzdim.",
      "ro": "ibeon banghak gyehoegeul sewosseoyo."
     },
     {
      "fr": "시험 결과가 좋았어요.",
      "uz": "Imtihon natijasi yaxshi bo'ldi.",
      "ro": "siheom gyeolgwaga joasseoyo."
     }
    ]
   },
   {
    "id": "u25l2",
    "title": "Odat, reja",
    "words": [
     {
      "fr": "습관",
      "uz": "odat",
      "ro": "seupgwan"
     },
     {
      "fr": "계획",
      "uz": "reja",
      "ro": "gyehoek"
     },
     {
      "fr": "결과",
      "uz": "natija",
      "ro": "gyeolgwa"
     },
     {
      "fr": "이유",
      "uz": "sabab",
      "ro": "iyu"
     },
     {
      "fr": "방법",
      "uz": "usul",
      "ro": "bangbeop"
     }
    ],
    "sentences": [
     {
      "fr": "이번 방학 계획을 세웠어요.",
      "uz": "Bu ta'til uchun reja tuzdim.",
      "ro": "ibeon banghak gyehoegeul sewosseoyo."
     },
     {
      "fr": "시험 결과가 좋았어요.",
      "uz": "Imtihon natijasi yaxshi bo'ldi.",
      "ro": "siheom gyeolgwaga joasseoyo."
     },
     {
      "fr": "늦은 이유를 설명해 주세요.",
      "uz": "Kechikkan sababingizni tushuntiring.",
      "ro": "neujeun iyureul seolmyeonghae juseyo."
     },
     {
      "fr": "한국에서 일할 기회가 생겼어요.",
      "uz": "Koreyada ishlash imkoniyati paydo bo'ldi.",
      "ro": "hangugeseo ilhal gihoega saenggyeosseoyo."
     },
     {
      "fr": "이제 한국 생활에 익숙해졌어요.",
      "uz": "Endi Koreyadagi hayotga o'rganib qoldim.",
      "ro": "ije hanguk saenghware iksukaejyeosseoyo."
     }
    ]
   },
   {
    "id": "u25l3",
    "title": "Imkoniyat, qiziqish",
    "words": [
     {
      "fr": "기회",
      "uz": "imkoniyat",
      "ro": "gihoe"
     },
     {
      "fr": "관심",
      "uz": "qiziqish",
      "ro": "gwansim"
     },
     {
      "fr": "성격",
      "uz": "fe'l-atvor",
      "ro": "seonggyeok"
     },
     {
      "fr": "분위기",
      "uz": "muhit, kayfiyat",
      "ro": "bunwigi",
      "alt": [
       "muhit",
       "kayfiyat"
      ]
     },
     {
      "fr": "약속",
      "uz": "va'da, kelishuv",
      "ro": "yaksok",
      "alt": [
       "va'da",
       "kelishuv"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "한국에서 일할 기회가 생겼어요.",
      "uz": "Koreyada ishlash imkoniyati paydo bo'ldi.",
      "ro": "hangugeseo ilhal gihoega saenggyeosseoyo."
     },
     {
      "fr": "이제 한국 생활에 익숙해졌어요.",
      "uz": "Endi Koreyadagi hayotga o'rganib qoldim.",
      "ro": "ije hanguk saenghware iksukaejyeosseoyo."
     },
     {
      "fr": "한국 문화에 관심이 많아요.",
      "uz": "Koreys madaniyatiga qiziqishim katta.",
      "ro": "hanguk munhwae gwansimi manayo."
     },
     {
      "fr": "건강을 위해서 운동하고 있어요.",
      "uz": "Sog'lik uchun sport bilan shug'ullanyapman.",
      "ro": "geongangeul wihaeseo undonghago isseoyo."
     },
     {
      "fr": "좋은 습관을 만들고 싶어요.",
      "uz": "Yaxshi odat shakllantirmoqchiman.",
      "ro": "joeun seupgwaneul mandeulgo sipeoyo."
     }
    ]
   },
   {
    "id": "u25l4",
    "title": "Tayyorlanmoq, qaror qilmoq",
    "words": [
     {
      "fr": "준비하다",
      "uz": "tayyorlanmoq",
      "ro": "junbihada"
     },
     {
      "fr": "결정하다",
      "uz": "qaror qilmoq",
      "ro": "gyeoljeonghada"
     },
     {
      "fr": "설명하다",
      "uz": "tushuntirmoq",
      "ro": "seolmyeonghada"
     },
     {
      "fr": "비교하다",
      "uz": "solishtirmoq",
      "ro": "bigyohada"
     },
     {
      "fr": "익숙하다",
      "uz": "o'rganib qolgan, tanish",
      "ro": "iksukhada",
      "alt": [
       "o'rganib qolgan",
       "tanish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "건강을 위해서 운동하고 있어요.",
      "uz": "Sog'lik uchun sport bilan shug'ullanyapman.",
      "ro": "geongangeul wihaeseo undonghago isseoyo."
     },
     {
      "fr": "좋은 습관을 만들고 싶어요.",
      "uz": "Yaxshi odat shakllantirmoqchiman.",
      "ro": "joeun seupgwaneul mandeulgo sipeoyo."
     },
     {
      "fr": "이번 방학 계획을 세웠어요.",
      "uz": "Bu ta'til uchun reja tuzdim.",
      "ro": "ibeon banghak gyehoegeul sewosseoyo."
     },
     {
      "fr": "시험 결과가 좋았어요.",
      "uz": "Imtihon natijasi yaxshi bo'ldi.",
      "ro": "siheom gyeolgwaga joasseoyo."
     },
     {
      "fr": "늦은 이유를 설명해 주세요.",
      "uz": "Kechikkan sababingizni tushuntiring.",
      "ro": "neujeun iyureul seolmyeonghae juseyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u26",
  "level": "B1",
  "title": "Ish va o'qish",
  "description": "Ish, o'qish va karyera",
  "color": "#FF8FD0",
  "guide": [
   {
    "title": "-아/어야 하다 — kerak",
    "text": "Majburiyat: 가야 해요 — borishim kerak; 공부해야 해요 — o'qishim kerak.",
    "examples": [
     [
      "출근해야 해요.",
      "Ishga borishim kerak."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u26l1",
    "title": "Yig'ilish, ishga borish",
    "words": [
     {
      "fr": "회의",
      "uz": "yig'ilish",
      "ro": "hoeui"
     },
     {
      "fr": "출근",
      "uz": "ishga borish",
      "ro": "chulgeun"
     },
     {
      "fr": "퇴근",
      "uz": "ishdan qaytish",
      "ro": "toegeun"
     },
     {
      "fr": "월급",
      "uz": "oylik maosh",
      "ro": "wolgeup"
     },
     {
      "fr": "동료",
      "uz": "hamkasb",
      "ro": "dongnyo"
     }
    ],
    "sentences": [
     {
      "fr": "오늘 오후에 회의가 있어요.",
      "uz": "Bugun tushdan keyin yig'ilish bor.",
      "ro": "oneul ohue hoeuiga isseoyo."
     },
     {
      "fr": "아홉 시까지 출근해야 해요.",
      "uz": "Soat to'qqizgacha ishga kelishim kerak.",
      "ro": "ahop sikkaji chulgeunhaeya haeyo."
     },
     {
      "fr": "퇴근 후에 운동해요.",
      "uz": "Ishdan keyin sport qilaman.",
      "ro": "toegeun hue undonghaeyo."
     },
     {
      "fr": "내일 면접을 봐요.",
      "uz": "Ertaga ish suhbatidan o'taman.",
      "ro": "naeil myeonjeobeul bwayo."
     },
     {
      "fr": "작년에 대학교를 졸업했어요.",
      "uz": "O'tgan yili universitetni bitirdim.",
      "ro": "jangnyeone daehakgyoreul joreopaesseoyo."
     }
    ]
   },
   {
    "id": "u26l2",
    "title": "Ish suhbati, ariza topshirmoq",
    "words": [
     {
      "fr": "면접",
      "uz": "ish suhbati",
      "ro": "myeonjeop"
     },
     {
      "fr": "지원하다",
      "uz": "ariza topshirmoq",
      "ro": "jiwonhada"
     },
     {
      "fr": "졸업하다",
      "uz": "bitirmoq",
      "ro": "joreopada"
     },
     {
      "fr": "입학하다",
      "uz": "o'qishga kirmoq",
      "ro": "ipakada"
     },
     {
      "fr": "전공",
      "uz": "mutaxassislik",
      "ro": "jeongong"
     }
    ],
    "sentences": [
     {
      "fr": "내일 면접을 봐요.",
      "uz": "Ertaga ish suhbatidan o'taman.",
      "ro": "naeil myeonjeobeul bwayo."
     },
     {
      "fr": "작년에 대학교를 졸업했어요.",
      "uz": "O'tgan yili universitetni bitirdim.",
      "ro": "jangnyeone daehakgyoreul joreopaesseoyo."
     },
     {
      "fr": "제 전공은 경영학이에요.",
      "uz": "Mutaxassisligim — menejment.",
      "ro": "je jeongongeun gyeongyeonghagieyo."
     },
     {
      "fr": "장학금을 받으려고 열심히 노력해요.",
      "uz": "Stipendiya olish uchun tirishib harakat qilaman.",
      "ro": "janghakgeumeul badeuryeogo yeolsimhi noryeokaeyo."
     },
     {
      "fr": "발표를 위해서 많이 연습했어요.",
      "uz": "Taqdimot uchun ko'p mashq qildim.",
      "ro": "balpyoreul wihaeseo mani yeonseupaesseoyo."
     }
    ]
   },
   {
    "id": "u26l3",
    "title": "Baho, stipendiya",
    "words": [
     {
      "fr": "성적",
      "uz": "baho, o'zlashtirish",
      "ro": "seongjeok",
      "alt": [
       "baho",
       "o'zlashtirish"
      ]
     },
     {
      "fr": "장학금",
      "uz": "stipendiya",
      "ro": "janghakgeum"
     },
     {
      "fr": "발표",
      "uz": "taqdimot",
      "ro": "balpyo"
     },
     {
      "fr": "연습하다",
      "uz": "mashq qilmoq",
      "ro": "yeonseupada"
     },
     {
      "fr": "노력하다",
      "uz": "tirishmoq",
      "ro": "noryeokada"
     }
    ],
    "sentences": [
     {
      "fr": "장학금을 받으려고 열심히 노력해요.",
      "uz": "Stipendiya olish uchun tirishib harakat qilaman.",
      "ro": "janghakgeumeul badeuryeogo yeolsimhi noryeokaeyo."
     },
     {
      "fr": "발표를 위해서 많이 연습했어요.",
      "uz": "Taqdimot uchun ko'p mashq qildim.",
      "ro": "balpyoreul wihaeseo mani yeonseupaesseoyo."
     },
     {
      "fr": "오늘 오후에 회의가 있어요.",
      "uz": "Bugun tushdan keyin yig'ilish bor.",
      "ro": "oneul ohue hoeuiga isseoyo."
     },
     {
      "fr": "아홉 시까지 출근해야 해요.",
      "uz": "Soat to'qqizgacha ishga kelishim kerak.",
      "ro": "ahop sikkaji chulgeunhaeya haeyo."
     },
     {
      "fr": "퇴근 후에 운동해요.",
      "uz": "Ishdan keyin sport qilaman.",
      "ro": "toegeun hue undonghaeyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u27",
  "level": "B1",
  "title": "His-tuyg'u va hayot",
  "description": "Kayfiyat va hayotiy vaziyatlar",
  "color": "#7FE3FF",
  "guide": [
   {
    "title": "-아서/어서 — sabab",
    "text": "Sabab bildiradi: 기뻐서 — xursand bo'lganim uchun; 아파서 — og'rigani uchun.",
    "examples": [
     [
      "비가 와서",
      "yomg'ir yoqqani uchun"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u27l1",
    "title": "Xursand, g'amgin",
    "words": [
     {
      "fr": "기쁘다",
      "uz": "xursand",
      "ro": "gippeuda"
     },
     {
      "fr": "슬프다",
      "uz": "g'amgin",
      "ro": "seulpeuda"
     },
     {
      "fr": "화나다",
      "uz": "jahli chiqmoq",
      "ro": "hwanada"
     },
     {
      "fr": "걱정하다",
      "uz": "xavotirlanmoq",
      "ro": "geokjeonghada"
     },
     {
      "fr": "외롭다",
      "uz": "yolg'izlik his qilmoq",
      "ro": "oeropda"
     }
    ],
    "sentences": [
     {
      "fr": "합격해서 정말 기뻐요.",
      "uz": "Imtihondan o'tganim uchun juda xursandman.",
      "ro": "hapgyeokaeseo jeongmal gippeoyo."
     },
     {
      "fr": "친구가 떠나서 슬퍼요.",
      "uz": "Do'stim ketgani uchun g'amginman.",
      "ro": "chinguga tteonaseo seulpeoyo."
     },
     {
      "fr": "시험 때문에 걱정돼요.",
      "uz": "Imtihon tufayli xavotirdaman.",
      "ro": "siheom ttaemune geokjeongdwaeyo."
     },
     {
      "fr": "고향의 가족이 그리워요.",
      "uz": "Yurtimdagi oilamni sog'indim.",
      "ro": "gohyangui gajogi geuriwoyo."
     },
     {
      "fr": "발표할 때 너무 긴장했어요.",
      "uz": "Taqdimot paytida juda hayajonlandim.",
      "ro": "balpyohal ttae neomu ginjanghaesseoyo."
     }
    ]
   },
   {
    "id": "u27l2",
    "title": "Uyalmoq, hayajondan asabiylashmoq",
    "words": [
     {
      "fr": "부끄럽다",
      "uz": "uyalmoq",
      "ro": "bukkeureopda"
     },
     {
      "fr": "긴장하다",
      "uz": "hayajondan asabiylashmoq",
      "ro": "ginjanghada"
     },
     {
      "fr": "만족하다",
      "uz": "qoniqmoq",
      "ro": "manjokada"
     },
     {
      "fr": "후회하다",
      "uz": "pushaymon bo'lmoq",
      "ro": "huhoehada"
     },
     {
      "fr": "실망하다",
      "uz": "hafsalasi pir bo'lmoq",
      "ro": "silmanghada"
     }
    ],
    "sentences": [
     {
      "fr": "고향의 가족이 그리워요.",
      "uz": "Yurtimdagi oilamni sog'indim.",
      "ro": "gohyangui gajogi geuriwoyo."
     },
     {
      "fr": "발표할 때 너무 긴장했어요.",
      "uz": "Taqdimot paytida juda hayajonlandim.",
      "ro": "balpyohal ttae neomu ginjanghaesseoyo."
     },
     {
      "fr": "새 집이 아주 편해요.",
      "uz": "Yangi uy juda qulay.",
      "ro": "sae jibi aju pyeonhaeyo."
     },
     {
      "fr": "다음 달에 이사해요.",
      "uz": "Keyingi oy ko'chib o'taman.",
      "ro": "daeum dare isahaeyo."
     },
     {
      "fr": "친구들을 집에 초대했어요.",
      "uz": "Do'stlarimni uyga mehmonga chaqirdim.",
      "ro": "chingudeureul jibe chodaehaesseoyo."
     }
    ]
   },
   {
    "id": "u27l3",
    "title": "Sog'inmoq, qulay",
    "words": [
     {
      "fr": "그립다",
      "uz": "sog'inmoq",
      "ro": "geuripda"
     },
     {
      "fr": "편하다",
      "uz": "qulay",
      "ro": "pyeonhada"
     },
     {
      "fr": "불편하다",
      "uz": "noqulay",
      "ro": "bulpyeonhada"
     },
     {
      "fr": "이사하다",
      "uz": "ko'chib o'tmoq",
      "ro": "isahada"
     },
     {
      "fr": "초대하다",
      "uz": "mehmonga chaqirmoq",
      "ro": "chodaehada"
     }
    ],
    "sentences": [
     {
      "fr": "다음 달에 이사해요.",
      "uz": "Keyingi oy ko'chib o'taman.",
      "ro": "daeum dare isahaeyo."
     },
     {
      "fr": "친구들을 집에 초대했어요.",
      "uz": "Do'stlarimni uyga mehmonga chaqirdim.",
      "ro": "chingudeureul jibe chodaehaesseoyo."
     },
     {
      "fr": "합격해서 정말 기뻐요.",
      "uz": "Imtihondan o'tganim uchun juda xursandman.",
      "ro": "hapgyeokaeseo jeongmal gippeoyo."
     },
     {
      "fr": "친구가 떠나서 슬퍼요.",
      "uz": "Do'stim ketgani uchun g'amginman.",
      "ro": "chinguga tteonaseo seulpeoyo."
     },
     {
      "fr": "시험 때문에 걱정돼요.",
      "uz": "Imtihon tufayli xavotirdaman.",
      "ro": "siheom ttaemune geokjeongdwaeyo."
     }
    ]
   }
  ]
 },
 {
  "id": "u28",
  "level": "B2",
  "title": "TOPIK 4 so'zlari",
  "description": "Ta'lim, texnologiya, jamiyat",
  "color": "#FFB84D",
  "guide": [
   {
    "title": "-습니다 — rasmiy uslub",
    "text": "Yangiliklar, ma'ruza va yozma matnlarda: -습니다 (undoshdan keyin), -ㅂ니다 (unlidan keyin).",
    "examples": [
     [
      "중요합니다.",
      "Muhimdir."
     ],
     [
      "증가하고 있습니다.",
      "Ko'paymoqda."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u28l1",
    "title": "Iqtisodiyot, siyosat",
    "words": [
     {
      "fr": "경제",
      "uz": "iqtisodiyot",
      "ro": "gyeongje"
     },
     {
      "fr": "정치",
      "uz": "siyosat",
      "ro": "jeongchi"
     },
     {
      "fr": "교육",
      "uz": "ta'lim",
      "ro": "gyoyuk"
     },
     {
      "fr": "기술",
      "uz": "texnologiya",
      "ro": "gisul"
     },
     {
      "fr": "발전",
      "uz": "rivojlanish",
      "ro": "baljeon"
     }
    ],
    "sentences": [
     {
      "fr": "기술이 빠르게 발전하고 있습니다.",
      "uz": "Texnologiya tez rivojlanmoqda.",
      "ro": "gisuri ppareuge baljeonhago itseumnida."
     },
     {
      "fr": "교육은 사회 발전에 큰 영향을 줍니다.",
      "uz": "Ta'lim jamiyat rivojiga katta ta'sir ko'rsatadi.",
      "ro": "gyoyugeun sahoe baljeone keun yeonghyangeul jumnida."
     },
     {
      "fr": "이 문제를 해결하는 것이 중요합니다.",
      "uz": "Bu muammoni hal qilish muhim.",
      "ro": "i munjereul haegyeolhaneun geosi jungyohamnida."
     },
     {
      "fr": "관광객 수가 계속 증가하고 있습니다.",
      "uz": "Sayyohlar soni ko'payishda davom etmoqda.",
      "ro": "gwangwanggaek suga gyesok jeunggahago itseumnida."
     },
     {
      "fr": "여러분의 의견을 듣고 싶습니다.",
      "uz": "Fikrlaringizni eshitmoqchiman.",
      "ro": "yeoreobunui uigyeoneul deutgo sipseumnida."
     }
    ]
   },
   {
    "id": "u28l2",
    "title": "Ta'sir, munosabat",
    "words": [
     {
      "fr": "영향",
      "uz": "ta'sir",
      "ro": "yeonghyang"
     },
     {
      "fr": "관계",
      "uz": "munosabat",
      "ro": "gwangye"
     },
     {
      "fr": "책임",
      "uz": "mas'uliyat",
      "ro": "chaegim"
     },
     {
      "fr": "의견",
      "uz": "fikr",
      "ro": "uigyeon"
     },
     {
      "fr": "상황",
      "uz": "vaziyat",
      "ro": "sanghwang"
     }
    ],
    "sentences": [
     {
      "fr": "관광객 수가 계속 증가하고 있습니다.",
      "uz": "Sayyohlar soni ko'payishda davom etmoqda.",
      "ro": "gwangwanggaek suga gyesok jeunggahago itseumnida."
     },
     {
      "fr": "여러분의 의견을 듣고 싶습니다.",
      "uz": "Fikrlaringizni eshitmoqchiman.",
      "ro": "yeoreobunui uigyeoneul deutgo sipseumnida."
     },
     {
      "fr": "현재 상황이 좋지 않습니다.",
      "uz": "Hozirgi vaziyat yaxshi emas.",
      "ro": "hyeonjae sanghwangi jochi anseumnida."
     },
     {
      "fr": "모든 사람이 행사에 참여했습니다.",
      "uz": "Hamma tadbirda ishtirok etdi.",
      "ro": "modeun sarami haengsae chamyeohaetseumnida."
     },
     {
      "fr": "건강을 유지하려면 충분히 자야 합니다.",
      "uz": "Sog'liqni saqlash uchun yetarlicha uxlash kerak.",
      "ro": "geongangeul yujiharyeomyeon chungbunhi jaya hamnida."
     }
    ]
   },
   {
    "id": "u28l3",
    "title": "Kelib chiqish sababi, hal qilmoq",
    "words": [
     {
      "fr": "원인",
      "uz": "kelib chiqish sababi, omil",
      "ro": "wonin",
      "alt": [
       "kelib chiqish sababi",
       "omil"
      ]
     },
     {
      "fr": "해결하다",
      "uz": "hal qilmoq",
      "ro": "haegyeolhada"
     },
     {
      "fr": "증가하다",
      "uz": "ko'paymoq",
      "ro": "jeunggahada"
     },
     {
      "fr": "감소하다",
      "uz": "kamaymoq",
      "ro": "gamsohada"
     },
     {
      "fr": "참여하다",
      "uz": "ishtirok etmoq",
      "ro": "chamyeohada"
     }
    ],
    "sentences": [
     {
      "fr": "모든 사람이 행사에 참여했습니다.",
      "uz": "Hamma tadbirda ishtirok etdi.",
      "ro": "modeun sarami haengsae chamyeohaetseumnida."
     },
     {
      "fr": "건강을 유지하려면 충분히 자야 합니다.",
      "uz": "Sog'liqni saqlash uchun yetarlicha uxlash kerak.",
      "ro": "geongangeul yujiharyeomyeon chungbunhi jaya hamnida."
     },
     {
      "fr": "기술이 빠르게 발전하고 있습니다.",
      "uz": "Texnologiya tez rivojlanmoqda.",
      "ro": "gisuri ppareuge baljeonhago itseumnida."
     },
     {
      "fr": "교육은 사회 발전에 큰 영향을 줍니다.",
      "uz": "Ta'lim jamiyat rivojiga katta ta'sir ko'rsatadi.",
      "ro": "gyoyugeun sahoe baljeone keun yeonghyangeul jumnida."
     },
     {
      "fr": "이 문제를 해결하는 것이 중요합니다.",
      "uz": "Bu muammoni hal qilish muhim.",
      "ro": "i munjereul haegyeolhaneun geosi jungyohamnida."
     }
    ]
   },
   {
    "id": "u28l4",
    "title": "Saqlab turmoq, taxmin qilmoq",
    "words": [
     {
      "fr": "유지하다",
      "uz": "saqlab turmoq",
      "ro": "yujihada"
     },
     {
      "fr": "예상하다",
      "uz": "taxmin qilmoq",
      "ro": "yesanghada"
     },
     {
      "fr": "다양하다",
      "uz": "xilma-xil",
      "ro": "dayanghada"
     },
     {
      "fr": "중요하다",
      "uz": "muhim",
      "ro": "jungyohada"
     },
     {
      "fr": "충분하다",
      "uz": "yetarli",
      "ro": "chungbunhada"
     }
    ],
    "sentences": [
     {
      "fr": "교육은 사회 발전에 큰 영향을 줍니다.",
      "uz": "Ta'lim jamiyat rivojiga katta ta'sir ko'rsatadi.",
      "ro": "gyoyugeun sahoe baljeone keun yeonghyangeul jumnida."
     },
     {
      "fr": "이 문제를 해결하는 것이 중요합니다.",
      "uz": "Bu muammoni hal qilish muhim.",
      "ro": "i munjereul haegyeolhaneun geosi jungyohamnida."
     },
     {
      "fr": "관광객 수가 계속 증가하고 있습니다.",
      "uz": "Sayyohlar soni ko'payishda davom etmoqda.",
      "ro": "gwangwanggaek suga gyesok jeunggahago itseumnida."
     },
     {
      "fr": "여러분의 의견을 듣고 싶습니다.",
      "uz": "Fikrlaringizni eshitmoqchiman.",
      "ro": "yeoreobunui uigyeoneul deutgo sipseumnida."
     },
     {
      "fr": "현재 상황이 좋지 않습니다.",
      "uz": "Hozirgi vaziyat yaxshi emas.",
      "ro": "hyeonjae sanghwangi jochi anseumnida."
     }
    ]
   }
  ]
 },
 {
  "id": "u29",
  "level": "B2",
  "title": "Jamiyat va iqtisod",
  "description": "Aholi, iqtisod va ijtimoiy hayot",
  "color": "#FF6B9A",
  "guide": [
   {
    "title": "-(으)면 — agar",
    "text": "Shart: 소비가 늘면 — agar iste'mol oshsa.",
    "examples": [
     [
      "시간이 있으면",
      "vaqt bo'lsa"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u29l1",
    "title": "Aholi, avlod",
    "words": [
     {
      "fr": "인구",
      "uz": "aholi",
      "ro": "ingu"
     },
     {
      "fr": "세대",
      "uz": "avlod",
      "ro": "sedae"
     },
     {
      "fr": "문제점",
      "uz": "muammoli jihat",
      "ro": "munjejeom"
     },
     {
      "fr": "소비",
      "uz": "iste'mol",
      "ro": "sobi"
     },
     {
      "fr": "생산",
      "uz": "ishlab chiqarish",
      "ro": "saengsan"
     }
    ],
    "sentences": [
     {
      "fr": "도시의 인구가 계속 늘고 있습니다.",
      "uz": "Shahar aholisi ko'payib bormoqda.",
      "ro": "dosiui inguga gyesok neulgo itseumnida."
     },
     {
      "fr": "세대 간의 차이를 이해해야 합니다.",
      "uz": "Avlodlar orasidagi farqni tushunish kerak.",
      "ro": "sedae ganui chaireul ihaehaeya hamnida."
     },
     {
      "fr": "소비가 늘면 생산도 늘어납니다.",
      "uz": "Iste'mol oshsa, ishlab chiqarish ham oshadi.",
      "ro": "sobiga neulmyeon saengsando neureonamnida."
     },
     {
      "fr": "청년 취업이 어려워지고 있습니다.",
      "uz": "Yoshlarning ishga joylashishi qiyinlashmoqda.",
      "ro": "cheongnyeon chwieobi eoryeowojigo itseumnida."
     },
     {
      "fr": "기업 간의 경쟁이 심합니다.",
      "uz": "Kompaniyalar o'rtasida raqobat kuchli.",
      "ro": "gieop ganui gyeongjaengi simhamnida."
     }
    ]
   },
   {
    "id": "u29l2",
    "title": "Daromad, xarajat",
    "words": [
     {
      "fr": "수입",
      "uz": "daromad; import",
      "ro": "suip",
      "alt": [
       "daromad",
       "import"
      ]
     },
     {
      "fr": "지출",
      "uz": "xarajat",
      "ro": "jichul"
     },
     {
      "fr": "경쟁",
      "uz": "raqobat",
      "ro": "gyeongjaeng"
     },
     {
      "fr": "취업",
      "uz": "ishga joylashish",
      "ro": "chwieop"
     },
     {
      "fr": "실업",
      "uz": "ishsizlik",
      "ro": "sireop"
     }
    ],
    "sentences": [
     {
      "fr": "청년 취업이 어려워지고 있습니다.",
      "uz": "Yoshlarning ishga joylashishi qiyinlashmoqda.",
      "ro": "cheongnyeon chwieobi eoryeowojigo itseumnida."
     },
     {
      "fr": "기업 간의 경쟁이 심합니다.",
      "uz": "Kompaniyalar o'rtasida raqobat kuchli.",
      "ro": "gieop ganui gyeongjaengi simhamnida."
     },
     {
      "fr": "환경오염 문제가 심각합니다.",
      "uz": "Atrof-muhit ifloslanishi muammosi jiddiy.",
      "ro": "hwangyeongoyeom munjega simgakamnida."
     },
     {
      "fr": "정부는 복지 서비스를 제공합니다.",
      "uz": "Hukumat ijtimoiy xizmatlar ko'rsatadi.",
      "ro": "jeongbuneun bokji seobiseureul jegonghamnida."
     },
     {
      "fr": "새로운 제품을 개발했습니다.",
      "uz": "Yangi mahsulot ishlab chiqildi.",
      "ro": "saeroun jepumeul gaebalhaetseumnida."
     }
    ]
   },
   {
    "id": "u29l3",
    "title": "Ijtimoiy ta'minot, atrof-muhit ifloslanishi",
    "words": [
     {
      "fr": "복지",
      "uz": "ijtimoiy ta'minot",
      "ro": "bokji"
     },
     {
      "fr": "환경오염",
      "uz": "atrof-muhit ifloslanishi",
      "ro": "hwangyeongoyeom"
     },
     {
      "fr": "개발하다",
      "uz": "ishlab chiqmoq",
      "ro": "gaebalhada"
     },
     {
      "fr": "제공하다",
      "uz": "taqdim etmoq",
      "ro": "jegonghada"
     },
     {
      "fr": "요구하다",
      "uz": "talab qilmoq",
      "ro": "yoguhada"
     }
    ],
    "sentences": [
     {
      "fr": "정부는 복지 서비스를 제공합니다.",
      "uz": "Hukumat ijtimoiy xizmatlar ko'rsatadi.",
      "ro": "jeongbuneun bokji seobiseureul jegonghamnida."
     },
     {
      "fr": "새로운 제품을 개발했습니다.",
      "uz": "Yangi mahsulot ishlab chiqildi.",
      "ro": "saeroun jepumeul gaebalhaetseumnida."
     },
     {
      "fr": "도시의 인구가 계속 늘고 있습니다.",
      "uz": "Shahar aholisi ko'payib bormoqda.",
      "ro": "dosiui inguga gyesok neulgo itseumnida."
     },
     {
      "fr": "세대 간의 차이를 이해해야 합니다.",
      "uz": "Avlodlar orasidagi farqni tushunish kerak.",
      "ro": "sedae ganui chaireul ihaehaeya hamnida."
     },
     {
      "fr": "소비가 늘면 생산도 늘어납니다.",
      "uz": "Iste'mol oshsa, ishlab chiqarish ham oshadi.",
      "ro": "sobiga neulmyeon saengsando neureonamnida."
     }
    ]
   }
  ]
 },
 {
  "id": "u30",
  "level": "B2",
  "title": "Fikr bildirish",
  "description": "Rozilik, e'tiroz va munozara",
  "color": "#9B5CFF",
  "guide": [
   {
    "title": "Fikr bildirish iboralari",
    "text": "제 생각에는… (menimcha…), …에 찬성합니다 (…ni qo'llayman), …에 반대합니다 (…ga qarshiman).",
    "examples": [
     [
      "제 생각에는",
      "menimcha"
     ],
     [
      "저는 찬성합니다.",
      "Men qo'llab-quvvatlayman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u30l1",
    "title": "Qo'llab-quvvatlamoq, qarshi chiqmoq",
    "words": [
     {
      "fr": "찬성하다",
      "uz": "qo'llab-quvvatlamoq",
      "ro": "chanseonghada"
     },
     {
      "fr": "반대하다",
      "uz": "qarshi chiqmoq",
      "ro": "bandaehada"
     },
     {
      "fr": "동의하다",
      "uz": "rozi bo'lmoq",
      "ro": "donguihada"
     },
     {
      "fr": "판단하다",
      "uz": "baholab hukm chiqarmoq",
      "ro": "pandanhada"
     },
     {
      "fr": "확인하다",
      "uz": "tekshirib aniqlamoq",
      "ro": "hwaginhada"
     }
    ],
    "sentences": [
     {
      "fr": "저는 그 의견에 찬성합니다.",
      "uz": "Men bu fikrni qo'llab-quvvatlayman.",
      "ro": "jeoneun geu uigyeone chanseonghamnida."
     },
     {
      "fr": "저는 그 계획에 반대합니다.",
      "uz": "Men bu rejaga qarshiman.",
      "ro": "jeoneun geu gyehoege bandaehamnida."
     },
     {
      "fr": "대부분의 사람들이 동의했습니다.",
      "uz": "Ko'pchilik rozi bo'ldi.",
      "ro": "daebubunui saramdeuri donguihaetseumnida."
     },
     {
      "fr": "이 방법의 장점과 단점을 말해 보세요.",
      "uz": "Bu usulning afzallik va kamchiliklarini aytib ko'ring.",
      "ro": "i bangbeobui jangjeomgwa danjeomeul malhae boseyo."
     },
     {
      "fr": "토론 후에 결론을 내렸습니다.",
      "uz": "Munozaradan so'ng xulosa chiqardik.",
      "ro": "toron hue gyeollon-eul naeryeotseumnida."
     }
    ]
   },
   {
    "id": "u30l2",
    "title": "Tan olmoq, ifodalamoq",
    "words": [
     {
      "fr": "인정하다",
      "uz": "tan olmoq",
      "ro": "injeonghada"
     },
     {
      "fr": "표현하다",
      "uz": "ifodalamoq",
      "ro": "pyohyeonhada"
     },
     {
      "fr": "설득하다",
      "uz": "ko'ndirmoq",
      "ro": "seoldeukada"
     },
     {
      "fr": "토론",
      "uz": "munozara",
      "ro": "toron"
     },
     {
      "fr": "결론",
      "uz": "xulosa",
      "ro": "gyeollon"
     }
    ],
    "sentences": [
     {
      "fr": "이 방법의 장점과 단점을 말해 보세요.",
      "uz": "Bu usulning afzallik va kamchiliklarini aytib ko'ring.",
      "ro": "i bangbeobui jangjeomgwa danjeomeul malhae boseyo."
     },
     {
      "fr": "토론 후에 결론을 내렸습니다.",
      "uz": "Munozaradan so'ng xulosa chiqardik.",
      "ro": "toron hue gyeollon-eul naeryeotseumnida."
     },
     {
      "fr": "두 문화의 차이를 인정해야 합니다.",
      "uz": "Ikki madaniyat farqini tan olish kerak.",
      "ro": "du munhwaui chaireul injeonghaeya hamnida."
     },
     {
      "fr": "자신의 생각을 분명하게 표현하세요.",
      "uz": "O'z fikringizni aniq ifodalang.",
      "ro": "jasinui saenggageul bunmyeonghage pyohyeonhaseyo."
     },
     {
      "fr": "비가 와서 오히려 시원해졌어요.",
      "uz": "Yomg'ir yog'ib, aksincha, salqin bo'ldi.",
      "ro": "biga waseo ohiryeo siwonhaejyeosseoyo."
     }
    ]
   },
   {
    "id": "u30l3",
    "title": "Afzallik, kamchilik",
    "words": [
     {
      "fr": "장점",
      "uz": "afzallik",
      "ro": "jangjeom"
     },
     {
      "fr": "단점",
      "uz": "kamchilik",
      "ro": "danjeom"
     },
     {
      "fr": "차이",
      "uz": "farq",
      "ro": "chai"
     },
     {
      "fr": "대부분",
      "uz": "asosiy qismi, ko'pchiligi",
      "ro": "daebubun",
      "alt": [
       "asosiy qismi",
       "ko'pchiligi"
      ]
     },
     {
      "fr": "오히려",
      "uz": "aksincha",
      "ro": "ohiryeo"
     }
    ],
    "sentences": [
     {
      "fr": "자신의 생각을 분명하게 표현하세요.",
      "uz": "O'z fikringizni aniq ifodalang.",
      "ro": "jasinui saenggageul bunmyeonghage pyohyeonhaseyo."
     },
     {
      "fr": "비가 와서 오히려 시원해졌어요.",
      "uz": "Yomg'ir yog'ib, aksincha, salqin bo'ldi.",
      "ro": "biga waseo ohiryeo siwonhaejyeosseoyo."
     },
     {
      "fr": "저는 그 의견에 찬성합니다.",
      "uz": "Men bu fikrni qo'llab-quvvatlayman.",
      "ro": "jeoneun geu uigyeone chanseonghamnida."
     },
     {
      "fr": "저는 그 계획에 반대합니다.",
      "uz": "Men bu rejaga qarshiman.",
      "ro": "jeoneun geu gyehoege bandaehamnida."
     },
     {
      "fr": "대부분의 사람들이 동의했습니다.",
      "uz": "Ko'pchilik rozi bo'ldi.",
      "ro": "daebubunui saramdeuri donguihaetseumnida."
     }
    ]
   }
  ]
 },
 {
  "id": "u31",
  "level": "C1",
  "title": "TOPIK 5 so'zlari",
  "description": "Ilg'or: hodisa, qadriyat, siyosat",
  "color": "#4ADE80",
  "guide": [
   {
    "title": "Yozma nutq bog'lovchilari",
    "text": "따라서 (shuning uchun), 그러나 (biroq), 또한 (shuningdek), 반면에 (aksincha) — TOPIK yozma qismida juda muhim.",
    "examples": [
     [
      "따라서",
      "shuning uchun"
     ],
     [
      "반면에",
      "boshqa tomondan"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u31l1",
    "title": "Hodisa, qadriyat",
    "words": [
     {
      "fr": "현상",
      "uz": "hodisa",
      "ro": "hyeonsang"
     },
     {
      "fr": "가치",
      "uz": "qadriyat",
      "ro": "gachi"
     },
     {
      "fr": "갈등",
      "uz": "ziddiyat",
      "ro": "galdeung"
     },
     {
      "fr": "정책",
      "uz": "davlat siyosati, chora-tadbir",
      "ro": "jeongchaek",
      "alt": [
       "davlat siyosati",
       "chora-tadbir"
      ]
     },
     {
      "fr": "제도",
      "uz": "tizim, tartib",
      "ro": "jedo",
      "alt": [
       "tizim",
       "tartib"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "이러한 현상은 여러 원인에서 비롯됩니다.",
      "uz": "Bunday hodisa bir qancha sabablardan kelib chiqadi.",
      "ro": "ireohan hyeonsangeun yeoreo wonineseo birotdoemnida."
     },
     {
      "fr": "세대 간의 가치 차이가 갈등을 초래합니다.",
      "uz": "Avlodlar qadriyatidagi farq ziddiyatga olib keladi.",
      "ro": "sedae ganui gachi chaiga galdeungeul choraehamnida."
     },
     {
      "fr": "정부는 새로운 정책을 발표했습니다.",
      "uz": "Hukumat yangi siyosatni e'lon qildi.",
      "ro": "jeongbuneun saeroun jeongchaegeul balpyohaetseumnida."
     },
     {
      "fr": "이 제도는 사회의 변화를 반영합니다.",
      "uz": "Bu tizim jamiyatdagi o'zgarishlarni aks ettiradi.",
      "ro": "i jedoneun sahoeui byeonhwareul banyeonghamnida."
     },
     {
      "fr": "그 주장에는 분명한 근거가 있습니다.",
      "uz": "Bu da'voning aniq asosi bor.",
      "ro": "geu jujangeneun bunmyeonghan geungeoga itseumnida."
     }
    ]
   },
   {
    "id": "u31l2",
    "title": "Anglash, tendensiya",
    "words": [
     {
      "fr": "인식",
      "uz": "anglash, tushuncha",
      "ro": "insik",
      "alt": [
       "anglash",
       "tushuncha"
      ]
     },
     {
      "fr": "경향",
      "uz": "tendensiya",
      "ro": "gyeonghyang"
     },
     {
      "fr": "측면",
      "uz": "jihat",
      "ro": "cheungmyeon"
     },
     {
      "fr": "근거",
      "uz": "asos, dalil",
      "ro": "geungeo",
      "alt": [
       "asos",
       "dalil"
      ]
     },
     {
      "fr": "대책",
      "uz": "qarshi chora",
      "ro": "daechaek"
     }
    ],
    "sentences": [
     {
      "fr": "이 제도는 사회의 변화를 반영합니다.",
      "uz": "Bu tizim jamiyatdagi o'zgarishlarni aks ettiradi.",
      "ro": "i jedoneun sahoeui byeonhwareul banyeonghamnida."
     },
     {
      "fr": "그 주장에는 분명한 근거가 있습니다.",
      "uz": "Bu da'voning aniq asosi bor.",
      "ro": "geu jujangeneun bunmyeonghan geungeoga itseumnida."
     },
     {
      "fr": "자료를 꼼꼼히 분석해야 합니다.",
      "uz": "Ma'lumotlarni sinchiklab tahlil qilish kerak.",
      "ro": "jaryoreul kkomkkomhi bunseokaeya hamnida."
     },
     {
      "fr": "어려움을 극복하고 목표를 이루었습니다.",
      "uz": "Qiyinchiliklarni yengib, maqsadga erishdik.",
      "ro": "eoryeoumeul geukbokago mokpyoreul irueotseumnida."
     },
     {
      "fr": "여러 측면을 고려해야 합니다.",
      "uz": "Turli jihatlarni hisobga olish kerak.",
      "ro": "yeoreo cheungmyeoneul goryeohaeya hamnida."
     }
    ]
   },
   {
    "id": "u31l3",
    "title": "Samaradorlik, tengsizlik",
    "words": [
     {
      "fr": "효율",
      "uz": "samaradorlik",
      "ro": "hyoyul"
     },
     {
      "fr": "불평등",
      "uz": "tengsizlik",
      "ro": "bulpyeongdeung"
     },
     {
      "fr": "지속적",
      "uz": "uzluksiz, barqaror",
      "ro": "jisokjeok",
      "alt": [
       "uzluksiz",
       "barqaror"
      ]
     },
     {
      "fr": "분석하다",
      "uz": "tahlil qilmoq",
      "ro": "bunseokhada"
     },
     {
      "fr": "주장하다",
      "uz": "da'vo qilmoq, ta'kidlamoq",
      "ro": "jujanghada",
      "alt": [
       "da'vo qilmoq",
       "ta'kidlamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "어려움을 극복하고 목표를 이루었습니다.",
      "uz": "Qiyinchiliklarni yengib, maqsadga erishdik.",
      "ro": "eoryeoumeul geukbokago mokpyoreul irueotseumnida."
     },
     {
      "fr": "여러 측면을 고려해야 합니다.",
      "uz": "Turli jihatlarni hisobga olish kerak.",
      "ro": "yeoreo cheungmyeoneul goryeohaeya hamnida."
     },
     {
      "fr": "이러한 현상은 여러 원인에서 비롯됩니다.",
      "uz": "Bunday hodisa bir qancha sabablardan kelib chiqadi.",
      "ro": "ireohan hyeonsangeun yeoreo wonineseo birotdoemnida."
     },
     {
      "fr": "세대 간의 가치 차이가 갈등을 초래합니다.",
      "uz": "Avlodlar qadriyatidagi farq ziddiyatga olib keladi.",
      "ro": "sedae ganui gachi chaiga galdeungeul choraehamnida."
     },
     {
      "fr": "정부는 새로운 정책을 발표했습니다.",
      "uz": "Hukumat yangi siyosatni e'lon qildi.",
      "ro": "jeongbuneun saeroun jeongchaegeul balpyohaetseumnida."
     }
    ]
   },
   {
    "id": "u31l4",
    "title": "Yengib o'tmoq, oqibatga olib kelmoq",
    "words": [
     {
      "fr": "극복하다",
      "uz": "yengib o'tmoq",
      "ro": "geukbokhada"
     },
     {
      "fr": "초래하다",
      "uz": "oqibatga olib kelmoq",
      "ro": "choraehada"
     },
     {
      "fr": "반영하다",
      "uz": "aks ettirmoq",
      "ro": "banyeonghada"
     },
     {
      "fr": "강조하다",
      "uz": "urg'u bermoq",
      "ro": "gangjohada"
     },
     {
      "fr": "고려하다",
      "uz": "hisobga olmoq",
      "ro": "goryeohada"
     }
    ],
    "sentences": [
     {
      "fr": "세대 간의 가치 차이가 갈등을 초래합니다.",
      "uz": "Avlodlar qadriyatidagi farq ziddiyatga olib keladi.",
      "ro": "sedae ganui gachi chaiga galdeungeul choraehamnida."
     },
     {
      "fr": "정부는 새로운 정책을 발표했습니다.",
      "uz": "Hukumat yangi siyosatni e'lon qildi.",
      "ro": "jeongbuneun saeroun jeongchaegeul balpyohaetseumnida."
     },
     {
      "fr": "이 제도는 사회의 변화를 반영합니다.",
      "uz": "Bu tizim jamiyatdagi o'zgarishlarni aks ettiradi.",
      "ro": "i jedoneun sahoeui byeonhwareul banyeonghamnida."
     },
     {
      "fr": "그 주장에는 분명한 근거가 있습니다.",
      "uz": "Bu da'voning aniq asosi bor.",
      "ro": "geu jujangeneun bunmyeonghan geungeoga itseumnida."
     },
     {
      "fr": "자료를 꼼꼼히 분석해야 합니다.",
      "uz": "Ma'lumotlarni sinchiklab tahlil qilish kerak.",
      "ro": "jaryoreul kkomkkomhi bunseokaeya hamnida."
     }
    ]
   }
  ]
 },
 {
  "id": "u32",
  "level": "C1",
  "title": "Ilmiy va rasmiy",
  "description": "Tadqiqot va rasmiy uslub",
  "color": "#38BDF8",
  "guide": [
   {
    "title": "-에 따르면 — …ga ko'ra",
    "text": "Manbaga tayanish: 통계에 따르면 — statistikaga ko'ra.",
    "examples": [
     [
      "연구에 따르면",
      "tadqiqotga ko'ra"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u32l1",
    "title": "Tadqiqot, faraz",
    "words": [
     {
      "fr": "연구",
      "uz": "tadqiqot",
      "ro": "yeongu"
     },
     {
      "fr": "가설",
      "uz": "faraz",
      "ro": "gaseol"
     },
     {
      "fr": "이론",
      "uz": "nazariya",
      "ro": "iron"
     },
     {
      "fr": "개념",
      "uz": "konsepsiya",
      "ro": "gaenyeom"
     },
     {
      "fr": "관점",
      "uz": "nuqtayi nazar",
      "ro": "gwanjeom"
     }
    ],
    "sentences": [
     {
      "fr": "이 연구는 새로운 가설을 제시합니다.",
      "uz": "Bu tadqiqot yangi faraz ilgari suradi.",
      "ro": "i yeonguneun saeroun gaseoreul jesihamnida."
     },
     {
      "fr": "통계에 따르면 비율이 증가했습니다.",
      "uz": "Statistikaga ko'ra, ulush oshdi.",
      "ro": "tonggye-e ttareumyeon biyuri jeunggahaetseumnida."
     },
     {
      "fr": "다른 관점에서 문제를 검토해 봅시다.",
      "uz": "Muammoni boshqa nuqtayi nazardan ko'rib chiqaylik.",
      "ro": "dareun gwanjeomeseo munjereul geomtohae bopsida."
     },
     {
      "fr": "이론만으로는 한계가 있습니다.",
      "uz": "Faqat nazariya bilan cheklov bor.",
      "ro": "iron-maneuroneun hangyega itseumnida."
     },
     {
      "fr": "실험으로 가설을 입증했습니다.",
      "uz": "Tajriba orqali farazni isbotladik.",
      "ro": "silheomeuro gaseoreul ipjeunghaetseumnida."
     }
    ]
   },
   {
    "id": "u32l2",
    "title": "Kontekst, istiqbol",
    "words": [
     {
      "fr": "맥락",
      "uz": "kontekst",
      "ro": "maengnak"
     },
     {
      "fr": "전망",
      "uz": "istiqbol, prognoz",
      "ro": "jeonmang",
      "alt": [
       "istiqbol",
       "prognoz"
      ]
     },
     {
      "fr": "추세",
      "uz": "o'zgarish yo'nalishi (trend)",
      "ro": "chuse",
      "alt": [
       "o'zgarish yo'nalishi"
      ]
     },
     {
      "fr": "비율",
      "uz": "nisbat, ulush",
      "ro": "biyul",
      "alt": [
       "nisbat",
       "ulush"
      ]
     },
     {
      "fr": "통계",
      "uz": "statistika",
      "ro": "tonggye"
     }
    ],
    "sentences": [
     {
      "fr": "이론만으로는 한계가 있습니다.",
      "uz": "Faqat nazariya bilan cheklov bor.",
      "ro": "iron-maneuroneun hangyega itseumnida."
     },
     {
      "fr": "실험으로 가설을 입증했습니다.",
      "uz": "Tajriba orqali farazni isbotladik.",
      "ro": "silheomeuro gaseoreul ipjeunghaetseumnida."
     },
     {
      "fr": "미래 전망이 밝습니다.",
      "uz": "Kelajak istiqboli porloq.",
      "ro": "mirae jeonmangi balkseumnida."
     },
     {
      "fr": "맥락을 이해하는 것이 중요합니다.",
      "uz": "Kontekstni tushunish muhim.",
      "ro": "maengnageul ihaehaneun geosi jungyohamnida."
     },
     {
      "fr": "최근 추세를 보면 변화가 뚜렷합니다.",
      "uz": "So'nggi trendga qaralsa, o'zgarish aniq ko'rinadi.",
      "ro": "choegeun chusereul bomyeon byeonhwaga tturyeotamnida."
     }
    ]
   },
   {
    "id": "u32l3",
    "title": "Ta'sir etuvchi omil, chegara",
    "words": [
     {
      "fr": "요인",
      "uz": "ta'sir etuvchi omil",
      "ro": "yoin"
     },
     {
      "fr": "한계",
      "uz": "chegara, cheklov",
      "ro": "hangye",
      "alt": [
       "chegara",
       "cheklov"
      ]
     },
     {
      "fr": "검토하다",
      "uz": "ko'rib chiqmoq",
      "ro": "geomtohada"
     },
     {
      "fr": "제시하다",
      "uz": "taklif etmoq, ko'rsatmoq",
      "ro": "jesihada",
      "alt": [
       "taklif etmoq",
       "ko'rsatmoq"
      ]
     },
     {
      "fr": "입증하다",
      "uz": "isbotlamoq",
      "ro": "ipjeunghada"
     }
    ],
    "sentences": [
     {
      "fr": "맥락을 이해하는 것이 중요합니다.",
      "uz": "Kontekstni tushunish muhim.",
      "ro": "maengnageul ihaehaneun geosi jungyohamnida."
     },
     {
      "fr": "최근 추세를 보면 변화가 뚜렷합니다.",
      "uz": "So'nggi trendga qaralsa, o'zgarish aniq ko'rinadi.",
      "ro": "choegeun chusereul bomyeon byeonhwaga tturyeotamnida."
     },
     {
      "fr": "이 연구는 새로운 가설을 제시합니다.",
      "uz": "Bu tadqiqot yangi faraz ilgari suradi.",
      "ro": "i yeonguneun saeroun gaseoreul jesihamnida."
     },
     {
      "fr": "통계에 따르면 비율이 증가했습니다.",
      "uz": "Statistikaga ko'ra, ulush oshdi.",
      "ro": "tonggye-e ttareumyeon biyuri jeunggahaetseumnida."
     },
     {
      "fr": "다른 관점에서 문제를 검토해 봅시다.",
      "uz": "Muammoni boshqa nuqtayi nazardan ko'rib chiqaylik.",
      "ro": "dareun gwanjeomeseo munjereul geomtohae bopsida."
     }
    ]
   }
  ]
 },
 {
  "id": "u33",
  "level": "C1",
  "title": "Murakkab fe'l va sifatlar",
  "description": "Rasmiy matnlardagi kuchli fe'llar",
  "color": "#F472B6",
  "guide": [
   {
    "title": "Xitoycha ildizli fe'llar",
    "text": "Ko'p rasmiy fe'llar xitoycha ildiz + 하다: 도입하다, 강화하다. Ildizni bilsangiz, ma'noni taxmin qilish oson.",
    "examples": [
     [
      "강화하다",
      "kuchaytirmoq"
     ],
     [
      "완화하다",
      "yumshatmoq"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u33l1",
    "title": "Kamchilikni ko'rsatib o'tmoq, xavotir bildirmoq",
    "words": [
     {
      "fr": "지적하다",
      "uz": "kamchilikni ko'rsatib o'tmoq",
      "ro": "jijeokada"
     },
     {
      "fr": "우려하다",
      "uz": "xavotir bildirmoq",
      "ro": "uryeohada"
     },
     {
      "fr": "촉구하다",
      "uz": "qat'iy chaqirmoq",
      "ro": "chokguhada"
     },
     {
      "fr": "완화하다",
      "uz": "yumshatmoq",
      "ro": "wanhwahada"
     },
     {
      "fr": "강화하다",
      "uz": "kuchaytirmoq",
      "ro": "ganghwahada"
     }
    ],
    "sentences": [
     {
      "fr": "전문가들은 문제점을 지적했습니다.",
      "uz": "Mutaxassislar muammoli jihatlarni ko'rsatib o'tishdi.",
      "ro": "jeonmungadeureun munjejeomeul jijeokaetseumnida."
     },
     {
      "fr": "많은 사람들이 환경 문제를 우려합니다.",
      "uz": "Ko'pchilik ekologiya muammosidan xavotirda.",
      "ro": "maneun saramdeuri hwangyeong munjereul uryeohamnida."
     },
     {
      "fr": "정부에 빠른 대책을 촉구했습니다.",
      "uz": "Hukumatni tezkor choralar ko'rishga chaqirishdi.",
      "ro": "jeongbue ppareun daechaegeul chokguhaetseumnida."
     },
     {
      "fr": "규제를 완화하기로 했습니다.",
      "uz": "Cheklovlarni yumshatishga qaror qilindi.",
      "ro": "gyujereul wanhwahagiro haetseumnida."
     },
     {
      "fr": "새로운 제도를 도입했습니다.",
      "uz": "Yangi tizim joriy etildi.",
      "ro": "saeroun jedoreul doipaetseumnida."
     }
    ]
   },
   {
    "id": "u33l2",
    "title": "Kengaytirmoq, qisqartirmoq",
    "words": [
     {
      "fr": "확대하다",
      "uz": "kengaytirmoq",
      "ro": "hwakdaehada"
     },
     {
      "fr": "축소하다",
      "uz": "qisqartirmoq",
      "ro": "chuksohada"
     },
     {
      "fr": "도입하다",
      "uz": "joriy etmoq",
      "ro": "doipada"
     },
     {
      "fr": "대처하다",
      "uz": "vaziyatga chora ko'rmoq",
      "ro": "daecheohada"
     },
     {
      "fr": "기여하다",
      "uz": "hissa qo'shmoq",
      "ro": "giyeohada"
     }
    ],
    "sentences": [
     {
      "fr": "규제를 완화하기로 했습니다.",
      "uz": "Cheklovlarni yumshatishga qaror qilindi.",
      "ro": "gyujereul wanhwahagiro haetseumnida."
     },
     {
      "fr": "새로운 제도를 도입했습니다.",
      "uz": "Yangi tizim joriy etildi.",
      "ro": "saeroun jedoreul doipaetseumnida."
     },
     {
      "fr": "사회 발전에 기여하고 싶습니다.",
      "uz": "Jamiyat taraqqiyotiga hissa qo'shmoqchiman.",
      "ro": "sahoe baljeone giyeohago sipseumnida."
     },
     {
      "fr": "변화는 불가피합니다.",
      "uz": "O'zgarish muqarrar.",
      "ro": "byeonhwaneun bulgapihamnida."
     },
     {
      "fr": "지나친 경쟁은 바람직하지 않습니다.",
      "uz": "Haddan tashqari raqobat maqbul emas.",
      "ro": "jinachin gyeongjaengeun baramjikaji anseumnida."
     }
    ]
   },
   {
    "id": "u33l3",
    "title": "Muqarrar, aniq-ravshan",
    "words": [
     {
      "fr": "불가피하다",
      "uz": "muqarrar",
      "ro": "bulgapihada"
     },
     {
      "fr": "뚜렷하다",
      "uz": "aniq-ravshan",
      "ro": "tturyeotada"
     },
     {
      "fr": "심각하다",
      "uz": "jiddiy, og'ir",
      "ro": "simgakada",
      "alt": [
       "jiddiy",
       "og'ir"
      ]
     },
     {
      "fr": "바람직하다",
      "uz": "maqbul",
      "ro": "baramjikada"
     },
     {
      "fr": "지나치다",
      "uz": "haddan oshmoq",
      "ro": "jinachida"
     }
    ],
    "sentences": [
     {
      "fr": "변화는 불가피합니다.",
      "uz": "O'zgarish muqarrar.",
      "ro": "byeonhwaneun bulgapihamnida."
     },
     {
      "fr": "지나친 경쟁은 바람직하지 않습니다.",
      "uz": "Haddan tashqari raqobat maqbul emas.",
      "ro": "jinachin gyeongjaengeun baramjikaji anseumnida."
     },
     {
      "fr": "전문가들은 문제점을 지적했습니다.",
      "uz": "Mutaxassislar muammoli jihatlarni ko'rsatib o'tishdi.",
      "ro": "jeonmungadeureun munjejeomeul jijeokaetseumnida."
     },
     {
      "fr": "많은 사람들이 환경 문제를 우려합니다.",
      "uz": "Ko'pchilik ekologiya muammosidan xavotirda.",
      "ro": "maneun saramdeuri hwangyeong munjereul uryeohamnida."
     },
     {
      "fr": "정부에 빠른 대책을 촉구했습니다.",
      "uz": "Hukumatni tezkor choralar ko'rishga chaqirishdi.",
      "ro": "jeongbue ppareun daechaegeul chokguhaetseumnida."
     }
    ]
   }
  ]
 },
 {
  "id": "u34",
  "level": "C2",
  "title": "Akademik nutq · T6",
  "description": "Eng yuqori daraja: akademik ifodalar",
  "color": "#A78BFA",
  "guide": [
   {
    "title": "Akademik uslub",
    "text": "TOPIK 6 matnlarida -는바, -는 셈이다, -기 마련이다 kabi murakkab ifodalar uchraydi.",
    "examples": [
     [
      "변화는 불가피한 셈이다.",
      "O'zgarish muqarrar desa bo'ladi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u34l1",
    "title": "Ishora qilmoq, o'z ichiga olmoq",
    "words": [
     {
      "fr": "시사하다",
      "uz": "ishora qilmoq",
      "ro": "sisahada"
     },
     {
      "fr": "내포하다",
      "uz": "o'z ichiga olmoq",
      "ro": "naepohada"
     },
     {
      "fr": "간과하다",
      "uz": "e'tibordan chetda qoldirmoq",
      "ro": "ganggwahada"
     },
     {
      "fr": "모색하다",
      "uz": "izlamoq, yo'l qidirmoq",
      "ro": "mosaekada",
      "alt": [
       "izlamoq",
       "yo'l qidirmoq"
      ]
     },
     {
      "fr": "상반되다",
      "uz": "qarama-qarshi bo'lmoq",
      "ro": "sangbandoeda"
     }
    ],
    "sentences": [
     {
      "fr": "이 결과는 중요한 점을 시사합니다.",
      "uz": "Bu natija muhim jihatga ishora qiladi.",
      "ro": "i gyeolgwaneun jungyohan jeomeul sisahamnida."
     },
     {
      "fr": "그 표현은 여러 의미를 내포합니다.",
      "uz": "Bu ifoda bir necha ma'noni o'z ichiga oladi.",
      "ro": "geu pyohyeoneun yeoreo uimireul naepohamnida."
     },
     {
      "fr": "우리는 이 문제를 간과해서는 안 됩니다.",
      "uz": "Bu muammoni e'tibordan chetda qoldirmasligimiz kerak.",
      "ro": "urineun i munjereul ganggwahaeseoneun an doemnida."
     },
     {
      "fr": "새로운 해결책을 모색해야 합니다.",
      "uz": "Yangi yechim izlash kerak.",
      "ro": "saeroun haegyeolchaegeul mosaekaeya hamnida."
     },
     {
      "fr": "두 연구의 결과가 상반됩니다.",
      "uz": "Ikki tadqiqot natijasi bir-biriga zid.",
      "ro": "du yeonguui gyeolgwaga sangbandoemnida."
     }
    ]
   },
   {
    "id": "u34l2",
    "title": "Birga olib kelmoq, keltirib chiqarmoq",
    "words": [
     {
      "fr": "수반하다",
      "uz": "birga olib kelmoq",
      "ro": "subanhada"
     },
     {
      "fr": "야기하다",
      "uz": "keltirib chiqarmoq",
      "ro": "yagihada"
     },
     {
      "fr": "촉진하다",
      "uz": "tezlashtirmoq",
      "ro": "chokjinhada"
     },
     {
      "fr": "저해하다",
      "uz": "to'sqinlik qilmoq",
      "ro": "jeohaehada"
     },
     {
      "fr": "논의",
      "uz": "muhokama",
      "ro": "nonui"
     }
    ],
    "sentences": [
     {
      "fr": "새로운 해결책을 모색해야 합니다.",
      "uz": "Yangi yechim izlash kerak.",
      "ro": "saeroun haegyeolchaegeul mosaekaeya hamnida."
     },
     {
      "fr": "두 연구의 결과가 상반됩니다.",
      "uz": "Ikki tadqiqot natijasi bir-biriga zid.",
      "ro": "du yeonguui gyeolgwaga sangbandoemnida."
     },
     {
      "fr": "변화에는 비용이 수반됩니다.",
      "uz": "O'zgarish xarajatlarni o'zi bilan olib keladi.",
      "ro": "byeonhwaeneun biyongi subandoemnida."
     },
     {
      "fr": "부족한 소통이 오해를 야기했습니다.",
      "uz": "Muloqot yetishmasligi tushunmovchilikni keltirib chiqardi.",
      "ro": "bujokan sotongi ohaereul yagihaetseumnida."
     },
     {
      "fr": "이 정책은 경제 성장을 촉진할 것입니다.",
      "uz": "Bu siyosat iqtisodiy o'sishni tezlashtiradi.",
      "ro": "i jeongchaegeun gyeongje seongjangeul chokjinhal geosimnida."
     }
    ]
   }
  ]
 },
 {
  "id": "u35",
  "level": "C2",
  "title": "Jamiyat tahlili · T6",
  "description": "Zamonaviy jamiyat muammolari",
  "color": "#FB923C",
  "guide": [
   {
    "title": "-화 — …lashuv",
    "text": "-화 qo'shimchasi jarayonni bildiradi: 세계화 (globallashuv), 고령화 (qarish).",
    "examples": [
     [
      "세계화",
      "globallashuv"
     ],
     [
      "도시화",
      "shaharlashuv"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u35l1",
    "title": "Qutblanish, aholining qarishi",
    "words": [
     {
      "fr": "양극화",
      "uz": "qutblanish",
      "ro": "yanggeukhwa"
     },
     {
      "fr": "고령화",
      "uz": "aholining qarishi",
      "ro": "goryeonghwa"
     },
     {
      "fr": "저출산",
      "uz": "tug'ilishning kamayishi",
      "ro": "jeochulsan"
     },
     {
      "fr": "다문화",
      "uz": "ko'p madaniyatlilik",
      "ro": "damunhwa"
     },
     {
      "fr": "세계화",
      "uz": "globallashuv",
      "ro": "segyehwa"
     }
    ],
    "sentences": [
     {
      "fr": "소득 양극화가 점점 심해지고 있습니다.",
      "uz": "Daromadlar qutblanishi tobora kuchaymoqda.",
      "ro": "sodeuk yanggeukhwaga jeomjeom simhaejigo itseumnida."
     },
     {
      "fr": "고령화는 많은 나라의 과제입니다.",
      "uz": "Aholining qarishi ko'p davlatlar uchun vazifa.",
      "ro": "goryeonghwaneun maneun naraui gwajeimnida."
     },
     {
      "fr": "저출산 문제에 대한 대책이 필요합니다.",
      "uz": "Tug'ilishning kamayishiga qarshi chora kerak.",
      "ro": "jeochulsan munjee daehan daechaegi piryohamnida."
     },
     {
      "fr": "한국도 다문화 사회가 되고 있습니다.",
      "uz": "Koreya ham ko'p madaniyatli jamiyatga aylanmoqda.",
      "ro": "hangukdo damunhwa sahoega doego itseumnida."
     },
     {
      "fr": "세계화로 문화 교류가 늘었습니다.",
      "uz": "Globallashuv tufayli madaniy almashinuv ko'paydi.",
      "ro": "segyehwaro munhwa gyoryuga neureotseumnida."
     }
    ]
   },
   {
    "id": "u35l2",
    "title": "O'zlik, adolatlilik",
    "words": [
     {
      "fr": "정체성",
      "uz": "o'zlik, identitet",
      "ro": "jeongchaeseong",
      "alt": [
       "o'zlik",
       "identitet"
      ]
     },
     {
      "fr": "형평성",
      "uz": "adolatlilik",
      "ro": "hyeongpyeongseong"
     },
     {
      "fr": "지속가능성",
      "uz": "barqarorlik",
      "ro": "jisokganeungseong"
     },
     {
      "fr": "담론",
      "uz": "diskurs",
      "ro": "damnon"
     },
     {
      "fr": "과제",
      "uz": "vazifa, muammo",
      "ro": "gwaje",
      "alt": [
       "vazifa",
       "muammo"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "한국도 다문화 사회가 되고 있습니다.",
      "uz": "Koreya ham ko'p madaniyatli jamiyatga aylanmoqda.",
      "ro": "hangukdo damunhwa sahoega doego itseumnida."
     },
     {
      "fr": "세계화로 문화 교류가 늘었습니다.",
      "uz": "Globallashuv tufayli madaniy almashinuv ko'paydi.",
      "ro": "segyehwaro munhwa gyoryuga neureotseumnida."
     },
     {
      "fr": "청소년기에 정체성을 고민합니다.",
      "uz": "O'smirlik davrida o'zlik haqida o'ylanadi.",
      "ro": "cheongsonyeongie jeongchaeseongeul gominhamnida."
     },
     {
      "fr": "정책은 형평성을 고려해야 합니다.",
      "uz": "Siyosat adolatlilikni hisobga olishi kerak.",
      "ro": "jeongchaegeun hyeongpyeongseongeul goryeohaeya hamnida."
     },
     {
      "fr": "지속가능성은 미래 세대를 위한 약속입니다.",
      "uz": "Barqarorlik — kelajak avlod uchun va'da.",
      "ro": "jisokganeungseongeun mirae sedaereul wihan yaksogimnida."
     }
    ]
   }
  ]
 }
];

export const ALL_LESSONS: Lesson[] = COURSE.flatMap((u) => u.lessons);

export function findLesson(id: string): { unit: Unit; lesson: Lesson; index: number } | null {
  for (const unit of COURSE) {
    const index = unit.lessons.findIndex((l) => l.id === id);
    if (index >= 0) return { unit, lesson: unit.lessons[index], index };
  }
  return null;
}
