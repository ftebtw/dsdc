import type { Database } from '@/lib/supabase/database.types';

type AttendanceStatus = Database['public']['Enums']['attendance_status'];

type AttendanceInput = {
  status: AttendanceStatus;
};

const statusClass: Record<AttendanceStatus, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-amber-100 text-amber-800',
  sick: 'bg-blue-100 text-blue-800',
  makeup: 'bg-purple-100 text-purple-800',
};

export function attendanceStatusClass(status: AttendanceStatus): string {
  return statusClass[status];
}

export default function AttendanceSummary({ records }: { records: AttendanceInput[] }) {
  const total = records.length;
  const present = records.filter((record) => record.status === 'present').length;
  const absent = records.filter((record) => record.status === 'absent').length;
  const late = records.filter((record) => record.status === 'late').length;
  const presentPercent = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="grid sm:grid-cols-4 gap-3">
      <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-3">
        <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Total Sessions</p>
        <p className="text-2xl font-bold text-navy-800 dark:text-white">{total}</p>
      </div>
      <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-3">
        <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Present Rate</p>
        <p className="text-2xl font-bold text-green-700">{presentPercent}%</p>
      </div>
      <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-3">
        <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Absent</p>
        <p className="text-2xl font-bold text-red-700">{absent}</p>
      </div>
      <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-3">
        <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">Late</p>
        <p className="text-2xl font-bold text-amber-700">{late}</p>
      </div>
    </div>
  );
}
