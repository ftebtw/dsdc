"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type ClassOption = {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  coachName: string;
  scheduleText: string;
  spotsRemaining: number;
};

type CheckoutResponse = {
  url?: string;
  redirectUrl?: string;
  error?: string;
};

type Props = {
  studentId: string;
  parentId: string | null;
  studentNeedsPasswordSetup: boolean;
  termName: string;
  termDates: string;
  weeksRemaining: number;
  totalWeeks: number;
  localeHint: "en" | "zh";
  classes: ClassOption[];
};

export default function RegisterClassesClient({
  studentId,
  parentId,
  studentNeedsPasswordSetup,
  termName,
  termDates,
  weeksRemaining,
  totalWeeks,
  localeHint,
  classes,
}: Props) {
  const { t, locale, toggleLocale } = useI18n();
  const localeSyncedRef = useRef(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "etransfer" | "already_paid">("card");

  const resolvedLocale = locale === "zh" ? "zh" : localeHint;
  const selectedCount = selected.length;

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    if (localeSyncedRef.current) return;
    if (localeHint !== locale) {
      toggleLocale();
    }
    localeSyncedRef.current = true;
  }, [locale, localeHint, toggleLocale]);

  function tx(key: string, fallback: string): string {
    const value = t(key);
    return value === key ? fallback : value;
  }

  function toggleClass(classId: string) {
    setSelected((current) => {
      if (current.includes(classId)) {
        return current.filter((id) => id !== classId);
      }
      return [...current, classId];
    });
  }

  async function continueToPayment() {
    if (!selected.length) return;
    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === "card") {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classIds: selected,
            studentId,
            parentId,
            studentNeedsPasswordSetup,
            locale: resolvedLocale,
          }),
        });
        const payload = (await response.json()) as CheckoutResponse;
        if (!response.ok || !payload.url) {
          setError(payload.error || tx("registerPage.checkoutError", "Checkout could not start."));
          setLoading(false);
          return;
        }
        window.location.assign(payload.url);
        return;
      }

      if (paymentMethod === "etransfer") {
        const response = await fetch("/api/register/etransfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classIds: selected,
            studentId,
            parentId: parentId || undefined,
            locale: resolvedLocale,
          }),
        });
        const payload = (await response.json()) as CheckoutResponse;
        if (!response.ok || !payload.redirectUrl) {
          setError(payload.error || tx("registerPage.etransferError", "Could not reserve your spot."));
          setLoading(false);
          return;
        }
        window.location.assign(payload.redirectUrl);
        return;
      }

      const response = await fetch("/api/register/already-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classIds: selected,
          studentId,
          parentId: parentId || undefined,
          locale: resolvedLocale,
        }),
      });
      const payload = (await response.json()) as CheckoutResponse;
      if (!response.ok || !payload.redirectUrl) {
        setError(
          payload.error || tx("registerPage.approvalError", "Could not submit for approval.")
        );
        setLoading(false);
        return;
      }
      window.location.assign(payload.redirectUrl);
    } catch {
      setError(
        paymentMethod === "card"
          ? tx("registerPage.checkoutError", "Checkout could not start.")
          : paymentMethod === "etransfer"
            ? tx("registerPage.etransferError", "Could not reserve your spot.")
            : tx("registerPage.approvalError", "Could not submit for approval.")
      );
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.16em] text-charcoal/60 dark:text-navy-300">
        {tx("registerPage.stepClasses", "Step 2 of 2")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-white">
        {tx("registerPage.classesTitle", "Choose your classes")}
      </h1>
      <p className="mt-2 text-sm text-charcoal/70 dark:text-navy-300">
        {termName} - {termDates}
      </p>
      <div className="rounded-xl bg-gold-100 dark:bg-gold-900/30 border border-gold-300 dark:border-gold-700 p-4 mt-4 mb-4">
        <p className="font-bold text-navy-900 dark:text-white text-lg">
          {resolvedLocale === "zh" ? "Term 3 报名现已开放！" : "Term 3 Registration Is Now Open!"}
        </p>
        <p className="text-sm text-navy-700 dark:text-navy-200 mt-1">
          {termName} - {termDates}
        </p>
        <p className="text-sm text-navy-700 dark:text-navy-200">
          {resolvedLocale === "zh"
            ? `第三学期将于4月6日（周一）至6月28日（周日）进行。本学期剩余 ${weeksRemaining} 周（共 ${totalWeeks} 周）。`
            : `Term 3 runs Monday, April 6 to Sunday, June 28. ${weeksRemaining} of ${totalWeeks} weeks remaining.`}
        </p>
        {weeksRemaining < totalWeeks ? (
          <p className="text-sm text-navy-700 dark:text-navy-200 mt-1 font-medium">
            {resolvedLocale === "zh"
              ? "中途报名按剩余周数自动调整价格。"
              : "Pricing is prorated for the remaining weeks in the term."}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        {classes.map((classRow) => {
          const isSelected = selectedSet.has(classRow.id);
          return (
            <label
              key={classRow.id}
              className={`block rounded-xl border p-4 transition-colors cursor-pointer ${
                isSelected
                  ? "border-gold-400 bg-gold-50/70 dark:border-gold-400/80 dark:bg-gold-900/25"
                  : "border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-800/80"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleClass(classRow.id)}
                  className="mt-1 h-4 w-4 accent-gold-400 dark:accent-gold-300 rounded border-warm-300 dark:border-navy-400"
                />
                <div>
                  <p className="font-semibold text-navy-900 dark:text-navy-50">{classRow.name}</p>
                  <p className="text-sm text-charcoal/70 dark:text-navy-100">
                    {classRow.typeLabel} - {tx("registerPage.coach", "Coach")}: {classRow.coachName}
                  </p>
                  <p className="text-sm text-charcoal/70 dark:text-navy-100">{classRow.scheduleText}</p>
                  <p className="text-xs text-charcoal/60 dark:text-navy-200">
                    {tx("registerPage.spots", "Spots remaining")}: {classRow.spotsRemaining}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {classes.length === 0 ? (
        <p className="mt-5 text-sm text-charcoal/70 dark:text-navy-300">
          {tx("registerPage.noClasses", "No classes with open spots are available right now.")}
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-warm-100 dark:bg-navy-800 p-1">
        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            paymentMethod === "card"
              ? "bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm"
              : "text-charcoal/70 dark:text-navy-300"
          }`}
        >
          {tx("registerPage.payByCard", "Pay with Card")}
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("etransfer")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            paymentMethod === "etransfer"
              ? "bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm"
              : "text-charcoal/70 dark:text-navy-300"
          }`}
        >
          {tx("registerPage.payByEtransfer", "Pay by E-Transfer")}
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("already_paid")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            paymentMethod === "already_paid"
              ? "bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm"
              : "text-charcoal/70 dark:text-navy-300"
          }`}
        >
          {tx("registerPage.alreadyPaid", "Already Paid")}
        </button>
      </div>
      {paymentMethod === "etransfer" ? (
        <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
          {tx(
            "registerPage.etransferNote",
            "Your spot will be reserved for 24 hours while you send the e-transfer."
          )}
        </p>
      ) : null}
      {paymentMethod === "already_paid" ? (
        <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
          {tx(
            "registerPage.alreadyPaidNote",
            "Select your classes and submit. An admin will verify your payment and confirm your enrollment."
          )}
        </p>
      ) : null}

      <button
        type="button"
        disabled={loading || selectedCount === 0}
        onClick={() => {
          void continueToPayment();
        }}
        className="mt-6 w-full rounded-lg bg-navy-800 text-white py-2.5 font-semibold disabled:opacity-60"
      >
        {loading
          ? tx("registerPage.redirectingCheckout", "Redirecting to checkout...")
          : paymentMethod === "card"
            ? tx("registerPage.continuePayment", "Continue to Payment")
            : paymentMethod === "etransfer"
              ? tx("registerPage.reserveSpot", "Reserve My Spot")
              : tx("registerPage.submitForApproval", "Submit for Approval")}
      </button>
      <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
        {tx("registerPage.paymentCadOnly", "All payments are processed in CAD.")}
      </p>
    </div>
  );
}

