-- ══════════════════════════════════════════════════════════════
-- HebronGuide — Supabase 신규 프로젝트 (okhfjzofifmsgssgajts) 전체 초기화
-- 실행: Supabase Dashboard → SQL Editor → 전체 복사 후 실행
-- 업데이트: 2026-05-27
-- ══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. community_items — 업소·교회 신청·비즈니스 디렉토리
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_items (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  title       text,          -- 신청 제목 / 교회명 / 상호명
  category    text,          -- church | food | settle | person | business | promo | general
  city_slug   text,          -- seattle | dallas | sf | newyork ...
  city        text,          -- 도시명 (표시용)
  name        text,          -- 신청자 이름 또는 상호명
  type        text,          -- 업종 (보험, 식당, 카페, ...)
  pastor      text,          -- 담당 목사
  contact     text,          -- 전화번호 또는 이메일
  phone       text,          -- 전화번호
  email       text,          -- 이메일
  description text,          -- 한 줄 소개 / 상세 내용
  website     text,          -- 웹사이트
  url         text,          -- 웹사이트 (url 필드명 호환)
  status      text DEFAULT 'pending',  -- pending | published | approved | rejected
  notified_at timestamptz    -- 알림 발송 시각
);

-- 기존 테이블에 누락 컬럼 추가 (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='city') THEN
    ALTER TABLE community_items ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='type') THEN
    ALTER TABLE community_items ADD COLUMN type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='url') THEN
    ALTER TABLE community_items ADD COLUMN url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='notified_at') THEN
    ALTER TABLE community_items ADD COLUMN notified_at timestamptz;
  END IF;
END $$;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ci_category ON community_items (category);
CREATE INDEX IF NOT EXISTS idx_ci_city_slug ON community_items (city_slug);
CREATE INDEX IF NOT EXISTS idx_ci_status ON community_items (status);

-- RLS
ALTER TABLE community_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='community_items' AND policyname='public_insert') THEN
    EXECUTE 'CREATE POLICY "public_insert" ON community_items FOR INSERT TO anon WITH CHECK (true)';
  END IF;
  -- 공개 조회: pending / published / approved 모두 허용
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='community_items' AND policyname='public_select') THEN
    EXECUTE 'CREATE POLICY "public_select" ON community_items FOR SELECT TO anon USING (status IN (''pending'', ''published'', ''approved''))';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='community_items' AND policyname='admin_select') THEN
    EXECUTE 'CREATE POLICY "admin_select" ON community_items FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='community_items' AND policyname='admin_update') THEN
    EXECUTE 'CREATE POLICY "admin_update" ON community_items FOR UPDATE TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='community_items' AND policyname='admin_delete') THEN
    EXECUTE 'CREATE POLICY "admin_delete" ON community_items FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;

SELECT '1. community_items ✅' AS step;

-- ─────────────────────────────────────────────────────────────
-- 2. churches — 교회 디렉토리
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS churches (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now(),
  name            text NOT NULL,
  name_en         text,
  city_slug       text,
  description     text,
  phone           text,
  email           text,
  website         text,
  address         text,
  denomination    text,        -- 교단 (Presbyterian, Baptist, ...)
  service_time    text,        -- 예배 시간
  hebron_partner  boolean DEFAULT false,
  hcmi            boolean DEFAULT false,
  tier            int DEFAULT 2,  -- 1=파트너, 2=일반, 3=기타
  active          boolean DEFAULT true,
  source          text DEFAULT 'admin_approved',
  source_id       text,
  status          text DEFAULT 'approved'
);

CREATE INDEX IF NOT EXISTS idx_churches_city_slug ON churches (city_slug);
CREATE INDEX IF NOT EXISTS idx_churches_active ON churches (active);

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='churches' AND policyname='public_read') THEN
    EXECUTE 'CREATE POLICY "public_read" ON churches FOR SELECT TO anon USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='churches' AND policyname='admin_all') THEN
    EXECUTE 'CREATE POLICY "admin_all" ON churches FOR ALL TO authenticated USING (true)';
  END IF;
END $$;

SELECT '2. churches ✅' AS step;

-- ─────────────────────────────────────────────────────────────
-- 3. pastor_partners — 목사 파트너
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pastor_partners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  church_name TEXT,
  city_slug   TEXT,
  country     TEXT,
  tier        INT DEFAULT 1 CHECK (tier IN (1, 2, 3)),
  joined_at   TIMESTAMPTZ DEFAULT now(),
  verified    BOOLEAN DEFAULT false,
  notes       TEXT
);

ALTER TABLE pastor_partners ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pastor_partners' AND policyname='service_only') THEN
    EXECUTE 'CREATE POLICY "service_only" ON pastor_partners USING (false)';
  END IF;
END $$;

SELECT '3. pastor_partners ✅' AS step;

-- ─────────────────────────────────────────────────────────────
-- 4. stories — 이달의 이야기
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug    TEXT NOT NULL,
  title_ko     TEXT NOT NULL,
  title_en     TEXT,
  slug         TEXT UNIQUE NOT NULL,
  html_file    TEXT,
  author_name  TEXT,
  source_ref   TEXT,
  published_at DATE,
  act1_ko      TEXT, act2_ko TEXT, act3_ko TEXT, act4_ko TEXT, act5_ko TEXT,
  act1_en      TEXT, act2_en TEXT, act3_en TEXT, act4_en TEXT, act5_en TEXT,
  featured     BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stories' AND policyname='public_read') THEN
    EXECUTE 'CREATE POLICY "public_read" ON stories FOR SELECT TO anon, authenticated USING (true)';
  END IF;
END $$;

INSERT INTO stories (city_slug, title_ko, slug, html_file, published_at, featured)
VALUES
  ('seattle', '반기는 사람이 없었습니다',     'story-seattle-01', '/story-seattle-01.html', '2013-08-18', true),
  ('seattle', '나도 모르게 달려갔습니다',     'story-seattle-02', '/story-seattle-02.html', '2013-11-22', false),
  ('dallas',  '3년 후 떠날 걸 알았습니다',   'story-dallas-01',  '/story-dallas-01.html',  '2017-06-11', false),
  ('toronto', '아무도 몰랐습니다',            'story-toronto-01', '/story-toronto-01.html', '2017-08-06', false),
  ('london',  '한국 사람이 더 무서웠습니다',  'story-london-01',  '/story-london-01.html',  '2025-06-29', false)
ON CONFLICT (slug) DO NOTHING;

SELECT '4. stories ✅' AS step;

-- ─────────────────────────────────────────────────────────────
-- 5. ai_query_logs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_query_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug  TEXT,
  question   VARCHAR(200) NOT NULL,
  tier       INT CHECK (tier IN (1, 2, 3)),
  category   TEXT,
  lang       TEXT DEFAULT 'ko' CHECK (lang IN ('ko', 'en', 'es')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_query_logs_city_date ON ai_query_logs (city_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_query_logs_category ON ai_query_logs (category);

ALTER TABLE ai_query_logs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_query_logs' AND policyname='anon_insert') THEN
    EXECUTE 'CREATE POLICY "anon_insert" ON ai_query_logs FOR INSERT TO anon WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_query_logs' AND policyname='pastor_select') THEN
    EXECUTE 'CREATE POLICY "pastor_select" ON ai_query_logs FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

SELECT '5. ai_query_logs ✅' AS step;

-- ─────────────────────────────────────────────────────────────
-- 6. content_reviews (관리자 검토 큐)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID,
  item_type   TEXT,  -- church | business | story
  reviewer    TEXT,
  decision    TEXT,  -- approved | rejected | pending
  note        TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_reviews' AND policyname='admin_all') THEN
    EXECUTE 'CREATE POLICY "admin_all" ON content_reviews FOR ALL TO authenticated USING (true)';
  END IF;
END $$;

SELECT '6. content_reviews ✅' AS step;

-- ─────────────────────────────────────────────────────────────
-- 7. Justin Oh Insurance 초기 데이터 (LA 보험)
-- ─────────────────────────────────────────────────────────────
INSERT INTO community_items (title, name, category, type, city_slug, city, description, phone, contact, url, status)
VALUES (
  'Justin Oh Insurance',
  'Justin Oh Insurance',
  'business',
  '보험',
  'la',
  'Los Angeles',
  '한인 이민자를 위한 보험 전문 에이전시. 생명보험·건강보험·자동차보험 전문.',
  '',
  '',
  '',
  'approved'
)
ON CONFLICT DO NOTHING;

SELECT '7. Justin Oh Insurance 초기 데이터 ✅' AS step;

-- ─────────────────────────────────────────────────────────────
-- 완료
-- ─────────────────────────────────────────────────────────────
SELECT '🎉 HebronGuide DB 초기화 완료 (okhfjzofifmsgssgajts)' AS result;
