"use client";

import { useState } from 'react';
import TimezoneSelect from '@/app/portal/_components/TimezoneSelect';

type StudentOption = { id: string; label: string };
type ClassOption = { id: string; label: string; archived?: boolean };

export default function AdminManualEnrollForm({
  classOptions,
  studentOptions,
}: {
  classOptions: ClassOption[];
  studentOptions: StudentOption[];
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [studentId, setStudentId] = useState(studentOptions[0]?.id || '');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('America/Vancouver');
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const payload =
      mode === 'existing'
        ? { classIds: selectedClassIds, studentId }
        : {
            classIds: selectedClassIds,
            newStudent: {
              email,
              display_name: displayName,
              timezone,
              locale,
              phone: phone || undefined,
            },
          };

    const response = await fetch('/api/portal/admin/manual-enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      error?: string;
      createdStudent?: boolean;
      enrollments?: Array<{ id: string }>;
    };
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'Enrollment failed.');
      return;
    }

    const count = data.enrollments?.length ?? selectedClassIds.length;
    const studentLabel =
      mode === 'existing'
        ? studentOptions.find((s) => s.id === studentId)?.label || 'student'
        : displayName || email || 'new student';
    const classLabels = selectedClassIds
      .map((id) => classOptions.find((c) => c.id === id)?.label)
      .filter(Boolean)
      .join(', ');
    setMessage(
      `${data.createdStudent ? 'Created and enrolled' : 'Enrolled'} ${studentLabel} in ${count} class${
        count === 1 ? '' : 'es'
      }${classLabels ? `: ${classLabels}` : ''}.`
    );
    // Clear the selection so it's obvious the action completed.
    setSelectedClassIds([]);
    if (mode === 'new') {
      setEmail('');
      setDisplayName('');
      setPhone('');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Classes</label>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-2 space-y-1">
            {classOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-warm-50 dark:hover:bg-navy-800 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedClassIds.includes(option.id)}
                  onChange={() => {
                    setSelectedClassIds((previous) =>
                      previous.includes(option.id)
                        ? previous.filter((id) => id !== option.id)
                        : [...previous, option.id]
                    );
                  }}
                />
                <span className={option.archived ? 'text-charcoal/55 dark:text-navy-300/70' : ''}>{option.label}</span>
                {option.archived ? (
                  <span className="ml-auto rounded-full bg-warm-200 dark:bg-navy-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/65 dark:text-navy-200/80">
                    Archived
                  </span>
                ) : null}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-charcoal/70 dark:text-navy-300">
            {selectedClassIds.length} class(es) selected
          </p>
        </div>
        <div>
          <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Enrollment Mode</label>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as 'existing' | 'new')}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="existing">Existing student</option>
            <option value="new">Create new student</option>
          </select>
        </div>
      </div>

      {mode === 'existing' ? (
        <div>
          <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Student</label>
          <select
            required
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {studentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            type="email"
            placeholder="Student email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <input
            required
            placeholder="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <TimezoneSelect
            value={timezone}
            onChange={setTimezone}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as 'en' | 'zh')}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="en">English</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
      )}

      {message ? (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          ✓ {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || selectedClassIds.length === 0}
        className="rounded-lg bg-navy-800 text-white px-4 py-2 font-semibold disabled:opacity-70"
      >
        {loading ? 'Saving...' : 'Save Enrollment'}
      </button>
    </form>
  );
}
