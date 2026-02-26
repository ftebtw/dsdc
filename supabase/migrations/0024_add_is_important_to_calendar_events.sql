alter table public.calendar_events
  add column if not exists is_important boolean not null default false;
