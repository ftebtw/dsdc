import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPortalEmail } from "@/lib/email/send";
import { passwordResetTemplate } from "@/lib/email/templates";
import { getPortalAppUrl } from "@/lib/email/resend";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ ok: true });
  }

  const admin = getSupabaseAdminClient();
  const email = body.data.email.trim().toLowerCase();

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name,locale")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ ok: true });
    }

    const name = profile?.display_name || email;
    const locale = profile?.locale === "zh" ? "zh" : "en";

    const appUrl = getPortalAppUrl().replace(/\/$/, "");
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${appUrl}/auth/callback?type=recovery`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[reset-password] Failed to generate link:", linkError?.message);
      return NextResponse.json({ ok: true });
    }

    const actionUrl = new URL(linkData.properties.action_link);
    const tokenHash = linkData.properties.hashed_token || actionUrl.searchParams.get("token_hash");
    const code = actionUrl.searchParams.get("code");

    let resetUrl = linkData.properties.action_link;
    if (tokenHash) {
      resetUrl = `${appUrl}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`;
    } else if (code) {
      resetUrl = `${appUrl}/auth/callback?code=${encodeURIComponent(code)}&type=recovery`;
    }

    const template = passwordResetTemplate({ name, resetUrl, locale });
    const emailResult = await sendPortalEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!emailResult.ok) {
      console.error("[reset-password] Email send failed:", emailResult.error);
    }
  } catch (error) {
    console.error("[reset-password] Unexpected error:", error);
  }

  return NextResponse.json({ ok: true });
}
