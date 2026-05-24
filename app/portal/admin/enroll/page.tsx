export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminManualEnrollForm from '@/app/portal/_components/AdminManualEnrollForm';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminEnrollPage({
  searchParams,
}: {
  searchParams: Promise<{ show_archived?: string }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const showArchived = params.show_archived === '1';
  const supabase = await getSupabaseServerClient();

  let classesQuery = (supabase as any)
    .from('classes')
    .select('id,name,archived_at')
    .order('name', { ascending: true });
  if (!showArchived) {
    classesQuery = classesQuery.is('archived_at', null);
  }

  const [{ data: classesData }, { data: studentsData }] = await Promise.all([
    classesQuery,
    supabase.from('profiles').select('id,display_name,email').eq('role', 'student').order('display_name', { ascending: true }),
  ]);
  const classes = (classesData ?? []) as Array<Record<string, any>>;
  const students = (studentsData ?? []) as Array<Record<string, any>>;

  const classOptions = classes.map((classRow: any) => ({
    id: classRow.id,
    label: classRow.name,
    archived: Boolean(classRow.archived_at),
  }));
  const studentOptions = students.map((student: any) => ({
    id: student.id,
    label: `${student.display_name || student.email} (${student.email})`,
  }));

  return (
    <SectionCard
      title="Manual Enrollment"
      description="Enroll an existing student or create a new student account and enroll in one step."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50/50 dark:bg-navy-900/40 px-3 py-2 text-sm">
        <span className="text-charcoal/70 dark:text-navy-300">
          {showArchived
            ? 'Showing active and archived classes. Archived classes are marked.'
            : 'Showing active classes only.'}
        </span>
        <Link
          href={showArchived ? '/portal/admin/enroll' : '/portal/admin/enroll?show_archived=1'}
          className="rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-1.5 text-xs font-semibold text-charcoal/85 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
        >
          {showArchived ? 'Hide archived' : 'Show archived classes'}
        </Link>
      </div>

      {classOptions.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {showArchived
            ? 'No classes exist yet.'
            : 'No active classes. Create one or toggle "Show archived" if you need to enrol into a past class.'}
        </p>
      ) : (
        <AdminManualEnrollForm classOptions={classOptions} studentOptions={studentOptions} />
      )}
    </SectionCard>
  );
}
