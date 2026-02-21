import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_PATHS = ["/", "/pricing", "/team", "/classes", "/awards", "/blog", "/book"];

function isAuthorized(request: NextRequest) {
  const expected = process.env.SANITY_WEBHOOK_SECRET;
  if (!expected) return true;
  const provided = request.headers.get("x-sanity-signature") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("cms-content");
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }

  return NextResponse.json({
    ok: true,
    revalidated: { paths: REVALIDATE_PATHS, tag: "cms-content" },
  });
}
