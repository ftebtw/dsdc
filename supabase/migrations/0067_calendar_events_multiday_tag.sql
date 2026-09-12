-- Multi-day events + category tags for the portal calendar.
--
-- end_date is nullable: NULL means the event is single-day (uses event_date).
-- tag is nullable: NULL means untagged (renders under "Other" in filters).

alter table public.calendar_events
  add column if not exists end_date date,
  add column if not exists tag text;

alter table public.calendar_events
  drop constraint if exists calendar_events_end_date_check;
alter table public.calendar_events
  add constraint calendar_events_end_date_check check (
    end_date is null or end_date >= event_date
  );

alter table public.calendar_events
  drop constraint if exists calendar_events_tag_check;
alter table public.calendar_events
  add constraint calendar_events_tag_check check (
    tag is null
    or tag in (
      'novice_intermediate_class',
      'senior_class',
      'wsc_class',
      'in_person_tournament',
      'online_tournament',
      'other'
    )
  );

create index if not exists calendar_events_end_date_idx on public.calendar_events(end_date);
create index if not exists calendar_events_tag_idx on public.calendar_events(tag) where tag is not null;
