#!/bin/bash
# HebronGuide 빌드 스크립트 — Vercel 자동 실행
# Vercel 환경: React 앱 직접 빌드 → 항상 최신 해시 일관 배포 (검정 화면 방지)
# 로컬 환경:   기존 dist/ 재사용 (빠른 테스트)
set -e

echo "=== HebronGuide Deploy Start ==="

# ── 도시 수 자동 동기화 (명령 실행 불필요 — 배포할 때마다 자동) ──
# 실제 HEBRON_CITIES의 status:"live" 개수를 세어
# hg-config.js·index.html·HebronGuide.tsx·city-planner.js·ad-request.html을 통일.
# React 빌드 '전에' 실행해야 최신 숫자로 빌드·복사됨. 실패해도 배포는 계속.
echo "--- 도시 수 자동 동기화 ---"
node scripts/update-city-count.js || echo "  ⚠️ city-count 동기화 건너뜀 (빌드 계속)"

# 0. React 앱 빌드 (Vercel에서만 실행 — $VERCEL=1 자동 설정됨)
# 이유: 로컬에서 빌드 후 커밋하면 JS 해시가 배포마다 바뀌어
#       Vercel CDN 전파 중 일부 노드가 이전 파일을 서비스 → 검정 화면 발생
#       Vercel에서 직접 빌드하면 모든 에셋이 한 번에 원자적으로 배포됨
if [ "$VERCEL" = "1" ]; then
  echo "--- [Vercel] React 앱 빌드 시작 ---"
  cd hebronguide
  npm install --no-audit 2>&1 | tail -2
  npm run build 2>&1 | tail -5
  cd ..
  echo "--- [Vercel] React 앱 빌드 완료 ---"
fi

# 1. public 초기화
rm -rf public && mkdir -p public

# 2. 루트 정적 파일
cp index.html    public/index.html
cp robots.txt    public/robots.txt
cp sitemap.xml   public/sitemap.xml
cp llms.txt      public/llms.txt
cp icon-192.png  public/icon-192.png
cp icon-512.png  public/icon-512.png
cp icon-192.png  public/apple-touch-icon.png
cp icon-192.png  public/apple-touch-icon-precomposed.png
cp manifest.json public/manifest.json
cp hebronguide/dist/hebronguide-logo.svg public/hebronguide-logo.svg
cp worldcup.json public/worldcup.json   2>/dev/null || true

# 3. 도시별 메타데이터 정의 (한국어명·영어명·주/지역)
declare -A CITY_KO=(
  # 기존 17개 도시
  ["seattle"]="시애틀"       ["federalway"]="훼더럴웨이"  ["dallas"]="달라스"        ["sf"]="샌프란시스코"
  ["newyork"]="뉴욕"         ["nashville"]="내쉬빌"     ["boston"]="보스턴"
  ["la"]="로스앤젤레스"       ["toronto"]="토론토"       ["vancouver"]="밴쿠버"
  ["houston"]="휴스턴"       ["atlanta"]="애틀랜타"     ["kansascity"]="캔자스시티"
  ["philadelphia"]="필라델피아" ["miami"]="마이애미"     ["mexicocity"]="멕시코시티"
  ["guadalajara"]="과달라하라" ["monterrey"]="몬테레이"  ["bogota"]="보고타"
  # 북미 확장 Tier A
  ["chicago"]="시카고"        ["dc"]="워싱턴 DC"         ["sandiego"]="샌디에고"
  ["honolulu"]="호놀룰루"     ["portland"]="포틀랜드"    ["denver"]="덴버"
  # 북미 확장 Tier B-C
  ["calgary"]="캘거리"        ["edmonton"]="에드먼턴"    ["ottawa"]="오타와"
  ["winnipeg"]="위니펙"       ["phoenix"]="피닉스"       ["charlotte"]="샬럿"
  ["raleigh"]="롤리"          ["columbus"]="콜럼버스"    ["minneapolis"]="미니애폴리스"
  ["tucson"]="투손"           ["fayetteville"]="페이엣빌" ["killeen"]="킬린"
  ["fairfield"]="페어필드"    ["waynesville"]="웨인즈빌"
  ["louisville"]="루이빌"     ["anchorage"]="앵커리지"
  ["tampa"]="탬파"
  ["orlando"]="올랜도"        ["maryland"]="메릴랜드"   ["princgeorge"]="프린스조지"   ["virginia"]="버지니아"   ["neworleans"]="뉴올리언스"
  ["inlandempire"]="인랜드 엠파이어" ["austin"]="오스틴"
  # 한국 신규
  ["bundang"]="분당·수지"
  # 국제 확장 Tier A
  ["sydney"]="시드니"         ["melbourne"]="멜버른"     ["brisbane"]="브리즈번"
  ["perth"]="퍼스"            ["auckland"]="오클랜드"    ["saopaulo"]="상파울루"
  ["london"]="런던"
  # 국제 확장 Tier B-C
  ["singapore"]="싱가포르"    ["bangkok"]="방콕"         ["hochiminh"]="호치민"
  ["dubai"]="두바이"          ["frankfurt"]="프랑크푸르트" ["berlin"]="베를린"
  ["paris"]="파리"
  # 일본 (신규)
  ["tokyo"]="도쿄"           ["osaka"]="오사카"
  # 한국 (역이민·방문 동포)
  ["seoul"]="서울"           ["busan"]="부산"
  ["changwon"]="창원"        ["cheonan"]="천안·아산"
)
declare -A CITY_EN=(
  # 기존 17개 도시
  ["seattle"]="Seattle"       ["federalway"]="Federal Way"  ["dallas"]="Dallas"          ["sf"]="San Francisco"
  ["newyork"]="New York"      ["nashville"]="Nashville"    ["boston"]="Boston"
  ["la"]="Los Angeles"        ["toronto"]="Toronto"        ["vancouver"]="Vancouver"
  ["houston"]="Houston"       ["atlanta"]="Atlanta"        ["kansascity"]="Kansas City"
  ["philadelphia"]="Philadelphia" ["miami"]="Miami"        ["orangecounty"]="Orange County"
  ["mexicocity"]="Mexico City"
  ["guadalajara"]="Guadalajara"   ["monterrey"]="Monterrey"  ["bogota"]="Bogota"
  # 북미 확장 Tier A
  ["chicago"]="Chicago"       ["dc"]="Washington DC"       ["sandiego"]="San Diego"
  ["honolulu"]="Honolulu"     ["portland"]="Portland"      ["denver"]="Denver"
  # 북미 확장 Tier B-C
  ["calgary"]="Calgary"       ["edmonton"]="Edmonton"      ["ottawa"]="Ottawa"
  ["winnipeg"]="Winnipeg"     ["phoenix"]="Phoenix"        ["charlotte"]="Charlotte"
  ["raleigh"]="Raleigh"       ["columbus"]="Columbus"      ["minneapolis"]="Minneapolis"
  ["tucson"]="Tucson"         ["fayetteville"]="Fayetteville" ["killeen"]="Killeen"
  ["fairfield"]="Fairfield"   ["waynesville"]="Waynesville"
  ["louisville"]="Louisville" ["anchorage"]="Anchorage"
  ["tampa"]="Tampa"
  ["orlando"]="Orlando"       ["maryland"]="Maryland"    ["princgeorge"]="Prince George"   ["virginia"]="Virginia"   ["neworleans"]="New Orleans"
  ["inlandempire"]="Inland Empire" ["austin"]="Austin"
  ["bundang"]="분당·수지"
  # 국제 확장 Tier A
  ["sydney"]="Sydney"         ["melbourne"]="Melbourne"    ["brisbane"]="Brisbane"
  ["perth"]="Perth"           ["auckland"]="Auckland"      ["saopaulo"]="Sao Paulo"
  ["london"]="London"
  # 국제 확장 Tier B-C
  ["singapore"]="Singapore"   ["bangkok"]="Bangkok"        ["hochiminh"]="Ho Chi Minh City"
  ["dubai"]="Dubai"           ["frankfurt"]="Frankfurt"    ["berlin"]="Berlin"
  ["paris"]="Paris"
  # 일본 (신규)
  ["tokyo"]="Tokyo"          ["osaka"]="Osaka"
  # 한국 (역이민·이주·정착)
  ["seoul"]="Seoul"          ["busan"]="Busan"
  ["ansan"]="안산"           ["incheon"]="인천"
  ["jeju"]="제주"            ["daegu"]="대구"
  ["gwangju"]="광주"         ["daejeon"]="대전"
  ["changwon"]="창원"        ["cheonan"]="천안·아산"
)

# 4. dist/ 정리 — city 서브디렉토리 잔재 제거 (assets/, data/ 제외)
# 이전 빌드나 실수로 dist/seattle/ 등이 생기면 모든 도시에 불필요한 서브폴더가 복사되는 문제 방지
find hebronguide/dist -maxdepth 1 -mindepth 1 -type d ! -name assets ! -name data -exec rm -rf {} + 2>/dev/null || true
echo "  OK: dist/ 서브디렉토리 정리 완료"

# 5. 도시별 배포 (미리 빌드된 dist/ 사용 + index.html 메타데이터 치환)
# og:updated_time — 매 배포마다 타임스탬프 갱신 → KakaoTalk·Slack·iMessage 캐시 무효화
# 카카오는 이 값이 바뀌면 자동 재크롤하므로 44개+ 도시 글로벌 확장 시에도 캐시 문제 없음
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "--- Deploying to cities (with city-specific SEO, build_time=$BUILD_TIME) ---"
for city in \
  seattle federalway dallas sf newyork nashville boston la toronto vancouver houston atlanta \
  kansascity philadelphia miami orangecounty mexicocity guadalajara monterrey bogota \
  chicago dc sandiego honolulu portland denver \
  calgary edmonton ottawa winnipeg phoenix charlotte raleigh columbus minneapolis \
  tucson fayetteville killeen fairfield waynesville louisville anchorage princgeorge inlandempire austin \
  tampa \
  sydney melbourne brisbane perth auckland saopaulo london \
  singapore bangkok hochiminh dubai frankfurt berlin paris \
  tokyo osaka \
  seoul busan ansan incheon jeju daegu gwangju daejeon changwon cheonan bundang \
  orlando maryland virginia neworleans; do
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
    -e "s#시애틀 한인 16.5만이 검증한 정착 가이드. Hebron Platform이 운영하는 신뢰할 수 있는 한인 커뮤니티 플랫폼.#${KO} 한인 커뮤니티를 위한 정착 가이드. HebronGuide가 운영하는 신뢰할 수 있는 한인 플랫폼.#g" \
    -e "s#시애틀 한인 16.5만이 검증한 정착 가이드. Hebron Platform 운영.#${KO} 한인 커뮤니티 정착 가이드. HebronGuide 운영.#g" \
    -e "s#시애틀 한인 가이드#${KO} 한인 가이드#g" \
    -e "s#\"HebronGuide 시애틀\"#\"HebronGuide ${KO}\"#g" \
    -e "s#hebronguide.com/seattle/#hebronguide.com/${city}/#g" \
    -e "s#</head>#  <meta property=\"og:updated_time\" content=\"${BUILD_TIME}\" />\n  <meta name=\"build-city\" content=\"${city}\" />\n</head>#" \
    public/$city/index.html
  rm -f public/$city/index.html.bak

  echo "  OK: $city → ${KO} (${EN})"
done

# 5. 루트 공유 파일
cp hebronguide/dist/registerSW.js                  public/registerSW.js                  2>/dev/null || true
cp hebronguide/dist/manifest.webmanifest            public/manifest.webmanifest            2>/dev/null || true
cp hebronguide/dist/ad-request.html                public/ad-request.html                2>/dev/null || true
# 정적 이벤트 페이지 (hebronguide/public/ 직접 복사 — React 빌드 우회)
cp hebronguide/public/event-waba-2026.html          public/event-waba-2026.html            2>/dev/null || true
cp hebronguide/public/waba-poster-2026.jpg          public/waba-poster-2026.jpg            2>/dev/null || true
cp hebronguide/public/ad-request.html               public/ad-request.html                 2>/dev/null || true
cp hebronguide/public/partner-benefits.html         public/partner-benefits.html           2>/dev/null || true
cp hebronguide/public/qr-preview.html               public/qr-preview.html                 2>/dev/null || true
# 파트너 교회 관리 시스템 (루트 정적 파일 직접 복사)
cp growth-plan.html      public/growth-plan.html      2>/dev/null || true
cp church-invite.html    public/church-invite.html    2>/dev/null || true
cp admin-churches.html   public/admin-churches.html   2>/dev/null || true
cp youtube-plan.html     public/youtube-plan.html     2>/dev/null || true
cp youtube-schedule.html public/youtube-schedule.html 2>/dev/null || true
cp ops.html              public/ops.html              2>/dev/null || true
cp hero-preview.html          public/hero-preview.html          2>/dev/null || true
cp index-preview.html         public/index-preview.html         2>/dev/null || true
cp presentation-hospitality.html public/presentation-hospitality.html 2>/dev/null || true
cp hebron-story.html          public/hebron-story.html          2>/dev/null || true
cp hebronguide/dist/posters.html                   public/posters.html                   2>/dev/null || true
# 목사님 전용 운영 문서 (앱 미연결 — URL 직접 공유)
cp hebronguide/dist/church-guide.html              public/church-guide.html              2>/dev/null || true
cp hebronguide/dist/hebron-ops-church-connect.html public/hebron-ops-church-connect.html 2>/dev/null || true
cp hebronguide/dist/hebron-partner-mobilize.html   public/hebron-partner-mobilize.html   2>/dev/null || true
cp hebronguide/dist/church-submit.html             public/church-submit.html             2>/dev/null || true
cp hebronguide/dist/pastor-dashboard.html          public/pastor-dashboard.html          2>/dev/null || true
cp hebronguide/dist/story-submit.html              public/story-submit.html              2>/dev/null || true
cp hebronguide/dist/ksbc-partner.html              public/ksbc-partner.html              2>/dev/null || true
cp hebronguide/dist/register.html                  public/register.html                  2>/dev/null || true
cp hebronguide/dist/admin.html                     public/admin.html                     2>/dev/null || true
cp hebronguide/dist/biz-join.html                  public/biz-join.html                  2>/dev/null || true
cp hebronguide/dist/church-join.html               public/church-join.html               2>/dev/null || true
cp hebronguide/dist/help.html                      public/help.html                      2>/dev/null || true

# 루트 HTML 파일 전체 자동 복사 (church-guide, ksbc-partner, ops-dashboard, about 등 모두 포함)
# ⚠️ index.html 은 제외 — 13번 줄에서 루트 랜딩 페이지(index.html)가 이미 복사됨
#    이 루프가 index.html 도 복사하면 React SPA index 가 랜딩 페이지를 덮어써서 깜깜이 발생!
for f in hebronguide/dist/*.html; do
  fname=$(basename "$f")
  if [ "$fname" = "index.html" ]; then
    echo "  skipped: index.html (landing page protected)"
    continue
  fi
  cp "$f" "public/$fname"
  echo "  copied: $fname"
done
echo "  OK: all root HTML files copied (index.html protected)"

# 6. API 함수는 Vercel이 자동 라우팅 (hebronguide/api/*.js → /api/*)

# 7. 배포 버전 타임스탬프 — 앱이 이 파일을 보고 캐시 자동 초기화
echo "$(date -u +%s)" > public/ver.txt
echo "  OK: ver.txt → $(cat public/ver.txt)"

# 8. cities.json 자동 생성 — admin.html 도시 필터 자동 업데이트
# build.sh의 CITY_KO/CITY_EN 배열이 유일한 소스. 도시 추가 시 여기만 수정하면 admin 자동 반영.
echo "--- Generating cities.json for admin panel ---"
REGION_MAP=(
  ["seattle"]="🇺🇸 미국"    ["federalway"]="🇺🇸 미국"  ["dallas"]="🇺🇸 미국"     ["sf"]="🇺🇸 미국"
  ["newyork"]="🇺🇸 미국"    ["la"]="🇺🇸 미국"         ["houston"]="🇺🇸 미국"
  ["atlanta"]="🇺🇸 미국"    ["chicago"]="🇺🇸 미국"     ["dc"]="🇺🇸 미국"
  ["nashville"]="🇺🇸 미국"  ["boston"]="🇺🇸 미국"      ["miami"]="🇺🇸 미국"
  ["philadelphia"]="🇺🇸 미국" ["sandiego"]="🇺🇸 미국"  ["portland"]="🇺🇸 미국"
  ["denver"]="🇺🇸 미국"     ["honolulu"]="🇺🇸 미국"    ["charlotte"]="🇺🇸 미국"
  ["raleigh"]="🇺🇸 미국"    ["columbus"]="🇺🇸 미국"    ["minneapolis"]="🇺🇸 미국"
  ["kansascity"]="🇺🇸 미국" ["orlando"]="🇺🇸 미국"     ["maryland"]="🇺🇸 미국"    ["virginia"]="🇺🇸 미국"    ["neworleans"]="🇺🇸 미국"
  ["fayetteville"]="🇺🇸 미국" ["killeen"]="🇺🇸 미국"   ["louisville"]="🇺🇸 미국"
  ["fairfield"]="🇺🇸 미국"  ["waynesville"]="🇺🇸 미국" ["tampa"]="🇺🇸 미국"
  ["anchorage"]="🇺🇸 미국"  ["tucson"]="🇺🇸 미국"      ["orangecounty"]="🇺🇸 미국"
  ["inlandempire"]="🇺🇸 미국" ["austin"]="🇺🇸 미국"
  ["toronto"]="🇨🇦 캐나다"  ["vancouver"]="🇨🇦 캐나다" ["calgary"]="🇨🇦 캐나다"
  ["edmonton"]="🇨🇦 캐나다" ["ottawa"]="🇨🇦 캐나다"    ["winnipeg"]="🇨🇦 캐나다"   ["princgeorge"]="🇨🇦 캐나다"
  ["mexicocity"]="🌎 중남미" ["guadalajara"]="🌎 중남미" ["monterrey"]="🌎 중남미"
  ["saopaulo"]="🌎 중남미"  ["bogota"]="🌎 중남미"
  ["london"]="🇬🇧 유럽"     ["paris"]="🇬🇧 유럽"       ["berlin"]="🇬🇧 유럽"
  ["frankfurt"]="🇬🇧 유럽"
  ["sydney"]="🇦🇺 오세아니아" ["melbourne"]="🇦🇺 오세아니아" ["brisbane"]="🇦🇺 오세아니아"
  ["perth"]="🇦🇺 오세아니아"  ["auckland"]="🇦🇺 오세아니아"
  ["singapore"]="🌏 동남아·중동" ["bangkok"]="🌏 동남아·중동"
  ["hochiminh"]="🌏 동남아·중동" ["dubai"]="🌏 동남아·중동"
  ["tokyo"]="🇯🇵 일본"      ["osaka"]="🇯🇵 일본"
  ["seoul"]="🇰🇷 한국"      ["busan"]="🇰🇷 한국"      ["incheon"]="🇰🇷 한국"
  ["ansan"]="🇰🇷 한국"      ["daejeon"]="🇰🇷 한국"    ["daegu"]="🇰🇷 한국"
  ["gwangju"]="🇰🇷 한국"    ["jeju"]="🇰🇷 한국"       ["bundang"]="🇰🇷 한국"
  ["changwon"]="🇰🇷 한국"   ["cheonan"]="🇰🇷 한국"
)

printf '[' > public/cities.json
first=1
for city in \
  seattle federalway dallas sf newyork nashville boston la toronto vancouver houston atlanta \
  kansascity philadelphia miami orangecounty mexicocity guadalajara monterrey bogota \
  chicago dc sandiego honolulu portland denver \
  calgary edmonton ottawa winnipeg phoenix charlotte raleigh columbus minneapolis \
  tucson fayetteville killeen fairfield waynesville louisville anchorage princgeorge inlandempire austin \
  tampa \
  sydney melbourne brisbane perth auckland saopaulo london \
  singapore bangkok hochiminh dubai frankfurt berlin paris \
  tokyo osaka \
  seoul busan ansan incheon jeju daegu gwangju daejeon changwon cheonan bundang \
  orlando maryland virginia neworleans; do
  KO="${CITY_KO[$city]:-$city}"
  EN="${CITY_EN[$city]:-$city}"
  REGION="${REGION_MAP[$city]:-기타}"
  [ $first -eq 0 ] && printf ',' >> public/cities.json
  printf '{"slug":"%s","nameKo":"%s","nameEn":"%s","region":"%s"}' \
    "$city" "$KO" "$EN" "$REGION" >> public/cities.json
  first=0
done
printf ']' >> public/cities.json
echo "  OK: cities.json → $(wc -c < public/cities.json) bytes, $(grep -o '"slug"' public/cities.json | wc -l) cities"

# 8-b. 도시 수 공개 엔드포인트 city-count.js (자동 생성)
# 목적: NanuriWeb 등 외부 사이트가 <script>로 포함 → 도시 추가 시 자동 동기화 (CORS 불필요)
# 사용법(외부): <script src="https://hebronguide.com/city-count.js"></script>
#   + 숫자 표시 요소에 class="hg-city-count", "72+" 표시엔 class="hg-city-count-plus"
CITY_N=$(grep -o '"slug"' public/cities.json | wc -l | tr -d ' ')
cat > public/city-count.js <<EOF
/* HebronGuide 도시 수 — build.sh 자동 생성. 수동 수정 금지. */
window.HG_CITY_COUNT = ${CITY_N};
(function(){
  function apply(){
    document.querySelectorAll('.hg-city-count').forEach(function(e){ e.textContent = ${CITY_N}; });
    document.querySelectorAll('.hg-city-count-plus').forEach(function(e){ e.textContent = '${CITY_N}+'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
EOF
echo "  OK: city-count.js → ${CITY_N} 도시"

# 9. SEO JSON-LD 구조화 데이터 삽입 — 구글 검색 시 HebronGuide 노출
# 효과: "시애틀지구촌교회", "달라스 한인 교회" 등 검색 → HebronGuide 연결
echo "--- Injecting SEO JSON-LD structured data ---"
node seo-inject.js

echo "=== Deploy Complete — cities auto-synced to cities.json ==="
ls public/
