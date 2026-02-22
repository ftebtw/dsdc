alter table public.profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.terms enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.student_absences enable row level security;
alter table public.coach_checkins enable row level security;
alter table public.coach_availability enable row level security;
alter table public.sub_requests enable row level security;
alter table public.ta_requests enable row level security;
alter table public.resources enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_signatures enable row level security;
alter table public.report_cards enable row level security;
alter table public.class_credits enable row level security;
alter table public.anonymous_feedback enable row level security;

-- Profiles
create policy profiles_admin_all on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

create policy profiles_select_self on public.profiles
for select
using (id = auth.uid());

create policy profiles_update_self on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy profiles_coach_select_students on public.profiles
for select
using (
  public.is_coach_or_ta()
  and exists (
    select 1
    from public.enrollments e
    join public.classes c on c.id = e.class_id
    where c.coach_id = auth.uid()
      and e.student_id = profiles.id
  )
);

create policy profiles_parent_select_linked_students on public.profiles
for select
using (public.student_linked_to_parent(profiles.id));

-- Coach profiles
create policy coach_profiles_admin_all on public.coach_profiles
for all
using (public.is_admin())
with check (public.is_admin());

create policy coach_profiles_select_self on public.coach_profiles
for select
using (coach_id = auth.uid());

create policy coach_profiles_update_self on public.coach_profiles
for update
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

-- Parent/student links
create policy parent_student_links_admin_all on public.parent_student_links
for all
using (public.is_admin())
with check (public.is_admin());

create policy parent_student_links_select_self on public.parent_student_links
for select
using (parent_id = auth.uid() or student_id = auth.uid());

-- Terms
create policy terms_admin_all on public.terms
for all
using (public.is_admin())
with check (public.is_admin());

create policy terms_select_authenticated on public.terms
for select
using (auth.uid() is not null);

-- Classes
create policy classes_admin_all on public.classes
for all
using (public.is_admin())
with check (public.is_admin());

create policy classes_select_authenticated on public.classes
for select
using (auth.uid() is not null);

-- Enrollments
create policy enrollments_admin_all on public.enrollments
for all
using (public.is_admin())
with check (public.is_admin());

create policy enrollments_coach_select_own_classes on public.enrollments
for select
using (public.teaches_class(class_id));

create policy enrollments_student_select_self on public.enrollments
for select
using (student_id = auth.uid());

create policy enrollments_parent_select_linked on public.enrollments
for select
using (public.student_linked_to_parent(student_id));

-- Attendance
create policy attendance_admin_all on public.attendance_records
for all
using (public.is_admin())
with check (public.is_admin());

create policy attendance_coach_manage_own_classes on public.attendance_records
for all
using (public.teaches_class(class_id))
with check (public.teaches_class(class_id));

create policy attendance_student_select_self on public.attendance_records
for select
using (student_id = auth.uid());

create policy attendance_parent_select_linked on public.attendance_records
for select
using (public.student_linked_to_parent(student_id));

-- Student absences
create policy student_absences_admin_all on public.student_absences
for all
using (public.is_admin())
with check (public.is_admin());

create policy student_absences_coach_select_own_classes on public.student_absences
for select
using (public.teaches_class(class_id));

create policy student_absences_student_insert_self on public.student_absences
for insert
with check (student_id = auth.uid() and reported_by = auth.uid());

create policy student_absences_parent_insert_linked on public.student_absences
for insert
with check (public.student_linked_to_parent(student_id) and reported_by = auth.uid());

create policy student_absences_student_select_self on public.student_absences
for select
using (student_id = auth.uid() or reported_by = auth.uid());

create policy student_absences_parent_select_linked on public.student_absences
for select
using (public.student_linked_to_parent(student_id));

-- Coach checkins
create policy coach_checkins_admin_all on public.coach_checkins
for all
using (public.is_admin())
with check (public.is_admin());

create policy coach_checkins_coach_manage_self on public.coach_checkins
for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

-- Coach availability
create policy coach_availability_admin_all on public.coach_availability
for all
using (public.is_admin())
with check (public.is_admin());

create policy coach_availability_manage_self on public.coach_availability
for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

-- Sub requests
create policy sub_requests_admin_all on public.sub_requests
for all
using (public.is_admin())
with check (public.is_admin());

create policy sub_requests_coach_select_related on public.sub_requests
for select
using (
  requesting_coach_id = auth.uid()
  or accepting_coach_id = auth.uid()
  or public.teaches_class(class_id)
);

create policy sub_requests_coach_insert_self on public.sub_requests
for insert
with check (requesting_coach_id = auth.uid());

create policy sub_requests_coach_update_related on public.sub_requests
for update
using (requesting_coach_id = auth.uid() or accepting_coach_id = auth.uid())
with check (requesting_coach_id = auth.uid() or accepting_coach_id = auth.uid());

-- TA requests
create policy ta_requests_admin_all on public.ta_requests
for all
using (public.is_admin())
with check (public.is_admin());

create policy ta_requests_select_related on public.ta_requests
for select
using (
  requesting_coach_id = auth.uid()
  or accepting_ta_id = auth.uid()
  or public.teaches_class(class_id)
);

create policy ta_requests_insert_self on public.ta_requests
for insert
with check (requesting_coach_id = auth.uid());

create policy ta_requests_update_related on public.ta_requests
for update
using (requesting_coach_id = auth.uid() or accepting_ta_id = auth.uid())
with check (requesting_coach_id = auth.uid() or accepting_ta_id = auth.uid());

-- Resources
create policy resources_admin_all on public.resources
for all
using (public.is_admin())
with check (public.is_admin());

create policy resources_coach_insert on public.resources
for insert
with check (
  posted_by = auth.uid()
  and (
    class_id is null
    or public.teaches_class(class_id)
  )
);

create policy resources_coach_manage_own on public.resources
for update
using (posted_by = auth.uid())
with check (posted_by = auth.uid());

create policy resources_coach_delete_own on public.resources
for delete
using (posted_by = auth.uid());

create policy resources_select_coach_classes on public.resources
for select
using (
  posted_by = auth.uid()
  or (class_id is not null and public.teaches_class(class_id))
);

create policy resources_select_student_classes on public.resources
for select
using (
  class_id is not null
  and exists (
    select 1
    from public.enrollments e
    where e.class_id = resources.class_id
      and e.student_id = auth.uid()
      and e.status = 'active'
  )
);

create policy resources_select_parent_classes on public.resources
for select
using (
  class_id is not null
  and exists (
    select 1
    from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.class_id = resources.class_id
      and e.status = 'active'
      and psl.parent_id = auth.uid()
  )
);

-- Legal documents
create policy legal_documents_admin_all on public.legal_documents
for all
using (public.is_admin())
with check (public.is_admin());

create policy legal_documents_select_authenticated on public.legal_documents
for select
using (auth.uid() is not null);

-- Legal signatures
create policy legal_signatures_admin_all on public.legal_signatures
for all
using (public.is_admin())
with check (public.is_admin());

create policy legal_signatures_insert_self on public.legal_signatures
for insert
with check (signer_id = auth.uid());

create policy legal_signatures_select_self on public.legal_signatures
for select
using (signer_id = auth.uid());

-- Report cards
create policy report_cards_admin_all on public.report_cards
for all
using (public.is_admin())
with check (public.is_admin());

create policy report_cards_coach_write on public.report_cards
for insert
with check (written_by = auth.uid() and public.teaches_class(class_id));

create policy report_cards_coach_update on public.report_cards
for update
using (written_by = auth.uid() and public.teaches_class(class_id))
with check (written_by = auth.uid() and public.teaches_class(class_id));

create policy report_cards_coach_select on public.report_cards
for select
using (written_by = auth.uid() or public.teaches_class(class_id));

create policy report_cards_student_select_approved on public.report_cards
for select
using (student_id = auth.uid() and status = 'approved');

create policy report_cards_parent_select_approved on public.report_cards
for select
using (public.student_linked_to_parent(student_id) and status = 'approved');

-- Class credits
create policy class_credits_admin_all on public.class_credits
for all
using (public.is_admin())
with check (public.is_admin());

create policy class_credits_student_select_self on public.class_credits
for select
using (student_id = auth.uid());

create policy class_credits_parent_select_linked on public.class_credits
for select
using (public.student_linked_to_parent(student_id));

-- Anonymous feedback
create policy anonymous_feedback_admin_read on public.anonymous_feedback
for select
using (public.is_admin());

create policy anonymous_feedback_admin_manage on public.anonymous_feedback
for all
using (public.is_admin())
with check (public.is_admin());

create policy anonymous_feedback_insert_authenticated on public.anonymous_feedback
for insert
with check (auth.uid() is not null);
