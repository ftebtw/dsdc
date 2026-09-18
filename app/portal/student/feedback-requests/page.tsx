export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import WeeklyFeedbackList, {
  type WeeklyFeedbackListRow,
} from '@/app/portal/_components/WeeklyFeedbackList';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentFeedbackPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();

  const [{ data: enrollmentRows }, { data: rows }] = await Promise.all([
    supabase
      .from('enrollments')
      .select('class_id')
      .eq('student_id', session.userId)
      .in('status', ['active', 'completed']),
    (supabase as any)
      .from('feedback_requests')
      .select('*')
      .order('updated_at', { ascending: false }),
  ]);

  const classIds = [...new Set(((enrollmentRows ?? []) as Array<{ class_id: string }>).map((r) => r.class_id))];
  const { data: classesData } = classIds.length
    ? await supabase.from('classes').select('id,name,coach_id').in('id', classIds)
    : { data: [] as Array<{ id: string; name: string; coach_id: string | null }> };
  const classes = (classesData ?? []) as Array<{ id: string; name: string; coach_id: string | null }>;

  const requestRows = (rows ?? []) as Array<any>;
  const requesterIds = [...new Set(requestRows.map((r) => r.requested_by))];
  const profileMap = await getProfileMap(supabase, [session.userId, ...requesterIds]);

  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const studentDisplayName =
    profileMap[session.userId]?.display_name || profileMap[session.userId]?.email || 'You';
  const studentMap = { [session.userId]: studentDisplayName };
  const requesterMap = Object.fromEntries(
    requesterIds.map((id) => [id, { id, name: profileMap[id]?.display_name || profileMap[id]?.email || 'Requester' }])
  );
  const classPrimaryCoach = Object.fromEntries(classes.map((c) => [c.id, c.coach_id]));

  const enrollments = classes.map((c) => ({
    classId: c.id,
    className: c.name,
    studentId: session.userId,
    studentName: 'You',
  }));

  // Weekly class feedback for this student. RLS scopes both queries.
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
  const { data: individualRowsData } = feedbackIds.length
    ? await (supabase as any)
        .from('class_feedback_individual')
        .select('class_feedback_id,student_id,feedback')
        .in('class_feedback_id', feedbackIds)
        .eq('student_id', session.userId)
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
      studentName: studentDisplayName,
      feedback: r.feedback,
    })),
  }));

  return (
    <div className="space-y-6">
      <SectionCard
        title="Feedback"
        description="Weekly feedback your coach has posted for your classes. Personal notes are only visible to you."
      >
        <WeeklyFeedbackList
          entries={weeklyEntries}
          emptyMessage="No weekly feedback yet. Your coach will post here after each class."
        />
      </SectionCard>
      <SectionCard
        title="Request additional feedback"
        description="Need more from your coach on a specific class? Send a request — an admin reviews the coach's response before it reaches you."
      >
        <FeedbackRequestManager
          mode="requester"
          currentUserId={session.userId}
          currentUserRole="student"
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
