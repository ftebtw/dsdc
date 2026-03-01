-- Add session_date to resources so resources can be tagged to a specific class date/week.
-- Defaults to the upload date for backward compatibility.
alter table public.resources
  add column session_date date;

-- Backfill existing resources: use the date portion of created_at.
update public.resources
  set session_date = (created_at at time zone 'UTC')::date
  where session_date is null;

-- Make it non-null going forward.
alter table public.resources
  alter column session_date set default current_date;
