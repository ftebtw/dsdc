import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { sendPortalEmails } from "@/lib/email/send";
import { feedbackResponseToAdminTemplate } from "@/lib/email/templates";
import { portalPathUrl } from "@/lib/portal/phase-c";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const schema = z.object({
  response: z.string().trim().min(3).max(4000),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function coachOnClassTeam(supabase: any, classId: string, userId: string): Promise<boolean> {
  const { data: classRow } = await supabase
    .from("classes")
    .select("coach_id")
    .eq("id", classId)
    .maybeSingle();
  if (!classRow) return false;
  if (classRow.coach_id === userId) return true;
  const [{ data: coCoach }, { data: subReq }, { data: taReq }] = await Promise.all([
    supabase.from("class_coaches").select("id").eq("class_id", classId).eq("coach_id", userId).maybeSingle(),
    supabase
      .from("sub_requests")
      .select("id")
      .eq("class_id", classId)
      .eq("accepting_coach_id", userId)
      .eq("status", "accepted")
      .maybeSingle(),
    supabase
      .from("ta_requests")
      .select("id")
      .eq("class_id", classId)
      .eq("accepting_ta_id", userId)
      .eq("status", "accepted")
      .maybeSingle(),
  ]);
  return Boolean(coCoach || subReq || taReq);
}

// Coach writes/updates their response. Moves the row to pending_admin
// regardless of whether it was pending_coach (fresh) or bounced back after
// an admin rejection.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ["coach", "ta", "admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid response.");

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const adminClient = getSupabaseAdminClient();

  const { data: row } = await supabase
    .from("feedback_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!row) return mergeCookies(supabaseResponse, jsonError("Feedback request not found.", 404));

  if (row.status !== "pending_coach") {
    return mergeCookies(
      supabaseResponse,
      jsonError("This request isn't waiting on a coach response right now.", 400)
    );
  }

  if (session.profile.role !== "admin") {
    const allowed = await coachOnClassTeam(supabase, row.class_id, session.userId);
    if (!allowed) return mergeCookies(supabaseResponse, jsonError("Not allowed for this class.", 403));
  }

  const { data: updated, error: updateError } = await supabase
    .from("feedback_requests")
    .update({
      coach_response: parsed.data.response,
      coach_responded_at: new Date().toISOString(),
      status: "pending_admin",
      // Clear stale rejection notes on the next draft, but keep rejection_count
      // so admins can spot a repeat-redraft.
      admin_rejection_notes: null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  // Notify admins that a response is ready for review.
  try {
    const [{ data: admins }, { data: classRow }, { data: student }] = await Promise.all([
      adminClient
        .from("profiles")
        .select("email,display_name,notification_preferences")
        .eq("role", "admin"),
      adminClient.from("classes").select("name").eq("id", row.class_id).maybeSingle(),
      adminClient.from("profiles").select("display_name,email").eq("id", row.student_id).maybeSingle(),
    ]);
    const recipients = (admins ?? [])
      .map((a: any) => a?.email)
      .filter((email: string | null): email is string => Boolean(email));
    if (recipients.length > 0) {
      const template = feedbackResponseToAdminTemplate({
        className: classRow?.name ?? "class",
        studentName: student?.display_name || student?.email || "Student",
        coachName: session.profile.display_name || session.profile.email || "Coach",
        responsePreview: parsed.data.response.slice(0, 280),
        portalUrl: portalPathUrl("/portal/admin/feedback"),
      });
      await sendPortalEmails(recipients.map((to: string) => ({ to, ...template })));
    }
  } catch (err) {
    console.error("[feedback-requests] admin email failed", err);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ request: updated }));
}
