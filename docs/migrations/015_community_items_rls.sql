-- 015_community_items_rls.sql
-- community_items — 승인된 행만 공개. 신청서의 이메일·전화 보호.
--
-- 배경 (2026-08-02 점검)
--   anon(publishable) 키로 74행 전부가 읽혔다. 그중 비승인 2행에 신청자 연락처가 들어 있었고,
--   앞으로 들어올 모든 신청서가 승인 전까지 공개되는 구조였다.
--   승인된 교회·업소의 연락처는 디렉토리라 공개가 의도된 것이므로 그대로 둔다.
--
-- ⚠️ 선행 조건 (반드시 먼저 배포되어 있어야 함)
--   admin.html의 community_items 읽기가 전부 api/admin-action(action:'list', 서비스 키)로
--   바뀐 뒤에 이 SQL을 적용할 것. 순서가 바뀌면 대시보드에서 대기 신청이 사라진다.
--   (2026-07 "신청 메일은 왔는데 대시보드에 없다" 사고와 동일한 증상)
--
-- 적용: Supabase → SQL Editor → 실행

ALTER TABLE public.community_items ENABLE ROW LEVEL SECURITY;

-- ── 읽기: 승인된 행만 ────────────────────────────────────────
-- 이름이 다를 수 있는 기존 공개 읽기 정책들을 먼저 정리
DROP POLICY IF EXISTS "public read"                  ON public.community_items;
DROP POLICY IF EXISTS "Public read"                  ON public.community_items;
DROP POLICY IF EXISTS "public_read"                  ON public.community_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.community_items;
DROP POLICY IF EXISTS "community_items_select_all"   ON public.community_items;
DROP POLICY IF EXISTS "anon_read_approved"           ON public.community_items;

CREATE POLICY "anon_read_approved"
  ON public.community_items
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- ── 쓰기: 신청 접수는 계속 허용 ──────────────────────────────
-- api/submit-story.js 등이 anon 키로 INSERT 한다. 읽기만 막고 접수는 막지 않는다.
DROP POLICY IF EXISTS "anon_insert_submission" ON public.community_items;

CREATE POLICY "anon_insert_submission"
  ON public.community_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE/DELETE 정책은 만들지 않는다 → anon 차단.
-- 승인·거절·수정·삭제는 서비스 키를 쓰는 api/admin-action이 RLS를 우회해 처리한다.

-- ── 확인 ────────────────────────────────────────────────────
-- 적용 후 아래가 '승인된 행 수'만 반환해야 한다:
--   select status, count(*) from public.community_items group by status;   -- (서비스 키: 전부)
-- anon 키로:
--   curl "$URL/rest/v1/community_items?select=id,status" -H "apikey: $ANON" | jq 'group_by(.status)|map({(.[0].status):length})'
--   → approved 만 나와야 한다.
