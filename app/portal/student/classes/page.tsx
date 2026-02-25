export const dynamic = 'force-dynamic';

import Link from 'next/link';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm, getProfileMap } from '@/lib/portal/data';
import { classTypeLabel } from '@/lib/portal/labels';
import { formatClassScheduleForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentClassesPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();
  const activeTerm = await getActiveTerm(supabase);

  if (!activeTerm) {
    return (
      <SectionCard title="My Classes" description="No active term is configured right now.">
        <p className="text-sm text-charcoal/70 dark:text-navy-300">Please check back after the term is published.</p>
      </SectionCard>
    );
  }

  const quickLinks = (
    <SectionCard title="Quick Links" description="Use these pages to manage your term.">
      <div className="flex flex-wrap gap-2">
        <Link href="/portal/student/enroll" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Enroll in Classes
        </Link>
        <Link href="/portal/student/attendance" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Attendance
        </Link>
        <Link href="/portal/student/resources" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Resources
        </Link>
        <Link href="/portal/student/absent" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Report Absence
        </Link>
        <Link href="/portal/student/credits" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Class Credits
        </Link>
      </div>
    </SectionCard>
  );

  const { data: enrollmentRowsData } = await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .eq('status', 'active');
  const enrollmentRows = (enrollmentRowsData ?? []) as Array<Record<string, any>>;
  const classIds = enrollmentRows.map((row: any) => row.class_id);

  if (classIds.length === 0) {
    return (
      <div className="space-y-6">
        <SectionCard title="My Classes" description={`${activeTerm.name} term schedule and Zoom access.`}>
          <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
        </SectionCard>
        {quickLinks}
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: classesData }, { data: subRequestsData }, { data: taRequestsData }] =
    await Promise.all([
      supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .eq('term_id', activeTerm.id)
        .order('schedule_day'),
      supabase
        .from('sub_requests')
        .select('class_id,accepting_coach_id,session_date,status')
        .in('class_id', classIds)
        .eq('status', 'accepted')
        .gte('session_date', today)
        .order('session_date', { ascending: true }),
      supabase
        .from('ta_requests')
        .select('class_id,accepting_ta_id,session_date,status')
        .in('class_id', classIds)
        .eq('status', 'accepted')
        .gte('session_date', today)
        .order('session_date', { ascending: true }),
    ]);

  const classes = (classesData ?? []) as Array<Record<string, any>>;
  const subRequests = (subRequestsData ?? []) as Array<Record<string, any>>;
  const taRequests = (taRequestsData ?? []) as Array<Record<string, any>>;
  const coachIds = [...new Set(classes.map((classRow: any) => classRow.coach_id))];
  const subCoachIds = [...new Set(subRequests.map((row: any) => row.accepting_coach_id).filter(Boolean))];
  const taIds = [...new Set(taRequests.map((row: any) => row.accepting_ta_id).filter(Boolean))];
  const profileMap = await getProfileMap(supabase, [...new Set([...coachIds, ...subCoachIds, ...taIds])]);
  const nextSubByClass = new Map<string, any>();
  for (const subRequest of subRequests) {
    if (!nextSubByClass.has(subRequest.class_id)) {
      nextSubByClass.set(subRequest.class_id, subRequest);
    }
  }
  const nextTaByClass = new Map<string, any>();
  for (const taRequest of taRequests) {
    if (!nextTaByClass.has(taRequest.class_id)) {
      nextTaByClass.set(taRequest.class_id, taRequest);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="My Classes" description={`${activeTerm.name} term schedule and Zoom access.`}>
        {classes.length === 0 ? (
          <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
        ) : (
          <div className="space-y-4">
            {classes.map((classRow: any) => {
              const coach = profileMap[classRow.coach_id];
              const nextSub = nextSubByClass.get(classRow.id);
              const nextTa = nextTaByClass.get(classRow.id);
              return (
                <article
                  key={classRow.id}
                  className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
                >
                  <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
                  <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                    {classTypeLabel[classRow.type as keyof typeof classTypeLabel] || classRow.type} -{' '}
                    {formatClassScheduleForViewer(
                      classRow.schedule_day,
                      classRow.schedule_start_time,
                      classRow.schedule_end_time,
                      classRow.timezone,
                      session.profile.timezone
                    )}
                  </p>
                  <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                    Coach: {coach?.display_name || coach?.email || classRow.coach_id}
                  </p>
                  <p className="text-sm mt-1">
                    {classRow.zoom_link ? (
                      <>
                        Zoom:{' '}
                        <a
                          href={classRow.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-navy-700 dark:text-navy-200"
                        >
                          Join Class
                        </a>
                      </>
                    ) : (
                      <span className="text-charcoal/50 dark:text-navy-400 italic">Zoom link not yet available</span>
                    )}
                  </p>
                  {nextSub ? (
                    <p className="mt-2 text-sm rounded-md bg-gold-100 text-navy-900 px-2 py-1 inline-block">
                      Substitute coach on {nextSub.session_date}:{' '}
                      {profileMap[nextSub.accepting_coach_id]?.display_name ||
                        profileMap[nextSub.accepting_coach_id]?.email ||
                        nextSub.accepting_coach_id}
                    </p>
                  ) : null}
                  {nextTa ? (
                    <p className="mt-2 text-sm rounded-md bg-blue-100 text-navy-900 px-2 py-1 inline-block">
                      TA on {nextTa.session_date}:{' '}
                      {profileMap[nextTa.accepting_ta_id]?.display_name ||
                        profileMap[nextTa.accepting_ta_id]?.email ||
                        nextTa.accepting_ta_id}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      {quickLinks}
    </div>
  );
}
