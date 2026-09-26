import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPortalEmails } from "@/lib/email/send";
import { weeklyFeedbackSubmittedToAdminTemplate } from "@/lib/email/templates";
import { requireApiRole } from "@/lib/portal/auth";
import { portalPathUrl } from "@/lib/portal/phase-c";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const individualEntrySchema = z.object({
  studentId: z.string().uuid(),
  feedback: z.string().trim().max(8000),
});

const upsertSchema = z.object({
  classId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  generalFeedback: z.string().trim().max(8000).optional().default(""),
  individual: z.array(individualEntrySchema).max(60).optional().default([]),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// POST creates or updates the weekly-feedback entry for (class, session_date).
// The coach can submit both general and individual, either one alone, or leave
// individual rows blank to skip a student (blank rows are deleted).
export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["coach", "ta", "admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = upsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid payload.");
  }
  const { classId, sessionDate, generalFeedback, individual } = parsed.data;

  const trimmedGeneral = generalFeedback.trim();
  const nonEmptyIndividual = individual
    .map((row) => ({ studentId: row.studentId, feedback: row.feedback.trim() }))
    .filter((row) => row.feedback.length > 0);

  if (!trimmedGeneral && nonEmptyIndividual.length === 0) {
    return jsonError("Add general feedback, at least one individual entry, or both.");
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  // RLS enforces class-team access on the insert/update below. Try to update
  // an existing (class, session_date) row first, else insert.
  const { data: existing } = await (supabase as any)
    .from("class_feedback")
    .select("id")
    .eq("class_id", classId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  let feedbackId: string;
  // Every fresh coach submit (create OR resubmit of a rejected row) flips
  // the row into 'pending_admin' so it goes through review again.
  if (existing?.id) {
    const { data: updated, error } = await (supabase as any)
      .from("class_feedback")
      .update({
        general_feedback: trimmedGeneral || null,
        status: "pending_admin",
        // Clear any prior review so admin sees this as fresh in the queue.
        reviewed_by: null,
        reviewed_at: null,
        admin_rejection_notes: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
    feedbackId = updated.id;
  } else {
    const { data: inserted, error } = await (supabase as any)
      .from("class_feedback")
      .insert({
        class_id: classId,
        session_date: sessionDate,
        coach_id: session.userId,
        general_feedback: trimmedGeneral || null,
        status: "pending_admin",
      })
      .select("id")
      .single();
    if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
    feedbackId = inserted.id;
  }

  // Sync individual rows: wipe then re-insert. Simpler than diffing, and the
  // set is bounded by class roster size.
  const { error: deleteError } = await (supabase as any)
    .from("class_feedback_individual")
    .delete()
    .eq("class_feedback_id", feedbackId);
  if (deleteError) return mergeCookies(supabaseResponse, jsonError(deleteError.message, 500));

  let droppedStudentCount = 0;
  if (nonEmptyIndividual.length > 0) {
    // Defensive check: a student can only be written to class_feedback_individual
    // if their profile row still exists. When admin has deleted a student from
    // profiles but their enrollment record lingers, the roster on the client
    // still shows them; without this pre-check the insert would fail with an
    // opaque foreign-key error. Silently drop the orphans and report the count.
    const uniqueStudentIds = [...new Set(nonEmptyIndividual.map((row) => row.studentId))];
    const { data: existingProfilesData } = await (supabase as any)
      .from("profiles")
      .select("id")
      .in("id", uniqueStudentIds);
    const validStudentIds = new Set(
      ((existingProfilesData ?? []) as Array<{ id: string }>).map((r) => r.id)
    );
    const validRows = nonEmptyIndividual.filter((row) => validStudentIds.has(row.studentId));
    droppedStudentCount = nonEmptyIndividual.length - validRows.length;

    if (validRows.length > 0) {
      const rows = validRows.map((row) => ({
        class_feedback_id: feedbackId,
        student_id: row.studentId,
        feedback: row.feedback,
      }));
      const { error: insertError } = await (supabase as any)
        .from("class_feedback_individual")
        .insert(rows);
      if (insertError) {
        // 23503 = foreign_key_violation. Something else was invalidated
        // between the pre-check and the insert (or the parent feedback row
        // vanished). Surface a friendly message rather than the raw error.
        if ((insertError as { code?: string }).code === "23503") {
          return mergeCookies(
            supabaseResponse,
            jsonError(
              "Some individual entries couldn't be saved because a student or class record has changed. Reload the page and try again.",
              400
            )
          );
        }
        return mergeCookies(supabaseResponse, jsonError(insertError.message, 400));
      }
    }
  }

  // Fire-and-forget: notify every admin so they know a fresh entry is
  // waiting for review. Uses the service role client so we don't rely on
  // the coach's RLS view of profiles.
  try {
    const admin = getSupabaseAdminClient();
    const [{ data: coachProfile }, { data: classRow }, { data: adminProfiles }] = await Promise.all([
      admin.from("profiles").select("display_name,email").eq("id", session.userId).maybeSingle(),
      admin.from("classes").select("name").eq("id", classId).maybeSingle(),
      admin.from("profiles").select("email,display_name").eq("role", "admin"),
    ]);
    const recipients = ((adminProfiles ?? []) as Array<{
      email: string | null;
      display_name: string | null;
    }>).filter((row) => row.email);
    if (recipients.length > 0) {
      const template = weeklyFeedbackSubmittedToAdminTemplate({
        coachName: coachProfile?.display_name || coachProfile?.email || "A coach",
        className: (classRow as { name?: string } | null)?.name || "a class",
        sessionDate,
        individualCount: nonEmptyIndividual.length - droppedStudentCount,
        hasGeneral: trimmedGeneral.length > 0,
        portalUrl: portalPathUrl("/portal/admin/feedback"),
      });
      await sendPortalEmails(recipients.map((row) => ({ to: row.email!, ...template })));
    }
  } catch (err) {
    console.error("[class-feedback] admin notify failed", err);
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({ id: feedbackId, ok: true, droppedStudentCount })
  );
}
