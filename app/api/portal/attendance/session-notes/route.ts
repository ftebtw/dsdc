import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const schema = z.object({
  classId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "sessionDate must be YYYY-MM-DD"),
  notes: z.string().max(4000),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// PUT upserts a note (empty string deletes). RLS enforces class-team access,
// so callers on the wrong class won't even see the existing row.
export async function PUT(request: NextRequest) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid payload.");

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { classId, sessionDate, notes } = parsed.data;
  const trimmed = notes.trim();

  if (trimmed.length === 0) {
    const { error } = await (supabase as any)
      .from("class_session_notes")
      .delete()
      .eq("class_id", classId)
      .eq("session_date", sessionDate);
    if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
    return mergeCookies(supabaseResponse, NextResponse.json({ notes: null }));
  }

  const { data, error } = await (supabase as any)
    .from("class_session_notes")
    .upsert(
      {
        class_id: classId,
        session_date: sessionDate,
        notes: trimmed,
        marked_by: session.userId,
        marked_at: new Date().toISOString(),
      },
      { onConflict: "class_id,session_date" }
    )
    .select("*")
    .single();

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ notes: data }));
}
