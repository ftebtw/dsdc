-- Phase: support multiple students attending one private session.
-- The primary student remains private_sessions.student_id (handles payment,
-- portal display, and RLS). Up to 2 additional siblings/co-attendees may be
-- attached via this join table — admin-created sessions only for now.

create table if not exists public.private_session_attendees (
  session_id uuid not null references public.private_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (session_id, student_id)
);

create index if not exists idx_private_session_attendees_session
  on public.private_session_attendees(session_id);

create index if not exists idx_private_session_attendees_student
  on public.private_session_attendees(student_id);

alter table public.private_session_attendees enable row level security;

-- Admins: full access.
drop policy if exists private_session_attendees_admin_all on public.private_session_attendees;
create policy private_session_attendees_admin_all on public.private_session_attendees
for all
using (public.is_admin())
with check (public.is_admin());

-- Coaches can see attendees for sessions they coach.
drop policy if exists private_session_attendees_coach_select on public.private_session_attendees;
create policy private_session_attendees_coach_select on public.private_session_attendees
for select
using (
  exists (
    select 1
    from public.private_sessions ps
    where ps.id = private_session_attendees.session_id
      and ps.coach_id = auth.uid()
  )
);

-- A student can see their own attendance row.
drop policy if exists private_session_attendees_student_select on public.private_session_attendees;
create policy private_session_attendees_student_select on public.private_session_attendees
for select
using (student_id = auth.uid());

-- Parents linked to a student can see that student's attendance.
drop policy if exists private_session_attendees_parent_select on public.private_session_attendees;
create policy private_session_attendees_parent_select on public.private_session_attendees
for select
using (
  exists (
    select 1
    from public.parent_student_links psl
    where psl.student_id = private_session_attendees.student_id
      and psl.parent_id = auth.uid()
  )
);

-- Enforce: max 2 attendees per session, and the attendee may not be the
-- same person as private_sessions.student_id (the primary student).
create or replace function public.enforce_private_session_attendees_constraints()
returns trigger
language plpgsql
as $$
declare
  attendee_count int;
  primary_student uuid;
begin
  select student_id into primary_student
  from public.private_sessions
  where id = new.session_id;

  if primary_student is not null and primary_student = new.student_id then
    raise exception 'Attendee student cannot match the primary student of the session.';
  end if;

  select count(*) into attendee_count
  from public.private_session_attendees
  where session_id = new.session_id;

  if attendee_count >= 2 then
    raise exception 'A private session can have at most 2 additional attendees (3 students total).';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_private_session_attendees_constraints on public.private_session_attendees;
create trigger trg_private_session_attendees_constraints
before insert on public.private_session_attendees
for each row execute function public.enforce_private_session_attendees_constraints();
