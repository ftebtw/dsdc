import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Requester cancels their own request. Only allowed while the request is
// still with the coach; once the coach has drafted a response it's up to
// the admin to approve or bounce it.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ["student", "parent", "admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: row } = await supabase
    .from("feedback_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!row) return mergeCookies(supabaseResponse, jsonError("Feedback request not found.", 404));

  if (session.profile.role !== "admin") {
    if (row.requested_by !== session.userId) {
      return mergeCookies(supabaseResponse, jsonError("Not allowed.", 403));
    }
    if (row.status !== "pending_coach") {
      return mergeCookies(
        supabaseResponse,
        jsonError("Can only cancel while the coach hasn't responded yet.", 400)
      );
    }
  }

  const { error } = await supabase
    .from("feedback_requests")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
