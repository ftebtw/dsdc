export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentFeedbackRequestsPage() {
  const session = await requireRole(['parent']);
  const supabase = await getSupabaseServerClient();

  const { data: linkRows } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', session.userId);
  const linkedStudentIds = [
    ...new Set(((linkRows ?? []) as Array<{ student_id: string }>).map((r) => r.student_id)),
  ];

  const [{ data: enrollmentRows }, { data: rows }] = await Promise.all([
    linkedStudentIds.length
      ? supabase
          .from('enrollments')
          .select('class_id,student_id')
          .in('student_id', linkedStudentIds)
          .in('status', ['active', 'completed'])
      : Promise.resolve({ data: [] as Array<{ class_id: string; student_id: string }> } as any),
    (supabase as any)
      .from('feedback_requests')
      .select('*')
      .order('updated_at', { ascending: false }),
  ]);

  const enrollmentRowList = (enrollmentRows ?? []) as Array<{ class_id: string; student_id: string }>;
  const classIds = [...new Set(enrollmentRowList.map((r) => r.class_id))];
  const { data: classesData } = classIds.length
    ? await supabase.from('classes').select('id,name,coach_id').in('id', classIds)
    : { data: [] as Array<{ id: string; name: string; coach_id: string | null }> };
  const classes = (classesData ?? []) as Array<{ id: string; name: string; coach_id: string | null }>;

  const requestRows = (rows ?? []) as Array<any>;
  const requesterIds = [...new Set(requestRows.map((r) => r.requested_by))];
  const profileMap = await getProfileMap(supabase, [
    session.userId,
    ...linkedStudentIds,
    ...requesterIds,
  ]);

  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const studentMap = Object.fromEntries(
    linkedStudentIds.map((id) => [id, profileMap[id]?.display_name || profileMap[id]?.email || 'Student'])
  );
  const requesterMap = Object.fromEntries(
    requesterIds.map((id) => [id, { id, name: profileMap[id]?.display_name || profileMap[id]?.email || 'Requester' }])
  );
  const classPrimaryCoach = Object.fromEntries(classes.map((c) => [c.id, c.coach_id]));

  const enrollments = enrollmentRowList.map((row) => ({
    classId: row.class_id,
    className: classMap[row.class_id] ?? row.class_id,
    studentId: row.student_id,
    studentName: studentMap[row.student_id] ?? 'Student',
  }));

  return (
    <SectionCard
      title="Feedback requests"
      description="Ask your student's coach for additional feedback. An admin reviews the coach's response before it reaches you."
    >
      <FeedbackRequestManager
        mode="requester"
        currentUserId={session.userId}
        currentUserRole="parent"
        initialRequests={requestRows}
        enrollments={enrollments}
        classMap={classMap}
        studentMap={studentMap}
        requesterMap={requesterMap}
        adminMap={{}}
        coachMap={{}}
        classPrimaryCoach={classPrimaryCoach}
      />
    </SectionCard>
  );
}
