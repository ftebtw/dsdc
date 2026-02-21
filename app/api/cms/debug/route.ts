import { NextResponse } from "next/server";
import { getCmsMessageOverrides } from "@/lib/sanity/content";
import { getSanityClient } from "@/lib/sanity/client";
import { hasSanityConfig } from "@/lib/sanity/env";

export const dynamic = "force-dynamic";

type SingletonKey = "homePageContent" | "pricingPageContent" | "teamPageContent" | "siteSettings";

const singletonIds: SingletonKey[] = [
  "homePageContent",
  "pricingPageContent",
  "teamPageContent",
  "siteSettings",
];

/** GET /api/cms/debug - quick health snapshot for non-technical troubleshooting */
export async function GET() {
  const result = await getCmsMessageOverrides({ draft: false });

  const headline =
    result.overrides.en && typeof result.overrides.en === "object" && "hero" in result.overrides.en
      ? (result.overrides.en.hero as { headline?: string })?.headline
      : null;

  const singletonStatus: Record<SingletonKey, { exists: boolean; updatedAt: string | null }> = {
    homePageContent: { exists: false, updatedAt: null },
    pricingPageContent: { exists: false, updatedAt: null },
    teamPageContent: { exists: false, updatedAt: null },
    siteSettings: { exists: false, updatedAt: null },
  };

  if (hasSanityConfig()) {
    try {
      const client = getSanityClient({ draft: false });
      const docs = await client.fetch<Array<{ _id: string; _updatedAt: string }>>(
        `*[_id in ["homePageContent","pricingPageContent","teamPageContent","siteSettings"]]{_id,_updatedAt}`,
        {},
        { cache: "no-store" }
      );

      for (const doc of docs) {
        if (doc._id in singletonStatus) {
          singletonStatus[doc._id as SingletonKey] = { exists: true, updatedAt: doc._updatedAt };
        }
      }
    } catch {
      // leave default false/null values if status lookup fails
    }
  }

  const missingSingletons = singletonIds.filter((id) => !singletonStatus[id].exists);

  return NextResponse.json({
    source: result.source,
    hasOverrides: Boolean(result.overrides.en && Object.keys(result.overrides.en).length > 0),
    heroHeadlineFromCms: headline ?? "(none)",
    singletons: singletonStatus,
    missingSingletons,
    advice:
      missingSingletons.length > 0
        ? "Missing singleton documents detected. Open Studio -> Content and recreate the missing page."
        : "CMS singleton status is healthy.",
  });
}
