"""Ikki reels (1080x1920, 30fps): teaser va "5 ta koreyscha so'z". python3 make_reels.py <skrinshotlar> <chiqish>"""
import math, os, subprocess, sys, tempfile
SHOTS, OUT = sys.argv[1], sys.argv[2]
sys.argv = [sys.argv[0], SHOTS, tempfile.mkdtemp()]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, "/home/user/multfilm-studio/tools/side-reel")
import make_kit as K  # yordamchi chizish funksiyalari
from PIL import Image, ImageDraw
from side_reel import sfx_track, write_wav

W, H, FPS = 1080, 1920, 30
ease = lambda t: (lambda u: u * u * (3 - 2 * u))(max(0.0, min(1.0, t)))
BG = K.bg(W, H)

def base():
    im = BG.copy(); d = ImageDraw.Draw(im); K.brand(im, d, 110); return im, d

def pop_text(im, text, font, y, t, grad=False, fill=K.INK):
    """Matn pastdan ko'tarilib, shaffoflikdan chiqadi."""
    a = ease(t / 0.35); layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    yy = y + int((1 - a) * 60)
    if grad:
        tmp = Image.new("RGB", (W, H), (0, 0, 0)); K.gtext(tmp, (W // 2, yy), text, font, anchor="mm")
        m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).text((W // 2, yy), text, font=font, fill=int(255 * a), anchor="mm")
        im.paste(tmp, (0, 0), m)
    else:
        ld.text((W // 2, yy), text, font=font, fill=fill + (int(255 * a),), anchor="mm"); im.alpha_composite(layer) if im.mode == "RGBA" else im.paste(layer, (0, 0), layer)

def render(name, scenes, events):
    total = sum(s[0] for s in scenes); tmp = tempfile.mkdtemp(); vid = f"{tmp}/v.mp4"
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", vid], stdin=subprocess.PIPE)
    t0 = 0.0
    for dur, fn in scenes:
        for f in range(int(dur * FPS)):
            im = fn(f / FPS, dur); ff.stdin.write(im.convert("RGB").tobytes())
        t0 += dur
    ff.stdin.close(); ff.wait()
    wav = f"{tmp}/a.wav"; write_wav(wav, sfx_track(total, events) * 0.9)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-i", wav, "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-15:TP=-1.5", "-shortest", f"{OUT}/{name}.mp4"], check=True)
    print(name, round(total, 1), "s")

os.makedirs(OUT, exist_ok=True)

# ---------- 1) teaser
shots = {k: Image.open(f"{SHOTS}/shot-{k}.png").convert("RGB") for k in ("bosh", "suhbat", "sozlar")}
def s_hook(t, dur):
    im, d = base(); pop_text(im, "Koreys tilini", K.lat(110), 760, t); pop_text(im, "o'rganmoqchimisiz?", K.lat(110), 890, t - 0.25, grad=True)
    return im
def s_phone(key, label):
    def fn(t, dur):
        im, d = base(); pop_text(im, label, K.lat(96), 380, t, grad=True)
        tmp = Image.new("RGB", (W, H)); tmp.paste(im)
        K.SHOTS = SHOTS; K.phone(tmp, key, W // 2, 520 + int((1 - ease(t / .4)) * 300), 560)
        return tmp
    return fn
def s_date(t, dur):
    im, d = base(); pop_text(im, "22-dekabr", K.lat(190), 860, t, grad=True); pop_text(im, "Play Market'da", K.lat(90), 1040, t - .3)
    return im
def s_cta(t, dur):
    im, d = base(); K.logo(im, W // 2, 700, 260); pop_text(im, "Navbatga yoziling", K.lat(100), 1000, t, grad=True)
    pop_text(im, "havola bio'da", K.lat(70, 600), 1120, t - .3, fill=K.MUTED); return im
scenes = [(2.6, s_hook), (2.4, s_phone("bosh", "Koreys tili · TOPIK 1–6")), (2.4, s_phone("suhbat", "AI ustoz")), (2.4, s_phone("sozlar", "30 000 so'z")), (2.8, s_date), (3.0, s_cta)]
cuts = [0]; [cuts.append(cuts[-1] + d) for d, _ in scenes]
render("reel-01-teaser", scenes, [("thud", 0.05, .6)] + [("whoosh", c, .5, .45) for c in cuts[1:-1]] + [("pop", c + .05) for c in cuts[:-1]] + [("ding", cuts[4] + .1, 1568, .3)])

# ---------- 2) 5 ta koreyscha so'z
WORDS = [("안녕하세요", "annyeonghaseyo", "Assalomu alaykum"), ("감사합니다", "gamsahamnida", "Rahmat"), ("괜찮아요", "gwaenchanayo", "Hechqisi yo'q"),
         ("사랑해요", "saranghaeyo", "Sizni sevaman"), ("화이팅", "hwaiting", "Omad! Olg'a!")]
def s_intro(t, dur):
    im, d = base(); pop_text(im, "Har kuni kerak bo'ladigan", K.lat(80, 700), 780, t, fill=K.MUTED); pop_text(im, "5 ta koreyscha so'z", K.lat(110), 900, t - .2, grad=True); return im
def s_word(i, ko, rom, uz):
    def fn(t, dur):
        im, d = base(); d.text((W // 2, 360), f"{i}/5", font=K.lat(70), fill=K.MUTED, anchor="mm")
        pop_text(im, ko, K.kor(200), 820, t, grad=True); pop_text(im, rom, K.lat(70, 600), 1010, t - .25, fill=K.MUTED)
        pop_text(im, uz, K.lat(110), 1170, t - .55); return im
    return fn
def s_end(t, dur):
    im, d = base(); pop_text(im, "Ko'proq so'zlar —", K.lat(90), 820, t); pop_text(im, "Go Topic ilovasida", K.lat(100), 940, t - .2, grad=True)
    pop_text(im, "22-dekabr · havola bio'da", K.lat(64, 600), 1080, t - .4, fill=K.MUTED); return im
scenes = [(2.2, s_intro)] + [(2.8, s_word(i, *w)) for i, w in enumerate(WORDS, 1)] + [(3.0, s_end)]
cuts = [0]; [cuts.append(cuts[-1] + d) for d, _ in scenes]
render("reel-02-5-soz", scenes, [("whoosh", c, .45, .4) for c in cuts[1:-1]] + [("pop", c + .6) for c in cuts[1:-2]] + [("ding", cuts[-2] + .2, 1320, .25)])
