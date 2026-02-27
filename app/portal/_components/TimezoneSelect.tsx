"use client";

import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type Props = {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
};

const fallbackTimezones = [
  'America/Vancouver',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Edmonton',
  'America/Winnipeg',
  'America/Halifax',
  'America/St_Johns',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'UTC',
];

export default function TimezoneSelect({ value, onChange, className }: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [search, setSearch] = useState('');

  const timezones = useMemo(() => {
    const intlWithSupportedValues = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[];
    };

    if (typeof intlWithSupportedValues.supportedValuesOf === 'function') {
      try {
        return intlWithSupportedValues.supportedValuesOf('timeZone');
      } catch {
        return fallbackTimezones;
      }
    }

    return fallbackTimezones;
  }, []);

  const filtered = useMemo(() => {
    if (!search) return timezones;
    const lower = search.toLowerCase();
    return timezones.filter((timezone) => timezone.toLowerCase().includes(lower));
  }, [search, timezones]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={t('portal.timezoneSelect.search', 'Search timezone...')}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className={className}
      />
      {search && filtered.length > 0 ? (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 shadow-lg text-sm">
          {filtered.slice(0, 50).map((timezone) => (
            <li
              key={timezone}
              onClick={() => {
                onChange(timezone);
                setSearch('');
              }}
              className="cursor-pointer px-3 py-1.5 hover:bg-warm-100 dark:hover:bg-navy-700"
            >
              {timezone}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-1 text-xs text-charcoal/60 dark:text-navy-400">
        {t('portal.timezoneSelect.selected', 'Selected:')} {value}
      </p>
    </div>
  );
}
