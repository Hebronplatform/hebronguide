-- HebronGuide 커뮤니티 데이터 수집 테이블
-- Supabase 대시보드 → SQL Editor → 아래 전체 복사·실행

CREATE TABLE IF NOT EXISTS community_items (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  category    text,          -- church | food | settle | explore | help | job | edu
  city_slug   text,          -- seattle | dallas | sf | newyork ...
  name        text NOT NULL, -- 교회명 / 상호명 / 이름
  pastor      text,          -- 담당 목사
  contact     text,          -- 전화번호 또는 이메일
  phone       text,          -- 전화번호
  email       text,          -- 이메일
  description text,          -- 한 줄 소개
  website     text,          -- 웹사이트
  status      text DEFAULT 'published'  -- published | pending
);

-- 행 수준 보안 활성화
ALTER TABLE community_items ENABLE ROW LEVEL SECURITY;

-- 누구나 등록 가능 (익명 포함)
CREATE POLICY "public_insert"
  ON community_items
  FOR INSERT TO anon
  WITH CHECK (true);

-- 누구나 published 항목 조회 가능 (자동 게시)
CREATE POLICY "public_select"
  ON community_items
  FOR SELECT TO anon
  USING (status = 'published');

-- 인증된 사용자(관리자)는 전체 조회 가능
CREATE POLICY "admin_select"
  ON community_items
  FOR SELECT TO authenticated
  USING (true);

-- 완료 확인
SELECT 'community_items 테이블 생성 완료 ✅' AS result;
