-- Per-resource section label. When set, the resource is grouped under that
-- section name in the coach/student resource lists, overriding the default
-- 7-day "Week N" bucketing. Empty/NULL preserves the existing behaviour.

alter table public.resources
  add column if not exists section text;

create index if not exists idx_resources_class_section
  on public.resources(class_id, section)
  where section is not null;
