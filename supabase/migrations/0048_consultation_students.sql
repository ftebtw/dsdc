create table public.consultation_students (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  student_name text not null,
  student_grade text,
  student_age integer check (student_age is null or student_age >= 0),
  student_school text,
  recommended_class text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index consultation_students_consultation_id_idx
  on public.consultation_students(consultation_id, sort_order);
create index consultation_students_student_name_idx
  on public.consultation_students(student_name);

insert into public.consultation_students (
  consultation_id, student_name, student_grade, student_age, student_school, recommended_class, sort_order
)
select id, student_name, student_grade, student_age, student_school, recommended_class, 0
from public.consultations;

drop index if exists public.consultations_student_name_idx;

alter table public.consultations
  drop column student_name,
  drop column student_grade,
  drop column student_age,
  drop column student_school,
  drop column recommended_class;

alter table public.consultation_students enable row level security;

create policy consultation_students_admin_select on public.consultation_students
for select
using (public.is_admin());

create policy consultation_students_admin_insert on public.consultation_students
for insert
with check (public.is_admin());

create policy consultation_students_admin_update on public.consultation_students
for update
using (public.is_admin())
with check (public.is_admin());

create policy consultation_students_admin_delete on public.consultation_students
for delete
using (public.is_admin());
