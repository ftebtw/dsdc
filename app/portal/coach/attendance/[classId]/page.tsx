export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import CoachAttendanceEditor from '@/app/portal/_components/CoachAttendanceEditor';
import { requireRole } from '@/lib/portal/auth';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { classTypeLabel } from '@/lib/portal/labels';
import { getSessionDateForClassTimezone, formatClassScheduleDaysForViewer } from '@/lib/portal/time';

type EnrollmentStudentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'student_id'>;
type AttendanceRow = Pick<
  Database['public']['Tables']['attendance_records']['Row'],
  'student_id' | 'status' | 'camera_on' | 'marked_at'
>;
type AbsenceStudentRow = Pick<Database['public']['Tables']['student_absences']['Row'], 'student_id'>;
type AttendanceStudentProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'display_name' | 'email'>;

function pickInitialSessionDate(today: string, allowedDates: string[]): string {
  const uniqueSorted = [...new Set(allowedDates)].sort();
  if (uniqueSorted.length === 0) return today;

  const firstUpcomingOrToday = uniqueSorted.find((date) => date >= today);
  return firstUpcomingOrToday ?? uniqueSorted[uniqueSorted.length - 1];
}

export default async function CoachAttendancePage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();

  const { data: classRow } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .maybeSingle();

  if (!classRow) notFound();
  const isPrivateSessionGroup = Boolean((classRow as { is_private_session_group?: boolean }).is_private_session_group);
  const classTimezone = classRow.timezone || session.profile.timezone || 'America/Vancouver';
  const todaySessionDate = getSessionDateForClassTimezone(classTimezone);
  let restrictedSessionDates: string[] = [];

  // For private session group classrooms, the allowed dates are pulled from
  // the linked private_sessions rows (since there's no weekly schedule).
  let privateGroupSessionDates: string[] = [];
  if (isPrivateSessionGroup) {
    const { data: groupSessionDates } = await supabase
      .from('private_sessions')
      .select('requested_date')
      .eq('class_id', classId)
      .order('requested_date', { ascending: true });
    privateGroupSessionDates = [
      ...new Set(
        ((groupSessionDates ?? []) as Array<{ requested_date: string }>).map((row) => row.requested_date)
      ),
    ].sort();
  }

  // Allow primary coach, co-coaches, accepted subs, and accepted TAs.
  // Private session groups don't have sub/TA requests, so skip those checks.
  if (classRow.coach_id !== session.userId) {
    if (isPrivateSessionGroup) {
      // No co-coach / sub / TA system for private groups yet — only the
      // primary coach can view attendance.
      notFound();
    }
    const [{ data: coCoach }, { data: subReqs }, { data: taReqs }] = await Promise.all([
      supabase
        .from('class_coaches')
        .select('id')
        .eq('class_id', classId)
        .eq('coach_id', session.userId)
        .maybeSingle(),
      supabase
        .from('sub_requests')
        .select('session_date')
        .eq('class_id', classId)
        .eq('accepting_coach_id', session.userId)
        .eq('status', 'accepted'),
      supabase
        .from('ta_requests')
        .select('session_date')
        .eq('class_id', classId)
        .eq('accepting_ta_id', session.userId)
        .eq('status', 'accepted'),
    ]);

    const acceptedDates = [
      ...((subReqs ?? []) as Array<{ session_date: string }>).map((row) => row.session_date),
      ...((taReqs ?? []) as Array<{ session_date: string }>).map((row) => row.session_date),
    ];

    if (!coCoach && acceptedDates.length === 0) notFound();
    if (!coCoach) {
      restrictedSessionDates = [...new Set(acceptedDates)].sort();
    }
  }

  // For private groups, scope picker to the actual session dates so the
  // coach can't mark attendance for arbitrary days. Falls back to today
  // if there are no sessions yet.
  const allowedDates = isPrivateSessionGroup ? privateGroupSessionDates : restrictedSessionDates;
  const sessionDate =
    allowedDates.length > 0
      ? pickInitialSessionDate(todaySessionDate, allowedDates)
      : todaySessionDate;
  // For private groups, treat the private_sessions dates as the only valid
  // attendance dates so the picker reflects "real" sessions.
  const effectiveRestrictedSessionDates = isPrivateSessionGroup
    ? privateGroupSessionDates
    : restrictedSessionDates;

  const [{ data: enrollmentsData }, { data: attendanceRowsData }, { data: absencesData }] = await Promise.all([
    supabase
      .from('enrollments')
      .select('student_id')
      .eq('class_id', classId)
      .in('status', ['active', 'completed']),
    supabase
      .from('attendance_records')
      .select('student_id,status,camera_on,marked_at')
      .eq('class_id', classId)
      .eq('session_date', sessionDate),
    supabase
      .from('student_absences')
      .select('student_id')
      .eq('class_id', classId)
      .eq('session_date', sessionDate),
  ]);
  const enrollments = (enrollmentsData ?? []) as EnrollmentStudentRow[];
  const attendanceRows = (attendanceRowsData ?? []) as AttendanceRow[];
  const absences = (absencesData ?? []) as AbsenceStudentRow[];

  const studentIds = enrollments.map((item) => item.student_id);
  const admin = getSupabaseAdminClient();
  const { data: profilesData } = studentIds.length
    ? await admin.from('profiles').select('id,display_name,email').in('id', studentIds)
    : { data: [] as Array<{ id: string; display_name: string | null; email: string }> };
  const profileRows = (profilesData ?? []) as AttendanceStudentProfile[];
  const profileById = new Map(profileRows.map((row) => [row.id, row]));
  const profiles = studentIds.map((id) => {
    const profile = profileById.get(id);
    return profile ?? { id, display_name: null, email: id };
  });

  const attendanceByStudent = Object.fromEntries(
    attendanceRows.map((row) => [
      row.student_id,
      {
        status: row.status,
        camera_on: row.camera_on,
        marked_at: row.marked_at,
      },
    ])
  );

  const description = isPrivateSessionGroup
    ? `Private Coaching Group${
        privateGroupSessionDates.length > 0
          ? ` • ${privateGroupSessionDates.length} session${privateGroupSessionDates.length === 1 ? '' : 's'} on record`
          : ''
      }`
    : `${classTypeLabel[classRow.type as keyof typeof classTypeLabel] || String(classRow.type)} • ${formatClassScheduleDaysForViewer(
        (classRow as { schedule_days?: string[] | null }).schedule_days ?? null,
        classRow.schedule_day,
        classRow.schedule_start_time,
        classRow.schedule_end_time,
        classRow.timezone,
        session.profile.timezone
      )}`;

  return (
    <SectionCard title={`Attendance • ${classRow.name}`} description={description}>
      <CoachAttendanceEditor
        classId={classId}
        userId={session.userId}
        initialSessionDate={sessionDate}
        students={profiles}
        initialAttendance={attendanceByStudent}
        initialAbsenceStudentIds={absences.map((row) => row.student_id)}
        restrictedSessionDates={effectiveRestrictedSessionDates}
      />
    </SectionCard>
  );
}
