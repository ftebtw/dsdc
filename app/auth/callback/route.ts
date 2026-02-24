import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

function safeRedirectPath(input: string | null, fallback: string): string {
  if (!input) return fallback;
  if (input.startsWith("/")) return input;
  return fallback;
}

function withSessionCookies(source: NextResponse, target: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    const { name, value, ...options } = cookie;
    target.cookies.set(name, value, options);
  }
  return target;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const redirectToRaw = url.searchParams.get("redirect_to") || url.searchParams.get("redirectTo");
  const redirectTo = safeRedirectPath(redirectToRaw, "");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!code || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  const sessionResponse = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
        for (const cookie of cookiesToSet) {
          sessionResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data?.user) {
    console.error("[auth/callback] code exchange failed", error?.message);
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(loginUrl);
  }

  if (redirectTo) {
    return withSessionCookies(
      sessionResponse,
      NextResponse.redirect(new URL(redirectTo, request.url))
    );
  }

  const user = data.user;

  if (type === "signup" || type === "email") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "student") {
      const classUrl = new URL("/register/classes", request.url);
      classUrl.searchParams.set("student", profile.id);
      return withSessionCookies(sessionResponse, NextResponse.redirect(classUrl));
    }

    if (profile?.role === "parent") {
      const { data: link } = await supabase
        .from("parent_student_links")
        .select("student_id")
        .eq("parent_id", profile.id)
        .limit(1)
        .maybeSingle();

      const classUrl = new URL("/register/classes", request.url);
      if (link?.student_id) {
        classUrl.searchParams.set("student", link.student_id);
        classUrl.searchParams.set("parent", profile.id);
      }
      return withSessionCookies(sessionResponse, NextResponse.redirect(classUrl));
    }

    return withSessionCookies(
      sessionResponse,
      NextResponse.redirect(new URL("/portal", request.url))
    );
  }

  if (type === "recovery") {
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("mode", "recovery");
    return withSessionCookies(sessionResponse, NextResponse.redirect(loginUrl));
  }

  if (type === "invite") {
    return withSessionCookies(
      sessionResponse,
      NextResponse.redirect(new URL("/portal/login", request.url))
    );
  }

  return withSessionCookies(sessionResponse, NextResponse.redirect(new URL("/portal", request.url)));
}
