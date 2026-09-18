export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import ResourceList from '@/app/portal/_components/ResourceList';
import WeeklyFeedbackList, {
  type WeeklyFeedbackListRow,
} from '@/app/portal/_components/WeeklyFeedbackList';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { portalT } from '@/lib/portal/parent-i18n';
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

  const enrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .in('status', ['active', 'completed'])).data ?? []) as EnrollmentRow[];
  const classIds = enrollmentRows.map((row) => row.class_id);

  if (classIds.length === 0) {
    return (
      <SectionCard
        title={t('portal.student.resources.title', 'Resources')}
        description={t('portal.student.resources.description', 'Class materials and recordings posted by coaches.')}
      >
        <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
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

  const weeklyFeedbackEntries = await loadWeeklyFeedbackForStudent({
    supabase,
    classIds,
    classMap,
    studentId: session.userId,
  });

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
        <ResourceList resources={resources} termStartDate={termStartDate} />
      </SectionCard>

      {weeklyFeedbackEntries.length > 0 ? (
        <SectionCard
          title="Class feedback"
          description="Weekly feedback your coach has posted for your classes. Personal notes are only visible to you."
        >
          <WeeklyFeedbackList entries={weeklyFeedbackEntries} emptyMessage="No feedback yet." />
        </SectionCard>
      ) : null}
    </div>
  );
}

async function loadWeeklyFeedbackForStudent({
  supabase,
  classIds,
  classMap,
  studentId,
}: {
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;
  classIds: string[];
  classMap: Record<string, string>;
  studentId: string;
}): Promise<WeeklyFeedbackListRow[]> {
  if (classIds.length === 0) return [];
  const { data: weeklyRowsData } = await (supabase as any)
    .from('class_feedback')
    .select('id,class_id,session_date,general_feedback,updated_at')
    .in('class_id', classIds)
    .order('session_date', { ascending: false });
  const weeklyRows = (weeklyRowsData ?? []) as Array<{
    id: string;
    class_id: string;
    session_date: string;
    general_feedback: string | null;
    updated_at: string;
  }>;
  if (weeklyRows.length === 0) return [];

  const feedbackIds = weeklyRows.map((r) => r.id);
  const { data: individualRowsData } = await (supabase as any)
    .from('class_feedback_individual')
    .select('class_feedback_id,student_id,feedback')
    .in('class_feedback_id', feedbackIds)
    .eq('student_id', studentId);
  const profileMap = await getProfileMap(supabase, [studentId]);
  const studentName =
    profileMap[studentId]?.display_name || profileMap[studentId]?.email || 'You';
  const individualByFeedback = new Map<string, Array<{ studentId: string; feedback: string }>>();
  for (const row of (individualRowsData ?? []) as Array<{
    class_feedback_id: string;
    student_id: string;
    feedback: string;
  }>) {
    const list = individualByFeedback.get(row.class_feedback_id) ?? [];
    list.push({ studentId: row.student_id, feedback: row.feedback });
    individualByFeedback.set(row.class_feedback_id, list);
  }

  return weeklyRows.map((row) => ({
    id: row.id,
    classId: row.class_id,
    className: classMap[row.class_id] ?? 'Class',
    sessionDate: row.session_date,
    generalFeedback: row.general_feedback,
    individual: (individualByFeedback.get(row.id) ?? []).map((r) => ({
      studentId: r.studentId,
      studentName,
      feedback: r.feedback,
    })),
  }));
}
