# HebronGuide — Information Architecture (IA)

> 생성: 2026-05-20 | 원칙: 3단계 MAX (폴 김 목사 지시, 2026-05-14)

---

## 핵심 원칙

```
1단계: 홈 (hebronguide.com/)
2단계: 도시 (hebronguide.com/[city]/)
3단계: 탭 콘텐츠 (Settle / Church / Food / ...)
         ↓
    최종 행동 (전화, 지도, AI 질문, 이야기 읽기)
```

3단계를 넘어가지 않는다. 사용자가 **3번의 클릭 이내**에 원하는 정보에 도달해야 한다.

---

## Level 1 — 홈 (/)

**목적**: 64개 도시 탐색 + 브랜드 경험

```
hebronguide.com/
├── 히어로 섹션
│   ├── HebronGuide 로고·슬로건
│   ├── 이달의 이야기 배너 (K-드라마 썸네일 3개)
│   └── "도시를 선택하세요" CTA
│
├── 도시 그리드 (64개)
│   ├── 📍 북미 (Northern America) — US + Canada
│   ├── 📍 중남미 (Central/South America)
│   ├── 📍 유럽 (Europe)
│   ├── 📍 중동 (Western Asia / Gulf)
│   ├── 📍 동남아시아 (South-eastern Asia)
│   ├── 📍 한국 (Eastern Asia)
│   ├── 📍 일본 (Eastern Asia)
│   └── 📍 오세아니아 (Australia & NZ)
│
└── 푸터
    ├── 교회 등록 링크
    ├── 파트너 신청 링크
    └── 법인·저작권 (Hebron Platform LLC)
```

---

## Level 2 — 도시 페이지 (/[city]/)

**목적**: 그 도시에 도착한 이주자가 첫날부터 쓸 수 있는 원스톱 가이드

### 탭 우선순위 (왼쪽부터)

| # | 탭 | 핵심 콘텐츠 | 최우선 대상 |
|---|---|---|---|
| 1 | Home | 히어로 슬라이드 5장, 도시 통계, 디아스포라 정체성 | 신규 방문자 |
| 2 | Settle | 공항→비자→건강보험→은행→주거 단계별 가이드 | 도착 직후 |
| 3 | Church | 교회 리스트 (Tier1⭐ 우선), 지도, 등록 CTA | 정착 초기 |
| 4 | Food | 식당 TOP5 + 지도 링크 | 일상 |
| 5 | Explore | 관광·문화 TOP5 + 이달의 이야기 링크 | 일상 |
| 6 | Help | 긴급 연락처, 법률·언어 상담 | 위기 상황 |
| 7 | Jobs | 취업 정보, E-7/H-1B/Work Permit 링크 | 취업 준비 |
| 8 | Education | 학교·어학원 등록 | 자녀·학생 |
| 9 | Costs | 생활비 계산기 (임대·교통·식비) | 이사 전 계획 |
| 10 | Connect | 커뮤니티·소셜 연결 | 소속감 |
| 11 | Arrival | 도착 체크리스트 (공항→집→첫 주) | 도착 당일 |

### AI 컨시어지 (탭 공통)
```
하단 플로팅 버튼 "AI에게 물어보기" →
  질문 입력 →
  api/ai-router.js → Tier 1/2/3 →
  답변 표시
```

---

## Level 3 — 최종 행동 (탭 내 콘텐츠)

### Settle 탭 예시 (3단계 완결)

```
1단계: Settle 탭 클릭
2단계: 비자 섹션 펼치기
3단계: hikorea.go.kr 링크 클릭 (최종 행동)
```

### Church 탭 예시

```
1단계: Church 탭 클릭
2단계: 교회 카드 클릭 (상세 정보 토글)
3단계: 📞 전화 / 🗺️ 지도 / 🌐 웹사이트 (최종 행동)
```

---

## 별도 페이지 IA

### 이달의 이야기 (story-*)

```
/story-[city]-[nn].html
├── 헤더: HebronGuide 로고 + 언어 토글
├── 제목 + 도시 배지
├── 1막: 도착 (짧게)
├── 2막: 아픔 (구체적, K-드라마 깊이)
├── 3막: 만남
├── 4막: 변화
├── 5막: 희망 · 재미 · 감사
├── 출처 (목회 칼럼 등)
└── CTA: 내 도시 가이드 보기 + 이야기 제출하기
```

### 목사 대시보드 (/pastor-dashboard.html)

```
로그인 게이트 (Magic Link)
    ↓ (인증 성공)
대시보드
├── 이번 달 질문 현황 (통계 + 카테고리 차트)
├── AI 사역 인사이트 (Claude Opus 분석)
├── 이달의 키워드
└── 빠른 링크 (이야기 제출 / 교회 등록 / 팀 연락)
```

### 파트너 신청 (/hebron-partner-mobilize.html)

```
스크롤 1페이지
├── 비전 소개
├── 파트너 혜택 (3가지)
├── 3단계 신청 과정
├── 도시별 현황
└── 신청 CTA (Sticky Bottom Bar)
```

---

## URL 패턴 정의

| 패턴 | 설명 | 예시 |
|---|---|---|
| `/` | 홈 | hebronguide.com/ |
| `/[city]/` | 도시 SPA | /seattle/, /dallas/, /seoul/ |
| `/story-[city]-[nn].html` | 이야기 개별 | /story-seattle-01.html |
| `/[partner-page].html` | 파트너·안내 | /church-guide.html |
| `/pastor-dashboard.html` | 파트너 대시보드 | — |
| `/api/[endpoint]` | Vercel Edge Functions | /api/ai-router |

---

## 네비게이션 흐름도

```
구글 검색 "시애틀 한인 정착"
         │
         ▼
hebronguide.com/seattle/ (직접 랜딩)
         │
    ┌────┼────────────────────┐
    ▼    ▼                    ▼
 Settle  Church            Explore
 (정착)  (교회)             (탐방)
    │    │                    │
    ▼    ▼                    ▼
 비자   교회              이달의
 등록   전화·지도          이야기
    │
    ▼
AI 질문 → api/ai-router.js → 답변
```

---

## SEO 구조

### 각 도시 페이지 메타 (build.sh sed 치환)

```html
<title>[도시명] 한인 가이드 — HebronGuide</title>
<meta name="description" content="[도시명] 한인 이주자 정착 가이드. 비자·교회·식당·취업 정보.">
<meta property="og:title" content="[도시명] 한인 커뮤니티 가이드">
<meta property="og:image" content="https://hebronguide.com/[city]-og.jpg">
<link rel="canonical" href="https://hebronguide.com/[city]/">
```

### sitemap.xml 구조
```xml
<urlset>
  <url><loc>https://hebronguide.com/</loc></url>
  <!-- 64개 도시 -->
  <url><loc>https://hebronguide.com/seattle/</loc></url>
  ...
  <!-- 이야기 페이지 -->
  <url><loc>https://hebronguide.com/story-seattle-01.html</loc></url>
  ...
</urlset>
```

---

*정본: 이 파일 | 관련 문서: `docs/SYSTEM_ARCHITECTURE.md`, `CLAUDE.md`*
