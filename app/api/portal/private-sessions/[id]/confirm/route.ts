import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import {
  privateAdminApprovedCoachTemplate,
  privateAdminApprovedTemplate,
  privatePaymentConfirmedTemplate,
} from '@/lib/email/templates';
import {
  loadPrivateSessionParticipants,
  nameOrEmail,
  sendToCoach,
  sendToStudentAndParents,
  type PrivateSessionWorkflowRow,
} from '@/lib/portal/private-sessions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  priceCad: z.number().positive().max(9999),
  zoomLink: z.string().url().max(500).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

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
  if (row.status !== 'coach_accepted' && row.status !== 'awaiting_payment') {
    return mergeCookies(
      supabaseResponse,
      jsonError('Only coach-accepted or awaiting-payment sessions can be moved forward.', 400)
    );
  }

  // Two-step admin progression on the same endpoint:
  //   coach_accepted   -> awaiting_payment  (approve + ask student to pay)
  //   awaiting_payment -> confirmed         (admin confirms payment received)
  const isConfirmingPayment = row.status === 'awaiting_payment';
  const zoomLink = parsed.data.zoomLink?.trim() || row.zoom_link || null;

  const { data: updatedData, error: updateError } = await supabase
    .from('private_sessions')
    .update(
      isConfirmingPayment
        ? {
            status: 'confirmed',
            price_cad: parsed.data.priceCad,
            zoom_link: zoomLink,
            payment_method: row.payment_method || 'etransfer',
            confirmed_at: new Date().toISOString(),
            cancelled_at: null,
            cancelled_by: null,
          }
        : {
            status: 'awaiting_payment',
            price_cad: parsed.data.priceCad,
            zoom_link: zoomLink,
            admin_approved_at: new Date().toISOString(),
            admin_approved_by: session.userId,
            cancelled_at: null,
            cancelled_by: null,
          }
    )
    .eq('id', id)
    .eq('status', row.status)
    .select('*')
    .maybeSingle();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  if (!updatedData) {
    return mergeCookies(
      supabaseResponse,
      jsonError('Session status changed — please refresh and try again.', 409)
    );
  }

  const updatedRow = updatedData as PrivateSessionWorkflowRow;
  const participants = await loadPrivateSessionParticipants(admin, updatedRow);
  const studentName = nameOrEmail(participants.student, 'Student');
  const coachName = nameOrEmail(participants.coach, 'Coach');

  if (isConfirmingPayment) {
    // awaiting_payment -> confirmed: send "session confirmed" emails.
    await sendToStudentAndParents({
      participants,
      row: updatedRow,
      includePreferenceCheck: true,
      pathByRole: {
        student: '/portal/student/booking',
        parent: '/portal/parent/private-sessions',
      },
      buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
        privatePaymentConfirmedTemplate({
          studentName,
          coachName,
          whenText,
          zoomLink: updatedRow.zoom_link,
          paymentMethod: 'etransfer',
          isCoachVersion: false,
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
          zoomLink: updatedRow.zoom_link,
          paymentMethod: 'etransfer',
          isCoachVersion: true,
          portalUrl,
          preferenceUrl,
          locale,
        }),
    });

    return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
  }

  // coach_accepted -> awaiting_payment: send approval / please-pay emails.
  await sendToStudentAndParents({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      student: '/portal/student/booking',
      parent: '/portal/parent/private-sessions',
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privateAdminApprovedTemplate({
        studentName,
        coachName,
        whenText,
        priceCad: parsed.data.priceCad,
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
      privateAdminApprovedCoachTemplate({
        coachName,
        studentName,
        whenText,
        priceCad: parsed.data.priceCad,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
