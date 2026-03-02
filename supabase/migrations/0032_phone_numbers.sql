-- Phone numbers table: multiple labeled numbers per user.
create table public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default '',
  phone_number text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint phone_numbers_label_max check (char_length(label) <= 60),
  constraint phone_numbers_number_max check (char_length(phone_number) <= 30)
);

create index phone_numbers_user_idx on public.phone_numbers(user_id);

alter table public.phone_numbers enable row level security;

-- Admin full access.
create policy phone_numbers_admin_all on public.phone_numbers
for all using (public.is_admin());

-- Users can manage their own phone numbers.
create policy phone_numbers_self_all on public.phone_numbers
for all using (user_id = auth.uid());

-- Coaches/TAs can read phone numbers of students in their classes
-- and parents linked to those students.
create policy phone_numbers_coach_read_students on public.phone_numbers
for select using (
  public.is_coach_or_ta()
  and (
    -- Direct: student enrolled in coach's class.
    exists (
      select 1
      from public.enrollments e
      join public.classes c on c.id = e.class_id
      where e.student_id = phone_numbers.user_id
        and e.status = 'active'
        and (
          c.coach_id = auth.uid()
          or exists (
            select 1
            from public.class_coaches cc
            where cc.class_id = c.id
              and cc.coach_id = auth.uid()
          )
        )
    )
    or
    -- Indirect: parent linked to an enrolled student.
    exists (
      select 1
      from public.parent_student_links psl
      join public.enrollments e on e.student_id = psl.student_id
      join public.classes c on c.id = e.class_id
      where psl.parent_id = phone_numbers.user_id
        and e.status = 'active'
        and (
          c.coach_id = auth.uid()
          or exists (
            select 1
            from public.class_coaches cc
            where cc.class_id = c.id
              and cc.coach_id = auth.uid()
          )
        )
    )
  )
);
