"""Hook bilan boshlanadigan reels (1080x1920). Birinchi 1.5 soniyada katta, harakatli hook. python3 make_reels_v2.py <skrinshotlar> <chiqish>"""
import math, os, subprocess, sys, tempfile
SHOTS, OUT = sys.argv[1], sys.argv[2]
sys.argv = [sys.argv[0], SHOTS, tempfile.mkdtemp()]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, "/home/user/multfilm-studio/tools/side-reel")
import make_kit as K
from PIL import Image, ImageDraw, ImageChops
from side_reel import sfx_track, write_wav
W, H, FPS = 1080, 1920, 30
RED, YEL = (255, 92, 108), (255, 214, 64)
ease = lambda t: (lambda u: u * u * (3 - 2 * u))(max(0.0, min(1.0, t)))
BG = K.bg(W, H)

def base(brand=True):
    im = BG.copy(); d = ImageDraw.Draw(im)
    if brand: K.brand(im, d, 110)
    return im, d

def txt(im, text, font, y, t, delay=0.0, grad=False, fill=K.INK, scale_in=False):
    a = ease((t - delay) / 0.3)
    if a <= 0: return
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    yy = y + int((1 - a) * 50)
    if grad:
        g = Image.new("RGB", (W, H)); K.gtext(g, (W // 2, yy), text, font, anchor="mm")
        m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).text((W // 2, yy), text, font=font, fill=int(255 * a), anchor="mm")
        im.paste(g, (0, 0), m)
    else:
        ld.text((W // 2, yy), text, font=font, fill=fill + (int(255 * a),), anchor="mm", stroke_width=0)
        im.paste(layer, (0, 0), layer)

def shake(im, t, start, power=22):
    u = t - start
    if 0 <= u < .35:
        a = power * math.exp(-8 * u); return ImageChops.offset(im, int(a * math.sin(u * 90)), int(a * math.cos(u * 70)))
    return im

def bar(im, t, dur):  # pastdagi progress chizig'i — oxirigacha ko'rishga undaydi
    d = ImageDraw.Draw(im); d.rectangle([0, H - 14, int(W * min(1, t / dur)), H], fill=(124, 139, 255))

def render(name, scenes, events):
    total = sum(s[0] for s in scenes); tmp = tempfile.mkdtemp(); vid = f"{tmp}/v.mp4"
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", vid], stdin=subprocess.PIPE)
    t0 = 0.0
    for dur, fn in scenes:
        for f in range(int(dur * FPS)):
            im = fn(f / FPS, dur); bar(im, t0 + f / FPS, total); ff.stdin.write(im.convert("RGB").tobytes())
        t0 += dur
    ff.stdin.close(); ff.wait()
    wav = f"{tmp}/a.wav"; write_wav(wav, sfx_track(total, events) * 0.9)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-i", wav, "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-14:TP=-1.5", "-shortest", f"{OUT}/{name}.mp4"], check=True)
    print(name, round(total, 1), "s")

def cuts_of(scenes):
    c = [0.0]
    for d, _ in scenes: c.append(c[-1] + d)
    return c
os.makedirs(OUT, exist_ok=True)

# ---------- A) Hook: xato
def a_hook(t, dur):
    im, d = base(False)
    d.rounded_rectangle([90, 520, 990, 640], radius=30, fill=RED); d.text((540, 580), "TO'XTANG!", font=K.lat(90), fill=(20, 16, 30), anchor="mm")
    txt(im, "Koreysga «annyeong»", K.lat(96), 820, t, .05); txt(im, "demang", K.lat(120), 950, t, .15, grad=True)
    txt(im, "...agar u sizdan katta bo'lsa", K.lat(60, 600), 1100, t, .45, fill=K.MUTED)
    return shake(im, t, 0, 30)
def a_word(n, ko, rom, who, color):
    def fn(t, dur):
        im, d = base(); d.text((540, 380), f"{n}/3", font=K.lat(64), fill=K.MUTED, anchor="mm")
        txt(im, ko, K.kor(150), 760, t, grad=True); txt(im, rom, K.lat(64, 600), 920, t, .2, fill=K.MUTED)
        w = d.textlength(who, font=K.lat(62)) + 80
        if t > .45: d.rounded_rectangle([540 - w / 2, 1040, 540 + w / 2, 1150], radius=55, fill=color)
        txt(im, who, K.lat(62), 1095, t, .45, fill=(16, 22, 46))
        return im
    return fn
def a_point(t, dur):
    im, d = base(); txt(im, "TOPIK'da, ishda", K.lat(96), 820, t); txt(im, "va intervyuda", K.lat(96), 940, t, .15)
    txt(im, "aynan shu farq tekshiriladi", K.lat(70, 600), 1080, t, .35, fill=YEL); return im
def a_cta(t, dur):
    im, d = base(); K.logo(im, W // 2, 640, 240)
    txt(im, "AI ustoz bunday xatolarni", K.lat(74), 900, t); txt(im, "darhol tuzatadi", K.lat(92), 1010, t, .15, grad=True)
    txt(im, "22-dekabr · havola bio'da", K.lat(60, 600), 1150, t, .35, fill=K.MUTED); return im
sc = [(2.4, a_hook), (2.8, a_word(1, "안녕", "annyeong", "faqat do'st va tengdoshga", (94, 231, 208))),
      (2.8, a_word(2, "안녕하세요", "annyeonghaseyo", "hammaga, har kuni", (124, 139, 255))),
      (2.8, a_word(3, "안녕하십니까", "annyeonghasimnikka", "rasmiy: ish, imtihon", (192, 139, 255))), (2.4, a_point), (3.0, a_cta)]
c = cuts_of(sc)
render("reel-A-annyeong", sc, [("thud", .03, .9), ("ding", .05, 880, .25)] + [("whoosh", x, .45, .45) for x in c[1:-1]] + [("pop", x + .5) for x in c[1:4]] + [("ding", c[-2] + .2, 1568, .3)])

# ---------- B) Hook: Koreyada birinchi kun
WORDS = [("안녕하세요", "annyeonghaseyo", "Salom"), ("감사합니다", "gamsahamnida", "Rahmat"), ("얼마예요?", "eolmayeyo?", "Qancha turadi?"),
         ("화장실 어디예요?", "hwajangsil eodiyeyo?", "Hojatxona qayerda?"), ("천천히 말해 주세요", "cheoncheonhi malhae juseyo", "Sekinroq gapiring")]
def b_hook(t, dur):
    im, d = base(False)
    txt(im, "Koreyada birinchi kuni", K.lat(88), 760, t, .0); txt(im, "shu 5 iborasiz", K.lat(118), 890, t, .12, grad=True)
    txt(im, "qiynalasiz", K.lat(118), 1020, t, .24, fill=RED); txt(im, "oxirgisi eng muhimi", K.lat(56, 600), 1170, t, .5, fill=K.MUTED)
    return shake(im, t, .24, 24)
def b_word(i, ko, rom, uz):
    def fn(t, dur):
        im, d = base(); d.text((540, 380), f"{i}/5", font=K.lat(64), fill=K.MUTED, anchor="mm")
        f = K.kor(150 if len(ko) <= 6 else 104); txt(im, ko, f, 780, t, grad=True); txt(im, rom, K.lat(58, 600), 930, t, .2, fill=K.MUTED)
        txt(im, uz, K.lat(100), 1080, t, .45); return im
    return fn
def b_cta(t, dur):
    im, d = base(); txt(im, "Saqlab qo'ying", K.lat(100), 800, t, grad=True); txt(im, "va safarga oling", K.lat(80), 920, t, .15)
    txt(im, "Ko'proq — Go Topic ilovasida", K.lat(60, 600), 1080, t, .35, fill=K.MUTED); txt(im, "22-dekabr · havola bio'da", K.lat(56, 600), 1160, t, .5, fill=K.MUTED); return im
sc = [(2.4, b_hook)] + [(2.6, b_word(i, *w)) for i, w in enumerate(WORDS, 1)] + [(3.0, b_cta)]
c = cuts_of(sc)
render("reel-B-5-ibora", sc, [("thud", .27, .8)] + [("whoosh", x, .45, .4) for x in c[1:-1]] + [("pop", x + .5) for x in c[1:-2]] + [("ding", c[-2] + .2, 1320, .25)])

# ---------- C) Hook: telefoningizda ustoz
def c_hook(t, dur):
    im, d = base(False)
    txt(im, "Telefoningizda", K.lat(100), 760, t); txt(im, "koreyscha gaplashadigan", K.lat(84), 880, t, .12)
    txt(im, "ustoz bo'lsa-chi?", K.lat(118), 1010, t, .24, grad=True); return shake(im, t, .24, 18)
def c_phone(key, label, sub):
    def fn(t, dur):
        im, d = base(); txt(im, label, K.lat(92), 330, t, grad=True); txt(im, sub, K.lat(52, 600), 430, t, .15, fill=K.MUTED)
        if t > .1: K.phone(im, key, W // 2, 540 + int((1 - ease((t - .1) / .45)) * 380), 540)
        return im
    return fn
def c_date(t, dur):
    im, d = base(); txt(im, "22-dekabr", K.lat(190), 860, t, grad=True); txt(im, "Play Market'da", K.lat(90), 1040, t, .25)
    txt(im, "Bepul darslar · o'zbek tilida", K.lat(56, 600), 1170, t, .45, fill=K.MUTED); return shake(im, t, 0, 14)
def c_cta(t, dur):
    im, d = base(); K.logo(im, W // 2, 660, 240); txt(im, "Navbatga yoziling", K.lat(100), 960, t, grad=True)
    txt(im, "chiqqan kuni birinchi bilasiz", K.lat(60, 600), 1080, t, .2, fill=K.MUTED); txt(im, "havola bio'da", K.lat(64), 1170, t, .4, fill=YEL); return im
sc = [(2.4, c_hook), (2.6, c_phone("suhbat", "AI ustoz", "gapirasiz — xatoni tuzatadi")), (2.4, c_phone("sozlar", "30 000 so'z", "TOPIK darajasi bo'yicha")),
      (2.4, c_phone("alifbo", "Hangeul", "harfni bosing — eshiting")), (2.6, c_date), (3.0, c_cta)]
c = cuts_of(sc)
render("reel-C-ustoz", sc, [("thud", .27, .7)] + [("whoosh", x, .5, .45) for x in c[1:-1]] + [("pop", x + .1) for x in c[1:4]] + [("ding", c[4] + .1, 1568, .3)])
