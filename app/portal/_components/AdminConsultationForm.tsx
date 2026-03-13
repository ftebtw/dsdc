"use client";

import Link from 'next/link';
import { useState } from 'react';
import type { ConsultationFormValues } from '@/app/portal/admin/consultations/config';
import {
  consultationStatusOptions,
  howFoundUsOptions,
  preferredLanguageOptions,
  recommendedClassOptions,
} from '@/app/portal/admin/consultations/config';

type Props = {
  formAction: (formData: FormData) => void | Promise<void>;
  initialValues: ConsultationFormValues;
  submitLabel: string;
  cancelHref: string;
  consultationId?: string;
};

const inputClassName =
  'w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2';
const textareaClassName = `${inputClassName} min-h-[120px]`;

export default function AdminConsultationForm({
  formAction,
  initialValues,
  submitLabel,
  cancelHref,
  consultationId,
}: Props) {
  const [hasPriorExperience, setHasPriorExperience] = useState(initialValues.hasPriorExperience);

  return (
    <form action={formAction} className="space-y-8">
      {consultationId ? <input type="hidden" name="id" value={consultationId} /> : null}

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Parent Information</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Basic contact details from the call.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Parent Name</span>
            <input
              type="text"
              name="parent_name"
              required
              defaultValue={initialValues.parentName}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Email</span>
            <input
              type="email"
              name="parent_email"
              defaultValue={initialValues.parentEmail}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Phone Number</span>
            <input
              type="tel"
              name="parent_phone"
              defaultValue={initialValues.parentPhone}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Preferred Language</span>
            <select
              name="preferred_language"
              defaultValue={initialValues.preferredLanguage}
              className={inputClassName}
            >
              <option value="">Select language</option>
              {preferredLanguageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Student Information</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Who the consultation is for.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Student Name</span>
            <input
              type="text"
              name="student_name"
              required
              defaultValue={initialValues.studentName}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Grade</span>
            <input
              type="text"
              name="student_grade"
              defaultValue={initialValues.studentGrade}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Age</span>
            <input
              type="number"
              min={0}
              name="student_age"
              defaultValue={initialValues.studentAge}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">School</span>
            <input
              type="text"
              name="student_school"
              defaultValue={initialValues.studentSchool}
              className={inputClassName}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Location / Timezone</span>
            <input
              type="text"
              name="location_timezone"
              defaultValue={initialValues.locationTimezone}
              placeholder="Vancouver, PST"
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Background</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">How they found DSDC and their prior experience.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">How Did They Find Us?</span>
            <select
              name="how_found_us"
              defaultValue={initialValues.howFoundUs}
              className={inputClassName}
            >
              <option value="">Select source</option>
              {howFoundUsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Details</span>
            <input
              type="text"
              name="how_found_us_details"
              defaultValue={initialValues.howFoundUsDetails}
              placeholder="Referred by Angela's mom"
              className={inputClassName}
            />
          </label>
        </div>

        <div className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/50 p-4">
          <label className="inline-flex items-center gap-3 text-sm font-medium text-navy-800 dark:text-white">
            <input
              type="checkbox"
              name="has_prior_experience"
              checked={hasPriorExperience}
              onChange={(event) => setHasPriorExperience(event.target.checked)}
            />
            Prior Debate Experience?
          </label>
          {hasPriorExperience ? (
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Experience Details</span>
              <textarea
                name="prior_experience_details"
                rows={4}
                defaultValue={initialValues.priorExperienceDetails}
                placeholder="Did debate club at school for 1 year, no tournament experience"
                className={textareaClassName}
              />
            </label>
          ) : (
            <input type="hidden" name="prior_experience_details" value="" />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Consultation Details</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Outcome, class recommendation, and follow-up.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Consultation Date</span>
            <input
              type="date"
              name="consult_date"
              defaultValue={initialValues.consultDate}
              className={inputClassName}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Status</span>
            <select
              name="status"
              defaultValue={initialValues.status}
              className={inputClassName}
            >
              {consultationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Goals</span>
            <textarea
              name="goals"
              rows={4}
              defaultValue={initialValues.goals}
              placeholder="What are their goals for attending classes?"
              className={textareaClassName}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Recommended Class</span>
            <input
              type="text"
              name="recommended_class"
              list="consultation-recommended-class-options"
              defaultValue={initialValues.recommendedClass}
              className={inputClassName}
            />
            <datalist id="consultation-recommended-class-options">
              {recommendedClassOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Next Steps</span>
            <textarea
              name="next_steps"
              rows={4}
              defaultValue={initialValues.nextSteps}
              placeholder="What was decided? What's the follow-up?"
              className={textareaClassName}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Notes</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Free-form notes from the consultation.</p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Notes</span>
          <textarea
            name="notes"
            rows={8}
            defaultValue={initialValues.notes}
            className={`${inputClassName} min-h-[180px]`}
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold hover:bg-navy-700"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="px-4 py-2 rounded-lg border border-warm-300 dark:border-navy-600 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
