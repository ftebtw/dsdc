export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminConsultationsList from '@/app/portal/_components/AdminConsultationsList';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  consultationErrorMessage,
  consultationStatusOptions,
  type ConsultationRecord,
  type ConsultationStudent,
  howFoundUsLabel,
  normalizeConsultationStatus,
} from '@/app/portal/admin/consultations/config';

function normalizeSearchTerm(value: string | undefined): string {
  return (value || '').trim();
}

function escapeOrFilterValue(value: string): string {
  return value.replace(/[%_,]/g, ' ').replace(/,/g, ' ').trim();
}

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const params = await searchParams;

  const queryText = normalizeSearchTerm(params.query);
  const selectedStatus =
    consultationStatusOptions.some((option) => option.value === params.status) ? params.status || '' : '';

  let query = (supabase as any)
    .from('consultations')
    .select('*')
    .order('consult_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (selectedStatus) {
    query = query.eq('status', normalizeConsultationStatus(selectedStatus));
  }

  if (queryText) {
    const safeQuery = escapeOrFilterValue(queryText);
    const { data: studentMatches } = await (supabase as any)
      .from('consultation_students')
      .select('consultation_id')
      .ilike('student_name', `%${safeQuery}%`);
    const matchedIds = Array.from(
      new Set(((studentMatches ?? []) as Array<{ consultation_id: string }>).map((row) => row.consultation_id))
    );

    const orParts = [
      `parent_name.ilike.%${safeQuery}%`,
      `parent_email.ilike.%${safeQuery}%`,
      `parent_phone.ilike.%${safeQuery}%`,
    ];
    if (matchedIds.length > 0) {
      orParts.push(`id.in.(${matchedIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  const { data } = await query;
  const baseConsultations = (data ?? []) as Array<Omit<ConsultationRecord, 'students'>>;

  const consultationIds = baseConsultations.map((c) => c.id);
  let studentsByConsultation: Record<string, ConsultationStudent[]> = {};
  if (consultationIds.length > 0) {
    const { data: studentsData } = await (supabase as any)
      .from('consultation_students')
      .select('*')
      .in('consultation_id', consultationIds)
      .order('sort_order', { ascending: true });
    studentsByConsultation = ((studentsData ?? []) as ConsultationStudent[]).reduce(
      (acc, student) => {
        const list = acc[student.consultation_id] ?? [];
        list.push(student);
        acc[student.consultation_id] = list;
        return acc;
      },
      {} as Record<string, ConsultationStudent[]>
    );
  }

  const consultations: ConsultationRecord[] = baseConsultations.map((c) => ({
    ...c,
    students: studentsByConsultation[c.id] ?? [],
  }));
  const errorMessage = consultationErrorMessage(params.error);

  function joinStudentField(students: ConsultationStudent[], field: keyof ConsultationStudent): string {
    const values = students
      .map((student) => student[field])
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    return values.length > 0 ? values.join(', ') : '-';
  }

  return (
    <div className="space-y-6">
      {params.created === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Consultation saved successfully.
        </div>
      ) : null}
      {params.updated === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Consultation updated successfully.
        </div>
      ) : null}
      {params.deleted === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Consultation deleted successfully.
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <SectionCard title="Consultations" description="Track parent consultation notes, recommendations, and follow-up.">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form method="get" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto_auto] w-full md:max-w-4xl">
            <input
              type="search"
              name="query"
              defaultValue={queryText}
              placeholder="Search parent, student, email, or phone"
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
            <select
              name="status"
              defaultValue={selectedStatus}
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            >
              <option value="">All statuses</option>
              {consultationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
            >
              Apply
            </button>
            <Link
              href="/portal/admin/consultations"
              className="rounded-lg border border-warm-300 dark:border-navy-600 px-4 py-2 text-center text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
            >
              Reset
            </Link>
          </form>

          <Link
            href="/portal/admin/consultations/new"
            className="inline-flex rounded-lg bg-gold-300 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-200"
          >
            New Consultation
          </Link>
        </div>

        <AdminConsultationsList
          consultations={consultations.map((consultation) => ({
            id: consultation.id,
            consultDate: consultation.consult_date,
            studentName: joinStudentField(consultation.students, 'student_name'),
            parentName: consultation.parent_name || '-',
            studentGrade: joinStudentField(consultation.students, 'student_grade'),
            howFoundUs: howFoundUsLabel(consultation.how_found_us),
            recommendedClass: joinStudentField(consultation.students, 'recommended_class'),
            status: consultation.status,
          }))}
        />
      </SectionCard>
    </div>
  );
}
