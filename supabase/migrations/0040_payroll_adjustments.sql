-- Manual payroll hour adjustments (admin-only).
create table public.payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  adjustment_date date not null,
  hours_delta numeric(8,2) not null,
  note text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint payroll_adjustments_hours_nonzero check (hours_delta <> 0),
  constraint payroll_adjustments_note_len check (note is null or char_length(note) <= 500)
);

create index payroll_adjustments_coach_date_idx
  on public.payroll_adjustments(coach_id, adjustment_date);

alter table public.payroll_adjustments enable row level security;

-- Admin can fully manage payroll adjustments.
create policy payroll_adjustments_admin_all
on public.payroll_adjustments
for all
using (public.is_admin())
with check (public.is_admin());
