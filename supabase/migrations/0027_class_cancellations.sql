-- Class session cancellations
-- Records when an admin cancels a specific date's class session.
create table if not exists class_cancellations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  cancellation_date date not null,
  reason text not null default '',
  cancelled_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Unique: a class can only be cancelled once per date
create unique index if not exists class_cancellations_class_date_idx
  on class_cancellations(class_id, cancellation_date);

-- RLS
alter table class_cancellations enable row level security;

-- Admins: full access
create policy class_cancellations_admin_all on class_cancellations
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Coaches/TAs: read their own classes' cancellations
create policy class_cancellations_coach_select on class_cancellations
  for select using (
    exists (
      select 1 from classes c
      join profiles p on p.id = auth.uid()
      where c.id = class_cancellations.class_id
        and c.coach_id = auth.uid()
        and p.role in ('coach', 'ta')
    )
  );

-- Students: read cancellations for classes they're enrolled in
create policy class_cancellations_student_select on class_cancellations
  for select using (
    exists (
      select 1 from enrollments e
      join profiles p on p.id = auth.uid()
      where e.class_id = class_cancellations.class_id
        and e.student_id = auth.uid()
        and e.status = 'active'
        and p.role = 'student'
    )
  );

-- Parents: read cancellations for classes their linked students are enrolled in
create policy class_cancellations_parent_select on class_cancellations
  for select using (
    exists (
      select 1 from parent_student_links psl
      join enrollments e on e.student_id = psl.student_id and e.status = 'active'
      join profiles p on p.id = auth.uid()
      where psl.parent_id = auth.uid()
        and e.class_id = class_cancellations.class_id
        and p.role = 'parent'
    )
  );
