import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getActiveTerm, getProfileMap } from '@/lib/portal/data';
import {
  formatUtcForUser,
  getSessionDateForClassTimezone,
  isClassInDateRange,
  isClassToday,
} from '@/lib/portal/time';

export default async function AdminDashboardPage() {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const activeTerm = await getActiveTerm(supabase);

  const [
    { data: activeEnrollmentsData },
    { data: legalDocumentsData },
    { data: reportCardsData },
    { data: legalSignaturesData },
    { data: profilesData },
  ] = await Promise.all([
    supabase.from('enrollments').select('student_id').eq('status', 'active'),
    supabase.from('legal_documents').select('id,required_for'),
    supabase.from('report_cards').select('id').in('status', ['draft', 'submitted']),
    supabase.from('legal_signatures').select('document_id,signer_id,signer_role,signed_for_student_id'),
    supabase.from('profiles').select('id,role').in('role', ['student', 'coach', 'ta']),
  ]);
  const activeEnrollments = (activeEnrollmentsData ?? []) as any[];
  const legalDocuments = (legalDocumentsData ?? []) as any[];
  const reportCards = (reportCardsData ?? []) as any[];
  const legalSignatures = (legalSignaturesData ?? []) as any[];
  const profiles = (profilesData ?? []) as any[];

  const activeStudentsCount = new Set(activeEnrollments.map((row: any) => row.student_id)).size;

  const activeClasses = activeTerm
    ? (((await supabase.from('classes').select('*').eq('term_id', activeTerm.id)).data ?? []) as any[])
    : ([] as any[]);

  const classesToday = activeTerm
    ? activeClasses.filter((classRow) => isClassInDateRange(activeTerm, new Date()) && isClassToday(classRow))
    : [];

  const checkinsToday = await Promise.all(
    classesToday.map(async (classRow) => {
      const sessionDate = getSessionDateForClassTimezone(classRow.timezone);
      const { data } = await supabase
        .from('coach_checkins')
        .select('*')
        .eq('class_id', classRow.id)
        .eq('coach_id', classRow.coach_id)
        .eq('session_date', sessionDate)
        .maybeSingle();
      return {
        classId: classRow.id,
        className: classRow.name,
        coachId: classRow.coach_id,
        checkedInAt: data?.checked_in_at ?? null,
      };
    })
  );

  const coachIds = [...new Set(checkinsToday.map((row) => row.coachId))];
  const coachMap = await getProfileMap(supabase, coachIds);

  const checkinRows = ((await supabase
    .from('coach_checkins')
    .select('id,coach_id,class_id,checked_in_at,session_date')
    .order('checked_in_at', { ascending: false })
    .limit(10)).data ?? []) as any[];

  const attendanceRows = ((await supabase
    .from('attendance_records')
    .select('id,class_id,student_id,status,marked_at,marked_by,session_date')
    .order('marked_at', { ascending: false })
    .limit(10)).data ?? []) as any[];

  const classIdsForActivity = [
    ...new Set([...checkinRows.map((row) => row.class_id), ...attendanceRows.map((row) => row.class_id)]),
  ];
  const studentIdsForActivity = [...new Set(attendanceRows.map((row) => row.student_id))];
  const markerIds = [...new Set(attendanceRows.map((row) => row.marked_by))];

  const classMap = Object.fromEntries(
    (
      classIdsForActivity.length
        ? (((await supabase.from('classes').select('id,name').in('id', classIdsForActivity)).data ?? []) as any[])
        : []
    ).map((row: any) => [row.id, row])
  );
  const studentMap = await getProfileMap(supabase, studentIdsForActivity);
  const markerMap = await getProfileMap(supabase, markerIds);

  const students = profiles.filter((profile: any) => profile.role === 'student');
  const coaches = profiles.filter((profile: any) => profile.role === 'coach' || profile.role === 'ta');
  const signaturesByDocument = new Map<string, any[]>();
  for (const signature of legalSignatures) {
    const list = signaturesByDocument.get(signature.document_id) ?? [];
    list.push(signature);
    signaturesByDocument.set(signature.document_id, list);
  }

  let pendingLegalSignatures = 0;
  for (const document of legalDocuments) {
    const documentSignatures = signaturesByDocument.get(document.id) ?? [];
    if (document.required_for === 'all_coaches') {
      const signedCoachIds = new Set(
        documentSignatures
          .filter((signature: any) => signature.signer_role === 'coach' || signature.signer_role === 'ta')
          .map((signature: any) => signature.signer_id)
      );
      pendingLegalSignatures += Math.max(0, coaches.length - signedCoachIds.size);
      continue;
    }

    const signedStudentIds = new Set<string>();
    for (const signature of documentSignatures) {
      if (signature.signer_role === 'student') {
        signedStudentIds.add(signature.signer_id);
      } else if (signature.signer_role === 'parent' && signature.signed_for_student_id) {
        signedStudentIds.add(signature.signed_for_student_id);
      }
    }
    pendingLegalSignatures += Math.max(0, students.length - signedStudentIds.size);
  }

  const checkinsCompletedCount = checkinsToday.filter((row) => row.checkedInAt).length;

  return (
    <div className="space-y-6">
      <SectionCard title="Admin Dashboard" description="Operational snapshot for the active term.">
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Active students</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{activeStudentsCount}</p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Active classes</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{activeClasses.length}</p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Today's check-ins</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">
              {checkinsCompletedCount}/{classesToday.length}
            </p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Pending legal signatures</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{pendingLegalSignatures}</p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Pending report cards</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{reportCards.length}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Today's Coach Check-ins" description="Expected coaches and check-in timestamps.">
        {classesToday.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No classes scheduled today in the active term.</p>
        ) : (
          <div className="space-y-2">
            {checkinsToday.map((row) => (
              <div
                key={row.classId}
                className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-3 text-sm"
              >
                <span className="font-medium text-navy-800 dark:text-white">{row.className}</span> •{' '}
                {coachMap[row.coachId]?.display_name || coachMap[row.coachId]?.email || row.coachId} •{' '}
                {row.checkedInAt ? (
                  <span className="text-green-700 dark:text-green-400">
                    {formatUtcForUser(row.checkedInAt, session.profile.timezone)}
                  </span>
                ) : (
                  <span className="text-red-700">Not checked in</span>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Recent Check-ins" description="Last 10 check-in events.">
          <div className="space-y-2 text-sm">
            {checkinRows.length === 0 ? <p className="text-charcoal/70 dark:text-navy-300">No check-ins yet.</p> : null}
            {checkinRows.map((row) => (
              <p key={row.id} className="text-charcoal/80 dark:text-navy-200">
                {formatUtcForUser(row.checked_in_at, session.profile.timezone)} •{' '}
                {classMap[row.class_id]?.name || row.class_id}
              </p>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Attendance Updates" description="Last 10 attendance writes.">
          <div className="space-y-2 text-sm">
            {attendanceRows.length === 0 ? (
              <p className="text-charcoal/70 dark:text-navy-300">No attendance updates yet.</p>
            ) : null}
            {attendanceRows.map((row) => (
              <p key={row.id} className="text-charcoal/80 dark:text-navy-200">
                {formatUtcForUser(row.marked_at, session.profile.timezone)} • {classMap[row.class_id]?.name || row.class_id} •{' '}
                {(studentMap[row.student_id]?.display_name || studentMap[row.student_id]?.email || row.student_id)} •{' '}
                {row.status} • by {markerMap[row.marked_by]?.display_name || markerMap[row.marked_by]?.email || row.marked_by}
              </p>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
