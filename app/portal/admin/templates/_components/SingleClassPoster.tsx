import {
  POSTER_DIMENSIONS,
  computeSessions,
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
  const description = entry.description.trim();
  const tzShort = shortTimezone(timezone);
  const sessions = computeSessions(entry.recurrence);
  const recurrenceSummary = describeRecurrence(entry.recurrence);
  const instructors = entry.instructors.filter((i) => i.name.trim() || i.description.trim() || i.photoDataUrl);

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

      <div className="relative flex h-full flex-col p-14">
        <div className="flex items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logos/logo-full.png"
            alt="DSDC"
            className="h-16 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <div className="text-right text-sm text-warm-100/80">
            <div className="font-semibold text-gold-300">dsdc.ca</div>
            <div className="mt-1">All times {tzShort}</div>
          </div>
        </div>

        <div className="mt-10">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-300">Class Schedule</div>
          <h1 className="mt-2 text-6xl font-bold leading-tight text-white">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-[820px] text-xl leading-relaxed text-warm-100/85">{description}</p>
          ) : null}
        </div>

        <div className="mt-8 flex items-baseline gap-3">
          <div className="text-5xl font-bold text-gold-300">{formatTime12h(entry.startTime)}</div>
          <div className="text-3xl text-warm-100/80">–</div>
          <div className="text-5xl font-bold text-gold-300">{formatTime12h(entry.endTime)}</div>
          <div className="ml-3 text-xl text-warm-100/75">{tzShort}</div>
        </div>

        <div className="mt-8 flex-1">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-warm-100/70">
              Sessions {sessions.length > 0 ? `· ${sessions.length} total` : ""}
            </div>
            <div className="text-base text-warm-100/65">{recurrenceSummary}</div>
          </div>

          <div className="mt-4">
            {sessions.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-warm-100/30 p-6 text-center text-xl text-warm-100/55">
                Set a start date and select days to list sessions.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
                {sessions.map((s, idx) => (
                  <div
                    key={s.iso}
                    className="flex items-baseline gap-3 border-b border-warm-100/15 pb-2 text-lg text-white"
                  >
                    <span className="w-7 text-right font-mono text-sm text-gold-300/85">{String(idx + 1).padStart(2, "0")}</span>
                    <span className="font-bold text-gold-300">{s.monthShort} {s.dayOfMonth}</span>
                    <span className="text-warm-100/85">{s.dayLong}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {instructors.length > 0 ? (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-4">
              <div className="h-px flex-1 bg-gold-400/30" />
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-warm-100/70">
                {instructors.length === 1 ? "Instructor" : "Instructors"}
              </div>
              <div className="h-px flex-1 bg-gold-400/30" />
            </div>
            <div className={`grid gap-5 ${instructors.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {instructors.map((ins) => (
                <div key={ins.id} className="flex gap-4">
                  {ins.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ins.photoDataUrl}
                      alt={ins.name || "Instructor"}
                      className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-gold-400/50"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-3xl font-bold text-gold-300 ring-4 ring-gold-400/30">
                      {initialOf(ins.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-2xl font-bold leading-tight text-white">
                      {ins.name.trim() || "Instructor"}
                    </div>
                    {ins.description.trim() ? (
                      <div className="mt-1 text-base leading-snug text-warm-100/80">
                        {ins.description.trim()}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between border-t border-warm-100/20 pt-5 text-sm text-warm-100/70">
          <div>Online debate &amp; public speaking · Grades 4–12</div>
          <div className="font-semibold text-gold-300">dsdc.ca</div>
        </div>
      </div>
    </div>
  );
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
