import 'server-only';
import { fromZonedTime } from 'date-fns-tz';
import type { Database } from '@/lib/supabase/database.types';

type CoachProfileRow = Database['public']['Tables']['coach_profiles']['Row'];
type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'display_name' | 'email' | 'timezone'
>;
type ClassRow = Pick<
  Database['public']['Tables']['classes']['Row'],
  'id' | 'name' | 'schedule_start_time' | 'schedule_end_time' | 'timezone'
>;
type CheckinRow = Pick<
  Database['public']['Tables']['coach_checkins']['Row'],
  'id' | 'coach_id' | 'class_id' | 'session_date' | 'checked_in_at'
>;

function isMissingTierAssignmentsTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  return code === '42P01';
}

export type PayrollDateRange = {
  start: string;
  end: string;
};

export type PayrollSessionRow = {
  id: string;
  coachId: string;
  coachName: string;
  coachEmail: string;
  coachTiers: Database['public']['Enums']['coach_tier'][];
  isTa: boolean;
  classId: string;
  className: string;
  sessionDate: string;
  checkedInAt: string;
  classStartTime: string;
  classEndTime: string;
  classTimezone: string;
  durationHours: number;
  late: boolean;
  isPrivateSession: boolean;
  studentName: string | null;
  priceCad: number | null;
};

export type PayrollPrivateSessionRow = {
  id: string;
  coachId: string;
  coachName: string;
  coachEmail: string;
  coachTiers: Database['public']['Enums']['coach_tier'][];
  isTa: boolean;
  studentName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  durationHours: number;
  priceCad: number | null;
  isPrivateSession: true;
};

export type PayrollSummaryRow = {
  coachId: string;
  coachName: string;
  coachEmail: string;
  coachTiers: Database['public']['Enums']['coach_tier'][];
  isTa: boolean;
  sessions: number;
  totalHours: number;
  lateCount: number;
  hourlyRate: number | null;
  calculatedPay: number | null;
};

export type PayrollDataset = {
  sessions: PayrollSessionRow[];
  summary: PayrollSummaryRow[];
  totals: {
    sessions: number;
    totalHours: number;
    calculatedPay: number;
    lateCount: number;
  };
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function timeToMinutes(value: string): number {
  const parts = value.split(':');
  const hours = Number(parts[0] || 0);
  const minutes = Number(parts[1] || 0);
  return hours * 60 + minutes;
}

export function scheduledDurationHours(startTime: string, endTime: string): number {
  let minutes = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (minutes <= 0) minutes += 24 * 60;
  return minutes / 60;
}

export function isLateCheckin(
  checkedInAtIso: string,
  sessionDate: string,
  classStartTime: string,
  classTimezone: string
): boolean {
  const scheduledStartUtcMs = fromZonedTime(`${sessionDate}T${classStartTime}`, classTimezone).getTime();
  const thresholdMs = scheduledStartUtcMs + 10 * 60 * 1000;
  return new Date(checkedInAtIso).getTime() > thresholdMs;
}

export function parsePayrollDateRange(input: {
  start?: string | null;
  end?: string | null;
}): PayrollDateRange {
  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const defaultStart = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-01`;

  const start = input.start && /^\d{4}-\d{2}-\d{2}$/.test(input.start) ? input.start : defaultStart;
  const end = input.end && /^\d{4}-\d{2}-\d{2}$/.test(input.end) ? input.end : defaultEnd;

  if (start > end) {
    throw new Error('Start date must be before end date.');
  }

  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);
  const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays > 366) {
    throw new Error('Date range cannot exceed 1 year.');
  }

  return { start, end };
}

export async function fetchPayrollDataset(
  supabase: any,
  input: {
    start: string;
    end: string;
    coachId?: string | null;
  }
): Promise<PayrollDataset> {
  let coachProfilesQuery = supabase.from('coach_profiles').select('coach_id,tier,is_ta,hourly_rate');
  if (input.coachId) coachProfilesQuery = coachProfilesQuery.eq('coach_id', input.coachId);

  const { data: coachProfilesData, error: coachProfilesError } = await coachProfilesQuery;
  if (coachProfilesError) throw new Error(coachProfilesError.message);
  const coachProfiles = (coachProfilesData ?? []) as CoachProfileRow[];

  const coachIds = coachProfiles.map((row) => row.coach_id);
  if (coachIds.length === 0) {
    return {
      sessions: [],
      summary: [],
      totals: { sessions: 0, totalHours: 0, calculatedPay: 0, lateCount: 0 },
    };
  }

  let checkinsQuery = supabase
    .from('coach_checkins')
    .select('id,coach_id,class_id,session_date,checked_in_at')
    .in('coach_id', coachIds)
    .gte('session_date', input.start)
    .lte('session_date', input.end)
    .order('session_date', { ascending: true })
    .order('checked_in_at', { ascending: true });
  if (input.coachId) checkinsQuery = checkinsQuery.eq('coach_id', input.coachId);

  let privateSessionsQuery = supabase
    .from('private_sessions')
    .select(
      'id,coach_id,student_id,requested_date,requested_start_time,requested_end_time,timezone,price_cad,completed_at,created_at'
    )
    .eq('status', 'completed')
    .in('coach_id', coachIds)
    .gte('requested_date', input.start)
    .lte('requested_date', input.end)
    .order('requested_date', { ascending: true })
    .order('requested_start_time', { ascending: true });
  if (input.coachId) privateSessionsQuery = privateSessionsQuery.eq('coach_id', input.coachId);

  const [checkinsResult, privateSessionsResult, profilesResult, tierAssignmentsResult] = await Promise.all([
    checkinsQuery,
    privateSessionsQuery,
    supabase.from('profiles').select('id,display_name,email,timezone').in('id', coachIds),
    supabase.from('coach_tier_assignments').select('coach_id,tier').in('coach_id', coachIds),
  ]);

  if (checkinsResult.error) throw new Error(checkinsResult.error.message);
  if (privateSessionsResult.error) throw new Error(privateSessionsResult.error.message);
  if (profilesResult.error) throw new Error(profilesResult.error.message);
  if (tierAssignmentsResult.error && !isMissingTierAssignmentsTableError(tierAssignmentsResult.error)) {
    throw new Error(tierAssignmentsResult.error.message);
  }

  const checkins = (checkinsResult.data ?? []) as CheckinRow[];
  const privateSessions = (privateSessionsResult.data ?? []) as Array<{
    id: string;
    coach_id: string;
    student_id: string;
    requested_date: string;
    requested_start_time: string;
    requested_end_time: string;
    timezone: string;
    price_cad: number | null;
    completed_at: string | null;
    created_at: string;
  }>;
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const tierAssignments = (tierAssignmentsResult.data ?? []) as Array<{
    coach_id: string;
    tier: Database['public']['Enums']['coach_tier'];
  }>;

  const classIds = [...new Set(checkins.map((row) => row.class_id))];
  const { data: classesData, error: classesError } = classIds.length
    ? await supabase
        .from('classes')
        .select('id,name,schedule_start_time,schedule_end_time,timezone')
        .in('id', classIds)
    : { data: [] as ClassRow[], error: null as { message: string } | null };
  if (classesError) throw new Error(classesError.message);
  const classes = (classesData ?? []) as ClassRow[];

  const studentIds = [...new Set(privateSessions.map((row) => row.student_id))];
  const { data: studentProfilesData, error: studentProfilesError } = studentIds.length
    ? await supabase.from('profiles').select('id,display_name,email').in('id', studentIds)
    : { data: [] as Array<{ id: string; display_name: string | null; email: string }>, error: null };
  if (studentProfilesError) throw new Error(studentProfilesError.message);

  const profileMap = Object.fromEntries(profiles.map((row) => [row.id, row])) as Record<string, ProfileRow>;
  const classMap = Object.fromEntries(classes.map((row) => [row.id, row])) as Record<string, ClassRow>;
  const coachProfileMap = Object.fromEntries(
    coachProfiles.map((row) => [row.coach_id, row])
  ) as Record<string, CoachProfileRow>;
  const tiersByCoach = new Map<string, Database['public']['Enums']['coach_tier'][]>();
  for (const assignment of tierAssignments) {
    const list = tiersByCoach.get(assignment.coach_id) ?? [];
    list.push(assignment.tier);
    tiersByCoach.set(assignment.coach_id, list);
  }

  function resolveCoachTiers(coachId: string, profile: CoachProfileRow) {
    const assigned = tiersByCoach.get(coachId) ?? [];
    if (assigned.length > 0) {
      return assigned;
    }
    if (profile.tier) {
      return [profile.tier];
    }
    return [];
  }
  const studentProfileMap = Object.fromEntries(
    ((studentProfilesData ?? []) as Array<{ id: string; display_name: string | null; email: string }>).map((row) => [
      row.id,
      row,
    ])
  ) as Record<string, { id: string; display_name: string | null; email: string }>;

  const sessions: PayrollSessionRow[] = [];
  for (const checkin of checkins) {
    const classRow = classMap[checkin.class_id];
    const coachProfile = coachProfileMap[checkin.coach_id];
    const profile = profileMap[checkin.coach_id];
    if (!classRow || !coachProfile || !profile) continue;

    const durationHours = scheduledDurationHours(
      classRow.schedule_start_time,
      classRow.schedule_end_time
    );
    const late = isLateCheckin(
      checkin.checked_in_at,
      checkin.session_date,
      classRow.schedule_start_time,
      classRow.timezone
    );

    sessions.push({
      id: checkin.id,
      coachId: checkin.coach_id,
      coachName: profile.display_name || profile.email,
      coachEmail: profile.email,
      coachTiers: resolveCoachTiers(checkin.coach_id, coachProfile),
      isTa: coachProfile.is_ta,
      classId: classRow.id,
      className: classRow.name,
      sessionDate: checkin.session_date,
      checkedInAt: checkin.checked_in_at,
      classStartTime: classRow.schedule_start_time,
      classEndTime: classRow.schedule_end_time,
      classTimezone: classRow.timezone,
      durationHours,
      late,
      isPrivateSession: false,
      studentName: null,
      priceCad: null,
    });
  }

  for (const privateSession of privateSessions) {
    const coachProfile = coachProfileMap[privateSession.coach_id];
    const profile = profileMap[privateSession.coach_id];
    if (!coachProfile || !profile) continue;

    const studentProfile = studentProfileMap[privateSession.student_id];
    const studentName = studentProfile?.display_name || studentProfile?.email || privateSession.student_id;
    const durationHours = scheduledDurationHours(
      privateSession.requested_start_time,
      privateSession.requested_end_time
    );

    const checkedInAt =
      privateSession.completed_at ||
      fromZonedTime(
        `${privateSession.requested_date}T${privateSession.requested_start_time}`,
        privateSession.timezone
      ).toISOString();

    sessions.push({
      id: privateSession.id,
      coachId: privateSession.coach_id,
      coachName: profile.display_name || profile.email,
      coachEmail: profile.email,
      coachTiers: resolveCoachTiers(privateSession.coach_id, coachProfile),
      isTa: coachProfile.is_ta,
      classId: `private:${privateSession.id}`,
      className: `Private Session - ${studentName}`,
      sessionDate: privateSession.requested_date,
      checkedInAt,
      classStartTime: privateSession.requested_start_time,
      classEndTime: privateSession.requested_end_time,
      classTimezone: privateSession.timezone,
      durationHours,
      late: false,
      isPrivateSession: true,
      studentName,
      priceCad: privateSession.price_cad ?? null,
    });
  }

  const summaryMap = new Map<string, PayrollSummaryRow>();
  for (const coachProfile of coachProfiles) {
    const profile = profileMap[coachProfile.coach_id];
    if (!profile) continue;
    summaryMap.set(coachProfile.coach_id, {
      coachId: coachProfile.coach_id,
      coachName: profile.display_name || profile.email,
      coachEmail: profile.email,
      coachTiers: resolveCoachTiers(coachProfile.coach_id, coachProfile),
      isTa: coachProfile.is_ta,
      sessions: 0,
      totalHours: 0,
      lateCount: 0,
      hourlyRate: coachProfile.hourly_rate,
      calculatedPay: coachProfile.hourly_rate == null ? null : 0,
    });
  }

  for (const row of sessions) {
    const item = summaryMap.get(row.coachId);
    if (!item) continue;
    item.sessions += 1;
    item.totalHours += row.durationHours;
    if (row.late) item.lateCount += 1;
    if (item.hourlyRate != null) {
      item.calculatedPay = (item.calculatedPay ?? 0) + row.durationHours * item.hourlyRate;
    }
  }

  const summary = [...summaryMap.values()]
    .map((row) => ({
      ...row,
      totalHours: round2(row.totalHours),
      calculatedPay: row.calculatedPay == null ? null : round2(row.calculatedPay),
    }))
    .sort((a, b) => a.coachName.localeCompare(b.coachName));

  const totals = summary.reduce(
    (acc, row) => {
      acc.sessions += row.sessions;
      acc.totalHours += row.totalHours;
      acc.lateCount += row.lateCount;
      if (row.calculatedPay != null) acc.calculatedPay += row.calculatedPay;
      return acc;
    },
    { sessions: 0, totalHours: 0, calculatedPay: 0, lateCount: 0 }
  );

  return {
    sessions: sessions.sort((a, b) => {
      if (a.sessionDate === b.sessionDate) return a.classStartTime.localeCompare(b.classStartTime);
      return a.sessionDate.localeCompare(b.sessionDate);
    }),
    summary,
    totals: {
      sessions: totals.sessions,
      totalHours: round2(totals.totalHours),
      calculatedPay: round2(totals.calculatedPay),
      lateCount: totals.lateCount,
    },
  };
}

export async function fetchPayrollTotalHours(
  supabase: any,
  input: { start: string; end: string }
): Promise<number> {
  const { data: coachProfilesData, error: coachProfilesError } = await supabase
    .from('coach_profiles')
    .select('coach_id');
  if (coachProfilesError) throw new Error(coachProfilesError.message);

  const coachIds = ((coachProfilesData ?? []) as Array<{ coach_id: string }>).map((row) => row.coach_id);
  if (coachIds.length === 0) return 0;

  const [checkinsResult, privateSessionsResult] = await Promise.all([
    supabase
      .from('coach_checkins')
      .select('class_id')
      .in('coach_id', coachIds)
      .gte('session_date', input.start)
      .lte('session_date', input.end),
    supabase
      .from('private_sessions')
      .select('requested_start_time,requested_end_time')
      .in('coach_id', coachIds)
      .eq('status', 'completed')
      .gte('requested_date', input.start)
      .lte('requested_date', input.end),
  ]);
  const { data: checkinsData, error: checkinsError } = checkinsResult;
  if (checkinsError) throw new Error(checkinsError.message);
  const { data: privateSessionsData, error: privateSessionsError } = privateSessionsResult;
  if (privateSessionsError) throw new Error(privateSessionsError.message);

  const checkins = (checkinsData ?? []) as Array<{ class_id: string }>;
  const classIds = [...new Set(checkins.map((row) => row.class_id))];
  const classDurationMap = new Map<string, number>();
  if (classIds.length > 0) {
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id,schedule_start_time,schedule_end_time')
      .in('id', classIds);
    if (classesError) throw new Error(classesError.message);
    for (const row of (classesData ?? []) as Array<{ id: string; schedule_start_time: string; schedule_end_time: string }>) {
      classDurationMap.set(row.id, scheduledDurationHours(row.schedule_start_time, row.schedule_end_time));
    }
  }

  let total = 0;
  for (const checkin of checkins) {
    total += classDurationMap.get(checkin.class_id) ?? 0;
  }
  for (const privateSession of (privateSessionsData ?? []) as Array<{ requested_start_time: string; requested_end_time: string }>) {
    total += scheduledDurationHours(privateSession.requested_start_time, privateSession.requested_end_time);
  }
  return round2(total);
}
