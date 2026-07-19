-- Soft-delete for coach_profiles. Setting archived_at removes the coach
-- from assignment dropdowns and the default admin coaches list without
-- touching their profile, tier assignments, or class history — clear
-- archived_at to restore.

alter table public.coach_profiles
  add column if not exists archived_at timestamptz;

create index if not exists coach_profiles_active_idx
  on public.coach_profiles(coach_id)
  where archived_at is null;
