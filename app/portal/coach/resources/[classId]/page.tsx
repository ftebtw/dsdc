export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import CoachResourceManager from '@/app/portal/_components/CoachResourceManager';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachResourcesPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();

  const { data: classRow } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .maybeSingle();
  if (!classRow) notFound();
  if (classRow.coach_id !== session.userId) {
    const [{ data: coCoach }, { data: subReq }, { data: taReq }] = await Promise.all([
      supabase
        .from('class_coaches')
        .select('id')
        .eq('class_id', classId)
        .eq('coach_id', session.userId)
        .maybeSingle(),
      supabase
        .from('sub_requests')
        .select('id')
        .eq('class_id', classId)
        .eq('accepting_coach_id', session.userId)
        .eq('status', 'accepted')
        .maybeSingle(),
      supabase
        .from('ta_requests')
        .select('id')
        .eq('class_id', classId)
        .eq('accepting_ta_id', session.userId)
        .eq('status', 'accepted')
        .maybeSingle(),
    ]);
    if (!coCoach && !subReq && !taReq) notFound();
  }

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  return (
    <SectionCard
      title={`Class Resources • ${classRow.name}`}
      description="Upload files or post external links for students."
    >
      <CoachResourceManager classId={classId} initialResources={resources ?? []} />
    </SectionCard>
  );
}
