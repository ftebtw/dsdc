-- Let students edit their own homework submissions after posting, as long as
-- the submission has not been graded yet. Once a coach grades it, the row
-- locks (graded_at is set) and the student can no longer change it — this
-- preserves grade integrity.

create policy homework_submissions_student_update on public.homework_submissions
for update
using (
  student_id = auth.uid()
  and graded_at is null
)
with check (
  student_id = auth.uid()
);
