-- Coach-submitted weekly class feedback.
--
-- One row per (class, session_date) covers both:
--   * a general block visible to every enrolled student and their parents, and
--   * a linked table of per-student feedback (class_feedback_individual)
--     where each row is only visible to that student and their linked parents.
--
-- Coaches can leave general OR individual empty; unfilled students simply have
-- no row in class_feedback_individual — they see nothing (matching "leave
-- empty if the student wasn't there").

create table public.class_feedback (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete restrict,
  session_date date not null,
  general_feedback text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (class_id, session_date)
);

create index class_feedback_class_date_idx
  on public.class_feedback(class_id, session_date desc);

create table public.class_feedback_individual (
  id uuid primary key default gen_random_uuid(),
  class_feedback_id uuid not null references public.class_feedback(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  feedback text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (class_feedback_id, student_id),
  constraint class_feedback_individual_feedback_len check (char_length(feedback) between 1 and 8000)
);

create index class_feedback_individual_student_idx
  on public.class_feedback_individual(student_id);
create index class_feedback_individual_parent_idx
  on public.class_feedback_individual(class_feedback_id);

alter table public.class_feedback enable row level security;
alter table public.class_feedback_individual enable row level security;

-- ==== class_feedback ====

create policy class_feedback_admin_all on public.class_feedback
for all using (public.is_admin()) with check (public.is_admin());

-- Coach on the class team can read + write. Reused class-team pattern:
-- primary coach, class_coaches, accepted sub_requests, accepted ta_requests.
create policy class_feedback_coach_all on public.class_feedback
for all
using (
  public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = class_feedback.class_id
      and (
        c.coach_id = auth.uid()
        or exists (
          select 1 from public.class_coaches cc
          where cc.class_id = c.id and cc.coach_id = auth.uid()
        )
        or exists (
          select 1 from public.sub_requests sr
          where sr.class_id = c.id and sr.accepting_coach_id = auth.uid() and sr.status = 'accepted'
        )
        or exists (
          select 1 from public.ta_requests tr
          where tr.class_id = c.id and tr.accepting_ta_id = auth.uid() and tr.status = 'accepted'
        )
      )
  )
)
with check (
  public.is_coach_or_ta()
  and exists (
    select 1 from public.classes c
    where c.id = class_feedback.class_id
      and (
        c.coach_id = auth.uid()
        or exists (
          select 1 from public.class_coaches cc
          where cc.class_id = c.id and cc.coach_id = auth.uid()
        )
        or exists (
          select 1 from public.sub_requests sr
          where sr.class_id = c.id and sr.accepting_coach_id = auth.uid() and sr.status = 'accepted'
        )
        or exists (
          select 1 from public.ta_requests tr
          where tr.class_id = c.id and tr.accepting_ta_id = auth.uid() and tr.status = 'accepted'
        )
      )
  )
);

-- Enrolled student can read the general block for their own class.
create policy class_feedback_student_select on public.class_feedback
for select
using (
  exists (
    select 1 from public.enrollments e
    where e.class_id = class_feedback.class_id
      and e.student_id = auth.uid()
      and e.status in ('active', 'completed')
  )
);

-- Parent linked to an enrolled student can read the general block.
create policy class_feedback_parent_select on public.class_feedback
for select
using (
  exists (
    select 1
    from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.class_id = class_feedback.class_id
      and e.status in ('active', 'completed')
      and psl.parent_id = auth.uid()
  )
);

-- ==== class_feedback_individual ====

create policy class_feedback_individual_admin_all on public.class_feedback_individual
for all using (public.is_admin()) with check (public.is_admin());

-- Coach on the class team can fully manage.
create policy class_feedback_individual_coach_all on public.class_feedback_individual
for all
using (
  public.is_coach_or_ta()
  and exists (
    select 1
    from public.class_feedback cf
    join public.classes c on c.id = cf.class_id
    where cf.id = class_feedback_individual.class_feedback_id
      and (
        c.coach_id = auth.uid()
        or exists (
          select 1 from public.class_coaches cc
          where cc.class_id = c.id and cc.coach_id = auth.uid()
        )
        or exists (
          select 1 from public.sub_requests sr
          where sr.class_id = c.id and sr.accepting_coach_id = auth.uid() and sr.status = 'accepted'
        )
        or exists (
          select 1 from public.ta_requests tr
          where tr.class_id = c.id and tr.accepting_ta_id = auth.uid() and tr.status = 'accepted'
        )
      )
  )
)
with check (
  public.is_coach_or_ta()
  and exists (
    select 1
    from public.class_feedback cf
    join public.classes c on c.id = cf.class_id
    where cf.id = class_feedback_individual.class_feedback_id
      and (
        c.coach_id = auth.uid()
        or exists (
          select 1 from public.class_coaches cc
          where cc.class_id = c.id and cc.coach_id = auth.uid()
        )
        or exists (
          select 1 from public.sub_requests sr
          where sr.class_id = c.id and sr.accepting_coach_id = auth.uid() and sr.status = 'accepted'
        )
        or exists (
          select 1 from public.ta_requests tr
          where tr.class_id = c.id and tr.accepting_ta_id = auth.uid() and tr.status = 'accepted'
        )
      )
  )
);

-- Student can read only their own individual row.
create policy class_feedback_individual_student_select on public.class_feedback_individual
for select
using (student_id = auth.uid());

-- Parent can read only rows for their linked students.
create policy class_feedback_individual_parent_select on public.class_feedback_individual
for select
using (
  exists (
    select 1 from public.parent_student_links psl
    where psl.parent_id = auth.uid()
      and psl.student_id = class_feedback_individual.student_id
  )
);
