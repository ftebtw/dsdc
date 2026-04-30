-- Allow coaches to read their own manual payroll adjustments.
-- Without this, admin-entered hours on payroll_adjustments are
-- silently filtered out of the coach's /portal/coach/hours view
-- because the only existing policy gates access on is_admin().
create policy payroll_adjustments_coach_select
on public.payroll_adjustments
for select
using (coach_id = auth.uid());
