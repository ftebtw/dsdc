alter type public.private_session_status add value if not exists 'coach_accepted';
alter type public.private_session_status add value if not exists 'awaiting_payment';
alter type public.private_session_status add value if not exists 'rescheduled_by_coach';
alter type public.private_session_status add value if not exists 'rescheduled_by_student';

alter table public.private_sessions
  add column if not exists price_cad numeric(10,2),
  add column if not exists zoom_link text,
  add column if not exists payment_method text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists admin_approved_at timestamptz,
  add column if not exists admin_approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists completed_at timestamptz,
  add column if not exists proposed_date date,
  add column if not exists proposed_start_time time,
  add column if not exists proposed_end_time time,
  add column if not exists proposed_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_private_sessions_completed
  on public.private_sessions(coach_id, requested_date)
  where status = 'completed';

create index if not exists idx_private_sessions_awaiting_payment
  on public.private_sessions(status, requested_date);

drop policy if exists private_sessions_student_cancel_pending on public.private_sessions;
drop policy if exists private_sessions_student_cancel_expanded on public.private_sessions;

create policy private_sessions_student_cancel_expanded on public.private_sessions
for update
using (
  student_id = auth.uid()
  and status::text in ('pending', 'rescheduled_by_coach', 'rescheduled_by_student', 'awaiting_payment')
)
with check (
  student_id = auth.uid()
  and status = 'cancelled'
);
