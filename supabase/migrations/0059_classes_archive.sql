-- Archive support for classes (regular + private session group classrooms).
-- Archive is a soft hide: data stays intact, student/parent past-classes
-- views keep showing it, admin/coach main views exclude it by default.

alter table public.classes
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null;

-- Partial index makes the common "currently active classes" query fast.
create index if not exists idx_classes_active
  on public.classes(coach_id)
  where archived_at is null;

create index if not exists idx_classes_archived_at
  on public.classes(archived_at)
  where archived_at is not null;
