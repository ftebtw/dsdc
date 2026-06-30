-- Allow coaches/TAs to read student profiles in any class they are on the
-- team for — primary coach, co-coach (class_coaches), accepted sub
-- (sub_requests), or accepted TA (ta_requests). The previous policy only
-- matched classes.coach_id, so co-coaches (e.g. on private session groups
-- where the primary coach is someone else) saw student names render as
-- raw UUIDs on report cards, homework, and other pages that resolve names
-- through profile lookups.

drop policy if exists profiles_coach_select_students on public.profiles;

create policy profiles_coach_select_students on public.profiles
for select
using (
  public.is_coach_or_ta()
  and exists (
    select 1
    from public.enrollments e
    join public.classes c on c.id = e.class_id
    where e.student_id = profiles.id
      and (
        c.coach_id = auth.uid()
        or exists (
          select 1
          from public.class_coaches cc
          where cc.class_id = c.id
            and cc.coach_id = auth.uid()
        )
        or exists (
          select 1
          from public.sub_requests sr
          where sr.class_id = c.id
            and sr.accepting_coach_id = auth.uid()
            and sr.status = 'accepted'
        )
        or exists (
          select 1
          from public.ta_requests tr
          where tr.class_id = c.id
            and tr.accepting_ta_id = auth.uid()
            and tr.status = 'accepted'
        )
      )
  )
);
