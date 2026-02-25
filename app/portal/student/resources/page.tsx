export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import ResourceList from '@/app/portal/_components/ResourceList';
import { requireRole } from '@/lib/portal/auth';
import { hasActiveEnrollment } from '@/lib/portal/enrollment-status';
import { portalT } from '@/lib/portal/parent-i18n';
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

export default async function StudentResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; type?: string }>;
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
        title={t('portal.student.resources.title', 'Resources')}
        description={t('portal.student.resources.description', 'Class materials and recordings posted by coaches.')}
      >
        <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
      </SectionCard>
    );
  }

  const enrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .eq('status', 'active')).data ?? []) as EnrollmentRow[];
  const classIds = enrollmentRows.map((row) => row.class_id);

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
    <div className="space-y-6">
      <SectionCard
        title={t('portal.student.resources.title', 'Resources')}
        description={t('portal.student.resources.description', 'Class materials and recordings posted by coaches.')}
      >
        <form method="get" className="grid sm:grid-cols-3 gap-3 mb-4">
          <select
            name="classId"
            defaultValue={params.classId || ''}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="">{t('portal.student.attendance.allClasses', 'All classes')}</option>
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
            <option value="">{t('portal.student.resources.allTypes', 'All types')}</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
          <button className="justify-self-start px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
            {t('portal.student.resources.apply', 'Apply')}
          </button>
        </form>
        <ResourceList resources={resources} />
      </SectionCard>
    </div>
  );
}
