export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import AdminEmailComposer from '@/app/portal/_components/AdminEmailComposer';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminEmailsPage() {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const [{ data: peopleData }, { data: classesData }, { data: termsData }, { data: pastSendsData }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id,display_name,email,role')
        .not('email', 'is', null)
        .order('display_name', { ascending: true, nullsFirst: false }),
      supabase
        .from('classes')
        .select('id,name,term_id,is_private_session_group')
        .eq('is_private_session_group', false)
        .order('name', { ascending: true }),
      supabase.from('terms').select('id,name'),
      (supabase as any)
        .from('admin_emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

  const termNameById = new Map<string, string>(
    ((termsData ?? []) as Array<{ id: string; name: string }>).map((row) => [row.id, row.name])
  );

  const people = ((peopleData ?? []) as Array<{
    id: string;
    display_name: string | null;
    email: string;
    role: string;
  }>).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    role: row.role,
  }));

  const classes = ((classesData ?? []) as Array<{
    id: string;
    name: string;
    term_id: string | null;
  }>).map((row) => ({
    id: row.id,
    name: row.name,
    termName: row.term_id ? termNameById.get(row.term_id) ?? null : null,
  }));

  return (
    <SectionCard
      title="Emails"
      description="Compose a message and send it to specific people, all students, all coaches, everyone in one class, or a hand-picked list. Attachments optional."
    >
      <AdminEmailComposer
        people={people}
        classes={classes}
        initialPastSends={(pastSendsData ?? []) as any[]}
      />
    </SectionCard>
  );
}
