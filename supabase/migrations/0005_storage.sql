do $$
begin
  if to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then
    raise notice 'storage schema is unavailable; skipping storage bucket/policy setup in 0005_storage.sql';
    return;
  end if;

  insert into storage.buckets (id, name, public)
  values
    ('portal-resources', 'portal-resources', false),
    ('portal-legal-docs', 'portal-legal-docs', false),
    ('portal-signatures', 'portal-signatures', false),
    ('portal-report-cards', 'portal-report-cards', false)
  on conflict (id) do nothing;

  execute $policy$
    create policy storage_admin_all on storage.objects
    for all
    using (public.is_admin())
    with check (public.is_admin());
  $policy$;

  execute $policy$
    create policy storage_resources_read on storage.objects
    for select
    using (
      bucket_id = 'portal-resources'
      and (
        public.is_admin()
        or public.teaches_class(public.try_parse_uuid(split_part(name, '/', 2)))
        or exists (
          select 1 from public.enrollments e
          where e.class_id = public.try_parse_uuid(split_part(name, '/', 2))
            and e.student_id = auth.uid()
            and e.status = 'active'
        )
        or exists (
          select 1
          from public.enrollments e
          join public.parent_student_links psl on psl.student_id = e.student_id
          where e.class_id = public.try_parse_uuid(split_part(name, '/', 2))
            and e.status = 'active'
            and psl.parent_id = auth.uid()
        )
      )
    );
  $policy$;

  execute $policy$
    create policy storage_resources_write on storage.objects
    for insert
    with check (
      bucket_id = 'portal-resources'
      and (
        public.is_admin()
        or public.teaches_class(public.try_parse_uuid(split_part(name, '/', 2)))
      )
    );
  $policy$;

  execute $policy$
    create policy storage_resources_delete on storage.objects
    for delete
    using (
      bucket_id = 'portal-resources'
      and (
        public.is_admin()
        or public.teaches_class(public.try_parse_uuid(split_part(name, '/', 2)))
      )
    );
  $policy$;

  execute $policy$
    create policy storage_legal_docs_read on storage.objects
    for select
    using (bucket_id = 'portal-legal-docs' and auth.uid() is not null);
  $policy$;

  execute $policy$
    create policy storage_legal_docs_write on storage.objects
    for insert
    with check (bucket_id = 'portal-legal-docs' and public.is_admin());
  $policy$;

  execute $policy$
    create policy storage_legal_docs_delete on storage.objects
    for delete
    using (bucket_id = 'portal-legal-docs' and public.is_admin());
  $policy$;

  execute $policy$
    create policy storage_signatures_read on storage.objects
    for select
    using (
      bucket_id = 'portal-signatures'
      and (
        public.is_admin()
        or public.try_parse_uuid(split_part(name, '/', 3)) = auth.uid()
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

  execute $policy$
    create policy storage_signatures_delete on storage.objects
    for delete
    using (
      bucket_id = 'portal-signatures'
      and (
        public.is_admin()
        or public.try_parse_uuid(split_part(name, '/', 3)) = auth.uid()
      )
    );
  $policy$;

  execute $policy$
    create policy storage_report_cards_read on storage.objects
    for select
    using (
      bucket_id = 'portal-report-cards'
      and (
        public.is_admin()
        or public.teaches_class(public.try_parse_uuid(split_part(name, '/', 4)))
        or public.try_parse_uuid(split_part(name, '/', 6)) = auth.uid()
        or public.student_linked_to_parent(public.try_parse_uuid(split_part(name, '/', 6)))
      )
    );
  $policy$;

  execute $policy$
    create policy storage_report_cards_write on storage.objects
    for insert
    with check (
      bucket_id = 'portal-report-cards'
      and (
        public.is_admin()
        or public.teaches_class(public.try_parse_uuid(split_part(name, '/', 4)))
      )
    );
  $policy$;

  execute $policy$
    create policy storage_report_cards_delete on storage.objects
    for delete
    using (
      bucket_id = 'portal-report-cards'
      and (
        public.is_admin()
        or public.teaches_class(public.try_parse_uuid(split_part(name, '/', 4)))
      )
    );
  $policy$;
end $$;
