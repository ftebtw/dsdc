create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  timezone text not null default 'America/Vancouver',
  color text not null default '#3b82f6',
  is_all_day boolean not null default false,
  visibility text not null default 'personal' check (visibility in ('personal', 'all_coaches', 'everyone')),
  created_at timestamptz not null default now()
);

create index if not exists calendar_events_created_by_idx on public.calendar_events(created_by);
create index if not exists calendar_events_date_idx on public.calendar_events(event_date);

alter table public.calendar_events enable row level security;

drop policy if exists calendar_events_select on public.calendar_events;
create policy calendar_events_select on public.calendar_events
for select using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
  or (
    created_by = auth.uid()
    or (
      visibility in ('all_coaches', 'everyone')
      and exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('coach', 'ta')
      )
    )
  )
);

drop policy if exists calendar_events_insert on public.calendar_events;
create policy calendar_events_insert on public.calendar_events
for insert with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'coach', 'ta')
  )
);

drop policy if exists calendar_events_update on public.calendar_events;
create policy calendar_events_update on public.calendar_events
for update using (
  created_by = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists calendar_events_delete on public.calendar_events;
create policy calendar_events_delete on public.calendar_events
for delete using (
  created_by = auth.uid()
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
