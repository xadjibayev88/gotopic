"""Go Topic logotip va bannerlar. python3 make_brand.py <skrinshotlar> <chiqish>"""
import os, sys, tempfile
SHOTS, OUT = sys.argv[1], sys.argv[2]
sys.argv = [sys.argv[0], SHOTS, tempfile.mkdtemp()]
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_kit as K
from PIL import Image, ImageDraw
os.makedirs(OUT, exist_ok=True)

def wordmark(h, dark_text):
    """Belgi + "Go Topic" yozuvi, shaffof fon."""
    f = K.lat(int(h * .62), 800); tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    tw = int(tmp.textlength("Go Topic", font=f)); gap = int(h * .28)
    im = Image.new("RGBA", (h + gap + tw + int(h * .1), h), (0, 0, 0, 0))
    K.logo(im, h // 2, h // 2, h)
    d = ImageDraw.Draw(im); y = h // 2 + int(h * .04)
    d.text((h + gap, y), "Go ", font=f, fill=dark_text, anchor="lm")
    gx = h + gap + int(d.textlength("Go ", font=f))
    m = Image.new("L", im.size, 0); ImageDraw.Draw(m).text((gx, y), "Topic", font=f, fill=255, anchor="lm")
    box = m.getbbox(); g = K.grad(box[2] - box[0], box[3] - box[1]).convert("RGBA"); im.paste(g, box[:2], m.crop(box))
    return im

# logotiplar
wordmark(400, (238, 241, 251)).save(f"{OUT}/logo-gorizontal-ok.png")       # qorong'i fon uchun
wordmark(400, (21, 26, 51)).save(f"{OUT}/logo-gorizontal-qora.png")       # oq fon uchun
sq = Image.new("RGB", (1080, 1080), K.NAVY); sq.paste(K.bg(1080, 1080)); K.logo(sq, 540, 440, 420)
d = ImageDraw.Draw(sq); d.text((540, 790), "Go ", font=K.lat(150), fill=K.INK, anchor="rm")
K.gtext(sq, (540, 790), "Topic", K.lat(150), anchor="lm"); d.text((540, 920), "Koreys tili · AI ustoz", font=K.lat(52, 600), fill=K.MUTED, anchor="mm")
sq.save(f"{OUT}/logo-kvadrat.png")
icon = Image.new("RGBA", (512, 512), (0, 0, 0, 0)); K.logo(icon, 256, 256, 512); icon.save(f"{OUT}/ikonka-512.png")

def banner(w, h, path, phone=True):
    im = K.bg(w, h); d = ImageDraw.Draw(im); s = h / 500
    wm = wordmark(int(70 * s), K.INK); im.paste(wm, (int(50 * s), int(40 * s)), wm)
    x = int(52 * s)
    d.text((x, int(150 * s)), "Koreys tilini", font=K.lat(int(64 * s)), fill=K.INK)
    K.gtext(im, (x, int(222 * s)), "AI ustoz bilan", K.lat(int(64 * s)))
    d.text((x, int(296 * s)), "o'rganing", font=K.lat(int(64 * s)), fill=K.INK)
    cx = x
    for t in ("TOPIK 1–6", "30 000 so'z", "O'zbek tilida"):
        f = K.lat(int(26 * s), 700); tw = d.textlength(t, font=f) + 36 * s
        d.rounded_rectangle([cx, int(400 * s), cx + tw, int(448 * s)], radius=int(24 * s), fill=(34, 44, 86), outline=(110, 122, 200), width=max(1, int(2 * s)))
        d.text((cx + 18 * s, int(424 * s)), t, font=f, fill=K.INK, anchor="lm"); cx += tw + 12 * s
    if phone:
        narrow = w < h * 2.2 and w > h * 1.5
        K.phone(im, "suhbat", int(w - (175 if narrow else 210) * s), int(40 * s), int((190 if narrow else 230) * s))
    if w > h * 2.4:  # keng bannerda Play belgisi joyi
        d.text((int(w - 470 * s), int(250 * s)), "22-dekabr", font=K.lat(int(54 * s)), fill=K.INK, anchor="rm")
        d.text((int(w - 470 * s), int(305 * s)), "Play Market'da", font=K.lat(int(32 * s), 600), fill=K.MUTED, anchor="rm")
    im.save(path)

banner(1024, 500, f"{OUT}/banner-play-market-1024x500.png")          # Play Market "Feature graphic"
banner(1500, 500, f"{OUT}/banner-keng-1500x500.png")                 # sayt, Telegram kanal, X
banner(1920, 1080, f"{OUT}/banner-youtube-1920x1080.png")
print("brand ok")
