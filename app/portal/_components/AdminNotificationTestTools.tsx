"use client";

import { useState } from 'react';

type TestAction =
  | 'enrollment_confirmation_student'
  | 'enrollment_confirmation_parent'
  | 'report_card_approved'
  | 'report_card_rejected'
  | 'sub_request_created';

type ActionDef = {
  action: TestAction;
  label: string;
  description: string;
};

const ACTIONS: ActionDef[] = [
  {
    action: 'enrollment_confirmation_student',
    label: 'Send Student Enrollment Email',
    description: 'Sends full student enrollment confirmation sample.',
  },
  {
    action: 'enrollment_confirmation_parent',
    label: 'Send Parent Enrollment Email',
    description: 'Sends full parent-version enrollment confirmation sample.',
  },
  {
    action: 'report_card_approved',
    label: 'Send Report Card Approved Email',
    description: 'Sends a sample report-card approved email.',
  },
  {
    action: 'report_card_rejected',
    label: 'Send Report Card Rejected Email',
    description: 'Sends a sample report-card rejected email with notes.',
  },
  {
    action: 'sub_request_created',
    label: 'Send Sub Request Email',
    description: 'Sends a sample sub-request alert email.',
  },
];

export default function AdminNotificationTestTools({
  defaultRecipient,
}: {
  defaultRecipient?: string | null;
}) {
  const [recipient, setRecipient] = useState(defaultRecipient || '');
  const [loadingAction, setLoadingAction] = useState<TestAction | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendTest(action: TestAction) {
    setLoadingAction(action);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/portal/admin/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          to: recipient.trim() || undefined,
        }),
      });
      const data = (await response.json()) as { error?: string; sentTo?: string; subject?: string };
      if (!response.ok) {
        setError(data.error || 'Failed to send test email.');
        return;
      }
      setResult(`Sent to ${data.sentTo}: ${data.subject}`);
    } catch {
      setError('Network error while sending test email.');
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-3">
        <label className="block text-xs uppercase tracking-wide text-charcoal/70 dark:text-navy-300 mb-1">
          Recipient Email
        </label>
        <input
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          type="email"
          placeholder="admin@yourdomain.com"
          className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-charcoal/70 dark:text-navy-300">
          If blank, this uses your admin account email.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {ACTIONS.map((item) => (
          <div key={item.action} className="rounded-lg border border-warm-200 dark:border-navy-600 p-3">
            <p className="text-sm font-semibold text-navy-800 dark:text-white">{item.label}</p>
            <p className="mt-1 text-xs text-charcoal/70 dark:text-navy-300">{item.description}</p>
            <button
              type="button"
              onClick={() => sendTest(item.action)}
              disabled={loadingAction !== null}
              className="mt-3 inline-flex rounded-md bg-navy-800 text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
            >
              {loadingAction === item.action ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        ))}
      </div>

      {result ? <p className="text-sm text-green-700 dark:text-green-400">{result}</p> : null}
      {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
