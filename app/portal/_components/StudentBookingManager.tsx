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

type SessionItem = {
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

export default function StudentBookingManager({
  availableSlots,
  sessions,
  locale = "en",
}: {
  availableSlots: AvailableSlot[];
  sessions: SessionItem[];
  locale?: "en" | "zh";
}) {
  const { locale: contextLocale } = useI18n();
  const t = (key: string, fallback: string) => portalT(contextLocale, key, fallback);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
  const [studentNotes, setStudentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);

    const slotArray = [...selectedSlotIds];
    const errors: string[] = [];

    for (const slotId of slotArray) {
      try {
        const response = await fetch("/api/portal/private-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            availabilityId: slotId,
            studentNotes: studentNotes.trim() || undefined,
          }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          const slotLabel = availableSlots.find((slot) => slot.id === slotId)?.whenText || slotId;
          errors.push(`${slotLabel}: ${data.error || "Failed"}`);
        }
      } catch (requestError) {
        console.error("[student-booking] request failed:", requestError);
        errors.push("Network error");
      }
    }

    setLoading(false);

    if (errors.length > 0) {
      setError(errors.join("; "));
      if (errors.length < slotArray.length) {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
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
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? "border-gold-400 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-500"
                      : "border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 hover:bg-warm-50 dark:hover:bg-navy-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-800 dark:text-white">{slot.coachName}</p>
                      <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-0.5">{slot.whenText}</p>
                    </div>
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
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4 space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t("portal.common.requestSession", "Request Session")}
          {selectedSlotIds.size > 0 ? (
            <span className="ml-2 text-sm font-normal text-charcoal/70 dark:text-navy-300">
              ({selectedSlotIds.size} slot{selectedSlotIds.size !== 1 ? "s" : ""} selected)
            </span>
          ) : null}
        </h3>
        <textarea
          rows={3}
          value={studentNotes}
          onChange={(event) => setStudentNotes(event.target.value)}
          placeholder={t("portal.common.notesPlaceholder", "Notes for the coach (optional)")}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
        />
        <button
          type="button"
          onClick={() => void requestSessions()}
          disabled={selectedSlotIds.size === 0 || loading}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
        >
          {loading
            ? t("portal.common.requesting", "Requesting...")
            : selectedSlotIds.size > 1
              ? t("portal.common.requestSessions", "Request {count} Sessions").replace(
                  "{count}",
                  String(selectedSlotIds.size)
                )
              : t("portal.common.requestSession", "Request Session")}
        </button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t("portal.privateSessions.myBookings", "My Bookings")}
        </h3>
        <PrivateSessionsManager sessions={sessions} viewerRole="student" locale={locale} />
      </div>
    </div>
  );
}
