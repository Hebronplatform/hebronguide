from PIL import Image, ImageDraw, ImageFont

FONT_SANS_REGULAR = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
FONT_SANS_BOLD    = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
FONT_SERIF_BOLD   = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"
LOGO_PATH = "/sessions/serene-jolly-maxwell/mnt/uploads/icon-512.png"

NAVY   = (26, 45, 100)
GOLD   = (196, 155, 40)
WHITE  = (255, 255, 255)
SILVER = (190, 200, 220)

# ── 1. 타이틀 배너 (1080×180) ──────────────────────────
W, H = 1080, 180
img = Image.new("RGB", (W, H), NAVY)
draw = ImageDraw.Draw(img)

for y in range(H):
    ratio = y / H
    r = int(26 + 9 * ratio)
    g = int(45 + 15 * ratio)
    b = int(100 + 30 * ratio)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

logo = Image.open(LOGO_PATH).convert("RGBA")
logo = logo.resize((140, 140), Image.LANCZOS)
img.paste(logo, (40, 20), logo)

draw.rectangle([200, 30, 203, 150], fill=GOLD)

f_title = ImageFont.truetype(FONT_SERIF_BOLD, 44)
draw.text((220, 28), "HebronGuide", font=f_title, fill=WHITE)

f_sub = ImageFont.truetype(FONT_SANS_REGULAR, 22)
draw.text((222, 82), "글로벌 환대 가이드", font=f_sub, fill=SILVER)

f_tag = ImageFont.truetype(FONT_SANS_REGULAR, 15)
draw.text((222, 118), "Connecting Koreans Worldwide  |  2030년 500개 도시를 향해", font=f_tag, fill=(150, 170, 210))

f_url = ImageFont.truetype(FONT_SANS_REGULAR, 14)
draw.text((880, 158), "hebronguide.com", font=f_url, fill=(120, 150, 200))

draw.rectangle([(0, H-4), (W, H)], fill=GOLD)
img.save("/sessions/serene-jolly-maxwell/mnt/outputs/hebronguide_title_1080.png")
print("타이틀 1080px 완료")

# ── 2. 카페 대문 (1080×340) ───────────────────────────
W2, H2 = 1080, 340
img2 = Image.new("RGB", (W2, H2), NAVY)
draw2 = ImageDraw.Draw(img2)

for y in range(H2):
    ratio = y / H2
    r = int(26 + 15 * ratio)
    g = int(45 + 20 * ratio)
    b = int(100 + 40 * ratio)
    draw2.line([(0, y), (W2, y)], fill=(r, g, b))

draw2.ellipse([(750, -80), (1150, 300)], outline=(80, 100, 160), width=2)
draw2.ellipse([(780, -50), (1120, 270)], outline=GOLD, width=1)

logo2 = Image.open(LOGO_PATH).convert("RGBA")
logo2 = logo2.resize((200, 200), Image.LANCZOS)
img2.paste(logo2, (80, 70), logo2)

f_main = ImageFont.truetype(FONT_SERIF_BOLD, 56)
draw2.text((330, 50), "HebronGuide", font=f_main, fill=WHITE)

draw2.rectangle([(330, 118), (730, 122)], fill=GOLD)

f_kor = ImageFont.truetype(FONT_SANS_BOLD, 28)
draw2.text((330, 128), "글로벌 환대 가이드", font=f_kor, fill=SILVER)

f_vis = ImageFont.truetype(FONT_SANS_REGULAR, 20)
draw2.text((330, 172), "낯선 땅에서 혼자이지 않도록", font=f_vis, fill=(180, 195, 230))

f_smb = ImageFont.truetype(FONT_SANS_BOLD, 14)
f_sm  = ImageFont.truetype(FONT_SANS_REGULAR, 14)

draw2.rounded_rectangle([(330, 215), (570, 272)], radius=8, outline=GOLD, width=1)
draw2.text((350, 224), "현재 상태", font=f_smb, fill=GOLD)
draw2.text((350, 245), "전 세계 도시 운영 중", font=f_sm, fill=SILVER)

draw2.rounded_rectangle([(585, 215), (825, 272)], radius=8, outline=GOLD, width=1)
draw2.text((600, 224), "2030 비전", font=f_smb, fill=GOLD)
draw2.text((600, 245), "500개 도시 · 글로벌 확장", font=f_sm, fill=SILVER)

draw2.rectangle([(0, H2-5), (W2, H2)], fill=GOLD)
draw2.text((330, H2-28), "cafe.naver.com/hebronguide  |  hebronguide.com",
           font=f_sm, fill=(150, 170, 210))

img2.save("/sessions/serene-jolly-maxwell/mnt/outputs/hebronguide_door_1080.png")
print("대문 1080px 완료")
