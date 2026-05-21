-- Convert consultations.status from a single text value to a text[] array
-- so admins can flag multiple statuses on one consultation. Also adds two
-- new allowed statuses: 'rescheduled' and 'trial_class'.

alter table public.consultations
  drop constraint if exists consultations_status_check;

drop index if exists public.consultations_status_idx;

alter table public.consultations
  alter column status drop default;

alter table public.consultations
  alter column status type text[] using
    case
      when status is null or status = '' then array['new']::text[]
      else array[status]::text[]
    end;

alter table public.consultations
  alter column status set default array['new']::text[];

alter table public.consultations
  alter column status set not null;

alter table public.consultations
  add constraint consultations_status_check check (
    array_length(status, 1) >= 1
    and status <@ array[
      'new',
      'follow_up',
      'registered',
      'declined',
      'no_show',
      'rescheduled',
      'trial_class'
    ]::text[]
  );

create index consultations_status_idx on public.consultations using gin (status);
