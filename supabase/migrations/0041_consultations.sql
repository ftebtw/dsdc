create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'new' check (status in ('new', 'follow_up', 'registered', 'declined', 'no_show')),
  parent_name text not null,
  parent_email text,
  parent_phone text,
  preferred_language text check (preferred_language in ('english', 'mandarin')),
  student_name text not null,
  student_grade text,
  student_age integer check (student_age is null or student_age >= 0),
  student_school text,
  location_timezone text,
  how_found_us text check (
    how_found_us is null
    or how_found_us in ('google', 'referral', 'social_media', 'school', 'word_of_mouth', 'returning_student', 'other')
  ),
  how_found_us_details text,
  has_prior_experience boolean not null default false,
  prior_experience_details text,
  goals text,
  recommended_class text,
  next_steps text,
  notes text,
  consult_date date not null default current_date
);

create index consultations_consult_date_idx on public.consultations(consult_date desc, created_at desc);
create index consultations_status_idx on public.consultations(status);
create index consultations_parent_name_idx on public.consultations(parent_name);
create index consultations_student_name_idx on public.consultations(student_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists consultations_set_updated_at on public.consultations;

create trigger consultations_set_updated_at
before update on public.consultations
for each row execute function public.set_updated_at();

alter table public.consultations enable row level security;

create policy consultations_admin_select on public.consultations
for select
using (public.is_admin());

create policy consultations_admin_insert on public.consultations
for insert
with check (public.is_admin() and created_by = auth.uid());

create policy consultations_admin_update on public.consultations
for update
using (public.is_admin())
with check (public.is_admin());
