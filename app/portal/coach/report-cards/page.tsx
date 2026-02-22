import SectionCard from '@/app/portal/_components/SectionCard';
import CoachReportCardsManager from '@/app/portal/_components/CoachReportCardsManager';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm, getProfileMap } from '@/lib/portal/data';
import { classTypeLabel } from '@/lib/portal/labels';
import { formatUtcForUser } from '@/lib/portal/time';
import { getReportCardLastActivityIso } from '@/lib/portal/report-cards';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachReportCardsPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();

  const activeTerm = await getActiveTerm(supabase);
  if (!activeTerm) {
    return (
      <SectionCard title="Report Cards" description="No active term is configured.">
        <p className="text-sm text-charcoal/70 dark:text-navy-300">Create and activate a term before report cards.</p>
      </SectionCard>
    );
  }

  const classes = (
    (
      await supabase
        .from('classes')
        .select('*')
        .eq('coach_id', session.userId)
        .eq('term_id', activeTerm.id)
        .order('schedule_start_time', { ascending: true })
    ).data ?? []
  ) as any[];
  const classIds = classes.map((row) => row.id);
  const enrollments = classIds.length
    ? (
        (
          await supabase
            .from('enrollments')
            .select('class_id,student_id,status')
            .in('class_id', classIds)
            .eq('status', 'active')
        ).data ?? []
      )
    : [];
  const reportCards = classIds.length
    ? (
        (
          await supabase
            .from('report_cards')
            .select('*')
            .eq('term_id', activeTerm.id)
            .in('class_id', classIds)
        ).data ?? []
      )
    : [];

  const studentIds = [
    ...new Set(((enrollments ?? []) as Array<{ student_id: string }>).map((row) => row.student_id)),
  ];
  const studentMap = await getProfileMap(supabase, studentIds);

  const reportCardMap = new Map<string, any>();
  for (const row of reportCards as any[]) {
    reportCardMap.set(`${row.class_id}|${row.student_id}`, row);
  }

  const studentsByClass = new Map<string, string[]>();
  for (const enrollment of enrollments as any[]) {
    const list = studentsByClass.get(enrollment.class_id) ?? [];
    list.push(enrollment.student_id);
    studentsByClass.set(enrollment.class_id, list);
  }

  const groups = classes.map((classRow) => {
    const students = (studentsByClass.get(classRow.id) ?? []).map((studentId) => {
      const card = reportCardMap.get(`${classRow.id}|${studentId}`) || null;
      const profile = studentMap[studentId];
      return {
        studentId,
        studentName: profile?.display_name || profile?.email || studentId,
        studentEmail: profile?.email || studentId,
        reportCard: card,
        lastActivityLabel: card
          ? formatUtcForUser(getReportCardLastActivityIso(card), session.profile.timezone)
          : null,
      };
    });

    return {
      classId: classRow.id,
      className: classRow.name,
      classType: classTypeLabel[classRow.type as keyof typeof classTypeLabel] || classRow.type,
      students,
    };
  });

  return (
    <SectionCard
      title="Report Cards"
      description={`${activeTerm.name}: upload draft PDFs and submit for admin review.`}
    >
      <CoachReportCardsManager termId={activeTerm.id} groups={groups} />
    </SectionCard>
  );
}
