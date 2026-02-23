export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import SetupPasswordForm from "./SetupPasswordForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function SetupPasswordPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,email,role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">
          Welcome to DSDC, {profile?.display_name || "Student"}!
        </h1>
        <p className="text-charcoal/70 dark:text-navy-300 mb-6">
          Your parent has registered you for classes. Set a password to finish creating your account.
        </p>
        <SetupPasswordForm email={user.email || profile?.email || ""} />
      </div>
    </section>
  );
}
