import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

type CallbackType = "signup" | "email" | "recovery" | "invite" | "magiclink" | null;

function safeRedirectPath(input: string | null, fallback: string): string {
  if (!input) return fallback;
  return input.startsWith("/") ? input : fallback;
}

function withSessionCookies(source: NextResponse, target: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    const { name, value, ...options } = cookie;
    target.cookies.set(name, value, options);
  }
  return target;
}

function toCallbackType(value: string | null): CallbackType {
  if (value === "signup") return "signup";
  if (value === "email") return "email";
  if (value === "recovery") return "recovery";
  if (value === "invite") return "invite";
  if (value === "magiclink") return "magiclink";
  return null;
}

function toOtpType(type: CallbackType): "signup" | "email" | "recovery" | "invite" | "magiclink" {
  if (type === "signup") return "signup";
  if (type === "recovery") return "recovery";
  if (type === "invite") return "invite";
  if (type === "magiclink") return "magiclink";
  return "email";
}

async function buildRedirect(
  supabase: any,
  request: NextRequest,
  sessionResponse: NextResponse,
  type: CallbackType,
  nextPath: string
): Promise<NextResponse> {
  if (type === "recovery") {
    const recoveryUrl = new URL("/portal/login", request.url);
    recoveryUrl.searchParams.set("mode", "recovery");
    return withSessionCookies(sessionResponse, NextResponse.redirect(recoveryUrl));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return withSessionCookies(sessionResponse, NextResponse.redirect(new URL(nextPath, request.url)));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || "student";

  if (type === "signup" || type === "email" || type === "invite" || type === "magiclink") {
    const verifiedUrl = new URL("/auth/verified", request.url);
    verifiedUrl.searchParams.set("role", role);
    return withSessionCookies(sessionResponse, NextResponse.redirect(verifiedUrl));
  }

  const hashHandlerUrl = new URL("/auth/callback/complete", request.url);
  hashHandlerUrl.searchParams.set("next", nextPath);
  if (type) {
    hashHandlerUrl.searchParams.set("type", type);
  }

  return withSessionCookies(sessionResponse, NextResponse.redirect(hashHandlerUrl));
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = toCallbackType(url.searchParams.get("type"));
  const nextPath = safeRedirectPath(
    url.searchParams.get("next") ||
      url.searchParams.get("redirect_to") ||
      url.searchParams.get("redirectTo"),
    "/portal"
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] code exchange failed", error.message);
      // If the PKCE exchange failed because this browser doesn't have the
      // code_verifier cookie (very common for invite links opened on a
      // different device from the one that created the account), we still
      // want the student to be able to proceed — check whether they already
      // have a valid session from a prior successful click.
      const { data: existingUser } = await supabase.auth.getUser();
      if (existingUser?.user) {
        return buildRedirect(supabase, request, sessionResponse, type, nextPath);
      }
      // Give the login page a more specific error tag so the message can
      // tell the student to click "Resend verification email" — the resend
      // flow uses generateLink (token_hash) which works cross-device.
      const errorCode = /expired/i.test(error.message)
        ? "verification_expired"
        : /code verifier|verifier is/i.test(error.message)
          ? "verification_wrong_device"
          : "verification_failed";
      const loginUrl = new URL("/portal/login", request.url);
      loginUrl.searchParams.set("error", errorCode);
      return NextResponse.redirect(loginUrl);
    }
    return buildRedirect(supabase, request, sessionResponse, type, nextPath);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: toOtpType(type),
    });

    if (error) {
      console.error("[auth/callback] OTP verification failed", error.message);
      const errorCode = /expired/i.test(error.message)
        ? "verification_expired"
        : "verification_failed";
      const loginUrl = new URL("/portal/login", request.url);
      loginUrl.searchParams.set("error", errorCode);
      return NextResponse.redirect(loginUrl);
    }

    return buildRedirect(supabase, request, sessionResponse, type, nextPath);
  }

  // If this was an email verification but we received neither code nor token_hash
  // (implicit flow — token is in the hash fragment, invisible to server),
  // redirect to login with verified=true so the user sees the success message.
  // The email IS verified at this point — Supabase confirmed it before redirecting here.
  if (type === "signup" || type === "email" || type === "invite" || type === "magiclink") {
    return withSessionCookies(
      sessionResponse,
      NextResponse.redirect(new URL("/portal/login?verified=true", request.url))
    );
  }

  return withSessionCookies(sessionResponse, NextResponse.redirect(new URL(nextPath, request.url)));
}
