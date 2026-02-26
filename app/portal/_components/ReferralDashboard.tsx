"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

type ReferralItem = {
  id: string;
  referredEmail: string;
  status: "pending" | "registered" | "converted" | "credited";
  creditAmountCad: number;
  createdAt: string;
  convertedAt: string | null;
  creditedAt: string | null;
  promoCode: string | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const prefix = local.slice(0, 2);
  return `${prefix}***@${domain}`;
}

const statusStyle: Record<ReferralItem["status"], string> = {
  pending: "bg-warm-200 text-charcoal",
  registered: "bg-blue-100 text-blue-800",
  converted: "bg-green-100 text-green-800",
  credited: "bg-purple-100 text-purple-800",
};

const statusLabel: Record<ReferralItem["status"], string> = {
  pending: "Link shared",
  registered: "Registered",
  converted: "Enrolled - credit pending",
  credited: "Credit issued",
};

export default function ReferralDashboard({
  referralLink,
  referrals,
  totalCredit,
}: {
  referralLink: string;
  referrals: ReferralItem[];
  totalCredit: number;
}) {
  const [copied, setCopied] = useState(false);

  const convertedCount = useMemo(
    () => referrals.filter((item) => item.status === "converted" || item.status === "credited").length,
    [referrals]
  );

  const activePromoCodes = useMemo(() => {
    const codes = new Set(
      referrals
        .filter((item) => item.status === "credited" && item.promoCode)
        .map((item) => item.promoCode as string)
    );
    return [...codes];
  }, [referrals]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900/50 p-4 space-y-3">
        <p className="text-sm font-medium text-navy-700 dark:text-navy-200">Your referral link</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm font-mono dark:text-white"
          />
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-1.5 rounded-lg bg-navy-800 text-white px-3 py-2 text-sm font-semibold"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-charcoal/60 dark:text-navy-400">
          Share this link with friends. You earn CAD $50 credit for each friend who enrolls in a full-term class.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900/50 p-3 text-center">
          <p className="text-2xl font-bold text-navy-900 dark:text-white">{referrals.length}</p>
          <p className="text-xs text-charcoal/60 dark:text-navy-400">Total referrals</p>
        </div>
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900/50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{convertedCount}</p>
          <p className="text-xs text-charcoal/60 dark:text-navy-400">Enrolled</p>
        </div>
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900/50 p-3 text-center">
          <p className="text-2xl font-bold text-gold-600 dark:text-gold-300">{formatCurrency(totalCredit)}</p>
          <p className="text-xs text-charcoal/60 dark:text-navy-400">Credit earned</p>
        </div>
      </div>

      {activePromoCodes.length > 0 ? (
        <div className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-4">
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">Active promo codes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {activePromoCodes.map((code) => (
              <span
                key={code}
                className="inline-flex rounded-md bg-white dark:bg-navy-900 border border-purple-200 dark:border-purple-600 px-3 py-1 text-sm font-mono"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {referrals.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-navy-700 dark:text-navy-200">Referral history</p>
          {referrals.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-warm-200 dark:border-navy-600 p-3"
            >
              <div>
                <p className="text-sm font-medium text-navy-800 dark:text-white">{maskEmail(item.referredEmail)}</p>
                <p className="text-xs text-charcoal/60 dark:text-navy-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.creditAmountCad > 0 ? (
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    +{formatCurrency(item.creditAmountCad)}
                  </span>
                ) : null}
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-charcoal/60 dark:text-navy-400">
          No referrals yet. Share your link to get started.
        </p>
      )}
    </div>
  );
}

