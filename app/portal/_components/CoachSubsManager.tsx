"use client";

import { useState } from 'react';
import SubRequestCard from '@/app/portal/_components/SubRequestCard';

type ClassOption = {
  id: string;
  name: string;
  timezone: string;
  schedule_start_time: string;
  schedule_end_time: string;
};

type RequestItem = {
  id: string;
  class_id: string;
  className: string;
  session_date: string;
  whenText: string;
  reason: string | null;
  status: string;
  requesting_coach_id: string;
  requestingName: string;
  acceptingName?: string | null;
  isMine: boolean;
  canAccept: boolean;
};

export default function CoachSubsManager({
  classes,
  subRequests,
  taRequests,
}: {
  classes: ClassOption[];
  subRequests: RequestItem[];
  taRequests: RequestItem[];
}) {
  const [loading, setLoading] = useState<'sub' | 'ta' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createRequest(
    kind: 'sub' | 'ta',
    payload: { classId: string; sessionDate: string; reason: string }
  ) {
    setLoading(kind);
    setError(null);
    const response = await fetch(kind === 'sub' ? '/api/portal/subs' : '/api/portal/ta-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(null);
    if (!response.ok) {
      setError(data.error || 'Could not create request.');
      return;
    }
    window.location.reload();
  }

  async function runAction(endpoint: string) {
    const response = await fetch(endpoint, { method: 'POST' });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: data.error || 'Request failed.' };
    }
    window.location.reload();
    return { ok: true };
  }

  const mySubs = subRequests.filter((row) => row.isMine);
  const availableSubs = subRequests.filter((row) => !row.isMine && row.status === 'open' && row.canAccept);
  const myTas = taRequests.filter((row) => row.isMine);
  const availableTas = taRequests.filter((row) => !row.isMine && row.status === 'open' && row.canAccept);

  return (
    <div className="space-y-6">
      <div className="grid xl:grid-cols-2 gap-6">
        <form
          className="rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await createRequest('sub', {
              classId: String(formData.get('classId') || ''),
              sessionDate: String(formData.get('sessionDate') || ''),
              reason: String(formData.get('reason') || ''),
            });
          }}
        >
          <h3 className="font-semibold text-navy-800 dark:text-white">Request Sub</h3>
          <select
            required
            name="classId"
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          >
            {classes.map((classRow) => (
              <option key={classRow.id} value={classRow.id}>
                {classRow.name}
              </option>
            ))}
          </select>
          <input
            required
            name="sessionDate"
            type="date"
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
          <textarea
            name="reason"
            rows={3}
            placeholder="Reason (optional)"
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
          <button
            disabled={loading !== null}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
          >
            {loading === 'sub' ? 'Submitting...' : 'Submit Sub Request'}
          </button>
        </form>

        <form
          className="rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await createRequest('ta', {
              classId: String(formData.get('classId') || ''),
              sessionDate: String(formData.get('sessionDate') || ''),
              reason: String(formData.get('reason') || ''),
            });
          }}
        >
          <h3 className="font-semibold text-navy-800 dark:text-white">Request TA</h3>
          <select
            required
            name="classId"
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          >
            {classes.map((classRow) => (
              <option key={classRow.id} value={classRow.id}>
                {classRow.name}
              </option>
            ))}
          </select>
          <input
            required
            name="sessionDate"
            type="date"
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
          <textarea
            name="reason"
            rows={3}
            placeholder="Reason (optional)"
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
          <button
            disabled={loading !== null}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
          >
            {loading === 'ta' ? 'Submitting...' : 'Submit TA Request'}
          </button>
        </form>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">My Sub Requests</h3>
        {mySubs.length ? (
          mySubs.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="sub"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              acceptedByName={request.acceptingName}
              canCancel={request.status === 'open'}
              onCancel={() => runAction(`/api/portal/subs/${request.id}/cancel`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No sub requests created yet.</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">Available Sub Requests</h3>
        {availableSubs.length ? (
          availableSubs.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="sub"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              canAccept
              onAccept={() => runAction(`/api/portal/subs/${request.id}/accept`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No open sub requests for you right now.</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">My TA Requests</h3>
        {myTas.length ? (
          myTas.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="ta"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              acceptedByName={request.acceptingName}
              canCancel={request.status === 'open'}
              onCancel={() => runAction(`/api/portal/ta-requests/${request.id}/cancel`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No TA requests created yet.</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">Available TA Requests</h3>
        {availableTas.length ? (
          availableTas.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="ta"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              canAccept
              onAccept={() => runAction(`/api/portal/ta-requests/${request.id}/accept`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No open TA requests for you right now.</p>
        )}
      </div>
    </div>
  );
}
