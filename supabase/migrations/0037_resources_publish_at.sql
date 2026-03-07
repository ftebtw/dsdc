-- Schedule resource visibility for students/parents.
alter table public.resources
  add column if not exists publish_at timestamptz;

update public.resources
set publish_at = created_at
where publish_at is null;

alter table public.resources
  alter column publish_at set default timezone('utc', now());

alter table public.resources
  alter column publish_at set not null;

-- Students only see resources that are published.
drop policy if exists resources_select_student_classes on public.resources;
create policy resources_select_student_classes on public.resources
for select
using (
  class_id is not null
  and coalesce(publish_at, created_at) <= timezone('utc', now())
  and exists (
    select 1
    from public.enrollments e
    where e.class_id = resources.class_id
      and e.student_id = auth.uid()
      and e.status = 'active'
  )
);

-- Parents only see resources that are published.
drop policy if exists resources_select_parent_classes on public.resources;
create policy resources_select_parent_classes on public.resources
for select
using (
  class_id is not null
  and coalesce(publish_at, created_at) <= timezone('utc', now())
  and exists (
    select 1
    from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.class_id = resources.class_id
      and e.status = 'active'
      and psl.parent_id = auth.uid()
  )
);
