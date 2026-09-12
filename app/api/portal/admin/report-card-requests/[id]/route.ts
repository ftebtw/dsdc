import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Admin retracts an open request. Uses DELETE semantics but actually just
// marks the row resolved so history stays intact.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { error } = await (supabase as any)
    .from("report_card_requests")
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: session.userId,
    })
    .eq("id", id)
    .is("resolved_at", null);

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
