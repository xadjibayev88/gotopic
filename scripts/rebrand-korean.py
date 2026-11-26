#!/usr/bin/env python3
"""Voilà (fransuz tili) → Go Topic (koreys tili) matnlarini almashtiradi: interfeys, server promptlari,
bot, i18n lug'atlari (kalit va qiymatlar). Kod identifikatorlariga (ViviWalker, frVoice…) tegmaydi.
Bir marta ishlatiladi; qayta ishga tushirish xavfsiz (idempotent)."""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# O'zbekcha (manba) almashtirishlar — tartib muhim (uzunroq iboralar oldin).
UZ = [
    (r"Voilà!", "Go Topic"), (r"Voilà", "Go Topic"),
    (r"\bVivining\b", "Horining"), (r"\bVivi(?![A-Za-z_])", "Hori"),
    (r"mushukchasi", "yo'lbarschasi"), (r"mushukcha", "yo'lbarscha"), (r"mushuk", "yo'lbars"),
    (r"Fransuzchani", "Koreyschani"), (r"fransuzchani", "koreyschani"),
    (r"Fransuzcha", "Koreyscha"), (r"fransuzcha", "koreyscha"),
    (r"Fransuz", "Koreys"), (r"fransuz", "koreys"),
    (r"Fransiyaga", "Koreyaga"), (r"Fransiyada", "Koreyada"), (r"Fransiya", "Koreya"),
    (r"Parijlik", "Seullik"), (r"parijlik", "seullik"), (r"Parijdagi", "Seuldagi"), (r"Parijga", "Seulga"), (r"Parijda", "Seulda"), (r"Parij", "Seul"),
    (r"Eyfel minorasi", "Namsan minorasi"), (r"Kruassan", "Tteokbokki"),
    (r"DELF A1 og'zaki mashqini", "TOPIK gapirish mashqini"), (r"DELF", "TOPIK"),
    (r"🇫🇷", "🇰🇷"),
]

# Fransuzcha namunaviy iboralar → koreyscha.
PHRASES = [
    ("Salut ! Bienvenue !", "안녕하세요! 환영해요!"),
    ("Merci !", "감사합니다!"), ("Félicitations !", "축하해요!"),
    ("Je m'appelle Ali 😊", "저는 알리예요 😊"), ("Enchantée, Ali ! Tu viens d'où ?", "반가워요, 알리 씨! 어디에서 왔어요?"),
    ("«Je m'appelle ...»", "«저는 ...예요»"),
]

LANG = {
    'en': [("French", "Korean"), ("France", "Korea"), ("Paris", "Seoul"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("kitten", "tiger cub"), ("cat", "tiger cub")],
    'ru': [("французск", "корейск"), ("Французск", "Корейск"), ("Франци", "Коре"), ("Париж", "Сеул"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("котёнок", "тигрёнок"), ("котик", "тигрёнок"), ("кошка", "тигрёнок")],
    'kk': [("француз", "корей"), ("Француз", "Корей"), ("Франция", "Корея"), ("Париж", "Сеул"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("мысық", "жолбарыс")],
    'ky': [("француз", "корей"), ("Француз", "Корей"), ("Франция", "Корея"), ("Париж", "Сеул"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("мышык", "жолборс")],
    'tg': [("фаронсавӣ", "кореягӣ"), ("Фаронсавӣ", "Кореягӣ"), ("фаронсав", "корея"), ("Фаронса", "Корея"), ("Париж", "Сеул"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("гурба", "палангча")],
    'tr': [("Fransızca", "Korece"), ("fransızca", "korece"), ("Fransız", "Koreli"), ("Fransa", "Kore"), ("Paris", "Seul"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("kedi", "kaplan yavrusu")],
    'zh': [("法语", "韩语"), ("法國", "韩国"), ("法国", "韩国"), ("巴黎", "首尔"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("小猫", "小老虎"), ("猫咪", "小老虎")],
    'hi': [("फ्रेंच", "कोरियाई"), ("फ़्रेंच", "कोरियाई"), ("फ्रांसीसी", "कोरियाई"), ("फ़्रांसीसी", "कोरियाई"), ("फ्रांस", "कोरिया"), ("फ़्रांस", "कोरिया"), ("पेरिस", "सियोल"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("बिल्ली", "बाघ का बच्चा")],
    'ko': [("프랑스어", "한국어"), ("프랑스", "한국"), ("파리의", "서울의"), ("파리에서", "서울에서"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("고양이", "아기 호랑이")],
    'ja': [("フランス語", "韓国語"), ("フランス", "韓国"), ("パリ", "ソウル"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("子猫", "子トラ"), ("ネコ", "子トラ"), ("猫", "子トラ")],
    'id': [("bahasa Prancis", "bahasa Korea"), ("Bahasa Prancis", "Bahasa Korea"), ("Prancis", "Korea"), ("Paris", "Seoul"), ("Voilà!", "Go Topic"), ("Voilà", "Go Topic"), ("Vivi", "Hori"), ("kucing", "anak harimau")],
}

def uz_sub(s: str) -> str:
    for a, b in PHRASES:
        s = s.replace(a, b)
    for a, b in UZ:
        s = re.sub(a, b, s)
    return s

# 1) Kod fayllari: faqat satr/JSX matnlari ichida almashtirish xavfsiz bo'lishi uchun identifikatorlarni himoyalaymiz.
CODE = [p for p in glob.glob(os.path.join(ROOT, 'src', '**', '*.ts*'), recursive=True) + glob.glob(os.path.join(ROOT, 'server', '**', '*.ts'), recursive=True)
        if not p.endswith('src/data/course.ts')]
CODE += [os.path.join(ROOT, 'index.html')] + glob.glob(os.path.join(ROOT, 'public', '*.html')) + glob.glob(os.path.join(ROOT, 'public', '*.webmanifest')) + glob.glob(os.path.join(ROOT, 'public', '*.json'))
changed = 0
for p in CODE:
    if not os.path.exists(p):
        continue
    src = open(p, encoding='utf-8').read()
    out = uz_sub(src)
    if out != src:
        open(p, 'w', encoding='utf-8').write(out)
        changed += 1
print('kod fayllari:', changed)

# 2) i18n: kalitlar (o'zbekcha manba) + har tilning qiymatlari.
loc = os.path.join(ROOT, 'src', 'i18n', 'locales')
for f in sorted(os.listdir(loc)):
    lang = f[:-5]
    d = json.load(open(os.path.join(loc, f), encoding='utf-8'))
    nd = {}
    for k, v in d.items():
        nk = uz_sub(k)
        nv = v
        for a, b in PHRASES:
            nv = nv.replace(a, b)
        for a, b in LANG.get(lang, []):
            nv = nv.replace(a, b)
        nv = nv.replace('🇫🇷', '🇰🇷')
        nd[nk] = nv
    open(os.path.join(loc, f), 'w', encoding='utf-8').write(json.dumps(nd, ensure_ascii=False, indent=1) + '\n')
src_json = os.path.join(ROOT, 'src', 'i18n', 'source.json')
if os.path.exists(src_json):
    s = json.load(open(src_json, encoding='utf-8'))
    json.dump([uz_sub(x) for x in s], open(src_json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('i18n tayyor')
