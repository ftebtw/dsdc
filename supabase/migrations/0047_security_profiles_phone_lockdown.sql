-- Security tightening:
--   1. Block any non-admin user from escalating their own role via profiles.
--      The profiles_update_self policy intentionally lets users update their
--      own row (display_name, timezone, locale, notification_preferences,
--      etc.), but it had no column-level guard, so a user could set
--      role = 'admin' on their own profile and escalate. Enforce the
--      restriction with a BEFORE UPDATE trigger so the fix holds regardless
--      of which client is used.
--
--   2. Tighten phone_numbers_self_all so users can't insert/update phone
--      rows pointing at someone else's user_id. The original policy used
--      `for all using (user_id = auth.uid())` with no `with check`, leaving
--      the WRITE side wide open.

-- ---------------------------------------------------------------
-- 1. Profiles: block self role escalation
-- ---------------------------------------------------------------
create or replace function public.prevent_self_privileged_field_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service-role / system contexts have a null auth.uid(); allow them
  -- through (signup flow, scheduled jobs, admin SDK clients).
  if auth.uid() is null then
    return new;
  end if;

  -- Admins can change anything via the regular admin UI.
  if public.is_admin() then
    return new;
  end if;

  -- Non-admin authenticated user: block role mutations.
  if new.role is distinct from old.role then
    raise exception 'Insufficient privileges to change role'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_privileged_changes
  on public.profiles;

create trigger profiles_prevent_self_privileged_changes
before update on public.profiles
for each row
execute function public.prevent_self_privileged_field_changes();

-- ---------------------------------------------------------------
-- 2. Phone numbers: tighten the self policy with a `with check`
-- ---------------------------------------------------------------
drop policy if exists phone_numbers_self_all on public.phone_numbers;

create policy phone_numbers_self_all on public.phone_numbers
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
