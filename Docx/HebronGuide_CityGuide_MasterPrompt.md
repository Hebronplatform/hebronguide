# HebronGuide 도시 가이드 마스터 프롬프트
**버전**: 1.0 | **기준 모델**: 시애틀 가이드 | **작성일**: 2026년 4월 19일

> 이 프롬프트를 Claude에게 주면 어느 도시든 시애틀과 동일한 형식의  
> 한인 정착 가이드 PWA를 한 번에 생성할 수 있습니다.

---

## 사용법

아래 프롬프트에서 `[대괄호]` 안의 내용만 해당 도시 정보로 바꿔서 Claude에게 전달하세요.

---

---
# ════════════════════════════════════════════════════
# HEBRONGUIDE 도시 가이드 생성 마스터 프롬프트
# ════════════════════════════════════════════════════

## 생성 대상 도시 정보

- **도시명 (한국어)**: [뉴욕 / 샌프란시스코 / 내쉬빌 / ...]
- **도시명 (영어)**: [New York / San Francisco / Nashville / ...]
- **주(State)**: [New York / California / Tennessee / ...]
- **도시 별명**: [빅애플 / 베이 에리어 / 뮤직 시티 / ...]
- **도시 이모지**: [🗽 / 🌉 / 🎵 / ...]
- **주요 기업**: [Wall Street · UN 본부 / Google · Apple · Meta / 음악 산업 / ...]
- **한인 밀집 지역**: [플러싱 · 포트리 / 밀피타스 · 산호세 / 팔렌타인 애비뉴 / ...]
- **한인 인구**: [재외동포청 기준 최신 수치]
- **타임존**: [America/New_York / America/Los_Angeles / America/Chicago / ...]
- **도시 특징 Pills**: [예: "🗽 UN 본부", "🎰 월스트리트", "✈️ 인천 직항", ...]
- **Hero Stats 4개**: [인구수, 섹션수, 특징1, 특징2]
- **날씨 API 좌표**: [위도, 경도] (예: 40.7128, -74.0060)

---

## 생성 지시사항

다음 사양에 맞춰 **완전한 단일 HTML 파일** (`index.html`)을 생성해 주세요.  
시애틀 가이드와 **동일한 구조·디자인·기능**을 유지하되, 해당 도시 데이터로 채워야 합니다.

---

## ① 기술 사양 (변경 불가 — 모든 도시 동일)

```
- 단일 파일 PWA (Progressive Web App)
- 모바일 퍼스트, max-width: 480px
- 오프라인 캐시 지원 (Service Worker)
- 한국어/영어 토글 (data-ko / data-en 속성)
- 다크 테마 (#0d1117 배경)
- GitHub Pages 배포 호환
```

**필수 CSS 변수:**
```css
:root {
  --home-bg: #0d1117;
  --home-text: #f0f0f0;
  --card-bg: #1c2128;
  --border: rgba(255,255,255,0.08);
  --gold: #E9A84C;
  --green: #2D6A4F;
  --accent: #4A9EFF;
}
```

---

## ② 필수 기능 (변경 불가 — 모든 도시 동일)

### 실시간 시계 (날씨 위젯 내)
```javascript
// 해당 도시 타임존 + 한국 시각 동시 표시, 매초 갱신
🇺🇸 [도시명] YYYY.MM.DD HH:MM:SS
🇰🇷 한국    YYYY.MM.DD HH:MM:SS
```

### 날씨 위젯
```javascript
// Open-Meteo API (무료) — 해당 도시 좌표 사용
// 10분마다 자동 갱신
https://api.open-meteo.com/v1/forecast?latitude=[위도]&longitude=[경도]
&current=temperature_2m,weather_code,wind_speed_10m
&temperature_unit=fahrenheit&timezone=[타임존 URL인코딩]
```

### 30일 정착 체크리스트
- 총 24개 항목 (도시별 맞춤 체크리스트)
- 로컬스토리지 저장 (앱 재시작 후에도 유지)
- 진행률 바 표시

### 검색 기능
- 가이드 내 모든 텍스트 실시간 검색
- 한국어/영어 동시 검색

### PWA 설치 가이드
- iOS / Android / Desktop 각각 안내
- beforeinstallprompt 이벤트 처리

---

## ③ 필수 콘텐츠 섹션 (16개 — 도시별 데이터로 채우기)

각 섹션은 `app-overlay` 형식으로 구성. 탭 내비게이션 포함.

### 섹션 1: 정착가이드 (settle)
도시별 필수 정착 절차:
- SSN 발급 (Social Security Administration 현지 주소)
- 운전면허 교환/취득 (현지 DMV 정보)
- 은행 계좌 개설 (한국어 서비스 가능 은행)
- 휴대폰 개통 (한인 통신 대리점)
- 건강보험 가입
- 주민 등록 / 유틸리티 연결

### 섹션 2: 지역안내 (hood)
도시 내 한인 밀집 주요 지역 3~5곳:
- 지역명, 특징, 평균 월세, 한인 비율
- 한인 마트/식당/교회 분포
- 교통 접근성

### 섹션 3: 한인상권 (biz)
탭 구성: 전체 / 마트·식품 / 식당 / 서비스 / 금융
- 한인 마트 (주소, 전화, 웹사이트 링크)
- 한인 식당 (장르별)
- 한인 서비스업 (세탁, 미용, 자동차, 보험 등)
- 한인 금융 (은행, 보험, 세무사, 법무사)

### 섹션 4: 한인교회 (church)
- 주요 한인 교회 목록 (교단, 주소, 예배 시간, 웹사이트)
- 교회별 특징 (영어권, 1.5세, 청년부 등)

### 섹션 5: 교육 (edu)
- 공립학교 우수 학군
- 한국어 학교 / 토요 한글학교
- 대학교 (한인 학생회 정보)
- 학원 / 튜터링

### 섹션 6: 취업 (job)
- 지역 주요 고용주 (한인 다수 근무 기업)
- 한인 취업 커뮤니티 / 네트워크
- 이력서·면접 팁 (미국 현지화)
- 한인 전문직 협회

### 섹션 7: 의료 (health)
- 한국어 가능 의사/치과 목록
- 한인 운영 클리닉
- 한인 약국
- 응급실 위치
- 건강보험 안내

### 섹션 8: 교통 (transit)
- 대중교통 (버스/지하철/기차) 앱 및 요금
- 공항 ↔ 시내 교통
- 한인 카풀/라이드쉐어 커뮤니티
- 주차 정보

### 섹션 9: 생활비 (cost)
- 월세 평균 (지역별, 방 크기별)
- 식비, 교통비, 유틸리티 월 평균
- 한국 vs 현지 물가 비교
- 절약 팁

### 섹션 10: 커뮤니티 (comm)
- 한인회 / 한인 단체
- 한인 미디어 (신문, 라디오, 유튜브)
- 한인 행사 / 축제
- 온라인 커뮤니티 (카카오톡 오픈채팅 등)

### 섹션 11: 문화관광 (tour)
- 현지 필수 방문지 Top 10
- 한인 관련 명소
- 주변 당일치기 여행지
- 계절별 추천 활동

### 섹션 12: 음식 (food)
탭: 한식 / 아시안 / 현지 맛집
- 한식당 (분류별: 고기, 분식, 해산물, 뷔페 등)
- 현지인 추천 맛집
- 배달앱 (DoorDash, Uber Eats 현지 인기 음식)

### 섹션 13: 안전 (safety)
- 치안 주의 지역
- 자연재해 대비 (해당 도시별: 허리케인/지진/토네이도 등)
- 긴급 연락처
- 영사관 / 대사관 정보

### 섹션 14: 정부기관 (gov)
- 한국 영사관 / 총영사관 (주소, 전화, 업무 시간)
- 현지 시청 / 주요 정부기관
- DMV, IRS, USCIS 현지 사무소
- 공증 서비스

### 섹션 15: 30일 체크리스트 (check)
도착 첫날부터 30일까지 순서별 체크리스트:
```
Week 1: SIM 개통 → 거주지 확정 → SSN 신청 → 은행 개설
Week 2: 운전면허 → 건강보험 → 자동차 보험
Week 3: 학교 등록 → 직장 준비 → 커뮤니티 연결
Week 4: 생활 안정화 → 교회 정착 → 네트워크 구축
```

### 섹션 16: 긴급 (emerg)
- 911 (경찰/소방/구급)
- 영사관 긴급 전화
- 한인 의료 긴급 연락
- 자연재해 대피 정보
- 법률 긴급 도움 (한국어 가능 변호사)

---

## ④ 업소 정보 입력 형식 (모든 도시 동일)

모든 업소는 반드시 아래 형식 사용:

```html
<div class="ccard">
  <div class="ccard-name">업소명</div>
  <div class="ccard-desc">설명 (주소, 특징, 한국어 가능 여부)</div>
  <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);
              display:flex;flex-wrap:wrap;gap:8px;">
    <a href="https://공식웹사이트URL" target="_blank" rel="noopener"
       style="display:inline-flex;align-items:center;gap:4px;
              font-size:0.72rem;color:#6EE7B7;font-weight:700;">
      🔗 공식 웹사이트
    </a>
    <a href="https://maps.google.com/?q=업소명+도시명" target="_blank" rel="noopener"
       style="display:inline-flex;align-items:center;gap:4px;
              font-size:0.72rem;color:#6EE7B7;font-weight:700;">
      📍 지도
    </a>
  </div>
</div>
```

**⚠️ 절대 금지**: 텍스트로만 URL 표기 — 반드시 클릭 가능한 링크로

---

## ⑤ 데이터 정확성 원칙 (변경 불가)

1. **인구 통계**: 재외동포청 기준 사용 (U.S. Census 아님)
2. **모든 업소**: 공식 웹사이트 링크 필수
3. **주소·전화**: 실제 검증된 정보만 기입
4. **마지막 확인 날짜**: 각 섹션 하단에 표기
5. **출처 명시**: 통계·수치는 반드시 출처 표기

---

## ⑥ 히어로 카드 형식

```html
<div class="hero-card">
  <div class="hero-city">[도시영문명] · [주 영문명]</div>
  <div class="hero-title">
    <span data-ko>[도시한국명]<br>한인 완전 가이드</span>
    <span data-en>[도시영문명]<br><em>Korean Life Guide</em></span>
  </div>
  <p class="hero-sub">
    <span data-ko>새 이주자·방문자·관광객을 위한 실용 가이드 — [도시 슬로건]</span>
    <span data-en>Practical guide for newcomers, visitors & tourists — [영문 슬로건]</span>
  </p>
  <div class="hero-pills">
    [도시 특징 pill 4개]
  </div>
  <div class="hero-stats">
    <div class="hst">
      <div class="hst-n">[한인인구]</div>
      <div class="hst-l" data-ko>[주명] 한인</div>
      <div class="hst-l" data-en>Koreans in [주약자]</div>
    </div>
    [나머지 3개 stats]
  </div>
  <!-- 날씨 위젯 — 동일 구조 유지 -->
</div>
```

---

## ⑦ manifest.json 형식

```json
{
  "name": "HebronGuide [도시영문명]",
  "short_name": "[도시한국명]가이드",
  "description": "[도시한국명] 한인을 위한 정착·생활·커뮤니티 완전 가이드",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#0d1117",
  "theme_color": "#C9A227",
  "orientation": "portrait",
  "lang": "ko",
  "icons": [
    { "src": "./icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## ⑧ 폴더 구조 (도시별 동일)

```
hebronguide/
└── [도시영문소문자]/
    ├── index.html      ← 이 프롬프트로 생성하는 파일
    ├── manifest.json
    ├── sw.js           ← 시애틀과 동일 (도시명만 변경)
    ├── icon-192.png    ← 나침반 아이콘 (공통)
    └── icon-512.png    ← 나침반 아이콘 (공통)
```

---

## ⑨ 품질 체크리스트 (생성 후 반드시 확인)

생성된 파일에 다음이 모두 포함되었는지 확인:

- [ ] 실시간 시계 (해당 도시 + 한국 동시)
- [ ] 날씨 위젯 (Open-Meteo API, 10분 갱신)
- [ ] 한국어/영어 토글 작동
- [ ] 16개 섹션 모두 포함
- [ ] 30일 체크리스트 24개 항목
- [ ] 모든 업소에 클릭 가능한 링크
- [ ] 텍스트만 있는 URL 없음
- [ ] 인구 통계 출처 명시
- [ ] manifest.json 아이콘 경로 `./icon-192.png` (상대경로 확인)
- [ ] PWA 설치 가이드 포함
- [ ] 긴급 연락처 섹션 포함
- [ ] 영사관 정보 포함

---

## ⑩ 실제 사용 예시

### 뉴욕 가이드 생성 시 입력값

```
도시명 (한국어): 뉴욕
도시명 (영어): New York
주(State): New York State
도시 별명: 빅애플
도시 이모지: 🗽
주요 기업: Wall Street · UN 본부 · 패션·미디어 산업
한인 밀집 지역: 플러싱(퀸즈) · 포트리(NJ) · 맨해튼 코리아타운(32가)
한인 인구: 23만+ (재외동포청 2023, 뉴욕·뉴저지 광역)
타임존: America/New_York
Hero Pills: "🗽 UN 본부", "💰 월스트리트", "🎭 브로드웨이", "✈️ 인천 직항"
Hero Stats: 23만+(한인), 16(섹션), EST(시간대), A+(커뮤니티)
날씨 좌표: 40.7128, -74.0060
```

### 샌프란시스코 가이드 생성 시 입력값

```
도시명 (한국어): 샌프란시스코
도시명 (영어): San Francisco
주(State): California
도시 별명: 베이 에리어
도시 이모지: 🌉
주요 기업: Google · Apple · Meta · Salesforce · OpenAI
한인 밀집 지역: 밀피타스 · 산호세 · 산타클라라 · 팰로앨토
한인 인구: 11만+ (재외동포청 2023, 베이 에리어 전체)
타임존: America/Los_Angeles
Hero Pills: "💻 실리콘밸리", "🌉 금문교", "☀️ 연중 온화", "✈️ 인천 직항"
Hero Stats: 11만+(한인), 16(섹션), PST(시간대), A+(커뮤니티)
날씨 좌표: 37.7749, -122.4194
```

### 내쉬빌 가이드 생성 시 입력값

```
도시명 (한국어): 내쉬빌
도시명 (영어): Nashville
주(State): Tennessee
도시 별명: 뮤직 시티
도시 이모지: 🎵
주요 기업: 음악 산업 · Vanderbilt 대학병원 · HCA Healthcare · 제조업
한인 밀집 지역: 안티오크(Antioch) · 스매르나(Smyrna) · 브렌트우드
한인 인구: 1만 5천+ (재외동포청 2023, 테네시 전체)
타임존: America/Chicago
Hero Pills: "🎵 뮤직 시티", "0️⃣ 주 소득세 없음", "📈 급성장 도시", "🏥 의료 중심"
Hero Stats: 1.5만+(한인), 16(섹션), 0%(주 소득세), A(커뮤니티)
날씨 좌표: 36.1627, -86.7816
```

---

## 최종 프롬프트 실행 문장

위 정보를 채운 후 Claude에게 다음과 같이 요청하세요:

```
위의 HebronGuide 마스터 프롬프트 사양에 따라
[도시명] 한인 정착 가이드 PWA index.html을 완전하게 생성해줘.

입력값:
[위에서 채운 도시 정보 붙여넣기]

요구사항:
1. 단일 HTML 파일로 완성 (외부 JS/CSS 없이)
2. 16개 섹션 모두 포함
3. 실제 검증된 현지 한인 업소 정보로 채울 것
4. 모든 업소에 클릭 가능한 링크 포함
5. 시애틀 가이드와 동일한 디자인·기능 유지
```
---

**문서 정보**
- 작성: HebronGuide 프로젝트
- 기준 모델: hebronguide.com/seattle
- 최초 작성일: 2026년 4월 19일 (시애틀 기준)
- 이 프롬프트 자체도 업데이트가 필요하면 CLAUDE.md에 기록할 것
