-- Audit trail for the admin email composer. Each row records ONE send action
-- (which may fan out to many recipients via Resend). Attachment bytes are
-- passed through to Resend inline and not persisted — the manifest captures
-- filename/size/mime for the audit view.

create table if not exists public.admin_emails (
  id uuid primary key default gen_random_uuid(),
  sent_by uuid not null references public.profiles(id) on delete restrict,
  subject text not null,
  body text not null,
  target_type text not null check (
    target_type in ('person', 'all_students', 'all_coaches', 'class', 'custom')
  ),
  target_spec jsonb not null default '{}'::jsonb,
  recipient_count integer not null,
  force_send boolean not null default false,
  attachment_manifest jsonb not null default '[]'::jsonb,
  reply_to text,
  created_at timestamptz not null default now()
);

create index if not exists admin_emails_created_at_idx on public.admin_emails(created_at desc);
create index if not exists admin_emails_sent_by_idx on public.admin_emails(sent_by);

alter table public.admin_emails enable row level security;

drop policy if exists admin_emails_admin_all on public.admin_emails;
create policy admin_emails_admin_all on public.admin_emails
for all
using (public.is_admin())
with check (public.is_admin());
