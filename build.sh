#!/bin/bash
# HebronGuide 빌드 스크립트 — Vercel 자동 실행
# dist/는 로컬에서 미리 빌드 후 git에 포함 → Vercel은 복사만 수행
# 각 도시 index.html의 title·description을 도시별로 자동 치환 (SEO + UX)
set -e

echo "=== HebronGuide Deploy Start ==="

# 1. public 초기화
rm -rf public && mkdir -p public

# 2. 루트 정적 파일
cp robots.txt    public/robots.txt
cp sitemap.xml   public/sitemap.xml
cp llms.txt      public/llms.txt
cp icon-192.png  public/icon-192.png
cp icon-512.png  public/icon-512.png
cp icon-192.png  public/apple-touch-icon.png
cp icon-192.png  public/apple-touch-icon-precomposed.png

# 3. 도시별 메타데이터 정의 (한국어명·영어명·주/지역)
declare -A CITY_KO=(
  ["seattle"]="시애틀"     ["dallas"]="달라스"      ["sf"]="샌프란시스코"
  ["newyork"]="뉴욕"       ["nashville"]="내쉬빌"   ["boston"]="보스턴"
  ["la"]="로스앤젤레스"     ["toronto"]="토론토"     ["vancouver"]="밴쿠버"
  ["houston"]="휴스턴"     ["atlanta"]="애틀랜타"   ["kansascity"]="캔자스시티"
  ["philadelphia"]="필라델피아" ["miami"]="마이애미" ["mexicocity"]="멕시코시티"
  ["guadalajara"]="과달라하라"  ["monterrey"]="몬테레이"
)
declare -A CITY_EN=(
  ["seattle"]="Seattle"    ["dallas"]="Dallas"      ["sf"]="San Francisco"
  ["newyork"]="New York"   ["nashville"]="Nashville" ["boston"]="Boston"
  ["la"]="Los Angeles"     ["toronto"]="Toronto"    ["vancouver"]="Vancouver"
  ["houston"]="Houston"    ["atlanta"]="Atlanta"    ["kansascity"]="Kansas City"
  ["philadelphia"]="Philadelphia" ["miami"]="Miami" ["mexicocity"]="Mexico City"
  ["guadalajara"]="Guadalajara"   ["monterrey"]="Monterrey"
)

# 4. 도시별 배포 (미리 빌드된 dist/ 사용 + index.html 메타데이터 치환)
echo "--- Deploying to cities (with city-specific SEO) ---"
for city in seattle dallas sf newyork nashville boston la toronto vancouver houston atlanta kansascity philadelphia miami mexicocity guadalajara monterrey; do
  mkdir -p public/$city
  cp -r hebronguide/dist/* public/$city/

  KO="${CITY_KO[$city]}"
  EN="${CITY_EN[$city]}"

  # 도시별 title·description 치환 (sed) — 구분자 # 사용 (title 내 | 충돌 방지)
  sed -i.bak \
    -e "s#<title>시애틀 한인 정착 가이드#<title>${KO} 한인 정착 가이드#g" \
    -e "s#HebronGuide Seattle</title>#HebronGuide ${EN}</title>#g" \
    -e "s#시애틀 한인 이민자·유학생·이주자를 위한#${KO} 한인 이민자·유학생·이주자를 위한#g" \
    -e "s#HebronGuide Seattle 2026#HebronGuide ${EN} 2026#g" \
    public/$city/index.html
  rm -f public/$city/index.html.bak

  echo "  OK: $city → ${KO} (${EN})"
done

# 5. 루트 공유 파일
cp hebronguide/dist/registerSW.js       public/registerSW.js       2>/dev/null || true
cp hebronguide/dist/manifest.webmanifest public/manifest.webmanifest 2>/dev/null || true
cp hebronguide/dist/ad-request.html     public/ad-request.html     2>/dev/null || true

# 6. API 함수는 Vercel이 자동 라우팅 (hebronguide/api/*.js → /api/*)

echo "=== Deploy Complete — 17 cities with city-specific SEO ==="
ls public/
