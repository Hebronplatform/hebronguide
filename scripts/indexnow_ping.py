"""IndexNow로 검색엔진(빙 · 네이버 · 얀덱스 등)에 바뀐 쪽을 바로 알린다 (웹 노출 정본 2-A, 2026-11-07).
열쇠 파일 <열쇠>.txt (build.sh가 public/에 복사) 가 사이트(www.hebronguide.com/<열쇠>.txt)에 먼저 올라가 있어야 한다.

사용 (배포한 뒤에):
  python indexnow_ping.py                  사이트맵(sitemap.xml)의 모든 쪽
  python indexnow_ping.py / /seattle/     바뀐 쪽만
  (Git Bash에서는 MSYS_NO_PATHCONV=1 을 앞에 붙인다 — 안 붙이면 "/"가 윈도 폴더 주소로 바뀌어 422가 난다)
"""
import json, re, sys, urllib.error, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
SITE = "https://www.hebronguide.com"
KEY = "98e730ad7206b7185b7b6eb16d313b3e"
urls = ([SITE + u for u in sys.argv[1:]] if len(sys.argv) > 1
        else re.findall(r"<loc>(.*?)</loc>", (HERE.parent / "sitemap.xml").read_text(encoding="utf-8")))
body = json.dumps({"host": "www.hebronguide.com", "key": KEY,
                   "keyLocation": f"{SITE}/{KEY}.txt", "urlList": urls[:10000]}).encode()
for ep in ["https://api.indexnow.org/indexnow", "https://searchadvisor.naver.com/indexnow"]:
    req = urllib.request.Request(ep, data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(ep, r.status, len(urls), "urls")
    except urllib.error.HTTPError as e:
        print(ep, "HTTP", e.code, e.read()[:200])
    except Exception as e:
        print(ep, "error", e)
