// AVTOMATIK YARATILGAN kurs davomi (A1 → C2). Qo'lda tahrirlash mumkin.
// Manba: o'quv rejasi + AI yaratish + AI muharrir tekshiruvi + avtomatik tozalash.
import type { Unit } from './course';

export const COURSE_EXT: Unit[] = [
 {
  "id": "u7",
  "level": "A1",
  "title": "Uy",
  "description": "Uy, xonalar, mebel, uy jihozlari",
  "color": "#818CF8",
  "guide": [
   {
    "title": "«Il y a» iborasi",
    "text": "Fransuz tilida biror narsa bor yoki mavjud ekanligini bildirish uchun «il y a» iborasidan foydalanamiz. Bu ingliz tilidagi «there is» yoki «there are» ma'nosini bildiradi.",
    "examples": [
     [
      "Il y a une table dans la cuisine.",
      "Oshxonada stol bor."
     ],
     [
      "Il y a un lit dans la chambre.",
      "Yotoqxonada yotoq bor."
     ]
    ]
   },
   {
    "title": "Joy predloglari",
    "text": "Buyumlarning joylashgan o'rnini ko'rsatish uchun «dans» (ichida), «sur» (ustida), «sous» (tagida) predloglarini ishlatamiz.",
    "examples": [
     [
      "Le chat est sur le canapé.",
      "Mushuk divanda turibdi."
     ],
     [
      "Le livre est sous la chaise.",
      "Kitob stul ostida."
     ]
    ]
   },
   {
    "title": "Old va orqa predloglari",
    "text": "Narsalarning oldida yoki orqasida ekanligini bildirish uchun «devant» va «derrière» so'zlaridan foydalanamiz.",
    "examples": [
     [
      "La voiture est devant la maison.",
      "Mashina uyning oldida."
     ],
     [
      "Le jardin est derrière la maison.",
      "Bog' uyning orqasida."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u7l1",
    "title": "Uy va xonalar",
    "words": [
     {
      "fr": "la pièce",
      "uz": "xona",
      "emoji": "🏠",
      "alt": [
       "bo'lma"
      ]
     },
     {
      "fr": "la cuisine",
      "uz": "oshxona",
      "emoji": "🍳",
      "alt": [
       "ovqat pishirish joyi"
      ]
     },
     {
      "fr": "la chambre",
      "uz": "yotoqxona",
      "emoji": "🛏️",
      "alt": [
       "uxlash xonasi"
      ]
     },
     {
      "fr": "le salon",
      "uz": "mehmonxona",
      "emoji": "🛋️",
      "alt": [
       "zal"
      ]
     },
     {
      "fr": "la salle de bains",
      "uz": "hammom",
      "emoji": "🛁",
      "alt": [
       "yuvinish xonasi"
      ]
     },
     {
      "fr": "le couloir",
      "uz": "yo'lak",
      "emoji": "🚪",
      "alt": [
       "dahliz"
      ]
     },
     {
      "fr": "le balcon",
      "uz": "ayvon",
      "emoji": "🏙️",
      "alt": [
       "balkon"
      ]
     },
     {
      "fr": "le toit",
      "uz": "tom",
      "emoji": "🏠",
      "alt": [
       "bino uchi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il y a une cuisine.",
      "uz": "Oshxona bor.",
      "uzAlt": [
       "Bu yerda oshxona bor"
      ]
     },
     {
      "fr": "La chambre est grande.",
      "uz": "Yotoqxona katta.",
      "uzAlt": [
       "Katta yotoqxona"
      ]
     },
     {
      "fr": "Il y a un salon.",
      "uz": "Mehmonxona mavjud.",
      "uzAlt": [
       "Mehmonxona bor"
      ]
     },
     {
      "fr": "La salle de bains est petite.",
      "uz": "Hammom kichik.",
      "uzAlt": [
       "Kichkina hammom"
      ]
     },
     {
      "fr": "Il y a un balcon dans la pièce.",
      "uz": "Xonada balkon bor.",
      "uzAlt": [
       "Bu xonada balkon mavjud"
      ]
     },
     {
      "fr": "Le couloir est long.",
      "uz": "Yo'lak uzun.",
      "uzAlt": [
       "Uzun yo'lak"
      ]
     }
    ]
   },
   {
    "id": "u7l2",
    "title": "Mebel jihozlari",
    "words": [
     {
      "fr": "la table",
      "uz": "stol",
      "emoji": "🪑",
      "alt": [
       "mez"
      ]
     },
     {
      "fr": "la chaise",
      "uz": "stul",
      "emoji": "🪑",
      "alt": [
       "kursi"
      ]
     },
     {
      "fr": "le lit",
      "uz": "krovat",
      "emoji": "🛌",
      "alt": [
       "karavot"
      ]
     },
     {
      "fr": "le canapé",
      "uz": "divan",
      "emoji": "🛋️",
      "alt": [
       "divan kreslo"
      ]
     },
     {
      "fr": "l'armoire",
      "uz": "javon",
      "emoji": "🚪",
      "alt": [
       "shkaf"
      ]
     },
     {
      "fr": "le bureau",
      "uz": "ish stoli",
      "emoji": "💻",
      "alt": [
       "yozuv stoli"
      ]
     },
     {
      "fr": "le tapis",
      "uz": "gilam",
      "emoji": "🧶",
      "alt": [
       "palos"
      ]
     },
     {
      "fr": "la lampe",
      "uz": "chiroq",
      "emoji": "💡",
      "alt": [
       "lampochka"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il y a une table dans la cuisine.",
      "uz": "Oshxonada stol bor.",
      "uzAlt": [
       "Oshxonada bitta stol mavjud"
      ]
     },
     {
      "fr": "La chaise est près du bureau.",
      "uz": "Stul ish stolining yonida.",
      "uzAlt": [
       "Stul yozuv stoli yonida"
      ]
     },
     {
      "fr": "Il y a un lit dans la chambre.",
      "uz": "Yotoqxonada krovat bor.",
      "uzAlt": [
       "Yotoqxonada karavot bor"
      ]
     },
     {
      "fr": "Le canapé est grand.",
      "uz": "Divan katta.",
      "uzAlt": [
       "Katta divan"
      ]
     },
     {
      "fr": "L'armoire est dans le couloir.",
      "uz": "Javon yo'lakda.",
      "uzAlt": [
       "Shkaf yo'lakda turibdi"
      ]
     },
     {
      "fr": "Il y a une lampe sur la table.",
      "uz": "Stol ustida chiroq bor.",
      "uzAlt": [
       "Stol ustida lampa bor"
      ]
     }
    ]
   },
   {
    "id": "u7l3",
    "title": "Uy jihozlari va texnika",
    "words": [
     {
      "fr": "la porte",
      "uz": "eshik",
      "emoji": "🚪",
      "alt": [
       "darvoza"
      ]
     },
     {
      "fr": "la fenêtre",
      "uz": "deraza",
      "emoji": "🪟",
      "alt": [
       "oyna"
      ]
     },
     {
      "fr": "le mur",
      "uz": "devor",
      "emoji": "🧱",
      "alt": [
       "tomi"
      ]
     },
     {
      "fr": "le sol",
      "uz": "pol",
      "emoji": "🪵",
      "alt": [
       "yer"
      ]
     },
     {
      "fr": "la télévision",
      "uz": "televizor",
      "emoji": "📺",
      "alt": [
       "televideniye"
      ]
     },
     {
      "fr": "l'ordinateur",
      "uz": "kompyuter",
      "emoji": "💻",
      "alt": [
       "komp"
      ]
     },
     {
      "fr": "le miroir",
      "uz": "ko'zgu",
      "emoji": "🪞",
      "alt": [
       "oyna"
      ]
     },
     {
      "fr": "la douche",
      "uz": "dush",
      "emoji": "🚿",
      "alt": [
       "vanna"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La porte est ouverte.",
      "uz": "Eshik ochiq.",
      "uzAlt": [
       "Ochiq eshik"
      ]
     },
     {
      "fr": "Il y a une fenêtre dans la chambre.",
      "uz": "Yotoqxonada deraza bor.",
      "uzAlt": [
       "Yotoqxonada bitta deraza mavjud"
      ]
     },
     {
      "fr": "Le mur est blanc.",
      "uz": "Devor oq.",
      "uzAlt": [
       "Oq devor"
      ]
     },
     {
      "fr": "Il y a une télévision dans le salon.",
      "uz": "Mehmonxonada televizor bor.",
      "uzAlt": [
       "Mehmonxonada bitta televizor turibdi"
      ]
     },
     {
      "fr": "L'ordinateur est sur le bureau.",
      "uz": "Kompyuter ish stolida.",
      "uzAlt": [
       "Kompyuter yozuv stolining ustida"
      ]
     },
     {
      "fr": "Le miroir est dans la salle de bains.",
      "uz": "Ko'zgu hammomda.",
      "uzAlt": [
       "Ko'zgu yuvinish xonasida"
      ]
     }
    ]
   },
   {
    "id": "u7l4",
    "title": "Joylashuv va tartib",
    "words": [
     {
      "fr": "le jardin",
      "uz": "bog'",
      "emoji": "🌳",
      "alt": [
       "hovli"
      ]
     },
     {
      "fr": "la plante",
      "uz": "o'simlik",
      "emoji": "🌱",
      "alt": [
       "gul"
      ]
     },
     {
      "fr": "le chat",
      "uz": "mushuk",
      "emoji": "🐱",
      "alt": [
       "mushukcha"
      ]
     },
     {
      "fr": "le chien",
      "uz": "it",
      "emoji": "🐶",
      "alt": [
       "kuchuk"
      ]
     },
     {
      "fr": "la photo",
      "uz": "surat",
      "emoji": "🖼️",
      "alt": [
       "foto"
      ]
     },
     {
      "fr": "la clé",
      "uz": "kalit",
      "emoji": "🔑",
      "alt": [
       "qulf kaliti"
      ]
     },
     {
      "fr": "le sac",
      "uz": "sumka",
      "emoji": "👜",
      "alt": [
       "xalta"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le chat est sur le canapé.",
      "uz": "Mushuk divanda.",
      "uzAlt": [
       "Mushuk divan ustida o'tiribdi"
      ]
     },
     {
      "fr": "Il y a un jardin derrière la maison.",
      "uz": "Uyning orqasida bog' bor.",
      "uzAlt": [
       "Uy ortida bog' mavjud"
      ]
     },
     {
      "fr": "Le chien est devant la porte.",
      "uz": "It eshikning oldida.",
      "uzAlt": [
       "Kuchuk eshik oldida turibdi"
      ]
     },
     {
      "fr": "Il y a une plante dans le salon.",
      "uz": "Mehmonxonada o'simlik bor.",
      "uzAlt": [
       "Mehmonxonada gul bor"
      ]
     },
     {
      "fr": "Le livre est sous la table.",
      "uz": "Kitob stolning tagida.",
      "uzAlt": [
       "Kitob stol ostida yotibdi"
      ]
     },
     {
      "fr": "La clé est dans le sac.",
      "uz": "Kalit sumkada.",
      "uzAlt": [
       "Kalit xaltaning ichida"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u8",
  "level": "A1",
  "title": "Kiyim va ranglar",
  "description": "Kiyimlar, ranglar, do'konda kiyim tanlash",
  "color": "#5EEAD4",
  "guide": [
   {
    "title": "Sifat moslashuvi",
    "text": "Fransuz tilida sifatlar otning jinsi va soniga moslashadi. Ayol jinsidagi otlar uchun sifatga '-e' qo'shiladi, ko'plik uchun esa '-s'.",
    "examples": [
     [
      "le pantalon est bleu",
      "shim ko'k"
     ],
     [
      "la robe est bleue",
      "ko'ylak ko'k"
     ]
    ]
   },
   {
    "title": "Ko'rsatish olmoshlari",
    "text": "'ce' erkak jinsdagi birlik, 'cette' ayol jinsdagi birlik, 'ces' esa ko'plikdagi otlar uchun ishlatiladi.",
    "examples": [
     [
      "ce manteau",
      "bu palto"
     ],
     [
      "cette chemise",
      "bu ko'ylak"
     ]
    ]
   },
   {
    "title": "Do'konda xarid qilish",
    "text": "Do'konda narx so'rash va kiyim tanlash uchun 'Combien ça coûte?' va 'Je voudrais' kabi iboralar ishlatiladi.",
    "examples": [
     [
      "Combien ça coûte ?",
      "Bu qancha turadi?"
     ],
     [
      "Je cherche une jupe",
      "Men yubka qidiryapman"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u8l1",
    "title": "Asosiy kiyimlar",
    "words": [
     {
      "fr": "le pantalon",
      "uz": "shim",
      "emoji": "👖"
     },
     {
      "fr": "la chemise",
      "uz": "ko'ylak",
      "emoji": "👔",
      "alt": [
       "erkaklar ko'ylagi"
      ]
     },
     {
      "fr": "la robe",
      "uz": "libos",
      "emoji": "👗",
      "alt": [
       "ayollar ko'ylagi"
      ]
     },
     {
      "fr": "le manteau",
      "uz": "palto",
      "emoji": "🧥"
     },
     {
      "fr": "les chaussures",
      "uz": "poyabzal",
      "emoji": "👞",
      "alt": [
       "tufli",
       "etik"
      ]
     },
     {
      "fr": "le chapeau",
      "uz": "shlyapa",
      "emoji": "👒",
      "alt": [
       "bosh kiyim"
      ]
     },
     {
      "fr": "la jupe",
      "uz": "yubka",
      "emoji": "👗"
     },
     {
      "fr": "le pull",
      "uz": "sviter",
      "emoji": "🧶",
      "alt": [
       "jumper"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali porte un pantalon bleu.",
      "uz": "Ali ko'k shim kiyib olgan.",
      "uzAlt": [
       "Ali ko'k shim kiygan."
      ]
     },
     {
      "fr": "Sophie aime cette robe rouge.",
      "uz": "Sofi bu qizil libosni yoqtiradi.",
      "uzAlt": [
       "Sofi bu qizil ko'ylakni yaxshi ko'radi."
      ]
     },
     {
      "fr": "Mon manteau est chaud.",
      "uz": "Mening paltom iliq.",
      "uzAlt": [
       "Mening paltom issiq."
      ]
     },
     {
      "fr": "Où sont mes chaussures ?",
      "uz": "Mening poyabzallarim qayerda?",
      "uzAlt": [
       "Tuflilarim qayerda?"
      ]
     },
     {
      "fr": "Ce chapeau est très beau.",
      "uz": "Bu shlyapa juda chiroyli.",
      "uzAlt": [
       "Bu bosh kiyim juda go'zal."
      ]
     },
     {
      "fr": "Malika cherche une belle jupe.",
      "uz": "Malika chiroyli yubka qidirmoqda.",
      "uzAlt": [
       "Malika chiroyli yubka qidiryapti."
      ]
     }
    ]
   },
   {
    "id": "u8l2",
    "title": "Ranglar olami",
    "words": [
     {
      "fr": "rouge",
      "uz": "qizil",
      "emoji": "🔴"
     },
     {
      "fr": "bleu",
      "uz": "ko'k",
      "emoji": "🔵",
      "alt": [
       "havorang"
      ]
     },
     {
      "fr": "vert",
      "uz": "yashil",
      "emoji": "🟢"
     },
     {
      "fr": "jaune",
      "uz": "sariq",
      "emoji": "🟡"
     },
     {
      "fr": "noir",
      "uz": "qora",
      "emoji": "⚫"
     },
     {
      "fr": "blanc",
      "uz": "oq",
      "emoji": "⚪"
     },
     {
      "fr": "gris",
      "uz": "kulrang",
      "emoji": "🔘"
     },
     {
      "fr": "marron",
      "uz": "jigarrang",
      "emoji": "🟤"
     }
    ],
    "sentences": [
     {
      "fr": "Le ciel est bleu aujourd'hui.",
      "uz": "Bugun osmon ko'k.",
      "uzAlt": [
       "Bugungi osmon moviy."
      ]
     },
     {
      "fr": "Pierre a une voiture noire.",
      "uz": "Piyerning qora mashinasi bor.",
      "uzAlt": [
       "Piyerda qora avtomobil bor."
      ]
     },
     {
      "fr": "La chemise blanche est propre.",
      "uz": "Oq ko'ylak toza.",
      "uzAlt": [
       "Oq erkaklar ko'ylagi ozoda."
      ]
     },
     {
      "fr": "J'aime ce pull vert.",
      "uz": "Men bu yashil sviterni yaxshi ko'raman.",
      "uzAlt": [
       "Menga bu yashil jumper yoqadi."
      ]
     },
     {
      "fr": "Ces fleurs jaunes sont belles.",
      "uz": "Bu sariq gullar chiroyli.",
      "uzAlt": [
       "Ushbu sariq gullar go'zal."
      ]
     },
     {
      "fr": "Le chat gris dort sur le tapis.",
      "uz": "Kulrang mushuk gilam ustida uxlamoqda.",
      "uzAlt": [
       "Kulrang mushuk gilamda uxlaryapti."
      ]
     }
    ]
   },
   {
    "id": "u8l3",
    "title": "Do'konda xarid",
    "words": [
     {
      "fr": "le magasin de vêtements",
      "uz": "kiyim do'koni",
      "emoji": "🏬",
      "alt": [
       "do'kon"
      ]
     },
     {
      "fr": "la taille",
      "uz": "o'lcham",
      "emoji": "📏",
      "alt": [
       "razmer"
      ]
     },
     {
      "fr": "le prix",
      "uz": "narx",
      "emoji": "🏷️",
      "alt": [
       "qiymat"
      ]
     },
     {
      "fr": "l'argent",
      "uz": "pul",
      "emoji": "💶",
      "alt": [
       "mablag'"
      ]
     },
     {
      "fr": "la carte",
      "uz": "karta",
      "emoji": "💳",
      "alt": [
       "bank kartasi"
      ]
     },
     {
      "fr": "payer",
      "uz": "to'lamoq",
      "emoji": "💸",
      "alt": [
       "haqi to'lamoq"
      ]
     },
     {
      "fr": "essayer",
      "uz": "sinab ko'rmoq",
      "emoji": "🧍",
      "alt": [
       "kiiyib ko'rmoq"
      ]
     },
     {
      "fr": "cher",
      "uz": "qimmat",
      "emoji": "💰"
     }
    ],
    "sentences": [
     {
      "fr": "Je vais au magasin de vêtements.",
      "uz": "Men kiyim do'koniga boryapman.",
      "uzAlt": [
       "Kiyim do'koniga ketayotganman."
      ]
     },
     {
      "fr": "Quelle est votre taille ?",
      "uz": "Sizning o'lchamingiz qanday?",
      "uzAlt": [
       "O'lchamingiz nechchilik?"
      ]
     },
     {
      "fr": "Ce pantalon n'est pas cher.",
      "uz": "Bu shim qimmat emas.",
      "uzAlt": [
       "Ushbu shim qimmat turmaydi."
      ]
     },
     {
      "fr": "Puis-je essayer cette robe ?",
      "uz": "Bu libosni sinab ko'rsam bo'ladimi?",
      "uzAlt": [
       "Ushbu ko'ylakni kiyib ko'rsam bo'ladimi?"
      ]
     },
     {
      "fr": "Je paye avec ma carte.",
      "uz": "Men kartam bilan to'layapman.",
      "uzAlt": [
       "Bank kartam orqali to'lov qilaman."
      ]
     },
     {
      "fr": "Combien coûte ce manteau ?",
      "uz": "Bu palto qancha turadi?",
      "uzAlt": [
       "Ushbu paltoning narxi qancha?"
      ]
     }
    ]
   },
   {
    "id": "u8l4",
    "title": "Kiyim tanlaymiz",
    "words": [
     {
      "fr": "le costume",
      "uz": "kostyum",
      "emoji": "🤵",
      "alt": [
       "erkaklar kiyimi"
      ]
     },
     {
      "fr": "la cravate",
      "uz": "galstuk",
      "emoji": "👔",
      "alt": [
       "bo'yinbog'"
      ]
     },
     {
      "fr": "les chaussettes",
      "uz": "paypoq",
      "emoji": "🧦",
      "alt": [
       "paypoqlar"
      ]
     },
     {
      "fr": "l'écharpe",
      "uz": "sharf",
      "emoji": "🧣",
      "alt": [
       "bo'yin sharfi"
      ]
     },
     {
      "fr": "les gants",
      "uz": "qo'lqop",
      "emoji": "🧤",
      "alt": [
       "qo'lqoplar"
      ]
     },
     {
      "fr": "la poche",
      "uz": "cho'ntak",
      "emoji": "👝"
     },
     {
      "fr": "porter",
      "uz": "kiymoq",
      "emoji": "🧥",
      "alt": [
       "ustiga kiyib yurmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali porte un beau costume noir.",
      "uz": "Ali chiroyli qora kostyum kiygan.",
      "uzAlt": [
       "Ali kelishgan qora kostyumda."
      ]
     },
     {
      "fr": "Cette cravate rouge est parfaite.",
      "uz": "Bu qizil galstuk mukammal.",
      "uzAlt": [
       "Ushbu qizil bo'yinbog' zo'r."
      ]
     },
     {
      "fr": "Je cherche mes chaussettes blanches.",
      "uz": "Men oq paypoqlarimni qidiryapman.",
      "uzAlt": [
       "Oq paypoqlarimni qidirayotgan edim."
      ]
     },
     {
      "fr": "Il fait froid, mets ton écharpe.",
      "uz": "Havo sovuq, sharfingni taq.",
      "uzAlt": [
       "Sovuq bo'lyapti, bo'yinbog'ingni o'rab ol."
      ]
     },
     {
      "fr": "J'ai des gants dans ma poche.",
      "uz": "Cho'ntagimda qo'lqoplarim bor.",
      "uzAlt": [
       "Mening cho'ntagimda qo'lqop bor."
      ]
     },
     {
      "fr": "Sophie porte un pull jaune.",
      "uz": "Sofi sariq sviter kiyib olgan.",
      "uzAlt": [
       "Sofi sariq jumper kiygan."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u9",
  "level": "A1",
  "title": "Xarid",
  "description": "Do'kon, bozor, narxlar, pul, 7 dan 100 gacha sonlar",
  "color": "#60A5FA",
  "guide": [
   {
    "title": "Narxni so'rash",
    "text": "Fransuz tilida narxni bilish uchun «c'est combien ?» iborasidan foydalanamiz. Bu «bu qancha turadi?» degan ma'noni anglatadi.",
    "examples": [
     [
      "C'est combien ?",
      "Bu qancha turadi?"
     ],
     [
      "Le livre coûte combien ?",
      "Kitob qancha turadi?"
     ]
    ]
   },
   {
    "title": "Xohish bildirish",
    "text": "Biror narsa sotib olishni istaganda «je voudrais» fe'lini ishlatamiz. Bu «men xohlagan bo'lar edim» yoki «menga kerak» deganidir.",
    "examples": [
     [
      "Je voudrais une pomme.",
      "Men olma xohlayman."
     ],
     [
      "Je voudrais payer.",
      "Men to'lamoqchiman."
     ]
    ]
   },
   {
    "title": "Sonlar va miqdor",
    "text": "Xarid paytida sonlarni va «combien» (qancha) so'zini ishlatish muhimdir. Masalan, o'nta olma so'rash uchun sonlar yordam beradi.",
    "examples": [
     [
      "Combien de pommes ?",
      "Qancha olma?"
     ],
     [
      "Dix euros.",
      "O'n yevro."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u9l1",
    "title": "Bozorda",
    "words": [
     {
      "fr": "le marché",
      "uz": "bozor",
      "emoji": "🛒",
      "alt": [
       "savdo bozori"
      ]
     },
     {
      "fr": "l'euro",
      "uz": "yevro",
      "emoji": "💶",
      "alt": [
       "valyuta"
      ]
     },
     {
      "fr": "le client",
      "uz": "mijoz",
      "emoji": "🙋‍♂",
      "alt": [
       "xaridor"
      ]
     },
     {
      "fr": "le vendeur",
      "uz": "sotuvchi",
      "emoji": "👨‍\ud83d",
      "alt": [
       "do'konchi"
      ]
     },
     {
      "fr": "la monnaie",
      "uz": "qaytim",
      "emoji": "🪙",
      "alt": [
       "mayda pul"
      ]
     },
     {
      "fr": "le panier",
      "uz": "savat",
      "emoji": "🧺",
      "alt": [
       "xarid savati"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali va au marché.",
      "uz": "Ali bozorga boryapti.",
      "uzAlt": [
       "Ali bozorga bormoqda."
      ]
     },
     {
      "fr": "Le client veut payer.",
      "uz": "Mijoz to'lamoqchi.",
      "uzAlt": [
       "Xaridor pul to'lamoqda."
      ]
     },
     {
      "fr": "Le vendeur donne la monnaie.",
      "uz": "Sotuvchi qaytimni beryapti.",
      "uzAlt": [
       "Sotuvchi qaytimni qaytarmoqda."
      ]
     },
     {
      "fr": "Sophie prend le panier.",
      "uz": "Sofi savatni olyapti.",
      "uzAlt": [
       "Sofi savatni qo'liga olyapti."
      ]
     },
     {
      "fr": "Quel est le prix ?",
      "uz": "Narxi qancha?",
      "uzAlt": [
       "Bu qancha turadi?"
      ]
     },
     {
      "fr": "Dix euros, s'il vous plaît.",
      "uz": "O'n yevro, iltimos.",
      "uzAlt": [
       "Iltimos, o'n yevro."
      ]
     }
    ]
   },
   {
    "id": "u9l2",
    "title": "Do'konda",
    "words": [
     {
      "fr": "la caisse",
      "uz": "kassa",
      "emoji": "🛃",
      "alt": [
       "to'lov joyi"
      ]
     },
     {
      "fr": "le ticket",
      "uz": "chek",
      "emoji": "🧾",
      "alt": [
       "kassa cheki"
      ]
     },
     {
      "fr": "chercher",
      "uz": "qidirmoq",
      "emoji": "🔍",
      "alt": [
       "izlamoq"
      ]
     },
     {
      "fr": "trouver",
      "uz": "topmoq",
      "emoji": "💡",
      "alt": [
       "kashf qilmoq"
      ]
     },
     {
      "fr": "choisir",
      "uz": "tanlamoq",
      "emoji": "✔️",
      "alt": [
       "saralmoq"
      ]
     },
     {
      "fr": "fermer",
      "uz": "yopmoq",
      "emoji": "🚪",
      "alt": [
       "berkitmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le magasin est ouvert.",
      "uz": "Do'kon ochiq.",
      "uzAlt": [
       "Do'kon ishlayapti."
      ]
     },
     {
      "fr": "Malika va à la caisse.",
      "uz": "Malika kassaga boryapti.",
      "uzAlt": [
       "Malika kassaga tomon bormoqda."
      ]
     },
     {
      "fr": "Je veux choisir un sac.",
      "uz": "Men xalta tanlamoqchiman.",
      "uzAlt": [
       "Men xalta tanlashni xohlayman."
      ]
     },
     {
      "fr": "Pierre cherche le ticket.",
      "uz": "Pyer chekni qidiryapti.",
      "uzAlt": [
       "Pyer chekni izlamoqda."
      ]
     },
     {
      "fr": "Elle trouve le bon prix.",
      "uz": "U to'g'ri narxni topyapti.",
      "uzAlt": [
       "U yaxshi narxni topmoqda."
      ]
     },
     {
      "fr": "Le vendeur ferme le magasin.",
      "uz": "Sotuvchi do'konni yopyapti.",
      "uzAlt": [
       "Sotuvchi do'konni berkitmoqda."
      ]
     }
    ]
   },
   {
    "id": "u9l3",
    "title": "Sonlar 7 dan 100 gacha",
    "words": [
     {
      "fr": "vingt",
      "uz": "yigirma",
      "emoji": "2️⃣0",
      "alt": [
       "son yigirma"
      ]
     },
     {
      "fr": "cinquante",
      "uz": "ellik",
      "emoji": "5️⃣0",
      "alt": [
       "son ellik"
      ]
     },
     {
      "fr": "soixante",
      "uz": "oltmish",
      "emoji": "6️⃣0",
      "alt": [
       "son oltmish"
      ]
     },
     {
      "fr": "soixante-dix",
      "uz": "etmish",
      "emoji": "7️⃣0",
      "alt": [
       "son etmish"
      ]
     },
     {
      "fr": "quatre-vingts",
      "uz": "sakson",
      "emoji": "8️⃣0",
      "alt": [
       "son sakson"
      ]
     },
     {
      "fr": "cent",
      "uz": "yuz",
      "emoji": "💯",
      "alt": [
       "son yuz"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le livre coûte dix euros.",
      "uz": "Kitob o'n yevro turadi.",
      "uzAlt": [
       "Bu kitob o'n yevro."
      ]
     },
     {
      "fr": "Il a vingt pommes.",
      "uz": "Unda yigirma ta olma bor.",
      "uzAlt": [
       "U yigirma olma sotib oldi."
      ]
     },
     {
      "fr": "Le pantalon coûte cinquante euros.",
      "uz": "Shim ellik yevro turadi.",
      "uzAlt": [
       "Bu shim ellik yevro."
      ]
     },
     {
      "fr": "Sophie achète cent bonbons.",
      "uz": "Sofi yuzta qand sotib olyapti.",
      "uzAlt": [
       "Sofi yuz shirinlik olmoqda."
      ]
     },
     {
      "fr": "Soixante-dix euros, c'est bon.",
      "uz": "Etmish yevro, bu yaxshi.",
      "uzAlt": [
       "Etmish yevro bo'ladi."
      ]
     },
     {
      "fr": "Quatre-vingts clients entrent.",
      "uz": "Sakson nafar mijoz kirib kelyapti.",
      "uzAlt": [
       "Sakson xaridor kiryapti."
      ]
     }
    ]
   },
   {
    "id": "u9l4",
    "title": "Narx va miqdor",
    "words": [
     {
      "fr": "combien",
      "uz": "qancha",
      "emoji": "❓",
      "alt": [
       "nechtadan"
      ]
     },
     {
      "fr": "bon marché",
      "uz": "arzon",
      "emoji": "🏷️",
      "alt": [
       "past narxli"
      ]
     },
     {
      "fr": "vendre",
      "uz": "sotmoq",
      "emoji": "🤝",
      "alt": [
       "savdo qilmoq"
      ]
     },
     {
      "fr": "acheter",
      "uz": "sotib olmoq",
      "emoji": "🛍️",
      "alt": [
       "xarid qilmoq"
      ]
     },
     {
      "fr": "donner",
      "uz": "bermoq",
      "emoji": "🤲",
      "alt": [
       "taqdim etmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Combien coûte cette robe ?",
      "uz": "Bu ko'ylak qancha turadi?",
      "uzAlt": [
       "Bu ko'ylakning narxi qancha?"
      ]
     },
     {
      "fr": "Ce livre est très cher.",
      "uz": "Bu kitob juda qimmat.",
      "uzAlt": [
       "Kitobning narxi qimmat."
      ]
     },
     {
      "fr": "Le pain est bon marché.",
      "uz": "Non arzon.",
      "uzAlt": [
       "Nonning narxi arzon."
      ]
     },
     {
      "fr": "Ali veut payer par carte.",
      "uz": "Ali karta orqali to'lamoqchi.",
      "uzAlt": [
       "Ali plastik karta bilan to'laydi."
      ]
     },
     {
      "fr": "Malika a beaucoup d'argent.",
      "uz": "Malikada ko'p pul bor.",
      "uzAlt": [
       "Malikaning puli ko'p."
      ]
     },
     {
      "fr": "Le vendeur vend les fruits.",
      "uz": "Sotuvchi mevalarni sotyapti.",
      "uzAlt": [
       "Sotuvchi meva sotmoqda."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u10",
  "level": "A1",
  "title": "Tana va salomatlik",
  "description": "Tana a'zolari, kasalliklar, shifokorda",
  "color": "#A78BFA",
  "guide": [
   {
    "title": "Avoir mal à",
    "text": "Tana a'zolarida og'riq borligini bildirish uchun «avoir mal à» fe'l birikmasi ishlatiladi. Jins va songa qarab «à la», «au», «à l'», «aux» kabi old ko'makchilar qo'shiladi.",
    "examples": [
     [
      "J'ai mal à la tête.",
      "Boshim og'riyapti."
     ],
     [
      "Tu as mal au dos.",
      "Beling og'riyapti."
     ]
    ]
   },
   {
    "title": "Jismoniy holatlar",
    "text": "O'zbek tilidan farqli o'laroq, fransuz tilida ochlik, tashnalik, issiq va sovuqni ifodalash uchun «avoir» (ega bo'lmoq) fe'li ishlatiladi.",
    "examples": [
     [
      "J'ai faim.",
      "Qornim och."
     ],
     [
      "Elle a soif.",
      "Suvsagan."
     ]
    ]
   },
   {
    "title": "Shifokorda",
    "text": "Shifokor qabulida bo'lganda o'z holatingizni va og'riyotgan joylarni tushuntirish uchun maxsus tibbiy atamalar va «avoir mal à» birikmasi juda qo'l keladi.",
    "examples": [
     [
      "Le médecin aide Pierre.",
      "Shifokor Pierrga yordam beryapti."
     ],
     [
      "Sophie a mal à la gorge.",
      "Sofiyaning tomog'i og'riyapti."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u10l1",
    "title": "Tana a'zolari",
    "words": [
     {
      "fr": "la tête",
      "uz": "bosh",
      "emoji": "🗣️",
      "alt": [
       "kalla"
      ]
     },
     {
      "fr": "le bras",
      "uz": "qo'l",
      "emoji": "💪",
      "alt": [
       "elka"
      ]
     },
     {
      "fr": "la jambe",
      "uz": "oyoq",
      "emoji": "🦵",
      "alt": [
       "boldir"
      ]
     },
     {
      "fr": "le dos",
      "uz": "bel",
      "emoji": "🔙",
      "alt": [
       "orqa"
      ]
     },
     {
      "fr": "le ventre",
      "uz": "qorin",
      "emoji": "🤰",
      "alt": [
       "oshqozon"
      ]
     },
     {
      "fr": "la main",
      "uz": "kaft",
      "emoji": "✋",
      "alt": [
       "qo'l panjasi"
      ]
     },
     {
      "fr": "le pied",
      "uz": "tovon",
      "emoji": "🦶",
      "alt": [
       "oyoq panjasi"
      ]
     },
     {
      "fr": "le cou",
      "uz": "bo'yin",
      "emoji": "🧣",
      "alt": [
       "halqum"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'ai mal à la tête.",
      "uz": "Boshim og'riyapti.",
      "uzAlt": [
       "Mening boshim og'riyapti"
      ]
     },
     {
      "fr": "Tu as mal au dos.",
      "uz": "Beling og'riyapti.",
      "uzAlt": [
       "Sening beling og'riyapti"
      ]
     },
     {
      "fr": "Il a mal à la jambe.",
      "uz": "Uning oyog'i og'riyapti.",
      "uzAlt": [
       "Uning boldiri og'riyapti"
      ]
     },
     {
      "fr": "Elle a mal au ventre.",
      "uz": "Uning qorni og'riyapti.",
      "uzAlt": [
       "Qorni og'riyapti"
      ]
     },
     {
      "fr": "Ali a mal au bras.",
      "uz": "Alining qo'li og'riyapti.",
      "uzAlt": [
       "Alining qo'l qismi og'riyapti"
      ]
     },
     {
      "fr": "Malika a mal au cou.",
      "uz": "Malikaning bo'yni og'riyapti.",
      "uzAlt": [
       "Bo'yni og'riyapti Malikaning"
      ]
     }
    ]
   },
   {
    "id": "u10l2",
    "title": "Yuz va sezgilar",
    "words": [
     {
      "fr": "le visage",
      "uz": "yuz",
      "emoji": "😊",
      "alt": [
       "chehra"
      ]
     },
     {
      "fr": "l'œil",
      "uz": "ko'z",
      "emoji": "👁️",
      "alt": [
       "chashm"
      ]
     },
     {
      "fr": "le nez",
      "uz": "burun",
      "emoji": "👃",
      "alt": [
       "dimog'"
      ]
     },
     {
      "fr": "la bouche",
      "uz": "og'iz",
      "emoji": "👄",
      "alt": [
       "lab"
      ]
     },
     {
      "fr": "l'oreille",
      "uz": "quloq",
      "emoji": "👂",
      "alt": [
       "eshitish a'zosi"
      ]
     },
     {
      "fr": "les cheveux",
      "uz": "soch",
      "emoji": "💇",
      "alt": [
       "qil"
      ]
     },
     {
      "fr": "la dent",
      "uz": "tish",
      "emoji": "🦷",
      "alt": [
       "azob tish"
      ]
     },
     {
      "fr": "le cœur",
      "uz": "yurak",
      "emoji": "❤️",
      "alt": [
       "dil"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Sophie a mal aux yeux.",
      "uz": "Sofiyaning ko'zlari og'riyapti.",
      "uzAlt": [
       "Ko'zlari og'riyapti Sofiyaning"
      ]
     },
     {
      "fr": "Pierre a mal aux dents.",
      "uz": "Pierrning tishlari og'riyapti.",
      "uzAlt": [
       "Pierrning tishi og'riyapti"
      ]
     },
     {
      "fr": "Tu as mal à l'oreille.",
      "uz": "Qulog'ing og'riyapti.",
      "uzAlt": [
       "Sening qulog'ing og'riyapti"
      ]
     },
     {
      "fr": "J'ai mal au cœur.",
      "uz": "Yuragim og'riyapti.",
      "uzAlt": [
       "Ko'nglim behuzur bo'lyapti"
      ]
     },
     {
      "fr": "Ali a de beaux cheveux.",
      "uz": "Alining chiroyli sochlari bor.",
      "uzAlt": [
       "Ali chiroyli sochga ega"
      ]
     },
     {
      "fr": "Malika a un beau visage.",
      "uz": "Malikaning chiroyli yuzi bor.",
      "uzAlt": [
       "Malika chiroyli chehrali"
      ]
     }
    ]
   },
   {
    "id": "u10l3",
    "title": "Holatlar",
    "words": [
     {
      "fr": "avoir faim",
      "uz": "och bo'lmoq",
      "emoji": "🍽️",
      "alt": [
       "qorni ochmoq"
      ]
     },
     {
      "fr": "avoir soif",
      "uz": "suvsamoq",
      "emoji": "🥤",
      "alt": [
       "tashna bo'lmoq"
      ]
     },
     {
      "fr": "avoir chaud",
      "uz": "issig'i kelmoq",
      "emoji": "🥵",
      "alt": [
       "issiqimoq"
      ]
     },
     {
      "fr": "avoir froid",
      "uz": "sovuq qotmoq",
      "emoji": "🥶",
      "alt": [
       "muzlamoq"
      ]
     },
     {
      "fr": "fatigué",
      "uz": "charchagan",
      "emoji": "🥱",
      "alt": [
       "holdan toygan"
      ]
     },
     {
      "fr": "malade",
      "uz": "kasal",
      "emoji": "🤒",
      "alt": [
       "betob"
      ]
     },
     {
      "fr": "en forme",
      "uz": "tetik",
      "emoji": "💪",
      "alt": [
       "sog'lom"
      ]
     },
     {
      "fr": "la santé",
      "uz": "salomatlik",
      "emoji": "🏥",
      "alt": [
       "tibbiyot"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'ai faim et soif.",
      "uz": "Qornim och va suvsaganman.",
      "uzAlt": [
       "Och va tashnaman"
      ]
     },
     {
      "fr": "Tu as froid ?",
      "uz": "Sovuq qotyapsanmi?",
      "uzAlt": [
       "Sovug'ing qotyaptimi?"
      ]
     },
     {
      "fr": "Il a chaud au soleil.",
      "uz": "Uning quyoshda issig'i kelyapti.",
      "uzAlt": [
       "U quyoshda qiziyapti"
      ]
     },
     {
      "fr": "Sophie est fatiguée.",
      "uz": "Sofiya charchagan.",
      "uzAlt": [
       "Sofiya holdan toygan"
      ]
     },
     {
      "fr": "Pierre est malade.",
      "uz": "Pierr kasal.",
      "uzAlt": [
       "Pierr betob"
      ]
     },
     {
      "fr": "Nous sommes en forme.",
      "uz": "Biz tetikmiz.",
      "uzAlt": [
       "Biz sog'lom va tetikmiz"
      ]
     }
    ]
   },
   {
    "id": "u10l4",
    "title": "Shifokorda",
    "words": [
     {
      "fr": "le médecin",
      "uz": "shifokor",
      "emoji": "👨‍⚕",
      "alt": [
       "doktor"
      ]
     },
     {
      "fr": "l'hôpital",
      "uz": "shifoxona",
      "emoji": "🏥",
      "alt": [
       "kasalxona"
      ]
     },
     {
      "fr": "la pharmacie",
      "uz": "dorixona",
      "emoji": "💊",
      "alt": [
       "dori do'koni"
      ]
     },
     {
      "fr": "le médicament",
      "uz": "dori",
      "emoji": "🧪",
      "alt": [
       "tibbiy vosita"
      ]
     },
     {
      "fr": "la fièvre",
      "uz": "isitma",
      "emoji": "🌡️",
      "alt": [
       "harorat"
      ]
     },
     {
      "fr": "le rhume",
      "uz": "shamollash",
      "emoji": "🤧",
      "alt": [
       "tumov"
      ]
     },
     {
      "fr": "la toux",
      "uz": "yo'tal",
      "emoji": "😷",
      "alt": [
       "aksiriq"
      ]
     },
     {
      "fr": "l'infirmier",
      "uz": "hamshira",
      "emoji": "👩‍⚕",
      "alt": [
       "feldsher"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali va à l'hôpital.",
      "uz": "Ali shifoxonaga boryapti.",
      "uzAlt": [
       "Ali kasalxonaga ketayotir"
      ]
     },
     {
      "fr": "Malika a de la fièvre.",
      "uz": "Malikaning isitmasi bor.",
      "uzAlt": [
       "Malikaning harorati ko'tarilgan"
      ]
     },
     {
      "fr": "Pierre a un rhume.",
      "uz": "Pierr shamollagan.",
      "uzAlt": [
       "Pierrda shamollash bor"
      ]
     },
     {
      "fr": "Le médecin donne un médicament.",
      "uz": "Shifokor dori beryapti.",
      "uzAlt": [
       "Doktor dori taqdim etyapti"
      ]
     },
     {
      "fr": "Sophie achète le médicament à la pharmacie.",
      "uz": "Sofiya dorixonadan dori sotib olyapti.",
      "uzAlt": [
       "Sofiya dori xarid qilyapti dorixonadan"
      ]
     },
     {
      "fr": "L'infirmier aide le malade.",
      "uz": "Hamshira kasalga yordam beryapti.",
      "uzAlt": [
       "Hamshira bemorni qo'llab-quvvatlayapti"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u11",
  "level": "A2",
  "title": "Kun tartibi",
  "description": "Ertalabdan kechgacha kundalik ishlar",
  "color": "#34D399",
  "guide": [
   {
    "title": "O'zlik fe'llari",
    "text": "Fransuz tilida o'zlik fe'llari (verbes pronominaux) ish-harakat o'ziga qaratilganini bildiradi va ulardan oldin 'se' yoki unli harfdan oldin 's'' olmoshligi keladi.",
    "examples": [
     [
      "Je me lève tôt.",
      "Men erta turaman."
     ],
     [
      "Tu te laves vite.",
      "Sen tez yuvinasan."
     ]
    ]
   },
   {
    "title": "Kun tartibi fe'llari",
    "text": "Ertalabki yumushlarni ifodalash uchun se lever (turmoq), se laver (yuvinmoq) va s'habiller (kiyinmoq) kabi fe'llar qo'llaniladi.",
    "examples": [
     [
      "Sophie s'habille maintenant.",
      "Sofi hozir kiyinyapti."
     ],
     [
      "Pierre se couche tard.",
      "Pyer kech yotadi."
     ]
    ]
   },
   {
    "title": "O'zlik olmoshlari tuslanishi",
    "text": "O'zlik olmoshlari shaxslarga ko'ra o'zgaradi: je me, tu te, il/elle se, nous nous, vous vous, ils/elles se.",
    "examples": [
     [
      "Je me couche.",
      "Men yotaman."
     ],
     [
      "Tu te lèves ?",
      "Sen turasanmi?"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u11l1",
    "title": "Ertalabki uyg'onish",
    "words": [
     {
      "fr": "se lever",
      "uz": "o'rindan turmoq",
      "emoji": "🛏️",
      "alt": [
       "turmoq",
       "o'rnidan turmoq"
      ]
     },
     {
      "fr": "le réveil",
      "uz": "budilnik",
      "emoji": "⏰",
      "alt": [
       "uyg'otgich"
      ]
     },
     {
      "fr": "se raser",
      "uz": "soqol olmoq",
      "emoji": "🪒",
      "alt": [
       "qirish"
      ]
     },
     {
      "fr": "le peignoir",
      "uz": "xalat",
      "emoji": "👘",
      "alt": [
       "hammom xalati"
      ]
     },
     {
      "fr": "la serviette",
      "uz": "sochiq",
      "emoji": "🧴",
      "alt": [
       "qo'l sochiq"
      ]
     },
     {
      "fr": "le savon",
      "uz": "sovun",
      "emoji": "🧼",
      "alt": [
       "qo'l sovuni"
      ]
     },
     {
      "fr": "le shampoing",
      "uz": "shampun",
      "emoji": "🧴",
      "alt": [
       "soch yuvish vositasi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je me lève tôt le matin.",
      "uz": "Men ertalab erta turaman.",
      "uzAlt": [
       "Ertalab erta turaman.",
       "Men erta o'rnimdan turaman."
      ]
     },
     {
      "fr": "Ali se lève avec le réveil.",
      "uz": "Ali budilnik bilan turadi.",
      "uzAlt": [
       "Ali uyg'otgich bilan o'rnidan turadi."
      ]
     },
     {
      "fr": "Tu te lèves tard le dimanche.",
      "uz": "Sen yakshanba kuni kech turasan.",
      "uzAlt": [
       "Siz yakshanba kuni kech turasiz."
      ]
     },
     {
      "fr": "Malika prend une douche rapide.",
      "uz": "Malika tezda dush qabul qiladi.",
      "uzAlt": [
       "Malika tez cho'minadi."
      ]
     },
     {
      "fr": "Pierre se rase dans la salle de bains.",
      "uz": "Pyer hammomda soqol oladi.",
      "uzAlt": [
       "Pyer vanna xonasida soqolini qiridi."
      ]
     },
     {
      "fr": "Sophie utilise le savon et le shampoing.",
      "uz": "Sofi sovun va shampun ishlatadi.",
      "uzAlt": [
       "Sofi shampun va sovunni ishlatmoqda."
      ]
     }
    ]
   },
   {
    "id": "u11l2",
    "title": "Yuvinish va kiyinish",
    "words": [
     {
      "fr": "se laver",
      "uz": "yuvinmoq",
      "emoji": "🚿",
      "alt": [
       "tozalanmoq"
      ]
     },
     {
      "fr": "s'habiller",
      "uz": "kiyinmoq",
      "emoji": "👕",
      "alt": [
       "ust-bosh kiyish"
      ]
     },
     {
      "fr": "le peigne",
      "uz": "taroq",
      "emoji": "💇",
      "alt": [
       "soch taroq"
      ]
     },
     {
      "fr": "se coiffer",
      "uz": "soch turmaklamoq",
      "emoji": "💇‍♀",
      "alt": [
       "soch taramoq"
      ]
     },
     {
      "fr": "le parfum",
      "uz": "atir",
      "emoji": "🌸",
      "alt": [
       "pafur"
      ]
     },
     {
      "fr": "se maquiller",
      "uz": "pardoz qilmoq",
      "emoji": "💄",
      "alt": [
       "bo'yash"
      ]
     },
     {
      "fr": "le rasoir",
      "uz": "ustara",
      "emoji": "🪒",
      "alt": [
       "soqol olish mashinasi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je me lave tous les matins.",
      "uz": "Men har kuni ertalab yuvinaman.",
      "uzAlt": [
       "Har kuni ertalab yuvinaman."
      ]
     },
     {
      "fr": "Tu t'habilles très vite.",
      "uz": "Sen juda tez kiyinasan.",
      "uzAlt": [
       "Siz juda tez kiyinasiz."
      ]
     },
     {
      "fr": "Malika se regarde dans le miroir.",
      "uz": "Malika ko'zguga qaraydi.",
      "uzAlt": [
       "Malika o'ziga oynada qaraydi."
      ]
     },
     {
      "fr": "Ali se coiffe avec un peigne.",
      "uz": "Ali taroq bilan soch taraydi.",
      "uzAlt": [
       "Ali sochlarini taroq bilan turmaklaydi."
      ]
     },
     {
      "fr": "Sophie se maquille avant de sortir.",
      "uz": "Sofi ko'chaga chiqishdan oldin pardoz qiladi.",
      "uzAlt": [
       "Sofi chiqishdan oldin bo'yanadi."
      ]
     },
     {
      "fr": "Pierre met un peu de parfum.",
      "uz": "Pyer ozgina atir sepadigan.",
      "uzAlt": [
       "Pyer ozgina atir ishlatadi."
      ]
     }
    ]
   },
   {
    "id": "u11l3",
    "title": "Kundalik yumushlar",
    "words": [
     {
      "fr": "se reposer",
      "uz": "dam olmoq",
      "emoji": "🛋️",
      "alt": [
       "hordiq chiqarmoq"
      ]
     },
     {
      "fr": "se promener",
      "uz": "sayr qilmoq",
      "emoji": "🚶",
      "alt": [
       "sayrga chiqmoq"
      ]
     },
     {
      "fr": "se dépêcher",
      "uz": "shoshilmoq",
      "emoji": "🏃",
      "alt": [
       "tez harakat qilmoq"
      ]
     },
     {
      "fr": "se préparer",
      "uz": "tayyorlanmoq",
      "emoji": "🎒",
      "alt": [
       "hojatlanmoq"
      ]
     },
     {
      "fr": "le journal",
      "uz": "ro'znoma",
      "emoji": "📰",
      "alt": [
       "gazeta"
      ]
     },
     {
      "fr": "la radio",
      "uz": "radio",
      "emoji": "📻",
      "alt": [
       "radioeshittirish"
      ]
     },
     {
      "fr": "la musique",
      "uz": "musiqa",
      "emoji": "🎵",
      "alt": [
       "kuy"
      ]
     },
     {
      "fr": "le téléphone",
      "uz": "telefon",
      "emoji": "📱",
      "alt": [
       "smartfon"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je me prépare pour le travail.",
      "uz": "Men ishga tayyorgarlik ko'raman.",
      "uzAlt": [
       "Ishga tayyorlanyapman."
      ]
     },
     {
      "fr": "Tu te dépêches le matin.",
      "uz": "Sen ertalab shoshilasan.",
      "uzAlt": [
       "Siz ertalab shoshilasiz."
      ]
     },
     {
      "fr": "Ali se promène dans le parc.",
      "uz": "Ali bog'da sayr qiladi.",
      "uzAlt": [
       "Ali istirohat bog'ida sayrda."
      ]
     },
     {
      "fr": "Malika écoute la musique le matin.",
      "uz": "Malika ertalab musiqa tinglaydi.",
      "uzAlt": [
       "Malika ertalab kuy eshitadi."
      ]
     },
     {
      "fr": "Pierre lit le journal au salon.",
      "uz": "Pyer mehmonxonada gazeta o'qiydi.",
      "uzAlt": [
       "Pyer zalda ro'znoma mutolaa qiladi."
      ]
     },
     {
      "fr": "Sophie se repose un peu après.",
      "uz": "Sofi keyinroq ozgina dam oladi.",
      "uzAlt": [
       "Sofi sal keyinroq hordiq chiqaradi."
      ]
     }
    ]
   },
   {
    "id": "u11l4",
    "title": "Kechki tin olish",
    "words": [
     {
      "fr": "se coucher",
      "uz": "yotmoq",
      "emoji": "🌙",
      "alt": [
       "uxlagani bormoq"
      ]
     },
     {
      "fr": "s'endormir",
      "uz": "uxlab qolmoq",
      "emoji": "💤",
      "alt": [
       "uyquga ketmoq"
      ]
     },
     {
      "fr": "la nuit",
      "uz": "tun",
      "emoji": "🌃",
      "alt": [
       "kechasi"
      ]
     },
     {
      "fr": "le pyjama",
      "uz": "pijama",
      "emoji": "👕",
      "alt": [
       "tuniy libos"
      ]
     },
     {
      "fr": "le oreiller",
      "uz": "yostiq",
      "emoji": "🛌",
      "alt": [
       "bosh yostiq"
      ]
     },
     {
      "fr": "la couverture",
      "uz": "ko'rpa",
      "emoji": "🛏️",
      "alt": [
       "adyol"
      ]
     },
     {
      "fr": "le rêve",
      "uz": "tush",
      "emoji": "✨",
      "alt": [
       "xayol"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je me couche tard le soir.",
      "uz": "Men kechqurun kech yotaman.",
      "uzAlt": [
       "Kechqurun kech uxlayman."
      ]
     },
     {
      "fr": "Tu mets ton pyjama la nuit.",
      "uz": "Sen tunda pijiyangni kiyasan.",
      "uzAlt": [
       "Kechasi pijijangni kiyib olasan."
      ]
     },
     {
      "fr": "Ali s'endort dans son lit.",
      "uz": "Ali o'z karavotida uxlab qoladi.",
      "uzAlt": [
       "Ali yotog'ida uyquga ketadi."
      ]
     },
     {
      "fr": "Malika utilise un oreiller doux.",
      "uz": "Malika yumshoq yostiq ishlatadi.",
      "uzAlt": [
       "Malika yumshoq bosh yostiqdan foydalanadi."
      ]
     },
     {
      "fr": "Pierre prend une couverture chaude.",
      "uz": "Pyer issiq ko'rpa oladi.",
      "uzAlt": [
       "Pyer iliq adyol bilan yopinadi."
      ]
     },
     {
      "fr": "Sophie fait un beau rêve.",
      "uz": "Sofi yaxshi tush ko'radi.",
      "uzAlt": [
       "Sofi chiroyli tush ko'rmoqda."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u12",
  "level": "A2",
  "title": "Kecha nima qildim",
  "description": "Kechagi kun, dam olish kunlari",
  "color": "#22D3EE",
  "guide": [
   {
    "title": "Passé composé haqida",
    "text": "O'tgan zamonda ish-harakatni bildirish uchun 'passé composé' zamonidan foydalanamiz. U yordamchi fe'l (ko'p hollarda 'avoir') va asosiy fe'lning o'tgan zamon sifatdoshi (participe passé) yordamida yasaladi.",
    "examples": [
     [
      "J'ai mangé une pomme.",
      "Men olma yedim."
     ],
     [
      "Tu as fait un travail.",
      "Sen ish qilding."
     ]
    ]
   },
   {
    "title": "Avoir fe'lining tuslanishi",
    "text": "Passé composé yasashda eng ko'p ishlatiladigan yordamchi fe'l bu 'avoir' (ega bo'lmoq). U o'tgan zamonda quyidagicha tuslanadi: j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont.",
    "examples": [
     [
      "Il a vu un film.",
      "U kino ko'rdi."
     ],
     [
      "Nous avons fini le livre.",
      "Biz kitobni tugatdik."
     ]
    ]
   },
   {
    "title": "O'tgan zamon sifatdoshi",
    "text": "Birinchi guruh fe'llari (-er) uchun o'tgan zamon sifatdoshi '-é' bilan tugaydi (masalan: mangé). Boshqa fe'llarning ham o'ziga xos shakllari mavjud bo'lib, ularni yodda saqlash lozim.",
    "examples": [
     [
      "Sophie a chanté une chanson.",
      "Sofi qo'shiq kuyladi."
     ],
     [
      "Pierre a acheté du pain.",
      "Pyer non sotib oldi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u12l1",
    "title": "Kechagi ishlar",
    "words": [
     {
      "fr": "le film",
      "uz": "kino",
      "emoji": "🎬",
      "alt": [
       "film"
      ]
     },
     {
      "fr": "la lettre",
      "uz": "xat",
      "emoji": "✉️",
      "alt": [
       "maktub"
      ]
     },
     {
      "fr": "le jeu",
      "uz": "o'yin",
      "emoji": "🎮",
      "alt": [
       "ermak"
      ]
     },
     {
      "fr": "la chanson",
      "uz": "qo'shiq",
      "emoji": "🎵",
      "alt": [
       "tarona"
      ]
     },
     {
      "fr": "le sport",
      "uz": "sport",
      "emoji": "⚽",
      "alt": [
       "jismoniy tarbiya"
      ]
     },
     {
      "fr": "le cadeau",
      "uz": "sovg'a",
      "emoji": "🎁",
      "alt": [
       "in'om"
      ]
     },
     {
      "fr": "la question",
      "uz": "savol",
      "emoji": "❓",
      "alt": [
       "so'rov"
      ]
     },
     {
      "fr": "la réponse",
      "uz": "javob",
      "emoji": "💬",
      "alt": [
       "inkor"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'ai vu un film hier.",
      "uz": "Men kecha kino ko'rdim.",
      "uzAlt": [
       "Kecha kino ko'rdim.",
       "Men kecha bir film ko'rdim."
      ]
     },
     {
      "fr": "Tu as écrit une lettre.",
      "uz": "Sen xat yozding.",
      "uzAlt": [
       "Siz xat yozdingiz.",
       "Xat yozding."
      ]
     },
     {
      "fr": "Pierre a chanté une chanson.",
      "uz": "Pyer qo'shiq kuyladi.",
      "uzAlt": [
       "Bir qo'shiq kuyladi Pyer."
      ]
     },
     {
      "fr": "Nous avons fait du sport.",
      "uz": "Biz sport bilan shug'ullandik.",
      "uzAlt": [
       "Biz sport qildik."
      ]
     },
     {
      "fr": "Malika a donné un cadeau.",
      "uz": "Malika sovg'a berdi.",
      "uzAlt": [
       "Sovg'a berdi Malika."
      ]
     },
     {
      "fr": "Tu as posé une question.",
      "uz": "Sen savol berding.",
      "uzAlt": [
       "Siz savol berdingiz."
      ]
     }
    ]
   },
   {
    "id": "u12l2",
    "title": "Dam olish kuni",
    "words": [
     {
      "fr": "le voyage",
      "uz": "sayohat",
      "emoji": "✈️",
      "alt": [
       "safar"
      ]
     },
     {
      "fr": "la visite",
      "uz": "tashrif",
      "emoji": "🏛️",
      "alt": [
       "borish"
      ]
     },
     {
      "fr": "le musée",
      "uz": "muzey",
      "emoji": "🖼️",
      "alt": [
       "ko'rgazma"
      ]
     },
     {
      "fr": "le plan",
      "uz": "reja",
      "emoji": "🗺️",
      "alt": [
       "loyiha"
      ]
     },
     {
      "fr": "la promenade",
      "uz": "sayr",
      "emoji": "🚶",
      "alt": [
       "aylanish"
      ]
     },
     {
      "fr": "le moment",
      "uz": "lahza",
      "emoji": "⏱️",
      "alt": [
       "vaqt"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'ai fait un beau voyage.",
      "uz": "Men chiroyli sayohat qildim.",
      "uzAlt": [
       "Ajoyib sayohat qildim."
      ]
     },
     {
      "fr": "Sophie a visité le musée.",
      "uz": "Sofi muzeyga bordi.",
      "uzAlt": [
       "Sofi muzeyni ziyorat qildi."
      ]
     },
     {
      "fr": "Nous avons pris une photo.",
      "uz": "Biz suratga tushdik.",
      "uzAlt": [
       "Surat oldik."
      ]
     },
     {
      "fr": "Tu as fait une promenade.",
      "uz": "Sen sayr qilding.",
      "uzAlt": [
       "Siz sayr qildingiz."
      ]
     },
     {
      "fr": "Ali a préparé un plan.",
      "uz": "Ali reja tayyorladi.",
      "uzAlt": [
       "Reja tuzdi Ali."
      ]
     },
     {
      "fr": "J'ai aimé ce moment.",
      "uz": "Menga bu lahza yoqdi.",
      "uzAlt": [
       "Bu vaqtni yoqtirdim."
      ]
     }
    ]
   },
   {
    "id": "u12l3",
    "title": "Uy yumushlari",
    "words": [
     {
      "fr": "le nettoyage",
      "uz": "tozalash",
      "emoji": "🧹",
      "alt": [
       "sipir-sidir"
      ]
     },
     {
      "fr": "le repas",
      "uz": "taom",
      "emoji": "🍲",
      "alt": [
       "ovqatlanish"
      ]
     },
     {
      "fr": "la vaisselle",
      "uz": "idish",
      "emoji": "🍽️",
      "alt": [
       "idish-tovoq"
      ]
     },
     {
      "fr": "le linge",
      "uz": "kir",
      "emoji": "👕",
      "alt": [
       "kiyim-kechak"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'ai fait le nettoyage.",
      "uz": "Men tozalash ishlarini qildim.",
      "uzAlt": [
       "Uyni tozaladim."
      ]
     },
     {
      "fr": "Malika a préparé le repas.",
      "uz": "Malika ovqat tayyorladi.",
      "uzAlt": [
       "Ovqat pishirdi Malika."
      ]
     },
     {
      "fr": "Tu as lavé la vaisselle.",
      "uz": "Sen idishlarni yuvding.",
      "uzAlt": [
       "Siz idish yuvdingiz."
      ]
     },
     {
      "fr": "Pierre a fermé la porte.",
      "uz": "Pyer eshikni yopdi.",
      "uzAlt": [
       "Eshikni yopib qo'ydi."
      ]
     },
     {
      "fr": "Nous avons lavé le linge.",
      "uz": "Biz kirlarni yuvdik.",
      "uzAlt": [
       "Kiyim yuvdik."
      ]
     },
     {
      "fr": "Sophie a cherché la clé.",
      "uz": "Sofi kalitni qidirdi.",
      "uzAlt": [
       "Kalit qidirdi Sofi."
      ]
     }
    ]
   },
   {
    "id": "u12l4",
    "title": "O'tgan oqshom",
    "words": [
     {
      "fr": "la soirée",
      "uz": "oqshom",
      "emoji": "🌆",
      "alt": [
       "kecha"
      ]
     },
     {
      "fr": "le message",
      "uz": "xabar",
      "emoji": "📱",
      "alt": [
       "sms"
      ]
     },
     {
      "fr": "le dessin",
      "uz": "rasm",
      "emoji": "🎨",
      "alt": [
       "chizma"
      ]
     },
     {
      "fr": "le fruit",
      "uz": "meva",
      "emoji": "🍎",
      "alt": [
       "poliz ekini"
      ]
     },
     {
      "fr": "le gâteau",
      "uz": "tort",
      "emoji": "🎂",
      "alt": [
       "pishiriq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'ai passé une bonne soirée.",
      "uz": "Men yaxshi oqshom o'tkazdim.",
      "uzAlt": [
       "Ajoyib kecha o'tkazdim."
      ]
     },
     {
      "fr": "Ali a lu un livre.",
      "uz": "Ali kitob o'qidi.",
      "uzAlt": [
       "Kitob mutolaa qildi Ali."
      ]
     },
     {
      "fr": "Tu as écouté la musique.",
      "uz": "Sen musiqa tinglading.",
      "uzAlt": [
       "Siz musiqa tingladingiz."
      ]
     },
     {
      "fr": "Sophie a envoyé un message.",
      "uz": "Sofi xabar yubordi.",
      "uzAlt": [
       "Xabar jo'natdi Sofi."
      ]
     },
     {
      "fr": "Nous avons mangé un gâteau.",
      "uz": "Biz tort yedik.",
      "uzAlt": [
       "Pishiriq tanovul qildik."
      ]
     },
     {
      "fr": "Pierre a fait un dessin.",
      "uz": "Pyer rasm chizdi.",
      "uzAlt": [
       "Rasm ishladi Pyer."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u13",
  "level": "A2",
  "title": "Sayohat",
  "description": "Sayohat, aeroport, mehmonxona, chipta",
  "color": "#4ADE80",
  "guide": [
   {
    "title": "Passé composé - Être yordamida",
    "text": "Harakatni bildiruvchi ba'zi fe'llar (ayniqsa harakat va yo'nalish fe'llari) passé composé zamonida 'être' yordamchi fe'li bilan tuslanadi. Bunda o'tgan zamon sifatdoshi otga jins va son bo'yicha moslashadi.",
    "examples": [
     [
      "Je suis allé à Paris.",
      "Men Parijga bordim."
     ],
     [
      "Elle est partie ce matin.",
      "U bugun ertalab jo'nab ketdi."
     ]
    ]
   },
   {
    "title": "Jins va son moslashuvi",
    "text": "Être yordamchi fe'li ishlatilganda, agar ega ayol kishi bo'lsa, fe'l oxiriga '-e' qo'shiladi. Ko'plik shakl uchun esa '-s' qo'shiladi.",
    "examples": [
     [
      "Sophie est venue hier.",
      "Sofi kecha keldi."
     ],
     [
      "Ils sont arrivés tard.",
      "Ular kech kelishdi."
     ]
    ]
   },
   {
    "title": "Aeroport va Chiptalar",
    "text": "Sayohat davomida aeroport va chipta sotib olish bilan bog'liq so'zlar juda ko'p ishlatiladi. Chipta band qilish va reyslar haqida gapirishda passé composé zamonidan foydalanamiz.",
    "examples": [
     [
      "J'ai acheté un billet.",
      "Men chipta sotib oldim."
     ],
     [
      "L'avion est parti à l'heure.",
      "Samolyot o'z vaqtida uchib ketdi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u13l1",
    "title": "Sayohat va Aeroport",
    "words": [
     {
      "fr": "l'aéroport",
      "uz": "aeroport",
      "emoji": "✈️"
     },
     {
      "fr": "le vol",
      "uz": "reys",
      "emoji": "🛫",
      "alt": [
       "parvoz"
      ]
     },
     {
      "fr": "l'avion",
      "uz": "samolyot",
      "emoji": "🛩️"
     },
     {
      "fr": "le passeport",
      "uz": "pasport",
      "emoji": "🛂"
     },
     {
      "fr": "la valise",
      "uz": "chamadon",
      "emoji": "🧳"
     },
     {
      "fr": "le bagage",
      "uz": "yuk",
      "emoji": "🎒"
     },
     {
      "fr": "la douane",
      "uz": "bojxona",
      "emoji": "🛃"
     },
     {
      "fr": "le passager",
      "uz": "yo'lovchi",
      "emoji": "🧍"
     }
    ],
    "sentences": [
     {
      "fr": "Je suis allé à l'aéroport.",
      "uz": "Men aeroportga bordim.",
      "uzAlt": [
       "Aeroportga borgan edim."
      ]
     },
     {
      "fr": "Pierre est arrivé à l'heure.",
      "uz": "Pyer o'z vaqtida keldi.",
      "uzAlt": [
       "Pyer vaqtida yetib keldi."
      ]
     },
     {
      "fr": "Sophie est partie avec sa valise.",
      "uz": "Sofi o'z chamadoni bilan jo'nab ketdi.",
      "uzAlt": [
       "Sofi chamadoni bilan ketdi."
      ]
     },
     {
      "fr": "Nous sommes venus en avion.",
      "uz": "Biz samolyotda keldik.",
      "uzAlt": [
       "Samolyot orqali keldik."
      ]
     },
     {
      "fr": "Ali est entré dans l'avion.",
      "uz": "Ali samolyotga kirdi.",
      "uzAlt": [
       "Ali samolyot ichiga kirdi."
      ]
     },
     {
      "fr": "Elle est restée à l'aéroport.",
      "uz": "U aeroportda qoldi.",
      "uzAlt": [
       "U aeroportda qolib ketdi."
      ]
     }
    ]
   },
   {
    "id": "u13l2",
    "title": "Chipta va Reyslar",
    "words": [
     {
      "fr": "le billet",
      "uz": "chipta",
      "emoji": "🎫"
     },
     {
      "fr": "la place",
      "uz": "o'rin",
      "emoji": "🪑",
      "alt": [
       "joy"
      ]
     },
     {
      "fr": "le départ",
      "uz": "jo'nab ketish",
      "emoji": "🚀"
     },
     {
      "fr": "l'arrivée",
      "uz": "kelish",
      "emoji": "🏁",
      "alt": [
       "yetib kelish"
      ]
     },
     {
      "fr": "le retard",
      "uz": "kechikish",
      "emoji": "⏱️"
     },
     {
      "fr": "la ligne",
      "uz": "yo'nalish",
      "emoji": "〰️"
     },
     {
      "fr": "le guichet",
      "uz": "kassa",
      "emoji": "🪟"
     },
     {
      "fr": "l'employé",
      "uz": "xodim",
      "emoji": "👨‍\ud83d",
      "alt": [
       "ishchi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je suis tombé sur un employé.",
      "uz": "Men bir xodimga duch keldim.",
      "uzAlt": [
       "Bir xodimga duch keldim."
      ]
     },
     {
      "fr": "Le vol est parti sans retard.",
      "uz": "Reys kechikishsiz jo'nab ketdi.",
      "uzAlt": [
       "Parvoz kechikmadi."
      ]
     },
     {
      "fr": "Malika est retournée au guichet.",
      "uz": "Malika kassaga qaytib keldi.",
      "uzAlt": [
       "Malika kassaga qaytdi."
      ]
     },
     {
      "fr": "Il est monté dans le train.",
      "uz": "U poyezdga chiqdi.",
      "uzAlt": [
       "Poyezdga o'tirdi."
      ]
     },
     {
      "fr": "Nous sommes sortis de l'avion.",
      "uz": "Biz samolyotdan chiqdik.",
      "uzAlt": [
       "Samolyotdan tushdik."
      ]
     },
     {
      "fr": "Elle est descendue rapidement.",
      "uz": "U tezda tushdi.",
      "uzAlt": [
       "U tezda pastga tushdi."
      ]
     }
    ]
   },
   {
    "id": "u13l3",
    "title": "Mehmonxona",
    "words": [
     {
      "fr": "l'hôtel",
      "uz": "mehmonxona",
      "emoji": "🏨",
      "alt": [
       "otel"
      ]
     },
     {
      "fr": "la clef",
      "uz": "kalit",
      "emoji": "🔑"
     },
     {
      "fr": "le réceptionniste",
      "uz": "qabulxona xodimi",
      "emoji": "🛎️",
      "alt": [
       "administrator"
      ]
     },
     {
      "fr": "l'ascenseur",
      "uz": "lift",
      "emoji": "🛗"
     },
     {
      "fr": "l'étage",
      "uz": "qavat",
      "emoji": "🏢"
     },
     {
      "fr": "la réservation",
      "uz": "bron qilish",
      "emoji": "📅",
      "alt": [
       "oldindan buyurtma"
      ]
     },
     {
      "fr": "le service",
      "uz": "xizmat",
      "emoji": "🛎️",
      "alt": [
       "servis"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je suis allé à l'hôtel.",
      "uz": "Men mehmonxonaga bordim.",
      "uzAlt": [
       "Otelga borgan edim."
      ]
     },
     {
      "fr": "Sophie est montée par l'ascenseur.",
      "uz": "Sofi liftda chiqdi.",
      "uzAlt": [
       "Sofi lift yordamida ko'tarildi."
      ]
     },
     {
      "fr": "Pierre est venu à la réception.",
      "uz": "Pyer qabulxonaga keldi.",
      "uzAlt": [
       "Pyer qabulxonaga yetib keldi."
      ]
     },
     {
      "fr": "Elle est entrée dans la chambre.",
      "uz": "U xonaga kirdi.",
      "uzAlt": [
       "Xonaning ichiga kirdi."
      ]
     },
     {
      "fr": "Nous sommes arrivés à l'étage.",
      "uz": "Biz qavatga yetib keldik.",
      "uzAlt": [
       "Qavatga chiqdik."
      ]
     },
     {
      "fr": "Ali est sorti de l'hôtel.",
      "uz": "Ali mehmonxonadan chiqib ketdi.",
      "uzAlt": [
       "Ali oteldan chiqdi."
      ]
     }
    ]
   },
   {
    "id": "u13l4",
    "title": "Sayohat Xotiralari",
    "words": [
     {
      "fr": "l'excursion",
      "uz": "ekskursiya",
      "emoji": "🚌",
      "alt": [
       "sayohat"
      ]
     },
     {
      "fr": "le guide",
      "uz": "gid",
      "emoji": "🗣️",
      "alt": [
       "yo'lboshchi"
      ]
     },
     {
      "fr": "le souvenir",
      "uz": "esdalik",
      "emoji": "🎁",
      "alt": [
       "suvenir"
      ]
     },
     {
      "fr": "la frontière",
      "uz": "chegara",
      "emoji": "🚧"
     },
     {
      "fr": "le pays",
      "uz": "mamlakat",
      "emoji": "🌍",
      "alt": [
       "diyor"
      ]
     },
     {
      "fr": "la langue",
      "uz": "til",
      "emoji": "💬",
      "alt": [
       "nutq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je suis parti dans un autre pays.",
      "uz": "Men boshqa mamlakatga ketdim.",
      "uzAlt": [
       "Boshqa yurtga jo'nadim."
      ]
     },
     {
      "fr": "Malika est revenue avec un souvenir.",
      "uz": "Malika esdalik sovg'asi bilan qaytib keldi.",
      "uzAlt": [
       "Malika esdalik bilan qaytdi."
      ]
     },
     {
      "fr": "Pierre est allé voir la frontière.",
      "uz": "Pyer chegarani ko'rgani bordi.",
      "uzAlt": [
       "Pyer chegaraga bordi."
      ]
     },
     {
      "fr": "Nous sommes tombés sur un bon guide.",
      "uz": "Biz yaxshi gidga duch keldik.",
      "uzAlt": [
       "Yaxshi yo'lboshchiga duch keldik."
      ]
     },
     {
      "fr": "Elle est allée en excursion.",
      "uz": "U ekskursiyaga bordi.",
      "uzAlt": [
       "Ekskursiyada bo'ldi."
      ]
     },
     {
      "fr": "Ils sont rentrés tard.",
      "uz": "Ular kech qaytib kelishdi.",
      "uzAlt": [
       "Ular kech qaytishdi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u14",
  "level": "A2",
  "title": "Fasllar va rejalar",
  "description": "Fasllar, ob-havo prognozi, yaqin rejalar",
  "color": "#2DD4BF",
  "guide": [
   {
    "title": "Futur Proche",
    "text": "Yaqin kelajakdagi rejalarni bildirish uchun «aller» fe'li hozirgi zamonda va asosiy fe'l boshlang'ich (infinitif) shaklda ishlatiladi.",
    "examples": [
     [
      "Je vais voyager.",
      "Men sayohat qilmoqchiman."
     ],
     [
      "Tu vas visiter le musée.",
      "Sen muzeyga bormoqchisan."
     ]
    ]
   },
   {
    "title": "Fasllar",
    "text": "Fransuz tilida fasl nomlari oldidan odatda «en» yoki «au» old ko'makchisi ishlatiladi.",
    "examples": [
     [
      "En été, il fait beau.",
      "Yozda ob-havo yaxshi."
     ],
     [
      "En hiver, il neige.",
      "Qishda qor yog'adi."
     ]
    ]
   },
   {
    "title": "Rejalar va vaqt",
    "text": "Kelasi zamon rejalari haqida gapirganda vaqtni bildiruvchi so'zlar gap boshida yoki oxirida keladi.",
    "examples": [
     [
      "Demain, nous allons partir.",
      "Ertaga biz jo'naymiz."
     ],
     [
      "Ce soir, elle va cuisiner.",
      "Bugun kechqurun u ovqat pishiradi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u14l1",
    "title": "Fasllar olami",
    "words": [
     {
      "fr": "le printemps",
      "uz": "bahor",
      "emoji": "🌸",
      "alt": [
       "bahor fasli"
      ]
     },
     {
      "fr": "l'été",
      "uz": "yoz",
      "emoji": "☀️",
      "alt": [
       "yoz fasli"
      ]
     },
     {
      "fr": "l'automne",
      "uz": "kuz",
      "emoji": "🍂",
      "alt": [
       "kuz fasli"
      ]
     },
     {
      "fr": "l'hiver",
      "uz": "qish",
      "emoji": "❄️",
      "alt": [
       "qish fasli"
      ]
     },
     {
      "fr": "la saison",
      "uz": "fasl",
      "emoji": "🗓️",
      "alt": [
       "mavsum"
      ]
     },
     {
      "fr": "le mois",
      "uz": "oy",
      "emoji": "🌙",
      "alt": [
       "kalendar oyi"
      ]
     },
     {
      "fr": "l'année",
      "uz": "yil",
      "emoji": "📅",
      "alt": [
       "davr"
      ]
     },
     {
      "fr": "la météo",
      "uz": "ob-havo",
      "emoji": "🌦️",
      "alt": [
       "meteorologiya"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je vais observer le printemps.",
      "uz": "Men bahorni kuzatmoqchiman.",
      "uzAlt": [
       "Bahorni kuzatishni rejalashtiryapman."
      ]
     },
     {
      "fr": "Tu vas voyager en été.",
      "uz": "Sen yozda sayohat qilmoqchisan.",
      "uzAlt": [
       "Siz yozda sayohat qilmoqchisiz."
      ]
     },
     {
      "fr": "Il va aimer l'automne.",
      "uz": "U kuzni yaxshi ko'rmoqchi.",
      "uzAlt": [
       "Unga kuz yoqadi."
      ]
     },
     {
      "fr": "Elle va préparer l'hiver.",
      "uz": "U qishga tayyorgarlik ko'rmoqchi.",
      "uzAlt": [
       "U qishga hozirlik ko'radi."
      ]
     },
     {
      "fr": "Nous allons changer de saison.",
      "uz": "Biz faslni o'zgartirmoqchimiz.",
      "uzAlt": [
       "Biz mavsumni almashtirmoqchimiz."
      ]
     },
     {
      "fr": "Vous allez attendre le mois.",
      "uz": "Siz oyni kutmoqchisiz.",
      "uzAlt": [
       "Sen oyni kutmoqchisan."
      ]
     }
    ]
   },
   {
    "id": "u14l2",
    "title": "Ob-havo prognozi",
    "words": [
     {
      "fr": "le ciel",
      "uz": "osmon",
      "emoji": "☁️",
      "alt": [
       "falak"
      ]
     },
     {
      "fr": "le nuage",
      "uz": "bulut",
      "emoji": "⛅",
      "alt": [
       "ochiq bulut"
      ]
     },
     {
      "fr": "le vent",
      "uz": "shamol",
      "emoji": "💨",
      "alt": [
       "yel"
      ]
     },
     {
      "fr": "l'orage",
      "uz": "momaqaldiroq",
      "emoji": "⚡",
      "alt": [
       "bo'ron"
      ]
     },
     {
      "fr": "le brouillard",
      "uz": "tuman",
      "emoji": "🌫️",
      "alt": [
       "zax tuman"
      ]
     },
     {
      "fr": "la chaleur",
      "uz": "issiqlik",
      "emoji": "🔥",
      "alt": [
       "issiq"
      ]
     },
     {
      "fr": "le degré",
      "uz": "daraja",
      "emoji": "🌡️",
      "alt": [
       "issiqlik darajasi"
      ]
     },
     {
      "fr": "le bulletin",
      "uz": "axborotnoma",
      "emoji": "📋",
      "alt": [
       "ma'lumotnoma"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je vais regarder le ciel.",
      "uz": "Men osmonga qaramoqchiman.",
      "uzAlt": [
       "Osmonga nazar solmoqchiman."
      ]
     },
     {
      "fr": "Tu vas voir le nuage.",
      "uz": "Sen bulutni ko'rmoqchisan.",
      "uzAlt": [
       "Siz bulutni ko'rasiz."
      ]
     },
     {
      "fr": "Il va souffler le vent.",
      "uz": "Shamol esmoqchi.",
      "uzAlt": [
       "Shamol bo'ladi."
      ]
     },
     {
      "fr": "Elle va éviter l'orage.",
      "uz": "U momaqaldiroqdan qochmoqchi.",
      "uzAlt": [
       "Momaqaldiroqdan saqlanmoqchi."
      ]
     },
     {
      "fr": "Nous allons traverser le brouillard.",
      "uz": "Biz tumanni kesib o'tmoqchimiz.",
      "uzAlt": [
       "Tuman ichidan o'tamiz."
      ]
     },
     {
      "fr": "Vous allez supporter la chaleur.",
      "uz": "Siz issiqlikka chidamoqchisiz.",
      "uzAlt": [
       "Sen issiqqa chidaysan."
      ]
     }
    ]
   },
   {
    "id": "u14l3",
    "title": "Kundalik rejalar",
    "words": [
     {
      "fr": "le projet",
      "uz": "loyiha",
      "emoji": "📊",
      "alt": [
       "reja"
      ]
     },
     {
      "fr": "l'agenda",
      "uz": "kundalik",
      "emoji": "📓",
      "alt": [
       "kun tartibi"
      ]
     },
     {
      "fr": "la tâche",
      "uz": "vazifa",
      "emoji": "📝",
      "alt": [
       "ish"
      ]
     },
     {
      "fr": "l'objectif",
      "uz": "maqsad",
      "emoji": "🎯",
      "alt": [
       "niyat"
      ]
     },
     {
      "fr": "la décision",
      "uz": "qaror",
      "emoji": "💡",
      "alt": [
       "hukm"
      ]
     },
     {
      "fr": "l'espoir",
      "uz": "umid",
      "emoji": "✨",
      "alt": [
       "orzu"
      ]
     },
     {
      "fr": "la promesse",
      "uz": "va'da",
      "emoji": "🤝",
      "alt": [
       "ahd"
      ]
     },
     {
      "fr": "le calendrier",
      "uz": "taqvim",
      "emoji": "📆",
      "alt": [
       "kalendar"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je vais commencer le projet.",
      "uz": "Men loyihani boshlamoqchiman.",
      "uzAlt": [
       "Loyihani boshlashni rejalashtiryapman."
      ]
     },
     {
      "fr": "Tu vas consulter l'agenda.",
      "uz": "Sen kundalikni ko'rib chiqmoqchisan.",
      "uzAlt": [
       "Siz kun tartibiga qarayverasiz."
      ]
     },
     {
      "fr": "Il va accomplir la tâche.",
      "uz": "U vazifani bajarmoqchi.",
      "uzAlt": [
       "Vazifani ado etmoqchi."
      ]
     },
     {
      "fr": "Elle va atteindre l'objectif.",
      "uz": "U maqsadga erishmoqchi.",
      "uzAlt": [
       "Maqsadiga yetishni rejalashtirmoqda."
      ]
     },
     {
      "fr": "Nous allons prendre la décision.",
      "uz": "Biz qaror qabul qilmoqchimiz.",
      "uzAlt": [
       "Shu qarorga kelamiz."
      ]
     },
     {
      "fr": "Vous allez garder l'espoir.",
      "uz": "Siz umidni saqlab qolmoqchisiz.",
      "uzAlt": [
       "Umidni yo'qotmaysiz."
      ]
     }
    ]
   },
   {
    "id": "u14l4",
    "title": "Dam olish rejalari",
    "words": [
     {
      "fr": "la campagne",
      "uz": "qishloq",
      "emoji": "🏡",
      "alt": [
       "tabiat qo'yni"
      ]
     },
     {
      "fr": "la mer",
      "uz": "dengiz",
      "emoji": "🌊",
      "alt": [
       "ummon"
      ]
     },
     {
      "fr": "la montagne",
      "uz": "tog'",
      "emoji": "⛰️",
      "alt": [
       "cho'qqi"
      ]
     },
     {
      "fr": "la tente",
      "uz": "chodir",
      "emoji": "⛺",
      "alt": [
       "palatka"
      ]
     },
     {
      "fr": "le feu",
      "uz": "gulxan",
      "emoji": "🔥",
      "alt": [
       "olov"
      ]
     },
     {
      "fr": "l'appareil",
      "uz": "uskuna",
      "emoji": "📷",
      "alt": [
       "apparat"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je vais visiter la campagne.",
      "uz": "Men qishloqqa bormoqchiman.",
      "uzAlt": [
       "Qishloqqa sayohat qilmoqchiman."
      ]
     },
     {
      "fr": "Tu vas voir la mer.",
      "uz": "Sen dengizni ko'rmoqchisan.",
      "uzAlt": [
       "Siz dengizni tomosha qilasiz."
      ]
     },
     {
      "fr": "Il va escalader la montagne.",
      "uz": "U tog'ga chiqmoqchi.",
      "uzAlt": [
       "Tog'ga ko'tarilishni rejalashtirmoqda."
      ]
     },
     {
      "fr": "Elle va monter la tente.",
      "uz": "U chodir qurmoqchi.",
      "uzAlt": [
       "Palatka tikmoqchi."
      ]
     },
     {
      "fr": "Nous allons allumer le feu.",
      "uz": "Biz gulxan yoqmoqchimiz.",
      "uzAlt": [
       "Olov yoqamiz."
      ]
     },
     {
      "fr": "Vous allez porter la valise.",
      "uz": "Siz chamadonni ko'tarmoqchisiz.",
      "uzAlt": [
       "Chamadonni olib yurasiz."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u15",
  "level": "A2",
  "title": "Bo'sh vaqt",
  "description": "Sevimli mashg'ulotlar, sport, musiqa, kino",
  "color": "#38BDF8",
  "guide": [
   {
    "title": "Aimer, adorer, détester",
    "text": "Yoqtirish va yoqtirmaslikni bildirish uchun bu fe'llardan keyin ot yoki fe'lning bosh shakli (infinitiv) ishlatiladi.",
    "examples": [
     [
      "J'aime nager.",
      "Men suzishni yaxshi ko'raman."
     ],
     [
      "Elle déteste courir.",
      "U yugurishni yomon ko'radi."
     ]
    ]
   },
   {
    "title": "Faire du / de la",
    "text": "Sport va musiqa turlari bilan shug'ullanganda faire fe'li va old ko'makchilar ishlatiladi: erkak jins uchun 'du', unli bilan boshlanuvchi yoki ayol jins uchun 'de la'.",
    "examples": [
     [
      "Tu fais du football.",
      "Sen futbol bilan shug'ullasan."
     ],
     [
      "Pierre fait de la guitare.",
      "Pyer gitara chaladi."
     ]
    ]
   },
   {
    "title": "Jouer à / de",
    "text": "O'yinlar va sport turlari uchun 'jouer à' (jouer au/à la), musiqa asboblari uchun esa 'jouer de' (jouer du/de la) ishlatiladi.",
    "examples": [
     [
      "Sophie joue au tennis.",
      "Sofi tennis o'ynaydi."
     ],
     [
      "Ali joue du piano.",
      "Ali pianino chaladi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u15l1",
    "title": "Sevimli mashg'ulotlar",
    "words": [
     {
      "fr": "la peinture",
      "uz": "rassomchilik",
      "emoji": "🎨",
      "alt": [
       "rangtasvir"
      ]
     },
     {
      "fr": "le chant",
      "uz": "qo'shiq aytish",
      "emoji": "🎤",
      "alt": [
       "vokal"
      ]
     },
     {
      "fr": "la danse",
      "uz": "raqs",
      "emoji": "💃",
      "alt": [
       "raqsga tushish"
      ]
     },
     {
      "fr": "la lecture",
      "uz": "mutolaa",
      "emoji": "📖",
      "alt": [
       "kitob o'qish"
      ]
     },
     {
      "fr": "le jardinage",
      "uz": "bog'dorchilik",
      "emoji": "🌱",
      "alt": [
       "gulchilik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'aime la lecture.",
      "uz": "Men mutolaani yaxshi ko'raman.",
      "uzAlt": [
       "Men kitob o'qishni yoqtiraman."
      ]
     },
     {
      "fr": "Malika déteste la cuisine.",
      "uz": "Malika pazandachilikni yomon ko'radi.",
      "uzAlt": [
       "Malika ovqat pishirishni yoqtirmaydi."
      ]
     },
     {
      "fr": "Pierre adore la peinture.",
      "uz": "Pyer rassomchilikni juda yaxshi ko'radi.",
      "uzAlt": [
       "Pyer rangtasvirni sevadi."
      ]
     },
     {
      "fr": "Sophie aime la danse.",
      "uz": "Sofi raqsni yoqtiradi.",
      "uzAlt": [
       "Sofi raqsga tushishni yaxshi ko'radi."
      ]
     },
     {
      "fr": "Ali aime le chant.",
      "uz": "Ali qo'shiq aytishni yoqtiradi.",
      "uzAlt": [
       "Ali vokalni yaxshi ko'radi."
      ]
     },
     {
      "fr": "Tu détestes le jardinage.",
      "uz": "Sen bog'dorchilikni yomon ko'rasan.",
      "uzAlt": [
       "Siz bog'dorchilikni yoqtirmaysiz."
      ]
     }
    ]
   },
   {
    "id": "u15l2",
    "title": "Sport turlari",
    "words": [
     {
      "fr": "le football",
      "uz": "futbol",
      "emoji": "⚽"
     },
     {
      "fr": "le tennis",
      "uz": "tennis",
      "emoji": "🎾"
     },
     {
      "fr": "la natation",
      "uz": "suzish",
      "emoji": "🏊"
     },
     {
      "fr": "le cyclisme",
      "uz": "velosport",
      "emoji": "🚴",
      "alt": [
       "velosiped haydash"
      ]
     },
     {
      "fr": "la course",
      "uz": "yugurish",
      "emoji": "🏃",
      "alt": [
       "poyga"
      ]
     },
     {
      "fr": "le basket",
      "uz": "basketbol",
      "emoji": "🏀"
     },
     {
      "fr": "le ski",
      "uz": "chang'i",
      "emoji": "🎿",
      "alt": [
       "chang'ida uchish"
      ]
     },
     {
      "fr": "la boxe",
      "uz": "boks",
      "emoji": "🥊"
     }
    ],
    "sentences": [
     {
      "fr": "Ali fait du football.",
      "uz": "Ali futbol o'ynaydi.",
      "uzAlt": [
       "Ali futbol bilan shug'ullanadi."
      ]
     },
     {
      "fr": "Sophie fait de la natation.",
      "uz": "Sofi suzish bilan shug'ullanadi.",
      "uzAlt": [
       "Sofi suzadi."
      ]
     },
     {
      "fr": "Tu fais du tennis.",
      "uz": "Sen tennis o'ynaysan.",
      "uzAlt": [
       "Siz tennis o'ynaysiz."
      ]
     },
     {
      "fr": "Pierre aime le cyclisme.",
      "uz": "Pyer velosportni yaxshi ko'radi.",
      "uzAlt": [
       "Pyer velosiped haydashni yoqtiradi."
      ]
     },
     {
      "fr": "Malika déteste la course.",
      "uz": "Malika yugurishni yomon ko'radi.",
      "uzAlt": [
       "Malika yugurishni yoqtirmaydi."
      ]
     },
     {
      "fr": "Nous faisons du basket.",
      "uz": "Biz basketbol o'ynaymiz.",
      "uzAlt": [
       "Biz basketbol bilan shug'ullanamiz."
      ]
     }
    ]
   },
   {
    "id": "u15l3",
    "title": "Musiqa olami",
    "words": [
     {
      "fr": "la guitare",
      "uz": "gitara",
      "emoji": "🎸"
     },
     {
      "fr": "le piano",
      "uz": "pianino",
      "emoji": "🎹"
     },
     {
      "fr": "le violon",
      "uz": "skripka",
      "emoji": "🎻"
     },
     {
      "fr": "la flûte",
      "uz": "fleyta",
      "emoji": "🪈"
     },
     {
      "fr": "la batterie",
      "uz": "baraban",
      "emoji": "🥁",
      "alt": [
       "zarbli asboblar"
      ]
     },
     {
      "fr": "le concert",
      "uz": "konsert",
      "emoji": "🎫"
     },
     {
      "fr": "la mélodie",
      "uz": "ohang",
      "emoji": "🎶",
      "alt": [
       "kuy"
      ]
     },
     {
      "fr": "l'opéra",
      "uz": "opera",
      "emoji": "🎭"
     }
    ],
    "sentences": [
     {
      "fr": "Sophie joue de la guitare.",
      "uz": "Sofi gitara chaladi.",
      "uzAlt": [
       "Sofi gitarada o'ynaydi."
      ]
     },
     {
      "fr": "Ali joue du piano.",
      "uz": "Ali pianino chaladi.",
      "uzAlt": [
       "Ali pianinoda o'ynaydi."
      ]
     },
     {
      "fr": "Pierre aime le violon.",
      "uz": "Pyer skripkani yaxshi ko'radi.",
      "uzAlt": [
       "Pyer skripka chalishni yoqtiradi."
      ]
     },
     {
      "fr": "Malika écoute la mélodie.",
      "uz": "Malika ohangni tinglaydi.",
      "uzAlt": [
       "Malika kuyni eshitmoqda."
      ]
     },
     {
      "fr": "Tu détestes l'opéra.",
      "uz": "Sen operani yomon ko'rasan.",
      "uzAlt": [
       "Siz operani yoqtirmaysiz."
      ]
     },
     {
      "fr": "Nous allons au concert.",
      "uz": "Biz konsertga boramiz.",
      "uzAlt": [
       "Biz konsertga ketayotibmiz."
      ]
     }
    ]
   },
   {
    "id": "u15l4",
    "title": "Kino va teatr",
    "words": [
     {
      "fr": "le cinéma",
      "uz": "kino",
      "emoji": "🎬",
      "alt": [
       "kinoteatr"
      ]
     },
     {
      "fr": "l'acteur",
      "uz": "aktyor",
      "emoji": "👨‍\ud83c"
     },
     {
      "fr": "l'actrice",
      "uz": "aktrisa",
      "emoji": "👩‍\ud83c"
     },
     {
      "fr": "la comédie",
      "uz": "komediya",
      "emoji": "😆"
     },
     {
      "fr": "le drame",
      "uz": "drama",
      "emoji": "🎭"
     },
     {
      "fr": "la scène",
      "uz": "sahna",
      "emoji": "🏛️"
     },
     {
      "fr": "l'histoire",
      "uz": "voqea",
      "emoji": "📜",
      "alt": [
       "hikoya",
       "tarix"
      ]
     },
     {
      "fr": "la blague",
      "uz": "hazil",
      "emoji": "😄",
      "alt": [
       "latifa"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'aime le cinéma.",
      "uz": "Men kinoni yaxshi ko'raman.",
      "uzAlt": [
       "Men kinoteatrga borishni yoqtiraman."
      ]
     },
     {
      "fr": "Pierre adore la comédie.",
      "uz": "Pyer komediyani juda yaxshi ko'radi.",
      "uzAlt": [
       "Pyer komediyani sevadi."
      ]
     },
     {
      "fr": "Sophie regarde le drame.",
      "uz": "Sofi dramani tomosha qilmoqda.",
      "uzAlt": [
       "Sofi dramani ko'radi."
      ]
     },
     {
      "fr": "Malika aime cet acteur.",
      "uz": "Malika bu aktyorni yaxshi ko'radi.",
      "uzAlt": [
       "Malikaga bu aktyor yoqadi."
      ]
     },
     {
      "fr": "Ali raconte une blague.",
      "uz": "Ali hazil aytib bermoqda.",
      "uzAlt": [
       "Ali latifa aytmoqda."
      ]
     },
     {
      "fr": "Tu détestes cette histoire.",
      "uz": "Sen bu voqeani yomon ko'rasan.",
      "uzAlt": [
       "Siz bu hikoyani yoqtirmaysiz."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u16",
  "level": "A2",
  "title": "Uy ishlari",
  "description": "Uy yumushlari, oshxona, tozalash",
  "color": "#34D399",
  "guide": [
   {
    "title": "To'g'ri to'ldiruvchi olmoshlari: Le va La",
    "text": "Fransuz tilida otning o'rnini bosuvchi 'le' (erkak jinsdagi birlik otlar uchun) va 'la' (ayol jinsdagi birlik otlar uchun) olmoshlari fe'ldan oldin keladi. Ular gapdagi takrorlanishning oldini oladi va 'uni' deb tarjima qilinadi.",
    "examples": [
     [
      "Je lave la voiture. Je la lave.",
      "Men mashinani yuvyapman. Men uni yuvyapman."
     ],
     [
      "Il nettoie le sol. Il le nettoie.",
      "U polni tozalayapti. U uni tozalayapti."
     ]
    ]
   },
   {
    "title": "Ko'plik to'ldiruvchi olmoshi: Les",
    "text": "Agar to'g'ri to'ldiruvchi ot ko'plik shaklida bo'lsa, 'les' olmoshi ishlatiladi. Bu olmosh ham har doim fe'ldan oldin yoziladi va 'ularni' degan ma'noni anglatadi.",
    "examples": [
     [
      "Elle range les livres. Elle les range.",
      "U kitoblarni tartibga solmoqda. U ularni tartibga solmoqda."
     ],
     [
      "Tu laves les vitres. Tu les laves.",
      "Sen derzalarni yuvyapsan. Sen ularni yuvyapsan."
     ]
    ]
   },
   {
    "title": "Olmoshlarning fe'ldan oldin kelishi",
    "text": "Tasdiq gaplarda to'g'ri to'ldiruvchi olmoshlari har doim tuslangan fe'ldan oldin joylashadi. Agar gapda majhul yoki infinitiv fe'l bo'lsa, olmosh o'sha fe'ldan oldin turadi.",
    "examples": [
     [
      "Sophie prépare le dîner. Sophie le prépare.",
      "Sofi kechki ovqatni tayyorlamoqda. Sofi uni tayyorlamoqda."
     ],
     [
      "Pierre achète les fleurs. Pierre les achète.",
      "Pyer gullarni sotib olyapti. Pyer ularni sotib olyapti."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u16l1",
    "title": "Uy yumushlari",
    "words": [
     {
      "fr": "balayer",
      "uz": "supurmoq",
      "emoji": "🧹"
     },
     {
      "fr": "la poussière",
      "uz": "chang",
      "emoji": "💨",
      "alt": [
       "chang-to'zon"
      ]
     },
     {
      "fr": "ranger",
      "uz": "tartibga solmoq",
      "emoji": "📦",
      "alt": [
       "yig'ishtirmoq"
      ]
     },
     {
      "fr": "la poubelle",
      "uz": "axlat qutisi",
      "emoji": "🗑️",
      "alt": [
       "axlat"
      ]
     },
     {
      "fr": "le balai",
      "uz": "supurgi",
      "emoji": "🧹"
     },
     {
      "fr": "la serpillère",
      "uz": "pol latta",
      "emoji": "🧽",
      "alt": [
       "latta"
      ]
     },
     {
      "fr": "l'éponge",
      "uz": "gubka",
      "emoji": "🧽",
      "alt": [
       "shimgich"
      ]
     },
     {
      "fr": "vider",
      "uz": "bo'shatmoq",
      "emoji": "📥",
      "alt": [
       "to'kib tashlamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali balaye le sol.",
      "uz": "Ali polni supurmoqda.",
      "uzAlt": [
       "Ali polni supuradi."
      ]
     },
     {
      "fr": "Malika enlève la poussière.",
      "uz": "Malika changni artmoqda.",
      "uzAlt": [
       "Malika changni tozalayapti."
      ]
     },
     {
      "fr": "Pierre range la chambre.",
      "uz": "Pyer xonani tartibga solmoqda.",
      "uzAlt": [
       "Pyer xonani yig'ishtiryapti."
      ]
     },
     {
      "fr": "Sophie vide la poubelle.",
      "uz": "Sofi axlat qutisini bo'shatmoqda.",
      "uzAlt": [
       "Sofi axlatni tashlayapti."
      ]
     },
     {
      "fr": "Il nettoie le balai.",
      "uz": "U supurgini tozalayapti.",
      "uzAlt": [
       "U supurgini yuvmoqda."
      ]
     },
     {
      "fr": "Elle utilise l'éponge.",
      "uz": "U gubkadan foydalanmoqda.",
      "uzAlt": [
       "U shimgichni ishlatyapti."
      ]
     }
    ]
   },
   {
    "id": "u16l2",
    "title": "Oshxona ishlari",
    "words": [
     {
      "fr": "la cuisinière",
      "uz": "plita",
      "emoji": "🍳",
      "alt": [
       "gaz plitasi"
      ]
     },
     {
      "fr": "le four",
      "uz": "pech",
      "emoji": "🔥",
      "alt": [
       "duxovka"
      ]
     },
     {
      "fr": "le frigidaire",
      "uz": "muzlatgich",
      "emoji": "🧊",
      "alt": [
       "xolodilnik"
      ]
     },
     {
      "fr": "la casserole",
      "uz": "kastryula",
      "emoji": "🍲",
      "alt": [
       "qozon"
      ]
     },
     {
      "fr": "la poêle",
      "uz": "tova",
      "emoji": "🍳"
     },
     {
      "fr": "couper",
      "uz": "to'g'ramoq",
      "emoji": "🔪",
      "alt": [
       "kesmoq"
      ]
     },
     {
      "fr": "cuire",
      "uz": "pishirmoq",
      "emoji": "🍲",
      "alt": [
       "tayyorlamoq"
      ]
     },
     {
      "fr": "la recette",
      "uz": "retsept",
      "emoji": "📜",
      "alt": [
       "taom retsepti"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali nettoie la cuisinière.",
      "uz": "Ali plitani tozalayapti.",
      "uzAlt": [
       "Ali plitani yuvmoqda."
      ]
     },
     {
      "fr": "Malika allume le four.",
      "uz": "Malika pechni yoqmoqda.",
      "uzAlt": [
       "Malika duxovkani yoqyapti."
      ]
     },
     {
      "fr": "Pierre ouvre le frigidaire.",
      "uz": "Pyer muzlatgichni ochmoqda.",
      "uzAlt": [
       "Pyer xolodilnikni ochyapti."
      ]
     },
     {
      "fr": "Sophie lave la casserole.",
      "uz": "Sofi kastryulani yuvmoqda.",
      "uzAlt": [
       "Sofi qozonni tozalayapti."
      ]
     },
     {
      "fr": "Il coupe les légumes.",
      "uz": "U sabzavotlarni to'g'ramoqda.",
      "uzAlt": [
       "U sabzavotlarni kesyapti."
      ]
     },
     {
      "fr": "Elle cuit le repas.",
      "uz": "U ovqatni pishirmoqda.",
      "uzAlt": [
       "U taom tayyorlayapti."
      ]
     }
    ]
   },
   {
    "id": "u16l3",
    "title": "Tozalash va yuvish",
    "words": [
     {
      "fr": "la machine",
      "uz": "kir yuvish mashinasi",
      "emoji": "🧺",
      "alt": [
       "mashina"
      ]
     },
     {
      "fr": "la vitre",
      "uz": "deraza oynasi",
      "emoji": "🪟",
      "alt": [
       "oyna"
      ]
     },
     {
      "fr": "la brosse",
      "uz": "cho'tka",
      "emoji": "🖌️",
      "alt": [
       "kiyim cho'tkasi"
      ]
     },
     {
      "fr": "le chiffon",
      "uz": "latta",
      "emoji": "🧹",
      "alt": [
       "artgich latta"
      ]
     },
     {
      "fr": "la lessive",
      "uz": "kir yuvish kukuni",
      "emoji": "🧴",
      "alt": [
       "poroshok"
      ]
     },
     {
      "fr": "le jouet",
      "uz": "o'yinchoq",
      "emoji": "🧸",
      "alt": [
       "qo'g'irchoq"
      ]
     },
     {
      "fr": "arroser",
      "uz": "sug'ormoq",
      "emoji": "🌱",
      "alt": [
       "suv sepmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali utilise la machine.",
      "uz": "Ali kir yuvish mashinasidan foydalanmoqda.",
      "uzAlt": [
       "Ali mashinani ishlatyapti."
      ]
     },
     {
      "fr": "Malika lave la vitre.",
      "uz": "Malika deraza oynasini yuvmoqda.",
      "uzAlt": [
       "Malika oynani tozalayapti."
      ]
     },
     {
      "fr": "Pierre nettoie avec la brosse.",
      "uz": "Pyer cho'tka bilan tozalayapti.",
      "uzAlt": [
       "Pyer cho'tka ishlatmoqda."
      ]
     },
     {
      "fr": "Sophie prend le chiffon.",
      "uz": "Sofi lattani olmoqda.",
      "uzAlt": [
       "Sofi latta bilan artmoqda."
      ]
     },
     {
      "fr": "Il achète la lessive.",
      "uz": "U kir yuvish kukunini sotib olyapti.",
      "uzAlt": [
       "U poroshok xarid qilyapti."
      ]
     },
     {
      "fr": "Elle arrose la plante.",
      "uz": "U o'simlikni sug'ormoqda.",
      "uzAlt": [
       "U gulga suv seryapti."
      ]
     }
    ]
   },
   {
    "id": "u16l4",
    "title": "Uy tartibi",
    "words": [
     {
      "fr": "le marteau",
      "uz": "bolg'a",
      "emoji": "🔨"
     },
     {
      "fr": "le clou",
      "uz": "mix",
      "emoji": "📌",
      "alt": [
       "temir mix"
      ]
     },
     {
      "fr": "réparer",
      "uz": "tuzatmoq",
      "emoji": "🔧",
      "alt": [
       "ta'mirlamoq"
      ]
     },
     {
      "fr": "le tiroir",
      "uz": "tortma",
      "emoji": "🗄️",
      "alt": [
       "stol ko'zchasi"
      ]
     },
     {
      "fr": "allumer",
      "uz": "yoqmoq",
      "emoji": "💡",
      "alt": [
       "chiroqni yoqmoq"
      ]
     },
     {
      "fr": "éteindre",
      "uz": "o'chirmoq",
      "emoji": "🔌",
      "alt": [
       "chiroqni o'chirmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali prend le marteau.",
      "uz": "Ali bolg'ani olmoqda.",
      "uzAlt": [
       "Ali bolg'ani qo'liga olyapti."
      ]
     },
     {
      "fr": "Malika cherche le clou.",
      "uz": "Malika mixni qidirmoqda.",
      "uzAlt": [
       "Malika mix qidiryapti."
      ]
     },
     {
      "fr": "Pierre répare la table.",
      "uz": "Pyer stolni tuzatmoqda.",
      "uzAlt": [
       "Pyer stolni ta'mirlayapti."
      ]
     },
     {
      "fr": "Sophie ferme le tiroir.",
      "uz": "Sofi tortmani yopmoqda.",
      "uzAlt": [
       "Sofi stol ko'zchasini yopyapti."
      ]
     },
     {
      "fr": "Il allume la lampe.",
      "uz": "U chiroqni yoqmoqda.",
      "uzAlt": [
       "U lampani yoqyapti."
      ]
     },
     {
      "fr": "Elle éteint la lumière.",
      "uz": "U yorug'likni o'chirmoqda.",
      "uzAlt": [
       "U chiroqni o'chiryapti."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u17",
  "level": "A2",
  "title": "Taomlar va retseptlar",
  "description": "Retsept, masalliqlar, miqdor",
  "color": "#22D3EE",
  "guide": [
   {
    "title": "Partitif artikllar",
    "text": "Aniq bo'lmagan yoki bo'linadigan miqdordagi oziq-ovqat va masalliqlarni ko'rsatish uchun du, de la, de l' partitif artikllari ishlatiladi.",
    "examples": [
     [
      "Je veux du sel.",
      "Men tuz xohlayman."
     ],
     [
      "Elle achète de la farine.",
      "U un sotib o'lyapti."
     ]
    ]
   },
   {
    "title": "Miqdor va o'lchov birliklari",
    "text": "Ko'p yoki oz miqdorni bildirish uchun beaucoup de, un peu de va un kilo de kabi birikmalar qo'llaniladi.",
    "examples": [
     [
      "Il faut un peu de sucre.",
      "Bir oz shakar kerak."
     ],
     [
      "Ajoute un kilo de pommes.",
      "Bir kilo olma qo'sh."
     ]
    ]
   },
   {
    "title": "Oshxona fe'llari",
    "text": "Retseptlarda buyruq yoki harakatni bildirish uchun saler, mélanger, ajouter kabi fe'llar ishlatiladi.",
    "examples": [
     [
      "Il faut mélanger la sauce.",
      "Sousni aralashtirish kerak."
     ],
     [
      "Tu dois saler la soupe.",
      "Sho'rvani tuzlashing kerak."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u17l1",
    "title": "Masalliqlar va o'lchov",
    "words": [
     {
      "fr": "le sel",
      "uz": "tuz",
      "emoji": "🧂",
      "alt": [
       "tuzlar"
      ]
     },
     {
      "fr": "le sucre",
      "uz": "shakar",
      "emoji": "🍬",
      "alt": [
       "qand"
      ]
     },
     {
      "fr": "la farine",
      "uz": "un",
      "emoji": "🌾",
      "alt": [
       "bug'doy uni"
      ]
     },
     {
      "fr": "l'huile",
      "uz": "yog'",
      "emoji": "🛢️",
      "alt": [
       "o'simlik yog'i"
      ]
     },
     {
      "fr": "un kilo de",
      "uz": "bir kilo",
      "emoji": "⚖️",
      "alt": [
       "bir kilogramm"
      ]
     },
     {
      "fr": "un peu de",
      "uz": "bir oz",
      "emoji": "🤏",
      "alt": [
       "ozgina"
      ]
     },
     {
      "fr": "beaucoup de",
      "uz": "ko'p",
      "emoji": "📦",
      "alt": [
       "ko'plab"
      ]
     },
     {
      "fr": "une tasse de",
      "uz": "bir finjon",
      "emoji": "☕",
      "alt": [
       "bir piyola"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je veux du sel.",
      "uz": "Men tuz xohlayman.",
      "uzAlt": [
       "Menga tuz kerak."
      ]
     },
     {
      "fr": "Il faut un peu de sucre.",
      "uz": "Bir oz shakar kerak.",
      "uzAlt": [
       "Ozroq shakar zarur."
      ]
     },
     {
      "fr": "Sophie achète un kilo de farine.",
      "uz": "Sofi bir kilo un sotib o'lyapti.",
      "uzAlt": [
       "Sophie bir kilogramm un sotib olmoqda."
      ]
     },
     {
      "fr": "Tu as beaucoup d'huile ?",
      "uz": "Senda ko'p yog' bormi?",
      "uzAlt": [
       "Ko'p yog'ingiz bormi?"
      ]
     },
     {
      "fr": "Il prend une tasse de lait.",
      "uz": "U bir piyola sut olyapti.",
      "uzAlt": [
       "U bitta finjon sut ichyapti."
      ]
     },
     {
      "fr": "Nous voulons un peu de sel.",
      "uz": "Biz bir oz tuz xohlaymiz.",
      "uzAlt": [
       "Bizga ozroq tuz kerak."
      ]
     }
    ]
   },
   {
    "id": "u17l2",
    "title": "Meva va sabzavotlar",
    "words": [
     {
      "fr": "la carotte",
      "uz": "sabzi",
      "emoji": "🥕",
      "alt": [
       "sabzilar"
      ]
     },
     {
      "fr": "la pomme de terre",
      "uz": "kartoshka",
      "emoji": "🥔",
      "alt": [
       "yerolma"
      ]
     },
     {
      "fr": "l'oignon",
      "uz": "piyoz",
      "emoji": "🧅",
      "alt": [
       "bosh piyoz"
      ]
     },
     {
      "fr": "l'ail",
      "uz": "sarimsoq",
      "emoji": "🧄",
      "alt": [
       "sarimsoqpiyoz"
      ]
     },
     {
      "fr": "la banane",
      "uz": "banan",
      "emoji": "🍌",
      "alt": [
       "banan mevasi"
      ]
     },
     {
      "fr": "le citron",
      "uz": "limon",
      "emoji": "🍋",
      "alt": [
       "limon mevasi"
      ]
     },
     {
      "fr": "la tomate",
      "uz": "pomidor",
      "emoji": "🍅",
      "alt": [
       "tomat"
      ]
     },
     {
      "fr": "le concombre",
      "uz": "bodring",
      "emoji": "🥒",
      "alt": [
       "bodringlar"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali mange une banane.",
      "uz": "Ali banan yemoqda.",
      "uzAlt": [
       "Ali bitta banan yeyapti."
      ]
     },
     {
      "fr": "Il faut couper la carotte.",
      "uz": "Sabzini kesish kerak.",
      "uzAlt": [
       "Sabzi to'g'ralishi lozim."
      ]
     },
     {
      "fr": "Malika achète des tomates.",
      "uz": "Malika pomidor sotib o'lyapti.",
      "uzAlt": [
       "Malika pomidorlar xarid qilmoqda."
      ]
     },
     {
      "fr": "Je prends un citron.",
      "uz": "Men bitta limon olyapman.",
      "uzAlt": [
       "Menga bir limon bering."
      ]
     },
     {
      "fr": "Tu as des oignons et de l'ail.",
      "uz": "Senda piyoz va sarimsoq bor.",
      "uzAlt": [
       "Sizda piyoz hamda sarimsoq mavjud."
      ]
     },
     {
      "fr": "Elle prépare les pommes de terre.",
      "uz": "U kartoshkani tayyorlayapti.",
      "uzAlt": [
       "U kartoshkalarni hozirlamoqda."
      ]
     }
    ]
   },
   {
    "id": "u17l3",
    "title": "Oshxona harakatlari",
    "words": [
     {
      "fr": "mélanger",
      "uz": "aralashtirmoq",
      "emoji": "🥣",
      "alt": [
       "kovlamoq"
      ]
     },
     {
      "fr": "ajouter",
      "uz": "qo'shmoq",
      "emoji": "➕",
      "alt": [
       "solmoq"
      ]
     },
     {
      "fr": "saler",
      "uz": "tuzlamoq",
      "emoji": "🧂",
      "alt": [
       "tuz solmoq"
      ]
     },
     {
      "fr": "goûter",
      "uz": "tatib ko'rmoq",
      "emoji": "👅",
      "alt": [
       "tattirib ko'rmoq"
      ]
     },
     {
      "fr": "laver",
      "uz": "yuvmoq",
      "emoji": "🧼",
      "alt": [
       "tozalab yuvmoq"
      ]
     },
     {
      "fr": "préparer",
      "uz": "tayyorlamoq",
      "emoji": "🍳",
      "alt": [
       "hozirlamoq"
      ]
     },
     {
      "fr": "servir",
      "uz": "tortmoq",
      "emoji": "🍽️",
      "alt": [
       "stolga qo'ymoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut mélanger la sauce.",
      "uz": "Sousni aralashtirish kerak.",
      "uzAlt": [
       "Sousni kovlash lozim."
      ]
     },
     {
      "fr": "Tu dois ajouter du sel.",
      "uz": "Sen tuz qo'shishing kerak.",
      "uzAlt": [
       "Tuz solishingiz lozim."
      ]
     },
     {
      "fr": "Sophie lave les tomates.",
      "uz": "Sofi pomidorlarni yuvmoqda.",
      "uzAlt": [
       "Sophie pomidorlarni yuvyapti."
      ]
     },
     {
      "fr": "Je veux goûter la soupe.",
      "uz": "Men sho'rvani tatib ko'rmoqchiman.",
      "uzAlt": [
       "Sho'rvani tatishni xohlayman."
      ]
     },
     {
      "fr": "Pierre prépare le dîner.",
      "uz": "Pyer kechki ovqatni tayyorlayapti.",
      "uzAlt": [
       "Pierre kechki taomni hozirlamoqda."
      ]
     },
     {
      "fr": "Il faut servir le plat.",
      "uz": "Taomni tortish kerak.",
      "uzAlt": [
       "Ovqatni dasturxonga qo'yish lozim."
      ]
     }
    ]
   },
   {
    "id": "u17l4",
    "title": "Retsept va taom",
    "words": [
     {
      "fr": "le plat",
      "uz": "taom",
      "emoji": "🍲",
      "alt": [
       "ovqat"
      ]
     },
     {
      "fr": "la cuillère",
      "uz": "qoshiq",
      "emoji": "🥄",
      "alt": [
       "osh qoshiq"
      ]
     },
     {
      "fr": "la fourchette",
      "uz": "sanchqi",
      "emoji": "🍴",
      "alt": [
       "vilka"
      ]
     },
     {
      "fr": "le couteau",
      "uz": "pichoq",
      "emoji": "🔪",
      "alt": [
       "kesuvchi pichoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le plat est délicieux.",
      "uz": "Taom juda mazali.",
      "uzAlt": [
       "Ovqat juda lazzatli."
      ]
     },
     {
      "fr": "Ali utilise un couteau.",
      "uz": "Ali pichoq ishlatyapti.",
      "uzAlt": [
       "Ali pichoqdan foydalanmoqda."
      ]
     },
     {
      "fr": "Il faut utiliser la poêle.",
      "uz": "Tovadan foydalanish kerak.",
      "uzAlt": [
       "Tovani ishlatish lozim."
      ]
     },
     {
      "fr": "Malika cuisine dans la cuisine.",
      "uz": "Malika oshxonada ovqat pishiryapti.",
      "uzAlt": [
       "Malika oshxonada pishiriq tayyorlayapti."
      ]
     },
     {
      "fr": "Tu as une cuillère et une fourchette ?",
      "uz": "Senda qoshiq va sanchqi bormi?",
      "uzAlt": [
       "Sizda qoshiq va vilka mavjudmi?"
      ]
     },
     {
      "fr": "Le repas est sur la table.",
      "uz": "Ovqat stol ustida.",
      "uzAlt": [
       "Stolda taom tayyor."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u18",
  "level": "A2",
  "title": "Yo'l so'rash",
  "description": "Shaharda yo'l topish, yo'nalishlar",
  "color": "#4ADE80",
  "guide": [
   {
    "title": "Buyruq mayli",
    "text": "Fransuz tilida boshqalarga buyruq berish yoki yo'nalish ko'rsatish uchun buyruq mayli ishlatiladi. 'Tu' olmoshiga mos keluvchi shaklda fe'l oxiridagi 's' harfi tushirib qoldiriladi.",
    "examples": [
     [
      "Tournez à droite.",
      "O'ngga buriling."
     ],
     [
      "Allez tout droit.",
      "To'g'ridan-to'g'ri yuring."
     ]
    ]
   },
   {
    "title": "Yo'nalishlar",
    "text": "Shaharda harakatlanish uchun 'à gauche' (chapga) va 'à droite' (o'ngga) iboralari juda muhimdir.",
    "examples": [
     [
      "Prenez à gauche.",
      "Chapga oling."
     ],
     [
      "Regardez à droite.",
      "O'ngga qarang."
     ]
    ]
   },
   {
    "title": "Manzilni so'rash",
    "text": "Notanish joyda yo'l topish uchun 'Pardon' so'zi bilan boshlab manzilda qayerdaligini so'rash odatiy hol hisoblanadi.",
    "examples": [
     [
      "Pardon, où est la poste?",
      "Kechirasiz, pochta qayerda?"
     ],
     [
      "Je cherche le musée.",
      "Men muzeyni qidiryapman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u18l1",
    "title": "Yo'nalishlar",
    "words": [
     {
      "fr": "le carrefour",
      "uz": "chorraha",
      "emoji": "🛣️",
      "alt": [
       "chorraha joyi"
      ]
     },
     {
      "fr": "le feu tricolore",
      "uz": "svetofor",
      "emoji": "🚦",
      "alt": [
       "chiroq"
      ]
     },
     {
      "fr": "le trottoir",
      "uz": "piyodalar yo'lagi",
      "emoji": "🚶",
      "alt": [
       "trotuar",
       "yo'lak"
      ]
     },
     {
      "fr": "le pont",
      "uz": "ko'prik",
      "emoji": "🌉",
      "alt": [
       "osma ko'prik"
      ]
     },
     {
      "fr": "le tunnel",
      "uz": "tunel",
      "emoji": "🚇",
      "alt": [
       "ostyo'l"
      ]
     },
     {
      "fr": "le rond-point",
      "uz": "aylanma yo'l",
      "emoji": "🔄",
      "alt": [
       "aylana"
      ]
     },
     {
      "fr": "l'avenue",
      "uz": "xiyobon",
      "emoji": "🌳",
      "alt": [
       "prospekt",
       "katta ko'cha"
      ]
     },
     {
      "fr": "l'impasse",
      "uz": "berk ko'cha",
      "emoji": "🛑",
      "alt": [
       "kardosh ko'cha"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Tournez à gauche au carrefour.",
      "uz": "Chorrahada chapga buriling.",
      "uzAlt": [
       "Chorraha ustida chapga buriling"
      ]
     },
     {
      "fr": "Allez tout droit vers l'avenue.",
      "uz": "Xiyobon tomon to'g'ridan-to'g'ri yuring.",
      "uzAlt": [
       "Prospektga to'g'ri yuring"
      ]
     },
     {
      "fr": "Le feu tricolore est rouge.",
      "uz": "Svetofor qizil rangda.",
      "uzAlt": [
       "Chiroq qizil"
      ]
     },
     {
      "fr": "Marchez sur le trottoir s'il vous plaît.",
      "uz": "Iltimos, piyodalar yo'lagidan yuring.",
      "uzAlt": [
       "Trotuardan yuring"
      ]
     },
     {
      "fr": "Traversez le pont maintenant.",
      "uz": "Hozir ko'prikdan o'ting.",
      "uzAlt": [
       "Ko'prikni kesib o'ting"
      ]
     },
     {
      "fr": "Cette rue est une impasse.",
      "uz": "Bu ko'cha berk ko'cha.",
      "uzAlt": [
       "Ushbu ko'cha berk"
      ]
     }
    ]
   },
   {
    "id": "u18l2",
    "title": "Harakat fe'llari",
    "words": [
     {
      "fr": "tourner",
      "uz": "burilmoq",
      "emoji": "↩️",
      "alt": [
       "aylanmoq"
      ]
     },
     {
      "fr": "continuer",
      "uz": "davom etmoq",
      "emoji": "➡️",
      "alt": [
       "to'xtamasdan yurmoq"
      ]
     },
     {
      "fr": "traverser",
      "uz": "kesib o'tmoq",
      "emoji": "🛣️",
      "alt": [
       "oshib o'tmoq"
      ]
     },
     {
      "fr": "s'arrêter",
      "uz": "to'xtamoq",
      "emoji": "🛑",
      "alt": [
       "to'xtab qolmoq"
      ]
     },
     {
      "fr": "demander",
      "uz": "so'ramoq",
      "emoji": "❓",
      "alt": [
       "iltimos qilmoq"
      ]
     },
     {
      "fr": "montrer",
      "uz": "ko'rsatmoq",
      "emoji": "👆",
      "alt": [
       "namoyish qilmoq"
      ]
     },
     {
      "fr": "suivre",
      "uz": "ergashmoq",
      "emoji": "👣",
      "alt": [
       "ketidan bormoq"
      ]
     },
     {
      "fr": "arriver",
      "uz": "yetib kelmoq",
      "emoji": "🏁",
      "alt": [
       "borsa yetmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Tournez à droite après le pont.",
      "uz": "Ko'prikdan keyin o'ngga buriling.",
      "uzAlt": [
       "Ko'prik ortidan o'ngga buril"
      ]
     },
     {
      "fr": "Continuez tout droit pendant dix minutes.",
      "uz": "O'n daqiqa davomida to'g'ri yuring.",
      "uzAlt": [
       "To'g'riligicha o'n daqiqa yuring"
      ]
     },
     {
      "fr": "Il faut traverser la rue ici.",
      "uz": "Bu yerda ko'chani kesib o'tish kerak.",
      "uzAlt": [
       "Ko'chadan shu yerdan o'tish lozim"
      ]
     },
     {
      "fr": "Arrêtez-vous au feu rouge.",
      "uz": "Qizil chiroqda to'xtang.",
      "uzAlt": [
       "Qizil svetoforda to'xtang"
      ]
     },
     {
      "fr": "Pierre demande son chemin à un agent.",
      "uz": "Pyer militsiyadan o'z yo'lini so'rayapti.",
      "uzAlt": [
       "Pyer yo'lni xodimdan so'ramoqda"
      ]
     },
     {
      "fr": "Suivez ce monsieur s'il vous plaît.",
      "uz": "Iltimos, bu janobga ergashing.",
      "uzAlt": [
       "Shu janobning ketidan boring"
      ]
     }
    ]
   },
   {
    "id": "u18l3",
    "title": "Binolar va joylar",
    "words": [
     {
      "fr": "la poste",
      "uz": "pochta",
      "emoji": "🏣",
      "alt": [
       "pochta binosi"
      ]
     },
     {
      "fr": "le commissariat",
      "uz": "politsiya bo'limi",
      "emoji": "👮",
      "alt": [
       "militsiya bo'limi"
      ]
     },
     {
      "fr": "l'église",
      "uz": "cherkov",
      "emoji": "⛪",
      "alt": [
       "ibodatxona"
      ]
     },
     {
      "fr": "le théâtre",
      "uz": "teatr",
      "emoji": "🎭",
      "alt": [
       "san'at saroyi"
      ]
     },
     {
      "fr": "le supermarché",
      "uz": "supermarket",
      "emoji": "🛒",
      "alt": [
       "katta do'kon"
      ]
     },
     {
      "fr": "la boulangerie",
      "uz": "nonvoyxona",
      "emoji": "🥖",
      "alt": [
       "non do'koni"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La poste est près du carrefour.",
      "uz": "Pochta chorraha yaqinida joylashgan.",
      "uzAlt": [
       "Pochta chorrahaga yaqin"
      ]
     },
     {
      "fr": "Où se trouve la pharmacie?",
      "uz": "Dorixona qayerda joylashgan?",
      "uzAlt": [
       "Dorixona qayerda?"
      ]
     },
     {
      "fr": "Le supermarché est à côté de l'église.",
      "uz": "Supermarket cherkovning yonida.",
      "uzAlt": [
       "Supermarket ibodatxona yonida"
      ]
     },
     {
      "fr": "Allez directement à l'hôpital.",
      "uz": "To'g'ridan-to'g'ri shifoxonaga boring.",
      "uzAlt": [
       "Kasalxonaga to'g'ri yo'l oling"
      ]
     },
     {
      "fr": "La boulangerie est ouverte le matin.",
      "uz": "Nonvoyxona ertalab ochiq bo'ladi.",
      "uzAlt": [
       "Non do'koni ertalab ishlaydi"
      ]
     },
     {
      "fr": "Le théâtre se trouve au centre-ville.",
      "uz": "Teatr shahar markazida joylashgan.",
      "uzAlt": [
       "Teatr shahar markazida"
      ]
     }
    ]
   },
   {
    "id": "u18l4",
    "title": "Masofa va joylashuv",
    "words": [
     {
      "fr": "loin",
      "uz": "uzoq",
      "emoji": "🔭",
      "alt": [
       "el yetmas joyda"
      ]
     },
     {
      "fr": "proche",
      "uz": "yaqin",
      "emoji": "📍",
      "alt": [
       "bir qadam"
      ]
     },
     {
      "fr": "en face de",
      "uz": "ro'parasida",
      "emoji": "👥",
      "alt": [
       "qarshisida"
      ]
     },
     {
      "fr": "à côté de",
      "uz": "yonida",
      "emoji": "🤝",
      "alt": [
       "chambarchas"
      ]
     },
     {
      "fr": "derrière",
      "uz": "orqasida",
      "emoji": "🔙",
      "alt": [
       "ortida"
      ]
     },
     {
      "fr": "devant",
      "uz": "oldida",
      "emoji": "🔤",
      "alt": [
       "peshonasida"
      ]
     },
     {
      "fr": "entre",
      "uz": "orasida",
      "emoji": "↔️",
      "alt": [
       "o'rtasida"
      ]
     },
     {
      "fr": "le coin",
      "uz": "burchak",
      "emoji": "📐",
      "alt": [
       "guja"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La gare n'est pas loin d'ici.",
      "uz": "Vokzal bu yerdan uzoq emas.",
      "uzAlt": [
       "Temir yo'l bekati yaqin"
      ]
     },
     {
      "fr": "La pharmacie est proche de l'hôtel.",
      "uz": "Dorixona mehmonxonaga yaqin.",
      "uzAlt": [
       "Dorixona va mehmonxona yaqin"
      ]
     },
     {
      "fr": "Le musée est en face de la banque.",
      "uz": "Muzey bankning ro'parasida joylashgan.",
      "uzAlt": [
       "Muzey bank qarshisida"
      ]
     },
     {
      "fr": "Le café est à côté du supermarché.",
      "uz": "Kafeteriya supermarketning yonida.",
      "uzAlt": [
       "Kafe supermarket yonida"
      ]
     },
     {
      "fr": "Il y a un parc derrière l'école.",
      "uz": "Maktabning orqasida bog' bor.",
      "uzAlt": [
       "Maktab ortida istirohat bog'i bor"
      ]
     },
     {
      "fr": "La boulangerie est au coin de la rue.",
      "uz": "Nonvoyxona ko'cha burchagida joylashgan.",
      "uzAlt": [
       "Non do'koni ko'chaning burchagida"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u19",
  "level": "A2",
  "title": "Bayramlar va sanalar",
  "description": "Oylar, sanalar, tug'ilgan kun, Navro'z, Rojdestvo",
  "color": "#2DD4BF",
  "guide": [
   {
    "title": "Oylar va sanalar",
    "text": "Fransuz tilida oylar kichik harflar bilan yoziladi. Oylarning nomidan oldin har doim erkak jinsidagi aniq artikl (le) yoki unlidan boshlansa (l') ishlatiladi.",
    "examples": [
     [
      "Le premier janvier, c'est le Nouvel An.",
      "Birinchi yanvar – bu Yangi yil."
     ],
     [
      "Mon anniversaire est en mars.",
      "Mening tug'ilgan kunim mart oyida."
     ]
    ]
   },
   {
    "title": "Tartib sonlar",
    "text": "Tartib sonlarni yasashda asosiy sonlarga '-ième' qo'shimchasi qo'shiladi. «Premier» so'zi «birinchi» degan ma'noni anglatadi va u jinsga qarab o'zgaradi (première).",
    "examples": [
     [
      "C'est mon deuxième voyage.",
      "Bu mening ikkinchi safarim."
     ],
     [
      "Le troisième mois commence.",
      "Uchinchi oy boshlanmoqda."
     ]
    ]
   },
   {
    "title": "Bayramlar va tabriklar",
    "text": "Bayramlar haqida gapirganda «fête» so'zi ishlatiladi. Tug'ilgan kun va bayramlarni tabriklash uchun maxsus iboralar mavjud.",
    "examples": [
     [
      "Joyeux Noël à tout le monde !",
      "Barchaga quvnoq Rojdestvo!"
     ],
     [
      "Bonne fête de Nauryz !",
      "Navro'z bayrami muborak bo'lsin!"
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u19l1",
    "title": "Oylar va vaqt",
    "words": [
     {
      "fr": "le janvier",
      "uz": "yanvar",
      "emoji": "📅",
      "alt": [
       "yanvar oyi"
      ]
     },
     {
      "fr": "le février",
      "uz": "fevral",
      "emoji": "❄️",
      "alt": [
       "fevral oyi"
      ]
     },
     {
      "fr": "le mars",
      "uz": "mart",
      "emoji": "🌱",
      "alt": [
       "mart oyi"
      ]
     },
     {
      "fr": "l'avril",
      "uz": "aprel",
      "emoji": "🌦️",
      "alt": [
       "aprel oyi"
      ]
     },
     {
      "fr": "le mai",
      "uz": "may",
      "emoji": "🌸",
      "alt": [
       "may oyi"
      ]
     },
     {
      "fr": "le juin",
      "uz": "iyun",
      "emoji": "☀️",
      "alt": [
       "iyun oyi"
      ]
     },
     {
      "fr": "le juillet",
      "uz": "iyul",
      "emoji": "🍉",
      "alt": [
       "iyul oyi"
      ]
     },
     {
      "fr": "l'août",
      "uz": "avgust",
      "emoji": "🏖️",
      "alt": [
       "avgust oyi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Janvier est très froid.",
      "uz": "Yanvar juda sovuq.",
      "uzAlt": [
       "Yanvar oyi juda sovuq."
      ]
     },
     {
      "fr": "Mars apporte les fleurs.",
      "uz": "Mart gullarni olib keladi.",
      "uzAlt": [
       "Mart oyi gullar keltiradi."
      ]
     },
     {
      "fr": "Avril est un beau mois.",
      "uz": "Aprel go'zal oy.",
      "uzAlt": [
       "Aprel – chiroyli oy."
      ]
     },
     {
      "fr": "Mai commence demain.",
      "uz": "May ertaga boshlanadi.",
      "uzAlt": [
       "May oyi ertadan boshlanadi."
      ]
     },
     {
      "fr": "Juin est chaud.",
      "uz": "Iyun issiq.",
      "uzAlt": [
       "Iyun oyi issiq keladi."
      ]
     },
     {
      "fr": "Août est parfait pour voyager.",
      "uz": "Avgust sayohat qilish uchun mukammal.",
      "uzAlt": [
       "Avgust – sayohat uchun eng yaxshi vaqt."
      ]
     }
    ]
   },
   {
    "id": "u19l2",
    "title": "Kuz va qish oylari",
    "words": [
     {
      "fr": "le septembre",
      "uz": "sentabr",
      "emoji": "🎒",
      "alt": [
       "sentabr oyi"
      ]
     },
     {
      "fr": "l'octobre",
      "uz": "oktabr",
      "emoji": "🍂",
      "alt": [
       "oktabr oyi"
      ]
     },
     {
      "fr": "le novembre",
      "uz": "noyabr",
      "emoji": "🌥️",
      "alt": [
       "noyabr oyi"
      ]
     },
     {
      "fr": "le décembre",
      "uz": "dekabr",
      "emoji": "🎄",
      "alt": [
       "dekabr oyi"
      ]
     },
     {
      "fr": "la date",
      "uz": "sana",
      "emoji": "📆",
      "alt": [
       "kun"
      ]
     },
     {
      "fr": "l'anniversaire",
      "uz": "tug'ilgan kun",
      "emoji": "🎂",
      "alt": [
       "tug'ilgan kunim"
      ]
     },
     {
      "fr": "la fête",
      "uz": "bayram",
      "emoji": "🎉",
      "alt": [
       "tntana"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Septembre est le premier mois d'école.",
      "uz": "Sentabr maktabning birinchi oyi.",
      "uzAlt": [
       "Sentabr – maktabning ilk oyi."
      ]
     },
     {
      "fr": "Quelle est la date aujourd'hui ?",
      "uz": "Bugun qaysi sana?",
      "uzAlt": [
       "Bugungi sana qanday?"
      ]
     },
     {
      "fr": "Mon anniversaire est en octobre.",
      "uz": "Tug'ilgan kunim oktabrda.",
      "uzAlt": [
       "Mening tug'ilgan kunim oktabr oyida."
      ]
     },
     {
      "fr": "Décembre apporte la neige.",
      "uz": "Dekabr qor olib keladi.",
      "uzAlt": [
       "Dekabr oyida qor yog'adi."
      ]
     },
     {
      "fr": "C'est une belle fête.",
      "uz": "Bu ajoyib bayram.",
      "uzAlt": [
       "Bu juda yaxshi bayram."
      ]
     },
     {
      "fr": "Pierre aime ce cadeau.",
      "uz": "Pyer bu sovg'ani yaxshi ko'radi.",
      "uzAlt": [
       "Pyerga bu sovg'a yoqadi."
      ]
     }
    ]
   },
   {
    "id": "u19l3",
    "title": "Tartib sonlar",
    "words": [
     {
      "fr": "premier",
      "uz": "birinchi",
      "emoji": "1️⃣",
      "alt": [
       "oldingi"
      ]
     },
     {
      "fr": "deuxième",
      "uz": "ikkinchi",
      "emoji": "2️⃣",
      "alt": [
       "ikkinchidan"
      ]
     },
     {
      "fr": "troisième",
      "uz": "uchinchi",
      "emoji": "3️⃣",
      "alt": [
       "uchinchidan"
      ]
     },
     {
      "fr": "quatrième",
      "uz": "to'rtinchi",
      "emoji": "4️⃣",
      "alt": [
       "to'rtinchidan"
      ]
     },
     {
      "fr": "cinquième",
      "uz": "beshinchi",
      "emoji": "5️⃣",
      "alt": [
       "beshinchidan"
      ]
     },
     {
      "fr": "sixième",
      "uz": "oltinchi",
      "emoji": "6️⃣",
      "alt": [
       "oltinchidan"
      ]
     },
     {
      "fr": "septième",
      "uz": "yettinchi",
      "emoji": "7️⃣",
      "alt": [
       "yettinchidan"
      ]
     },
     {
      "fr": "huitième",
      "uz": "sakkizinchi",
      "emoji": "8️⃣",
      "alt": [
       "sakkizinchidan"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "C'est le premier janvier.",
      "uz": "Bu birinchi yanvar.",
      "uzAlt": [
       "Bu – yanvarning birinchi kuni."
      ]
     },
     {
      "fr": "Sophie lit le deuxième livre.",
      "uz": "Sofi ikkinchi kitobni o'qiyapti.",
      "uzAlt": [
       "Sofi ikkinchi kitobni o'qimoqda."
      ]
     },
     {
      "fr": "Ali habite au troisième étage.",
      "uz": "Ali uchinchi qavatda yashaydi.",
      "uzAlt": [
       "Ali uchinchi qavatda turadi."
      ]
     },
     {
      "fr": "C'est la quatrième leçon.",
      "uz": "Bu to'rtinchi dars.",
      "uzAlt": [
       "Bu – to'rtinchi darsimiz."
      ]
     },
     {
      "fr": "Le cinquième mois est mai.",
      "uz": "Beshinchi oy – may.",
      "uzAlt": [
       "Beshinchi oy bu may."
      ]
     },
     {
      "fr": "Malika attend le sixième invité.",
      "uz": "Malika oltinchi mehmonni kutyapti.",
      "uzAlt": [
       "Malika oltinchi mehmonni kutmoqda."
      ]
     }
    ]
   },
   {
    "id": "u19l4",
    "title": "Navro'z va Rojdestvo",
    "words": [
     {
      "fr": "le Noël",
      "uz": "rojdestvo",
      "emoji": "🌟",
      "alt": [
       "rojdestvo bayrami"
      ]
     },
     {
      "fr": "le Nouvel An",
      "uz": "yangi yil",
      "emoji": "🥳",
      "alt": [
       "yangi yil bayrami"
      ]
     },
     {
      "fr": "la tradition",
      "uz": "an'ana",
      "emoji": "📜",
      "alt": [
       "urf-odat"
      ]
     },
     {
      "fr": "inviter",
      "uz": "taklif qilish",
      "emoji": "💌",
      "alt": [
       "chaqirish"
      ]
     },
     {
      "fr": "danser",
      "uz": "raqs tushish",
      "emoji": "💃",
      "alt": [
       "o'ynash"
      ]
     },
     {
      "fr": "chanter",
      "uz": "kuylash",
      "emoji": "🎤",
      "alt": [
       "qo'shiq aytish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le Nauryz est une belle tradition.",
      "uz": "Navro'z – go'zal an'ana.",
      "uzAlt": [
       "Navro'z bayrami go'zal urf-odatdir."
      ]
     },
     {
      "fr": "Nous fêtons le Nouvel An en décembre.",
      "uz": "Biz Yangi yilni dekabrda nishonlaymiz.",
      "uzAlt": [
       "Biz dekabrda Yangi yilni kutib olamiz."
      ]
     },
     {
      "fr": "Noël est une fête de famille.",
      "uz": "Rojdestvo – oilaviy bayram.",
      "uzAlt": [
       "Rojdestvo bu oila bayrami."
      ]
     },
     {
      "fr": "Sophie veut inviter ses amis.",
      "uz": "Sofi o'z do'stlarini taklif qilmoqchi.",
      "uzAlt": [
       "Sofi do'stlarini taklif qilmoqchi."
      ]
     },
     {
      "fr": "Les enfants aiment chanter et danser.",
      "uz": "Bolalar kuylash va raqs tushishni yaxshi ko'radi.",
      "uzAlt": [
       "Bolalarga qo'shiq aytish va o'ynash yoqadi."
      ]
     },
     {
      "fr": "Pierre prépare un beau cadeau pour le Nauryz.",
      "uz": "Pyer Navro'z uchun chiroyli sovg'a tayyorlayapti.",
      "uzAlt": [
       "Pyer Navro'zga chiroyli sovg'a hozirlamoqda."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u20",
  "level": "A2",
  "title": "Taqqoslash",
  "description": "Odamlar va narsalarni solishtirish",
  "color": "#38BDF8",
  "guide": [
   {
    "title": "Tenglik va solishtirish",
    "text": "Ikki narsa yoki odamning tengligini ko'rsatish uchun \"aussi ... que\" (kabi ... -dek) birikmasi ishlatiladi. Masalan, Ali Pierre kabi uzun bo'yli.",
    "examples": [
     [
      "Ali est aussi grand que Pierre.",
      "Ali Pierre kabi uzun bo'yli."
     ],
     [
      "Sophie est aussi intelligente que Malika.",
      "Sophie Malika kabi aqlli."
     ]
    ]
   },
   {
    "title": "Kamroq va ko'proq",
    "text": "Odamlar yoki narsalarni solishtirganda kamroq uchun \"moins ... que\" va ko'proq uchun \"plus ... que\" ishlatiladi.",
    "examples": [
     [
      "Pierre est plus rapide que Paul.",
      "Pierre Paulga qaraganda tezroq."
     ],
     [
      "Marie est moins bavarde que Sophie.",
      "Marie Sophiega qaraganda kamroq gapiradi."
     ]
    ]
   },
   {
    "title": "Eng va yaxshiroq",
    "text": "Eng yuqori darajani ko'rsatish uchun \"le plus\" yoki \"le moins\" qo'llaniladi. Sifatlar ichida eng yaxshisini aytish uchun esa \"meilleur\" so'zi ishlatiladi.",
    "examples": [
     [
      "C'est le plus grand bâtiment de la ville.",
      "Bu shahardagi eng baland bino."
     ],
     [
      "Ce gâteau est meilleur que l'autre.",
      "Bu tort boshqasidan yaxshiroq."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u20l1",
    "title": "Tenglik va o'xshashlik",
    "words": [
     {
      "fr": "le poids",
      "uz": "vazn",
      "emoji": "⚖️"
     },
     {
      "fr": "l'âge",
      "uz": "yosh",
      "emoji": "🎂"
     },
     {
      "fr": "la force",
      "uz": "kuch",
      "emoji": "💪"
     },
     {
      "fr": "la vitesse",
      "uz": "tezlik",
      "emoji": "⚡"
     },
     {
      "fr": "le talent",
      "uz": "istedod",
      "emoji": "🎨"
     },
     {
      "fr": "la beauté",
      "uz": "go'zallik",
      "emoji": "✨"
     }
    ],
    "sentences": [
     {
      "fr": "Ali est aussi grand que Pierre.",
      "uz": "Ali Pierre kabi bo'yli.",
      "uzAlt": [
       "Ali bilan Pierre bir xil bo'yli."
      ]
     },
     {
      "fr": "Sophie est aussi intelligente que Malika.",
      "uz": "Sophie Malika kabi aqlli.",
      "uzAlt": [
       "Sophie va Malika bir xil darajada aqlli."
      ]
     },
     {
      "fr": "Ce livre est aussi intéressant que l'autre.",
      "uz": "Bu kitob boshqasi kabi qiziqarli.",
      "uzAlt": [
       "Bu kitob narigi kitobdek qiziqarli."
      ]
     },
     {
      "fr": "Mon frère est aussi fort que ton ami.",
      "uz": "Mening akam sening do'sting kabi kuchli.",
      "uzAlt": [
       "Akam do'stingchalik kuchli."
      ]
     },
     {
      "fr": "Cette voiture est aussi rapide que le train.",
      "uz": "Bu mashina poyezd kabi tez.",
      "uzAlt": [
       "Mashina poyezdchalik tez yura oladi."
      ]
     },
     {
      "fr": "La maison est aussi grande que l'hôtel.",
      "uz": "Uy mehmonxona kabi katta.",
      "uzAlt": [
       "Uy va mehmonxona bir xil kattinalikda."
      ]
     }
    ]
   },
   {
    "id": "u20l2",
    "title": "Ko'p va kam",
    "words": [
     {
      "fr": "le calme",
      "uz": "tinchlik",
      "emoji": "🌿"
     },
     {
      "fr": "le bruit",
      "uz": "shovqin",
      "emoji": "📢"
     },
     {
      "fr": "le temps",
      "uz": "vaqt",
      "emoji": "⏳"
     },
     {
      "fr": "l'espace",
      "uz": "bo'shliq",
      "emoji": "🌌"
     },
     {
      "fr": "la lumière",
      "uz": "yorug'lik",
      "emoji": "💡"
     },
     {
      "fr": "l'ombre",
      "uz": "soya",
      "emoji": "🌳"
     }
    ],
    "sentences": [
     {
      "fr": "Pierre est plus grand que Paul.",
      "uz": "Pierre Pauldan uzunroq.",
      "uzAlt": [
       "Pierre Paulga qaraganda balandroq."
      ]
     },
     {
      "fr": "Marie est moins bavarde que Sophie.",
      "uz": "Marie Sophiega qaraganda kamroq gapiradi.",
      "uzAlt": [
       "Marie Sophietan kamroq gapsoz."
      ]
     },
     {
      "fr": "Ce chat est plus rapide que le chien.",
      "uz": "Bu mushuk itdan tezroq.",
      "uzAlt": [
       "Mushuk itga qaraganda tezroq harakatlanadi."
      ]
     },
     {
      "fr": "La chambre est plus claire que le salon.",
      "uz": "Yotoqxona mehmonxonadan yorug'roq.",
      "uzAlt": [
       "Xona mehmonxonaga qaraganda yorug'roq."
      ]
     },
     {
      "fr": "Le travail est moins difficile aujourd'hui.",
      "uz": "Bugun ish unchalik qiyin emas.",
      "uzAlt": [
       "Bugungi ish kechagidan yengilroq."
      ]
     },
     {
      "fr": "L'appartement est plus petit que la maison.",
      "uz": "Kvartira uydan kichikroq.",
      "uzAlt": [
       "Kvartira uyga qaraganda torroq."
      ]
     }
    ]
   },
   {
    "id": "u20l3",
    "title": "Eng zo'r va yaxshi",
    "words": [
     {
      "fr": "le champion",
      "uz": "chempion",
      "emoji": "🏆"
     },
     {
      "fr": "le sommet",
      "uz": "cho'qqi",
      "emoji": "⛰️"
     },
     {
      "fr": "l'expert",
      "uz": "mutaxassis",
      "emoji": "👨‍\ud83d"
     },
     {
      "fr": "le modèle",
      "uz": "namuna",
      "emoji": "📋"
     },
     {
      "fr": "le record",
      "uz": "rekord",
      "emoji": "🎯"
     },
     {
      "fr": "le succès",
      "uz": "muvaffaqiyat",
      "emoji": "⭐"
     },
     {
      "fr": "le trésor",
      "uz": "xazina",
      "emoji": "💎"
     },
     {
      "fr": "l'étoile",
      "uz": "yulduz",
      "emoji": "🌟"
     }
    ],
    "sentences": [
     {
      "fr": "C'est le plus grand bâtiment de la ville.",
      "uz": "Bu shahardagi eng baland bino.",
      "uzAlt": [
       "Bu shaharda eng baland imorat."
      ]
     },
     {
      "fr": "Pierre est le plus intelligent de la classe.",
      "uz": "Pierre sinfdagi eng aqlli o'quvchi.",
      "uzAlt": [
       "Pierre sinfda hammadan aqroqli."
      ]
     },
     {
      "fr": "Ce gâteau est meilleur que l'autre.",
      "uz": "Bu tort narigi tortdan yaxshiroq.",
      "uzAlt": [
       "Bu shirinlik boshqasidan mazaliroq."
      ]
     },
     {
      "fr": "Sophie est la meilleure actrice du monde.",
      "uz": "Sophie dunyodagi eng yaxshi aktrisa.",
      "uzAlt": [
       "Sophie dunyodagi eng zo'r aktrisa."
      ]
     },
     {
      "fr": "C'est le livre le plus intéressant de la bibliothèque.",
      "uz": "Bu kutubxonadagi eng qiziqarli kitob.",
      "uzAlt": [
       "Kutubxonadagi eng zo'r kitob shu."
      ]
     },
     {
      "fr": "Il est le joueur le plus rapide de l'équipe.",
      "uz": "U jamoadagi eng tez o'yinchi.",
      "uzAlt": [
       "U jamoada eng tezkor o'ynaydi."
      ]
     }
    ]
   },
   {
    "id": "u20l4",
    "title": "Farq va afzalliklar",
    "words": [
     {
      "fr": "la différence",
      "uz": "farq",
      "emoji": "🔄"
     },
     {
      "fr": "le choix",
      "uz": "tanlov",
      "emoji": "🔀"
     },
     {
      "fr": "l'avantage",
      "uz": "afzallik",
      "emoji": "📈"
     },
     {
      "fr": "le problème",
      "uz": "muammo",
      "emoji": "❓"
     },
     {
      "fr": "la solution",
      "uz": "yechim",
      "emoji": "💡"
     },
     {
      "fr": "l'effet",
      "uz": "ta'sir",
      "emoji": "🌊"
     },
     {
      "fr": "la cause",
      "uz": "sabab",
      "emoji": "📌"
     },
     {
      "fr": "le résultat",
      "uz": "natija",
      "emoji": "🏁"
     }
    ],
    "sentences": [
     {
      "fr": "Il y a une grande différence entre ces deux voitures.",
      "uz": "Bu ikki mashina o'rtasida katta farq bor.",
      "uzAlt": [
       "Ikki avtomobil bir-biridan sezilarli farq qiladi."
      ]
     },
     {
      "fr": "Ce choix est meilleur pour notre famille.",
      "uz": "Bu tanlov oilamiz uchun yaxshiroq.",
      "uzAlt": [
       "Oilamizga shu tanlov ma'qul keladi."
      ]
     },
     {
      "fr": "Le train a plus d'avantages que le bus.",
      "uz": "Poyezdning avtobusga qaraganda afzalliklari ko'p.",
      "uzAlt": [
       "Poyezdda yurish avtobusdan ko'ra qulayroq."
      ]
     },
     {
      "fr": "C'est la solution la plus simple au problème.",
      "uz": "Bu muammoning eng oson yechimi.",
      "uzAlt": [
       "Muammoni hal qilishning eng sodda yo'li shu."
      ]
     },
     {
      "fr": "Ton idée est meilleure que la mienne.",
      "uz": "Sening g'oyang menikidan yaxshiroq.",
      "uzAlt": [
       "Sizning taklifingiznikidan mening fikrim yaxshi."
      ]
     },
     {
      "fr": "Le résultat est aussi bon que prévu.",
      "uz": "Natija kutilganidek yaxshi chiqdi.",
      "uzAlt": [
       "Natija o'ylaganimizdek a'lo bo'ldi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u21",
  "level": "B1",
  "title": "Bolalik xotiralari",
  "description": "Bolalikdagi odatlar, maktab, o'yinlar",
  "color": "#A78BFA",
  "guide": [
   {
    "title": "Imparfait zamoni",
    "text": "O'tgan zamondagi takrorlanuvchi, odat tusiga kirgan yoki davom etgan harakatlarni ifodalash uchun imparfait zamoni ishlatiladi.",
    "examples": [
     [
      "Quand j'étais petit, je jouais souvent au ballon.",
      "Kichkinaligimda men tez-tez to'p o'ynar edim."
     ],
     [
      "Nous allions à l'école à pied tous les jours.",
      "Biz har kuni maktabga piyoda borar edik."
     ]
    ]
   },
   {
    "title": "Bolalikdagi holatlar",
    "text": "Bolalik xotiralarini tasvirlashda «quand j'étais petit/petite» (kichkinaligimda) iborasi juda ko'p qo'llaniladi.",
    "examples": [
     [
      "Quand j'étais petite, j'avais beaucoup de poupées.",
      "Kichkinaligimda mening ko'p qo'g'irchoqlarim bor edi."
     ],
     [
      "Il habitait dans une vieille maison.",
      "U eski uyda yashar edi."
     ]
    ]
   },
   {
    "title": "Fe'l qo'shimchalari",
    "text": "Imparfait yasash uchun fe'lning 'nous' shaklidagi o'zagiga -ais, -ais, -ait, -ions, -iez, -aient qo'shimchalari qo'shiladi.",
    "examples": [
     [
      "Tu écoutais le maître à l'école.",
      "Sen maktabda o'qituvchini tinglar eding."
     ],
     [
      "Elles chantaient dans la cour de récréation.",
      "Ular tanaffus paytida hovlida qo'shiq aytar edilar."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u21l1",
    "title": "Maktab yillari",
    "words": [
     {
      "fr": "l'école",
      "uz": "maktab",
      "emoji": "🏫",
      "alt": [
       "ta'lim maskani"
      ]
     },
     {
      "fr": "le maître",
      "uz": "o'qituvchi",
      "emoji": "👨‍\ud83c",
      "alt": [
       "ustoz"
      ]
     },
     {
      "fr": "la classe",
      "uz": "sinf",
      "emoji": "🪑",
      "alt": [
       "xonada dars"
      ]
     },
     {
      "fr": "le cahier",
      "uz": "daftar",
      "emoji": "📓",
      "alt": [
       "yozuv daftari"
      ]
     },
     {
      "fr": "le crayon",
      "uz": "qalam",
      "emoji": "✏️",
      "alt": [
       "oddiy qalam"
      ]
     },
     {
      "fr": "la craie",
      "uz": "bo'r",
      "emoji": "🖍️",
      "alt": [
       "taxta bo'ri"
      ]
     },
     {
      "fr": "la leçon",
      "uz": "dars",
      "emoji": "📚",
      "alt": [
       "mashg'ulot"
      ]
     },
     {
      "fr": "la note",
      "uz": "baho",
      "emoji": "⭐",
      "alt": [
       "ball"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Quand j'étais petit, je préparais mes leçons chaque soir.",
      "uz": "Kichkinaligimda men har oqshom darslarimni tayyorlar edim.",
      "uzAlt": [
       "Kichik vaqtimda har kuni kechqurun dars qilardim."
      ]
     },
     {
      "fr": "Le maître écrivait avec la craie sur le tableau noir.",
      "uz": "O'qituvchi qora taxtaga bo'r bilan yozar edi.",
      "uzAlt": [
       "Ustoz taxtaga bo'r yordamida yozardi."
      ]
     },
     {
      "fr": "Sophie dessinait de belles fleurs dans son cahier.",
      "uz": "Sofi o'z daftariga chiroyli gullar chizar edi.",
      "uzAlt": [
       "Sofiya daftariga go'zal gullar rasmini solardi."
      ]
     },
     {
      "fr": "Nous avions de bonnes notes dans cette grande classe.",
      "uz": "Bizning shu katta sinfda yaxshi baholarimiz bor edi.",
      "uzAlt": [
       "Bu ulkan sinfxonada biz yaxshi baholar olar edik."
      ]
     },
     {
      "fr": "Tu perdais souvent ton crayon bleu à l'école.",
      "uz": "Sen maktabda ko'pincha ko'k qalamingni yo'qotib qo'yar eding.",
      "uzAlt": [
       "Sen maktabda tez-tez ko'k qalamingni yo'qotarding."
      ]
     },
     {
      "fr": "Les élèves écoutaient attentivement le maître tous les matins.",
      "uz": "O'quvchilar har kuni ertalab o'qituvchini diqqat bilan tinglar edilar.",
      "uzAlt": [
       "Har tong o'quvchilar muallimni diqqat bilan eshitishardi."
      ]
     }
    ]
   },
   {
    "id": "u21l2",
    "title": "Bolalik o'yinlari",
    "words": [
     {
      "fr": "le ballon",
      "uz": "to'p",
      "emoji": "⚽",
      "alt": [
       "futbol to'pi"
      ]
     },
     {
      "fr": "la poupée",
      "uz": "qo'g'irchoq",
      "emoji": "🪆",
      "alt": [
       "o'yinchoq qo'g'irchoq"
      ]
     },
     {
      "fr": "le vélo",
      "uz": "velosiped",
      "emoji": "🚲",
      "alt": [
       "ikki g'ildirakli velosiped"
      ]
     },
     {
      "fr": "la cour",
      "uz": "hovli",
      "emoji": "🏡",
      "alt": [
       "tashqi hovli"
      ]
     },
     {
      "fr": "le cerf-volant",
      "uz": "varrak",
      "emoji": "🪁",
      "alt": [
       "uchuvchi varrak"
      ]
     },
     {
      "fr": "la cachette",
      "uz": "bekinmachoq",
      "emoji": "🙈",
      "alt": [
       "berkinmachoq o'yini"
      ]
     },
     {
      "fr": "la balançoire",
      "uz": "arg'imchoq",
      "emoji": "🎠",
      "alt": [
       "osilma arg'imchoq"
      ]
     },
     {
      "fr": "le sable",
      "uz": "qum",
      "emoji": "🏖️",
      "alt": [
       "daryo qumi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pierre jouait au ballon dans la grande cour avec ses amis.",
      "uz": "Pyer do'stlari bilan katta hovlida to'p o'ynar edi.",
      "uzAlt": [
       "Pyer o'rtoqlari bilan keng hovlida futbol o'ynardi."
      ]
     },
     {
      "fr": "Quand nous étions jeunes, nous courions sur le sable chaud.",
      "uz": "Biz yosh bo'lganimizda, issiq qum ustida yugurar edik.",
      "uzAlt": [
       "Yoshligimizda qizigan qumda yugurib yurar edik."
      ]
     },
     {
      "fr": "Malika aimait se balancer sur la vieille balançoire.",
      "uz": "Malika eski arg'imchoqda uchishni yaxshi ko'rar edi.",
      "uzAlt": [
       "Malika qari arg'imchoqda uchishni yoqtirardi."
      ]
     },
     {
      "fr": "Tu construisais de superbes châteaux avec le sable.",
      "uz": "Sen qum bilan ajoyib qal'alar qurar eding.",
      "uzAlt": [
       "Sen qumdan ajoyib qasrlar yasarding."
      ]
     },
     {
      "fr": "Elles faisaient voler un grand cerf-volant dans le ciel bleu.",
      "uz": "Ular moviy osmonda katta varrak uchirgan edilar.",
      "uzAlt": [
       "Ular ko'k osmonga ulkan varrak uchirishardi."
      ]
     },
     {
      "fr": "Je cherchais mes camarades pendant le jeu de cachette.",
      "uz": "Men bekinmachoq o'yini paytida o'rtoqlarimni qidirar edim.",
      "uzAlt": [
       "Berkinmachoq o'ynayotganda o'rtoqlarimni izlardim."
      ]
     }
    ]
   },
   {
    "id": "u21l3",
    "title": "Odatlar va qoidalar",
    "words": [
     {
      "fr": "l'habitude",
      "uz": "odat",
      "emoji": "🔄",
      "alt": [
       "an'ana"
      ]
     },
     {
      "fr": "le secret",
      "uz": "sir",
      "emoji": "🤫",
      "alt": [
       "yashirin narsa"
      ]
     },
     {
      "fr": "la règle",
      "uz": "tartib",
      "emoji": "📏",
      "alt": [
       "qoida"
      ]
     },
     {
      "fr": "la bicyclette",
      "uz": "velosiped",
      "emoji": "🚲",
      "alt": [
       "ikki g'ildirakli velosiped"
      ]
     },
     {
      "fr": "le conte",
      "uz": "ertak",
      "emoji": "📖",
      "alt": [
       "hikoya"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le soir, la grand-mère racontait un beau conte aux enfants.",
      "uz": "Kechqurun buvisi bolalarga chiroyli ertak aytib berar edi.",
      "uzAlt": [
       "Oqshom payti buvi bolajonlarga qiziqarli ertak so'zlab berardi."
      ]
     },
     {
      "fr": "Nous avions l'habitude de manger de la soupe chaude en hiver.",
      "uz": "Biz qishda issiq sho'rva ichish odatiga ega edik.",
      "uzAlt": [
       "Biz qish faslida issiq sho'rva iste'mol qilishni odat qilgandik."
      ]
     },
     {
      "fr": "Tu portais toujours un vieux manteau gris quand il faisait froid.",
      "uz": "Sovuq bo'lganda sen doimo eski kulrang palto kiyar eding.",
      "uzAlt": [
       "Havo soviganda sen doimiy ravishda eskirgan kulrang palto kiyarding."
      ]
     },
     {
      "fr": "Sophie respectait toutes les règles strictes de la maison.",
      "uz": "Sofi uydagi barcha qattiq tartiblarga rioya qilar edi.",
      "uzAlt": [
       "Sofiya uyning barcha qat'iy qoidalariga amal qilardi."
      ]
     },
     {
      "fr": "Ils partageaient souvent un petit secret dans le jardin.",
      "uz": "Ular bog'da tez-tez kichik sirni bo'lishar edilar.",
      "uzAlt": [
       "Ular ko'pincha bog'chada bir-birlariga sir aytishardi."
      ]
     },
     {
      "fr": "Quand j'étais petit, je mettais un grand chapeau noir.",
      "uz": "Kichkinaligimda men katta qora bosh kiyim kiyar edim.",
      "uzAlt": [
       "Bolaligimda boshimga katta qora shlyapa taqib yurardim."
      ]
     }
    ]
   },
   {
    "id": "u21l4",
    "title": "Oilaviy xotiralar",
    "words": [
     {
      "fr": "le rire",
      "uz": "kulgi",
      "emoji": "😂",
      "alt": [
       "shodlik"
      ]
     },
     {
      "fr": "les vacances",
      "uz": "ta'til",
      "emoji": "✈️",
      "alt": [
       "hordiq kunlari"
      ]
     },
     {
      "fr": "la rivière",
      "uz": "daryo",
      "emoji": "🌊",
      "alt": [
       "suv oqimi"
      ]
     },
     {
      "fr": "la forêt",
      "uz": "o'rmon",
      "emoji": "🌲",
      "alt": [
       "daraxtzor"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Nous passions nos vacances d'été dans une belle campagne.",
      "uz": "Biz yozgi ta'tilimizni go'zal qishloqda o'tkazar edik.",
      "uzAlt": [
       "Biz yozgi dam olish kunlarini dilrabo qishloqda o'tkazardik."
      ]
     },
     {
      "fr": "Pendant les soirées, le père chantait une douce chanson.",
      "uz": "Kechqurunlari ota yoqimli qo'shiq kuylar edi.",
      "uzAlt": [
       "Oqshom paytlari dada mayin qo'shiq aytib berardi."
      ]
     },
     {
      "fr": "Il y avait beaucoup de rires et de joie dans notre maison.",
      "uz": "Bizning uyimizda ko'plab kulgilar va quvonchlar bor edi.",
      "uzAlt": [
       "Xonadonimiz hamisha shodon kulgi va quvonchga to'la edi."
      ]
     },
     {
      "fr": "Tu marchais longtemps dans la grande forêt verte.",
      "uz": "Sen katta yashil o'rmonda uzoq vaqt piyoda yurar eding.",
      "uzAlt": [
       "Sen yam-yashil o'rmon ichida ko'p yurar eding."
      ]
     },
     {
      "fr": "Ces doux souvenirs restaient toujours gravés dans mon cœur.",
      "uz": "Bu shirin xotiralar doimo qalbimda muhrlanib qolgan edi.",
      "uzAlt": [
       "Mazkur yoqimli esdaliklar yuragimda mangu saqlanardi."
      ]
     },
     {
      "fr": "Ali nageait souvent dans la claire rivière près du village.",
      "uz": "Ali qishloq yaqinidagi tiniq daryoda tez-tez suzar edi.",
      "uzAlt": [
       "Ali ovul bo'yidagi musaffo daryoda ko'p cho'milardi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u22",
  "level": "B1",
  "title": "Hikoya qilish",
  "description": "Voqealar hikoyasi, kutilmagan hodisa",
  "color": "#C084FC",
  "guide": [
   {
    "title": "Passé composé",
    "text": "Passé composé o'tgan zamonda tugallangan bir martalik yoki ketma-ket sodir bo'lgan voqealarni bildiradi. U yordamchi fe'l (avoir yoki être) va asosiy fe'lning o'tgan zamon sifatdoshi (participe passé) yordamida yasaladi.",
    "examples": [
     [
      "Pierre a ouvert la porte.",
      "Pyotr eshikni ochdi."
     ],
     [
      "Sophie est tombée dans la rue.",
      "Sofi ko'chada yiqilib tushdi."
     ]
    ]
   },
   {
    "title": "Imparfait",
    "text": "Imparfait o'tgan zamonda davom etgan, takrorlanib turgan holatlarni yoki voqea sodir bo'layotgan paytdagi fonni tasvirlash uchun ishlatiladi.",
    "examples": [
     [
      "Il pleuvait quand...",
      "Qachonki yomg'ir yog'ayotgan edi..."
     ],
     [
      "Ali lisait un livre.",
      "Ali kitob o'qiyotgan edi."
     ]
    ]
   },
   {
    "title": "Passé composé va Imparfait birgalikda",
    "text": "Kutilmagan hodisalarni hikoya qilishda fonni tasvirlash uchun imparfait, shu fonga to'satdan aralashib qolgan bir martalik qisqa harakat uchun passé composé ishlatiladi.",
    "examples": [
     [
      "Je dormais quand le téléphone a sonné.",
      "Telefon jiringlaganda men uxlab yotgan edim."
     ],
     [
      "Malika marchait quand elle a trouvé une clé.",
      "Malika ketayotganida kalit topib oldi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u22l1",
    "title": "Kutilmagan voqea",
    "words": [
     {
      "fr": "l'événement",
      "uz": "hodisa",
      "emoji": "⚡",
      "alt": [
       "voqea"
      ]
     },
     {
      "fr": "surprendre",
      "uz": "hayron qoldirmoq",
      "emoji": "😲",
      "alt": [
       "tajjublantirmoq"
      ]
     },
     {
      "fr": "soudain",
      "uz": "to'satdan",
      "emoji": "❗",
      "alt": [
       "birdaniga"
      ]
     },
     {
      "fr": "tomber",
      "uz": "yiqilmoq",
      "emoji": "📉",
      "alt": [
       "tushmoq"
      ]
     },
     {
      "fr": "crier",
      "uz": "baqirmoq",
      "emoji": "🗣️",
      "alt": [
       "qichqirmoq"
      ]
     },
     {
      "fr": "courir",
      "uz": "yugurmoq",
      "emoji": "🏃",
      "alt": [
       "chopmoq"
      ]
     },
     {
      "fr": "pleurer",
      "uz": "yig'lamoq",
      "emoji": "😢",
      "alt": [
       "ko'z yosh to'kmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Un événement étrange a surpris Pierre hier.",
      "uz": "Kecha g'alati hodisa Pyotrni hayron qoldirdi.",
      "uzAlt": [
       "Kecha g'alati voqea Pyotrni dovdiratib qo'ydi."
      ]
     },
     {
      "fr": "Sophie a entendu un bruit fort dans la rue.",
      "uz": "Sofi ko'chada baland shovqin eshitdi.",
      "uzAlt": [
       "Sofi ko'chadan baland sado eshitdi."
      ]
     },
     {
      "fr": "Soudain, Ali est tombé sur le sol.",
      "uz": "To'satdan Ali yerga yiqilib tushdi.",
      "uzAlt": [
       "Birdaniga Ali yerga yiqildi."
      ]
     },
     {
      "fr": "Malika a crié quand elle a vu le chat.",
      "uz": "Malika mushukni ko'rganida baqirib yubordi.",
      "uzAlt": [
       "Malika mushukni ko'rib qichqirib yubordi."
      ]
     },
     {
      "fr": "Les enfants couraient quand il a commencé à pleuvoir.",
      "uz": "Yomg'ir yog'a boshlaganda bolalar yugurib yurishgan edi.",
      "uzAlt": [
       "Yomg'ir yog'ayotgan paytda bolalar yugurishayotgan edi."
      ]
     },
     {
      "fr": "Le petit garçon pleurait parce qu'il avait peur.",
      "uz": "Kichkina bola qo'rqqani uchun yig'layotgan edi.",
      "uzAlt": [
       "Kichkina bola qo'rqqanidan yig'layotgan edi."
      ]
     }
    ]
   },
   {
    "id": "u22l2",
    "title": "Tungi sarguzasht",
    "words": [
     {
      "fr": "la peur",
      "uz": "qo'rquv",
      "emoji": "😨",
      "alt": [
       "dahshat"
      ]
     },
     {
      "fr": "trembler",
      "uz": "titramoq",
      "emoji": "🥶",
      "alt": [
       "qaltiramoq"
      ]
     },
     {
      "fr": "cacher",
      "uz": "yashirmoq",
      "emoji": "🙈",
      "alt": [
       "berkitmoq"
      ]
     },
     {
      "fr": "ouvrir",
      "uz": "ochmoq",
      "emoji": "📂",
      "alt": [
       "ochib qo'ymoq"
      ]
     },
     {
      "fr": "disparaître",
      "uz": "g'oyib bo'lmoq",
      "emoji": "👻",
      "alt": [
       "yo'qolib qolmoq"
      ]
     },
     {
      "fr": "apparaître",
      "uz": "paydo bo'lmoq",
      "emoji": "✨",
      "alt": [
       "ko'rinib qolmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Un orage terrible a éclaté pendant la nuit.",
      "uz": "Tungi payt dahshatli momaqaldiroq boshlandi.",
      "uzAlt": [
       "Tunda dahshatli bo'ron ko'tarildi."
      ]
     },
     {
      "fr": "Sophie tremblait de peur dans sa chambre.",
      "uz": "Sofi xonasida qo'rquvdan qaltirayotgan edi.",
      "uzAlt": [
       "Sofi xonasida qo'rquvdan titrayotgan edi."
      ]
     },
     {
      "fr": "Ali a caché sa tête sous la couverture.",
      "uz": "Ali boshini ko'rpa ostiga yashirdi.",
      "uzAlt": [
       "Ali boshini ko'rpaga berkitdi."
      ]
     },
     {
      "fr": "Malika a ouvert la porte de la cuisine lentement.",
      "uz": "Malika oshxona eshigini sekin ochdi.",
      "uzAlt": [
       "Malika sekin oshxona eshigini ochdi."
      ]
     },
     {
      "fr": "Le chat a fermé les yeux pour dormir.",
      "uz": "Mushuk uxlash uchun ko'zlarini yumdi.",
      "uzAlt": [
       "Mushuk uxlash maqsadida ko'zlarini yopdi."
      ]
     },
     {
      "fr": "Une ombre étrange est apparue puis a disparu.",
      "uz": "G'alati soya paydo bo'ldi va keyin g'oyib bo'ldi.",
      "uzAlt": [
       "Bir g'alati soya ko'rinib, so'ng yo'qoldi."
      ]
     }
    ]
   },
   {
    "id": "u22l3",
    "title": "Qidiruv jarayoni",
    "words": [
     {
      "fr": "perdre",
      "uz": "yo'qotmoq",
      "emoji": "❓",
      "alt": [
       "boy bermoq"
      ]
     },
     {
      "fr": "répondre",
      "uz": "javob bermoq",
      "emoji": "💬",
      "alt": [
       "javob qaytarmoq"
      ]
     },
     {
      "fr": "expliquer",
      "uz": "tushuntirmoq",
      "emoji": "💡",
      "alt": [
       "bayon qilmoq"
      ]
     },
     {
      "fr": "comprendre",
      "uz": "tushunib yetmoq",
      "emoji": "🧠",
      "alt": [
       "anglamoq"
      ]
     },
     {
      "fr": "oublier",
      "uz": "unutmoq",
      "emoji": "💭",
      "alt": [
       "esdan chiqarmoq"
      ]
     },
     {
      "fr": "rappeler",
      "uz": "eslatmoq",
      "emoji": "☎️",
      "alt": [
       "qo'ng'iroq qilmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pierre a perdu son portefeuille au marché.",
      "uz": "Pyotr bozorda hamyonini yo'qotib qo'ydi.",
      "uzAlt": [
       "Pyotr bozorda hamyonini boy berdi."
      ]
     },
     {
      "fr": "Il a trouvé son sac sous la table du salon.",
      "uz": "U xonadagi stol ostidan sumkasini topdi.",
      "uzAlt": [
       "U mehmonxona stoli tagidan sumkasini topdi."
      ]
     },
     {
      "fr": "Sophie a demandé le chemin à un policier.",
      "uz": "Sofi politsiyachidan yo'lni so'radi.",
      "uzAlt": [
       "Sofi militsiyadan yo'lni so'rab surishtirdi."
      ]
     },
     {
      "fr": "Le vendeur a répondu avec un grand sourire.",
      "uz": "Sotuvchi keng tabassum bilan javob qaytardi.",
      "uzAlt": [
       "Sotuvchi jilmayib javob berdi."
      ]
     },
     {
      "fr": "Ali a expliqué son problème clairement à sa mère.",
      "uz": "Ali onasiga o'z muammosini aniq tushuntirdi.",
      "uzAlt": [
       "Ali onasiga muammosini ochiq bayon qildi."
      ]
     },
     {
      "fr": "Malika a oublié de fermer la fenêtre.",
      "uz": "Malika derazani yopishni esdan chiqardi.",
      "uzAlt": [
       "Malika derazani yopishni unutib qo'ydi."
      ]
     }
    ]
   },
   {
    "id": "u22l4",
    "title": "Ajoyib uchrashuv",
    "words": [
     {
      "fr": "rencontrer",
      "uz": "uchratmoq",
      "emoji": "🤝",
      "alt": [
       "duch kelmoq"
      ]
     },
     {
      "fr": "saluer",
      "uz": "salomlashmoq",
      "emoji": "👋",
      "alt": [
       "bosh irg'itmoq"
      ]
     },
     {
      "fr": "sourire",
      "uz": "jilmaymoq",
      "emoji": "😊",
      "alt": [
       "tabassum qilmoq"
      ]
     },
     {
      "fr": "partager",
      "uz": "bo'lishmoq",
      "emoji": "🧩",
      "alt": [
       "o'rtoqlashmoq"
      ]
     },
     {
      "fr": "raconter",
      "uz": "hikoya qilmoq",
      "emoji": "📖",
      "alt": [
       "so'zlab bermoq"
      ]
     },
     {
      "fr": "écouter",
      "uz": "tinglamoq",
      "emoji": "🎧",
      "alt": [
       "eshitmoq"
      ]
     },
     {
      "fr": "remercier",
      "uz": "tashakkur bildirmoq",
      "emoji": "🙏",
      "alt": [
       "minnatdorchilik bildirmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pierre a rencontré un vieux copain par hasard.",
      "uz": "Pyotr tasodifan eski o'rtog'ini uchratib qoldi.",
      "uzAlt": [
       "Pyotr tasodifan qadimiy do'stiga duch keldi."
      ]
     },
     {
      "fr": "Ils se sont salués et ont souri joyeusement.",
      "uz": "Ular salomlashib, quvnoq jilmayishdi.",
      "uzAlt": [
       "Ular bir-biriga salom berib, quvonch bilan kulishdi."
      ]
     },
     {
      "fr": "Sophie a invité son amie à boire du thé.",
      "uz": "Sofi dugonasini choy ichishga taklif qildi.",
      "uzAlt": [
       "Sofi do'stini choyxo'rlikka chaqirdi."
      ]
     },
     {
      "fr": "Ali a raconté une histoire incroyable hier soir.",
      "uz": "Ali kecha oqshom ajoyib hikoya so'zlab berdi.",
      "uzAlt": [
       "Ali kecha kechqurun ishonib bo'lmaydigan voqea aytib berdi."
      ]
     },
     {
      "fr": "Malika écoutait attentivement toute la musique.",
      "uz": "Malika butun musiqani diqqat bilan tinglayotgan edi.",
      "uzAlt": [
       "Malika hamma musiqani diqqat bilan eshitib o'tirgan edi."
      ]
     },
     {
      "fr": "Le client a remercié le vendeur chaleureusement.",
      "uz": "Mijoz sotuvchiga samimiy tashakkur bildirdi.",
      "uzAlt": [
       "Xaridor sotuvchiga minnatdorchilik izhor qildi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u23",
  "level": "B1",
  "title": "Kelajak rejalari",
  "description": "Orzular, maqsadlar, kelajak kasbi",
  "color": "#818CF8",
  "guide": [
   {
    "title": "Futur Simple bilan tanishuv",
    "text": "Kelajak zamon (Futur simple) kelgusida sodir bo'ladigan voqea-hodisalarni bildiradi. «Être» fe'li kelajak zamonda quyidagicha tuslanadi: je serai (men bo'laman), tu seras, il/elle sera.",
    "examples": [
     [
      "Je serai médecin.",
      "Men shifokor bo'laman."
     ],
     [
      "Tu seras heureux.",
      "Sen baxtli bo'lasan."
     ]
    ]
   },
   {
    "title": "Avoir fe'lining Futur Simple shakli",
    "text": "«Avoir» (ega bo'lmoq) fe'li kelajak zamonda egalik va kelajakdagi imkoniyatlarni ifodalash uchun ishlatiladi. Masalan: j'aurai (mening bo'ladi), tu auras.",
    "examples": [
     [
      "J'aurai une grande maison.",
      "Mening katta uyim bo'ladi."
     ],
     [
      "Elle aura du succès.",
      "Uning muvaffaqiyati bo'ladi."
     ]
    ]
   },
   {
    "title": "Faire fe'lining Futur Simple shakli",
    "text": "«Faire» (qilmoq, bajarmoq) fe'li kelajakdagi harakatlar va rejalarni aytishda ishlatiladi. Masalan: je ferai (men qilaman), tu feras.",
    "examples": [
     [
      "Je ferai un grand voyage.",
      "Men katta sayohat qilaman."
     ],
     [
      "Il fera un beau travail.",
      "U zo'r ish qiladi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u23l1",
    "title": "Orzular va kasblar",
    "words": [
     {
      "fr": "l'architecte",
      "uz": "arxitektor",
      "emoji": "🏛️",
      "alt": [
       "me'mor"
      ]
     },
     {
      "fr": "l'ingénieur",
      "uz": "muhandis",
      "emoji": "💻",
      "alt": [
       "injener"
      ]
     },
     {
      "fr": "le pilote",
      "uz": "uchuvchi",
      "emoji": "✈️",
      "alt": [
       "pilot"
      ]
     },
     {
      "fr": "l'artiste",
      "uz": "rassom",
      "emoji": "🎨",
      "alt": [
       "san'atkor"
      ]
     },
     {
      "fr": "le musicien",
      "uz": "musiqachi",
      "emoji": "🎵",
      "alt": [
       "sozanda"
      ]
     },
     {
      "fr": "l'écrivain",
      "uz": "yozuvchi",
      "emoji": "✍️",
      "alt": [
       "adib"
      ]
     },
     {
      "fr": "le scientifique",
      "uz": "olim",
      "emoji": "🔬",
      "alt": [
       "tadqiqotchi"
      ]
     },
     {
      "fr": "l'entrepreneur",
      "uz": "tadbirkor",
      "emoji": "💼",
      "alt": [
       "biznesmen"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je serai un grand architecte.",
      "uz": "Men buyuk arxitektor bo'laman.",
      "uzAlt": [
       "Men zo'r me'mor bo'laman."
      ]
     },
     {
      "fr": "Ali sera un ingénieur célèbre.",
      "uz": "Ali mashhur muhandis bo'ladi.",
      "uzAlt": [
       "Ali tanilgan injener bo'ladi."
      ]
     },
     {
      "fr": "Sophie sera une pilote courageuse.",
      "uz": "Sofi jasur uchuvchi bo'ladi.",
      "uzAlt": [
       "Sofi qo'rqmas pilot bo'ladi."
      ]
     },
     {
      "fr": "Je serai un artiste talentueux.",
      "uz": "Men iste'dodli rassom bo'laman.",
      "uzAlt": [
       "Men qobiliyatli san'atkor bo'laman."
      ]
     },
     {
      "fr": "Malika sera une écrivaine connue.",
      "uz": "Malika taniqli yozuvchi bo'ladi.",
      "uzAlt": [
       "Malika mashhur adiba bo'ladi."
      ]
     },
     {
      "fr": "Pierre sera un scientifique intelligent.",
      "uz": "Pyer aqlli olim bo'ladi.",
      "uzAlt": [
       "Pyer zukko tadqiqotchi bo'ladi."
      ]
     }
    ]
   },
   {
    "id": "u23l2",
    "title": "Maqsadlar va rejalar",
    "words": [
     {
      "fr": "le futur",
      "uz": "kelajak",
      "emoji": "🔮",
      "alt": [
       "istiqbol"
      ]
     },
     {
      "fr": "le but",
      "uz": "maqsad",
      "emoji": "🎯",
      "alt": [
       "niyat"
      ]
     },
     {
      "fr": "l'ambition",
      "uz": "ulkan orzu",
      "emoji": "🌟",
      "alt": [
       "intilish",
       "ambitsiya"
      ]
     },
     {
      "fr": "l'effort",
      "uz": "harakat",
      "emoji": "💪",
      "alt": [
       "g'ayrat",
       "kuch"
      ]
     },
     {
      "fr": "le progrès",
      "uz": "o'sish",
      "emoji": "📈",
      "alt": [
       "taraqqiyot"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'aurai un beau futur.",
      "uz": "Mening go'zal kelajagim bo'ladi.",
      "uzAlt": [
       "Chiroyli kelajagim bo'ladi."
      ]
     },
     {
      "fr": "Mon but sera clair.",
      "uz": "Mening maqsadim aniq bo'ladi.",
      "uzAlt": [
       "Maqsadim ravshan bo'ladi."
      ]
     },
     {
      "fr": "J'aurai une grande ambition.",
      "uz": "Mening ulkan orzuim bo'ladi.",
      "uzAlt": [
       "Katta intilishim bo'ladi."
      ]
     },
     {
      "fr": "Je ferai un bon plan.",
      "uz": "Men yaxshi reja tuzaman.",
      "uzAlt": [
       "Men yaxshi reja qilaman."
      ]
     },
     {
      "fr": "Tu auras un grand succès.",
      "uz": "Sening katta muvaffaqiyating bo'ladi.",
      "uzAlt": [
       "Sizda katta yutuq bo'ladi."
      ]
     },
     {
      "fr": "Il fera beaucoup d'efforts.",
      "uz": "U ko'p harakat qiladi.",
      "uzAlt": [
       "U ko'p g'ayrat ko'rsatadi."
      ]
     }
    ]
   },
   {
    "id": "u23l3",
    "title": "Kelajakda nima qilamiz?",
    "words": [
     {
      "fr": "l'entreprise",
      "uz": "kompaniya",
      "emoji": "🏢",
      "alt": [
       "korxona",
       "firma"
      ]
     },
     {
      "fr": "l'université",
      "uz": "universitet",
      "emoji": "🎓",
      "alt": [
       "oliygoh"
      ]
     },
     {
      "fr": "la bourse",
      "uz": "stipendiya",
      "emoji": "📜",
      "alt": [
       "grant"
      ]
     },
     {
      "fr": "le diplôme",
      "uz": "diplom",
      "emoji": "📜",
      "alt": [
       "shahodatnoma"
      ]
     },
     {
      "fr": "la compétence",
      "uz": "ko'nikma",
      "emoji": "💡",
      "alt": [
       "malaka",
       "qobiliyat"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je ferai un long voyage.",
      "uz": "Men uzoq sayohat qilaman.",
      "uzAlt": [
       "Men uzoq safarga chiqaman."
      ]
     },
     {
      "fr": "Sophie aura sa propre entreprise.",
      "uz": "Sofining o'z kompaniyasi bo'ladi.",
      "uzAlt": [
       "Sofi o'z korxonasiga ega bo'ladi."
      ]
     },
     {
      "fr": "Ali aura un beau bureau.",
      "uz": "Alining chiroyli ofisi bo'ladi.",
      "uzAlt": [
       "Alining yaxshi ishxonasi bo'ladi."
      ]
     },
     {
      "fr": "Je serai dans une grande université.",
      "uz": "Men katta universitetda bo'laman.",
      "uzAlt": [
       "Men yirik oliygohda o'qiyman."
      ]
     },
     {
      "fr": "Malika aura une bourse d'études.",
      "uz": "Malikaning o'qish stipendiyasi bo'ladi.",
      "uzAlt": [
       "Malika grant oladi."
      ]
     },
     {
      "fr": "Tu auras un beau diplôme.",
      "uz": "Sening chiroyli diploming bo'ladi.",
      "uzAlt": [
       "Sizda ajoyib diplom bo'ladi."
      ]
     }
    ]
   },
   {
    "id": "u23l4",
    "title": "Orzular ro'yobga chiqadi",
    "words": [
     {
      "fr": "la joie",
      "uz": "quvonch",
      "emoji": "🎉",
      "alt": [
       "shodlik",
       "xursandchilik"
      ]
     },
     {
      "fr": "le bonheur",
      "uz": "baxt",
      "emoji": "🍀",
      "alt": [
       "saodat"
      ]
     },
     {
      "fr": "la liberté",
      "uz": "erkinlik",
      "emoji": "🕊️",
      "alt": [
       "hurriyat"
      ]
     },
     {
      "fr": "la paix",
      "uz": "tinchlik",
      "emoji": "☮️",
      "alt": [
       "osoyishtalik"
      ]
     },
     {
      "fr": "la fortune",
      "uz": "omad",
      "emoji": "⭐",
      "alt": [
       "boylik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'aurai toujours de l'espoir.",
      "uz": "Mening doim umidim bo'ladi.",
      "uzAlt": [
       "Doimo umid qilaman."
      ]
     },
     {
      "fr": "Notre futur aura beaucoup de joie.",
      "uz": "Kelajagimizda ko'p quvonch bo'ladi.",
      "uzAlt": [
       "Kelajagimiz quvonchga to'la bo'ladi."
      ]
     },
     {
      "fr": "Tu seras dans le bonheur.",
      "uz": "Sen baxtda bo'lasan.",
      "uzAlt": [
       "Siz baxtli bo'lasiz."
      ]
     },
     {
      "fr": "Nous aurons une belle liberté.",
      "uz": "Bizning go'zal erkinligimiz bo'ladi.",
      "uzAlt": [
       "Bizda zo'r hurriyat bo'ladi."
      ]
     },
     {
      "fr": "Le monde aura la paix.",
      "uz": "Dunyoning tinchligi bo'ladi.",
      "uzAlt": [
       "Dunyo tinch bo'ladi."
      ]
     },
     {
      "fr": "Ils auront une bonne santé.",
      "uz": "Ularning mustahkam salomatligi bo'ladi.",
      "uzAlt": [
       "Ular sog'lom bo'ladilar."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u24",
  "level": "B1",
  "title": "Ish va kasb",
  "description": "Ish joyi, ish izlash, intervyu, hamkasblar",
  "color": "#E879F9",
  "guide": [
   {
    "title": "Conditionnel Présent",
    "text": "Conditionnel présent xohish, muloyim iltimos va maslahat bildirish uchun ishlatiladi. U fe'lning kelasi zamon asosi va imparfait qo'shimchalari (-ais, -ais, -ait, -ions, -iez, -aient) yordamida yasaladi.",
    "examples": [
     [
      "Je voudrais un café.",
      "Men kofe xohlagan bo'lar edim."
     ],
     [
      "Pourriez-vous m'aider ?",
      "Menga yordam bera olasizmi?"
     ]
    ]
   },
   {
    "title": "Muloyim so'rovlar",
    "text": "Fransuz tilida ish joyida yoki suhbatda xushmuomala bo'lish uchun 'pourriez-vous' (qila olasizmi) yoki 'j'aimerais' (xohlagan bo'lar edim) iboralari juda qo'l keladi.",
    "examples": [
     [
      "J'aimerais travailler ici.",
      "Men bu yerda ishlashni xohlagan bo'lar edim."
     ],
     [
      "Pourriez-vous répéter ?",
      "Takrorlay olasizmi?"
     ]
    ]
   },
   {
    "title": "Ish joyi leksikasi",
    "text": "Ish joyi va kasbga oid so'zlarni o'rganish intervyu va hamkasblar bilan muloqot qilishda juda muhimdir.",
    "examples": [
     [
      "Le patron est gentil.",
      "Boshliq mehribon."
     ],
     [
      "Elle cherche un emploi.",
      "U ish qidirmoqda."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u24l1",
    "title": "Ish joyi va ofis",
    "words": [
     {
      "fr": "le patron",
      "uz": "boshliq",
      "emoji": "👔",
      "alt": [
       "direktor"
      ]
     },
     {
      "fr": "la réunion",
      "uz": "yig'ilish",
      "emoji": "📊",
      "alt": [
       "majlis"
      ]
     },
     {
      "fr": "le contrat",
      "uz": "shartnoma",
      "emoji": "📄",
      "alt": [
       "kontrakt"
      ]
     },
     {
      "fr": "le salaire",
      "uz": "maosh",
      "emoji": "💰",
      "alt": [
       "oylik"
      ]
     },
     {
      "fr": "le dossier",
      "uz": "hujjat",
      "emoji": "📁",
      "alt": [
       "papka"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je voudrais signer le contrat aujourd'hui.",
      "uz": "Men bugun shartnomani imzolamoqchi edim.",
      "uzAlt": [
       "Bugun shartnomani imzolashni xohlayman."
      ]
     },
     {
      "fr": "Pourriez-vous préparer le dossier pour la réunion ?",
      "uz": "Yig'ilish uchun hujjatni tayyorlay olasizmi?",
      "uzAlt": [
       "Yig'ilishga papkani tayyorlay olasizmi?"
      ]
     },
     {
      "fr": "J'aimerais parler avec le patron.",
      "uz": "Men boshliq bilan gaplashishni xohlagan bo'lar edim.",
      "uzAlt": [
       "Boshliq bilan gaplashmoqchiman."
      ]
     },
     {
      "fr": "L'employé travaille dans son bureau.",
      "uz": "Xodim o'z ishxonasida ishlaydi.",
      "uzAlt": [
       "Ishchi ofisida ishlamoqda."
      ]
     },
     {
      "fr": "Le salaire est très important pour moi.",
      "uz": "Maosh men uchun juda muhim.",
      "uzAlt": [
       "Oylik men uchun juda muhim."
      ]
     },
     {
      "fr": "Pourriez-vous allumer l'ordinateur ?",
      "uz": "Kompyuterni yoqa olasizmi?",
      "uzAlt": [
       "Noutbukni yoqa olasizmi?"
      ]
     }
    ]
   },
   {
    "id": "u24l2",
    "title": "Ish izlash",
    "words": [
     {
      "fr": "l'emploi",
      "uz": "ish",
      "emoji": "💼",
      "alt": [
       "bandlik"
      ]
     },
     {
      "fr": "le CV",
      "uz": "rezyume",
      "emoji": "📝",
      "alt": [
       "tarjimai hol"
      ]
     },
     {
      "fr": "l'annonce",
      "uz": "e'lon",
      "emoji": "📰",
      "alt": [
       "xabar"
      ]
     },
     {
      "fr": "l'offre",
      "uz": "taklif",
      "emoji": "🤝",
      "alt": [
       "ish taklifi"
      ]
     },
     {
      "fr": "la profession",
      "uz": "kasb",
      "emoji": "🔧",
      "alt": [
       "mutaxassislik"
      ]
     },
     {
      "fr": "le candidat",
      "uz": "nomzod",
      "emoji": "👤",
      "alt": [
       "talabgor"
      ]
     },
     {
      "fr": "l'expérience",
      "uz": "tajriba",
      "emoji": "📈",
      "alt": [
       "amaliyot"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je chercherais un nouvel emploi.",
      "uz": "Men yangi ish qidirgan bo'lar edim.",
      "uzAlt": [
       "Yangi ish qidirmoqchiman."
      ]
     },
     {
      "fr": "Pourriez-vous m'envoyer votre CV ?",
      "uz": "Menga rezyumengizni yubora olasizmi?",
      "uzAlt": [
       "Siz o'z tarjimai holingizni yubora olasizmi?"
      ]
     },
     {
      "fr": "J'aimerais lire cette annonce.",
      "uz": "Men bu e'lonni o'qishni xohlagan bo'lar edim.",
      "uzAlt": [
       "Ushbu e'lonni o'qimoqchiman."
      ]
     },
     {
      "fr": "Le candidat a beaucoup d'expérience.",
      "uz": "Nomzodning tajribasi ko'p.",
      "uzAlt": [
       "Talabgorda katta tajriba bor."
      ]
     },
     {
      "fr": "Pourriez-vous accepter cette offre ?",
      "uz": "Bu taklifni qabul qila olasizmi?",
      "uzAlt": [
       "Siz ushbu taklifni qabul qila olasizmi?"
      ]
     },
     {
      "fr": "Cette profession demande de bonnes compétences.",
      "uz": "Bu kasb yaxshi malaka talab qiladi.",
      "uzAlt": [
       "Ushbu mutaxassislik yaxshi malaka so'raydi."
      ]
     }
    ]
   },
   {
    "id": "u24l3",
    "title": "Intervyu",
    "words": [
     {
      "fr": "l'entretien",
      "uz": "suhbat",
      "emoji": "🗣️",
      "alt": [
       "intervyu"
      ]
     },
     {
      "fr": "la motivation",
      "uz": "motivatsiya",
      "emoji": "🚀",
      "alt": [
       "rag'bat"
      ]
     },
     {
      "fr": "la qualité",
      "uz": "sifat",
      "emoji": "⭐",
      "alt": [
       "afzallik"
      ]
     },
     {
      "fr": "le défaut",
      "uz": "kamchilik",
      "emoji": "⚠️",
      "alt": [
       "nuqson"
      ]
     },
     {
      "fr": "le stress",
      "uz": "stress",
      "emoji": "😰",
      "alt": [
       "hayajon"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je voudrais réussir mon entretien.",
      "uz": "Suhbatimdan muvaffaqiyatli o'tishni xohlagan bo'lar edim.",
      "uzAlt": [
       "Intervyudan yaxshi o'tmoqchiman."
      ]
     },
     {
      "fr": "Pourriez-vous répondre à cette question ?",
      "uz": "Bu savolga javob bera olasizmi?",
      "uzAlt": [
       "Siz ushbu savolga javob bera olasizmi?"
      ]
     },
     {
      "fr": "J'aimerais expliquer ma motivation.",
      "uz": "O'z motivatsiyamni tushuntirmoqchi edim.",
      "uzAlt": [
       "Motivatsiyamni tushuntirmoqchiman."
      ]
     },
     {
      "fr": "Le stress est normal pendant l'entretien.",
      "uz": "Suhbat paytida stress normal holat.",
      "uzAlt": [
       "Intervyu vaqtida hayajonlanish odatiy hol."
      ]
     },
     {
      "fr": "Pourriez-vous parler de vos qualités ?",
      "uz": "Sifatlaringiz haqida gapirib bera olasizmi?",
      "uzAlt": [
       "O'z afzalliklaringiz haqida gapira olasizmi?"
      ]
     },
     {
      "fr": "Chaque candidat a un défaut et un succès.",
      "uz": "Har bir nomzodda kamchilik va muvaffaqiyat bor.",
      "uzAlt": [
       "Har bir talabgorda nuqson ham, yutuq ham bo'ladi."
      ]
     }
    ]
   },
   {
    "id": "u24l4",
    "title": "Hamkasblar va jamoa",
    "words": [
     {
      "fr": "le collègue",
      "uz": "hamkasb",
      "emoji": "👥",
      "alt": [
       "jamoadosh"
      ]
     },
     {
      "fr": "l'équipe",
      "uz": "jamoa",
      "emoji": "🤝",
      "alt": [
       "guruh"
      ]
     },
     {
      "fr": "la pause",
      "uz": "tanaffus",
      "emoji": "☕",
      "alt": [
       "fasil"
      ]
     },
     {
      "fr": "l'aide",
      "uz": "yordam",
      "emoji": "🤲",
      "alt": [
       "ko'mak"
      ]
     },
     {
      "fr": "l'avis",
      "uz": "fikr",
      "emoji": "💭",
      "alt": [
       "nuqtai nazar"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je voudrais aider mon collègue.",
      "uz": "Men hamkasbigam yordam berishni xohlagan bo'lar edim.",
      "uzAlt": [
       "Hamkasbimizga ko'maklashmoqchiman."
      ]
     },
     {
      "fr": "Pourriez-vous partager votre avis ?",
      "uz": "Fikringizni o'rtoqlasha olasizmi?",
      "uzAlt": [
       "O'z nuqtai nazaringizni bildira olasizmi?"
      ]
     },
     {
      "fr": "J'aimerais travailler avec cette équipe.",
      "uz": "Bu jamoa bilan ishlashni xohlagan bo'lar edim.",
      "uzAlt": [
       "Ushbu guruh bilan ishlamoqchiman."
      ]
     },
     {
      "fr": "Nous avons une pause pour le café.",
      "uz": "Bizda kofe uchun tanaffus bor.",
      "uzAlt": [
       "Kofe ichish uchun fasilimiz bor."
      ]
     },
     {
      "fr": "Pourriez-vous trouver une solution au problème ?",
      "uz": "Muammoga yechim topa olasizmi?",
      "uzAlt": [
       "Masalani hal qilolasizmi?"
      ]
     },
     {
      "fr": "Ce projet est très important pour l'équipe.",
      "uz": "Bu loyiha jamoa uchun juda muhim.",
      "uzAlt": [
       "Ushbu reja guruh uchun juda ahamiyatli."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u25",
  "level": "B1",
  "title": "Fikr bildirish",
  "description": "Munozara, rozilik/norozilik",
  "color": "#8B5CF6",
  "guide": [
   {
    "title": "Fikr bildirish va o'z fikrini ifodalash",
    "text": "Fransuz tilida o'z fikringizni bildirish uchun «je pense que» (o'ylaymanki), «à mon avis» (mening fikrimcha), «je trouve que» (hisoblaymanki) kabi iboralardan foydalaniladi. Bu iboralar suhbatda o'z nuqtai nazringizni madaniyatli tarzda yetkazishga yordam beradi.",
    "examples": [
     [
      "Je pense que c'est une bonne idée.",
      "O'ylaymanki, bu yaxshi g'oya."
     ],
     [
      "À mon avis, cette situation est compliquée.",
      "Mening fikrimcha, bu vaziyat murakkab."
     ]
    ]
   },
   {
    "title": "Rozilik va norozilik bildirish",
    "text": "Munozara paytida suhbatdoshning fikriga qo'shilish yoki qo'shilmaslikni ko'rsatish uchun maxsus fe'l va so'zlar ishlatiladi. Masalan, «je suis d'accord» (men roziman) yoki «je ne suis pas d'accord» (men rozi emasman).",
    "examples": [
     [
      "Je suis d'accord avec toi.",
      "Men sening bilan roziman."
     ],
     [
      "Je ne suis pas d'accord avec cette opinion.",
      "Men bu fikrga rozi emasman."
     ]
    ]
   },
   {
    "title": "Taassurot va ehtimollarni ifodalash",
    "text": "Biror narsa haqida taxmin qilish yoki shaxsiy taassurotni bildirish uchun «il me semble que» (menga shunday tuyuladiki) iborasi ishlatiladi. Bu munozaralarga yumshoqlik va muloyimlik baxsh etadi.",
    "examples": [
     [
      "Il me semble que Pierre a raison.",
      "Menga P yer haq ekanligidek tuyulmoqda."
     ],
     [
      "Il me semble que nous avons besoin de temps.",
      "Menga vaqt kerakligimiz tuyulmoqda."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u25l1",
    "title": "Fikr bildirish asoslari",
    "words": [
     {
      "fr": "l'opinion",
      "uz": "fikr",
      "emoji": "💭",
      "alt": [
       "nuqtai nazar",
       "qarash"
      ]
     },
     {
      "fr": "l'argument",
      "uz": "dalil",
      "emoji": "📊",
      "alt": [
       "argument"
      ]
     },
     {
      "fr": "le débat",
      "uz": "munozara",
      "emoji": "🗣️",
      "alt": [
       "bahs"
      ]
     },
     {
      "fr": "discuter",
      "uz": "muhokama qilish",
      "emoji": "💬",
      "alt": [
       "suhbatlashish"
      ]
     },
     {
      "fr": "penser",
      "uz": "o'ylash",
      "emoji": "🧠",
      "alt": [
       "fikrlash"
      ]
     },
     {
      "fr": "sembler",
      "uz": "tuyulmoq",
      "emoji": "👁️",
      "alt": [
       "ko'rinmoq"
      ]
     },
     {
      "fr": "exprimer",
      "uz": "ifodalash",
      "emoji": "✍️",
      "alt": [
       "bayon etish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je pense que ce débat est très intéressant pour tout le monde.",
      "uz": "O'ylaymanki, bu munozara hamma uchun juda qiziqarli.",
      "uzAlt": [
       "Menimcha, bu bahs barcha uchun nihoyatda qiziq."
      ]
     },
     {
      "fr": "À mon avis, ton argument principal est vraiment convaincant aujourd'hui.",
      "uz": "Mening fikrimcha, bugun sening asosiy daliling haqiqatan ham ishontirarli.",
      "uzAlt": [
       "Meningcha, sening asosiy argumenting rostdan ham ishonchli."
      ]
     },
     {
      "fr": "Je trouve que Sophie sait très bien exprimer son opinion personnelle.",
      "uz": "Men Sofi o'z shaxsiy fikrini juda yaxshi ifodalay olishini hisoblayman.",
      "uzAlt": [
       "Sofi o'zining shaxsiy qarashlarini a'lo darajada bayon eta olishini bilaman."
      ]
     },
     {
      "fr": "Il me semble que nous devons discuter de ce projet important maintenant.",
      "uz": "Menga shunday tuyuladiki, biz hozir shu muhim loyihani muhokama qilishimiz kerak.",
      "uzAlt": [
       "Biz hozir bu muhim loyiha haqida gaplashishimiz kerakdek tuyulmoqda."
      ]
     },
     {
      "fr": "Ali aime discuter avec ses amis pour exprimer sa propre opinion.",
      "uz": "Ali o'zining shaxsiy fikrini bildirish uchun do'stlari bilan muhokama qilishni yaxshi ko'radi.",
      "uzAlt": [
       "Ali o'z qarashlarini ifodalash maqsadida do'stlari bilan bahslashishni yoqtiradi."
      ]
     },
     {
      "fr": "Malika pense que chaque argument dans ce débat est utile.",
      "uz": "Malika bu munozaradagi har bir dalil foydali deb o'ylaydi.",
      "uzAlt": [
       "Malikaning fikricha, ushbu bahsdagi har bir argument foydali."
      ]
     }
    ]
   },
   {
    "id": "u25l2",
    "title": "Rozilik va norozilik",
    "words": [
     {
      "fr": "l'accord",
      "uz": "kelishuv",
      "emoji": "🤝",
      "alt": [
       "rozilik"
      ]
     },
     {
      "fr": "le désaccord",
      "uz": "kelishmovchilik",
      "emoji": "⚡",
      "alt": [
       "norozilik"
      ]
     },
     {
      "fr": "approuver",
      "uz": "ma'qullash",
      "emoji": "👍",
      "alt": [
       "tasdiqlash"
      ]
     },
     {
      "fr": "rejeter",
      "uz": "rad etish",
      "emoji": "❌",
      "alt": [
       "inkor qilish"
      ]
     },
     {
      "fr": "accepter",
      "uz": "qabul qilish",
      "emoji": "🤲",
      "alt": [
       "rozi bo'lmoq"
      ]
     },
     {
      "fr": "contester",
      "uz": "e'tiroz bildirish",
      "emoji": "⚖️",
      "alt": [
       "talashish"
      ]
     },
     {
      "fr": "opposer",
      "uz": "qarshi chiqish",
      "emoji": "🛡️",
      "alt": [
       "solishtirish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je suis tout à fait d'accord avec ton accord sur ce point.",
      "uz": "Men bu masala bo'yicha sening kelishuving bilan to'liq roziman.",
      "uzAlt": [
       "Sizning bu nuqta bo'yicha kelishuvingizni to'la qo'llab-quvvatlayman."
      ]
     },
     {
      "fr": "Pierre n'aime pas rejeter les propositions sans approuver les bonnes idées.",
      "uz": "P yer yaxshi g'oyalarni ma'qullamasdan takliflarni rad etishni yoqtirmaydi.",
      "uzAlt": [
       "P yer yaxshi fikrlarni tasdiqlamasdan turib takliflarni rad etishni yomon ko'radi."
      ]
     },
     {
      "fr": "Je trouve que Malika veut toujours contester chaque désaccord en public.",
      "uz": "Malika har doim har qanday kelishmovchilikka ochiqchasiga e'tiroz bildirmoqchi bo'lishini hisoblayman.",
      "uzAlt": [
       "Malika doimo barcha noroziliklarga omma oldida e'tiroz bildirishni xohlaydi deb o'ylayman."
      ]
     },
     {
      "fr": "Il me semble que nous pouvons accepter cette solution sans opposer d'arguments.",
      "uz": "Menga shunday tuyuladiki, biz hech qanday dalilga qarshi chiqmasdan bu yechimni qabul qilishimiz mumkin.",
      "uzAlt": [
       "Hech qanday e'tiroz bildirmasdan ushbu yechimni qabul qila olsak kerak deb o'ylayman."
      ]
     },
     {
      "fr": "Sophie préfère partager son opinion pour éviter tout désaccord grave.",
      "uz": "Sofi har qanday jiddiy kelishmovchilikning oldini olish uchun o'z fikrini bo'lishishni afzal ko'radi.",
      "uzAlt": [
       "Sofi jiddiy noroziliklardan qochish maqsadida o'z qarashlarini o'rtoqlashishni yaxshiroq ko'radi."
      ]
     },
     {
      "fr": "Ali pense qu'on doit approuver les bonnes décisions prises ensemble.",
      "uz": "Ali birgalikda qabul qilingan yaxshi qarorlarni ma'qullashimiz kerak deb o'ylaydi.",
      "uzAlt": [
       "Alining fikricha, birgalikda qabul qilingan to'g'ri qarorlarni qo'llab-quvvatlash lozim."
      ]
     }
    ]
   },
   {
    "id": "u25l3",
    "title": "Nuqtai nazar va isbotlar",
    "words": [
     {
      "fr": "la preuve",
      "uz": "dalil-isbot",
      "emoji": "🔍",
      "alt": [
       "isbot"
      ]
     },
     {
      "fr": "le fait",
      "uz": "fakt",
      "emoji": "📌",
      "alt": [
       "hodisa"
      ]
     },
     {
      "fr": "la vérité",
      "uz": "haqiqat",
      "emoji": "✨",
      "alt": [
       "rostgo'ylik"
      ]
     },
     {
      "fr": "l'erreur",
      "uz": "xato",
      "emoji": "⚠️",
      "alt": [
       "yanglishish"
      ]
     },
     {
      "fr": "prouver",
      "uz": "isbotlash",
      "emoji": "🔬",
      "alt": [
       "tasdiqlamoq"
      ]
     },
     {
      "fr": "mentir",
      "uz": "yolg'on gapirish",
      "emoji": "🤥",
      "alt": [
       "aldash"
      ]
     },
     {
      "fr": "croire",
      "uz": "ishonish",
      "emoji": "🙏",
      "alt": [
       "e'tiqod qilish"
      ]
     },
     {
      "fr": "douter",
      "uz": "shubha qilish",
      "emoji": "❓",
      "alt": [
       "gumon qilmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je pense que tu peux prouver cette vérité avec une vraie preuve.",
      "uz": "O'ylaymanki, sen bu haqiqatni haqiqiy isbot bilan isbotlay olasan.",
      "uzAlt": [
       "Menimcha, siz bu haqiqatni real dalil bilan ko'rsata olasiz."
      ]
     },
     {
      "fr": "À mon avis, ce fait important montre une grande erreur dans le système.",
      "uz": "Mening fikrimcha, bu muhim fakt tizimdagi katta xatoni ko'rsatmoqda.",
      "uzAlt": [
       "Meningcha, ushbu muhim hodisa tizimdagi jiddiy yanglishishni namoyon qiladi."
      ]
     },
     {
      "fr": "Je trouve que Pierre commence à douter de la vérité de cette histoire.",
      "uz": "P yer bu hikoyaning haqiqatiga shubha qila boshlayotganini hisoblayman.",
      "uzAlt": [
       "P yer mazkur voqea rostgo'yligidan gumonsiray boshlaganiga ishonchim komil."
      ]
     },
     {
      "fr": "Il me semble que personne ne veut mentir sur un fait aussi clair.",
      "uz": "Menga shunday tuyuladiki, hech kim bunchalik aniq fakt haqida yolg'on gapirishni xohlamaydi.",
      "uzAlt": [
       "Bunday ravshan hodisa borasida hech kim aldashni istamasa kerak deb o'ylayman."
      ]
     },
     {
      "fr": "Sophie croit que chaque erreur peut nous aider à trouver la solution.",
      "uz": "Sofi har bir xato bizga yechim topishga yordam berishiga ishonadi.",
      "uzAlt": [
       "Sofining ishonishicha, har qanday yanglishish yechim topishimizda ko'maklashadi."
      ]
     },
     {
      "fr": "Ali et Malika veulent prouver la vérité sans faire aucune erreur.",
      "uz": "Ali va Malika hech qanday xatoga yo'l qo'ymasdan haqiqatni isbotlashni xohlashadi.",
      "uzAlt": [
       "Ali bilan Malika biron marta ham adashmasdan haqiqatni ko'rsatishni istashadi."
      ]
     }
    ]
   },
   {
    "id": "u25l4",
    "title": "Munozara va xulosalar",
    "words": [
     {
      "fr": "la conclusion",
      "uz": "xulosa",
      "emoji": "🏁",
      "alt": [
       "yakun"
      ]
     },
     {
      "fr": "la suggestion",
      "uz": "taklif",
      "emoji": "💡",
      "alt": [
       "tavsiya"
      ]
     },
     {
      "fr": "l'idée",
      "uz": "g'oya",
      "emoji": "💭",
      "alt": [
       "fikr"
      ]
     },
     {
      "fr": "résoudre",
      "uz": "hal qilish",
      "emoji": "🧩",
      "alt": [
       "yechish"
      ]
     },
     {
      "fr": "proposer",
      "uz": "tavsiya qilish",
      "emoji": "🎁",
      "alt": [
       "taklif qilmoq"
      ]
     },
     {
      "fr": "conclure",
      "uz": "xulosa chiqarish",
      "emoji": "📝",
      "alt": [
       "yakunlamoq"
      ]
     },
     {
      "fr": "persuader",
      "uz": "ishontirish",
      "emoji": "🤝",
      "alt": [
       "ko'ndirmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je pense que nous pouvons conclure cette réunion avec une bonne conclusion.",
      "uz": "O'ylaymanki, biz bu yig'ilishni yaxshi xulosa bilan yakunlay olamiz.",
      "uzAlt": [
       "Menimcha, ushbu yig'inni ijobiy xulosa bilan tugatsak bo'ladi."
      ]
     },
     {
      "fr": "À mon avis, ta suggestion est une idée magnifique pour résoudre le problème.",
      "uz": "Mening fikrimcha, sening taklifing muammoni hal qilish uchun ajoyib g'oya.",
      "uzAlt": [
       "Sizning tavsiyangiz masalani yechish yo'lidagi ajoyib g'oya deb o'ylayman."
      ]
     },
     {
      "fr": "Je trouve que Pierre essaie de persuader tout le monde avec sa suggestion.",
      "uz": "P yer hammaikalarni o'z taklifi bilan ishontirishga harakat qilayotganini hisoblayman.",
      "uzAlt": [
       "P yer o'zining tavsiyasi orqali hamma narsani ko'ndirmoqchi ekanligini sezdim."
      ]
     },
     {
      "fr": "Il me semble que Sophie a bien compris l'idée principale de notre proposition.",
      "uz": "Menga shunday tuyuladiki, Sofi bizning taklifimizdagi asosiy g'oyani yaxshi tushundi.",
      "uzAlt": [
       "Sofi taklifimizning asosiy mazmunini yaxshi anglab yetdi deb o'ylayman."
      ]
     },
     {
      "fr": "Ali veut proposer une nouvelle idée pour résoudre ce grand problème.",
      "uz": "Ali bu katta muammoni hal qilish uchun yangi g'oya taklif qilmoqchi.",
      "uzAlt": [
       "Ali ushbu ulkan masalani yechish maqsadida yangi fikr bermoqchi."
      ]
     },
     {
      "fr": "Malika pense qu'il est facile de conclure après une telle discussion.",
      "uz": "Malika bunday muhokamadan keyin xulosa chiqarish oson deb o'ylaydi.",
      "uzAlt": [
       "Malikaning fikricha, shunday suhbatdan so'ng yakun yasash qiyin emas."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u26",
  "level": "B1",
  "title": "Y va en olmoshlari",
  "description": "Joylar va miqdorlar haqida gapirish",
  "color": "#A78BFA",
  "guide": [
   {
    "title": "«Y» olmoshi",
    "text": "«Y» olmoshi oldindan tilga olingan yoki ma'lum bo'lgan joyni (à, dans, sur, sous va hokazo prepozisiyalar bilan kelgan so'zlarni) almashtiradi va «u yerda», «o'sha yerga» degan ma'noni beradi. U odatda fe'ldan oldin qo'yiladi.",
    "examples": [
     [
      "Tu vas à Paris ? Oui, j'y vais.",
      "Parijga ketyapsanmi? Ha, men u yerga ketyapman."
     ],
     [
      "Il habite dans cette maison ? Non, il n'y habite pas.",
      "U bu uyda yashaydimi? Yo'q, u u yerda yashamaydi."
     ]
    ]
   },
   {
    "title": "«En» olmoshi",
    "text": "«En» olmoshi «de» prepozisiyasi bilan boshlanadigan otlarni yoki miqdor bildiruvchi so'zlarni almashtiradi. U «undan», «shundan», «ulardan» yoki miqdor uchun «...ta» degan ma'nolarni anglatadi.",
    "examples": [
     [
      "Tu veux du café ? Oui, j'en veux.",
      "Kofe xohlaysizmi? Ha, men shundan xohlayman."
     ],
     [
      "Tu as des frères ? Oui, j'en ai deux.",
      "Aka-ukalaringiz bormi? Ha, menda ikkita bor."
     ]
    ]
   },
   {
    "title": "Joy va miqdorlar",
    "text": "Fransuz tilida joy va miqdorlarni bildirganda «y» va «en» olmoshlaridan foydalanish gapni qisqaroq va ravonroq qiladi. Ular takrorlanishning oldini olish uchun juda muhimdir.",
    "examples": [
     [
      "Tu penses à ton avenir ? J'y pense souvent.",
      "Kelajaging haqida o'ylayapsanmi? Men u haqida tez-tez o'ylayman."
     ],
     [
      "Tu bois de l'eau ? J'en bois beaucoup.",
      "Suv ichasanmi? Men ko'p ichaman."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u26l1",
    "title": "Joyni almashtirish",
    "words": [
     {
      "fr": "la plage",
      "uz": "plyaj",
      "emoji": "🏖️",
      "alt": [
       "sohil"
      ]
     },
     {
      "fr": "le bureau de poste",
      "uz": "pochta bo'limi",
      "emoji": "🏣",
      "alt": [
       "pochta"
      ]
     },
     {
      "fr": "la station",
      "uz": "bekat",
      "emoji": "🚉",
      "alt": [
       "stansiya"
      ]
     },
     {
      "fr": "le port",
      "uz": "port",
      "emoji": "⚓",
      "alt": [
       "bandargoh"
      ]
     },
     {
      "fr": "la terrasse",
      "uz": "ayvon",
      "emoji": "☕",
      "alt": [
       "terrasa"
      ]
     },
     {
      "fr": "le centre",
      "uz": "markaz",
      "emoji": "🏙️",
      "alt": [
       "shahar markazi"
      ]
     },
     {
      "fr": "la capitale",
      "uz": "poytaxt",
      "emoji": "🏛️",
      "alt": [
       "bosh shahar"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Tu vas au parc ? Oui, j'y vais maintenant.",
      "uz": "Parkga ketyapsanmi? Ha, men hozir u yerga ketyapman.",
      "uzAlt": [
       "Siz parkga boryapsizmi? Ha, men hozir u yerga boryapman."
      ]
     },
     {
      "fr": "Sophie habite à Paris ? Oui, elle y habite.",
      "uz": "Sofi Parijda yashaydimi? Ha, u u yerda yashaydi.",
      "uzAlt": [
       "Sophie Parijda yashaydimi? Ha, u o'sha yerda yashaydi."
      ]
     },
     {
      "fr": "Pierre travaille au bureau de poste ? Non, il n'y travaille pas.",
      "uz": "Pyer pochta bo'limida ishlaydimi? Yo'q, u u yerda ishlamaydi.",
      "uzAlt": [
       "Pierre pochta bo'limida ishlaydimi? Yo'q, u o'sha yerda ishlamaydi."
      ]
     },
     {
      "fr": "Tu penses à ces vacances ? J'y pense tous les jours.",
      "uz": "Sen bu ta'til haqida o'ylayapsanmi? Men u haqida har kuni o'ylayman.",
      "uzAlt": [
       "Siz bu ta'til haqida o'ylayapsizmi? Men u haqida har kuni o'ylayman."
      ]
     },
     {
      "fr": "Malika est sur la terrasse ? Oui, elle y est assise.",
      "uz": "Malika ayvonda turibdimi? Ha, u o'sha yerda o'tiribdi.",
      "uzAlt": [
       "Malika terrasada turibdimi? Ha, u u yerda o'tiribdi."
      ]
     },
     {
      "fr": "Tu participes à ce projet ? Oui, j'y participe.",
      "uz": "Sen bu loyihada qatnashasanmi? Ha, men u yerda qatnashaman.",
      "uzAlt": [
       "Siz bu loyihada ishtirok etasizmi? Ha, men unda ishtirok etaman."
      ]
     }
    ]
   },
   {
    "id": "u26l2",
    "title": "Hayotiy vaziyatlar",
    "words": [
     {
      "fr": "la bibliothèque",
      "uz": "kutubxona",
      "emoji": "📚",
      "alt": [
       "kitobxonada"
      ]
     },
     {
      "fr": "le musée d'art",
      "uz": "san'at muzeyi",
      "emoji": "🖼️",
      "alt": [
       "muzey"
      ]
     },
     {
      "fr": "le stade",
      "uz": "stadion",
      "emoji": "🏟️",
      "alt": [
       "sport majmuasi"
      ]
     },
     {
      "fr": "la piscine",
      "uz": "suzish havzasi",
      "emoji": "🏊",
      "alt": [
       "basseyn"
      ]
     },
     {
      "fr": "la pharmacie centrale",
      "uz": "markaziy dorixona",
      "emoji": "💊",
      "alt": [
       "dorixona"
      ]
     },
     {
      "fr": "le cinéma municipal",
      "uz": "shahar kinoteatri",
      "emoji": "🎬",
      "alt": [
       "kinoteatr"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Tu vas à la bibliothèque ? Oui, j'y vais pour lire.",
      "uz": "Kutubxonaga ketyapsanmi? Ha, men o'qish uchun u yerga ketyapman.",
      "uzAlt": [
       "Siz kutubxonaga boryapsizmi? Ha, men mutolaa qilish uchun u yerga boryapman."
      ]
     },
     {
      "fr": "Il y a des livres intéressants là-bas ? Oui, j'en ai trouvé trois.",
      "uz": "U yerda qiziqarli kitoblar bormi? Ha, men ulardan uchtasini topdim.",
      "uzAlt": [
       "O'sha yerda qiziqarli kitoblar bormi? Ha, men uchta topdim."
      ]
     },
     {
      "fr": "Tu vas au stade ? Oui, j'y vais pour voir le match.",
      "uz": "Stadionga ketyapsanmi? Ha, men o'yinni ko'rish uchun u yerga ketyapman.",
      "uzAlt": [
       "Siz stadionga boryapsizmi? Ha, men matchni ko'rish uchun o'sha yerga boryapman."
      ]
     },
     {
      "fr": "Tu as des billets pour le cinéma ? Oui, j'en ai deux.",
      "uz": "Kinoteatrga chiptalaringiz bormi? Ha, menda ikkitasi bor.",
      "uzAlt": [
       "Sizda kino uchun chiptalar bormi? Ha, menda ikkita bor."
      ]
     },
     {
      "fr": "Vous allez à la piscine ? Oui, nous y allons chaque semaine.",
      "uz": "Suzish havzasiga boryapsizmi? Ha, biz u yerga har hafta boramiz.",
      "uzAlt": [
       "Siz basseynga boryapsizmi? Ha, biz o'sha yerga har hafta boramiz."
      ]
     },
     {
      "fr": "Tu bois du thé au café ? Oui, j'en bois souvent.",
      "uz": "Kafeda choy ichasanmi? Ha, men tez-tez shundan ichaman.",
      "uzAlt": [
       "Siz kafeda choy ichasizmi? Ha, men u yerdan tez-tez ichaman."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u27",
  "level": "B1",
  "title": "Nisbiy olmoshlar",
  "description": "Odamlar va narsalarni tavsiflash",
  "color": "#C084FC",
  "guide": [
   {
    "title": "Qui va que",
    "text": "«Qui» olmoshi ergash gapda ega vazifasini bajaradi va undan keyin fe'l keladi. «Que» olmoshi esa to'ldiruvchi vazifasini bajaradi va undan keyin ega keladi.",
    "examples": [
     [
      "L'homme qui parle est mon ami.",
      "Gapirayotgan odam mening do'stim."
     ],
     [
      "La robe que tu portes est belle.",
      "Siz kiyib olgan ko'ylak chiroyli."
     ]
    ]
   },
   {
    "title": "Où olmoshi",
    "text": "«Où» olmoshi makon yoki paytni bildiradi va o'zbek tilidagi «...digan joyda» yoki «qaysiki» ma'nosiga mos keladi.",
    "examples": [
     [
      "La ville où je vis est calme.",
      "Men yashaydigan shahar sokin."
     ],
     [
      "Le jour où nous sommes arrivés était ensoleillé.",
      "Biz kelgan kun quyoshli edi."
     ]
    ]
   },
   {
    "title": "Dont olmoshi",
    "text": "«Dont» olmoshi «de» ko'makchisi bilan keladigan fe'l yoki sifatlarni to'ldiradi va egalik yoki aloqani bildiradi.",
    "examples": [
     [
      "C'est le livre dont je parle.",
      "Bu men gapirayotgan kitob."
     ],
     [
      "La fille dont les yeux sont bleus.",
      "Ko'zlari ko'k bo'lgan qiz."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u27l1",
    "title": "Qui va que",
    "words": [
     {
      "fr": "le voisin",
      "uz": "qo'shni",
      "emoji": "👨",
      "alt": [
       "qo'shni erkak"
      ]
     },
     {
      "fr": "la voisine",
      "uz": "qo'shni ayol",
      "emoji": "👩",
      "alt": [
       "qo'shni qiz"
      ]
     },
     {
      "fr": "l'ami",
      "uz": "do'st",
      "emoji": "🤝",
      "alt": [
       "o'rtoq"
      ]
     },
     {
      "fr": "l'amie",
      "uz": "dugona",
      "emoji": "👭",
      "alt": [
       "ayol do'st"
      ]
     },
     {
      "fr": "l'étranger",
      "uz": "chet ellik",
      "emoji": "🌍",
      "alt": [
       "notanish odam"
      ]
     },
     {
      "fr": "la personne",
      "uz": "shaxs",
      "emoji": "👤",
      "alt": [
       "inson"
      ]
     },
     {
      "fr": "le citoyen",
      "uz": "fuqaro",
      "emoji": "🆔"
     },
     {
      "fr": "le propriétaire",
      "uz": "mulkdor",
      "emoji": "🏠",
      "alt": [
       "uy egasi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le voisin qui habite ici est très gentil.",
      "uz": "Bu yerda yashovchi qo'shni juda mehribon.",
      "uzAlt": [
       "Bu yerda yashaydigan qo'shni juda yaxshi odam."
      ]
     },
     {
      "fr": "La voisine que tu connais est partie.",
      "uz": "Siz taniydigan qo'shni ketib qoldi.",
      "uzAlt": [
       "Sen taniydigan qo'shni ketdi."
      ]
     },
     {
      "fr": "L'ami qui vient ce soir est français.",
      "uz": "Bugun kechqurun kelayotgan do'st fransuz.",
      "uzAlt": [
       "Kechqurun keladigan do'stimiz fransiyalik."
      ]
     },
     {
      "fr": "L'amie que j'invite adore la musique.",
      "uz": "Men taklif qilayotgan dugona musiqani yaxshi ko'radi.",
      "uzAlt": [
       "Taklif etgan dugonam musiqani sevadi."
      ]
     },
     {
      "fr": "L'étranger qui parle anglais cherche l'hôtel.",
      "uz": "Inglizcha gaplashayotgan chet ellik mehmonxonani qidirmoqda.",
      "uzAlt": [
       "Ingliz tilida gapiradigan chet ellik mehmonxonani qidiryapti."
      ]
     },
     {
      "fr": "La personne que tu cherches est là-bas.",
      "uz": "Sen qidirayotgan shaxs ana u yerda.",
      "uzAlt": [
       "Siz qidirayotgan odam o'sha yerda."
      ]
     }
    ]
   },
   {
    "id": "u27l2",
    "title": "Où olmoshi",
    "words": [
     {
      "fr": "le quartier",
      "uz": "mahalla",
      "emoji": "🏘️",
      "alt": [
       "daha"
      ]
     },
     {
      "fr": "le village",
      "uz": "qishloq",
      "emoji": "🏡",
      "alt": [
       "ovul"
      ]
     },
     {
      "fr": "l'endroit",
      "uz": "joy",
      "emoji": "📍",
      "alt": [
       "makon"
      ]
     },
     {
      "fr": "la région",
      "uz": "viloyat",
      "emoji": "🗺️",
      "alt": [
       "mintaqa"
      ]
     },
     {
      "fr": "la province",
      "uz": "provinsiya",
      "emoji": "🏞️",
      "alt": [
       "hudud"
      ]
     },
     {
      "fr": "la place publique",
      "uz": "maydon",
      "emoji": "⛲",
      "alt": [
       "jamoat joyi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La rue où nous marchons est calme.",
      "uz": "Biz yurayotgan ko'cha sokin.",
      "uzAlt": [
       "Biz sayr qilayotgan ko'cha tinch."
      ]
     },
     {
      "fr": "Le quartier où Ali habite est grand.",
      "uz": "Ali yashaydigan mahalla katta.",
      "uzAlt": [
       "Ali yashaydigan daha keng."
      ]
     },
     {
      "fr": "La ville où je suis né est belle.",
      "uz": "Men tug'ilgan shahar chiroyli.",
      "uzAlt": [
       "Tug'ilib o'sgan shahrim go'zal."
      ]
     },
     {
      "fr": "Le village où se trouve ma maison est vert.",
      "uz": "Mening uyim joylashgan qishloq yashil.",
      "uzAlt": [
       "Uyim turgan qishloq tabiatan yashil."
      ]
     },
     {
      "fr": "L'endroit où nous allons est loin.",
      "uz": "Biz ketayotgan joy uzoq.",
      "uzAlt": [
       "Bormoqchi bo'lgan joyimiz uzoqda."
      ]
     },
     {
      "fr": "La région où il travaille est chaude.",
      "uz": "U ishlaydigan mintaqa issiq.",
      "uzAlt": [
       "U mehnat qilayotgan hudud iqlimi issiq."
      ]
     }
    ]
   },
   {
    "id": "u27l3",
    "title": "Dont olmoshi",
    "words": [
     {
      "fr": "le roman",
      "uz": "roman",
      "emoji": "📖",
      "alt": [
       "asar"
      ]
     },
     {
      "fr": "le film d'auteur",
      "uz": "mualliflik kino",
      "emoji": "🎬",
      "alt": [
       "kino"
      ]
     },
     {
      "fr": "la chanson française",
      "uz": "fransuzcha qo'shiq",
      "emoji": "🎵",
      "alt": [
       "musiqiy ashula"
      ]
     },
     {
      "fr": "le tableau",
      "uz": "rasm",
      "emoji": "🖼️",
      "alt": [
       "kartina"
      ]
     },
     {
      "fr": "l'histoire d'amour",
      "uz": "sevgi qissasi",
      "emoji": "❤️",
      "alt": [
       "muhabbat hikoyasi"
      ]
     },
     {
      "fr": "le sujet",
      "uz": "mavzu",
      "emoji": "📝",
      "alt": [
       "predmet"
      ]
     },
     {
      "fr": "le secret de famille",
      "uz": "sir",
      "emoji": "🤫",
      "alt": [
       "maxfiy ish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le livre dont tu parles est captivant.",
      "uz": "Sen gapirayotgan kitob juda qiziqarli.",
      "uzAlt": [
       "Siz tilga olayotgan kitob o'ziga jalb qiladi."
      ]
     },
     {
      "fr": "Le roman dont l'auteur est célèbre plaît à tous.",
      "uz": "Muallifi mashhur bo'lgan roman barchaga yoqadi.",
      "uzAlt": [
       "Yozuvchisi tanilgan asar hammaga manzur."
      ]
     },
     {
      "fr": "Le film dont je rêve est au cinéma.",
      "uz": "Men orzu qilgan kino kinoteatrda namoyish etilmoqda.",
      "uzAlt": [
       "Kutgan filmimiz kinoda qo'yilmoqda."
      ]
     },
     {
      "fr": "La chanson dont le rythme est rapide est moderne.",
      "uz": "Ritmi tez bo'lgan qo'shiq zamonaviy.",
      "uzAlt": [
       "Kuylash tezligi tez bo'lgan ashula zamonaviy."
      ]
     },
     {
      "fr": "Le tableau dont les couleurs sont vives est beau.",
      "uz": "Ranglari yorqin bo'lgan rasm chiroyli.",
      "uzAlt": [
       "Bo'yoqlari och bo'lgan kartina go'zal."
      ]
     },
     {
      "fr": "L'histoire dont tout le monde parle est vraie.",
      "uz": "Hamma gaplashayotgan voqea rost.",
      "uzAlt": [
       "Barcha muhokama qilayotgan qissa haqiqiy."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u28",
  "level": "B1",
  "title": "Sport va salomatlik",
  "description": "Sog'lom turmush, sport, ovqatlanish",
  "color": "#818CF8",
  "guide": [
   {
    "title": "Il faut",
    "text": "Il faut fe'li majburiyat yoki zaruriyatni bildiradi va undan keyin har doim fe'l infinitivda ishlatiladi. Bu shaxsiz shakl bo'lib, umumiy qoidalarni tushuntirish uchun juda qulay.",
    "examples": [
     [
      "Il faut manger des légumes.",
      "Sabzavot iste'mol qilish kerak."
     ],
     [
      "Il faut faire du sport tous les jours.",
      "Har kuni sport bilan shug'ullanish kerak."
     ]
    ]
   },
   {
    "title": "Devoir fe'li",
    "text": "Devoir fe'li shaxsga qarab tuslanadi va aniq bir shaxsning majburiyatini ko'rsatadi. U orqali kimdir nima qilish kerakligini aniq ayta olamiz.",
    "examples": [
     [
      "Tu dois boire beaucoup d'eau.",
      "Ko'p suv ichishing kerak."
     ],
     [
      "Nous devons respecter notre corps.",
      "Biz o'z tana a'zolarimizni hurmat qilishimiz kerak."
     ]
    ]
   },
   {
    "title": "Maslahat berish",
    "text": "Birovga maslahat berish uchun devoir fe'lining shart mayili (conditionnel) shakli ishlatiladi. Masalan, tu devrais – sen maslahat berayotganda sen ... ganing ma'qul bo'lardi degan ma'noni beradi.",
    "examples": [
     [
      "Tu devrais dormir plus tôt.",
      "Ertairoq uxlaganing ma'qul bo'lardi."
     ],
     [
      "Pierre devrait marcher chaque matin.",
      "Piyer har tong sayr qilishi lozim."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u28l1",
    "title": "Sog'lom turmush",
    "words": [
     {
      "fr": "le sommeil",
      "uz": "uyqu",
      "emoji": "😴",
      "alt": [
       "hordiq",
       "tinchlik"
      ]
     },
     {
      "fr": "la vitamine",
      "uz": "vitamin",
      "emoji": "💊",
      "alt": [
       "darmondori"
      ]
     },
     {
      "fr": "le repos",
      "uz": "dam",
      "emoji": "🛋️",
      "alt": [
       "dam olish"
      ]
     },
     {
      "fr": "l'énergie",
      "uz": "quvvat",
      "emoji": "⚡",
      "alt": [
       "energiya"
      ]
     },
     {
      "fr": "respirer",
      "uz": "nafas olmoq",
      "emoji": "🫁",
      "alt": [
       "nafas"
      ]
     },
     {
      "fr": "marcher",
      "uz": "piyoda yurmoq",
      "emoji": "🚶",
      "alt": [
       "sayr qilmoq"
      ]
     },
     {
      "fr": "bouger",
      "uz": "harakat qilmoq",
      "emoji": "🤸",
      "alt": [
       "siljimoq"
      ]
     },
     {
      "fr": "méditer",
      "uz": "mulohaza qilmoq",
      "emoji": "🧘",
      "alt": [
       "fikrlash"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut respirer de l'air frais.",
      "uz": "Toza havo bilan nafas olish kerak.",
      "uzAlt": [
       "Toza havo yutish lozim."
      ]
     },
     {
      "fr": "Tu dois bouger plus souvent.",
      "uz": "Tez-tez harakat qilishing kerak.",
      "uzAlt": [
       "Sen tez-tez siljishing lozim."
      ]
     },
     {
      "fr": "Il faut trouver un bon sommeil.",
      "uz": "Yaxshi uyqu topish kerak.",
      "uzAlt": [
       "Yaxshi dam olish zarur."
      ]
     },
     {
      "fr": "Tu devrais marcher chaque soir.",
      "uz": "Har oqshom piyoda yurganing ma'qul bo'lardi.",
      "uzAlt": [
       "Sen har kecha sayr qilganing yaxshi edi."
      ]
     },
     {
      "fr": "Il faut manger de la vitamine.",
      "uz": "Vitamin iste'mol qilish kerak.",
      "uzAlt": [
       "Darmondori yeyish lozim."
      ]
     },
     {
      "fr": "Tu dois méditer pour le repos.",
      "uz": "Dam olish uchun mulohaza qilishing kerak.",
      "uzAlt": [
       "Hordiq chiqarish maqsadida fikrlashing lozim."
      ]
     }
    ]
   },
   {
    "id": "u28l2",
    "title": "Sport va mashq",
    "words": [
     {
      "fr": "l'exercice",
      "uz": "mashq",
      "emoji": "🏋️",
      "alt": [
       "badantarbiya"
      ]
     },
     {
      "fr": "le muscle",
      "uz": "mushak",
      "emoji": "💪",
      "alt": [
       "et"
      ]
     },
     {
      "fr": "nager",
      "uz": "suzish",
      "emoji": "🏊",
      "alt": [
       "suzmoq"
      ]
     },
     {
      "fr": "sauter",
      "uz": "sakramoq",
      "emoji": "🦘",
      "alt": [
       "sakrash"
      ]
     },
     {
      "fr": "gagner",
      "uz": "g'alaba qozonmoq",
      "emoji": "🏆",
      "alt": [
       "yutmoq"
      ]
     },
     {
      "fr": "transpirer",
      "uz": "terlash",
      "emoji": "💦",
      "alt": [
       "ter chiqmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut faire un exercice difficile.",
      "uz": "Qiyin mashq bajarish kerak.",
      "uzAlt": [
       "Og'ir badantarbiya qilish lozim."
      ]
     },
     {
      "fr": "Tu devrais courir dans le parc.",
      "uz": "Bog'da yugurganing ma'qul bo'lardi.",
      "uzAlt": [
       "Sen parkda chopganing yaxshi edi."
      ]
     },
     {
      "fr": "Il faut nager pour le muscle.",
      "uz": "Mushak uchun suzish kerak.",
      "uzAlt": [
       "Mushaklar uchun suzish zarur."
      ]
     },
     {
      "fr": "Tu dois sauter très haut.",
      "uz": "Juda baland sakrashing kerak.",
      "uzAlt": [
       "Sen juda baland sakrashing lozim."
      ]
     },
     {
      "fr": "Il faut gagner le match.",
      "uz": "O'yinda g'alaba qozonish kerak.",
      "uzAlt": [
       "Matchni yutish zarur."
      ]
     },
     {
      "fr": "Tu devrais transpirer un peu.",
      "uz": "Biroz terlaganing ma'qul bo'lardi.",
      "uzAlt": [
       "Sen biroz ter chiqarganing yaxshi edi."
      ]
     }
    ]
   },
   {
    "id": "u28l3",
    "title": "To'g'ri ovqatlanish",
    "words": [
     {
      "fr": "le régime",
      "uz": "parhez",
      "emoji": "🥗",
      "alt": [
       "tartib"
      ]
     },
     {
      "fr": "le légume",
      "uz": "sabzavot",
      "emoji": "🥕",
      "alt": [
       "ko'kat"
      ]
     },
     {
      "fr": "la céréale",
      "uz": "g'alla",
      "emoji": "🌾",
      "alt": [
       "yorma"
      ]
     },
     {
      "fr": "cuisiner",
      "uz": "pishirmoq",
      "emoji": "🍳",
      "alt": [
       "ovqat tayyorlamoq"
      ]
     },
     {
      "fr": "mâcher",
      "uz": "chaynamoq",
      "emoji": "🦷",
      "alt": [
       "chaynash"
      ]
     },
     {
      "fr": "avaler",
      "uz": "yutmoq",
      "emoji": "👅",
      "alt": [
       "yutish"
      ]
     },
     {
      "fr": "digérer",
      "uz": "hazm qilmoq",
      "emoji": "🥣",
      "alt": [
       "hazm"
      ]
     },
     {
      "fr": "maigrir",
      "uz": "ozmoq",
      "emoji": "📉",
      "alt": [
       "ozish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut suivre un régime sain.",
      "uz": "Sog'lom parhezga amal qilish kerak.",
      "uzAlt": [
       "To'g'ri ovqatlanish tartibiga rioya qilish lozim."
      ]
     },
     {
      "fr": "Tu dois cuisiner le légume frais.",
      "uz": "Yangi sabzavotni pishirishing kerak.",
      "uzAlt": [
       "Sen yangi ko'katni tayyorlashing lozim."
      ]
     },
     {
      "fr": "Il faut mâcher lentement.",
      "uz": "Sekin chaynamoq kerak.",
      "uzAlt": [
       "Sekin chaynash lozim."
      ]
     },
     {
      "fr": "Tu devrais manger la céréale.",
      "uz": "G'alla mahsulotini yeganing ma'qul bo'lardi.",
      "uzAlt": [
       "Sen yorma iste'mol qilganing yaxshi edi."
      ]
     },
     {
      "fr": "Il faut bien digérer le repas.",
      "uz": "Ovqatni yaxshi hazm qilish kerak.",
      "uzAlt": [
       "Yemakni yaxshi hazm qilish lozim."
      ]
     },
     {
      "fr": "Tu dois maigrir pour la santé.",
      "uz": "Salomatlik uchun ozishing kerak.",
      "uzAlt": [
       "Salomatlik deb ozishing lozim."
      ]
     }
    ]
   },
   {
    "id": "u28l4",
    "title": "Tana salomatligi",
    "words": [
     {
      "fr": "guérir",
      "uz": "tuzalmoq",
      "emoji": "🩹",
      "alt": [
       "davolamoq"
      ]
     },
     {
      "fr": "souffrir",
      "uz": "azoblanmoq",
      "emoji": "🤕",
      "alt": [
       "qiynalmoq"
      ]
     },
     {
      "fr": "consulter",
      "uz": "maslahatlashmoq",
      "emoji": "👨‍⚕",
      "alt": [
       "shifokorga bormoq"
      ]
     },
     {
      "fr": "isoler",
      "uz": "ajratmoq",
      "emoji": "🧱",
      "alt": [
       "chetlatmoq"
      ]
     },
     {
      "fr": "protéger",
      "uz": "himoya qilmoq",
      "emoji": "🛡️",
      "alt": [
       "asrash"
      ]
     },
     {
      "fr": "soigner",
      "uz": "parvarish qilmoq",
      "emoji": "🩺",
      "alt": [
       "davolamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut trouver la force en soi.",
      "uz": "O'zida kuch topish kerak.",
      "uzAlt": [
       "O'zingda quvvat topish lozim."
      ]
     },
     {
      "fr": "Tu devrais consulter le médecin.",
      "uz": "Shifokor bilan maslahatlashganing ma'qul bo'lardi.",
      "uzAlt": [
       "Sen doktorga borganing yaxshi edi."
      ]
     },
     {
      "fr": "Il faut protéger son corps.",
      "uz": "O'z tanasini himoya qilish kerak.",
      "uzAlt": [
       "Tanani asrash lozim."
      ]
     },
     {
      "fr": "Tu dois soigner ta blessure.",
      "uz": "Jarohatingni davolashing kerak.",
      "uzAlt": [
       "Sen yara-chaqangni parvarish qilishing lozim."
      ]
     },
     {
      "fr": "Il faut guérir rapidement.",
      "uz": "Tezda tuzalish kerak.",
      "uzAlt": [
       "Tezroq sog'ayish lozim."
      ]
     },
     {
      "fr": "Tu devrais moins souffrir.",
      "uz": "Kamroq azoblanganing ma'qul bo'lardi.",
      "uzAlt": [
       "Sen kamroq qiynalganing yaxshi edi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u29",
  "level": "B1",
  "title": "Texnologiya",
  "description": "Internet, telefon, ijtimoiy tarmoqlar, kompyuter",
  "color": "#E879F9",
  "guide": [
   {
    "title": "Ega olmoshlari",
    "text": "Fransuz tilida egalik olmoshlari (le mien, la tienne va hokazo) kimga tegishli ekanini ko'rsatadi va otning jinsi hamda soniga moslashadi.",
    "examples": [
     [
      "C'est mon ordinateur, le mien est plus rapide.",
      "Bu mening kompyuterim, menikisi tezroq."
     ],
     [
      "Ta tablette est jolie, mais la tienne est ancienne.",
      "Sizning planshetingiz chiroyli, lekin seniki eskirgan."
     ]
    ]
   },
   {
    "title": "Qo'shma gaplar",
    "text": "Qo'shma gaplar 'que', 'qui', 'dont' kabi bog'lovchilar yordamida ikkita fikrni bitta murakkab gapga birlashtirish uchun ishlatiladi.",
    "examples": [
     [
      "Je sais que tu utilises Internet tous les jours.",
      "Men har kuni internetdan foydalanishingni bilaman."
     ],
     [
      "Voici le réseau social qui est très populaire.",
      "Mana juda mashhur bo'lgan ijtimoiy tarmoq."
     ]
    ]
   },
   {
    "title": "Internet va Aloqa",
    "text": "Texnologiya va aloqaga oid so'zlarni ishlatganda tegishli artikllarni to'g'ri qo'llash muhim hisoblanadi.",
    "examples": [
     [
      "Il cherche un bon réseau Wi-Fi dans la rue.",
      "U ko'chada yaxshi Wi-Fi tarmog'ini qidirmoqda."
     ],
     [
      "Elle envoie un message important avec son smartphone.",
      "U o'zining smartfoni bilan muhim xabar yubormoqda."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u29l1",
    "title": "Internet va Tarmoqlar",
    "words": [
     {
      "fr": "l'internet",
      "uz": "internet",
      "emoji": "🌐",
      "alt": [
       "tarmoq"
      ]
     },
     {
      "fr": "le site",
      "uz": "veb-sayt",
      "emoji": "💻",
      "alt": [
       "sayt"
      ]
     },
     {
      "fr": "le lien",
      "uz": "havola",
      "emoji": "🔗",
      "alt": [
       "silka"
      ]
     },
     {
      "fr": "le réseau",
      "uz": "tarmoq",
      "emoji": "📡",
      "alt": [
       "aloqa tarmog'i"
      ]
     },
     {
      "fr": "le navigateur",
      "uz": "brauzer",
      "emoji": "🧭",
      "alt": [
       "qidiruv dasturi"
      ]
     },
     {
      "fr": "le mot de passe",
      "uz": "parol",
      "emoji": "🔑",
      "alt": [
       "maxfiy so'z"
      ]
     },
     {
      "fr": "le compte",
      "uz": "akkaunt",
      "emoji": "👤",
      "alt": [
       "shaxsiy sahifa",
       "hisob"
      ]
     },
     {
      "fr": "la page",
      "uz": "sahifa",
      "emoji": "📄",
      "alt": [
       "internet sahifasi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je sais que le mien est plus rapide que le tien.",
      "uz": "Meniki senikidan tezroq ekanini bilaman.",
      "uzAlt": [
       "Men bilamanki, menikisi senikidan tezroq."
      ]
     },
     {
      "fr": "Malika cherche un site qui fonctionne très bien aujourd'hui.",
      "uz": "Malika bugun juda yaxshi ishlaydigan veb-saytni qidirmoqda.",
      "uzAlt": [
       "Malika bugun juda yaxshi ishlayotgan saytni qidiryapti."
      ]
     },
     {
      "fr": "Pierre a oublié le mot de passe de son compte personnel.",
      "uz": "Pierre o'zining shaxsiy akkaunti parolini unutib qo'ydi.",
      "uzAlt": [
       "Pyer o'z shaxsiy hisobining parolini unutdi."
      ]
     },
     {
      "fr": "Sophie utilise le navigateur que tu as recommandé hier soir.",
      "uz": "Sophie kecha kechqurun sen tavsiya qilgan brauzerdan foydalanmoqda.",
      "uzAlt": [
       "Sofi kecha tavsiya qilgan brauzeringizni ishlatmoqda."
      ]
     },
     {
      "fr": "Ce lien mène vers une page qui contient des informations utiles.",
      "uz": "Bu havola foydali ma'lumotlarni o'z ichiga olgan sahifaga olib boradi.",
      "uzAlt": [
       "Bu silka foydali ma'lumotlar bor sahifaga eltadi."
      ]
     },
     {
      "fr": "Le réseau social le mien est beaucoup plus populaire que le sien.",
      "uz": "Mening ijtimoiy tarmog'im unikidan ancha mashhurroq.",
      "uzAlt": [
       "Mening sotssetim uniki qaraganda mashhurroq."
      ]
     }
    ]
   },
   {
    "id": "u29l2",
    "title": "Telefon va Qurilmalar",
    "words": [
     {
      "fr": "le smartphone",
      "uz": "smartfon",
      "emoji": "📱",
      "alt": [
       "mobil telefon"
      ]
     },
     {
      "fr": "la tablette",
      "uz": "planshet",
      "emoji": "📟",
      "alt": [
       "planshet kompyuter"
      ]
     },
     {
      "fr": "l'écran",
      "uz": "ekran",
      "emoji": "📺",
      "alt": [
       "displey"
      ]
     },
     {
      "fr": "la caméra",
      "uz": "kamera",
      "emoji": "📷",
      "alt": [
       "fotoaparat"
      ]
     },
     {
      "fr": "l'application",
      "uz": "ilovalar",
      "emoji": "📲",
      "alt": [
       "dastur",
       "mobil ilova"
      ]
     },
     {
      "fr": "la touche",
      "uz": "klavisha",
      "emoji": "🔠",
      "alt": [
       "tugma"
      ]
     },
     {
      "fr": "le chargeur",
      "uz": "quvvatlagich",
      "emoji": "🔌",
      "alt": [
       "zaryadnik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali pense que la sienne est meilleure que la tienne.",
      "uz": "Ali uniki senikidan yaxshiroq deb o'ylaydi.",
      "uzAlt": [
       "Ali o'ylashicha, uniki senikidan yaxshi."
      ]
     },
     {
      "fr": "Cette application que tu télécharges consomme beaucoup de batterie.",
      "uz": "Sen yuklab olayotgan bu ilova ko'p batareya sarflaydi.",
      "uzAlt": [
       "Siz yuklayotgan bu dastur ko'p quvvat yeydi."
      ]
     },
     {
      "fr": "Il cherche le chargeur dont l'écran est cassé.",
      "uz": "U ekrani singan quvvatlagichni qidirmoqda.",
      "uzAlt": [
       "U ekrani shikastlangan zaryadnikni qidiryapti."
      ]
     },
     {
      "fr": "Le smartphone le mien prend des photos magnifiques avec sa caméra.",
      "uz": "Mening smartfonim kamerasi bilan ajoyib suratlar oladi.",
      "uzAlt": [
       "Mening telefonim kamerasi juda go'zal rasmlar oladi."
      ]
     },
     {
      "fr": "Sophie nettoie l'écran tactile de sa nouvelle tablette numérique.",
      "uz": "Sophie o'zining yangi raqamli planshetining sezgir ekranini tozalamoqda.",
      "uzAlt": [
       "Sofi yangi planshetining ekranini artmoqda."
      ]
     },
     {
      "fr": "Tu appuies sur la touche qui éteint l'appareil immédiatement.",
      "uz": "Siz qurilmani darhol o'chiradigan tugmani bosingiz.",
      "uzAlt": [
       "Sen apparatni darhol o'chiradigan tugmani bosasan."
      ]
     }
    ]
   },
   {
    "id": "u29l3",
    "title": "Ijtimoiy tarmoqlar",
    "words": [
     {
      "fr": "le profil",
      "uz": "profil",
      "emoji": "🧑",
      "alt": [
       "shaxsiy sahifa"
      ]
     },
     {
      "fr": "le post",
      "uz": "post",
      "emoji": "📝",
      "alt": [
       "nashr",
       "maqola"
      ]
     },
     {
      "fr": "le commentaire",
      "uz": "izoh",
      "emoji": "💬",
      "alt": [
       "kommentariya"
      ]
     },
     {
      "fr": "le like",
      "uz": "layk",
      "emoji": "👍",
      "alt": [
       "ma'qullash"
      ]
     },
     {
      "fr": "le partage",
      "uz": "ulashish",
      "emoji": "🔄",
      "alt": [
       "rekursiya",
       "repost"
      ]
     },
     {
      "fr": "le follower",
      "uz": "obunachi",
      "emoji": "👥",
      "alt": [
       "kuzatuvchi"
      ]
     },
     {
      "fr": "le tag",
      "uz": "teg",
      "emoji": "🏷️",
      "alt": [
       "nishon"
      ]
     },
     {
      "fr": "le tchat",
      "uz": "chat",
      "emoji": "💭",
      "alt": [
       "muloqot",
       "suhbat"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je vois que le mien a plus de followers que le tien.",
      "uz": "Ko'rib turibmanki, menikining obunachilari senikidan ko'proq.",
      "uzAlt": [
       "Mening obunachilarim soni senikidan ko'p ekanini ko'ryapman."
      ]
     },
     {
      "fr": "Malika publie un post qui reçoit beaucoup de likes rapidement.",
      "uz": "Malika tezda ko'p layklar oladigan post nashr etmoqda.",
      "uzAlt": [
       "Malika tezda ko'p layk yig'adigan post chiqardi."
      ]
     },
     {
      "fr": "Pierre écrit un commentaire gentil sous le profil de Sophie.",
      "uz": "Pierre Sophie profilining ostiga mehribon izoh yozmoqda.",
      "uzAlt": [
       "Pyer Sofining profili tagiga yaxshi izoh qoldirmoqda."
      ]
     },
     {
      "fr": "Le tchat que nous utilisons permet un partage facile des fichiers.",
      "uz": "Biz foydalanayotgan chat fayllarni osongina ulashish imkonini beradi.",
      "uzAlt": [
       "Biz ishlatadigan muloqot fayl almashishni osonlashtiradi."
      ]
     },
     {
      "fr": "Tu ajoutes un tag sur la photo qui montre nos amis.",
      "uz": "Sen do'stlarimizni ko'rsatadigan suratga teg qo'shmoqdasan.",
      "uzAlt": [
       "Do'stlarimiz aks etgan rasmga teg qo'shyapsan."
      ]
     },
     {
      "fr": "Ce profil dont le contenu est intéressant attire de nouveaux visiteurs.",
      "uz": "Mazmuni qiziqarli bo'lgan bu profil yangi tashrif buyuruvchilarni o'ziga jalb qiladi.",
      "uzAlt": [
       "Kontenti qiziqarli profil yangi odamlarni jalb qilmoqda."
      ]
     }
    ]
   },
   {
    "id": "u29l4",
    "title": "Kompyuter va Texnologiya",
    "words": [
     {
      "fr": "le clavier",
      "uz": "klaviatura",
      "emoji": "⌨️",
      "alt": [
       "tugmalar taxtasi"
      ]
     },
     {
      "fr": "la souris",
      "uz": "mishka",
      "emoji": "🖱️",
      "alt": [
       "kompyuter sichqonchasi"
      ]
     },
     {
      "fr": "le fichier",
      "uz": "fayl",
      "emoji": "📊",
      "alt": [
       "hujjat"
      ]
     },
     {
      "fr": "le logiciel",
      "uz": "dasturiy ta'minot",
      "emoji": "⚙️",
      "alt": [
       "dastur"
      ]
     },
     {
      "fr": "la clé USB",
      "uz": "fleshka",
      "emoji": "💾",
      "alt": [
       "usb xotira"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Mon ordinateur est moderne, mais le tien est plus puissant.",
      "uz": "Mening kompyuterim zamonaviy, lekin seniki quvvatliroq.",
      "uzAlt": [
       "Kompyuterim zamonaviy, biroq seniki kuchliroq."
      ]
     },
     {
      "fr": "Ali cherche le fichier qui contient toutes les données importantes.",
      "uz": "Ali barcha muhim ma'lumotlarni o'z ichiga olgan faylni qidirmoqda.",
      "uzAlt": [
       "Ali barcha kerakli ma'lumotlar bor faylni qidiryapti."
      ]
     },
     {
      "fr": "Sophie utilise une souris sans fil avec son clavier lumineux.",
      "uz": "Sophie yorug'lik tarqatuvchi klaviaturasi bilan simsiz mishkadan foydalanmoqda.",
      "uzAlt": [
       "Sofi yoritiladigan klaviatura va simsiz sichqoncha ishlatyapti."
      ]
     },
     {
      "fr": "Le dossier dont tu parles se trouve sur la clé USB.",
      "uz": "Sen gapirayotgan papka fleshkada joylashgan.",
      "uzAlt": [
       "Siz tilga olgan papka USB xotirada turibdi."
      ]
     },
     {
      "fr": "Ce logiciel que Pierre a installé aide à imprimer les documents.",
      "uz": "Pierre o'rnatgan bu dastur hujjatlarni chop etishga yordam beradi.",
      "uzAlt": [
       "Pyer o'rnatgan bu dasturiy ta'minot printerda chiqarishga ko'maklashadi."
      ]
     },
     {
      "fr": "L'imprimante que nous avons achetée fonctionne avec un nouveau logiciel.",
      "uz": "Biz sotib olgan printer yangi dastur bilan ishlaydi.",
      "uzAlt": [
       "Biz olgan bosma qurilma yangi programma yordamida ishlamoqda."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u30",
  "level": "B1",
  "title": "Tabiat va ekologiya",
  "description": "Atrof-muhit, iqlim, qayta ishlash",
  "color": "#8B5CF6",
  "guide": [
   {
    "title": "Il faut que",
    "text": "Majburiyatni bildirish uchun 'il faut que' iborasidan keyin fe'l subjonctif maydonida ishlatiladi.",
    "examples": [
     [
      "Il faut que nous protégions la nature.",
      "Tabiatni himoya qilishimiz kerak."
     ],
     [
      "Il faut que tu fasses attention.",
      "Siz e'tiborli bo'lishingiz kerak."
     ]
    ]
   },
   {
    "title": "Pour que",
    "text": "Maqsadni bildirish uchun 'pour que' bog'lovchisidan keyin ham subjonctif qo'llaniladi.",
    "examples": [
     [
      "Je travaille pour que la terre soit propre.",
      "Men yer toza bo'lishi uchun ishlayman."
     ],
     [
      "Il agit pour que l'air devienne pur.",
      "U havo musaffo bo'lishi uchun harakat qiladi."
     ]
    ]
   },
   {
    "title": "Subjonctif asoslari",
    "text": "B1 darajasida subjonctif fe'llarning tuslanishini o'rganish atrof-muhit haqida fikr almashishda muhim.",
    "examples": [
     [
      "Il est important que vous sachiez la vérité.",
      "Haqiqatni bilishingiz muhim."
     ],
     [
      "Il faut qu'ils veuillent aider l'écologie.",
      "Ular ekologiyaga yordam berishni xohlashlari shart."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u30l1",
    "title": "Atrof-muhit",
    "words": [
     {
      "fr": "la nature",
      "uz": "tabiat",
      "emoji": "🌿",
      "alt": [
       "tabiat dunyosi"
      ]
     },
     {
      "fr": "la terre",
      "uz": "yer",
      "emoji": "🌍",
      "alt": [
       "zamin",
       "sayyora"
      ]
     },
     {
      "fr": "l'air",
      "uz": "havo",
      "emoji": "💨",
      "alt": [
       "atmosfera"
      ]
     },
     {
      "fr": "l'environnement",
      "uz": "atrof-muhit",
      "emoji": "🌳",
      "alt": [
       "ekologiya muhiti"
      ]
     },
     {
      "fr": "la pollution",
      "uz": "ifloslanish",
      "emoji": "🏭",
      "alt": [
       "zaharlanish"
      ]
     },
     {
      "fr": "la destruction",
      "uz": "vayronagarchilik",
      "emoji": "🏚️",
      "alt": [
       "buzilish",
       "kuyish"
      ]
     },
     {
      "fr": "la protection",
      "uz": "himoya",
      "emoji": "🛡️",
      "alt": [
       "muhofaza"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut que nous protégions la nature.",
      "uz": "Tabiatni himoya qilishimiz kerak.",
      "uzAlt": [
       "Biz tabiatni asrashimiz shart."
      ]
     },
     {
      "fr": "Sophie veut que la terre soit propre.",
      "uz": "Sofi yer toza bo'lishini xohlaydi.",
      "uzAlt": [
       "Sofiya yerning toza bo'lishini istaydi."
      ]
     },
     {
      "fr": "Il faut que l'air devienne pur pour tous.",
      "uz": "Barcha uchun havo musaffo bo'lishi kerak.",
      "uzAlt": [
       "Hamma uchun havo toza bo'lishi shart."
      ]
     },
     {
      "fr": "Pierre agit pour que la pollution diminue.",
      "uz": "Pyer ifloslanish kamayishi uchun harakat qilmoqda.",
      "uzAlt": [
       "Pyer ifloslanish kamayishi uchun ishlayapti."
      ]
     },
     {
      "fr": "Il est important que nous évitions la destruction.",
      "uz": "Vayronagarchilikning oldini olishimiz muhim.",
      "uzAlt": [
       "Biz vayronagarchilikdan qochishimiz kerak."
      ]
     },
     {
      "fr": "Il faut que tu participes à la protection.",
      "uz": "Sen himoya ishlarida qatnashishing kerak.",
      "uzAlt": [
       "Siz muhofazada qatnashishingiz shart."
      ]
     }
    ]
   },
   {
    "id": "u30l2",
    "title": "Iqlim o'zgarishi",
    "words": [
     {
      "fr": "le climat",
      "uz": "iqlim",
      "emoji": "🌤️",
      "alt": [
       "ob-havo sharoiti"
      ]
     },
     {
      "fr": "la température",
      "uz": "harorat",
      "emoji": "🌡️",
      "alt": [
       "gradus",
       "issiqlik darajasi"
      ]
     },
     {
      "fr": "la sécheresse",
      "uz": "qurg'oqchilik",
      "emoji": "🏜️",
      "alt": [
       "suvsizlik"
      ]
     },
     {
      "fr": "l'inondation",
      "uz": "suv toshqini",
      "emoji": "🌊",
      "alt": [
       "toshqin"
      ]
     },
     {
      "fr": "la catastrophe",
      "uz": "falokat",
      "emoji": "⚡",
      "alt": [
       "katta zarar"
      ]
     },
     {
      "fr": "le réchauffement",
      "uz": "isiqish",
      "emoji": "🔥",
      "alt": [
       "global isish"
      ]
     },
     {
      "fr": "la glace",
      "uz": "muz",
      "emoji": "🧊",
      "alt": [
       "muzlik"
      ]
     },
     {
      "fr": "fondre",
      "uz": "erish",
      "emoji": "💧",
      "alt": [
       "suvga aylanish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut que le climat change positivement.",
      "uz": "Iqlim ijobiy tomonga o'zgarishi kerak.",
      "uzAlt": [
       "Iqlim yaxshi tomonga o'zgarishi shart."
      ]
     },
     {
      "fr": "Malika craint que la température augmente.",
      "uz": "Malika harorat ko'tarilishidan qo'rqadi.",
      "uzAlt": [
       "Malika harorat oshishidan xavotirda."
      ]
     },
     {
      "fr": "Il est triste que la sécheresse détruise tout.",
      "uz": "Qurg'oqchilik hammasini vayron qilishi achinarli.",
      "uzAlt": [
       "Qurg'oqchilik barchasini yo'q qilishi qayg'uli."
      ]
     },
     {
      "fr": "Il faut que nous prévenions l'inondation.",
      "uz": "Biz suv toshqinining oldini olishimiz kerak.",
      "uzAlt": [
       "Suv toshqinidan saqlanishimiz shart."
      ]
     },
     {
      "fr": "Ali espère que cette catastrophe s'arrêtera.",
      "uz": "Ali bu falokat to'xtashiga umid qiladi.",
      "uzAlt": [
       "Ali mazkur falokat barham topishini istaydi."
      ]
     },
     {
      "fr": "Il faut que la glace cesse de fondre.",
      "uz": "Muz erishdan to'xtashi kerak.",
      "uzAlt": [
       "Muzliklar erishdan to'xtashi shart."
      ]
     }
    ]
   },
   {
    "id": "u30l3",
    "title": "Qayta ishlash",
    "words": [
     {
      "fr": "le recyclage",
      "uz": "qayta ishlash",
      "emoji": "♻️",
      "alt": [
       "utilizatsiya"
      ]
     },
     {
      "fr": "le déchet",
      "uz": "chiqindi",
      "emoji": "🗑️",
      "alt": [
       "axlat"
      ]
     },
     {
      "fr": "le plastique",
      "uz": "plastmassa",
      "emoji": "🛍️",
      "alt": [
       "plastik"
      ]
     },
     {
      "fr": "le verre",
      "uz": "shisha",
      "emoji": "🍾",
      "alt": [
       "oyna"
      ]
     },
     {
      "fr": "le papier",
      "uz": "qog'oz",
      "emoji": "📄",
      "alt": [
       "varaq"
      ]
     },
     {
      "fr": "trier",
      "uz": "saralash",
      "emoji": "🗂️",
      "alt": [
       "ajratish"
      ]
     },
     {
      "fr": "recycler",
      "uz": "utilizatsiya qilish",
      "emoji": "🔄",
      "alt": [
       "qayta ishlamoq"
      ]
     },
     {
      "fr": "réutiliser",
      "uz": "qayta ishlatish",
      "emoji": "🔁",
      "alt": [
       "ikkinchi marta ishlatmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut que nous fassions le recyclage.",
      "uz": "Biz qayta ishlash bilan shug'ullanishimiz kerak.",
      "uzAlt": [
       "Qayta ishlashni amalga oshirishimiz shart."
      ]
     },
     {
      "fr": "Sophie veut que chaque déchet soit jeté.",
      "uz": "Sofi har bir chiqindi tashlab yuborilishini xohlaydi.",
      "uzAlt": [
       "Sofiya har bir axlat tashlanishini istaydi."
      ]
     },
     {
      "fr": "Il est important que tu tries le plastique.",
      "uz": "Sen plastmassani saralashing muhim.",
      "uzAlt": [
       "Siz plastmassani ajratishingiz kerak."
      ]
     },
     {
      "fr": "Pierre agit pour que le verre soit recyclé.",
      "uz": "Pyer shisha qayta ishlanishi uchun harakat qilmoqda.",
      "uzAlt": [
       "Pyer shishani utilizatsiya qilish uchun ishlayapti."
      ]
     },
     {
      "fr": "Il faut que nous réutilisions le papier.",
      "uz": "Qog'ozni qayta ishlatishimiz kerak.",
      "uzAlt": [
       "Biz qog'ozdan yana foydalanishimiz shart."
      ]
     },
     {
      "fr": "Il est nécessaire que les citoyens trient tout.",
      "uz": "Fuqarolar hammasini saralashi zarur.",
      "uzAlt": [
       "Odamlar barchasini ajratishi shart."
      ]
     }
    ]
   },
   {
    "id": "u30l4",
    "title": "Tabiiy resurslar",
    "words": [
     {
      "fr": "l'électricité",
      "uz": "elektr",
      "emoji": "💡",
      "alt": [
       "elektr toki"
      ]
     },
     {
      "fr": "l'arbre",
      "uz": "daraxt",
      "emoji": "🌳",
      "alt": [
       "ko'chat"
      ]
     },
     {
      "fr": "la ressource",
      "uz": "resurs",
      "emoji": "🛢️",
      "alt": [
       "zaxira"
      ]
     },
     {
      "fr": "économe",
      "uz": "tejamkor",
      "emoji": "💰",
      "alt": [
       "isrof qilmaydigan"
      ]
     },
     {
      "fr": "planter",
      "uz": "ekish",
      "emoji": "🌱",
      "alt": [
       "ko'chat o'tqazish"
      ]
     },
     {
      "fr": "économiser",
      "uz": "tejash",
      "emoji": "⏱️",
      "alt": [
       "tejamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il faut que nous utilisions l'énergie solaire.",
      "uz": "Quyosh quvvatidan foydalanishimiz kerak.",
      "uzAlt": [
       "Biz quyosh energiyasini ishlatishimiz shart."
      ]
     },
     {
      "fr": "Malika veut que tu sois économe avec l'électricité.",
      "uz": "Malika elektrni tejamkor ishlatishingni xohlaydi.",
      "uzAlt": [
       "Malika elektr tokini tejashingni istaydi."
      ]
     },
     {
      "fr": "Il est bon que le soleil brille chaque jour.",
      "uz": "Har kuni quyosh charaqlab turgani yaxshi.",
      "uzAlt": [
       "Quyosh har kuni porlab turishi yaxshi."
      ]
     },
     {
      "fr": "Ali agit pour que nous plantions un arbre.",
      "uz": "Ali daraxt ekishimiz uchun harakat qilmoqda.",
      "uzAlt": [
       "Ali birorta daraxt o'tqazishimiz uchun ishlayapti."
      ]
     },
     {
      "fr": "Il faut que nous sachions économiser l'eau.",
      "uz": "Suvni tejashni bilishimiz kerak.",
      "uzAlt": [
       "Biz suvni tejab ishlatishni o'rganishimiz shart."
      ]
     },
     {
      "fr": "Il est important que cette ressource dure longtemps.",
      "uz": "Bu resurs uzoq vaqt yetishi muhim.",
      "uzAlt": [
       "Mazkur zaxiraning uzoqqa yetishi zarur."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u31",
  "level": "B2",
  "title": "Hissiyot va shubha",
  "description": "His-tuyg'ular, istak, qo'rquv, shubha",
  "color": "#F472B6",
  "guide": [
   {
    "title": "Subjonctif fe'li",
    "text": "Fransuz tilida xohish, istak, buyruq va his-tuyg'ularni bildirganda subjonctif mayli ishlatiladi. Odatda bu que bog'lovchisi bilan ikkita ega kelgan qo'shma gaplarda namoyon bo'ladi.",
    "examples": [
     [
      "Je suis content que tu viennes.",
      "Sening kelganingdan xursandman."
     ],
     [
      "Elle souhaite que nous réussissions.",
      "U muvaffaqiyat qozonishimizni istaydi."
     ]
    ]
   },
   {
    "title": "Shubha va gumon",
    "text": "Douter que (shubhalanmoq) va shunga o'xshash fe'llar ergash gapda subjonctif olib keladi. Chunki bu holatda aniqlik emas, balki shubha mavjud.",
    "examples": [
     [
      "Je doute qu'il comprenne.",
      "U tushunishiga shubha qilaman."
     ],
     [
      "Nous doutons qu'ils viennent.",
      "Ularning kelishiga shubha qilamiz."
     ]
    ]
   },
   {
    "title": "Bien que zidvosi",
    "text": "Bien que (garchi, …-sa ham) iborasi o'zidan keyin har doim subjonctif fe'lini talab qiladi. Bu qarama-qarshi mazmunni bildiradi.",
    "examples": [
     [
      "Bien qu'il pleuve, nous sortons.",
      "Yomg'ir yog'ayotganiga qaramay, biz chiqamiz."
     ],
     [
      "Bien qu'elle soit fatiguée, elle travaille.",
      "U charchagan bo'lsa-da, ishlayapti."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u31l1",
    "title": "His-tuyg'ular va quvonch",
    "words": [
     {
      "fr": "le regret",
      "uz": "afsus",
      "emoji": "😔",
      "alt": [
       "tashvish",
       "pusayish"
      ]
     },
     {
      "fr": "la tristesse",
      "uz": "g'amginlik",
      "emoji": "😢",
      "alt": [
       "xafa",
       "qayg'u"
      ]
     },
     {
      "fr": "la surprise",
      "uz": "hayrat",
      "emoji": "😲",
      "alt": [
       "kutilmagan holat",
       "ajablanish"
      ]
     },
     {
      "fr": "la colère",
      "uz": "g'azab",
      "emoji": "😡",
      "alt": [
       "jahl",
       "qahr"
      ]
     },
     {
      "fr": "la sympathie",
      "uz": "mehr",
      "emoji": "🥰",
      "alt": [
       "xushmuomalalik",
       "iliqlik"
      ]
     },
     {
      "fr": "la haine",
      "uz": "nafrat",
      "emoji": "😡",
      "alt": [
       "adovat"
      ]
     },
     {
      "fr": "la passion",
      "uz": "ishtiyoq",
      "emoji": "🔥",
      "alt": [
       "qiziqish",
       "ishq"
      ]
     },
     {
      "fr": "la tendresse",
      "uz": "noziklik",
      "emoji": "💖",
      "alt": [
       "mehribonlik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je suis content que Sophie exprime sa passion.",
      "uz": "Sofining o'z ishtiyoqini izhor qilayotganidan xursandman.",
      "uzAlt": [
       "Men Sofi o'z ishtiyoqini bildirganidan mamnunman"
      ]
     },
     {
      "fr": "Il est triste que tu éprouves de la tristesse.",
      "uz": "Sening g'amginlik his qilayotganing qayg'uli.",
      "uzAlt": [
       "G'amginlikni his qilayotganing afsuslanarli"
      ]
     },
     {
      "fr": "Nous craignons qu'il montre sa colère.",
      "uz": "U o'z g'azabini ko'rsatishidan qo'rqamiz.",
      "uzAlt": [
       "Biz uning g'azablanishidan xavotirdamiz"
      ]
     },
     {
      "fr": "Bien que Malika ressente de la haine, elle sourit.",
      "uz": "Malika nafrat his etayotgan bo'lsa-da, u jilmaymoqda.",
      "uzAlt": [
       "Garchi Malika nafratlansa ham, u kulib turibdi"
      ]
     },
     {
      "fr": "Je souhaite que Pierre comprenne cette tendresse.",
      "uz": "Pyerning bu noziklikni tushunishini istayman.",
      "uzAlt": [
       "Men Pyer mehribonlikni anglashini xohlayman"
      ]
     },
     {
      "fr": "Elle est surprise que Ali partage sa sympathie.",
      "uz": "Alining o'z mehrini bo'lishayotganidan u hayratda.",
      "uzAlt": [
       "Ali mehrini ulashayotgani uning uchun kutilmagan"
      ]
     }
    ]
   },
   {
    "id": "u31l2",
    "title": "Istak va xohish",
    "words": [
     {
      "fr": "le désir",
      "uz": "istak",
      "emoji": "🌟",
      "alt": [
       "tilak",
       "xohish"
      ]
     },
     {
      "fr": "la volonté",
      "uz": "iroda",
      "emoji": "💪",
      "alt": [
       "qat'iyat"
      ]
     },
     {
      "fr": "le besoin",
      "uz": "ehtiyoj",
      "emoji": "📌",
      "alt": [
       "zarurat"
      ]
     },
     {
      "fr": "la préférence",
      "uz": "afzallik",
      "emoji": "⭐",
      "alt": [
       "tanlov"
      ]
     },
     {
      "fr": "la nostalgie",
      "uz": "sog'inch",
      "emoji": "🍂",
      "alt": [
       "hasrat"
      ]
     },
     {
      "fr": "l'impatience",
      "uz": "toqatsizlik",
      "emoji": "⏳",
      "alt": [
       "shoshqaloqlik"
      ]
     },
     {
      "fr": "la curiosité",
      "uz": "qiziquvchanlik",
      "emoji": "🧐",
      "alt": [
       "bilishga chanqoqlik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je veux que Sophie réalise son rêve.",
      "uz": "Sofining o'z orzusini amalga oshirishini xohlayman.",
      "uzAlt": [
       "Men Sofi orzusiga yetishini istayman"
      ]
     },
     {
      "fr": "Il est important que tu aies de la volonté.",
      "uz": "Sening irodali bo'lishing muhimdir.",
      "uzAlt": [
       "Irodaga ega bo'lishing juda muhim"
      ]
     },
     {
      "fr": "Bien que nous ayons ce besoin, nous patientons.",
      "uz": "Garchi bizda bu ehtiyoj bo'lsa-da, sabr qilamiz.",
      "uzAlt": [
       "Bizda shunday ehtiyoj borligiga qaramay, kutamiz"
      ]
     },
     {
      "fr": "Elle exige que Pierre exprime son désir.",
      "uz": "U Pyeerdan o'z istagini bildirishini talab qiladi.",
      "uzAlt": [
       "Pyeerdan xohishini ochib berishini talab etmoqda"
      ]
     },
     {
      "fr": "Je suis ravi que tu montres de la curiosité.",
      "uz": "Sening qiziquvchanlik ko'rsatayotganingdan xursandman.",
      "uzAlt": [
       "Qiziquvchanlik namoyish etayotganingdan mamnunman"
      ]
     },
     {
      "fr": "Il doute qu'Ali comprenne sa nostalgie.",
      "uz": "Ali uning sog'inchini tushunishiga u shubha qiladi.",
      "uzAlt": [
       "Ali sog'inchini anglay olishiga u gumonda"
      ]
     }
    ]
   },
   {
    "id": "u31l3",
    "title": "Qo'rquv va xavotir",
    "words": [
     {
      "fr": "l'angoisse",
      "uz": "tashvish",
      "emoji": "😰",
      "alt": [
       "qayg'u",
       "sarosima"
      ]
     },
     {
      "fr": "la terreur",
      "uz": "dahshat",
      "emoji": "😱",
      "alt": [
       "qo'rquv"
      ]
     },
     {
      "fr": "l'inquiétude",
      "uz": "xavotir",
      "emoji": "😟",
      "alt": [
       "bezovtalik"
      ]
     },
     {
      "fr": "le doute",
      "uz": "gumon",
      "emoji": "❓",
      "alt": [
       "shubha"
      ]
     },
     {
      "fr": "le danger",
      "uz": "xavf",
      "emoji": "⚠️",
      "alt": [
       "tahdid"
      ]
     },
     {
      "fr": "la menace",
      "uz": "tahdid",
      "emoji": "⚡",
      "alt": [
       "qiyinchilik"
      ]
     },
     {
      "fr": "la panique",
      "uz": "sarosima",
      "emoji": "🌀",
      "alt": [
       "vahima"
      ]
     },
     {
      "fr": "le cauchemar",
      "uz": "kabisa",
      "emoji": "🌙",
      "alt": [
       "yomon tush"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je crains que Sophie ne ressente de l'angoisse.",
      "uz": "Sofining tashvish his qilishidan qo'rqaman.",
      "uzAlt": [
       "Sofi tashvishlanishidan xavotirdaman"
      ]
     },
     {
      "fr": "Il est possible que tu aies des doutes.",
      "uz": "Sening shubhalaring bo'lishi mumkin.",
      "uzAlt": [
       "Gumonda bo'lishing ehtimoldan xoli emas"
      ]
     },
     {
      "fr": "Bien que nous connaissions le danger, nous avançons.",
      "uz": "Garchi xavfni bilsak-da, oldinga qadam tashlaymiz.",
      "uzAlt": [
       "Biz xavfni tushunsak ham, harakatni davom ettiramiz"
      ]
     },
     {
      "fr": "Elle a peur qu'Ali voie cette menace.",
      "uz": "Alining bu tahdidni ko'rishidan u qo'rqadi.",
      "uzAlt": [
       "U Ali tahdidni sezib qolishidan qo'rqmoqda"
      ]
     },
     {
      "fr": "Je doute que Pierre comprenne ma panique.",
      "uz": "Pyer mening sarosimamni tushunishiga shubha qilaman.",
      "uzAlt": [
       "Pyer vahimamni anglashi dargumon"
      ]
     },
     {
      "fr": "Il est triste que tu fasses un cauchemar.",
      "uz": "Sening yomon tush ko'rayotganing qayg'uli.",
      "uzAlt": [
       "Kabisa ko'rayotganingdan afsusdaman"
      ]
     }
    ]
   },
   {
    "id": "u31l4",
    "title": "Shubha va ishonch",
    "words": [
     {
      "fr": "l'incertitude",
      "uz": "noaniqlik",
      "emoji": "📉",
      "alt": [
       "gumon"
      ]
     },
     {
      "fr": "la certitude",
      "uz": "ishonch",
      "emoji": "✅",
      "alt": [
       "aniqlik"
      ]
     },
     {
      "fr": "la conviction",
      "uz": "e'tiqod",
      "emoji": "✊",
      "alt": [
       "qat'iy fikr"
      ]
     },
     {
      "fr": "l'illusion",
      "uz": "xayol",
      "emoji": "🔮",
      "alt": [
       "sarob"
      ]
     },
     {
      "fr": "la réalité",
      "uz": "haqiqat",
      "emoji": "🌍",
      "alt": [
       "voqelik"
      ]
     },
     {
      "fr": "le soupçon",
      "uz": "gumonsirash",
      "emoji": "🕵️",
      "alt": [
       "shubhalanish"
      ]
     },
     {
      "fr": "la perplexité",
      "uz": "ikkilanish",
      "emoji": "🤔",
      "alt": [
       "dovdirash"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je doute que Sophie accepte cette incertitude.",
      "uz": "Sofining bu noaniqlikni qabul qilishiga shubha qilaman.",
      "uzAlt": [
       "Sofi noaniqlikka ko'nishi dargumon"
      ]
     },
     {
      "fr": "Il est vrai que tu as une grande certitude.",
      "uz": "Sening katta ishonching borligi rost.",
      "uzAlt": [
       "Senda chinakam ishonch borligi to'g'ri"
      ]
     },
     {
      "fr": "Bien que nous ayons des doutes, nous cherchons la vérité.",
      "uz": "Garchi shubhalarimiz bo'lsa-da, haqiqatni qidiramiz.",
      "uzAlt": [
       "Bizda gumonlar bo'lsa ham, haqiqatni izlaymiz"
      ]
     },
     {
      "fr": "Elle espère qu'Ali comprenne sa conviction.",
      "uz": "Alining uning e'tiqodini tushunishiga u umid qiladi.",
      "uzAlt": [
       "U Ali o'z qarashlarini anglashini istaydi"
      ]
     },
     {
      "fr": "Je ne pense pas que Pierre vive dans l'illusion.",
      "uz": "Pyer xayolparastlikda yashayapti deb o'ylamayman.",
      "uzAlt": [
       "Pyer xayollar bilan yashashiga ishonmayman"
      ]
     },
     {
      "fr": "Il est possible que tu ressentes de la perplexité.",
      "uz": "Sening ikkilanishni his qilayotganing mumkin.",
      "uzAlt": [
       "Ikkilanish sezayotgan bo'lishing ehtimol"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u32",
  "level": "B2",
  "title": "Afsus va farazlar",
  "description": "O'tmishdagi afsuslar, farazlar",
  "color": "#FB7185",
  "guide": [
   {
    "title": "Conditionnel passé",
    "text": "O'tmishda bajarilmagan ishlar yoki afsuslarni bildirish uchun conditionnel passé zamonidan foydalanamiz. U etre yoki avoir yordamchi fe'lining conditionnel présent shakli va asosiy fe'lning participe passé shakridan yasaladi.",
    "examples": [
     [
      "J'aurais aimé voyager.",
      "Men sayohat qilgan bo'lar edim."
     ],
     [
      "Tu aurais dû venir.",
      "Sen kelishing kerak edi."
     ]
    ]
   },
   {
    "title": "Si + plus-que-parfait",
    "text": "O'tmishdagi farazlar va ularning o'tmishdagi natijalarini ko'rsatish uchun 'si + plus-que-parfait' hamda conditionnel passé birikmasi ishlatiladi. Agar unday bo'lganda, bunday bo'lar edi ma'nosini beradi.",
    "examples": [
     [
      "Si j'avais su, je serais venu.",
      "Agar bilganimda, kelgan bo'lar edim."
     ],
     [
      "S'il avait travaillé, il aurait réussi.",
      "Agar u ishlaganda, muvaffaqiyat qozongan bo'lar edi."
     ]
    ]
   },
   {
    "title": "Afsus bildirish",
    "text": "O'tmishdagi harakatlar uchun afsuslanishni ifodalashda maxsus fe'llar va tuzilmalar yordam beradi. Bunday gaplarda ko'pincha 'dommage' yoki afsus fe'llari qo'llaniladi.",
    "examples": [
     [
      "Quel dommage qu'il soit parti.",
      "Uning ketib qolgani qanday afsus."
     ],
     [
      "J'aurais voulu changer cela.",
      "Men buni o'zgartirgan bo'lar edim."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u32l1",
    "title": "O'tmish afsuslari",
    "words": [
     {
      "fr": "le remords",
      "uz": "pushaymon",
      "emoji": "😔",
      "alt": [
       "afsus",
       "vijdon azobi"
      ]
     },
     {
      "fr": "la culpabilité",
      "uz": "aybdorlik",
      "emoji": "⚖️",
      "alt": [
       "ayb"
      ]
     },
     {
      "fr": "le reproche",
      "uz": "malomat",
      "emoji": "🗣️",
      "alt": [
       "tanbeh",
       "dashnom"
      ]
     },
     {
      "fr": "pleurer sur",
      "uz": "yig'lamoq",
      "emoji": "😢",
      "alt": [
       "afsuslanmoq"
      ]
     },
     {
      "fr": "corriger",
      "uz": "to'g'rilamoq",
      "emoji": "✏️",
      "alt": [
       "tuzatmoq"
      ]
     },
     {
      "fr": "effacer",
      "uz": "o'chirmoq",
      "emoji": "🧹",
      "alt": [
       "yo'qotmoq"
      ]
     },
     {
      "fr": "manquer",
      "uz": "o'tkazib yubormoq",
      "emoji": "⌛",
      "alt": [
       "kech qolmoq"
      ]
     },
     {
      "fr": "gaspiller",
      "uz": "isrof qilmoq",
      "emoji": "💸",
      "alt": [
       "sochmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'aurais aimé corriger mes erreurs du passé.",
      "uz": "O'tmishdagi xatolarimni tuzatgan bo'lar edim.",
      "uzAlt": [
       "Men o'tmishdagi xatolarimni tuzatishni istagan bo'lar edim."
      ]
     },
     {
      "fr": "Si tu avais écouté les conseils, tu n'aurais pas eu de remords.",
      "uz": "Agar maslahatlarga quloq solganingda, pushaymon bo'lmas eding.",
      "uzAlt": [
       "Agar maslahatni eshitganingda, afsuslanmagan bo'larding."
      ]
     },
     {
      "fr": "Pierre aurait dû effacer ses mauvaises habitudes plus tôt.",
      "uz": "Pyer o'zining yomon odatlarini ertaroq yo'qotishi kerak edi.",
      "uzAlt": [
       "Pyer yomon odatlarini oldinroq yo'q qilishi lozim edi."
      ]
     },
     {
      "fr": "Malika aurait gaspillé son temps si elle n'avait pas travaillé.",
      "uz": "Agar Malika ishlamaganida, o'z vaqtini isrof qilgan bo'lar edi.",
      "uzAlt": [
       "Malika ishlamasa, vaqtini sovurgan bo'lardi."
      ]
     },
     {
      "fr": "Nous aurions aimé ne pas manquer cette belle opportunité.",
      "uz": "Biz bu go'zal imkoniyatni qo'ldan boy bermagan bo'lar edik.",
      "uzAlt": [
       "Biz bu imkoniyatni o'tkazib yubormaslikni istar edik."
      ]
     },
     {
      "fr": "Si Sophie avait su la vérité, elle n'aurait pas ressenti de culpabilité.",
      "uz": "Agar Sofi haqiqatni bilganida, aybdorlik his qilmagan bo'lar edi.",
      "uzAlt": [
       "Sofi haqiqatdan xabardor bo'lganida, o'zini aybdor sezmasdi."
      ]
     }
    ]
   },
   {
    "id": "u32l2",
    "title": "Faraz va imkoniyatlar",
    "words": [
     {
      "fr": "l'hypothèse",
      "uz": "faraz",
      "emoji": "💭",
      "alt": [
       "taxmin"
      ]
     },
     {
      "fr": "la condition",
      "uz": "shart",
      "emoji": "📜",
      "alt": [
       "talab"
      ]
     },
     {
      "fr": "la conséquence",
      "uz": "oqibat",
      "emoji": "🌊",
      "alt": [
       "natija"
      ]
     },
     {
      "fr": "imaginer",
      "uz": "tasavvur qilmoq",
      "emoji": "✨",
      "alt": [
       "o'ylamoq"
      ]
     },
     {
      "fr": "supposer",
      "uz": "taxmin qilmoq",
      "emoji": "🔍",
      "alt": [
       "faraz qilmoq"
      ]
     },
     {
      "fr": "risquer",
      "uz": "tavakkal qilmoq",
      "emoji": "🎲",
      "alt": [
       "xavf solmoq"
      ]
     },
     {
      "fr": "espérer",
      "uz": "umid qilmoq",
      "emoji": "🌟",
      "alt": [
       "kutmoq"
      ]
     },
     {
      "fr": "renoncer",
      "uz": "voz kechmoq",
      "emoji": "🚫",
      "alt": [
       "tashlamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Si j'avais imaginé cette conséquence, j'aurais agi autrement.",
      "uz": "Agar bu oqibatni tasavvur qilganimda, boshqacha harakat qilgan bo'lar edim.",
      "uzAlt": [
       "Shunday oqibat bo'lishini o'ylaganimda, o'zgacha yo'l tutardim."
      ]
     },
     {
      "fr": "Tu aurais pu supposer que le plan changerait.",
      "uz": "Reja o'zgarishini taxmin qilgan bo'lishing mumkin edi.",
      "uzAlt": [
       "Rejaning o'zgarishini oldindan o'ylashing kerak edi."
      ]
     },
     {
      "fr": "S'il avait accepté la condition, il n'aurait pas renoncé au projet.",
      "uz": "Agar u shartni qabul qilganida, loyihadan voz kechmagan bo'lar edi.",
      "uzAlt": [
       "U shartga rozi bo'lganda, loyihani tashlab yubormasdi."
      ]
     },
     {
      "fr": "Ali aurait risqué sa place s'il n'avait pas fait attention.",
      "uz": "Agar Ali e'tibor bermaganida, o'z o'rnini xavf ostiga qo'ygan bo'lar edi.",
      "uzAlt": [
       "Ali ehtiyot bo'lmaganida, joyidan ayrilishi mumkin edi."
      ]
     },
     {
      "fr": "Nous aurions espéré un meilleur résultat pour cette hypothèse.",
      "uz": "Biz bu faraz uchun yaxshiroq natija umid qilgan bo'lar edik.",
      "uzAlt": [
       "Ushbu taxmin yuzasidan yaxshiroq natija kutgan edik."
      ]
     },
     {
      "fr": "Si Sophie avait osé, elle aurait réussi son pari.",
      "uz": "Agar Sofi jur'at qilganida, o'z garovida yutgan bo'lar edi.",
      "uzAlt": [
       "Sofi qo'rqmaganida, maqsadiga erishgan bo'lardi."
      ]
     }
    ]
   },
   {
    "id": "u32l3",
    "title": "O'tmishni o'zgartirib",
    "words": [
     {
      "fr": "le destin",
      "uz": "taqdir",
      "emoji": "🔮",
      "alt": [
       "qismat"
      ]
     },
     {
      "fr": "le hasard",
      "uz": "tasodif",
      "emoji": "🎲",
      "alt": [
       "baxt"
      ]
     },
     {
      "fr": "transformer",
      "uz": "o'zgartirmoq",
      "emoji": "🔄",
      "alt": [
       "aylantirmoq"
      ]
     },
     {
      "fr": "influencer",
      "uz": "ta'sir qilmoq",
      "emoji": "⚡",
      "alt": [
       "kuch ko'rsatmoq"
      ]
     },
     {
      "fr": "éviter",
      "uz": "chetlab o'tmoq",
      "emoji": "🛡️",
      "alt": [
       "saqlanmoq"
      ]
     },
     {
      "fr": "profiter",
      "uz": "foydalanmoq",
      "emoji": "🎉",
      "alt": [
       "bahramand bo'lmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Si j'avais fait un autre choix, mon destin aurait été différent.",
      "uz": "Agar boshqa tanlov qilganimda, taqdirim boshqacha bo'lgan bo'lar edi.",
      "uzAlt": [
       "Boshqacha yo'l tanlaganimda, qismatim o'zgacha bo'lardi."
      ]
     },
     {
      "fr": "Le hasard aurait pu influencer notre rencontre.",
      "uz": "Tasodif bizning uchrashuvimizga ta'sir qilgan bo'lishi mumkin edi.",
      "uzAlt": [
       "Tasodifiy holat uchrashuvimizni o'zgartirib yuborishi mumkin edi."
      ]
     },
     {
      "fr": "Pierre aurait transformé sa vie s'il avait profité de l'occasion.",
      "uz": "Agar Pyer imkoniyatdan foydalanganida, o'z hayotini o'zgartirgan bo'lar edi.",
      "uzAlt": [
       "Pyer qulay fursatni boy bermaganda, hayotini butunlay o'zgartirardi."
      ]
     },
     {
      "fr": "Si nous avions évité cette erreur, nous aurions gagné du temps.",
      "uz": "Agar biz bu xatodan qochganimizda, vaqt yutgan bo'lar edik.",
      "uzAlt": [
       "Shu xatoni qilmaganimizda, vaqtni tejagan bo'larkinmiz."
      ]
     },
     {
      "fr": "Malika aurait aimé rencontrer cet artiste célèbre.",
      "uz": "Malika bu mashhur san'atkorni uchratgan bo'lishni istar edi.",
      "uzAlt": [
       "Malika taniqli ijodkor bilan ko'rishishni xohlagan bo'lardi."
      ]
     },
     {
      "fr": "Si tu avais agi sagement, tu n'aurais pas eu de problèmes.",
      "uz": "Agar aqlli ish qilganingda, muammolarga duch kelmagan bo'lar eding.",
      "uzAlt": [
       "O'shanda oqilona yo'l tutganingda, darding bo'lmasdi."
      ]
     }
    ]
   },
   {
    "id": "u32l4",
    "title": "Afsus va xulosalar",
    "words": [
     {
      "fr": "la sagesse",
      "uz": "donolik",
      "emoji": "🦉",
      "alt": [
       "idrok"
      ]
     },
     {
      "fr": "la patience",
      "uz": "sabr",
      "emoji": "⏳",
      "alt": [
       "bardosh"
      ]
     },
     {
      "fr": "analyser",
      "uz": "tahlil qilmoq",
      "emoji": "📊",
      "alt": [
       "o'rganib chiqmoq"
      ]
     },
     {
      "fr": "pardonner",
      "uz": "kechirmoq",
      "emoji": "🕊️",
      "alt": [
       "bag'rikenglik qilmoq"
      ]
     },
     {
      "fr": "avancer",
      "uz": "oldinga intilmoq",
      "emoji": "🚀",
      "alt": [
       "siljimoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Si j'avais eu plus de patience, j'aurais mieux analysé la situation.",
      "uz": "Agar sabrim ko'proq bo'lganida, vaziyatni yaxshiroq tahlil qilgan bo'lar edim.",
      "uzAlt": [
       "Sabrliroq bo'lganimda, ahvolni to'g'riroq o'rganar edim."
      ]
     },
     {
      "fr": "Tu aurais dû comprendre la leçon plus tôt.",
      "uz": "Darsni ertaroq anglab yetishing kerak edi.",
      "uzAlt": [
       "O'sha saboqni oldinroq tushunib olishing lozim edi."
      ]
     },
     {
      "fr": "Pierre aurait pardonné s'il avait montré de la sagesse.",
      "uz": "Agar Pyer donolik ko'rsatganida, kechirgan bo'lar edi.",
      "uzAlt": [
       "Pyer oqillik qilganda, uni kechirib yuborardi."
      ]
     },
     {
      "fr": "Si nous avions oublié les vieux rancurs, nous serions avancer.",
      "uz": "Agar biz eski ranjlarni unutganimizda, oldinga intilgan bo'lar edik.",
      "uzAlt": [
       "Eski xafagarchiliklarni esdan chiqarganimizda, oldinga siljigan bo'lardik."
      ]
     },
     {
      "fr": "Malika aurait aimé analyser ses actes avec calme.",
      "uz": "Malika o'z qilmishlarini xotirjamlik bilan tahlil qilgan bo'lishni istar edi.",
      "uzAlt": [
       "Malika harakatlarini tinchgina o'rganishni xohlardi."
      ]
     },
     {
      "fr": "Si Sophie avait su pardonner, elle aurait trouvé la paix.",
      "uz": "Agar Sofi kechira olganda, osoyishtalik topgan bo'lar edi.",
      "uzAlt": [
       "Sofi kechirimli bo'lganida, ko'ngil xotirjamligiga erishardi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u33",
  "level": "B2",
  "title": "O'zlashtirma gap",
  "description": "Birovning gapini yetkazish, yangiliklar",
  "color": "#EC4899",
  "guide": [
   {
    "title": "Birovning gapini yetkazish",
    "text": "Fransuz tilida boshqalarning gaplarini yetkazganda 'dire' (aytmoq) yoki 'déclarer' (e'lon qilmoq) kabi fe'llar ishlatiladi. Agar bosh gap hozirgi zamonda bo'lsa, ergash gapdagi zamon o'zgarmaydi.",
    "examples": [
     [
      "Il dit qu'il vient.",
      "U kelishini aytmoqda."
     ],
     [
      "Elle déclare qu'elle est prête.",
      "U tayyor ekanligini e'lon qilmoqda."
     ]
    ]
   },
   {
    "title": "Zamonlar moslashuvi",
    "text": "Agar bosh gap o'tgan zamonda bo'lsa, ergash gapdagi fe'l zamoni o'tmishga suriladi. Masalan, hozirgi zamon (présent) o'tgan zamonga (imparfait) o'zgaradi.",
    "examples": [
     [
      "Il a dit qu'il venait.",
      "U kelayotganini aytdi."
     ],
     [
      "Elle a affirmé qu'elle comprenait.",
      "U tushunishini tasdiqladi."
     ]
    ]
   },
   {
    "title": "Yangiliklar va xabarlar",
    "text": "Yangiliklarni yetkazishda 'annoncer' (xabar bermoq) va 'informer' (xabardor qilmoq) fe'llari juda qo'l keladi. Ular orqali odamlarning so'zlarini aniq yetkazamiz.",
    "examples": [
     [
      "Le journaliste annonce que la situation change.",
      "Jurnalist vaziyat o'zgarayotganini e'lon qilmoqda."
     ],
     [
      "Pierre informe qu'il a réussi.",
      "Pyer muvaffaqiyat qozonganini xabar qilmoqda."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u33l1",
    "title": "Xabar berish fe'llari",
    "words": [
     {
      "fr": "annoncer",
      "uz": "xabar bermoq",
      "emoji": "📢",
      "alt": [
       "e'lon qilmoq"
      ]
     },
     {
      "fr": "déclarer",
      "uz": "bayon qilmoq",
      "emoji": "📜",
      "alt": [
       "bildirmoq"
      ]
     },
     {
      "fr": "affirmer",
      "uz": "tasdiqlamoq",
      "emoji": "✔️",
      "alt": [
       "qat'iy aytmoq"
      ]
     },
     {
      "fr": "mentionner",
      "uz": "eslatib o'tmoq",
      "emoji": "📝",
      "alt": [
       "tilga olmoq"
      ]
     },
     {
      "fr": "rapporter",
      "uz": "yetkazmoq",
      "emoji": "🗣️",
      "alt": [
       "hikoya qilmoq"
      ]
     },
     {
      "fr": "révéler",
      "uz": "fosh qilmoq",
      "emoji": "🔍",
      "alt": [
       "sirni ochmoq"
      ]
     },
     {
      "fr": "indiquer",
      "uz": "ko'rsatmoq",
      "emoji": "📍",
      "alt": [
       "belgilab bermoq"
      ]
     },
     {
      "fr": "préciser",
      "uz": "aniqlik kiritmoq",
      "emoji": "📌",
      "alt": [
       "ta'kidlamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali annonce qu'il viendra demain.",
      "uz": "Ali ertaga kelishini e'lon qilmoqda.",
      "uzAlt": [
       "Ali ertaga kelishini xabar bermoqda."
      ],
      "frAlt": [
       "Ali annonce qu'il va venir demain."
      ]
     },
     {
      "fr": "Sophie déclare qu'elle adore cette ville.",
      "uz": "Sofi bu shaharni yaxshi ko'rishini bayon qilmoqda.",
      "uzAlt": [
       "Sofi bu shaharni sevishini bildirmoqda."
      ]
     },
     {
      "fr": "Pierre affirme qu'il a terminé son travail.",
      "uz": "Pyer o'z ishini tugatganini tasdiqlamoqda.",
      "uzAlt": [
       "Pyer o'z ishini tugatganini qat'iy aytdi."
      ]
     },
     {
      "fr": "Malika mentionne que le rapport est prêt.",
      "uz": "Malika hisobot tayyor ekanligini eslatib o'tmoqda.",
      "uzAlt": [
       "Malika hisobot tayyorligini tilga olmoqda."
      ]
     },
     {
      "fr": "Le professeur indique que l'examen sera difficile.",
      "uz": "O'qituvchi imtihon qiyin bo'lishini ko'rsatmoqda.",
      "uzAlt": [
       "O'qituvchi imtihon qiyin bo'lishini bildirmoqda."
      ]
     },
     {
      "fr": "Thomas précise que la réunion commencera tôt.",
      "uz": "Tomas yig'ilish erta boshlanishiga aniqlik kiritmoqda.",
      "uzAlt": [
       "Tomas majlis erta boshlanishini ta'kidlamoqda."
      ]
     }
    ]
   },
   {
    "id": "u33l2",
    "title": "Yangiliklar va voqealar",
    "words": [
     {
      "fr": "la nouvelle",
      "uz": "yangilik",
      "emoji": "📰",
      "alt": [
       "xabar"
      ]
     },
     {
      "fr": "le média",
      "uz": "ommaviy axborot vositasi",
      "emoji": "📺",
      "alt": [
       "media"
      ]
     },
     {
      "fr": "l'information",
      "uz": "ma'lumot",
      "emoji": "ℹ️",
      "alt": [
       "axborot"
      ]
     },
     {
      "fr": "la rumeur",
      "uz": "mish-mish",
      "emoji": "💬",
      "alt": [
       "igm-g'iybat"
      ]
     },
     {
      "fr": "le reportage",
      "uz": "lavha",
      "emoji": "🎥",
      "alt": [
       "reportaj"
      ]
     },
     {
      "fr": "l'interview",
      "uz": "suhbat",
      "emoji": "🎙️",
      "alt": [
       "intervyu"
      ]
     },
     {
      "fr": "la source",
      "uz": "manba",
      "emoji": "🌐",
      "alt": [
       "axborot manbai"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le journaliste diffuse une nouvelle importante.",
      "uz": "Jurnalist muhim yangilikni tarqatmoqda.",
      "uzAlt": [
       "Jurnalist muhim xabarni e'lon qilmoqda."
      ]
     },
     {
      "fr": "Sophie lit le journal tous les matins.",
      "uz": "Sofi har kuni ertalab ro'znoma o'qiydi.",
      "uzAlt": [
       "Sofi har tong gazeta mutolaa qiladi."
      ]
     },
     {
      "fr": "Ce média transmet des informations utiles.",
      "uz": "Bu ommaviy axborot vositasi foydali ma'lumotlarni uzatmoqda.",
      "uzAlt": [
       "Bu media foydali axborot beradi."
      ]
     },
     {
      "fr": "On entend une rumeur dans la rue.",
      "uz": "Ko'chada bir mish-mish eshitilmoqda.",
      "uzAlt": [
       "Ko'chada mish-mish yuribdi."
      ]
     },
     {
      "fr": "Ce reportage montre la vie quotidienne.",
      "uz": "Bu lavha kundalik hayotni ko'rsatmoqda.",
      "uzAlt": [
       "Bu reportaj kundalik turmushni namoyish etadi."
      ]
     },
     {
      "fr": "La source confirme cette information.",
      "uz": "Manba ushbu ma'lumotni tasdiqlamoqda.",
      "uzAlt": [
       "Axborot manbai bu xabarni tasdiqlaydi."
      ]
     }
    ]
   },
   {
    "id": "u33l3",
    "title": "Muloqot va muhokama",
    "words": [
     {
      "fr": "conseiller",
      "uz": "yo'l-yo'riq ko'rsatmoq",
      "emoji": "🧭",
      "alt": [
       "tavsiya qilmoq"
      ]
     },
     {
      "fr": "promettre",
      "uz": "va'da bermoq",
      "emoji": "🤞",
      "alt": [
       "ahd qilmoq"
      ]
     },
     {
      "fr": "refuser",
      "uz": "qabul qilmaslik",
      "emoji": "🚫",
      "alt": [
       "qarshi chiqmoq"
      ]
     },
     {
      "fr": "avertir",
      "uz": "ogohlantirmoq",
      "emoji": "⚠️",
      "alt": [
       "xabardor qilmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali et Pierre discutent de ce projet.",
      "uz": "Ali va Pyer bu loyiha haqida muhokama qilmoqdalar.",
      "uzAlt": [
       "Ali va Pyer ushbu loyihani muhokama qilishmoqda."
      ]
     },
     {
      "fr": "Malika partage ses idées avec ses amis.",
      "uz": "Malika o'z g'oyalari bilan do'stlari bilan o'rtoqlashmoqda.",
      "uzAlt": [
       "Malika fikrlarini do'stlariga bo'lishmoqda."
      ]
     },
     {
      "fr": "Sophie propose de voyager ensemble.",
      "uz": "Sofi birga sayohat qilishni taklif qilmoqda.",
      "uzAlt": [
       "Sofi birgalikda sayohat etishni tavsiya etyapti."
      ]
     },
     {
      "fr": "Le professeur conseille de lire ce livre.",
      "uz": "O'qituvchi bu kitobni o'qishni tavsiya qilmoqda.",
      "uzAlt": [
       "Ustoz mazkur kitobni o'qishni maslahat bermoqda."
      ]
     },
     {
      "fr": "Thomas promet qu'il viendra à l'heure.",
      "uz": "Tomas o'z vaqtida kelishiga va'da bermoqda.",
      "uzAlt": [
       "Tomas vaqtida yetib kelishini aytib ahd qildi."
      ]
     },
     {
      "fr": "Le directeur avertit que les règles sont strictes.",
      "uz": "Direktor qoidalar qat'iyligi haqida ogohlantirmoqda.",
      "uzAlt": [
       "Rahbar tartiblar jiddiyligini uqtirmoqda."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u34",
  "level": "B2",
  "title": "Murakkab hikoya",
  "description": "Voqealar ketma-ketligi, oldin sodir bo'lgan ish",
  "color": "#F9A8D4",
  "guide": [
   {
    "title": "Plus-que-parfait zamoni",
    "text": "Plus-que-parfait (o'tgan zamondan oldingi o'tgan zamon) o'tgan zamonda sodir bo'lgan voqeadan oldinroq yuzaga kelgan ish-harakatni bildiradi. U avoir yoki être yordamchi fe'llarining l'imparfait shakli va asosiy fe'lning participe passé shakli yordamida yasaladi.",
    "examples": [
     [
      "Quand Ali est arrivé, Malika avait déjà fini.",
      "Ali kelganida, Malika allaqachon tugatgan edi."
     ],
     [
      "Elle avait mangé avant de partir.",
      "U ketishidan oldin ovqatlangan edi."
     ]
    ]
   },
   {
    "title": "Après avoir + participe passé",
    "text": "Bu tuzilma bir ish-harakat boshqasidan keyin sodir bo'lganini bildiradi. \"Après avoir\" (yoki \"être\") birikmasidan so'ng fe'lning participe passé shakli keladi.",
    "examples": [
     [
      "Après avoir fini son travail, Pierre est rentré.",
      "Ishini tugatgandan so'ng, Pierre uyga qaytdi."
     ],
     [
      "Après avoir lu le livre, Sophie a compris.",
      "Kitobni o'qigach, Sophie tushundi."
     ]
    ]
   },
   {
    "title": "Voqealar ketma-ketligi",
    "text": "Murakkab hikoyalarda voqealar ketma-ketligini ko'rsatish uchun plus-que-parfait va passif/passé composé zamonlari birgalikda ishlatiladi. Avval nima bo'lganini ko'rsatish uchun plus-que-parfait tanlanadi.",
    "examples": [
     [
      "Il avait préparé le dossier avant la réunion.",
      "U yig'ilishdan oldin doseni tayyorlagan edi."
     ],
     [
      "Nous étions partis quand il a téléphoné.",
      "U qo'ng'iroq qilganida biz ketgan edik."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u34l1",
    "title": "Oldingi harakatlar",
    "words": [
     {
      "fr": "le début",
      "uz": "boshlanish",
      "emoji": "🏁",
      "alt": [
       "boshi",
       "boshlanishi"
      ]
     },
     {
      "fr": "la fin",
      "uz": "tugatish",
      "emoji": "🛑",
      "alt": [
       "oxiri",
       "yakun"
      ]
     },
     {
      "fr": "le témoin",
      "uz": "guvoh",
      "emoji": "👁️",
      "alt": [
       "shohit"
      ]
     },
     {
      "fr": "la piste",
      "uz": "iz",
      "emoji": "🔍",
      "alt": [
       "yol",
       "so'qmoq"
      ]
     },
     {
      "fr": "le signal",
      "uz": "signal",
      "emoji": "📡",
      "alt": [
       "ogohlantirish"
      ]
     },
     {
      "fr": "la trace",
      "uz": "nishona",
      "emoji": "📌",
      "alt": [
       "asar"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali avait déjà vu le début du film avant d'arriver.",
      "uz": "Ali yetib kelishidan oldin filmning boshlanishini allaqachon ko'rgan edi.",
      "uzAlt": [
       "Ali kelishidan avval kinoning boshini ko'rib bo'lgan edi."
      ]
     },
     {
      "fr": "Après avoir trouvé la piste, Sophie had compris toute l'histoire.",
      "uz": "Izni topgach, Sophie butun hikoyani tushunib yetgan edi.",
      "uzAlt": [
       "So'qmoqni topgandan keyin, Sophie hamma narsani tushungan edi."
      ]
     },
     {
      "fr": "Le témoin avait quitté les lieux avant que la police n'arrive.",
      "uz": "Politsiya kelgunga qadar guvoh joyni tark etgan edi.",
      "uzAlt": [
       "Politsiyachilar kelishidan oldin shohit ketib qolgan edi."
      ]
     },
     {
      "fr": "Malika avait préparé un bon plan après avoir parlé avec Pierre.",
      "uz": "Pierre bilan gaplashgandan so'ng Malika yaxshi reja tayyorlagan edi.",
      "uzAlt": [
       "Malika Pierre bilan gaplashgach, yaxshi reja tuzgan edi."
      ]
     },
     {
      "fr": "Nous avions écouté le signal avant de commencer le travail.",
      "uz": "Ishni boshlashdan oldin biz signalni eshitgan edik.",
      "uzAlt": [
       "Biz ishga kirishishdan avval signalni tinglagan edik."
      ]
     },
     {
      "fr": "Il avait effacé chaque trace après avoir fini la mission.",
      "uz": "Topshiriqni tugatgandan keyin u har bir nishonani yo'q qilgan edi.",
      "uzAlt": [
       "U vazifani tamomlagach, har bitta izni o'chirib tashlagandi."
      ]
     }
    ]
   },
   {
    "id": "u34l2",
    "title": "Voqealar zanjiri",
    "words": [
     {
      "fr": "l'action",
      "uz": "harakat",
      "emoji": "🏃",
      "alt": [
       "amal"
      ]
     },
     {
      "fr": "le tournant",
      "uz": "burilish",
      "emoji": "🔄",
      "alt": [
       "burilish nuqtasi"
      ]
     },
     {
      "fr": "l'étape",
      "uz": "bosqich",
      "emoji": "📈",
      "alt": [
       "qadam"
      ]
     },
     {
      "fr": "la suite",
      "uz": "davom",
      "emoji": "➡️",
      "alt": [
       "keyingi qism"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Après avoir analysé la cause, l'expert avait compris l'effet.",
      "uz": "Sababni tahlil qilgandan so'ng, mutaxassis oqibatni tushungan edi.",
      "uzAlt": [
       "Mutaxassis sababni o'rganib chiqib, oqibatini anglab yetgandi."
      ]
     },
     {
      "fr": "Le destin avait changé après ce grand tournant.",
      "uz": "Bu buyuk burilishdan keyin taqdir o'zgargan edi.",
      "uzAlt": [
       "Shu katta burilishdan so'ng qismat o'zgargandi."
      ]
     },
     {
      "fr": "Ali avait franchi chaque étape avant d'atteindre le sommet.",
      "uz": "Ali cho'qqiga chiqishdan oldin har bir bosqichdan o'tgan edi.",
      "uzAlt": [
       "Ali cho'qqiga yetib borguniga qadar barcha bosqichlarni bosib o'tgandi."
      ]
     },
     {
      "fr": "Après avoir pris une décision, Malika had agi sans peur.",
      "uz": "Qaror qabul qilgach, Malika qo'rqmasdan harakat qilgan edi.",
      "uzAlt": [
       "Malika qaror chiqargach, qo'rqmasdan ish tutgan edi."
      ]
     },
     {
      "fr": "Le hasard had joué un rôle important dans cette histoire.",
      "uz": "Bu hikoyada tasodif muhim rol o'ynagan edi.",
      "uzAlt": [
       "Ushbu voqeadagi tasodif katta ahamiyatga ega bo'lgandi."
      ]
     },
     {
      "fr": "Sophie had raconté la suite après avoir lu le livre.",
      "uz": "Kitobni o'qib chiqqach, Sophie davomini aytib bergan edi.",
      "uzAlt": [
       "Sophie kitobni mutolaa qilgach, keyingi voqealarni hikoya qilgandi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u35",
  "level": "B2",
  "title": "Bog'lovchilar va mantiq",
  "description": "Argument tuzish, sabab-oqibat",
  "color": "#F472B6",
  "guide": [
   {
    "title": "Sabab-oqibat va zidiyat",
    "text": "Fransuz tilida sababni tushuntirish uchun 'puisque' (chunki) va oqibatni ko'rsatish uchun 'donc' (shuning uchun) ishlatiladi. Zidiyatni bildirish uchun esa 'pourtant' va 'cependant' (biroq, shunga qaramay) qo'llaniladi.",
    "examples": [
     [
      "Il est fatigué, donc il dort.",
      "U charchagan, shuning uchun uxlayapti."
     ],
     [
      "Elle a réussi pourtant.",
      "U shunga qaramay muvaffaqiyat qozondi."
     ]
    ]
   },
   {
    "title": "Qiyoslash va to'siqlar",
    "text": "Ikki holatni qiyoslab qarama-qarshi qo'yish uchun 'alors que' (vaho_ki) birikmasi juda qo'l keladi. Maqsadni ifodalashda esa 'afin que' (...uchun) yordam beradi.",
    "examples": [
     [
      "Il lit alors que son frère joue.",
      "Uning ukasi o'ynayotgan bir paytda u o'qiyapti."
     ],
     [
      "Je travaille afin que tout réussisse.",
      "Hammasi muvaffaqiyatli bo'lishi uchun men ishlayapman."
     ]
    ]
   },
   {
    "title": "Mantiqiy bog'lanishlar",
    "text": "Fikrni mantiqiy yakunlash va dalillarni bog'lashda bog'lovchilar asosiy rol o'ynaydi. 'Cependant' so'zi yozma nutqda ham, og'zaki nutqda ham zid ma'noni kuchaytirish uchun ishlatiladi.",
    "examples": [
     [
      "Cependant, il faut vérifier.",
      "Biroq, tekshirish kerak."
     ],
     [
      "Puisque tu es là, aide-moi.",
      "Sen shu yerda ekansan, menga yordam ber."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u35l1",
    "title": "Sabab va oqibat",
    "words": [
     {
      "fr": "donc",
      "uz": "shuning uchun",
      "emoji": "🔗",
      "alt": [
       "demak",
       "shunga ko'ra"
      ]
     },
     {
      "fr": "cependant",
      "uz": "biroq",
      "emoji": "⚖️",
      "alt": [
       "lekin",
       "shunga qaramay"
      ]
     },
     {
      "fr": "pourtant",
      "uz": "shunga qaramay",
      "emoji": "🔄",
      "alt": [
       "ammo",
       "baribir"
      ]
     },
     {
      "fr": "puisque",
      "uz": "chunki",
      "emoji": "💡",
      "alt": [
       "...ki"
      ]
     },
     {
      "fr": "afin que",
      "uz": "uchun",
      "emoji": "🎯",
      "alt": [
       "maqsadida"
      ]
     },
     {
      "fr": "alors que",
      "uz": "vaho_ki",
      "emoji": "⚡",
      "alt": [
       "holbuki"
      ]
     },
     {
      "fr": "la justification",
      "uz": "asoslash",
      "emoji": "📝",
      "alt": [
       "oqlov"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pierre est intelligent, donc il comprend tout rapidement.",
      "uz": "Pyer aqlli, shuning uchun u hammasini tez tushunadi.",
      "uzAlt": [
       "Pyer aqlli ekan, demak hamma narsani tez anglaydi."
      ]
     },
     {
      "fr": "Sophie travaille beaucoup, cependant elle est fatiguée.",
      "uz": "Sofi ko'p ishlaydi, biroq u charchagan.",
      "uzAlt": [
       "Sofi ko'p mehnat qiladi, lekin charchagan."
      ]
     },
     {
      "fr": "Il pleut, pourtant les enfants jouent dehors.",
      "uz": "Yomg'ir yog'yapti, shunga qaramay bolalar tashqarida o'ynayapti.",
      "uzAlt": [
       "Yomg'ir yog'moqda, ammo bolalar ko'chada o'ynamoqda."
      ]
     },
     {
      "fr": "Puisque tu connais la route, tu peux guider Ali.",
      "uz": "Yo'lni bilar ekansiz, Aliga boshchilik qila olasiz.",
      "uzAlt": [
       "Sen yo'lni bilasan, shuning uchun Aliga yo'l ko'rsat."
      ]
     },
     {
      "fr": "Malika parle lentement afin que tout le monde comprenne.",
      "uz": "Malika hamma tushunishi uchun asta gapiryapti.",
      "uzAlt": [
       "Barcha anglab yetishi maqsadida Malika sekin so'zlayapti."
      ]
     },
     {
      "fr": "Ali dort, alors que Pierre travaille encore.",
      "uz": "Ali uxlayotgan bir paytda Pyer hali ham ishlayapti.",
      "uzAlt": [
       "Ali uxlab yotibdi, holbuki Pyer hali ishlamoqda."
      ]
     }
    ]
   },
   {
    "id": "u35l2",
    "title": "Dalil va mantiq",
    "words": [
     {
      "fr": "le raisonnement",
      "uz": "mulohaza",
      "emoji": "🧠",
      "alt": [
       "fikrlash"
      ]
     },
     {
      "fr": "la contradiction",
      "uz": "ziddiyat",
      "emoji": "⚔️",
      "alt": [
       "qarama-qarshilik"
      ]
     },
     {
      "fr": "le postulat",
      "uz": "faraz",
      "emoji": "📌",
      "alt": [
       "dastlabki shart"
      ]
     },
     {
      "fr": "la déduction",
      "uz": "xulosa",
      "emoji": "🔍",
      "alt": [
       "deduksiya"
      ]
     },
     {
      "fr": "valider",
      "uz": "tasdiqlamoq",
      "emoji": "✅",
      "alt": [
       "qabul qilmoq"
      ]
     },
     {
      "fr": "infirmer",
      "uz": "rad etmoq",
      "emoji": "❌",
      "alt": [
       "inkor qilmoq"
      ]
     },
     {
      "fr": "pertinent",
      "uz": "o'rinli",
      "emoji": "⭐",
      "alt": [
       "ma'noli"
      ]
     },
     {
      "fr": "absurde",
      "uz": "bekor",
      "emoji": "🌀",
      "alt": [
       "absurd"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ton raisonnement est pertinent, donc je suis d'accord.",
      "uz": "Sening mulohazang o'rinli, shuning uchun men qo'shilaman.",
      "uzAlt": [
       "Sizning fikringiz o'rinli, demak men roziman."
      ]
     },
     {
      "fr": "Il y a une contradiction évidente dans cette phrase.",
      "uz": "Bu gapda yaqqol ziddiyat mavjud.",
      "uzAlt": [
       "Mazkur jumlada aniq qarama-qarshilik bor."
      ]
     },
     {
      "fr": "Ce postulat est absurde, cependant certains le croient.",
      "uz": "Bu faraz bekor, biroq ayrimlar unga ishonishadi.",
      "uzAlt": [
       "Ushbu taxmin absurd, lekin ba'zilar unga ishonadi."
      ]
     },
     {
      "fr": "Sophie a validé le document puisque tout était correct.",
      "uz": "Hamma narsa to'g'ri bo'lgani uchun Sofi hujjatni tasdiqladi.",
      "uzAlt": [
       "Barcha narsa to'g'ri ekan, Sofi qog'ozni qabul qildi."
      ]
     },
     {
      "fr": "Ali essaie d'infirmer cette fausse information.",
      "uz": "Ali bu noto'g'ri ma'lumotni rad etishga harakat qilyapti.",
      "uzAlt": [
       "Ali ushbu xato xabarni inkor etishga urinyapti."
      ]
     },
     {
      "fr": "Malika argumente bien alors que Pierre reste silencieux.",
      "uz": "Malika yaxshi dalillayapti, vaho_ki Pyer jim turibdi.",
      "uzAlt": [
       "Pyer jim turgan bir paytda Malika yaxshi dalil keltiradi."
      ]
     }
    ]
   },
   {
    "id": "u35l3",
    "title": "Sababiy bog'lanishlar",
    "words": [
     {
      "fr": "provoquer",
      "uz": "keltirib chiqarmoq",
      "emoji": "⚡",
      "alt": [
       "sabab bo'lmoq"
      ]
     },
     {
      "fr": "entraîner",
      "uz": "ta'sir qilmoq",
      "emoji": "🚂",
      "alt": [
       "ortidan ergashtirmoq"
      ]
     },
     {
      "fr": "générer",
      "uz": "vujudga keltirmoq",
      "emoji": "🌱",
      "alt": [
       "hosil qilmoq"
      ]
     },
     {
      "fr": "motiver",
      "uz": "rag'batlantirmoq",
      "emoji": "🎯",
      "alt": [
       "ilhomlantirmoq"
      ]
     },
     {
      "fr": "déclencher",
      "uz": "boshlab yubormoq",
      "emoji": "🚀",
      "alt": [
       "qo'zg'atmoq"
      ]
     },
     {
      "fr": "le mobile",
      "uz": "sabab",
      "emoji": "📱",
      "alt": [
       "bahona"
      ]
     },
     {
      "fr": "l'origine",
      "uz": "kelib chiqish",
      "emoji": "🔍",
      "alt": [
       "boshlanish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Cette erreur peut provoquer de grands problèmes.",
      "uz": "Bu xato katta muammolarni keltirib chiqarishi mumkin.",
      "uzAlt": [
       "Ushbu xatolik jiddiy muammolarni keltirib chiqarishi ehtimol."
      ]
     },
     {
      "fr": "Un bon travail entraîne toujours de bons résultats.",
      "uz": "Yaxshi ish doimo yaxshi natijalarga ta'sir qiladi.",
      "uzAlt": [
       "Sifatli mehnat doimo ijobiy oqibatlarga olib keladi."
      ]
     },
     {
      "fr": "La pluie génère de la verdure dans le jardin.",
      "uz": "Yomg'ir bog'da yashillikni vujudga keltiradi.",
      "uzAlt": [
       "Yomg'ir sababli bog'da ko'katlar hosil bo'ladi."
      ]
     },
     {
      "fr": "Ali explique son choix puisque c'est important.",
      "uz": "Bu muhim bo'lgani uchun Ali o'z tanlovini izohlayapti.",
      "uzAlt": [
       "Muhimligi bois Ali o'z tanlovini tushuntirib beryapti."
      ]
     },
     {
      "fr": "Sophie motive son équipe afin que tout marche bien.",
      "uz": "Hamma narsa yaxshi ishlashi uchun Sofi jamoasini rag'batlantiryapti.",
      "uzAlt": [
       "Ishlar ravon ketishi maqsadida Sofi jamoasiga dalda bermoqda."
      ]
     },
     {
      "fr": "Ce discours déclenche un grand débat.",
      "uz": "Bu nutq katta munozarani boshlab yuboryapti.",
      "uzAlt": [
       "Mazkur chiqish qizg'in bahsni qo'zg'atmoqda."
      ]
     }
    ]
   },
   {
    "id": "u35l4",
    "title": "Maqsad va natija",
    "words": [
     {
      "fr": "le but ultime",
      "uz": "asosiy maqsad",
      "emoji": "🏁",
      "alt": [
       "pirovard nishon"
      ]
     },
     {
      "fr": "la finalité",
      "uz": "pirovard",
      "emoji": "🎯",
      "alt": [
       "yakuniy maqsad"
      ]
     },
     {
      "fr": "aboutir",
      "uz": "yakunlanmoq",
      "emoji": "🏆",
      "alt": [
       "yetib bormoq"
      ]
     },
     {
      "fr": "réussir",
      "uz": "muvaffaqiyat qozonmoq",
      "emoji": "🌟",
      "alt": [
       "uddalamoq"
      ]
     },
     {
      "fr": "échouer",
      "uz": "barbod bo'lmoq",
      "emoji": "📉",
      "alt": [
       "omadsizlikka uchramoq"
      ]
     },
     {
      "fr": "valoir",
      "uz": "arziydigan bo'lmoq",
      "emoji": "💎",
      "alt": [
       "qiymatga ega bo'lmoq"
      ]
     },
     {
      "fr": "l'effet secondaire",
      "uz": "qo'shimcha ta'sir",
      "emoji": "💊",
      "alt": [
       "yon ta'sir"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le but ultime est d'aider tous les étudiants.",
      "uz": "Asosiy maqsad barcha talabalarga yordam berishdir.",
      "uzAlt": [
       "Pirovard nishon barcha o'quvchilarga ko'maklashishdan iborat."
      ]
     },
     {
      "fr": "Cette recherche doit aboutir à une conclusion claire.",
      "uz": "Bu tadqiqot aniq xulosa bilan yakunlanishi kerak.",
      "uzAlt": [
       "Mazkur izlanish aniq to'xtamga kelib tugashi lozim."
      ]
     },
     {
      "fr": "Malika a réussi son examen, donc elle est très heureuse.",
      "uz": "Malika imtihondan muvaffaqiyatli o'tdi, shuning uchun u juda xursand.",
      "uzAlt": [
       "Malika sinovni uddaladi, demak u nihoyatda shod."
      ]
     },
     {
      "fr": "Il a échoué puisqu'il n'a pas beaucoup étudié.",
      "uz": "U ko'p o'qimaganligi uchun barbod bo'ldi.",
      "uzAlt": [
       "Ko'p shug'ullanmagani bois u imtihondan yiqildi."
      ]
     },
     {
      "fr": "Pierre travaille dur afin que son projet réussisse.",
      "uz": "Loyiha muvaffaqiyatli chiqishi uchun Pyer qattiq ishlayapti.",
      "uzAlt": [
       "Ishlari yurishishi maqsadida Pyer tinmay ter to'kmoqda."
      ]
     },
     {
      "fr": "Ce livre vaut la peine d'être lu.",
      "uz": "Bu kitob o'qishga arziydigan bo'lib chiqdi.",
      "uzAlt": [
       "Ushbu kitobni mutolaa qilishga arziydi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u36",
  "level": "B2",
  "title": "Gérondif",
  "description": "Bir vaqtda bajariladigan ishlar, usul",
  "color": "#FB7185",
  "guide": [
   {
    "title": "Gérondif yasalishi",
    "text": "Gérondif fe'lning hozirgi zamon sifatdoshi asosiga 'en' qo'shimchasi qo'shilishidan yasaladi. U bir vaqtda bajariladigan ikki ish-harakatni bildiradi.",
    "examples": [
     [
      "Il lit en mangeant.",
      "U ovqat yeb o'qiyapti."
     ],
     [
      "Elle marche en écoutant de la musique.",
      "U musiqa tinglab yuribdi."
     ]
    ]
   },
   {
    "title": "Bir vaqtda sodir bo'lish",
    "text": "Gérondif egasi ikkala fe'l uchun ham bir xil bo'lishi shart. U harakatning qay tarzda, qanday usulda bajarilganini ham ko'rsatadi.",
    "examples": [
     [
      "Pierre travaille en écoutant la radio.",
      "Pyer radioga quloq solib ishlayapti."
     ],
     [
      "Sophie apprend en regardant des vidéos.",
      "Sofi videolar ko'rib o'rganmoqda."
     ]
    ]
   },
   {
    "title": "Participe présent",
    "text": "Participe présent fe'lning sifatdosh shakli bo'lib, odatda 'en' yuklamasisiz ishlatiladi va aniqlovchi vazifasini bajaradi.",
    "examples": [
     [
      "L'homme parlant français est mon ami.",
      "Fransuzcha gaplashayotgan kishi mening do'stim."
     ],
     [
      "J'ai vu un enfant pleurant dans la rue.",
      "Men ko'chada yig'layotgan bolani ko'rdim."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u36l1",
    "title": "Gérondif asoslari",
    "words": [
     {
      "fr": "en riquant",
      "uz": "tavakkal qilib",
      "emoji": "🎲",
      "alt": [
       "tavakkal qila turib"
      ]
     },
     {
      "fr": "en souriant",
      "uz": "tabassum qilib",
      "emoji": "😊",
      "alt": [
       "kulimsirab"
      ]
     },
     {
      "fr": "en marchant",
      "uz": "yurib",
      "emoji": "🚶",
      "alt": [
       "piyoda yurgan holda"
      ]
     },
     {
      "fr": "en courant",
      "uz": "yugurib",
      "emoji": "🏃",
      "alt": [
       "chopib"
      ]
     },
     {
      "fr": "en chantant",
      "uz": "kuylayotib",
      "emoji": "🎤",
      "alt": [
       "qo'shiq aytib"
      ]
     },
     {
      "fr": "en attendant",
      "uz": "kutib",
      "emoji": "⏳",
      "alt": [
       "kuta turib"
      ]
     },
     {
      "fr": "en pensant",
      "uz": "o'ylab",
      "emoji": "💭",
      "alt": [
       "fikr qilib"
      ]
     },
     {
      "fr": "en dormant",
      "uz": "uxlab",
      "emoji": "😴",
      "alt": [
       "uxlayotib"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali marche en souriant dans la rue.",
      "uz": "Ali ko'chada tabassum qilib yuribdi.",
      "uzAlt": [
       "Ali ko'chada kulimsirab yuribdi."
      ]
     },
     {
      "fr": "Sophie chante en courant vers le parc.",
      "uz": "Sofi bog' tomon yugurib qo'shiq aytyapti.",
      "uzAlt": [
       "Sofi bog'ga qarab yugurib kuylayapti."
      ]
     },
     {
      "fr": "Pierre travaille en attendant son ami.",
      "uz": "Pyer do'stini kuta turib ishlayapti.",
      "uzAlt": [
       "Pyer o'z do'stini kutib ishlayapti."
      ]
     },
     {
      "fr": "Malika lit un livre en pensant à demain.",
      "uz": "Malika ertangi kunni o'ylab kitob o'qiyapti.",
      "uzAlt": [
       "Malika ertani o'ylagan holda kitob o'qiyapti."
      ]
     },
     {
      "fr": "Le chat dort en rêvant d'une souris.",
      "uz": "Mushuk sichqonni tush ko'rib uxlab yotibdi.",
      "uzAlt": [
       "Mushuk sichqon haqida o'ylab uxlab yotibdi."
      ]
     },
     {
      "fr": "Nous avançons en riquant un peu.",
      "uz": "Biz biroz tavakkal qilib oldinga boryapmiz.",
      "uzAlt": [
       "Biz ozgina tavakkal qilib ilgarilayapmiz."
      ]
     }
    ]
   },
   {
    "id": "u36l2",
    "title": "Usul va holatlar",
    "words": [
     {
      "fr": "en regardant",
      "uz": "qarab",
      "emoji": "👀",
      "alt": [
       "tikilib"
      ]
     },
     {
      "fr": "en écoutant",
      "uz": "tinglab",
      "emoji": "🎧",
      "alt": [
       "quloq solib"
      ]
     },
     {
      "fr": "en parlant",
      "uz": "gaplashib",
      "emoji": "🗣️",
      "alt": [
       "suhbatlashib"
      ]
     },
     {
      "fr": "en écrivant",
      "uz": "yozib",
      "emoji": "✍️",
      "alt": [
       "qoralab"
      ]
     },
     {
      "fr": "en lisant",
      "uz": "o'qib",
      "emoji": "📖",
      "alt": [
       "mutolaa qilib"
      ]
     },
     {
      "fr": "en mangeant",
      "uz": "tanovul qilib",
      "emoji": "🍽️",
      "alt": [
       "ovqat yeb"
      ]
     },
     {
      "fr": "en buvant",
      "uz": "ichib",
      "emoji": "🥤",
      "alt": [
       "xo'plab"
      ]
     },
     {
      "fr": "en travaillant",
      "uz": "ishlab",
      "emoji": "💻",
      "alt": [
       "mehnat qilib"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Malika mange en lisant le journal.",
      "uz": "Malika gazeta o'qib ovqat yemoqda.",
      "uzAlt": [
       "Malika gazeta mutolaa qilib tanovul qilmoqda."
      ]
     },
     {
      "fr": "Pierre boit du thé en écoutant la radio.",
      "uz": "Pyer radioga quloq solib choy ichmoqda.",
      "uzAlt": [
       "Pyer radio tinglab choy ichyapti."
      ]
     },
     {
      "fr": "Ali écrit une lettre en parlant à Sophie.",
      "uz": "Ali Sofi bilan gaplashib xat yozmoqda.",
      "uzAlt": [
       "Ali Sofi bilan suhbatlashib xat bitmoqda."
      ]
     },
     {
      "fr": "Sophie travaille en regardant les nuages.",
      "uz": "Sofi bulutlarga qarab ishlamoqda.",
      "uzAlt": [
       "Sofi bulutlarni kuzatib mehnat qilyapti."
      ]
     },
     {
      "fr": "Nous apprenons le français en lisant.",
      "uz": "Biz o'qib fransuz tilini o'rganmoqdamiz.",
      "uzAlt": [
       "Biz mutolaa qilib fransuz tilini o'zlashtiryapmiz."
      ]
     },
     {
      "fr": "Les enfants jouent en écoutant des histoires.",
      "uz": "Bolalar hikoyalar tinglab o'ynamoqdalar.",
      "uzAlt": [
       "Bolalar qissalarga quloq solib o'ynashyapti."
      ]
     }
    ]
   },
   {
    "id": "u36l3",
    "title": "Harakatlar uyg'unligi",
    "words": [
     {
      "fr": "en cherchant",
      "uz": "qidirib",
      "emoji": "🔍",
      "alt": [
       "axtarib"
      ]
     },
     {
      "fr": "en trouvant",
      "uz": "topib",
      "emoji": "💡",
      "alt": [
       "kashf etib"
      ]
     },
     {
      "fr": "en expliquant",
      "uz": "tushuntirib",
      "emoji": "📋",
      "alt": [
       "bayon qilib"
      ]
     },
     {
      "fr": "en comprenant",
      "uz": "tushunib",
      "emoji": "🧠",
      "alt": [
       "anglab"
      ]
     },
     {
      "fr": "en demandant",
      "uz": "so'rab",
      "emoji": "🙋",
      "alt": [
       "iltimos qilib"
      ]
     },
     {
      "fr": "en répondant",
      "uz": "javob berib",
      "emoji": "💬",
      "alt": [
       "so'z qotib"
      ]
     },
     {
      "fr": "en montrant",
      "uz": "ko'rsatib",
      "emoji": "👉",
      "alt": [
       "namoyish etib"
      ]
     },
     {
      "fr": "en fermant",
      "uz": "yopib",
      "emoji": "🚪",
      "alt": [
       "bekitib"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali explique la règle en montrant le tableau.",
      "uz": "Ali doskani ko'rsatib qoidani tushuntiryapti.",
      "uzAlt": [
       "Ali jadvalni ko'rsatib qoidani bayon qilmoqda."
      ]
     },
     {
      "fr": "Sophie trouve la solution en cherchant bien.",
      "uz": "Sofi yaxshilab qidirib yechimni topmoqda.",
      "uzAlt": [
       "Sofi sinchiklab axtarib to'g'ri yo'lni topyapti."
      ]
     },
     {
      "fr": "Malika répond en souriant et comprenant tout.",
      "uz": "Malika hammasini tushunib, tabassum qilib javob beryapti.",
      "uzAlt": [
       "Malika barchasini anglab, kulib javob qaytarmoqda."
      ]
     },
     {
      "fr": "Pierre ferme la porte en demandant le silence.",
      "uz": "Pyer jimjitlikni so'rab eshikni yopyapti.",
      "uzAlt": [
       "Pyer sukunatni iltimos qilib eshikni bekitmoqda."
      ]
     },
     {
      "fr": "Nous avançons en cherchant la bonne direction.",
      "uz": "Biz to'g'ri yo'nalishni qidirib olg'a boryapmiz.",
      "uzAlt": [
       "Biz to'g'ri yo'lni axtarib ilgarilayapmiz."
      ]
     },
     {
      "fr": "L'élève apprend en posant des questions.",
      "uz": "O'quvchi savollar berib o'rganmoqda.",
      "uzAlt": [
       "O'quvchi savol so'rab bilim olmoqda."
      ]
     }
    ]
   },
   {
    "id": "u36l4",
    "title": "Murakkab tuzilmalar",
    "words": [
     {
      "fr": "en voyageant",
      "uz": "sayohat qilib",
      "emoji": "✈️",
      "alt": [
       "kezib"
      ]
     },
     {
      "fr": "en découvrant",
      "uz": "kashf qilib",
      "emoji": "🗺️",
      "alt": [
       "ochib"
      ]
     },
     {
      "fr": "en construisant",
      "uz": "qurib",
      "emoji": "🏗️",
      "alt": [
       "barpo etib"
      ]
     },
     {
      "fr": "en préparant",
      "uz": "tayyorlab",
      "emoji": "🍳",
      "alt": [
       "hozirlab"
      ]
     },
     {
      "fr": "en nettoyant",
      "uz": "tozalab",
      "emoji": "🧹",
      "alt": [
       "tartibga solib"
      ]
     },
     {
      "fr": "en achetant",
      "uz": "sotib olib",
      "emoji": "🛒",
      "alt": [
       "xarid qilib"
      ]
     },
     {
      "fr": "en payant",
      "uz": "to'lab",
      "emoji": "💳",
      "alt": [
       "pul berib"
      ]
     },
     {
      "fr": "en gagnant",
      "uz": "yutib",
      "emoji": "🏆",
      "alt": [
       "g'alaba qozonib"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pierre voyage en découvrant de nouveaux pays.",
      "uz": "Pyer yangi mamlakatlarni kashf etib sayohat qilyapti.",
      "uzAlt": [
       "Pyer yangi o'lkalarni kezib sayohat qilmoqda."
      ]
     },
     {
      "fr": "Sophie prépare le dîner en nettoyant la cuisine.",
      "uz": "Sofi oshxonani tozalab kechki ovqatni tayyorlamoqda.",
      "uzAlt": [
       "Sofi oshxonani tartibga solib ovqat hozirlayapti."
      ]
     },
     {
      "fr": "Malika achète des livres en payant par carte.",
      "uz": "Malika karta orqali to'lab kitoblar xarid qilmoqda.",
      "uzAlt": [
       "Malika pulini to'lab kitoblar sotib olyapti."
      ]
     },
     {
      "fr": "Ali gagne le match en jouant très bien.",
      "uz": "Ali juda yaxshi o'ynab o'yinda g'alaba qozonyapti.",
      "uzAlt": [
       "Ali ajoyib o'ynab matchda yutib chiqmoqda."
      ]
     },
     {
      "fr": "Nous construisons notre avenir en travaillant fort.",
      "uz": "Biz qattiq ishlab kelajagimizni barpo etyapmiz.",
      "uzAlt": [
       "Biz tinmay mehnat qilib kelajagimizni quryapmiz."
      ]
     },
     {
      "fr": "Les voyageurs avancent en découvrant la nature.",
      "uz": "Sayohatchilar tabiatni kashf etib oldinga yurishmoqda.",
      "uzAlt": [
       "Sayohat qiluvchilar tabiatni ochib ilgarilashmoqda."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u37",
  "level": "B2",
  "title": "Jamiyat va madaniyat",
  "description": "San'at, kino, adabiyot, an'analar",
  "color": "#EC4899",
  "guide": [
   {
    "title": "Passif yasalishi",
    "text": "Fransuz tilida passif (maishiy va madaniy matnlarda ko'p ishlatiladigan majhul nisbat) être yordamchi fe'li va asosiy fe'lning participe passé shakli yordamida yasaladi. Bunda egasiz gaplarda noaniq 'on' olmoshidan ham keng foydalaniladi.",
    "examples": [
     [
      "Le film est tourné par un jeune réalisateur.",
      "Film yosh rejissyor tomonidan suratga olingan."
     ],
     [
      "On admire ce tableau classique dans le musée.",
      "Bu klassik rasm muzeyda tomosha qilinadi."
     ]
    ]
   },
   {
    "title": "On olmoshi",
    "text": "'On' olmoshi fransuz tilida ko'pincha o'zbek tilidagi majhul nisbat ma'nosini bildiradi yoki 'biz', 'odamlar' ma'nolarida qo'llaniladi.",
    "examples": [
     [
      "On joue cette pièce tous les soirs.",
      "Bu piesa har oqshom qo'yiladi."
     ],
     [
      "La poésie est lue par on et tous.",
      "She'riyat hamma tomonidan o'qiladi."
     ]
    ]
   },
   {
    "title": "San'at va an'ana leksikasi",
    "text": "Madaniyat va adabiyot mavzularini yoritishda passif shakllar asar yoki san'at asarining yaratilishini ifodalash uchun juda qo'l keladi.",
    "examples": [
     [
      "Le roman est écrit en français.",
      "Roman fransuz tilida yozilgan."
     ],
     [
      "Les traditions anciennes sont respectées par la société.",
      "Qadimiy an'analar jamiyat tomonidan hurmat qilinadi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u37l1",
    "title": "Adabiyot olami",
    "words": [
     {
      "fr": "la poésie",
      "uz": "she'riyat",
      "emoji": "📜",
      "alt": [
       "nazm"
      ]
     },
     {
      "fr": "le poète",
      "uz": "shoir",
      "emoji": "✍️",
      "alt": [
       "nazm ustasi"
      ]
     },
     {
      "fr": "la poétesse",
      "uz": "shoira",
      "emoji": "👩‍\ud83d",
      "alt": [
       "ayol shoir"
      ]
     },
     {
      "fr": "le chapitre",
      "uz": "bob",
      "emoji": "📖",
      "alt": [
       "qism"
      ]
     },
     {
      "fr": "la page de garde",
      "uz": "muqova",
      "emoji": "📚",
      "alt": [
       "kitob muqovasi"
      ]
     },
     {
      "fr": "publier",
      "uz": "nashr etmoq",
      "emoji": "📰",
      "alt": [
       "chop etmoq"
      ]
     },
     {
      "fr": "traduire",
      "uz": "tarjima qilmoq",
      "emoji": "🌐",
      "alt": [
       "tilga o'girmoq"
      ]
     },
     {
      "fr": "inspirer",
      "uz": "ilhomlantirmoq",
      "emoji": "💡",
      "alt": [
       "ilhom bermoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le beau roman est publié par une grande maison d'édition.",
      "uz": "Go'zal roman yirik nashriyot tomonidan chop etilgan.",
      "uzAlt": [
       "Bu chiroyli roman katta nashriyotda nashr etilgan."
      ]
     },
     {
      "fr": "La poésie est traduite en plusieurs langues.",
      "uz": "She'riyat bir nechta tillarga tarjima qilingan.",
      "uzAlt": [
       "Nazm bir qancha tillarga o'girilgan."
      ]
     },
     {
      "fr": "Ce chapitre est écrit par un jeune poète.",
      "uz": "Bu bob yosh shoir tomonidan yozilgan.",
      "uzAlt": [
       "Mazkur qismni yosh shoir yozgan."
      ]
     },
     {
      "fr": "On est inspiré par les livres classiques.",
      "uz": "Klassik kitoblar orqali ilhomlaniladi.",
      "uzAlt": [
       "Klassik asarlar kishini ilhomlantiradi."
      ]
     },
     {
      "fr": "La page de garde est dessinée par une poétesse.",
      "uz": "Muqova shoira tomonidan chizilgan.",
      "uzAlt": [
       "Kitob muqovasini shoira bezagan."
      ]
     },
     {
      "fr": "Les œuvres importantes sont publiées chaque année.",
      "uz": "Muhim asarlar har yili nashr etiladi.",
      "uzAlt": [
       "Har yili muhim kitoblar chop etiladi."
      ]
     }
    ]
   },
   {
    "id": "u37l2",
    "title": "Madaniy meros",
    "words": [
     {
      "fr": "le patrimoine",
      "uz": "meros",
      "emoji": "🏛️",
      "alt": [
       "madaniy meros"
      ]
     },
     {
      "fr": "le monument",
      "uz": "obida",
      "emoji": "🗽",
      "alt": [
       "yodgorlik"
      ]
     },
     {
      "fr": "le festival",
      "uz": "festival",
      "emoji": "🎪",
      "alt": [
       "san'at bayrami"
      ]
     },
     {
      "fr": "l'exposition",
      "uz": "ko'rgazma",
      "emoji": "🖼️",
      "alt": [
       "art ko'rgazma"
      ]
     },
     {
      "fr": "la galerie",
      "uz": "galereya",
      "emoji": "🏢",
      "alt": [
       "san'at galereyasi"
      ]
     },
     {
      "fr": "consacrer",
      "uz": "bag'ishlamoq",
      "emoji": "🎁",
      "alt": [
       "bag'ish etmoq"
      ]
     },
     {
      "fr": "restaurer",
      "uz": "ta'mirlamoq",
      "emoji": "🛠️",
      "alt": [
       "tiklamoq"
      ]
     },
     {
      "fr": "exposer",
      "uz": "namoyish qilmoq",
      "emoji": "📌",
      "alt": [
       "qo'ymoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le vieux monument est restauré par les experts.",
      "uz": "Qadimiy obida mutaxassislar tomonidan ta'mirlangan.",
      "uzAlt": [
       "Eski yodgorlikni mutaxassislar tiklagan."
      ]
     },
     {
      "fr": "Une belle exposition est organisée dans la galerie.",
      "uz": "Galereyada go'zal ko'rgazma tashkil etilgan.",
      "uzAlt": [
       "Galereyada chiroyli ko'rgazma o'tkazilmoqda."
      ]
     },
     {
      "fr": "Le riche patrimoine est protégé par la loi.",
      "uz": "Boy meros qonun bilan qo'riqlanadi.",
      "uzAlt": [
       "Madaniy merosni qonun himoya qiladi."
      ]
     },
     {
      "fr": "On visite ce grand festival chaque automne.",
      "uz": "Har kuzda bu yirik festivalga tashrif buyuriladi.",
      "uzAlt": [
       "Odamlar har kuzda bu festivalga borishadi."
      ]
     },
     {
      "fr": "Les tableaux anciens sont exposés au public.",
      "uz": "Qadimiy suratlar omma e'tiboriga havola etiladi.",
      "uzAlt": [
       "Eski rasmlar ko'rgazmaga qo'yilgan."
      ]
     },
     {
      "fr": "Ce beau musée est consacré à l'art moderne.",
      "uz": "Bu go'zal muzey zamonaviy san'atga bag'ishlangan.",
      "uzAlt": [
       "Mazkur muzey zamonaviy san'at uchun ochilgan."
      ]
     }
    ]
   },
   {
    "id": "u37l3",
    "title": "Milliy an'analar",
    "words": [
     {
      "fr": "l'humeur",
      "uz": "kayfiyat",
      "emoji": "😊",
      "alt": [
       "ruhiyat"
      ]
     },
     {
      "fr": "la coutume",
      "uz": "odat",
      "emoji": "🌿",
      "alt": [
       "urf-odat"
      ]
     },
     {
      "fr": "le folklore",
      "uz": "folklorshunoslik",
      "emoji": "🪕",
      "alt": [
       "xalq ijodi"
      ]
     },
     {
      "fr": "la légende",
      "uz": "afsona",
      "emoji": "🐉",
      "alt": [
       "rivoyat"
      ]
     },
     {
      "fr": "transmettre",
      "uz": "meros qoldirmoq",
      "emoji": "🤝",
      "alt": [
       "yetkazmoq"
      ]
     },
     {
      "fr": "célébrer",
      "uz": "nishonlamoq",
      "emoji": "🎉",
      "alt": [
       "bayram qilmoq"
      ]
     },
     {
      "fr": "respecter",
      "uz": "hurmat qilmoq",
      "emoji": "🤍",
      "alt": [
       "e'zozlamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Les anciennes coutumes sont respectées par le peuple.",
      "uz": "Qadimiy urf-odatlar xalq tomonidan hurmat qilinadi.",
      "uzAlt": [
       "Eski odatlarni xalq e'zozlaydi."
      ]
     },
     {
      "fr": "Une belle légende est transmise de génération en génération.",
      "uz": "Go'zal afsona avloddan avlodga o'tkaziladi.",
      "uzAlt": [
       "Chiroyli rivoyat avloddan-avlodga yetkaziladi."
      ]
     },
     {
      "fr": "Le folklore national est célébré avec joie.",
      "uz": "Milliy folklor quvonch bilan nishonlanadi.",
      "uzAlt": [
       "Xalq ijodi bayrami shodlik bilan o'tkaziladi."
      ]
     },
     {
      "fr": "Les beaux costumes sont portés pendant la fête.",
      "uz": "Bayram paytida chiroyli milliy liboslar kiyiladi.",
      "uzAlt": [
       "Bayramda milliy kostyumlar kiyib chiqiladi."
      ]
     },
     {
      "fr": "On transmet ces traditions aux jeunes enfants.",
      "uz": "Bu an'analar yosh bolalarga o'rgatiladi.",
      "uzAlt": [
       "Odamlar bu odatlarni yoshlarga yetkazadilar."
      ]
     },
     {
      "fr": "La grande fête est célébrée par toute la ville.",
      "uz": "Katta bayram butun shahar tomonidan nishonlanadi.",
      "uzAlt": [
       "Barcha shahar aholisi bu bayramni nishonlaydi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u38",
  "level": "B2",
  "title": "Biznes fransuzchasi",
  "description": "Ofis, yig'ilish, xat yozish, muzokara",
  "color": "#F9A8D4",
  "guide": [
   {
    "title": "Rasmiy murojaat",
    "text": "Fransuz tilida ishda yoki rasmiy vaziyatlarda 'vous' olmoshidan foydalaniladi. Bu hurmat bildiradi va biznes muhitida majburiydir.",
    "examples": [
     [
      "Pourriez-vous envoyer le message ?",
      "Xabarni yubora olasizmi?"
     ],
     [
      "Veuillez agréer mes salutations.",
      "Hurmat bilan murojaat qilishimga ijozat bergaysiz."
     ]
    ]
   },
   {
    "title": "Nominalizatsiya",
    "text": "Fe'llardan ot yasash jarayoni bo'lib, biznes matnlarida fikrni rasmiy va aniq bayon qilish uchun ishlatiladi.",
    "examples": [
     [
      "La signature du contrat est prévue.",
      "Shartnomani imzolash rejalashtirilgan."
     ],
     [
      "La direction exige la ponctualité.",
      "Rahbariyat o'z vaqtida kelishni talab qiladi."
     ]
    ]
   },
   {
    "title": "Ofis leksikasi",
    "text": "Ish joyidagi kundalik muloqot va yozishmalar uchun maxsus atamalar qo'llaniladi.",
    "examples": [
     [
      "Le directeur dirige la société.",
      "Direktor kompaniyani boshqaradi."
     ],
     [
      "Imprimez ce document important.",
      "Ushbu muhim hujjatni chop eting."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u38l1",
    "title": "Ofis va xodimlar",
    "words": [
     {
      "fr": "le directeur",
      "uz": "direktor",
      "emoji": "👨‍\ud83d",
      "alt": [
       "rahbar",
       "mudir"
      ]
     },
     {
      "fr": "la secrétaire",
      "uz": "kotiba",
      "emoji": "👩‍\ud83d",
      "alt": [
       "yordamchi"
      ]
     },
     {
      "fr": "l'imprimante",
      "uz": "printer",
      "emoji": "🖨️",
      "alt": [
       "chop etish moslamasi"
      ]
     },
     {
      "fr": "le document",
      "uz": "hujjat",
      "emoji": "📄",
      "alt": [
       "qog'oz"
      ]
     },
     {
      "fr": "signer",
      "uz": "imzolash",
      "emoji": "✍️",
      "alt": [
       "imzo qo'ymoq"
      ]
     },
     {
      "fr": "classer",
      "uz": "tartiblash",
      "emoji": "🗂️",
      "alt": [
       "tasniflamoq"
      ]
     },
     {
      "fr": "téléphoner",
      "uz": "qo'ng'iroq qilish",
      "emoji": "📞",
      "alt": [
       "telefon qilmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pourriez-vous signer ce document important ?",
      "uz": "Ushbu muhim hujjatni imzolay olasizmi?",
      "uzAlt": [
       "Bu muhim hujjatga imzo qo'ya olasizmi?"
      ],
      "frAlt": [
       "Pourriez-vous signer ce document s'il vous plaît ?"
      ]
     },
     {
      "fr": "La secrétaire classe les dossiers dans le bureau.",
      "uz": "Kotiba ishxonadagi papkalarni tartibga solmoqda.",
      "uzAlt": [
       "Kotiba ofisdagi papkalarni tartiblamoqda."
      ]
     },
     {
      "fr": "Le directeur téléphone à l'autre entreprise.",
      "uz": "Direktor boshqa korxonaga qo'ng'iroq qilmoqda.",
      "uzAlt": [
       "Direktor boshqa firmaga telefon qilmoqda."
      ]
     },
     {
      "fr": "Veuillez utiliser l'imprimante pour ce rapport.",
      "uz": "Ushbu hisobot uchun printerdan foydalanishingizni so'raymiz.",
      "uzAlt": [
       "Iltimos, shu hisobot uchun printer ishlating."
      ]
     },
     {
      "fr": "Nous devons classer tous les documents avant midi.",
      "uz": "Biz tushgacha barcha hujjatlarni tartiblashimiz kerak.",
      "uzAlt": [
       "Barcha qog'ozlarni tushlikkacha tartibga solishimiz shart."
      ]
     },
     {
      "fr": "Pouvez-vous téléphoner au directeur maintenant ?",
      "uz": "Hozir direktorga qo'ng'iroq qila olasizmi?",
      "uzAlt": [
       "Direktorga hoziroq telefon qila olasizmi?"
      ]
     }
    ]
   },
   {
    "id": "u38l2",
    "title": "Yig'ilish va muhokama",
    "words": [
     {
      "fr": "l'ordre du jour",
      "uz": "kun tartibi",
      "emoji": "📋",
      "alt": [
       "kun tartibidagi masala"
      ]
     },
     {
      "fr": "la proposition",
      "uz": "taklif",
      "emoji": "💡",
      "alt": [
       "mulohaza"
      ]
     },
     {
      "fr": "présenter",
      "uz": "taqdim etish",
      "emoji": "📊",
      "alt": [
       "ko'rsatmoq"
      ]
     },
     {
      "fr": "décider",
      "uz": "qaror qilish",
      "emoji": "⚖️",
      "alt": [
       "hal qilmoq"
      ]
     },
     {
      "fr": "intervenir",
      "uz": "so'zga chiqish",
      "emoji": "🎤",
      "alt": [
       "aralashmoq"
      ]
     },
     {
      "fr": "convenir",
      "uz": "kelishish",
      "emoji": "🤝",
      "alt": [
       "maqul kelmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Nous allons discuter de l'ordre du jour.",
      "uz": "Biz kun tartibini muhokama qilamiz.",
      "uzAlt": [
       "Kun tartibidagi masalani muhokama qilamiz."
      ]
     },
     {
      "fr": "Pourriez-vous présenter votre proposition aux collègues ?",
      "uz": "Taklifingizni hamkasblarga taqdim eta olasizmi?",
      "uzAlt": [
       "Siz o'z taklifingizni hamkasblarga ko'rsata olasizmi?"
      ]
     },
     {
      "fr": "Il faut décider cette question importante aujourd'hui.",
      "uz": "Bugun ushbu muhim masalani hal qilish kerak.",
      "uzAlt": [
       "Bu muhim savol bo'yicha bugun qaror qilish lozim."
      ]
     },
     {
      "fr": "Puis-je intervenir sur cette proposition ?",
      "uz": "Ushbu taklif yuzasidan so'zga chiqa olamanmi?",
      "uzAlt": [
       "Bu taklif bo'yicha fikr bildira olamanmi?"
      ]
     },
     {
      "fr": "Nous convenons de la date de la prochaine réunion.",
      "uz": "Keyingi yig'ilish sanasi bo'yicha kelishib olamiz.",
      "uzAlt": [
       "Kelgusi yig'ilish vaqtini kelishib qo'yamiz."
      ]
     },
     {
      "fr": "Avez-vous une question concernant l'ordre du jour ?",
      "uz": "Kun tartibi yuzasidan savolingiz bormi?",
      "uzAlt": [
       "Kun tartibi bo'yicha biror savol bormi sizda?"
      ]
     }
    ]
   },
   {
    "id": "u38l3",
    "title": "Xat yozish va xabarlar",
    "words": [
     {
      "fr": "le courriel",
      "uz": "elektron pochta",
      "emoji": "📧",
      "alt": [
       "xat"
      ]
     },
     {
      "fr": "envoyer",
      "uz": "yuborish",
      "emoji": "📤",
      "alt": [
       "jo'natmoq"
      ]
     },
     {
      "fr": "rédiger",
      "uz": "tuzish",
      "emoji": "📝",
      "alt": [
       "yozmoq"
      ]
     },
     {
      "fr": "confirmer",
      "uz": "tasdiqlash",
      "emoji": "✅",
      "alt": [
       "maqullash"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Veuillez rédiger un courriel pour le client.",
      "uz": "Mijoz uchun elektron pochta xatini tuzishingizni so'raymiz.",
      "uzAlt": [
       "Iltimos, xaridorga xat yozing."
      ]
     },
     {
      "fr": "Je vais envoyer la lettre officielle demain matin.",
      "uz": "Rasmiy maktubni ertaga ertalab yuboraman.",
      "uzAlt": [
       "Rasmiy xatni ertaga ertalab jo'nataman."
      ]
     },
     {
      "fr": "Pourriez-vous répondre à ce message rapidement ?",
      "uz": "Ushbu xabarga tezda javob bera olasizmi?",
      "uzAlt": [
       "Bu xabarga tezroq javob qaytara olasizmi?"
      ]
     },
     {
      "fr": "Il est important de confirmer notre rendez-vous par écrit.",
      "uz": "Uchrashuvimizni yozma ravishda tasdiqlash muhim.",
      "uzAlt": [
       "Belgilangan uchrashuvni xat orqali tasdiqlash muhim."
      ]
     },
     {
      "fr": "Veuillez saluer le directeur dans le message.",
      "uz": "Xabarda direktorga salom yo'llashingizni so'raymiz.",
      "uzAlt": [
       "Xatda rahbarga hurmat bajo keltiring."
      ]
     },
     {
      "fr": "Nous avons reçu un courriel important aujourd'hui.",
      "uz": "Bugun muhim elektron pochta xatini qabul qilib oldik.",
      "uzAlt": [
       "Bugun bizga muhim xat keldi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u39",
  "level": "C1",
  "title": "Iboralar",
  "description": "Fransuzcha frazeologizmlar va kundalik idiomalar",
  "color": "#FBBF24",
  "guide": [
   {
    "title": "Fransuzcha idiomalarning tuzilishi",
    "text": "Fransuz tilida kundalik nutqda to'g'ridan-to'g'ri ma'noda ishlatilmaydigan, majoziy ma'noni anglatuvchi iboralar juda ko'p. Ularning kelib chiqishi ko'pincha tarix yoki madaniyatga borib taqaladi.",
    "examples": [
     [
      "Avoir le cafard signifie être triste ou déprimé.",
      "Qora qo'ng'izga ega bo'lish tushkun yoki xafa bo'lishni anglatadi."
     ],
     [
      "Poser un lapin à quelqu'un veut dire ne pas venir à un rendez-vous.",
      "Kimgadir quyon qo'yish uchrashuvga kelmaslikni bildiradi."
     ]
    ]
   },
   {
    "title": "Kundalik hayot va frazeologizmlar",
    "text": "Idiomalarni o'rganishda ularni so'zma-so'z tarjima qilish xato hisoblanadi. Har bir iboraning yaxlit ma'nosini yodda tutish muhim.",
    "examples": [
     [
      "Coûter les yeux de la tête est très cher.",
      "Bosh ko'zlariga tushish juda qimmat degani."
     ],
     [
      "Tomber dans les pommes signifie s'évanouir.",
      "Olmalarga tushish hushidan ketishni anglatadi."
     ]
    ]
   },
   {
    "title": "C1 darajasidagi iboralar nozikligi",
    "text": "Yuqori darajada bu kabi ifodalar nutqni boyitadi va uni tabiiy qiladi. Ularni to'g'ri kontekstda qo'llash muhim mahoratdir.",
    "examples": [
     [
      "Avoir le vent en poupe c'avoir du succès.",
      "Shamollarni orqada tutish muvaffaqiyatga ega bo'lish demakdir."
     ],
     [
      "Donner sa langue au chat signifie abandonner.",
      "Tilini mushukka berish taslim bo'lishni anglatadi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u39l1",
    "title": "Hissiyot va kayfiyat",
    "words": [
     {
      "fr": "avoir le cafard",
      "uz": "tushkunlikda bo'lmoq",
      "emoji": "🪲",
      "alt": [
       "xafa bo'lmoq"
      ]
     },
     {
      "fr": "tomber dans les pommes",
      "uz": "hushidan ketmoq",
      "emoji": "🍎",
      "alt": [
       "yerdan uzilmoq"
      ]
     },
     {
      "fr": "avoir le vent en poupe",
      "uz": "omadli bo'lmoq",
      "emoji": "⛵",
      "alt": [
       "ishlari yurishmoq"
      ]
     },
     {
      "fr": "donner sa langue au chat",
      "uz": "taslim bo'lmoq",
      "emoji": "🐱",
      "alt": [
       "javobni topolmaslik"
      ]
     },
     {
      "fr": "coûter les yeux de la tête",
      "uz": "juda qimmat turmoq",
      "emoji": "👁️",
      "alt": [
       "hamyonni kuydirmoq"
      ]
     },
     {
      "fr": "poser un lapin",
      "uz": "uchrashuvga kelmaslik",
      "emoji": "🐇",
      "alt": [
       "aldab ketmoq"
      ]
     },
     {
      "fr": "monter sur ses grands chevaux",
      "uz": "g'azablanmoq",
      "emoji": "🐎",
      "alt": [
       "jahl otiga minmoq"
      ]
     },
     {
      "fr": "vendre la mèche",
      "uz": "sirlarni fosh qilmoq",
      "emoji": "🕯️",
      "alt": [
       "tilidan chiqib ketmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Sophie a le cafard aujourd'hui parce qu'il pleut continuellement.",
      "uz": "Sofiyaning bugun tinimsiz yomg'ir yog'ayotgani sababli kayfiyati yo'q.",
      "uzAlt": [
       "Sofiya bugun tushkun ahvolda chunki tinimsiz yomg'ir yog'moqda."
      ]
     },
     {
      "fr": "Pierre est tombé dans les pommes pendant la longue réunion.",
      "uz": "Pyer uzun yig'ilish paytida hushidan ketib qoldi.",
      "uzAlt": [
       "Pyer uzoq yig'ilish vaqtida hushini yo'qotdi."
      ]
     },
     {
      "fr": "Notre entreprise a le vent en poupe ces derniers temps.",
      "uz": "Korxonamiz so'nggi paytlarda juda omadli bo'lib turibdi.",
      "uzAlt": [
       "Bizning kompaniyamiz oxirgi vaqtlarda muvaffaqiyat qozonmoqda."
      ]
     },
     {
      "fr": "Je donne ma langue au chat car je ne trouve pas la solution.",
      "uz": "Men taslim bo'lyapman chunki yechimini topa olmayapman.",
      "uzAlt": [
       "Topshiriqni topa olmayotganim uchun taslim bo'laman."
      ]
     },
     {
      "fr": "Ce magnifique manteau coûte les yeux de la tête à Paris.",
      "uz": "Peshtaxtadagi bu go'zal palto Parijda juda qimmat turadi.",
      "uzAlt": [
       "Bu ajoyib palto Parijda juda qimmatga tushadi."
      ]
     },
     {
      "fr": "Malika a posé un lapin à son collègue ce matin.",
      "uz": "Malika bu tongda o'z hamkasbiga uchrashuvga kelmadi.",
      "uzAlt": [
       "Malika bugun ertalab hamkasbini kutdirib qo'ydi."
      ]
     }
    ]
   },
   {
    "id": "u39l2",
    "title": "Kundalik harakatlar",
    "words": [
     {
      "fr": "mettre la main à la pâte",
      "uz": "faol qatnashmoq",
      "emoji": "✋",
      "alt": [
       "yordam bermoq"
      ]
     },
     {
      "fr": "noyer le poisson",
      "uz": "mavzuni chalg'itmoq",
      "emoji": "🐟",
      "alt": [
       "gapni aylantirmoq"
      ]
     },
     {
      "fr": "avoir le pain sur la planche",
      "uz": "ishlari ko'p bo'lmoq",
      "emoji": "🥖",
      "alt": [
       "band bo'lmoq"
      ]
     },
     {
      "fr": "raconter des salades",
      "uz": "bo'lmagan gaplarni aytmoq",
      "emoji": "🥗",
      "alt": [
       "aldamoq"
      ]
     },
     {
      "fr": "passer l'éponge",
      "uz": "kechirib yubormoq",
      "emoji": "🧽",
      "alt": [
       "unutmoq"
      ]
     },
     {
      "fr": "prendre le taureau par les cornes",
      "uz": "tavakkal qilmoq",
      "emoji": "🐂",
      "alt": [
       "muammoni hal qilmoq"
      ]
     },
     {
      "fr": "tirer les vers du nez",
      "uz": "sirini og'zidan tortib olmoq",
      "emoji": "🪱",
      "alt": [
       "gapirtirmoq"
      ]
     },
     {
      "fr": "toucher du bois",
      "uz": "ko'z tegmasin demoq",
      "emoji": "🪵",
      "alt": [
       "omad tilamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Tout le monde doit mettre la main à la pâte pour réussir.",
      "uz": "Muvaffaqiyatga erishish uchun hamma faol qatnashishi kerak.",
      "uzAlt": [
       "Yutuq uchun barcha o'z hissasini qo'shishi lozim."
      ]
     },
     {
      "fr": "Il essaie de noyer le poisson quand on lui pose des questions.",
      "uz": "Unga savollar berishganda mavzuni chalg'itishga harakat qiladi.",
      "uzAlt": [
       "U savol berilganda gapni boshqa yoqqa buradi."
      ]
     },
     {
      "fr": "Ali a beaucoup de pain sur la planche cette semaine.",
      "uz": "Alining bu hafta ishlari juda ko'p.",
      "uzAlt": [
       "Ali bu haftada juda band."
      ]
     },
     {
      "fr": "Ne raconte pas des salades à tes parents.",
      "uz": "Ota-onangizga bo'lmagan gaplarni gapirmang.",
      "uzAlt": [
       "Ota-onangizga yolg'on gapirmang."
      ]
     },
     {
      "fr": "Il faut passer l'éponge sur les petits conflits du passé.",
      "uz": "O'tgan kichik nizolarni kechirib yuborish kerak.",
      "uzAlt": [
       "O'tmishdagi kichik janjallarni unutish lozim."
      ]
     },
     {
      "fr": "Il faut prendre le taureau par les cornes pour avancer.",
      "uz": "Oldinga intilish uchun muammoni o'z qo'liga olish kerak.",
      "uzAlt": [
       "Rivojlanish uchun qadam tashlash shart."
      ]
     }
    ]
   },
   {
    "id": "u39l3",
    "title": "Tabiat va obrazlar",
    "words": [
     {
      "fr": "pleuvoir des cordes",
      "uz": "jala quyib yog'moq",
      "emoji": "🌧️",
      "alt": [
       "kuchli yomg'ir yog'moq"
      ]
     },
     {
      "fr": "avoir le compas dans l'œil",
      "uz": "ko'zi o'lchovli bo'lmoq",
      "emoji": "📐",
      "alt": [
       "aniq chamalash"
      ]
     },
     {
      "fr": "faire cavalier seul",
      "uz": "yakka o'zi harakat qilmoq",
      "emoji": "🏇",
      "alt": [
       "mustaqil ish tutmoq"
      ]
     },
     {
      "fr": "revenir à nos moutons",
      "uz": "asosiy mavzuga qaytmoq",
      "emoji": "🐑",
      "alt": [
       "gapni davom ettirmoq"
      ]
     },
     {
      "fr": "avoir le cœur sur la main",
      "uz": "ochiq ko'ngil bo'lmoq",
      "emoji": "❤️",
      "alt": [
       "sahiy bo'lmoq"
      ]
     },
     {
      "fr": "monter un bateau",
      "uz": "aldab qo'ymoq",
      "emoji": "⛵",
      "alt": [
       "klounlik qilmoq"
      ]
     },
     {
      "fr": "chercher midi à quatorze heures",
      "uz": "ishni murakkablashtirmoq",
      "emoji": "⏰",
      "alt": [
       "keraksiz qidirmoq"
      ]
     },
     {
      "fr": "vendre la peau de l'ours",
      "uz": "terini oldindan bo'lishmoq",
      "emoji": "🐻",
      "alt": [
       "hali bo'lmagan narsaga tayanmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il pleut des cordes ce soir dans la belle ville.",
      "uz": "Bugun kechqurun go'zal shaharda jala quyib yog'moqda.",
      "uzAlt": [
       "Kecha oqshom bu shahar ustidan kuchli yomg'ir yog'di."
      ]
     },
     {
      "fr": "Sophie a le compas dans l'œil pour mesurer les meubles.",
      "uz": "Sofiyaning mebellarni o'lchashda ko'zi o'lchovli.",
      "uzAlt": [
       "Sofiya narsalarni ko'z bilan aniq o'lchay oladi."
      ]
     },
     {
      "fr": "Il préfère faire cavalier seul dans ses projets professionnels.",
      "uz": "U kasbiy loyihalarida yakka o'zi harakat qilishni afzal ko'radi.",
      "uzAlt": [
       "U o'z ishlarida mustaqil bo'lishni yoqtiradi."
      ]
     },
     {
      "fr": "Revenons à nos moutons pour terminer cette discussion.",
      "uz": "Bu muhokamani yakunlash uchun asosiy mavzuga qaytaylik.",
      "uzAlt": [
       "Suhbatni davom ettirish uchun mavzuga qaytamiz."
      ]
     },
     {
      "fr": "Notre professeur a toujours le cœur sur la main avec nous.",
      "uz": "O'qituvchimiz biz bilan munosabatda doimo ochiq ko'ngil.",
      "uzAlt": [
       "Bizning ustozimiz doimo saxiy va mehribon."
      ]
     },
     {
      "fr": "Il ne faut pas chercher midi à quatorze heures pour ce problème.",
      "uz": "Bu muammo uchun ishni keraksiz murakkablashtirish kerak emas.",
      "uzAlt": [
       "Masalani ortiqcha qiyinlashtirishga hojat yo'q."
      ]
     }
    ]
   },
   {
    "id": "u39l4",
    "title": "Hayotiy voqealar",
    "words": [
     {
      "fr": "mettre de l'eau dans son vin",
      "uz": "vazminroq bo'lmoq",
      "emoji": "🍷",
      "alt": [
       "yon bosmoq"
      ]
     },
     {
      "fr": "boire du petit lait",
      "uz": "xursand bo'lmoq",
      "emoji": "🥛",
      "alt": [
       "rohatlanmoq"
      ]
     },
     {
      "fr": "filer à l'anglaise",
      "uz": "bildirmasdan ketib qolmoq",
      "emoji": "🏃",
      "alt": [
       "xayrlashmay chiqib ketish"
      ]
     },
     {
      "fr": "prendre ses jambes à son cou",
      "uz": "jadal qochib qolmoq",
      "emoji": "🦵",
      "alt": [
       "tezda ketmoq"
      ]
     },
     {
      "fr": "avoir la puce à l'oreille",
      "uz": "shubhalanib qolmoq",
      "emoji": "🐛",
      "alt": [
       "sezib qolmoq"
      ]
     },
     {
      "fr": "tomber des nues",
      "uz": "hayratda qolmoq",
      "emoji": "☁️",
      "alt": [
       "shokka tushmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il a dû mettre de l'eau dans son vin lors du compromis.",
      "uz": "U kelishuv vaqtida vazminroq bo'lishiga to'g'ri keldi.",
      "uzAlt": [
       "U murosaga kelish uchun yon bosdi."
      ]
     },
     {
      "fr": "Malika boit du petit lait quand on la félicite.",
      "uz": "Malikani maqtashganda u behad xursand bo'ladi.",
      "uzAlt": [
       "Malika maqtov eshitganda zavqlanadi."
      ]
     },
     {
      "fr": "Pierre a filé à l'anglaise sans dire au revoir.",
      "uz": "Pyer xayrlashmasdan bildirmasdan ketib qoldi.",
      "uzAlt": [
       "Pyer hech kimga aytmasdan chiqib ketdi."
      ]
     },
     {
      "fr": "Quand il a vu le danger, il a pris ses jambes à son cou.",
      "uz": "U xavfni ko'rgan zahoti jadal qochib qoldi.",
      "uzAlt": [
       "Xavfni sezgach, u tezda qochdi."
      ]
     },
     {
      "fr": "Cette étrange nouvelle m'a mis la puce à l'oreille.",
      "uz": "Bu g'alati yangilik menda shubha uyg'otdi.",
      "uzAlt": [
       "Ushbu xabar menda shubha uyg'otdi."
      ]
     },
     {
      "fr": "Je suis tombé des nues en apprenant cette grande nouvelle.",
      "uz": "Bu muhim yangilikni eshitib men hayratda qoldim.",
      "uzAlt": [
       "Shunday ulkan xabarni bilib shokka tushdim."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u40",
  "level": "C1",
  "title": "Argot va verlan",
  "description": "Yoshlar tili, so'zlashuv uslubi",
  "color": "#F59E0B",
  "guide": [
   {
    "title": "Registrlarning farqi",
    "text": "Fransuz tilida muloqot qilganda uchta asosiy registr mavjud: rasmiy (soutenu), kundalik (courant) va norasmiy (familier). Yoshlar tili asosan familier registriga tayanib, do'stlar orasida erkin muloqotni ta'minlaydi.",
    "examples": [
     [
      "C'est une bonne idée.",
      "Bu yaxshi g'oya."
     ],
     [
      "C'eut été une excellente idée.",
      "Bu ajoyib g'oya bo'lar edi."
     ]
    ]
   },
   {
    "title": "Verlan nima?",
    "text": "Verlan — bu so'zlarning bo'g'inlarini teskari o'girish orqali hosil qilinadigan fransuzcha slang turi. Masalan, «femme» so'zi «meuf»ga, «fou» so'zi «louf» yoki «chelou»ga aylanadi.",
    "examples": [
     [
      "Cette meuf est sympa.",
      "Bu qiz yoqimtoy."
     ],
     [
      "Ce mec est chelou.",
      "Bu yigit g'alati."
     ]
    ]
   },
   {
    "title": "So'zlashuv iboralari",
    "text": "Fransuz yoshlari kundalik hayotda qisqartma va o'ziga xos so'zlardan juda ko'p foydalanadilar. Ularni tushunish tabiiy muhitda erkin suhbatlashishga yordam beradi.",
    "examples": [
     [
      "J'ai capté le truc.",
      "Men nima gapligini tushundim."
     ],
     [
      "Laisse tomber.",
      "Buni qo'y, ahamiyati yo'q."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u40l1",
    "title": "Yoshlar tili asoslari",
    "words": [
     {
      "fr": "le mec",
      "uz": "yigit",
      "emoji": "👦",
      "alt": [
       "erkak",
       "bola"
      ]
     },
     {
      "fr": "la meuf",
      "uz": "qiz",
      "emoji": "👧",
      "alt": [
       "ayol",
       "dugona"
      ]
     },
     {
      "fr": "capter",
      "uz": "tushunmoq",
      "emoji": "🧠",
      "alt": [
       "anglamoq",
       "ilg'ab olmoq"
      ]
     },
     {
      "fr": "kiffer",
      "uz": "yoqtirmoq",
      "emoji": "❤️",
      "alt": [
       "rohatlanmoq",
       "sevmoq"
      ]
     },
     {
      "fr": "bof",
      "uz": "o'rtacha",
      "emoji": "😐",
      "alt": [
       "unchasemas",
       "farqi yo'q"
      ]
     },
     {
      "fr": "sympa",
      "uz": "yoqimtoy",
      "emoji": "😊",
      "alt": [
       "mehribon",
       "ajoyib"
      ]
     },
     {
      "fr": "super",
      "uz": "zo'r",
      "emoji": "⭐",
      "alt": [
       "super",
       "a'lo"
      ]
     },
     {
      "fr": "cool",
      "uz": "qulay",
      "emoji": "😎",
      "alt": [
       "tinch",
       "ajoyib"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ce mec est vraiment sympa avec tous ses camarades.",
      "uz": "Bu yigit barcha o'rtog'iga rostdan ham juda yoqimtoy.",
      "uzAlt": [
       "Bu yigit o'rtoqlariga nisbatan juda mehribon."
      ]
     },
     {
      "fr": "La meuf de Pierre kiffe grave cette musique moderne.",
      "uz": "Pyerning qiz do'sti bu zamonaviy musiqani qattiq yoqtiradi.",
      "uzAlt": [
       "Pyerning qizi bu zamonaviy musiqadan rohatlanadi."
      ]
     },
     {
      "fr": "J'ai capté le message que Sophie a envoyé hier.",
      "uz": "Men Sofi kecha yuborgan xabarni tushunib etdim.",
      "uzAlt": [
       "Sofi kecha yuborgan xabarni angladim."
      ]
     },
     {
      "fr": "Tu trouves ce film cool ou c'est un peu bof?",
      "uz": "Bu filmni zo'r deb o'ylaysanmi yoki unchasemasmi?",
      "uzAlt": [
       "Bu kinoni qulay deb hisoblaysanmi yo o'rtachami?"
      ]
     },
     {
      "fr": "Malika trouve que le nouveau projet est super.",
      "uz": "Malika yangi loyihani juda zo'r deb topmoqda.",
      "uzAlt": [
       "Malika yangi loyiha a'lo ekanini aytmoqda."
      ]
     },
     {
      "fr": "Ali kiffe passer son temps libre avec ses amis proches.",
      "uz": "Ali bo'sh vaqtini yaqin do'stlari bilan o'tkazishni yoqtiradi.",
      "uzAlt": [
       "Ali o'zining bo'sh vaqtini yaqin do'stlari bilan o'tkazishdan zavqlanadi."
      ]
     }
    ]
   },
   {
    "id": "u40l2",
    "title": "Verlan sirlari",
    "words": [
     {
      "fr": "chelou",
      "uz": "g'alati",
      "emoji": "🤔",
      "alt": [
       "shubhali",
       "tushunarsiz"
      ]
     },
     {
      "fr": "relou",
      "uz": "zerikarli",
      "emoji": "🥱",
      "alt": [
       "charchatadigan",
       "bezovta qiluvchi"
      ]
     },
     {
      "fr": "ouf",
      "uz": "aqldan ozgan",
      "emoji": "🤪",
      "alt": [
       "daxshatli",
       "telba"
      ]
     },
     {
      "fr": "zarbi",
      "uz": "boshqacha",
      "emoji": "🌀",
      "alt": [
       "g'ayrioddiy",
       "allaqanday"
      ]
     },
     {
      "fr": "verlan",
      "uz": "argot",
      "emoji": "🗣️",
      "alt": [
       "teskari til",
       "slang"
      ]
     },
     {
      "fr": "chanmé",
      "uz": "vahshiy",
      "emoji": "🔥",
      "alt": [
       "juda zo'r",
       "qo'rqinchli"
      ]
     },
     {
      "fr": "keuf",
      "uz": "politsiyachi",
      "emoji": "👮",
      "alt": [
       "militsiya",
       "tartib qo'riqchisi"
      ]
     },
     {
      "fr": "pécho",
      "uz": "qo'lga kiritmoq",
      "emoji": "🎯",
      "alt": [
       "aldamoq",
       "topib olmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ce comportement chelou m'inquiète beaucoup aujourd'hui.",
      "uz": "Bu g'alati xulq-atvor bugun meni qattiq tashvishga solmoqda.",
      "uzAlt": [
       "Bugun bu shubhali qiliq meni juda o'ylantirmoqda."
      ]
     },
     {
      "fr": "Il ne faut pas parler avec ce type relou.",
      "uz": "Bu zerikarli odam bilan gaplashish mutlaqo kerak emas.",
      "uzAlt": [
       "Ushbu bezovta qiluvchi kishi bilan suhbatlashmang."
      ]
     },
     {
      "fr": "La fête d'hier soir était tout simplement ouf.",
      "uz": "Kecha kechqurun bo'lgan bayram shunchaki aqldan ozgan darajada edi.",
      "uzAlt": [
       "Kechagi bazm daxshatli darajada ajoyib edi."
      ]
     },
     {
      "fr": "Le verlan est un argot français très populaire chez les jeunes.",
      "uz": "Verlan yoshlar orasida juda ommabop bo'lgan fransuzcha slangdir.",
      "uzAlt": [
       "Verlan — yoshlar orasida keng tarqalgan fransuzcha argot."
      ]
     },
     {
      "fr": "Sophie a réussi à pécho un super stage d'été.",
      "uz": "Sofi ajoyib yozgi amaliyotni qo'lga kiritishga muvaffaq bo'ldi.",
      "uzAlt": [
       "Sofi ajoyib yozgi stajirovkaga ega chiqdi."
      ]
     },
     {
      "fr": "Ce concert de rock était vraiment chanmé du début à la fin.",
      "uz": "Bu rok konserti boshidan oxirigacha rostdan ham juda zo'r edi.",
      "uzAlt": [
       "Ushbu rok konserti boshidan oxirigacha daxshatli darajada zo'r chiqdi."
      ]
     }
    ]
   },
   {
    "id": "u40l3",
    "title": "Kundalik ifodalar",
    "words": [
     {
      "fr": "la tune",
      "uz": "pul",
      "emoji": "💶",
      "alt": [
       "mablag'",
       "kapital"
      ]
     },
     {
      "fr": "le boulo",
      "uz": "ish",
      "emoji": "💼",
      "alt": [
       "vazifa",
       "mehnat"
      ]
     },
     {
      "fr": "gosse",
      "uz": "bola",
      "emoji": "👶",
      "alt": [
       "go'dak",
       "farzand"
      ]
     },
     {
      "fr": "flipper",
      "uz": "qo'rqmoq",
      "emoji": "😱",
      "alt": [
       "sarosimaga tushmoq",
       "vahimaga tushmoq"
      ]
     },
     {
      "fr": "rigoler",
      "uz": "kulmoq",
      "emoji": "😂",
      "alt": [
       "hazillashmoq",
       "shaddodlik qilmoq"
      ]
     },
     {
      "fr": "chier",
      "uz": "bezovta qilmoq",
      "emoji": "😒",
      "alt": [
       "g'ashiga tegmoq",
       "zeriktirmoq"
      ]
     },
     {
      "fr": "boulot",
      "uz": "mashg'ulot",
      "emoji": "🛠️",
      "alt": [
       "xizmat",
       "faoliyat"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali cherche de la tune pour acheter une nouvelle caisse.",
      "uz": "Ali yangi mashina sotib olish uchun pul qidirmoqda.",
      "uzAlt": [
       "Ali yangi avtomobil olish maqsadida mablag' topmoqchi."
      ]
     },
     {
      "fr": "Mon boulo commence très tôt le matin en semaine.",
      "uz": "Mening ishim haftaning kunlari ertalab juda barvaqt boshlanadi.",
      "uzAlt": [
       "Ishim ish kunlari ertalab juda barvaqt ochiladi."
      ]
     },
     {
      "fr": "Ces gosses adorent rigoler dans la grande cour.",
      "uz": "Bu bolalar katta hovlida kulishni juda yaxshi ko'radilar.",
      "uzAlt": [
       "Ushbu go'daklar keng hovlida zavq bilan kulishadi."
      ]
     },
     {
      "fr": "Il ne faut jamais flipper devant un petit problème technique.",
      "uz": "Kichkina texnik muammo oldida hech qachon qo'rqish kerak emas.",
      "uzAlt": [
       "Kichik texnik muammodan sira sarosimaga tushmang."
      ]
     },
     {
      "fr": "Cette situation commence vraiment à me chier profondément.",
      "uz": "Bu holat tobora menda jiddiy bezovtalik tug'dirmoqda.",
      "uzAlt": [
       "Ushbu vaziyat asta-sekin g'ashimga tegyapti."
      ]
     },
     {
      "fr": "Pierre fait un bon boulot au sein de son équipe.",
      "uz": "Pyer o'z jamoasi ichida yaxshi mehnat qilmoqda.",
      "uzAlt": [
       "Pyer o'z jamoasida samarali ish olib bormoqda."
      ]
     }
    ]
   },
   {
    "id": "u40l4",
    "title": "Zamonaviy muloqot",
    "words": [
     {
      "fr": "craquer",
      "uz": "taslim bo'lmoq",
      "emoji": "💥",
      "alt": [
       "charchamoq",
       "sindirmoq"
      ]
     },
     {
      "fr": "lâcher",
      "uz": "tashlamoq",
      "emoji": "🕊️",
      "alt": [
       "qo'yib yubormoq",
       "voz kechmoq"
      ]
     },
     {
      "fr": "piquer",
      "uz": "o'g'irlamoq",
      "emoji": "🕵️",
      "alt": [
       "shikastlamoq",
       "sanchmoq"
      ]
     },
     {
      "fr": "galérer",
      "uz": "qiynalmoq",
      "emoji": "😓",
      "alt": [
       "aziyat chekmoq",
       "mashaqqat chekmoq"
      ]
     },
     {
      "fr": "se marrer",
      "uz": "maroq bilan kulmoq",
      "emoji": "😆",
      "alt": [
       "xursand bo'lmoq",
       "hordiq chiqarmoq"
      ]
     },
     {
      "fr": "poto",
      "uz": "o'rtoq",
      "emoji": "🤝",
      "alt": [
       "og'ayni",
       "do'st"
      ]
     },
     {
      "fr": "gonzesse",
      "uz": "xotin",
      "emoji": "👩",
      "alt": [
       "ayol kishi",
       "qiz"
      ]
     },
     {
      "fr": "flotter",
      "uz": "suzmoq",
      "emoji": "☁️",
      "alt": [
       "qalqib yurmoq",
       "havoda turmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Mon meilleur poto a failli craquer pendant l'examen difficile.",
      "uz": "Mening eng yaqin o'rtog'im qiyin imtihon paytida deyarli taslim bo'layozdi.",
      "uzAlt": [
       "Eng yaqin og'aynim og'ir imtihonda deyarli sinayozdi."
      ]
     },
     {
      "fr": "Il ne faut jamais lâcher ses rêves les plus profonds.",
      "uz": "O'zingizning eng tub orzularingizdan aslo voz kechmasligingiz kerak.",
      "uzAlt": [
       "Eng chuqur niyatlaringizni hech qachon qo'yib yubormang."
      ]
     },
     {
      "fr": "Quelqu'un a piqué mon vieux stylo sur la table.",
      "uz": "Kimgadir stoldagi eski ruchkamni o'g'irlab ketdi.",
      "uzAlt": [
       "Kimdir stoldan mening eski qalamimni olibdi."
      ]
     },
     {
      "fr": "Malika a galéré pour comprendre cette règle grammaticale complexe.",
      "uz": "Malika bu murakkab grammatik qoidani tushunish uchun qattiq qiynaldi.",
      "uzAlt": [
       "Malika ushbu mushkul grammatik qoidani o'zlashtirishda mashaqqat chekdi."
      ]
     },
     {
      "fr": "Nous aimons bien nous marrer avec nos fidèles potos.",
      "uz": "Biz sodiq o'rtoqlarimiz bilan maroq bilan kulishni yaxshi ko'ramiz.",
      "uzAlt": [
       "Sadoqatli og'aynilarimiz bilan birga xursand bo'lishni yoqtiramiz."
      ]
     },
     {
      "fr": "Sophie et ses potos discutent calmement en plein air.",
      "uz": "Sofi va uning o'rtoqlari ochiq havoda sokin suhbatlashmoqdalar.",
      "uzAlt": [
       "Sofi va uning do'stlari toza havoda tinchgina gaplashishmoqda."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u41",
  "level": "C1",
  "title": "Adabiy til",
  "description": "Klassik adabiyot uslubi, hikoyachilik",
  "color": "#FB923C",
  "guide": [
   {
    "title": "Passé simple fe'llari",
    "text": "Adabiy til va klassik hikoyachilikda o'tgan zamondagi tugallangan voqealarni ifodalash uchun passé simple zamoni ishlatiladi. Bu zamon asosan yozma nutqda qo'llaniladi.",
    "examples": [
     [
      "Il fut un grand écrivain.",
      "U buyuk yozuvchi bo'ldi."
     ],
     [
      "Elle alla au château.",
      "U qasrga bordi."
     ]
    ]
   },
   {
    "title": "Adabiy so'z tartibi",
    "text": "Klassik adabiyotda enigma va badiiylik yaratish uchun fe'l egadan oldinga o'tishi yoki inversiya qilinishi mumkin.",
    "examples": [
     [
      "Soudain apparut le prince.",
      "To'satdan shahzoda paydo bo'ldi."
     ],
     [
      "Telle fut sa décision.",
      "Uning qarori shunday bo'ldi."
     ]
    ]
   },
   {
    "title": "Adabiy uslub va tasvir",
    "text": "Adabiy matnlarda obrazlarni boyitish uchun kam ishlatiladigan sifatlar va metaforalardan keng foydalaniladi.",
    "examples": [
     [
      "La nuit enveloppa la ville.",
      "Tun shaharni o'rab oldi."
     ],
     [
      "Le silence régna dans la salle.",
      "Zalda sukut hukm surdi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u41l1",
    "title": "Adabiy uslub 1",
    "words": [
     {
      "fr": "le style",
      "uz": "uslub",
      "emoji": "✍️",
      "alt": [
       "tarz"
      ]
     },
     {
      "fr": "l'auteur",
      "uz": "muallif",
      "emoji": "📖",
      "alt": [
       "yozuvchi"
      ]
     },
     {
      "fr": "le héros",
      "uz": "qahramon",
      "emoji": "🦸",
      "alt": [
       "botir"
      ]
     },
     {
      "fr": "l'héroïne",
      "uz": "bosh qahramon ayol",
      "emoji": "🧝‍♀",
      "alt": [
       "personaj"
      ]
     },
     {
      "fr": "la tragédie",
      "uz": "fojia",
      "emoji": "🏛️",
      "alt": [
       "mash'um voqea"
      ]
     },
     {
      "fr": "le destinataire",
      "uz": "murojaat qilinuvchi",
      "emoji": "🎯",
      "alt": [
       "oluvchi"
      ]
     },
     {
      "fr": "le narrateur",
      "uz": "hikoyachi",
      "emoji": "🗣️",
      "alt": [
       "bayon qiluvchi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "L'auteur écrivit un chef-d'œuvre remarquable.",
      "uz": "Muallif ajoyib asar yozdi.",
      "uzAlt": [
       "Muallif e'tiborga molik asar yaratdi."
      ],
      "frAlt": [
       "L'écrivain composa un roman remarquable."
      ]
     },
     {
      "fr": "Le héros traversa la forêt sombre.",
      "uz": "Qahramon qorong'i o'rmondan o'tdi.",
      "uzAlt": [
       "Botir qorong'u o'rmonni kesib o'tdi."
      ]
     },
     {
      "fr": "Cette héroïne affronta mille dangers.",
      "uz": "Bu qahramon ayol minglab xavflarga qarshi turdi.",
      "uzAlt": [
       "Ushbu qahramon ming xavfni yengdi."
      ]
     },
     {
      "fr": "Un drame terrible secoua la province.",
      "uz": "Dahshatli drama viloyatni larzaga soldi.",
      "uzAlt": [
       "Qo'rqinchli fojia viloyatni qamrab oldi."
      ]
     },
     {
      "fr": "Le narrateur parla d'un passé lointain.",
      "uz": "Hikoyachi uzoq o'tmish haqida gapirdi.",
      "uzAlt": [
       "Hikoyachi qadimgi zamonni hikoya qildi."
      ]
     },
     {
      "fr": "Le style classique séduisit les critiques.",
      "uz": "Klassik uslub tanqidchilarni o'ziga rom etdi.",
      "uzAlt": [
       "Klassik yo'nalish tanqidchilarga yoqdi."
      ]
     }
    ]
   },
   {
    "id": "u41l2",
    "title": "Hikoyachilik 2",
    "words": [
     {
      "fr": "le vers",
      "uz": "misra",
      "emoji": "📜",
      "alt": [
       "she'r misrasi"
      ]
     },
     {
      "fr": "la rime",
      "uz": "qofiya",
      "emoji": "🎶",
      "alt": [
       "ohang"
      ]
     },
     {
      "fr": "la prose",
      "uz": "nasr",
      "emoji": "📚",
      "alt": [
       "nasriy asar"
      ]
     },
     {
      "fr": "le volume",
      "uz": "jild",
      "emoji": "📘",
      "alt": [
       "kitob jildi"
      ]
     },
     {
      "fr": "l'intrigue",
      "uz": "syujet",
      "emoji": "🧩",
      "alt": [
       "voqealar rivoji"
      ]
     },
     {
      "fr": "le dénouement",
      "uz": "yechim",
      "emoji": "🔑",
      "alt": [
       "nihoya"
      ]
     },
     {
      "fr": "le dialogue",
      "uz": "suhbat",
      "emoji": "💬",
      "alt": [
       "muloqot"
      ]
     },
     {
      "fr": "le monologue",
      "uz": "monolog",
      "emoji": "👤",
      "alt": [
       "ichki so'z"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le poète chercha la rime parfaite.",
      "uz": "Shoir mukammal qofiyani qidirdi.",
      "uzAlt": [
       "Shoir eng mos qofiyani topdi."
      ]
     },
     {
      "fr": "Pierre écrivit son premier volume en prose.",
      "uz": "Pyer o'zining ilk nasriy jildini yozdi.",
      "uzAlt": [
       "Pyer nasrda birinchi kitobini yaratdi."
      ]
     },
     {
      "fr": "L'intrigue captiva tous les lecteurs.",
      "uz": "Syujet barcha kitobxonlarni o'ziga jalb qildi.",
      "uzAlt": [
       "Voqealar rivoji o'quvchilarni hayratda qoldirdi."
      ]
     },
     {
      "fr": "Le dénouement surprit le public.",
      "uz": "Yechim ommani ajablantirdi.",
      "uzAlt": [
       "Nihoya tomoshabinlarni lol qoldirdi."
      ]
     },
     {
      "fr": "Ce long dialogue dura toute la nuit.",
      "uz": "Bu uzun suhbat butun tun davom etdi.",
      "uzAlt": [
       "Ushbu uzun muloqot tonggacha cho'zildi."
      ]
     },
     {
      "fr": "Sophie prononça un monologue émouvant.",
      "uz": "Sofi ta'sirli monolog aytdi.",
      "uzAlt": [
       "Sofi qalbni to'lqinlantiruvchi monolog o'qidi."
      ]
     }
    ]
   },
   {
    "id": "u41l3",
    "title": "Klassik asarlar 3",
    "words": [
     {
      "fr": "la métaphore",
      "uz": "metafora",
      "emoji": "🎨",
      "alt": [
       "ko'chma ma'no"
      ]
     },
     {
      "fr": "le symbole",
      "uz": "ramz",
      "emoji": "🕊️",
      "alt": [
       "nishon"
      ]
     },
     {
      "fr": "le ton",
      "uz": "ohang",
      "emoji": "🎵",
      "alt": [
       "tovush"
      ]
     },
     {
      "fr": "le portrait",
      "uz": "portret",
      "emoji": "🖼️",
      "alt": [
       "tasvir"
      ]
     },
     {
      "fr": "le paysage",
      "uz": "manzara",
      "emoji": "🌄",
      "alt": [
       "tabiat ko'rinishi"
      ]
     },
     {
      "fr": "l'ambiance",
      "uz": "muhit",
      "emoji": "✨",
      "alt": [
       "kayfiyat"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Malika employa une métaphore brillante.",
      "uz": "Malika yorqin metaforadan foydalandi.",
      "uzAlt": [
       "Malika o'tkir ko'chma ma'no ishlatdi."
      ]
     },
     {
      "fr": "Le symbole de la paix unifia les peuples.",
      "uz": "Tinchlik ramzi xalqlarni birlashtirdi.",
      "uzAlt": [
       "Sulh timsoli elatlarni jipslashtirdi."
      ]
     },
     {
      "fr": "Ce ton grave convenait au roman.",
      "uz": "Bu jiddiy ohang romanga mos keldi.",
      "uzAlt": [
       "Ushbu jiddiy ohang asarga mos tushdi."
      ]
     },
     {
      "fr": "L'artiste peignit un magnifique portrait.",
      "uz": "Rassom ajoyib portret chizdi.",
      "uzAlt": [
       "Rassom mahobatli portret yaratdi."
      ]
     },
     {
      "fr": "Le paysage mystérieux fascina les voyageurs.",
      "uz": "Sirli manzara sayohatchilarni o'ziga rom etdi.",
      "uzAlt": [
       "Muztarob tabiat ko'rinishi sayohatchilarni hayratda qoldirdi."
      ]
     },
     {
      "fr": "Une ambiance nostalgique régna dans la pièce.",
      "uz": "Xonada sog'inch muhiti hukm surdi.",
      "uzAlt": [
       "Xonani nostaljik muhit egalladi."
      ]
     }
    ]
   },
   {
    "id": "u41l4",
    "title": "Adabiy tahlil 4",
    "words": [
     {
      "fr": "la critique",
      "uz": "tanqid",
      "emoji": "⚖️",
      "alt": [
       "baholash"
      ]
     },
     {
      "fr": "l'analyse",
      "uz": "tahlil qilish",
      "emoji": "🔍",
      "alt": [
       "o'rganish"
      ]
     },
     {
      "fr": "la pensée",
      "uz": "fikr",
      "emoji": "💡",
      "alt": [
       "g'oya"
      ]
     },
     {
      "fr": "l'inspiration",
      "uz": "ilhom",
      "emoji": "🌠",
      "alt": [
       "ijodiy ko'tarinkilik"
      ]
     },
     {
      "fr": "le lecteur",
      "uz": "kitobxon",
      "emoji": "👨‍\ud83c",
      "alt": [
       "o'quvchi"
      ]
     },
     {
      "fr": "le manuscrit",
      "uz": "qo'lyozma",
      "emoji": "📝",
      "alt": [
       "dastxat"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ali publia une critique littéraire passionnante.",
      "uz": "Ali qiziqarli adabiy tanqid e'lon qildi.",
      "uzAlt": [
       "Ali jozibali adabiy tahlil chop etdi."
      ]
     },
     {
      "fr": "Cette analyse révéla de nouveaux aspects.",
      "uz": "Ushbu tahlil yangi qirralarni ochib berdi.",
      "uzAlt": [
       "Bu o'rganish yangi jihatlarni namoyon etdi."
      ]
     },
     {
      "fr": "L'écrivain consulta une vieille source.",
      "uz": "Yozuvchi qadimiy manbaga murojaat qildi.",
      "uzAlt": [
       "Adib eski manbani varaqladi."
      ]
     },
     {
      "fr": "Sa pensée profonde marqua son époque.",
      "uz": "Uning chuqur fikri o'z davrida iz qoldirdi.",
      "uzAlt": [
       "Ushbu teran g'oya zamonasida mashhur bo'ldi."
      ]
     },
     {
      "fr": "La poésie devint sa source d'inspiration.",
      "uz": "She'riyat uning ilhom manbaiga aylandi.",
      "uzAlt": [
       "Nazm uning ijodiy eshigi bo'ldi."
      ]
     },
     {
      "fr": "Le lecteur découvrit un manuscrit rare.",
      "uz": "Kitobxon nodir qo'lyozmani kashf etdi.",
      "uzAlt": [
       "O'quvchi noyob qo'lyozmaga duch keldi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u42",
  "level": "C1",
  "title": "Nozik grammatika",
  "description": "Murakkab gaplar, zamonlar uyg'unligi",
  "color": "#FBBF24",
  "guide": [
   {
    "title": "Subjonctif Passé",
    "text": "Subjonctif passé o'tgan zamonda sodir bo'lgan va istak, shubha yoki shartga bog'liq bo'lgan harakatlarni bildirish uchun ishlatiladi. U yordamchi fe'lning subjonctif hozirgi zamondagi shakli va asosiy fe'lning participie passé shakridan yasaladi.",
    "examples": [
     [
      "Je doute qu'il soit venu.",
      "Men uning kelganidan shubhalanaman."
     ],
     [
      "Il faut que tu aies fini.",
      "Sening tugatgan bo'lishing kerak."
     ]
    ]
   },
   {
    "title": "Zamonlar uyg'unligi",
    "text": "Concordance des temps qoidasiga ko'ra, bosh gap o'tgan zamonda turganda, ergash gapdagi fe'l zamoni mos ravishda o'zgaradi. Oldingi harakatlar uchun passé composé yoki plus-que-parfait ishlatiladi.",
    "examples": [
     [
      "Pierre a dit qu'il partait.",
      "Pyer ketayotganini aytdi."
     ],
     [
      "Sophie pensait qu'elle avait réussi.",
      "Sofi muvaffaqiyat qozongan deb o'ylagan edi."
     ]
    ]
   },
   {
    "title": "Ne Explétif",
    "text": "Ne explétif fe'llardan keyin (qo'rquv, oldini olish, shubha) ma'no o'zgartirmasdan, faqat stilistik maqsadlarda ishlatiladigan ortiqcha 'ne' inkor yuklamasidir.",
    "examples": [
     [
      "J'ai peur qu'il ne pleuve.",
      "Yomg'ir yog'ishidan qo'rqaman."
     ],
     [
      "Évite qu'il ne vienne.",
      "Uning kelishining oldini ol."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u42l1",
    "title": "Murakkab subjonctif",
    "words": [
     {
      "fr": "le subjonctif",
      "uz": "subjonktiv",
      "emoji": "🔤",
      "alt": [
       "qaytish mayili"
      ]
     },
     {
      "fr": "le passé",
      "uz": "o'tgan zamon",
      "emoji": "⏳",
      "alt": [
       "kechagi kun"
      ]
     },
     {
      "fr": "le verbe",
      "uz": "fe'l",
      "emoji": "✍️",
      "alt": [
       "harakat so'zi"
      ]
     },
     {
      "fr": "l'auxiliaire",
      "uz": "yordamchi fe'l",
      "emoji": "🤝",
      "alt": [
       "ko'makchi"
      ]
     },
     {
      "fr": "le participe",
      "uz": "sifatdosh",
      "emoji": "📜",
      "alt": [
       "orttirma shakl"
      ]
     },
     {
      "fr": "le regretter",
      "uz": "afsuslanmoq",
      "emoji": "😔",
      "alt": [
       "o'kinmoq"
      ]
     },
     {
      "fr": "le souhait",
      "uz": "tilak",
      "emoji": "🌟",
      "alt": [
       "istak"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Je doute qu'Ali ait réussi cet examen difficile hier.",
      "uz": "Ali kecha bu qiyin imtihondan o'tganiga shubha qilaman.",
      "uzAlt": [
       "Men Alining kecha bu og'ir imtihonni topshirganidan gumondaman."
      ]
     },
     {
      "fr": "Bien qu'il ait plu, Sophie est sortie sans parapluie.",
      "uz": "Yomg'ir yoqqan bo'lishiga qaramay, Sofi soyabonsiz ko'chaga chiqdi.",
      "uzAlt": [
       "Garchi yomg'ir yog'gan bo'lsa-da, Sofi soyabonsiz tashqariga chiqdi."
      ]
     },
     {
      "fr": "Il est dommage que tu aies manqué cette belle réunion.",
      "uz": "Sening bu go'zal uchrashuvni o'tkazib yuborganing afsuslanarli.",
      "uzAlt": [
       "Sizning bu ajoyib yig'ilishdan qolganingiz achinarli."
      ]
     },
     {
      "fr": "Pierre craint que les enfants n'aient cassé la fenêtre.",
      "uz": "Pyer bolalar derazani sindirib qo'yganidan qo'rqadi.",
      "uzAlt": [
       "Pyer bolalar oynani sindirganidan xavotirda."
      ]
     },
     {
      "fr": "Nous souhaitons que Malika ait préparé son dossier à temps.",
      "uz": "Biz Malika o'z hujjatchasini o'z vaqtida tayyorlagan bo'lishini istaymiz.",
      "uzAlt": [
       "Malika o'z dosyesini vaqtida hozirlagan bo'lishini xohlaymiz."
      ]
     },
     {
      "fr": "Il faut que vous ayez compris cette règle grammaticale complexe.",
      "uz": "Siz bu murakkab grammatik qoidani tushungan bo'lishingiz shart.",
      "uzAlt": [
       "Sen bu murakkab qoidani anglab yetgan bo'lishing kerak."
      ]
     }
    ]
   },
   {
    "id": "u42l2",
    "title": "Ne explétif",
    "words": [
     {
      "fr": "l'explétif",
      "uz": "ortiqcha",
      "emoji": "➕",
      "alt": [
       "keraksiz"
      ]
     },
     {
      "fr": "la négation",
      "uz": "inkor",
      "emoji": "🚫",
      "alt": [
       "rad etish"
      ]
     },
     {
      "fr": "la crainte",
      "uz": "xavotir",
      "emoji": "😨",
      "alt": [
       "qo'rquv"
      ]
     },
     {
      "fr": "l'empêchement",
      "uz": "to'siq",
      "emoji": "🛑",
      "alt": [
       "g'ov"
      ]
     },
     {
      "fr": "la prudence",
      "uz": "ehtiyotkorlik",
      "emoji": "🛡️",
      "alt": [
       "hushyorlik"
      ]
     },
     {
      "fr": "la comparaison",
      "uz": "qiyoslash",
      "emoji": "⚖️",
      "alt": [
       "solishtirish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "J'ai peur qu'il ne pleuve avant notre départ pour Paris.",
      "uz": "Parijga jo'nashimizdan oldin yomg'ir yog'ishidan qo'rqaman.",
      "uzAlt": [
       "Parijga yo'l olishimizdan oldin yomg'ir yog'ib qolishidan xavotirdaman."
      ]
     },
     {
      "fr": "Évite qu'il ne commette la même erreur que l'an dernier.",
      "uz": "U o'tgan yilgidek xatoga yo'l qo'ymasligining oldini ol.",
      "uzAlt": [
       "Uning o'tgan yildagi xatoni takrorlamasligiga e'tibor ber."
      ]
     },
     {
      "fr": "Il est plus grand que vous ne le pensez.",
      "uz": "U siz o'ylaganingizdan kattaroqdir.",
      "uzAlt": [
       "U siz taxmin qilgandan ham ulug'vorroq."
      ]
     },
     {
      "fr": "Sophie redoute que les résultats ne soient pas favorables.",
      "uz": "Sofi natijalar ijobiy bo'lmasligidan hadiksiraydi.",
      "uzAlt": [
       "Sofi natijalar yaxshi chiqmasligidan qo'rqadi."
      ]
     },
     {
      "fr": "Empêchez qu'on ne vole ces documents importants.",
      "uz": "Bu muhim hujjatlarning o'g'irlanishiga yo'l qo'ymang.",
      "uzAlt": [
       "Ana shu qimmatli qog'ozlarni o'g'irlab ketishlariga to'sqinlik qiling."
      ]
     },
     {
      "fr": "Il craint que le train ne rate sa correspondance.",
      "uz": "U poyezd o'z ulanishini o'tkazib yuborishidan xavotirda.",
      "uzAlt": [
       "U poyezd o'z vaqtida yetib bormasligidan qo'rqadi."
      ]
     }
    ]
   },
   {
    "id": "u42l3",
    "title": "Grammatika amaliyoti",
    "words": [
     {
      "fr": "la syntaxe",
      "uz": "sintaksis",
      "emoji": "📐",
      "alt": [
       "gap tuzilishi"
      ]
     },
     {
      "fr": "la nuance",
      "uz": "noziklik",
      "emoji": "🌿",
      "alt": [
       "tus"
      ]
     },
     {
      "fr": "la structure",
      "uz": "tuzilish",
      "emoji": "🏗️",
      "alt": [
       "qurilma"
      ]
     },
     {
      "fr": "la maîtrise",
      "uz": "ustalik",
      "emoji": "🏆",
      "alt": [
       "mahorat"
      ]
     },
     {
      "fr": "l'expression",
      "uz": "ifoda",
      "emoji": "💬",
      "alt": [
       "bayon qilish"
      ]
     },
     {
      "fr": "le niveau",
      "uz": "daraja",
      "emoji": "📊",
      "alt": [
       "pog'ona"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Bien que le texte fût complexe, Ali a analysé chaque nuance.",
      "uz": "Matn murakkab bo'lishiga qaramay, Ali har bir nozik jihatni tahlil qildi.",
      "uzAlt": [
       "Garchi matn qiyin bo'lsa-da, Ali barcha nuqtalarni o'rganib chiqdi."
      ]
     },
     {
      "fr": "Malika a soutenu que la syntaxe française exigeait beaucoup de rigueur.",
      "uz": "Malika fransuz tili sintaksisi katta qat'iylik talab qilishini ta'kidladi.",
      "uzAlt": [
       "Malika fransuzcha gap tuzilishi talabchanligini aytib o'tdi."
      ]
     },
     {
      "fr": "Il est indispensable que tu aies acquis cette maîtrise avant l'examen.",
      "uz": "Imtihondan oldin bu mahoratni egallagan bo'lishing zarur.",
      "uzAlt": [
       "Sinovga qadar shu malakani hosil qilgan bo'lishing shart."
      ]
     },
     {
      "fr": "Sophie ignorait que Pierre avait préparé une telle surprise.",
      "uz": "Sofi Pyerning shunday kutilmagan sovg'a hozirlaganidan bexabar edi.",
      "uzAlt": [
       "Sofi Pyer bunday syurpriz tayyorlaganini bilmas edi."
      ]
     },
     {
      "fr": "Nous doutons que le conférencier ait bien expliqué la structure.",
      "uz": "Ma'ruzachi tuzilmani yaxshi tushuntirganiga shubha qilamiz.",
      "uzAlt": [
       "Notiq konstruksiyani yaxshi anglatib berganiga gumonimiz bor."
      ]
     },
     {
      "fr": "Il convenait que les étudiants rédigent un essai parfait.",
      "uz": "Talabalarning mukammal esse yozishi maqsadga muvofiq edi.",
      "uzAlt": [
       "O'quvchilar ideal insho yozishlari talab etilardi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u43",
  "level": "C1",
  "title": "Argumentatsiya",
  "description": "Insho, munozara, rasmiy nutq",
  "color": "#F59E0B",
  "guide": [
   {
    "title": "Certes... mais",
    "text": "Bu qurilma muayyan fikrni qisman tasdiqlash va keyin qarama-qarshi dalil keltirish uchun ishlatiladi.",
    "examples": [
     [
      "Certes, l'argument est fort, mais il reste des doutes.",
      "Albatta, dalil kuchli, biroq shubhalar qolmoqda."
     ],
     [
      "Certes, le projet coûte cher, mais il est efficace.",
      "To'g'ri, loyiha qimmatga tushadi, ammo u samarali."
     ]
    ]
   },
   {
    "title": "Force est de constater",
    "text": "Inkor etib bo'lmaydigan haqiqatni yoki yaqqol holatni tan olishni bildiradi.",
    "examples": [
     [
      "Force est de constater que la situation a changé.",
      "Vaziyat o'zgarganini tan olmasdan iloji yo'q."
     ],
     [
      "Force est de constater l'échec de cette méthode.",
      "Bu usulning muvaffaqiyatsizligini tan olish kerak."
     ]
    ]
   },
   {
    "title": "Il n'en reste pas moins",
    "text": "Barcha e'tirozlarga qaramay, asosiy xulosa yoki haqiqat o'z kuchida qolishini ko'rsatadi.",
    "examples": [
     [
      "Il n'en reste pas moins que le problème persiste.",
      "Shunga qaramay, muammo o'z kuchida qolmoqda."
     ],
     [
      "Il n'en reste pas moins un espoir pour l'avenir.",
      "Baribir kelajak uchun umid saqlanib qolmoqda."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u43l1",
    "title": "Nuans va mantiq",
    "words": [
     {
      "fr": "la prémisse",
      "uz": "boshlang'ich shart",
      "emoji": "📋",
      "alt": [
       "asos"
      ]
     },
     {
      "fr": "l'axiome",
      "uz": "isbot talab qilmas haqiqat",
      "emoji": "✨",
      "alt": [
       "aksioma"
      ]
     },
     {
      "fr": "le corollaire",
      "uz": "bevosita kelib chiqish",
      "emoji": "🔗",
      "alt": [
       "oqibat"
      ]
     },
     {
      "fr": "le paradoxe",
      "uz": "zidiyatli holat",
      "emoji": "🔄",
      "alt": [
       "paradoks"
      ]
     },
     {
      "fr": "la dichotomie",
      "uz": "ikki qismga bo'linish",
      "emoji": "⚖️",
      "alt": [
       "qarama-qarshilik"
      ]
     },
     {
      "fr": "l'ambiguïté",
      "uz": "noaniqlik",
      "emoji": "🌫️",
      "alt": [
       "ikkilamchilik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Certes, le postulat de Pierre semble logique, mais la nuance est importante.",
      "uz": "Albatta, Pierning dastlabki farazi mantiqiy ko'rinadi, biroq nozik farq muhim.",
      "uzAlt": [
       "To'g'ri, Pierning farazi mantiqiy, ammo nozik jihati muhim."
      ]
     },
     {
      "fr": "Force est de constater que la prémisse contient une ambiguïté cachée.",
      "uz": "Boshlang'ich shart yashirin noaniqlikni o'z ichiga olganini tan olish kerak.",
      "uzAlt": [
       "Tan olish kerakki, boshlang'ich shartda yashirin noaniqlik bor."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que ce paradoxe intrigue tous les chercheurs.",
      "uz": "Shunga qaramay, bu zidiyatli holat barcha tadqiqotchilarni qiziqtirmoqda.",
      "uzAlt": [
       "Baribir ushbu paradoks barcha tadqiqotchilarni qiziqtiradi."
      ]
     },
     {
      "fr": "Certes, l'axiome est simple, mais la dichotomie pose un problème complexe.",
      "uz": "Albatta, aksioma sodda, biroq ikki qismga bo'linish murakkab muammoni keltirib chiqaradi.",
      "uzAlt": [
       "To'g'ri, aksioma oddiy, lekin qarama-qarshilik murakkab muammo tug'diradi."
      ]
     },
     {
      "fr": "Force est de constater l'existence d'un corollaire inattendu dans cette théorie.",
      "uz": "Bu nazariyada kutilmagan bevosita kelib chiqish mavjudligini tan olmasdan iloji yo'q.",
      "uzAlt": [
       "Tan olish kerakki, bu nazariyada kutilmagan natija bor."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que chaque nuance clarifie notre argumentation.",
      "uz": "Shunga qaramay, har bir nozik farq bizning argumentatsiyamizni aniqlashtiradi.",
      "uzAlt": [
       "Biroq har bir nozik jihat dalilimizni oydinlashtiradi."
      ]
     }
    ]
   },
   {
    "id": "u43l2",
    "title": "Dalil va isbot",
    "words": [
     {
      "fr": "la rhétorique",
      "uz": "notiqlik san'ati",
      "emoji": "🗣️",
      "alt": [
       "ritorika"
      ]
     },
     {
      "fr": "l'éloquence",
      "uz": "ta'sirchan nutq",
      "emoji": "📜",
      "alt": [
       "fasohat"
      ]
     },
     {
      "fr": "le sophisme",
      "uz": "soxta xulosa",
      "emoji": "🎭",
      "alt": [
       "aldamchi dalil"
      ]
     },
     {
      "fr": "la réfutation",
      "uz": "inkor etish",
      "emoji": "❌",
      "alt": [
       "rad etish"
      ]
     },
     {
      "fr": "la validation",
      "uz": "tasdiqlash jarayoni",
      "emoji": "✅",
      "alt": [
       "ma'qullash"
      ]
     },
     {
      "fr": "le fondement",
      "uz": "tamal tosh",
      "emoji": "🏛️",
      "alt": [
       "poydevor"
      ]
     },
     {
      "fr": "la pertinence",
      "uz": "o'rinli ekanlik",
      "emoji": "🎯",
      "alt": [
       "muvofiqlik"
      ]
     },
     {
      "fr": "la rigueur",
      "uz": "qat'iylik",
      "emoji": "📐",
      "alt": [
       "aniqlik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Certes, la rhétorique de Sophie séduit le public, mais la rigueur scientifique manque.",
      "uz": "Albatta, Sofining notiqlik san'ati ommani rom etadi, biroq ilmiy qat'iylik yetishmaydi.",
      "uzAlt": [
       "To'g'ri, Sofining ritorikasi xalqni o'ziga qaratadi, lekin ilmiy aniqlik yo'q."
      ]
     },
     {
      "fr": "Force est de constater que ce discours repose sur un sophisme évident.",
      "uz": "Bu nutq yaqqol soxta xulosaga asoslanganini tan olish kerak.",
      "uzAlt": [
       "Tan olish kerakki, bu nutq ochiqdan-ochiq aldamchi dalilga tayanadi."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que la pertinence de cette réfutation est indéniable.",
      "uz": "Shunga qaramay, ushbu inkor etishning o'rinli ekanligi shubhasiz.",
      "uzAlt": [
       "Biroq bu rad etishning o'rinliligi inkor etib bo'lmaydigan haqiqat."
      ]
     },
     {
      "fr": "Certes, l'éloquence est impressionnante, mais le fondement du texte est fragile.",
      "uz": "Albatta, ta'sirchan nutq hayratlanarli, ammo matnning tamal toshi mo'rt.",
      "uzAlt": [
       "To'g'ri, fasohat ta'sirli, lekin matnning poydevori sust."
      ]
     },
     {
      "fr": "Force est de constater le succès de la validation après de longs débats.",
      "uz": "Uzoq munozaralardan keyin tasdiqlash jarayoni muvaffaqiyatli yakunlanganini tan olmasdan iloji yo'q.",
      "uzAlt": [
       "Tan olish kerakki, uzoq bahslardan so'ng tasdiqlash muvaffaqiyatli bo'ldi."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que la rigueur méthodologique garantit la réussite.",
      "uz": "Shunga qaramay, metodologik qat'iylik muvaffaqiyatni kafolatlaydi.",
      "uzAlt": [
       "Baribir uslubiy aniqlik muvaffaqiyatni ta'minlaydi."
      ]
     }
    ]
   },
   {
    "id": "u43l3",
    "title": "Tahlil va tanqid",
    "words": [
     {
      "fr": "le discernement",
      "uz": "farqlash qobiliyati",
      "emoji": "👁️",
      "alt": [
       "idrok"
      ]
     },
     {
      "fr": "l'impartialité",
      "uz": "xolislik",
      "emoji": "⚖️",
      "alt": [
       "betaraflik"
      ]
     },
     {
      "fr": "la subjectivité",
      "uz": "subyektiv yondashuv",
      "emoji": "🎨",
      "alt": [
       "shaxsiy fikr"
      ]
     },
     {
      "fr": "l'objectivité",
      "uz": "obyektivlik",
      "emoji": "🌐",
      "alt": [
       "haqqoniylik"
      ]
     },
     {
      "fr": "la contestation",
      "uz": "e'tiroz bildirish",
      "emoji": "✊",
      "alt": [
       "qarshi chiqish"
      ]
     },
     {
      "fr": "l'approbation",
      "uz": "ma'qullash hujjati",
      "emoji": "👍",
      "alt": [
       "rozi bo'lish"
      ]
     },
     {
      "fr": "l'essence",
      "uz": "mohiyat",
      "emoji": "🌟",
      "alt": [
       "tub ma'no"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Certes, l'impartialité demande du discernement, mais la subjectivité persiste toujours.",
      "uz": "Albatta, xolislik farqlash qobiliyatini talab qiladi, biroq subyektiv yondashuv doim saqlanib qoladi.",
      "uzAlt": [
       "To'g'ri, xolislik idrokni talab qiladi, lekin shaxsiy qarash doim mavjud."
      ]
     },
     {
      "fr": "Force est de constater que la contestation n'a pas touché l'essence du problème.",
      "uz": "E'tiroz bildirish muammoning mohiyatiga tegmaganini tan olish kerak.",
      "uzAlt": [
       "Tan olish kerakki, qarshi chiqish muammoning tub mohiyatiga ta'sir qilmadi."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que l'objectivité scientifique reste notre priorité absolue.",
      "uz": "Shunga qaramay, ilmiy obyektivlik bizning mutlaq ustuvor vazifamiz bo'lib qolmoqda.",
      "uzAlt": [
       "Biroq ilmiy haqqoniylik eng muhim vazifamizdir."
      ]
     },
     {
      "fr": "Certes, l'approbation générale est difficile, mais chaque nuance compte énormément.",
      "uz": "Albatta, umumiy ma'qullash qiyin, ammo har bir nozik jihat behad katta ahamiyatga ega.",
      "uzAlt": [
       "To'g'ri, hammaning roziligini olish qiyin, lekin har bir farq juda muhim."
      ]
     },
     {
      "fr": "Force est de constater l'importance d'un grand discernement dans ce dossier.",
      "uz": "Bu hujjatda katta farqlash qobiliyati muhimligini tan olmasdan iloji yo'q.",
      "uzAlt": [
       "Tan olish kerakki, bu ishda yuksak idrok zarur."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que la contestation améliore la qualité de l'essai.",
      "uz": "Shunga qaramay, e'tiroz bildirish inshoning sifatini yaxshilaydi.",
      "uzAlt": [
       "Baribir e'tiroz bildirish insho sifatini oshiradi."
      ]
     }
    ]
   },
   {
    "id": "u43l4",
    "title": "Ilmiy munozara",
    "words": [
     {
      "fr": "la prospective",
      "uz": "kelajakni bashorat qilish",
      "emoji": "🔮",
      "alt": [
       "bashorat"
      ]
     },
     {
      "fr": "l'extrapolation",
      "uz": "kengaytma xulosa",
      "emoji": "📈",
      "alt": [
       "umumlashtirish"
      ]
     },
     {
      "fr": "le paradigme",
      "uz": "ilmiy qarashlar tizimi",
      "emoji": "🌌",
      "alt": [
       "paradigma"
      ]
     },
     {
      "fr": "la corrélation",
      "uz": "o'zaro bog'liqlik",
      "emoji": "📊",
      "alt": [
       "korrelyatsiya"
      ]
     },
     {
      "fr": "la divergence",
      "uz": "fikrlar ayriligi",
      "emoji": "⚡",
      "alt": [
       "kelishmovchilik"
      ]
     },
     {
      "fr": "le consensus",
      "uz": "umumiy kelishuv",
      "emoji": "🤝",
      "alt": [
       "konsensus"
      ]
     },
     {
      "fr": "l'antithèse",
      "uz": "qarama-qarshi fikr",
      "emoji": "🔀",
      "alt": [
       "antitiza"
      ]
     },
     {
      "fr": "la synthèse",
      "uz": "umumiy yakuniy xulosa",
      "emoji": "📑",
      "alt": [
       "sintez"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Certes, la prospective aide la recherche, mais l'extrapolation excessive nuit parfois.",
      "uz": "Albatta, kelajakni bashorat qilish tadqiqotga yordam beradi, biroq haddan tashqari kengaytma xulosa ba'zan zarar yetkazadi.",
      "uzAlt": [
       "To'g'ri, bashorat tadqiqotga ko'maklashadi, ammo haddan tashqari xulosa chiqarish ziyon keltiradi."
      ]
     },
     {
      "fr": "Force est de constater que le nouveau paradigme change notre vision du monde.",
      "uz": "Yangi ilmiy qarashlar tizimi dunyoqarashimizni o'zgartirganini tan olish kerak.",
      "uzAlt": [
       "Tan olish kerakki, yangi paradigma dunyoqarashimizni o'zgartirmoqda."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que la corrélation entre ces facteurs est évidente.",
      "uz": "Shunga qaramay, ushbu omillar o'rtasidagi o'zaro bog'liqlik yaqqol ko'rinib turibdi.",
      "uzAlt": [
       "Biroq bu omillar orasidagi korrelyatsiya yaqqol namoyon bo'ladi."
      ]
     },
     {
      "fr": "Certes, la divergence existe, mais le consensus reste l'objectif final de l'équipe.",
      "uz": "Albatta, fikrlar ayriligi mavjud, ammo umumiy kelishuv jamoaning yakuniy maqsadi bo'lib qoladi.",
      "uzAlt": [
       "To'g'ri, fikrlar turlicha, lekin konsensus guruhning oxirgi maqsadi hisoblanadi."
      ]
     },
     {
      "fr": "Force est de constater la force persuasive de cette brillante antithèse.",
      "uz": "Bu yorqin qarama-qarshi fikrning ishontirish kuchini tan olmasdan iloji yo'q.",
      "uzAlt": [
       "Tan olish kerakki, bu ajoyib antitizaning ishonchirish kuchi katta."
      ]
     },
     {
      "fr": "Il n'en reste pas moins que la synthèse finale unifie toutes nos idées.",
      "uz": "Shunga qaramay, yakuniy umumiy xulosa barcha g'oyalarimizni birlashtiradi.",
      "uzAlt": [
       "Baribir oxirgi sintez barcha fikrlarimizni jamlaydi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u44",
  "level": "C1",
  "title": "Ilm va fikr",
  "description": "Fan, falsafa, tadqiqot, abstrakt tushunchalar",
  "color": "#FB923C",
  "guide": [
   {
    "title": "Abstrakt otlar",
    "text": "Fransuz tilida C1 darajasida ilmiy va falsafiy matnlarni tushunish uchun murakkab abstrakt otlar juda muhim rol o'ynaydi.",
    "examples": [
     [
      "L'essence de la philosophie réside dans la recherche de la vérité.",
      "Falsafaning mohiyati haqiqatni izlashda yotadi."
     ],
     [
      "Cette théorie manque de rigueur scientifique.",
      "Bu nazariyada ilmiy qat'iylik yetishmaydi."
     ]
    ]
   },
   {
    "title": "Nominal uslub",
    "text": "Ilmiy va akademik matnlarda fe'llar o'rniga otlar va nominal birikmalar ishlatilishi uslubni yanada rasmiy va jiddiy qiladi.",
    "examples": [
     [
      "L'analyse de ce paradigme exige une grande objectivité.",
      "Bu fanni tahlil qilish katta xolislikni talab qiladi."
     ],
     [
      "La divergence des opinions crée une ambiguïté.",
      "Fikrlar xilma-xilligi noaniqlikni keltirib chiqaradi."
     ]
    ]
   },
   {
    "title": "Olmoshlar zanjiri",
    "text": "Murakkab gaplarda fikrni aniq yetkazish uchun olmoshlar zanjiridan foydalanib, takrorlanishning oldi olinadi.",
    "examples": [
     [
      "Celui qui étudie la philosophie comprend mieux le monde.",
      "Falsafani o'rganadigan kishi dunyoni yaxshiroq tushunadi."
     ],
     [
      "Ceux dont nous parlons soutiennent cette thèse.",
      "Biz gaplashayotgan kishilar ushbu tezisni qo'llab-quvvatlaydilar."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u44l1",
    "title": "Fan va Falsafa",
    "words": [
     {
      "fr": "la science",
      "uz": "fan",
      "emoji": "🔬",
      "alt": [
       "ilm"
      ]
     },
     {
      "fr": "la philosophie",
      "uz": "falsafa",
      "emoji": "🧠",
      "alt": [
       "hikmat"
      ]
     },
     {
      "fr": "le chercheur",
      "uz": "tadqiqotchi",
      "emoji": "🔍",
      "alt": [
       "izlanuvchi"
      ]
     },
     {
      "fr": "le concept",
      "uz": "tushuncha",
      "emoji": "💡",
      "alt": [
       "konsepsiya"
      ]
     },
     {
      "fr": "la théorie",
      "uz": "nazariya",
      "emoji": "📜",
      "alt": [
       "ta'limot"
      ]
     },
     {
      "fr": "la méthode",
      "uz": "usul",
      "emoji": "⚙️",
      "alt": [
       "metod"
      ]
     },
     {
      "fr": "démontrer",
      "uz": "isbotlamoq",
      "emoji": "📌",
      "alt": [
       "namoyish etmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le chercheur analyse la nouvelle théorie scientifique avec une grande attention.",
      "uz": "Tadqiqotchi yangi ilmiy nazariyani katta e'tibor bilan tahlil qilmoqda.",
      "uzAlt": [
       "Tadqiqotchi yangi ilmiy nazariyani katta e'tibor bilan tahlil qiladi."
      ]
     },
     {
      "fr": "Cette méthode de philosophie aide à comprendre les concepts abstraits.",
      "uz": "Bu falsafa usuli abstrakt tushunchalarni tushunishga yordam beradi.",
      "uzAlt": [
       "Ushbu falsafiy metod mavhum tushunchalarni anglashga yordam beradi."
      ]
     },
     {
      "fr": "Sophie démontre que la science moderne change notre vision du monde.",
      "uz": "Sofiya zamonaviy fan dunyoqarashimizni o'zgartirayotganini isbotlamoqda.",
      "uzAlt": [
       "Sofiya zamonaviy ilm dunyoqarashimizni o'zgartirishini ko'rsatmoqda."
      ]
     },
     {
      "fr": "Les concepts de la science exigent une méthode rigoureuse.",
      "uz": "Fan tushunchalari qat'iy usulni talab qiladi.",
      "uzAlt": [
       "Ilmiy tushunchalar qat'iy metodikani talab etadi."
      ]
     },
     {
      "fr": "Pierre analyse les faits pour élaborer une nouvelle théorie.",
      "uz": "Pyer yangi nazariya ishlab chiqish uchun faktlarni tahlil qilmoqda.",
      "uzAlt": [
       "Pyer yangi ta'limot yaratish maqsadida dalillarni o'rganmoqda."
      ]
     },
     {
      "fr": "Le grand chercheur démontre la validité de son hypothèse philosophique.",
      "uz": "Buyuk tadqiqotchi o'z falsafiy gipotezasining asosliligini isbotlamoqda.",
      "uzAlt": [
       "Taniqli izlanuvchi o'z falsafiy farazining to'g'riligini ko'rsatib bermoqda."
      ]
     }
    ]
   },
   {
    "id": "u44l2",
    "title": "Tadqiqot va Izlanish",
    "words": [
     {
      "fr": "l'observation",
      "uz": "kuzatish",
      "emoji": "🔭",
      "alt": [
       "nazorat"
      ]
     },
     {
      "fr": "la découverte",
      "uz": "kashfiyot",
      "emoji": "🌟",
      "alt": [
       "topilma"
      ]
     },
     {
      "fr": "l'innovation",
      "uz": "innovatsiya",
      "emoji": "🚀",
      "alt": [
       "yangilik"
      ]
     },
     {
      "fr": "la publication",
      "uz": "nashr",
      "emoji": "📰",
      "alt": [
       "chop etish"
      ]
     },
     {
      "fr": "observer",
      "uz": "kuzatmoq",
      "emoji": "👁️",
      "alt": [
       "qarab turmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le chercheur prépare une expérience importante dans son laboratoire.",
      "uz": "Tadqiqotchi o'z laboratoriyasida muhim tajriba tayyorlamoqda.",
      "uzAlt": [
       "Izlanuvchi o'z laboratoriyasida muhim tajriba hozirlamoqda."
      ]
     },
     {
      "fr": "Cette observation scientifique mène à une grande découverte.",
      "uz": "Bu ilmiy kuzatish buyuk kashfiyotga olib keladi.",
      "uzAlt": [
       "Ushbu ilmiy kuzatuv ulkan kashfiyot sari boshlaydi."
      ]
     },
     {
      "fr": "Malika veut publier les résultats de ses recherches novatrices.",
      "uz": "Malika o'zining innovatsion tadqiqotlari natijalarini chop etishni xohlaydi.",
      "uzAlt": [
       "Malika o'zining yangilikka boy tadqiqot natijalarini e'lon qilmoqchi."
      ]
     },
     {
      "fr": "L'innovation technologique change radicalement notre mode de vie.",
      "uz": "Texnologik innovatsiya turmush tarzimizni tubdan o'zgartiradi.",
      "uzAlt": [
       "Texnologik yangilik hayot tarzimizni keskin o'zgartirmoqda."
      ]
     },
     {
      "fr": "Ali observe attentivement les détails de l'expérience en cours.",
      "uz": "Ali jarayondagi tajribaning tafsilotlarini diqqat bilan kuzatmoqda.",
      "uzAlt": [
       "Ali o'tkazilayotgan tajriba tafsilotlarini diqqat bilan kuzatmoqda."
      ]
     },
     {
      "fr": "La publication de cet article scientifique apporte des résultats inattendus.",
      "uz": "Ushbu ilmiy maqolaning chop etilishi kutilmagan natijalarni olib keladi.",
      "uzAlt": [
       "Mazkur ilmiy nashr kutilmagan natijalarni taqdim etmoqda."
      ]
     }
    ]
   },
   {
    "id": "u44l3",
    "title": "Abstrakt Tushunchalar",
    "words": [
     {
      "fr": "la conscience",
      "uz": "ong",
      "emoji": "🧘",
      "alt": [
       "vijdon"
      ]
     },
     {
      "fr": "la complexité",
      "uz": "murakkablik",
      "emoji": "🧩",
      "alt": [
       "chigallik"
      ]
     },
     {
      "fr": "la perception",
      "uz": "idrok",
      "emoji": "🔮",
      "alt": [
       "sezgi"
      ]
     },
     {
      "fr": "réfléchir",
      "uz": "mulohaza qilmoq",
      "emoji": "🤔",
      "alt": [
       "chuqur o'ylamoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La conscience humaine explore la complexité de l'univers.",
      "uz": "Inson oni koinotning murakkabligini o'rganmoqda.",
      "uzAlt": [
       "Inson vijdoni koinot sirlarini tadqiq qilmoqda."
      ]
     },
     {
      "fr": "Pierre réfléchit profondément sur la sagesse des anciens philosophes.",
      "uz": "Pyer qadimgi faylasuflarning donoligi haqida chuqur mulohaza yuritmoqda.",
      "uzAlt": [
       "Pyer qadimiy mutafakkirlar donoligi ustidan chuqur o'ylamoqda."
      ]
     },
     {
      "fr": "La perception de la réalité dépend de notre raisonnement logique.",
      "uz": "Voqelikni idrok qilish mantiqiy mushohadamizga bog'liq.",
      "uzAlt": [
       "Haqiqatni sezish mantiqiy fikrlashimizga tayanadi."
      ]
     },
     {
      "fr": "Il faut chercher l'essence des choses pour bien comprendre la vie.",
      "uz": "Hayotni yaxshi tushunish uchun narsalarning mohiyatini izlash kerak.",
      "uzAlt": [
       "Turmushni anglash maqsadida buyumlarning asl tub mohiyatini qidirish lozim."
      ]
     },
     {
      "fr": "Sophie pense que la sagesse apporte la paix intérieure à l'esprit.",
      "uz": "Sofiya donolik ongiga ichki xotirjamlik olib keladi deb o'ylaydi.",
      "uzAlt": [
       "Sofiya donishmandlik ruhga ichki tinchlik baxsh etishiga ishonadi."
      ]
     },
     {
      "fr": "Le raisonnement philosophique éclaire la complexité de notre existence.",
      "uz": "Falsafiy mushohada mavjudligimizning murakkabligini yoritadi.",
      "uzAlt": [
       "Falsafiy fikrlash hayotimizdagi chigalliklarga oydinlik kiritadi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u45",
  "level": "C2",
  "title": "Maqollar",
  "description": "Fransuz maqollari va hikmatli so'zlar",
  "color": "#F87171",
  "guide": [
   {
    "title": "Maqollar va ularning ma'nosi",
    "text": "Fransuz tilidagi maqollar xalq donoligini aks ettiradi va ularni o'zbek tilidagi ekvivalentlari orqali tushunish osonroq.",
    "examples": [
     [
      "Petit à petit, l'oiseau fait son nid.",
      "Sabr bilan ko'kka etar, sabrsiz yo'lda qolar."
     ],
     [
      "Il ne faut pas vendre la peau de l'ours avant de l'avoir tué.",
      "Ayiq terisini sotmasdan oldin uni ovla."
     ]
    ]
   },
   {
    "title": "Metaforik ifodalar",
    "text": "Ko'pgina hikmatli so'zlar ko'chma ma'noda ishlatilib, hayotiy haqiqatlarni ochib beradi.",
    "examples": [
     [
      "L'habitude est une seconde nature.",
      "Odat ikkinchi tabiatdir."
     ],
     [
      "Mieux vaut tard que jamais.",
      "Kech bo'lgani yaxshidir, umuman bo'lmagandan."
     ]
    ]
   },
   {
    "title": "Grammatik tuzilish",
    "text": "Maqollarda ko'pincha hozirgi zamon (Présent) va buyruq fe'llari keng qo'llaniladi.",
    "examples": [
     [
      "Rien ne sert de courir, il faut partir à point.",
      "Yoshlikda bergan ko'ngil, qariganda topilar."
     ],
     [
      "Chose promise, chose due.",
      "Vada - vafo."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u45l1",
    "title": "Fransuz maqollari I",
    "words": [
     {
      "fr": "le proverbe",
      "uz": "maqol",
      "emoji": "📜",
      "alt": [
       "hikmat",
       "matal"
      ]
     },
     {
      "fr": "la maxime",
      "uz": "hikmatli so'z",
      "emoji": "💡",
      "alt": [
       "qoida"
      ]
     },
     {
      "fr": "l'adage",
      "uz": "naql",
      "emoji": "🗣️",
      "alt": [
       "hikmat"
      ]
     },
     {
      "fr": "la sentence",
      "uz": "hukm",
      "emoji": "⚖️",
      "alt": [
       "qaror"
      ]
     },
     {
      "fr": "l'apologue",
      "uz": "masal",
      "emoji": "📖",
      "alt": [
       "rivoyat"
      ]
     },
     {
      "fr": "la fable",
      "uz": "hikoya",
      "emoji": "🦊",
      "alt": [
       "ertak"
      ]
     },
     {
      "fr": "l'allégorie",
      "uz": "allegoriya",
      "emoji": "🎭",
      "alt": [
       "timsol"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ce vieux proverbe français enseigne la sagesse aux jeunes générations.",
      "uz": "Bu qadimgi fransuz maqoli yosh avlodga donolikni o'rgatadi.",
      "uzAlt": [
       "Ushbu qadimgi fransuz maqoli yoshlarga donolikdan saboq beradi."
      ]
     },
     {
      "fr": "La maxime de Pierre reflète une vérité universelle et profonde.",
      "uz": "Pierning hikmatli so'zi umuminsoniy va chuqur haqiqatni aks ettiradi.",
      "uzAlt": [
       "Pierre aytgan hikmat umuminsoniy haqiqatni ochib beradi."
      ]
     },
     {
      "fr": "Sophie lit un ancien adage qui parle de la patience humaine.",
      "uz": "Sophie inson sabr-toqatidan so'zlovchi qadimiy naqlni o'qiydi.",
      "uzAlt": [
       "Inson sabri haqidagi qadimgi naqlni Sophie o'qib chiqdi."
      ]
     },
     {
      "fr": "Cette belle sentence philosophique guide notre chemin de vie.",
      "uz": "Bu go'zal falsafiy hukm hayotiy yo'limizni yo'naltiradi.",
      "uzAlt": [
       "Ushbu falsafiy hukm hayot yo'limizni belgilaydi."
      ]
     },
     {
      "fr": "L'apologue de La Fontaine contient toujours une morale instructive.",
      "uz": "La Fontaine masalida doimo o'gitli axloqiy xulosa mavjud.",
      "uzAlt": [
       "La Fontaine masallari har doim ta'limiy ma'noga ega."
      ]
     },
     {
      "fr": "Malika analyse chaque fable pour comprendre son sens caché.",
      "uz": "Malika uning yashirin ma'nosini tushunish uchun har bir hikoyani tahlil qiladi.",
      "uzAlt": [
       "Har bir hikoyaning tub mohiyatini anglash uchun Malika uni tahlil qiladi."
      ]
     }
    ]
   },
   {
    "id": "u45l2",
    "title": "Hikmatli so'zlar II",
    "words": [
     {
      "fr": "la morale",
      "uz": "axloq",
      "emoji": "🧭",
      "alt": [
       "odob"
      ]
     },
     {
      "fr": "l'enseignement",
      "uz": "ta'lim",
      "emoji": "📚",
      "alt": [
       "saboq"
      ]
     },
     {
      "fr": "la valeur",
      "uz": "qadriyat",
      "emoji": "💎",
      "alt": [
       "qiymat"
      ]
     },
     {
      "fr": "le principe",
      "uz": "tamoyil",
      "emoji": "📐",
      "alt": [
       "qoida"
      ]
     },
     {
      "fr": "la loi",
      "uz": "qonun",
      "emoji": "📜",
      "alt": [
       "tuzum"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La morale de cette histoire nous invite à la modestie.",
      "uz": "Bu hikoyaning axloqi bizni kamtarlikka chorlaydi.",
      "uzAlt": [
       "Ushbu qissaning o'giti bizni kamtar bo'lishga undaydi."
      ]
     },
     {
      "fr": "Chaque ancien enseignement populaire a une grande utilité pratique.",
      "uz": "Har bir qadimiy xalq ta'limi katta amaliy ahamiyatga ega.",
      "uzAlt": [
       "Har bir xalq ta'limoti katta amaliy foyda keltiradi."
      ]
     },
     {
      "fr": "Ali apprend une belle leçon de vie grâce aux vieux proverbes.",
      "uz": "Ali eski maqollar yordamida hayotdan go'zal saboq oladi.",
      "uzAlt": [
       "Qadimgi maqollar orqali Ali hayotiy saboq chiqaradi."
      ]
     },
     {
      "fr": "La valeur morale de ces paroles traverse les siècles sans vieillir.",
      "uz": "Bu so'zlarning axloqiy qadri asrlarni qartaymasdan oshib o'tadi.",
      "uzAlt": [
       "Ushbu so'zlarning ma'naviy qiymati asrlar davomida yo'qolmaydi."
      ]
     },
     {
      "fr": "Respecter chaque principe traditionnel est essentiel pour la société.",
      "uz": "Har bir an'anaviy tamoyilni hurmat qilish jamiyat uchun muhimdir.",
      "uzAlt": [
       "Jamiyat uchun har bir an'anaviy qoidaga amal qilish zarur."
      ]
     },
     {
      "fr": "La coutume locale interdit de mentir aux invités.",
      "uz": "Mahalliy urf-odat mehmonlarga yolg'on gapirishni taqiqlaydi.",
      "uzAlt": [
       "Mahalliy an'analarga ko'ra mehmonlarga yolg'on so'zlab bo'lmaydi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u46",
  "level": "C2",
  "title": "Huquq va iqtisod",
  "description": "Huquq, shartnoma, moliya, iqtisodiyot atamalari",
  "color": "#EF4444",
  "guide": [
   {
    "title": "Rasmiy-huquqiy uslub",
    "text": "Fransuz tilida rasmiy-huquqiy uslub aniqlik, qat'iylik va maxsus terminologiyadan foydalanishni talab qiladi. Bunda otlar ko'pincha murakkab nominal birikmalar orqali kengaytiriladi.",
    "examples": [
     [
      "La législation française exige le respect strict du code civil.",
      "Fransiya qonunchiligi Fuqarolik kodeksiga qat'iy rioya etilishini talab qiladi."
     ],
     [
      "Le tribunal a prononcé le jugement selon les articles en vigueur.",
      "Sud amaldagi moddalarga muvofiq hukm chiqardi."
     ]
    ]
   },
   {
    "title": "Murakkab nominal birikmalar",
    "text": "Huquq va iqtisodiyot sohasida ma'lumotni aniq yetkazish uchun ot va unga ergashuvchi sifat yoki tobe so'z birikmalaridan iborat tuzilmalar ishlatiladi.",
    "examples": [
     [
      "L'avocat a analysé la clause résolutoire du contrat commercial.",
      "Advokat tijorat shartnomasidagi bekor qilish bandini tahlil qildi."
     ],
     [
      "La société anonyme doit publier son bilan financier annuel.",
      "Aksiyadorlik jamiyati o'zining yillik moliyaviy balansini e'lon qilishi kerak."
     ]
    ]
   },
   {
    "title": "Moliya va iqtisod atamalari",
    "text": "Iqtisodiy munosabatlarni ifodalashda maxsus fe'llar va ularga mos keluvchi yuridik tushunchalar qo'shilib keladi.",
    "examples": [
     [
      "L'investisseur a signé l'accord de partenariat commercial.",
      "Investor tijorat sheriklik shartnomasini imzoladi."
     ],
     [
      "La banque centrale a augmenté le taux d'intérêt directeur.",
      "Markaziy bank asosiy foiz stavkasini oshirdi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u46l1",
    "title": "Huquq va qonunlar",
    "words": [
     {
      "fr": "la loi constitutionnelle",
      "uz": "konstitutsiyaviy qonun",
      "emoji": "📜",
      "alt": [
       "asosiy qonun"
      ]
     },
     {
      "fr": "le code pénal",
      "uz": "jinoyat kodeksi",
      "emoji": "⚖️",
      "alt": [
       "jinoiy kodeks"
      ]
     },
     {
      "fr": "le décret présidentiel",
      "uz": "prezident farmoni",
      "emoji": "✍️",
      "alt": [
       "davlat rahbari qarori"
      ]
     },
     {
      "fr": "l'article juridique",
      "uz": "huquqiy modda",
      "emoji": "📌",
      "alt": [
       "qonun moddasi"
      ]
     },
     {
      "fr": "le tribunal suprême",
      "uz": "oliy sud",
      "emoji": "🏛️",
      "alt": [
       "bosh sud"
      ]
     },
     {
      "fr": "la juridiction civile",
      "uz": "fuqarolik yurisdiksiyasi",
      "emoji": "📋",
      "alt": [
       "fuqarolik sudi vakolati"
      ]
     },
     {
      "fr": "le contentieux administratif",
      "uz": "ma'muriy nizo",
      "emoji": "📁",
      "alt": [
       "ma'muriy mojaro"
      ]
     },
     {
      "fr": "l'infraction pénale",
      "uz": "jinoiy huquqbuzarlik",
      "emoji": "🚨",
      "alt": [
       "jinoyat alomati"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La loi constitutionnelle garantit les droits fondamentaux de chaque citoyen.",
      "uz": "Konstitutsiyaviy qonun har bir fuqaroning asosiy huquqlarini kafolatlaydi.",
      "uzAlt": [
       "Asosiy qonun har bir fuqaroning asosiy huquqlarini ta'minlaydi."
      ]
     },
     {
      "fr": "Le tribunal suprême a examiné le contentieux administratif avec beaucoup d'attention.",
      "uz": "Oliy sud ma'muriy nizoni katta e'tibor bilan ko'rib chiqdi.",
      "uzAlt": [
       "Oliy sud ma'muriy mojaroni diqqat bilan o'rganib chiqdi."
      ]
     },
     {
      "fr": "Le code pénal définit clairement chaque infraction pénale et sa sanction.",
      "uz": "Jinoyat kodeksi har bir jinoiy huquqbuzarlikni va uning jazosini aniq belgilaydi.",
      "uzAlt": [
       "Jinoyat kodeksida har bir jinoyat va uning jazosi aniq ko'rsatilgan."
      ]
     },
     {
      "fr": "Le décret présidentiel modifie profondément la juridiction civile actuelle.",
      "uz": "Prezident farmoni amaldagi fuqarolik yurisdiksiyasini tubdan o'zgartiradi.",
      "uzAlt": [
       "Prezident qarori hozirgi fuqarolik sudi vakolatlarini o'zgartiradi."
      ]
     },
     {
      "fr": "L'avocat a cité un article juridique important pendant le procès.",
      "uz": "Advokat sud jarayonida muhim huquqiy moddani keltirib o'tdi.",
      "uzAlt": [
       "Himoyachi sud davomida muhim qonun moddasiga asoslandi."
      ]
     },
     {
      "fr": "Cette infraction pénale sera jugée par le tribunal suprême de la république.",
      "uz": "Bu jinoiy huquqbuzarlik respublika oliy sudi tomonidan ko'rib chiqiladi.",
      "uzAlt": [
       "Mazkur jinoyat respublika oliy sudi tomonidan sud qilinadi."
      ]
     }
    ]
   },
   {
    "id": "u46l2",
    "title": "Shartnomalar va bitimlar",
    "words": [
     {
      "fr": "le contrat commercial",
      "uz": "tijorat shartnomasi",
      "emoji": "🤝",
      "alt": [
       "biznes bitimi"
      ]
     },
     {
      "fr": "la clause résolutoire",
      "uz": "bekor qilish bandi",
      "emoji": "❌",
      "alt": [
       "shartni bekor qilish sharti"
      ]
     },
     {
      "fr": "l'obligation contractuelle",
      "uz": "shartnomaviy majburiyat",
      "emoji": "📝",
      "alt": [
       "bitim majburiyati"
      ]
     },
     {
      "fr": "la signature électronique",
      "uz": "elektron imzo",
      "emoji": "💻",
      "alt": [
       "raqamli imzo"
      ]
     },
     {
      "fr": "le protocole d'accord",
      "uz": "kelishuv bayonnomasi",
      "emoji": "📊",
      "alt": [
       "o'zaro anglashuv bayonnomasi"
      ]
     },
     {
      "fr": "la validité juridique",
      "uz": "huquqiy kuch",
      "emoji": "✅",
      "alt": [
       "qonuniy amal qilish muddati"
      ]
     },
     {
      "fr": "l'avenant au contrat",
      "uz": "shartnomaga qo'shimcha",
      "emoji": "📎",
      "alt": [
       "bitimga o'zgartish kiritish ilovasi"
      ]
     },
     {
      "fr": "la rupture conventionnelle",
      "uz": "o'zaro kelishuvga ko'ra bekor qilish",
      "emoji": "🤝",
      "alt": [
       "tomonlar roziligi bilan to'xtatish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le contrat commercial contient une clause résolutoire très stricte.",
      "uz": "Tijorat shartnomasida juda qat'iy bekor qilish bandi mavjud.",
      "uzAlt": [
       "Biznes bitimida o'ta qat'iy bekor qilish sharti bor."
      ]
     },
     {
      "fr": "Chaque obligation contractuelle doit être respectée par les deux parties.",
      "uz": "Har bir shartnomaviy majburiyat ikki tomon tomonidan bajarilishi shart.",
      "uzAlt": [
       "Har bir bitim majburiyatiga har ikki tomon rioya qilishi lozim."
      ]
     },
     {
      "fr": "La signature électronique possède la même validité juridique qu'une signature manuscrite.",
      "uz": "Elektron imzo qo'lyozma imzo bilan bir xil huquqiy kuchga ega.",
      "uzAlt": [
       "Raqamli imzo oddiy imzo kabi qonuniy kuchga ega."
      ]
     },
     {
      "fr": "Pierre a signé l'avenant au contrat avant la date limite.",
      "uz": "Pyer belgilangan muddatdan oldin shartnomaga qo'shimchani imzoladi.",
      "uzAlt": [
       "Pyer oxirgi muddatgacha shartnomaga o'zgartish kiritish ilovasiga imzo qo'ydi."
      ]
     },
     {
      "fr": "Les directeurs ont rédigé un protocole d'accord pour leur futur projet.",
      "uz": "Direktorlar o'zlarining kelgusi loyihasi uchun kelishuv bayonnomasini tuzdilar.",
      "uzAlt": [
       "Rahbarlar kelgusi loyiha yuzasidan o'zaro anglashuv bayonnomasini yozishdi."
      ]
     },
     {
      "fr": "La rupture conventionnelle permet de terminer la collaboration pacifiquement.",
      "uz": "O'zaro kelishuvga ko'ra bekor qilish hamkorlikni tinch yo'l bilan tugatish imkonini beradi.",
      "uzAlt": [
       "Tomonlar roziligi bilan to'xtatish sheriklikni tinchlik bilan yakunlaydi."
      ]
     }
    ]
   },
   {
    "id": "u46l3",
    "title": "Moliya va soliqlar",
    "words": [
     {
      "fr": "le bilan financier",
      "uz": "moliyaviy balans",
      "emoji": "📈",
      "alt": [
       "moliya hisoboti"
      ]
     },
     {
      "fr": "l'impôt sur le revenu",
      "uz": "daromad solig'i",
      "emoji": "💰",
      "alt": [
       "foyda solig'i"
      ]
     },
     {
      "fr": "le taux d'intérêt",
      "uz": "foiz stavkasi",
      "emoji": "📊",
      "alt": [
       "kredit foizi"
      ]
     },
     {
      "fr": "la taxe sur la valeur ajoutée",
      "uz": "qo'shilgan qiymat solig'i",
      "emoji": "🏷️",
      "alt": [
       "qqq"
      ]
     },
     {
      "fr": "le capital social",
      "uz": "ustav kapitali",
      "emoji": "💼",
      "alt": [
       "asosiy kapital"
      ]
     },
     {
      "fr": "l'exercice comptable",
      "uz": "hisobot yili",
      "emoji": "📅",
      "alt": [
       "buxgalteriya davri"
      ]
     },
     {
      "fr": "le compte bancaire",
      "uz": "bank hisobraqami",
      "emoji": "💳",
      "alt": [
       "hisob raqam"
      ]
     },
     {
      "fr": "l'investissement direct",
      "uz": "to'g'ridan-to'g'ri investitsiya",
      "emoji": "🌐",
      "alt": [
       "bevosita sarmoya"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "L'entreprise doit présenter son bilan financier avant la fin de l'exercice comptable.",
      "uz": "Kompaniya hisobot yili tugagunga qadar o'zining moliyaviy balansini taqdim etishi kerak.",
      "uzAlt": [
       "Korxona buxgalteriya davri tugashidan oldin moliya hisobotini ko'rsatishi shart."
      ]
     },
     {
      "fr": "Sophie paye chaque année son impôt sur le revenu dans les délais.",
      "uz": "Sofi har yili daromad solig'ini o'z vaqtida to'laydi.",
      "uzAlt": [
       "Sofi har yili foyda solig'ini muddatida to'lab boradi."
      ]
     },
     {
      "fr": "La banque centrale a réduit le taux d'intérêt pour stimuler l'économie.",
      "uz": "Markaziy bank iqtisodiyotni rag'batlantirish uchun foiz stavkasini pasaytirdi.",
      "uzAlt": [
       "Markaziy bank iqtisodiy o'sishni qo'llab-quvvatlash maqsadida kredit foizini kamaytirdi."
      ]
     },
     {
      "fr": "La taxe sur la valeur ajoutée s'applique à la plupart des produits vendus.",
      "uz": "Qo'shilgan qiymat solig'i sotiladigan ko'pchilik mahsulotlarga nisbatan qo'llaniladi.",
      "uzAlt": [
       "QQQ sotuvdagi aksariyat tovarlarga nisbatan hisoblanadi."
      ]
     },
     {
      "fr": "Les fondateurs ont augmenté le capital social de leur société anonyme.",
      "uz": "Muassislar o'z aksiyadorlik jamiyatining ustav kapitalini oshirdilar.",
      "uzAlt": [
       "Ta'sischilar kompaniyaning asosiy kapitalini ko'paytirdilar."
      ]
     },
     {
      "fr": "Cet investissement direct a amélioré le solde du compte bancaire principal.",
      "uz": "Bu to'g'ridan-to'g'ri investitsiya asosiy bank hisobraqamidagi qoldiqni yaxshiladi.",
      "uzAlt": [
       "Mazkur bevosita sarmoya asosiy hisob raqam holatini yaxshiladi."
      ]
     }
    ]
   },
   {
    "id": "u46l4",
    "title": "Iqtisodiy tahlil va bozor",
    "words": [
     {
      "fr": "la croissance économique",
      "uz": "iqtisodiy o'sish",
      "emoji": "🚀",
      "alt": [
       "iqtisodiyotning yuksalishi"
      ]
     },
     {
      "fr": "l'inflation monétaire",
      "uz": "pul inflyatsiyasi",
      "emoji": "💸",
      "alt": [
       "valyuta qadrsizlanishi"
      ]
     },
     {
      "fr": "le marché boursier",
      "uz": "fond bozori",
      "emoji": "📈",
      "alt": [
       "birja bozori"
      ]
     },
     {
      "fr": "l'analyse concurrentielle",
      "uz": "raqobat tahlili",
      "emoji": "🔍",
      "alt": [
       "raqobatbardoshlikni o'rganish"
      ]
     },
     {
      "fr": "la politique monétaire",
      "uz": "pul-kredit siyosati",
      "emoji": "🏦",
      "alt": [
       "monetar siyosat"
      ]
     },
     {
      "fr": "le pouvoir d'achat",
      "uz": "xarid qobiliyati",
      "emoji": "🛒",
      "alt": [
       "iste'mol imkoniyati"
      ]
     },
     {
      "fr": "la part de marché",
      "uz": "bozor ulushi",
      "emoji": "🥧",
      "alt": [
       "bozordagi mavqei"
      ]
     },
     {
      "fr": "la crise financière",
      "uz": "moliyaviy inqiroz",
      "emoji": "⚠️",
      "alt": [
       "iqtisodiy tanglik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La croissance économique dépend fortement de la stabilité politique du pays.",
      "uz": "Iqtisodiy o'sish mamlakatdagi siyosiy barqarorlikka jiddiy bog'liq.",
      "uzAlt": [
       "Iqtisodiyotning yuksalishi davlatdagi barqarorlikka tayanadi."
      ]
     },
     {
      "fr": "L'inflation monétaire réduit progressivement le pouvoir d'achat des ménages.",
      "uz": "Pul inflyatsiyasi oilalarning xarid qobiliyatini bosqichma-bosqich pasaytiradi.",
      "uzAlt": [
       "Valyuta qadrsizlanishi aholining iste'mol imkoniyatini kamaytiradi."
      ]
     },
     {
      "fr": "Le marché boursier réagit rapidement à chaque nouvelle crise financière.",
      "uz": "Fond bozori har bir yangi moliyaviy inqirozga tezda munosabat bildiradi.",
      "uzAlt": [
       "Birja bozori har qanday iqtisodiy tanglikka darhol reaksiya qiladi."
      ]
     },
     {
      "fr": "Malika a préparé une analyse concurrentielle pour le nouveau produit.",
      "uz": "Malika yangi mahsulot uchun raqobat tahlilini tayyorladi.",
      "uzAlt": [
       "Malika yangi tovar bo'yicha raqobatbardoshlikni o'rganish ishini bajardi."
      ]
     },
     {
      "fr": "La politique monétaire actuelle vise à stabiliser la monnaie nationale.",
      "uz": "Amaldagi pul-kredit siyosati milliy valyutani barqarorlashtirishga qaratilgan.",
      "uzAlt": [
       "Hozirgi monetar siyosat milliy pul birligining barqarorligini ta'minlaydi."
      ]
     },
     {
      "fr": "Notre entreprise a réussi à augmenter sa part de marché cette année.",
      "uz": "Kompaniyamiz joriy yilda o'z bozor ulushini oshirishga muvaffaq bo'ldi.",
      "uzAlt": [
       "Korxonamiz bu yil bozordagi mavqeini mustahkamlashga erishdi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u47",
  "level": "C2",
  "title": "Tibbiyot va fan",
  "description": "Tibbiyot, biologiya, texnika atamalari",
  "color": "#F97316",
  "guide": [
   {
    "title": "Ilmiy uslub",
    "text": "Fransuz tilida ilmiy uslub o'zining aniqligi, betarafligi va murakkab sintaksisi bilan ajralib turadi. Bu usulda shaxssiz fe'llar va atamalar ko'p qo'llaniladi.",
    "examples": [
     [
      "Il est démontré que la cellule se divise rapidement.",
      "Hujayra tez bo'linishi isbotlangan."
     ],
     [
      "On observe une réaction chimique complexe.",
      "Murakkab kimyoviy reaksiya kuzatilmoqda."
     ]
    ]
   },
   {
    "title": "Passiv konstruksiyalar",
    "text": "Ilmiy matnlarda harakatni bajargan shaxs emas, balki uning natijasi muhim bo'lgani uchun passiv nisbat keng qo'llaniladi.",
    "examples": [
     [
      "Le vaccin a été développé par le laboratoire.",
      "Vaktsina laboratoriya tomonidan ishlab chiqildi."
     ],
     [
      "Les échantillons seront analysés demain.",
      "Namunalar ertaga tahlil qilinadi."
     ]
    ]
   },
   {
    "title": "Shaxssiz shakllar",
    "text": "Il est + sifat yoki on olmoshi yordamida har qanday subyektdan holi bo'lgan umumiy ilmiy haqiqatlar ifodalanadi.",
    "examples": [
     [
      "Il est indispensable de comprendre ce phénomène.",
      "Bu hodisani tushunish zarur."
     ],
     [
      "On constate une augmentation de la température.",
      "Haroratning ko'tarilishi kuzatilmoqda."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u47l1",
    "title": "Tibbiyot asoslari",
    "words": [
     {
      "fr": "la biologie",
      "uz": "biologiya",
      "emoji": "🧬",
      "alt": [
       "biologiya fani"
      ]
     },
     {
      "fr": "le diagnostic",
      "uz": "tashxis",
      "emoji": "🩺",
      "alt": [
       "kasallik tashxisi"
      ]
     },
     {
      "fr": "le traitement",
      "uz": "davolash",
      "emoji": "💊",
      "alt": [
       "muolaja"
      ]
     },
     {
      "fr": "le symptôme",
      "uz": "alomat",
      "emoji": "🤒",
      "alt": [
       "belgi"
      ]
     },
     {
      "fr": "la chirurgie",
      "uz": "jarrohlik",
      "emoji": "🏥",
      "alt": [
       "operatsiya"
      ]
     },
     {
      "fr": "le patient",
      "uz": "bemor",
      "emoji": "🧑‍⚕",
      "alt": [
       "xasta"
      ]
     },
     {
      "fr": "la pharmacologie",
      "uz": "farmakologiya",
      "emoji": "🧪",
      "alt": [
       "dorishunoslik"
      ]
     },
     {
      "fr": "le vaccin",
      "uz": "emlash",
      "emoji": "💉",
      "alt": [
       "vaksina"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le diagnostic précis a été établi par le médecin.",
      "uz": "Aniq tashxis shifokor tomonidan qo'yildi.",
      "uzAlt": [
       "Aniq tashxisni shifokor qo'ydi."
      ]
     },
     {
      "fr": "Il est constaté que le patient réagit bien au traitement.",
      "uz": "Bemor davolashga yaxshi javob berayotgani aniqlandi.",
      "uzAlt": [
       "Bemorning muolajaga yaxshi ta'sir qilishi kuzatilmoqda."
      ]
     },
     {
      "fr": "La chirurgie moderne exige des équipements de pointe.",
      "uz": "Zamonaviy jarrohlik ilg'or jihozlarni talab qiladi.",
      "uzAlt": [
       "Hozirgi zamon jarrohligi yuqori texnologiyali uskunalarni talab etadi."
      ]
     },
     {
      "fr": "Chaque symptôme doit être analysé minutieusement.",
      "uz": "Har bir alomat sinchkovlik bilan tahlil qilinishi kerak.",
      "uzAlt": [
       "Har bir belgi diqqat bilan o'rganilishi lozim."
      ]
     },
     {
      "fr": "La biologie moléculaire étudie les structures cellulaires.",
      "uz": "Molekulyar biologiya hujayra tuzilmalarini o'rganadi.",
      "uzAlt": [
       "Hujayra tuzilishi molekulyar biologiya tomonidan o'rganiladi."
      ]
     },
     {
      "fr": "Un nouveau vaccin est développé dans ce laboratoire.",
      "uz": "Bu laboratoriyada yangi vaksina ishlab chiqilmoqda.",
      "uzAlt": [
       "Yangi emlash vositasi mazkur laboratoriyada yaratilmoqda."
      ]
     }
    ]
   },
   {
    "id": "u47l2",
    "title": "Biologik tadqiqot",
    "words": [
     {
      "fr": "la cellule",
      "uz": "hujayra",
      "emoji": "🧫",
      "alt": [
       "tirik hujayra"
      ]
     },
     {
      "fr": "la génétique",
      "uz": "genetika",
      "emoji": "🧬",
      "alt": [
       "irsiyat fani"
      ]
     },
     {
      "fr": "l'ADN",
      "uz": "dnk",
      "emoji": "🔗",
      "alt": [
       "deoksiribonuklein kislota"
      ]
     },
     {
      "fr": "la mutation",
      "uz": "mutatsiya",
      "emoji": "🦠",
      "alt": [
       "o'zgarish"
      ]
     },
     {
      "fr": "l'organisme",
      "uz": "organizmlar",
      "emoji": "🦠",
      "alt": [
       "tirik organizm"
      ]
     },
     {
      "fr": "la bactérie",
      "uz": "bakteriya",
      "emoji": "🧫",
      "alt": [
       "mikrob"
      ]
     },
     {
      "fr": "le virus",
      "uz": "virus",
      "emoji": "🦠",
      "alt": [
       "infeksiya"
      ]
     },
     {
      "fr": "l'immunité",
      "uz": "immunitet",
      "emoji": "🛡️",
      "alt": [
       "himoya qobiliyati"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "L'ADN contient toutes les informations génétiques.",
      "uz": "DNK barcha irsiy ma'lumotlarni o'z ichiga oladi.",
      "uzAlt": [
       "Barcha genetik axborot DNKda saqlanadi."
      ]
     },
     {
      "fr": "Il est prouvé que la mutation modifie les organismes.",
      "uz": "Mutatsiya organizmlarni o'zgartirishi isbotlangan.",
      "uzAlt": [
       "Mutatsiyaning organizmlarni o'zgartirishi isbotlandi."
      ]
     },
     {
      "fr": "La bactérie résistante a été détruite par l'immunité.",
      "uz": "Chidamli bakteriya immunitet tomonidan yo'q qilindi.",
      "uzAlt": [
       "Immunitet chidamli bakteriyani yo'q qildi."
      ]
     },
     {
      "fr": "Chaque cellule vivante possède une structure complexe.",
      "uz": "Har bir tirik hujayra murakkab tuzilishga ega.",
      "uzAlt": [
       "Murakkab tuzilishga har bir tirik hujayra ega."
      ]
     },
     {
      "fr": "Le virus se propage rapidement dans l'organisme.",
      "uz": "Virus organizmda tez tarqaladi.",
      "uzAlt": [
       "Organizm ichida virus tezlik bilan ko'payadi."
      ]
     },
     {
      "fr": "La génétique moderne ouvre de nouvelles perspectives.",
      "uz": "Zamonaviy genetika yangi istiqbollarni ochmoqda.",
      "uzAlt": [
       "Yangi ufqlarni zamonaviy genetika ochib bermoqda."
      ]
     }
    ]
   },
   {
    "id": "u47l3",
    "title": "Texnik atamalar",
    "words": [
     {
      "fr": "l'algorithme",
      "uz": "algoritm",
      "emoji": "💻",
      "alt": [
       "hisoblash tartibi"
      ]
     },
     {
      "fr": "la nanotechnologie",
      "uz": "nanotexnologiya",
      "emoji": "🔬",
      "alt": [
       "nano fan"
      ]
     },
     {
      "fr": "l'intelligence",
      "uz": "idrok",
      "emoji": "🤖",
      "alt": [
       "ong"
      ]
     },
     {
      "fr": "le robot",
      "uz": "robot",
      "emoji": "🦾",
      "alt": [
       "avtomat qurilma"
      ]
     },
     {
      "fr": "le capteur",
      "uz": "datchik",
      "emoji": "📡",
      "alt": [
       "sensor"
      ]
     },
     {
      "fr": "le système",
      "uz": "tizim",
      "emoji": "⚙️",
      "alt": [
       "sistema"
      ]
     },
     {
      "fr": "la cybernétique",
      "uz": "kibernetika",
      "emoji": "🌐",
      "alt": [
       "boshqaruv fani"
      ]
     },
     {
      "fr": "le circuit",
      "uz": "kontakt",
      "emoji": "⚡",
      "alt": [
       "elektr zanjiri"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "L'algorithme complexe est exécuté par le système.",
      "uz": "Murakkab algoritm tizim tomonidan bajariladi.",
      "uzAlt": [
       "Tizim murakkab algoritmni bajaradi."
      ]
     },
     {
      "fr": "La nanotechnologie transforme les sciences physiques.",
      "uz": "Nanotexnologiya fizika fanlarini o'zgartirmoqda.",
      "uzAlt": [
       "Fizika fanlari nanotexnologiya yordamida o'zgarmoqda."
      ]
     },
     {
      "fr": "Le capteur mesure la température avec précision.",
      "uz": "Datchik haroratni aniqlik bilan o'lchaydi.",
      "uzAlt": [
       "Harorat datchik yordamida aniq o'lchanadi."
      ]
     },
     {
      "fr": "Il est prévu de construire un robot autonome.",
      "uz": "Avtonom robot qurish rejalashtirilmoqda.",
      "uzAlt": [
       "Mustaqil harakatlanuvchi robot yaratish rejada bor."
      ]
     },
     {
      "fr": "Le circuit électrique doit être vérifié soigneusement.",
      "uz": "Elektr zanjiri sinchkovlik bilan tekshirilishi shart.",
      "uzAlt": [
       "Elektr kontaktini diqqat bilan tekshirish lozim."
      ]
     },
     {
      "fr": "L'intelligence artificielle analyse de grandes données.",
      "uz": "Sun'iy intellekt katta hajmdagi ma'lumotlarni tahlil qiladi.",
      "uzAlt": [
       "Katta ma'lumotlar sun'iy idrok tomonidan tahlil etiladi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u48",
  "level": "C2",
  "title": "Sinonimlar nozikligi",
  "description": "Ma'nodosh so'zlarning nozik farqlari",
  "color": "#F87171",
  "guide": [
   {
    "title": "Regarder va voir",
    "text": "Regarder ma'noli biror narsaga diqqat bilan tikilishni anglatsa, voir shunchaki ko'rish qobiliyatini ishga solishni bildiradi.",
    "examples": [
     [
      "Pierre aime regarder le coucher du soleil.",
      "Piter quyosh botishini tomosha qilishni yaxshi ko'radi."
     ],
     [
      "Sophie peut voir les montagnes depuis sa fenêtre.",
      "Sofi o'z derazasidan tog'larni ko'ra oladi."
     ]
    ]
   },
   {
    "title": "Savoir va connaître",
    "text": "Savoir ma'lumot yoki ko'nikmani bilishga nisbatan ishlatiladi, connaître esa shaxs, joy yoki narsa bilan tanish bo'lishni anglatadi.",
    "examples": [
     [
      "Malika sait parler quatre langues étrangères.",
      "Malika to'rtta chet tilida gaplasha oladi."
     ],
     [
      "Ali connaît très bien cette ancienne ville historique.",
      "Ali bu qadimiy tarixiy shaharni juda yaxshi biladi."
     ]
    ]
   },
   {
    "title": "Nozik farqlar",
    "text": "Contempler so'zi oddiy qarashdan ko'ra chuqur hayrat va tafakkur bilan kuzatishni ifodalaydi.",
    "examples": [
     [
      "Le vieux sage aime contempler la beauté du ciel étoilé.",
      "Qari dono yulduzli osmon go'zalligidan hayrat bilan zavqlanishni yaxshi ko'radi."
     ],
     [
      "Il faut observer attentivement chaque détail avant de juger.",
      "Hukm chiqarishdan oldin har bir tafsilotni diqqat bilan kuzatish kerak."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u48l1",
    "title": "Ko'rish va qarash",
    "words": [
     {
      "fr": "regarder",
      "uz": "tikilmoq",
      "emoji": "👀",
      "alt": [
       "tomosha qilmoq",
       "qaramoq"
      ]
     },
     {
      "fr": "voir",
      "uz": "ko'rmoq",
      "emoji": "👁️",
      "alt": [
       "sezmoq"
      ]
     },
     {
      "fr": "contempler",
      "uz": "zavqlanmoq",
      "emoji": "🌄",
      "alt": [
       "maftun bo'lib qaramoq"
      ]
     },
     {
      "fr": "apercevoir",
      "uz": "ilg'amoq",
      "emoji": "🔭",
      "alt": [
       "payqamoq",
       "ko'zga tashlanmoq"
      ]
     },
     {
      "fr": "examiner",
      "uz": "tekshirmoq",
      "emoji": "📋",
      "alt": [
       "ko'zdan kechirmoq"
      ]
     },
     {
      "fr": "remarquer",
      "uz": "payqamoq",
      "emoji": "💡",
      "alt": [
       "e'tibor bermoq"
      ]
     },
     {
      "fr": "distinguer",
      "uz": "farqlamoq",
      "emoji": "⚖️",
      "alt": [
       "ajratib olmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pierre aime regarder les étoiles brillantes pendant les nuits d'été.",
      "uz": "Piter yozgi kechalari yaltiroq yulduzlarni tomosha qilishni yaxshi ko'radi.",
      "uzAlt": [
       "Piter yozgi kechalari porloq yulduzlarga tikilishni yaxshi ko'radi."
      ]
     },
     {
      "fr": "Sophie peut voir un magnifique oiseau rare sur la branche.",
      "uz": "Sofi shoxda ajoyib nodir qushni ko'ra oladi.",
      "uzAlt": [
       "Sofi shoxda go'zal noyob qushni ko'rmoqda."
      ]
     },
     {
      "fr": "Le peintre aime contempler longuement son nouveau tableau abstrait.",
      "uz": "Rassom o'zining yangi mavhum suratini uzoq vaqt zavqlanib tomosha qilishni yoqtiradi.",
      "uzAlt": [
       "Rassom o'zining yangi mavhum kartinasiga uzoq tikilib hayratlanadi."
      ]
     },
     {
      "fr": "Malika a réussi à apercevoir le chat caché derrière les grands buissons.",
      "uz": "Malika baland butalar ortiga yashiringan mushukni ilg'ashga muvaffaq bo'ldi.",
      "uzAlt": [
       "Malika katta butalar ortidagi mushukni payqay oldi."
      ]
     },
     {
      "fr": "Les scientifiques continuent d'observer attentivement le comportement des animaux sauvages.",
      "uz": "Olimlar yovvoyi hayvonlarning xatti-harakatlarini diqqat bilan kuzatishda davom etmoqdalar.",
      "uzAlt": [
       "Tadqiqotchilar yovvoyi hayvonlar xulq-atvorini diqqat bilan kuzatib boryaptilar."
      ]
     },
     {
      "fr": "Ali doit examiner tous les documents importants avant de signer le contrat.",
      "uz": "Ali shartnomani imzolashdan oldin barcha muhim hujjatlarni tekshirib chiqishi kerak.",
      "uzAlt": [
       "Ali shartnoma imzolashdan avval barcha muhim qog'ozlarni ko'zdan kechirishi lozim."
      ]
     }
    ]
   },
   {
    "id": "u48l2",
    "title": "Bilish sirlari",
    "words": [
     {
      "fr": "savoir",
      "uz": "bilmoq",
      "emoji": "🧠",
      "alt": [
       "xabardor bo'lmoq"
      ]
     },
     {
      "fr": "connaître",
      "uz": "tanimoq",
      "emoji": "🤝",
      "alt": [
       "tanish bo'lmoq"
      ]
     },
     {
      "fr": "ignorer",
      "uz": "bilmaslik",
      "emoji": "🙈",
      "alt": [
       "e'tiborsiz qoldirmoq",
       "behabar bo'lmoq"
      ]
     },
     {
      "fr": "maîtriser",
      "uz": "o'zlashtirmoq",
      "emoji": "🎓",
      "alt": [
       "mukammal bilmoq"
      ]
     },
     {
      "fr": "assimiler",
      "uz": "singdirmoq",
      "emoji": "🌱",
      "alt": [
       "o'zlashtirib olmoq"
      ]
     },
     {
      "fr": "déchiffrer",
      "uz": "shifrdan yechmoq",
      "emoji": "🔐",
      "alt": [
       "tagiga yetmoq"
      ]
     },
     {
      "fr": "identifier",
      "uz": "aniqlamoq",
      "emoji": "🏷️",
      "alt": [
       "tanishni bilmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Sophie sait parler couramment trois langues européennes différentes.",
      "uz": "Sofi uch xil Yevropa tilida bemalol gaplasha oladi.",
      "uzAlt": [
       "Sofi uchta turli Yevropa tilida erkin gaplashishni biladi."
      ]
     },
     {
      "fr": "Pierre connaît très bien la culture historique de la belle France.",
      "uz": "Piter go'zal Fransiyaning tarixiy madaniyatini juda yaxshi taniydi.",
      "uzAlt": [
       "Piter go'zal Fransiyaning tarixiy madaniyatidan yaxshi xabardor."
      ]
     },
     {
      "fr": "Il ne faut jamais ignorer les conseils donnés par les sages vieillards.",
      "uz": "Donofikr keksalar tomonidan berilgan maslahatlarni hech qachon e'tiborsiz qoldirmaslik kerak.",
      "uzAlt": [
       "Keksa donolarning o'gitlariga befarq qaramaslik lozim."
      ]
     },
     {
      "fr": "Malika peut facilement comprendre la logique complexe de cet exercice difficile.",
      "uz": "Malika bu qiyin mashqning murakkab mantiqini osonlikcha tushuna oladi.",
      "uzAlt": [
       "Malika ushbu mushkul topshiriqning murakkab mantiqini oson anglaydi."
      ]
     },
     {
      "fr": "Ali veut maîtriser parfaitement toutes les règles grammaticales françaises avancées.",
      "uz": "Ali barcha ilg'or fransuzcha grammatik qoidalarni mukammal o'zlashtirmoqchi.",
      "uzAlt": [
       "Ali fransuz tilining barcha murakkab grammatik qoidalarini puxta egallashni istaydi."
      ]
     },
     {
      "fr": "Les étudiants doivent assimiler rapidement de nouvelles notions scientifiques complexes.",
      "uz": "Talabalar yangi murakkab ilmiy tushunchalarni tezda o'zlashtirib olishlari kerak.",
      "uzAlt": [
       "O'quvchilar yangi ilmiy tushunchalarni tezda ongiga singdirib olishlari lozim."
      ]
     }
    ]
   },
   {
    "id": "u48l3",
    "title": "Aytish va gapirish",
    "words": [
     {
      "fr": "dire",
      "uz": "demoq",
      "emoji": "💬",
      "alt": [
       "aytmoq"
      ]
     },
     {
      "fr": "parler",
      "uz": "gapirmoq",
      "emoji": "🗣️",
      "alt": [
       "so'zlamoq"
      ]
     },
     {
      "fr": "articuler",
      "uz": "talaffuz qilmoq",
      "emoji": "🔤",
      "alt": [
       "aniq aytmoq"
      ]
     },
     {
      "fr": "chuchoter",
      "uz": "pichirlamoq",
      "emoji": "🤫",
      "alt": [
       "past ovozda gapirmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Sophie aime dire la vérité à ses meilleurs amis fidèles.",
      "uz": "Sofi o'zining eng sodiq do'stlariga haqiqatni aytishni yaxshi ko'radi.",
      "uzAlt": [
       "Sofi yaqin o'rtoqlariga doim rostini gapiradi."
      ]
     },
     {
      "fr": "Pierre peut parler poliment avec tous ses collègues de travail.",
      "uz": "Piter barcha ishdagi hamkasblari bilan odob bilan gaplasha oladi.",
      "uzAlt": [
       "Piter barcha hamkasblari bilan xushmuomalalik bilan so'zlasha oladi."
      ]
     },
     {
      "fr": "Malika aime raconter des histoires fantastiques aux jeunes enfants curieux.",
      "uz": "Malika qiziquvchan yosh bolalarga ajoyib hikoyalar aytib berishni yoqtiradi.",
      "uzAlt": [
       "Malika jajji bolajonlarga qiziqarli ertaklar so'zlab berishni yaxshi ko'radi."
      ]
     },
     {
      "fr": "Il est important d'exprimer clairement ses propres pensées artistiques.",
      "uz": "O'zining shaxsiy badiiy fikrlarini aniq bayon etish muhimdir.",
      "uzAlt": [
       "O'z ijodiy o'ylarini ochiq-oydin ifodalay olish muhim ahamiyatga ega."
      ]
     },
     {
      "fr": "Ali sait bien articuler chaque mot français difficile lors des examens.",
      "uz": "Ali imtihonlar paytida har bir qiyin fransuzcha so'zni aniq talaffuz qilishni biladi.",
      "uzAlt": [
       "Ali imtihonda fransuzcha so'zlarni ravon va aniq talaffuz eta oladi."
      ]
     },
     {
      "fr": "Sophie a préféré chuchoter un petit secret doux à l'oreille d'Ali.",
      "uz": "Sofi Alining qulog'iga yoqimli kichik sirni pichirlashni afzal ko'rdi.",
      "uzAlt": [
       "Sofi Aliga past ovozda shirin sirni pichirlab aytdi."
      ]
     }
    ]
   },
   {
    "id": "u48l4",
    "title": "Fikrlash va o'ylash",
    "words": [
     {
      "fr": "songer",
      "uz": "xayol surmoq",
      "emoji": "🌌",
      "alt": [
       "xayolga kelmoq"
      ]
     },
     {
      "fr": "mediter",
      "uz": "chuqur o'ylamoq",
      "emoji": "🧘",
      "alt": [
       "mulohaza qilmoq"
      ]
     },
     {
      "fr": "considérer",
      "uz": "hisobga olmoq",
      "emoji": "⚖️",
      "alt": [
       "deb bilmoq"
      ]
     },
     {
      "fr": "juger",
      "uz": "baholamoq",
      "emoji": "📏",
      "alt": [
       "hukm qilmoq"
      ]
     },
     {
      "fr": "estimer",
      "uz": "chamalab ko'rmoq",
      "emoji": "📊",
      "alt": [
       "taxmin qilmoq"
      ]
     },
     {
      "fr": "calculer",
      "uz": "hisoblamoq",
      "emoji": "🔢",
      "alt": [
       "raqamlarni topmoq"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Pierre aime penser longuement aux projets futurs de sa vie.",
      "uz": "Piter o'z hayotining kelajakdagi loyihalari haqida uzoq o'ylashni yaxshi ko'radi.",
      "uzAlt": [
       "Piter kelajakdagi rejalari xususida uzoq fikr yuritishni yoqtiradi."
      ]
     },
     {
      "fr": "Sophie aime songer aux voyages lointains sous un ciel étoilé.",
      "uz": "Sofi yulduzli osmon ostida olis safarlar haqida xayol surishni yaxshi ko'radi.",
      "uzAlt": [
       "Sofi yulduzlar ostida uzoq sayohatlarni tasavvur qilib xayolga beriladi."
      ]
     },
     {
      "fr": "Il est utile de méditer calmement sur le sens profond de l'existence.",
      "uz": "Hayotning chuqur ma'nosi ustida sokinlik bilan mulohaza yuritish foydalidir.",
      "uzAlt": [
       "Insoniyat mavjudligining asl mohiyati haqida xotirjam o'ylab ko'rish foydali."
      ]
     },
     {
      "fr": "Malika peut considérer toutes les options possibles avant de choisir sa route.",
      "uz": "Malika o'z yo'lini tanlashdan oldin barcha mumkin bo'lgan variantlarni hisobga ola oladi.",
      "uzAlt": [
       "Malika tanlov qilishdan avval barcha ehtimoliy shartlarni o'ylab ko'radi."
      ]
     },
     {
      "fr": "Ali essaie toujours de juger objectivement la situation complexe de travail.",
      "uz": "Ali har doim ishning murakkab vaziyatini xolis baholashga harakat qiladi.",
      "uzAlt": [
       "Ali doimo ish joyidagi mushkul ahvolga adolatli baho berishga urinadi."
      ]
     },
     {
      "fr": "Sophie peut estimer correctement le coût total des matériaux nécessaires.",
      "uz": "Sofi kerakli materiallarning umumiy narxini to'g'ri chamalay oladi.",
      "uzAlt": [
       "Sofi zarur xomashyolarning umumiy qiymatini taxmin qila oladi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u49",
  "level": "C2",
  "title": "So'z o'yinlari va hazil",
  "description": "Kalambur, hazil, ironiya",
  "color": "#EF4444",
  "guide": [
   {
    "title": "Kalambur va omonimlar",
    "text": "Fransuz tilida bir xil eshitiladigan, lekin har xil ma'noga ega so'zlar orqali hazil va so'z o'yinlari yaratiladi.",
    "examples": [
     [
      "Il court vers la cour.",
      "U hovliga qarab yugurmoqda."
     ],
     [
      "C'est un jeu de mots subtil.",
      "Bu nozik so'z o'yini."
     ]
    ]
   },
   {
    "title": "Ironiya va ohang",
    "text": "Ironiyada so'zlarning to'g'ridan-to'g'ri ma'nosi emas, balki teskarisi nazarda tutiladi. Kontekst va ohang muhim rol o'ynaydi.",
    "examples": [
     [
      "Quel temps magnifique pour un naufrage!",
      "Kema halokati uchun qanday ajoyib ob-havo!"
     ]
    ]
   },
   {
    "title": "Ko'p ma'noli so'zlar hazili",
    "text": "Bir nechta ma'noga ega bo'lgan leksemalar hazil asarlarida kutilmagan assotsiatsiyalarni keltirib chiqaradi.",
    "examples": [
     [
      "Il a perdu la tête et son chapeau.",
      "U boshini va shlyapasini yo'qotdi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u49l1",
    "title": "So'z o'yinlari",
    "words": [
     {
      "fr": "le calembour",
      "uz": "kalambur",
      "emoji": "🃏",
      "alt": [
       "so'z o'yini"
      ]
     },
     {
      "fr": "l'homonymie",
      "uz": "omonimiya",
      "emoji": "👯",
      "alt": [
       "bir xil talaffuz"
      ]
     },
     {
      "fr": "la parodie",
      "uz": "parodiya",
      "emoji": "🎭",
      "alt": [
       "masxarabozlik"
      ]
     },
     {
      "fr": "le quiproquo",
      "uz": "tushunmovchilik",
      "emoji": "❓",
      "alt": [
       "noto'g'ri tushunish"
      ]
     },
     {
      "fr": "la plaisanterie",
      "uz": "hazil",
      "emoji": "😄",
      "alt": [
       "shaqacha"
      ]
     },
     {
      "fr": "le comique",
      "uz": "komizm",
      "emoji": "🎪",
      "alt": [
       "kulgili holat"
      ]
     },
     {
      "fr": "la satire",
      "uz": "satira",
      "emoji": "📰",
      "alt": [
       "kesatiq"
      ]
     },
     {
      "fr": "l'ironie",
      "uz": "ironiya",
      "emoji": "😏",
      "alt": [
       "kinoya"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Ce calembour subtil amuse beaucoup Pierre lors de la soirée.",
      "uz": "Bu nozik kalambur kechki payt Pierrning kulgisini qistatadi.",
      "uzAlt": [
       "Bu nozik so'z o'yini kechada Pierrni juda quvontiradi."
      ]
     },
     {
      "fr": "L'homonymie crée souvent des quiproquos hilarants entre Sophie et Ali.",
      "uz": "Omonimiya Sophie va Ali o'rtasida tez-tez qiziqarli tushunmovchiliklar tug'diradi.",
      "uzAlt": [
       "Bir xil eshitiladigan so'zlar Sofi va Ali orasida kulgili holatlarni keltirib chiqaradi."
      ]
     },
     {
      "fr": "La parodie politique présentée par Malika critique habilement le système.",
      "uz": "Malika taqdim etgan siyosiy parodiya tizimni mohirlik bilan tanqid qiladi.",
      "uzAlt": [
       "Malikaning siyosiy hajvi tizimni mohirona fosh qiladi."
      ]
     },
     {
      "fr": "Une bonne plaisanterie dissimule parfois une ironie mordante et profonde.",
      "uz": "Yaxshi hazil ba'zan o'tkir va chuqur kinoyani yashiradi.",
      "uzAlt": [
       "Ajoyib shaqacha ba'zida zaharxanda kinoyani berkitadi."
      ]
     },
     {
      "fr": "Le comique de situation dépasse largement le simple éclat de rire.",
      "uz": "Vaziyat komizmi oddiy qahqahadan ancha ustun turadi.",
      "uzAlt": [
       "Voqealar kulgiligi oddiy kulgidan ancha yuqori."
      ]
     },
     {
      "fr": "Cette satire littéraire montre l'ironie subtile de l'auteur moderne.",
      "uz": "Bu adabiy satira zamonaviy muallifning nozik ironiyasini ko'rsatadi.",
      "uzAlt": [
       "Mazkur hajviya hozirgi yozuvchining kinoyali qarashlarini ochib beradi."
      ]
     }
    ]
   },
   {
    "id": "u49l2",
    "title": "Hazil va kinoya",
    "words": [
     {
      "fr": "la boutade",
      "uz": "kutilmagan hazil",
      "emoji": "💡",
      "alt": [
       "keskin gap"
      ]
     },
     {
      "fr": "le persiflage",
      "uz": "masxara",
      "emoji": "😒",
      "alt": [
       "istehzo"
      ]
     },
     {
      "fr": "le sarcasme",
      "uz": "sarkazm",
      "emoji": "🙄",
      "alt": [
       "zaharxandalar"
      ]
     },
     {
      "fr": "la grimace",
      "uz": "ajib qiyofat",
      "emoji": "🤪",
      "alt": [
       "turq-tarovat"
      ]
     },
     {
      "fr": "l'humour",
      "uz": "yumor",
      "emoji": "🥳",
      "alt": [
       "ochiq kulgi"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Le rire spontané de Sophie brise la glace de l'ambiance.",
      "uz": "Sophie ning o'z-o'zidan chiqqan kulgisi muhitdagi muzni eritadi.",
      "uzAlt": [
       "Sofi ning tabiiy qahqahasi kayfiyatni ko'taradi."
      ]
     },
     {
      "fr": "Un simple sourire cache parfois une profonde ironie amère.",
      "uz": "Oddiy tabassum ba'zan chuqur achchiq kinoyani yashiradi.",
      "uzAlt": [
       "Kichik tabassum ortida ayanchli istehzo yashiringan bo'lishi mumkin."
      ]
     },
     {
      "fr": "Sa boutade spirituelle fait rire toute la salle de réunion.",
      "uz": "Uning zukko kutilmagan hazili majlis zalidagilarni kuldirdi.",
      "uzAlt": [
       "Uning topqir hazili yig'ilishdagi barchani xursand qildi."
      ]
     },
     {
      "fr": "Cette blague absurde amuse énormément Pierre et ses amis fidèles.",
      "uz": "Bu ma'nosiz latifa Pierre va uning sodiq do'stlarini juda quvontiradi.",
      "uzAlt": [
       "Mazkur absurd hazil Pierr va uning do'stlarini qattiq kuldirdi."
      ]
     },
     {
      "fr": "Le persiflage constant de cet homme agace profondément Malika.",
      "uz": "Bu odamning tinimsiz masxarasi Malikaning g'ashiga tegadi.",
      "uzAlt": [
       "Ushbu kishining doimiy istehzosi Malirani jahlini chiqaradi."
      ]
     },
     {
      "fr": "Le sarcasme mordant ne remplace jamais un véritable humour fin.",
      "uz": "O'tkir sarkazm hech qachon chinakam nozik yumorni almashtira olmaydi.",
      "uzAlt": [
       "Zaharxanda kinoya asl va nozik hazilning o'rnini bosa olmaydi."
      ]
     }
    ]
   },
   {
    "id": "u49l3",
    "title": "Ko'p ma'noli so'zlar",
    "words": [
     {
      "fr": "la polysémie",
      "uz": "ko'p ma'nolilik",
      "emoji": "🌐",
      "alt": [
       "polisemiya"
      ]
     },
     {
      "fr": "l'ambivalence",
      "uz": "ikkiyoqlama",
      "emoji": "☯️",
      "alt": [
       "ziddiyat"
      ]
     },
     {
      "fr": "le sous-entendu",
      "uz": "tagma'no",
      "emoji": "🤫",
      "alt": [
       "yashirin ma'no"
      ]
     },
     {
      "fr": "le double sens",
      "uz": "qo'shaloq ma'no",
      "emoji": "🔄",
      "alt": [
       "ikki ma'no"
      ]
     },
     {
      "fr": "l'allusion",
      "uz": "ishora",
      "emoji": "👉",
      "alt": [
       "kinoya qilish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "La polysémie des verbes français complique parfois la traduction littéraire.",
      "uz": "Fransuz fe'llarining ko'p ma'noliligi ba'zan badiiy tarjimani qiyinlashtiradi.",
      "uzAlt": [
       "Fransuzcha so'zlarning serqirraligi ba'zida tarjimani murakkablashtiradi."
      ]
     },
     {
      "fr": "Cette phrase possède une ambivalence remarquable que tout le monde remarque.",
      "uz": "Bu gapda hamma sezadigan e'tiborga molik ikkiyoqlama ma'no bor.",
      "uzAlt": [
       "Mazkur jumlada barchaga sezilarli bo'lgan o'ziga xos ziddiyat mavjud."
      ]
     },
     {
      "fr": "Le sous-entendu comique de Pierre amuse beaucoup la charmante Sophie.",
      "uz": "Pierrning kulgili tagma'nosi jozibali Sophie ni behad quvontiradi.",
      "uzAlt": [
       "Pierrning hazilomuz yashirin ma'nosi maftunkor Sofini xursand qildi."
      ]
     },
     {
      "fr": "Chaque nuance lexicale modifie subtilement la portée de la blague.",
      "uz": "Har bir lug'aviy tus hazilning ta'sir doirasini nozik tarzda o'zgartiradi.",
      "uzAlt": [
       "Har bir so'z nozikligi hazilning mohiyatini o'zgartiradi."
      ]
     },
     {
      "fr": "Ce double sens habile provoque un rire général dans l'auditorium.",
      "uz": "Bu mohirona qo'shaloq ma'no auditoriyada umumiy kulgini keltirib chiqaradi.",
      "uzAlt": [
       "Ushbu ikki ma'noli ifoda zalda hamma qahqaha otishiga sabab bo'ldi."
      ]
     },
     {
      "fr": "L'allusion discrète de Malika cache une critique très acerbe.",
      "uz": "Malikaning bosiq ishorasi juda o'tkir tanqidni yashiradi.",
      "uzAlt": [
       "Malikaning yashirin kinoyasi keskin tanqidni o'z ichiga oladi."
      ]
     }
    ]
   },
   {
    "id": "u49l4",
    "title": "Abstrakt hazillar",
    "words": [
     {
      "fr": "l'absurdité",
      "uz": "absurdlik",
      "emoji": "🌀",
      "alt": [
       "ma'nosizlik"
      ]
     },
     {
      "fr": "le délire",
      "uz": "alahsirash",
      "emoji": "💫",
      "alt": [
       "telbalik"
      ]
     },
     {
      "fr": "la facétie",
      "uz": "qiliq",
      "emoji": "🎭",
      "alt": [
       "sho'xlik"
      ]
     },
     {
      "fr": "la gaîté",
      "uz": "shodlik",
      "emoji": "☀️",
      "alt": [
       "quvonch"
      ]
     },
     {
      "fr": "le badinage",
      "uz": "o'yin-kulgi",
      "emoji": "🎈",
      "alt": [
       "ermak"
      ]
     },
     {
      "fr": "la bouffonnerie",
      "uz": "masxarabozlik",
      "emoji": "🤡",
      "alt": [
       "laqmabilik"
      ]
     },
     {
      "fr": "l'espièglerie",
      "uz": "sho'xlik",
      "emoji": "😈",
      "alt": [
       "qaysarlik"
      ]
     },
     {
      "fr": "la mystification",
      "uz": "aldov",
      "emoji": "🎭",
      "alt": [
       "fosh etish"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "L'absurdité totale de cette situation fait rire Ali et Pierre.",
      "uz": "Bu vaziyatning mutlaq absurdligi Ali va Pierrni kuldiradi.",
      "uzAlt": [
       "Ushbu holatning mantiqsizligi Ali hamda Pierrni xursand qiladi."
      ]
     },
     {
      "fr": "Leurs éclats de rire ressemblent parfois à un charmant délire.",
      "uz": "Ularning qahqahalari ba'zan jozibali telbalikka o'xshab ketadi.",
      "uzAlt": [
       "Ularning kulgisi ba'zida g'aroyib alahsirashni eslatadi."
      ]
     },
     {
      "fr": "Cette petite facétie montre bien le caractère enjoué de Sophie.",
      "uz": "Bu kichik sho'xlik Sophie ning quvnoq tabiatini yaqqol ko'rsatadi.",
      "uzAlt": [
       "Mazkur qilig'i Sofining sho'x tabiatidan darak beradi."
      ]
     },
     {
      "fr": "La gaîté communicative de Malika illumine toute la pièce sombre.",
      "uz": "Malikaning yuqumli shodligi butun qorong'u xonani yoritib yuboradi.",
      "uzAlt": [
       "Malikaning quvonchi hamma xonaga ko'chadi."
      ]
     },
     {
      "fr": "Un simple badinage amical dissipe rapidement toutes les tensions inutiles.",
      "uz": "Oddiy do'stona o'yin-kulgi barcha keraksiz tarangliklarni tezda yo'q qiladi.",
      "uzAlt": [
       "Yengil do'stona suhbat barcha asabiylashishlarni tarqatib yuboradi."
      ]
     },
     {
      "fr": "La bouffonnerie théâtrale séduit immédiatement le public attentif.",
      "uz": "Teatr masxarabozligi yig'ilgan diqqatli ommani darhol rom etadi.",
      "uzAlt": [
       "Sahna komediyasi yig'ilgan tomoshabinlarni tezda o'ziga jalb qiladi."
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "u50",
  "level": "C2",
  "title": "Nutq san'ati",
  "description": "Nutq so'zlash, ritorika, adabiy tahlil",
  "color": "#F97316",
  "guide": [
   {
    "title": "Ritorik figuralar va nutq",
    "text": "Fransuz tilida nutqni boyitish uchun turli ritorik figuralar ishlatiladi. Antiteza va metafora fikrni ta'sirchan qiladi.",
    "examples": [
     [
      "Cette métaphore illumine son discours brillant.",
      "Bu metafora uning yorqin nutqini yoritadi."
     ],
     [
      "L'antithèse renforce la structure de l'argumentation.",
      "Antiteza argumentatsiya tuzilishini kuchaytiradi."
     ]
    ]
   },
   {
    "title": "Adabiy Inversiya",
    "text": "Yuqori uslubda gap tuzilishini o'zgartirib, fe'lni egadan oldinga qo'yish keng qo'llaniladi. Bu matnga tantanavorlik baxsh etadi.",
    "examples": [
     [
      "À peine eut-il prononcé ces mots que le silence s'établit.",
      "U bu so'zlarni aytishi bilan jimlik o'rnatildi."
     ],
     [
      "Comprendrait-on la profondeur de cette analyse ?",
      "Bu tahlilning chuqurligini anglab yetisharmikan?"
     ]
    ]
   },
   {
    "title": "Subjonctif Imparfait",
    "text": "Adabiy va yuqori C2 darajasidagi matnlarda o'tgan zamon shart maydoni (subjonctif imparfait) qo'llaniladi. Odatda u uchinchi shaxs birlik shaklida ishlatiladi.",
    "examples": [
     [
      "Il fallait qu'il parlât avec une grande éloquence.",
      "Uning buyuk notiqlik bilan so'zlay olishi zarur edi."
     ],
     [
      "Bien qu'elle s'exprimât parfaitement, le doute persista.",
      "Garchi u mukammal ifoda etgan bo'lsa-da, shubha saqlanib qoldi."
     ]
    ]
   }
  ],
  "lessons": [
   {
    "id": "u50l1",
    "title": "Ritorik san'at",
    "words": [
     {
      "fr": "l'hyperbole",
      "uz": "bo'rttirish",
      "emoji": "📈",
      "alt": [
       "mubolag'a"
      ]
     },
     {
      "fr": "la litote",
      "uz": "kichraytirish",
      "emoji": "📉",
      "alt": [
       "kinoyali inkor"
      ]
     },
     {
      "fr": "l'oxymore",
      "uz": "zid ma'noli birikma",
      "emoji": "🔀",
      "alt": [
       "oksimoron"
      ]
     },
     {
      "fr": "le pléonasme",
      "uz": "ortiqcha so'z",
      "emoji": "💬",
      "alt": [
       "pleonazm"
      ]
     },
     {
      "fr": "la périphrase",
      "uz": "tavsifiy ifoda",
      "emoji": "📜",
      "alt": [
       "perifraz"
      ]
     },
     {
      "fr": "l'anaphore",
      "uz": "takror",
      "emoji": "🔁",
      "alt": [
       "anafora"
      ]
     },
     {
      "fr": "le chiasme",
      "uz": "kesishgan tartib",
      "emoji": "❌",
      "alt": [
       "chiasm"
      ]
     },
     {
      "fr": "la gradation",
      "uz": "zinapoya",
      "emoji": "📶",
      "alt": [
       "gradatsiya"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il employât une hyperbole remarquable afin que son public comprît l'immensité du problème.",
      "uz": "Jamoatchilik muammoning ulkanligini tushunishi uchun u e'tiborga molik bo'rttirishdan foydalandi.",
      "uzAlt": [
       "Tomoshabinlar muammo ko'lamini anglab yetishi uchun u ajoyib bo'rttirish ishlatdi."
      ]
     },
     {
      "fr": "Cette litote subtile démontrait toute la maîtrise artistique de Pierre dans l'art oratoire.",
      "uz": "Bu nozik kichraytirish Pierrning notiqlik san'atidagi butun badiiy mahoratini namoyish etdi.",
      "uzAlt": [
       "Ushbu nozik litoza Pyerning notiqlikdagi butun mahoratini ko'rsatdi."
      ]
     },
     {
      "fr": "Quel bel oxymore résonnât dans ce discours littéraire préparé par Sophie !",
      "uz": "Sofi tayyorlagan ushbu adabiy nutqda qanday go'zal oksimoron yangradi!",
      "uzAlt": [
       "Sofi tayyorlagan adabiy nutqda qanday ajoyib zid ma'noli birikma yangradi!"
      ]
     },
     {
      "fr": "Évitât-il le pléonasme inutile pour que son texte fût parfaitement rigoureux ?",
      "uz": "Matni mutlaqo puxta bo'lishi uchun u keraksiz pleonazmdan qochdimi?",
      "uzAlt": [
       "Matni mukammal darajada qat'iy bo'lishi uchun u ortiqcha so'zlardan qochganmikin?"
      ]
     },
     {
      "fr": "La périphrase élégante que proposât Ali embellit considérablement la dissertation.",
      "uz": "Ali taklif qilgan nafis tavsifiy ifoda inshoni sezilarli darajada bezadi.",
      "uzAlt": [
       "Ali taklif etgan nafis perifraz insho mazmunini ancha boyitdi."
      ]
     },
     {
      "fr": "Cette anaphore puissante captivât immédiatement l'attention de tous les auditeurs présents.",
      "uz": "Bu kuchli takror hozir bo'lgan barcha tinglovchilarning e'tiborini darhol tortdi.",
      "uzAlt": [
       "Ushbu kuchli anafora yig'ilganlarning diqqatini darhol o'ziga jalb qildi."
      ]
     }
    ]
   },
   {
    "id": "u50l2",
    "title": "Adabiy tahlil",
    "words": [
     {
      "fr": "le lexique",
      "uz": "lug'at boyligi",
      "emoji": "📚",
      "alt": [
       "leksika"
      ]
     },
     {
      "fr": "le registre",
      "uz": "uslub",
      "emoji": "🎭",
      "alt": [
       "registri"
      ]
     },
     {
      "fr": "la thématique",
      "uz": "mavzuiylik",
      "emoji": "📌",
      "alt": [
       "tematika"
      ]
     },
     {
      "fr": "le champ lexical",
      "uz": "ma'nodosh qator",
      "emoji": "🌐",
      "alt": [
       "leksik maydon"
      ]
     },
     {
      "fr": "la portée",
      "uz": "ahamiyat",
      "emoji": "🎯",
      "alt": [
       "ta'sir doirasi"
      ]
     },
     {
      "fr": "la sous-entente",
      "uz": "tagma'no",
      "emoji": "🤫",
      "alt": [
       "imo-ishora"
      ]
     },
     {
      "fr": "la structure narrative",
      "uz": "hikoya tuzilishi",
      "emoji": "🏗️",
      "alt": [
       "syujet strukturasi"
      ]
     },
     {
      "fr": "la tension dramatique",
      "uz": "dramatik zo'riqish",
      "emoji": "⚡",
      "alt": [
       "keskinlik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il fallut que le critique analysât minutieusement le lexique employé par l'écrivain.",
      "uz": "Tanqidchi yozuvchi qo'llagan lug'at boyligini sinchiklab tahlil qilishi shart edi.",
      "uzAlt": [
       "Tanqidchi adib ishlatgan leksikani batafsil o'rganib chiqishi zarur bo'ldi."
      ]
     },
     {
      "fr": "Quel registre linguistique choisît Malika pour exprimer sa pensée profonde ?",
      "uz": "Malika o'zining chuqur fikrini ifodalash uchun qaysi til uslubini tanladi?",
      "uzAlt": [
       "Malika teran fikrini bildirish uchun qaysi registratsiyani tanlagan edi?"
      ]
     },
     {
      "fr": "Pour que la thématique fût claire, Pierre développât une argumentation solide.",
      "uz": "Mavzuiylik aniq bo'lishi uchun Pierre puxta dalillarni ilgari surdi.",
      "uzAlt": [
       "Mavzu ravshan chiqishi uchun Pyer mustahkam argumentatsiyani rivojlantirdi."
      ]
     },
     {
      "fr": "Ce champ lexical enrichît la prose poétique que l'auteur publia récemment.",
      "uz": "Bu leksik maydon muallif yaqinda nashr etgan she'riy nasrni boyitdi.",
      "uzAlt": [
       "Ushbu ma'nodosh qator adib yaqinda e'lon qilgan nasriy asarni yanada boyitdi."
      ]
     },
     {
      "fr": "Comprît-on toute la portée philosophique de cette œuvre magnifique ?",
      "uz": "Bu ulug'vor asarning butun falsafiy ahamiyati anglab yetildimikan?",
      "uzAlt": [
       "Ushbu ajoyib asarning barcha falsafiy miqyosiga tushunib yetishdimi?"
      ]
     },
     {
      "fr": "La sous-entente subtile accentuât la tension dramatique dans le dernier chapitre.",
      "uz": "Nozik tagma'no oxirgi bobdagi dramatik zo'riqishni kuchaytirdi.",
      "uzAlt": [
       "Nozik imo-ishora oxirgi bobdagi keskinlikni yanada oshirdi."
      ]
     }
    ]
   },
   {
    "id": "u50l3",
    "title": "Notiqlik va ritorika",
    "words": [
     {
      "fr": "l'art oratoire",
      "uz": "notiqlik san'ati",
      "emoji": "🎤",
      "alt": [
       "oratorlik"
      ]
     },
     {
      "fr": "l'allocution",
      "uz": "qisqa nutq",
      "emoji": "📜",
      "alt": [
       "murojaat"
      ]
     },
     {
      "fr": "la plaidoirie",
      "uz": "himoya nutqi",
      "emoji": "⚖️",
      "alt": [
       "advokat nutqi"
      ]
     },
     {
      "fr": "l'emphase",
      "uz": "balandparozlik",
      "emoji": "📢",
      "alt": [
       "tantanavorlik"
      ]
     },
     {
      "fr": "la persuasion",
      "uz": "ishontirish",
      "emoji": "🤝",
      "alt": [
       "ko'ndirish"
      ]
     },
     {
      "fr": "la répartie",
      "uz": "topqirlik",
      "emoji": "💡",
      "alt": [
       "tezkor javob"
      ]
     },
     {
      "fr": "l'argumentation",
      "uz": "dalillash",
      "emoji": "📊",
      "alt": [
       "argumentatsiya"
      ]
     },
     {
      "fr": "la diction",
      "uz": "talaffuz",
      "emoji": "🗣️",
      "alt": [
       "diksiya"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il convenait que Sophie maîtrisât l'art oratoire pour convaincre son auditoire exigeant.",
      "uz": "Talabchan tinglovchilarini ishontirish uchun Sofi notiqlik san'atini egallashi lozim edi.",
      "uzAlt": [
       "Talabchan auditoriyani ishontirish uchun Sofiyaning notiqlik san'atini puxta bilishi talab qilinardi."
      ]
     },
     {
      "fr": "Cette allocution remarquable impressionnât tous les diplomates présents dans la grande salle.",
      "uz": "Ushbu e'tiborga molik qisqa nutq katta zalda hozir bo'lgan barcha diplomatlarni hayratda qoldirdi.",
      "uzAlt": [
       "Bu ajoyib murojaat katta zaldagi barcha diplomatlarda katta taassurot qoldirdi."
      ]
     },
     {
      "fr": "Pour que la plaidoirie fût efficace, l'avocat présentât des preuves irréfutables.",
      "uz": "Himoya nutqi samarali bo'lishi uchun advokat rad etib bo'lmaydigan dalillarni taqdim etdi.",
      "uzAlt": [
       "Advokatning nutqi ta'sirli chiqishi uchun u inkor etib bo'lmas dalillarni keltirdi."
      ]
     },
     {
      "fr": "Rejeta-t-il l'emphase excessive afin que son discours sonnât plus sincère ?",
      "uz": "Nutqi samimiyroq yangrashi uchun u haddan tashqari balandparozlikni rad etdimi?",
      "uzAlt": [
       "U o'z nutqini tabiiyroq chiqishi maqsadida ortiqcha tantanavorlikni rad etganmikan?"
      ]
     },
     {
      "fr": "La persuasion de ce conférencier inspirât de nombreux jeunes chercheurs passionnés.",
      "uz": "Bu ma'ruzachining ishontira olish qobiliyati ko'plab ishtiyoqli yosh tadqiqotchilarni ilhomlantirdi.",
      "uzAlt": [
       "Ushbu spikerning ko'ndira olish mahorati ko'plab yosh izlanuvchilarni ruhlantirdi."
      ]
     },
     {
      "fr": "Quelle répartie brillante Malika offrît lors de ce débat intellectuel animé !",
      "uz": "Bu qizg'in intellektual munozara paytida Malika qanday yorqin topqirlik ko'rsatdi!",
      "uzAlt": [
       "Qizg'in bahs paytida Malikaning ko'rsatgan topqirligi qanday hayratlanarli edi!"
      ]
     }
    ]
   },
   {
    "id": "u50l4",
    "title": "Uslub va bayon",
    "words": [
     {
      "fr": "la cadence",
      "uz": "ohang",
      "emoji": "🎵",
      "alt": [
       "ritm"
      ]
     },
     {
      "fr": "la césure",
      "uz": "to'xtam",
      "emoji": "⏸️",
      "alt": [
       "tanaffus"
      ]
     },
     {
      "fr": "la concision",
      "uz": "lo'ndalik",
      "emoji": "✏️",
      "alt": [
       "qisqalik"
      ]
     },
     {
      "fr": "l'abondance",
      "uz": "serobgarchilik",
      "emoji": "🌾",
      "alt": [
       "mo'llik"
      ]
     },
     {
      "fr": "le lyrisme",
      "uz": "lirizm",
      "emoji": "💖",
      "alt": [
       "lirik ruh"
      ]
     },
     {
      "fr": "la subtilité",
      "uz": "noziklik",
      "emoji": "🔍",
      "alt": [
       "zukkolik"
      ]
     },
     {
      "fr": "la clarté",
      "uz": "ravshanlik",
      "emoji": "☀️",
      "alt": [
       "aniqlik"
      ]
     }
    ],
    "sentences": [
     {
      "fr": "Il était indispensable que la cadence de cette phrase fût parfaitement mesurée.",
      "uz": "Bu gapning ohangi mukammal darajada o'lchangan bo'lishi muhim edi.",
      "uzAlt": [
       "Ushbu jumlaning ritmi mukammal muvofiqlashtirilgan bo'lishi shart edi."
      ]
     },
     {
      "fr": "Cette césure poétique permit aux auditeurs d'apprécier la beauté du texte.",
      "uz": "Bu she'riy to'xtam tinglovchilarga matn go'zalligidan bahramand bo'lish imkonini berdi.",
      "uzAlt": [
       "Mazkur she'riy tanaffus tinglovchilarga matn latofatini his etish imkonini yaratdi."
      ]
     },
     {
      "fr": "Quel ton ironique Ali adoptât-il pour critiquer cette habitude littéraire ?",
      "uz": "Ali ushbu adabiy odatni tanqid qilish uchun qanday kinoyali ohangni qo'lladi?",
      "uzAlt": [
       "Ali bu adabiy illatni tanqid qilish maqsadida qanday istehzoli maylni tanlagan edi?"
      ]
     },
     {
      "fr": "Recherchât-elle toujours la concision dans ses écrits philosophiques complexes ?",
      "uz": "U o'zining murakkab falsafiy yozuvlarida doimo lo'ndalikni qidirdimikan?",
      "uzAlt": [
       "U o'zining murakkab falsafiy asarlarida doimo qisqalikka intilarmidi?"
      ]
     },
     {
      "fr": "L'abondance verbale caractérisât le style unique de ce grand poète français.",
      "uz": "So'zlarning mo'lligi ushbu buyuk fransuz shoirining o'ziga xos uslubini tavsifladi.",
      "uzAlt": [
       "Leksik mo'llik mazkur buyuk fransuz shoirining betakror uslubiga xos edi."
      ]
     },
     {
      "fr": "Ce lyrisme touchant émut profondément tous les amateurs de littérature classique.",
      "uz": "Bu ta'sirli lirizm mumtoz adabiyotning barcha muxlislarini chuqur hayajonlantirdi.",
      "uzAlt": [
       "Ushbu ta'sirchan lirik ruh klassik adabiyotsevarlarni qattiq to'lqinlantirdi."
      ]
     }
    ]
   }
  ]
 }
];
