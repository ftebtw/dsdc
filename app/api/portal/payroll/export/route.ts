import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';
import { fetchPayrollDataset, parsePayrollDateRange } from '@/lib/portal/payroll';

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ['admin']);
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

  const coachId = searchParams.get('coachId');
  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  try {
    const dataset = await fetchPayrollDataset(supabase, {
      start: range.start,
      end: range.end,
      coachId: coachId || undefined,
    });

    const header = [
      'coach_name',
      'coach_email',
      'tier',
      'is_ta',
      'sessions',
      'total_hours',
      'late_count',
      'hourly_rate',
      'calculated_pay',
      'date_range_start',
      'date_range_end',
    ];

    const lines = dataset.summary.map((row) =>
      [
        row.coachName,
        row.coachEmail,
        row.coachTier,
        row.isTa ? 'true' : 'false',
        String(row.sessions),
        row.totalHours.toFixed(2),
        String(row.lateCount),
        row.hourlyRate == null ? '' : row.hourlyRate.toFixed(2),
        row.calculatedPay == null ? '' : row.calculatedPay.toFixed(2),
        range.start,
        range.end,
      ]
        .map(csvEscape)
        .join(',')
    );

    const csv = [header.join(','), ...lines].join('\n');
    const filename = `dsdc-payroll-${range.start}-to-${range.end}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to export payroll data.', 500);
  }
}
