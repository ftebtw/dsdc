-- Fix recursive profiles policies introduced in 0028 by using
-- security-definer role helper functions instead of querying profiles
-- inside profiles RLS expressions.

create or replace function public.is_student()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  );
$$;

create or replace function public.is_parent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'parent'
  );
$$;

drop policy if exists profiles_student_select_coaches on public.profiles;
drop policy if exists profiles_parent_select_coaches on public.profiles;

create policy profiles_student_select_coaches on public.profiles
for select
using (
  public.is_student()
  and exists (
    select 1
    from public.coach_profiles cp
    where cp.coach_id = profiles.id
  )
);

create policy profiles_parent_select_coaches on public.profiles
for select
using (
  public.is_parent()
  and exists (
    select 1
    from public.coach_profiles cp
    where cp.coach_id = profiles.id
  )
);
