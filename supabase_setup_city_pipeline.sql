-- ============================================================
-- HebronGuide City Engine v2 — 도시 파이프라인 테이블
-- 실행: Supabase SQL Editor (프로젝트 vextxqzggznulwpganwt)에서 목사님이 직접 Run
-- 원칙: 라이브 도시의 SSOT는 여전히 HebronGuide.tsx의 HEBRON_CITIES.
--       이 테이블은 "검증 전 초안"과 "파이프라인 로그"만 담는다.
--       AI 초안은 verified_at이 채워지기 전까지 절대 사이트에 노출되지 않는다.
-- ============================================================

-- 도시 초안 (검증 전 임시 저장 — 라이브 아님)
create table if not exists city_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ko text not null,
  name_en text,
  country text,
  region text,                  -- UN Geoscheme 섹션 (북미/중남미/유럽/중동/동남아시아/일본/한국/오세아니아)
  lat double precision,
  lng double precision,
  korean_pop_estimate int,
  status text default 'draft',  -- draft | in_review | verified | published
  guide_json jsonb,             -- {city_profile, living, safety, transport, education_health, churches, diaspora_tips, mission_points, seo}
  sources_json jsonb,           -- 각 항목별 출처 URL (검증 근거)
  verified_by text,             -- 검증한 사람 (그 도시에 살아본 한인)
  verified_at timestamptz,      -- 검증 완료 시각 — 이 값이 있어야만 스캐폴딩 가능
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 파이프라인 단계 로그
create table if not exists city_pipeline_logs (
  id uuid primary key default gen_random_uuid(),
  slug text,
  stage text,                   -- ingest | draft | review | verify | scaffold | build | publish
  status text,                  -- ok | warn | error | skipped
  message text,
  created_at timestamptz default now()
);

-- RLS: anon은 읽기만. 초안 쓰기·검증은 service key(서버)만 — 검증 게이트를 DB 레벨에서 보호
alter table city_drafts enable row level security;
alter table city_pipeline_logs enable row level security;

drop policy if exists "city_drafts anon read" on city_drafts;
create policy "city_drafts anon read" on city_drafts for select using (true);

drop policy if exists "city_logs anon read" on city_pipeline_logs;
create policy "city_logs anon read" on city_pipeline_logs for select using (true);

-- 로그는 추가 전용(append-only)이라 anon insert 허용 — 로컬 스크립트가 단계 기록 가능.
-- (update/delete는 불가. 초안 테이블에는 이 정책을 절대 두지 않는다.)
drop policy if exists "city_logs anon insert" on city_pipeline_logs;
create policy "city_logs anon insert" on city_pipeline_logs for insert with check (true);
