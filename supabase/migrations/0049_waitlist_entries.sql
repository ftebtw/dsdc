create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'declined', 'removed')),
  parent_name text not null,
  parent_email text,
  parent_phone text,
  students jsonb not null default '[]'::jsonb,
  has_debate_experience boolean not null default false,
  debate_experience_details text,
  timezone text,
  location text,
  preferred_days_times text,
  notes text
);

create index waitlist_entries_status_idx on public.waitlist_entries(status);
create index waitlist_entries_timezone_idx on public.waitlist_entries(timezone);
create index waitlist_entries_created_at_idx on public.waitlist_entries(created_at desc);
create index waitlist_entries_parent_name_idx on public.waitlist_entries(parent_name);

drop trigger if exists waitlist_entries_set_updated_at on public.waitlist_entries;

create trigger waitlist_entries_set_updated_at
before update on public.waitlist_entries
for each row execute function public.set_updated_at();

alter table public.waitlist_entries enable row level security;

create policy waitlist_entries_admin_select on public.waitlist_entries
for select
using (public.is_admin());

create policy waitlist_entries_admin_insert on public.waitlist_entries
for insert
with check (public.is_admin() and created_by = auth.uid());

create policy waitlist_entries_admin_update on public.waitlist_entries
for update
using (public.is_admin())
with check (public.is_admin());

create policy waitlist_entries_admin_delete on public.waitlist_entries
for delete
using (public.is_admin());
