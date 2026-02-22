import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';
import { fetchPayrollDataset, parsePayrollDateRange } from '@/lib/portal/payroll';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);
  const { coachId } = await params;

  const { searchParams } = new URL(request.url);
  let range;
  try {
    range = parsePayrollDateRange({
      start: searchParams.get('start'),
      end: searchParams.get('end'),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid date range.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  try {
    const dataset = await fetchPayrollDataset(supabase, {
      start: range.start,
      end: range.end,
      coachId,
    });
    const summary = dataset.summary[0] ?? null;
    return mergeCookies(supabaseResponse, NextResponse.json({
      range,
      summary,
      sessions: dataset.sessions,
    }));
  } catch (error) {
    return mergeCookies(supabaseResponse, jsonError(error instanceof Error ? error.message : 'Unable to load coach payroll detail.', 500));
  }
}
