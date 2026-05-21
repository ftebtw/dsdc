-- Allow multiple external URLs per homework submission and an optional due date.
-- Backfills existing single external_url into the new array column so old rows
-- continue to render with the new UI. The legacy external_url column is kept
-- for backward compatibility; new submissions write only to external_urls.

alter table public.homework_submissions
  add column if not exists external_urls text[] not null default '{}'::text[];

alter table public.homework_submissions
  add column if not exists due_date date;

-- Backfill: copy existing external_url into external_urls when array is empty.
update public.homework_submissions
set external_urls = array[external_url]
where external_url is not null
  and external_url <> ''
  and (external_urls is null or array_length(external_urls, 1) is null);
