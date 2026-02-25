export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import SectionCard from '@/app/portal/_components/SectionCard';
import ResourceList from '@/app/portal/_components/ResourceList';
import { requireRole } from '@/lib/portal/auth';
import { parentHasEnrolledStudent } from '@/lib/portal/enrollment-status';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

const resourceTypes: Database['public']['Enums']['resource_type'][] = [
  'homework',
  'lesson_plan',
  'slides',
  'document',
  'recording',
  'other',
];

type EnrollmentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'class_id' | 'status'>;
type ClassNameRow = Pick<Database['public']['Tables']['classes']['Row'], 'id' | 'name'>;
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
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    const classQuery = params.classId ? `&classId=${encodeURIComponent(params.classId)}` : '';
    const typeQuery = params.type ? `&type=${encodeURIComponent(params.type)}` : '';
    redirect(`/portal/parent/resources?student=${selectedStudentId}${classQuery}${typeQuery}`);
  }
  const enrollmentState = await parentHasEnrolledStudent(supabase as any, session.userId);
  if (!enrollmentState.hasEnrolled) {
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

  const enrollments = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', selectedStudentId)
    .eq('status', 'active')).data ?? []) as EnrollmentRow[];
  const classIds = enrollments.map((row) => row.class_id);
  const classes = classIds.length
    ? (((await supabase.from('classes').select('id,name').in('id', classIds)).data ?? []) as ClassNameRow[])
    : ([] as ClassNameRow[]);
  const classMap = Object.fromEntries(classes.map((classRow) => [classRow.id, classRow.name]));

  let query = supabase
    .from('resources')
    .select('*')
    .in('class_id', classIds.length ? classIds : ['00000000-0000-0000-0000-000000000000'])
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
        labels={{
          open: parentT(locale, 'portal.parent.common.openButton', 'Open'),
          delete: parentT(locale, 'portal.parent.common.deleteButton', 'Delete'),
          empty: parentT(locale, 'portal.parent.common.noResources', 'No resources available.'),
        }}
      />
    </SectionCard>
  );
}
