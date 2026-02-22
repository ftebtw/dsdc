import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripeClient } from "@/lib/stripe";
import { getPriceIdForClassType, isAllowedPriceId } from "@/lib/stripe-prices";
import { getSupabaseRouteClient } from "@/lib/supabase/route";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

type LegacyCheckoutPayload = {
  priceId?: unknown;
  locale?: unknown;
  customerEmail?: unknown;
};

type SupportedCheckoutLocale = "en" | "zh";
type ClassType = Database["public"]["Enums"]["class_type"];

const registrationSchema = z.object({
  classIds: z.array(z.string().uuid()).min(1).max(8),
  studentId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  studentNeedsPasswordSetup: z.boolean().optional(),
  locale: z.enum(["en", "zh"]).optional(),
});

function isValidLocale(value: unknown): value is SupportedCheckoutLocale {
  return value === "en" || value === "zh";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function handleLegacyCheckout(request: NextRequest, body: LegacyCheckoutPayload) {
  const priceId = typeof body.priceId === "string" ? body.priceId.trim() : "";
  const locale: Stripe.Checkout.SessionCreateParams.Locale = isValidLocale(body.locale)
    ? body.locale
    : "auto";
  const customerEmail =
    typeof body.customerEmail === "string" ? body.customerEmail.trim() : undefined;

  let allowedPriceId = false;
  try {
    allowedPriceId = Boolean(priceId) && isAllowedPriceId(priceId);
  } catch (error) {
    console.error("Stripe price env configuration error:", error);
    return jsonError("Stripe price IDs are not configured.", 500);
  }

  if (!allowedPriceId) {
    return jsonError("Invalid price ID.");
  }

  if (customerEmail && !isValidEmail(customerEmail)) {
    return jsonError("Invalid customer email.");
  }

  const origin = request.nextUrl.origin;
  const successLocaleParam = locale === "auto" ? "en" : locale;

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    customer_creation: "always",
    locale,
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&lang=${successLocaleParam}`,
    cancel_url: `${origin}/pricing`,
  };

  if (customerEmail) {
    params.customer_email = customerEmail;
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) {
      return jsonError("Checkout session URL was not returned.", 500);
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return jsonError("Unable to start checkout right now.", 500);
  }
}

async function handleRegistrationCheckout(
  request: NextRequest,
  parsed: z.infer<typeof registrationSchema>
) {
  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("You must sign in before checkout.", 401);
  }

  if (new Set(parsed.classIds).size !== parsed.classIds.length) {
    return jsonError("Duplicate classes are not allowed.");
  }

  const { data: requesterProfile, error: requesterProfileError } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", user.id)
    .maybeSingle();
  if (requesterProfileError || !requesterProfile) {
    return jsonError("Could not verify your account.", 401);
  }

  if (requesterProfile.role === "student") {
    if (user.id !== parsed.studentId) {
      return jsonError("Students can only checkout for their own account.", 403);
    }
  } else if (requesterProfile.role === "parent") {
    const parentId = parsed.parentId ?? user.id;
    if (parentId !== user.id) {
      return jsonError("Invalid parent account for this request.", 403);
    }
    const { data: linkRow } = await supabase
      .from("parent_student_links")
      .select("id")
      .eq("parent_id", parentId)
      .eq("student_id", parsed.studentId)
      .maybeSingle();
    if (!linkRow) {
      return jsonError("Parent account is not linked to this student.", 403);
    }
  } else {
    return jsonError("Only student and parent accounts can use registration checkout.", 403);
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("profiles")
    .select("id,email,role,locale")
    .eq("id", parsed.studentId)
    .maybeSingle();
  if (studentProfileError || !studentProfile || studentProfile.role !== "student") {
    return jsonError("Student account is invalid.", 400);
  }

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  if (!activeTerm) {
    return jsonError("No active term is available for enrollment.", 400);
  }

  const { data: classRowsData, error: classRowsError } = await supabase
    .from("classes")
    .select("id,name,type,max_students,term_id")
    .in("id", parsed.classIds)
    .eq("term_id", activeTerm.id);
  if (classRowsError) {
    return jsonError(classRowsError.message, 400);
  }
  const classRows = (classRowsData ?? []) as Array<{
    id: string;
    name: string;
    type: string;
    max_students: number;
    term_id: string;
  }>;

  if (classRows.length !== parsed.classIds.length) {
    return jsonError("One or more selected classes are invalid for the active term.", 400);
  }

  const [{ data: enrollmentRows }, { data: existingStudentRows }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("class_id,status")
      .in("class_id", parsed.classIds)
      .in("status", ["active", "pending_etransfer", "etransfer_sent"]),
    supabase
      .from("enrollments")
      .select("class_id,status")
      .in("class_id", parsed.classIds)
      .eq("student_id", parsed.studentId)
      .in("status", ["active", "pending_etransfer", "etransfer_sent"]),
  ]);

  if ((existingStudentRows ?? []).length > 0) {
    return jsonError("Student is already enrolled in one of the selected classes.", 400);
  }

  const enrollmentCountByClass = new Map<string, number>();
  for (const row of enrollmentRows ?? []) {
    const current = enrollmentCountByClass.get(row.class_id) ?? 0;
    enrollmentCountByClass.set(row.class_id, current + 1);
  }

  const fullClass = classRows.find((classRow) => {
    const count = enrollmentCountByClass.get(classRow.id) ?? 0;
    return count >= Number(classRow.max_students);
  });
  if (fullClass) {
    return jsonError(`${fullClass.name} is full. Please pick another class.`, 400);
  }

  const locale = parsed.locale ?? (studentProfile.locale === "zh" ? "zh" : "en");
  const origin = request.nextUrl.origin;
  const lineItems = classRows.map((classRow) => ({
    price: getPriceIdForClassType(classRow.type as ClassType),
    quantity: 1,
  }));

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: lineItems,
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    customer_creation: "always",
    locale,
    customer_email: studentProfile.email,
    success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}&lang=${locale}`,
    cancel_url: `${origin}/register/classes?student=${parsed.studentId}&lang=${locale}`,
    metadata: {
      studentId: parsed.studentId,
      classIds: JSON.stringify(parsed.classIds),
      parentId: parsed.parentId ?? "",
      studentNeedsPasswordSetup: parsed.studentNeedsPasswordSetup ? "true" : "false",
    },
  };

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) {
      return jsonError("Checkout session URL was not returned.", 500);
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Registration checkout session creation failed:", error);
    return jsonError("Unable to start checkout right now.", 500);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const registrationParse = registrationSchema.safeParse(body);
  if (registrationParse.success) {
    return handleRegistrationCheckout(request, registrationParse.data);
  }

  return handleLegacyCheckout(request, body as LegacyCheckoutPayload);
}
