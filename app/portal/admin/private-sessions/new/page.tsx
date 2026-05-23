export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminCreatePrivateSessionForm from '@/app/portal/_components/AdminCreatePrivateSessionForm';
import { requireRole } from '@/lib/portal/auth';
import { createPrivateSessionAsAdmin } from '@/app/portal/admin/private-sessions/actions';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const ERROR_MESSAGES: Record<string, string> = {
  missing_coach: 'Please select a coach.',
  missing_student: 'Please select a student or fill out the new student fields.',
  missing_new_student_name: "Enter the new student's name.",
  invalid_new_student_email: "Enter a valid email address for the new student.",
  invalid_new_student_timezone: 'Invalid timezone for the new student.',
  invalid_date: 'Invalid session date.',
  invalid_time: 'Invalid start or end time.',
  invalid_time_range: 'End time must be after start time.',
  invalid_timezone: 'Invalid timezone.',
  invalid_price: 'Invalid price.',
  new_student_create_failed: 'Could not create the new student account (email may already be in use).',
  new_student_profile_failed: 'Could not create the new student profile.',
  session_create_failed: 'Could not create the session.',
  attendees_insert_failed: 'Could not attach additional attendees to the session.',
  too_many_attendees: 'A session can have at most 2 additional attendees.',
  duplicate_attendee: 'The same student cannot appear more than once on a session.',
  missing_group: 'Please pick an existing classroom group.',
  missing_group_name: 'Please name the new classroom group.',
  group_not_found: 'That classroom group no longer exists.',
  group_not_private: 'Selected classroom is not a private session group.',
  group_coach_mismatch: 'Selected classroom belongs to a different coach.',
  group_create_failed: 'Could not create the classroom group.',
  group_enroll_failed: 'Created the session, but enrolling students into the classroom failed.',
};

type CoachOption = {
  id: string;
  display_name: string | null;
  email: string;
  hourly_rate: number | null;
};

type StudentOption = {
  id: string;
  display_name: string | null;
  email: string;
};

type GroupOption = {
  id: string;
  name: string;
  coach_id: string;
};

type AvailabilityOption = {
  id: string;
  coach_id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
};

export default async function NewAdminPrivateSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireRole(['admin']);
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] || 'Something went wrong.' : null;

  const supabase = await getSupabaseServerClient();

  const [coachRowsRes, studentRowsRes, availabilityRowsRes, groupRowsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id,display_name,email,role')
      .in('role', ['coach', 'ta'])
      .order('display_name', { ascending: true }),
    supabase
      .from('profiles')
      .select('id,display_name,email')
      .eq('role', 'student')
      .order('display_name', { ascending: true }),
    supabase
      .from('coach_availability')
      .select('id,coach_id,available_date,start_time,end_time,timezone,is_private')
      .gte('available_date', new Date().toISOString().slice(0, 10))
      .order('available_date', { ascending: true })
      .order('start_time', { ascending: true }),
    supabase
      .from('classes')
      .select('id,name,coach_id')
      .eq('is_private_session_group', true)
      .order('name', { ascending: true }),
  ]);

  const coachRows = (coachRowsRes.data ?? []) as Array<{
    id: string;
    display_name: string | null;
    email: string;
    role: string;
  }>;

  const studentRows = (studentRowsRes.data ?? []) as StudentOption[];

  const coachIds = coachRows.map((row) => row.id);
  let coachRates: Record<string, number | null> = {};
  if (coachIds.length > 0) {
    const { data: rateRows } = await supabase
      .from('coach_profiles')
      .select('coach_id,hourly_rate')
      .in('coach_id', coachIds);
    coachRates = Object.fromEntries(
      ((rateRows ?? []) as Array<{ coach_id: string; hourly_rate: number | string | null }>).map((row) => [
        row.coach_id,
        row.hourly_rate === null ? null : Number(row.hourly_rate),
      ])
    );
  }

  const coaches: CoachOption[] = coachRows.map((row) => ({
    id: row.id,
    display_name: row.display_name,
    email: row.email,
    hourly_rate: coachRates[row.id] ?? null,
  }));

  const availability: AvailabilityOption[] = ((availabilityRowsRes.data ?? []) as Array<
    AvailabilityOption & { is_private: boolean }
  >)
    .filter((row) => row.is_private !== false)
    .map((row) => ({
      id: row.id,
      coach_id: row.coach_id,
      available_date: row.available_date,
      start_time: row.start_time,
      end_time: row.end_time,
      timezone: row.timezone,
    }));

  const groups: GroupOption[] = ((groupRowsRes.data ?? []) as GroupOption[]).map((row) => ({
    id: row.id,
    name: row.name,
    coach_id: row.coach_id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal/admin/private-sessions"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {'<- Back to Private Sessions'}
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <SectionCard
        title="Create Private Session"
        description="Admin-only: bypass the coach availability + parent booking flow. Attach a coach, optionally create a new student, and generate a payment link afterward."
      >
        <AdminCreatePrivateSessionForm
          formAction={createPrivateSessionAsAdmin}
          coaches={coaches}
          students={studentRows}
          availability={availability}
          groups={groups}
          defaultTimezone={session.profile.timezone || 'America/Vancouver'}
        />
      </SectionCard>
    </div>
  );
}
