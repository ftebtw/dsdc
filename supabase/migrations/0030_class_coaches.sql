-- Junction table for multiple coaches per class.
-- classes.coach_id remains as the "primary" coach for backward compatibility.
-- Additional coaches are stored here.
create table if not exists public.class_coaches (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (class_id, coach_id)
);

alter table public.class_coaches enable row level security;

-- Admin full access
create policy class_coaches_admin_all on public.class_coaches
for all using (public.is_admin()) with check (public.is_admin());

-- Coaches can see their own assignments
create policy class_coaches_coach_select_own on public.class_coaches
for select using (coach_id = auth.uid());

-- Students can see coaches for their enrolled classes
create policy class_coaches_student_select on public.class_coaches
for select using (
  exists (
    select 1 from public.enrollments e
    where e.class_id = class_coaches.class_id
      and e.student_id = auth.uid()
      and e.status = 'active'
  )
);

-- Parents can see coaches for their linked students' classes
create policy class_coaches_parent_select on public.class_coaches
for select using (
  exists (
    select 1 from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.class_id = class_coaches.class_id
      and e.status = 'active'
      and psl.parent_id = auth.uid()
  )
);

-- Update teaches_class() to also check class_coaches table
create or replace function public.teaches_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = target_class_id
      and c.coach_id = auth.uid()
  )
  or exists (
    select 1
    from public.class_coaches cc
    where cc.class_id = target_class_id
      and cc.coach_id = auth.uid()
  );
$$;

-- ============================================================
-- Sub/TA access to attendance and resources
-- ============================================================

-- Helper: is the current user an accepted sub or TA for this class on this date?
create or replace function public.is_subbing_class(target_class_id uuid, target_date date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sub_requests sr
    where sr.class_id = target_class_id
      and sr.session_date = target_date
      and sr.accepting_coach_id = auth.uid()
      and sr.status = 'accepted'
  )
  or exists (
    select 1 from public.ta_requests tr
    where tr.class_id = target_class_id
      and tr.session_date = target_date
      and tr.accepting_ta_id = auth.uid()
      and tr.status = 'accepted'
  );
$$;

-- Helper: is the current user subbing for this class on ANY date?
create or replace function public.is_subbing_class_any(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sub_requests sr
    where sr.class_id = target_class_id
      and sr.accepting_coach_id = auth.uid()
      and sr.status = 'accepted'
  )
  or exists (
    select 1 from public.ta_requests tr
    where tr.class_id = target_class_id
      and tr.accepting_ta_id = auth.uid()
      and tr.status = 'accepted'
  );
$$;

-- Sub/TA can read and write attendance for their subbed session date
create policy attendance_sub_manage on public.attendance_records
for all
using (public.is_subbing_class(class_id, session_date))
with check (public.is_subbing_class(class_id, session_date));

-- Sub/TA can view resources for classes they're subbing
create policy resources_sub_select on public.resources
for select
using (class_id is not null and public.is_subbing_class_any(class_id));

-- Sub/TA can upload resources for classes they're subbing
create policy resources_sub_insert on public.resources
for insert
with check (
  posted_by = auth.uid()
  and class_id is not null
  and public.is_subbing_class_any(class_id)
);

-- Sub/TA can view enrollments for classes they're subbing (needed for attendance page)
create policy enrollments_sub_select on public.enrollments
for select
using (public.is_subbing_class_any(class_id));

-- Sub/TA can view student absences for classes they're subbing
create policy student_absences_sub_select on public.student_absences
for select
using (public.is_subbing_class_any(class_id));
