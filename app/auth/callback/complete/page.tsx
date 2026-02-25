"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackCompletePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    async function handleCallback() {
      const supabase = getSupabaseBrowserClient();
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("error");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role || "student";
      const next = new URLSearchParams(window.location.search).get("next");
      if (next && next.startsWith("/")) {
        router.replace(next);
        return;
      }

      router.replace(`/auth/verified?role=${encodeURIComponent(role)}`);
    }

    void handleCallback();
  }, [router]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-navy-950 px-4">
        <div className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900 p-6 max-w-md text-center">
          <h1 className="text-xl font-bold text-navy-900 dark:text-white">Verification Failed</h1>
          <p className="mt-2 text-sm text-charcoal/70 dark:text-navy-300">
            The verification link may have expired. Please try logging in or request a new verification email.
          </p>
          <a
            href="/portal/login"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-navy-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800 dark:border-white mx-auto" />
        <p className="mt-4 text-sm text-charcoal/70 dark:text-navy-300">Verifying your account...</p>
      </div>
    </div>
  );
}
