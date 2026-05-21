export type ConsultationStatus =
  | 'new'
  | 'follow_up'
  | 'registered'
  | 'declined'
  | 'no_show'
  | 'rescheduled'
  | 'trial_class';

export type ConsultationStudent = {
  id: string;
  consultation_id: string;
  student_name: string;
  student_grade: string | null;
  student_age: number | null;
  student_school: string | null;
  recommended_class: string | null;
  sort_order: number;
  created_at: string;
};

export type ConsultationRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: ConsultationStatus[] | string[];
  parent_name: string;
  parent_email: string | null;
  parent_phone: string | null;
  preferred_language: string | null;
  location_timezone: string | null;
  how_found_us: string | null;
  how_found_us_details: string | null;
  has_prior_experience: boolean;
  prior_experience_details: string | null;
  goals: string | null;
  next_steps: string | null;
  notes: string | null;
  consult_date: string;
  students: ConsultationStudent[];
};

export type ConsultationStudentFormValues = {
  studentName: string;
  studentGrade: string;
  studentAge: string;
  studentSchool: string;
  recommendedClass: string;
};

export type ConsultationFormValues = {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  preferredLanguage: string;
  students: ConsultationStudentFormValues[];
  locationTimezone: string;
  howFoundUs: string;
  howFoundUsDetails: string;
  hasPriorExperience: boolean;
  priorExperienceDetails: string;
  goals: string;
  nextSteps: string;
  notes: string;
  consultDate: string;
  status: ConsultationStatus[];
};

export const consultationStatusOptions: Array<{ value: ConsultationStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'registered', label: 'Registered' },
  { value: 'declined', label: 'Declined' },
  { value: 'no_show', label: 'No Show' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'trial_class', label: 'Trial Class' },
];

export const preferredLanguageOptions = [
  { value: 'english', label: 'English' },
  { value: 'mandarin', label: 'Mandarin' },
] as const;

export const howFoundUsOptions = [
  { value: 'google', label: 'Google Search' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'school', label: 'School' },
  { value: 'word_of_mouth', label: 'Word of Mouth' },
  { value: 'returning_student', label: 'Returning Student' },
  { value: 'other', label: 'Other' },
] as const;

export const recommendedClassOptions = [
  'Novice',
  'Junior',
  'Senior',
  'Advanced Competitive',
  'Public Speaking',
  "World Scholar's Cup",
  'Private Coaching',
  'Other',
] as const;

export function normalizeConsultationStatuses(
  value: ReadonlyArray<string | null | undefined> | string | null | undefined
): ConsultationStatus[] {
  const raw = Array.isArray(value) ? value : value == null ? [] : [value];
  const allowed = new Set(consultationStatusOptions.map((option) => option.value));
  const result: ConsultationStatus[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (!allowed.has(trimmed as ConsultationStatus)) continue;
    if (result.includes(trimmed as ConsultationStatus)) continue;
    result.push(trimmed as ConsultationStatus);
  }
  return result.length > 0 ? result : ['new'];
}

export function normalizePreferredLanguage(value: string | null | undefined): string | null {
  return preferredLanguageOptions.some((option) => option.value === value) ? value ?? null : null;
}

export function normalizeHowFoundUs(value: string | null | undefined): string | null {
  return howFoundUsOptions.some((option) => option.value === value) ? value ?? null : null;
}

export function consultationStatusLabel(value: string | null | undefined): string {
  return consultationStatusOptions.find((option) => option.value === value)?.label ?? 'Unknown';
}

export function consultationStatusClass(value: string | null | undefined): string {
  switch (value) {
    case 'new':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'follow_up':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'registered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'declined':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'no_show':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    case 'rescheduled':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'trial_class':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
    default:
      return 'bg-warm-100 text-charcoal/80 dark:bg-navy-800 dark:text-navy-200';
  }
}

export function howFoundUsLabel(value: string | null | undefined): string {
  return howFoundUsOptions.find((option) => option.value === value)?.label ?? '-';
}

export function preferredLanguageLabel(value: string | null | undefined): string {
  return preferredLanguageOptions.find((option) => option.value === value)?.label ?? '-';
}

export function emptyStudentFormValues(): ConsultationStudentFormValues {
  return {
    studentName: '',
    studentGrade: '',
    studentAge: '',
    studentSchool: '',
    recommendedClass: '',
  };
}

export function emptyConsultationValues(): ConsultationFormValues {
  return {
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    preferredLanguage: '',
    students: [emptyStudentFormValues()],
    locationTimezone: '',
    howFoundUs: '',
    howFoundUsDetails: '',
    hasPriorExperience: false,
    priorExperienceDetails: '',
    goals: '',
    nextSteps: '',
    notes: '',
    consultDate: new Date().toISOString().slice(0, 10),
    status: ['new'],
  };
}

export function consultationToFormValues(record: ConsultationRecord): ConsultationFormValues {
  const students = (record.students ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((student) => ({
      studentName: student.student_name ?? '',
      studentGrade: student.student_grade ?? '',
      studentAge: student.student_age == null ? '' : String(student.student_age),
      studentSchool: student.student_school ?? '',
      recommendedClass: student.recommended_class ?? '',
    }));

  return {
    parentName: record.parent_name ?? '',
    parentEmail: record.parent_email ?? '',
    parentPhone: record.parent_phone ?? '',
    preferredLanguage: record.preferred_language ?? '',
    students: students.length > 0 ? students : [emptyStudentFormValues()],
    locationTimezone: record.location_timezone ?? '',
    howFoundUs: record.how_found_us ?? '',
    howFoundUsDetails: record.how_found_us_details ?? '',
    hasPriorExperience: Boolean(record.has_prior_experience),
    priorExperienceDetails: record.prior_experience_details ?? '',
    goals: record.goals ?? '',
    nextSteps: record.next_steps ?? '',
    notes: record.notes ?? '',
    consultDate: record.consult_date ?? new Date().toISOString().slice(0, 10),
    status: normalizeConsultationStatuses(record.status),
  };
}

export function consultationStudentDisplayName(record: ConsultationRecord): string {
  const names = (record.students ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((student) => student.student_name)
    .filter((name): name is string => Boolean(name && name.trim()));
  return names.join(', ');
}

export function consultationErrorMessage(value: string | null | undefined): string | null {
  if (value === 'missing_required') return 'Parent name and at least one student name are required.';
  if (value === 'missing_record') return 'Consultation record not found.';
  if (value === 'save_failed') return 'Could not save the consultation. Please try again.';
  if (value === 'delete_failed') return 'Could not delete the consultation. Please try again.';
  return null;
}
