create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_coach_or_ta()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('coach', 'ta')
  );
$$;

create or replace function public.teaches_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = target_class_id
      and c.coach_id = auth.uid()
  );
$$;

create or replace function public.student_linked_to_parent(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.parent_student_links psl
    where psl.parent_id = auth.uid()
      and psl.student_id = target_student_id
  );
$$;

create or replace function public.is_parent_of_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.student_linked_to_parent(target_student_id);
$$;

create or replace function public.try_parse_uuid(value text)
returns uuid
language plpgsql
immutable
as $$
begin
  begin
    return value::uuid;
  exception when invalid_text_representation then
    return null;
  end;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_text text;
  locale_text text;
  selected_role public.app_role := 'student';
  selected_locale public.locale_code := 'en';
begin
  role_text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  locale_text := coalesce(new.raw_user_meta_data ->> 'locale', 'en');

  if role_text = any(enum_range(null::public.app_role)::text[]) then
    selected_role := role_text::public.app_role;
  end if;

  if locale_text = any(enum_range(null::public.locale_code)::text[]) then
    selected_locale := locale_text::public.locale_code;
  end if;

  insert into public.profiles (
    id,
    role,
    display_name,
    email,
    phone,
    timezone,
    locale,
    notification_preferences,
    created_at
  )
  values (
    new.id,
    selected_role,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'timezone', 'America/Vancouver'),
    selected_locale,
    '{}'::jsonb,
    timezone('utc', now())
  )
  on conflict (id) do update
  set role = excluded.role,
      display_name = excluded.display_name,
      email = excluded.email,
      phone = excluded.phone,
      timezone = excluded.timezone,
      locale = excluded.locale;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
