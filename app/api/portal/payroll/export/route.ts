import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';
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
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  try {
    const dataset = await fetchPayrollDataset(supabase, {
      start: range.start,
      end: range.end,
      coachId: coachId || undefined,
    });

    const header = [
      'coach_name',
      'coach_email',
      'type',
      'tier',
      'is_ta',
      'session_date',
      'session_name',
      'student_name',
      'duration_hours',
      'late',
      'hourly_rate',
      'calculated_pay',
      'date_range_start',
      'date_range_end',
    ];

    const summaryByCoach = new Map(dataset.summary.map((row) => [row.coachId, row]));

    const lines = dataset.sessions.map((row) => {
      const coachSummary = summaryByCoach.get(row.coachId);
      const hourlyRate = coachSummary?.hourlyRate ?? null;
      const calculatedPay = hourlyRate == null ? null : row.durationHours * hourlyRate;

      return [
        row.coachName,
        row.coachEmail,
        row.isPrivateSession ? 'Private' : 'Group',
        row.coachTier ?? '',
        row.isTa ? 'true' : 'false',
        row.sessionDate,
        row.className,
        row.studentName ?? '',
        row.durationHours.toFixed(2),
        row.late ? 'true' : 'false',
        hourlyRate == null ? '' : hourlyRate.toFixed(2),
        calculatedPay == null ? '' : calculatedPay.toFixed(2),
        range.start,
        range.end,
      ]
        .map(csvEscape)
        .join(',');
    });

    if (lines.length === 0) {
      lines.push(
        [
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '0.00',
          '',
          '',
          '',
          range.start,
          range.end,
        ]
          .map(csvEscape)
          .join(',')
      );
    }

    const csv = [header.join(','), ...lines].join('\n');
    const filename = `dsdc-payroll-${range.start}-to-${range.end}.csv`;

    return mergeCookies(supabaseResponse, new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    }));
  } catch (error) {
    return mergeCookies(supabaseResponse, jsonError(error instanceof Error ? error.message : 'Unable to export payroll data.', 500));
  }
}

