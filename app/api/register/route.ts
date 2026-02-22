import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const baseSchema = z.object({
  locale: z.enum(["en", "zh"]).default("en"),
  timezone: z.string().min(1).max(80).default("America/Vancouver"),
});

const studentSchema = baseSchema.extend({
  role: z.literal("student"),
  displayName: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const parentSchema = baseSchema.extend({
  role: z.literal("parent"),
  parentDisplayName: z.string().min(1).max(120),
  parentEmail: z.string().email(),
  parentPassword: z.string().min(8).max(128),
  studentName: z.string().min(1).max(120),
  studentEmail: z.string().email(),
});

const bodySchema = z.discriminatedUnion("role", [studentSchema, parentSchema]);

type ParsedBody = z.infer<typeof bodySchema>;
type AppRole = Database["public"]["Enums"]["app_role"];

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

async function findAuthUserByEmail(admin: any, email: string): Promise<any | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 100;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const found = (data?.users ?? []).find((user: any) => {
      const userEmail = typeof user?.email === "string" ? user.email.toLowerCase() : "";
      return userEmail === normalized;
    });
    if (found) return found;
    if (!data?.users?.length || data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function createStudentRegistration(admin: any, body: ParsedBody) {
  if (body.role !== "student") return null;

  const { data, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      role: "student",
      display_name: body.displayName,
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
      displayName: body.displayName,
      locale: body.locale,
      timezone: body.timezone,
    })
  );

  return {
    loginEmail: body.email,
    loginPassword: body.password,
    studentId: userId,
    parentId: null,
    studentNeedsPasswordSetup: false,
    role: "student" as const,
  };
}

async function createParentRegistration(admin: any, body: ParsedBody) {
  if (body.role !== "parent") return null;

  const existingStudentUser = await findAuthUserByEmail(admin, body.studentEmail);
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
    email_confirm: true,
    user_metadata: {
      role: "parent",
      display_name: body.parentDisplayName,
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
      displayName: body.parentDisplayName,
      locale: body.locale,
      timezone: body.timezone,
    })
  );

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
        displayName: existingProfile?.display_name || body.studentName,
        locale: existingProfile?.locale === "zh" ? "zh" : body.locale,
        timezone: existingProfile?.timezone || body.timezone,
      })
    );
  } else {
    const invite = await admin.auth.admin.inviteUserByEmail(body.studentEmail, {
      data: {
        role: "student",
        display_name: body.studentName,
        locale: body.locale,
        timezone: body.timezone,
      },
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
        displayName: body.studentName,
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
    loginEmail: body.parentEmail,
    loginPassword: body.parentPassword,
    studentId,
    parentId,
    studentNeedsPasswordSetup,
    role: "parent" as const,
  };
}

export async function POST(request: NextRequest) {
  let body: ParsedBody;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return jsonError("Invalid request body.");
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
