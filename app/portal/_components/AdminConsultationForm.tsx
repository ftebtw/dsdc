"use client";

import Link from 'next/link';
import { useState } from 'react';
import type {
  ConsultationFormValues,
  ConsultationStatus,
  ConsultationStudentFormValues,
} from '@/app/portal/admin/consultations/config';
import {
  consultationStatusOptions,
  emptyStudentFormValues,
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
  const [students, setStudents] = useState<ConsultationStudentFormValues[]>(
    initialValues.students.length > 0 ? initialValues.students : [emptyStudentFormValues()]
  );
  const [statuses, setStatuses] = useState<ConsultationStatus[]>(
    initialValues.status.length > 0 ? initialValues.status : ['new']
  );

  function toggleStatus(value: ConsultationStatus, checked: boolean) {
    setStatuses((prev) => {
      if (checked) {
        return prev.includes(value) ? prev : [...prev, value];
      }
      return prev.filter((entry) => entry !== value);
    });
  }

  function updateStudent(index: number, patch: Partial<ConsultationStudentFormValues>) {
    setStudents((prev) => prev.map((student, i) => (i === index ? { ...student, ...patch } : student)));
  }

  function addStudent() {
    setStudents((prev) => [...prev, emptyStudentFormValues()]);
  }

  function removeStudent(index: number) {
    setStudents((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  return (
    <form action={formAction} className="space-y-8">
      {consultationId ? <input type="hidden" name="id" value={consultationId} /> : null}
      <input type="hidden" name="students" value={JSON.stringify(students)} />
      <input type="hidden" name="statuses" value={JSON.stringify(statuses)} />

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
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Add one or more children for this consultation.</p>
        </div>
        <div className="space-y-4">
          {students.map((student, index) => (
            <div
              key={index}
              className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-navy-800 dark:text-white">
                  {students.length > 1 ? `Child ${index + 1}` : 'Child'}
                </h4>
                {students.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeStudent(index)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Student Name</span>
                  <input
                    type="text"
                    required
                    value={student.studentName}
                    onChange={(event) => updateStudent(index, { studentName: event.target.value })}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Grade</span>
                  <input
                    type="text"
                    value={student.studentGrade}
                    onChange={(event) => updateStudent(index, { studentGrade: event.target.value })}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Age</span>
                  <input
                    type="number"
                    min={0}
                    value={student.studentAge}
                    onChange={(event) => updateStudent(index, { studentAge: event.target.value })}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">School</span>
                  <input
                    type="text"
                    value={student.studentSchool}
                    onChange={(event) => updateStudent(index, { studentSchool: event.target.value })}
                    className={inputClassName}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Recommended Class</span>
                  <input
                    type="text"
                    list="consultation-recommended-class-options"
                    value={student.recommendedClass}
                    onChange={(event) => updateStudent(index, { recommendedClass: event.target.value })}
                    className={inputClassName}
                  />
                </label>
              </div>
            </div>
          ))}
          <datalist id="consultation-recommended-class-options">
            {recommendedClassOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={addStudent}
            className="rounded-lg border border-dashed border-warm-300 dark:border-navy-600 px-4 py-2 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
          >
            + Add another child
          </button>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Location / Timezone</span>
          <input
            type="text"
            name="location_timezone"
            defaultValue={initialValues.locationTimezone}
            placeholder="Vancouver, PST"
            className={inputClassName}
          />
        </label>
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
          <div className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Status</span>
            <p className="mb-2 text-xs text-charcoal/60 dark:text-navy-400">
              Select one or more statuses that apply.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {consultationStatusOptions.map((option) => {
                const checked = statuses.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="inline-flex items-center gap-2 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-charcoal dark:text-navy-100 cursor-pointer hover:bg-warm-50 dark:hover:bg-navy-800"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleStatus(option.value, event.target.checked)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
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
