do $$
declare
  resource_constraint record;
begin
  for resource_constraint in
    select
      conname,
      pg_get_constraintdef(oid) as definition
    from pg_constraint
    where conrelid = 'public.resources'::regclass
      and contype = 'c'
  loop
    if resource_constraint.definition ilike '%url is not null%'
      and resource_constraint.definition ilike '%file_path is not null%' then
      execute format(
        'alter table public.resources drop constraint %I',
        resource_constraint.conname
      );
    end if;
  end loop;
end
$$;
