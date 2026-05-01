# HebronGuide — City Expansion Prompt v1.0

> **사용법**: 이 파일 전체를 Claude Code에 붙여 넣고, `[[CITY_*]]` 자리표시자만 도시별 데이터로 교체. 시애틀 패턴을 따라 새 도시가 30분 내 완성됩니다.

> **시애틀 = 황금 표준**. 모든 새 도시는 시애틀의 5층 아키텍처(Hub → City Dashboard → Section → Item → Search)와 6단계 × 4섹션 = 24섹션 구조를 그대로 복제합니다.

---

## 🎯 사용 시나리오

```bash
cd hebronguide/
claude
```

Claude Code 세션에서 본 파일 내용을 그대로 붙여넣기 → `[[ ]]` 부분만 도시별 데이터로 교체 → "위 명세대로 작업해줘" 한마디로 새 도시 생성.

---

## 📋 도시 데이터 입력 양식 (Step 0)

작업 시작 전 아래 데이터를 미리 채워주세요. 이 데이터가 cityConfig.ts의 1차 입력이 됩니다.

```yaml
city:
  id:                  [[CITY_ID]]              # 예: dallas, la, sf, newyork
  name_en:             [[CITY_NAME_EN]]         # 예: Dallas
  name_ko:             [[CITY_NAME_KO]]         # 예: 달라스
  name_es:             [[CITY_NAME_ES]]         # 예: Dallas
  region:              [[REGION]]                # 예: Texas, USA
  country:             [[COUNTRY]]               # 예: USA / Canada
  flag_emoji:          [[FLAG]]                  # 예: 🇺🇸
  city_emoji:          [[CITY_EMOJI]]            # 예: 🤠 (도시 정체성)
  hero_image_url:      [[UNSPLASH_URL]]          # 1600px 고화질
  timezone:            [[TIMEZONE]]              # 예: America/Chicago
  korean_population:   [[KR_POP]]                # 재외동포청 기준
  median_rent_1br:     [[RENT_USD]]              # 1베드룸 월세 USD
  weather_lat_lng:     [[LAT, LNG]]              # NWS API 좌표
  consulate_phone:     [[PHONE]]                 # 한국 총영사관 전화
  airport_code:        [[IATA]]                  # 예: DFW
  primary_color:       [[HEX]]                   # 도시 액센트 컬러
```

---

## 🏗 5층 아키텍처 명세 (시애틀 표준)

### Layer 1 — Hub (이미 완성)
- 위치: `hebronguide.com/`
- 동작: 8개+ 도시 한눈에 보이는 대시보드
- 새 도시 추가 시: `index.html`의 `<nav class="bento">` 안에 카드 1개 추가만

### Layer 2 — City Dashboard (이번에 생성)
- 위치: `hebronguide.com/[[CITY_ID]]/`
- 구조: 
  - 56px sticky nav (검색 + theme/lang)
  - 컴팩트 히어로 (도시명 + 4개 quick cards)
  - 4-segment selector (Newcomer / Resident / Traveler / Returner)
  - 6-phase journey timeline
  - 24개 섹션 카드 (6×4 그리드)
  - Floating AI 컨시어지

### Layer 3 — Section Detail (다음 단계)
- 위치: `hebronguide.com/[[CITY_ID]]/[[SECTION_ID]]/`
- 예: `/seattle/mart/` → 시애틀 한인 마트 12곳 리스트
- 구조: 검색 + 필터 + 검증 배지 + 지도

### Layer 4 — Item Detail (다음 단계)
- 위치: `hebronguide.com/[[CITY_ID]]/[[SECTION_ID]]/[[ITEM_ID]]/`
- 예: `/seattle/mart/h-mart-lynnwood/`
- 구조: 사진 갤러리 + 영업시간 + 한국어 직원 여부 + 마지막 검증일

### Layer 5 — Search & AI Concierge (전 도시 횡단)
- 검색: 모든 도시·섹션·아이템에 거쳐 한 번에 검색
- AI: `api/ask.js` 엔드포인트 + 도시 컨텍스트 자동 주입

---

## 🗺 24개 섹션 표준 구조 (모든 도시 공통)

```yaml
phase_1_arrival_week:           # ✈️ 도착 1주
  - airport:        공항·교통       # IATA, 한인 픽업, 라이드쉐어
  - temp_stay:      임시 숙소        # Airbnb·한인민박·호텔
  - sim_internet:   SIM·인터넷       # T-Mobile·Mint·Spectrum
  - bank:           은행 계좌        # 한국어 직원 있는 지점

phase_2_first_month:            # 🏡 첫달 정착
  - housing:        장기 주거        # 아파트·하우스·한인 부동산
  - license:        운전면허         # DMV/DOL 절차·한국어 가이드
  - health:         의료·보험        # 한인 병원·보험사
  - documents:      비자·서류        # SSN·I-94·번역·공증

phase_3_daily_life:             # 🛒 일상 생활
  - korean_mart:    한인 마트        # H Mart·Paldo·로컬 마트
  - korean_food:    한식·식당        # BBQ·분식·찜·도시락
  - cafe:           카페·베이커리     # 파리바게뜨·로컬 카페
  - shopping:       쇼핑·생필품      # Costco·Target·화장품

phase_4_community:              # 🤝 한인 커뮤니티
  - churches:       한인 교회        # 교파별 분류, 신학적 입장 명시
  - groups:         모임·동호회      # 한인회·동창회·운동·스터디
  - events:         행사·축제        # 추석·설날·한국문화원 행사
  - media:          한인 미디어      # 한국일보·라디오·유튜브 채널

phase_5_growth:                 # 🎓 성장·경력
  - schools:        학교·교육        # K-12·대학·한국학교·학원
  - jobs:           취업·직장        # 테크·한인기업·LinkedIn 가이드
  - tax:            세금·재정        # 한인 CPA·세무사·세금 가이드
  - learning:       평생 교육        # ESL·자격증·취미 클래스

phase_6_explore:                # 🏞️ 도시 탐방
  - nature:         자연·여행        # 국립공원·트레킹·캠핑
  - culture:        문화·예술        # 박물관·공연·미술관
  - sports:         스포츠·여가      # MLB·NFL·NBA·체육관
  - emergency:      긴급·안전        # 911·총영사관·24시간 한인 의사
```

---

## ⚙️ Claude Code 실행 명령 (복사 붙여넣기)

아래 블록을 Claude Code에 그대로 붙여넣고 `[[ ]]` 부분만 도시 데이터로 교체:

````
HebronGuide의 새 도시 [[CITY_NAME_EN]]를 추가합니다.

## 1. 디렉터리 생성
- hebronguide/ 폴더에서 시애틀 패턴 그대로 복제
- packages/[[CITY_ID]]/ 폴더 생성 (모노레포 구조 적용 시)
- 또는 단일 hebronguide/ 안에 cityConfig.ts에 [[CITY_ID]] 추가

## 2. cityConfig.ts 작성
- 위 "도시 데이터 입력 양식"의 모든 필드를 채워서 src/app/data/cities/[[CITY_ID]].ts 생성
- 시애틀 cityConfig.ts를 템플릿으로 사용

## 3. 빌드 설정
- vite.config.ts의 base를 '/[[CITY_ID]]/'로
- VitePWA manifest의 name·start_url·scope·icons 모두 '/[[CITY_ID]]/' 패턴으로 적용
- routes.tsx의 createBrowserRouter basename을 '/[[CITY_ID]]'로

## 4. vercel.json 업데이트
- /[[CITY_ID]]/(.*)  →  /[[CITY_ID]]/index.html rewrite 추가
- /[[CITY_ID]]       →  /[[CITY_ID]]/index.html

## 5. SEO 자동 생성
- sitemap.xml에 https://hebronguide.com/[[CITY_ID]]/ 항목 추가 (priority 0.9)
- llms.txt 도시 섹션 추가 (인구·언어·주제 포함)
- index.html (Hub) 의 <nav class="bento">에 새 도시 카드 1개 추가

## 6. 24섹션 데이터 시드
- 시애틀 24섹션 구조를 그대로 복제하되 모든 데이터를 [[CITY_ID]]에 맞게 교체
- 각 섹션은 최소 5개의 검증된 항목 (Place 또는 Step)으로 시작
- 모든 항목에 한국어·영어·스페인어 명·설명·태그 포함
- 모든 항목에 마지막 확인 날짜·확인 방법 명시 (투명성 원칙)

## 7. 검증
- pnpm dev 로컬 검증 → http://localhost:5173/[[CITY_ID]]/ 접근
- 라이트/다크 토글 작동 확인
- EN/KO/ES 언어 전환 확인
- 24개 섹션 모두 표시 확인
- 4-segment 필터링 작동 확인
- AI 컨시어지 버튼 작동 확인 (api/ask.js의 systemPrompt에 [[CITY_ID]] 컨텍스트 주입)

## 8. 배포
- git checkout -b feat/expand-[[CITY_ID]]
- git add -A && git commit -m "feat([[CITY_ID]]): launch city guide"
- git push origin feat/expand-[[CITY_ID]]
- Vercel 자동 배포 → https://hebronguide.com/[[CITY_ID]]/ 검증

## 제약사항 (.ai-rules 준수)
- .env, secrets/, *config.js 등 민감 파일은 절대 수정하지 말고 설명만
- 모든 출처·확인 날짜를 데이터에 함께 입력 (투명성 원칙)
- 종교색은 표면에 노출하지 않고 푸터에만 운영 주체 명시
- 다국어는 영어가 기본, 한국어가 보조

위 8단계를 순차적으로 실행하고 각 단계 완료 시 보고해주세요.
````

---

## 🧪 도시별 변경 지점 체크리스트

새 도시 마이그레이션 시 반드시 변경되는 25곳:

### 코드 (5곳)
- [ ] `src/app/data/cities/[[CITY_ID]].ts` (cityConfig)
- [ ] `vite.config.ts` base path
- [ ] `vite.config.ts` PWA manifest
- [ ] `routes.tsx` basename
- [ ] `vercel.json` rewrite

### SEO (3곳)
- [ ] `sitemap.xml`에 도시 URL 추가
- [ ] `llms.txt` 도시 섹션 추가
- [ ] `index.html` Hub 도시 카드 추가

### 콘텐츠 (24섹션)
- [ ] Phase 1 — 4섹션 데이터 시드
- [ ] Phase 2 — 4섹션 데이터 시드
- [ ] Phase 3 — 4섹션 데이터 시드
- [ ] Phase 4 — 4섹션 데이터 시드
- [ ] Phase 5 — 4섹션 데이터 시드
- [ ] Phase 6 — 4섹션 데이터 시드

### 자산 (3곳)
- [ ] `public/[[CITY_ID]]/icon-192.png`
- [ ] `public/[[CITY_ID]]/icon-512.png`
- [ ] `public/[[CITY_ID]]/og-image.jpg` (1200×630, 카카오톡 미리보기용)

---

## 🌊 Living/Ambient 데이터 설계 (선택)

`hebronguide.html`의 Living Landing 컨셉을 시애틀에서 검증한 후, 새 도시에도 적용:

```yaml
ambient_data_sources:
  weather:
    api: NWS (미국) 또는 Environment Canada (캐나다)
    refresh: 10분
  fx:
    api: ExchangeRate-API
    refresh: 1시간
    pair: KRW/USD (또는 KRW/CAD)
  ssn_wait:
    source: SSA 공식 (수동 업데이트)
    refresh: 주 1회
  flight_price:
    api: Google Flights API
    route: ICN → [[IATA]]
    refresh: 일 1회
  rent_trend:
    source: Zillow/Redfin (수동)
    refresh: 월 1회
  cherry_blossom: # 시즌 한정
    source: 도시별 공원 공식 발표
    refresh: 일 1회 (3-5월)
```

---

## 🔮 미래 자동화 (Phase 5+)

새 도시 30분 → 5분으로 줄이려면:

1. **Auto-seeding**: GPT-4 또는 Claude Sonnet으로 24섹션 초기 데이터 자동 생성
   - 입력: 도시 이름 + Wikipedia URL + 한인회 연락처
   - 출력: 24섹션 × 평균 8개 항목 = 약 192개 검증 후보 생성
   - 검증: 사람이 1주일 내 검증·확정
2. **Image automation**: Unsplash API로 도시별 히어로 이미지 자동 매칭
3. **i18n automation**: DeepL API로 영어→한국어·스페인어 일괄 번역
4. **One-command deploy**: `pnpm hebron:expand --city=dallas` 스크립트로 1분 내 신규 도시 부트스트랩

---

## 📜 도시 검증 기준 (출시 전 체크)

새 도시는 출시 전 다음 5가지를 통과해야 함 (시애틀 황금 표준):

1. **Settler's Eye**: 24섹션 모두 그 도시 거주 한인이 검증
2. **Day-One Ready**: Phase 1·2(도착~첫달) 정보가 도착 첫날부터 사용 가능
3. **Locally Verified**: 모든 업소·연락처 마지막 확인 7일 이내
4. **Transparency**: 각 항목에 출처·확인 날짜·이해충돌 명시
5. **Multilingual**: 모든 콘텐츠 EN/KO 필수, ES 권장

---

## 🚀 첫 확장 도시 추천 순서 (2027년)

| 순위 | 도시 | 이유 | 예상 개발 기간 |
|-----|------|------|--------------|
| 1 | 달라스 | 13만 한인, 시애틀과 시차 가까움, 사역 거점 | 4주 |
| 2 | LA | 60만 한인, 최대 시장, 검증 데이터 풍부 | 6주 |
| 3 | 뉴욕·NJ | 50만 한인, 동부 거점 | 6주 |

3개 도시 동시 진행 시 8주 안에 4개 도시 시스템 완성. 시애틀에서 검증된 시스템이므로 도시별 전담자 1명 + 본사 검수자 1명만으로 가능.

---

**문서 버전**: v1.0 (2026-04-30)
**기반 도시**: 시애틀 (Seattle Washington USA)
**다음 갱신**: 달라스 1차 시도 후 lessons learned 반영하여 v1.1 발행
