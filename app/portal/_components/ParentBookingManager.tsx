"use client";

import { useState } from "react";
import PrivateSessionsManager from "@/app/portal/_components/PrivateSessionsManager";
import { portalT } from "@/lib/portal/parent-i18n";

type AvailableSlot = {
  id: string;
  coachName: string;
  whenText: string;
};

type BookingSessionItem = {
  id: string;
  coachName: string;
  studentName: string;
  whenText: string;
  status: string;
  student_notes?: string | null;
  coach_notes?: string | null;
  price_cad?: number | null;
  zoom_link?: string | null;
  payment_method?: string | null;
  proposed_date?: string | null;
  proposed_start_time?: string | null;
  proposed_end_time?: string | null;
  proposedByName?: string | null;
  step?: number;
  canAccept?: boolean;
  canReject?: boolean;
  canReschedule?: boolean;
  canAcceptReschedule?: boolean;
  canApprove?: boolean;
  canPay?: boolean;
  canCancel?: boolean;
  canComplete?: boolean;
};

export default function ParentBookingManager({
  availableSlots,
  sessions,
  studentId,
  locale = "en",
}: {
  availableSlots: AvailableSlot[];
  sessions: BookingSessionItem[];
  studentId: string;
  locale?: "en" | "zh";
}) {
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  async function requestSession() {
    if (!selectedSlotId) return;
    setRequesting(true);
    setRequestError(null);
    setRequestSuccess(false);

    try {
      const response = await fetch("/api/portal/private-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityId: selectedSlotId,
          studentNotes: notes || undefined,
          studentId,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || t("portal.privateSessions.error.requestFailed", "Failed to request session."));
      }

      setRequestSuccess(true);
      setSelectedSlotId(null);
      setNotes("");
      window.location.reload();
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : t("portal.privateSessions.error.requestFailed", "Failed to request session.")
      );
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-navy-800 dark:text-white mb-2">
          {t("portal.common.availableSlots", "Available Coach Slots")}
        </h3>
        {availableSlots.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t("portal.common.noSlotsAvailable", "No private coaching slots are available right now.")}
          </p>
        ) : (
          <div className="space-y-2">
            {availableSlots.map((slot) => (
              <label
                key={slot.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSlotId === slot.id
                    ? "border-gold-400 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-500"
                    : "border-warm-200 dark:border-navy-600 hover:bg-warm-50 dark:hover:bg-navy-800"
                }`}
              >
                <input
                  type="radio"
                  name="slot"
                  checked={selectedSlotId === slot.id}
                  onChange={() => setSelectedSlotId(slot.id)}
                  className="accent-gold-500"
                />
                <div>
                  <p className="font-medium text-navy-800 dark:text-white">{slot.coachName}</p>
                  <p className="text-sm text-charcoal/70 dark:text-navy-300">{slot.whenText}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {selectedSlotId ? (
          <div className="mt-3 space-y-3">
            <textarea
              placeholder={t("portal.common.notesPlaceholder", "Notes for the coach (optional)")}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                void requestSession();
              }}
              disabled={requesting}
              className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold text-sm disabled:opacity-60"
            >
              {requesting
                ? t("portal.common.requesting", "Requesting...")
                : t("portal.privateSessions.requestForStudent", "Request Session for Student")}
            </button>
          </div>
        ) : null}

        {requestError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{requestError}</p>
        ) : null}
        {requestSuccess ? (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            {t("portal.common.sessionRequested", "Session requested! The coach will review and respond.")}
          </p>
        ) : null}
      </div>

      {sessions.length > 0 ? (
        <div>
          <h3 className="font-semibold text-navy-800 dark:text-white mb-2">
            {t("portal.common.sessionHistory", "Session History")}
          </h3>
          <PrivateSessionsManager sessions={sessions} viewerRole="parent" locale={locale} />
        </div>
      ) : null}
    </div>
  );
}
