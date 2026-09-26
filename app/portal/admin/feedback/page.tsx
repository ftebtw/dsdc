export const dynamic = 'force-dynamic';

import AdminFeedbackTabs from '@/app/portal/_components/AdminFeedbackTabs';
import AdminWeeklyFeedbackReview, {
  type AdminWeeklyFeedbackEntry,
} from '@/app/portal/_components/AdminWeeklyFeedbackReview';
import AdminWeeklyFeedbackHistory, {
  type HistoryFeedbackRow,
} from '@/app/portal/_components/AdminWeeklyFeedbackHistory';
import FeedbackRequestManager from '@/app/portal/_components/FeedbackRequestManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminFeedbackPage() {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  // ---- REQUESTS DATA ----
  const { data: requestRowsData } = await (supabase as any)
    .from('feedback_requests')
    .select('*')
    .order('updated_at', { ascending: false });
  const requestRows = (requestRowsData ?? []) as Array<any>;

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

  const requestClassMap = Object.fromEntries(requestClasses.map((c) => [c.id, c.name]));
  const requestStudentMap = Object.fromEntries(
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
  const requestCoachMap = Object.fromEntries(
    requestClasses
      .map((c) => c.coach_id)
      .filter((id): id is string => Boolean(id))
      .map((id) => [
        id,
        requestProfileMap[id]?.display_name || requestProfileMap[id]?.email || 'Coach',
      ])
  );
  const requestClassPrimaryCoach = Object.fromEntries(
    requestClasses.map((c) => [c.id, c.coach_id])
  );

  // ---- WEEKLY FEEDBACK DATA (all rows regardless of status) ----
  const { data: weeklyRowsData } = await (supabase as any)
    .from('class_feedback')
    .select(
      'id,class_id,session_date,general_feedback,status,coach_id,updated_at,reviewed_at,admin_rejection_notes'
    )
    .order('session_date', { ascending: false })
    .order('updated_at', { ascending: false });
  const weeklyRows = (weeklyRowsData ?? []) as Array<{
    id: string;
    class_id: string;
    session_date: string;
    general_feedback: string | null;
    status: 'pending_admin' | 'approved' | 'rejected';
    coach_id: string;
    updated_at: string;
    reviewed_at: string | null;
    admin_rejection_notes: string | null;
  }>;

  const weeklyFeedbackIds = weeklyRows.map((r) => r.id);
  const { data: individualRowsData } = weeklyFeedbackIds.length
    ? await (supabase as any)
        .from('class_feedback_individual')
        .select('class_feedback_id,student_id,feedback')
        .in('class_feedback_id', weeklyFeedbackIds)
    : { data: [] as any[] };
  const individualByFeedback = new Map<
    string,
    Array<{ studentId: string; feedback: string }>
  >();
  for (const row of (individualRowsData ?? []) as Array<{
    class_feedback_id: string;
    student_id: string;
    feedback: string;
  }>) {
    const list = individualByFeedback.get(row.class_feedback_id) ?? [];
    list.push({ studentId: row.student_id, feedback: row.feedback });
    individualByFeedback.set(row.class_feedback_id, list);
  }

  const weeklyClassIds = [...new Set(weeklyRows.map((r) => r.class_id))];
  const weeklyCoachIds = [...new Set(weeklyRows.map((r) => r.coach_id))];
  const weeklyStudentIds = [
    ...new Set(
      Array.from(individualByFeedback.values())
        .flatMap((rows) => rows.map((r) => r.studentId))
    ),
  ];

  const { data: weeklyClassesData } = weeklyClassIds.length
    ? await supabase.from('classes').select('id,name').in('id', weeklyClassIds)
    : { data: [] as Array<{ id: string; name: string }> };
  const weeklyClassMap = Object.fromEntries(
    ((weeklyClassesData ?? []) as Array<{ id: string; name: string }>).map((c) => [c.id, c.name])
  );

  const weeklyProfileMap = await getProfileMap(supabase, [
    ...weeklyCoachIds,
    ...weeklyStudentIds,
  ]);
  const nameFor = (id: string, fallback: string) =>
    weeklyProfileMap[id]?.display_name || weeklyProfileMap[id]?.email || fallback;

  const buildEntry = (
    row: (typeof weeklyRows)[number]
  ): AdminWeeklyFeedbackEntry => ({
    id: row.id,
    classId: row.class_id,
    className: weeklyClassMap[row.class_id] || 'Class',
    coachId: row.coach_id,
    coachName: nameFor(row.coach_id, 'Coach'),
    sessionDate: row.session_date,
    generalFeedback: row.general_feedback ?? '',
    individual: (individualByFeedback.get(row.id) ?? []).map((r) => ({
      studentId: r.studentId,
      studentName: nameFor(r.studentId, 'Student'),
      feedback: r.feedback,
    })),
    status: row.status,
    reviewedAt: row.reviewed_at,
    rejectionNotes: row.admin_rejection_notes,
    updatedAt: row.updated_at,
  });

  const pendingEntries = weeklyRows.filter((r) => r.status === 'pending_admin').map(buildEntry);

  const historyRows: HistoryFeedbackRow[] = weeklyRows.map(buildEntry);
  const historyStudents = weeklyStudentIds
    .map((id) => ({ id, name: nameFor(id, 'Student') }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const historyClasses = weeklyClassIds
    .map((id) => ({ id, name: weeklyClassMap[id] || 'Class' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AdminFeedbackTabs
      pendingRequestsCount={requestRows.filter((r) => r.status === 'pending_admin').length}
      pendingWeeklyCount={pendingEntries.length}
      requestsSlot={
        <FeedbackRequestManager
          mode="admin"
          currentUserId={session.userId}
          currentUserRole="admin"
          initialRequests={requestRows}
          classMap={requestClassMap}
          studentMap={requestStudentMap}
          requesterMap={requesterMap}
          adminMap={{}}
          coachMap={requestCoachMap}
          classPrimaryCoach={requestClassPrimaryCoach}
        />
      }
      weeklyReviewSlot={<AdminWeeklyFeedbackReview initialEntries={pendingEntries} />}
      historySlot={
        <AdminWeeklyFeedbackHistory
          entries={historyRows}
          students={historyStudents}
          classes={historyClasses}
        />
      }
    />
  );
}
