create table if not exists public.coach_tier_assignments (
  coach_id uuid not null references public.profiles(id) on delete cascade,
  tier public.coach_tier not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (coach_id, tier)
);

insert into public.coach_tier_assignments (coach_id, tier)
select coach_id, tier
from public.coach_profiles
where tier is not null and is_ta = false
on conflict do nothing;

alter table public.coach_profiles
  alter column tier drop not null;

alter table public.coach_tier_assignments enable row level security;

drop policy if exists coach_tier_assignments_admin_all on public.coach_tier_assignments;
create policy coach_tier_assignments_admin_all on public.coach_tier_assignments
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists coach_tier_assignments_coach_select_own on public.coach_tier_assignments;
create policy coach_tier_assignments_coach_select_own on public.coach_tier_assignments
  for select using (coach_id = auth.uid());

create index if not exists idx_coach_tier_assignments_tier
  on public.coach_tier_assignments(tier);
