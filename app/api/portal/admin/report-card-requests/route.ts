import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { sendPortalEmails } from "@/lib/email/send";
import { reportCardRequestToCoachTemplate } from "@/lib/email/templates";
import { portalPathUrl } from "@/lib/portal/phase-c";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const schema = z.object({
  termId: z.string().uuid(),
  classIds: z.array(z.string().uuid()).min(1).max(200),
  message: z.string().trim().max(2000).optional(),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be YYYY-MM-DD")
    .optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid payload.");
  }
  const { termId, classIds, message, dueDate } = parsed.data;

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const adminClient = getSupabaseAdminClient();

  // Confirm term + classes exist and get the class metadata we need for emails.
  const [{ data: termRow }, { data: classRows }] = await Promise.all([
    supabase.from("terms").select("id,name").eq("id", termId).maybeSingle(),
    supabase.from("classes").select("id,name,coach_id").in("id", classIds),
  ]);
  if (!termRow) return mergeCookies(supabaseResponse, jsonError("Term not found.", 404));

  const classes = (classRows ?? []) as Array<{
    id: string;
    name: string;
    coach_id: string | null;
  }>;
  if (classes.length === 0) {
    return mergeCookies(supabaseResponse, jsonError("None of those classes exist.", 400));
  }

  // Insert rows; the partial unique index blocks a duplicate open request for
  // the same (term, class), so we upsert on that combo instead by pre-checking.
  const { data: existingOpen } = await (supabase as any)
    .from("report_card_requests")
    .select("class_id")
    .eq("term_id", termId)
    .in("class_id", classes.map((c) => c.id))
    .is("resolved_at", null);
  const alreadyOpen = new Set(
    ((existingOpen ?? []) as Array<{ class_id: string }>).map((row) => row.class_id)
  );

  const rowsToInsert = classes
    .filter((c) => !alreadyOpen.has(c.id))
    .map((c) => ({
      term_id: termId,
      class_id: c.id,
      requested_by: session.userId,
      message: message?.trim() || null,
      due_date: dueDate || null,
    }));

  let inserted: Array<{ id: string; class_id: string }> = [];
  if (rowsToInsert.length > 0) {
    const insertResult = await (supabase as any)
      .from("report_card_requests")
      .insert(rowsToInsert)
      .select("id,class_id");
    if (insertResult.error) {
      return mergeCookies(supabaseResponse, jsonError(insertResult.error.message, 400));
    }
    inserted = (insertResult.data ?? []) as Array<{ id: string; class_id: string }>;
  }

  // Fire-and-forget: email every affected primary coach (skip classes that
  // were already open — they've already been nudged).
  try {
    const coachIds = [
      ...new Set(
        classes
          .filter((c) => !alreadyOpen.has(c.id))
          .map((c) => c.coach_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    if (coachIds.length > 0) {
      const { data: coachProfiles } = await adminClient
        .from("profiles")
        .select("id,email,display_name")
        .in("id", coachIds);
      const coachEmailById = new Map<string, { email: string | null; name: string | null }>(
        (coachProfiles ?? []).map((row: any) => [
          row.id as string,
          { email: (row.email as string | null) ?? null, name: (row.display_name as string | null) ?? null },
        ])
      );

      const emails = classes
        .filter((c) => !alreadyOpen.has(c.id) && c.coach_id)
        .map((c) => {
          const coach = coachEmailById.get(c.coach_id!);
          if (!coach?.email) return null;
          const template = reportCardRequestToCoachTemplate({
            coachName: coach.name || coach.email,
            className: c.name,
            termName: termRow.name,
            message: message?.trim() || null,
            dueDate: dueDate || null,
            portalUrl: portalPathUrl("/portal/coach/report-cards"),
          });
          return { to: coach.email, ...template };
        })
        .filter((message): message is NonNullable<typeof message> => Boolean(message));
      if (emails.length > 0) await sendPortalEmails(emails);
    }
  } catch (err) {
    console.error("[report-card-requests] coach email failed", err);
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      inserted: inserted.length,
      skipped: alreadyOpen.size,
    })
  );
}
