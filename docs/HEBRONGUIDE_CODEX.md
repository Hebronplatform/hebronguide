# HebronGuide Codex — 통합 시스템 설계 문서
> 버전: 1.0 | 작성: 2026-06-03 | 폴 김 목사·HebronGuide
> "환대는 복음이 흐르는 길이다."

---

## 서문: 헤브론의 제단 (창세기 13:14–18)

> *"롯이 아브람을 떠난 후에 여호와께서 아브람에게 이르시되 눈을 들어 너 있는 곳에서 북쪽과 남쪽 그리고 동쪽과 서쪽을 바라보라... 일어나 그 땅을 종과 횡으로 두루 다니라 내가 그것을 네게 주리라 이에 아브람이 장막을 옮겨 헤브론에 있는 마므레 상수리 수풀에 이르러 거기 거주하며 여호와를 위하여 제단을 쌓았더라"*

**HebronGuide의 DNA:**
- **보라 (See)** → 하나님이 보여주신 비전
- **걸어라 (Walk)** → 순종과 헌신
- **쌓으라 (Build)** → 예배·공동체·제단
- **헤브론 (Hebron)** → 연합·결속·동맹

---

## Part 1. 신학적 기반 (Theological Foundation)

### 1.1 핵심 본문

| 본문 | 주제 | HebronGuide 적용 |
|------|------|-----------------|
| 창 13:14–18 | 비전·약속·헌신 | 플랫폼의 정체성 |
| 창 18장 | 환대·중보·약속 | 운영 방식 |
| 히 13:2 | 나그네 환대 = 하나님 환대 | 이민자 섬김의 신학 |
| 계 7:9–17 | 모든 민족의 예배 | 50년 비전 |
| 막 10:45 | 섬기러 오심 | 리더십 원칙 |

### 1.2 사중 신학 프레임워크

```
1) 환대 신학 (Hospitality Theology)
   낯선 자를 섬기는 것 = 하나님을 섬기는 것

2) 디아스포라 신학 (Diaspora Theology)
   흩어짐은 하나님의 선교 전략

3) 성령 공동체 (Spirit-led Community)
   인공지능이 아닌 성령이 인도하는 공동체

4) 디지털 공동체 신학 (Digital Ecclesiology)
   디지털 공간도 하나님 나라의 영역
```

### 1.3 복음이 흐르는 경로

```
환대 → 관계 → 신뢰 → 대화 → 복음 → 공동체 → 제자 → 재헌신
         ↑
    HebronGuide가 이 흐름을 디지털로 지원
```

---

## Part 2. 5~50년 Kingdom Movement 비전

### 2.1 계시록 7장 비전

> *"이 일 후에 내가 보니 각 나라와 족속과 백성과 방언에서 아무도 능히 셀 수 없는 큰 무리가 나와 흰 옷을 입고 손에 종려 가지를 들고 보좌 앞과 어린 양 앞에 서서"* (계 7:9)

**HebronGuide의 역할:** 이 예배를 준비하는 글로벌 환대 생태계

### 2.2 단계별 로드맵

```
Phase 1  (2026)    71 → 120개 도시    파트너 교회 500개
Phase 2  (2027)    200개 도시         ML 기반 개인화 출시
Phase 3  (2028)    300개 도시         Hebron Gig Services 확장
Phase 4  (2029)    400개 도시         다국어 10개 언어
Phase 5  (2030)    500개 도시         글로벌 환대 컨퍼런스
Phase 6  (2031–35) 지속 성장          5개 대륙 완성
Phase 7  (2036–50) Kingdom Movement  계 7장 비전 향해
```

### 2.3 유연성 원칙

> "5년 안에 폭발할 수도, 50년이 걸릴 수도 있다. 하나님의 때에 맡긴다."

---

## Part 3. 2030년 500개 도시 확장 전략

### 3.1 도시 선정 기준

| 우선순위 | 기준 | 데이터 소스 |
|---------|------|-----------|
| 1 | 한인 인구 5,000명 이상 | 재외동포청 통계 |
| 2 | 한인 교회 3개 이상 | KCMUSA 디렉토리 |
| 3 | 이민자 유입 증가율 | US Census ACS |
| 4 | HebronGuide 파트너 교회 존재 | 내부 DB |

### 3.2 도시 자동 생성 시스템

```
1. 새 도시 요청 접수 (city-request.html)
2. 인구 기준 자동 검증
3. 기본 템플릿 자동 생성 (CityTemplate)
4. 파트너 교회 자동 연결
5. AI 콘텐츠 초안 생성
6. 관리자 검토 → 72시간 내 라이브
```

### 3.3 다국어 확장 계획

```
2026: 한국어·영어 (현재)
2027: 스페인어·중국어
2028: 일본어·베트남어
2029: 포르투갈어·독일어
2030: 프랑스어·아랍어
```

---

## Part 4. 전체 시스템 아키텍처

### 4.1 기술 스택

```
Frontend:    React 18 + TypeScript + Vite 6 + Tailwind CSS 4
Backend:     Vercel Edge Functions (Node.js)
Database:    Supabase (PostgreSQL) + Row Level Security
Auth:        Supabase Auth (Magic Link + Email/Password)
AI/ML:       Anthropic Claude API (Tier 1/2/3 라우팅)
Hosting:     Vercel (CDN + 71개 도시 정적 배포)
Email:       Gmail + Apps Script 자동화
Analytics:   Supabase 실시간 + 관리자 대시보드
```

### 4.2 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                    HEBRONGUIDE ECOSYSTEM                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │HebronGuide│  │NanuriWeb │  │NanuriHome│  │  Gig     │   │
│  │ (메인앱)  │  │(웹제작)  │  │(부동산)  │  │Services  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └──────────────┴──────────────┴──────────────┘        │
│                         Hebron Platform LLC                 │
│                              │                              │
│              ┌───────────────┼───────────────┐             │
│         Supabase          Vercel          Apps Script       │
│          (DB)          (배포·AI)       (자동화·이메일)       │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 AI Tier 라우팅

```
Tier 1 (Edge <100ms):   단순 조회·캐시 → Claude Haiku
Tier 2 (Server 1-2s):   복합 검색·분석 → Claude Sonnet
Tier 3 (Async 5-30s):   목사 인사이트·ML → Claude Opus
```

---

## Part 5. 데이터베이스 스키마

### 5.1 핵심 테이블

```sql
-- 교회
CREATE TABLE churches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,           -- 한국어 교회명
  name_en         TEXT,                    -- 영문명
  city_slug       TEXT,                    -- HebronGuide 도시 코드
  denomination    TEXT,                    -- 교단
  pastor          TEXT,                    -- 담임목사명
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  service_time    TEXT,                    -- 예배시간
  description     TEXT,
  hebron_partner  BOOLEAN DEFAULT false,   -- 협력교회 여부
  hcmi            BOOLEAN DEFAULT false,   -- 가정교회 여부
  tier            INT DEFAULT 2,           -- 1=파트너, 2=일반
  active          BOOLEAN DEFAULT true,
  source          TEXT,                    -- 등록 출처
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 커뮤니티 아이템 (사업체·행사·홍보)
CREATE TABLE community_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT,  -- business|church|event|promo|chaplain
  city_slug   TEXT,
  name        TEXT NOT NULL,
  type        TEXT,
  description TEXT,
  phone       TEXT,
  email       TEXT,
  website     TEXT,
  status      TEXT DEFAULT 'pending',  -- pending|approved|rejected
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 파트너 목사
CREATE TABLE pastor_partners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  church_name TEXT,
  city_slug   TEXT,
  tier        INT DEFAULT 1,  -- 1=기본, 2=허브, 3=앵커
  verified    BOOLEAN DEFAULT false,
  joined_at   TIMESTAMPTZ DEFAULT now()
);

-- 채플린 파트너 (신규)
CREATE TABLE chaplain_partners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  chaplain_type TEXT,  -- prison|immigration|hospital|military|university
  organization TEXT,
  city_slug   TEXT,
  email       TEXT,
  phone       TEXT,
  description TEXT,
  verified    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Hebron Gig Services (향후)
CREATE TABLE gig_services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID,
  service_type TEXT,  -- guide|interpreter|driver|welcome|mentor
  city_slug   TEXT,
  title       TEXT,
  description TEXT,
  price_range TEXT,
  contact     TEXT,
  verified    BOOLEAN DEFAULT false,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- AI 질의 로그
CREATE TABLE ai_query_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug  TEXT,
  question   VARCHAR(200) NOT NULL,
  tier       INT,
  category   TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 이야기 (Stories)
CREATE TABLE stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug    TEXT NOT NULL,
  title_ko     TEXT NOT NULL,
  title_en     TEXT,
  slug         TEXT UNIQUE,
  act1_ko      TEXT,
  act2_ko      TEXT,
  act3_ko      TEXT,
  act4_ko      TEXT,
  act5_ko      TEXT,
  featured     BOOLEAN DEFAULT false,
  published_at DATE,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## Part 6. API 설계

### 6.1 엔드포인트

```
POST /api/ask              AI 질의 (Tier 1/2/3)
POST /api/admin-action     관리자 액션 (승인·삭제·수정)
POST /api/submit-form      파트너 신청 (교회·사업체·채플린·Gig)
POST /api/pastor-insights  목사 대시보드 인사이트
GET  /api/cities           도시 목록
GET  /api/stats            글로벌 통계
```

### 6.2 AI 라우터 (ai-router.js)

```javascript
// 질문 유형별 자동 Tier 분류
const TIER_RULES = {
  tier1: { patterns: [/교회 어디/i, /맛집/i, /top5/i], maxTokens: 150 },
  tier2: { patterns: [/비자/i, /취업/i, /정착/i],     maxTokens: 400 },
  tier3: { patterns: [/사역 인사이트/i, /분석/i],      maxTokens: 2000 },
};
```

---

## Part 7. UI/UX 구조

### 7.1 페이지 계층 (3단계 MAX 원칙)

```
hebronguide.com/                    ← 홈 (71개 도시 그리드)
hebronguide.com/[city]/             ← 도시 SPA
  ├── 홈 탭                         ← 히어로·바로가기
  ├── 정착 탭                       ← 비자·건강보험·은행·주거
  ├── 교회 탭                       ← Tier1파트너·가정교회·기타
  ├── 맛집 탭                       ← TOP5 한식·현지
  ├── 탐방 탭                       ← 월드컵·관광·이벤트
  ├── 도움 탭                       ← 긴급·법률·의료
  ├── 취업 탭                       ← 구인·비자·커리어
  ├── 교육 탭                       ← 학교·어학원
  ├── 생활비 탭                     ← 렌트·물가·환율
  ├── 한인 업소 탭                  ← 파트너 사업체 디렉토리
  └── 이야기 탭                     ← K드라마 5막 스토리

hebronguide.com/ad-request.html    ← 파트너 신청
hebronguide.com/pastor-dashboard.html  ← 목사 대시보드
hebronguide.com/partner-dashboard.html ← 사업체 대시보드
hebronguide.com/admin.html         ← 관리자 대시보드
hebronguide.com/faq.html           ← 자주 묻는 질문
```

### 7.2 브랜드 토큰

```css
--gold:   #C9A227  /* 헤브론 골드 — 비전·약속 */
--mint:   #6EE7B7  /* 민트 — 성장·환대 */
--navy:   #1B4F72  /* 네이비 — 신뢰·깊이 */
--bg:     #0d1117  /* 다크 배경 */
--text:   #ECFDF5  /* 기본 텍스트 */
```

### 7.3 디자인 원칙 (Apple 방식)

1. **3단계 MAX** — 홈→도시→탭 콘텐츠
2. **필드 3개** — 폼에 필수 입력 최소화
3. **큰 터치 영역** — 모바일 우선
4. **한 눈에** — 카드·배지로 핵심 정보 즉시 인식
5. **군더더기 없음** — 설명보다 행동 유도

---

## Part 8. 삼중 구조 운영 모델

### 8.1 역할 정의

```
교회 (Church)
  ├── 말씀·예배·영적 권위
  ├── 지역 공동체 중심
  └── 파트너 교회 → Tier 1 최상단 노출

성도 (Believers)
  ├── 관계·환대·섬김
  ├── 파트너 사업체 운영
  └── Hebron Gig 앰배서더

HebronGuide (Platform)
  ├── 연결·확장·데이터
  ├── AI 기반 개인화
  └── 글로벌 네트워크 구축
```

### 8.2 커뮤니티 역할

| 역할 | 설명 | 권한 |
|------|------|------|
| 방문자 | 앱 탐색·검색 | 읽기 |
| 사용자 | 교회·업소 연결 | 읽기+신청 |
| 파트너 | 교회·사업체 등록 | 대시보드 접근 |
| 채플린 | 특수 사역 연결 | 채플린 네트워크 |
| 도시 코디네이터 | 도시별 관리 | 도시 데이터 편집 |
| 관리자 | 전체 시스템 관리 | 전체 권한 |

---

## Part 9. Trust & Safety

### 9.1 교회 검증 프로세스

```
신청 접수
  ↓
자동 검증 (이메일·URL 유효성)
  ↓
이단 체크 (한국기독교이단상담소 DB 대조)
  ↓
관리자 승인 (24시간 내)
  ↓
파트너 인증 배지 부여
  ↓
정기 검토 (연 1회)
```

### 9.2 이단 필터링 기준

```
자동 차단: 신천지·JMS·하나님의교회·통일교·안상홍·구원파
주의 검토: 설립 2년 미만·담임목사 불명확·신학교 이력 없음
정상 처리: 공인 교단 소속·KCMUSA 등재·검증된 이메일
```

### 9.3 콘텐츠 가이드라인

- 주류·주점 업소 제외
- 성인·도박 관련 제외
- 허위 정보 제보 시 즉시 비활성화
- 삭제 요청 → 24시간 내 처리 (자동화)

---

## Part 10. Hebron Gig Services 구조

### 10.1 서비스 카테고리

| 서비스 | 설명 | 수익 구조 |
|--------|------|-----------|
| 로컬 가이드 | 도시 투어·공항 픽업 | 서비스료 |
| 정착 도우미 | 집 구하기·이사 | 시간당 |
| 통역·번역 | 병원·법원 동행 | 건당 |
| 환대 앰배서더 | 새 가족 첫 주 안내 | 성과급 |
| 도시 코디네이터 | 도시 콘텐츠 관리 | 월정액 |
| 로컬 크리에이터 | 유튜브·SNS 콘텐츠 | 광고 수익 분배 |

### 10.2 앰배서더 온보딩

```
1. ad-request.html → 앰배서더 신청
2. 파트너 교회 목사 추천서 (선택)
3. 기본 교육 (HebronGuide 정신·환대 신학)
4. 공인 앰배서더 배지 발급
5. 도시 네트워크 연결
6. 첫 서비스 → 피드백 → 검증
```

---

## Part 11. 지속 가능한 재정 모델

### 11.1 3중 수익 구조

```
1) 교회·기관 파트너십
   - 파트너 교회 연회비: $0 (무료 — 사역 철학 유지)
   - 허브교회 대시보드 프리미엄: $50/월
   - 교단 파트너십 계약: 협의

2) 플랫폼 수익
   - 프리미엄 비즈니스 배너: $50–200/월
   - Gig Services 플랫폼 수수료: 10–15%
   - 리더십 훈련 구독: $20/월
   - HebronGuide 컨퍼런스: 참가비

3) 글로벌 파트너십
   - World Relief·세기총 협력 사역비
   - ESG 기업 파트너십 (삼성·현대·LG 북미)
   - 글로벌 재단 그랜트
   - 이민 법무법인 협력
```

### 11.2 수익 목표

| 연도 | 목표 수익 | 주요 수익원 |
|------|---------|-----------|
| 2026 | $0 (사역 투자기) | 후원 |
| 2027 | $50K | Gig 수수료·배너 |
| 2028 | $200K | 구독·파트너십 |
| 2029 | $500K | 컨퍼런스·기업 |
| 2030 | $1M+ | 글로벌 생태계 |

---

## Part 12. ML/데이터 파이프라인

### 12.1 ML 기능 로드맵

```
2026 (현재): 규칙 기반 AI (Claude API Tier 1/2/3)
2027:        소그룹 추천 ML 모델
2028:        케어 필요 감지 (비정형 텍스트 분석)
2029:        이민자 여정 패턴 분석
2030:        개인화 추천 엔진 완성
```

### 12.2 데이터 수집 원칙

- 개인정보 비식별화 필수
- 질의 로그: 200자 제한
- 민감 정보 수집 금지
- GDPR·CCPA 준수
- 목사 인사이트 = 집계 데이터만

---

## Part 13. 운영 매뉴얼

### 13.1 일상 운영 체크리스트

```
매일:
□ Hebronplatform@gmail.com 확인 (파트너 신청·삭제 요청)
□ admin.html 로그인 → 대기 신청 처리
□ 월드컵 브리핑 확인 (6/11~7/19)

매주:
□ cleanDuplicateChurches 자동 실행 확인
□ 이메일 발송 계속 (sendEmails)
□ 새 파트너 환영 이메일 발송

매월:
□ 도시 수 업데이트 (CITY_COUNT_REGISTRY.md)
□ 파트너 현황 점검
□ 데이터 표준 갱신 (재외동포 통계)
```

### 13.2 위기 대응 프로세스

```
이단 제보 → 24시간 내 비활성화 → 관리자 검토 → 처리
삭제 요청 → 자동 감지 → 즉시 비활성화 → 확인 이메일
기술 오류 → Vercel 로그 확인 → GitHub 핫픽스 → 재배포
```

---

## Part 14. HebronGuide.com 웹사이트 구조

```
hebronguide.com (홈)
  ├── 비전 섹션 (창 13·18·계 7)
  ├── 플랫폼 소개
  ├── 71개+ 도시 선택 그리드
  ├── 파트너 교회 네트워크
  ├── Hebron Gig Services
  ├── 채플린 파트너
  ├── 후원·협력 문의
  └── 앱 다운로드 (PWA)

/about.html          ← 사역 철학·팀 소개
/faq.html            ← 자주 묻는 질문 (이민자·목사·사업체·채플린)
/ad-request.html     ← 파트너 신청 (교회·사업체·홍보·채플린)
/pastor-dashboard.html  ← 목사 전용
/partner-dashboard.html ← 사업체 전용
/admin.html          ← 관리자 전용
/story-submit.html   ← 이야기 제출
```

---

## Part 15. 핵심 원칙 요약 (Claude에게)

### 앞으로 모든 HebronGuide 작업 시 적용할 원칙

1. **3단계 MAX** — 어떤 흐름도 3클릭 이내
2. **정확도 최우선** — 없는 정보는 넣지 않는다
3. **최신 통계 우선** — 2025 재외동포현황 기준
4. **성경이 먼저** — 기능보다 신학적 정체성
5. **소비자 편의** — 목사·이민자·사업체 모두 쉽게
6. **자동화 우선** — 이메일·중복·트리거 모두 자동
7. **먼저 계획, 그 다음 실행** — 반복 실수 금지
8. **이메일은 Hebronplatform@gmail.com** 사용
9. **배포는 git push → Vercel 자동** 확인
10. **막10:45** — 섬기러 오신 자의 플랫폼

---

## 최종 선언

> **"헤브론가이드는 모든 민족, 모든 세대가**
> **주님께 돌아오게 하기 위한**
> **하나님 나라, 하나님의 선교를 이루기 위한**
> **브릿지 역할을 한다."**
> — 폴 김 목사 (2026)

> "양들이 흩어질 때도, HebronGuide는 목사님이 계속 목자가 될 수 있는 방법입니다."

---

*HebronGuide Codex v1.0 | 2026-06-03*
*다음 검토: 2026-12-31*
