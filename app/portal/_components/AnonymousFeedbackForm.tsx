"use client";

import { useState } from 'react';

export default function AnonymousFeedbackForm() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch('/api/portal/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body }),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'Could not send feedback.');
      return;
    }

    setSubject('');
    setBody('');
    setMessage('Thank you for your feedback.');
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900">
      <input
        required
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        placeholder="Subject"
        className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
      />
      <textarea
        required
        rows={6}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Share your feedback"
        className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
      />
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
      >
        {loading ? 'Sending...' : 'Send Feedback'}
      </button>
    </form>
  );
}
