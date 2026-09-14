import { NextRequest, NextResponse } from 'next/server';
import { sendPortalEmail } from '@/lib/email/send';
import { payrollMonthlyReviewToCoachTemplate } from '@/lib/email/templates';
import { isCronAuthorized } from '@/lib/portal/cron';
import { fetchPayrollDataset } from '@/lib/portal/payroll';
import {
  monthPeriodDates,
  previousMonth,
  toYearMonthKey,
} from '@/lib/portal/payroll-submissions';
import { portalPathUrl } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Fires day 1 of each month at ~1 AM PT. Creates one draft submission
// per non-archived coach for the just-ended month, snapshotting their
// auto-computed hours, and emails them a link to review.
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) return jsonError('Unauthorized', 401);

  const admin = getSupabaseAdminClient();
  const target = previousMonth();
  const yearMonth = toYearMonthKey(target.year, target.month);
  const { start, end } = monthPeriodDates(target.year, target.month);

  // Non-archived, non-TA coaches. TAs also have hourly rates in some
  // cases, so include them too — the payroll dataset already knows.
  const { data: coachProfilesData, error: coachProfilesError } = await admin
    .from('coach_profiles')
    .select('coach_id,hourly_rate')
    .is('archived_at', null);

  if (coachProfilesError) return jsonError(coachProfilesError.message, 500);
  const coachProfiles = (coachProfilesData ?? []) as Array<{ coach_id: string; hourly_rate: number | null }>;
  if (coachProfiles.length === 0) {
    return NextResponse.json({ ok: true, created: 0, emailed: 0, skipped: 0, reason: 'no_coaches' });
  }

  const coachIds = coachProfiles.map((row) => row.coach_id);

  const [{ data: existingSubmissions }, { data: profilesData }] = await Promise.all([
    (admin as any)
      .from('payroll_submissions')
      .select('coach_id,status')
      .eq('year_month', yearMonth)
      .in('coach_id', coachIds),
    admin.from('profiles').select('id,email,display_name').in('id', coachIds),
  ]);

  const existingByCoach = new Map<string, string>();
  for (const row of (existingSubmissions ?? []) as Array<{ coach_id: string; status: string }>) {
    existingByCoach.set(row.coach_id, row.status);
  }
  const profileByCoach = new Map<string, { email: string | null; display_name: string | null }>();
  for (const row of (profilesData ?? []) as Array<{ id: string; email: string | null; display_name: string | null }>) {
    profileByCoach.set(row.id, { email: row.email, display_name: row.display_name });
  }

  let created = 0;
  let emailed = 0;
  let skipped = 0;

  for (const coachProfile of coachProfiles) {
    if (existingByCoach.has(coachProfile.coach_id)) {
      skipped += 1;
      continue;
    }

    // Pull just this coach's dataset for the month — cheap enough per coach
    // and keeps the snapshot self-contained.
    let computedHours = 0;
    try {
      const dataset = await fetchPayrollDataset(admin, {
        start,
        end,
        coachId: coachProfile.coach_id,
        includeManualAdjustments: false,
      });
      const summary = dataset.summary[0];
      computedHours = summary ? Number(summary.totalHours) : 0;
    } catch (error) {
      console.error('[cron:payroll] dataset fetch failed', coachProfile.coach_id, error);
      skipped += 1;
      continue;
    }

    const { data: inserted, error: insertError } = await (admin as any)
      .from('payroll_submissions')
      .insert({
        coach_id: coachProfile.coach_id,
        year_month: yearMonth,
        period_start: start,
        period_end: end,
        computed_hours: computedHours,
        hourly_rate: coachProfile.hourly_rate,
        final_hours: computedHours,
        status: 'draft',
      })
      .select('id')
      .single();

    if (insertError) {
      // 23505 = someone else got there first (safe to skip).
      if (insertError.code !== '23505') {
        console.error('[cron:payroll] insert failed', coachProfile.coach_id, insertError);
      }
      skipped += 1;
      continue;
    }

    created += 1;

    const profile = profileByCoach.get(coachProfile.coach_id);
    if (!profile?.email) continue;
    const template = payrollMonthlyReviewToCoachTemplate({
      coachName: profile.display_name || profile.email,
      monthLabel: target.label,
      computedHours,
      portalUrl: portalPathUrl(`/portal/coach/payroll-review/${inserted.id}`),
    });
    const result = await sendPortalEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    if (result.ok) emailed += 1;
  }

  return NextResponse.json({ ok: true, month: yearMonth, created, emailed, skipped });
}
