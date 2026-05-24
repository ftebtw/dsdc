export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import AdminDeleteUserButton from '@/app/portal/_components/AdminDeleteUserButton';
import ConfirmDeleteButton from '@/app/portal/_components/ConfirmDeleteButton';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function unenrollStudentFromClass(formData: FormData) {
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

  revalidatePath('/portal/admin/students');
  redirect(`/portal/admin/students?classId=${classId}`);
}

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
  // Exclude soft-removed (dropped) enrollments so the Classes/Status columns
  // and the class filter only consider current rosters.
  const enrollments = studentIds.length
    ? (((await (supabase as any)
        .from('enrollments')
        .select('student_id,class_id,status')
        .in('student_id', studentIds)
        .neq('status', 'dropped')).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);

  const classMap = Object.fromEntries(allClasses.map((classRow: any) => [classRow.id, classRow]));

  const filteredStudentSet = params.classId
    ? new Set(enrollments.filter((row) => row.class_id === params.classId).map((row) => row.student_id))
    : null;

  const visibleStudents = filteredStudentSet
    ? students.filter((student: any) => filteredStudentSet.has(student.id))
    : students;

  const selectedClassName = params.classId ? classMap[params.classId]?.name : null;

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

      {selectedClassName ? (
        <p className="mb-3 text-xs text-charcoal/70 dark:text-navy-300">
          Showing students enrolled in <strong className="text-navy-800 dark:text-white">{selectedClassName}</strong>.
          The <em>Remove from class</em> button takes them off this class only — their account and other enrolments stay.
        </p>
      ) : null}

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
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/portal/admin/students/${student.id}`}
                        className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                      >
                        View
                      </Link>
                      {params.classId ? (
                        <form>
                          <ConfirmDeleteButton
                            action={unenrollStudentFromClass}
                            hiddenFields={{ class_id: params.classId, student_id: student.id }}
                            confirmMessage="Remove this student from this class? Their account and other enrolments stay intact."
                            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm text-charcoal/80 dark:text-navy-200 hover:text-red-600 hover:border-red-300 dark:hover:text-red-300 dark:hover:border-red-700"
                          >
                            Remove from class
                          </ConfirmDeleteButton>
                        </form>
                      ) : null}
                      <AdminDeleteUserButton userId={student.id} displayName={student.display_name} />
                    </div>
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
