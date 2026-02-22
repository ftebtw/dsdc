-- Phase C: policy refinements for availability, sub/TA requests, and private sessions

create or replace function public.can_view_class_as_student_or_parent(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.class_id = target_class_id
      and e.status = 'active'
      and (
        e.student_id = auth.uid()
        or public.student_linked_to_parent(e.student_id)
      )
  );
$$;

create or replace function public.can_accept_sub_request(target_sub_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sub_requests sr
    join public.classes c on c.id = sr.class_id
    join public.coach_profiles cp on cp.coach_id = auth.uid()
    join public.profiles p on p.id = auth.uid()
    where sr.id = target_sub_request_id
      and sr.status = 'open'
      and sr.requesting_coach_id <> auth.uid()
      and p.role in ('coach', 'ta')
      and cp.tier = c.eligible_sub_tier
  );
$$;

create or replace function public.can_accept_ta_request(target_ta_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ta_requests tr
    join public.coach_profiles cp on cp.coach_id = auth.uid()
    join public.profiles p on p.id = auth.uid()
    where tr.id = target_ta_request_id
      and tr.status = 'open'
      and tr.requesting_coach_id <> auth.uid()
      and p.role in ('coach', 'ta')
      and cp.is_ta = true
  );
$$;

alter table public.private_sessions enable row level security;

-- Student booking visibility for private slots
create policy coach_availability_student_select_private_future on public.coach_availability
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
  and is_private = true
  and available_date >= timezone('utc', now())::date
);

-- Rebuild sub request policies for strict eligibility + student/parent accepted visibility

drop policy if exists sub_requests_admin_all on public.sub_requests;
drop policy if exists sub_requests_coach_select_related on public.sub_requests;
drop policy if exists sub_requests_coach_insert_self on public.sub_requests;
drop policy if exists sub_requests_coach_update_related on public.sub_requests;

create policy sub_requests_admin_all on public.sub_requests
for all
using (public.is_admin())
with check (public.is_admin());

create policy sub_requests_coach_insert_self on public.sub_requests
for insert
with check (
  requesting_coach_id = auth.uid()
  and public.is_coach_or_ta()
);

create policy sub_requests_select_related on public.sub_requests
for select
using (
  requesting_coach_id = auth.uid()
  or accepting_coach_id = auth.uid()
  or public.can_accept_sub_request(id)
  or (status = 'accepted' and public.can_view_class_as_student_or_parent(class_id))
);

create policy sub_requests_requester_update on public.sub_requests
for update
using (requesting_coach_id = auth.uid())
with check (requesting_coach_id = auth.uid());

create policy sub_requests_accept_eligible on public.sub_requests
for update
using (public.can_accept_sub_request(id))
with check (accepting_coach_id = auth.uid());

-- Rebuild TA request policies for TA-only acceptance + student/parent accepted visibility

drop policy if exists ta_requests_admin_all on public.ta_requests;
drop policy if exists ta_requests_select_related on public.ta_requests;
drop policy if exists ta_requests_insert_self on public.ta_requests;
drop policy if exists ta_requests_update_related on public.ta_requests;

create policy ta_requests_admin_all on public.ta_requests
for all
using (public.is_admin())
with check (public.is_admin());

create policy ta_requests_insert_self on public.ta_requests
for insert
with check (
  requesting_coach_id = auth.uid()
  and public.is_coach_or_ta()
);

create policy ta_requests_select_related on public.ta_requests
for select
using (
  requesting_coach_id = auth.uid()
  or accepting_ta_id = auth.uid()
  or public.can_accept_ta_request(id)
  or (status = 'accepted' and public.can_view_class_as_student_or_parent(class_id))
);

create policy ta_requests_requester_update on public.ta_requests
for update
using (requesting_coach_id = auth.uid())
with check (requesting_coach_id = auth.uid());

create policy ta_requests_accept_eligible on public.ta_requests
for update
using (public.can_accept_ta_request(id))
with check (accepting_ta_id = auth.uid());

-- Private sessions RLS

create policy private_sessions_admin_all on public.private_sessions
for all
using (public.is_admin())
with check (public.is_admin());

create policy private_sessions_coach_select_own on public.private_sessions
for select
using (coach_id = auth.uid());

create policy private_sessions_coach_update_own on public.private_sessions
for update
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy private_sessions_student_insert_self on public.private_sessions
for insert
with check (
  student_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);

create policy private_sessions_student_select_self on public.private_sessions
for select
using (student_id = auth.uid());

create policy private_sessions_student_cancel_pending on public.private_sessions
for update
using (
  student_id = auth.uid()
  and status = 'pending'
)
with check (
  student_id = auth.uid()
  and status in ('pending', 'cancelled')
);

create policy private_sessions_parent_select_linked on public.private_sessions
for select
using (public.student_linked_to_parent(student_id));