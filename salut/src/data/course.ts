// Kurs mazmuni: Fransuz tili (A1) — o'zbek tilida so'zlashuvchilar uchun.
// Har bir dars: yangi so'zlar + shu so'zlardan tuzilgan gaplar.
// `alt` — qabul qilinadigan muqobil tarjimalar.

export interface Word {
  fr: string;
  uz: string;
  emoji?: string;
  alt?: string[];
}

export interface Sentence {
  fr: string;
  uz: string;
  frAlt?: string[];
  uzAlt?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  words: Word[];
  sentences: Sentence[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string;
  guide: { title: string; text: string; examples?: [string, string][] }[];
  lessons: Lesson[];
}

export const COURSE: Unit[] = [
  {
    id: 'u1',
    title: 'Salomlashish',
    description: "Salom bering, o'zingizni tanishtiring",
    color: '#818CF8',
    guide: [
      {
        title: 'Bonjour va Salut',
        text: "«Bonjour» — rasmiy salom (kunduzi). «Salut» — do'stlar orasida norasmiy salom va xayr.",
        examples: [
          ['Bonjour, madame !', 'Assalomu alaykum, xonim!'],
          ['Salut, Ali !', 'Salom, Ali!'],
        ],
      },
      {
        title: 'Je suis — men ...man',
        text: "«être» (bo'lmoq) fe'li: je suis (men ...man), tu es (sen ...san), il/elle est (u ...dir). O'zbek tilidagi qo'shimcha o'rniga fransuzlar alohida so'z ishlatadi.",
        examples: [
          ['Je suis étudiant.', 'Men talabaman.'],
          ['Tu es professeur.', "Sen o'qituvchisan."],
        ],
      },
      {
        title: 'Un / Une — rod (jins)',
        text: "Fransuz tilida har bir ot erkak (un, le) yoki ayol (une, la) rodida bo'ladi. So'zni artikli bilan birga yodlang!",
        examples: [
          ['un homme', 'erkak (m.)'],
          ['une femme', 'ayol (f.)'],
        ],
      },
    ],
    lessons: [
      {
        id: 'u1l1',
        title: 'Salom!',
        words: [
          { fr: 'bonjour', uz: 'salom', emoji: '👋', alt: ['assalomu alaykum', 'xayrli kun'] },
          { fr: 'au revoir', uz: 'xayr', emoji: '🚪', alt: ["ko'rishguncha"] },
          { fr: 'merci', uz: 'rahmat', emoji: '🙏' },
          { fr: 'oui', uz: 'ha', emoji: '✅' },
          { fr: 'non', uz: "yo'q", emoji: '❌' },
          { fr: 'et', uz: 'va', emoji: '➕' },
        ],
        sentences: [
          { fr: 'Oui, merci.', uz: 'Ha, rahmat.' },
          { fr: 'Non, merci.', uz: "Yo'q, rahmat." },
          { fr: 'Bonjour et merci !', uz: 'Salom va rahmat!', uzAlt: ['Assalomu alaykum va rahmat!'] },
          { fr: 'Merci et au revoir !', uz: 'Rahmat va xayr!' },
        ],
      },
      {
        id: 'u1l2',
        title: 'Tanishuv',
        words: [
          { fr: 'salut', uz: 'salom (norasmiy)', emoji: '🤙', alt: ['salom'] },
          { fr: "je m'appelle", uz: 'mening ismim', emoji: '🪪', alt: ['ismim'] },
          { fr: 'ça va', uz: 'qalaysiz', emoji: '🙂', alt: ['yaxshimisiz', 'ishlar qalay'] },
          { fr: 'bien', uz: 'yaxshi', emoji: '👍' },
          { fr: 'comment', uz: 'qanday', emoji: '❓', alt: ['qanaqa'] },
          { fr: 'tu', uz: 'sen', emoji: '👉' },
        ],
        sentences: [
          { fr: "Je m'appelle Ali.", uz: 'Mening ismim Ali.', uzAlt: ['Ismim Ali.', 'Men Aliman.'] },
          { fr: 'Ça va ?', uz: 'Qalaysiz?', uzAlt: ['Yaxshimisiz?', 'Ishlar qalay?', 'Qalaysan?'] },
          { fr: 'Ça va bien, merci.', uz: 'Yaxshi, rahmat.', uzAlt: ['Ishlar yaxshi, rahmat.'] },
          { fr: "Comment tu t'appelles ?", uz: 'Isming nima?', uzAlt: ['Sening isming nima?', 'Ismingiz nima?'] },
          { fr: 'Salut, ça va ?', uz: 'Salom, qalaysan?', uzAlt: ['Salom, qalaysiz?', 'Salom, yaxshimisan?', 'Salom, ishlar qalay?'] },
        ],
      },
      {
        id: 'u1l3',
        title: 'Kim bu?',
        words: [
          { fr: "c'est", uz: 'bu', emoji: '👇' },
          { fr: 'un homme', uz: 'erkak', emoji: '👨', alt: ['bir erkak'] },
          { fr: 'une femme', uz: 'ayol', emoji: '👩', alt: ['bir ayol'] },
          { fr: 'un garçon', uz: "o'g'il bola", emoji: '👦', alt: ['bola'] },
          { fr: 'une fille', uz: 'qiz', emoji: '👧', alt: ['qiz bola'] },
          { fr: 'il', uz: 'u (erkak)', emoji: '🙋‍♂️', alt: ['u'] },
          { fr: 'elle', uz: 'u (ayol)', emoji: '🙋‍♀️', alt: ['u'] },
        ],
        sentences: [
          { fr: "C'est un homme.", uz: 'Bu erkak.', uzAlt: ['Bu bir erkak.'] },
          { fr: "C'est une femme.", uz: 'Bu ayol.', uzAlt: ['Bu bir ayol.'] },
          { fr: "C'est une fille.", uz: 'Bu qiz.', uzAlt: ['Bu qiz bola.'] },
          { fr: 'Un garçon et une fille.', uz: "O'g'il bola va qiz bola.", uzAlt: ["O'g'il bola va qiz.", "Bir o'g'il bola va bir qiz."] },
        ],
      },
      {
        id: 'u1l4',
        title: 'Men kimman',
        words: [
          { fr: 'je suis', uz: 'men ...man', emoji: '🙋', alt: ['men'] },
          { fr: 'tu es', uz: 'sen ...san', emoji: '🫵', alt: ['sen'] },
          { fr: 'étudiant', uz: 'talaba', emoji: '🎓' },
          { fr: 'professeur', uz: "o'qituvchi", emoji: '👩‍🏫', alt: ['ustoz'] },
          { fr: 'français', uz: 'fransuz', emoji: '🇫🇷' },
          { fr: 'ouzbek', uz: "o'zbek", emoji: '🇺🇿' },
        ],
        sentences: [
          { fr: 'Je suis étudiant.', uz: 'Men talabaman.', uzAlt: ['Men talaba.'] },
          { fr: 'Tu es professeur ?', uz: "Sen o'qituvchimisan?", uzAlt: ["Siz o'qituvchimisiz?"] },
          { fr: 'Il est français.', uz: 'U fransuz.', uzAlt: ['U fransuzdir.'] },
          { fr: 'Je suis ouzbek.', uz: "Men o'zbekman.", uzAlt: ["Men o'zbek."] },
          { fr: 'Elle est ouzbèke.', uz: "U o'zbek.", uzAlt: ["U o'zbekdir."] },
        ],
      },
    ],
  },
  {
    id: 'u2',
    title: 'Oila',
    description: "Oila a'zolari va do'stlar haqida gapiring",
    color: '#E5484D',
    guide: [
      {
        title: 'Mon, ma, mes — mening',
        text: "«mening» so'zi otning rodiga qarab o'zgaradi: mon (erkak rod), ma (ayol rod), mes (ko'plik).",
        examples: [
          ['mon père', 'mening otam'],
          ['ma mère', 'mening onam'],
          ['mes amis', "mening do'stlarim"],
        ],
      },
      {
        title: "J'ai — menda bor",
        text: "«avoir» (ega bo'lmoq) fe'li: j'ai (menda bor), tu as (senda bor), il/elle a (unda bor). Yoshni ham avoir bilan aytamiz: J'ai dix ans.",
        examples: [["J'ai un frère.", 'Mening akam bor.']],
      },
      {
        title: 'Sifatlarning ayol rodi',
        text: "Sifat ayol rodidagi otga tegishli bo'lsa, odatda oxiriga -e qo'shiladi: petit → petite, grand → grande.",
        examples: [['Ma sœur est petite.', 'Singlim kichkina.']],
      },
    ],
    lessons: [
      {
        id: 'u2l1',
        title: 'Mening oilam',
        words: [
          { fr: 'la mère', uz: 'ona', emoji: '👩‍👧' },
          { fr: 'le père', uz: 'ota', emoji: '👨‍👦' },
          { fr: 'le frère', uz: 'aka', emoji: '🧑', alt: ['uka', 'aka-uka'] },
          { fr: 'la sœur', uz: 'opa', emoji: '👱‍♀️', alt: ['singil', 'opa-singil'] },
          { fr: 'la famille', uz: 'oila', emoji: '👨‍👩‍👧‍👦' },
          { fr: 'mon / ma', uz: 'mening', emoji: '🫶' },
          { fr: "j'aime", uz: "men yaxshi ko'raman", emoji: '❤️', alt: ["yaxshi ko'raman", 'sevaman'] },
        ],
        sentences: [
          { fr: "C'est ma mère.", uz: 'Bu mening onam.', uzAlt: ['Bu onam.'] },
          { fr: "C'est mon père.", uz: 'Bu mening otam.', uzAlt: ['Bu otam.'] },
          { fr: 'Mon frère et ma sœur.', uz: 'Mening akam va opam.', uzAlt: ['Akam va opam.', 'Ukam va singlim.', 'Mening ukam va singlim.', 'Akam va singlim.', 'Mening akam va singlim.'] },
          { fr: "J'aime ma famille.", uz: "Men oilamni yaxshi ko'raman.", uzAlt: ["Oilamni yaxshi ko'raman.", 'Men oilamni sevaman.', 'Oilamni sevaman.'] },
        ],
      },
      {
        id: 'u2l2',
        title: 'Menda bor',
        words: [
          { fr: "j'ai", uz: 'menda bor', emoji: '🤲', alt: ['mening bor'] },
          { fr: 'tu as', uz: 'senda bor', emoji: '🫴' },
          { fr: 'un enfant', uz: 'bola', emoji: '🧒', alt: ['farzand'] },
          { fr: 'un ami', uz: "do'st", emoji: '🧑‍🤝‍🧑', alt: ["o'rtoq"] },
          { fr: 'une amie', uz: "dugona", emoji: '👭', alt: ["do'st", "o'rtoq"] },
          { fr: 'deux', uz: 'ikki', emoji: '2️⃣', alt: ['ikkita'] },
        ],
        sentences: [
          { fr: "J'ai un frère.", uz: 'Mening akam bor.', uzAlt: ['Mening bir akam bor.', 'Mening ukam bor.', 'Mening bir ukam bor.', 'Akam bor.', 'Ukam bor.'] },
          { fr: 'Tu as une sœur ?', uz: 'Sening opang bormi?', uzAlt: ['Sening singling bormi?', 'Opang bormi?', 'Singling bormi?'] },
          { fr: "J'ai deux enfants.", uz: 'Mening ikki farzandim bor.', uzAlt: ['Mening ikkita bolam bor.', 'Ikki farzandim bor.', 'Ikkita bolam bor.', 'Mening ikki bolam bor.'] },
          { fr: "C'est mon ami.", uz: "Bu mening do'stim.", uzAlt: ["Bu do'stim."] },
          { fr: "C'est mon amie.", uz: 'Bu mening dugonam.', uzAlt: ['Bu dugonam.', "Bu mening do'stim."] },
        ],
      },
      {
        id: 'u2l3',
        title: 'Qanday odam?',
        words: [
          { fr: 'grand', uz: 'baland', emoji: '🦒', alt: ['katta', "baland bo'yli"] },
          { fr: 'petit', uz: 'kichkina', emoji: '🐭', alt: ['kichik', "past bo'yli"] },
          { fr: 'jeune', uz: 'yosh', emoji: '🧒' },
          { fr: 'vieux', uz: 'keksa', emoji: '👴', alt: ['qari', 'eski'] },
          { fr: 'beau', uz: 'chiroyli', emoji: '✨', alt: ['go\'zal', 'kelishgan'] },
          { fr: 'gentil', uz: 'mehribon', emoji: '🤗', alt: ['yoqimli', 'odobli'] },
        ],
        sentences: [
          { fr: 'Mon père est grand.', uz: 'Mening otam baland.', uzAlt: ['Otam baland.', 'Mening otam katta.', "Otam baland bo'yli.", "Mening otam baland bo'yli."] },
          { fr: 'Ma sœur est petite.', uz: 'Mening singlim kichkina.', uzAlt: ['Singlim kichkina.', 'Mening singlim kichik.', 'Singlim kichik.'] },
          { fr: 'Il est gentil.', uz: 'U mehribon.', uzAlt: ['U yoqimli.', 'U odobli.'] },
          { fr: 'Elle est jeune.', uz: 'U yosh.' },
          { fr: 'Mon ami est beau.', uz: "Mening do'stim chiroyli.", uzAlt: ["Do'stim chiroyli.", "Mening do'stim kelishgan.", "Do'stim kelishgan."] },
        ],
      },
    ],
  },
  {
    id: 'u3',
    title: 'Ovqat',
    description: 'Ovqat va ichimliklar, restoranda buyurtma',
    color: '#F59E0B',
    guide: [
      {
        title: 'Du, de la, de l\' — biroz',
        text: "Sanab bo'lmaydigan narsalar oldidan «partitif» artikl qo'yiladi: du (erkak rod), de la (ayol rod), de l' (unli tovush oldidan). O'zbek tiliga odatda tarjima qilinmaydi.",
        examples: [
          ['Je mange du pain.', 'Men non yeyman.'],
          ["Tu bois de l'eau.", 'Sen suv ichasan.'],
        ],
      },
      {
        title: "S'il vous plaît — iltimos",
        text: "Buyurtma berishda doim «s'il vous plaît» qo'shing. Do'stlarga «s'il te plaît» deyiladi.",
        examples: [["Un café, s'il vous plaît.", 'Bitta qahva, iltimos.']],
      },
    ],
    lessons: [
      {
        id: 'u3l1',
        title: 'Ichimliklar',
        words: [
          { fr: 'le pain', uz: 'non', emoji: '🍞' },
          { fr: "l'eau", uz: 'suv', emoji: '💧' },
          { fr: 'le lait', uz: 'sut', emoji: '🥛' },
          { fr: 'le thé', uz: 'choy', emoji: '🍵' },
          { fr: 'la pomme', uz: 'olma', emoji: '🍎' },
          { fr: 'je bois', uz: 'men ichaman', emoji: '🥤', alt: ['ichaman'] },
        ],
        sentences: [
          { fr: 'Je bois du thé.', uz: 'Men choy ichaman.', uzAlt: ['Choy ichaman.', 'Men choy ichyapman.'] },
          { fr: "Tu bois de l'eau.", uz: 'Sen suv ichasan.', uzAlt: ['Siz suv ichasiz.', 'Sen suv ichyapsan.'] },
          { fr: 'Le pain et le lait.', uz: 'Non va sut.' },
          { fr: "Une pomme, s'il vous plaît.", uz: 'Bitta olma, iltimos.', uzAlt: ['Bir olma, iltimos.', 'Olma, iltimos.', 'Iltimos, bitta olma.'] },
          { fr: 'Je bois du lait.', uz: 'Men sut ichaman.', uzAlt: ['Sut ichaman.'] },
        ],
      },
      {
        id: 'u3l2',
        title: 'Taomlar',
        words: [
          { fr: 'je mange', uz: 'men yeyman', emoji: '🍽️', alt: ['yeyman'] },
          { fr: 'le café', uz: 'qahva', emoji: '☕', alt: ['kofe'] },
          { fr: 'la viande', uz: "go'sht", emoji: '🥩' },
          { fr: 'le riz', uz: 'guruch', emoji: '🍚', alt: ['palov'] },
          { fr: 'le fromage', uz: 'pishloq', emoji: '🧀' },
          { fr: "s'il vous plaît", uz: 'iltimos', emoji: '🥺' },
        ],
        sentences: [
          { fr: 'Je mange du pain.', uz: 'Men non yeyman.', uzAlt: ['Non yeyman.'] },
          { fr: 'Il mange de la viande.', uz: "U go'sht yeydi.", uzAlt: ["U go'sht yeyapti."] },
          { fr: 'Je mange du riz et de la viande.', uz: "Men guruch va go'sht yeyman.", uzAlt: ["Guruch va go'sht yeyman."] },
          { fr: "Un café, s'il vous plaît.", uz: 'Bitta qahva, iltimos.', uzAlt: ['Bir qahva, iltimos.', 'Qahva, iltimos.', 'Bitta kofe, iltimos.'] },
          { fr: 'Elle aime le fromage.', uz: "U pishloqni yaxshi ko'radi.", uzAlt: ['U pishloqni sevadi.'] },
        ],
      },
      {
        id: 'u3l3',
        title: 'Restoranda',
        words: [
          { fr: 'le restaurant', uz: 'restoran', emoji: '🏮', alt: ['oshxona'] },
          { fr: 'le menu', uz: 'menyu', emoji: '📜' },
          { fr: "l'addition", uz: 'hisob', emoji: '🧾' },
          { fr: 'je voudrais', uz: 'men xohlardim', emoji: '🙋', alt: ['xohlardim', 'istardim'] },
          { fr: 'délicieux', uz: 'mazali', emoji: '😋', alt: ['juda mazali'] },
          { fr: 'la soupe', uz: "sho'rva", emoji: '🍲' },
        ],
        sentences: [
          { fr: 'Je voudrais une soupe.', uz: "Men sho'rva xohlardim.", uzAlt: ["Men bitta sho'rva xohlardim.", "Sho'rva xohlardim.", "Men sho'rva istardim."] },
          { fr: "L'addition, s'il vous plaît.", uz: 'Hisob, iltimos.', uzAlt: ['Hisobni bering, iltimos.', 'Iltimos, hisobni bering.', 'Iltimos, hisob.'] },
          { fr: "C'est délicieux !", uz: 'Bu mazali!', uzAlt: ['Bu juda mazali!', 'Mazali ekan!'] },
          { fr: "Le menu, s'il vous plaît.", uz: 'Menyu, iltimos.', uzAlt: ['Menyuni bering, iltimos.', 'Iltimos, menyuni bering.', 'Iltimos, menyu.'] },
          { fr: 'Je voudrais un thé.', uz: 'Men choy xohlardim.', uzAlt: ['Men bitta choy xohlardim.', 'Choy xohlardim.', 'Men choy istardim.'] },
        ],
      },
    ],
  },
  {
    id: 'u4',
    title: 'Raqamlar va vaqt',
    description: 'Sanash, yosh, soat va hafta kunlari',
    color: '#8B5CF6',
    guide: [
      {
        title: 'Yosh — avoir bilan',
        text: "Fransuzlar yoshni «bor» fe'li bilan aytadi: J'ai dix ans — so'zma-so'z «menda o'n yil bor».",
        examples: [
          ["J'ai dix ans.", "Men o'n yoshdaman."],
          ['Quel âge as-tu ?', 'Necha yoshdasan?'],
        ],
      },
      {
        title: 'Soat',
        text: "Vaqtni «Il est ... heures» bilan aytamiz. So'roq: «Quelle heure est-il ?» — Soat necha?",
        examples: [['Il est huit heures.', 'Soat sakkiz.']],
      },
      {
        title: 'Hafta kunlari',
        text: "Hafta kunlari kichik harf bilan yoziladi. «le lundi» — har dushanba, «lundi» — shu dushanba.",
      },
    ],
    lessons: [
      {
        id: 'u4l1',
        title: '1 dan 6 gacha',
        words: [
          { fr: 'un', uz: 'bir', emoji: '1️⃣', alt: ['bitta'] },
          { fr: 'deux', uz: 'ikki', emoji: '2️⃣', alt: ['ikkita'] },
          { fr: 'trois', uz: 'uch', emoji: '3️⃣', alt: ['uchta'] },
          { fr: 'quatre', uz: "to'rt", emoji: '4️⃣', alt: ["to'rtta"] },
          { fr: 'cinq', uz: 'besh', emoji: '5️⃣', alt: ['beshta'] },
          { fr: 'six', uz: 'olti', emoji: '6️⃣', alt: ['oltita'] },
        ],
        sentences: [
          { fr: "J'ai trois pommes.", uz: 'Menda uchta olma bor.', uzAlt: ['Mening uchta olmam bor.', 'Menda uch olma bor.', 'Uchta olmam bor.'] },
          { fr: 'Un, deux, trois !', uz: 'Bir, ikki, uch!' },
          { fr: "Quatre cafés, s'il vous plaît.", uz: "To'rtta qahva, iltimos.", uzAlt: ["To'rt qahva, iltimos.", "Iltimos, to'rtta qahva."] },
          { fr: 'Il a cinq amis.', uz: "Uning beshta do'sti bor.", uzAlt: ["Uning besh do'sti bor."] },
          { fr: 'Elle a six enfants.', uz: 'Uning oltita farzandi bor.', uzAlt: ['Uning olti farzandi bor.', 'Uning oltita bolasi bor.', 'Uning olti bolasi bor.'] },
        ],
      },
      {
        id: 'u4l2',
        title: 'Necha yoshdasan?',
        words: [
          { fr: 'sept', uz: 'yetti', emoji: '7️⃣', alt: ['yettita'] },
          { fr: 'huit', uz: 'sakkiz', emoji: '8️⃣', alt: ['sakkizta'] },
          { fr: 'neuf', uz: "to'qqiz", emoji: '9️⃣', alt: ["to'qqizta"] },
          { fr: 'dix', uz: "o'n", emoji: '🔟', alt: ["o'nta"] },
          { fr: 'quel âge', uz: 'necha yosh', emoji: '🎂' },
          { fr: 'ans', uz: 'yosh', emoji: '📅', alt: ['yil'] },
        ],
        sentences: [
          { fr: "J'ai dix ans.", uz: "Men o'n yoshdaman.", uzAlt: ["O'n yoshdaman.", "Men o'n yoshman."] },
          { fr: 'Quel âge as-tu ?', uz: 'Necha yoshdasan?', uzAlt: ['Sen necha yoshdasan?', 'Yoshing nechada?', 'Necha yoshdasiz?'] },
          { fr: 'Elle a huit ans.', uz: 'U sakkiz yoshda.' },
          { fr: 'Mon frère a neuf ans.', uz: "Mening ukam to'qqiz yoshda.", uzAlt: ["Ukam to'qqiz yoshda.", "Mening akam to'qqiz yoshda.", "Akam to'qqiz yoshda."] },
          { fr: "J'ai sept amis.", uz: "Mening yettita do'stim bor.", uzAlt: ["Mening yetti do'stim bor.", "Yettita do'stim bor.", "Menda yettita do'st bor."] },
        ],
      },
      {
        id: 'u4l3',
        title: 'Vaqt',
        words: [
          { fr: "aujourd'hui", uz: 'bugun', emoji: '📍' },
          { fr: 'demain', uz: 'ertaga', emoji: '➡️' },
          { fr: 'hier', uz: 'kecha', emoji: '⬅️' },
          { fr: 'le matin', uz: 'ertalab', emoji: '🌅', alt: ['tong'] },
          { fr: 'le soir', uz: 'kechqurun', emoji: '🌆', alt: ['oqshom'] },
          { fr: "l'heure", uz: 'soat', emoji: '⏰', alt: ['vaqt'] },
        ],
        sentences: [
          { fr: 'Quelle heure est-il ?', uz: 'Soat necha?', uzAlt: ['Soat nechchi?', 'Hozir soat necha?'] },
          { fr: 'Il est huit heures.', uz: 'Soat sakkiz.', uzAlt: ['Hozir soat sakkiz.', "Soat sakkiz bo'ldi."] },
          { fr: 'À demain !', uz: 'Ertagacha!', uzAlt: ["Ertaga ko'rishguncha!", "Ertaga ko'rishamiz!"] },
          { fr: "Aujourd'hui, je mange au restaurant.", uz: 'Bugun men restoranda ovqatlanaman.', uzAlt: ['Bugun restoranda ovqatlanaman.', 'Bugun men restoranda ovqat yeyman.'] },
          { fr: 'Le matin, je bois du café.', uz: 'Ertalab men qahva ichaman.', uzAlt: ['Ertalab qahva ichaman.', 'Men ertalab qahva ichaman.'] },
        ],
      },
      {
        id: 'u4l4',
        title: 'Hafta kunlari',
        words: [
          { fr: 'lundi', uz: 'dushanba', emoji: '🗓️' },
          { fr: 'mardi', uz: 'seshanba', emoji: '🗓️' },
          { fr: 'mercredi', uz: 'chorshanba', emoji: '🗓️' },
          { fr: 'jeudi', uz: 'payshanba', emoji: '🗓️' },
          { fr: 'vendredi', uz: 'juma', emoji: '🕌' },
          { fr: 'samedi', uz: 'shanba', emoji: '🎉' },
          { fr: 'dimanche', uz: 'yakshanba', emoji: '🛋️' },
        ],
        sentences: [
          { fr: "Aujourd'hui, c'est lundi.", uz: 'Bugun dushanba.' },
          { fr: "Demain, c'est samedi.", uz: 'Ertaga shanba.' },
          { fr: 'Le dimanche, je mange avec ma famille.', uz: 'Yakshanba kuni men oilam bilan ovqatlanaman.', uzAlt: ['Yakshanba kuni oilam bilan ovqatlanaman.', 'Yakshanbada men oilam bilan ovqatlanaman.'] },
          { fr: "Hier, c'était vendredi.", uz: 'Kecha juma edi.' },
          { fr: 'Mardi et jeudi.', uz: 'Seshanba va payshanba.' },
        ],
      },
    ],
  },
  {
    id: 'u5',
    title: 'Shahar',
    description: "Shahar bo'ylab yurish va transport",
    color: '#10B981',
    guide: [
      {
        title: 'Aller — bormoq',
        text: "je vais (boraman), tu vas (borasan), il/elle va (boradi). «à» predlogi -ga qo'shimchasiga to'g'ri keladi. à + le = au: Je vais au parc.",
        examples: [
          ["Je vais à l'école.", 'Men maktabga boraman.'],
          ['Je vais au parc.', "Men bog'ga boraman."],
        ],
      },
      {
        title: 'Où — qayerda?',
        text: "Joy haqida so'rash uchun «Où est ... ?» — ... qayerda?",
        examples: [['Où est la gare ?', 'Vokzal qayerda?']],
      },
    ],
    lessons: [
      {
        id: 'u5l1',
        title: 'Shaharda',
        words: [
          { fr: 'la maison', uz: 'uy', emoji: '🏠' },
          { fr: "l'école", uz: 'maktab', emoji: '🏫' },
          { fr: 'la rue', uz: "ko'cha", emoji: '🛣️' },
          { fr: 'la ville', uz: 'shahar', emoji: '🏙️' },
          { fr: 'le magasin', uz: "do'kon", emoji: '🏪' },
          { fr: 'la gare', uz: 'vokzal', emoji: '🚉' },
          { fr: 'où', uz: 'qayerda', emoji: '📍', alt: ['qayer'] },
        ],
        sentences: [
          { fr: "C'est ma maison.", uz: 'Bu mening uyim.', uzAlt: ['Bu uyim.'] },
          { fr: "L'école est grande.", uz: 'Maktab katta.' },
          { fr: 'Où est la gare ?', uz: 'Vokzal qayerda?' },
          { fr: 'La ville est belle.', uz: 'Shahar chiroyli.', uzAlt: ["Shahar go'zal."] },
          { fr: 'Où est le magasin ?', uz: "Do'kon qayerda?" },
        ],
      },
      {
        id: 'u5l2',
        title: 'Qayerga borasan?',
        words: [
          { fr: 'je vais', uz: 'men boraman', emoji: '🚶‍➡️', alt: ['boraman'] },
          { fr: 'le parc', uz: "bog'", emoji: '🌳', alt: ['park'] },
          { fr: "l'hôpital", uz: 'kasalxona', emoji: '🏥', alt: ['shifoxona'] },
          { fr: 'la banque', uz: 'bank', emoji: '🏦' },
          { fr: 'à pied', uz: 'piyoda', emoji: '🚶' },
          { fr: 'elle va', uz: 'u boradi', emoji: '🏃‍♀️', alt: ['boradi'] },
        ],
        sentences: [
          { fr: "Je vais à l'école.", uz: 'Men maktabga boraman.', uzAlt: ['Maktabga boraman.', 'Men maktabga ketyapman.'] },
          { fr: 'Je vais au parc à pied.', uz: "Men bog'ga piyoda boraman.", uzAlt: ["Bog'ga piyoda boraman.", 'Men parkka piyoda boraman.', "Men piyoda bog'ga boraman."] },
          { fr: 'Tu vas à la banque ?', uz: 'Sen bankka borasanmi?', uzAlt: ['Bankka borasanmi?', 'Siz bankka borasizmi?'] },
          { fr: "Elle va à l'hôpital.", uz: 'U kasalxonaga boradi.', uzAlt: ['U shifoxonaga boradi.', 'U kasalxonaga ketyapti.'] },
        ],
      },
      {
        id: 'u5l3',
        title: 'Transport',
        words: [
          { fr: 'le bus', uz: 'avtobus', emoji: '🚌' },
          { fr: 'le métro', uz: 'metro', emoji: '🚇' },
          { fr: 'le taxi', uz: 'taksi', emoji: '🚕' },
          { fr: 'la voiture', uz: 'mashina', emoji: '🚗', alt: ['avtomobil'] },
          { fr: 'le train', uz: 'poyezd', emoji: '🚆' },
          { fr: "l'avion", uz: 'samolyot', emoji: '✈️' },
        ],
        sentences: [
          { fr: 'Je prends le bus.', uz: 'Men avtobusga chiqaman.', uzAlt: ['Men avtobusda boraman.', 'Avtobusga chiqaman.', 'Men avtobusda yuraman.'] },
          { fr: 'Le métro est rapide.', uz: 'Metro tez.', uzAlt: ['Metro tez yuradi.'] },
          { fr: 'Mon père a une voiture.', uz: 'Mening otamning mashinasi bor.', uzAlt: ['Otamning mashinasi bor.'] },
          { fr: 'Le train va à Paris.', uz: 'Poyezd Parijga boradi.', uzAlt: ['Poyezd Parijga ketyapti.'] },
          { fr: 'Je vais à Paris en avion.', uz: 'Men Parijga samolyotda boraman.', uzAlt: ['Parijga samolyotda boraman.', 'Men samolyotda Parijga boraman.'] },
        ],
      },
    ],
  },
  {
    id: 'u6',
    title: 'Kundalik hayot',
    description: "Til, ish, o'qish va ob-havo",
    color: '#EC4899',
    guide: [
      {
        title: "Inkor: ne ... pas",
        text: "Fe'lni inkor qilish uchun uni «ne ... pas» orasiga olamiz. Unli oldidan ne → n'.",
        examples: [
          ['Je ne comprends pas.', 'Men tushunmayapman.'],
          ["Je n'ai pas de voiture.", "Mening mashinam yo'q."],
        ],
      },
      {
        title: '-er fe\'llari',
        text: "Ko'p fe'llar -er bilan tugaydi (parler, travailler, aimer). je parle, tu parles, il parle — yozilishi farq qiladi, lekin talaffuzi bir xil!",
      },
      {
        title: 'Ob-havo: il fait',
        text: "Ob-havo haqida «il fait» + sifat: il fait chaud (issiq), il fait froid (sovuq), il fait beau (havo yaxshi). Yomg'ir: il pleut.",
      },
    ],
    lessons: [
      {
        id: 'u6l1',
        title: 'Tillar',
        words: [
          { fr: 'je parle', uz: 'men gapiraman', emoji: '🗣️', alt: ['gapiraman'] },
          { fr: 'le français', uz: 'fransuz tili', emoji: '🇫🇷', alt: ['fransuzcha'] },
          { fr: "l'ouzbek", uz: "o'zbek tili", emoji: '🇺🇿', alt: ["o'zbekcha"] },
          { fr: 'un peu', uz: 'biroz', emoji: '🤏', alt: ['ozgina'] },
          { fr: 'beaucoup', uz: "ko'p", emoji: '💯', alt: ['juda'] },
          { fr: 'je comprends', uz: 'men tushunaman', emoji: '💡', alt: ['tushunaman'] },
        ],
        sentences: [
          { fr: 'Je parle ouzbek.', uz: "Men o'zbekcha gapiraman.", uzAlt: ["Men o'zbek tilida gapiraman.", "O'zbekcha gapiraman."] },
          { fr: 'Je parle un peu français.', uz: 'Men biroz fransuzcha gapiraman.', uzAlt: ['Men ozgina fransuzcha gapiraman.', 'Biroz fransuzcha gapiraman.', 'Men fransuz tilida biroz gapiraman.'] },
          { fr: 'Tu parles français ?', uz: 'Sen fransuzcha gapirasanmi?', uzAlt: ['Fransuzcha gapirasanmi?', 'Siz fransuzcha gapirasizmi?'] },
          { fr: 'Je ne comprends pas.', uz: 'Men tushunmayapman.', uzAlt: ['Tushunmayapman.', 'Men tushunmayman.'] },
          { fr: 'Merci beaucoup !', uz: 'Katta rahmat!', uzAlt: ['Rahmat katta!', 'Juda katta rahmat!'] },
        ],
      },
      {
        id: 'u6l2',
        title: "Ish va o'qish",
        words: [
          { fr: 'je travaille', uz: 'men ishlayman', emoji: '💼', alt: ['ishlayman'] },
          { fr: "j'étudie", uz: "men o'rganaman", emoji: '📚', alt: ["o'qiyman", "o'rganaman"] },
          { fr: 'elle lit', uz: "u o'qiydi", emoji: '👓', alt: ["o'qiydi"] },
          { fr: 'le livre', uz: 'kitob', emoji: '📖' },
          { fr: 'le travail', uz: 'ish', emoji: '🏢' },
          { fr: 'je dors', uz: 'men uxlayman', emoji: '😴', alt: ['uxlayman'] },
        ],
        sentences: [
          { fr: 'Je travaille le matin.', uz: 'Men ertalab ishlayman.', uzAlt: ['Ertalab ishlayman.'] },
          { fr: 'Elle lit un livre.', uz: "U kitob o'qiyapti.", uzAlt: ["U kitob o'qiydi."] },
          { fr: "J'étudie le français.", uz: "Men fransuz tilini o'rganyapman.", uzAlt: ["Men fransuz tilini o'qiyman.", "Fransuz tilini o'rganyapman.", "Men fransuz tilini o'rganaman."] },
          { fr: 'Le soir, je dors.', uz: 'Kechqurun men uxlayman.', uzAlt: ['Kechqurun uxlayman.', 'Men kechqurun uxlayman.'] },
          { fr: "J'aime mon travail.", uz: "Men ishimni yaxshi ko'raman.", uzAlt: ["Ishimni yaxshi ko'raman.", 'Men ishimni sevaman.'] },
        ],
      },
      {
        id: 'u6l3',
        title: 'Ob-havo',
        words: [
          { fr: 'il fait chaud', uz: 'issiq', emoji: '🥵', alt: ['havo issiq'] },
          { fr: 'il fait froid', uz: 'sovuq', emoji: '🥶', alt: ['havo sovuq'] },
          { fr: 'il pleut', uz: "yomg'ir yog'yapti", emoji: '🌧️', alt: ["yomg'ir yog'moqda"] },
          { fr: 'le soleil', uz: 'quyosh', emoji: '☀️' },
          { fr: 'la neige', uz: 'qor', emoji: '❄️' },
          { fr: 'il fait beau', uz: 'havo yaxshi', emoji: '🌤️', alt: ['havo ochiq'] },
        ],
        sentences: [
          { fr: "Aujourd'hui, il fait chaud.", uz: 'Bugun issiq.', uzAlt: ['Bugun havo issiq.'] },
          { fr: 'Il pleut à Paris.', uz: "Parijda yomg'ir yog'yapti.", uzAlt: ["Parijda yomg'ir yog'moqda."] },
          { fr: 'Demain, il va faire froid.', uz: "Ertaga sovuq bo'ladi.", uzAlt: ["Ertaga havo sovuq bo'ladi."] },
          { fr: "Il fait beau aujourd'hui.", uz: 'Bugun havo yaxshi.', uzAlt: ['Bugun havo ochiq.'] },
          { fr: "J'aime la neige.", uz: "Men qorni yaxshi ko'raman.", uzAlt: ["Qorni yaxshi ko'raman.", 'Men qorni sevaman.'] },
        ],
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = COURSE.flatMap((u) => u.lessons);

export function findLesson(id: string): { unit: Unit; lesson: Lesson; index: number } | null {
  for (const unit of COURSE) {
    const index = unit.lessons.findIndex((l) => l.id === id);
    if (index >= 0) return { unit, lesson: unit.lessons[index], index };
  }
  return null;
}
