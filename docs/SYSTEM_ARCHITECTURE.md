# HebronGuide — System Architecture

> 생성: 2026-05-20 | 스택: React 18 + Vite + Vercel + Supabase + Anthropic

---

## 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HEBRONGUIDE SYSTEM ARCHITECTURE                  │
│                         (2026-05 기준)                               │
└─────────────────────────────────────────────────────────────────────┘

CLIENT LAYER (브라우저 / 모바일 PWA)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │   HebronGuide.tsx    │  │  Public HTML 페이지│  │ pastor- │ │
│  │  (React 18 + Vite)   │  │  (67+ 도시 SPA)   │  │ dash.html│ │
│  │  • 11탭 네비게이션   │  │  • story-*.html   │  │ (Supabase│ │
│  │  • CityConfig 라우팅 │  │  • church-guide   │  │  Auth)   │ │
│  │  • AI 컨시어지 UI    │  │  • partner pages  │  └──────────┘ │
│  │  • Tailwind CSS 4    │  └──────────────────┘               │
│  └──────────────────────┘                                     │
│                                                                 │
│  Service Worker (Workbox PWA)                                   │
│  • NetworkFirst: JS/CSS 번들                                    │
│  • CacheFirst: 폰트, 아이콘                                     │
│  • 오프라인 폴백: /offline.html                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────────┐
│                   VERCEL EDGE NETWORK                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  vercel.json — SPA 라우팅 (64+ 도시)                      │  │
│  │  { "source": "/seattle/(.*)", "dest": "/seattle/index.html" } │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  SERVERLESS / EDGE FUNCTIONS (api/)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ ai-router.js │  │pastor-       │  │ submit-church.js   │  │
│  │ (Edge, T1/2/3│  │insights.js   │  │ submit-listing.js  │  │
│  │  Tier 판별)  │  │(Node, Opus)  │  │ ad-generator.js    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────┘  │
└─────────┼─────────────────┼───────────────────────────────────┘
          │                 │
     ┌────▼─────┐    ┌──────▼──────────────────────────────────┐
     │ ANTHROPIC │    │            SUPABASE                     │
     │   API     │    │                                         │
     │ ┌───────┐ │    │  DB (Postgres)     Auth                 │
     │ │ Haiku │ │    │  • churches        • pastor_partners    │
     │ │ T1    │ │    │  • restaurants     • Magic Link OTP     │
     │ └───────┘ │    │  • cafes           • JWT 검증           │
     │ ┌───────┐ │    │  • areas                                │
     │ │Sonnet │ │    │  • settle_week1    RLS Policies         │
     │ │ T2    │ │    │  • ai_query_logs   • anon: INSERT only  │
     │ └───────┘ │    │  • stories         • pastor: SELECT     │
     │ ┌───────┐ │    │  • pastor_insights_cache                │
     │ │ Opus  │ │    │  • pastor_partners                      │
     │ │ T3    │ │    └─────────────────────────────────────────┘
     │ └───────┘ │
     └───────────┘
```

---

## 기술 스택 상세

### Frontend

| 항목 | 기술 | 버전 |
|---|---|---|
| UI 프레임워크 | React | 18 |
| 빌드 도구 | Vite | 6.3.5 |
| 언어 | TypeScript | 5.x |
| 스타일링 | Tailwind CSS | 4 |
| PWA | Workbox | 최신 |
| 상태 관리 | React Context + useState | — |
| 라우팅 | URL pathname 기반 (`useCityConfig()`) | — |

### Backend

| 항목 | 기술 | 용도 |
|---|---|---|
| 호스팅 | Vercel | SPA 배포 + Edge Functions |
| 데이터베이스 | Supabase (Postgres) | 교회·식당·로그 등 |
| 인증 | Supabase Auth (Magic Link) | 파트너 대시보드 |
| AI | Anthropic Claude API | Haiku/Sonnet/Opus |
| 캐시 | Vercel KV (Edge Cache) | Tier1 응답 캐시 |

### 빌드 파이프라인

```
[개발자 로컬]
  └─ npm run build (Vite)
       │
       ▼
  [hebronguide/dist/]  ← 빌드 결과 (git 추적됨)
       │
       ▼
  [build.sh 실행]
  for city in [64개 도시]; do
    cp dist/* public/${city}/
    sed -i "s/CITY_NAME/${city}/g" public/${city}/index.html
    # SEO 메타: title, description, og:image, canonical
  done
       │
       ▼
  [git push origin main]
       │
       ▼
  [Vercel 자동 배포] ← GitHub webhook
  public/ → CDN 엣지 배포 (64+ 도시 폴더)
```

---

## AI 데이터 플로우

```
사용자 질문 입력 (UI)
       │
       ▼
POST /api/ai-router
  { userMessage, city, cityName, lang }
       │
       ▼
detectTier(question)
  ├── TIER1_PATTERNS 매칭 → tier1 (단순 조회)
  ├── TIER3_PATTERNS 매칭 → tier3 (사역 분석)
  └── 기본값 → tier2 (정착 상담)
       │
  ┌────┴────────────────────────────┐
  ▼                                 ▼
[Tier1]                          [Tier2]
Claude Haiku                   Claude Sonnet
max_tokens: 200                max_tokens: 500
< 100ms                        500ms - 2s
  │                                 │
  ▼                                 ▼
응답 반환                        응답 반환
  │                                 │
  └─────────────┬───────────────────┘
                │
                ▼
       ai_query_logs INSERT (비동기)
       { city_slug, question[200자], tier, category, lang }

[Tier3 — 목사 대시보드만]
POST /api/pastor-insights (Bearer token 필요)
  → Supabase ai_query_logs 조회 (30일)
  → 집계 (카테고리, 키워드)
  → Claude Opus (max_tokens: 1200)
  → pastor_insights_cache UPSERT
  → 대시보드에 반환
```

---

## 데이터베이스 스키마

### 기존 테이블 (Supabase)

```sql
-- 교회 (city별 데이터)
churches (id, city_slug, name, name_en, tier, address, phone, website, desc, ...)

-- 식당·카페
restaurants (id, city_slug, name, ...)
cafes (id, city_slug, name, ...)

-- 지역 정보
areas (id, city_slug, name, ...)

-- 정착 가이드
settle_week1 (id, city_slug, step, content_ko, content_en, ...)
```

### 신규 테이블

```sql
-- 목사 파트너 인증 (Magic Link 이메일 로그인)
CREATE TABLE pastor_partners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  church_name TEXT,
  city_slug   TEXT,
  country     TEXT,
  tier        INT DEFAULT 1,  -- 1=기본, 2=허브교회, 3=앵커
  joined_at   TIMESTAMPTZ DEFAULT now(),
  verified    BOOLEAN DEFAULT false
);

-- 이달의 이야기 메타데이터
CREATE TABLE stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug    TEXT NOT NULL,
  title_ko     TEXT NOT NULL,
  title_en     TEXT,
  slug         TEXT UNIQUE NOT NULL,
  html_file    TEXT,
  author_name  TEXT,
  source_ref   TEXT,
  published_at DATE,
  act1_ko      TEXT,  -- 도착
  act2_ko      TEXT,  -- 아픔
  act3_ko      TEXT,  -- 만남
  act4_ko      TEXT,  -- 변화
  act5_ko      TEXT,  -- 희망·재미·감사
  featured     BOOLEAN DEFAULT false
);

-- AI 질의 로그 (사역 인사이트 원천 데이터)
CREATE TABLE ai_query_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug  TEXT,
  question   TEXT NOT NULL,      -- 200자 제한
  tier       INT,                -- 1/2/3
  category   TEXT,               -- church/visa/food/job/help/etc.
  lang       TEXT DEFAULT 'ko',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인사이트 분석 캐시 (월별)
CREATE TABLE pastor_insights_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug    TEXT NOT NULL,
  period       TEXT,             -- "2026-05" 형식
  insights_json JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS 정책

```sql
-- ai_query_logs: 누구나 INSERT, 목사만 SELECT
ALTER TABLE ai_query_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON ai_query_logs
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "pastor_select" ON ai_query_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM pastor_partners WHERE verified = true
    )
  );
```

---

## 파일 구조 (핵심만)

```
01_HebronGuide/
├── CLAUDE.md                    ← Claude Code 규칙 (최우선)
├── api/
│   ├── ask.js                   ← AI Q&A (기존)
│   ├── ai-router.js             ← Tier 1/2/3 라우터 (NEW)
│   ├── pastor-insights.js       ← 사역 인사이트 (NEW)
│   ├── ad-generator.js
│   ├── submit-church.js
│   └── submit-listing.js
├── hebronguide/
│   ├── src/app/
│   │   ├── components/
│   │   │   └── HebronGuide.tsx  ← 메인 앱 (~20,000줄)
│   │   └── data/
│   │       ├── defaults.ts      ← 시애틀 기본 데이터
│   │       ├── cityTemplate.ts  ← 타입 + 템플릿 (NEW)
│   │       └── prompts/
│   │           ├── tier1.json   ← Haiku 프롬프트 (NEW)
│   │           ├── tier2.json   ← Sonnet 프롬프트 (NEW)
│   │           └── tier3.json   ← Opus 프롬프트 (NEW)
│   ├── public/
│   │   ├── pastor-dashboard.html ← 파트너 대시보드 (NEW)
│   │   ├── church-guide.html
│   │   ├── story-*.html
│   │   └── ...
│   └── dist/                    ← 빌드 결과 (git 추적)
├── docs/
│   ├── IA_STRUCTURE.md          ← 이 파일의 자매 문서 (NEW)
│   ├── SYSTEM_ARCHITECTURE.md  ← 이 파일 (NEW)
│   ├── STORY_GUIDELINES.md      ← K-드라마 5막 가이드
│   └── ...
├── build.sh                     ← 배포 빌드 스크립트
├── vercel.json                  ← SPA 라우팅 규칙
└── index.html                   ← 홈 페이지
```

---

## 보안 모델

```
공개 접근 (anon):
  ├── 모든 도시 페이지 읽기
  ├── AI 질의 (api/ai-router.js)
  ├── ai_query_logs INSERT
  └── 교회·식당 데이터 읽기

인증 필요 (pastor_partners.verified = true):
  ├── pastor-dashboard.html
  ├── api/pastor-insights.js
  ├── ai_query_logs SELECT
  └── pastor_insights_cache SELECT

관리자 전용 (Supabase 대시보드):
  ├── pastor_partners 관리
  ├── churches 등록·수정
  └── stories 등록·수정
```

---

## 성능 목표

| 지표 | 목표값 | 현재 (예상) |
|---|---|---|
| Tier1 AI 응답 | < 100ms | ~80ms (캐시 히트) |
| Tier2 AI 응답 | < 2s | ~1.2s |
| Tier3 AI 응답 | < 30s (비동기) | ~8-15s |
| 도시 페이지 FCP | < 1.5s | ~1.2s |
| PWA 오프라인 | 핵심 기능 동작 | ✅ |
| Lighthouse | > 85점 | ~87점 |

---

## 환경 변수 (Vercel)

```
ANTHROPIC_API_KEY       ← Claude API 키
SUPABASE_URL            ← Supabase 프로젝트 URL
SUPABASE_ANON_KEY       ← 공개 anon 키
SUPABASE_SERVICE_KEY    ← 서버사이드 service_role 키
```

---

*정본: 이 파일 | 관련 문서: `docs/IA_STRUCTURE.md`, `CLAUDE.md`*
*다음 업데이트: 새 API 추가 또는 스택 변경 시*
