import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getPortalAppUrl } from "@/lib/email/resend";
import { sendPortalEmail } from "@/lib/email/send";
import { verificationEmailTemplate } from "@/lib/email/templates";
import { isValidTimezone } from "@/lib/portal/timezone";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const baseSchema = z.object({
  locale: z.enum(["en", "zh"]).default("en"),
  timezone: z.string().min(1).max(80).default("America/Vancouver"),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/\d/, "Password must contain at least one number.");

const phoneEntrySchema = z.object({
  label: z.string().trim().max(60).default(""),
  number: z.string().trim().min(1).max(30),
});

const studentSchema = baseSchema.extend({
  role: z.literal("student"),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().email(),
  password: passwordSchema,
  referralCode: z.string().trim().min(3).max(32).optional(),
});

const parentSchema = baseSchema.extend({
  role: z.literal("parent"),
  parentFirstName: z.string().trim().min(1).max(60),
  parentLastName: z.string().trim().min(1).max(60),
  parentEmail: z.string().email(),
  parentPassword: passwordSchema,
  referralCode: z.string().trim().min(3).max(32).optional(),
  phoneNumbers: z.array(phoneEntrySchema).max(5).optional(),
});

const bodySchema = z.discriminatedUnion("role", [studentSchema, parentSchema]);

type ParsedBody = z.infer<typeof bodySchema>;
type AppRole = Database["public"]["Enums"]["app_role"];

function buildDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isAlreadyRegisteredAuthError(message?: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes("already been registered") || lower.includes("already registered");
}

async function resendVerificationViaSupabase(input: { email: string; redirectTo: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false as const, error: "Fallback email sender not configured." };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: input.email,
    options: { emailRedirectTo: input.redirectTo },
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

function profilePayload(input: {
  id: string;
  email: string;
  role: AppRole;
  displayName: string;
  locale: "en" | "zh";
  timezone: string;
}): Database["public"]["Tables"]["profiles"]["Insert"] {
  return {
    id: input.id,
    email: input.email,
    role: input.role,
    display_name: input.displayName,
    locale: input.locale,
    timezone: input.timezone,
  };
}

async function upsertProfile(
  admin: any,
  payload: Database["public"]["Tables"]["profiles"]["Insert"]
) {
  const { error } = await admin.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

async function sendVerificationEmail(
  admin: any,
  input: {
    email: string;
    displayName: string;
    locale: "en" | "zh";
  }
) {
  const portalBase = getPortalAppUrl().replace(/\/$/, "");
  const normalizedEmail = input.email.trim().toLowerCase();
  const redirectTo = `${portalBase}/auth/callback?type=signup`;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email: normalizedEmail,
    options: {
      redirectTo,
    },
  });

  if (error) {
    if (isAlreadyRegisteredAuthError(error.message)) {
      throw new Error("This email is already registered. Please sign in from the portal login page.");
    }
    throw new Error(`Failed to generate verification link: ${error.message}`);
  }

  const verifyUrl = data?.properties?.action_link;
  if (!verifyUrl) {
    throw new Error("Failed to generate verification link.");
  }

  const template = verificationEmailTemplate({
    name: input.displayName,
    verifyUrl,
    locale: input.locale,
  });

  const emailResult = await sendPortalEmail({
    to: normalizedEmail,
    ...template,
  });

  if (emailResult.ok) {
    return;
  }

  const fallback = await resendVerificationViaSupabase({
    email: normalizedEmail,
    redirectTo,
  });

  if (!fallback.ok) {
    throw new Error(
      `Failed to send verification email. Email provider error: ${emailResult.error || "unknown"}. Fallback error: ${fallback.error}`
    );
  }
}

async function createStudentRegistration(admin: any, body: ParsedBody) {
  if (body.role !== "student") return null;

  const studentDisplayName = buildDisplayName(body.firstName, body.lastName);

  const { data, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: false,
    user_metadata: {
      role: "student",
      display_name: studentDisplayName,
      locale: body.locale,
      timezone: body.timezone,
    },
  });
  if (error) {
    if (!isAlreadyRegisteredAuthError(error.message)) {
      throw new Error(error.message);
    }

    await sendVerificationEmail(admin, {
      email: body.email,
      displayName: studentDisplayName,
      locale: body.locale,
    });

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", body.email.trim().toLowerCase())
      .maybeSingle();

    return {
      studentId: existingProfile?.id || "",
      parentId: null,
      studentNeedsPasswordSetup: false,
      role: "student" as const,
      loginEmail: body.email,
      loginPassword: body.password,
      verificationSent: true,
      verificationEmail: body.email,
      verificationResent: true,
    };
  }

  const userId = data.user?.id;
  if (!userId) throw new Error("Unable to create student account.");

  await upsertProfile(
    admin,
    profilePayload({
      id: userId,
      email: body.email,
      role: "student",
      displayName: studentDisplayName,
      locale: body.locale,
      timezone: body.timezone,
    })
  );

  await sendVerificationEmail(admin, {
    email: body.email,
    displayName: studentDisplayName,
    locale: body.locale,
  });

  return {
    studentId: userId,
    parentId: null,
    studentNeedsPasswordSetup: false,
    role: "student" as const,
    loginEmail: body.email,
    loginPassword: body.password,
    verificationSent: true,
    verificationEmail: body.email,
    verificationResent: false,
  };
}

async function createParentRegistration(admin: any, body: ParsedBody) {
  if (body.role !== "parent") return null;

  const parentDisplayName = buildDisplayName(body.parentFirstName, body.parentLastName);

  const parentResult = await admin.auth.admin.createUser({
    email: body.parentEmail,
    password: body.parentPassword,
    email_confirm: false,
    user_metadata: {
      role: "parent",
      display_name: parentDisplayName,
      locale: body.locale,
      timezone: body.timezone,
    },
  });
  if (parentResult.error) {
    if (!isAlreadyRegisteredAuthError(parentResult.error.message)) {
      throw new Error(parentResult.error.message);
    }

    await sendVerificationEmail(admin, {
      email: body.parentEmail,
      displayName: parentDisplayName,
      locale: body.locale,
    });

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", body.parentEmail.trim().toLowerCase())
      .maybeSingle();

    return {
      studentId: "",
      parentId: existingProfile?.id || "",
      studentNeedsPasswordSetup: false,
      role: "parent" as const,
      loginEmail: body.parentEmail,
      loginPassword: body.parentPassword,
      verificationSent: true,
      verificationEmail: body.parentEmail,
      verificationResent: true,
    };
  }

  const parentId = parentResult.data.user?.id;
  if (!parentId) throw new Error("Unable to create parent account.");

  await upsertProfile(
    admin,
    profilePayload({
      id: parentId,
      email: body.parentEmail,
      role: "parent",
      displayName: parentDisplayName,
      locale: body.locale,
      timezone: body.timezone,
    })
  );

  // Save phone numbers.
  if (body.phoneNumbers?.length) {
    const phoneRows = body.phoneNumbers.map((phone) => ({
      user_id: parentId,
      label: phone.label,
      phone_number: phone.number,
    }));
    const { error: phoneError } = await admin.from("phone_numbers").insert(phoneRows);
    if (phoneError) throw new Error(phoneError.message);
  }

  await sendVerificationEmail(admin, {
    email: body.parentEmail,
    displayName: parentDisplayName,
    locale: body.locale,
  });

  return {
    studentId: "",
    parentId,
    studentNeedsPasswordSetup: false,
    role: "parent" as const,
    loginEmail: body.parentEmail,
    loginPassword: body.parentPassword,
    verificationSent: true,
    verificationEmail: body.parentEmail,
    verificationResent: false,
  };
}

async function trackReferralRegistration(
  admin: any,
  input: {
    referralCode?: string;
    referredEmail: string;
    referredProfileId: string;
  }
) {
  const referralCode = input.referralCode?.trim().toUpperCase();
  if (!referralCode) return;

  const { data: referralCodeRow } = await admin
    .from("referral_codes")
    .select("id,user_id")
    .eq("code", referralCode)
    .maybeSingle();

  if (!referralCodeRow) return;
  if (referralCodeRow.user_id === input.referredProfileId) return;

  const normalizedEmail = input.referredEmail.trim().toLowerCase();
  if (!normalizedEmail) return;

  const { data: existing } = await admin
    .from("referrals")
    .select("id")
    .eq("referrer_id", referralCodeRow.user_id)
    .eq("referred_email", normalizedEmail)
    .maybeSingle();

  if (existing) return;

  await admin.from("referrals").insert({
    referrer_id: referralCodeRow.user_id,
    referral_code_id: referralCodeRow.id,
    referred_email: normalizedEmail,
    referred_student_id: input.referredProfileId,
    status: "registered",
    registered_at: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input.";
    return jsonError(firstError);
  }
  const body = parsed.data;

  if (!isValidTimezone(body.timezone)) {
    return jsonError("Invalid timezone.");
  }

  const admin = getSupabaseAdminClient();

  try {
    const studentResult = await createStudentRegistration(admin, body);
    if (studentResult && body.role === "student") {
      try {
        await trackReferralRegistration(admin, {
          referralCode: body.referralCode,
          referredEmail: body.email,
          referredProfileId: studentResult.studentId,
        });
      } catch (error) {
        console.error("[register] referral tracking failed for student", error);
      }
      return NextResponse.json(studentResult);
    }

    const parentResult = await createParentRegistration(admin, body);
    if (parentResult && body.role === "parent") {
      try {
        await trackReferralRegistration(admin, {
          referralCode: body.referralCode,
          referredEmail: body.parentEmail,
          referredProfileId: parentResult.parentId,
        });
      } catch (error) {
        console.error("[register] referral tracking failed for parent", error);
      }
      return NextResponse.json(parentResult);
    }

    return jsonError("Invalid role.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    return jsonError(message, 400);
  }
}
