do $$
declare
  term3_id uuid;
  coach_akash_id uuid;
  coach_emily_id uuid;
  coach_rebecca_id uuid;
  coach_archie_id uuid;
  class_row_id uuid;
begin
  -- Ensure Term 3 exists and is the active term.
  select t.id
  into term3_id
  from public.terms t
  where t.name = 'Term 3'
  order by t.start_date desc, t.created_at desc
  limit 1;

  if term3_id is null then
    insert into public.terms (
      name,
      start_date,
      end_date,
      weeks,
      is_active
    ) values (
      'Term 3',
      date '2026-04-06',
      date '2026-06-26',
      12,
      true
    )
    returning id into term3_id;
  else
    update public.terms
    set start_date = date '2026-04-06',
        end_date = date '2026-06-26',
        weeks = 12
    where id = term3_id;
  end if;

  update public.terms
  set is_active = (id = term3_id)
  where is_active is distinct from (id = term3_id);

  -- Resolve coaches from coach profiles.
  select p.id
  into coach_akash_id
  from public.profiles p
  join public.coach_profiles cp on cp.coach_id = p.id
  where lower(coalesce(p.display_name, '')) = lower('Akash Krishnamurthy')
     or lower(p.email) = 'akash.krishnamurthy24@gmail.com'
  order by p.created_at desc
  limit 1;

  select p.id
  into coach_emily_id
  from public.profiles p
  join public.coach_profiles cp on cp.coach_id = p.id
  where lower(coalesce(p.display_name, '')) = lower('Emily Cui')
     or lower(p.email) = 'emlee.cui@gmail.com'
  order by p.created_at desc
  limit 1;

  select p.id
  into coach_rebecca_id
  from public.profiles p
  join public.coach_profiles cp on cp.coach_id = p.id
  where lower(coalesce(p.display_name, '')) = lower('Rebecca Amisano')
     or lower(p.email) = 'rebecca.amisano@icloud.com'
  order by p.created_at desc
  limit 1;

  select p.id
  into coach_archie_id
  from public.profiles p
  join public.coach_profiles cp on cp.coach_id = p.id
  where lower(coalesce(p.display_name, '')) in (lower('Archie'), lower('Archie Wolifson'))
  order by p.created_at desc
  limit 1;

  -- Monday Debate Class (Novice)
  if coach_akash_id is null then
    raise notice 'Skipping Monday Debate Class: Akash Krishnamurthy coach profile not found.';
  else
    select c.id
    into class_row_id
    from public.classes c
    where c.term_id = term3_id
      and c.name = 'Monday Debate Class'
      and c.schedule_day = 'mon'
      and c.schedule_start_time = time '18:45'
      and c.schedule_end_time = time '20:45'
    limit 1;

    if class_row_id is null then
      insert into public.classes (
        term_id,
        name,
        type,
        coach_id,
        schedule_day,
        schedule_start_time,
        schedule_end_time,
        timezone,
        eligible_sub_tier
      ) values (
        term3_id,
        'Monday Debate Class',
        'novice_debate',
        coach_akash_id,
        'mon',
        time '18:45',
        time '20:45',
        'America/Vancouver',
        'junior'
      )
      returning id into class_row_id;
    else
      update public.classes
      set type = 'novice_debate',
          coach_id = coach_akash_id,
          timezone = 'America/Vancouver',
          eligible_sub_tier = 'junior'
      where id = class_row_id;
    end if;

    insert into public.class_coaches (class_id, coach_id)
    values (class_row_id, coach_akash_id)
    on conflict (class_id, coach_id) do nothing;
  end if;

  -- Tuesday Debate Class (Novice)
  if coach_akash_id is null then
    raise notice 'Skipping Tuesday Debate Class: Akash Krishnamurthy coach profile not found.';
  else
    select c.id
    into class_row_id
    from public.classes c
    where c.term_id = term3_id
      and c.name = 'Tuesday Debate Class'
      and c.schedule_day = 'tue'
      and c.schedule_start_time = time '19:00'
      and c.schedule_end_time = time '21:00'
    limit 1;

    if class_row_id is null then
      insert into public.classes (
        term_id,
        name,
        type,
        coach_id,
        schedule_day,
        schedule_start_time,
        schedule_end_time,
        timezone,
        eligible_sub_tier
      ) values (
        term3_id,
        'Tuesday Debate Class',
        'novice_debate',
        coach_akash_id,
        'tue',
        time '19:00',
        time '21:00',
        'America/Vancouver',
        'junior'
      )
      returning id into class_row_id;
    else
      update public.classes
      set type = 'novice_debate',
          coach_id = coach_akash_id,
          timezone = 'America/Vancouver',
          eligible_sub_tier = 'junior'
      where id = class_row_id;
    end if;

    insert into public.class_coaches (class_id, coach_id)
    values (class_row_id, coach_akash_id)
    on conflict (class_id, coach_id) do nothing;
  end if;

  -- Wednesday WSC Class
  if coach_emily_id is null then
    raise notice 'Skipping Wednesday WSC Class: Emily Cui coach profile not found.';
  else
    select c.id
    into class_row_id
    from public.classes c
    where c.term_id = term3_id
      and c.name = 'Wednesday WSC Class'
      and c.schedule_day = 'wed'
      and c.schedule_start_time = time '19:00'
      and c.schedule_end_time = time '21:00'
    limit 1;

    if class_row_id is null then
      insert into public.classes (
        term_id,
        name,
        type,
        coach_id,
        schedule_day,
        schedule_start_time,
        schedule_end_time,
        timezone,
        eligible_sub_tier
      ) values (
        term3_id,
        'Wednesday WSC Class',
        'wsc',
        coach_emily_id,
        'wed',
        time '19:00',
        time '21:00',
        'America/Vancouver',
        'wsc'
      )
      returning id into class_row_id;
    else
      update public.classes
      set type = 'wsc',
          coach_id = coach_emily_id,
          timezone = 'America/Vancouver',
          eligible_sub_tier = 'wsc'
      where id = class_row_id;
    end if;

    insert into public.class_coaches (class_id, coach_id)
    values (class_row_id, coach_emily_id)
    on conflict (class_id, coach_id) do nothing;
  end if;

  -- Friday Debate Class (Novice) - Akash
  if coach_akash_id is null then
    raise notice 'Skipping Friday 5:30 PM Debate Class: Akash Krishnamurthy coach profile not found.';
  else
    select c.id
    into class_row_id
    from public.classes c
    where c.term_id = term3_id
      and c.name = 'Friday Debate Class'
      and c.schedule_day = 'fri'
      and c.schedule_start_time = time '17:30'
      and c.schedule_end_time = time '19:30'
    limit 1;

    if class_row_id is null then
      insert into public.classes (
        term_id,
        name,
        type,
        coach_id,
        schedule_day,
        schedule_start_time,
        schedule_end_time,
        timezone,
        eligible_sub_tier
      ) values (
        term3_id,
        'Friday Debate Class',
        'novice_debate',
        coach_akash_id,
        'fri',
        time '17:30',
        time '19:30',
        'America/Vancouver',
        'junior'
      )
      returning id into class_row_id;
    else
      update public.classes
      set type = 'novice_debate',
          coach_id = coach_akash_id,
          timezone = 'America/Vancouver',
          eligible_sub_tier = 'junior'
      where id = class_row_id;
    end if;

    insert into public.class_coaches (class_id, coach_id)
    values (class_row_id, coach_akash_id)
    on conflict (class_id, coach_id) do nothing;
  end if;

  -- Friday Debate Class (Novice) - Rebecca
  if coach_rebecca_id is null then
    raise notice 'Skipping Friday 7:30 PM Debate Class: Rebecca Amisano coach profile not found.';
  else
    select c.id
    into class_row_id
    from public.classes c
    where c.term_id = term3_id
      and c.name = 'Friday Debate Class'
      and c.schedule_day = 'fri'
      and c.schedule_start_time = time '19:30'
      and c.schedule_end_time = time '21:30'
    limit 1;

    if class_row_id is null then
      insert into public.classes (
        term_id,
        name,
        type,
        coach_id,
        schedule_day,
        schedule_start_time,
        schedule_end_time,
        timezone,
        eligible_sub_tier
      ) values (
        term3_id,
        'Friday Debate Class',
        'novice_debate',
        coach_rebecca_id,
        'fri',
        time '19:30',
        time '21:30',
        'America/Vancouver',
        'junior'
      )
      returning id into class_row_id;
    else
      update public.classes
      set type = 'novice_debate',
          coach_id = coach_rebecca_id,
          timezone = 'America/Vancouver',
          eligible_sub_tier = 'junior'
      where id = class_row_id;
    end if;

    insert into public.class_coaches (class_id, coach_id)
    values (class_row_id, coach_rebecca_id)
    on conflict (class_id, coach_id) do nothing;
  end if;

  -- Advanced Debate Class (BP)
  if coach_archie_id is null then
    raise notice 'Skipping Advanced Debate Class (BP): Archie coach profile not found.';
  else
    select c.id
    into class_row_id
    from public.classes c
    where c.term_id = term3_id
      and c.name = 'Advanced Debate Class (BP)'
      and c.schedule_day = 'fri'
      and c.schedule_start_time = time '18:35'
      and c.schedule_end_time = time '20:35'
    limit 1;

    if class_row_id is null then
      insert into public.classes (
        term_id,
        name,
        type,
        coach_id,
        schedule_day,
        schedule_start_time,
        schedule_end_time,
        timezone,
        eligible_sub_tier
      ) values (
        term3_id,
        'Advanced Debate Class (BP)',
        'advanced_debate',
        coach_archie_id,
        'fri',
        time '18:35',
        time '20:35',
        'America/Vancouver',
        'senior'
      )
      returning id into class_row_id;
    else
      update public.classes
      set type = 'advanced_debate',
          coach_id = coach_archie_id,
          timezone = 'America/Vancouver',
          eligible_sub_tier = 'senior'
      where id = class_row_id;
    end if;

    insert into public.class_coaches (class_id, coach_id)
    values (class_row_id, coach_archie_id)
    on conflict (class_id, coach_id) do nothing;
  end if;
end
$$;
