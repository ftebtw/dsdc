import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const eventTypeSchema = z.enum(["tournament", "workshop", "social", "deadline", "other"]);

const createEventSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional(),
  event_date: dateSchema,
  start_time: timeSchema.optional(),
  end_time: timeSchema.optional(),
  location: z.string().max(255).optional(),
  event_type: eventTypeSchema.default("tournament"),
  is_visible: z.boolean().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  if (from && !dateSchema.safeParse(from).success) {
    return jsonError("Invalid from date.");
  }
  if (to && !dateSchema.safeParse(to).success) {
    return jsonError("Invalid to date.");
  }

  const admin = getSupabaseAdminClient();
  let query = admin.from("events").select("*").order("event_date", { ascending: false });
  if (from) query = query.gte("event_date", from);
  if (to) query = query.lte("event_date", to);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createEventSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid event payload.");

  const body = parsed.data;
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("events")
    .insert({
      title: body.title,
      description: body.description?.trim() || null,
      event_date: body.event_date,
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      location: body.location?.trim() || null,
      event_type: body.event_type,
      is_visible: body.is_visible ?? true,
      created_by: session.userId,
    })
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ event: data });
}
