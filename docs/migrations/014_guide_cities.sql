-- ============================================================
-- guide_cities — HebronGuide 도시 마스터 (80개)
-- 생성: 2026-07-25 · 소스: HebronGuide.tsx(CITY_CONFIGS·HEBRON_CITIES) + build.sh(REGION_MAP·CITY_GEO)
--
-- 목적: 도시 추가 비용을 "12곳 수정" → "1행 INSERT"로 낮춘다.
-- 안전: 이 스크립트는 기존 테이블을 건드리지 않는다(신규 테이블 1개만 생성).
--       앱은 아직 이 테이블을 읽지 않는다 — 데이터만 먼저 옮겨두는 단계.
-- 재실행 안전: DROP 없음. slug 충돌 시 최신 값으로 갱신(UPSERT).
-- ============================================================

CREATE TABLE IF NOT EXISTS guide_cities (
  slug         text PRIMARY KEY,
  name_ko      text NOT NULL,
  name_en      text NOT NULL,
  state        text,
  country      text,
  region       text,
  color        text NOT NULL DEFAULT '#F2994A',
  emoji        text,
  flag         text,
  status       text NOT NULL DEFAULT 'live',
  population   text,
  tagline_ko   text,
  tagline_en   text,
  tagline_es   text,
  hero_video   text,
  hero_videos  jsonb NOT NULL DEFAULT '[]'::jsonb,
  lat          numeric(10,7),
  lng          numeric(10,7),
  sort_order   int,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE guide_cities IS 'HebronGuide 도시 마스터. 도시 추가 시 이 테이블에 1행만 넣으면 되도록 설계.';
COMMENT ON COLUMN guide_cities.emoji IS '⚠️ 레거시 — HEBRON_CITIES에서 그대로 옮긴 값. UI에 렌더하지 말 것(이모지 금지 원칙). 아이콘은 SVG 사용.';
COMMENT ON COLUMN guide_cities.flag  IS '⚠️ 레거시 — 국기 이모지. UI 렌더 금지, country 컬럼을 사용할 것.';
COMMENT ON COLUMN guide_cities.population IS '한인 인구 근사 표기(문자열). 미검증 도시는 "—". 현재 UI 미표시.';

CREATE INDEX IF NOT EXISTS guide_cities_status_idx ON guide_cities (status);
CREATE INDEX IF NOT EXISTS guide_cities_region_idx ON guide_cities (region);

-- ── RLS: 공개 읽기 전용 (쓰기는 service_role만) ──────────────
ALTER TABLE guide_cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS guide_cities_public_read ON guide_cities;
CREATE POLICY guide_cities_public_read
  ON guide_cities FOR SELECT
  USING (status = 'live');

-- ── 데이터 (80개 도시) ──────────────────────────────────────
INSERT INTO guide_cities
  (slug, name_ko, name_en, state, country, region, color, emoji, flag, status,
   population, tagline_ko, tagline_en, tagline_es, hero_video, hero_videos,
   lat, lng, sort_order)
VALUES
  ('seattle', '시애틀', 'Seattle', 'Washington', '미국', '미국', '#0EA5E9', '🌲', '🇺🇸', 'live', '15만+', '도시를 알고, 사람을 찾다', 'Know your city. Find your people.', 'Conoce tu ciudad. Encuentra tu gente.', 'https://videos.pexels.com/video-files/32971137/32971137-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/32971137/32971137-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/29042800/29042800-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/28638124/28638124-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/33617069/33617069-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/20017409/20017409-hd_1920_1080_24fps.mp4", "https://videos.pexels.com/video-files/29024579/29024579-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/29321826/29321826-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/16109591/16109591-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/28903920/28903920-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/37228020/37228020-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/28903704/28903704-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/29024559/29024559-hd_1920_1080_30fps.mp4"]'::jsonb, 47.6062, -122.3321, 1),
  ('federalway', '훼더럴웨이', 'Federal Way', 'Washington', '미국', '미국', '#14B8A6', '🌊', '🇺🇸', 'live', '한인 밀집', '훼더럴웨이에서 함께 정착하다', 'Settle together in Federal Way.', 'Establécete junto a otros en Federal Way.', NULL, '[]'::jsonb, 47.3223, -122.3126, 2),
  ('dallas', '달라스', 'Dallas', 'Texas', '미국', '미국', '#F59E0B', '🤠', '🇺🇸', 'live', '10만+', '텍사스에서 뿌리내리다', 'Put down roots in Texas.', 'Echa raíces en Texas.', 'https://videos.pexels.com/video-files/29941189/29941189-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/29941189/29941189-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/31419645/31419645-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/13432744/13432744-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/15613412/15613412-hd_1920_1080_30fps.mp4"]'::jsonb, 32.7767, -96.7970, 3),
  ('sf', '샌프란시스코', 'San Francisco', 'California', '미국', '미국', '#8B5CF6', '🌉', '🇺🇸', 'live', '8만+', '베이에서 시작하는 새 출발', 'A new start by the Bay.', 'Un nuevo comienzo junto a la Bahía.', 'https://videos.pexels.com/video-files/31679507/31679507-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/31679507/31679507-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/30846612/30846612-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/29190919/29190919-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/19834290/19834290-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/19834296/19834296-hd_1920_1080_30fps.mp4"]'::jsonb, 37.7749, -122.4194, 4),
  ('newyork', '뉴욕', 'New York', 'New York', '미국', '미국', '#EF4444', '🗽', '🇺🇸', 'live', '15만+', '뉴욕에서 찾는 나의 자리', 'Find your place in New York.', 'Encuentra tu lugar en Nueva York.', 'https://videos.pexels.com/video-files/28855592/28855592-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/28855592/28855592-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/12122308/12122308-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/5656146/5656146-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/5796436/5796436-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/28608250/28608250-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/30037621/30037621-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/28962559/28962559-hd_1920_1080_30fps.mp4"]'::jsonb, 40.7128, -74.0060, 5),
  ('newjersey', '뉴저지', 'New Jersey', 'New Jersey', '미국', '미국', '#0EA5E9', '🌆', '🇺🇸', 'live', '6만+', '뉴저지에서 시작하는 우리 이야기', 'Your story begins in New Jersey.', 'Tu historia comienza en Nueva Jersey.', NULL, '[]'::jsonb, 40.8484, -73.9915, 6),
  ('nashville', '내쉬빌', 'Nashville', 'Tennessee', '미국', '미국', '#10B981', '🎵', '🇺🇸', 'live', '2만+', '뮤직시티에서의 새 출발', 'New start in Music City.', 'Nuevo comienzo en la ciudad de la música.', 'https://videos.pexels.com/video-files/26605317/26605317-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/26605317/26605317-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/26605315/26605315-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/29852024/29852024-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/26756361/26756361-hd_1920_1080_30fps.mp4"]'::jsonb, 36.1627, -86.7816, 7),
  ('boston', '보스턴', 'Boston', 'Massachusetts', '미국', '미국', '#3B82F6', '🦞', '🇺🇸', 'live', '3만+', '역사의 도시, 새 역사를 쓰다', 'Write your story in Boston.', 'Escribe tu historia en Boston.', 'https://videos.pexels.com/video-files/12595889/12595889-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/12595889/12595889-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/12595925/12595925-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/12595927/12595927-hd_1920_1080_30fps.mp4"]'::jsonb, 42.3601, -71.0589, 8),
  ('la', 'LA', 'Los Angeles', 'California', '미국', '미국', '#F97316', '🎬', '🇺🇸', 'live', '50만+', '꿈의 도시, 모두의 LA', 'City of dreams, everyone''s LA.', 'Ciudad de sueños, el LA de todos.', 'https://videos.pexels.com/video-files/30670671/30670671-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/30670671/30670671-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/11558523/11558523-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/14274844/14274844-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/30955305/30955305-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/7005445/7005445-hd_1920_1080_30fps.mp4"]'::jsonb, 34.0522, -118.2437, 9),
  ('toronto', '토론토', 'Toronto', 'Ontario', '캐나다', '캐나다', '#06B6D4', '🍁', '🇨🇦', 'live', '10만+', 'CN타워 아래, 새 이야기를 쓰다', 'Write your story under the CN Tower.', 'Coreano en Canadá.', 'https://videos.pexels.com/video-files/20597195/20597195-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/20597195/20597195-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/29844374/29844374-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/13580749/13580749-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/5021921/5021921-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/27018635/27018635-hd_1920_1080_30fps.mp4"]'::jsonb, 43.6532, -79.3832, 10),
  ('vancouver', '밴쿠버', 'Vancouver', 'B.C.', '캐나다', '캐나다', '#22C55E', '🌲', '🇨🇦', 'live', '8만+', '태평양의 관문에서', 'Gateway to the Pacific.', 'Puerta al Pacífico.', 'https://videos.pexels.com/video-files/32805734/32805734-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/32805734/32805734-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/4898681/4898681-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/16015955/16015955-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/26599315/26599315-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/4265473/4265473-hd_1920_1080_30fps.mp4"]'::jsonb, 49.2827, -123.1207, 11),
  ('houston', '휴스턴', 'Houston', 'Texas', '미국', '미국', '#EA580C', '🚀', '🇺🇸', 'live', '2.5만+', '텍사스 남부의 활력', 'Vibrant heart of South Texas.', 'Corazón vibrante del sur de Texas.', 'https://videos.pexels.com/video-files/18126746/18126746-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/18126746/18126746-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/17638145/17638145-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/18127054/18127054-hd_1920_1080_30fps.mp4"]'::jsonb, 29.7604, -95.3698, 12),
  ('atlanta', '애틀랜타', 'Atlanta', 'Georgia', '미국', '미국', '#16A34A', '🍑', '🇺🇸', 'live', '10만+', 'ATL, 남부에서 더 크게 꿈꾸다', 'Dream bigger in the South — ATL.', 'Hub coreano del Sur.', 'https://videos.pexels.com/video-files/31302813/31302813-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/31302813/31302813-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/33134800/33134800-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/31406771/31406771-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/2818556/2818556-hd_1920_1080_30fps.mp4"]'::jsonb, 33.7490, -84.3880, 13),
  ('philadelphia', '필라델피아', 'Philadelphia', 'Pennsylvania', '미국', '미국', '#22D3EE', '🏛️', '🇺🇸', 'live', '3만+', '역사의 도시에서 시작하다', 'Start your story in the City of Brotherly Love.', 'Comienza tu historia en la Ciudad del Amor Fraternal.', 'https://videos.pexels.com/video-files/37196450/37196450-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/37196450/37196450-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/37166114/37166114-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/2356322/2356322-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/4988273/4988273-hd_1920_1080_30fps.mp4"]'::jsonb, 39.9526, -75.1652, 14),
  ('kansascity', '캔자스시티', 'Kansas City', 'Missouri', '미국', '미국', '#9333EA', '🎷', '🇺🇸', 'live', '3천+', '중부의 새 지평', 'New horizons in the Heartland.', 'Nuevos horizontes en el corazón de EE.UU.', NULL, '[]'::jsonb, 39.0997, -94.5786, 15),
  ('miami', '마이애미', 'Miami', 'Florida', '미국', '미국', '#EC4899', '🌴', '🇺🇸', 'live', '5천+', '햇살 아래 새 출발', 'Fresh start under the sun.', 'Nuevo comienzo bajo el sol.', 'https://videos.pexels.com/video-files/31673932/31673932-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/31673932/31673932-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/30872154/30872154-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/4135118/4135118-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/6345016/6345016-hd_1920_1080_30fps.mp4"]'::jsonb, 25.7617, -80.1918, 16),
  ('orangecounty', '오렌지카운티', 'Orange County', 'California', '미국', '미국', '#F97316', '🍊', '🇺🇸', 'live', '10만+', '풀러튼·부에나파크 — LA 남쪽 한인 중심지', 'Fullerton · Buena Park — Korean hub south of LA.', 'Fullerton · Buena Park — hub coreano al sur de LA.', NULL, '[]'::jsonb, 33.8703, -117.9865, 17),
  ('chicago', '시카고', 'Chicago', 'Illinois', '미국', '미국', '#2563EB', '🏙️', '🇺🇸', 'live', '6.2만+', '바람의 도시, 우리의 집 — O''Hare 35마일 권역 (나일스·글렌뷰·에반스턴 포함)', 'City of Winds, Home of Ours — 35mi from O''Hare (Niles·Glenview·Evanston)', 'Ciudad de los Vientos — 35mi desde O''Hare (Niles·Glenview·Evanston)', NULL, '[]'::jsonb, 41.8781, -87.6298, 18),
  ('dc', '워싱턴 DC', 'Washington DC', 'Virginia/MD', '미국', '미국', '#DC2626', '🏛️', '🇺🇸', 'live', '9.3만+', '나라의 심장에서', 'At the Heart of the Nation.', 'En el corazón de la nación.', NULL, '[]'::jsonb, 38.9072, -77.0369, 19),
  ('sandiego', '샌디에고', 'San Diego', 'California', '미국', '미국', '#0EA5E9', '🌞', '🇺🇸', 'live', '2.5만+', '태평양이 품은 도시', 'The City the Pacific Holds.', 'La ciudad que abraza el Pacífico.', NULL, '[]'::jsonb, 32.7157, -117.1611, 20),
  ('honolulu', '호놀룰루', 'Honolulu', 'Hawaii', '미국', '미국', '#10B981', '🌺', '🇺🇸', 'live', '2.3만+', '태평양의 섬, 새로운 출발', 'Island life, fresh start.', 'Vida isleña, nuevo comienzo.', NULL, '[]'::jsonb, 21.3069, -157.8583, 21),
  ('portland', '포틀랜드', 'Portland', 'Oregon', '미국', '미국', '#BE185D', '🌹', '🇺🇸', 'live', '1만+', '장미 도시, 새로운 씨앗', 'Bloom in the Rose City.', 'Florecer en la Ciudad de las Rosas.', NULL, '[]'::jsonb, 45.5152, -122.6784, 22),
  ('denver', '덴버', 'Denver', 'Colorado', '미국', '미국', '#EA580C', '🏔️', '🇺🇸', 'live', '1.5만+', '산을 바라보며', 'Looking Out to the Mountains.', 'Con vista a las montañas.', NULL, '[]'::jsonb, 39.7392, -104.9903, 23),
  ('phoenix', '피닉스', 'Phoenix', 'Arizona', '미국', '미국', '#EA580C', '☀️', '🇺🇸', 'live', '1.2만+', '사막 속 새로운 뿌리', 'New roots in the desert sun.', 'Nuevas raíces bajo el sol del desierto.', NULL, '[]'::jsonb, 33.4484, -112.0740, 24),
  ('charlotte', '샬럿', 'Charlotte', 'N. Carolina', '미국', '미국', '#0EA5E9', '🏈', '🇺🇸', 'live', '1.5만+', '남부의 빠른 성장, 함께', 'The South''s fastest-growing community.', 'La ciudad de más rápido crecimiento del Sur.', NULL, '[]'::jsonb, 35.2271, -80.8431, 25),
  ('raleigh', '롤리', 'Raleigh', 'N. Carolina', '미국', '미국', '#2563EB', '🔬', '🇺🇸', 'live', '1만+', '연구의 도시, 새로운 가능성', 'Innovation and new beginnings.', 'Innovación y nuevos comienzos.', NULL, '[]'::jsonb, 35.7796, -78.6382, 26),
  ('columbus', '콜럼버스', 'Columbus', 'Ohio', '미국', '미국', '#EF4444', '🎓', '🇺🇸', 'live', '1.2만+', '오하이오의 중심, 새로운 집', 'Ohio''s heart, your new home.', 'El corazón de Ohio, tu nuevo hogar.', NULL, '[]'::jsonb, 39.9612, -82.9988, 27),
  ('minneapolis', '미니애폴리스', 'Minneapolis', 'Minnesota', '미국', '미국', '#7C3AED', '❄️', '🇺🇸', 'live', '8천+', '호수와 함께하는 새 출발', 'Fresh start by the lakes.', 'Nuevo comienzo junto a los lagos.', NULL, '[]'::jsonb, 44.9778, -93.2650, 28),
  ('tucson', '투손', 'Tucson', 'Arizona', '미국', '미국', '#CA8A04', '🌵', '🇺🇸', 'live', '3천+', '사막의 대학 도시', 'Desert University City.', 'Ciudad universitaria del desierto.', NULL, '[]'::jsonb, 32.2226, -110.9747, 29),
  ('fayetteville', '페이엣빌', 'Fayetteville', 'N. Carolina', '미국', '미국', '#22C55E', '🪖', '🇺🇸', 'live', '5천+', '군인 가족의 도시, 함께', 'Military families, all together.', 'Familias militares, todos juntos.', NULL, '[]'::jsonb, 35.0527, -78.8784, 30),
  ('killeen', '킬린', 'Killeen', 'Texas', '미국', '미국', '#16A34A', '🪖', '🇺🇸', 'live', '4천+', '포트 카바조스, 새 가족', 'New family at Fort Cavazos.', 'Nueva familia en Fort Cavazos.', NULL, '[]'::jsonb, 31.1171, -97.7278, 31),
  ('fairfield', '페어필드', 'Fairfield', 'California', '미국', '미국', '#10B981', '🪖', '🇺🇸', 'live', '—', '트래비스 공군기지, 새로운 이웃', 'Travis AFB — your new neighbors.', 'Base Travis, tus nuevos vecinos.', NULL, '[]'::jsonb, 38.2494, -122.0400, 32),
  ('waynesville', '웨인즈빌', 'Waynesville', 'Missouri', '미국', '미국', '#7C3AED', '🪖', '🇺🇸', 'live', '—', '포트 레너드우드, 함께 걷는 길', 'Fort Leonard Wood — walking together.', 'Fort Leonard Wood, caminando juntos.', NULL, '[]'::jsonb, 37.8286, -92.2001, 33),
  ('louisville', '루이빌', 'Louisville', 'Kentucky', '미국', '미국', '#7C3AED', '🥃', '🇺🇸', 'live', '3천+', '버번의 도시, 새 이야기', 'The Bourbon Capital, Your New Story.', 'La capital del bourbon, tu nueva historia.', NULL, '[]'::jsonb, 38.2527, -85.7585, 34),
  ('orlando', '올랜도', 'Orlando', 'Florida', '미국', '미국', '#F97316', '☀️', '🇺🇸', 'live', '3천+', '선샤인 스테이트의 한인 커뮤니티', 'Korean Community in the Sunshine State.', 'Comunidad coreana en Florida.', NULL, '[]'::jsonb, 28.5383, -81.3792, 35),
  ('tampa', '탬파', 'Tampa', 'Florida', '미국', '미국', '#0EA5E9', '🌊', '🇺🇸', 'live', '—', '걸프 해안에서 시작하는 첫날', 'Your first day on the Gulf Coast.', 'Tu primer día en la Costa del Golfo.', NULL, '[]'::jsonb, 27.9506, -82.4572, 36),
  ('maryland', '메릴랜드', 'Maryland', 'Maryland', '미국', '미국', '#DC2626', '🍒', '🇺🇸', 'live', '2만+', 'DC의 보금자리, 메릴랜드 한인 커뮤니티', 'Home of DC''s Korean community — Montgomery County.', 'La comunidad coreana del área de DC.', NULL, '[]'::jsonb, 39.2673, -76.7983, 37),
  ('virginia', '버지니아', 'Virginia', 'Virginia', '미국', '미국', '#0F766E', '🏞️', '🇺🇸', 'live', '3만+', '애넌데일에서 블루리지까지, 버지니아 한인', 'Virginia''s Korean community — Annandale to Blue Ridge.', 'La comunidad coreana de Virginia.', NULL, '[]'::jsonb, 38.8304, -77.1964, 38),
  ('neworleans', '뉴올리언스', 'New Orleans', 'Louisiana', '미국', '미국', '#7E22CE', '⚜️', '🇺🇸', 'live', '3천+', '재즈의 도시, 뉴올리언스 새 출발', 'Jazz city — your new start in New Orleans.', 'La ciudad del jazz, Nueva Orleans.', NULL, '[]'::jsonb, 29.9511, -90.0715, 39),
  ('anchorage', '앵커리지', 'Anchorage', 'Alaska', '미국', '미국', '#14B8A6', '🐻', '🇺🇸', 'live', '5천+', '가장 북쪽의 한인 도시', 'America''s Northernmost Korean City.', 'La ciudad coreana más al norte.', NULL, '[]'::jsonb, 61.2181, -149.9003, 40),
  ('inlandempire', '인랜드 엠파이어', 'Inland Empire', 'California', '미국', '미국', '#D97706', '🌄', '🇺🇸', 'live', '3.2만+', 'LA 동쪽, 한인 가족의 새 보금자리', 'East of LA, the new home for Korean families.', 'Al este de LA, el nuevo hogar de las familias coreanas.', NULL, '[]'::jsonb, 34.0633, -117.2898, 41),
  ('austin', '오스틴', 'Austin', 'Texas', '미국', '미국', '#1D4ED8', '🤠', '🇺🇸', 'live', '2만+', '텍사스 테크 허브, 한인 엔지니어의 새 도시', 'Texas tech hub, the rising city for Korean engineers.', 'Centro tecnológico de Texas, la nueva ciudad para ingenieros coreanos.', NULL, '[]'::jsonb, 30.2672, -97.7431, 42),
  ('huntsville', '헌츠빌', 'Huntsville', 'Alabama', '미국', '미국', '#2563EB', '🚀', '🇺🇸', 'live', '1천4백+', '로켓 시티에서 새로 시작하는 한인 가정', 'Rocket City — a new start for Korean families.', 'Ciudad Cohete, un nuevo comienzo.', NULL, '[]'::jsonb, 34.7304, -86.5861, 43),
  ('memphis', '멤피스', 'Memphis', 'Tennessee', '미국', '미국', '#B45309', '🎸', '🇺🇸', 'live', '6백+', '미시시피 강가의 한인 교회 공동체', 'Korean church community on the Mississippi.', 'Comunidad coreana junto al Misisipi.', NULL, '[]'::jsonb, 35.1495, -90.0490, 44),
  ('calgary', '캘거리', 'Calgary', 'Alberta', '캐나다', '캐나다', '#D97706', '🍁', '🇨🇦', 'live', '1.3만+', '알버타의 새 출발', 'A new start in Alberta.', 'Un nuevo comienzo en Alberta.', NULL, '[]'::jsonb, 51.0447, -114.0719, 45),
  ('edmonton', '에드먼턴', 'Edmonton', 'Alberta', '캐나다', '캐나다', '#10B981', '🍁', '🇨🇦', 'live', '8천+', '북쪽 평원의 새 출발', 'New roots on the Northern Plains.', 'Nuevas raíces en las llanuras del norte.', NULL, '[]'::jsonb, 53.5461, -113.4938, 46),
  ('ottawa', '오타와', 'Ottawa', 'Ontario', '캐나다', '캐나다', '#DC2626', '🏛️', '🇨🇦', 'live', '5천+', '수도에서의 새 시작', 'A quiet new start in the Capital.', 'Un nuevo comienzo tranquilo en la capital.', NULL, '[]'::jsonb, 45.4215, -75.6972, 47),
  ('winnipeg', '위니펙', 'Winnipeg', 'Manitoba', '캐나다', '캐나다', '#7C3AED', '🌾', '🇨🇦', 'live', '4천+', '대평원의 따뜻한 커뮤니티', 'Warm community on the great plains.', 'Comunidad cálida en las grandes praderas.', NULL, '[]'::jsonb, 49.8951, -97.1384, 48),
  ('princgeorge', '프린스조지', 'Prince George', 'British Columbia', '캐나다', '캐나다', '#2D6A4F', '🌲', '🇨🇦', 'live', '5백+', 'BC 북부, 자연 속의 따뜻한 한인 공동체', 'A warm Korean community in the heart of northern BC.', 'Una cálida comunidad coreana en el norte de BC.', NULL, '[]'::jsonb, 53.9171, -122.7497, 49),
  ('mexicocity', '멕시코시티', 'Mexico City', 'Mexico', '멕시코', '중남미', '#DC2626', '🌮', '🇲🇽', 'live', '1만+', '고대와 현대가 만나는 곳', 'Where ancient meets modern.', 'Donde lo antiguo se encuentra con lo moderno.', 'https://videos.pexels.com/video-files/31014956/31014956-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/31014956/31014956-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/28585100/28585100-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/30685198/30685198-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/12943393/12943393-hd_1920_1080_30fps.mp4"]'::jsonb, 19.4326, -99.1332, 50),
  ('guadalajara', '과달라하라', 'Guadalajara', 'Mexico', '멕시코', '중남미', '#F59E0B', '🌺', '🇲🇽', 'live', '2천+', '멕시코의 문화 수도', 'Mexico''s cultural capital.', 'La capital cultural de México.', NULL, '[]'::jsonb, 20.6597, -103.3496, 51),
  ('monterrey', '몬테레이', 'Monterrey', 'Mexico', '멕시코', '중남미', '#0EA5E9', '⛰️', '🇲🇽', 'live', '1천+', '산으로 둘러싸인 산업도시', 'Industrial city in the mountains.', 'Ciudad industrial entre montañas.', 'https://videos.pexels.com/video-files/32937859/32937859-hd_1920_1080_30fps.mp4', '["https://videos.pexels.com/video-files/32937859/32937859-hd_1920_1080_30fps.mp4", "https://videos.pexels.com/video-files/31825531/31825531-hd_1920_1080_30fps.mp4"]'::jsonb, 25.6866, -100.3161, 52),
  ('saopaulo', '상파울루', 'São Paulo', 'Brazil', '브라질', '중남미', '#DC2626', '🇧🇷', '🇧🇷', 'live', '5만+', '남미 한인의 심장', 'Heart of Korean South America.', 'El corazón del sudamérica coreana.', NULL, '[]'::jsonb, -23.5505, -46.6333, 53),
  ('bogota', '보고타', 'Bogota', 'Colombia', '콜롬비아', '중남미', '#FBBF24', '🏔️', '🇨🇴', 'live', '~3천', '남미의 심장, 새로운 만남', 'Heart of South America, new encounters.', 'El corazón de Sudamérica, nuevos encuentros.', NULL, '[]'::jsonb, 4.7110, -74.0721, 54),
  ('sydney', '시드니', 'Sydney', 'N.S.W.', '호주', '오세아니아', '#38BDF8', '🦘', '🇦🇺', 'live', '7만+', '남반구의 새로운 집', 'Your new home down under.', 'Tu nuevo hogar en el hemisferio sur.', NULL, '[]'::jsonb, -33.8688, 151.2093, 55),
  ('melbourne', '멜버른', 'Melbourne', 'Victoria', '호주', '오세아니아', '#9333EA', '☕', '🇦🇺', 'live', '3만+', '카페 문화의 도시, 새로운 시작', 'Start fresh in the Coffee City.', 'Nuevo comienzo en la ciudad del café.', NULL, '[]'::jsonb, -37.8136, 144.9631, 56),
  ('brisbane', '브리즈번', 'Brisbane', 'Queensland', '호주', '오세아니아', '#CA8A04', '🌞', '🇦🇺', 'live', '1.8만+', '선샤인 스테이트, 밝은 출발', 'Bright new start in the Sunshine State.', 'Nuevo comienzo luminoso en el Estado del Sol.', NULL, '[]'::jsonb, -27.4698, 153.0251, 57),
  ('perth', '퍼스', 'Perth', 'W. Australia', '호주', '오세아니아', '#38BDF8', '🌊', '🇦🇺', 'live', '1.2만+', '세계 최서단, 나만의 공간', 'World''s most remote, your own space.', 'La ciudad más remota, tu propio espacio.', NULL, '[]'::jsonb, -31.9505, 115.8605, 58),
  ('auckland', '오클랜드', 'Auckland', 'New Zealand', '뉴질랜드', '오세아니아', '#16A34A', '🥝', '🇳🇿', 'live', '2.5만+', '키위와 함께', 'Together with the Kiwis.', 'Junto con los kiwis.', NULL, '[]'::jsonb, -36.8485, 174.7633, 59),
  ('london', '런던', 'London', 'England', '영국', '유럽', '#2563EB', '🎡', '🇬🇧', 'live', '4.5만+', '안개의 도시, 새로운 역사', 'Write your story in the Fog.', 'Escribe tu historia entre la niebla.', NULL, '[]'::jsonb, 51.5074, -0.1278, 60),
  ('frankfurt', '프랑크푸르트', 'Frankfurt', 'Germany', '독일', '유럽', '#3B82F6', '🏦', '🇩🇪', 'live', '7천+', '유럽 금융 허브, 새로운 기회', 'At Europe''s Financial Core.', 'En el núcleo financiero de Europa.', NULL, '[]'::jsonb, 50.1109, 8.6821, 61),
  ('berlin', '베를린', 'Berlin', 'Germany', '독일', '유럽', '#2563EB', '🧱', '🇩🇪', 'live', '5천+', '장벽을 넘어, 자유의 도시', 'Beyond the Wall, city of freedom.', 'Más allá del muro, ciudad de libertad.', NULL, '[]'::jsonb, 52.5200, 13.4050, 62),
  ('paris', '파리', 'Paris', 'France', '프랑스', '유럽', '#7C3AED', '🗼', '🇫🇷', 'live', '1.5만+', '빛의 도시의 한인', 'Koreans in the City of Light.', 'Coreanos en la Ciudad de la Luz.', NULL, '[]'::jsonb, 48.8566, 2.3522, 63),
  ('dubai', '두바이', 'Dubai', 'UAE', 'UAE', '동남아·중동', '#CA8A04', '🏙️', '🇦🇪', 'live', '8천+', '사막의 황금 도시', 'The Golden City of the Desert.', 'La Ciudad Dorada del Desierto.', NULL, '[]'::jsonb, 25.2048, 55.2708, 64),
  ('singapore', '싱가포르', 'Singapore', 'Singapore', '싱가포르', '동남아·중동', '#DC2626', '🦁', '🇸🇬', 'live', '2.2만+', '아시아의 허브, 모두의 도시', 'Asia''s hub, everyone''s city.', 'El hub de Asia, la ciudad de todos.', NULL, '[]'::jsonb, 1.3521, 103.8198, 65),
  ('bangkok', '방콕', 'Bangkok', 'Thailand', '태국', '동남아·중동', '#9333EA', '🏯', '🇹🇭', 'live', '2만+', '황금 도시, 새로운 이야기', 'New stories in the Golden City.', 'Nuevas historias en la ciudad dorada.', NULL, '[]'::jsonb, 13.7563, 100.5018, 66),
  ('hochiminh', '호치민', 'Ho Chi Minh City', 'Vietnam', '베트남', '동남아·중동', '#BE185D', '🛵', '🇻🇳', 'live', '6만+', '역동적인 비즈니스 도시', 'The dynamic city of business.', 'La ciudad dinámica de los negocios.', NULL, '[]'::jsonb, 10.8231, 106.6297, 67),
  ('tokyo', '도쿄', 'Tokyo', 'Japan', '일본', '일본', '#DC2626', '⛩️', '🇯🇵', 'live', '6만+', '신오쿠보에서 시작하는 새 인연', 'New bonds begin in Shin-Okubo.', 'Nuevos vínculos en Shin-Okubo.', NULL, '[]'::jsonb, 35.6762, 139.6503, 68),
  ('osaka', '오사카', 'Osaka', 'Japan', '일본', '일본', '#EA580C', '🐙', '🇯🇵', 'live', '8만+', '이쿠노구 백년의 뿌리, 새 이야기', 'Century of roots in Ikuno, new story.', 'Un siglo de raíces en Ikuno.', NULL, '[]'::jsonb, 34.6937, 135.5023, 69),
  ('seoul', '서울', 'Seoul', 'Korea', '한국', '한국', '#DC2626', '🏯', '🇰🇷', 'live', '750만+', '돌아온 당신을 위한 서울 가이드', 'Seoul guide for returning diaspora.', 'Guía de Seúl para la diáspora.', NULL, '[]'::jsonb, 37.5665, 126.9780, 70),
  ('busan', '부산', 'Busan', 'Korea', '한국', '한국', '#0EA5E9', '🌊', '🇰🇷', 'live', '100만+', '바다와 함께 시작하는 새 일상', 'New life by the sea in Busan.', 'Nueva vida junto al mar en Busan.', NULL, '[]'::jsonb, 35.1796, 129.0756, 71),
  ('ansan', '안산', 'Ansan', 'Korea', '한국', '한국', '#8B5CF6', '🌏', '🇰🇷', 'live', '10만+', '80개 국적의 다문화 수도', 'Multicultural capital, 80 nationalities.', 'Capital multicultural, 80 nacionalidades.', NULL, '[]'::jsonb, 37.3219, 126.8309, 72),
  ('incheon', '인천', 'Incheon', 'Korea', '한국', '한국', '#0EA5E9', '✈️', '🇰🇷', 'live', '10만+', '한국의 첫 관문, 인천국제공항', 'Korea''s gateway — Incheon Airport.', 'La puerta de entrada a Corea.', NULL, '[]'::jsonb, 37.4563, 126.7052, 73),
  ('jeju', '제주', 'Jeju', 'Korea', '한국', '한국', '#10B981', '🌿', '🇰🇷', 'live', '2.5만+', '바람과 돌의 섬, 새로운 시작', 'Island of wind and stone.', 'Isla de viento y piedra.', NULL, '[]'::jsonb, 33.4996, 126.5312, 74),
  ('daegu', '대구', 'Daegu', 'Korea', '한국', '한국', '#F59E0B', '🍎', '🇰🇷', 'live', '4만+', '패션의 도시, 뜨거운 한국의 심장', 'Korea''s fashion city, warm heart.', 'La ciudad de la moda de Corea.', NULL, '[]'::jsonb, 35.8714, 128.6014, 75),
  ('gwangju', '광주', 'Gwangju', 'Korea', '한국', '한국', '#EC4899', '🎨', '🇰🇷', 'live', '3만+', '예향의 도시, 아시아 문화의 중심', 'City of art, heart of Asia.', 'Ciudad del arte, corazón de Asia.', NULL, '[]'::jsonb, 35.1595, 126.8526, 76),
  ('daejeon', '대전', 'Daejeon', 'Korea', '한국', '한국', '#3B82F6', '🔬', '🇰🇷', 'live', '2만+', '과학의 도시, 한국의 실리콘밸리', 'Science City, Korea''s Silicon Valley.', 'La ciudad de la ciencia de Corea.', NULL, '[]'::jsonb, 36.3504, 127.3845, 77),
  ('changwon', '창원', 'Changwon', 'Korea', '한국', '한국', '#F472B6', '🌸', '🇰🇷', 'live', '9만+', '진해 벚꽃과 방산의 도시, 경남의 심장', 'Cherry blossoms and industry in South Gyeongnam.', 'Flores de cerezo e industria en Gyeongnam del Sur.', NULL, '[]'::jsonb, 35.2280, 128.6811, 78),
  ('cheonan', '천안·아산', 'Cheonan', 'Korea', '한국', '한국', '#78716C', '🏛️', '🇰🇷', 'live', '8만+', '독립의 성지, 충남의 첫 관문', 'Land of independence, gateway to Chungnam.', 'Tierra de independencia, puerta de Chungnam.', NULL, '[]'::jsonb, 36.8151, 127.1139, 79),
  ('bundang', '분당·수지', 'Bundang', 'Korea', '한국', '한국', '#7C3AED', '🏡', '🇰🇷', 'live', '5만+', '귀환 동포의 새 보금자리, 분당·수지', 'New home for returning diaspora — Bundang & Suji.', 'Nuevo hogar para la diáspora coreana.', NULL, '[]'::jsonb, 37.3595, 127.1052, 80)
ON CONFLICT (slug) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,   name_en = EXCLUDED.name_en,
  state   = EXCLUDED.state,     country = EXCLUDED.country,
  region  = EXCLUDED.region,    color   = EXCLUDED.color,
  emoji   = EXCLUDED.emoji,     flag    = EXCLUDED.flag,
  status  = EXCLUDED.status,    population = EXCLUDED.population,
  tagline_ko = EXCLUDED.tagline_ko, tagline_en = EXCLUDED.tagline_en,
  tagline_es = EXCLUDED.tagline_es, hero_video = EXCLUDED.hero_video,
  hero_videos = EXCLUDED.hero_videos,
  lat = EXCLUDED.lat, lng = EXCLUDED.lng, sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ── 확인 ────────────────────────────────────────────────────
-- SELECT count(*) FROM guide_cities;                  -- 80 이어야 함
-- SELECT region, count(*) FROM guide_cities GROUP BY region ORDER BY 2 DESC;
