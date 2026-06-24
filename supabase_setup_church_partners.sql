-- church_partners 테이블 생성
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.church_partners (
  id           uuid primary key default gen_random_uuid(),
  church_name  text not null,
  pastor_name  text not null,
  email        text,
  phone        text,
  kakao_id     text,
  city         text,
  status       text default 'invited' check (status in ('invited','pending','active','inactive')),
  notes        text,
  last_contact timestamptz,
  created_at   timestamptz default now()
);

-- RLS (Row Level Security) — Service Role Key만 접근 허용
alter table public.church_partners enable row level security;

-- 서비스 롤 전체 권한 (API에서 SUPABASE_SERVICE_ROLE_KEY 사용)
create policy "service_role_all" on public.church_partners
  for all
  using (true)
  with check (true);
