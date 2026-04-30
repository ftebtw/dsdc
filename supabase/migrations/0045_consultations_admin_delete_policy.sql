create policy consultations_admin_delete on public.consultations
for delete
using (public.is_admin());
