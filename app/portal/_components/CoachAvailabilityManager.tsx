"use client";

import { useState } from 'react';
import AvailabilityCalendar from '@/app/portal/_components/AvailabilityCalendar';
import RecurringAvailabilityForm from '@/app/portal/_components/RecurringAvailabilityForm';
import TimezoneSelectNative from '@/app/portal/_components/TimezoneSelectNative';

type Slot = {
  id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  is_group: boolean;
  is_private: boolean;
};

type SlotInput = {
  availableDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  isGroup: boolean;
  isPrivate: boolean;
};

export default function CoachAvailabilityManager({
  initialSlots,
  displayTimezone,
  defaultTimezone,
}: {
  initialSlots: Slot[];
  displayTimezone: string;
  defaultTimezone: string;
}) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [editing, setEditing] = useState<Slot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createSlot(input: SlotInput) {
    setLoading(true);
    setError(null);
    const response = await fetch('/api/portal/coach/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await response.json()) as { error?: string; slot?: Slot };
    setLoading(false);
    if (!response.ok || !data.slot) {
      setError(data.error || 'Could not create slot.');
      return;
    }
    setSlots((prev) =>
      [...prev, data.slot!].sort((a, b) =>
        `${a.available_date}-${a.start_time}`.localeCompare(`${b.available_date}-${b.start_time}`)
      )
    );
  }

  async function updateSlot(slotId: string, input: SlotInput) {
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/portal/coach/availability/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await response.json()) as { error?: string; slot?: Slot };
    setLoading(false);
    if (!response.ok || !data.slot) {
      setError(data.error || 'Could not update slot.');
      return false;
    }
    setSlots((prev) => prev.map((slot) => (slot.id === slotId ? data.slot! : slot)));
    return true;
  }

  async function deleteSlot(slotId: string) {
    setDeletingId(slotId);
    setError(null);
    const response = await fetch(`/api/portal/coach/availability/${slotId}`, { method: 'DELETE' });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);
    if (!response.ok) {
      setError(data.error || 'Could not delete slot.');
      return;
    }
    setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  }

  async function createRecurring(payload: { slots: SlotInput[] }) {
    const response = await fetch('/api/portal/coach/availability/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; slots?: Slot[] };
    if (!response.ok || !data.slots) {
      return { ok: false, error: data.error || 'Could not create recurring slots.' };
    }
    setSlots((prev) =>
      [...prev, ...data.slots!].sort((a, b) =>
        `${a.available_date}-${a.start_time}`.localeCompare(`${b.available_date}-${b.start_time}`)
      )
    );
    return { ok: true };
  }

  return (
    <div className="space-y-6">
      <form
        className="rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          const input: SlotInput = {
            availableDate: String(formData.get('availableDate') || ''),
            startTime: String(formData.get('startTime') || ''),
            endTime: String(formData.get('endTime') || ''),
            timezone: String(formData.get('timezone') || defaultTimezone),
            isGroup: formData.get('isGroup') === 'on',
            isPrivate: formData.get('isPrivate') === 'on',
          };
          if (editing) {
            const ok = await updateSlot(editing.id, input);
            if (ok) {
              setEditing(null);
              form.reset();
            }
            return;
          }
          await createSlot(input);
          form.reset();
        }}
      >
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {editing ? 'Edit Availability Slot' : 'Add Availability Slot'}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Date</span>
            <input
              required
              type="date"
              name="availableDate"
              defaultValue={editing?.available_date}
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Start Time</span>
            <input
              required
              type="time"
              name="startTime"
              defaultValue={editing?.start_time}
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">End Time</span>
            <input
              required
              type="time"
              name="endTime"
              defaultValue={editing?.end_time}
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Timezone</span>
            <TimezoneSelectNative
              name="timezone"
              defaultValue={editing?.timezone || defaultTimezone}
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              required
            />
          </label>
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isGroup" defaultChecked={editing ? editing.is_group : true} />
            Group
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPrivate" defaultChecked={editing ? editing.is_private : true} />
            Private
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
          >
            {loading ? 'Saving...' : editing ? 'Save Slot' : 'Add Slot'}
          </button>
          {editing ? (
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-warm-300 dark:border-navy-600 text-sm"
              onClick={() => setEditing(null)}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>

      <RecurringAvailabilityForm defaultTimezone={defaultTimezone} onSubmit={createRecurring} />

      <AvailabilityCalendar
        slots={slots}
        displayTimezone={displayTimezone}
        editable
        onEdit={(slot) => setEditing(slot)}
        onDelete={deleteSlot}
        deletingId={deletingId}
      />
    </div>
  );
}
