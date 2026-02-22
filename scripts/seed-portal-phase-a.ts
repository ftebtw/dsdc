import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase/database.types';

type Role = Database['public']['Enums']['app_role'];
type CoachTier = Database['public']['Enums']['coach_tier'];
type ClassType = Database['public']['Enums']['class_type'];
type ScheduleDay = Database['public']['Enums']['schedule_day'];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_PASSWORD = process.env.PORTAL_SEED_PASSWORD || 'PortalSeed123!Temp';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type SeedUser = {
  email: string;
  displayName: string;
  role: Role;
  timezone?: string;
  locale?: Database['public']['Enums']['locale_code'];
  phone?: string;
};

async function getUserByEmail(email: string) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function ensureAuthUser(user: SeedUser) {
  const metadata = {
    role: user.role,
    display_name: user.displayName,
    timezone: user.timezone || 'America/Vancouver',
    locale: user.locale || 'en',
    phone: user.phone,
  };

  const existing = await getUserByEmail(user.email);
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      user_metadata: metadata,
      email_confirm: true,
      password: SEED_PASSWORD,
    });
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) throw error;
  if (!data.user?.id) throw new Error(`Failed to create user: ${user.email}`);
  return data.user.id;
}

async function upsertProfile(userId: string, user: SeedUser) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: user.email,
      role: user.role,
      display_name: user.displayName,
      timezone: user.timezone || 'America/Vancouver',
      locale: user.locale || 'en',
      phone: user.phone || null,
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

async function ensureCoachProfile(coachId: string, tier: CoachTier, isTa: boolean) {
  const { error } = await supabase.from('coach_profiles').upsert(
    { coach_id: coachId, tier, is_ta: isTa },
    { onConflict: 'coach_id' }
  );
  if (error) throw error;
}

async function ensureTerm() {
  const { data: existing } = await supabase.from('terms').select('*').eq('name', 'Winter 2026').maybeSingle();

  await supabase.from('terms').update({ is_active: false }).eq('is_active', true);

  if (existing) {
    const { error } = await supabase
      .from('terms')
      .update({
        start_date: '2026-01-05',
        end_date: '2026-03-31',
        weeks: 13,
        is_active: true,
      })
      .eq('id', existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from('terms')
    .insert({
      name: 'Winter 2026',
      start_date: '2026-01-05',
      end_date: '2026-03-31',
      weeks: 13,
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

type SeedClass = {
  name: string;
  type: ClassType;
  coachId: string;
  scheduleDay: ScheduleDay;
  startTime: string;
  endTime: string;
  maxStudents: number;
  subTier: CoachTier;
};

async function ensureClass(termId: string, row: SeedClass) {
  const { data: existing } = await supabase
    .from('classes')
    .select('*')
    .eq('term_id', termId)
    .eq('name', row.name)
    .maybeSingle();

  const payload = {
    term_id: termId,
    name: row.name,
    type: row.type,
    coach_id: row.coachId,
    schedule_day: row.scheduleDay,
    schedule_start_time: row.startTime,
    schedule_end_time: row.endTime,
    timezone: 'America/Vancouver',
    max_students: row.maxStudents,
    eligible_sub_tier: row.subTier,
    zoom_link: 'https://zoom.us/j/placeholder',
    description: `${row.name} seed class`,
  };

  if (existing) {
    const { error } = await supabase.from('classes').update(payload).eq('id', existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase.from('classes').insert(payload).select('id').single();
  if (error) throw error;
  return data.id;
}

async function ensureEnrollment(studentId: string, classId: string) {
  const { error } = await supabase
    .from('enrollments')
    .upsert({ student_id: studentId, class_id: classId, status: 'active' }, { onConflict: 'student_id,class_id' });
  if (error) throw error;
}

function addDaysYmd(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function ensureAvailability(
  coachId: string,
  availableDate: string,
  startTime: string,
  endTime: string,
  isGroup: boolean,
  isPrivate: boolean
) {
  const { data: existing } = await supabase
    .from('coach_availability')
    .select('*')
    .eq('coach_id', coachId)
    .eq('available_date', availableDate)
    .eq('start_time', startTime)
    .eq('end_time', endTime)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('coach_availability')
      .update({
        timezone: 'America/Vancouver',
        is_group: isGroup,
        is_private: isPrivate,
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('coach_availability')
    .insert({
      coach_id: coachId,
      available_date: availableDate,
      start_time: startTime,
      end_time: endTime,
      timezone: 'America/Vancouver',
      is_group: isGroup,
      is_private: isPrivate,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureSubRequest(
  requestingCoachId: string,
  classId: string,
  sessionDate: string,
  status: 'open' | 'accepted' | 'cancelled',
  acceptingCoachId?: string
) {
  const { data: existing } = await supabase
    .from('sub_requests')
    .select('*')
    .eq('requesting_coach_id', requestingCoachId)
    .eq('class_id', classId)
    .eq('session_date', sessionDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('sub_requests')
      .update({
        status,
        accepting_coach_id: acceptingCoachId || null,
        accepted_at: status === 'accepted' ? new Date().toISOString() : null,
      })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('sub_requests').insert({
    requesting_coach_id: requestingCoachId,
    class_id: classId,
    session_date: sessionDate,
    reason: 'Seeded Phase C request',
    status,
    accepting_coach_id: acceptingCoachId || null,
    accepted_at: status === 'accepted' ? new Date().toISOString() : null,
  });
  if (error) throw error;
}

async function ensureTaRequest(
  requestingCoachId: string,
  classId: string,
  sessionDate: string,
  status: 'open' | 'accepted' | 'cancelled',
  acceptingTaId?: string
) {
  const { data: existing } = await supabase
    .from('ta_requests')
    .select('*')
    .eq('requesting_coach_id', requestingCoachId)
    .eq('class_id', classId)
    .eq('session_date', sessionDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('ta_requests')
      .update({
        status,
        accepting_ta_id: acceptingTaId || null,
        accepted_at: status === 'accepted' ? new Date().toISOString() : null,
      })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('ta_requests').insert({
    requesting_coach_id: requestingCoachId,
    class_id: classId,
    session_date: sessionDate,
    reason: 'Seeded Phase C TA request',
    status,
    accepting_ta_id: acceptingTaId || null,
    accepted_at: status === 'accepted' ? new Date().toISOString() : null,
  });
  if (error) throw error;
}

async function ensurePrivateSession(
  studentId: string,
  coachId: string,
  availabilityId: string | null,
  requestedDate: string,
  startTime: string,
  endTime: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
) {
  const { data: existing } = await (supabase as any)
    .from('private_sessions')
    .select('*')
    .eq('student_id', studentId)
    .eq('coach_id', coachId)
    .eq('requested_date', requestedDate)
    .eq('requested_start_time', startTime)
    .maybeSingle();

  if (existing) {
    const { error } = await (supabase as any)
      .from('private_sessions')
      .update({
        availability_id: availabilityId,
        requested_end_time: endTime,
        timezone: 'America/Vancouver',
        status,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
        cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
      })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await (supabase as any).from('private_sessions').insert({
    student_id: studentId,
    coach_id: coachId,
    availability_id: availabilityId,
    requested_date: requestedDate,
    requested_start_time: startTime,
    requested_end_time: endTime,
    timezone: 'America/Vancouver',
    status,
    student_notes: 'Seeded request',
    confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
    cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
  });
  if (error) throw error;
}

async function run() {
  console.log('Seeding Phase A portal data...');

  const adminId = await ensureAuthUser({
    email: 'admin@dsdc.local',
    displayName: 'DSDC Admin',
    role: 'admin',
  });
  await upsertProfile(adminId, {
    email: 'admin@dsdc.local',
    displayName: 'DSDC Admin',
    role: 'admin',
  });

  const coachUsers: Array<{ user: SeedUser; tier: CoachTier; isTa: boolean }> = [
    {
      user: { email: 'coach.junior@dsdc.local', displayName: 'Coach Junior', role: 'coach' },
      tier: 'junior',
      isTa: false,
    },
    {
      user: { email: 'coach.senior@dsdc.local', displayName: 'Coach Senior', role: 'coach' },
      tier: 'senior',
      isTa: false,
    },
    {
      user: { email: 'coach.wsc@dsdc.local', displayName: 'Coach WSC', role: 'coach' },
      tier: 'wsc',
      isTa: false,
    },
    {
      user: { email: 'ta.assistant@dsdc.local', displayName: 'TA Assistant', role: 'ta' },
      tier: 'junior',
      isTa: true,
    },
  ];

  const coachIds: Record<string, string> = {};
  for (const coach of coachUsers) {
    const id = await ensureAuthUser(coach.user);
    await upsertProfile(id, coach.user);
    await ensureCoachProfile(id, coach.tier, coach.isTa);
    coachIds[coach.user.email] = id;
  }

  const students: SeedUser[] = [
    { email: 'student.1@dsdc.local', displayName: 'Student One', role: 'student' },
    { email: 'student.2@dsdc.local', displayName: 'Student Two', role: 'student' },
    { email: 'student.3@dsdc.local', displayName: 'Student Three', role: 'student' },
    { email: 'student.4@dsdc.local', displayName: 'Student Four', role: 'student' },
    { email: 'student.5@dsdc.local', displayName: 'Student Five', role: 'student' },
  ];

  const studentIds: string[] = [];
  for (const student of students) {
    const id = await ensureAuthUser(student);
    await upsertProfile(id, student);
    studentIds.push(id);
  }

  const parents: SeedUser[] = [
    { email: 'parent.1@dsdc.local', displayName: 'Parent One', role: 'parent' },
    { email: 'parent.2@dsdc.local', displayName: 'Parent Two', role: 'parent' },
  ];

  const parentIds: string[] = [];
  for (const parent of parents) {
    const id = await ensureAuthUser(parent);
    await upsertProfile(id, parent);
    parentIds.push(id);
  }

  const parentLinks = [
    { parent_id: parentIds[0], student_id: studentIds[0] },
    { parent_id: parentIds[0], student_id: studentIds[1] },
    { parent_id: parentIds[1], student_id: studentIds[2] },
    { parent_id: parentIds[1], student_id: studentIds[3] },
  ];

  for (const link of parentLinks) {
    const { error } = await supabase
      .from('parent_student_links')
      .upsert(link, { onConflict: 'parent_id,student_id' });
    if (error) throw error;
  }

  const termId = await ensureTerm();

  const classIds: Record<string, string> = {};
  classIds.novice = await ensureClass(termId, {
    name: 'Novice Debate A',
    type: 'novice_debate',
    coachId: coachIds['coach.junior@dsdc.local'],
    scheduleDay: 'mon',
    startTime: '16:00',
    endTime: '17:00',
    maxStudents: 12,
    subTier: 'junior',
  });
  classIds.intermediate = await ensureClass(termId, {
    name: 'Intermediate Debate B',
    type: 'intermediate_debate',
    coachId: coachIds['coach.senior@dsdc.local'],
    scheduleDay: 'wed',
    startTime: '17:00',
    endTime: '18:00',
    maxStudents: 12,
    subTier: 'senior',
  });
  classIds.publicSpeaking = await ensureClass(termId, {
    name: 'Public Speaking C',
    type: 'public_speaking',
    coachId: coachIds['coach.junior@dsdc.local'],
    scheduleDay: 'thu',
    startTime: '16:30',
    endTime: '17:30',
    maxStudents: 10,
    subTier: 'junior',
  });
  classIds.wsc = await ensureClass(termId, {
    name: 'WSC Prep D',
    type: 'wsc',
    coachId: coachIds['coach.wsc@dsdc.local'],
    scheduleDay: 'sat',
    startTime: '10:00',
    endTime: '11:30',
    maxStudents: 14,
    subTier: 'wsc',
  });

  await ensureEnrollment(studentIds[0], classIds.novice);
  await ensureEnrollment(studentIds[1], classIds.novice);
  await ensureEnrollment(studentIds[2], classIds.intermediate);
  await ensureEnrollment(studentIds[3], classIds.publicSpeaking);
  await ensureEnrollment(studentIds[4], classIds.wsc);
  await ensureEnrollment(studentIds[0], classIds.wsc);

  // Phase C seed rows (idempotent)
  const slotA = await ensureAvailability(coachIds['coach.junior@dsdc.local'], addDaysYmd(2), '15:00', '16:00', true, true);
  const slotB = await ensureAvailability(coachIds['coach.senior@dsdc.local'], addDaysYmd(3), '16:30', '17:30', false, true);
  const slotC = await ensureAvailability(coachIds['coach.wsc@dsdc.local'], addDaysYmd(5), '18:00', '19:00', true, false);

  await ensureSubRequest(
    coachIds['coach.junior@dsdc.local'],
    classIds.novice,
    addDaysYmd(4),
    'open'
  );
  await ensureSubRequest(
    coachIds['coach.senior@dsdc.local'],
    classIds.intermediate,
    addDaysYmd(6),
    'accepted',
    coachIds['coach.wsc@dsdc.local']
  );

  await ensureTaRequest(
    coachIds['coach.junior@dsdc.local'],
    classIds.publicSpeaking,
    addDaysYmd(4),
    'open'
  );
  await ensureTaRequest(
    coachIds['coach.wsc@dsdc.local'],
    classIds.wsc,
    addDaysYmd(7),
    'accepted',
    coachIds['ta.assistant@dsdc.local']
  );

  await ensurePrivateSession(
    studentIds[0],
    coachIds['coach.junior@dsdc.local'],
    slotA,
    addDaysYmd(2),
    '15:00',
    '16:00',
    'pending'
  );
  await ensurePrivateSession(
    studentIds[1],
    coachIds['coach.senior@dsdc.local'],
    slotB,
    addDaysYmd(3),
    '16:30',
    '17:30',
    'confirmed'
  );
  await ensurePrivateSession(
    studentIds[2],
    coachIds['coach.junior@dsdc.local'],
    null,
    addDaysYmd(1),
    '14:00',
    '15:00',
    'cancelled'
  );
  await ensurePrivateSession(
    studentIds[3],
    coachIds['coach.wsc@dsdc.local'],
    slotC,
    addDaysYmd(5),
    '18:00',
    '19:00',
    'completed'
  );

  console.log('Portal Phase A seed complete.');
  console.log('Seed password for all users:', SEED_PASSWORD);
  console.log('Accounts:');
  console.log('- admin@dsdc.local (admin)');
  console.log('- coach.junior@dsdc.local (coach)');
  console.log('- coach.senior@dsdc.local (coach)');
  console.log('- coach.wsc@dsdc.local (coach)');
  console.log('- ta.assistant@dsdc.local (ta)');
  console.log('- student.1@dsdc.local .. student.5@dsdc.local (students)');
  console.log('- parent.1@dsdc.local, parent.2@dsdc.local (parents)');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
