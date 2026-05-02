export type WaitlistStatus = 'new' | 'contacted' | 'enrolled' | 'declined' | 'removed';

export type WaitlistStudent = {
  name: string;
  grade: string;
};

export type WaitlistEntryRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: WaitlistStatus | string;
  parent_name: string;
  parent_email: string | null;
  parent_phone: string | null;
  students: WaitlistStudent[] | null;
  has_debate_experience: boolean;
  debate_experience_details: string | null;
  timezone: string | null;
  location: string | null;
  preferred_days_times: string | null;
  notes: string | null;
};

export type WaitlistFormValues = {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  students: WaitlistStudent[];
  hasDebateExperience: boolean;
  debateExperienceDetails: string;
  timezone: string;
  location: string;
  preferredDaysTimes: string;
  notes: string;
  status: WaitlistStatus;
};

export const waitlistStatusOptions: Array<{ value: WaitlistStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'declined', label: 'Declined' },
  { value: 'removed', label: 'Removed' },
];

// Common IANA timezones, grouped by region for the datalist suggestions.
// Admins can type any IANA zone — this is just autocomplete help.
export const commonTimezones: ReadonlyArray<string> = [
  // Canada
  'America/Vancouver',
  'America/Edmonton',
  'America/Regina',
  'America/Winnipeg',
  'America/Toronto',
  'America/Halifax',
  'America/St_Johns',
  // United States
  'America/Los_Angeles',
  'America/Denver',
  'America/Phoenix',
  'America/Chicago',
  'America/New_York',
  'America/Anchorage',
  'Pacific/Honolulu',
  // Europe
  'Europe/London',
  'Europe/Dublin',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Athens',
  'Europe/Moscow',
  // Middle East / Africa
  'Asia/Dubai',
  'Asia/Jerusalem',
  'Africa/Cairo',
  'Africa/Johannesburg',
  // Asia
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Taipei',
  'Asia/Seoul',
  'Asia/Tokyo',
  // Oceania
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Sydney',
  'Pacific/Auckland',
  // Latin America
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
];

export function normalizeWaitlistStatus(value: string | null | undefined): WaitlistStatus {
  const matched = waitlistStatusOptions.find((option) => option.value === value);
  return matched?.value ?? 'new';
}

export function waitlistStatusLabel(value: string | null | undefined): string {
  return waitlistStatusOptions.find((option) => option.value === value)?.label ?? 'Unknown';
}

export function waitlistStatusClass(value: string | null | undefined): string {
  switch (value) {
    case 'new':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'contacted':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'enrolled':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'declined':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'removed':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    default:
      return 'bg-warm-100 text-charcoal/80 dark:bg-navy-800 dark:text-navy-200';
  }
}

export function sanitizeStudents(input: unknown): WaitlistStudent[] {
  if (!Array.isArray(input)) return [];
  const out: WaitlistStudent[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    const grade = typeof record.grade === 'string' ? record.grade.trim() : '';
    if (!name && !grade) continue;
    out.push({ name, grade });
  }
  return out;
}

export function formatStudentsSummary(students: WaitlistStudent[] | null | undefined): string {
  if (!students || students.length === 0) return '-';
  return students
    .map((student) => {
      if (student.name && student.grade) return `${student.name} (${student.grade})`;
      return student.name || student.grade;
    })
    .filter(Boolean)
    .join(', ');
}

export function emptyWaitlistValues(): WaitlistFormValues {
  return {
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    students: [{ name: '', grade: '' }],
    hasDebateExperience: false,
    debateExperienceDetails: '',
    timezone: '',
    location: '',
    preferredDaysTimes: '',
    notes: '',
    status: 'new',
  };
}

export function waitlistToFormValues(record: WaitlistEntryRecord): WaitlistFormValues {
  const students = sanitizeStudents(record.students);
  return {
    parentName: record.parent_name ?? '',
    parentEmail: record.parent_email ?? '',
    parentPhone: record.parent_phone ?? '',
    students: students.length > 0 ? students : [{ name: '', grade: '' }],
    hasDebateExperience: Boolean(record.has_debate_experience),
    debateExperienceDetails: record.debate_experience_details ?? '',
    timezone: record.timezone ?? '',
    location: record.location ?? '',
    preferredDaysTimes: record.preferred_days_times ?? '',
    notes: record.notes ?? '',
    status: normalizeWaitlistStatus(record.status),
  };
}

export function waitlistErrorMessage(value: string | null | undefined): string | null {
  if (value === 'missing_required') return 'Parent name is required.';
  if (value === 'missing_record') return 'Waitlist entry not found.';
  if (value === 'save_failed') return 'Could not save the waitlist entry. Please try again.';
  if (value === 'delete_failed') return 'Could not delete the waitlist entry. Please try again.';
  return null;
}
