-- Coach-created homework assignments. Replaces using `resources.type = 'homework'`
-- to give homework first-class fields (multiple URLs, due date) and a clear
-- relationship with student submissions for the grading workflow.
--
-- The 'homework' value stays in the resource_type enum (Postgres makes it
-- painful to drop enum values), but the app stops offering it as an option
-- and existing 'homework' resources are migrated into this table and removed
-- from the resources table.

create table if not exists public.homework_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  posted_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  external_urls text[] not null default '{}'::text[],
  file_path text,
  file_name text,
  due_date date,
  publish_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists homework_assignments_class_idx
  on public.homework_assignments(class_id, publish_at desc);
create index if not exists homework_assignments_due_date_idx
  on public.homework_assignments(due_date);

drop trigger if exists homework_assignments_set_updated_at on public.homework_assignments;
create trigger homework_assignments_set_updated_at
before update on public.homework_assignments
for each row execute function public.set_updated_at();

-- Link submissions to the assignment they answer. Nullable so legacy
-- student-created submissions (with no parent assignment) still surface.
alter table public.homework_submissions
  add column if not exists assignment_id uuid references public.homework_assignments(id) on delete set null;

create index if not exists homework_submissions_assignment_idx
  on public.homework_submissions(assignment_id);

-- Backfill: convert existing resources.type='homework' into assignments and
-- remove them from the resources table so they don't double up in the UI.
insert into public.homework_assignments
  (id, class_id, posted_by, title, description, external_urls, file_path, file_name, publish_at, created_at)
select
  r.id,
  r.class_id,
  r.posted_by,
  r.title,
  r.description,
  case when r.url is not null and r.url <> '' then array[r.url]::text[] else '{}'::text[] end,
  r.file_path,
  null,
  coalesce(r.publish_at, r.created_at),
  r.created_at
from public.resources r
where r.type = 'homework'
  and r.class_id is not null
  and not exists (select 1 from public.homework_assignments a where a.id = r.id);

delete from public.resources
where type = 'homework'
  and exists (select 1 from public.homework_assignments a where a.id = resources.id);

alter table public.homework_assignments enable row level security;

-- Admins: full access.
create policy homework_assignments_admin_all on public.homework_assignments
for all
using (public.is_admin())
with check (public.is_admin());

-- Coaches/TAs who teach or are covering the class: full access.
create policy homework_assignments_coach_select on public.homework_assignments
for select
using (
  public.teaches_class(class_id)
  or public.is_subbing_class_any(class_id)
);

create policy homework_assignments_coach_insert on public.homework_assignments
for insert
with check (
  posted_by = auth.uid()
  and (
    public.teaches_class(class_id)
    or public.is_subbing_class_any(class_id)
  )
);

create policy homework_assignments_coach_update on public.homework_assignments
for update
using (
  public.teaches_class(class_id)
  or public.is_subbing_class_any(class_id)
)
with check (
  public.teaches_class(class_id)
  or public.is_subbing_class_any(class_id)
);

create policy homework_assignments_coach_delete on public.homework_assignments
for delete
using (
  public.teaches_class(class_id)
  or public.is_subbing_class_any(class_id)
);

-- Students: can see assignments for classes they are enrolled in, once published.
create policy homework_assignments_student_select on public.homework_assignments
for select
using (
  publish_at <= timezone('utc', now())
  and exists (
    select 1 from public.enrollments e
    where e.class_id = homework_assignments.class_id
      and e.student_id = auth.uid()
      and e.status in ('active', 'completed')
  )
);

-- Parents: can see assignments for their children's classes.
create policy homework_assignments_parent_select on public.homework_assignments
for select
using (
  publish_at <= timezone('utc', now())
  and exists (
    select 1 from public.enrollments e
    where e.class_id = homework_assignments.class_id
      and public.student_linked_to_parent(e.student_id)
      and e.status in ('active', 'completed')
  )
);

-- Prevent a single student from submitting twice for the same assignment.
-- Legacy submissions (assignment_id is null) are unaffected.
create unique index if not exists homework_submissions_assignment_student_uniq
  on public.homework_submissions(assignment_id, student_id)
  where assignment_id is not null;
