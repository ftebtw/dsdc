-- Allow multiple external URLs per resource. Mirrors the
-- 0054_homework_external_urls_due_date pattern: keep the legacy single
-- `url` column for back-compat, add a new `urls text[]` array, and
-- backfill the array from existing single URLs.

alter table public.resources
  add column if not exists urls text[] not null default '{}'::text[];

-- Backfill: copy existing url into urls when array is empty.
update public.resources
set urls = array[url]
where url is not null
  and url <> ''
  and (urls is null or array_length(urls, 1) is null);

-- The original 0002_tables.sql declared an unnamed CHECK requiring
-- `url is not null or file_path is not null`. Find and drop it by
-- definition, then add a named replacement that also accepts a
-- non-empty urls array.
do $$
declare
  v_name text;
begin
  select conname into v_name
  from pg_constraint
  where conrelid = 'public.resources'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%url IS NOT NULL OR file_path IS NOT NULL%';
  if v_name is not null then
    execute format('alter table public.resources drop constraint %I', v_name);
  end if;
end $$;

alter table public.resources
  drop constraint if exists resources_has_content_check;

alter table public.resources
  add constraint resources_has_content_check check (
    url is not null
    or file_path is not null
    or coalesce(array_length(urls, 1), 0) > 0
  );
