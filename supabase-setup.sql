-- 在 Supabase SQL Editor 里粘贴并运行一次即可
create table if not exists public.love_space_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 开启行级安全（只允许服务端 Service Role Key 读写，保证私密口令与照片安全）
alter table public.love_space_state enable row level security;
