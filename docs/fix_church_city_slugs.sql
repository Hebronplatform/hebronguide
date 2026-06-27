-- ================================================================
-- 파트너 교회 신청 city_slug 정규화 (2026-06-27)
-- Supabase 대시보드 > SQL Editor에서 실행
-- ================================================================

-- 1. 대소문자 오류 수정
UPDATE community_items SET city_slug = 'bogota'     WHERE category = 'church' AND city_slug = 'Bogota';
UPDATE community_items SET city_slug = 'vancouver'  WHERE category = 'church' AND city_slug = 'Vancouver';
UPDATE community_items SET city_slug = 'la'         WHERE category = 'church' AND city_slug = 'L.A.';

-- 2. 전체 주소 → 슬러그 변환
UPDATE community_items SET city_slug = 'princgeorge' WHERE category = 'church' AND city_slug = 'Prince George, BC';
UPDATE community_items SET city_slug = 'dc'          WHERE category = 'church' AND city_slug ILIKE '%페어펙스%';
UPDATE community_items SET city_slug = 'seoul'       WHERE category = 'church' AND city_slug = '서울';

-- 3. 앱에 없는 도시 — 가장 가까운 슬러그로 이동 (선택)
-- UPDATE community_items SET city_slug = 'orlando' WHERE category = 'church' AND city_slug ILIKE '%탬파%';
-- UPDATE community_items SET city_slug = 'sf'      WHERE category = 'church' AND city_slug ILIKE '%페어필드%';
-- UPDATE community_items SET city_slug = 'bundang' WHERE category = 'church' AND city_slug ILIKE '%남양주%';
-- UPDATE community_items SET city_slug = 'bundang' WHERE category = 'church' AND city_slug ILIKE '%의정부%';

-- 4. 확인
SELECT id, name, city_slug, status
FROM community_items
WHERE category = 'church'
ORDER BY created_at DESC
LIMIT 30;
