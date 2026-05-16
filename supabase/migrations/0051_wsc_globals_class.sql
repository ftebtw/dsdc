-- WSC Globals Training: a one-off custom-priced WSC program that runs on a
-- bespoke 15-session schedule (10 Saturdays + 5 Thursdays, May 16 - July 18,
-- 2026) and lives in its own non-active term so the regular Term 3 enrollment
-- flow is unaffected.

alter table public.classes
  add column if not exists custom_price_cad integer;

comment on column public.classes.custom_price_cad is
  'Optional per-class CAD price override. When set, supersedes the group-tier price for this class. Not prorated.';

do $$
declare
  globals_term_id uuid;
  coach_emily_id uuid;
  globals_class_id uuid;
  globals_description text;
begin
  -- Ensure the dedicated WSC Globals term exists.
  select t.id
  into globals_term_id
  from public.terms t
  where t.name = 'Spring 2026 WSC Globals'
  order by t.start_date desc, t.created_at desc
  limit 1;

  if globals_term_id is null then
    insert into public.terms (
      name,
      start_date,
      end_date,
      weeks,
      is_active
    ) values (
      'Spring 2026 WSC Globals',
      date '2026-05-16',
      date '2026-07-18',
      15,
      false
    )
    returning id into globals_term_id;
  else
    update public.terms
    set start_date = date '2026-05-16',
        end_date = date '2026-07-18',
        weeks = 15,
        is_active = false
    where id = globals_term_id;
  end if;

  -- Resolve Emily Cui as the coach.
  select p.id
  into coach_emily_id
  from public.profiles p
  join public.coach_profiles cp on cp.coach_id = p.id
  where lower(coalesce(p.display_name, '')) = lower('Emily Cui')
     or lower(p.email) = 'emlee.cui@gmail.com'
  order by p.created_at desc
  limit 1;

  if coach_emily_id is null then
    raise notice 'Skipping WSC Globals class: Emily Cui coach profile not found.';
    return;
  end if;

  globals_description :=
    'World Scholar''s Cup Globals training program. 15 sessions total, 7:00-9:00 PM PT, taught by Emily Cui. '
    'Saturdays: May 16, May 23, May 30, June 6, June 13, June 20, June 27, July 4, July 11, July 18. '
    'Thursdays (intensive weeks): June 18, June 25, July 2, July 9, July 16.';

  select c.id
  into globals_class_id
  from public.classes c
  where c.term_id = globals_term_id
    and c.name = 'WSC Globals Training'
    and c.schedule_day = 'sat'
    and c.schedule_start_time = time '19:00'
    and c.schedule_end_time = time '21:00'
  limit 1;

  if globals_class_id is null then
    insert into public.classes (
      term_id,
      name,
      description,
      type,
      coach_id,
      schedule_day,
      schedule_start_time,
      schedule_end_time,
      timezone,
      max_students,
      eligible_sub_tier,
      custom_price_cad
    ) values (
      globals_term_id,
      'WSC Globals Training',
      globals_description,
      'wsc',
      coach_emily_id,
      'sat',
      time '19:00',
      time '21:00',
      'America/Vancouver',
      12,
      'wsc',
      1200
    )
    returning id into globals_class_id;
  else
    update public.classes
    set description = globals_description,
        type = 'wsc',
        coach_id = coach_emily_id,
        timezone = 'America/Vancouver',
        eligible_sub_tier = 'wsc',
        custom_price_cad = 1200
    where id = globals_class_id;
  end if;

  insert into public.class_coaches (class_id, coach_id)
  values (globals_class_id, coach_emily_id)
  on conflict (class_id, coach_id) do nothing;
end
$$;
