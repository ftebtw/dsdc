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

  const { data: row, error: rowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!row) return mergeCookies(supabaseResponse, jsonError('Private session not found.', 404));

  if (session.profile.role !== 'admin' && row.coach_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to complete this session.', 403));
  }
  if (row.status === 'cancelled') return mergeCookies(supabaseResponse, jsonError('Cancelled sessions cannot be completed.', 400));

  const { data: updatedRow, error: updateError } = await supabase
    .from('private_sessions')
    .update({ status: 'completed' })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
