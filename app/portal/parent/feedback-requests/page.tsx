export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import WeeklyFeedbackList, {
  type WeeklyFeedbackListRow,
} from '@/app/portal/_components/WeeklyFeedbackList';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentFeedbackPage() {
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

  // Weekly class feedback: general blocks for every class this parent's kids
  // are in, plus per-student personal notes for those kids. RLS enforces
  // scoping; we still send student_id filter to keep the payload small.
  const { data: weeklyRowsData } = classIds.length
    ? await (supabase as any)
        .from('class_feedback')
        .select('id,class_id,session_date,general_feedback,updated_at')
        .in('class_id', classIds)
        .order('session_date', { ascending: false })
    : { data: [] as any[] };
  const weeklyRows = (weeklyRowsData ?? []) as Array<{
    id: string;
    class_id: string;
    session_date: string;
    general_feedback: string | null;
    updated_at: string;
  }>;

  const feedbackIds = weeklyRows.map((r) => r.id);
  const { data: individualRowsData } = feedbackIds.length && linkedStudentIds.length
    ? await (supabase as any)
        .from('class_feedback_individual')
        .select('class_feedback_id,student_id,feedback')
        .in('class_feedback_id', feedbackIds)
        .in('student_id', linkedStudentIds)
    : { data: [] as any[] };
  const individualByFeedback = new Map<string, Array<{ studentId: string; feedback: string }>>();
  for (const row of (individualRowsData ?? []) as Array<{
    class_feedback_id: string;
    student_id: string;
    feedback: string;
  }>) {
    const list = individualByFeedback.get(row.class_feedback_id) ?? [];
    list.push({ studentId: row.student_id, feedback: row.feedback });
    individualByFeedback.set(row.class_feedback_id, list);
  }

  const weeklyEntries: WeeklyFeedbackListRow[] = weeklyRows.map((row) => ({
    id: row.id,
    classId: row.class_id,
    className: classMap[row.class_id] ?? 'Class',
    sessionDate: row.session_date,
    generalFeedback: row.general_feedback,
    individual: (individualByFeedback.get(row.id) ?? []).map((r) => ({
      studentId: r.studentId,
      studentName: studentMap[r.studentId] ?? 'Your student',
      feedback: r.feedback,
    })),
  }));

  return (
    <div className="space-y-6">
      <SectionCard
        title="Feedback"
        description="Weekly feedback the coach has posted for your student's classes. Personal notes are only visible to that student's household."
      >
        <WeeklyFeedbackList
          entries={weeklyEntries}
          emptyMessage="No weekly feedback yet. The coach will post here after each class."
        />
      </SectionCard>
      <SectionCard
        title="Request additional feedback"
        description="Need more from the coach on a specific class? Send a request — an admin reviews the coach's response before it reaches you."
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
    </div>
  );
}
