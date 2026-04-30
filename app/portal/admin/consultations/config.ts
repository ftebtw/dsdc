export type ConsultationStatus = 'new' | 'follow_up' | 'registered' | 'declined' | 'no_show';

export type ConsultationRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: ConsultationStatus | string;
  parent_name: string;
  parent_email: string | null;
  parent_phone: string | null;
  preferred_language: string | null;
  student_name: string;
  student_grade: string | null;
  student_age: number | null;
  student_school: string | null;
  location_timezone: string | null;
  how_found_us: string | null;
  how_found_us_details: string | null;
  has_prior_experience: boolean;
  prior_experience_details: string | null;
  goals: string | null;
  recommended_class: string | null;
  next_steps: string | null;
  notes: string | null;
  consult_date: string;
};

export type ConsultationFormValues = {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  preferredLanguage: string;
  studentName: string;
  studentGrade: string;
  studentAge: string;
  studentSchool: string;
  locationTimezone: string;
  howFoundUs: string;
  howFoundUsDetails: string;
  hasPriorExperience: boolean;
  priorExperienceDetails: string;
  goals: string;
  recommendedClass: string;
  nextSteps: string;
  notes: string;
  consultDate: string;
  status: ConsultationStatus;
};

export const consultationStatusOptions: Array<{ value: ConsultationStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'registered', label: 'Registered' },
  { value: 'declined', label: 'Declined' },
  { value: 'no_show', label: 'No Show' },
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

export function normalizeConsultationStatus(value: string | null | undefined): ConsultationStatus {
  const matched = consultationStatusOptions.find((option) => option.value === value);
  return matched?.value ?? 'new';
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

export function emptyConsultationValues(): ConsultationFormValues {
  return {
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    preferredLanguage: '',
    studentName: '',
    studentGrade: '',
    studentAge: '',
    studentSchool: '',
    locationTimezone: '',
    howFoundUs: '',
    howFoundUsDetails: '',
    hasPriorExperience: false,
    priorExperienceDetails: '',
    goals: '',
    recommendedClass: '',
    nextSteps: '',
    notes: '',
    consultDate: new Date().toISOString().slice(0, 10),
    status: 'new',
  };
}

export function consultationToFormValues(record: ConsultationRecord): ConsultationFormValues {
  return {
    parentName: record.parent_name ?? '',
    parentEmail: record.parent_email ?? '',
    parentPhone: record.parent_phone ?? '',
    preferredLanguage: record.preferred_language ?? '',
    studentName: record.student_name ?? '',
    studentGrade: record.student_grade ?? '',
    studentAge: record.student_age == null ? '' : String(record.student_age),
    studentSchool: record.student_school ?? '',
    locationTimezone: record.location_timezone ?? '',
    howFoundUs: record.how_found_us ?? '',
    howFoundUsDetails: record.how_found_us_details ?? '',
    hasPriorExperience: Boolean(record.has_prior_experience),
    priorExperienceDetails: record.prior_experience_details ?? '',
    goals: record.goals ?? '',
    recommendedClass: record.recommended_class ?? '',
    nextSteps: record.next_steps ?? '',
    notes: record.notes ?? '',
    consultDate: record.consult_date ?? new Date().toISOString().slice(0, 10),
    status: normalizeConsultationStatus(record.status),
  };
}

export function consultationErrorMessage(value: string | null | undefined): string | null {
  if (value === 'missing_required') return 'Parent name and student name are required.';
  if (value === 'missing_record') return 'Consultation record not found.';
  if (value === 'save_failed') return 'Could not save the consultation. Please try again.';
  if (value === 'delete_failed') return 'Could not delete the consultation. Please try again.';
  return null;
}
