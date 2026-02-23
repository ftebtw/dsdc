const TIMEZONES = [
  { value: 'America/Vancouver', label: 'Pacific - Vancouver (PT)' },
  { value: 'America/Los_Angeles', label: 'Pacific - Los Angeles (PT)' },
  { value: 'America/Edmonton', label: 'Mountain - Edmonton (MT)' },
  { value: 'America/Denver', label: 'Mountain - Denver (MT)' },
  { value: 'America/Winnipeg', label: 'Central - Winnipeg (CT)' },
  { value: 'America/Chicago', label: 'Central - Chicago (CT)' },
  { value: 'America/Toronto', label: 'Eastern - Toronto (ET)' },
  { value: 'America/New_York', label: 'Eastern - New York (ET)' },
  { value: 'America/Halifax', label: 'Atlantic - Halifax (AT)' },
  { value: 'America/St_Johns', label: "Newfoundland - St. John's (NT)" },
  { value: 'America/Phoenix', label: 'Arizona - Phoenix (no DST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii - Honolulu (HT)' },
  { value: 'America/Anchorage', label: 'Alaska - Anchorage (AKT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Shanghai', label: 'Shanghai / Beijing (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
  { value: 'UTC', label: 'UTC' },
] as const;

type Props = {
  name: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
};

export default function TimezoneSelectNative({
  name,
  defaultValue = 'America/Vancouver',
  className,
  required,
}: Props) {
  return (
    <select name={name} defaultValue={defaultValue} className={className} required={required}>
      {TIMEZONES.map((timezone) => (
        <option key={timezone.value} value={timezone.value}>
          {timezone.label}
        </option>
      ))}
    </select>
  );
}
