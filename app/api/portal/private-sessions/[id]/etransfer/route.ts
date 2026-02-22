import { NextRequest, NextResponse } from 'next/server';
import {
  privateEtransferAdminNoticeTemplate,
  privateEtransferInstructionsTemplate,
  privatePaymentConfirmedTemplate,
} from '@/lib/email/templates';
import { sendPortalEmails } from '@/lib/email/send';
import { requireApiRole } from '@/lib/portal/auth';
import {
  loadPrivateSessionParticipants,
  managementEmails,
  nameOrEmail,
  sendToCoach,
  sendToStudentAndParents,
  type PrivateSessionWorkflowRow,
} from '@/lib/portal/private-sessions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: rowData, error: rowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!rowData) return mergeCookies(supabaseResponse, jsonError('Private session not found.', 404));

  const row = rowData as PrivateSessionWorkflowRow;
  if (row.status !== 'awaiting_payment') {
    return mergeCookies(supabaseResponse, jsonError('This session is not awaiting payment.', 400));
  }

  if (session.profile.role === 'student') {
    if (row.student_id !== session.userId) {
      return mergeCookies(supabaseResponse, jsonError('Not allowed to confirm payment for this session.', 403));
    }
  } else {
    const { data: linkRow } = await supabase
      .from('parent_student_links')
      .select('id')
      .eq('parent_id', session.userId)
      .eq('student_id', row.student_id)
      .maybeSingle();
    if (!linkRow) {
      return mergeCookies(supabaseResponse, jsonError('Parent is not linked to this student.', 403));
    }
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('private_sessions')
    .update({
      status: 'confirmed',
      payment_method: 'etransfer',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'awaiting_payment')
    .select('*')
    .maybeSingle();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  if (!updatedData) return mergeCookies(supabaseResponse, jsonError('Session is no longer awaiting payment.', 409));

  const updatedRow = updatedData as PrivateSessionWorkflowRow;
  const participants = await loadPrivateSessionParticipants(admin, updatedRow);
  const coachName = nameOrEmail(participants.coach, 'Coach');
  const studentName = nameOrEmail(participants.student, 'Student');
  const amountCad = Number(updatedRow.price_cad || 0);
  const etransferEmail = process.env.NEXT_PUBLIC_ETRANSFER_EMAIL || 'education.dsdc@gmail.com';

  await sendToStudentAndParents({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      student: '/portal/student/booking',
      parent: '/portal/parent/private-sessions',
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privateEtransferInstructionsTemplate({
        studentName,
        coachName,
        whenText,
        amountCad,
        etransferEmail,
        zoomLink: updatedRow.zoom_link,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  await sendToCoach({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      coach: '/portal/coach/private-sessions',
      ta: '/portal/coach/private-sessions',
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privatePaymentConfirmedTemplate({
        studentName,
        coachName,
        whenText,
        paymentMethod: 'etransfer',
        zoomLink: updatedRow.zoom_link,
        isCoachVersion: true,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  const adminEmails = managementEmails();
  if (adminEmails.length > 0) {
    const adminWhenText = `${updatedRow.requested_date} ${updatedRow.requested_start_time.slice(0, 5)}-${updatedRow.requested_end_time.slice(0, 5)} (${updatedRow.timezone})`;
    const adminTemplate = privateEtransferAdminNoticeTemplate({
      studentName,
      coachName,
      whenText: adminWhenText,
      amountCad,
      portalUrl: `${request.nextUrl.origin}/portal/admin/private-sessions`,
    });

    await sendPortalEmails(adminEmails.map((to) => ({ to, ...adminTemplate })));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
