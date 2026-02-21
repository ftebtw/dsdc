import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REVALIDATE_PATHS = [
  "/",
  "/pricing",
  "/team",
  "/classes",
  "/awards",
  "/blog",
  "/book",
  "/api/cms/messages",
];

function isAuthorized(request: NextRequest) {
  const expected = process.env.SANITY_WEBHOOK_SECRET;
  if (!expected) return true;
  const provided =
    request.headers.get("x-sanity-signature") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    new URL(request.url).searchParams.get("secret");
  return provided === expected;
}

function doRevalidate() {
  revalidateTag("cms-content");
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  doRevalidate();

  return NextResponse.json({
    ok: true,
    revalidated: { paths: REVALIDATE_PATHS, tag: "cms-content" },
  });
}

/** GET with ?secret=YOUR_WEBHOOK_SECRET — use to manually trigger revalidation for testing */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  doRevalidate();

  return NextResponse.json({
    ok: true,
    revalidated: { paths: REVALIDATE_PATHS, tag: "cms-content" },
    message: "Cache cleared. Hard-refresh the site to see changes.",
  });
}
