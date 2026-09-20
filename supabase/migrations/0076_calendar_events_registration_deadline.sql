-- Optional registration deadline for calendar events (e.g. tournament sign-up
-- cutoff). Nullable so it stays optional; renders on the calendar and event
-- detail sheet.

alter table public.calendar_events
  add column if not exists registration_deadline date;
