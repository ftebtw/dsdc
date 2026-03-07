-- Custom week titles for class resources (e.g., "Impromptu Practice" instead of "Week 7").
create table public.class_resource_week_titles (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  week_number integer not null check (week_number > 0),
  title text not null check (char_length(title) between 1 and 120),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (class_id, week_number)
);

create index class_resource_week_titles_class_idx
  on public.class_resource_week_titles(class_id);

alter table public.class_resource_week_titles enable row level security;

-- Admin full access.
create policy class_resource_week_titles_admin_all on public.class_resource_week_titles
for all using (public.is_admin()) with check (public.is_admin());

-- Coaches/TAs can manage titles for classes they teach/co-coach or are accepted as sub/TA.
create policy class_resource_week_titles_staff_manage on public.class_resource_week_titles
for all
using (
  public.is_coach_or_ta()
  and (public.teaches_class(class_id) or public.is_subbing_class_any(class_id))
)
with check (
  public.is_coach_or_ta()
  and (public.teaches_class(class_id) or public.is_subbing_class_any(class_id))
  and updated_by = auth.uid()
);

-- Students can read titles for classes they are actively enrolled in.
create policy class_resource_week_titles_student_select on public.class_resource_week_titles
for select using (
  exists (
    select 1 from public.enrollments e
    where e.class_id = class_resource_week_titles.class_id
      and e.student_id = auth.uid()
      and e.status = 'active'
  )
);

-- Parents can read titles for linked students' active classes.
create policy class_resource_week_titles_parent_select on public.class_resource_week_titles
for select using (
  exists (
    select 1
    from public.enrollments e
    join public.parent_student_links psl on psl.student_id = e.student_id
    where e.class_id = class_resource_week_titles.class_id
      and e.status = 'active'
      and psl.parent_id = auth.uid()
  )
);
