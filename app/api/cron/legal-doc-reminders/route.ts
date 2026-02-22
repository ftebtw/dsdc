import { NextRequest, NextResponse } from 'next/server';
import { sendPortalEmail } from '@/lib/email/send';
import { legalDocReminderTemplate } from '@/lib/email/templates';
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

  const admin = getSupabaseAdminClient();
  const weekRef = getNotificationWeekReference();

  const [documentsResult, signaturesResult, profilesResult, linksResult] = await Promise.all([
    admin
      .from('legal_documents')
      .select('id,title,required_for')
      .order('created_at', { ascending: false }),
    admin
      .from('legal_signatures')
      .select('id,document_id,signer_id,signer_role,signed_for_student_id'),
    admin
      .from('profiles')
      .select('id,email,display_name,role,timezone'),
    admin
      .from('parent_student_links')
      .select('parent_id,student_id'),
  ]);

  if (documentsResult.error) return jsonError(documentsResult.error.message, 500);
  if (signaturesResult.error) return jsonError(signaturesResult.error.message, 500);
  if (profilesResult.error) return jsonError(profilesResult.error.message, 500);
  if (linksResult.error) return jsonError(linksResult.error.message, 500);

  const documents = (documentsResult.data ?? []) as Array<{
    id: string;
    title: string;
    required_for: 'all_students' | 'all_coaches' | 'trip' | 'event';
  }>;
  const signatures = (signaturesResult.data ?? []) as Array<{
    id: string;
    document_id: string;
    signer_id: string;
    signer_role: string;
    signed_for_student_id?: string | null;
  }>;
  const profiles = (profilesResult.data ?? []) as Array<{
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    timezone: string;
  }>;
  const links = (linksResult.data ?? []) as Array<{ parent_id: string; student_id: string }>;

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const students = profiles.filter((profile) => profile.role === 'student');
  const coachesAndTas = profiles.filter((profile) => profile.role === 'coach' || profile.role === 'ta');
  const parentIdsByStudent = new Map<string, string[]>();
  for (const link of links) {
    const existing = parentIdsByStudent.get(link.student_id) ?? [];
    existing.push(link.parent_id);
    parentIdsByStudent.set(link.student_id, existing);
  }

  let sent = 0;
  let skipped = 0;

  for (const document of documents) {
    const docSignatures = signatures.filter((signature) => signature.document_id === document.id);

    if (document.required_for === 'all_coaches') {
      const signedCoachIds = new Set(
        docSignatures
          .filter((signature) => signature.signer_role === 'coach' || signature.signer_role === 'ta')
          .map((signature) => signature.signer_id)
      );

      for (const coach of coachesAndTas) {
        if (signedCoachIds.has(coach.id) || !coach.email) {
          skipped += 1;
          continue;
        }

        const notificationType = 'legal_reminder_weekly';
        const referenceId = `${document.id}_${coach.id}_${weekRef}`;
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

        const template = legalDocReminderTemplate({
          documentTitle: document.title,
          recipientName: coach.display_name || coach.email,
          portalUrl: portalPathUrl('/portal/login'),
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

      continue;
    }

    const signedStudentIds = new Set<string>();
    for (const signature of docSignatures) {
      if (signature.signer_role === 'student') {
        signedStudentIds.add(signature.signer_id);
      }
      if (signature.signer_role === 'parent' && signature.signed_for_student_id) {
        signedStudentIds.add(signature.signed_for_student_id);
      }
    }

    for (const student of students) {
      if (signedStudentIds.has(student.id)) {
        skipped += 1;
        continue;
      }

      const recipientIds = [student.id, ...(parentIdsByStudent.get(student.id) ?? [])];

      for (const recipientId of recipientIds) {
        const recipient = profilesById.get(recipientId);
        if (!recipient?.email) {
          skipped += 1;
          continue;
        }

        const notificationType = 'legal_reminder_weekly';
        const referenceId = `${document.id}_${recipient.id}_${weekRef}`;
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

        const template = legalDocReminderTemplate({
          documentTitle: document.title,
          recipientName: recipient.display_name || recipient.email,
          portalUrl:
            recipient.role === 'parent'
              ? portalPathUrl('/portal/parent/legal')
              : portalPathUrl('/portal/student/legal'),
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
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
