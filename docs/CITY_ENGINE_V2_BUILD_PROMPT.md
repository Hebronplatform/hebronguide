# HebronGuide City Engine v2 — Claude Code 실행용 업그레이드 빌드 프롬프트

> **목적**: Copilot이 만든 범용 "City Engine v1"(TS 백엔드 + 새 Postgres + 헤드리스 CMS + AI 자동발행)을
> **HebronGuide 실제 스택에서 99% 그대로 작동**하고 **Hard Rule을 지키는** 버전으로 교체.
>
> **핵심 전환**:
> - ❌ AI 자동 발행 → ✅ **AI 초안 생성 + 사람(그 도시 산 한인) 검증 게이트 + 승인 후 발행**
> - ❌ 새 Postgres/pg → ✅ **기존 Supabase(REST)**
> - ❌ 헤드리스 CMS POST → ✅ **기존 발행 메커니즘**(HEBRON_CITIES + build.sh + sitemap)
> - ❌ 독립 TS 서비스 → ✅ **기존 `api/*.js` 서버리스 + `scripts/*.mjs`**
>
> **자동화 목표**: 새 도시 추가 시 **6개 파일 수작업**(하나만 빠져도 도시가 반쪽만 노출)을
> **1개 명령**으로 스캐폴딩. 목사님은 "검증·승인·배포"라는 중요한 판단에만 집중.

---

## ⚠️ 실행 규칙 (Claude Code가 반드시 지킴)

1. **계획 먼저 (원칙 5)**: 각 Stage 시작 전 **무엇을 만들/고칠지 3줄 요약 + 파일 목록**을 보여주고 **"진행할까요?" 확인 후** 파일 작성. 한 번에 10개 다 만들지 말 것.
2. **자동 발행·자동 배포 금지**: 어떤 단계도 사람 승인 없이 `git push`·Vercel 배포·도시 라이브 전환을 하지 않는다. 일요일 배포 금지(Chick-fil-A 1).
3. **AI = 초안만**: AI가 생성한 도시 데이터는 항상 `status:"draft"`. `verified_at`이 채워지기 전엔 절대 사이트에 노출 금지(Hard Rule "AI 추측 데이터"·"검증 안 된 정보").
4. **멱등성**: 모든 스크립트는 여러 번 실행해도 안전(이미 있으면 스킵). 파괴적 작업 금지, 삭제 없음.
5. **Dry-run 우선**: 파일을 고치는 스크립트는 `--dry`(diff만 출력)가 기본, `--apply`로만 실제 수정.
6. **기존 자산 재사용**: `api/city-planner.js`·`api/submit-church.js`·`scripts/update-city-count.js`·`admin.html` 패턴을 따르고 새 스택(pg·CMS·TS 서비스)을 도입하지 않는다.

---

## Stage 0 — 사전 점검 (파일 만들기 전)

Claude Code가 먼저 확인·보고할 것:
- `package.json` 의존성(현재 docx/nodemailer/pptxgenjs) — 새 도시 스크립트에 필요한 것만 추가(예: 없음 — Node 내장 fetch/fs 사용).
- Supabase 프로젝트 `vextxqzggznulwpganwt` 접근: `SUPABASE_SERVICE_KEY_MAIN`(Vercel env) 존재 여부. 없으면 "목사님이 Vercel env에 넣어야 함"으로 보고만.
- `hebronguide/src/app/components/HebronGuide.tsx`의 `HEBRON_CITIES`·`CITY_CONFIGS`·`type CitySlug` 위치 확인.
- `build.sh`의 `CITY_KO`/`CITY_EN`/`REGION_MAP`/`CITY_GEO`/배포 루프 위치 확인.
- `roadmap.json`(진출 예정 도시) 구조 확인.

→ 결과를 표로 보고하고 **"Stage 1 진행할까요?"** 물을 것.

---

## Stage 1 — 데이터 모델 (새 Postgres ❌ → Supabase SQL)

`supabase_setup_city_pipeline.sql` 생성 (기존 `supabase_setup_church_partners.sql` 스타일).

두 테이블(초안·로그 전용, 라이브 도시 SSOT는 여전히 `HEBRON_CITIES`):

```sql
-- 도시 초안 (검증 전 임시 저장 — 라이브 아님)
create table if not exists city_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ko text not null,
  name_en text,
  country text,
  region text,                 -- UN Geoscheme 섹션 (북미/중남미/유럽/중동/동남아시아/일본/한국/오세아니아)
  lat double precision,
  lng double precision,
  korean_pop_estimate int,
  status text default 'draft',  -- draft | in_review | verified | published
  guide_json jsonb,             -- {living, safety, transport, education_health, churches, diaspora_tips, mission_points, seo}
  sources_json jsonb,           -- 각 필드별 출처 URL (검증 근거)
  verified_by text,             -- 검증한 사람 (그 도시 산 한인)
  verified_at timestamptz,      -- 검증 완료 시각 (이게 있어야만 발행 가능)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists city_pipeline_logs (
  id uuid primary key default gen_random_uuid(),
  slug text,
  stage text,                   -- ingest|draft|review|verify|scaffold|build|publish
  status text,                  -- ok|warn|error|skipped
  message text,
  created_at timestamptz default now()
);

-- RLS: anon은 읽기만, 쓰기/발행은 service key만 (검증 게이트 보호)
alter table city_drafts enable row level security;
alter table city_pipeline_logs enable row level security;
create policy "city_drafts anon read"  on city_drafts  for select using (true);
create policy "city_logs anon read"     on city_pipeline_logs for select using (true);
```

> 실제 테이블 생성은 **목사님이 Supabase SQL 편집기에서 실행**(Claude Code는 파일만 생성 + 실행 안내). anon 키로는 초안 발행 불가 → 검증 게이트가 DB 레벨에서 보호됨.

---

## Stage 2 — 유틸 (`scripts/city-utils.mjs`)

CLAUDE.md의 UN Geoscheme 표를 **코드로 자동화**(멕시코→중남미, 두바이→중동 등 실수 원천 차단):

- `slugify(nameEn)` — 소문자·영숫자만, 기존 도시 slug 규칙과 일치.
- `unSection(country)` — CLAUDE.md UN Geoscheme 표 기반. `{ '멕시코':'중남미', '브라질':'중남미', 'UAE':'중동', '싱가포르':'동남아시아', '일본':'일본', '한국':'한국', '호주':'오세아니아', ... }` 매핑 + "자주 헷갈리는 나라" 정답 하드코딩.
- `sectionComment(section)` — `build.sh`·`HEBRON_CITIES`의 정확한 섹션 주석 문자열 반환(`// ── 중남미 ──` 등).
- 조사 헬퍼는 tsx의 `roJosa`/`iGaJosa` 재사용(중복 생성 금지).

---

## Stage 3 — AI 초안 생성기 (`api/city-draft.js`) — 자동 발행 ❌

기존 `api/city-planner.js` 패턴(edge runtime, admin 해시 게이트, CORS) 복제.

- 입력: `{ nameKo, nameEn, country, rawData? }` (rawData = 목사님/에이전트가 리서치한 원자료 붙여넣기, 선택).
- Claude 호출(`claude-haiku-4-5` 또는 조사량 많으면 `claude-sonnet-5`), 아래 **검증-우선 프롬프트**로 시애틀 표준 구조 초안 생성.
- 결과를 `city_drafts`에 `status:'draft'`로 저장 + `city_pipeline_logs`에 stage 기록.
- **절대 발행/스캐폴딩 하지 않음.** 응답에 "⚠️ 초안 — 검증 전 공개 금지" 명시.

### 프로덕션 프롬프트 (검증-우선·환대 톤)

```
SYSTEM:
당신은 HebronGuide의 "도시 가이드 초안 도우미"입니다.
HebronGuide는 "내가 나그네 되었을 때 너희가 영접하였다"(마 25:35)를 따르는
전 세계 한인 디아스포라 환대·교회연결 플랫폼입니다.

당신의 역할은 '초안'을 만드는 것이지 '사실을 확정'하는 것이 아닙니다.
반드시 지킬 것:
1. 사실을 지어내지 마라(DO NOT invent). 모르면 값을 null로 두고 "검증 필요"로 표시.
2. 각 항목마다 출처(공식 사이트·정부·한인회 URL)가 있으면 sources에 기록, 없으면 "출처 필요".
3. 톤: 한국어, 따뜻하고 목회적이며 실용적. 짧은 문단. 강요 없이 환대.
4. 정치 중립. 성경적 세계관 필터(생명·가정·이민자 환대·정직·인간 존엄).
5. 이 도시에 '살아본 한인'이 검증할 것을 전제로, 검증하기 쉽게 항목을 구조화.

USER:
도시: {{NAME_KO}} ({{NAME_EN}}), 국가: {{COUNTRY}}
원자료(있으면): {{RAW_DATA_JSON}}

시애틀 표준 구조로 초안 JSON을 생성:
- city_profile (인구·한인인구 추정·타임존·태그 — 추정치는 "추정" 명시)
- living, safety, transport, education_health (각 항목 확인 필요 사실은 "❓검증필요" 태그)
- churches (교회는 임의 등재 금지 — "현지 한인회/교회 군집 확인 후 등재" 안내만)
- diaspora_tips, mission_points (환대·연결 관점)
- seo (키워드 5~10, meta_title ≤60자, meta_description ≤160자)

각 사실 옆에 sources[] (URL 또는 "출처 필요").

OUTPUT: 유효한 JSON만. 최상위에 "_status":"draft","_warning":"검증 전 공개 금지" 포함.
```

---

## Stage 4 — 검증 게이트 (관리자 화면)

`hebronguide/public/admin-city-drafts.html` 생성(기존 `admin.html` 스타일·비번 게이트 재사용).

- `city_drafts`(status draft/in_review) 목록 → 항목별 값 + 출처 링크 표시.
- 각 필드 옆 "❓검증필요" 배지 → 검증자가 공식 출처로 대조 후 체크.
- **검증 완료 버튼**: `verified_by`(이름) + `verified_at`(now) 기록, `status:'verified'`로 전환. (service key 필요 — 파트너 승인과 동일 패턴)
- **이게 "그 도시에 살아본 한인이 쓴다 / 투명성이 권위" 원칙의 코드화**입니다.

---

## Stage 5 — ⭐ 핵심 자동화: 도시 스캐폴딩 (`scripts/scaffold-city.mjs`)

**이번 업그레이드의 최대 가치.** `status:'verified'`인 초안 하나를 받아 CLAUDE.md "새 도시 체크리스트" 6개 파일을 **한 번에·멱등하게** 편집.

입력: `node scripts/scaffold-city.mjs <slug> --dry` (기본 dry-run, diff만) / `--apply`.

자동 적용(각 단계 후 `city_pipeline_logs` 기록):
1. **HebronGuide.tsx**: `type CitySlug`에 slug 추가 → `CITY_CONFIGS`에 config → `HEBRON_CITIES`에 `status:"live"` 엔트리(UN 섹션 주석 아래 정확히 삽입, `unSection()` 사용).
2. **build.sh**: `CITY_KO`/`CITY_EN`/`REGION_MAP`/`CITY_GEO`(lat,lng,country) + 배포 for 루프 + cities.json 루프.
3. **index.html** `#cityRegions`: `.city-pill` 지역 블록(이모지 금지 — CSS 핀 자동).
4. **sitemap.xml**: `<url><loc>.../{slug}/</loc></url>`.
5. **roadmap.json**: 예정 도시였으면 제거(라이브 승격).
6. 도시 수 표기 = 손대지 않음(기존 `update-city-count.js`가 빌드 시 자동).

안전장치: 이미 존재하는 slug면 각 편집 스킵(멱등). `--dry`가 기본. `--apply` 후 `npm --prefix hebronguide run build`로 **컴파일 통과 검증**까지 하고, 실패 시 롤백 안내(git). **git commit/push·배포는 하지 않음**(목사님 확인 후).

---

## Stage 6 — 파이프라인 오케스트레이터 (`scripts/city-pipeline.mjs`)

단계 실행 + 로그 + **사람 게이트에서 정지**:

```
ingest(nameKo,nameEn,country)
  → draft         (api/city-draft 호출, Supabase 저장)
  → [🛑 사람 게이트: 검증]  ← 여기서 멈춤. 자동 진행 금지
  → scaffold      (verified 초안만, --dry 먼저)
  → buildCheck    (컴파일 통과 확인)
  → [🛑 사람 게이트: 배포]  ← 목사님 "예" 후 수동 git push
```

- 각 스텝 try/catch → `city_pipeline_logs`에 error 기록 + 재시도 안내(자동 무한재시도 금지).
- **자동으로 사람 게이트를 건너뛰지 않는다**(Hard Rule).

---

## Stage 7 — 테스트(드라이런) (`generateTestCity()`)

- `roadmap.json`의 **이미 계획된 실제 한인 커뮤니티 도시** 하나를 골라(추측 도시 금지) 파이프라인을 **전 구간 dry-run**.
- 출력: 생성될 초안 JSON + scaffold diff(실제 파일 수정 없음) + 예상 URL `hebronguide.com/{slug}/`.
- Supabase 쓰기도 하지 않는 완전 시뮬레이션 모드 지원.

---

## Stage 8 — 다른 반복 노동 자동화(이미 된 것/연결)

새로 만들지 말고 **연결·문서화만**:
- 도시 수 통일: `scripts/update-city-count.js` (완료·빌드 자동).
- 파트너 승인 → 협력교회/협력사업체 승격: 이번 세션에서 완료(신청→마커→승인→노출).
- 연 1회 데이터 재검증: 스케줄 루틴(매년 2월, docs/SETTLEMENT_VERIFICATION.md diff) — 존재 시 연결.
- → City Engine v2가 **새로 자동화하는 것 = 도시 초안 생성 + 검증 추적 + 6파일 스캐폴딩** 세 가지.

---

## Stage 9 — 가드레일 자체 점검

Claude Code는 이 시스템을 만든 뒤 스스로 확인·보고:
- [ ] AI 출력이 `verified_at` 없이 라이브로 갈 경로가 하나도 없는가?
- [ ] 자동 `git push`/배포/일요일 배포 경로가 없는가?
- [ ] 모든 파일-수정 스크립트가 `--dry` 기본 + 멱등인가?
- [ ] 새 스택(pg·CMS·독립 TS 서비스)을 도입하지 않고 Supabase/serverless/scripts만 썼는가?
- [ ] `HEBRON_CITIES`가 여전히 라이브 도시 SSOT인가(DB가 SSOT 아님)?

---

## Stage 10 — 마무리

- import·경로 검증, `node --check` (api/*.js), `npm --prefix hebronguide run build`(tsx 컴파일).
- 최종 파일 트리 출력.
- **실행 안내(README)**:
  ```
  1) Supabase SQL 편집기에서 supabase_setup_city_pipeline.sql 실행
  2) Vercel env: SUPABASE_SERVICE_KEY_MAIN, ANTHROPIC_API_KEY 확인
  3) 초안:   POST /api/city-draft {nameKo,nameEn,country}  (또는 admin 화면)
  4) 검증:   admin-city-drafts.html 에서 출처 대조 → 검증 완료
  5) 스캐폴딩: node scripts/scaffold-city.mjs <slug> --dry  → 확인 → --apply
  6) 빌드확인 후 목사님 "예" → git push (일요일 제외)
  ```
- **정직 고지(1%)**: 완전 자동 아님(설계상). 3곳은 사람이 함 — ① Supabase SQL 최초 실행 ② 도시 데이터 **검증**(핵심·의도적) ③ 최종 배포 승인. 이 3곳이 HebronGuide의 신뢰를 지키는 지점이라 **일부러** 자동화하지 않음.

---

### 부록 — Copilot v1 대비 변경 요약

| 항목 | Copilot v1 | HebronGuide v2 |
|---|---|---|
| 스택 | TS 백엔드 + pg + CMS | Supabase + `api/*.js` + `scripts/*.mjs` |
| AI 역할 | 자동 생성·자동 발행 | 초안만 → 사람 검증 → 승인 발행 |
| 도시 SSOT | 새 `cities` 테이블 | `HEBRON_CITIES`(변경 없음) |
| 발행 | CMS POST(없는 엔드포인트) | build.sh + sitemap 스캐폴딩 |
| 검증 | 없음 | `verified_at` 게이트(DB+UI) |
| 최대 자동화 | (해당 없음) | 새 도시 6파일 1명령 스캐폴딩 |
| Hard Rule | 위반(AI 추측·미검증) | 준수(검증·환대·투명성) |
