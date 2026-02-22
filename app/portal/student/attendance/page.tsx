import SectionCard from '@/app/portal/_components/SectionCard';
import AttendanceSummary, { attendanceStatusClass } from '@/app/portal/_components/AttendanceSummary';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const session = await requireRole(['student']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const [{ data: termsData }, activeTerm] = await Promise.all([
    supabase.from('terms').select('*').order('start_date', { ascending: false }),
    getActiveTerm(supabase),
  ]);
  const terms = (termsData ?? []) as any[];
  const selectedTermId = params.term || activeTerm?.id || terms[0]?.id || '';

  const studentEnrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .eq('status', 'active')).data ?? []) as any[];
  const studentClassIds = studentEnrollmentRows.map((row: any) => row.class_id);

  const classes = studentClassIds.length
    ? (((await supabase
        .from('classes')
        .select('id,name,term_id')
        .in('id', studentClassIds)
        .eq('term_id', selectedTermId)).data ?? []) as any[])
    : ([] as any[]);

  const classIds = classes.map((classRow: any) => classRow.id);
  const attendanceRows = classIds.length
    ? (((await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', session.userId)
        .in('class_id', classIds)
        .order('session_date', { ascending: false })).data ?? []) as any[])
    : ([] as any[]);

  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow]));

  return (
    <div className="space-y-6">
      <SectionCard title="Attendance Record" description="Track your attendance by term and class.">
        <form method="get" className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm text-navy-700 dark:text-navy-200">Term</label>
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
          <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">Load</button>
        </form>

        <AttendanceSummary records={attendanceRows} />
      </SectionCard>

      <SectionCard title="Session Log">
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-900/60">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Class</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Camera</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row: any) => (
                <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-4 py-3">{row.session_date}</td>
                  <td className="px-4 py-3">{classMap[row.class_id]?.name || row.class_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs uppercase ${attendanceStatusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.camera_on ? 'On' : 'Off'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {attendanceRows.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-4">No attendance records for this term.</p>
        ) : null}
      </SectionCard>
    </div>
  );
}
