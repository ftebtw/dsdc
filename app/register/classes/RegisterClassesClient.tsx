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
  error?: string;
};

type Props = {
  studentId: string;
  parentId: string | null;
  studentNeedsPasswordSetup: boolean;
  termName: string;
  termDates: string;
  localeHint: "en" | "zh";
  classes: ClassOption[];
};

export default function RegisterClassesClient({
  studentId,
  parentId,
  studentNeedsPasswordSetup,
  termName,
  termDates,
  localeHint,
  classes,
}: Props) {
  const { t, locale, toggleLocale } = useI18n();
  const localeSyncedRef = useRef(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch {
      setError(tx("registerPage.checkoutError", "Checkout could not start."));
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
        {termName} · {termDates}
      </p>

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
                    {classRow.typeLabel} · {tx("registerPage.coach", "Coach")}: {classRow.coachName}
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
          : tx("registerPage.continuePayment", "Continue to Payment")}
      </button>
      <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
        {tx("registerPage.paymentCadOnly", "All payments are processed in CAD.")}
      </p>
    </div>
  );
}
