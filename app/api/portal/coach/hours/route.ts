import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';
import { fetchPayrollDataset, parsePayrollDateRange } from '@/lib/portal/payroll';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

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

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  try {
    const dataset = await fetchPayrollDataset(supabase, {
      start: range.start,
      end: range.end,
      coachId: session.userId,
    });

    return NextResponse.json({
      range,
      summary: dataset.summary[0] ?? null,
      sessions: dataset.sessions,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load hours.', 500);
  }
}
