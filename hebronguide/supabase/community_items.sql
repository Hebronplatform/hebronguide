-- HebronGuide 커뮤니티 데이터 수집 테이블
-- Supabase 대시보드 → SQL Editor → 아래 전체 복사·실행
-- 업데이트: title 컬럼 추가, status 기본값 pending으로 변경

-- ① 테이블 신규 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS community_items (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  title       text,          -- 신청 제목 / 교회명 / 상호명
  category    text,          -- church | food | settle | person | business | promo | general
  city_slug   text,          -- seattle | dallas | sf | newyork ...
  name        text,          -- 신청자 이름
  pastor      text,          -- 담당 목사
  contact     text,          -- 전화번호 또는 이메일
  phone       text,          -- 전화번호
  email       text,          -- 이메일
  description text,          -- 한 줄 소개 / 상세 내용
  website     text,          -- 웹사이트
  status      text DEFAULT 'pending'  -- pending | published | rejected
);

-- ② 기존 테이블에 title 컬럼이 없으면 추가 (이미 있으면 무시됨)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_items' AND column_name = 'title'
  ) THEN
    ALTER TABLE community_items ADD COLUMN title text;
  END IF;
END $$;

-- ③ name NOT NULL 제약이 있으면 제거 (신청자명은 선택 항목)
DO $$
BEGIN
  ALTER TABLE community_items ALTER COLUMN name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
  -- 이미 nullable이면 무시
END $$;

-- ④ 행 수준 보안 활성화
ALTER TABLE community_items ENABLE ROW LEVEL SECURITY;

-- ⑤ RLS 정책 (중복 생성 방지)
DO $$
BEGIN
  -- 익명 INSERT 허용
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_items' AND policyname = 'public_insert'
  ) THEN
    EXECUTE 'CREATE POLICY "public_insert" ON community_items FOR INSERT TO anon WITH CHECK (true)';
  END IF;

  -- pending/published 항목 SELECT 허용
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_items' AND policyname = 'public_select'
  ) THEN
    EXECUTE 'CREATE POLICY "public_select" ON community_items FOR SELECT TO anon USING (status IN (''pending'', ''published'', ''approved''))';
  END IF;

  -- 인증된 관리자 전체 조회
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_items' AND policyname = 'admin_select'
  ) THEN
    EXECUTE 'CREATE POLICY "admin_select" ON community_items FOR SELECT TO authenticated USING (true)';
  END IF;

  -- 인증된 관리자 UPDATE (승인/거절)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'community_items' AND policyname = 'admin_update'
  ) THEN
    EXECUTE 'CREATE POLICY "admin_update" ON community_items FOR UPDATE TO authenticated USING (true)';
  END IF;
END $$;

-- 완료 확인
SELECT 'community_items 테이블 준비 완료 ✅' AS result;
