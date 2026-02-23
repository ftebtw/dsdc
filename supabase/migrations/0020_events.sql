create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  event_type text not null default 'tournament',
  is_visible boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint events_event_type_check check (
    event_type in ('tournament', 'workshop', 'social', 'deadline', 'other')
  )
);

create index if not exists idx_events_date on public.events(event_date);

alter table public.events enable row level security;

drop policy if exists events_read on public.events;
create policy events_read on public.events
  for select using (auth.uid() is not null and is_visible = true);

drop policy if exists events_admin_all on public.events;
create policy events_admin_all on public.events
  for all using (public.is_admin()) with check (public.is_admin());
