import { addDays } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { NextRequest, NextResponse } from 'next/server';
import { sendPortalEmail } from '@/lib/email/send';
import { classReminderTemplate } from '@/lib/email/templates';
import { isCronAuthorized, notificationAlreadySent, recordNotificationSent } from '@/lib/portal/cron';
import { allowsClassReminder } from '@/lib/portal/notifications';
import { portalPathUrl, profilePreferenceUrl, sessionRangeForRecipient } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type ReminderType = '1day' | '1hour';

const ISO_DAY_BY_SCHEDULE: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getReminderType(minutesUntilStart: number): ReminderType | null {
  if (minutesUntilStart > 0 && minutesUntilStart <= 60) return '1hour';
  if (minutesUntilStart >= 23 * 60 && minutesUntilStart <= 24 * 60) return '1day';
  return null;
}

function getNotificationType(reminderType: ReminderType): 'class_reminder_1day' | 'class_reminder_1hour' {
  return reminderType === '1day' ? 'class_reminder_1day' : 'class_reminder_1hour';
}

function getCandidateSessionDate(input: {
  timezone: string;
  scheduleDay: string;
  termStart: string;
  termEnd: string;
  now: Date;
}): string | null {
  const expectedIsoDay = ISO_DAY_BY_SCHEDULE[input.scheduleDay];
  if (!expectedIsoDay) return null;

  for (let offset = 0; offset <= 2; offset += 1) {
    const candidateDate = formatInTimeZone(addDays(input.now, offset), input.timezone, 'yyyy-MM-dd');
    if (candidateDate < input.termStart || candidateDate > input.termEnd) continue;

    const isoDay = Number(
      formatInTimeZone(fromZonedTime(`${candidateDate}T12:00:00`, input.timezone), input.timezone, 'i')
    );

    if (isoDay === expectedIsoDay) {
      return candidateDate;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) return jsonError('Unauthorized', 401);

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

  const { data: classesData, error: classesError } = await admin
    .from('classes')
    .select('id,name,term_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link')
    .eq('term_id', activeTerm.id);

  if (classesError) return jsonError(classesError.message, 500);
  const classes = (classesData ?? []) as Array<{
    id: string;
    name: string;
    term_id: string;
    schedule_day: string;
    schedule_start_time: string;
    schedule_end_time: string;
    timezone: string;
    zoom_link: string | null;
  }>;

  if (!classes.length) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: 'no_classes' });
  }

  const classIds = classes.map((classRow) => classRow.id);
  const [enrollmentsResult, parentLinksResult] = await Promise.all([
    admin
      .from('enrollments')
      .select('class_id,student_id,status')
      .in('class_id', classIds)
      .eq('status', 'active'),
    admin
      .from('parent_student_links')
      .select('parent_id,student_id'),
  ]);

  if (enrollmentsResult.error) return jsonError(enrollmentsResult.error.message, 500);
  if (parentLinksResult.error) return jsonError(parentLinksResult.error.message, 500);

  const enrollments = (enrollmentsResult.data ?? []) as Array<{ class_id: string; student_id: string; status: string }>;
  const parentLinks = (parentLinksResult.data ?? []) as Array<{ parent_id: string; student_id: string }>;

  const studentIds = [...new Set(enrollments.map((row) => row.student_id))];
  const parentIds = [...new Set(parentLinks.map((row) => row.parent_id))];
  const recipientIds = [...new Set([...studentIds, ...parentIds])];

  const { data: profilesData, error: profilesError } = await admin
    .from('profiles')
    .select('id,email,display_name,timezone,role,notification_preferences')
    .in('id', recipientIds);

  if (profilesError) return jsonError(profilesError.message, 500);

  const profiles = (profilesData ?? []) as Array<{
    id: string;
    email: string;
    display_name: string | null;
    timezone: string;
    role: string;
    notification_preferences: Record<string, unknown> | null;
  }>;

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const parentIdsByStudent = new Map<string, string[]>();
  for (const link of parentLinks) {
    const existing = parentIdsByStudent.get(link.student_id) ?? [];
    existing.push(link.parent_id);
    parentIdsByStudent.set(link.student_id, existing);
  }

  const studentIdsByClass = new Map<string, string[]>();
  for (const enrollment of enrollments) {
    const existing = studentIdsByClass.get(enrollment.class_id) ?? [];
    existing.push(enrollment.student_id);
    studentIdsByClass.set(enrollment.class_id, existing);
  }

  let sent = 0;
  let skipped = 0;

  for (const classRow of classes) {
    const sessionDate = getCandidateSessionDate({
      timezone: classRow.timezone,
      scheduleDay: classRow.schedule_day,
      termStart: activeTerm.start_date,
      termEnd: activeTerm.end_date,
      now,
    });

    if (!sessionDate) {
      skipped += 1;
      continue;
    }

    const sessionStartUtc = fromZonedTime(`${sessionDate}T${classRow.schedule_start_time}`, classRow.timezone);
    const minutesUntilStart = Math.floor((sessionStartUtc.getTime() - now.getTime()) / 60000);
    const reminderType = getReminderType(minutesUntilStart);

    if (!reminderType) {
      skipped += 1;
      continue;
    }

    const studentIdsForClass = studentIdsByClass.get(classRow.id) ?? [];
    const recipientIdSet = new Set<string>(studentIdsForClass);
    for (const studentId of studentIdsForClass) {
      for (const parentId of parentIdsByStudent.get(studentId) ?? []) {
        recipientIdSet.add(parentId);
      }
    }

    const notificationType = getNotificationType(reminderType);
    const referenceId = `${classRow.id}_${sessionDate}`;

    for (const recipientId of recipientIdSet) {
      const recipient = profileById.get(recipientId);
      if (!recipient?.email) {
        skipped += 1;
        continue;
      }

      if (!allowsClassReminder(recipient.notification_preferences, reminderType)) {
        skipped += 1;
        continue;
      }

      const alreadySent = await notificationAlreadySent({
        admin,
        recipientId: recipient.id,
        notificationType,
        referenceId,
      });
      if (alreadySent) {
        skipped += 1;
        continue;
      }

      const whenText = sessionRangeForRecipient({
        sessionDate,
        startTime: classRow.schedule_start_time,
        endTime: classRow.schedule_end_time,
        sourceTimezone: classRow.timezone,
        recipientTimezone: recipient.timezone,
      });

      const template = classReminderTemplate({
        className: classRow.name,
        whenText,
        reminderType,
        zoomLink: classRow.zoom_link,
        portalUrl: portalPathUrl('/portal/login'),
        preferenceUrl: profilePreferenceUrl(recipient.role),
      });

      const result = await sendPortalEmail({
        to: recipient.email,
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
        recipientId: recipient.id,
        notificationType,
        referenceId,
      });
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, term: activeTerm.name });
}
