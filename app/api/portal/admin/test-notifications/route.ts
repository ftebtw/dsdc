import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmail } from '@/lib/email/send';
import { getContactEmail } from '@/lib/email/resend';
import {
  enrollmentConfirmationFull,
  reportCardApproved,
  reportCardRejected,
  subRequestCreatedTemplate,
} from '@/lib/email/templates';
import { portalPathUrl, profilePreferenceUrl } from '@/lib/portal/phase-c';

const bodySchema = z.object({
  action: z.enum([
    'enrollment_confirmation_student',
    'enrollment_confirmation_parent',
    'report_card_approved',
    'report_card_rejected',
    'sub_request_created',
  ]),
  to: z.string().email().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function resolveTemplate(input: {
  action: z.infer<typeof bodySchema>['action'];
  adminName: string;
  locale: 'en' | 'zh';
}) {
  const portalUrl = portalPathUrl('/portal/login');
  const preferenceUrl = profilePreferenceUrl('admin');

  switch (input.action) {
    case 'enrollment_confirmation_student':
      return enrollmentConfirmationFull({
        studentName: 'Test Student',
        classes: [
          {
            name: 'Novice & Intermediate Debate',
            type: 'Debate',
            coachName: input.adminName,
            scheduleText: 'Every Tuesday, 4:00 PM - 5:00 PM PT',
            timezoneLabel: 'America/Vancouver',
            zoomLink: 'https://zoom.us/j/1234567890',
            termDates: 'January 5 - March 30, 2026',
          },
        ],
        portalLoginUrl: portalUrl,
        isParentVersion: false,
        studentNeedsPasswordSetup: true,
        contactEmail: getContactEmail(),
        locale: input.locale,
      });
    case 'enrollment_confirmation_parent':
      return enrollmentConfirmationFull({
        studentName: 'Test Student',
        parentName: 'Test Parent',
        classes: [
          {
            name: 'Public Speaking',
            type: 'Speech',
            coachName: input.adminName,
            scheduleText: 'Every Thursday, 6:00 PM - 7:00 PM PT',
            timezoneLabel: 'America/Vancouver',
            zoomLink: 'https://zoom.us/j/1234567890',
            termDates: 'January 5 - March 30, 2026',
          },
        ],
        portalLoginUrl: portalUrl,
        isParentVersion: true,
        contactEmail: getContactEmail(),
        locale: input.locale,
      });
    case 'report_card_approved':
      return reportCardApproved({
        studentName: 'Test Student',
        className: 'Advanced Debate',
        termName: 'Winter 2026',
        portalUrl,
      });
    case 'report_card_rejected':
      return reportCardRejected({
        coachName: input.adminName,
        studentName: 'Test Student',
        className: 'World Scholar\'s Cup',
        reviewerNotes: 'This is a test rejection notice from the admin dashboard test panel.',
        portalUrl,
      });
    case 'sub_request_created':
      return subRequestCreatedTemplate({
        className: 'Public Speaking',
        whenText: 'Tuesday, 4:00 PM - 5:00 PM PT',
        requestingCoach: input.adminName,
        portalUrl,
        preferenceUrl,
      });
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid request payload.');

  const recipient = parsed.data.to?.trim() || session.profile.email || null;
  if (!recipient) {
    return jsonError('No recipient email found. Add an email in your profile or enter one manually.');
  }

  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';
  const adminName =
    session.profile.display_name || session.profile.email || 'DSDC Admin';
  const message = resolveTemplate({
    action: parsed.data.action,
    adminName,
    locale,
  });
  if (!message) return jsonError('Unsupported action.', 400);

  const result = await sendPortalEmail({
    to: recipient,
    subject: `[TEST] ${message.subject}`,
    html: message.html,
    text: message.text,
  });

  if (!result.ok) {
    return jsonError(result.error || 'Failed to send test email.', 500);
  }

  return NextResponse.json({
    ok: true,
    sentTo: recipient,
    action: parsed.data.action,
    subject: `[TEST] ${message.subject}`,
  });
}
