-- Admin-initiated report card submission requests. Admin marks a
-- (term, class) as "please submit report cards"; the coach sees a banner on
-- their report cards page and receives an email. This wraps the existing
-- coach -> submit -> admin -> approve flow (no other tables touched).

create table if not exists public.report_card_requests (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.terms(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  requested_at timestamptz not null default now(),
  message text,
  due_date date,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- One open request per (term, class). Resolved requests fall out of the
-- constraint so history can accumulate if admin re-requests later.
create unique index if not exists report_card_requests_one_open_per_class_term
  on public.report_card_requests(term_id, class_id)
  where resolved_at is null;

create index if not exists report_card_requests_class_idx on public.report_card_requests(class_id);
create index if not exists report_card_requests_term_idx on public.report_card_requests(term_id);
create index if not exists report_card_requests_open_idx
  on public.report_card_requests(resolved_at)
  where resolved_at is null;

alter table public.report_card_requests enable row level security;

-- Admin: full control.
drop policy if exists report_card_requests_admin_all on public.report_card_requests;
create policy report_card_requests_admin_all on public.report_card_requests
for all
using (public.is_admin())
with check (public.is_admin());

-- Coaches / TAs on the class team can read requests for their classes.
drop policy if exists report_card_requests_coach_select on public.report_card_requests;
create policy report_card_requests_coach_select on public.report_card_requests
for select
using (
  public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = report_card_requests.class_id
      and (
        c.coach_id = auth.uid()
        or exists (
          select 1 from public.class_coaches cc
          where cc.class_id = c.id and cc.coach_id = auth.uid()
        )
        or exists (
          select 1 from public.sub_requests sr
          where sr.class_id = c.id
            and sr.accepting_coach_id = auth.uid()
            and sr.status = 'accepted'
        )
        or exists (
          select 1 from public.ta_requests tr
          where tr.class_id = c.id
            and tr.accepting_ta_id = auth.uid()
            and tr.status = 'accepted'
        )
      )
  )
);
