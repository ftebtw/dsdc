import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminNotificationTestTools from '@/app/portal/_components/AdminNotificationTestTools';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getActiveTerm, getProfileMap } from '@/lib/portal/data';
import {
  formatUtcForUser,
  getSessionDateForClassTimezone,
  isClassInDateRange,
  isClassToday,
} from '@/lib/portal/time';
import { fetchPayrollTotalHours } from '@/lib/portal/payroll';
import type { Database } from '@/lib/supabase/database.types';

type EnrollmentStudentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'student_id'>;
type LegalDocumentRow = Pick<Database['public']['Tables']['legal_documents']['Row'], 'id' | 'required_for'>;
type LegalSignatureRow = {
  document_id: string;
  signer_id: string;
  signer_role: string;
  signed_for_student_id?: string | null;
};
type CheckinActivityRow = Pick<
  Database['public']['Tables']['coach_checkins']['Row'],
  'id' | 'coach_id' | 'class_id' | 'checked_in_at' | 'session_date'
>;
type AttendanceActivityRow = Pick<
  Database['public']['Tables']['attendance_records']['Row'],
  'id' | 'class_id' | 'student_id' | 'status' | 'marked_at' | 'marked_by' | 'session_date'
>;
type ActiveClassRow = Pick<
  Database['public']['Tables']['classes']['Row'],
  'id' | 'name' | 'coach_id' | 'schedule_day' | 'timezone'
>;
type TodayCheckinRow = Pick<
  Database['public']['Tables']['coach_checkins']['Row'],
  'class_id' | 'coach_id' | 'session_date' | 'checked_in_at'
>;

export default async function AdminDashboardPage() {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const now = new Date();
  const thisMonthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
  const thisMonthEnd = now.toISOString().slice(0, 10);
  const payrollHoursPromise = fetchPayrollTotalHours(supabase, {
    start: thisMonthStart,
    end: thisMonthEnd,
  });

  const activeTerm = await getActiveTerm(supabase);
  const activeClassesResponse = activeTerm
    ? await supabase
        .from('classes')
        .select('id,name,coach_id,schedule_day,timezone')
        .eq('term_id', activeTerm.id)
    : { data: [] as ActiveClassRow[] };

  const activeClasses = (activeClassesResponse.data ?? []) as ActiveClassRow[];
  const classesToday = activeTerm
    ? activeClasses.filter((classRow) => isClassInDateRange(activeTerm, now) && isClassToday(classRow, now))
    : [];

  const todayExpectations = classesToday.map((classRow) => ({
    classId: classRow.id,
    className: classRow.name,
    coachId: classRow.coach_id,
    sessionDate: getSessionDateForClassTimezone(classRow.timezone, now),
  }));

  const todayClassIds = [...new Set(todayExpectations.map((row) => row.classId))];
  const todayCoachIds = [...new Set(todayExpectations.map((row) => row.coachId))];
  const todaySessionDates = [...new Set(todayExpectations.map((row) => row.sessionDate))];

  const [
    { data: activeEnrollmentsData },
    { data: legalDocumentsData },
    reportCardsCountResponse,
    { data: legalSignaturesData },
    studentCountResponse,
    coachCountResponse,
    openSubRequestsCountResponse,
    openTaRequestsCountResponse,
    pendingPrivateSessionsCountResponse,
    pendingEtransfersCountResponse,
    pendingApprovalsCountResponse,
    { data: checkinRowsData },
    { data: attendanceRowsData },
    { data: todayCheckinsData },
  ] = await Promise.all([
    supabase.from('enrollments').select('student_id').eq('status', 'active'),
    supabase.from('legal_documents').select('id,required_for'),
    supabase.from('report_cards').select('id', { count: 'exact', head: true }).in('status', ['draft', 'submitted']),
    supabase.from('legal_signatures').select('document_id,signer_id,signer_role,signed_for_student_id'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['coach', 'ta']),
    supabase.from('sub_requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('ta_requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('private_sessions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).in('status', ['pending_etransfer', 'etransfer_sent']),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
    supabase
      .from('coach_checkins')
      .select('id,coach_id,class_id,checked_in_at,session_date')
      .order('checked_in_at', { ascending: false })
      .limit(10),
    supabase
      .from('attendance_records')
      .select('id,class_id,student_id,status,marked_at,marked_by,session_date')
      .order('marked_at', { ascending: false })
      .limit(10),
    todayClassIds.length > 0 && todayCoachIds.length > 0 && todaySessionDates.length > 0
      ? supabase
          .from('coach_checkins')
          .select('class_id,coach_id,session_date,checked_in_at')
          .in('class_id', todayClassIds)
          .in('coach_id', todayCoachIds)
          .in('session_date', todaySessionDates)
      : Promise.resolve({ data: [] as TodayCheckinRow[] }),
  ]);

  const activeEnrollments = (activeEnrollmentsData ?? []) as EnrollmentStudentRow[];
  const legalDocuments = (legalDocumentsData ?? []) as LegalDocumentRow[];
  const legalSignatures = (legalSignaturesData ?? []) as LegalSignatureRow[];
  const checkinRows = (checkinRowsData ?? []) as CheckinActivityRow[];
  const attendanceRows = (attendanceRowsData ?? []) as AttendanceActivityRow[];
  const todayCheckins = (todayCheckinsData ?? []) as TodayCheckinRow[];

  const classMap: Record<string, { id: string; name: string }> = Object.fromEntries(
    activeClasses.map((classRow) => [classRow.id, { id: classRow.id, name: classRow.name }])
  );

  const allProfileIds = [
    ...new Set([
      ...todayExpectations.map((row) => row.coachId),
      ...attendanceRows.map((row) => row.student_id),
      ...attendanceRows.map((row) => row.marked_by),
    ]),
  ];
  const profileMap = await getProfileMap(supabase, allProfileIds);

  const todayCheckinMap = new Map<string, { checked_in_at: string | null }>();
  for (const row of todayCheckins) {
    todayCheckinMap.set(`${row.class_id}|${row.coach_id}|${row.session_date}`, {
      checked_in_at: row.checked_in_at ?? null,
    });
  }

  const checkinsToday = todayExpectations.map((row) => ({
    classId: row.classId,
    className: row.className,
    coachId: row.coachId,
    checkedInAt: todayCheckinMap.get(`${row.classId}|${row.coachId}|${row.sessionDate}`)?.checked_in_at ?? null,
  }));

  const reportCardsCount = reportCardsCountResponse.count ?? 0;
  const openSubRequestsCount = openSubRequestsCountResponse.count ?? 0;
  const openTaRequestsCount = openTaRequestsCountResponse.count ?? 0;
  const pendingPrivateSessionsCount = pendingPrivateSessionsCountResponse.count ?? 0;
  const pendingEtransfersCount = pendingEtransfersCountResponse.count ?? 0;
  const pendingApprovalsCount = pendingApprovalsCountResponse.count ?? 0;
  const studentCount = studentCountResponse.count ?? 0;
  const coachCount = coachCountResponse.count ?? 0;
  const activeStudentsCount = new Set(activeEnrollments.map((row) => row.student_id)).size;

  const signaturesByDocument = new Map<string, LegalSignatureRow[]>();
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
          .filter((signature) => signature.signer_role === 'coach' || signature.signer_role === 'ta')
          .map((signature) => signature.signer_id)
      );
      pendingLegalSignatures += Math.max(0, coachCount - signedCoachIds.size);
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
    pendingLegalSignatures += Math.max(0, studentCount - signedStudentIds.size);
  }

  const checkinsCompletedCount = checkinsToday.filter((row) => row.checkedInAt).length;
  const thisMonthPayrollHours = await payrollHoursPromise;

  return (
    <div className="space-y-6">
      <SectionCard title="Admin Dashboard" description="Operational snapshot for the active term.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 auto-rows-fr">
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
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Payroll this month</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{thisMonthPayrollHours.toFixed(2)}h</p>
            <Link href="/portal/admin/payroll?preset=thisMonth" className="text-xs underline text-navy-700 dark:text-navy-200">
              View payroll
            </Link>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Open sub requests</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{openSubRequestsCount}</p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Open TA requests</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{openTaRequestsCount}</p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Pending private sessions</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{pendingPrivateSessionsCount}</p>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Pending E-Transfers</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{pendingEtransfersCount}</p>
            <Link href="/portal/admin/etransfers" className="text-xs underline text-navy-700 dark:text-navy-200">
              Open queue
            </Link>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Pending approvals</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{pendingApprovalsCount}</p>
            <Link href="/portal/admin/pending-approvals" className="text-xs underline text-navy-700 dark:text-navy-200">
              Open queue
            </Link>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Pending report cards</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{reportCardsCount}</p>
            <Link href="/portal/admin/report-cards" className="text-xs underline text-navy-700 dark:text-navy-200">
              Open queue
            </Link>
          </div>
          <div className="rounded-xl bg-warm-50 dark:bg-navy-900 p-4 border border-warm-200 dark:border-navy-600">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Pending legal signatures</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-white">{pendingLegalSignatures}</p>
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
                <span className="font-medium text-navy-800 dark:text-white">{row.className}</span> -{' '}
                {profileMap[row.coachId]?.display_name || profileMap[row.coachId]?.email || row.coachId} -{' '}
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
                {formatUtcForUser(row.checked_in_at, session.profile.timezone)} - {classMap[row.class_id]?.name || row.class_id}
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
                {formatUtcForUser(row.marked_at, session.profile.timezone)} - {classMap[row.class_id]?.name || row.class_id} -{' '}
                {profileMap[row.student_id]?.display_name || profileMap[row.student_id]?.email || row.student_id} - {row.status} -
                by {profileMap[row.marked_by]?.display_name || profileMap[row.marked_by]?.email || row.marked_by}
              </p>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Admin Test Tools" description="Send test notification emails without changing student records.">
        <AdminNotificationTestTools defaultRecipient={session.profile.email} />
      </SectionCard>
    </div>
  );
}
