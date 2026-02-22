import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { classTypeLabel } from '@/lib/portal/labels';
import { formatUtcForUser } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function linkParent(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const studentId = String(formData.get('student_id') || '');
  const parentId = String(formData.get('parent_id') || '');
  if (!studentId || !parentId) return;

  await supabase.from('parent_student_links').upsert(
    {
      parent_id: parentId,
      student_id: studentId,
    },
    { onConflict: 'parent_id,student_id' }
  );

  revalidatePath(`/portal/admin/students/${studentId}`);
}

async function unlinkParent(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const studentId = String(formData.get('student_id') || '');
  const parentId = String(formData.get('parent_id') || '');
  if (!studentId || !parentId) return;

  await supabase
    .from('parent_student_links')
    .delete()
    .eq('student_id', studentId)
    .eq('parent_id', parentId);

  revalidatePath(`/portal/admin/students/${studentId}`);
}

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole(['admin']);
  const { studentId } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .eq('role', 'student')
    .maybeSingle();

  if (!student) notFound();

  const [
    { data: enrollmentsData },
    { data: attendanceRowsData },
    { data: classesData },
    { data: termsData },
    { data: parentLinksData },
    { data: parentProfilesData },
  ] = await Promise.all([
    supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false }),
    supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('session_date', { ascending: false })
      .limit(200),
    supabase.from('classes').select('*'),
    supabase.from('terms').select('*'),
    supabase.from('parent_student_links').select('*').eq('student_id', studentId),
    supabase.from('profiles').select('id,display_name,email').eq('role', 'parent').order('display_name'),
  ]);

  const enrollments = (enrollmentsData ?? []) as any[];
  const attendanceRows = (attendanceRowsData ?? []) as any[];
  const classes = (classesData ?? []) as any[];
  const terms = (termsData ?? []) as any[];
  const parentLinks = (parentLinksData ?? []) as any[];
  const parentProfiles = (parentProfilesData ?? []) as any[];

  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow]));
  const termMap = Object.fromEntries(terms.map((term: any) => [term.id, term]));
  const linkedParentIds = new Set(parentLinks.map((row: any) => row.parent_id));

  return (
    <div className="space-y-6">
      <SectionCard title={student.display_name || student.email} description={`Student ID: ${student.id}`}>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="font-medium">Email:</span> {student.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {student.phone || '-'}
          </p>
          <p>
            <span className="font-medium">Timezone:</span> {student.timezone}
          </p>
          <p>
            <span className="font-medium">Locale:</span> {student.locale}
          </p>
        </div>
        <div className="mt-4">
          <Link href="/portal/admin/students" className="text-sm underline text-navy-700 dark:text-navy-200">
            Back to students
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Linked Parents" description="Manage parent relationships for this student.">
        <form action={linkParent} className="flex flex-wrap items-center gap-2 mb-4">
          <input type="hidden" name="student_id" value={studentId} />
          <select
            name="parent_id"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {parentProfiles.map((parent: any) => (
              <option key={parent.id} value={parent.id}>
                {parent.display_name || parent.email} ({parent.email})
              </option>
            ))}
          </select>
          <button className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm">Link Parent</button>
        </form>

        <div className="space-y-2">
          {parentLinks.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">No linked parents yet.</p>
          ) : (
            parentLinks.map((link: any) => {
              const parent = parentProfiles.find((profile: any) => profile.id === link.parent_id);
              return (
                <div
                  key={link.id}
                  className="rounded-lg border border-warm-200 dark:border-navy-600 p-3 flex items-center justify-between gap-3"
                >
                  <p className="text-sm">
                    {parent?.display_name || parent?.email || link.parent_id}
                    {parent?.email ? ` (${parent.email})` : ''}
                  </p>
                  <form action={unlinkParent}>
                    <input type="hidden" name="student_id" value={studentId} />
                    <input type="hidden" name="parent_id" value={link.parent_id} />
                    <button className="px-2.5 py-1 rounded-md bg-red-600 text-white text-xs">Unlink</button>
                  </form>
                </div>
              );
            })
          )}
        </div>

        {parentProfiles.length === linkedParentIds.size ? (
          <p className="text-xs text-charcoal/60 dark:text-navy-300 mt-3">All parent accounts are already linked.</p>
        ) : null}
      </SectionCard>

      <SectionCard title="Enrollments Across Terms">
        <div className="space-y-2 text-sm">
          {enrollments.map((enrollment: any) => {
            const classRow = classMap[enrollment.class_id];
            const term = classRow ? termMap[classRow.term_id] : null;
            return (
              <p key={enrollment.id} className="rounded-lg border border-warm-200 dark:border-navy-600 p-3">
                <span className="font-medium">{classRow?.name || enrollment.class_id}</span> -{' '}
                {classRow
                  ? classTypeLabel[classRow.type as keyof typeof classTypeLabel] || String(classRow.type)
                  : 'Unknown class type'}{' '}
                - {term?.name || 'Unknown term'} - <span className="uppercase">{enrollment.status}</span>
              </p>
            );
          })}
          {enrollments.length === 0 ? (
            <p className="text-charcoal/70 dark:text-navy-300">No enrollments found.</p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Attendance History">
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-900/60">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Class</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Camera</th>
                <th className="text-left px-4 py-3">Marked At</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row: any) => (
                <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-4 py-3">{row.session_date}</td>
                  <td className="px-4 py-3">{classMap[row.class_id]?.name || row.class_id}</td>
                  <td className="px-4 py-3 uppercase">{row.status}</td>
                  <td className="px-4 py-3">{row.camera_on ? 'On' : 'Off'}</td>
                  <td className="px-4 py-3">{formatUtcForUser(row.marked_at, session.profile.timezone)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
