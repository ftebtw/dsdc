-- Private Session Groups: reuse the `classes` table as a long-lived
-- "classroom" for a recurring private session group. The flag
-- is_private_session_group distinguishes these from regular group classes.
--
-- Regular classes still require term_id + schedule_* + type + eligible_sub_tier.
-- Private session group classrooms are not on a fixed weekly schedule and
-- are not tied to a term, so those columns are nullable for them.

-- 1) Add the flag.
alter table public.classes
  add column if not exists is_private_session_group boolean not null default false;

-- 2) Relax NOT NULL on columns that don't apply to private session groups.
alter table public.classes alter column term_id drop not null;
alter table public.classes alter column type drop not null;
alter table public.classes alter column schedule_day drop not null;
alter table public.classes alter column schedule_start_time drop not null;
alter table public.classes alter column schedule_end_time drop not null;
alter table public.classes alter column eligible_sub_tier drop not null;

-- 3) CHECK: regular classes must still have all the required fields set;
--    private session group classrooms may have them NULL.
alter table public.classes drop constraint if exists classes_required_fields_by_kind;
alter table public.classes
  add constraint classes_required_fields_by_kind check (
    is_private_session_group
    or (
      term_id is not null
      and type is not null
      and schedule_day is not null
      and schedule_start_time is not null
      and schedule_end_time is not null
      and eligible_sub_tier is not null
    )
  );

create index if not exists idx_classes_private_session_group
  on public.classes(is_private_session_group)
  where is_private_session_group = true;

-- 4) Link private_sessions to a classroom (NULL = standalone session).
alter table public.private_sessions
  add column if not exists class_id uuid references public.classes(id) on delete set null;

create index if not exists idx_private_sessions_class
  on public.private_sessions(class_id);

-- 5) Tighten RLS on classes so private session group classrooms are only
--    visible to: admin (via classes_admin_all), their coach, enrolled
--    students, and parents linked to those students.
--
--    Regular (non-private) classes remain visible to all authenticated
--    users (existing behaviour).
drop policy if exists classes_select_authenticated on public.classes;
create policy classes_select_authenticated on public.classes
for select
using (
  auth.uid() is not null
  and (
    is_private_session_group = false
    or coach_id = auth.uid()
    or exists (
      select 1
      from public.enrollments e
      where e.class_id = classes.id
        and e.student_id = auth.uid()
    )
    or exists (
      select 1
      from public.parent_student_links psl
      join public.enrollments e on e.student_id = psl.student_id
      where psl.parent_id = auth.uid()
        and e.class_id = classes.id
    )
  )
);
