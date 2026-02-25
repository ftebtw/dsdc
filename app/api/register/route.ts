import { NextRequest, NextResponse } from "next/server";
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

const studentSchema = baseSchema.extend({
  role: z.literal("student"),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const parentSchema = baseSchema.extend({
  role: z.literal("parent"),
  parentFirstName: z.string().trim().min(1).max(60),
  parentLastName: z.string().trim().min(1).max(60),
  parentEmail: z.string().email(),
  parentPassword: z.string().min(8).max(128),
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
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email: input.email,
    options: {
      redirectTo: `${portalBase}/auth/callback?type=signup`,
    },
  });

  if (error) {
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
    to: input.email,
    ...template,
  });

  if (!emailResult.ok) {
    throw new Error(emailResult.error || "Failed to send verification email.");
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
  if (error) throw new Error(error.message);

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
  };
}

async function createParentRegistration(admin: any, body: ParsedBody) {
  if (body.role !== "parent") return null;

  const parentDisplayName = buildDisplayName(body.parentFirstName, body.parentLastName);

  const parentResult = await admin.auth.admin.createUser({
    email: body.parentEmail,
    password: body.parentPassword,
    email_confirm: true,
    user_metadata: {
      role: "parent",
      display_name: parentDisplayName,
      locale: body.locale,
      timezone: body.timezone,
    },
  });
  if (parentResult.error) throw new Error(parentResult.error.message);

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

  return {
    studentId: "",
    parentId,
    studentNeedsPasswordSetup: false,
    role: "parent" as const,
    loginEmail: body.parentEmail,
    loginPassword: body.parentPassword,
  };
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

  let body: ParsedBody;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return jsonError("Invalid request body.");
  }

  if (!isValidTimezone(body.timezone)) {
    return jsonError("Invalid timezone.");
  }

  const admin = getSupabaseAdminClient();

  try {
    const studentResult = await createStudentRegistration(admin, body);
    if (studentResult) {
      return NextResponse.json(studentResult);
    }

    const parentResult = await createParentRegistration(admin, body);
    if (parentResult) {
      return NextResponse.json(parentResult);
    }

    return jsonError("Invalid role.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    return jsonError(message, 400);
  }
}
