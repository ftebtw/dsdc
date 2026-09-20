-- Allow text-only resources (title + optional description, no URL/file).
-- The app-side upload route already treats title/description as sufficient
-- content; the older resources_has_content_check constraint (from 0058)
-- still required a URL, file, or non-empty urls array, which blocked
-- posting simple note-only resources.
--
-- Dropping the constraint is safe: `title` is NOT NULL on resources, so
-- every row still carries meaningful content by construction.

alter table public.resources
  drop constraint if exists resources_has_content_check;
