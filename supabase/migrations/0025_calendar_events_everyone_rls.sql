-- Allow students and parents to see events with visibility = 'everyone'
drop policy if exists calendar_events_select on public.calendar_events;

create policy calendar_events_select on public.calendar_events
for select using (
  -- Admin sees everything
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
  OR (
    -- Own events always visible
    created_by = auth.uid()
  )
  OR (
    -- all_coaches visible to coach/ta
    visibility = 'all_coaches'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('coach', 'ta')
    )
  )
  OR (
    -- everyone visible to all authenticated users
    visibility = 'everyone'
    and auth.uid() is not null
  )
);
