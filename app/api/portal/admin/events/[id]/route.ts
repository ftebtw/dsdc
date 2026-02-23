import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const eventTypeSchema = z.enum(["tournament", "workshop", "social", "deadline", "other"]);

const updateEventSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(4000).nullable().optional(),
    event_date: dateSchema.optional(),
    start_time: timeSchema.nullable().optional(),
    end_time: timeSchema.nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    event_type: eventTypeSchema.optional(),
    is_visible: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (!id) return jsonError("Missing event ID.");

  const parsed = updateEventSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid event payload.");

  const body = parsed.data;
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.event_date !== undefined) updates.event_date = body.event_date;
  if (body.start_time !== undefined) updates.start_time = body.start_time || null;
  if (body.end_time !== undefined) updates.end_time = body.end_time || null;
  if (body.location !== undefined) updates.location = body.location?.trim() || null;
  if (body.event_type !== undefined) updates.event_type = body.event_type;
  if (body.is_visible !== undefined) updates.is_visible = body.is_visible;

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("events").update(updates).eq("id", id).select("*").maybeSingle();
  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Event not found.", 404);

  return NextResponse.json({ event: data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (!id) return jsonError("Missing event ID.");

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("events").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ deleted: true });
}
