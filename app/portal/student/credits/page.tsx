export const dynamic = 'force-dynamic';

import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { classTypeLabel } from "@/lib/portal/labels";
import { portalT } from "@/lib/portal/parent-i18n";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function StudentCreditsPage() {
  const session = await requireRole(["student"]);
  const locale = session.profile.locale === "zh" ? "zh" : "en";
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const supabase = await getSupabaseServerClient();

  const { data: creditsData } = await supabase
    .from("class_credits")
    .select("id,class_type,amount_sessions,redeemed,reason,created_at")
    .eq("student_id", session.userId)
    .order("created_at", { ascending: false });

  const credits = (creditsData ?? []) as Array<{
    id: string;
    class_type: string;
    amount_sessions: number;
    redeemed: boolean;
    reason: string | null;
    created_at: string;
  }>;

  const unredeemed = credits.filter((credit) => !credit.redeemed);
  const redeemed = credits.filter((credit) => credit.redeemed);
  const totalAvailable = unredeemed.reduce(
    (sum, credit) => sum + Number(credit.amount_sessions || 0),
    0
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title={t("portal.studentCredits.title", "Class Credits")}
        description={t(
          "portal.studentCredits.description",
          "Credits can be used towards make-up classes or future sessions. Credits are issued by your coach or admin."
        )}
      >
        {credits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-charcoal/60 dark:text-navy-400">
              {t("portal.studentCredits.noneYet", "You don't have any class credits yet.")}
            </p>
            <p className="text-sm text-charcoal/50 dark:text-navy-500 mt-1">
              {t(
                "portal.studentCredits.noneHint",
                "Credits may be issued if you miss a class due to special circumstances."
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4 mb-4">
              <p className="text-sm text-charcoal/70 dark:text-navy-300">
                {t("portal.studentCredits.totalAvailable", "Total available credits:")}{" "}
                <span className="font-bold text-navy-800 dark:text-white text-lg">{totalAvailable}</span>
              </p>
            </div>

            {unredeemed.length > 0 ? (
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-200">
                  {t("portal.studentCredits.available", "Available")}
                </h3>
                {unredeemed.map((credit) => (
                  <div
                    key={credit.id}
                    className="flex items-center justify-between rounded-lg border border-warm-200 dark:border-navy-600 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy-800 dark:text-white">
                        {classTypeLabel[credit.class_type as keyof typeof classTypeLabel] ||
                          credit.class_type}
                      </p>
                      {credit.reason ? (
                        <p className="text-xs text-charcoal/60 dark:text-navy-400">{credit.reason}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-navy-800 dark:text-white">
                        {t("portal.studentCredits.sessionCount", "{count} session(s)")
                          .replace("{count}", String(credit.amount_sessions))
                          .replace("(s)", credit.amount_sessions !== 1 ? "s" : "")}
                      </span>
                      <p className="text-xs text-charcoal/50 dark:text-navy-400">
                        {new Date(credit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {redeemed.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-charcoal/50 dark:text-navy-400">
                  {t("portal.studentCredits.used", "Used")}
                </h3>
                {redeemed.map((credit) => (
                  <div
                    key={credit.id}
                    className="flex items-center justify-between rounded-lg border border-warm-100 dark:border-navy-700 px-3 py-2 opacity-60"
                  >
                    <div>
                      <p className="text-sm text-charcoal/60 dark:text-navy-400">
                        {classTypeLabel[credit.class_type as keyof typeof classTypeLabel] ||
                          credit.class_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-charcoal/60 dark:text-navy-400 line-through">
                        {t("portal.studentCredits.sessionCount", "{count} session(s)")
                          .replace("{count}", String(credit.amount_sessions))
                          .replace("(s)", credit.amount_sessions !== 1 ? "s" : "")}
                      </span>
                      <p className="text-xs text-charcoal/40 dark:text-navy-500">
                        {new Date(credit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </SectionCard>
    </div>
  );
}
