-- Monthly coach payroll self-verification.
--
-- Each row is one (coach, calendar month) submission. The cron creates a
-- draft on day 1 of the next month with a snapshot of the coach's
-- auto-computed hours; the coach then approves as-is or attaches
-- adjustments and submits. Once submitted the row is final: any
-- corrections after that go through the existing admin-only
-- payroll_adjustments layer.
create table public.payroll_submissions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  year_month text not null,  -- 'YYYY-MM' — the month being verified
  period_start date not null,
  period_end date not null,
  computed_hours numeric(8,2) not null default 0,
  hourly_rate numeric(10,2),
  adjustment_hours_total numeric(8,2) not null default 0,
  final_hours numeric(8,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (coach_id, year_month)
);

create index payroll_submissions_status_coach_idx
  on public.payroll_submissions(status, coach_id);
create index payroll_submissions_year_month_idx
  on public.payroll_submissions(year_month desc);

-- Proposed adjustments attached to a submission. Distinct from the
-- admin-owned payroll_adjustments table: these are proposals the coach
-- attaches at submission time and only take effect through this flow.
create table public.payroll_submission_adjustments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.payroll_submissions(id) on delete cascade,
  hours_delta numeric(8,2) not null,
  reason text not null,
  adjustment_date date,
  created_at timestamptz not null default timezone('utc', now()),
  constraint payroll_submission_adjustments_hours_nonzero check (hours_delta <> 0),
  constraint payroll_submission_adjustments_reason_len check (char_length(reason) between 1 and 500)
);

create index payroll_submission_adjustments_submission_idx
  on public.payroll_submission_adjustments(submission_id);

alter table public.payroll_submissions enable row level security;
alter table public.payroll_submission_adjustments enable row level security;

-- Admin full control.
create policy payroll_submissions_admin_all
on public.payroll_submissions
for all
using (public.is_admin())
with check (public.is_admin());

create policy payroll_submission_adjustments_admin_all
on public.payroll_submission_adjustments
for all
using (public.is_admin())
with check (public.is_admin());

-- Coach reads their own submissions in any status (so the review page
-- can show past submitted months too).
create policy payroll_submissions_coach_select_own
on public.payroll_submissions
for select
using (coach_id = auth.uid());

-- Coach updates only their own DRAFT submissions (approve or submit).
-- Locked once status flips to 'submitted' — updates then require admin.
create policy payroll_submissions_coach_update_draft
on public.payroll_submissions
for update
using (coach_id = auth.uid() and status = 'draft')
with check (coach_id = auth.uid());

-- Coach reads adjustments attached to their own submissions.
create policy payroll_submission_adjustments_coach_select_own
on public.payroll_submission_adjustments
for select
using (
  exists (
    select 1
    from public.payroll_submissions ps
    where ps.id = payroll_submission_adjustments.submission_id
      and ps.coach_id = auth.uid()
  )
);

-- Coach inserts adjustments only into their own DRAFT submissions.
create policy payroll_submission_adjustments_coach_insert_draft
on public.payroll_submission_adjustments
for insert
with check (
  exists (
    select 1
    from public.payroll_submissions ps
    where ps.id = payroll_submission_adjustments.submission_id
      and ps.coach_id = auth.uid()
      and ps.status = 'draft'
  )
);

-- Coach deletes adjustments only from their own DRAFT submissions
-- (edit-by-remove-then-re-add is simpler than a proper update flow).
create policy payroll_submission_adjustments_coach_delete_draft
on public.payroll_submission_adjustments
for delete
using (
  exists (
    select 1
    from public.payroll_submissions ps
    where ps.id = payroll_submission_adjustments.submission_id
      and ps.coach_id = auth.uid()
      and ps.status = 'draft'
  )
);
