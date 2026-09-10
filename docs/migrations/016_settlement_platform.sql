-- ============================================================================
-- 016_settlement_platform.sql
-- 정착 플랫폼 스키마 — 도시 노드 · 역할 · 정착 단계 · 자원 · 임시 주거
--
-- 적용:  Supabase 대시보드 → SQL Editor → 붙여넣고 Run
--        (PostgREST 로는 DDL 실행 불가. 사람이 직접 돌려야 합니다.)
--
-- 설계 원칙 — 이 파일이 지키는 것
--   ① 기존 것을 대체하지 않는다.
--      교회·업소는 이미 community_items 에 있습니다. 옮기지 않고 이어 붙입니다.
--   ② 도시 ID 를 새로 만들지 않는다.
--      city_nodes 의 PK 는 기존 슬러그('seattle') 그대로입니다.
--      build.sh · URL · HEBRON_CITIES 가 전부 이 슬러그를 씁니다.
--   ③ 사람 게이트 없이 게시되지 않는다.
--      임시 주거는 낯선 사람을 남의 집에 들이는 일입니다.
--      교회 확인 + 운영자 승인, 둘 다 있어야만 approved 가 됩니다(제약으로 강제).
--   ④ 주소는 동네까지만.
--      housing_listings 에는 street_address 칼럼이 아예 없습니다.
--      만들지 않으면 실수로도 넣을 수 없습니다.
--   ⑤ RLS 를 처음부터 켠다.
--      015(community_items)를 나중으로 미뤘다가 신청자 PII 가 공개로 열려 있었습니다.
--      같은 일을 반복하지 않습니다.
-- ============================================================================

-- ── 1. 도시 노드 ────────────────────────────────────────────────────────────
create table if not exists public.city_nodes (
  slug          text primary key,                    -- 'seattle' — 기존 슬러그. 새 ID 금지.
  name_ko       text not null,
  name_en       text not null,
  country_code  text not null,                       -- 'US','CA','KR' …
  region        text,                                -- 'Cascadia','Northeast' …
  status        text not null default 'live'
                check (status in ('live','planned','paused')),
  lat           double precision,
  lng           double precision,
  created_at    timestamptz not null default now()
);

comment on table  public.city_nodes is '도시 노드. slug 는 build.sh·URL·HEBRON_CITIES 와 동일해야 한다.';
comment on column public.city_nodes.region is 'Cascadia 벨트 = seattle·vancouver·portland';

-- ── 2. 사용자 역할 ──────────────────────────────────────────────────────────
-- Supabase 는 auth.users 가 이미 있다. 새 users 테이블을 만들지 않고 확장한다.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null default 'migrant'
                  check (role in ('migrant','mentor','ngo_admin','church_admin','staff')),
  display_name    text,
  native_language text not null default 'ko',        -- BCP-47: ko, en, es, uk, ar …
  city_slug       text references public.city_nodes(slug) on delete set null,
  org_name        text,                              -- ngo_admin·church_admin 소속
  created_at      timestamptz not null default now()
);

comment on column public.profiles.role is
  'migrant=정착민 · mentor=현지 멘토 · ngo_admin=NGO · church_admin=교회 · staff=운영';

-- ── 3. 정착 진행 상황 ───────────────────────────────────────────────────────
create table if not exists public.settlement_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  city_slug    text references public.city_nodes(slug) on delete set null,
  arrival_date date,
  stage        text not null default 'day_1_7'
               check (stage in ('day_1_7','week_2_4','month_2_3','settled')),
  completed    jsonb not null default '{}'::jsonb,   -- {"sim":true,"bank":true,...}
  updated_at   timestamptz not null default now(),
  unique (user_id, city_slug)
);

comment on column public.settlement_progress.completed is
  '앱의 체크리스트 id 를 그대로 키로 쓴다. 지금 localStorage 에 있는 구조와 같은 모양이라 로그인 시 그대로 올릴 수 있다.';

-- ── 4. 정착 자원 (NGO · 정부지원 · 멘토십 · 언어 · 법률) ────────────────────
-- 교회·업소는 community_items 에 그대로 둔다. 여기는 그 밖의 자원만.
create table if not exists public.resources (
  id               uuid primary key default gen_random_uuid(),
  city_slug        text not null references public.city_nodes(slug) on delete cascade,
  category         text not null
                   check (category in ('ngo_aid','gov_aid','mentorship','legal','language','job','health')),
  title            text not null,
  title_en         text,
  description      text,
  description_en   text,
  org_name         text,
  funding_source   text,          -- 'CFDA 19.510' · 'CFDA 93.566' · 'ORIA' · 'SOAR' · 'church_network'
  eligibility      text,          -- 누가 받을 수 있는지 — 이게 없으면 헛걸음을 시킨다
  languages        text[] not null default '{}',    -- {'ko','en','es','uk','ar'}
  url              text,
  phone            text,
  email            text,
  street_address   text,          -- 기관은 번지수를 적어도 된다 (가정집이 아니므로)
  locality         text,
  region_code      text,
  country_code     text,
  lat              double precision,
  lng              double precision,
  -- 검증 기록 — 누가 언제 무엇으로 확인했는지 없으면 등재하지 않는다
  verified_at      timestamptz,
  verified_by      text,
  verified_source  text,
  status           text not null default 'pending'
                   check (status in ('pending','approved','paused','rejected')),
  created_at       timestamptz not null default now()
);

comment on column public.resources.funding_source is
  '공적 자금 출처. CFDA 번호는 확인된 것만 적는다 — 틀리면 사람이 헛되이 신청한다.';

-- ── 5. 임시 주거 ★ 가장 위험한 테이블 ──────────────────────────────────────
-- 낯선 사람을 남의 집에 들이는 일이다. 구조 자체가 안전을 강제하게 만든다.
--   · street_address 칼럼이 없다 — 만들지 않으면 실수로도 못 넣는다
--   · 반드시 교회를 통한다 (host_church not null) — 개인 직거래 없음
--   · 교회 확인 + 운영자 승인 둘 다 있어야 approved (제약으로 강제)
create table if not exists public.housing_listings (
  id                 uuid primary key default gen_random_uuid(),
  city_slug          text not null references public.city_nodes(slug) on delete cascade,
  host_church        text not null,                  -- 어느 교회가 책임지는가
  host_church_id     uuid,                           -- community_items.id (교회 레코드)
  neighborhood       text not null,                  -- 동네까지만. 주소는 담지 않는다.
  max_capacity       int  check (max_capacity between 1 and 20),
  max_nights         int  check (max_nights between 1 and 180),
  household_type     text check (household_type in ('family','single_female','single_male','any')),
  rules              text,
  languages          text[] not null default '{}',
  availability       text not null default 'unavailable'
                     check (availability in ('available','full','paused','unavailable')),
  -- ── 사람 게이트 두 겹 (FRAUD_DEFENSE · GATHERING_SAFETY) ──
  church_verified_at timestamptz,                    -- ① 교회가 확인했다
  church_verified_by text,
  staff_approved_at  timestamptz,                    -- ② 운영자가 승인했다
  staff_approved_by  text,
  risk_flags         text[] not null default '{}',
  status             text not null default 'pending'
                     check (status in ('pending','approved','paused','rejected')),
  created_at         timestamptz not null default now(),

  -- 두 게이트가 모두 통과해야만 approved 가 될 수 있다. 코드가 아니라 DB 가 막는다.
  constraint housing_two_gates check (
    status <> 'approved'
    or (church_verified_at is not null and staff_approved_at is not null)
  )
);

comment on table public.housing_listings is
  '교회가 책임지는 임시 주거만. 개인 직거래는 담지 않는다. 주소 칼럼이 없는 것은 의도된 설계다.';

-- ── 6. 멘토십 매칭 ──────────────────────────────────────────────────────────
create table if not exists public.mentorship_matches (
  id            uuid primary key default gen_random_uuid(),
  city_slug     text references public.city_nodes(slug) on delete set null,
  mentor_id     uuid references auth.users(id) on delete set null,
  mentee_id     uuid references auth.users(id) on delete set null,
  topic         text,                                -- '취업','학교','운전면허','언어'
  languages     text[] not null default '{}',
  status        text not null default 'requested'
                check (status in ('requested','matched','active','closed')),
  matched_at    timestamptz,
  closed_reason text,
  created_at    timestamptz not null default now()
);

-- ── 7. 인덱스 ───────────────────────────────────────────────────────────────
create index if not exists idx_resources_city_cat
  on public.resources (city_slug, category) where status = 'approved';
create index if not exists idx_resources_lang
  on public.resources using gin (languages);
create index if not exists idx_housing_city
  on public.housing_listings (city_slug, availability) where status = 'approved';
create index if not exists idx_progress_user
  on public.settlement_progress (user_id);
create index if not exists idx_mentorship_city
  on public.mentorship_matches (city_slug, status);

-- ── 8. RLS — 처음부터 켠다 ─────────────────────────────────────────────────
alter table public.city_nodes          enable row level security;
alter table public.profiles            enable row level security;
alter table public.settlement_progress enable row level security;
alter table public.resources           enable row level security;
alter table public.housing_listings    enable row level security;
alter table public.mentorship_matches  enable row level security;

-- 도시 목록은 공개
drop policy if exists city_read on public.city_nodes;
create policy city_read on public.city_nodes
  for select to anon, authenticated using (true);

-- 자원·주거는 "승인된 것만" 공개
drop policy if exists resources_read_approved on public.resources;
create policy resources_read_approved on public.resources
  for select to anon, authenticated using (status = 'approved');

drop policy if exists housing_read_approved on public.housing_listings;
create policy housing_read_approved on public.housing_listings
  for select to anon, authenticated using (status = 'approved');

-- 내 정보는 나만
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists progress_self on public.settlement_progress;
create policy progress_self on public.settlement_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 멘토십은 당사자만
drop policy if exists mentorship_party on public.mentorship_matches;
create policy mentorship_party on public.mentorship_matches
  for select to authenticated
  using (mentor_id = auth.uid() or mentee_id = auth.uid());

-- 신청(INSERT)은 누구나, 게시는 승인 뒤에
drop policy if exists resources_insert on public.resources;
create policy resources_insert on public.resources
  for insert to anon, authenticated with check (status = 'pending');

drop policy if exists housing_insert on public.housing_listings;
create policy housing_insert on public.housing_listings
  for insert to anon, authenticated with check (status = 'pending');

-- 수정·삭제 정책은 없다 → 서비스 키(api/admin-action.js)로만 가능하다.
-- 의도된 설계다. 익명이 남의 신청을 고칠 길을 열지 않는다.

-- ── 9. 되돌리기 ─────────────────────────────────────────────────────────────
-- 문제가 생기면 이것만 실행하면 이 마이그레이션 전으로 돌아갑니다.
--   drop table if exists public.mentorship_matches;
--   drop table if exists public.housing_listings;
--   drop table if exists public.resources;
--   drop table if exists public.settlement_progress;
--   drop table if exists public.profiles;
--   drop table if exists public.city_nodes;
-- 기존 community_items 는 건드리지 않으므로 영향이 없습니다.
