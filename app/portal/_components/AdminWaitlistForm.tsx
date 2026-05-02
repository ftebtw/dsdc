"use client";

import Link from 'next/link';
import { useState } from 'react';
import type { WaitlistFormValues, WaitlistStudent } from '@/app/portal/admin/waitlist/config';
import {
  commonTimezones,
  waitlistStatusOptions,
} from '@/app/portal/admin/waitlist/config';

type Props = {
  formAction: (formData: FormData) => void | Promise<void>;
  initialValues: WaitlistFormValues;
  submitLabel: string;
  cancelHref: string;
  entryId?: string;
};

const inputClassName =
  'w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2';
const textareaClassName = `${inputClassName} min-h-[120px]`;

export default function AdminWaitlistForm({
  formAction,
  initialValues,
  submitLabel,
  cancelHref,
  entryId,
}: Props) {
  const [hasDebateExperience, setHasDebateExperience] = useState(initialValues.hasDebateExperience);
  const [students, setStudents] = useState<WaitlistStudent[]>(
    initialValues.students.length > 0 ? initialValues.students : [{ name: '', grade: '' }]
  );

  function updateStudent(index: number, patch: Partial<WaitlistStudent>) {
    setStudents((prev) => prev.map((student, i) => (i === index ? { ...student, ...patch } : student)));
  }

  function addStudent() {
    setStudents((prev) => [...prev, { name: '', grade: '' }]);
  }

  function removeStudent(index: number) {
    setStudents((prev) => {
      if (prev.length <= 1) return [{ name: '', grade: '' }];
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <form action={formAction} className="space-y-8">
      {entryId ? <input type="hidden" name="id" value={entryId} /> : null}
      <input type="hidden" name="students_json" value={JSON.stringify(students)} />

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Parent Information</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Primary contact details for the family.</p>
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
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Status</span>
            <select
              name="status"
              defaultValue={initialValues.status}
              className={inputClassName}
            >
              {waitlistStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Students</h3>
            <p className="text-sm text-charcoal/65 dark:text-navy-300">Add one row per student in the family.</p>
          </div>
          <button
            type="button"
            onClick={addStudent}
            className="rounded-lg border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
          >
            + Add Student
          </button>
        </div>

        <div className="space-y-3">
          {students.map((student, index) => (
            <div
              key={index}
              className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,160px)_auto] items-end rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/50 p-3"
            >
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-charcoal/55 dark:text-navy-400">
                  Student Name
                </span>
                <input
                  type="text"
                  value={student.name}
                  onChange={(event) => updateStudent(index, { name: event.target.value })}
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-charcoal/55 dark:text-navy-400">
                  Grade
                </span>
                <input
                  type="text"
                  value={student.grade}
                  onChange={(event) => updateStudent(index, { grade: event.target.value })}
                  placeholder="e.g. Grade 7"
                  className={inputClassName}
                />
              </label>
              <button
                type="button"
                onClick={() => removeStudent(index)}
                disabled={students.length <= 1}
                className="rounded-lg border border-warm-300 dark:border-navy-600 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Background</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Prior debate experience.</p>
        </div>
        <div className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/50 p-4">
          <label className="inline-flex items-center gap-3 text-sm font-medium text-navy-800 dark:text-white">
            <input
              type="checkbox"
              name="has_debate_experience"
              checked={hasDebateExperience}
              onChange={(event) => setHasDebateExperience(event.target.checked)}
            />
            Prior Debate Experience?
          </label>
          {hasDebateExperience ? (
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Experience Details</span>
              <textarea
                name="debate_experience_details"
                rows={4}
                defaultValue={initialValues.debateExperienceDetails}
                placeholder="e.g. 1 year at school debate club, no tournament experience"
                className={textareaClassName}
              />
            </label>
          ) : (
            <input type="hidden" name="debate_experience_details" value="" />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Location & Availability</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">
            Use a full IANA timezone (e.g. America/Toronto). Type to filter the suggestions.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Timezone (IANA)</span>
            <input
              type="text"
              name="timezone"
              list="waitlist-timezone-options"
              defaultValue={initialValues.timezone}
              placeholder="America/Toronto"
              className={inputClassName}
            />
            <datalist id="waitlist-timezone-options">
              {commonTimezones.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Location</span>
            <input
              type="text"
              name="location"
              defaultValue={initialValues.location}
              placeholder="City, Province/State, Country"
              className={inputClassName}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Preferred Days / Times</span>
            <textarea
              name="preferred_days_times"
              rows={3}
              defaultValue={initialValues.preferredDaysTimes}
              placeholder="e.g. Weekday evenings after 6pm, weekend mornings"
              className={textareaClassName}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">Notes</h3>
          <p className="text-sm text-charcoal/65 dark:text-navy-300">Anything else worth tracking for this family.</p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-navy-700 dark:text-navy-200">Notes</span>
          <textarea
            name="notes"
            rows={6}
            defaultValue={initialValues.notes}
            className={`${inputClassName} min-h-[160px]`}
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
