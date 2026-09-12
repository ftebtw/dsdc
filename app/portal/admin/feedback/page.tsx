export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminFeedbackPage() {
  const session = await requireRole(['admin']);
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
      title="Feedback review queue"
      description="Coach responses waiting for review. Approve to send to the family, or bounce back with notes."
    >
      <FeedbackRequestManager
        mode="admin"
        currentUserId={session.userId}
        currentUserRole="admin"
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
