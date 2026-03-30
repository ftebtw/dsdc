export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import CoachAttendanceEditor from '@/app/portal/_components/CoachAttendanceEditor';
import { requireRole } from '@/lib/portal/auth';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { classTypeLabel } from '@/lib/portal/labels';
import { getSessionDateForClassTimezone, formatClassScheduleForViewer } from '@/lib/portal/time';

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
  const todaySessionDate = getSessionDateForClassTimezone(classRow.timezone);
  let restrictedSessionDates: string[] = [];

  // Allow primary coach, co-coaches, accepted subs, and accepted TAs.
  if (classRow.coach_id !== session.userId) {
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

  const sessionDate =
    restrictedSessionDates.length > 0
      ? pickInitialSessionDate(todaySessionDate, restrictedSessionDates)
      : todaySessionDate;

  const [{ data: enrollmentsData }, { data: attendanceRowsData }, { data: absencesData }] = await Promise.all([
    supabase.from('enrollments').select('student_id').eq('class_id', classId),
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

  return (
    <SectionCard
      title={`Attendance • ${classRow.name}`}
      description={`${classTypeLabel[classRow.type as keyof typeof classTypeLabel] || String(classRow.type)} • ${formatClassScheduleForViewer(
        classRow.schedule_day,
        classRow.schedule_start_time,
        classRow.schedule_end_time,
        classRow.timezone,
        session.profile.timezone
      )}`}
    >
      <CoachAttendanceEditor
        classId={classId}
        userId={session.userId}
        initialSessionDate={sessionDate}
        students={profiles}
        initialAttendance={attendanceByStudent}
        initialAbsenceStudentIds={absences.map((row) => row.student_id)}
        restrictedSessionDates={restrictedSessionDates}
      />
    </SectionCard>
  );
}
