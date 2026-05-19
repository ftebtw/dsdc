import {
  POSTER_DIMENSIONS,
  WEEK_DAYS,
  describeRecurrence,
  formatTime12h,
  shortTimezone,
  type ClassEntry,
  type PosterAspect,
} from "./types";

export default function SingleClassPoster({
  entry,
  timezone,
  aspect,
}: {
  entry: ClassEntry;
  timezone: string;
  aspect: PosterAspect;
}) {
  const dims = POSTER_DIMENSIONS[aspect];
  const title = entry.title.trim() || "Class Title";
  const coach = entry.coach.trim() || "Coach";
  const tzShort = shortTimezone(timezone);
  const activeDays = WEEK_DAYS.filter((d) => entry.recurrence.daysOfWeek.includes(d.value));

  return (
    <div
      style={{ width: dims.width, height: dims.height }}
      className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white"
    >
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{ background: "linear-gradient(90deg, #c9a227 0%, #f5ecd0 50%, #c9a227 100%)" }}
      />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #D4A843 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-24 -bottom-32 h-[480px] w-[480px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #4164af 0%, transparent 70%)" }}
      />

      <div className="relative flex h-full flex-col p-16">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-300">DSDC</div>
            <div className="mt-1 text-base text-warm-100/80">Debate &amp; Speech Development Community</div>
          </div>
          <div className="text-right text-sm text-warm-100/80">
            <div>dsdc.ca</div>
          </div>
        </div>

        <div className="mt-12 flex-1">
          <div className="text-base font-semibold uppercase tracking-[0.25em] text-gold-300">Class Schedule</div>
          <h1 className="mt-3 text-7xl font-bold leading-tight text-white">{title}</h1>

          <div className="mt-10 flex items-baseline gap-3">
            <div className="text-6xl font-bold text-gold-300">
              {formatTime12h(entry.startTime)}
            </div>
            <div className="text-4xl text-warm-100/80">–</div>
            <div className="text-6xl font-bold text-gold-300">
              {formatTime12h(entry.endTime)}
            </div>
            <div className="ml-3 text-2xl text-warm-100/80">{tzShort}</div>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-warm-100/70">Days</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {activeDays.length === 0 ? (
                <div className="text-2xl text-warm-100/60">No days selected</div>
              ) : (
                activeDays.map((d) => (
                  <div
                    key={d.value}
                    className="rounded-xl border-2 border-gold-400/60 bg-gold-400/10 px-5 py-3 text-2xl font-semibold text-gold-300"
                  >
                    {d.long}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 text-2xl text-warm-100/85">{describeRecurrence(entry.recurrence)}</div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-gold-400/30" />
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-warm-100/70">Instructor</div>
            <div className="h-px flex-1 bg-gold-400/30" />
          </div>
          <div className="mt-4 text-center text-4xl font-semibold text-white">{coach}</div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-warm-100/20 pt-6 text-sm text-warm-100/70">
          <div>Online debate &amp; public speaking · Grades 4–12</div>
          <div className="font-semibold text-gold-300">dsdc.ca</div>
        </div>
      </div>
    </div>
  );
}
