import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: requestRow, error: requestError } = await supabase
    .from('ta_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (requestError) return mergeCookies(supabaseResponse, jsonError(requestError.message, 400));
  if (!requestRow) return mergeCookies(supabaseResponse, jsonError('TA request not found.', 404));

  if (session.profile.role !== 'admin' && requestRow.requesting_coach_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Only requesting coach or admin can cancel this TA request.', 403));
  }

  if (requestRow.status === 'cancelled') {
    return mergeCookies(supabaseResponse, NextResponse.json({ request: requestRow }));
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from('ta_requests')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  return mergeCookies(supabaseResponse, NextResponse.json({ request: updatedRow }));
}
