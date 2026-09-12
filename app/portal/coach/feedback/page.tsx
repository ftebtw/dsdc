export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachFeedbackPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();

  const { data: rows } = await (supabase as any)
    .from('feedback_requests')
    .select('*')
    .order('updated_at', { ascending: false });
  const requestRows = (rows ?? []) as Array<any>;

  const classIds = [...new Set(requestRows.map((r) => r.class_id))];
  const studentIds = [...new Set(requestRows.map((r) => r.student_id))];
  const requesterIds = [...new Set(requestRows.map((r) => r.requested_by))];

  const { data: classesData } = classIds.length
    ? await supabase.from('classes').select('id,name,coach_id').in('id', classIds)
    : { data: [] as Array<{ id: string; name: string; coach_id: string | null }> };
  const classes = (classesData ?? []) as Array<{ id: string; name: string; coach_id: string | null }>;

  const profileMap = await getProfileMap(supabase, [
    ...studentIds,
    ...requesterIds,
    ...classes.map((c) => c.coach_id).filter((id): id is string => Boolean(id)),
  ]);

  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const studentMap = Object.fromEntries(
    studentIds.map((id) => [id, profileMap[id]?.display_name || profileMap[id]?.email || 'Student'])
  );
  const requesterMap = Object.fromEntries(
    requesterIds.map((id) => [id, { id, name: profileMap[id]?.display_name || profileMap[id]?.email || 'Requester' }])
  );
  const coachMap = Object.fromEntries(
    classes
      .map((c) => c.coach_id)
      .filter((id): id is string => Boolean(id))
      .map((id) => [id, profileMap[id]?.display_name || profileMap[id]?.email || 'Coach'])
  );
  const classPrimaryCoach = Object.fromEntries(classes.map((c) => [c.id, c.coach_id]));

  return (
    <SectionCard
      title="Feedback requests"
      description="Requests from students and parents for feedback on their class. Your response goes to an admin for review before it reaches the family."
    >
      <FeedbackRequestManager
        mode="coach"
        currentUserId={session.userId}
        currentUserRole={session.profile.role as 'coach' | 'ta'}
        initialRequests={requestRows}
        classMap={classMap}
        studentMap={studentMap}
        requesterMap={requesterMap}
        adminMap={{}}
        coachMap={coachMap}
        classPrimaryCoach={classPrimaryCoach}
      />
    </SectionCard>
  );
}
