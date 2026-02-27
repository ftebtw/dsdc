"use client";

import { useMemo, useState } from "react";

type ReferralStatus = "pending" | "registered" | "converted" | "credited";

type ReferralRow = {
  id: string;
  status: ReferralStatus;
  referred_email: string;
  credit_amount_cad: number | null;
  created_at: string;
  registered_at: string | null;
  converted_at: string | null;
  credited_at: string | null;
  stripe_promo_code: string | null;
  referrer:
    | { display_name: string | null; email: string | null }
    | Array<{ display_name: string | null; email: string | null }>
    | null;
  referred:
    | { display_name: string | null; email: string | null }
    | Array<{ display_name: string | null; email: string | null }>
    | null;
  referral_codes: { code: string | null } | Array<{ code: string | null }> | null;
};

type EnrolledUser = {
  id: string;
  display_name: string | null;
  email: string;
  role: string;
};

type Props = {
  referrals: ReferralRow[];
  enrolledUsers: EnrolledUser[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString();
}

function firstRow<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

const statusStyles: Record<ReferralStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  converted: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  credited: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function AdminReferralManager({ referrals, enrolledUsers }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualReferrerId, setManualReferrerId] = useState("");
  const [manualReferredEmail, setManualReferredEmail] = useState("");
  const [manualStatus, setManualStatus] = useState<"pending" | "registered" | "converted">(
    "pending"
  );
  const [manualSaving, setManualSaving] = useState(false);

  const stats = useMemo(() => {
    const total = referrals.length;
    const pending = referrals.filter(
      (referral) => referral.status === "pending" || referral.status === "registered"
    ).length;
    const converted = referrals.filter((referral) => referral.status === "converted").length;
    const credited = referrals.filter((referral) => referral.status === "credited").length;
    const totalCreditIssued = referrals
      .filter((referral) => referral.status === "credited")
      .reduce((sum, referral) => sum + Number(referral.credit_amount_cad ?? 0), 0);
    return { total, pending, converted, credited, totalCreditIssued };
  }, [referrals]);

  const filteredReferrals = useMemo(() => {
    return referrals.filter((referral) => {
      if (statusFilter !== "all" && referral.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const referrer = firstRow(referral.referrer);
        const referralCode = firstRow(referral.referral_codes);
        const referrerName = (referrer?.display_name || "").toLowerCase();
        const referrerEmail = (referrer?.email || "").toLowerCase();
        const referredEmail = (referral.referred_email || "").toLowerCase();
        const code = (referralCode?.code || "").toLowerCase();

        if (
          !referrerName.includes(query) &&
          !referrerEmail.includes(query) &&
          !referredEmail.includes(query) &&
          !code.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [referrals, searchQuery, statusFilter]);

  async function issueCredit(referralId: string) {
    setLoadingId(referralId);
    setError(null);

    try {
      const response = await fetch("/api/portal/referrals/issue-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Could not issue referral credit.");
        setLoadingId(null);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("[admin-referral] error:", error);
      setError("Could not issue referral credit.");
      setLoadingId(null);
    }
  }

  async function createManualReferral() {
    if (!manualReferrerId || !manualReferredEmail) return;

    setManualSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/portal/referrals/create-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerId: manualReferrerId,
          referredEmail: manualReferredEmail,
          status: manualStatus,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Could not create manual referral.");
        setManualSaving(false);
        return;
      }

      setManualSaving(false);
      setShowManualForm(false);
      setManualReferrerId("");
      setManualReferredEmail("");
      setManualStatus("pending");
      window.location.reload();
    } catch (error) {
      console.error("[admin-referral] error:", error);
      setError("Could not create manual referral.");
      setManualSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Referrals",
            value: stats.total,
            color: "text-navy-900 dark:text-white",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "text-yellow-600 dark:text-yellow-400",
          },
          {
            label: "Converted (awaiting credit)",
            value: stats.converted,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Credit Issued",
            value: `$${stats.totalCreditIssued} CAD`,
            color: "text-purple-600 dark:text-purple-400",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900/50 p-3 text-center"
          >
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-charcoal/60 dark:text-navy-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or code..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="flex-1 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm dark:text-white"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="registered">Registered</option>
          <option value="converted">Converted</option>
          <option value="credited">Credited</option>
        </select>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowManualForm((current) => !current)}
          className="text-sm font-semibold text-navy-700 dark:text-navy-200 underline"
        >
          {showManualForm ? "Cancel" : "+ Add Manual Referral"}
        </button>

        {showManualForm ? (
          <div className="mt-3 rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900/50 p-4 space-y-3">
            <label className="block">
              <span className="text-sm text-navy-700 dark:text-navy-200">Referrer</span>
              <select
                value={manualReferrerId}
                onChange={(event) => setManualReferrerId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm dark:text-white"
              >
                <option value="">Select referrer...</option>
                {enrolledUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || user.email} ({user.role})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-navy-700 dark:text-navy-200">Referred person's email</span>
              <input
                type="email"
                value={manualReferredEmail}
                onChange={(event) => setManualReferredEmail(event.target.value)}
                placeholder="newstudent@example.com"
                className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-sm text-navy-700 dark:text-navy-200">Initial status</span>
              <select
                value={manualStatus}
                onChange={(event) =>
                  setManualStatus(event.target.value as "pending" | "registered" | "converted")
                }
                className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm dark:text-white"
              >
                <option value="pending">Pending (link shared, not registered yet)</option>
                <option value="registered">Registered (they have an account)</option>
                <option value="converted">Converted (they paid - ready for credit)</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                void createManualReferral();
              }}
              disabled={manualSaving || !manualReferrerId || !manualReferredEmail}
              className="px-4 py-2 rounded-lg bg-navy-800 text-white text-sm font-semibold disabled:opacity-60"
            >
              {manualSaving ? "Saving..." : "Create Referral"}
            </button>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {filteredReferrals.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">No referrals match the current filters.</p>
      ) : (
        <div className="space-y-3">
          {filteredReferrals.map((referral) => {
            const busy = loadingId === referral.id;
            const referrer = firstRow(referral.referrer);
            const referred = firstRow(referral.referred);
            const referralCode = firstRow(referral.referral_codes);
            const referrerName = referrer?.display_name || referrer?.email || "Unknown";
            const referrerEmail = referrer?.email || "";
            const referredName = referred?.display_name || referred?.email || referral.referred_email;
            return (
              <article
                key={referral.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900/55 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">
                      {referrerName}{" "}
                      <span className="font-normal text-charcoal/60 dark:text-navy-300">
                        ({referrerEmail})
                      </span>
                    </p>
                    <p className="text-sm text-charcoal/80 dark:text-navy-200">Referred: {referredName}</p>
                    <p className="text-xs text-charcoal/60 dark:text-navy-300">
                      Code: {referralCode?.code || "--"} • Created: {formatDate(referral.created_at)}
                    </p>
                    <p className="text-xs text-charcoal/60 dark:text-navy-300">
                      Registered: {formatDate(referral.registered_at)} • Converted: {formatDate(referral.converted_at)}
                      {" "}• Credited: {formatDate(referral.credited_at)}
                    </p>
                    {referral.stripe_promo_code ? (
                      <p className="text-xs text-charcoal/70 dark:text-navy-200">
                        Promo code: <span className="font-mono font-semibold">{referral.stripe_promo_code}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[referral.status]}`}
                    >
                      {referral.status}
                    </span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      {formatCurrency(Number(referral.credit_amount_cad ?? 0))}
                    </span>
                    {referral.status === "converted" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          void issueCredit(referral.id);
                        }}
                        className="rounded-md bg-navy-800 text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
                      >
                        {busy ? "Issuing..." : "Issue Credit"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

