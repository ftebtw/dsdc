-- Phase B addendum:
-- 1) Harden legal_signatures policy replacement with defensive drops.
-- 2) Allow parents to view linked students' signature images.
-- 3) Keep signature assets immutable by removing delete policy paths.

-- Rebuild legal_signatures policies explicitly.
drop policy if exists legal_signatures_admin_all on public.legal_signatures;
drop policy if exists legal_signatures_select_self on public.legal_signatures;
drop policy if exists legal_signatures_insert_self on public.legal_signatures;
drop policy if exists legal_signatures_select_admin on public.legal_signatures;
drop policy if exists legal_signatures_select_signer_self on public.legal_signatures;
drop policy if exists legal_signatures_select_parent_linked_student on public.legal_signatures;
drop policy if exists legal_signatures_select_parent_linked_students on public.legal_signatures;

create policy legal_signatures_select_admin on public.legal_signatures
for select
using (public.is_admin());

create policy legal_signatures_select_signer_self on public.legal_signatures
for select
using (signer_id = auth.uid());

create policy legal_signatures_select_parent_linked_students on public.legal_signatures
for select
using (
  exists (
    select 1
    from public.profiles signer
    where signer.id = legal_signatures.signer_id
      and signer.role = 'student'
      and public.student_linked_to_parent(legal_signatures.signer_id)
  )
);

create policy legal_signatures_insert_self on public.legal_signatures
for insert
with check (signer_id = auth.uid());

-- No update/delete policies on public.legal_signatures to keep signatures immutable.

do $$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'storage.objects is unavailable; skipping signature storage policy updates in 0006.';
    return;
  end if;

  -- Replace broad admin policy with a variant that excludes portal-signatures.
  execute 'drop policy if exists storage_admin_all on storage.objects';
  execute 'drop policy if exists storage_admin_all_except_signatures on storage.objects';
  execute $policy$
    create policy storage_admin_all_except_signatures on storage.objects
    for all
    using (
      public.is_admin()
      and bucket_id <> 'portal-signatures'
    )
    with check (
      public.is_admin()
      and bucket_id <> 'portal-signatures'
    );
  $policy$;

  -- Rebuild signature bucket policies:
  -- read: admin, signer self, or linked parent of student signer
  -- write: admin or signer self
  -- delete: intentionally omitted to preserve immutability
  execute 'drop policy if exists storage_signatures_read on storage.objects';
  execute 'drop policy if exists storage_signatures_write on storage.objects';
  execute 'drop policy if exists storage_signatures_delete on storage.objects';

  execute $policy$
    create policy storage_signatures_read on storage.objects
    for select
    using (
      bucket_id = 'portal-signatures'
      and (
        public.is_admin()
        or public.try_parse_uuid(split_part(name, '/', 3)) = auth.uid()
        or public.student_linked_to_parent(public.try_parse_uuid(split_part(name, '/', 3)))
      )
    );
  $policy$;

  execute $policy$
    create policy storage_signatures_write on storage.objects
    for insert
    with check (
      bucket_id = 'portal-signatures'
      and (
        public.is_admin()
        or public.try_parse_uuid(split_part(name, '/', 3)) = auth.uid()
      )
    );
  $policy$;
end $$;
