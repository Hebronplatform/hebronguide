-- ============================================================
-- HebronGuide 콘텐츠 INSERT — type='nature' (5건)
-- 생성: scripts/gen_content_sql.py | 검증된 데이터만 등재
-- 사용: Supabase 대시보드 → SQL Editor → 전체 복사·실행
-- ============================================================
-- ── Step 0: 컬럼 가드 (없으면 추가, 있으면 무시) ─────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='type') THEN ALTER TABLE community_items ADD COLUMN type text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='emoji') THEN ALTER TABLE community_items ADD COLUMN emoji text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='name_en') THEN ALTER TABLE community_items ADD COLUMN name_en text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='description_en') THEN ALTER TABLE community_items ADD COLUMN description_en text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='tags') THEN ALTER TABLE community_items ADD COLUMN tags jsonb; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='order') THEN ALTER TABLE community_items ADD COLUMN "order" int DEFAULT 500; END IF;
END $$;

-- ── Step 1: 기존 동일 (city,type) 정리 ──
DELETE FROM community_items WHERE type='nature' AND city_slug='seattle';

-- ── Step 2: INSERT ──
INSERT INTO community_items (city_slug, type, emoji, title, name, name_en, description, description_en, phone, website, tags, status, "order") VALUES
  ('seattle', 'nature', '🥾', '디스커버리 파크 순환로', '디스커버리 파크 순환로', 'Discovery Park Loop Trail', '시내에서 가장 가까운 자연. 평탄한 2.8마일(고도 140ft), 퓨젓사운드 전망. 무료 주차·사계절, 아이와 첫 산책에 최고.', 'Closest nature to the city. Flat 2.8mi loop (140ft gain), Puget Sound views. Free parking, year-round, great first hike with kids.', NULL, 'seattle.gov', '["쉬움", "무료", "가족"]'::jsonb, 'approved', 10),
  ('seattle', 'nature', '💦', '프랭클린 폭포', '프랭클린 폭포', 'Franklin Falls', '초보·가족용 쉬운 폭포 코스. 왕복 2마일(고도 400ft), 3단 폭포(41m). 봄~여름(4-7월) 수량 최고. 겨울 눈사태 주의.', 'Easy family waterfall hike. 2mi round trip (400ft), three-tier 135ft falls. Best flow Apr-Jul. Winter avalanche caution.', NULL, 'wta.org', '["쉬움", "폭포", "가족"]'::jsonb, 'approved', 20),
  ('seattle', 'nature', '🥾', '래틀스네이크 레지', '래틀스네이크 레지', 'Rattlesnake Ledge', '시애틀 대표 전망 하이킹. 왕복 약 5마일(고도 1,486ft), 호수·능선 절경. 인기 많아 주말 이른 출발 권장. 주차 Discover Pass 필요.', 'Seattle''s iconic viewpoint hike. ~5mi round trip (1,486ft), lake & ridge views. Very popular — start early on weekends. Discover Pass for trailhead.', NULL, 'wta.org', '["보통", "전망", "North Bend"]'::jsonb, 'approved', 30),
  ('seattle', 'nature', '⛺', '쿠거록 캠프장 (레이니어)', '쿠거록 캠프장 (레이니어)', 'Cougar Rock Campground (Mt. Rainier)', '레이니어 국립공원 내 캠프장(파라다이스 인근). 1박 $20, 식수·수세식 화장실. 5월 말~10월 초 운영. Recreation.gov 예약, 입장료 별도.', 'Campground inside Mt. Rainier NP near Paradise. $20/night, water & flush toilets. Late May-early Oct. Reserve on Recreation.gov; park entry separate.', NULL, 'recreation.gov', '["캠핑", "예약제", "국립공원"]'::jsonb, 'approved', 40),
  ('seattle', 'nature', '🏕️', '디셉션 패스 주립공원', '디셉션 패스 주립공원', 'Deception Pass State Park', '워싱턴 최다 방문 주립공원. 캠핑·캐빈·해변·다리 절경. 예약 888-226-7688 또는 온라인. 캠핑 영수증이 주차 패스 대신.', 'Washington''s most-visited state park. Camping, cabins, beaches & iconic bridge. Reserve 888-226-7688 or online. Camping receipt counts as parking pass.', NULL, 'parks.wa.gov', '["캠핑", "주립공원", "해변"]'::jsonb, 'approved', 50);

-- 확인: SELECT city_slug, COUNT(*) FROM community_items WHERE type='nature' GROUP BY city_slug;