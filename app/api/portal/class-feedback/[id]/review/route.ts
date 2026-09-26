import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPortalEmails } from "@/lib/email/send";
import {
  weeklyFeedbackApprovedToCoachTemplate,
  weeklyFeedbackRejectedToCoachTemplate,
} from "@/lib/email/templates";
import { requireApiRole } from "@/lib/portal/auth";
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

// Admin approves the coach's weekly feedback (row -> approved, students +
// parents can now see it) or rejects with notes (row -> rejected, coach
// can edit and resubmit).
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

  const { data: row } = await (supabase as any)
    .from("class_feedback")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!row) return mergeCookies(supabaseResponse, jsonError("Feedback not found.", 404));

  if (row.status !== "pending_admin") {
    return mergeCookies(
      supabaseResponse,
      jsonError("This entry isn't waiting on admin review right now.", 400)
    );
  }

  const now = new Date().toISOString();
  const patch =
    parsed.data.action === "approve"
      ? {
          status: "approved",
          reviewed_by: session.userId,
          reviewed_at: now,
          admin_rejection_notes: null,
        }
      : {
          status: "rejected",
          reviewed_by: session.userId,
          reviewed_at: now,
          admin_rejection_notes: parsed.data.notes!.trim(),
        };

  const { data: updated, error } = await (supabase as any)
    .from("class_feedback")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));

  // Notify the coach who wrote it (service role client — the coach might
  // not be reachable via the admin's RLS view of profiles).
  try {
    const [{ data: coach }, { data: classRow }] = await Promise.all([
      adminClient.from("profiles").select("display_name,email").eq("id", row.coach_id).maybeSingle(),
      adminClient.from("classes").select("name").eq("id", row.class_id).maybeSingle(),
    ]);
    if (coach?.email) {
      const template =
        parsed.data.action === "approve"
          ? weeklyFeedbackApprovedToCoachTemplate({
              coachName: coach.display_name || coach.email,
              className: (classRow as { name?: string } | null)?.name || "your class",
              sessionDate: row.session_date,
              portalUrl: portalPathUrl("/portal/coach/feedback"),
            })
          : weeklyFeedbackRejectedToCoachTemplate({
              coachName: coach.display_name || coach.email,
              className: (classRow as { name?: string } | null)?.name || "your class",
              sessionDate: row.session_date,
              notes: parsed.data.notes!.trim(),
              portalUrl: portalPathUrl("/portal/coach/feedback"),
            });
      await sendPortalEmails([{ to: coach.email, ...template }]);
    }
  } catch (err) {
    console.error("[class-feedback:review] coach notify failed", err);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ feedback: updated }));
}
