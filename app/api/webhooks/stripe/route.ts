import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { classTypeLabel } from "@/lib/portal/labels";
import {
  loadPrivateSessionParticipants,
  nameOrEmail,
  sendToCoach,
  sendToStudentAndParents,
  type PrivateSessionWorkflowRow,
} from "@/lib/portal/private-sessions";
import { getContactEmail, getPortalAppUrl } from "@/lib/email/resend";
import { sendPortalEmails } from "@/lib/email/send";
import { enrollmentConfirmationFull, privatePaymentConfirmedTemplate } from "@/lib/email/templates";
import { convertFirstRegisteredReferral } from "@/lib/portal/referral-conversion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const weekdayIndex: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function firstSessionDate(termStartDate: string, scheduleDay: string): string {
  const baseDate = new Date(`${termStartDate}T00:00:00Z`);
  const targetDay = weekdayIndex[scheduleDay] ?? 0;
  const delta = (targetDay - baseDate.getUTCDay() + 7) % 7;
  const session = new Date(baseDate);
  session.setUTCDate(baseDate.getUTCDate() + delta);
  return session.toISOString().slice(0, 10);
}

function formatScheduleInStudentTimezone(input: {
  scheduleDay: string;
  startTime: string;
  endTime: string;
  classTimezone: string;
  termStartDate: string;
  studentTimezone: string;
}): string {
  const sessionDate = firstSessionDate(input.termStartDate, input.scheduleDay);
  const startUtc = fromZonedTime(`${sessionDate}T${input.startTime}`, input.classTimezone);
  const endUtc = fromZonedTime(`${sessionDate}T${input.endTime}`, input.classTimezone);
  const day = formatInTimeZone(startUtc, input.studentTimezone, "EEEE");
  const start = formatInTimeZone(startUtc, input.studentTimezone, "h:mm a");
  const end = formatInTimeZone(endUtc, input.studentTimezone, "h:mm a zzz");
  return `Every ${day}, ${start} - ${end}`;
}

function formatTermDateRange(startDate: string, endDate: string, timezone: string): string {
  const start = formatInTimeZone(new Date(`${startDate}T00:00:00Z`), timezone, "MMMM d, yyyy");
  const end = formatInTimeZone(new Date(`${endDate}T00:00:00Z`), timezone, "MMMM d, yyyy");
  return `${start} - ${end}`;
}

function parseMetadataClassIds(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

async function handlePrivateSessionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const privateSessionId = metadata.privateSessionId || "";
  if (!privateSessionId) return;

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: rowData, error: rowError } = await supabaseAdmin
    .from("private_sessions")
    .select("*")
    .eq("id", privateSessionId)
    .maybeSingle();
  if (rowError) {
    console.error("[stripe-webhook] private session lookup failed", rowError);
    return;
  }
  if (!rowData) return;

  const row = rowData as PrivateSessionWorkflowRow;
  if (row.status !== "awaiting_payment") {
    return;
  }

  const { data: updateData, error: updateError } = await supabaseAdmin
    .from("private_sessions")
    .update({
      status: "confirmed",
      payment_method: "stripe",
      stripe_checkout_session_id: session.id,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("status", "awaiting_payment")
    .select("*")
    .maybeSingle();
  if (updateError) {
    console.error("[stripe-webhook] private session update failed", updateError);
    return;
  }
  if (!updateData) return;
  const updatedRow = updateData as PrivateSessionWorkflowRow;

  const participants = await loadPrivateSessionParticipants(supabaseAdmin, updatedRow);
  const studentName = nameOrEmail(participants.student, "Student");
  const coachName = nameOrEmail(participants.coach, "Coach");

  await sendToStudentAndParents({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      student: "/portal/student/booking",
      parent: "/portal/parent/private-sessions",
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privatePaymentConfirmedTemplate({
        studentName,
        coachName,
        whenText,
        paymentMethod: "stripe",
        zoomLink: updatedRow.zoom_link,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  await sendToCoach({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      coach: "/portal/coach/private-sessions",
      ta: "/portal/coach/private-sessions",
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privatePaymentConfirmedTemplate({
        studentName,
        coachName,
        whenText,
        paymentMethod: "stripe",
        zoomLink: updatedRow.zoom_link,
        isCoachVersion: true,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });
}

async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata ?? {};
  if (metadata.type === "private_session") {
    await handlePrivateSessionCheckoutCompleted(session);
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 20,
    expand: ["data.price.product"],
  });

  const items = lineItems.data.map((item) => {
    const product = item.price?.product;
    const expandedProduct =
      typeof product !== "string" && product && !product.deleted ? product : null;
    const productName = expandedProduct?.name;
    const tier = expandedProduct?.metadata?.tier;

    return {
      description: item.description,
      quantity: item.quantity ?? 0,
      amountSubtotal: item.amount_subtotal,
      amountTotal: item.amount_total,
      priceId: item.price?.id,
      productName,
      tier,
    };
  });

  const payload = {
    eventType: "checkout.session.completed",
    sessionId: session.id,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    items,
  };

  console.log("[stripe-webhook]", JSON.stringify(payload));

  const studentId = metadata.studentId || "";
  const classIds = parseMetadataClassIds(metadata.classIds);

  if (!studentId || classIds.length === 0) {
    return;
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const sessionId = session.id;

    const { data: existingEnrollments } = await supabaseAdmin
      .from("enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .in("class_id", classIds);
    const existingSet = new Set((existingEnrollments ?? []).map((row: any) => row.class_id as string));

    const rowsToInsert = classIds
      .filter((classId) => !existingSet.has(classId))
      .map((classId) => ({
        student_id: studentId,
        class_id: classId,
        status: "active",
        stripe_checkout_session_id: sessionId,
      }));

    if (rowsToInsert.length > 0) {
      const { error: enrollmentInsertError } = await supabaseAdmin
        .from("enrollments")
        .upsert(rowsToInsert, { onConflict: "student_id,class_id" });
      if (enrollmentInsertError) {
        console.error("[stripe-webhook] enrollment insert failed", enrollmentInsertError);
      }

      const convertedReferralId = await convertFirstRegisteredReferral(supabaseAdmin, [
        studentId,
        metadata.parentId || null,
      ]);
      if (convertedReferralId) {
        console.log(
          `[stripe-webhook] Referral converted: referral=${convertedReferralId}, student=${studentId}, parent=${metadata.parentId || "none"}`
        );
      }
    }

    const [{ data: studentProfile }, { data: classRowsData }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id,email,display_name,locale,timezone")
        .eq("id", studentId)
        .maybeSingle(),
      supabaseAdmin
        .from("classes")
        .select(
          "id,name,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link,term_id"
        )
        .in("id", classIds),
    ]);

    if (!studentProfile || !classRowsData || classRowsData.length === 0) {
      return;
    }

    const classRows = classRowsData as Array<{
      id: string;
      name: string;
      type: string;
      coach_id: string;
      schedule_day: string;
      schedule_start_time: string;
      schedule_end_time: string;
      timezone: string;
      zoom_link: string | null;
      term_id: string;
    }>;

    const coachIds = [...new Set(classRows.map((row) => row.coach_id))];
    const termIds = [...new Set(classRows.map((row) => row.term_id))];

    const [{ data: coachProfilesData }, { data: termRowsData }] = await Promise.all([
      coachIds.length
        ? supabaseAdmin.from("profiles").select("id,display_name,email").in("id", coachIds)
        : Promise.resolve({ data: [] as any[] }),
      termIds.length
        ? supabaseAdmin.from("terms").select("id,name,start_date,end_date").in("id", termIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const coachMap = Object.fromEntries(
      ((coachProfilesData ?? []) as any[]).map((profile) => [profile.id, profile])
    ) as Record<string, { display_name: string | null; email: string }>;

    const termMap = Object.fromEntries(
      ((termRowsData ?? []) as any[]).map((term) => [term.id, term])
    ) as Record<string, { id: string; name: string; start_date: string; end_date: string }>;

    const studentTimezone = studentProfile.timezone || "America/Vancouver";

    const enrolledClasses = classRows.map((classRow) => {
      const coach = coachMap[classRow.coach_id];
      const coachName = coach?.display_name || coach?.email || "DSDC Coach";
      const typeLabel =
        classTypeLabel[classRow.type as keyof typeof classTypeLabel] || classRow.type;
      const term = termMap[classRow.term_id];
      const scheduleText = term
        ? formatScheduleInStudentTimezone({
            scheduleDay: classRow.schedule_day,
            startTime: classRow.schedule_start_time,
            endTime: classRow.schedule_end_time,
            classTimezone: classRow.timezone,
            termStartDate: term.start_date,
            studentTimezone,
          })
        : `${classRow.schedule_day} ${classRow.schedule_start_time}-${classRow.schedule_end_time}`;
      const termDates = term
        ? formatTermDateRange(term.start_date, term.end_date, studentTimezone)
        : "Term dates pending";

      return {
        name: classRow.name,
        type: typeLabel,
        coachName,
        scheduleText,
        timezoneLabel: studentTimezone,
        zoomLink: classRow.zoom_link,
        termDates,
      };
    });

    const linkedParentIds = new Set<string>();
    if (metadata.parentId) linkedParentIds.add(metadata.parentId);
    const { data: parentLinks } = await supabaseAdmin
      .from("parent_student_links")
      .select("parent_id")
      .eq("student_id", studentId);
    for (const row of parentLinks ?? []) {
      if (row.parent_id) linkedParentIds.add(row.parent_id);
    }

    const parentProfiles = linkedParentIds.size
      ? (
          (
            await supabaseAdmin
              .from("profiles")
              .select("id,email,display_name,locale")
              .in("id", [...linkedParentIds])
              .eq("role", "parent")
          ).data ?? []
        )
      : ([] as any[]);

    const studentNeedsPasswordSetup = metadata.studentNeedsPasswordSetup === "true";
    const portalLoginUrl = `${getPortalAppUrl().replace(/\/$/, "")}/portal/login`;

    const studentTemplate = enrollmentConfirmationFull({
      studentName: studentProfile.display_name || studentProfile.email,
      classes: enrolledClasses,
      portalLoginUrl,
      isParentVersion: false,
      studentNeedsPasswordSetup,
      contactEmail: getContactEmail(),
      locale: studentProfile.locale === "zh" ? "zh" : "en",
    });

    const emailPayloads: Array<{ to: string; subject: string; html: string; text: string }> = [];
    const seenEmails = new Set<string>();
    const studentEmail = studentProfile.email.trim().toLowerCase();
    if (studentEmail) {
      seenEmails.add(studentEmail);
      emailPayloads.push({ to: studentEmail, ...studentTemplate });
    }

    for (const parent of parentProfiles) {
      if (!parent?.email) continue;
      const parentEmail = parent.email.trim().toLowerCase();
      if (!parentEmail || seenEmails.has(parentEmail)) continue;
      const parentTemplate = enrollmentConfirmationFull({
        studentName: studentProfile.display_name || studentProfile.email,
        parentName: parent.display_name || undefined,
        classes: enrolledClasses,
        portalLoginUrl,
        isParentVersion: true,
        studentNeedsPasswordSetup: false,
        contactEmail: getContactEmail(),
        locale: parent.locale === "zh" ? "zh" : "en",
      });
      seenEmails.add(parentEmail);
      emailPayloads.push({ to: parentEmail, ...parentTemplate });
    }

    if (emailPayloads.length > 0) {
      await sendPortalEmails(emailPayloads);
    }
  } catch (error) {
    console.error("[stripe-webhook] registration enrollment/email failed", error);
  }
}

export async function POST(request: NextRequest) {
  const stripeSignature = request.headers.get("stripe-signature");
  if (!stripeSignature) {
    return NextResponse.json({ error: "Missing Stripe signature header." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("Missing required env var: STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (error) {
    console.error("Stripe webhook client init failed:", error);
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(stripe, event.data.object as Stripe.Checkout.Session);
    }
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
