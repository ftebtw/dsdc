import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { sendPortalEmails } from "@/lib/email/send";
import { feedbackRequestToCoachTemplate } from "@/lib/email/templates";
import { portalPathUrl } from "@/lib/portal/phase-c";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const createSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid(),
  message: z.string().trim().min(3).max(4000),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// GET returns the caller's own view of feedback requests. Admin sees all,
// coaches see requests for classes they're on the team for (RLS enforces),
// students see their own, parents see requests for their linked students.
export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ["admin", "coach", "ta", "student", "parent"]);
  if (!session) return jsonError("Unauthorized", 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await supabase
    .from("feedback_requests")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  return mergeCookies(supabaseResponse, NextResponse.json({ requests: data ?? [] }));
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["student", "parent"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid request payload.");
  }
  const { classId, studentId, message } = parsed.data;

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  // Auth: requester can only file for themselves (student) or for a linked
  // student (parent).
  if (session.profile.role === "student") {
    if (studentId !== session.userId) {
      return mergeCookies(supabaseResponse, jsonError("Cannot file a request for another student.", 403));
    }
  } else {
    // parent
    const { data: link } = await supabase
      .from("parent_student_links")
      .select("id")
      .eq("parent_id", session.userId)
      .eq("student_id", studentId)
      .maybeSingle();
    if (!link) {
      return mergeCookies(supabaseResponse, jsonError("You are not linked to this student.", 403));
    }
  }

  // Student must be enrolled in the class.
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .in("status", ["active", "completed"])
    .maybeSingle();
  if (!enrollment) {
    return mergeCookies(supabaseResponse, jsonError("This student is not enrolled in that class.", 400));
  }

  const { data: classRow } = await supabase
    .from("classes")
    .select("id,name,coach_id")
    .eq("id", classId)
    .maybeSingle();
  if (!classRow) return mergeCookies(supabaseResponse, jsonError("Class not found.", 404));

  const { data: inserted, error: insertError } = await supabase
    .from("feedback_requests")
    .insert({
      class_id: classId,
      student_id: studentId,
      requested_by: session.userId,
      request_message: message,
    })
    .select("*")
    .single();

  if (insertError) {
    // 23505 = unique_violation on the partial index blocks a second open request.
    if (insertError.code === "23505") {
      return mergeCookies(
        supabaseResponse,
        jsonError(
          "There's already an open feedback request for this student in this class. Wait for it to complete before filing another.",
          409
        )
      );
    }
    return mergeCookies(supabaseResponse, jsonError(insertError.message, 400));
  }

  // Fire-and-forget: email the primary coach so nothing sits waiting.
  if (classRow.coach_id) {
    try {
      const [{ data: coach }, { data: student }, { data: requester }] = await Promise.all([
        admin.from("profiles").select("email,display_name,notification_preferences").eq("id", classRow.coach_id).maybeSingle(),
        admin.from("profiles").select("display_name,email").eq("id", studentId).maybeSingle(),
        admin.from("profiles").select("display_name,email").eq("id", session.userId).maybeSingle(),
      ]);
      if (coach?.email) {
        const template = feedbackRequestToCoachTemplate({
          coachName: coach.display_name || coach.email,
          className: classRow.name,
          studentName: student?.display_name || student?.email || "Student",
          requesterName: requester?.display_name || requester?.email || "Parent/student",
          requesterRole: session.profile.role,
          message,
          portalUrl: portalPathUrl("/portal/coach/feedback"),
        });
        await sendPortalEmails([{ to: coach.email, ...template }]);
      }
    } catch (err) {
      console.error("[feedback-requests] coach email failed", err);
    }
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ request: inserted }));
}
