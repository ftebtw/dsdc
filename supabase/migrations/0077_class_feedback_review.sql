-- Admin review workflow for weekly class feedback.
--
-- Coach submits → 'pending_admin'. Admin approves → 'approved' (visible to
-- students/parents). Admin rejects with notes → 'rejected' (coach can edit
-- and resubmit; nothing published). Existing rows from before this change
-- are treated as 'approved' so nothing disappears from families overnight.

alter table public.class_feedback
  add column if not exists status text
    not null
    default 'approved'
    check (status in ('pending_admin', 'approved', 'rejected'));

alter table public.class_feedback
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists admin_rejection_notes text;

-- Once the migration is applied, flip the default so future coach submits
-- land in the review queue.
alter table public.class_feedback
  alter column status set default 'pending_admin';

create index if not exists class_feedback_status_idx
  on public.class_feedback(status);

-- === RLS: gate student/parent visibility on 'approved' ===

drop policy if exists class_feedback_student_select on public.class_feedback;
create policy class_feedback_student_select on public.class_feedback
for select
using (
  status = 'approved'
  and exists (
    select 1 from public.enrollments e
    where e.class_id = class_feedback.class_id
      and e.student_id = auth.uid()
      and e.status in ('active', 'completed')
  )
);

drop policy if exists class_feedback_parent_select on public.class_feedback;
create policy class_feedback_parent_select on public.class_feedback
for select
using (
  status = 'approved'
  and exists (
    select 1
    from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.class_id = class_feedback.class_id
      and e.status in ('active', 'completed')
      and psl.parent_id = auth.uid()
  )
);

-- Individual rows: student/parent SELECT policies must also verify the
-- parent feedback row is approved (RLS on a child table doesn't chain to
-- the parent automatically).

drop policy if exists class_feedback_individual_student_select on public.class_feedback_individual;
create policy class_feedback_individual_student_select on public.class_feedback_individual
for select
using (
  student_id = auth.uid()
  and exists (
    select 1
    from public.class_feedback cf
    where cf.id = class_feedback_individual.class_feedback_id
      and cf.status = 'approved'
  )
);

drop policy if exists class_feedback_individual_parent_select on public.class_feedback_individual;
create policy class_feedback_individual_parent_select on public.class_feedback_individual
for select
using (
  exists (
    select 1 from public.parent_student_links psl
    where psl.parent_id = auth.uid()
      and psl.student_id = class_feedback_individual.student_id
  )
  and exists (
    select 1
    from public.class_feedback cf
    where cf.id = class_feedback_individual.class_feedback_id
      and cf.status = 'approved'
  )
);
