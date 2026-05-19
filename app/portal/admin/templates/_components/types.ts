export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEK_DAYS: { value: WeekDay; short: string; long: string }[] = [
  { value: "mon", short: "M", long: "Monday" },
  { value: "tue", short: "T", long: "Tuesday" },
  { value: "wed", short: "W", long: "Wednesday" },
  { value: "thu", short: "T", long: "Thursday" },
  { value: "fri", short: "F", long: "Friday" },
  { value: "sat", short: "S", long: "Saturday" },
  { value: "sun", short: "S", long: "Sunday" },
];

export type EndType = "never" | "onDate" | "after";

export type Recurrence = {
  intervalWeeks: number;
  daysOfWeek: WeekDay[];
  endType: EndType;
  endDate: string;
  endAfterCount: number;
};

export type ClassEntry = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  coach: string;
  recurrence: Recurrence;
};

export type BuilderMode = "single" | "term";

export type PosterAspect = "portrait" | "square" | "landscape";

export const POSTER_DIMENSIONS: Record<PosterAspect, { width: number; height: number; label: string }> = {
  portrait: { width: 1080, height: 1350, label: "Portrait (4:5)" },
  square: { width: 1080, height: 1080, label: "Square (1:1)" },
  landscape: { width: 1350, height: 1080, label: "Landscape (5:4)" },
};

export function emptyRecurrence(): Recurrence {
  return {
    intervalWeeks: 1,
    daysOfWeek: ["tue"],
    endType: "after",
    endDate: "",
    endAfterCount: 10,
  };
}

export function emptyClassEntry(): ClassEntry {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()),
    title: "",
    startTime: "16:00",
    endTime: "17:00",
    coach: "",
    recurrence: emptyRecurrence(),
  };
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}

export function formatTime12h(hhmm: string): string {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return hhmm;
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

export function shortTimezone(tz: string): string {
  // "America/Vancouver" -> "Vancouver"; "America/Toronto" -> "Toronto"
  const last = tz.split("/").pop() ?? tz;
  return last.replace(/_/g, " ");
}

export function describeRecurrence(r: Recurrence): string {
  const dayLabels = r.daysOfWeek
    .map((d) => WEEK_DAYS.find((w) => w.value === d)?.long ?? d)
    .join(" & ");
  const interval =
    r.intervalWeeks === 1
      ? "Weekly"
      : r.intervalWeeks === 2
        ? "Every 2 weeks"
        : `Every ${r.intervalWeeks} weeks`;
  const ending =
    r.endType === "never"
      ? ""
      : r.endType === "onDate" && r.endDate
        ? ` until ${formatLongDate(r.endDate)}`
        : r.endType === "after" && r.endAfterCount > 0
          ? ` · ${r.endAfterCount} classes`
          : "";
  if (!dayLabels) return `${interval}${ending}`;
  return `${interval} on ${dayLabels}${ending}`;
}

export function formatLongDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
