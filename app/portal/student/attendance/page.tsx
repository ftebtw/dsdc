export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import AttendanceSummary, { attendanceStatusClass } from '@/app/portal/_components/AttendanceSummary';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { hasActiveEnrollment } from '@/lib/portal/enrollment-status';
import { portalT } from '@/lib/portal/parent-i18n';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type TermRow = Database['public']['Tables']['terms']['Row'];
type EnrollmentClassRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'class_id' | 'status'>;
type StudentClassRow = Pick<Database['public']['Tables']['classes']['Row'], 'id' | 'name' | 'term_id'>;
type AttendanceRow = Database['public']['Tables']['attendance_records']['Row'];

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const session = await requireRole(['student']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const enrolled = await hasActiveEnrollment(supabase as any, session.userId);
  if (!enrolled) {
    return (
      <SectionCard
        title={t('portal.student.attendance.title', 'Attendance Record')}
        description={t('portal.student.attendance.description', 'Track your attendance by term and class.')}
      >
        <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
      </SectionCard>
    );
  }

  const [{ data: termsData }, activeTerm] = await Promise.all([
    supabase.from('terms').select('*').order('start_date', { ascending: false }),
    getActiveTerm(supabase),
  ]);
  const terms = (termsData ?? []) as TermRow[];
  const selectedTermId = params.term || activeTerm?.id || terms[0]?.id || '';

  const studentEnrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .eq('status', 'active')).data ?? []) as EnrollmentClassRow[];
  const studentClassIds = studentEnrollmentRows.map((row) => row.class_id);

  const classes = studentClassIds.length
    ? (((await supabase
        .from('classes')
        .select('id,name,term_id')
        .in('id', studentClassIds)
        .eq('term_id', selectedTermId)).data ?? []) as StudentClassRow[])
    : ([] as StudentClassRow[]);

  const classIds = classes.map((classRow) => classRow.id);
  const attendanceRows = classIds.length
    ? (((await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', session.userId)
        .in('class_id', classIds)
        .order('session_date', { ascending: false })).data ?? []) as AttendanceRow[])
    : ([] as AttendanceRow[]);

  const classMap = Object.fromEntries(classes.map((classRow) => [classRow.id, classRow]));

  return (
    <div className="space-y-6">
      <SectionCard
        title={t('portal.student.attendance.title', 'Attendance Record')}
        description={t('portal.student.attendance.description', 'Track your attendance by term and class.')}
      >
        <form method="get" className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm text-navy-700 dark:text-navy-200">
            {t('portal.student.attendance.term', 'Term')}
          </label>
          <select
            name="term"
            defaultValue={selectedTermId}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name} {term.is_active ? `(${t('portal.student.attendance.activeLabel', 'Active')})` : ''}
              </option>
            ))}
          </select>
          <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
            {t('portal.student.attendance.load', 'Load')}
          </button>
        </form>

        <AttendanceSummary records={attendanceRows} locale={locale} />
      </SectionCard>

      <SectionCard title={t('portal.student.attendance.sessionLog', 'Session Log')}>
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-900/60">
              <tr>
                <th className="text-left px-4 py-3">{t('portal.student.attendance.date', 'Date')}</th>
                <th className="text-left px-4 py-3">{t('portal.student.attendance.class', 'Class')}</th>
                <th className="text-left px-4 py-3">{t('portal.student.attendance.status', 'Status')}</th>
                <th className="text-left px-4 py-3">{t('portal.student.attendance.camera', 'Camera')}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row) => (
                <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-4 py-3">{row.session_date}</td>
                  <td className="px-4 py-3">{classMap[row.class_id]?.name || row.class_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs uppercase ${attendanceStatusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.camera_on
                      ? t('portal.student.attendance.cameraOn', 'On')
                      : t('portal.student.attendance.cameraOff', 'Off')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {attendanceRows.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-4">
            {t('portal.student.attendance.noTermRecords', 'No attendance records for this term.')}
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}
