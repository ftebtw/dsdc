-- Widen the schedule_templates.mode check so the "Meet the Coach" card
-- (added in the Poster Maker) can persist alongside single-class and
-- term-overview posters.

alter table public.schedule_templates
  drop constraint if exists schedule_templates_mode_check;

alter table public.schedule_templates
  add constraint schedule_templates_mode_check check (mode in ('single', 'term', 'coach'));
