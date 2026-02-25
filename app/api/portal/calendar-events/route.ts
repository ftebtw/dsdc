import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { isValidTimezone } from "@/lib/portal/timezone";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const visibilitySchema = z.enum(["personal", "all_coaches", "everyone"]);

const createSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional(),
  eventDate: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  timezone: z.string().min(1).max(80).optional(),
  color: z.string().min(1).max(32).optional(),
  isAllDay: z.boolean().optional(),
  visibility: visibilitySchema.optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const startDate = request.nextUrl.searchParams.get("start");
  const endDate = request.nextUrl.searchParams.get("end");

  if (!startDate || !endDate) {
    return jsonError("start and end query params required");
  }
  if (!dateSchema.safeParse(startDate).success || !dateSchema.safeParse(endDate).success) {
    return jsonError("Invalid date range.");
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date")
    .order("start_time");

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ events: data ?? [] }));
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("Invalid event payload.");
  }

  const body = parsed.data;
  const timezone = body.timezone || session.profile.timezone || "America/Vancouver";
  if (!isValidTimezone(timezone)) return jsonError("Invalid timezone.");
  if (!body.isAllDay && body.endTime <= body.startTime) {
    return jsonError("endTime must be after startTime.");
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      created_by: session.userId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      event_date: body.eventDate,
      start_time: body.startTime,
      end_time: body.endTime,
      timezone,
      color: body.color || "#3b82f6",
      is_all_day: body.isAllDay ?? false,
      visibility: body.visibility || "personal",
    })
    .select("*")
    .single();

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ event: data }));
}
