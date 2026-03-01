export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import CoachAttendanceEditor from '@/app/portal/_components/CoachAttendanceEditor';
import CoachResourceManager from '@/app/portal/_components/CoachResourceManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { classTypeLabel } from '@/lib/portal/labels';
import { getSessionDateForClassTimezone, formatClassScheduleForViewer } from '@/lib/portal/time';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type AttendanceRow = Database['public']['Tables']['attendance_records']['Row'];
type AttendanceStatus = Database['public']['Enums']['attendance_status'];
type EnrollmentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'student_id' | 'status'>;
type CancellationRow = Database['public']['Tables']['class_cancellations']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export default async function AdminClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { classId } = await params;
  const query = await searchParams;
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const { data: classRow } = await supabase.from('classes').select('*').eq('id', classId).maybeSingle();
  if (!classRow) notFound();

  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select('student_id,status')
    .eq('class_id', classId);
  const enrollments = (enrollmentsData ?? []) as EnrollmentRow[];
  const activeStudentIds = enrollments.filter((item) => item.status === 'active').map((item) => item.student_id);

  const profileMap = await getProfileMap(supabase, [classRow.coach_id, ...enrollments.map((item) => item.student_id)]);

  const { data: coCoachData } = await supabase.from('class_coaches').select('coach_id').eq('class_id', classId);
  const coCoachIds = (coCoachData ?? []).map((row: { coach_id: string }) => row.coach_id);
  if (coCoachIds.length) {
    const coCoachMap = await getProfileMap(supabase, coCoachIds);
    Object.assign(profileMap, coCoachMap);
  }

  const selectedDate = query.date || getSessionDateForClassTimezone(classRow.timezone);

  const [{ data: attendanceForDateData }, { data: absencesForDateData }] = await Promise.all([
    supabase
      .from('attendance_records')
      .select('student_id,status,camera_on,marked_at')
      .eq('class_id', classId)
      .eq('session_date', selectedDate),
    supabase
      .from('student_absences')
      .select('student_id')
      .eq('class_id', classId)
      .eq('session_date', selectedDate),
  ]);

  const attendanceForDate = (attendanceForDateData ?? []) as Array<
    Pick<AttendanceRow, 'student_id' | 'status' | 'camera_on' | 'marked_at'>
  >;
  const attendanceByStudent = Object.fromEntries(
    attendanceForDate.map((row) => [
      row.student_id,
      {
        status: row.status,
        camera_on: row.camera_on,
        marked_at: row.marked_at,
      },
    ])
  );

  const { data: allAttendanceData } = await supabase
    .from('attendance_records')
    .select('student_id,session_date,status,camera_on')
    .eq('class_id', classId)
    .order('session_date', { ascending: false });
  const allAttendance = (allAttendanceData ?? []) as Array<
    Pick<AttendanceRow, 'student_id' | 'session_date' | 'status' | 'camera_on'>
  >;

  const attendanceByDate = new Map<string, typeof allAttendance>();
  for (const row of allAttendance) {
    const dateStr = String(row.session_date);
    const list = attendanceByDate.get(dateStr) ?? [];
    list.push(row);
    attendanceByDate.set(dateStr, list);
  }
  const sortedDates = [...attendanceByDate.keys()].sort().reverse();

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  const { data: cancellationsData } = await supabase
    .from('class_cancellations')
    .select('*')
    .eq('class_id', classId)
    .order('cancellation_date', { ascending: false });
  const cancellations = (cancellationsData ?? []) as CancellationRow[];

  const studentProfiles = activeStudentIds
    .map((id) => profileMap[id])
    .filter((profile): profile is ProfileRow => Boolean(profile))
    .map((profile) => ({
      id: profile.id,
      display_name: profile.display_name,
      email: profile.email,
    }));

  const coachName = classRow.coach_id
    ? profileMap[classRow.coach_id]?.display_name || profileMap[classRow.coach_id]?.email || classRow.coach_id
    : 'Unassigned';

  const statusClass: Record<AttendanceStatus, string> = {
    present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    late: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    sick: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    makeup: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title={classRow.name}
        description={`${
          classTypeLabel[classRow.type as keyof typeof classTypeLabel] || classRow.type
        } - ${formatClassScheduleForViewer(
          classRow.schedule_day,
          classRow.schedule_start_time,
          classRow.schedule_end_time,
          classRow.timezone,
          session.profile.timezone
        )}`}
      >
        <div className="grid gap-2 text-sm text-charcoal/75 dark:text-navy-300">
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Coach:</span> {coachName}
          </p>
          {coCoachIds.length > 0 ? (
            <p>
              <span className="font-medium text-navy-800 dark:text-white">Co-coaches:</span>{' '}
              {coCoachIds
                .map((id: string) => profileMap[id]?.display_name || profileMap[id]?.email || id)
                .join(', ')}
            </p>
          ) : null}
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Zoom:</span>{' '}
            {classRow.zoom_link ? (
              <a
                href={classRow.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline break-all"
              >
                {classRow.zoom_link}
              </a>
            ) : (
              'Not set'
            )}
          </p>
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Max students:</span> {classRow.max_students}{' '}
            - <span className="font-medium text-navy-800 dark:text-white">Enrolled:</span> {activeStudentIds.length}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-navy-800 dark:text-white mb-2">
            Enrolled Students ({activeStudentIds.length})
          </h3>
          {activeStudentIds.length === 0 ? (
            <p className="text-sm text-charcoal/60 dark:text-navy-400">No students enrolled.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeStudentIds.map((id) => (
                <Link
                  key={id}
                  href={`/portal/admin/students/${id}`}
                  className="inline-flex px-2.5 py-1 rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-800 text-sm hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors"
                >
                  {profileMap[id]?.display_name || profileMap[id]?.email || id}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <Link href="/portal/admin/classes" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            {'<- Back to Classes'}
          </Link>
        </div>
      </SectionCard>

      <SectionCard
        title={`Mark Attendance - ${selectedDate}`}
        description="Select a date to view or edit attendance for that session."
      >
        <form method="get" className="flex items-end gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">Session Date</label>
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-gold-300 text-navy-900 text-sm font-semibold"
          >
            Load Date
          </button>
        </form>

        <CoachAttendanceEditor
          classId={classId}
          userId={session.userId}
          initialSessionDate={selectedDate}
          students={studentProfiles}
          initialAttendance={attendanceByStudent}
          initialAbsenceStudentIds={(absencesForDateData ?? []).map((row: { student_id: string }) => row.student_id)}
        />
      </SectionCard>

      <SectionCard
        title="Attendance History"
        description={`${sortedDates.length} session${sortedDates.length === 1 ? '' : 's'} with recorded attendance.`}
      >
        {sortedDates.length === 0 ? (
          <p className="text-sm text-charcoal/60 dark:text-navy-400">No attendance records yet.</p>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((dateStr) => {
              const rows = attendanceByDate.get(dateStr) ?? [];
              const present = rows.filter((row) => row.status === 'present').length;
              const total = rows.length;
              return (
                <div
                  key={dateStr}
                  className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-navy-800 dark:text-white text-sm">{dateStr}</span>
                      <span className="ml-2 text-xs text-charcoal/60 dark:text-navy-400">
                        {present}/{total} present
                      </span>
                    </div>
                    <Link
                      href={`/portal/admin/classes/${classId}?date=${dateStr}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rows.map((row) => (
                      <span
                        key={row.student_id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          statusClass[row.status]
                        }`}
                      >
                        {profileMap[row.student_id]?.display_name ||
                          profileMap[row.student_id]?.email ||
                          row.student_id.slice(0, 8)}
                        {row.camera_on === false ? ' camera-off' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Resources" description="Upload files or post links for students in this class.">
        <CoachResourceManager classId={classId} initialResources={resources ?? []} />
      </SectionCard>

      {cancellations.length > 0 ? (
        <SectionCard title="Cancelled Sessions" description="Sessions that were cancelled for this class.">
          <div className="space-y-2">
            {cancellations.map((cancellation) => (
              <div
                key={cancellation.id}
                className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2"
              >
                <div>
                  <span className="font-medium text-sm text-red-800 dark:text-red-300">
                    {cancellation.cancellation_date}
                  </span>
                  {cancellation.reason ? (
                    <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                      - {cancellation.reason}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
