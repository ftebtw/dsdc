-- Phase C: private session booking table

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'private_session_status'
      and n.nspname = 'public'
  ) then
    create type public.private_session_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
  end if;
end
$$;

create table if not exists public.private_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  availability_id uuid references public.coach_availability(id) on delete set null,
  requested_date date not null,
  requested_start_time time not null,
  requested_end_time time not null,
  timezone text not null,
  status public.private_session_status not null default 'pending',
  student_notes text,
  coach_notes text,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  check (requested_end_time > requested_start_time)
);

create index if not exists idx_private_sessions_student on public.private_sessions(student_id);
create index if not exists idx_private_sessions_coach on public.private_sessions(coach_id);
create index if not exists idx_private_sessions_availability on public.private_sessions(availability_id);
create index if not exists idx_private_sessions_status on public.private_sessions(status);
create index if not exists idx_private_sessions_date_time on public.private_sessions(requested_date, requested_start_time);