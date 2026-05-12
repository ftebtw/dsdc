-- Add a single optional file attachment to calendar_events so admins/coaches
-- can attach things like tournament invitations (PDFs etc.) that students and
-- parents can view/download from the event details.

alter table public.calendar_events
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime_type text;

do $$
begin
  if to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then
    raise notice 'storage schema is unavailable; skipping bucket/policy setup in 0050_calendar_event_attachments.sql';
    return;
  end if;

  insert into storage.buckets (id, name, public)
  values ('portal-calendar', 'portal-calendar', false)
  on conflict (id) do nothing;

  execute $policy$
    drop policy if exists storage_calendar_write on storage.objects;
  $policy$;
  execute $policy$
    create policy storage_calendar_write on storage.objects
    for insert
    with check (
      bucket_id = 'portal-calendar'
      and exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('admin', 'coach', 'ta')
      )
    );
  $policy$;

  execute $policy$
    drop policy if exists storage_calendar_delete on storage.objects;
  $policy$;
  execute $policy$
    create policy storage_calendar_delete on storage.objects
    for delete
    using (
      bucket_id = 'portal-calendar'
      and exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('admin', 'coach', 'ta')
      )
    );
  $policy$;

  -- Read is permissive at the storage layer because the signed-URL endpoint
  -- first verifies (via RLS on calendar_events) that the caller can see the
  -- event row. Students/parents can only reach attachments on events with
  -- visibility = 'everyone'.
  execute $policy$
    drop policy if exists storage_calendar_read on storage.objects;
  $policy$;
  execute $policy$
    create policy storage_calendar_read on storage.objects
    for select
    using (
      bucket_id = 'portal-calendar'
      and auth.uid() is not null
    );
  $policy$;
end $$;
