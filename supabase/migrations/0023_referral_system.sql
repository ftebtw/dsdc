create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists referral_codes_user_idx on public.referral_codes(user_id);
create unique index if not exists referral_codes_code_idx on public.referral_codes(code);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referral_code_id uuid not null references public.referral_codes(id) on delete cascade,
  referred_email text not null,
  referred_student_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'registered', 'converted', 'credited')),
  credit_amount_cad numeric(10,2) not null default 0,
  stripe_promo_code_id text,
  stripe_promo_code text,
  created_at timestamptz not null default timezone('utc', now()),
  registered_at timestamptz,
  converted_at timestamptz,
  credited_at timestamptz
);

create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
create index if not exists referrals_referred_student_idx on public.referrals(referred_student_id);
create index if not exists referrals_referred_email_idx on public.referrals(referred_email);
create index if not exists referrals_referral_code_idx on public.referrals(referral_code_id);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;

drop policy if exists referral_codes_own_select on public.referral_codes;
create policy referral_codes_own_select on public.referral_codes
  for select using (user_id = auth.uid());

drop policy if exists referral_codes_own_insert on public.referral_codes;
create policy referral_codes_own_insert on public.referral_codes
  for insert with check (user_id = auth.uid());

drop policy if exists referrals_own_select on public.referrals;
create policy referrals_own_select on public.referrals
  for select using (referrer_id = auth.uid());

drop policy if exists referral_codes_admin_all on public.referral_codes;
create policy referral_codes_admin_all on public.referral_codes
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists referrals_admin_all on public.referrals;
create policy referrals_admin_all on public.referrals
  for all
  using (public.is_admin())
  with check (public.is_admin());

