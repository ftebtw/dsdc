import { NextRequest, NextResponse } from 'next/server';
import { formatInTimeZone } from 'date-fns-tz';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { absenceReported } from '@/lib/email/templates';
import { parseCsvEmails } from '@/lib/portal/cron';
import { shouldSendNotification } from '@/lib/portal/notifications';
import { portalPathUrl, profilePreferenceUrl } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  classId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(1000).optional(),
  studentId: z.string().uuid().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { data: classRow } = await supabase
    .from('classes')
    .select('id,timezone')
    .eq('id', parsed.data.classId)
    .maybeSingle();
  if (!classRow) return mergeCookies(supabaseResponse, jsonError('Class not found.', 404));

  const classTimezone = classRow.timezone || 'America/Vancouver';
  const todayInClassTz = formatInTimeZone(new Date(), classTimezone, 'yyyy-MM-dd');
  if (parsed.data.sessionDate < todayInClassTz) {
    return mergeCookies(supabaseResponse, jsonError('Absence date must be upcoming.'));
  }
  const targetStudentId =
    session.profile.role === 'student' ? session.userId : parsed.data.studentId || null;

  if (!targetStudentId) return mergeCookies(supabaseResponse, jsonError('Student is required.', 400));

  const { data, error } = await supabase
    .from('student_absences')
    .insert({
      class_id: parsed.data.classId,
      student_id: targetStudentId,
      session_date: parsed.data.sessionDate,
      reason: parsed.data.reason || null,
      reported_by: session.userId,
    })
    .select('*')
    .single();

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));

  try {
    const admin = getSupabaseAdminClient();
    const [{ data: classRow }, { data: studentProfile }, { data: reporterProfile }, { data: parentLinks }] =
      await Promise.all([
        admin.from('classes').select('id,name').eq('id', parsed.data.classId).maybeSingle(),
        admin
          .from('profiles')
          .select('id,email,display_name,notification_preferences,role')
          .eq('id', targetStudentId)
          .maybeSingle(),
        admin.from('profiles').select('id,email,display_name,role').eq('id', session.userId).maybeSingle(),
        admin.from('parent_student_links').select('parent_id').eq('student_id', targetStudentId),
      ]);

    const parentIds = [
      ...new Set(
        ((parentLinks ?? []) as Array<{ parent_id: string | null }>)
          .map((link) => link.parent_id)
          .filter((value): value is string => Boolean(value))
      ),
    ];
    const parentProfiles = parentIds.length
      ? (
          (
            await admin
              .from('profiles')
              .select('id,email,display_name,notification_preferences,role')
              .in('id', parentIds)
              .eq('role', 'parent')
          ).data ?? []
        )
      : [];

    const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];
    const className = classRow?.name || 'Class';
    const studentName = studentProfile?.display_name || studentProfile?.email || 'Student';
    const reporterName = reporterProfile?.display_name || reporterProfile?.email || session.profile.role;

    if (session.profile.role === 'student') {
      for (const parent of parentProfiles) {
        if (!parent?.email) continue;
        if (!shouldSendNotification(parent.notification_preferences as Record<string, unknown> | null, 'absence_alerts', true)) {
          continue;
        }
        messages.push({
          to: parent.email,
          ...absenceReported({
            studentName,
            className,
            sessionDate: parsed.data.sessionDate,
            reportedBy: reporterName,
            portalUrl: portalPathUrl('/portal/parent/absent'),
            preferenceUrl: profilePreferenceUrl(parent.role),
          }),
        });
      }
    } else {
      if (
        studentProfile?.email &&
        shouldSendNotification(
          studentProfile.notification_preferences as Record<string, unknown> | null,
          'absence_alerts',
          true
        )
      ) {
        messages.push({
          to: studentProfile.email,
          ...absenceReported({
            studentName,
            className,
            sessionDate: parsed.data.sessionDate,
            reportedBy: reporterName,
            portalUrl: portalPathUrl('/portal/student/absent'),
            preferenceUrl: profilePreferenceUrl(studentProfile.role),
          }),
        });
      }
    }

    const managementEmails = parseCsvEmails(process.env.PORTAL_MANAGEMENT_EMAILS);
    for (const managementEmail of managementEmails) {
      messages.push({
        to: managementEmail,
        ...absenceReported({
          studentName,
          className,
          sessionDate: parsed.data.sessionDate,
          reportedBy: reporterName,
          portalUrl: portalPathUrl('/portal/admin/students'),
        }),
      });
    }

    if (messages.length) {
      await sendPortalEmails(messages);
    }
  } catch (emailError) {
    console.error('[absences] notification send failed', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      classId: parsed.data.classId,
      studentId: targetStudentId,
    });
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ absence: data }));
}

