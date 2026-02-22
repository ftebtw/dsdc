import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { type PrivateSessionWorkflowRow } from '@/lib/portal/private-sessions';
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

  const { data: rowData, error: rowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!rowData) return mergeCookies(supabaseResponse, jsonError('Private session not found.', 404));

  const row = rowData as PrivateSessionWorkflowRow;
  if (session.profile.role !== 'admin' && row.coach_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to complete this session.', 403));
  }

  if (row.status !== 'confirmed') {
    return mergeCookies(supabaseResponse, jsonError('Only confirmed sessions can be marked complete.', 400));
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from('private_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'confirmed')
    .select('*')
    .maybeSingle();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  if (!updatedRow) return mergeCookies(supabaseResponse, jsonError('Session is no longer confirmed.', 409));

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
