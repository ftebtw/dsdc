import { getCmsMessageOverrides } from "@/lib/sanity/content";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/cms/debug — check what CMS is returning (hero.headline sample) */
export async function GET() {
  const result = await getCmsMessageOverrides({ draft: false });
  const headline = result.overrides.en && typeof result.overrides.en === "object" && "hero" in result.overrides.en
    ? (result.overrides.en.hero as { headline?: string })?.headline
    : null;
  return NextResponse.json({
    source: result.source,
    heroHeadlineFromCms: headline ?? "(none)",
    hasOverrides: Boolean(result.overrides.en && Object.keys(result.overrides.en).length > 0),
  });
}
