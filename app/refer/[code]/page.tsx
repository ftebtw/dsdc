import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReferralCodeCapture from "./ReferralCodeCapture";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalizedCode = code.trim();

  const admin = getSupabaseAdminClient();
  const { data: referralCode } = await admin
    .from("referral_codes")
    .select("id,user_id")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (!referralCode) {
    notFound();
  }

  const { data: referrerProfile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", referralCode.user_id)
    .maybeSingle();

  const referrerName = referrerProfile?.display_name || "A DSDC student";

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 pt-28 pb-14">
      <ReferralCodeCapture code={normalizedCode} />
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-2xl border border-warm-200 bg-white/95 shadow-xl p-8 text-center space-y-5">
          <Image
            src="/images/logos/logo-full.png"
            alt="DSDC"
            width={400}
            height={100}
            className="h-12 w-auto mx-auto"
            priority
          />

          <div className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-2 text-sm font-semibold text-navy-900">
            Free Trial Class
          </div>

          <h1 className="text-2xl font-bold text-navy-900">
            {referrerName} has sent you a free trial class!
          </h1>

          <p className="text-charcoal/70">
            Experience world-class debate and public speaking coaching. Book a free consultation
            to learn more and claim your trial class.
          </p>

          <Link
            href="/book"
            className="inline-flex rounded-full bg-gold-300 px-6 py-3 text-base font-bold text-navy-900 shadow-md hover:-translate-y-0.5 hover:bg-gold-200 hover:shadow-lg transition-all"
          >
            Book a Free Consultation
          </Link>

          <p className="text-xs text-charcoal/50">
            Free trial class is for first-time students only. One trial per family.
          </p>
        </div>
      </div>
    </section>
  );
}

