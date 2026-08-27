-- Add the "bio" mode (Coach Biography poster) to the schedule_templates
-- check constraint, alongside single/term/coach.

alter table public.schedule_templates
  drop constraint if exists schedule_templates_mode_check;

alter table public.schedule_templates
  add constraint schedule_templates_mode_check check (mode in ('single', 'term', 'coach', 'bio'));
