import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { requireApiRole } from '@/lib/portal/auth';
import { getStripeClient } from '@/lib/stripe';
import type { PrivateSessionWorkflowRow } from '@/lib/portal/private-sessions';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

export const runtime = 'nodejs';

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
      return mergeCookies(supabaseResponse, jsonError('Not allowed to pay for this session.', 403));
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

  const priceCad = Number(row.price_cad);
  if (!Number.isFinite(priceCad) || priceCad <= 0) {
    return mergeCookies(supabaseResponse, jsonError('Session price is not configured.', 400));
  }

  const [{ data: coachProfile }, { data: studentProfile }] = await Promise.all([
    supabase.from('profiles').select('display_name,email').eq('id', row.coach_id).maybeSingle(),
    supabase.from('profiles').select('email,locale').eq('id', row.student_id).maybeSingle(),
  ]);

  const coachName = coachProfile?.display_name || coachProfile?.email || 'Coach';
  const studentLocale = studentProfile?.locale === 'zh' ? 'zh' : 'en';

  const origin = request.nextUrl.origin;
  const successBase =
    session.profile.role === 'parent'
      ? `${origin}/portal/parent/private-sessions?student=${encodeURIComponent(row.student_id)}`
      : `${origin}/portal/student/booking`;

  const paramsObj: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'cad',
          unit_amount: Math.round(priceCad * 100),
          product_data: {
            name: `Private Session with ${coachName}`,
            description: `${row.requested_date} ${row.requested_start_time.slice(0, 5)}-${row.requested_end_time.slice(0, 5)} (${row.timezone})`,
          },
        },
        quantity: 1,
      },
    ],
    customer_creation: 'always',
    customer_email: studentProfile?.email || undefined,
    locale: studentLocale,
    success_url: `${successBase}${successBase.includes('?') ? '&' : '?'}payment=success`,
    cancel_url: `${successBase}${successBase.includes('?') ? '&' : '?'}payment=cancelled`,
    metadata: {
      type: 'private_session',
      privateSessionId: row.id,
      studentId: row.student_id,
    },
  };

  try {
    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.create(paramsObj);
    if (!checkoutSession.url) {
      return mergeCookies(supabaseResponse, jsonError('Checkout session URL was not returned.', 500));
    }
    return mergeCookies(
      supabaseResponse,
      NextResponse.json({ checkoutUrl: checkoutSession.url })
    );
  } catch (error) {
    console.error('[private-session-checkout] stripe error', error);
    return mergeCookies(supabaseResponse, jsonError('Unable to start checkout right now.', 500));
  }
}
