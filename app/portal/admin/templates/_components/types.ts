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
  startDate: string;
  intervalWeeks: number;
  daysOfWeek: WeekDay[];
  endType: EndType;
  endDate: string;
  endAfterCount: number;
};

export type Instructor = {
  id: string;
  name: string;
  description: string;
  photoDataUrl: string;
};

export type ClassEntry = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  instructors: Instructor[];
  recurrence: Recurrence;
};

export type BuilderMode = "single" | "term" | "coach";

export type CoachCardEntry = {
  id: string;
  name: string;
  title: string;
  photoDataUrl: string;
  achievements: string[];
  tagline: string;
  handle: string;
};

export function emptyCoachCardEntry(): CoachCardEntry {
  return {
    id: randomId(),
    name: "",
    title: "",
    photoDataUrl: "",
    achievements: [""],
    tagline: "Breaking Barriers, Building Confidence",
    handle: "@debate_education",
  };
}

export type PosterAspect = "portrait" | "square" | "landscape";

export const POSTER_DIMENSIONS: Record<PosterAspect, { width: number; height: number; label: string }> = {
  portrait: { width: 1080, height: 1620, label: "Portrait (2:3)" },
  square: { width: 1080, height: 1080, label: "Square (1:1)" },
  landscape: { width: 1620, height: 1080, label: "Landscape (3:2)" },
};

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function emptyInstructor(): Instructor {
  return {
    id: randomId(),
    name: "",
    description: "",
    photoDataUrl: "",
  };
}

export function emptyRecurrence(): Recurrence {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  return {
    startDate: iso,
    intervalWeeks: 1,
    daysOfWeek: ["tue"],
    endType: "after",
    endDate: "",
    endAfterCount: 10,
  };
}

export function emptyClassEntry(): ClassEntry {
  return {
    id: randomId(),
    title: "",
    description: "",
    startTime: "16:00",
    endTime: "17:00",
    instructors: [{ ...emptyInstructor(), name: "" }],
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

const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type Session = {
  date: Date;
  iso: string;
  dayShort: string;
  dayLong: string;
  monthShort: string;
  dayOfMonth: number;
  year: number;
  compactLabel: string; // "Sep 5 · Fri"
  longLabel: string;    // "Friday, September 5, 2026"
};

export function computeSessions(r: Recurrence): Session[] {
  if (!r.startDate || r.daysOfWeek.length === 0) return [];
  const sessions: Session[] = [];

  const [sy, sm, sd] = r.startDate.split("-").map((s) => parseInt(s, 10));
  if (!sy || !sm || !sd) return [];
  const startUtc = new Date(Date.UTC(sy, sm - 1, sd));

  let endUtc: Date | null = null;
  if (r.endType === "onDate" && r.endDate) {
    const [ey, em, ed] = r.endDate.split("-").map((s) => parseInt(s, 10));
    if (ey && em && ed) endUtc = new Date(Date.UTC(ey, em - 1, ed));
  }

  const dayIndex: Record<WeekDay, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };
  const wantedDays = r.daysOfWeek.map((d) => dayIndex[d]).sort((a, b) => a - b);

  // Anchor: Monday of the start week
  const startDow = startUtc.getUTCDay(); // 0 = Sun
  const mondayOffset = startDow === 0 ? -6 : 1 - startDow;
  const weekAnchor = new Date(startUtc);
  weekAnchor.setUTCDate(weekAnchor.getUTCDate() + mondayOffset);

  const wantedCount = r.endType === "after" ? Math.max(1, r.endAfterCount) : 100;
  const MAX_WEEKS = 520; // 10 years safety cap

  for (let wk = 0; wk < MAX_WEEKS; wk += r.intervalWeeks) {
    for (const dayDow of wantedDays) {
      // Map dayDow (0-6, Sun-Sat) to offset from Monday anchor
      const offsetFromMonday = dayDow === 0 ? 6 : dayDow - 1;
      const session = new Date(weekAnchor);
      session.setUTCDate(session.getUTCDate() + wk * 7 + offsetFromMonday);

      if (session < startUtc) continue;
      if (endUtc && session > endUtc) return sessions;

      sessions.push(buildSession(session));

      if (r.endType === "after" && sessions.length >= wantedCount) return sessions;
      if (r.endType === "never" && sessions.length >= 60) return sessions; // soft cap
    }
  }

  return sessions;
}

function buildSession(d: Date): Session {
  const dow = d.getUTCDay();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return {
    date: d,
    iso: d.toISOString().slice(0, 10),
    dayShort: DAY_SHORT[dow],
    dayLong: DAY_LONG[dow],
    monthShort: MONTH_SHORT[month],
    dayOfMonth: day,
    year,
    compactLabel: `${MONTH_SHORT[month]} ${day} · ${DAY_SHORT[dow]}`,
    longLabel: `${DAY_LONG[dow]}, ${MONTH_SHORT[month]} ${day}, ${year}`,
  };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
