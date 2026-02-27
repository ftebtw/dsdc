-- Allow parents to see private future coach availability.
drop policy if exists coach_availability_parent_select_private_future on public.coach_availability;
create policy coach_availability_parent_select_private_future on public.coach_availability
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'parent'
  )
  and is_private = true
  and available_date >= timezone('utc', now())::date
);

-- Allow parents to insert private sessions for linked students.
drop policy if exists private_sessions_parent_insert_linked on public.private_sessions;
create policy private_sessions_parent_insert_linked on public.private_sessions
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'parent'
  )
  and public.student_linked_to_parent(student_id)
);

-- Allow parents to cancel linked student sessions in parent-allowed statuses.
drop policy if exists private_sessions_parent_cancel_linked on public.private_sessions;
create policy private_sessions_parent_cancel_linked on public.private_sessions
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'parent'
  )
  and public.student_linked_to_parent(student_id)
  and status::text in ('pending', 'rescheduled_by_coach', 'rescheduled_by_student', 'awaiting_payment')
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'parent'
  )
  and public.student_linked_to_parent(student_id)
  and status = 'cancelled'
);
