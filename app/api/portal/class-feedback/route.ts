import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
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
  if (existing?.id) {
    const { data: updated, error } = await (supabase as any)
      .from("class_feedback")
      .update({
        general_feedback: trimmedGeneral || null,
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

  if (nonEmptyIndividual.length > 0) {
    const rows = nonEmptyIndividual.map((row) => ({
      class_feedback_id: feedbackId,
      student_id: row.studentId,
      feedback: row.feedback,
    }));
    const { error: insertError } = await (supabase as any)
      .from("class_feedback_individual")
      .insert(rows);
    if (insertError) return mergeCookies(supabaseResponse, jsonError(insertError.message, 400));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ id: feedbackId, ok: true }));
}
