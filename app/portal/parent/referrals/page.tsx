export const dynamic = "force-dynamic";

import EnrollmentRequiredBanner from "@/app/portal/_components/EnrollmentRequiredBanner";
import ReferralDashboard from "@/app/portal/_components/ReferralDashboard";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { parentHasEnrolledStudent } from "@/lib/portal/enrollment-status";
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

  const { hasEnrolled } = await parentHasEnrolledStudent(supabase, session.userId);
  if (!hasEnrolled) {
    return (
      <SectionCard
        title="Refer a Friend"
        description="You need at least one enrolled linked student to unlock referral sharing."
      >
        <EnrollmentRequiredBanner
          role="parent"
          locale={session.profile.locale === "zh" ? "zh" : "en"}
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
        title="Refer a Friend"
        description="Share your link and earn CAD $50 credit for each family who enrolls in a full-term class."
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
      title="Refer a Friend"
      description="Referral dashboard is temporarily unavailable."
    >
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        We could not load your referral data right now. Please try again in a minute.
      </p>
    </SectionCard>
  );
}

