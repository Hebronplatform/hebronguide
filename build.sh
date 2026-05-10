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
  # 기존 17개 도시
  ["seattle"]="시애틀"       ["dallas"]="달라스"        ["sf"]="샌프란시스코"
  ["newyork"]="뉴욕"         ["nashville"]="내쉬빌"     ["boston"]="보스턴"
  ["la"]="로스앤젤레스"       ["toronto"]="토론토"       ["vancouver"]="밴쿠버"
  ["houston"]="휴스턴"       ["atlanta"]="애틀랜타"     ["kansascity"]="캔자스시티"
  ["philadelphia"]="필라델피아" ["miami"]="마이애미"     ["mexicocity"]="멕시코시티"
  ["guadalajara"]="과달라하라" ["monterrey"]="몬테레이"
  # 북미 확장 Tier A
  ["chicago"]="시카고"        ["dc"]="워싱턴 DC"         ["sandiego"]="샌디에고"
  ["honolulu"]="호놀룰루"     ["portland"]="포틀랜드"    ["denver"]="덴버"
  # 북미 확장 Tier B-C
  ["calgary"]="캘거리"        ["edmonton"]="에드먼턴"    ["ottawa"]="오타와"
  ["winnipeg"]="위니펙"       ["phoenix"]="피닉스"       ["charlotte"]="샬럿"
  ["raleigh"]="롤리"          ["columbus"]="콜럼버스"    ["minneapolis"]="미니애폴리스"
  ["tucson"]="투손"           ["fayetteville"]="페이엣빌" ["killeen"]="킬린"
  ["anchorage"]="앵커리지"
  # 국제 확장 Tier A
  ["sydney"]="시드니"         ["melbourne"]="멜버른"     ["brisbane"]="브리즈번"
  ["perth"]="퍼스"            ["auckland"]="오클랜드"    ["saopaulo"]="상파울루"
  ["london"]="런던"
  # 국제 확장 Tier B-C
  ["singapore"]="싱가포르"    ["bangkok"]="방콕"         ["hochiminh"]="호치민"
  ["dubai"]="두바이"          ["frankfurt"]="프랑크푸르트" ["berlin"]="베를린"
  ["paris"]="파리"
)
declare -A CITY_EN=(
  # 기존 17개 도시
  ["seattle"]="Seattle"       ["dallas"]="Dallas"          ["sf"]="San Francisco"
  ["newyork"]="New York"      ["nashville"]="Nashville"    ["boston"]="Boston"
  ["la"]="Los Angeles"        ["toronto"]="Toronto"        ["vancouver"]="Vancouver"
  ["houston"]="Houston"       ["atlanta"]="Atlanta"        ["kansascity"]="Kansas City"
  ["philadelphia"]="Philadelphia" ["miami"]="Miami"        ["mexicocity"]="Mexico City"
  ["guadalajara"]="Guadalajara"   ["monterrey"]="Monterrey"
  # 북미 확장 Tier A
  ["chicago"]="Chicago"       ["dc"]="Washington DC"       ["sandiego"]="San Diego"
  ["honolulu"]="Honolulu"     ["portland"]="Portland"      ["denver"]="Denver"
  # 북미 확장 Tier B-C
  ["calgary"]="Calgary"       ["edmonton"]="Edmonton"      ["ottawa"]="Ottawa"
  ["winnipeg"]="Winnipeg"     ["phoenix"]="Phoenix"        ["charlotte"]="Charlotte"
  ["raleigh"]="Raleigh"       ["columbus"]="Columbus"      ["minneapolis"]="Minneapolis"
  ["tucson"]="Tucson"         ["fayetteville"]="Fayetteville" ["killeen"]="Killeen"
  ["anchorage"]="Anchorage"
  # 국제 확장 Tier A
  ["sydney"]="Sydney"         ["melbourne"]="Melbourne"    ["brisbane"]="Brisbane"
  ["perth"]="Perth"           ["auckland"]="Auckland"      ["saopaulo"]="Sao Paulo"
  ["london"]="London"
  # 국제 확장 Tier B-C
  ["singapore"]="Singapore"   ["bangkok"]="Bangkok"        ["hochiminh"]="Ho Chi Minh City"
  ["dubai"]="Dubai"           ["frankfurt"]="Frankfurt"    ["berlin"]="Berlin"
  ["paris"]="Paris"
)

# 4. 도시별 배포 (미리 빌드된 dist/ 사용 + index.html 메타데이터 치환)
# og:updated_time — 매 배포마다 타임스탬프 갱신 → KakaoTalk·Slack·iMessage 캐시 무효화
# 카카오는 이 값이 바뀌면 자동 재크롤하므로 44개+ 도시 글로벌 확장 시에도 캐시 문제 없음
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "--- Deploying to cities (with city-specific SEO, build_time=$BUILD_TIME) ---"
for city in \
  seattle dallas sf newyork nashville boston la toronto vancouver houston atlanta \
  kansascity philadelphia miami mexicocity guadalajara monterrey \
  chicago dc sandiego honolulu portland denver \
  calgary edmonton ottawa winnipeg phoenix charlotte raleigh columbus minneapolis \
  tucson fayetteville killeen anchorage \
  sydney melbourne brisbane perth auckland saopaulo london \
  singapore bangkok hochiminh dubai frankfurt berlin paris; do
  mkdir -p public/$city
  cp -r hebronguide/dist/* public/$city/

  KO="${CITY_KO[$city]}"
  EN="${CITY_EN[$city]}"

  # 도시별 메타데이터 치환 (sed) — title·OG·Twitter·canonical·hreflang 모두 처리
  # 주의: JS 번들 경로(/seattle/assets/...)는 상대경로라 도메인 기반 치환에 영향 없음
  sed -i.bak \
    -e "s#<title>시애틀 한인 정착 가이드#<title>${KO} 한인 정착 가이드#g" \
    -e "s#HebronGuide Seattle</title>#HebronGuide ${EN}</title>#g" \
    -e "s#시애틀 한인 이민자·유학생·이주자를 위한#${KO} 한인 이민자·유학생·이주자를 위한#g" \
    -e "s#HebronGuide Seattle 2026#HebronGuide ${EN} 2026#g" \
    -e "s#HebronGuide 시애틀 — 시애틀 한인 정착·생활·교회 완전 가이드#HebronGuide ${KO} — ${KO} 한인 정착·생활·교회 완전 가이드#g" \
    -e "s#HebronGuide 시애틀 — 한인 정착·교회·맛집 가이드#HebronGuide ${KO} — 한인 정착·교회·맛집 가이드#g" \
    -e "s#시애틀 한인 16.5만이 검증한 정착 가이드. 시애틀지구촌교회가 운영하는 신뢰할 수 있는 한인 커뮤니티 플랫폼.#${KO} 한인 커뮤니티를 위한 정착 가이드. HebronGuide가 운영하는 신뢰할 수 있는 한인 플랫폼.#g" \
    -e "s#시애틀 한인 16.5만이 검증한 정착 가이드. 시애틀지구촌교회 운영.#${KO} 한인 커뮤니티 정착 가이드. HebronGuide 운영.#g" \
    -e "s#시애틀 한인 가이드#${KO} 한인 가이드#g" \
    -e "s#\"HebronGuide 시애틀\"#\"HebronGuide ${KO}\"#g" \
    -e "s#hebronguide.com/seattle/#hebronguide.com/${city}/#g" \
    -e "s#</head>#  <meta property=\"og:updated_time\" content=\"${BUILD_TIME}\" />\n  <meta name=\"build-city\" content=\"${city}\" />\n</head>#" \
    public/$city/index.html
  rm -f public/$city/index.html.bak

  echo "  OK: $city → ${KO} (${EN})"
done

# 5. 루트 공유 파일
cp hebronguide/dist/registerSW.js       public/registerSW.js       2>/dev/null || true
cp hebronguide/dist/manifest.webmanifest public/manifest.webmanifest 2>/dev/null || true
cp hebronguide/dist/ad-request.html     public/ad-request.html     2>/dev/null || true
cp hebronguide/dist/posters.html        public/posters.html        2>/dev/null || true

# 6. API 함수는 Vercel이 자동 라우팅 (hebronguide/api/*.js → /api/*)

echo "=== Deploy Complete — 44 cities with city-specific SEO (계속 성장 중) ==="
ls public/
