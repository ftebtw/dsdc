"use client";

import type { PayrollSummaryRow } from '@/lib/portal/payroll';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type Props = {
  rows: PayrollSummaryRow[];
  showPayColumns?: boolean;
  totals?: {
    sessions: number;
    totalHours: number;
    lateCount: number;
    calculatedPay?: number;
  };
};

function formatMoney(value: number | null | undefined): string {
  if (value == null) return '-';
  return `$${value.toFixed(2)}`;
}

function formatTierLabel(tier: string): string {
  if (tier === 'wsc') return 'WSC';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function formatTiers(tiers: string[]): string {
  if (tiers.length === 0) return '-';
  return tiers.map((tier) => formatTierLabel(tier)).join(', ');
}

export default function PayrollTable({ rows, showPayColumns = true, totals }: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  return (
    <div className="overflow-x-auto rounded-xl border border-warm-200 dark:border-navy-600">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-warm-100 dark:bg-navy-800">
          <tr>
            <th className="px-3 py-2 text-left">{t('portal.payrollTable.coach', 'Coach')}</th>
            <th className="px-3 py-2 text-left">{t('portal.payrollTable.email', 'Email')}</th>
            <th className="px-3 py-2 text-left">{t('portal.payrollTable.tiers', 'Tiers')}</th>
            <th className="px-3 py-2 text-right">{t('portal.payrollTable.sessions', 'Sessions')}</th>
            <th className="px-3 py-2 text-right">{t('portal.payrollTable.hours', 'Hours')}</th>
            <th className="px-3 py-2 text-right">{t('portal.payrollTable.late', 'Late')}</th>
            {showPayColumns ? <th className="px-3 py-2 text-right">{t('portal.payrollTable.hourlyRate', 'Hourly rate')}</th> : null}
            {showPayColumns ? <th className="px-3 py-2 text-right">{t('portal.payrollTable.calculatedPay', 'Calculated pay')}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.coachId} className="border-t border-warm-200 dark:border-navy-700">
              <td className="px-3 py-2">{row.coachName}</td>
              <td className="px-3 py-2">{row.coachEmail}</td>
              <td className="px-3 py-2">{row.isTa ? t('portal.payrollTable.ta', 'TA') : formatTiers(row.coachTiers)}</td>
              <td className="px-3 py-2 text-right">{row.sessions}</td>
              <td className="px-3 py-2 text-right">{row.totalHours.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{row.lateCount}</td>
              {showPayColumns ? <td className="px-3 py-2 text-right">{formatMoney(row.hourlyRate)}</td> : null}
              {showPayColumns ? <td className="px-3 py-2 text-right">{formatMoney(row.calculatedPay)}</td> : null}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={showPayColumns ? 8 : 6}
                className="px-3 py-4 text-center text-charcoal/65 dark:text-navy-300"
              >
                {t('portal.payrollTable.empty', 'No payroll data for this range.')}
              </td>
            </tr>
          ) : null}
        </tbody>
        {totals ? (
          <tfoot className="bg-warm-100 dark:bg-navy-800 border-t border-warm-200 dark:border-navy-700">
            <tr>
              <td className="px-3 py-2 font-semibold" colSpan={3}>
                {t('portal.payrollTable.totals', 'Totals')}
              </td>
              <td className="px-3 py-2 text-right font-semibold">{totals.sessions}</td>
              <td className="px-3 py-2 text-right font-semibold">{totals.totalHours.toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-semibold">{totals.lateCount}</td>
              {showPayColumns ? <td className="px-3 py-2" /> : null}
              {showPayColumns ? (
                <td className="px-3 py-2 text-right font-semibold">{formatMoney(totals.calculatedPay ?? null)}</td>
              ) : null}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
