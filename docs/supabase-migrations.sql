-- HebronGuide Supabase 신규 테이블 마이그레이션
-- 생성: 2026-05-20
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 순서대로 실행하세요.

-- ─────────────────────────────────────────────────────────────
-- 1. 목사 파트너 테이블
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pastor_partners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  church_name TEXT,
  city_slug   TEXT,
  country     TEXT,
  tier        INT DEFAULT 1 CHECK (tier IN (1, 2, 3)),
  -- 1 = 기본 파트너
  -- 2 = 허브교회 (IHM/KSBC 네트워크)
  -- 3 = 앵커 교회 (지역 대표)
  joined_at   TIMESTAMPTZ DEFAULT now(),
  verified    BOOLEAN DEFAULT false,
  notes       TEXT
);

COMMENT ON TABLE pastor_partners IS '목사 파트너 인증 테이블. Magic Link 로그인 기반.';
COMMENT ON COLUMN pastor_partners.tier IS '1=기본, 2=허브교회, 3=앵커';

-- ─────────────────────────────────────────────────────────────
-- 2. 이달의 이야기 테이블
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug    TEXT NOT NULL,
  title_ko     TEXT NOT NULL,
  title_en     TEXT,
  slug         TEXT UNIQUE NOT NULL,
  -- 예: "story-seattle-01"
  html_file    TEXT,
  -- 예: "/story-seattle-01.html"
  author_name  TEXT,
  -- 비식별 or 이니셜 (예: "김 목사")
  source_ref   TEXT,
  -- 출처 (예: "목회칼럼 2013.08.18, ijiguchon.org")
  published_at DATE,
  -- K-드라마 5막 텍스트 (HTML 허용)
  act1_ko      TEXT,  -- 1막: 도착
  act2_ko      TEXT,  -- 2막: 아픔
  act3_ko      TEXT,  -- 3막: 만남
  act4_ko      TEXT,  -- 4막: 변화
  act5_ko      TEXT,  -- 5막: 희망·재미·감사
  act1_en      TEXT,
  act2_en      TEXT,
  act3_en      TEXT,
  act4_en      TEXT,
  act5_en      TEXT,
  featured     BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE stories IS '이달의 이야기. K-드라마 5막 구조 (도착→아픔→만남→변화→희망).';

-- 기존 이야기 초기 데이터
INSERT INTO stories (city_slug, title_ko, slug, html_file, published_at, featured)
VALUES
  ('seattle', '반기는 사람이 없었습니다', 'story-seattle-01', '/story-seattle-01.html', '2013-08-18', true),
  ('seattle', '나도 모르게 달려갔습니다', 'story-seattle-02', '/story-seattle-02.html', '2013-11-22', false),
  ('dallas',  '3년 후 떠날 걸 알았습니다', 'story-dallas-01', '/story-dallas-01.html', '2017-06-11', false),
  ('toronto', '아무도 몰랐습니다', 'story-toronto-01', '/story-toronto-01.html', '2017-08-06', false),
  ('london',  '한국 사람이 더 무서웠습니다', 'story-london-01', '/story-london-01.html', '2025-06-29', false)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. AI 질의 로그 (사역 인사이트 원천 데이터)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_query_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug  TEXT,
  question   VARCHAR(200) NOT NULL,  -- 200자 제한 (개인정보 보호)
  tier       INT CHECK (tier IN (1, 2, 3)),
  category   TEXT,
  -- church / visa / food / job / housing / health / education / help / general
  lang       TEXT DEFAULT 'ko' CHECK (lang IN ('ko', 'en', 'es')),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE ai_query_logs IS 'AI 질의 로그. 사역 인사이트 집계용. 200자 제한으로 개인정보 보호.';
COMMENT ON COLUMN ai_query_logs.question IS '최대 200자 제한. 개인정보(이름·연락처) 포함 금지.';

-- 인덱스 (집계 쿼리 성능)
CREATE INDEX IF NOT EXISTS idx_ai_query_logs_city_date
  ON ai_query_logs (city_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_query_logs_category
  ON ai_query_logs (category);

-- ─────────────────────────────────────────────────────────────
-- 4. 사역 인사이트 캐시 (월별)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pastor_insights_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug    TEXT NOT NULL,
  period       TEXT NOT NULL,
  -- "2026-05" 형식 (YYYY-MM)
  insights_json JSONB,
  -- { summary, categoryCounts, topKeywords, tierDist, totalQueries, generatedAt }
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (city_slug, period)
);

COMMENT ON TABLE pastor_insights_cache IS '목사 대시보드 AI 인사이트 월별 캐시.';

-- ─────────────────────────────────────────────────────────────
-- 5. RLS (Row Level Security) 정책
-- ─────────────────────────────────────────────────────────────

-- pastor_partners: service_role만 접근
ALTER TABLE pastor_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_only" ON pastor_partners
  USING (false);
-- 서버사이드(service_role 키)에서만 접근. 클라이언트 직접 접근 금지.

-- stories: 모두 읽기 가능, 쓰기는 service_role만
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON stories
  FOR SELECT TO anon, authenticated USING (true);

-- ai_query_logs: anon 삽입 가능, SELECT는 인증 목사만
ALTER TABLE ai_query_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON ai_query_logs
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "pastor_select" ON ai_query_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pastor_partners
      WHERE email = auth.jwt() ->> 'email'
        AND verified = true
    )
  );

-- pastor_insights_cache: 인증된 목사만 읽기
ALTER TABLE pastor_insights_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pastor_read_cache" ON pastor_insights_cache
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pastor_partners
      WHERE email = auth.jwt() ->> 'email'
        AND verified = true
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 6. 목사 파트너 초기 데이터 (운영팀 등록용 예시)
-- ─────────────────────────────────────────────────────────────
-- 실제 배포 전 운영팀이 직접 INSERT:
-- INSERT INTO pastor_partners (name, email, church_name, city_slug, country, tier, verified)
-- VALUES ('폴 김', 'gmc.hc300@gmail.com', '시애틀지구촌교회', 'seattle', 'United States', 3, true);

-- ─────────────────────────────────────────────────────────────
-- 완료 확인 쿼리
-- ─────────────────────────────────────────────────────────────
SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pastor_partners', 'stories', 'ai_query_logs', 'pastor_insights_cache')
ORDER BY table_name;
