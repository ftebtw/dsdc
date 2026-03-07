-- Allow coaches/TAs to resolve staff names in sub/TA request UIs.
-- Without this, profile lookups fall back to UUIDs for "Requesting coach" and "TA" labels.
drop policy if exists profiles_coach_ta_select_staff on public.profiles;

create policy profiles_coach_ta_select_staff on public.profiles
for select
using (
  public.is_coach_or_ta()
  and role in ('coach', 'ta')
);
