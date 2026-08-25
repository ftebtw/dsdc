import { POSTER_DIMENSIONS, type CoachCardEntry, type PosterAspect } from "./types";

type LayoutTokens = {
  padding: string;
  headerHeight: string;
  footerHeight: string;
  photoWrap: string;
  photoRing: string;
  eyebrow: string;
  name: string;
  title: string;
  achievement: string;
  achievementGap: string;
  tagline: string;
  footerBrand: string;
};

function layoutFor(aspect: PosterAspect): LayoutTokens {
  if (aspect === "square") {
    return {
      padding: "p-10",
      headerHeight: "h-24",
      footerHeight: "h-28",
      photoWrap: "h-52 w-52",
      photoRing: "ring-[10px]",
      eyebrow: "text-sm tracking-[0.4em]",
      name: "text-5xl",
      title: "text-sm tracking-[0.28em]",
      achievement: "text-lg",
      achievementGap: "space-y-2",
      tagline: "text-sm tracking-[0.32em]",
      footerBrand: "text-base",
    };
  }
  if (aspect === "landscape") {
    return {
      padding: "p-12",
      headerHeight: "h-24",
      footerHeight: "h-28",
      photoWrap: "h-56 w-56",
      photoRing: "ring-[10px]",
      eyebrow: "text-sm tracking-[0.4em]",
      name: "text-5xl",
      title: "text-sm tracking-[0.28em]",
      achievement: "text-xl",
      achievementGap: "space-y-2.5",
      tagline: "text-sm tracking-[0.32em]",
      footerBrand: "text-base",
    };
  }
  return {
    padding: "p-14",
    headerHeight: "h-32",
    footerHeight: "h-36",
    photoWrap: "h-80 w-80",
    photoRing: "ring-[14px]",
    eyebrow: "text-lg tracking-[0.42em]",
    name: "text-7xl",
    title: "text-xl tracking-[0.32em]",
    achievement: "text-2xl",
    achievementGap: "space-y-3",
    tagline: "text-lg tracking-[0.36em]",
    footerBrand: "text-2xl",
  };
}

export default function CoachCardPoster({
  entry,
  aspect,
}: {
  entry: CoachCardEntry;
  aspect: PosterAspect;
}) {
  const dims = POSTER_DIMENSIONS[aspect];
  const tokens = layoutFor(aspect);
  const name = entry.name.trim() || "Coach Name";
  const title = (entry.title.trim() || "Debate Coach").toUpperCase();
  const achievements = entry.achievements
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const tagline = (entry.tagline.trim() || "Breaking Barriers, Building Confidence").toUpperCase();
  const handle = entry.handle.trim();

  return (
    <div
      style={{ width: dims.width, height: dims.height }}
      className="relative flex flex-col overflow-hidden bg-[#fbf7ec]"
    >
      {/* Navy header */}
      <div className={`relative flex items-center justify-center bg-navy-900 ${tokens.headerHeight}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logos/logo-full.png"
          alt="DSDC"
          className="h-10 w-auto object-contain"
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>

      {/* Gold rule */}
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #c9a227 0%, #f5ecd0 50%, #c9a227 100%)" }} />

      {/* Cream body */}
      <div className={`flex flex-1 min-h-0 flex-col items-center ${tokens.padding}`}>
        {/* Photo */}
        <div className={`relative shrink-0 overflow-hidden rounded-full ring-[#c9a227] ${tokens.photoWrap} ${tokens.photoRing}`}>
          {entry.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.photoDataUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#e6dcc0] text-6xl font-bold text-[#c9a227]">
              {initialsOf(name)}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-8 text-center">
          <div className={`font-semibold uppercase text-[#c9a227] ${tokens.eyebrow}`}>
            Meet the Coach
          </div>
          <h1 className={`mt-4 font-serif font-bold text-navy-900 ${tokens.name}`}>
            {name}
          </h1>
          <div className={`mt-3 font-semibold text-navy-900/60 ${tokens.title}`}>
            {title}
          </div>
          <div className="mx-auto mt-4 h-[3px] w-24" style={{ background: "linear-gradient(90deg, transparent 0%, #c9a227 50%, transparent 100%)" }} />
        </div>

        {/* Achievements */}
        {achievements.length > 0 ? (
          <div className={`mt-8 flex-1 min-h-0 overflow-hidden text-center ${tokens.achievementGap}`}>
            {achievements.map((line, i) => (
              <p key={i} className={`leading-snug text-navy-900 ${tokens.achievement}`}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Gold rule */}
      <div className="h-1.5" style={{ background: "linear-gradient(90deg, #c9a227 0%, #f5ecd0 50%, #c9a227 100%)" }} />

      {/* Navy footer */}
      <div className={`flex flex-col items-center justify-center gap-2 bg-navy-900 text-center ${tokens.footerHeight}`}>
        <div className={`italic text-[#c9a227] ${tokens.tagline}`}>{tagline}</div>
        <div className={`font-semibold text-white ${tokens.footerBrand}`}>
          dsdc.ca{handle ? <span className="text-white/50"> · </span> : null}
          {handle ? <span>{handle}</span> : null}
        </div>
      </div>
    </div>
  );
}

function initialsOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
