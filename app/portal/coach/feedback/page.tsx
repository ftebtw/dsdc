export const dynamic = 'force-dynamic';

import CoachFeedbackTabs from '@/app/portal/_components/CoachFeedbackTabs';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import WeeklyFeedbackManager, {
  type WeeklyFeedbackClassOption,
  type WeeklyFeedbackEntry,
} from '@/app/portal/_components/WeeklyFeedbackManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachFeedbackPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();

  // ---- REQUESTS TAB DATA (unchanged from previous page) ----
  const { data: rows } = await (supabase as any)
    .from('feedback_requests')
    .select('*')
    .order('updated_at', { ascending: false });
  const requestRows = (rows ?? []) as Array<any>;

  const requestClassIds = [...new Set(requestRows.map((r) => r.class_id))];
  const requestStudentIds = [...new Set(requestRows.map((r) => r.student_id))];
  const requesterIds = [...new Set(requestRows.map((r) => r.requested_by))];

  const { data: requestClassesData } = requestClassIds.length
    ? await supabase.from('classes').select('id,name,coach_id').in('id', requestClassIds)
    : { data: [] as Array<{ id: string; name: string; coach_id: string | null }> };
  const requestClasses = (requestClassesData ?? []) as Array<{
    id: string;
    name: string;
    coach_id: string | null;
  }>;

  const requestProfileMap = await getProfileMap(supabase, [
    ...requestStudentIds,
    ...requesterIds,
    ...requestClasses.map((c) => c.coach_id).filter((id): id is string => Boolean(id)),
  ]);

  const classMap = Object.fromEntries(requestClasses.map((c) => [c.id, c.name]));
  const studentMap = Object.fromEntries(
    requestStudentIds.map((id) => [
      id,
      requestProfileMap[id]?.display_name || requestProfileMap[id]?.email || 'Student',
    ])
  );
  const requesterMap = Object.fromEntries(
    requesterIds.map((id) => [
      id,
      {
        id,
        name: requestProfileMap[id]?.display_name || requestProfileMap[id]?.email || 'Requester',
      },
    ])
  );
  const coachMap = Object.fromEntries(
    requestClasses
      .map((c) => c.coach_id)
      .filter((id): id is string => Boolean(id))
      .map((id) => [
        id,
        requestProfileMap[id]?.display_name || requestProfileMap[id]?.email || 'Coach',
      ])
  );
  const classPrimaryCoach = Object.fromEntries(requestClasses.map((c) => [c.id, c.coach_id]));

  // ---- WEEKLY FEEDBACK TAB DATA ----
  // RLS scopes classes to those the coach is on the team for; we further hide
  // archived classes so old classes don't clutter the picker.
  const [{ data: primaryClassesData }, { data: coCoachRowsData }] = await Promise.all([
    (supabase as any)
      .from('classes')
      .select('id,name,archived_at')
      .eq('coach_id', session.userId)
      .order('name', { ascending: true }),
    supabase.from('class_coaches').select('class_id').eq('coach_id', session.userId),
  ]);
  const primaryClasses = (primaryClassesData ?? []) as Array<{
    id: string;
    name: string;
    archived_at: string | null;
  }>;
  const coCoachIds = [
    ...new Set(((coCoachRowsData ?? []) as Array<{ class_id: string }>).map((r) => r.class_id)),
  ];
  const { data: coCoachClassesData } = coCoachIds.length
    ? await (supabase as any)
        .from('classes')
        .select('id,name,archived_at')
        .in('id', coCoachIds)
    : { data: [] as Array<{ id: string; name: string; archived_at: string | null }> };
  const coCoachClasses = (coCoachClassesData ?? []) as Array<{
    id: string;
    name: string;
    archived_at: string | null;
  }>;

  const feedbackClassOptions: WeeklyFeedbackClassOption[] = [
    ...new Map(
      [...primaryClasses, ...coCoachClasses]
        .filter((c) => !c.archived_at)
        .map((c) => [c.id, { id: c.id, name: c.name }] as const)
    ).values(),
  ];

  // Preload the active-roster and recent feedback entries for those classes so
  // the manager renders instantly instead of firing a fetch per click.
  const feedbackClassIds = feedbackClassOptions.map((c) => c.id);

  const { data: enrollmentsData } = feedbackClassIds.length
    ? await supabase
        .from('enrollments')
        .select('class_id,student_id,status')
        .in('class_id', feedbackClassIds)
        .in('status', ['active', 'completed'])
    : { data: [] as Array<{ class_id: string; student_id: string; status: string }> };
  const enrollments = (enrollmentsData ?? []) as Array<{
    class_id: string;
    student_id: string;
    status: string;
  }>;

  const rosterStudentIds = [...new Set(enrollments.map((e) => e.student_id))];
  const rosterProfileMap = await getProfileMap(supabase, rosterStudentIds);

  const rosterByClass: Record<
    string,
    Array<{ studentId: string; studentName: string; studentEmail: string }>
  > = {};
  for (const row of enrollments) {
    // Skip enrollments whose student profile was deleted — otherwise they
    // render as a ghost "Student" row on the form and cause a foreign-key
    // error when the coach submits feedback for them.
    if (!rosterProfileMap[row.student_id]) continue;
    (rosterByClass[row.class_id] ??= []).push({
      studentId: row.student_id,
      studentName:
        rosterProfileMap[row.student_id]?.display_name ||
        rosterProfileMap[row.student_id]?.email ||
        'Student',
      studentEmail: rosterProfileMap[row.student_id]?.email || '',
    });
  }

  const { data: existingFeedbackData } = feedbackClassIds.length
    ? await (supabase as any)
        .from('class_feedback')
        .select('id,class_id,session_date,general_feedback,coach_id,updated_at')
        .in('class_id', feedbackClassIds)
        .order('session_date', { ascending: false })
        .order('updated_at', { ascending: false })
    : { data: [] as any[] };
  const existingFeedback = (existingFeedbackData ?? []) as Array<{
    id: string;
    class_id: string;
    session_date: string;
    general_feedback: string | null;
    coach_id: string;
    updated_at: string;
  }>;

  const feedbackIds = existingFeedback.map((f) => f.id);
  const { data: individualData } = feedbackIds.length
    ? await (supabase as any)
        .from('class_feedback_individual')
        .select('class_feedback_id,student_id,feedback')
        .in('class_feedback_id', feedbackIds)
    : { data: [] as any[] };
  const individualByFeedback: Record<string, Array<{ studentId: string; feedback: string }>> = {};
  for (const row of (individualData ?? []) as Array<{
    class_feedback_id: string;
    student_id: string;
    feedback: string;
  }>) {
    (individualByFeedback[row.class_feedback_id] ??= []).push({
      studentId: row.student_id,
      feedback: row.feedback,
    });
  }

  const weeklyEntries: WeeklyFeedbackEntry[] = existingFeedback.map((row) => ({
    id: row.id,
    classId: row.class_id,
    sessionDate: row.session_date,
    generalFeedback: row.general_feedback ?? '',
    individual: individualByFeedback[row.id] ?? [],
    updatedAt: row.updated_at,
  }));

  return (
    <CoachFeedbackTabs
      requestsSlot={
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
      }
      weeklySlot={
        <WeeklyFeedbackManager
          classes={feedbackClassOptions}
          rosterByClass={rosterByClass}
          initialEntries={weeklyEntries}
        />
      }
    />
  );
}
