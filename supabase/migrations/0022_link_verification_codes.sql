create table public.link_verification_codes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_email text not null,
  student_id uuid references public.profiles(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index link_verification_codes_parent_idx on public.link_verification_codes(parent_id);
create index link_verification_codes_code_idx on public.link_verification_codes(code);

alter table public.link_verification_codes enable row level security;

create policy link_verification_codes_parent_all on public.link_verification_codes
for all
using (parent_id = auth.uid())
with check (parent_id = auth.uid());

create policy link_verification_codes_admin_all on public.link_verification_codes
for all
using (public.is_admin())
with check (public.is_admin());
