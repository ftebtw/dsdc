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
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  displayName: z.string().max(120).optional(), // legacy compatibility
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const parentSchema = baseSchema.extend({
  role: z.literal("parent"),
  parentFirstName: z.string().max(80).optional(),
  parentLastName: z.string().max(80).optional(),
  parentDisplayName: z.string().max(120).optional(), // legacy compatibility
  parentEmail: z.string().email(),
  parentPassword: z.string().min(8).max(128),
  studentFirstName: z.string().max(80).optional(),
  studentLastName: z.string().max(80).optional(),
  studentName: z.string().max(120).optional(),
  studentEmail: z.string().email(),
  studentMode: z.enum(["new", "existing"]).default("new"),
});

const bodySchema = z.discriminatedUnion("role", [studentSchema, parentSchema]).superRefine((value, ctx) => {
  if (value.role === "student") {
    const displayName = buildDisplayName(value.firstName, value.lastName, value.displayName);
    if (!displayName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["firstName"],
        message: "Student first and last name are required.",
      });
    }
  }

  if (value.role === "parent") {
    const parentDisplayName = buildDisplayName(
      value.parentFirstName,
      value.parentLastName,
      value.parentDisplayName
    );
    if (!parentDisplayName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["parentFirstName"],
        message: "Parent first and last name are required.",
      });
    }
    if ((value.studentMode ?? "new") === "new") {
      const studentDisplayName = buildDisplayName(
        value.studentFirstName,
        value.studentLastName,
        value.studentName
      );
      if (!studentDisplayName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["studentFirstName"],
          message: "Student first and last name are required.",
        });
      }
    }
  }
});

type ParsedBody = z.infer<typeof bodySchema>;
type AppRole = Database["public"]["Enums"]["app_role"];

function cleanNamePart(value: string | undefined): string {
  return value?.trim() ?? "";
}

function buildDisplayName(
  firstName?: string,
  lastName?: string,
  legacyDisplayName?: string
): string | null {
  const legacy = legacyDisplayName?.trim();
  if (legacy) return legacy;
  const fullName = `${cleanNamePart(firstName)} ${cleanNamePart(lastName)}`.trim();
  return fullName || null;
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

async function findAuthUserByEmail(
  admin: any,
  email: string
): Promise<{ id: string; email: string } | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin
    .from("profiles")
    .select("id,email")
    .eq("email", normalized)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function sendVerificationEmail(admin: any, input: {
  email: string;
  displayName: string;
  locale: "en" | "zh";
}) {
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
  const studentDisplayName = buildDisplayName(body.firstName, body.lastName, body.displayName);
  if (!studentDisplayName) throw new Error("Student first and last name are required.");

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
    verificationSent: true,
    verificationEmail: body.email,
  };
}

async function createParentRegistration(admin: any, body: ParsedBody) {
  if (body.role !== "parent") return null;
  const studentMode = body.studentMode ?? "new";
  const parentDisplayName = buildDisplayName(
    body.parentFirstName,
    body.parentLastName,
    body.parentDisplayName
  );
  if (!parentDisplayName) throw new Error("Parent first and last name are required.");
  const requestedStudentDisplayName = buildDisplayName(
    body.studentFirstName,
    body.studentLastName,
    body.studentName
  );
  if (studentMode === "new" && !requestedStudentDisplayName) {
    throw new Error("Student first and last name are required.");
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dsdc.ca";

  const existingStudentUser = await findAuthUserByEmail(admin, body.studentEmail);
  if (studentMode === "existing" && !existingStudentUser) {
    throw new Error("No student account found with this email. Please use 'Register New Student' instead.");
  }

  if (existingStudentUser) {
    const { data: existingProfile, error: existingProfileError } = await admin
      .from("profiles")
      .select("id,role")
      .eq("id", existingStudentUser.id)
      .maybeSingle();
    if (existingProfileError) throw new Error(existingProfileError.message);
    if (existingProfile && existingProfile.role !== "student") {
      throw new Error("Student email is already used by a non-student account.");
    }
  }

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

  await sendVerificationEmail(admin, {
    email: body.parentEmail,
    displayName: parentDisplayName,
    locale: body.locale,
  });

  let studentId = "";
  let studentNeedsPasswordSetup = false;

  if (existingStudentUser) {
    studentId = existingStudentUser.id;
    const { data: existingProfile, error: existingProfileError } = await admin
      .from("profiles")
      .select("id,role,email,display_name,locale,timezone")
      .eq("id", studentId)
      .maybeSingle();
    if (existingProfileError) throw new Error(existingProfileError.message);
    if (existingProfile && existingProfile.role !== "student") {
      throw new Error("Student email is already used by a non-student account.");
    }

    await upsertProfile(
      admin,
      profilePayload({
        id: studentId,
        email: body.studentEmail,
        role: "student",
        displayName:
          existingProfile?.display_name || requestedStudentDisplayName || body.studentEmail,
        locale: existingProfile?.locale === "zh" ? "zh" : body.locale,
        timezone: existingProfile?.timezone || body.timezone,
      })
    );
  } else {
    const newStudentDisplayName = requestedStudentDisplayName ?? body.studentEmail;
    const invite = await admin.auth.admin.inviteUserByEmail(body.studentEmail, {
      data: {
        role: "student",
        display_name: newStudentDisplayName,
        locale: body.locale,
        timezone: body.timezone,
      },
      redirectTo: `${siteUrl}/auth/callback?type=invite`,
    });
    if (invite.error) throw new Error(invite.error.message);
    studentId = invite.data.user?.id ?? "";
    if (!studentId) throw new Error("Unable to create student account.");
    studentNeedsPasswordSetup = true;

    await upsertProfile(
      admin,
      profilePayload({
        id: studentId,
        email: body.studentEmail,
        role: "student",
        displayName: newStudentDisplayName,
        locale: body.locale,
        timezone: body.timezone,
      })
    );
  }

  const { error: linkError } = await admin.from("parent_student_links").upsert(
    {
      parent_id: parentId,
      student_id: studentId,
    },
    { onConflict: "parent_id,student_id" }
  );
  if (linkError) throw new Error(linkError.message);

  return {
    studentId,
    parentId,
    studentNeedsPasswordSetup,
    role: "parent" as const,
    verificationSent: true,
    verificationEmail: body.parentEmail,
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
