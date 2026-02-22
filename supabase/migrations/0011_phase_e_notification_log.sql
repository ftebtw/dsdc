create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  reference_id text not null,
  sent_at timestamptz not null default timezone('utc', now())
);

create unique index notification_log_dedup_idx
  on public.notification_log(recipient_id, notification_type, reference_id);

create index notification_log_sent_at_idx on public.notification_log(sent_at desc);

alter table public.notification_log enable row level security;

create policy notification_log_admin_all on public.notification_log
for all using (public.is_admin()) with check (public.is_admin());
