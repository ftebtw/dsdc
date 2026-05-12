import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const ATTACHMENT_BUCKET = process.env.PORTAL_BUCKET_CALENDAR || "portal-calendar";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const session = await requireApiRole(request, ["admin", "coach", "ta", "student", "parent"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { eventId } = await context.params;
  if (!eventId) return jsonError("Missing event ID.");

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  // RLS on calendar_events gates whether this user can read the row:
  //   - admin: all events
  //   - creator: own events
  //   - coach/ta: 'all_coaches' and 'everyone' visibility events
  //   - student/parent: 'everyone' visibility events
  // If the user can't read the row, .maybeSingle() returns null and we 404.
  const { data, error } = await supabase
    .from("calendar_events")
    .select("attachment_path, attachment_name, attachment_mime_type")
    .eq("id", eventId)
    .maybeSingle();

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  if (!data) return mergeCookies(supabaseResponse, jsonError("Event not found.", 404));

  const row = data as {
    attachment_path: string | null;
    attachment_name: string | null;
    attachment_mime_type: string | null;
  };

  if (!row.attachment_path) {
    return mergeCookies(supabaseResponse, jsonError("This event has no attachment.", 404));
  }

  const downloadName = row.attachment_name || row.attachment_path.split("/").pop() || "attachment";

  const { data: signed, error: signedError } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(row.attachment_path, 60 * 15, { download: downloadName });

  if (signedError || !signed?.signedUrl) {
    return mergeCookies(
      supabaseResponse,
      jsonError(signedError?.message || "Failed to create signed URL.", 400)
    );
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      url: signed.signedUrl,
      name: row.attachment_name,
      mimeType: row.attachment_mime_type,
    })
  );
}
