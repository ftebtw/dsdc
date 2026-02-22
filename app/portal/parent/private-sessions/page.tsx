import { redirect } from 'next/navigation';
import PrivateSessionsManager from '@/app/portal/_components/PrivateSessionsManager';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentPrivateSessionsPage({
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
      <SectionCard title={parentT(locale, 'portal.parent.privateSessions.title', 'Private Sessions')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No students linked to your account yet.')}
        </p>
      </SectionCard>
    );
  }
  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/private-sessions?student=${selectedStudentId}`);
  }

  const { data: sessionRows } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('student_id', selectedStudentId)
    .order('requested_date', { ascending: true })
    .order('requested_start_time', { ascending: true });
  const sessions = (sessionRows ?? []) as Array<Record<string, any>>;
  const coachMap = await getProfileMap(
    supabase,
    [...new Set(sessions.map((row: any) => row.coach_id))]
  );

  const items = sessions.map((row: any) => ({
    ...row,
    coachName: coachMap[row.coach_id]?.display_name || coachMap[row.coach_id]?.email || row.coach_id,
    studentName: selectedStudent?.display_name || selectedStudent?.email || selectedStudentId,
    whenText: formatSessionRangeForViewer(
      row.requested_date,
      row.requested_start_time,
      row.requested_end_time,
      row.timezone,
      session.profile.timezone
    ),
  }));

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.privateSessions.title', 'Private Sessions')}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
      <PrivateSessionsManager sessions={items} />
    </SectionCard>
  );
}
