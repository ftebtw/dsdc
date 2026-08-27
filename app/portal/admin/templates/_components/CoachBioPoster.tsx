import { POSTER_DIMENSIONS, type CoachBioEntry, type PosterAspect } from "./types";

type LayoutTokens = {
  bodyPadding: string;
  headerHeight: string;
  footerHeight: string;
  eyebrow: string;
  name: string;
  /** Base body font size in px BEFORE the user's scale is applied. */
  bodyPx: number;
  /** Base paragraph gap in px BEFORE the user's scale is applied. */
  paragraphGapPx: number;
  tagline: string;
  footerBrand: string;
};

function layoutFor(aspect: PosterAspect): LayoutTokens {
  if (aspect === "square") {
    return {
      bodyPadding: "px-14 py-10",
      headerHeight: "h-24",
      footerHeight: "h-24",
      eyebrow: "text-sm tracking-[0.36em]",
      name: "text-6xl",
      bodyPx: 28,
      paragraphGapPx: 20,
      tagline: "text-sm tracking-[0.32em]",
      footerBrand: "text-base",
    };
  }
  if (aspect === "landscape") {
    return {
      bodyPadding: "px-16 py-12",
      headerHeight: "h-24",
      footerHeight: "h-24",
      eyebrow: "text-sm tracking-[0.36em]",
      name: "text-6xl",
      bodyPx: 30,
      paragraphGapPx: 24,
      tagline: "text-sm tracking-[0.32em]",
      footerBrand: "text-base",
    };
  }
  return {
    bodyPadding: "px-16 py-14",
    headerHeight: "h-28",
    footerHeight: "h-28",
    eyebrow: "text-base tracking-[0.4em]",
    name: "text-8xl",
    bodyPx: 36,
    paragraphGapPx: 28,
    tagline: "text-base tracking-[0.36em]",
    footerBrand: "text-lg",
  };
}

/**
 * Render a paragraph with simple **bold** support. Splits on **...** and
 * renders the middle segments in bold navy.
 */
function renderParagraph(text: string, keyPrefix: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((s) => s.length > 0);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-bold text-navy-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export default function CoachBioPoster({
  entry,
  aspect,
}: {
  entry: CoachBioEntry;
  aspect: PosterAspect;
}) {
  const dims = POSTER_DIMENSIONS[aspect];
  const tokens = layoutFor(aspect);
  const name = entry.name.trim() || "Coach Name";
  const paragraphs = entry.body
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const tagline = (entry.tagline.trim() || "Breaking Barriers, Building Confidence").toUpperCase();
  const handle = entry.handle.trim();
  const scale = Number.isFinite(entry.bodyScale) && entry.bodyScale > 0 ? entry.bodyScale : 1;
  const bodyFontPx = tokens.bodyPx * scale;
  const paragraphGapPx = tokens.paragraphGapPx * scale;

  return (
    <div
      style={{ width: dims.width, height: dims.height }}
      className="relative flex flex-col overflow-hidden bg-[#fbf7ec]"
    >
      {/* Navy header */}
      <div className={`relative flex items-center bg-navy-900 px-14 ${tokens.headerHeight}`}>
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
      <div className={`flex flex-1 min-h-0 flex-col ${tokens.bodyPadding}`}>
        <div className={`font-semibold uppercase text-[#c9a227] ${tokens.eyebrow}`}>
          Coach Biography
        </div>
        <h1 className={`mt-3 font-serif font-bold leading-tight text-navy-900 ${tokens.name}`}>
          {name}
        </h1>
        <div className="mt-4 h-[3px] w-32 rounded bg-[#c9a227]" />

        <div
          className="mt-8 flex-1 min-h-0 overflow-hidden text-navy-900/80"
          style={{ fontSize: `${bodyFontPx}px` }}
        >
          {paragraphs.length === 0 ? (
            <p className="italic text-navy-900/40">
              Bio paragraphs will appear here. Wrap key phrases in **double asterisks** to bold them.
            </p>
          ) : (
            paragraphs.map((p, i) => (
              <p
                key={i}
                className="leading-relaxed"
                style={i === 0 ? undefined : { marginTop: `${paragraphGapPx}px` }}
              >
                {renderParagraph(p, `p-${i}`)}
              </p>
            ))
          )}
        </div>
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
