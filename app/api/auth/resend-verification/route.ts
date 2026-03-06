import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPortalEmail } from "@/lib/email/send";
import { verificationEmailTemplate } from "@/lib/email/templates";
import { getPortalAppUrl } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["en", "zh"]).optional(),
});

async function resendVerificationViaSupabase(input: { email: string; redirectTo: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnonKey) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: input.email,
    options: { emailRedirectTo: input.redirectTo },
  });

  if (error) {
    console.error("[resend-verification] Supabase resend failed:", error.message);
  }
}

export async function POST(request: NextRequest) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const email = body.data.email.trim().toLowerCase();
  const { allowed } = rateLimit(`resend-verification:${ip}:${email}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ ok: true });
  }

  const admin = getSupabaseAdminClient();
  const appUrl = getPortalAppUrl().replace(/\/$/, "");
  const redirectTo = `${appUrl}/auth/callback?type=signup`;

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name,locale")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ ok: true });
    }

    const displayName = profile.display_name || email;
    const locale = body.data.locale || (profile.locale === "zh" ? "zh" : "en");

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      if (linkError) {
        console.error("[resend-verification] Failed to generate link:", linkError.message);
      }
      await resendVerificationViaSupabase({ email, redirectTo });
      return NextResponse.json({ ok: true });
    }

    const template = verificationEmailTemplate({
      name: displayName,
      verifyUrl: linkData.properties.action_link,
      locale,
    });

    const emailResult = await sendPortalEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!emailResult.ok) {
      console.error("[resend-verification] Email send failed:", emailResult.error);
      await resendVerificationViaSupabase({ email, redirectTo });
    }
  } catch (error) {
    console.error("[resend-verification] Unexpected error:", error);
  }

  // Always return success to avoid email enumeration.
  return NextResponse.json({ ok: true });
}
