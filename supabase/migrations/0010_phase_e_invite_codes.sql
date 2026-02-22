create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  claimed_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null,
  claimed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index invite_codes_parent_idx on public.invite_codes(parent_id);
create index invite_codes_code_idx on public.invite_codes(code);

alter table public.invite_codes enable row level security;

create policy invite_codes_parent_insert on public.invite_codes
for insert with check (parent_id = auth.uid());

create policy invite_codes_parent_select on public.invite_codes
for select using (parent_id = auth.uid());

create policy invite_codes_student_select on public.invite_codes
for select using (
  claimed_by is null
  and expires_at > now()
  and (
    select role from public.profiles where id = auth.uid()
  ) = 'student'
);

create policy invite_codes_student_claim on public.invite_codes
for update using (
  claimed_by is null
  and expires_at > now()
  and (
    select role from public.profiles where id = auth.uid()
  ) = 'student'
) with check (claimed_by = auth.uid());

create policy invite_codes_admin_all on public.invite_codes
for all using (public.is_admin()) with check (public.is_admin());
