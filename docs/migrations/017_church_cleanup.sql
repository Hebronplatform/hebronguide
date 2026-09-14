-- ============================================================================
-- 017_church_cleanup.sql
-- 교회 데이터 정리 + 시애틀지구촌교회 등재
--
-- 적용: Supabase 대시보드 → SQL Editor → 붙여넣고 Run
--
-- 이 파일이 하는 일
--   ① 이름 앞에 주소가 붙어버린 7곳 — 이름과 주소를 나눈다
--   ② 앞이 잘린 1곳 — 21st Century Mission Church (낮은울타리교회)
--   ③ 교회가 아니거나 이름이 소실된 10곳 — 지우지 않고 목록에서만 내린다
--   ④ 시애틀지구촌교회 등재 — 지금 교회 목록에 없다
--
-- 손대지 않는 것 (확인할 수 없어서)
--   'Korean Baptist Church of' · 'Global Mission Church of' 등 'of' 뒤가 잘린 7곳
--   → CKSBCA 원본 명단이 있어야 복구된다
--   'Federal Way Korean Baptist Church' · 'St. Cloud Korean Baptist Church'
--   'The Way for You & Me B.C' → 멀쩡한 이름. 자동 검사가 잘못 잡았던 것
-- ============================================================================

begin;

-- ── ① 이름 앞에 붙은 주소를 떼어낸다 ───────────────────────────────────
-- 전: 26 Park St. #A Alhambra Korean Baptist Church
update public.churches set name = 'Alhambra Korean Baptist Church', name_en = 'Alhambra Korean Baptist Church', address = '26 Park St. #A'
  where id = '5eb1e92c-494e-470a-afa5-6b33479d922d';

-- 전: 1102 Hamal #111 Irvine Korean Baptist Church
update public.churches set name = 'Irvine Korean Baptist Church', name_en = 'Irvine Korean Baptist Church', address = '1102 Hamal #111'
  where id = '900112bc-e4a0-4536-a13a-e48aa24a5007';

-- 전: 621 Rock Elm Dr. Auburn Korean Baptist Church
update public.churches set name = 'Auburn Korean Baptist Church', name_en = 'Auburn Korean Baptist Church', address = '621 Rock Elm Dr.'
  where id = 'b1775b0d-943a-4d1c-86bc-19bd578dc2ce';

-- 전: 3590 Hanover Dr. Buford Korean Baptist Church
update public.churches set name = 'Buford Korean Baptist Church', name_en = 'Buford Korean Baptist Church', address = '3590 Hanover Dr.'
  where id = 'ce3de46a-ab51-45a0-ae7f-47a81df60d96';

-- 전: 4604 Lafite Ln. Colleyville Korean Baptist Church
update public.churches set name = 'Colleyville Korean Baptist Church', name_en = 'Colleyville Korean Baptist Church', address = '4604 Lafite Ln.'
  where id = '3abb7a04-1d32-4e00-bcc9-ba2ef4729953';

-- 전: 1328 S. 84th St. Tacoma Korean Baptist Church
update public.churches set name = 'Tacoma Korean Baptist Church', name_en = 'Tacoma Korean Baptist Church'
  where id = 'de994d7d-38e6-4862-8348-6ddc4b9f478c';

-- 전: 4019 NE 17th St. Renton Korean Baptist Church
update public.churches set name = 'Renton Korean Baptist Church', name_en = 'Renton Korean Baptist Church', address = '4019 NE 17th St.'
  where id = '638ea8bd-06e5-4cf2-ac70-944fcd4b966c';

-- ── ② 앞이 잘린 이름 복구 ──────────────────────────────────────────────
-- 전: st Century Mission Church  (낮은울타리교회 — 2026-08-11 외부 진단 리포트에서 확인)
update public.churches set name = '21st Century Mission Church', name_en = '21st Century Mission Church'
  where id = '8d420ab2-afc7-4267-8551-ff073aba0f67';

-- ── ③ 목록에서 내린다 (지우지 않는다 — 원본이 오면 되살린다) ───────────
update public.churches set active = false  -- Northwest Baptist Convention · 교단 본부 — 교회가 아님 (Northwest Baptist Convention)
  where id = 'd7f24709-7302-4f77-9a4c-0af4534360a9';
update public.churches set active = false  -- Baptist General Convention Texas · 교단 본부 — 교회가 아님 (Baptist General Convention Texas)
  where id = '947999be-ddfe-4109-8ea7-4766bdb93f6c';
update public.churches set active = false  -- New Jersey Network of · 교단 네트워크 — 교회가 아님
  where id = 'c20d0fdd-a4ad-46d2-b12a-8291479107ba';
update public.churches set active = false  -- Chambers Rd · 이름 소실 — 길 이름만 남음
  where id = 'd147e3a2-856b-44ba-a17e-6c42c229ba60';
update public.churches set active = false  -- Coriolanus Dr · 이름 소실 — 길 이름만 남음
  where id = '12a2d400-7ef4-4f6f-9af8-c7d437e0a9d8';
update public.churches set active = false  -- Brianwood Dr · 이름 소실 — 길 이름만 남음
  where id = '3e0084be-b207-436e-8f5c-df3bff6c4017';
update public.churches set active = false  -- Tranbarger St · 이름 소실 — 길 이름만 남음
  where id = '09376d08-62ce-40e4-b012-926d6efa1590';
update public.churches set active = false  -- Florida Blvd. #A · 이름 소실 — 길 이름만 남음
  where id = 'd8d10630-081d-498e-929e-cd2123f09165';
update public.churches set active = false  -- Belhaven Ave · 이름 소실 — 길 이름만 남음
  where id = 'b5105fdb-10a6-42e6-950c-7c5f9641a447';
update public.churches set active = false  -- 185th St. Ct. E · 이름 소실 — 길 이름만 남음
  where id = '9ab1efaa-fc5b-4c08-a8a8-058655fc261b';

-- ── ④ 시애틀지구촌교회 등재 ────────────────────────────────────────────
-- 지금 교회 목록에 없다. 주소(번지수)는 넣지 않는다 — 본부가 자택이기 때문.
insert into public.churches
  (name, name_en, city_slug, phone, website, denomination, service_time,
   tier, hcmi, active, status, source, description)
select
  '시애틀지구촌교회',
  'Global Mission Church of Greater Seattle',
  'seattle',
  '425-350-0191',
  'https://www.ijiguchon.org',
  'SBC',
  '주일 오전 11시 (태평양시) · 온라인 www.ijiguchon.org',
  1,
  true,
  true,
  'approved',
  'hebronguide',
  '시애틀 지역 한인 가정교회 — 가정에서 모이는 교회입니다. 목장은 린우드(Lynnwood)와 머킬티오(Mukilteo)의 가정에서 모이고(목장마다 요일이 다릅니다), 주일 오전 11시(태평양시)에 한 교회로 함께 예배드립니다. 온라인으로는 어디서나 함께합니다. 유아부터 12학년까지 새 세대 사역이 있습니다. 교인이 아니어도, 참가비 없이 오실 수 있습니다. 2002년 개척, 김성수 대표목사, SBC. GMN(글로벌 미니스트리 네트워크) 소속이며 국제가정교회사역원 회원교회입니다.'
where not exists (
  select 1 from public.churches where name = '시애틀지구촌교회'
);  -- 두 번 실행해도 중복되지 않습니다

commit;

-- ── 확인 ───────────────────────────────────────────────────────────────
-- 실행 뒤 이걸 돌려보시면 결과가 보입니다.
select name, city_slug, service_time, tier, active
  from public.churches
 where city_slug = 'seattle' and active
 order by tier nulls last, name;

-- ── 되돌리기 ───────────────────────────────────────────────────────────
-- 문제가 생기면 이것만 실행하면 원래대로 돌아갑니다.
/*
begin;
update public.churches set name = '26 Park St. #A Alhambra Korean Baptist Church', name_en = '26 Park St. #A Alhambra Korean Baptist Church', address = NULL where id = '5eb1e92c-494e-470a-afa5-6b33479d922d';
update public.churches set name = '1102 Hamal #111 Irvine Korean Baptist Church', name_en = '1102 Hamal #111 Irvine Korean Baptist Church', address = NULL where id = '900112bc-e4a0-4536-a13a-e48aa24a5007';
update public.churches set name = '621 Rock Elm Dr. Auburn Korean Baptist Church', name_en = '621 Rock Elm Dr. Auburn Korean Baptist Church', address = NULL where id = 'b1775b0d-943a-4d1c-86bc-19bd578dc2ce';
update public.churches set name = '3590 Hanover Dr. Buford Korean Baptist Church', name_en = '3590 Hanover Dr. Buford Korean Baptist Church', address = NULL where id = 'ce3de46a-ab51-45a0-ae7f-47a81df60d96';
update public.churches set name = '4604 Lafite Ln. Colleyville Korean Baptist Church', name_en = '4604 Lafite Ln. Colleyville Korean Baptist Church', address = NULL where id = '3abb7a04-1d32-4e00-bcc9-ba2ef4729953';
update public.churches set name = '1328 S. 84th St. Tacoma Korean Baptist Church', name_en = '1328 S. 84th St. Tacoma Korean Baptist Church', address = '1328 S. 84th St. Tacoma, WA 98444' where id = 'de994d7d-38e6-4862-8348-6ddc4b9f478c';
update public.churches set name = '4019 NE 17th St. Renton Korean Baptist Church', name_en = '4019 NE 17th St. Renton Korean Baptist Church', address = NULL where id = '638ea8bd-06e5-4cf2-ac70-944fcd4b966c';
update public.churches set name = 'st Century Mission Church', name_en = 'st Century Mission Church' where id = '8d420ab2-afc7-4267-8551-ff073aba0f67';
update public.churches set active = true where id = 'd7f24709-7302-4f77-9a4c-0af4534360a9';
update public.churches set active = true where id = '947999be-ddfe-4109-8ea7-4766bdb93f6c';
update public.churches set active = true where id = 'c20d0fdd-a4ad-46d2-b12a-8291479107ba';
update public.churches set active = true where id = 'd147e3a2-856b-44ba-a17e-6c42c229ba60';
update public.churches set active = true where id = '12a2d400-7ef4-4f6f-9af8-c7d437e0a9d8';
update public.churches set active = true where id = '3e0084be-b207-436e-8f5c-df3bff6c4017';
update public.churches set active = true where id = '09376d08-62ce-40e4-b012-926d6efa1590';
update public.churches set active = true where id = 'd8d10630-081d-498e-929e-cd2123f09165';
update public.churches set active = true where id = 'b5105fdb-10a6-42e6-950c-7c5f9641a447';
update public.churches set active = true where id = '9ab1efaa-fc5b-4c08-a8a8-058655fc261b';
delete from public.churches where name = '시애틀지구촌교회' and source = 'hebronguide';
commit;
*/
