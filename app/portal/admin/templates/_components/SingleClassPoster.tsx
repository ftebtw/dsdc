import {
  POSTER_DIMENSIONS,
  computeSessions,
  describeRecurrence,
  formatTime12h,
  shortTimezone,
  type ClassEntry,
  type Instructor,
  type PosterAspect,
  type Session,
} from "./types";

type LayoutTokens = {
  padding: string;
  titleSize: string;
  timeSize: string;
  timeSeparatorSize: string;
  descriptionSize: string;
  descriptionClamp: string;
  sessionCols: string;
  sessionFont: string;
  sessionRowGapY: string;
  sessionRowGapX: string;
  maxSessions: number;
  sectionGap: string;
  instructorPhoto: string;
  instructorPhotoRing: string;
  instructorInitials: string;
  instructorName: string;
  instructorBio: string;
  instructorCols: (count: number) => string;
  showInstructorBio: boolean;
};

function layoutFor(aspect: PosterAspect, instructorCount: number): LayoutTokens {
  if (aspect === "square") {
    return {
      padding: "p-8",
      titleSize: "text-4xl",
      timeSize: "text-3xl",
      timeSeparatorSize: "text-2xl",
      descriptionSize: "text-sm",
      descriptionClamp: "line-clamp-2",
      sessionCols: "grid-cols-4",
      sessionFont: "text-sm",
      sessionRowGapY: "gap-y-1",
      sessionRowGapX: "gap-x-3",
      maxSessions: 12,
      sectionGap: "mt-3",
      instructorPhoto: "h-14 w-14",
      instructorPhotoRing: "ring-2",
      instructorInitials: "text-lg",
      instructorName: "text-base",
      instructorBio: "text-xs",
      instructorCols: (count) => (count <= 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-3"),
      showInstructorBio: instructorCount <= 1,
    };
  }
  if (aspect === "landscape") {
    return {
      padding: "p-12",
      titleSize: "text-5xl",
      timeSize: "text-4xl",
      timeSeparatorSize: "text-2xl",
      descriptionSize: "text-base",
      descriptionClamp: "line-clamp-3",
      sessionCols: "grid-cols-2",
      sessionFont: "text-base",
      sessionRowGapY: "gap-y-2",
      sessionRowGapX: "gap-x-5",
      maxSessions: 14,
      sectionGap: "mt-5",
      instructorPhoto: "h-20 w-20",
      instructorPhotoRing: "ring-4",
      instructorInitials: "text-2xl",
      instructorName: "text-xl",
      instructorBio: "text-sm",
      instructorCols: (count) => (count <= 1 ? "grid-cols-1" : "grid-cols-2"),
      showInstructorBio: true,
    };
  }
  // portrait (default) — most spacious aspect; bigger typography for impact
  return {
    padding: "p-14",
    titleSize: "text-7xl",
    timeSize: "text-6xl",
    timeSeparatorSize: "text-4xl",
    descriptionSize: "text-2xl",
    descriptionClamp: "",
    sessionCols: "grid-cols-3",
    sessionFont: "text-2xl",
    sessionRowGapY: "gap-y-4",
    sessionRowGapX: "gap-x-6",
    maxSessions: 21,
    sectionGap: "mt-9",
    instructorPhoto: "h-32 w-32",
    instructorPhotoRing: "ring-4",
    instructorInitials: "text-4xl",
    instructorName: "text-3xl",
    instructorBio: "text-xl",
    instructorCols: (count) => (count <= 1 ? "grid-cols-1" : "grid-cols-2"),
    showInstructorBio: true,
  };
}

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
  const allSessions = computeSessions(entry.recurrence);
  const recurrenceSummary = describeRecurrence(entry.recurrence);
  const instructors = entry.instructors.filter(
    (i) => i.name.trim() || i.description.trim() || i.photoDataUrl
  );
  const tokens = layoutFor(aspect, instructors.length);
  const sessions = allSessions.slice(0, tokens.maxSessions);
  const extraSessionCount = allSessions.length - sessions.length;

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

      {aspect === "landscape" ? (
        <LandscapeLayout
          tokens={tokens}
          title={title}
          description={description}
          startTime={entry.startTime}
          endTime={entry.endTime}
          tzShort={tzShort}
          sessions={sessions}
          extraSessionCount={extraSessionCount}
          recurrenceSummary={recurrenceSummary}
          instructors={instructors}
        />
      ) : (
        <VerticalLayout
          tokens={tokens}
          title={title}
          description={description}
          startTime={entry.startTime}
          endTime={entry.endTime}
          tzShort={tzShort}
          sessions={sessions}
          extraSessionCount={extraSessionCount}
          recurrenceSummary={recurrenceSummary}
          instructors={instructors}
        />
      )}
    </div>
  );
}

type SectionsProps = {
  tokens: LayoutTokens;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  tzShort: string;
  sessions: Session[];
  extraSessionCount: number;
  recurrenceSummary: string;
  instructors: Instructor[];
};

function PosterHeader({ tzShort, includeTz }: { tzShort: string; includeTz: boolean }) {
  return (
    <div className="flex items-start justify-between">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logos/logo-full.png"
        alt="DSDC"
        className="h-14 w-auto object-contain"
        style={{ filter: "brightness(0) invert(1)" }}
      />
      <div className="text-right text-sm text-warm-100/80">
        <div className="font-semibold text-gold-300">dsdc.ca</div>
        {includeTz ? <div className="mt-1">All times {tzShort}</div> : null}
      </div>
    </div>
  );
}

function TitleBlock({
  tokens,
  title,
  description,
}: {
  tokens: LayoutTokens;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-300">Class Schedule</div>
      <h1 className={`mt-2 font-bold leading-tight text-white ${tokens.titleSize}`}>{title}</h1>
      {description ? (
        <p className={`mt-3 max-w-[820px] leading-relaxed text-warm-100/85 ${tokens.descriptionSize} ${tokens.descriptionClamp}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function TimeBlock({
  tokens,
  startTime,
  endTime,
  tzShort,
}: {
  tokens: LayoutTokens;
  startTime: string;
  endTime: string;
  tzShort: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <div className={`font-bold text-gold-300 ${tokens.timeSize}`}>{formatTime12h(startTime)}</div>
      <div className={`text-warm-100/80 ${tokens.timeSeparatorSize}`}>–</div>
      <div className={`font-bold text-gold-300 ${tokens.timeSize}`}>{formatTime12h(endTime)}</div>
      <div className="ml-3 text-xl text-warm-100/75">{tzShort}</div>
    </div>
  );
}

function SessionsBlock({
  tokens,
  sessions,
  extraSessionCount,
  recurrenceSummary,
}: {
  tokens: LayoutTokens;
  sessions: Session[];
  extraSessionCount: number;
  recurrenceSummary: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-warm-100/70">
          Sessions {sessions.length > 0 ? `· ${sessions.length + extraSessionCount} total` : ""}
        </div>
        <div className="text-base text-warm-100/65">{recurrenceSummary}</div>
      </div>

      <div className="mt-4">
        {sessions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-warm-100/30 p-6 text-center text-xl text-warm-100/55">
            Set a start date and select days to list sessions.
          </div>
        ) : (
          <>
            <div className={`grid ${tokens.sessionCols} ${tokens.sessionRowGapX} ${tokens.sessionRowGapY}`}>
              {sessions.map((s, idx) => (
                <div
                  key={s.iso}
                  className={`flex items-baseline gap-3 border-b border-warm-100/15 pb-1.5 text-white ${tokens.sessionFont}`}
                >
                  <span className="w-6 text-right font-mono text-xs text-gold-300/85">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-bold text-gold-300">
                    {s.monthShort} {s.dayOfMonth}
                  </span>
                  <span className="text-warm-100/85">{s.dayLong}</span>
                </div>
              ))}
            </div>
            {extraSessionCount > 0 ? (
              <div className="mt-3 text-sm font-semibold text-gold-300/80">
                + {extraSessionCount} more session{extraSessionCount === 1 ? "" : "s"}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function InstructorBlock({
  tokens,
  instructors,
}: {
  tokens: LayoutTokens;
  instructors: Instructor[];
}) {
  if (instructors.length === 0) return null;
  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <div className="h-px flex-1 bg-gold-400/30" />
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-warm-100/70">
          {instructors.length === 1 ? "Instructor" : "Instructors"}
        </div>
        <div className="h-px flex-1 bg-gold-400/30" />
      </div>
      <div className={`grid gap-5 ${tokens.instructorCols(instructors.length)}`}>
        {instructors.map((ins) => (
          <div key={ins.id} className="flex gap-4">
            {ins.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ins.photoDataUrl}
                alt={ins.name || "Instructor"}
                className={`shrink-0 rounded-full object-cover ring-gold-400/50 ${tokens.instructorPhoto} ${tokens.instructorPhotoRing}`}
              />
            ) : (
              <div
                className={`flex shrink-0 items-center justify-center rounded-full bg-gold-400/15 font-bold text-gold-300 ring-gold-400/30 ${tokens.instructorPhoto} ${tokens.instructorPhotoRing} ${tokens.instructorInitials}`}
              >
                {initialOf(ins.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className={`font-bold leading-tight text-white ${tokens.instructorName}`}>
                {ins.name.trim() || "Instructor"}
              </div>
              {tokens.showInstructorBio && ins.description.trim() ? (
                <div className={`mt-1 leading-snug text-warm-100/80 ${tokens.instructorBio}`}>
                  {ins.description.trim()}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PosterFooter() {
  return (
    <div className="flex items-center justify-between border-t border-warm-100/20 pt-5 text-sm text-warm-100/70">
      <div>Online debate &amp; public speaking · Grades 4–12</div>
      <div className="font-semibold text-gold-300">dsdc.ca</div>
    </div>
  );
}

function VerticalLayout({
  tokens,
  title,
  description,
  startTime,
  endTime,
  tzShort,
  sessions,
  extraSessionCount,
  recurrenceSummary,
  instructors,
}: SectionsProps) {
  return (
    <div className={`relative flex h-full flex-col ${tokens.padding}`}>
      <PosterHeader tzShort={tzShort} includeTz />
      <div className={tokens.sectionGap}>
        <TitleBlock tokens={tokens} title={title} description={description} />
      </div>
      <div className={tokens.sectionGap}>
        <TimeBlock tokens={tokens} startTime={startTime} endTime={endTime} tzShort={tzShort} />
      </div>
      <div className={`min-h-0 overflow-hidden ${tokens.sectionGap}`}>
        <SessionsBlock
          tokens={tokens}
          sessions={sessions}
          extraSessionCount={extraSessionCount}
          recurrenceSummary={recurrenceSummary}
        />
      </div>
      {instructors.length > 0 ? (
        <div className={tokens.sectionGap}>
          <InstructorBlock tokens={tokens} instructors={instructors} />
        </div>
      ) : null}
      <div className={`mt-auto pt-6`}>
        <PosterFooter />
      </div>
    </div>
  );
}

function LandscapeLayout({
  tokens,
  title,
  description,
  startTime,
  endTime,
  tzShort,
  sessions,
  extraSessionCount,
  recurrenceSummary,
  instructors,
}: SectionsProps) {
  return (
    <div className={`relative flex h-full flex-col ${tokens.padding}`}>
      <PosterHeader tzShort={tzShort} includeTz />
      <div className="mt-6 flex-1 min-h-0 overflow-hidden">
        <div className="flex h-full gap-10">
          <div className="flex w-[44%] shrink-0 flex-col">
            <TitleBlock tokens={tokens} title={title} description={description} />
            <div className={tokens.sectionGap}>
              <TimeBlock tokens={tokens} startTime={startTime} endTime={endTime} tzShort={tzShort} />
            </div>
            {instructors.length > 0 ? (
              <div className={`flex-1 min-h-0 overflow-hidden ${tokens.sectionGap}`}>
                <InstructorBlock tokens={tokens} instructors={instructors} />
              </div>
            ) : (
              <div className="flex-1" />
            )}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <SessionsBlock
              tokens={tokens}
              sessions={sessions}
              extraSessionCount={extraSessionCount}
              recurrenceSummary={recurrenceSummary}
            />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <PosterFooter />
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
