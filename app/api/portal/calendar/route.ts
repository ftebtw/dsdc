import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const filterSchema = z.enum(["all", "mine"]);

const scheduleDayIndex: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ["admin", "coach", "ta", "student", "parent"]);
  if (!session) return jsonError("Unauthorized", 401);

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const filterParam = request.nextUrl.searchParams.get("filter") ?? "all";

  if (from && !dateSchema.safeParse(from).success) {
    return jsonError("Invalid from date.");
  }
  if (to && !dateSchema.safeParse(to).success) {
    return jsonError("Invalid to date.");
  }

  const parsedFilter = filterSchema.safeParse(filterParam);
  if (!parsedFilter.success) {
    return jsonError("Invalid filter.");
  }

  const admin = getSupabaseAdminClient();
  const { data: activeTerm } = await admin.from("terms").select("id,name,start_date,end_date").eq("is_active", true).maybeSingle();

  if (!activeTerm) {
    return NextResponse.json({
      classes: [],
      events: [],
      cancellations: [],
      term: null,
    });
  }

  const { data: classRowsData, error: classError } = await admin
    .from("classes")
    .select(
      "id,name,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link,term_id"
    )
    .eq("term_id", activeTerm.id)
    .order("schedule_day", { ascending: true })
    .order("schedule_start_time", { ascending: true });

  if (classError) return jsonError(classError.message, 500);

  const classRows = (classRowsData ?? []) as Array<{
    id: string;
    name: string;
    type: string;
    coach_id: string | null;
    schedule_day: string;
    schedule_start_time: string;
    schedule_end_time: string;
    timezone: string;
    zoom_link: string | null;
    term_id: string;
  }>;

  const coachIds = [...new Set(classRows.map((row) => row.coach_id).filter((value): value is string => Boolean(value)))];
  const { data: coachProfilesData } = coachIds.length
    ? await admin.from("profiles").select("id,display_name,email").in("id", coachIds)
    : { data: [] as Array<{ id: string; display_name: string | null; email: string | null }> };

  const coachNameById = new Map<string, string>();
  for (const coach of coachProfilesData ?? []) {
    coachNameById.set(coach.id, coach.display_name || coach.email || "Coach");
  }

  let mineClassIds = new Set<string>();

  if (session.profile.role === "admin") {
    mineClassIds = new Set(classRows.map((row) => row.id));
  } else if (session.profile.role === "coach" || session.profile.role === "ta") {
    mineClassIds = new Set(classRows.filter((row) => row.coach_id === session.userId).map((row) => row.id));
  } else if (session.profile.role === "student") {
    if (classRows.length) {
      const { data: enrollmentsData } = await admin
        .from("enrollments")
        .select("class_id")
        .eq("student_id", session.userId)
        .eq("status", "active")
        .in("class_id", classRows.map((row) => row.id));

      mineClassIds = new Set((enrollmentsData ?? []).map((row: { class_id: string }) => row.class_id));
    }
  } else if (session.profile.role === "parent") {
    const { data: linksData } = await admin
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_id", session.userId);

    const linkedStudentIds = [...new Set((linksData ?? []).map((row: { student_id: string }) => row.student_id))];
    if (linkedStudentIds.length && classRows.length) {
      const { data: enrollmentsData } = await admin
        .from("enrollments")
        .select("class_id")
        .in("student_id", linkedStudentIds)
        .eq("status", "active")
        .in("class_id", classRows.map((row) => row.id));

      mineClassIds = new Set((enrollmentsData ?? []).map((row: { class_id: string }) => row.class_id));
    }
  }

  const classes = classRows
    .map((row) => {
      const isMine = mineClassIds.has(row.id);
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        coach_name: row.coach_id ? coachNameById.get(row.coach_id) || "Coach" : "Unassigned",
        schedule_day: row.schedule_day,
        schedule_start_time: row.schedule_start_time,
        schedule_end_time: row.schedule_end_time,
        timezone: row.timezone,
        zoom_link: isMine ? row.zoom_link : null,
        is_mine: isMine,
        weekday_index: scheduleDayIndex[row.schedule_day] ?? 0,
      };
    })
    .filter((row) => parsedFilter.data === "all" || row.is_mine);

  const visibleClassIds = classes.map((row) => row.id);
  const { data: cancellationsData } = visibleClassIds.length
    ? await admin
        .from("class_cancellations")
        .select("class_id,cancellation_date,reason")
        .in("class_id", visibleClassIds)
    : { data: [] };

  const cancellations = (cancellationsData ?? []) as Array<{
    class_id: string;
    cancellation_date: string;
    reason: string;
  }>;

  let legacyEventQuery = admin
    .from("events")
    .select(
      "id,title,description,event_date,start_time,end_time,location,event_type,timezone,is_visible,created_by"
    )
    .eq("is_visible", true)
    .order("event_date", { ascending: true });

  if (from) legacyEventQuery = legacyEventQuery.gte("event_date", from);
  if (to) legacyEventQuery = legacyEventQuery.lte("event_date", to);

  const { data: legacyEventsData, error: legacyEventError } = await legacyEventQuery;
  if (legacyEventError) return jsonError(legacyEventError.message, 500);

  let calendarEventQuery = admin
    .from("calendar_events")
    .select(
      "id,title,description,event_date,start_time,end_time,timezone,color,is_all_day,visibility,is_important,created_by"
    )
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (from) calendarEventQuery = calendarEventQuery.gte("event_date", from);
  if (to) calendarEventQuery = calendarEventQuery.lte("event_date", to);

  const { data: calendarEventsData, error: calendarEventError } = await calendarEventQuery;
  if (calendarEventError) return jsonError(calendarEventError.message, 500);

  const role = session.profile.role;
  const viewerUserId = session.userId;

  const filteredCalendarEvents = (calendarEventsData ?? []).filter((row: any) => {
    if (role === "admin") return true;
    if (row.created_by === viewerUserId) return true;
    if (row.visibility === "everyone") return true;
    if (row.visibility === "all_coaches" && ["coach", "ta"].includes(role)) return true;
    return false;
  });

  const legacyEvents = (legacyEventsData ?? []).map((eventRow: any) => ({
    id: eventRow.id,
    title: eventRow.title,
    description: eventRow.description,
    event_date: eventRow.event_date,
    start_time: eventRow.start_time,
    end_time: eventRow.end_time,
    location: eventRow.location,
    event_type: eventRow.event_type,
    timezone: eventRow.timezone || "America/Vancouver",
    source: "events" as const,
    color: null,
    visibility: "everyone",
    is_all_day: !eventRow.start_time && !eventRow.end_time,
    is_important: false,
    created_by: eventRow.created_by ?? null,
  }));

  const calendarEvents = filteredCalendarEvents.map((eventRow: any) => ({
    id: eventRow.id,
    title: eventRow.title,
    description: eventRow.description,
    event_date: eventRow.event_date,
    start_time: eventRow.start_time,
    end_time: eventRow.end_time,
    location: null,
    event_type: eventRow.is_important ? "important" : "event",
    timezone: eventRow.timezone || "America/Vancouver",
    source: "calendar_events" as const,
    color: eventRow.color || "#3b82f6",
    visibility: eventRow.visibility || "personal",
    is_all_day: Boolean(eventRow.is_all_day),
    is_important: Boolean(eventRow.is_important),
    created_by: eventRow.created_by,
  }));

  const events = [...legacyEvents, ...calendarEvents].sort((left, right) => {
    const byDate = String(left.event_date).localeCompare(String(right.event_date));
    if (byDate !== 0) return byDate;
    const leftTime = left.start_time || "00:00:00";
    const rightTime = right.start_time || "00:00:00";
    return String(leftTime).localeCompare(String(rightTime));
  });

  return NextResponse.json({
    classes,
    events,
    cancellations,
    term: {
      start_date: activeTerm.start_date,
      end_date: activeTerm.end_date,
      name: activeTerm.name,
    },
  });
}
