"use client";

import { useState } from "react";
import PrivateSessionsManager from "@/app/portal/_components/PrivateSessionsManager";
import { useI18n } from "@/lib/i18n";
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
  const { locale: contextLocale } = useI18n();
  const t = (key: string, fallback: string) => portalT(contextLocale, key, fallback);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  function toggleSlot(id: string) {
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function requestSessions() {
    if (selectedSlotIds.size === 0) return;
    setRequesting(true);
    setRequestError(null);
    setRequestSuccess(false);

    const slotArray = [...selectedSlotIds];
    const errors: string[] = [];

    for (const slotId of slotArray) {
      try {
        const response = await fetch("/api/portal/private-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            availabilityId: slotId,
            studentNotes: notes || undefined,
            studentId,
          }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          const slotLabel = availableSlots.find((slot) => slot.id === slotId)?.whenText || slotId;
          errors.push(`${slotLabel}: ${data.error || "Failed"}`);
        }
      } catch (requestErrorUnknown) {
        console.error("[parent-booking] request failed:", requestErrorUnknown);
        errors.push("Network error");
      }
    }

    setRequesting(false);

    if (errors.length > 0) {
      setRequestError(errors.join("; "));
      if (errors.length < slotArray.length) {
        setRequestSuccess(true);
        window.location.reload();
      }
    } else {
      setRequestSuccess(true);
      setSelectedSlotIds(new Set());
      setNotes("");
      window.location.reload();
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
            {availableSlots.map((slot) => {
              const isSelected = selectedSlotIds.has(slot.id);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleSlot(slot.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-gold-400 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-500"
                      : "border-warm-200 dark:border-navy-600 hover:bg-warm-50 dark:hover:bg-navy-800"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? "border-gold-500 bg-gold-400" : "border-warm-300 dark:border-navy-500"
                    }`}
                  >
                    {isSelected ? (
                      <svg
                        className="w-3 h-3 text-navy-900"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium text-navy-800 dark:text-white">{slot.coachName}</p>
                    <p className="text-sm text-charcoal/70 dark:text-navy-300">{slot.whenText}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedSlotIds.size > 0 ? (
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
                void requestSessions();
              }}
              disabled={requesting}
              className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold text-sm disabled:opacity-60"
            >
              {requesting
                ? t("portal.common.requesting", "Requesting...")
                : selectedSlotIds.size > 1
                  ? t(
                      "portal.privateSessions.requestForStudentMulti",
                      "Request {count} Sessions for Student"
                    ).replace("{count}", String(selectedSlotIds.size))
                  : t("portal.privateSessions.requestForStudent", "Request Session for Student")}
            </button>
          </div>
        ) : null}

        {requestError ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{requestError}</p> : null}
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
