import { addDays } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
import { sendPortalEmail } from '@/lib/email/send';
import { reportCardNudgeTemplate } from '@/lib/email/templates';
import {
  getNotificationWeekReference,
  isCronAuthorized,
  notificationAlreadySent,
  recordNotificationSent,
} from '@/lib/portal/cron';
import { portalPathUrl } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) return jsonError('Unauthorized', 401);

  if (String(process.env.PORTAL_REPORT_CARD_NUDGES_ENABLED || '').toLowerCase() !== 'true') {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: 'disabled' });
  }

  const admin = getSupabaseAdminClient();
  const now = new Date();

  const { data: activeTerm, error: termError } = await admin
    .from('terms')
    .select('id,name,start_date,end_date')
    .eq('is_active', true)
    .maybeSingle();

  if (termError) return jsonError(termError.message, 500);
  if (!activeTerm) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: 'no_active_term' });
  }

  const termEnd = new Date(`${activeTerm.end_date}T23:59:59Z`);
  const nudgeWindowStart = addDays(termEnd, -21);
  if (now < nudgeWindowStart || now > termEnd) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: 'outside_nudge_window' });
  }

  const { data: classesData, error: classesError } = await admin
    .from('classes')
    .select('id,name,coach_id,term_id')
    .eq('term_id', activeTerm.id);

  if (classesError) return jsonError(classesError.message, 500);
  const classes = (classesData ?? []) as Array<{ id: string; name: string; coach_id: string; term_id: string }>;
  if (!classes.length) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: 'no_classes' });
  }

  const classIds = classes.map((classRow) => classRow.id);
  const [enrollmentsResult, approvedCardsResult, coachesResult] = await Promise.all([
    admin
      .from('enrollments')
      .select('class_id,student_id,status')
      .in('class_id', classIds)
      .eq('status', 'active'),
    admin
      .from('report_cards')
      .select('class_id,student_id,status,term_id')
      .in('class_id', classIds)
      .eq('term_id', activeTerm.id)
      .eq('status', 'approved'),
    admin
      .from('profiles')
      .select('id,email,display_name')
      .in('id', [...new Set(classes.map((classRow) => classRow.coach_id))]),
  ]);

  if (enrollmentsResult.error) return jsonError(enrollmentsResult.error.message, 500);
  if (approvedCardsResult.error) return jsonError(approvedCardsResult.error.message, 500);
  if (coachesResult.error) return jsonError(coachesResult.error.message, 500);

  const enrollments = (enrollmentsResult.data ?? []) as Array<{ class_id: string; student_id: string; status: string }>;
  const approvedCards = (approvedCardsResult.data ?? []) as Array<{ class_id: string; student_id: string; status: string; term_id: string }>;
  const coaches = (coachesResult.data ?? []) as Array<{ id: string; email: string; display_name: string | null }>;

  const activeStudentsByClass = new Map<string, Set<string>>();
  for (const enrollment of enrollments) {
    if (!activeStudentsByClass.has(enrollment.class_id)) {
      activeStudentsByClass.set(enrollment.class_id, new Set());
    }
    activeStudentsByClass.get(enrollment.class_id)?.add(enrollment.student_id);
  }

  const approvedStudentsByClass = new Map<string, Set<string>>();
  for (const reportCard of approvedCards) {
    if (!approvedStudentsByClass.has(reportCard.class_id)) {
      approvedStudentsByClass.set(reportCard.class_id, new Set());
    }
    approvedStudentsByClass.get(reportCard.class_id)?.add(reportCard.student_id);
  }

  const coachById = new Map(coaches.map((coach) => [coach.id, coach]));
  const weekRef = getNotificationWeekReference(now);

  let sent = 0;
  let skipped = 0;

  for (const classRow of classes) {
    const activeStudents = activeStudentsByClass.get(classRow.id) ?? new Set<string>();
    if (!activeStudents.size) {
      skipped += 1;
      continue;
    }

    const approvedStudents = approvedStudentsByClass.get(classRow.id) ?? new Set<string>();
    const missingCount = [...activeStudents].filter((studentId) => !approvedStudents.has(studentId)).length;
    if (missingCount <= 0) {
      skipped += 1;
      continue;
    }

    const coach = coachById.get(classRow.coach_id);
    if (!coach?.email) {
      skipped += 1;
      continue;
    }

    const notificationType = 'report_card_nudge';
    const referenceId = `${classRow.id}_${weekRef}`;
    const alreadySent = await notificationAlreadySent({
      admin,
      recipientId: coach.id,
      notificationType,
      referenceId,
    });
    if (alreadySent) {
      skipped += 1;
      continue;
    }

    const template = reportCardNudgeTemplate({
      coachName: coach.display_name || coach.email,
      className: classRow.name,
      missingCount,
      termEndDate: activeTerm.end_date,
      portalUrl: portalPathUrl('/portal/coach/report-cards'),
    });

    const result = await sendPortalEmail({
      to: coach.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!result.ok) {
      skipped += 1;
      continue;
    }

    await recordNotificationSent({
      admin,
      recipientId: coach.id,
      notificationType,
      referenceId,
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, skipped, term: activeTerm.name });
}
