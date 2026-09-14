import 'server-only';

export type YearMonth = { year: number; month: number; label: string };

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toYearMonthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

export function parseYearMonthKey(value: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month, label: labelForYearMonth(year, month) };
}

export function labelForYearMonth(year: number, month: number): string {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${monthNames[month - 1]} ${year}`;
}

export function monthPeriodDates(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${pad(month)}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { start, end };
}

// The "previous month relative to now" — cron on day 1 targets the month
// that just ended, so this is what the monthly cron reviews.
export function previousMonth(now = new Date()): YearMonth {
  const year = now.getUTCFullYear();
  const monthIdx = now.getUTCMonth(); // 0-11
  if (monthIdx === 0) {
    return { year: year - 1, month: 12, label: labelForYearMonth(year - 1, 12) };
  }
  return { year, month: monthIdx, label: labelForYearMonth(year, monthIdx) };
}
