-- 018_trust_chain.sql
-- 신뢰의 사슬 — 사람 · 추천 · 연결
--
-- 정본: docs/TRUST_CHAIN.md (2026-09-24 폴 김 목사 정립)
--   출발지에서 도착지로 가는 사람을, 검증된 사람의 소개를 거쳐 환대자에게 잇는다.
--   신원은 서로에게가 아니라 헤브론에게 밝힌다.
--
-- ⚠️ 이 세 표에는 사람의 이름·연락처와 「누가 누구를 아는가」가 들어간다.
--    community_items 처럼 anon 키로 읽히면 그날로 끝이다.
--    그래서 정책을 하나도 만들지 않는다 — RLS 를 켜고 비워 두면 아무도 못 읽는다.
--    서버 함수(service_role 키)만 통과한다. 이것이 의도다.
--
-- 적용: Supabase → SQL Editor → 전체 붙여넣고 실행
-- 되돌리기: 맨 아래 주석 참고

-- ════════════════════════════════════════════════════════════
--  1. 사람
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.hg_person (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 부를 이름. 도착자는 실명이 아니어도 된다.
  -- 신분증·체류 신분·국적·종교·나이는 묻지 않는다 (TRUST_CHAIN.md)
  name        text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 80),

  -- 하나만 받는다. 카카오톡 ID · 전화 · 이메일 중
  contact     text NOT NULL CHECK (length(btrim(contact)) BETWEEN 3 AND 200),

  city        text CHECK (city IS NULL OR city ~ '^[a-z0-9-]{2,30}$'),

  role        text NOT NULL DEFAULT 'arrive'
              CHECK (role IN ('arrive', 'host', 'both')),

  status      text NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'checking', 'ready', 'paused', 'closed')),

  -- 어느 문으로 들어왔나. hebron = 추천자가 없어 우리가 직접 만난 사람
  entered_by  text NOT NULL DEFAULT 'arrive'
              CHECK (entered_by IN ('arrive', 'open', 'vouch', 'hebron')),

  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hg_person_city_idx   ON public.hg_person (city);
CREATE INDEX IF NOT EXISTS hg_person_status_idx ON public.hg_person (status);
CREATE INDEX IF NOT EXISTS hg_person_role_idx   ON public.hg_person (role);


-- ════════════════════════════════════════════════════════════
--  2. 추천 — 누가 누구를
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.hg_vouch (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 추천한 사람. 추천자가 없어 헤브론이 직접 서명하면 NULL + by_hebron = true
  -- (마태복음 18:12-14 — 아흔아홉을 두고 하나를 찾아간다)
  from_id     uuid REFERENCES public.hg_person(id) ON DELETE CASCADE,
  by_hebron   boolean NOT NULL DEFAULT false,

  to_id       uuid NOT NULL REFERENCES public.hg_person(id) ON DELETE CASCADE,

  relation    text CHECK (relation IS NULL OR length(relation) <= 120),  -- 어떤 사이인가
  note        text CHECK (note IS NULL OR length(note) <= 400),          -- 하고 싶은 말 한 줄

  created_at  timestamptz NOT NULL DEFAULT now(),

  -- 사람이 추천했거나 헤브론이 서명했거나, 둘 중 하나여야 한다
  CONSTRAINT hg_vouch_source CHECK (
    (from_id IS NOT NULL AND by_hebron = false) OR
    (from_id IS NULL     AND by_hebron = true)
  ),
  CONSTRAINT hg_vouch_not_self CHECK (from_id IS NULL OR from_id <> to_id),
  CONSTRAINT hg_vouch_once UNIQUE (from_id, to_id)
);

CREATE INDEX IF NOT EXISTS hg_vouch_to_idx   ON public.hg_vouch (to_id);
CREATE INDEX IF NOT EXISTS hg_vouch_from_idx ON public.hg_vouch (from_id);

-- 한 사람에게 추천자는 최대 둘. 한 명이 떠나도 사슬이 끊기지 않게. (TRUST_CHAIN.md)
CREATE OR REPLACE FUNCTION public.hg_vouch_limit() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT count(*) FROM public.hg_vouch WHERE to_id = NEW.to_id) >= 2 THEN
    RAISE EXCEPTION '추천자는 한 사람에게 최대 둘입니다';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS hg_vouch_limit_trg ON public.hg_vouch;
CREATE TRIGGER hg_vouch_limit_trg
  BEFORE INSERT ON public.hg_vouch
  FOR EACH ROW EXECUTE FUNCTION public.hg_vouch_limit();


-- ════════════════════════════════════════════════════════════
--  3. 연결 — 누구와 누구를, 누가 소개해서
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.hg_connection (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  guest_id       uuid NOT NULL REFERENCES public.hg_person(id) ON DELETE CASCADE,
  host_id        uuid NOT NULL REFERENCES public.hg_person(id) ON DELETE CASCADE,

  -- 이 칸이 이 시스템의 심장이다. NULL 이면 헤브론이 직접 소개한 것.
  introduced_by  uuid REFERENCES public.hg_person(id) ON DELETE SET NULL,

  -- 무게 0~3. TRUST_CHAIN.md 의 검증 단계와 짝이다.
  kind           text NOT NULL
                 CHECK (kind IN ('ask', 'shop', 'meet', 'gather', 'work',
                                 'ride', 'meal', 'pet', 'stay', 'other')),

  -- offered 권함 · agreed 둘 다 좋다 함 · met 만남 · done 끝 · stopped 멈춤
  state          text NOT NULL DEFAULT 'offered'
                 CHECK (state IN ('offered', 'agreed', 'met', 'done', 'stopped')),

  note           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  met_at         timestamptz,

  CONSTRAINT hg_conn_not_self CHECK (guest_id <> host_id)
);

CREATE INDEX IF NOT EXISTS hg_conn_guest_idx ON public.hg_connection (guest_id);
CREATE INDEX IF NOT EXISTS hg_conn_host_idx  ON public.hg_connection (host_id);
CREATE INDEX IF NOT EXISTS hg_conn_state_idx ON public.hg_connection (state);


-- ════════════════════════════════════════════════════════════
--  4. 잠금 — 정책을 하나도 만들지 않는다
-- ════════════════════════════════════════════════════════════
-- RLS 를 켜고 정책을 비워 두면 anon 도 authenticated 도 한 줄도 못 읽는다.
-- service_role(서버 함수)만 RLS 를 지나간다. 그것이 우리가 원하는 전부다.
--
-- ⚠️ 나중에 누가 "대시보드에서 바로 읽게" 정책 하나를 더하고 싶어지면 —
--    정책은 OR 로 합쳐진다. 하나만 느슨해도 전부 열린다 (2026-08 사고).
--    읽기는 반드시 서버 함수(admin-action)를 거치게 한다.

ALTER TABLE public.hg_person     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hg_vouch      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hg_connection ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.hg_person     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hg_vouch      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hg_connection FORCE ROW LEVEL SECURITY;

-- 혹시 예전에 만들어 둔 것이 있으면 지운다
DROP POLICY IF EXISTS "anon_select" ON public.hg_person;
DROP POLICY IF EXISTS "anon_insert" ON public.hg_person;
DROP POLICY IF EXISTS "anon_update" ON public.hg_person;
DROP POLICY IF EXISTS "anon_select" ON public.hg_vouch;
DROP POLICY IF EXISTS "anon_select" ON public.hg_connection;

-- 표 권한 자체도 거둔다 (RLS 앞에서 한 겹 더)
REVOKE ALL ON public.hg_person     FROM anon, authenticated;
REVOKE ALL ON public.hg_vouch      FROM anon, authenticated;
REVOKE ALL ON public.hg_connection FROM anon, authenticated;


-- ════════════════════════════════════════════════════════════
--  5. updated_at 자동 갱신
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.hg_touch() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS hg_person_touch ON public.hg_person;
CREATE TRIGGER hg_person_touch
  BEFORE UPDATE ON public.hg_person
  FOR EACH ROW EXECUTE FUNCTION public.hg_touch();


-- ════════════════════════════════════════════════════════════
--  확인 — 실행한 뒤 이 세 줄을 눈으로 본다
-- ════════════════════════════════════════════════════════════
-- ① 표 셋이 생겼고 RLS 가 켜져 있는가
--    SELECT relname, relrowsecurity, relforcerowsecurity
--      FROM pg_class WHERE relname LIKE 'hg\_%' ORDER BY relname;
--    → hg_connection · hg_person · hg_vouch 가 모두 true, true
--
-- ② 정책이 하나도 없는가 (0행이 나와야 한다)
--    SELECT tablename, policyname FROM pg_policies
--     WHERE tablename LIKE 'hg\_%';
--
-- ③ 밖에서 진짜 안 읽히는가 — 브라우저에서 publishable 키로
--    fetch('https://<프로젝트>.supabase.co/rest/v1/hg_person?select=*',
--          {headers:{apikey:'<publishable>', Authorization:'Bearer <publishable>'}})
--      .then(r=>r.text()).then(console.log)
--    → 빈 배열이 아니라 권한 오류가 나야 맞다


-- ════════════════════════════════════════════════════════════
--  되돌리기 (필요할 때만)
-- ════════════════════════════════════════════════════════════
-- DROP TABLE IF EXISTS public.hg_connection;
-- DROP TABLE IF EXISTS public.hg_vouch;
-- DROP TABLE IF EXISTS public.hg_person;
-- DROP FUNCTION IF EXISTS public.hg_vouch_limit();
-- DROP FUNCTION IF EXISTS public.hg_touch();
