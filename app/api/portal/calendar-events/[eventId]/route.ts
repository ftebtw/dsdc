import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { isValidTimezone } from "@/lib/portal/timezone";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const visibilitySchema = z.enum(["personal", "all_coaches", "everyone"]);

const updateSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(4000).nullable().optional(),
    eventDate: dateSchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    timezone: z.string().min(1).max(80).optional(),
    color: z.string().min(1).max(32).optional(),
    isAllDay: z.boolean().optional(),
    visibility: visibilitySchema.optional(),
    isImportant: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { eventId } = await context.params;
  if (!eventId) return jsonError("Missing event ID.");

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid event payload.");

  const body = parsed.data;
  if (body.timezone !== undefined && !isValidTimezone(body.timezone)) {
    return jsonError("Invalid timezone.");
  }
  if (body.startTime !== undefined && body.endTime !== undefined && body.endTime <= body.startTime) {
    return jsonError("endTime must be after startTime.");
  }

  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.description !== undefined) updateData.description = body.description?.trim() || null;
  if (body.eventDate !== undefined) updateData.event_date = body.eventDate;
  if (body.startTime !== undefined) updateData.start_time = body.startTime;
  if (body.endTime !== undefined) updateData.end_time = body.endTime;
  if (body.timezone !== undefined) updateData.timezone = body.timezone;
  if (body.color !== undefined) updateData.color = body.color;
  if (body.isAllDay !== undefined) updateData.is_all_day = body.isAllDay;
  if (body.visibility !== undefined) updateData.visibility = body.visibility;
  if (body.isImportant !== undefined) updateData.is_important = body.isImportant;
  if (body.visibility === "personal") updateData.is_important = false;

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { data, error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ event: data }));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { eventId } = await context.params;
  if (!eventId) return jsonError("Missing event ID.");

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
