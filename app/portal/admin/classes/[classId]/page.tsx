export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import CoachAttendanceEditor from '@/app/portal/_components/CoachAttendanceEditor';
import CoachResourceManager from '@/app/portal/_components/CoachResourceManager';
import ConfirmDeleteButton from '@/app/portal/_components/ConfirmDeleteButton';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { classTypeLabel } from '@/lib/portal/labels';
import { getWeekNumber } from '@/lib/portal/resource-weeks';
import { getSessionDateForClassTimezone, formatClassScheduleForViewer } from '@/lib/portal/time';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type AttendanceRow = Database['public']['Tables']['attendance_records']['Row'];
type AttendanceStatus = Database['public']['Enums']['attendance_status'];
type EnrollmentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'student_id' | 'status'>;
type CancellationRow = Database['public']['Tables']['class_cancellations']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function deleteAttendanceSession(formData: FormData) {
  'use server';

  await requireRole(['admin']);
  const classId = String(formData.get('class_id') || '').trim();
  const sessionDate = String(formData.get('session_date') || '').trim();

  if (!classId || !isValidDate(sessionDate)) return;

  const supabase = await getSupabaseServerClient();
  await Promise.all([
    supabase.from('attendance_records').delete().eq('class_id', classId).eq('session_date', sessionDate),
    supabase.from('student_absences').delete().eq('class_id', classId).eq('session_date', sessionDate),
  ]);

  revalidatePath(`/portal/admin/classes/${classId}`);
  redirect(`/portal/admin/classes/${classId}?date=${sessionDate}`);
}

async function unenrollStudent(formData: FormData) {
  'use server';

  await requireRole(['admin']);
  const classId = String(formData.get('class_id') || '').trim();
  const studentId = String(formData.get('student_id') || '').trim();
  if (!classId || !studentId) return;

  const supabase = await getSupabaseServerClient();
  await (supabase as any)
    .from('enrollments')
    .update({ status: 'dropped' })
    .eq('class_id', classId)
    .eq('student_id', studentId)
    .neq('status', 'dropped');

  revalidatePath(`/portal/admin/classes/${classId}`);
  redirect(`/portal/admin/classes/${classId}`);
}

async function deleteAttendanceStudentLog(formData: FormData) {
  'use server';

  await requireRole(['admin']);
  const classId = String(formData.get('class_id') || '').trim();
  const sessionDate = String(formData.get('session_date') || '').trim();
  const studentId = String(formData.get('student_id') || '').trim();

  if (!classId || !isValidDate(sessionDate) || !studentId) return;

  const supabase = await getSupabaseServerClient();
  await supabase
    .from('attendance_records')
    .delete()
    .eq('class_id', classId)
    .eq('session_date', sessionDate)
    .eq('student_id', studentId);

  revalidatePath(`/portal/admin/classes/${classId}`);
  redirect(`/portal/admin/classes/${classId}?date=${sessionDate}`);
}

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
  const { data: termRow } = await supabase
    .from('terms')
    .select('start_date')
    .eq('id', classRow.term_id)
    .maybeSingle();
  const termStartDate = termRow?.start_date || '2025-01-01';

  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select('student_id,status')
    .eq('class_id', classId)
    .neq('status', 'dropped');
  const enrollments = (enrollmentsData ?? []) as EnrollmentRow[];
  const enrolledStudentIds = enrollments.map((item) => item.student_id);

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
  const { data: weekTitleRows, error: weekTitleError } = await (supabase as any)
    .from('class_resource_week_titles')
    .select('week_number,title')
    .eq('class_id', classId);
  if (weekTitleError && weekTitleError.code !== '42P01') {
    console.error('[admin-class-detail] failed to load week titles', weekTitleError);
  }
  const initialWeekTitles = Object.fromEntries(
    ((weekTitleRows ?? []) as Array<{ week_number: number; title: string }>).map((row) => [
      String(row.week_number),
      row.title,
    ])
  );

  const { data: cancellationsData } = await supabase
    .from('class_cancellations')
    .select('*')
    .eq('class_id', classId)
    .order('cancellation_date', { ascending: false });
  const cancellations = (cancellationsData ?? []) as CancellationRow[];

  const studentProfiles = enrolledStudentIds
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

  const isPrivateGroup = Boolean((classRow as { is_private_session_group?: boolean }).is_private_session_group);
  const classTypeText = isPrivateGroup
    ? 'Private coaching group'
    : classTypeLabel[classRow.type as keyof typeof classTypeLabel] || classRow.type || 'Class';
  const scheduleText = formatClassScheduleForViewer(
    classRow.schedule_day,
    classRow.schedule_start_time,
    classRow.schedule_end_time,
    classRow.timezone,
    session.profile.timezone
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title={classRow.name}
        description={`${classTypeText} · ${scheduleText}`}
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
            - <span className="font-medium text-navy-800 dark:text-white">Enrolled:</span> {enrolledStudentIds.length}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-navy-800 dark:text-white mb-2">
            Enrolled Students ({enrolledStudentIds.length})
          </h3>
          {enrolledStudentIds.length === 0 ? (
            <p className="text-sm text-charcoal/60 dark:text-navy-400">No students enrolled.</p>
          ) : (
            <ul className="divide-y divide-warm-100 dark:divide-navy-700 rounded-lg border border-warm-200 dark:border-navy-600 overflow-hidden">
              {enrolledStudentIds.map((id) => (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 px-3 py-2 bg-warm-50 dark:bg-navy-800 hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors"
                >
                  <Link
                    href={`/portal/admin/students/${id}`}
                    className="text-sm font-medium text-navy-800 dark:text-white hover:underline truncate"
                  >
                    {profileMap[id]?.display_name || profileMap[id]?.email || id}
                  </Link>
                  <form>
                    <ConfirmDeleteButton
                      action={unenrollStudent}
                      hiddenFields={{ class_id: classId, student_id: id }}
                      confirmMessage="Remove this student from the class? Their account stays; they just come off the active roster. Past attendance and homework are preserved."
                      className="px-2.5 py-1 rounded-md border border-warm-300 dark:border-navy-600 text-xs font-semibold text-charcoal/70 dark:text-navy-200 hover:text-red-600 hover:border-red-300 dark:hover:text-red-300 dark:hover:border-red-700"
                    >
                      Remove from class
                    </ConfirmDeleteButton>
                  </form>
                </li>
              ))}
            </ul>
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
        <form action={deleteAttendanceSession} className="mb-4">
          <input type="hidden" name="class_id" value={classId} />
          <input type="hidden" name="session_date" value={selectedDate} />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50"
          >
            Delete All Logs For {selectedDate}
          </button>
        </form>

        <CoachAttendanceEditor
          classId={classId}
          userId={session.userId}
          initialSessionDate={selectedDate}
          students={studentProfiles}
          initialAttendance={attendanceByStudent}
          initialAbsenceStudentIds={(absencesForDateData ?? []).map((row: { student_id: string }) => row.student_id)}
          allowDelete
        />
      </SectionCard>

      <SectionCard
        title="Attendance History"
        description={`${sortedDates.length} session${sortedDates.length === 1 ? '' : 's'} with recorded attendance.`}
      >
        {sortedDates.length === 0 ? (
          <p className="text-sm text-charcoal/60 dark:text-navy-400">No attendance records yet.</p>
        ) : (() => {
          const weekMap = new Map<number, string[]>();
          for (const dateStr of sortedDates) {
            const week = getWeekNumber(termStartDate, dateStr);
            if (!weekMap.has(week)) weekMap.set(week, []);
            weekMap.get(week)!.push(dateStr);
          }
          const sortedWeeks = [...weekMap.entries()].sort((a, b) => b[0] - a[0]);

          return (
            <div className="space-y-4">
              {sortedWeeks.map(([week, dates]) => (
                <div
                  key={week}
                  className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-warm-100 dark:bg-navy-800">
                    <h3 className="font-semibold text-navy-800 dark:text-white">Week {week}</h3>
                  </div>
                  <div className="divide-y divide-warm-100 dark:divide-navy-700">
                    {dates.map((dateStr) => {
                      const rows = attendanceByDate.get(dateStr) ?? [];
                      const present = rows.filter((row) => row.status === 'present').length;
                      const total = rows.length;
                      return (
                        <div key={dateStr} className="px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium text-navy-800 dark:text-white text-sm">{dateStr}</span>
                              <span className="ml-2 text-xs text-charcoal/60 dark:text-navy-400">
                                {present}/{total} present
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/portal/admin/classes/${classId}?date=${dateStr}`}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Edit
                              </Link>
                              <form action={deleteAttendanceSession}>
                                <input type="hidden" name="class_id" value={classId} />
                                <input type="hidden" name="session_date" value={dateStr} />
                                <button
                                  type="submit"
                                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                >
                                  Delete
                                </button>
                              </form>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {rows.map((row) => (
                              <form key={row.student_id} action={deleteAttendanceStudentLog} className="inline-flex">
                                <input type="hidden" name="class_id" value={classId} />
                                <input type="hidden" name="session_date" value={dateStr} />
                                <input type="hidden" name="student_id" value={row.student_id} />
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                    statusClass[row.status] || 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {profileMap[row.student_id]?.display_name ||
                                    profileMap[row.student_id]?.email ||
                                    row.student_id.slice(0, 8)}
                                  {row.camera_on === false ? ' (camera off)' : ''}
                                  <button
                                    type="submit"
                                    className="ml-1 text-[10px] font-semibold underline opacity-85 hover:opacity-100"
                                  >
                                    Delete
                                  </button>
                                </span>
                              </form>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </SectionCard>

      <SectionCard title="Resources" description="Upload files, post links, or share notes for students in this class.">
        <CoachResourceManager
          classId={classId}
          initialResources={resources ?? []}
          termStartDate={termStartDate}
          initialWeekTitles={initialWeekTitles}
        />
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
