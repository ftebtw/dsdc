export const dynamic = "force-dynamic";

import EnrollmentRequiredBanner from "@/app/portal/_components/EnrollmentRequiredBanner";
import ReferralDashboard from "@/app/portal/_components/ReferralDashboard";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { hasActiveEnrollment } from "@/lib/portal/enrollment-status";
import { getOrCreateReferralCode } from "@/lib/portal/referral";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getAppBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "https://dsdc.ca";
}

export default async function StudentReferralsPage() {
  const session = await requireRole(["student"]);
  const supabase = await getSupabaseServerClient();

  const enrolled = await hasActiveEnrollment(supabase, session.userId);
  if (!enrolled) {
    return (
      <SectionCard
        title="Refer a Friend"
        description="You need an active enrollment to unlock referral sharing."
      >
        <EnrollmentRequiredBanner
          role="student"
          locale={session.profile.locale === "zh" ? "zh" : "en"}
        />
      </SectionCard>
    );
  }

  const code = await getOrCreateReferralCode(supabase, session.userId);
  const referralLink = `${getAppBaseUrl()}/refer/${code}`;

  const { data: referralsData } = await supabase
    .from("referrals")
    .select(
      "id,referred_email,status,credit_amount_cad,created_at,converted_at,credited_at,stripe_promo_code"
    )
    .eq("referrer_id", session.userId)
    .order("created_at", { ascending: false });

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
      description="Share your link and earn CAD $50 credit for each friend who enrolls in a full-term class."
    >
      <ReferralDashboard
        referralLink={referralLink}
        referrals={referrals}
        totalCredit={totalCredit}
      />
    </SectionCard>
  );
}

