import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login?verified=true");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,display_name,locale")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || params.role || "student";
  const locale = profile?.locale === "zh" ? "zh" : "en";
  const displayName = profile?.display_name || user.email || "";

  const copy =
    locale === "zh"
      ? {
          title: "账号验证成功！",
          welcome: `欢迎，${displayName}！`,
          studentMessage: "您的账号已确认。您现在可以浏览并报名课程。",
          parentMessage: "您的账号已确认。请前往门户关联学生并报名课程。",
          studentCta: "浏览并报名课程",
          parentCta: "前往门户",
          portalCta: "前往门户",
        }
      : {
          title: "Account Verified!",
          welcome: `Welcome, ${displayName}!`,
          studentMessage: "Your account is confirmed. You can now browse and enroll in classes.",
          parentMessage: "Your account is confirmed. Head to the portal to link your student and enroll in classes.",
          studentCta: "Browse & Enroll in Classes",
          parentCta: "Go to Portal",
          portalCta: "Go to Portal",
        };

  const nextUrl =
    role === "student"
      ? "/portal/student/enroll"
      : role === "parent"
        ? "/portal/parent/dashboard"
        : "/portal";

  const ctaLabel =
    role === "student"
      ? copy.studentCta
      : role === "parent"
        ? copy.parentCta
        : copy.portalCta;

  const message = role === "parent" ? copy.parentMessage : copy.studentMessage;

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6 sm:p-8 text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{copy.title}</h1>
        <p className="text-lg text-navy-800 dark:text-navy-100">{copy.welcome}</p>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">{message}</p>

        <Link
          href={nextUrl}
          className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-300 text-navy-900 font-bold shadow-md hover:shadow-lg transition-all"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
