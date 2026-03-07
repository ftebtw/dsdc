-- Optional file attachment support for sub / TA requests.
alter table public.sub_requests
  add column if not exists attachment_path text,
  add column if not exists attachment_name text;

alter table public.ta_requests
  add column if not exists attachment_path text,
  add column if not exists attachment_name text;
