"use client";

import { useState } from "react";
import PrivateSessionsManager from "@/app/portal/_components/PrivateSessionsManager";
import { useI18n } from "@/lib/i18n";
import { portalT } from "@/lib/portal/parent-i18n";

type AvailableSlot = {
  id: string;
  coachName: string;
  whenText: string;
  availableDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
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

type SlotRange = { start: string; end: string };

function normalizeTime(timeValue: string): string {
  const trimmed = timeValue.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed.slice(0, 5);
}

function toMinutes(timeValue: string): number | null {
  const normalized = normalizeTime(timeValue);
  const match = normalized.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function hourlyBoundaries(startRaw: string, endRaw: string): string[] {
  const startMin = toMinutes(startRaw);
  const endMin = toMinutes(endRaw);
  if (startMin === null || endMin === null || endMin <= startMin) return [];

  const firstBoundary = Math.ceil(startMin / 60) * 60;
  const lastBoundary = Math.floor(endMin / 60) * 60;
  if (lastBoundary - firstBoundary < 60) return [];

  const output: string[] = [];
  for (let minute = firstBoundary; minute <= lastBoundary; minute += 60) {
    output.push(minutesToTime(minute));
  }
  return output;
}

function defaultRangeForSlot(slot: AvailableSlot): SlotRange | null {
  const boundaries = hourlyBoundaries(slot.startTime, slot.endTime);
  if (boundaries.length < 2) return null;
  return { start: boundaries[0], end: boundaries[1] };
}

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
  const [slotRanges, setSlotRanges] = useState<Record<string, SlotRange>>({});
  const [studentNotes, setStudentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSlot(slot: AvailableSlot) {
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(slot.id)) {
        next.delete(slot.id);
      } else {
        const defaultRange = defaultRangeForSlot(slot);
        if (!defaultRange) return next;
        next.add(slot.id);
        setSlotRanges((current) => ({
          ...current,
          [slot.id]: current[slot.id] || defaultRange,
        }));
      }
      return next;
    });
  }

  function updateSlotStart(slot: AvailableSlot, nextStart: string) {
    const boundaries = hourlyBoundaries(slot.startTime, slot.endTime);
    const current = slotRanges[slot.id] || defaultRangeForSlot(slot);
    if (!current) return;

    const nextIndex = boundaries.indexOf(nextStart);
    const currentEndIndex = boundaries.indexOf(current.end);
    const safeEnd =
      currentEndIndex > nextIndex
        ? current.end
        : boundaries[Math.min(nextIndex + 1, boundaries.length - 1)];

    setSlotRanges((prev) => ({
      ...prev,
      [slot.id]: { start: nextStart, end: safeEnd },
    }));
  }

  function updateSlotEnd(slotId: string, nextEnd: string) {
    setSlotRanges((prev) => ({
      ...prev,
      [slotId]: {
        ...(prev[slotId] || { start: "", end: "" }),
        end: nextEnd,
      },
    }));
  }

  async function requestSessions() {
    if (selectedSlotIds.size === 0) return;
    setLoading(true);
    setError(null);

    const slotArray = [...selectedSlotIds];
    const errors: string[] = [];

    for (const slotId of slotArray) {
      const slot = availableSlots.find((item) => item.id === slotId);
      if (!slot) {
        errors.push(`${slotId}: Slot not found`);
        continue;
      }

      const boundaries = hourlyBoundaries(slot.startTime, slot.endTime);
      if (boundaries.length < 2) {
        errors.push(`${slot.whenText}: No full 1-hour window available in this slot.`);
        continue;
      }

      const selectedRange = slotRanges[slotId] || defaultRangeForSlot(slot);
      if (!selectedRange) {
        errors.push(`${slot.whenText}: Could not determine requested time range.`);
        continue;
      }

      try {
        const response = await fetch("/api/portal/private-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            availabilityId: slotId,
            requestedStartTime: selectedRange.start,
            requestedEndTime: selectedRange.end,
            studentNotes: studentNotes.trim() || undefined,
          }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          const slotLabel = `${slot.whenText} (${selectedRange.start}-${selectedRange.end})`;
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
              const boundaries = hourlyBoundaries(slot.startTime, slot.endTime);
              const hasBookableHour = boundaries.length >= 2;
              const selectedRange = slotRanges[slot.id] || defaultRangeForSlot(slot);
              const selectedStart = selectedRange?.start || "";
              const selectedStartIndex = boundaries.indexOf(selectedStart);
              const endOptions =
                selectedStartIndex >= 0 ? boundaries.slice(selectedStartIndex + 1) : boundaries.slice(1);
              const durationHours =
                selectedRange && toMinutes(selectedRange.end) !== null && toMinutes(selectedRange.start) !== null
                  ? ((toMinutes(selectedRange.end) || 0) - (toMinutes(selectedRange.start) || 0)) / 60
                  : 0;

              return (
                <div
                  key={slot.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? "border-gold-400 bg-gold-50 dark:bg-gold-900/20 dark:border-gold-500"
                      : "border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    disabled={!hasBookableHour}
                    className="w-full text-left disabled:opacity-60"
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

                  {!hasBookableHour ? (
                    <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
                      {t(
                        "portal.privateSessions.noHourlyWindow",
                        "This slot does not contain a full 1-hour bookable window."
                      )}
                    </p>
                  ) : null}

                  {isSelected && hasBookableHour && selectedRange ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <label className="text-xs text-charcoal/70 dark:text-navy-300">
                        {t("portal.privateSessions.startTime", "Start")}
                        <select
                          value={selectedRange.start}
                          onChange={(event) => updateSlotStart(slot, event.target.value)}
                          className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-2 py-1.5 text-sm"
                        >
                          {boundaries.slice(0, -1).map((timeValue) => (
                            <option key={timeValue} value={timeValue}>
                              {timeValue}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-charcoal/70 dark:text-navy-300">
                        {t("portal.privateSessions.endTime", "End")}
                        <select
                          value={selectedRange.end}
                          onChange={(event) => updateSlotEnd(slot.id, event.target.value)}
                          className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-2 py-1.5 text-sm"
                        >
                          {endOptions.map((timeValue) => (
                            <option key={timeValue} value={timeValue}>
                              {timeValue}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="text-xs text-charcoal/70 dark:text-navy-300 sm:self-end pb-1">
                        {t("portal.privateSessions.duration", "Duration")}: {durationHours}{" "}
                        {durationHours === 1
                          ? t("portal.common.hour", "hour")
                          : t("portal.common.hours", "hours")}
                      </div>
                    </div>
                  ) : null}
                </div>
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
