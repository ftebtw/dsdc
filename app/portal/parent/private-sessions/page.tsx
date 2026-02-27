export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import ParentBookingManager from '@/app/portal/_components/ParentBookingManager';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function stepForStatus(status: string): number {
  if (status === 'pending') return 1;
  if (status === 'rescheduled_by_coach' || status === 'rescheduled_by_student') return 2;
  if (status === 'coach_accepted') return 3;
  if (status === 'awaiting_payment') return 4;
  if (status === 'confirmed') return 5;
  if (status === 'completed') return 6;
  return 1;
}

export default async function ParentPrivateSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
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
      <SectionCard title={parentT(locale, 'portal.parent.privateSessions.title', 'Private Sessions')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No students linked to your account yet.')}
        </p>
      </SectionCard>
    );
  }
  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/private-sessions?student=${selectedStudentId}`);
  }

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: sessionRows }, { data: availabilityRaw }] = await Promise.all([
    supabase
      .from('private_sessions')
      .select('*')
      .eq('student_id', selectedStudentId)
      .order('requested_date', { ascending: true })
      .order('requested_start_time', { ascending: true }),
    supabase
      .from('coach_availability')
      .select('*')
      .eq('is_private', true)
      .gte('available_date', today)
      .order('available_date', { ascending: true })
      .order('start_time', { ascending: true }),
  ]);

  const sessions = (sessionRows ?? []) as Array<Record<string, any>>;
  const availability = (availabilityRaw ?? []) as Array<Record<string, any>>;

  const allCoachIds = [
    ...new Set([
      ...sessions.map((row: any) => row.coach_id),
      ...sessions.map((row: any) => row.proposed_by).filter(Boolean),
      ...availability.map((slot: any) => slot.coach_id),
    ]),
  ];
  const profileMap = await getProfileMap(supabase, allCoachIds);

  const availableSlots = availability.map((slot: any) => ({
    id: slot.id,
    coachName: profileMap[slot.coach_id]?.display_name || profileMap[slot.coach_id]?.email || slot.coach_id,
    whenText: (() => {
      try {
        return formatSessionRangeForViewer(
          slot.available_date,
          slot.start_time,
          slot.end_time,
          slot.timezone,
          session.profile.timezone
        );
      } catch (error) {
        console.error("[parent-private] error:", error);
        return `${slot.available_date ?? '?'} ${(slot.start_time || '').slice(0, 5)}-${(slot.end_time || '').slice(0, 5)}`;
      }
    })(),
  }));

  const items = sessions.map((row: any) => {
    const status = String(row.status || 'pending');
    return {
      ...row,
      coachName: profileMap[row.coach_id]?.display_name || profileMap[row.coach_id]?.email || row.coach_id,
      studentName: selectedStudent?.display_name || selectedStudent?.email || selectedStudentId,
      proposedByName: row.proposed_by
        ? profileMap[row.proposed_by]?.display_name || profileMap[row.proposed_by]?.email || row.proposed_by
        : null,
      whenText: (() => {
        try {
          return formatSessionRangeForViewer(
            row.requested_date,
            row.requested_start_time,
            row.requested_end_time,
            row.timezone,
            session.profile.timezone
          );
        } catch (error) {
          console.error("[parent-private] error:", error);
          return `${row.requested_date ?? '?'} ${(row.requested_start_time ?? '').slice(0, 5)}-${(row.requested_end_time ?? '').slice(0, 5)}`;
        }
      })(),
      step: stepForStatus(status),
      canAccept: false,
      canReject: false,
      canReschedule: false,
      canAcceptReschedule: false,
      canApprove: false,
      canPay: status === 'awaiting_payment',
      canCancel: false,
      canComplete: false,
    };
  });

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.privateSessions.title', 'Private Sessions')}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
      <ParentBookingManager
        availableSlots={availableSlots}
        sessions={items}
        studentId={selectedStudentId}
        locale={locale}
      />
    </SectionCard>
  );
}
