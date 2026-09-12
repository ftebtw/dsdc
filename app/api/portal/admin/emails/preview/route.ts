import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { resolveAdminEmailRecipients } from "@/lib/portal/admin-email-recipients";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  targetType: z.enum(["person", "all_students", "all_coaches", "class", "custom"]),
  id: z.string().uuid().optional(),
  ids: z.array(z.string().uuid()).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid payload.");

  const admin = getSupabaseAdminClient();
  const recipients = await resolveAdminEmailRecipients(admin, {
    type: parsed.data.targetType,
    id: parsed.data.id,
    ids: parsed.data.ids,
  });

  const wanted = recipients.filter((r) => r.wantsGeneralUpdates);
  return NextResponse.json({
    totalCount: recipients.length,
    optedInCount: wanted.length,
    optedOutCount: recipients.length - wanted.length,
    // Show the first 12 so the admin can sanity-check who's in scope. Don't
    // leak everyone; the caller doesn't need the full list.
    sample: recipients.slice(0, 12).map((r) => ({
      displayName: r.displayName,
      email: r.email,
      role: r.role,
      wantsGeneralUpdates: r.wantsGeneralUpdates,
    })),
  });
}
