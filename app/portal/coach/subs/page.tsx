import CoachSubsManager from '@/app/portal/_components/CoachSubsManager';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachSubsPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const [coachProfileRaw, classesRaw, subRequestsRaw, taRequestsRaw] = await Promise.all([
    supabase.from('coach_profiles').select('tier,is_ta').eq('coach_id', session.userId).maybeSingle(),
    supabase
      .from('classes')
      .select('*')
      .eq('coach_id', session.userId)
      .order('name', { ascending: true }),
    supabase
      .from('sub_requests')
      .select('*')
      .gte('session_date', today)
      .order('session_date', { ascending: true }),
    supabase
      .from('ta_requests')
      .select('*')
      .gte('session_date', today)
      .order('session_date', { ascending: true }),
  ]);

  const classes = (classesRaw.data ?? []) as any[];
  const subRequests = (subRequestsRaw.data ?? []) as any[];
  const taRequests = (taRequestsRaw.data ?? []) as any[];
  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow]));

  const classIdsFromRequests = [
    ...new Set([...subRequests.map((row: any) => row.class_id), ...taRequests.map((row: any) => row.class_id)]),
  ];
  const missingClassIds = classIdsFromRequests.filter((id) => !classMap[id]);
  if (missingClassIds.length) {
    const extraClassesRaw = await supabase.from('classes').select('*').in('id', missingClassIds);
    for (const classRow of extraClassesRaw.data ?? []) classMap[classRow.id] = classRow;
  }

  const personIds = [
    ...new Set([
      ...subRequests.map((row: any) => row.requesting_coach_id),
      ...subRequests.map((row: any) => row.accepting_coach_id).filter(Boolean),
      ...taRequests.map((row: any) => row.requesting_coach_id),
      ...taRequests.map((row: any) => row.accepting_ta_id).filter(Boolean),
    ]),
  ];
  const people = await getProfileMap(supabase, personIds);

  const coachTier = coachProfileRaw.data?.tier || null;
  const isTa = Boolean(coachProfileRaw.data?.is_ta);

  const subItems = subRequests.map((row: any) => {
    const classRow = classMap[row.class_id];
    const whenText = classRow
      ? formatSessionRangeForViewer(
          row.session_date,
          classRow.schedule_start_time,
          classRow.schedule_end_time,
          classRow.timezone,
          session.profile.timezone
        )
      : row.session_date;
    const isMine = row.requesting_coach_id === session.userId;
    const canAccept = row.status === 'open' && !isMine && classRow?.eligible_sub_tier === coachTier;
    return {
      ...row,
      className: classRow?.name || row.class_id,
      requestingName:
        people[row.requesting_coach_id]?.display_name || people[row.requesting_coach_id]?.email || row.requesting_coach_id,
      acceptingName: row.accepting_coach_id
        ? people[row.accepting_coach_id]?.display_name || people[row.accepting_coach_id]?.email || row.accepting_coach_id
        : null,
      whenText,
      isMine,
      canAccept,
    };
  });

  const taItems = taRequests.map((row: any) => {
    const classRow = classMap[row.class_id];
    const whenText = classRow
      ? formatSessionRangeForViewer(
          row.session_date,
          classRow.schedule_start_time,
          classRow.schedule_end_time,
          classRow.timezone,
          session.profile.timezone
        )
      : row.session_date;
    const isMine = row.requesting_coach_id === session.userId;
    const canAccept = row.status === 'open' && !isMine && isTa;
    return {
      ...row,
      className: classRow?.name || row.class_id,
      requestingName:
        people[row.requesting_coach_id]?.display_name || people[row.requesting_coach_id]?.email || row.requesting_coach_id,
      acceptingName: row.accepting_ta_id
        ? people[row.accepting_ta_id]?.display_name || people[row.accepting_ta_id]?.email || row.accepting_ta_id
        : null,
      whenText,
      isMine,
      canAccept,
    };
  });

  return (
    <SectionCard title="Sub & TA Requests" description="Create requests and accept eligible open requests.">
      <CoachSubsManager classes={classes} subRequests={subItems} taRequests={taItems} />
    </SectionCard>
  );
}
