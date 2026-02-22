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
  if (classRow.coach_id !== session.userId) notFound();

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
