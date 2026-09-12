export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentFeedbackRequestsPage() {
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
  const studentMap = { [session.userId]: profileMap[session.userId]?.display_name || profileMap[session.userId]?.email || 'You' };
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

  return (
    <SectionCard
      title="Feedback requests"
      description="Ask your coach for additional feedback. An admin reviews the coach's response before it reaches you."
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
  );
}
