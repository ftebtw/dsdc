export const dynamic = "force-dynamic";

import EnrollmentRequiredBanner from "@/app/portal/_components/EnrollmentRequiredBanner";
import ReferralDashboard from "@/app/portal/_components/ReferralDashboard";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { parentHasEnrolledStudent } from "@/lib/portal/enrollment-status";
import { parentT } from "@/lib/portal/parent-i18n";
import { getOrCreateReferralCode } from "@/lib/portal/referral";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getAppBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "https://dsdc.ca";
}

export default async function ParentReferralsPage() {
  const session = await requireRole(["parent"]);
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === "zh" ? "zh" : "en";
  const t = (key: string, fallback: string) => parentT(locale as "en" | "zh", key, fallback);

  const { hasEnrolled } = await parentHasEnrolledStudent(supabase, session.userId);
  if (!hasEnrolled) {
    return (
      <SectionCard
        title={t("portal.parent.referrals.title", "Refer a Friend")}
        description={t("portal.parent.referrals.enrollRequired", "You need at least one enrolled linked student to unlock referral sharing.")}
      >
        <EnrollmentRequiredBanner
          role="parent"
          locale={locale}
        />
      </SectionCard>
    );
  }

  try {
    const code = await getOrCreateReferralCode(supabase, session.userId);
    const referralLink = `${getAppBaseUrl()}/refer/${code}`;

    const { data: referralsData, error: referralsError } = await supabase
      .from("referrals")
      .select(
        "id,referred_email,status,credit_amount_cad,created_at,converted_at,credited_at,stripe_promo_code"
      )
      .eq("referrer_id", session.userId)
      .order("created_at", { ascending: false });

    if (referralsError) {
      throw referralsError;
    }

    const referrals = (referralsData ?? []).map((row: any) => ({
      id: row.id,
      referredEmail: row.referred_email,
      status: row.status,
      creditAmountCad: Number(row.credit_amount_cad ?? 0),
      createdAt: row.created_at,
      convertedAt: row.converted_at,
      creditedAt: row.credited_at,
      promoCode: row.stripe_promo_code || null,
    }));

    const totalCredit = referrals
      .filter((row: any) => row.status === "credited")
      .reduce((sum: number, row: any) => sum + Number(row.creditAmountCad), 0);

    return (
      <SectionCard
        title={t("portal.parent.referrals.title", "Refer a Friend")}
        description={t("portal.parent.referrals.description", "Share your link and earn CAD $50 credit for each family who enrolls in a full-term class.")}
      >
        <ReferralDashboard
          referralLink={referralLink}
          referrals={referrals}
          totalCredit={totalCredit}
        />
      </SectionCard>
    );
  } catch (error) {
    console.error("[parent-referrals] failed to load referral dashboard", error);
  }

  return (
    <SectionCard
      title={t("portal.parent.referrals.title", "Refer a Friend")}
      description={t("portal.parent.referrals.unavailable", "Referral dashboard is temporarily unavailable.")}
    >
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        {t("portal.parent.referrals.unavailableBody", "We could not load your referral data right now. Please try again in a minute.")}
      </p>
    </SectionCard>
  );
}

