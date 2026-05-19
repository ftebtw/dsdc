import {
  POSTER_DIMENSIONS,
  WEEK_DAYS,
  describeRecurrence,
  formatTimeRange,
  shortTimezone,
  type ClassEntry,
  type PosterAspect,
} from "./types";

export default function TermOverviewPoster({
  title,
  subtitle,
  entries,
  timezone,
  aspect,
}: {
  title: string;
  subtitle: string;
  entries: ClassEntry[];
  timezone: string;
  aspect: PosterAspect;
}) {
  const dims = POSTER_DIMENSIONS[aspect];
  const tzShort = shortTimezone(timezone);
  const headerTitle = title.trim() || "Class Schedule";
  const headerSubtitle = subtitle.trim();

  return (
    <div
      style={{ width: dims.width, height: dims.height }}
      className="relative overflow-hidden bg-warm-50 text-navy-900"
    >
      <div className="absolute inset-x-0 top-0 h-3" style={{ background: "linear-gradient(90deg, #c9a227 0%, #f5ecd0 50%, #c9a227 100%)" }} />
      <div className="absolute inset-x-0 top-3 h-32 bg-navy-900" />

      <div className="relative flex h-full flex-col p-14">
        <div className="flex items-start justify-between text-white">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-300">DSDC</div>
            <div className="mt-1 text-base text-warm-100/80">Debate &amp; Speech Development Community</div>
          </div>
          <div className="text-right text-sm text-warm-100/80">
            <div>dsdc.ca</div>
            <div className="mt-1">All times {tzShort}</div>
          </div>
        </div>

        <div className="mt-4 text-white">
          <h1 className="text-5xl font-bold tracking-tight">{headerTitle}</h1>
          {headerSubtitle ? (
            <div className="mt-1 text-xl text-warm-100/85">{headerSubtitle}</div>
          ) : null}
        </div>

        <div className="mt-10 flex-1 overflow-hidden">
          {entries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-2xl text-charcoal/50">
              Add a class to see it here
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {entries.map((entry, idx) => {
                const activeDays = WEEK_DAYS.filter((d) => entry.recurrence.daysOfWeek.includes(d.value));
                const title = entry.title.trim() || `Class ${idx + 1}`;
                const coach = entry.coach.trim() || "Coach";
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-6 rounded-2xl border border-warm-300 bg-white px-6 py-4 shadow-sm"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-2xl font-bold text-gold-300">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-navy-900">{title}</div>
                      <div className="mt-1 text-base text-charcoal/70">
                        <span className="font-semibold text-navy-700">Coach {coach}</span>
                        <span className="mx-2 text-charcoal/30">·</span>
                        <span>{describeRecurrence(entry.recurrence)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-navy-900">
                        {formatTimeRange(entry.startTime, entry.endTime)}
                      </div>
                      <div className="mt-1 flex justify-end gap-1.5">
                        {activeDays.map((d) => (
                          <div
                            key={d.value}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-100 text-xs font-semibold text-gold-700"
                          >
                            {d.short}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-warm-300 pt-5 text-sm text-charcoal/70">
          <div>Online debate &amp; public speaking · Grades 4–12 · Canadian National Debate Team coaches</div>
          <div className="font-semibold text-navy-800">dsdc.ca</div>
        </div>
      </div>
    </div>
  );
}
