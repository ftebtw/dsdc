do $$
declare
  resource_constraint_name text;
begin
  select conname
  into resource_constraint_name
  from pg_constraint
  where conrelid = 'public.resources'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%url IS NOT NULL%'
    and pg_get_constraintdef(oid) ilike '%file_path IS NOT NULL%'
  limit 1;

  if resource_constraint_name is not null then
    execute format(
      'alter table public.resources drop constraint %I',
      resource_constraint_name
    );
  end if;
end
$$;
