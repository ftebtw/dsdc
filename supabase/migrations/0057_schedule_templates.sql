-- Saved templates for the admin Schedule Maker. Templates are shared
-- across the admin team: any admin can list, load, edit, or delete any
-- template. The data column stores the full form state (mode + entry
-- payload, including instructor photo data URLs) as JSONB so we can
-- evolve the shape without further migrations.

create table if not exists public.schedule_templates (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  mode text not null check (mode in ('single', 'term')),
  data jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists schedule_templates_updated_idx
  on public.schedule_templates(updated_at desc);

create index if not exists schedule_templates_created_by_idx
  on public.schedule_templates(created_by);

alter table public.schedule_templates enable row level security;

-- Shared across admin team: any admin can read/write any template.
create policy schedule_templates_admin_all on public.schedule_templates
for all
using (public.is_admin())
with check (public.is_admin());

-- Auto-bump updated_at on UPDATE.
create or replace function public.touch_schedule_templates_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists schedule_templates_set_updated_at on public.schedule_templates;
create trigger schedule_templates_set_updated_at
  before update on public.schedule_templates
  for each row execute function public.touch_schedule_templates_updated_at();
