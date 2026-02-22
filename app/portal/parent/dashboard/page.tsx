import { redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const session = await requireRole(['parent']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  const { linkedStudents, selectedStudentId, selectedStudent } = await getParentSelection(
    supabase,
    session.userId,
    params.student
  );

  if (!linkedStudents.length) {
    return (
      <SectionCard
        title={parentT(locale, 'portal.parent.dashboard.title', 'Parent Dashboard')}
        description={parentT(locale, 'portal.parent.common.noLinkedStudentsShort', 'No linked students yet.')}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(
            locale,
            'portal.parent.common.noLinkedStudents',
            'Ask admin to link your parent account from the student detail page.'
          )}
        </p>
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/dashboard?student=${selectedStudentId}`);
  }

  const activeTerm = await getActiveTerm(supabase);

  const enrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', selectedStudentId)
    .eq('status', 'active')).data ?? []) as any[];

  const classIds = enrollmentRows.map((row: any) => row.class_id);
  const activeClasses = activeTerm && classIds.length
    ? (((await supabase
        .from('classes')
        .select('id,name,term_id')
        .in('id', classIds)
        .eq('term_id', activeTerm.id)).data ?? []) as any[])
    : ([] as any[]);

  const attendanceRows = classIds.length
    ? (((await supabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', selectedStudentId)
        .in('class_id', classIds)).data ?? []) as any[])
    : ([] as any[]);

  const absentCount = attendanceRows.filter((row: any) => row.status === 'absent').length;
  const presentCount = attendanceRows.filter((row: any) => row.status === 'present').length;

  return (
    <div className="space-y-6">
      <SectionCard
        title={parentT(locale, 'portal.parent.dashboard.title', 'Parent Dashboard')}
        description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
          selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
        }`}
      >
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50 dark:bg-navy-900/65 p-3 shadow-sm dark:shadow-black/20">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
              {parentT(locale, 'portal.parent.dashboard.activeClasses', 'Active classes')}
            </p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{activeClasses.length}</p>
          </div>
          <div className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50 dark:bg-navy-900/65 p-3 shadow-sm dark:shadow-black/20">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
              {parentT(locale, 'portal.parent.dashboard.presentCount', 'Present sessions')}
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{presentCount}</p>
          </div>
          <div className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50 dark:bg-navy-900/65 p-3 shadow-sm dark:shadow-black/20">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
              {parentT(locale, 'portal.parent.dashboard.absentCount', 'Absent sessions')}
            </p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{absentCount}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
