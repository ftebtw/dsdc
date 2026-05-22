export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import SectionCard from '@/app/portal/_components/SectionCard';
import ResourceList from '@/app/portal/_components/ResourceList';
import { requireRole } from '@/lib/portal/auth';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

const resourceTypes: Database['public']['Enums']['resource_type'][] = [
  'lesson_plan',
  'slides',
  'document',
  'recording',
  'other',
];

type EnrollmentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'class_id' | 'status'>;
type ClassNameRow = Pick<Database['public']['Tables']['classes']['Row'], 'id' | 'name' | 'term_id'>;
type ResourceRow = Database['public']['Tables']['resources']['Row'];

function isResourceType(value: string): value is Database['public']['Enums']['resource_type'] {
  return resourceTypes.includes(value as Database['public']['Enums']['resource_type']);
}

export default async function ParentResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; classId?: string; type?: string }>;
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
      <SectionCard title={parentT(locale, 'portal.parent.resources.title', 'Resources')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No students linked to your account yet.')}
        </p>
        <a href="/portal/parent/dashboard" className="mt-3 inline-block text-sm font-medium text-navy-700 dark:text-gold-300 underline">
          {parentT(locale, 'portal.parent.common.goToDashboard', 'Go to Dashboard to link a student')}
        </a>
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    const classQuery = params.classId ? `&classId=${encodeURIComponent(params.classId)}` : '';
    const typeQuery = params.type ? `&type=${encodeURIComponent(params.type)}` : '';
    redirect(`/portal/parent/resources?student=${selectedStudentId}${classQuery}${typeQuery}`);
  }

  const enrollments = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', selectedStudentId)
    .in('status', ['active', 'completed'])).data ?? []) as EnrollmentRow[];
  const classIds = enrollments.map((row) => row.class_id);

  if (classIds.length === 0) {
    return (
      <SectionCard
        title={parentT(locale, 'portal.parent.resources.title', 'Resources')}
        description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
          selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
        }`}
      >
        <EnrollmentRequiredBanner role="parent" locale={locale} />
      </SectionCard>
    );
  }

  const classes = classIds.length
    ? (((await supabase.from('classes').select('id,name,term_id').in('id', classIds)).data ?? []) as ClassNameRow[])
    : ([] as ClassNameRow[]);
  const classMap = Object.fromEntries(classes.map((classRow) => [classRow.id, classRow.name]));
  const selectedClass = params.classId ? classes.find((classRow) => classRow.id === params.classId) : undefined;
  const classTermIds = [...new Set(classes.map((classRow) => classRow.term_id).filter(Boolean))];
  const termRows = classTermIds.length
    ? (((await supabase
        .from('terms')
        .select('id,start_date')
        .in('id', classTermIds)).data ?? []) as Array<Record<string, any>>)
    : [];
  const termStartDateById = Object.fromEntries(
    termRows.map((term) => [term.id, term.start_date])
  );
  const activeTermStartDate = classes.length
    ? (((await supabase
        .from('terms')
        .select('start_date')
        .eq('is_active', true)
        .maybeSingle()).data ?? null) as Record<string, any> | null)?.start_date
    : null;

  let query = supabase
    .from('resources')
    .select('*')
    .in('class_id', classIds)
    .order('created_at', { ascending: false });

  if (params.classId) query = query.eq('class_id', params.classId);
  if (params.type && isResourceType(params.type)) {
    query = query.eq('type', params.type);
  }

  const { data: resourcesData } = await query;
  const resources = ((resourcesData ?? []) as ResourceRow[]).map((resource) => ({
    ...resource,
    className: resource.class_id ? classMap[resource.class_id] || null : null,
  }));
  const termStartDate =
    (selectedClass?.term_id ? termStartDateById[selectedClass.term_id] : null) || activeTermStartDate || '2025-01-01';

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.resources.title', 'Resources')}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
      <form method="get" className="grid sm:grid-cols-4 gap-3 mb-4">
        <input type="hidden" name="student" value={selectedStudentId} />
        <select
          name="classId"
          defaultValue={params.classId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">{parentT(locale, 'portal.parent.common.allClasses', 'All classes')}</option>
          {classes.map((classRow) => (
            <option key={classRow.id} value={classRow.id}>
              {classRow.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={params.type || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">{parentT(locale, 'portal.parent.common.allTypes', 'All types')}</option>
          {resourceTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
        <button className="justify-self-start px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          {parentT(locale, 'portal.parent.common.applyButton', 'Apply')}
        </button>
      </form>

      <ResourceList
        resources={resources}
        termStartDate={termStartDate}
        labels={{
          open: parentT(locale, 'portal.parent.common.openButton', 'Open'),
          delete: parentT(locale, 'portal.parent.common.deleteButton', 'Delete'),
          empty: parentT(locale, 'portal.parent.common.noResources', 'No resources available.'),
        }}
      />
    </SectionCard>
  );
}
