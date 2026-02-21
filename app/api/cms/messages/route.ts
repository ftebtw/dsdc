import { NextResponse } from "next/server";
import { getCmsMessageOverrides } from "@/lib/sanity/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getCmsMessageOverrides();

  if (result.source === "fallback") {
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}
