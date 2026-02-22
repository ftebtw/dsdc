import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const [{ data: studentsData }, { data: allClassesData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student').order('display_name', { ascending: true }),
    supabase.from('classes').select('id,name').order('name'),
  ]);
  const students = (studentsData ?? []) as Array<Record<string, any>>;
  const allClasses = (allClassesData ?? []) as Array<Record<string, any>>;

  const studentIds = students.map((student: any) => student.id);
  const enrollments = studentIds.length
    ? (((await supabase
        .from('enrollments')
        .select('student_id,class_id,status')
        .in('student_id', studentIds)).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);

  const classMap = Object.fromEntries(allClasses.map((classRow: any) => [classRow.id, classRow]));

  const filteredStudentSet = params.classId
    ? new Set(enrollments.filter((row) => row.class_id === params.classId).map((row) => row.student_id))
    : null;

  const visibleStudents = filteredStudentSet
    ? students.filter((student: any) => filteredStudentSet.has(student.id))
    : students;

  return (
    <SectionCard title="Students" description="All students with enrollment status and class assignments.">
      <form method="get" className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-navy-700 dark:text-navy-200">Filter by class</label>
        <select
          name="classId"
          defaultValue={params.classId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All classes</option>
          {allClasses.map((classRow: any) => (
            <option key={classRow.id} value={classRow.id}>
              {classRow.name}
            </option>
          ))}
        </select>
        <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">Apply</button>
      </form>

      <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-900/60">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Classes</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student: any) => {
              const rows = enrollments.filter((enrollment: any) => enrollment.student_id === student.id);
              return (
                <tr key={student.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-4 py-3 font-medium text-navy-800 dark:text-white">
                    {student.display_name || '-'}
                  </td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">
                    {rows.length
                      ? rows.map((row) => classMap[row.class_id]?.name || row.class_id).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{rows.length ? rows.map((row) => row.status).join(', ') : '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/admin/students/${student.id}`}
                      className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visibleStudents.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-4">No students matched this filter.</p>
      ) : null}
    </SectionCard>
  );
}
