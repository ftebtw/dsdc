-- Optional description for class resources.
alter table public.resources
  add column if not exists description text;
