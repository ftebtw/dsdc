export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || "student";
    const portalHome =
      role === "admin"
        ? "/portal/admin/dashboard"
        : role === "coach" || role === "ta"
          ? "/portal/coach/dashboard"
          : role === "parent"
            ? "/portal/parent/dashboard"
            : "/portal/student/classes";

    redirect(portalHome);
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-14">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </section>
  );
}
