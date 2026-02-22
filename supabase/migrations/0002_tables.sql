create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  display_name text,
  email text not null unique,
  phone text,
  timezone text not null default 'America/Vancouver',
  locale public.locale_code not null default 'en',
  notification_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.coach_profiles (
  coach_id uuid primary key references public.profiles(id) on delete cascade,
  tier public.coach_tier not null,
  is_ta boolean not null default false,
  hourly_rate numeric(10,2),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (parent_id, student_id)
);

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  weeks integer not null check (weeks > 0),
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.terms(id) on delete cascade,
  name text not null,
  description text,
  type public.class_type not null,
  coach_id uuid not null references public.profiles(id) on delete restrict,
  schedule_day public.schedule_day not null,
  schedule_start_time time not null,
  schedule_end_time time not null,
  timezone text not null default 'America/Vancouver',
  zoom_link text,
  max_students integer not null default 12 check (max_students > 0),
  eligible_sub_tier public.coach_tier not null,
  created_at timestamptz not null default timezone('utc', now()),
  check (schedule_end_time > schedule_start_time)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  enrolled_at timestamptz not null default timezone('utc', now()),
  status public.enrollment_status not null default 'active',
  stripe_checkout_session_id text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (student_id, class_id)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  session_date date not null,
  status public.attendance_status not null default 'present',
  camera_on boolean not null default true,
  marked_by uuid not null references public.profiles(id) on delete restrict,
  marked_at timestamptz not null default timezone('utc', now()),
  unique (class_id, student_id, session_date)
);

create table public.student_absences (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  reason text,
  reported_by uuid not null references public.profiles(id) on delete restrict,
  reported_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.coach_checkins (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  checked_in_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (coach_id, class_id, session_date)
);

create table public.coach_availability (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  available_date date not null,
  start_time time not null,
  end_time time not null,
  timezone text not null,
  is_group boolean not null default true,
  is_private boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  check (end_time > start_time)
);

create table public.sub_requests (
  id uuid primary key default gen_random_uuid(),
  requesting_coach_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  reason text,
  status public.sub_request_status not null default 'open',
  accepting_coach_id uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ta_requests (
  id uuid primary key default gen_random_uuid(),
  requesting_coach_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  reason text,
  status public.sub_request_status not null default 'open',
  accepting_ta_id uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete set null,
  posted_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type public.resource_type not null,
  url text,
  file_path text,
  created_at timestamptz not null default timezone('utc', now()),
  check (url is not null or file_path is not null)
);

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_path text not null,
  required_for public.legal_required_for not null,
  changes_per_event boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.legal_signatures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.legal_documents(id) on delete cascade,
  signer_id uuid not null references public.profiles(id) on delete cascade,
  signer_role public.app_role not null,
  signature_image_path text not null,
  ip_address text,
  user_agent text,
  signed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.report_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  term_id uuid not null references public.terms(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  written_by uuid not null references public.profiles(id) on delete restrict,
  file_path text not null,
  status public.report_card_status not null default 'draft',
  reviewer_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.class_credits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_type public.class_type not null,
  reason text not null,
  amount_sessions integer not null check (amount_sessions > 0),
  issued_by uuid not null references public.profiles(id) on delete restrict,
  redeemed boolean not null default false,
  redeemed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.anonymous_feedback (
  id uuid primary key default gen_random_uuid(),
  role_hint public.feedback_role_hint not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index terms_one_active_idx on public.terms ((is_active)) where is_active;

create index classes_term_id_idx on public.classes(term_id);
create index classes_coach_id_idx on public.classes(coach_id);
create index enrollments_student_id_idx on public.enrollments(student_id);
create index enrollments_class_id_idx on public.enrollments(class_id);
create index enrollments_status_idx on public.enrollments(status);
create index enrollments_checkout_idx on public.enrollments(stripe_checkout_session_id);
create index attendance_class_date_idx on public.attendance_records(class_id, session_date);
create index attendance_student_idx on public.attendance_records(student_id);
create index attendance_marked_at_idx on public.attendance_records(marked_at desc);
create index student_absences_student_idx on public.student_absences(student_id);
create index student_absences_class_date_idx on public.student_absences(class_id, session_date);
create index coach_checkins_coach_date_idx on public.coach_checkins(coach_id, session_date);
create index coach_checkins_class_date_idx on public.coach_checkins(class_id, session_date);
create index coach_checkins_checked_in_idx on public.coach_checkins(checked_in_at desc);
create index coach_availability_coach_date_idx on public.coach_availability(coach_id, available_date);
create index sub_requests_requesting_idx on public.sub_requests(requesting_coach_id, session_date);
create index sub_requests_accepting_idx on public.sub_requests(accepting_coach_id, session_date);
create index ta_requests_requesting_idx on public.ta_requests(requesting_coach_id, session_date);
create index ta_requests_accepting_idx on public.ta_requests(accepting_ta_id, session_date);
create index resources_class_id_idx on public.resources(class_id);
create index resources_posted_by_idx on public.resources(posted_by);
create index legal_signatures_document_idx on public.legal_signatures(document_id);
create index legal_signatures_signer_idx on public.legal_signatures(signer_id);
create index report_cards_student_term_idx on public.report_cards(student_id, term_id);
create index report_cards_class_idx on public.report_cards(class_id);
create index report_cards_status_idx on public.report_cards(status);
create index class_credits_student_idx on public.class_credits(student_id, redeemed);
create index parent_student_links_parent_idx on public.parent_student_links(parent_id);
create index parent_student_links_student_idx on public.parent_student_links(student_id);
