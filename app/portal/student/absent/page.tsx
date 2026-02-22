import SectionCard from '@/app/portal/_components/SectionCard';
import PortalAbsenceManager from '@/app/portal/_components/PortalAbsenceManager';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentAbsentPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();
  const activeTerm = await getActiveTerm(supabase);

  if (!activeTerm) {
    return (
      <SectionCard title="Mark Absent" description="No active term available.">
        <p className="text-sm text-charcoal/70 dark:text-navy-300">Please contact DSDC admin.</p>
      </SectionCard>
    );
  }

  const enrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id')
    .eq('student_id', session.userId)
    .eq('status', 'active')).data ?? []) as any[];
  const classIds = enrollmentRows.map((row: any) => row.class_id);

  const classes = classIds.length
    ? (((await supabase
        .from('classes')
        .select('id,name,schedule_day,timezone')
        .in('id', classIds)
        .eq('term_id', activeTerm.id)
        .order('name')).data ?? []) as any[])
    : ([] as any[]);
  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow.name]));

  const absences = classIds.length
    ? (((await supabase
        .from('student_absences')
        .select('*')
        .eq('student_id', session.userId)
        .in('class_id', classIds)
        .order('reported_at', { ascending: false })
        .limit(50)).data ?? []) as any[])
    : ([] as any[]);

  return (
    <SectionCard
      title="Mark Absent"
      description="Report upcoming absences. Notifications and reminder automation will be added in a later phase."
    >
      {classes.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">You have no active classes to report against.</p>
      ) : (
        <PortalAbsenceManager
          classes={classes}
          initialAbsences={absences.map((absence: any) => ({
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
