-- Custom-schedule class creation: replaces the term-first workflow with a
-- schedule generator. A class can now be created with a start/end date and
-- an array of weekly recurrence days (e.g. Mon/Wed/Fri), without a term.
--
-- Backwards compatibility: existing classes with term_id + single
-- schedule_day continue to work. schedule_day stays as the "primary" day
-- (populated from the first schedule_days entry on new classes) so the
-- many legacy consumers keep functioning.

alter table public.classes
  add column if not exists schedule_days text[],
  add column if not exists start_date date,
  add column if not exists end_date date;

-- Sanity check on date ordering when both are set.
alter table public.classes
  drop constraint if exists classes_date_range_check;
alter table public.classes
  add constraint classes_date_range_check check (
    start_date is null or end_date is null or end_date >= start_date
  );

-- Update the "regular class" constraint: allow a class without a term as
-- long as it has an explicit start/end window + schedule_days. Legacy
-- (term_id + schedule_day) still passes. Private session groups skip
-- both branches like before.
alter table public.classes drop constraint if exists classes_required_fields_by_kind;
alter table public.classes
  add constraint classes_required_fields_by_kind check (
    is_private_session_group
    or (
      type is not null
      and schedule_start_time is not null
      and schedule_end_time is not null
      and eligible_sub_tier is not null
      and (
        (term_id is not null and schedule_day is not null)
        or (
          start_date is not null
          and end_date is not null
          and schedule_days is not null
          and array_length(schedule_days, 1) > 0
        )
      )
    )
  );

create index if not exists classes_start_end_idx on public.classes(start_date, end_date);
