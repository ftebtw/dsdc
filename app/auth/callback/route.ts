import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeRedirectPath(input: string | null, fallback: string) {
  if (!input) return fallback;
  return input.startsWith("/") ? input : fallback;
}

function callbackTargetPath(type: string | null, next: string) {
  switch (type) {
    case "recovery":
      return "/portal/login?mode=recovery";
    case "signup":
    case "invite":
      return "/portal/setup-password";
    case "email_change":
      return "/portal/login?message=email_confirmed";
    default:
      return next;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = safeRedirectPath(searchParams.get("next"), "/portal");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dsdc.ca";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!code || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/portal/login", siteUrl));
  }

  const targetPath = callbackTargetPath(type, next);
  const response = NextResponse.redirect(new URL(targetPath, siteUrl));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(new URL("/portal/login?error=auth_callback_failed", siteUrl));
  }

  return response;
}
