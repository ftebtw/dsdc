"use client";

import { useState } from 'react';
import PrivateSessionsManager from '@/app/portal/_components/PrivateSessionsManager';

type AvailableSlot = {
  id: string;
  coachName: string;
  whenText: string;
};

type SessionItem = {
  id: string;
  coachName: string;
  studentName: string;
  whenText: string;
  status: string;
  student_notes?: string | null;
  coach_notes?: string | null;
  canConfirm?: boolean;
  canCancel?: boolean;
  canComplete?: boolean;
};

export default function StudentBookingManager({
  availableSlots,
  sessions,
}: {
  availableSlots: AvailableSlot[];
  sessions: SessionItem[];
}) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestSession() {
    if (!selectedSlotId) return;
    setLoading(true);
    setError(null);
    const response = await fetch('/api/portal/private-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        availabilityId: selectedSlotId,
        studentNotes: studentNotes.trim() || undefined,
      }),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(data.error || 'Could not request session.');
      return;
    }
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">Available Private Slots</h3>
        {availableSlots.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No private availability is currently posted.</p>
        ) : (
          availableSlots.map((slot) => (
            <article
              key={slot.id}
              className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-800 dark:text-white">{slot.whenText}</p>
                  <p className="text-sm text-charcoal/70 dark:text-navy-300">Coach: {slot.coachName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    selectedSlotId === slot.id
                      ? 'bg-gold-300 text-navy-900 font-semibold'
                      : 'border border-warm-300 dark:border-navy-600'
                  }`}
                >
                  {selectedSlotId === slot.id ? 'Selected' : 'Select Slot'}
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4 space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">Request Session</h3>
        <textarea
          rows={3}
          value={studentNotes}
          onChange={(event) => setStudentNotes(event.target.value)}
          placeholder="Optional notes for the coach"
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
        />
        <button
          type="button"
          onClick={() => void requestSession()}
          disabled={!selectedSlotId || loading}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
        >
          {loading ? 'Submitting...' : 'Request Session'}
        </button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">My Bookings</h3>
        <PrivateSessionsManager sessions={sessions} />
      </div>
    </div>
  );
}
