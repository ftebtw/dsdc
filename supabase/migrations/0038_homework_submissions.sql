-- Student homework submissions with coach grading + feedback.
create table if not exists public.homework_submissions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  file_path text,
  file_name text,
  external_url text,
  grade text,
  feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists homework_submissions_class_idx on public.homework_submissions(class_id);
create index if not exists homework_submissions_student_idx on public.homework_submissions(student_id);
create index if not exists homework_submissions_created_idx on public.homework_submissions(created_at desc);

alter table public.homework_submissions enable row level security;

-- Admin full access.
create policy homework_submissions_admin_all on public.homework_submissions
for all
using (public.is_admin())
with check (public.is_admin());

-- Students can submit and read their own homework.
create policy homework_submissions_student_insert on public.homework_submissions
for insert
with check (
  student_id = auth.uid()
  and exists (
    select 1
    from public.enrollments e
    where e.class_id = homework_submissions.class_id
      and e.student_id = auth.uid()
      and e.status in ('active', 'completed')
  )
);

create policy homework_submissions_student_select on public.homework_submissions
for select
using (student_id = auth.uid());

-- Parents can view linked student homework submissions.
create policy homework_submissions_parent_select on public.homework_submissions
for select
using (public.student_linked_to_parent(student_id));

-- Coaches/TAs can view + grade for classes they teach or cover.
create policy homework_submissions_coach_ta_select on public.homework_submissions
for select
using (
  public.teaches_class(class_id)
  or public.is_subbing_class_any(class_id)
);

create policy homework_submissions_coach_ta_update on public.homework_submissions
for update
using (
  public.teaches_class(class_id)
  or public.is_subbing_class_any(class_id)
)
with check (
  public.teaches_class(class_id)
  or public.is_subbing_class_any(class_id)
);
