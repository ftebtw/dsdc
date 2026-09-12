import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { sendPortalEmails } from "@/lib/email/send";
import { feedbackApprovedToRequesterTemplate } from "@/lib/email/templates";
import { portalPathUrl } from "@/lib/portal/phase-c";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().trim().max(2000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Admin approves the coach's draft (row -> approved, requester is emailed) or
// rejects it back to the coach with notes (row -> pending_coach, coach can
// redraft). Requester is never emailed on rejection.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid payload.");

  if (parsed.data.action === "reject" && !parsed.data.notes?.trim()) {
    return jsonError("Please explain what you'd like the coach to change before rejecting.");
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const adminClient = getSupabaseAdminClient();

  const { data: row } = await supabase
    .from("feedback_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!row) return mergeCookies(supabaseResponse, jsonError("Feedback request not found.", 404));

  if (row.status !== "pending_admin") {
    return mergeCookies(
      supabaseResponse,
      jsonError("This request isn't waiting on admin review right now.", 400)
    );
  }

  const now = new Date().toISOString();
  const patch =
    parsed.data.action === "approve"
      ? {
          status: "approved",
          admin_reviewed_by: session.userId,
          admin_reviewed_at: now,
          approved_at: now,
          admin_rejection_notes: null,
        }
      : {
          status: "pending_coach",
          admin_reviewed_by: session.userId,
          admin_reviewed_at: now,
          admin_rejection_notes: parsed.data.notes!.trim(),
          rejection_count: (row.rejection_count ?? 0) + 1,
        };

  const { data: updated, error: updateError } = await supabase
    .from("feedback_requests")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  if (parsed.data.action === "approve") {
    try {
      const [{ data: requester }, { data: classRow }, { data: student }, { data: coach }] = await Promise.all([
        adminClient
          .from("profiles")
          .select("email,display_name,role")
          .eq("id", row.requested_by)
          .maybeSingle(),
        adminClient.from("classes").select("name,coach_id").eq("id", row.class_id).maybeSingle(),
        adminClient.from("profiles").select("display_name,email").eq("id", row.student_id).maybeSingle(),
        row.coach_response
          ? adminClient
              .from("profiles")
              .select("display_name,email")
              .eq(
                "id",
                (
                  await adminClient
                    .from("classes")
                    .select("coach_id")
                    .eq("id", row.class_id)
                    .maybeSingle()
                ).data?.coach_id ?? row.requested_by
              )
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (requester?.email) {
        const portalPath =
          requester.role === "parent" ? "/portal/parent/feedback" : "/portal/student/feedback";
        const template = feedbackApprovedToRequesterTemplate({
          recipientName: requester.display_name || requester.email,
          className: classRow?.name ?? "class",
          studentName: student?.display_name || student?.email || "your student",
          coachName: coach?.display_name || coach?.email || "the coach",
          coachResponse: row.coach_response ?? "",
          portalUrl: portalPathUrl(portalPath),
        });
        await sendPortalEmails([{ to: requester.email, ...template }]);
      }
    } catch (err) {
      console.error("[feedback-requests] requester email failed", err);
    }
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ request: updated }));
}
