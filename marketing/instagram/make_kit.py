"""Go Topic Instagram to'plami: profil rasmi, highlight muqovalari, 9 ta post (4:5), story savollari.
python3 make_kit.py <skrinshotlar papkasi> <chiqish papkasi>"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SHOTS, OUT = sys.argv[1], sys.argv[2]
FD = "/home/user/multfilm-studio/tools/side-reel/fonts/"
NAVY, INK, MUTED = (11, 16, 36), (238, 241, 251), (169, 177, 207)
G = [(94, 231, 208), (124, 139, 255), (192, 139, 255)]
for d in ("posts", "highlights", "stories"): os.makedirs(f"{OUT}/{d}", exist_ok=True)

def lat(size, w=800):
    f = ImageFont.truetype(FD + "Baloo2[wght].ttf", size)
    try: f.set_variation_by_axes([w])
    except Exception: pass
    return f
def kor(size, w="800"): return ImageFont.truetype(FD + f"NotoSansKR-{w}.ttf", size)

def grad(w, h, cols=G, angle=20):
    img = Image.new("RGB", (w, h)); px = img.load()
    a = math.radians(angle); ca, sa = math.cos(a), math.sin(a); L = abs(w * ca) + abs(h * sa)
    for y in range(h):
        for x in range(0, w, 2):
            t = min(1, max(0, (x * ca + y * sa) / L)); k = t * (len(cols) - 1); i = min(int(k), len(cols) - 2); u = k - i
            c = tuple(int(cols[i][j] + (cols[i + 1][j] - cols[i][j]) * u) for j in range(3)); px[x, y] = c
            if x + 1 < w: px[x + 1, y] = c
    return img

def bg(w, h):
    img = Image.new("RGB", (w, h), NAVY)
    glow = Image.new("RGB", (w, h), (0, 0, 0)); d = ImageDraw.Draw(glow)
    d.ellipse([-w * .4, -h * .25, w * .7, h * .45], fill=(70, 70, 170)); d.ellipse([w * .45, h * .05, w * 1.4, h * .7], fill=(30, 120, 120))
    d.ellipse([-w * .2, h * .7, w * .8, h * 1.3], fill=(80, 40, 130))
    glow = glow.filter(ImageFilter.GaussianBlur(w // 5))
    return Image.blend(img, Image.eval(glow, lambda v: v), .55)

def gtext(img, xy, text, font, anchor="la"):
    """Gradient to'ldirilgan matn."""
    m = Image.new("L", img.size, 0); ImageDraw.Draw(m).text(xy, text, font=font, fill=255, anchor=anchor)
    box = m.getbbox();
    if not box: return
    g = grad(box[2] - box[0], box[3] - box[1]); img.paste(g, box[:2], m.crop(box))

def wrap(d, text, font, width):
    out, line = [], ""
    for w in text.split():
        t = (line + " " + w).strip()
        if d.textlength(t, font=font) <= width: line = t
        else: out.append(line); line = w
    out.append(line); return out

def para(d, x, y, text, font, width, fill=INK, gap=1.18):
    for ln in wrap(d, text, font, width):
        d.text((x, y), ln, font=font, fill=fill); y += int(font.size * gap)
    return y

def phone(img, shot, cx, top, width):
    s = Image.open(f"{SHOTS}/shot-{shot}.png").convert("RGB"); h = int(width * s.height / s.width)
    s = s.resize((width, h), Image.LANCZOS)
    r = int(width * .11); pad = int(width * .035)
    frame = Image.new("RGBA", (width + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); fd = ImageDraw.Draw(frame)
    fd.rounded_rectangle([0, 0, frame.width - 1, frame.height - 1], radius=r + pad, fill=(20, 24, 44, 255), outline=(90, 100, 150, 255), width=3)
    m = Image.new("L", s.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, width - 1, h - 1], radius=r, fill=255)
    frame.paste(s, (pad, pad), m)
    sh = Image.new("RGBA", (frame.width + 120, frame.height + 120), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([60, 80, frame.width + 60, frame.height + 60], radius=r + pad, fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(28)); x = cx - frame.width // 2
    img.paste(sh, (x - 60, top - 50), sh); img.paste(frame, (x, top), frame)

def chip(d, x, y, text, font, fill=(255, 255, 255, 30)):
    w = d.textlength(text, font=font) + 44
    d.rounded_rectangle([x, y, x + w, y + font.size + 26], radius=(font.size + 26) // 2, fill=(40, 50, 90), outline=(110, 120, 190), width=2)
    d.text((x + 22, y + 9), text, font=font, fill=INK); return x + w + 14

def logo(img, cx, cy, size):
    g = grad(size, size, angle=35); m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * .28), fill=255)
    img.paste(g, (cx - size // 2, cy - size // 2), m)
    ImageDraw.Draw(img).text((cx, cy + int(size * .02)), "한", font=kor(int(size * .62)), fill=(16, 22, 46), anchor="mm")

def brand(img, d, y=70):
    logo(img, 110, y + 36, 72); d.text((165, y + 34), "Go Topic", font=lat(46), fill=INK, anchor="lm")

def foot(d, w, h, text="22-dekabr · Play Market"):
    d.text((w // 2, h - 70), text, font=lat(36, 600), fill=MUTED, anchor="mm")

# ---------- profil rasmi
p = Image.new("RGB", (1080, 1080), NAVY); p.paste(grad(1080, 1080, angle=35))
ImageDraw.Draw(p).text((540, 530), "한", font=kor(600), fill=(16, 22, 46), anchor="mm")
p.save(f"{OUT}/profile.png")

# ---------- highlight muqovalari (story 1080x1920, markazda belgi)
HL = [("ilova", "📱", "Ilova", "앱"), ("topik", "T", "TOPIK", "토픽"), ("sozlar", "가", "So'zlar", "단어"), ("savollar", "?", "Savollar", "질문"), ("navbat", "22", "Navbat", "대기")]
for key, _, label, ko in HL:
    im = Image.new("RGB", (1080, 1920), NAVY); im.paste(grad(1080, 1920, angle=60)); d = ImageDraw.Draw(im)
    d.ellipse([240, 660, 840, 1260], fill=(16, 22, 46))
    sym = {"ilova": "앱", "topik": "T", "sozlar": "가", "savollar": "?", "navbat": "22"}[key]
    f = kor(300) if sym in ("앱", "가") else lat(330)
    gtext(im, (540, 965), sym, f, anchor="mm")
    im.save(f"{OUT}/highlights/{key}.png")

# ---------- postlar (1080x1350)
W, H = 1080, 1350
def post(name, fn):
    im = bg(W, H); d = ImageDraw.Draw(im); brand(im, d); fn(im, d); im.save(f"{OUT}/posts/{name}.png", quality=95)

def p1(im, d):
    d.text((80, 200), "Play Market'da", font=lat(64, 700), fill=MUTED)
    gtext(im, (74, 270), "22-dekabr", lat(108))
    para(d, 80, 430, "Koreys tilini AI ustoz bilan o'rganadigan ilova. O'zbek, rus va ingliz tilida.", lat(44, 500), 500, MUTED)
    phone(im, "bosh", 820, 200, 400); foot(d, W, H, "Navbatga yoziling — havola bio'da")
def p2(im, d):
    d.text((80, 190), "AI ustoz", font=lat(60, 700), fill=MUTED)
    y = para(d, 80, 260, "Koreyscha gapiring — u javob beradi va xatoingizni tuzatadi", lat(62), 500)
    for i, t in enumerate(["Kafeda", "Do'konda", "Tanishuv", "Yo'l so'rash"]): chip(d, 80, y + 30 + i * 84, t, lat(36, 600))
    phone(im, "suhbat", 830, 210, 390); foot(d, W, H)
def p3(im, d):
    d.text((80, 190), "Noldan imtihongacha", font=lat(60, 700), fill=MUTED)
    gtext(im, (74, 250), "TOPIK 1 → 6", lat(140))
    steps = ["1 · Alifbo va salomlashish", "2 · Kundalik suhbat", "3 · Ish va o'qish mavzulari", "4 · Gazeta va yangiliklar", "5 · Rasmiy nutq", "6 · Ilmiy matnlar"]
    for i, t in enumerate(steps):
        y = 480 + i * 118; d.rounded_rectangle([80, y, 1000, y + 96], radius=30, fill=(28, 36, 72), outline=(100, 112, 190), width=2)
        d.text((120, y + 48), t, font=lat(44, 600), fill=INK, anchor="lm")
    foot(d, W, H)
def p4(im, d):
    gtext(im, (74, 200), "30 000", lat(140))
    d.text((80, 420), "so'zli lug'at", font=lat(70), fill=INK)
    para(d, 80, 520, "Kartochkalar, talaffuz va TOPIK darajasi bo'yicha so'zlar.", lat(44, 500), 520, MUTED)
    phone(im, "sozlar", 830, 200, 390); foot(d, W, H)
def p5(im, d):
    d.text((80, 200), "Savol", font=lat(60, 700), fill=MUTED)
    gtext(im, (540, 470), "안녕하세요", kor(150), anchor="mm")
    d.text((540, 600), "nimani anglatadi?", font=lat(70), fill=INK, anchor="mm")
    for i, t in enumerate(["A) Xayr", "B) Salom", "C) Rahmat"]):
        y = 720 + i * 150; d.rounded_rectangle([140, y, 940, y + 120], radius=40, fill=(28, 36, 72), outline=(110, 122, 200), width=3)
        d.text((540, y + 60), t, font=lat(56, 700), fill=INK, anchor="mm")
    foot(d, W, H, "Javobni izohda yozing")
def p6(im, d):
    d.text((80, 190), "Hangeul", font=lat(60, 700), fill=MUTED)
    y = para(d, 80, 260, "Koreys alifbosini bir kunda o'qishni o'rganish mumkin", lat(58), 500)
    d.text((80, y + 30), "14 undosh · 10 unli", font=lat(48, 700), fill=G[0])
    gtext(im, (80, y + 110), "ㄱ ㄴ ㄷ ㅏ ㅗ", kor(96))
    phone(im, "alifbo", 830, 210, 390); foot(d, W, H)
def p7(im, d):
    d.text((80, 190), "Har hafta", font=lat(60, 700), fill=MUTED)
    gtext(im, (74, 250), "Liga", lat(170))
    para(d, 80, 470, "Do'stlaringiz bilan bellashing: Bronzadan Olmosgacha 6 liga.", lat(46, 500), 520, MUTED)
    cols = [(205, 127, 70), (190, 198, 210), (240, 200, 90), (80, 200, 150), (230, 90, 120), (120, 190, 240)]
    for i, (c, n) in enumerate(zip(cols, ["Bronza", "Kumush", "Oltin", "Zumrad", "Yoqut", "Olmos"])):
        x, y = 120 + (i % 3) * 290, 760 + (i // 3) * 250
        d.polygon([(x + 70, y), (x + 140, y + 30), (x + 140, y + 110), (x + 70, y + 170), (x, y + 110), (x, y + 30)], fill=c)
        d.text((x + 70, y + 85), str(i + 1), font=lat(70), fill=(20, 24, 44), anchor="mm"); d.text((x + 70, y + 205), n, font=lat(36, 600), fill=INK, anchor="mm")
    foot(d, W, H)
def p8(im, d):
    d.text((80, 200), "Kun so'zi", font=lat(60, 700), fill=MUTED)
    gtext(im, (540, 560), "사랑", kor(330), anchor="mm")
    d.text((540, 790), "sarang", font=lat(64, 600), fill=MUTED, anchor="mm")
    d.text((540, 900), "sevgi", font=lat(110), fill=INK, anchor="mm")
    d.text((540, 1050), "사랑해요 — sizni sevaman", font=kor(52, "400"), fill=MUTED, anchor="mm")
    foot(d, W, H, "Saqlab qo'ying")
def p9(im, d):
    gtext(im, (74, 200), "Navbatga", lat(150)); d.text((80, 390), "yoziling", font=lat(150), fill=INK)
    para(d, 80, 620, "Ilova chiqqan kuni birinchi bo'lib xabar oling. Bio'dagi havola orqali 30 soniyada.", lat(50, 500), 900, MUTED)
    d.rounded_rectangle([80, 880, 1000, 1030], radius=60, fill=(16, 22, 46)); gtext(im, (540, 955), "gotopic → waitlist", lat(64), anchor="mm")
    foot(d, W, H)
for i, fn in enumerate([p1, p2, p3, p4, p5, p6, p7, p8, p9], 1): post(f"{i:02d}", fn)

# ---------- story savollari (stiker uchun pastda bo'sh joy)
QS = ["Koreys tilini nima uchun o'rganmoqchisiz?", "Hangeul'ni o'qiy olasizmi?", "Qaysi K-drama sizni koreys tiliga qiziqtirgan?", "TOPIK'ni qachon topshirmoqchisiz?", "Kuniga necha daqiqa o'qishga tayyorsiz?", "AI bilan koreyscha gaplashib ko'rganmisiz?"]
for i, q in enumerate(QS, 1):
    im = bg(1080, 1920); d = ImageDraw.Draw(im); brand(im, d, 120)
    gtext(im, (90, 420), "Savol", lat(90))
    para(d, 90, 560, q, lat(92), 900)
    d.rounded_rectangle([90, 1180, 990, 1560], radius=50, outline=(110, 122, 200), width=4)
    d.text((540, 1370), "Bu yerga savol yoki so'rovnoma stikerini qo'ying", font=lat(36, 500), fill=MUTED, anchor="mm")
    im.save(f"{OUT}/stories/savol-{i:02d}.png")
print("kit ok")
