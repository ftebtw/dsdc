"use client";

import { useState } from 'react';

type StudentOption = { id: string; label: string };
type ClassOption = { id: string; label: string };

export default function AdminManualEnrollForm({
  classOptions,
  studentOptions,
}: {
  classOptions: ClassOption[];
  studentOptions: StudentOption[];
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [classId, setClassId] = useState(classOptions[0]?.id || '');
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
        ? { classId, studentId }
        : {
            classId,
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
    const data = (await response.json()) as { error?: string; createdStudent?: boolean };
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'Enrollment failed.');
      return;
    }

    setMessage(data.createdStudent ? 'Student created and enrolled.' : 'Enrollment saved.');
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
          <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Class</label>
          <select
            required
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {classOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
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
          <input
            placeholder="Timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
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

      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-navy-800 text-white px-4 py-2 font-semibold disabled:opacity-70"
      >
        {loading ? 'Saving...' : 'Save Enrollment'}
      </button>
    </form>
  );
}
