export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import PortalAbsenceManager from '@/app/portal/_components/PortalAbsenceManager';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { hasActiveEnrollment } from '@/lib/portal/enrollment-status';
import { portalT } from '@/lib/portal/parent-i18n';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type EnrollmentClassRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'class_id'>;
type AbsenceClassRow = Pick<
  Database['public']['Tables']['classes']['Row'],
  'id' | 'name' | 'schedule_day' | 'timezone'
>;
type StudentAbsenceRow = Database['public']['Tables']['student_absences']['Row'];

export default async function StudentAbsentPage() {
  const session = await requireRole(['student']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const supabase = await getSupabaseServerClient();
  const enrolled = await hasActiveEnrollment(supabase as any, session.userId);
  if (!enrolled) {
    return (
      <SectionCard
        title={t('portal.student.absent.title', 'Mark Absent')}
        description={t(
          'portal.student.absent.description',
          'Report upcoming absences. Notifications and reminder automation will be added in a later phase.'
        )}
      >
        <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
      </SectionCard>
    );
  }
  const activeTerm = await getActiveTerm(supabase);

  if (!activeTerm) {
    return (
      <SectionCard
        title={t('portal.student.absent.title', 'Mark Absent')}
        description={t('portal.student.absent.noTerm', 'No active term available.')}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t('portal.student.absent.noTermHint', 'Please contact DSDC admin.')}
        </p>
      </SectionCard>
    );
  }

  const enrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id')
    .eq('student_id', session.userId)
    .eq('status', 'active')).data ?? []) as EnrollmentClassRow[];
  const classIds = enrollmentRows.map((row) => row.class_id);

  const classes = classIds.length
    ? (((await supabase
        .from('classes')
        .select('id,name,schedule_day,timezone')
        .in('id', classIds)
        .eq('term_id', activeTerm.id)
        .order('name')).data ?? []) as AbsenceClassRow[])
    : ([] as AbsenceClassRow[]);
  const classMap = Object.fromEntries(classes.map((classRow) => [classRow.id, classRow.name]));

  const absences = classIds.length
    ? (((await supabase
        .from('student_absences')
        .select('*')
        .eq('student_id', session.userId)
        .in('class_id', classIds)
        .order('reported_at', { ascending: false })
        .limit(50)).data ?? []) as StudentAbsenceRow[])
    : ([] as StudentAbsenceRow[]);

  return (
    <SectionCard
      title={t('portal.student.absent.title', 'Mark Absent')}
      description={t(
        'portal.student.absent.description',
        'Report upcoming absences. Notifications and reminder automation will be added in a later phase.'
      )}
    >
      {classes.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t('portal.student.absent.noActiveClasses', 'You have no active classes to report against.')}
        </p>
      ) : (
        <PortalAbsenceManager
          classes={classes}
          initialAbsences={absences.map((absence) => ({
            id: absence.id,
            className: classMap[absence.class_id] || absence.class_id,
            session_date: absence.session_date,
            reason: absence.reason || null,
            reported_at: absence.reported_at,
          }))}
        />
      )}
    </SectionCard>
  );
}
