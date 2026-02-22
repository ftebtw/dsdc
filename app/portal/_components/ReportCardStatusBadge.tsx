import type { Database } from '@/lib/supabase/database.types';

type ReportCardStatus = Database['public']['Enums']['report_card_status'];

export default function ReportCardStatusBadge({ status }: { status: ReportCardStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const classes =
    status === 'approved'
      ? 'bg-green-100 text-green-800'
      : status === 'submitted'
        ? 'bg-blue-100 text-blue-800'
        : status === 'rejected'
          ? 'bg-red-100 text-red-800'
          : 'bg-warm-200 text-navy-800';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
