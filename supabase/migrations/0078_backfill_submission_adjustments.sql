-- Backfill coach-submitted adjustments into the admin payroll ledger.
--
-- 8bcc68d made the coach submission endpoint push adjustments into
-- payroll_adjustments on submit, so they show up in the Payroll table.
-- Submissions that were already 'submitted' before that commit never got
-- their rows pushed into the ledger — hence totals like Ethan's showing
-- the computed hours only, not the adjusted hours he claimed.
--
-- This migration backfills every submitted-but-missing adjustment. It is
-- idempotent via the NOT EXISTS check: re-running does nothing because
-- the second attempt matches the ledger rows the first inserted.

insert into public.payroll_adjustments (coach_id, adjustment_date, hours_delta, note, created_by)
select
  ps.coach_id,
  ps.period_end,
  psa.hours_delta,
  '[Coach submission ' || left(psa.submission_id::text, 8) || '] ' || psa.reason as note,
  ps.coach_id
from public.payroll_submission_adjustments psa
join public.payroll_submissions ps on ps.id = psa.submission_id
where ps.status = 'submitted'
  and not exists (
    select 1
    from public.payroll_adjustments pa
    where pa.coach_id = ps.coach_id
      and pa.hours_delta = psa.hours_delta
      and pa.note = '[Coach submission ' || left(psa.submission_id::text, 8) || '] ' || psa.reason
  );
