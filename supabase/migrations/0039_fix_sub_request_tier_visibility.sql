-- Ensure sub-request eligibility works with multi-tier coaches.
-- Some coaches may have tiers stored in coach_tier_assignments, coach_profiles.tier, or both.
create or replace function public.can_accept_sub_request(target_sub_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sub_requests sr
    join public.classes c on c.id = sr.class_id
    join public.profiles p on p.id = auth.uid()
    left join public.coach_profiles cp on cp.coach_id = auth.uid()
    where sr.id = target_sub_request_id
      and sr.status = 'open'
      and sr.requesting_coach_id <> auth.uid()
      and p.role in ('coach', 'ta')
      and (
        exists (
          select 1
          from public.coach_tier_assignments cta
          where cta.coach_id = auth.uid()
            and cta.tier = c.eligible_sub_tier
        )
        or cp.tier = c.eligible_sub_tier
      )
  );
$$;

