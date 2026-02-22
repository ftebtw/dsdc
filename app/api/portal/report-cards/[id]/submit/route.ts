import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';
import { canSubmitReportCard } from '@/lib/portal/report-cards';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: row, error: rowError } = await supabase
    .from('report_cards')
    .select('id,status,written_by,class_id')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!row) return mergeCookies(supabaseResponse, jsonError('Report card not found.', 404));

  const { data: classRow } = await supabase
    .from('classes')
    .select('id,coach_id')
    .eq('id', row.class_id)
    .maybeSingle();

  if (!classRow || classRow.coach_id !== session.userId || row.written_by !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to submit this report card.', 403));
  }
  if (!canSubmitReportCard(row.status)) {
    return mergeCookies(supabaseResponse, jsonError('Report card cannot be submitted from current status.', 409));
  }

  const { data: updated, error: updateError } = await supabase
    .from('report_cards')
    .update({ status: 'submitted' })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  return mergeCookies(supabaseResponse, NextResponse.json({ reportCard: updated }));
}
