-- Per-session free-text notes coaches can leave alongside the attendance
-- roster (e.g. "try out student: Jamie" or "guest speaker visited"). One
-- row per (class, session_date); RLS mirrors attendance_records so anyone
-- on the class team can read/write.

create table if not exists public.class_session_notes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  notes text not null,
  marked_by uuid not null references public.profiles(id) on delete restrict,
  marked_at timestamptz not null default now(),
  unique (class_id, session_date)
);

create index if not exists class_session_notes_class_date_idx
  on public.class_session_notes(class_id, session_date);

alter table public.class_session_notes enable row level security;

-- Admin: full control.
drop policy if exists class_session_notes_admin_all on public.class_session_notes;
create policy class_session_notes_admin_all on public.class_session_notes
for all
using (public.is_admin())
with check (public.is_admin());

-- Coach / TA on the class team: can read + upsert notes for their class.
drop policy if exists class_session_notes_coach_select on public.class_session_notes;
create policy class_session_notes_coach_select on public.class_session_notes
for select
using (
  public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = class_session_notes.class_id
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

drop policy if exists class_session_notes_coach_upsert on public.class_session_notes;
create policy class_session_notes_coach_upsert on public.class_session_notes
for insert
with check (
  marked_by = auth.uid()
  and public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = class_session_notes.class_id
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

drop policy if exists class_session_notes_coach_update on public.class_session_notes;
create policy class_session_notes_coach_update on public.class_session_notes
for update
using (
  public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = class_session_notes.class_id
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
)
with check (
  marked_by = auth.uid()
);
