# HebronGuide 하루 5개 도시 확장 시스템
**City Expansion: 5 Cities Per Day — AI 자동화 파이프라인**  
**작성일: 2026-05-18 | 현재: 67개 도시 → 목표: 2026년 말 100개 / 2027년 말 200개**

> *"네 눈을 들어 너 있는 곳에서 동서남북을 바라보라 — 창세기 13:14"*  
> 재외 한인이 있는 곳이라면 어디든, HebronGuide가 먼저 가 있겠습니다.

---

## 1. 도시 리서치 에이전트 (City Research Agent)

### 에이전트 활성화 프롬프트

```
너는 HebronGuide City Research Agent야.
새 도시를 HebronGuide에 추가하기 위해 아래 데이터를 병렬로 리서치해.

대상 도시: [도시명, 국가]

병렬 리서치 항목 (모두 동시에 조사):

[A] 한인 인구·커뮤니티 현황
  - 한인 추정 인구 수 (재외동포청·현지 한인회 기준)
  - 주요 한인 밀집 지역·동네 (최소 3곳)
  - 현지 한인회 이름·연락처

[B] 정착 기관 TOP 10 (TOP5_SETTLE 데이터)
  - 한인 커뮤니티 센터 (있다면)
  - 총영사관 또는 영사관
  - DMV / 운전면허 기관
  - 종합병원 (한국어 서비스 여부)
  - 한인 은행 또는 지점 (한미은행·우리·신한·하나)
  - SSA (사회보장국)
  - USCIS (이민국)
  - 한인 커뮤니티 마켓 (H-Mart·한아름 등)
  - 한인 클리닉·의원
  - 공립 도서관 (한국어 자료 여부)

[C] 한인 식당 TOP 10 (TOP5_FOOD 데이터)
  - Yelp 별점 4.0+ / 리뷰 50개+ 기준
  - 업소명·주소·전화·영업시간·Yelp 링크
  - 대표 메뉴 1-2개
  - 특이사항 (주차·예약·배달 여부)

[D] 탐방 명소 TOP 10 (TOP5_EXPLORE 데이터)
  - 한인 밀집 쇼핑몰·거리
  - 한국 문화 관련 장소
  - 자연·관광 명소 (한인 인기 장소)
  - 한인 노래방·카페·베이커리

[E] 공항 정보 (CITY_AIRPORT 데이터)
  - 메인 공항 이름·코드 (IATA)
  - 공항 → 한인 밀집 지역 교통 수단
  - 이동 시간·비용 (택시/우버/대중교통)
  - 한인 직항 또는 연결 항공사

[F] 한인 교회
  - 주요 한인 교회 3-5곳 (이름·주소·웹사이트)
  - 교단 정보 (SBC·장로교·감리교 등)
  - 영어부·청년부 여부

[G] 현지 한인 미디어
  - 한인 신문·방송·인터넷 매체
  - URL·연락처

검증 기준:
  ✅ 검증됨: 공식 웹사이트 + 전화번호 확인 가능
  🟡 미확인: 정보는 있으나 직접 확인 필요
  ❌ 제외: 폐업 의심·정보 불일치

출력 형식: 코드에 바로 붙여넣기 가능한 TypeScript 데이터 구조로 출력.
소요 예상: 30분/도시

시작해: [도시명]
```

### 에이전트 병렬 실행 방식

하루 5개 도시를 처리할 때:

```
오전 09:00 — 5개 도시 리서치 동시 시작 (병렬)
  City 1: Research Agent Instance 1
  City 2: Research Agent Instance 2
  City 3: Research Agent Instance 3
  City 4: Research Agent Instance 4
  City 5: Research Agent Instance 5

오전 11:00 — 리서치 완료, 데이터 검토
오후 12:00 — Claude Code (CTO) 코드 작업 시작
오후 02:00 — 빌드·테스트
오후 03:00 — 배포 (git push)
오후 04:00 — 검증 + 보고
```

---

## 2. 다음 33개 도시 우선순위 큐 (Phase 2: 100개 도시)

현재 67개 → 100개 목표. 추가 필요 도시: 33개

한인 인구·전략적 중요성 기준 우선순위:

| 순위 | 도시 | 국가 | 한인 인구 추정 | 이유 | URL |
|---|---|---|---|---|---|
| 1 | **산호세 San Jose** | 🇺🇸 미국 | 6만+ | 실리콘밸리 IT 한인 밀집 | /sanjose/ |
| 2 | **새크라멘토 Sacramento** | 🇺🇸 미국 | 5만+ | 캘리포니아 주도, 성장세 | /sacramento/ |
| 3 | **시카고 Chicago** | 🇺🇸 미국 | 5만+ | 중서부 최대 한인 도시 | /chicago/ |
| 4 | **워싱턴 DC Washington DC** | 🇺🇸 미국 | 2.5만+ | 정치·외교 한인 주재원 | /washingtondc/ |
| 5 | **디트로이트 Detroit** | 🇺🇸 미국 | 2만+ | 현대·기아 협력사 한인 | /detroit/ |
| 6 | **리치몬드 Richmond, VA** | 🇺🇸 미국 | 2만+ | DMV 외곽 한인 증가 | /richmond/ |
| 7 | **버지니아비치 Virginia Beach** | 🇺🇸 미국 | 2만+ | 군인 한인 가정 | /virginiabeach/ |
| 8 | **인디애나폴리스 Indianapolis** | 🇺🇸 미국 | 1.5만+ | 중서부 제조업 한인 | /indianapolis/ |
| 9 | **솔트레이크시티 Salt Lake City** | 🇺🇸 미국 | 1만+ | 모르몬·한인 교회 교차 | /saltlakecity/ |
| 10 | **버밍엄 Birmingham, AL** | 🇺🇸 미국 | 1만+ | 남부 성장 도시 | /birmingham/ |
| 11 | **오마하 Omaha** | 🇺🇸 미국 | 8천+ | 중부 이민 성장 | /omaha/ |
| 12 | **몬트리올 Montreal** | 🇨🇦 캐나다 | 1만+ | 캐나다 2위 도시 | /montreal/ |
| 13 | **핼리팩스 Halifax** | 🇨🇦 캐나다 | 5천+ | 대서양 관문, 유학생 급증 | /halifax/ |
| 14 | **빅토리아 Victoria** | 🇨🇦 캐나다 | 3천+ | BC 제2도시, 은퇴·이민 | /victoria/ |
| 15 | **홍콩 Hong Kong** | 🇭🇰 홍콩 | 1만5천+ | 금융·무역 주재원 | /hongkong/ |
| 16 | **타이베이 Taipei** | 🇹🇼 대만 | 1만+ | 반도체·IT 취업 한인 | /taipei/ |
| 17 | **상하이 Shanghai** | 🇨🇳 중국 | 5만+ | 최대 중국 내 한인 밀집 | /shanghai/ |
| 18 | **베이징 Beijing** | 🇨🇳 중국 | 3만+ | 주재원·유학 한인 | /beijing/ |
| 19 | **쿠알라룸푸르 KL** | 🇲🇾 말레이시아 | 5천+ | 동남아 교두보 | /kualalumpur/ |
| 20 | **자카르타 Jakarta** | 🇮🇩 인도네시아 | 3만+ | 한국 제조업 취업 한인 | /jakarta/ |
| 21 | **마닐라 Manila** | 🇵🇭 필리핀 | 5천+ | 사업가·유학 증가 | /manila/ |
| 22 | **나고야 Nagoya** | 🇯🇵 일본 | 1만+ | 도요타 한인 취업 | /nagoya/ |
| 23 | **후쿠오카 Fukuoka** | 🇯🇵 일본 | 8천+ | 부산 근거리, 증가세 | /fukuoka/ |
| 24 | **삿포로 Sapporo** | 🇯🇵 일본 | 5천+ | 관광·유학 거점 | /sapporo/ |
| 25 | **암스테르담 Amsterdam** | 🇳🇱 네덜란드 | 3천+ | IT·물류 주재원 | /amsterdam/ |
| 26 | **취리히 Zurich** | 🇨🇭 스위스 | 2천+ | 금융·의료 전문직 | /zurich/ |
| 27 | **더블린 Dublin** | 🇮🇪 아일랜드 | 3천+ | 어학연수 한인 | /dublin/ |
| 28 | **마드리드 Madrid** | 🇪🇸 스페인 | 1만+ | 스페인 한인 1위 | /madrid/ |
| 29 | **스톡홀름 Stockholm** | 🇸🇪 스웨덴 | 2천+ | 북유럽 한인 증가 | /stockholm/ |
| 30 | **부에노스아이레스 Buenos Aires** | 🇦🇷 아르헨티나 | 1만+ | 남미 한인 2위 | /buenosaires/ |
| 31 | **산티아고 Santiago** | 🇨🇱 칠레 | 3천+ | 칠레 한인 | /santiago/ |
| 32 | **리마 Lima** | 🇵🇪 페루 | 3천+ | 페루 한인 커뮤니티 | /lima/ |
| 33 | **나이로비 Nairobi** | 🇰🇪 케냐 | 1천+ | 아프리카 진출 최초 거점 | /nairobi/ |

---

## 3. 도시 빌드 프로세스 (City Build Process)

### 자동화 파이프라인 (도시당 약 4시간)

```
PHASE 1: 리서치 (30분/도시, AI 병렬)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  City Research Agent 실행 (프롬프트 Section 1 참조)
  → 7개 항목 동시 조사
  → 검증 등급 부여 (✅ / 🟡 / ❌)
  → TypeScript 데이터 구조 출력

PHASE 2: 코드 작업 (60분/도시, Claude Code)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  파일: hebronguide/src/app/components/HebronGuide.tsx

  추가해야 할 항목 (순서대로):

  [1] CITY_CONFIGS에 도시 설정 추가
      {
        slug: 'chicago',
        nameKo: '시카고',
        nameEn: 'Chicago',
        country: 'US',
        color: '#1a3a6b',           // 도시 대표 색 (그라디언트 폴백)
        tagline: '중서부 한인의 중심',
        heroSlides: CITY_HERO_SLIDES_CHICAGO,
      }

  [2] HEBRON_CITIES 배열에 도시 추가
      {
        emoji: '🌆',
        flag: '🇺🇸',
        nameKo: '시카고',
        nameEn: 'Chicago',
        url: '/chicago/',
        status: 'live',
        country: 'US',
      }

  [3] TOP5_SETTLE_CHICAGO 추가 (정착 기관 10개)
  [4] TOP5_FOOD_CHICAGO 추가 (한식당 10개)
  [5] TOP5_EXPLORE_CHICAGO 추가 (탐방 10개)
  [6] CITY_HERO_SLIDES_CHICAGO 추가 (3개+ 슬라이드)
  [7] CITY_AIRPORT_CHICAGO 추가
  [8] DIASPORA_IDENTITY 항목 추가
  [9] getCountryCode() 함수 업데이트 (필요시)

PHASE 3: 빌드·테스트 (10분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cd hebronguide && npm run build
  → 에러 없음 확인
  → 새 도시 URL 로컬 확인

PHASE 4: 빌드 스크립트 업데이트 (5분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  build.sh 편집:
  - CITY_KO 배열에 '시카고' 추가
  - CITY_EN 배열에 'chicago' 추가
  - for loop 자동 적용됨

PHASE 5: vercel.json 라우팅 추가 (5분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    "src": "/chicago/(.*)",
    "dest": "/chicago/index.html"
  }

PHASE 6: 배포 (5분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  git add -A
  git commit -m "feat: 시카고 도시 추가 (Chicago)"
  git push origin main
  → Vercel 자동 배포 (약 60초)

PHASE 7: 사이트맵 업데이트 (5분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  sitemap.xml에 추가:
  <url>
    <loc>https://hebronguide.com/chicago/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

PHASE 8: llms.txt 업데이트 (2분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  llms.txt에 새 도시 URL 추가

PHASE 9: 검증 (3분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hebronguide.com/chicago/ 접속 확인
  → 모바일 확인
  → 한국어 조사 확인 (한글 조사 헬퍼 작동)
  → 이미지 로딩 확인

총 소요 시간: 도시당 약 2-4시간
하루 5개: 약 10-20시간 (병렬 처리로 단축 가능)
```

### Claude Code 명령어 (도시 추가)

```
"Generate HebronGuide for [도시명]"

예:
"Generate HebronGuide for Chicago, Illinois, USA"
"Generate HebronGuide for Taipei, Taiwan"
"Generate HebronGuide for Amsterdam, Netherlands"
```

---

## 4. 도시별 런치 품질 체크리스트

**모든 항목 ✅ 통과 후에만 배포**

### A. 코드 구조 체크

```
코드 파일: hebronguide/src/app/components/HebronGuide.tsx

□ ✅ CITY_CONFIGS 항목
     - slug (영문 소문자, 하이픈 없음)
     - nameKo (한국어 공식 명칭)
     - nameEn (영어 공식 명칭)
     - country (ISO 2자리 코드: US, CA, JP...)
     - color (HEX 6자리, 도시 대표색)
     - tagline (한국어, 15자 이하)
     - heroSlides (배열 참조)

□ ✅ HEBRON_CITIES 항목
     - emoji (도시 대표 이모지)
     - flag (국기 이모지)
     - nameKo / nameEn
     - url (슬래시로 시작·종료: '/chicago/')
     - status: 'live'
     - country

□ ✅ CITY_HERO_SLIDES (3개 이상)
     - 각 슬라이드: imageUrl, title, subtitle, story
     - imageUrl: 실제 작동하는 URL (깨진 링크 ❌)
     - 가짜 이미지·AI 생성 이미지 ❌ (실제 도시 사진만)

□ ✅ CITY_AIRPORT
     - airportName (공식 공항 이름)
     - airportCode (IATA 3자리: ORD, YYZ...)
     - transportOptions (배열, 2개 이상)
       - type (택시/버스/지하철/기차)
       - destination (한인 밀집 지역)
       - duration (이동 시간)
       - cost (대략적 비용, 현지 화폐)
       - notes (특이사항)

□ ✅ TOP5_SETTLE_[CITY] (10개 항목)
     - name (업소·기관명)
     - nameKo (한국어 이름, 있으면)
     - category (정착 기관 종류)
     - address (실제 주소)
     - phone (국제 형식)
     - website (공식 URL)
     - verified: true (검증됨만 포함)
     - verifiedAt (검증 날짜)

□ ✅ TOP5_FOOD_[CITY] (10개 항목)
     - name
     - address, phone, website
     - yelpRating (Yelp 실제 별점)
     - yelpUrl (Yelp 링크)
     - menu (대표 메뉴 2개)
     - verified: true

□ ✅ TOP5_EXPLORE_[CITY] (10개 항목)
     - name, nameKo
     - description (한국어, 2-3줄)
     - address
     - tip (방문 팁)

□ ✅ DIASPORA_IDENTITY 항목
     - city
     - identity (도시 한인 정체성 한 줄)
     - tagline
```

### B. 라우팅 체크

```
□ ✅ vercel.json에 라우트 추가됨
     { "src": "/[slug]/(.*)", "dest": "/[slug]/index.html" }

□ ✅ build.sh 업데이트
     - CITY_KO 배열에 한국어 도시명 추가
     - CITY_EN 배열에 영문 슬러그 추가

□ ✅ getCountryCode() 함수 업데이트 (해당 국가가 없으면)
```

### C. SEO 체크

```
□ ✅ sitemap.xml URL 추가됨
     <loc>https://hebronguide.com/[slug]/</loc>

□ ✅ llms.txt 업데이트
     새 도시 URL 목록에 추가
```

### D. 콘텐츠 품질 체크

```
□ ✅ 모든 전화번호 — 국제 형식 (예: +1-312-xxx-xxxx)
□ ✅ 모든 웹사이트 URL — https:// 로 시작
□ ✅ Yelp 링크 — 실제 Yelp 페이지 (검색 결과 ❌)
□ ✅ 한국어 조사 — josa 헬퍼 사용 (하드코딩 조사 ❌)
□ ✅ AI 추측 데이터 없음 — 모든 정보 검증 가능
□ ✅ 폐업 업소 없음 — 검증 날짜 기준 6개월 이내
□ ✅ 이단 교회 없음 — 신천지·통일교·JMS 등 제외
□ ✅ 3단계 이하 UX — 새 UI 요소 추가 시 확인
```

### E. 배포 후 최종 확인

```
□ ✅ hebronguide.com/[slug]/ 접속 성공 (200 OK)
□ ✅ 모바일 화면 확인 (iPhone Safari / Android Chrome)
□ ✅ 한국어 메뉴·버튼 정상 표시
□ ✅ 이미지 로딩 (슬라이드 3개 이상)
□ ✅ 공항 섹션 정보 표시
□ ✅ 정착·음식·탐방 탭 데이터 표시
□ ✅ Yelp 별점 정상 표시
□ ✅ 외부 링크 클릭 → 새 탭 열림
```

---

## 5. 첫 2주 (10일) 스케줄 — 50개 도시 추가 계획

> 현재 67개 → 목표 100개 = 추가 필요 33개  
> 아래 스케줄은 가장 빠른 빌드 시나리오 (에이전트 병렬 처리 기준)

### Day 1 (2026-05-19, 월요일) — 미국 대도시 I

| # | 도시 | 한인 인구 | 슬러그 | 예상 난이도 |
|---|---|---|---|---|
| 1 | 시카고 Chicago, IL | 5만+ | `/chicago/` | 중 |
| 2 | 워싱턴 DC Washington DC | 2.5만+ | `/washingtondc/` | 중 |
| 3 | 산호세 San Jose, CA | 6만+ | `/sanjose/` | 쉬움 |
| 4 | 새크라멘토 Sacramento, CA | 5만+ | `/sacramento/` | 쉬움 |
| 5 | 디트로이트 Detroit, MI | 2만+ | `/detroit/` | 중 |

**준비 메모:**
- 시카고: ORD 공항, 한인 밀집 = Niles·Glenview·Northbrook
- DC: 한인 밀집 = 버지니아 Centreville·Annandale, 메릴랜드 Rockville
- 산호세: 실리콘밸리 IT 한인 최대 밀집 (한인타운 없음, 분산 거주)
- 새크라멘토: 한인 마켓·교회 Elk Grove 중심
- 디트로이트: 현대·기아 협력사 한인, Auburn Hills·Troy 중심

---

### Day 2 (2026-05-20, 화요일) — 미국 대도시 II

| # | 도시 | 한인 인구 | 슬러그 | 예상 난이도 |
|---|---|---|---|---|
| 6 | 리치몬드 Richmond, VA | 2만+ | `/richmond/` | 중 |
| 7 | 버지니아비치 Virginia Beach, VA | 2만+ | `/virginiabeach/` | 중 |
| 8 | 인디애나폴리스 Indianapolis, IN | 1.5만+ | `/indianapolis/` | 중 |
| 9 | 솔트레이크시티 Salt Lake City, UT | 1만+ | `/saltlakecity/` | 중 |
| 10 | 버밍엄 Birmingham, AL | 1만+ | `/birmingham/` | 쉬움 |

**준비 메모:**
- 리치몬드: DC 위성 한인 증가 지역, 한인 교회·마켓 확인
- 버지니아비치: 군인 가정 한인, 노포크 Navy Base 근접
- 인디애나폴리스: 한인 밀집 지역 분산, 교회 중심 커뮤니티
- 솔트레이크: BYU 한인 학생·선교사 출신 정착민
- 버밍엄: 소규모이나 성장세 빠름, 의료·교육 이민자

---

### Day 3 (2026-05-21, 수요일) — 미국 소도시 + 캐나다

| # | 도시 | 한인 인구 | 슬러그 | 예상 난이도 |
|---|---|---|---|---|
| 11 | 오마하 Omaha, NE | 8천+ | `/omaha/` | 쉬움 |
| 12 | 몬트리올 Montreal, QC | 1만+ | `/montreal/` | 중 |
| 13 | 핼리팩스 Halifax, NS | 5천+ | `/halifax/` | 쉬움 |
| 14 | 빅토리아 Victoria, BC | 3천+ | `/victoria/` | 쉬움 |
| 15 | 나고야 Nagoya, Japan | 1만+ | `/nagoya/` | 어려움 |

**준비 메모:**
- 오마하: 한인 소규모 커뮤니티, 육가공·농업 취업 이민
- 몬트리올: 퀘벡주 (프랑스어권), 한인 이중언어 생활
- 핼리팩스: Atlantic Immigration Pilot 프로그램 한인 증가
- 빅토리아: 은퇴·이민 한인, BC 서부 관광도시
- 나고야: 일본어 데이터 필요, 도요타 취업 한인

---

### Day 4 (2026-05-22, 목요일) — 일본 + 동남아

| # | 도시 | 한인 인구 | 슬러그 | 예상 난이도 |
|---|---|---|---|---|
| 16 | 후쿠오카 Fukuoka, Japan | 8천+ | `/fukuoka/` | 어려움 |
| 17 | 삿포로 Sapporo, Japan | 5천+ | `/sapporo/` | 어려움 |
| 18 | 홍콩 Hong Kong | 1.5만+ | `/hongkong/` | 중 |
| 19 | 타이베이 Taipei, Taiwan | 1만+ | `/taipei/` | 중 |
| 20 | 쿠알라룸푸르 KL, Malaysia | 5천+ | `/kualalumpur/` | 중 |

**준비 메모:**
- 후쿠오카: 부산과 가장 가까운 일본 도시, 한국어 서비스 많음
- 삿포로: 한인 관광·유학 거점, 겨울 관광객 많음
- 홍콩: 주재원·금융 한인, Causeway Bay·Jordan 한인 밀집
- 타이베이: 반도체·TSMC 관련 한인 증가
- KL: 몽키아라·방사르 한인 밀집, 물가 저렴

---

### Day 5 (2026-05-23, 금요일) — 동남아 + 중국

| # | 도시 | 한인 인구 | 슬러그 | 예상 난이도 |
|---|---|---|---|---|
| 21 | 자카르타 Jakarta, Indonesia | 3만+ | `/jakarta/` | 중 |
| 22 | 마닐라 Manila, Philippines | 5천+ | `/manila/` | 쉬움 |
| 23 | 상하이 Shanghai, China | 5만+ | `/shanghai/` | 어려움 |
| 24 | 베이징 Beijing, China | 3만+ | `/beijing/` | 어려움 |
| 25 | 암스테르담 Amsterdam, Netherlands | 3천+ | `/amsterdam/` | 중 |

**준비 메모:**
- 자카르타: 한국 제조업·섬유업 취업 한인, Sudirman·SCBD 주재원
- 마닐라: 어학연수·사업가 한인, BGC·마카티 밀집
- 상하이: 홍첸루 한인 타운, VPN 환경 고려 (링크 정책)
- 베이징: 왕징 한인 타운, 주재원 중심
- 암스테르담: IT·물류 주재원, 스키폴 허브 경유 한인

---

### Day 6 (2026-05-26, 월요일) — 유럽

| # | 도시 | 한인 인구 | 슬러그 | 예상 난이도 |
|---|---|---|---|---|
| 26 | 취리히 Zurich, Switzerland | 2천+ | `/zurich/` | 중 |
| 27 | 더블린 Dublin, Ireland | 3천+ | `/dublin/` | 쉬움 |
| 28 | 마드리드 Madrid, Spain | 1만+ | `/madrid/` | 중 |
| 29 | 스톡홀름 Stockholm, Sweden | 2천+ | `/stockholm/` | 중 |
| 30 | 부에노스아이레스 Buenos Aires | 1만+ | `/buenosaires/` | 어려움 |

**준비 메모:**
- 취리히: 금융·제약 한인 전문직, 물가 최고수준
- 더블린: 어학연수 최대 목적지, 워킹홀리데이 한인 많음
- 마드리드: 스페인어권 + 한인, 플라멩코 문화 접목 가능
- 스톡홀름: 북유럽 한인 증가, IT·디자인 분야
- 부에노스아이레스: 남미 한인 2위, 클리퍼 고향 (스페인어 필요)

---

### Day 7 (2026-05-27, 화요일) — 남미 + 아프리카

| # | 도시 | 한인 인구 | 슬러그 | 예상 난이도 |
|---|---|---|---|---|
| 31 | 산티아고 Santiago, Chile | 3천+ | `/santiago/` | 중 |
| 32 | 리마 Lima, Peru | 3천+ | `/lima/` | 중 |
| 33 | 나이로비 Nairobi, Kenya | 1천+ | `/nairobi/` | 어려움 |
| *버퍼 34* | *(예비 도시 1)* | — | TBD | — |
| *버퍼 35* | *(예비 도시 2)* | — | TBD | — |

**준비 메모:**
- 산티아고: 칠레 한인 1세·1.5세, 와인·구리 산업 관련
- 리마: 페루 한인, 인카 문화 + 한인 식당 고품질
- 나이로비: 아프리카 진출 한인 선교사·사업가, 최초 거점
- 버퍼 34-35: 실제 진행 속도에 따라 추가 결정

---

### Day 8-10 (2026-05-28-30) — 품질 검증 주간

```
Day 8: Day 1-4 배포 도시 (시카고~타이베이) 품질 감사
  - 품질 체크리스트 100% 통과 확인
  - 사용자 피드백 수집 시작
  - 깨진 링크·데이터 오류 수정

Day 9: Day 5-7 배포 도시 (자카르타~리마) 품질 감사
  - 동일 절차

Day 10: SEO 최적화 + 미디어 아웃리치
  - sitemap.xml 전체 재제출 (Google Search Console)
  - 새 33개 도시 보도자료 작성 (PR Agent)
  - 한인 미디어 배포 (미주중앙일보·한국일보)
  - 소셜 미디어 런치 캠페인
```

---

## 6. 도시 빌드 Claude Code 명령어 시트

실제 Claude Code에서 사용할 커맨드 모음:

### 단일 도시 추가

```
"Generate HebronGuide for Chicago, Illinois, USA.
한인 인구 약 5만명. 한인 밀집 지역: Niles, Glenview, Northbrook.
공항: ORD (O'Hare International Airport)"
```

### 일괄 도시 추가 (5개 병렬)

```
"오늘 다음 5개 도시를 HebronGuide에 추가해줘. 
병렬로 리서치하고, 순서대로 코드 작업해:
1. Chicago, Illinois, USA
2. Washington DC, USA
3. San Jose, California, USA
4. Sacramento, California, USA
5. Detroit, Michigan, USA

각 도시의 체크리스트를 통과한 후 배포해."
```

### 도시 데이터 검증

```
"다음 도시들의 데이터 품질 감사를 실행해:
[도시명 목록]

각 도시별로 Quality Checklist를 점검하고
❌ 항목은 즉시 수정해."
```

---

## 7. 장기 로드맵 및 마일스톤

```
현재 (2026-05-18):
  ✅ 67개 도시 라이브

Phase 2 (2026-06 ~ 2026-12):
  목표: 100개 도시
  방법: 하루 5개 (주 3-4일 작업 기준)
  추가 필요: 33개
  예상 완료: 2026-06-15 (3주 집중 작업)

Phase 3 (2027):
  목표: 200개 도시
  방법: 월 10개 꾸준히 + 분기별 집중 작업
  추가 필요: 100개
  예상 완료: 2027-12-31

Phase 4 (2028):
  목표: 300개 도시
  방법: AI 자동화 고도화 (리서치 에이전트 자율화)
  추가 필요: 100개
  예상 완료: 2028-12-31

최종 비전 (2030):
  500개 도시 — 재외 한인 7백만이 사는 모든 도시
```

---

## 8. 병렬 처리 성능 목표

```
리서치 에이전트 (병렬):
  단일 인스턴스: 30분/도시
  5개 병렬: 30분 (동시 완료)

코드 작업 (Claude Code):
  단일 도시: 60분
  최적화 후: 30분 (데이터 구조 템플릿 고도화)

빌드·테스트: 10분/배치
배포: 5분/배치

하루 5개 도시 총 시간:
  현재: 약 10-15시간 (순차 작업)
  목표: 약 4-6시간 (병렬 최적화 후)
```

---

## 9. 위험 관리 (Risk Management)

| 위험 | 대응 |
|---|---|
| 검증 안 된 데이터 추가 | 체크리스트 100% 통과 후에만 배포 |
| 폐업 업소 등재 | verified_at 기록, 6개월마다 점검 |
| 빌드 실패 | 배포 전 로컬 빌드 필수 확인 |
| 이단 교회 등재 | 4-Tier 기준 필수 적용 |
| AI 추측 데이터 | 반드시 소스 URL 첨부 (없으면 등재 금지) |
| 한국어 조사 오류 | josa 헬퍼 사용, 하드코딩 조사 금지 |
| 배포 후 URL 오류 | vercel.json 라우트 확인 필수 |

---

## 10. 핵심 메시지

> **"67개 도시는 시작이다.**  
> **AI 에이전트가 리서치하고, Claude Code가 코드를 쓰고,**  
> **검증된 데이터만 올라간다.**  
> **2026년 말 100개, 2027년 말 200개 —**  
> **재외 한인이 있는 모든 도시에 헤브론의 환대가 닿는다."**

---

## 관련 문서

- [`AI_COMPANY_STRUCTURE.md`](AI_COMPANY_STRUCTURE.md) — AI 에이전트 조직 구조
- [`CITY_GENERATION_SYSTEM.md`](CITY_GENERATION_SYSTEM.md) — 도시 생성 마스터 시스템 (기술 상세)
- [`EXPANSION_ROADMAP.md`](EXPANSION_ROADMAP.md) — 글로벌 확장 로드맵 (비전)
- [`CITY_EXPANSION_TRACKER.md`](CITY_EXPANSION_TRACKER.md) — 도시별 진행 상황 트래커
- [`CITY_LAUNCH_PROPOSAL_KO.md`](CITY_LAUNCH_PROPOSAL_KO.md) — 도시 런치 제안서
- [`EXECUTION_GUIDELINES.md`](EXECUTION_GUIDELINES.md) — 실행 규칙 전반

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-05-18 (v1.0) | 초안 — 리서치 에이전트 프롬프트 + 33개 도시 큐 + 빌드 프로세스 + 품질 체크리스트 + 2주 스케줄 |
