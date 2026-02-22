import SectionCard from '@/app/portal/_components/SectionCard';
import AdminManualEnrollForm from '@/app/portal/_components/AdminManualEnrollForm';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminEnrollPage() {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const [{ data: classesData }, { data: studentsData }] = await Promise.all([
    supabase.from('classes').select('id,name').order('name', { ascending: true }),
    supabase.from('profiles').select('id,display_name,email').eq('role', 'student').order('display_name', { ascending: true }),
  ]);
  const classes = (classesData ?? []) as any[];
  const students = (studentsData ?? []) as any[];

  const classOptions = classes.map((classRow: any) => ({
    id: classRow.id,
    label: classRow.name,
  }));
  const studentOptions = students.map((student: any) => ({
    id: student.id,
    label: `${student.display_name || student.email} (${student.email})`,
  }));

  return (
    <SectionCard
      title="Manual Enrollment"
      description="Enroll an existing student or create a new student account and enroll in one step."
    >
      {classOptions.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">Create classes first before enrolling students.</p>
      ) : (
        <AdminManualEnrollForm classOptions={classOptions} studentOptions={studentOptions} />
      )}
    </SectionCard>
  );
}
