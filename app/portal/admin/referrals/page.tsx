export const dynamic = "force-dynamic";

import AdminReferralManager from "@/app/portal/_components/AdminReferralManager";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminReferralsPage() {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const [{ data: referrals }, { data: enrolledUsers }] = await Promise.all([
    supabase
      .from("referrals")
      .select(
        "id,referred_email,referred_student_id,status,credit_amount_cad,created_at,registered_at,converted_at,credited_at,stripe_promo_code,referral_codes!inner(code),referrer:profiles!referrals_referrer_id_fkey(display_name,email),referred:profiles!referrals_referred_student_id_fkey(display_name,email)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id,display_name,email,role")
      .in("role", ["student", "parent"])
      .order("display_name"),
  ]);

  return (
    <SectionCard
      title="Referral Program"
      description="Track referrals and issue Stripe credits after successful conversions."
    >
      <AdminReferralManager
        referrals={(referrals ?? []) as any[]}
        enrolledUsers={(enrolledUsers ?? []) as any[]}
      />
    </SectionCard>
  );
}

