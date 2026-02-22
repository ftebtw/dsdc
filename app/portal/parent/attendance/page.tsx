import { redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import AttendanceSummary, { attendanceStatusClass } from '@/app/portal/_components/AttendanceSummary';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; term?: string }>;
}) {
  const session = await requireRole(['parent']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  const { linkedStudents, selectedStudentId, selectedStudent } = await getParentSelection(
    supabase,
    session.userId,
    params.student
  );

  if (!linkedStudents.length) {
    return (
      <SectionCard title={parentT(locale, 'portal.parent.attendance.title', 'Attendance')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No students linked to your account yet.')}
        </p>
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    const termQuery = params.term ? `&term=${encodeURIComponent(params.term)}` : '';
    redirect(`/portal/parent/attendance?student=${selectedStudentId}${termQuery}`);
  }

  const [termsData, activeTerm] = await Promise.all([
    supabase.from('terms').select('*').order('start_date', { ascending: false }),
    getActiveTerm(supabase),
  ]);
  const terms = (termsData.data ?? []) as any[];
  const selectedTermId = params.term || activeTerm?.id || terms[0]?.id || '';

  const enrollments = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', selectedStudentId)
    .eq('status', 'active')).data ?? []) as any[];
  const classIds = enrollments.map((row: any) => row.class_id);
  const classes = classIds.length
    ? (((await supabase
        .from('classes')
        .select('id,name,term_id')
        .in('id', classIds)
        .eq('term_id', selectedTermId)).data ?? []) as any[])
    : ([] as any[]);
  const selectedClassIds = classes.map((classRow: any) => classRow.id);

  const attendanceRows = selectedClassIds.length
    ? (((await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', selectedStudentId)
        .in('class_id', selectedClassIds)
        .order('session_date', { ascending: false })).data ?? []) as any[])
    : ([] as any[]);

  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow.name]));
  const statusLabel = (status: string) =>
    parentT(locale, `portal.parent.status.${status}`, status);

  return (
    <div className="space-y-6">
      <SectionCard
        title={parentT(locale, 'portal.parent.attendance.title', 'Attendance')}
        description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
          selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
        }`}
      >
        <form method="get" className="flex flex-wrap items-center gap-3 mb-4">
          <input type="hidden" name="student" value={selectedStudentId} />
          <label className="text-sm text-navy-700 dark:text-navy-200">
            {parentT(locale, 'portal.parent.common.termLabel', 'Term')}
          </label>
          <select
            name="term"
            defaultValue={selectedTermId}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {terms.map((term: any) => (
              <option key={term.id} value={term.id}>
                {term.name} {term.is_active ? '(Active)' : ''}
              </option>
            ))}
          </select>
          <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
            {parentT(locale, 'portal.parent.common.loadButton', 'Load')}
          </button>
        </form>
        <AttendanceSummary records={attendanceRows} />
      </SectionCard>

      <SectionCard title={parentT(locale, 'portal.parent.attendance.sessionLog', 'Session Log')}>
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-900/60">
              <tr>
                <th className="text-left px-4 py-3">{parentT(locale, 'portal.parent.common.dateHeader', 'Date')}</th>
                <th className="text-left px-4 py-3">{parentT(locale, 'portal.parent.common.classHeader', 'Class')}</th>
                <th className="text-left px-4 py-3">{parentT(locale, 'portal.parent.common.statusHeader', 'Status')}</th>
                <th className="text-left px-4 py-3">{parentT(locale, 'portal.parent.common.cameraHeader', 'Camera')}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row: any) => (
                <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-4 py-3">{row.session_date}</td>
                  <td className="px-4 py-3">{classMap[row.class_id] || row.class_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs uppercase ${attendanceStatusClass(row.status)}`}>
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.camera_on
                      ? parentT(locale, 'portal.parent.common.cameraOn', 'On')
                      : parentT(locale, 'portal.parent.common.cameraOff', 'Off')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {attendanceRows.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-4">
            {parentT(locale, 'portal.parent.common.noAttendanceForTerm', 'No attendance records for this term.')}
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}
