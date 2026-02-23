export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import CoachAttendanceEditor from '@/app/portal/_components/CoachAttendanceEditor';
import { requireRole } from '@/lib/portal/auth';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { classTypeLabel, formatClassSchedule } from '@/lib/portal/labels';
import { getSessionDateForClassTimezone } from '@/lib/portal/time';

type EnrollmentStudentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'student_id'>;
type AttendanceRow = Pick<
  Database['public']['Tables']['attendance_records']['Row'],
  'student_id' | 'status' | 'camera_on' | 'marked_at'
>;
type AbsenceStudentRow = Pick<Database['public']['Tables']['student_absences']['Row'], 'student_id'>;
type AttendanceStudentProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'display_name' | 'email'>;

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
  if (classRow.coach_id !== session.userId) notFound();

  const sessionDate = getSessionDateForClassTimezone(classRow.timezone);

  const [{ data: enrollmentsData }, { data: attendanceRowsData }, { data: absencesData }] = await Promise.all([
    supabase.from('enrollments').select('student_id').eq('class_id', classId).eq('status', 'active'),
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
  const { data: profilesData } = studentIds.length
    ? await supabase.from('profiles').select('id,display_name,email').in('id', studentIds)
    : { data: [] as Array<{ id: string; display_name: string | null; email: string }> };
  const profiles = (profilesData ?? []) as AttendanceStudentProfile[];

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
      description={`${classTypeLabel[classRow.type as keyof typeof classTypeLabel] || String(classRow.type)} • ${formatClassSchedule(
        classRow.schedule_day,
        classRow.schedule_start_time,
        classRow.schedule_end_time
      )} (${classRow.timezone})`}
    >
      <CoachAttendanceEditor
        classId={classId}
        userId={session.userId}
        initialSessionDate={sessionDate}
        students={profiles}
        initialAttendance={attendanceByStudent}
        initialAbsenceStudentIds={absences.map((row) => row.student_id)}
      />
    </SectionCard>
  );
}
