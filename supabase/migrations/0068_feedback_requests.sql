-- Parent/student-initiated feedback requests. Requester writes a message,
-- request routes to the class's primary coach, coach drafts a response,
-- admin reviews before it reaches the requester.
--
-- Rejection flow: admin rejection bounces the row back to pending_coach with
-- rejection notes so the coach can redraft — the requester never sees a
-- rejected message.

create table if not exists public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  request_message text not null,
  status text not null default 'pending_coach' check (
    status in ('pending_coach', 'pending_admin', 'approved', 'cancelled')
  ),
  coach_response text,
  coach_responded_at timestamptz,
  admin_reviewed_by uuid references public.profiles(id) on delete set null,
  admin_reviewed_at timestamptz,
  admin_rejection_notes text,
  rejection_count integer not null default 0,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One pending request per (class, student) at a time. Approved and cancelled
-- rows fall out of the constraint so history can accumulate.
create unique index if not exists feedback_requests_one_open_per_class_per_student
  on public.feedback_requests(class_id, student_id)
  where status in ('pending_coach', 'pending_admin');

create index if not exists feedback_requests_status_idx on public.feedback_requests(status);
create index if not exists feedback_requests_student_idx on public.feedback_requests(student_id);
create index if not exists feedback_requests_class_idx on public.feedback_requests(class_id);
create index if not exists feedback_requests_requested_by_idx on public.feedback_requests(requested_by);

alter table public.feedback_requests enable row level security;

-- Admin: full control.
drop policy if exists feedback_requests_admin_all on public.feedback_requests;
create policy feedback_requests_admin_all on public.feedback_requests
for all
using (public.is_admin())
with check (public.is_admin());

-- Requester (student themselves or the parent that filed it) can see the
-- request from creation onward, but only sees the coach_response once the
-- admin has approved it (enforced in the API surface, not RLS).
drop policy if exists feedback_requests_requester_select on public.feedback_requests;
create policy feedback_requests_requester_select on public.feedback_requests
for select
using (requested_by = auth.uid());

-- Parents can also see requests filed for a student they are linked to,
-- so both parents on a two-parent household see the loop even if only one
-- filed the request.
drop policy if exists feedback_requests_parent_linked_select on public.feedback_requests;
create policy feedback_requests_parent_linked_select on public.feedback_requests
for select
using (public.student_linked_to_parent(student_id));

-- Students see any request that is about them (even if a parent filed it).
drop policy if exists feedback_requests_student_select on public.feedback_requests;
create policy feedback_requests_student_select on public.feedback_requests
for select
using (student_id = auth.uid());

-- Requester can insert a request for themselves. Enrollment / class access
-- is enforced in the API to keep RLS simple.
drop policy if exists feedback_requests_requester_insert on public.feedback_requests;
create policy feedback_requests_requester_insert on public.feedback_requests
for insert
with check (requested_by = auth.uid());

-- Requester can cancel their own request while it's still pending_coach.
drop policy if exists feedback_requests_requester_update on public.feedback_requests;
create policy feedback_requests_requester_update on public.feedback_requests
for update
using (requested_by = auth.uid())
with check (requested_by = auth.uid());

-- Coach: sees requests for classes they teach (primary coach, class_coaches,
-- accepted sub/TA), and can update to draft coach_response.
drop policy if exists feedback_requests_coach_select on public.feedback_requests;
create policy feedback_requests_coach_select on public.feedback_requests
for select
using (
  public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = feedback_requests.class_id
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

drop policy if exists feedback_requests_coach_update on public.feedback_requests;
create policy feedback_requests_coach_update on public.feedback_requests
for update
using (
  public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = feedback_requests.class_id
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

-- Keep updated_at fresh so admin queues can sort by "most recently touched".
create or replace function public.touch_feedback_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists feedback_requests_set_updated_at on public.feedback_requests;
create trigger feedback_requests_set_updated_at
  before update on public.feedback_requests
  for each row execute function public.touch_feedback_requests_updated_at();
