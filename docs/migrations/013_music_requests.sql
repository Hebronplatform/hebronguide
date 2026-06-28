-- migration 013: music_requests 테이블
-- Supabase SQL Editor에서 실행

create table if not exists music_requests (
  id             uuid default gen_random_uuid() primary key,
  youtube_url    text not null,
  video_id       text,
  requester_name text default '익명',
  time_pref      text default '언제나',
  genre          text,
  message        text,
  status         text default 'pending'
    check (status in ('pending','approved','played','rejected')),
  created_at     timestamptz default now()
);

-- 공개 읽기: 승인된 곡만 (앱 플레이어에서 fetch)
create policy "approved music public read"
  on music_requests for select
  using (status = 'approved');

-- 공개 쓰기: 신청 제출 (insert only, pending만)
create policy "music request insert"
  on music_requests for insert
  with check (status = 'pending');

alter table music_requests enable row level security;
