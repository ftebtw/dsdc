alter table public.enrollments
  add column if not exists approval_expires_at timestamptz;
