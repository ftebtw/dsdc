alter type public.enrollment_status add value if not exists 'pending_etransfer';
alter type public.enrollment_status add value if not exists 'etransfer_sent';
alter type public.enrollment_status add value if not exists 'etransfer_lapsed';

alter table public.enrollments
  add column if not exists etransfer_expires_at timestamptz,
  add column if not exists etransfer_sent_at timestamptz,
  add column if not exists etransfer_token text,
  add column if not exists payment_method text default 'stripe';

create index if not exists enrollments_etransfer_expires_idx
  on public.enrollments(etransfer_expires_at);

create index if not exists enrollments_etransfer_token_idx
  on public.enrollments(etransfer_token)
  where etransfer_token is not null;
