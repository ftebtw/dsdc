create table if not exists public.portal_login_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  role text not null,
  display_name text,
  ip_address text,
  user_agent text,
  logged_in_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_login_log_user on public.portal_login_log(user_id);
create index if not exists idx_login_log_time on public.portal_login_log(logged_in_at desc);

alter table public.portal_login_log enable row level security;

drop policy if exists login_log_admin_all on public.portal_login_log;
create policy login_log_admin_all on public.portal_login_log
  for all using (public.is_admin()) with check (public.is_admin());
