-- Phase B hardening:
-- Add per-student scoping for parent legal signatures and tighten policies.

alter table public.legal_signatures
add column if not exists signed_for_student_id uuid references public.profiles(id) on delete set null;

create index if not exists legal_signatures_signed_for_student_idx
  on public.legal_signatures(signed_for_student_id);

drop policy if exists legal_signatures_insert_self on public.legal_signatures;
drop policy if exists legal_signatures_insert_student_self on public.legal_signatures;
drop policy if exists legal_signatures_insert_parent_linked_student on public.legal_signatures;
drop policy if exists legal_signatures_select_parent_linked_students on public.legal_signatures;

create policy legal_signatures_insert_student_self on public.legal_signatures
for insert
with check (
  signer_id = auth.uid()
  and signer_role = 'student'
  and signed_for_student_id is null
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);

create policy legal_signatures_insert_parent_linked_student on public.legal_signatures
for insert
with check (
  signer_id = auth.uid()
  and signer_role = 'parent'
  and signed_for_student_id is not null
  and public.student_linked_to_parent(signed_for_student_id)
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'parent'
  )
);

create policy legal_signatures_select_parent_linked_students on public.legal_signatures
for select
using (
  (
    exists (
      select 1
      from public.profiles signer
      where signer.id = legal_signatures.signer_id
        and signer.role = 'student'
        and public.student_linked_to_parent(legal_signatures.signer_id)
    )
  )
  or (
    legal_signatures.signed_for_student_id is not null
    and public.student_linked_to_parent(legal_signatures.signed_for_student_id)
  )
);

do $$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'storage.objects is unavailable; skipping signature storage policy updates in 0007.';
    return;
  end if;

  execute 'drop policy if exists storage_signatures_read on storage.objects';
  execute $policy$
    create policy storage_signatures_read on storage.objects
    for select
    using (
      bucket_id = 'portal-signatures'
      and (
        public.is_admin()
        or public.try_parse_uuid(split_part(name, '/', 3)) = auth.uid()
        or public.student_linked_to_parent(public.try_parse_uuid(split_part(name, '/', 3)))
        or exists (
          select 1
          from public.legal_signatures ls
          where ls.signature_image_path = name
            and ls.signed_for_student_id is not null
            and public.student_linked_to_parent(ls.signed_for_student_id)
        )
      )
    );
  $policy$;
end $$;
