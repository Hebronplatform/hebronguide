import qrcode
from qrcode.constants import ERROR_CORRECT_H
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

QR_TARGETS = [
    ("qr_main.png",    "https://hebronguide.com"),
    ("qr_partner.png", "https://hebronguide.com/ad-request.html"),
    ("qr_kakao.png",   "https://pf.kakao.com/_dxdxlbX"),
    ("qr_seattle.png", "https://hebronguide.com/seattle/"),
    ("qr_la.png",      "https://hebronguide.com/la/"),
    ("qr_dallas.png",  "https://hebronguide.com/dallas/"),
]

FILL_COLOR  = "#1a1a2e"   # dark navy
BACK_COLOR  = "white"

def make_qr(filename, url):
    qr = qrcode.QRCode(
        version=1,
        error_correction=ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color=FILL_COLOR, back_color=BACK_COLOR)

    # Resize to 400x400 with high-quality resampling
    from PIL import Image
    img = img.convert("RGB")
    img = img.resize((400, 400), Image.LANCZOS)

    out_path = os.path.join(OUTPUT_DIR, filename)
    img.save(out_path, "PNG", optimize=True)
    print(f"  [OK] {filename}  ({url})")
    return out_path

if __name__ == "__main__":
    print("Generating HebronGuide QR codes...")
    for fname, url in QR_TARGETS:
        make_qr(fname, url)
    print(f"\nAll 6 QR codes saved to:\n  {OUTPUT_DIR}")
