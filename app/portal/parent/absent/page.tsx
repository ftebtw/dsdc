export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import PortalAbsenceManager from '@/app/portal/_components/PortalAbsenceManager';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type EnrollmentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'class_id' | 'status'>;
type AbsenceClassRow = Pick<
  Database['public']['Tables']['classes']['Row'],
  'id' | 'name' | 'schedule_day' | 'timezone'
>;
type StudentAbsenceRow = Database['public']['Tables']['student_absences']['Row'];

export default async function ParentAbsentPage({
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
      <SectionCard title={parentT(locale, 'portal.parent.absent.title', 'Report Absence')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No students linked to your account yet.')}
        </p>
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/absent?student=${selectedStudentId}`);
  }

  const activeTerm = await getActiveTerm(supabase);
  if (!activeTerm) {
    return (
      <SectionCard title={parentT(locale, 'portal.parent.absent.title', 'Report Absence')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noActiveTerm', 'No active term is configured.')}
        </p>
      </SectionCard>
    );
  }

  const enrollments = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', selectedStudentId)
    .eq('status', 'active')).data ?? []) as EnrollmentRow[];
  const classIds = enrollments.map((row) => row.class_id);
  const classes = classIds.length
    ? (((await supabase
        .from('classes')
        .select('id,name,schedule_day,timezone')
        .in('id', classIds)
        .eq('term_id', activeTerm.id)
        .order('name')).data ?? []) as AbsenceClassRow[])
    : ([] as AbsenceClassRow[]);
  const classMap = Object.fromEntries(classes.map((classRow) => [classRow.id, classRow.name]));

  const absences = classIds.length
    ? (((await supabase
        .from('student_absences')
        .select('*')
        .eq('student_id', selectedStudentId)
        .in('class_id', classIds)
        .order('reported_at', { ascending: false })
        .limit(50)).data ?? []) as StudentAbsenceRow[])
    : ([] as StudentAbsenceRow[]);

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.absent.title', 'Report Absence')}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
      {classes.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noActiveClassesForStudent', 'No active classes for this student.')}
        </p>
      ) : (
        <PortalAbsenceManager
          classes={classes}
          studentId={selectedStudentId}
          initialAbsences={absences.map((absence) => ({
            id: absence.id,
            className: classMap[absence.class_id] || absence.class_id,
            session_date: absence.session_date,
            reason: absence.reason || null,
            reported_at: absence.reported_at,
          }))}
        />
      )}
    </SectionCard>
  );
}
