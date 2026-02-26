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
  alreadyEnrolled: boolean;
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
  classPrices: Record<string, number>;
  localeHint: "en" | "zh";
  classes: ClassOption[];
  enrolledClassIds: string[];
};

export default function RegisterClassesClient({
  studentId,
  parentId,
  studentNeedsPasswordSetup,
  termName,
  termDates,
  weeksRemaining,
  totalWeeks,
  classPrices,
  localeHint,
  classes,
  enrolledClassIds,
}: Props) {
  const { t, locale, toggleLocale } = useI18n();
  const localeSyncedRef = useRef(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingStudent, setExistingStudent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "etransfer" | "already_paid">("card");

  const resolvedLocale = locale === "zh" ? "zh" : localeHint;
  const enrolledSet = useMemo(() => new Set(enrolledClassIds), [enrolledClassIds]);
  const hasExistingEnrollments = enrolledClassIds.length > 0;
  const selectableClasses = useMemo(
    () => classes.filter((classRow) => !enrolledSet.has(classRow.id)),
    [classes, enrolledSet]
  );
  const selectableClassIds = useMemo(
    () => new Set(selectableClasses.map((classRow) => classRow.id)),
    [selectableClasses]
  );
  const selectedCount = selected.length;

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    if (localeSyncedRef.current) return;
    if (localeHint !== locale) {
      toggleLocale();
    }
    localeSyncedRef.current = true;
  }, [locale, localeHint, toggleLocale]);

  useEffect(() => {
    setSelected((current) => current.filter((classId) => selectableClassIds.has(classId)));
  }, [selectableClassIds]);

  function tx(key: string, fallback: string): string {
    const value = t(key);
    return value === key ? fallback : value;
  }

  function toggleClass(classId: string) {
    if (!selectableClassIds.has(classId)) return;
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
        {existingStudent
          ? tx("registerPage.selectCurrentClasses", "Select your current classes")
          : tx("registerPage.classesTitle", "Choose your classes")}
      </h1>
      <p className="mt-2 text-sm text-charcoal/70 dark:text-navy-300">
        {termName} - {termDates}
      </p>
      {existingStudent ? (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 mt-4 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {tx(
              "registerPage.existingStudentInfo",
              "Select the classes you're currently attending. An admin will verify your enrollment and activate your portal access. No payment is required."
            )}
          </p>
        </div>
      ) : (
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
      )}

      <div className="mt-4 rounded-xl border-2 border-dashed border-warm-300 dark:border-navy-600 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={existingStudent}
            onChange={(event) => {
              setExistingStudent(event.target.checked);
              setSelected([]);
              if (event.target.checked) {
                setPaymentMethod("already_paid");
              } else {
                setPaymentMethod("card");
              }
            }}
            className="mt-1 h-4 w-4 accent-gold-400 dark:accent-gold-300 rounded"
          />
          <div>
            <p className="font-semibold text-navy-900 dark:text-white">
              {tx(
                "registerPage.existingStudentToggle",
                "I'm already enrolled in classes this term"
              )}
            </p>
            <p className="text-sm text-charcoal/60 dark:text-navy-400 mt-0.5">
              {tx(
                "registerPage.existingStudentToggleHint",
                "I've already paid - I just need to link my account to my current classes."
              )}
            </p>
          </div>
        </label>
      </div>

      <div className="mt-6 space-y-3">
        {classes.map((classRow) => {
          const isEnrolled = enrolledSet.has(classRow.id);
          const isSelected = selectedSet.has(classRow.id);
          if (isEnrolled) {
            return (
              <div
                key={classRow.id}
                className="block rounded-xl border border-green-300 dark:border-green-700 bg-green-50/70 dark:bg-green-900/20 p-4 opacity-80"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg
                      className="h-5 w-5 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy-900 dark:text-navy-50">{classRow.name}</p>
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                        {tx("registerPage.alreadyEnrolled", "✓ Already Enrolled")}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal/70 dark:text-navy-100">
                      {classRow.typeLabel} - {tx("registerPage.coach", "Coach")}: {classRow.coachName}
                    </p>
                    <p className="text-sm text-charcoal/70 dark:text-navy-100">{classRow.scheduleText}</p>
                  </div>
                </div>
              </div>
            );
          }

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
                  <span className="text-sm font-semibold text-navy-800 dark:text-white">
                    ${(classPrices[classRow.id] ?? 0).toLocaleString()} CAD
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {classes.length === 0 && !hasExistingEnrollments ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {tx("registerPage.noClasses", "No classes with open spots are available right now.")}
          </p>
          <a
            href="/book"
            className="block w-full rounded-lg bg-gold-300 text-navy-900 py-2.5 text-center font-semibold hover:bg-gold-200 transition-colors"
          >
            {tx("registerPage.bookConsult", "Book a Free Consultation")}
          </a>
          <p className="text-xs text-charcoal/60 dark:text-navy-400 text-center">
            {tx(
              "registerPage.consultNote",
              "We'll help you find the right class or set up private coaching."
            )}
          </p>
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div className="mt-4 p-3 rounded-lg bg-warm-100 dark:bg-navy-800 text-sm">
          <span className="font-medium text-navy-800 dark:text-white">
            {resolvedLocale === "zh" ? "合计：" : "Total: "}
            $
            {selected
              .reduce((sum, classId) => sum + (classPrices[classId] ?? 0), 0)
              .toLocaleString()}{" "}
            CAD
          </span>
          {weeksRemaining < totalWeeks ? (
            <span className="text-xs text-charcoal/60 dark:text-navy-400 ml-2">
              {resolvedLocale === "zh" ? "（按剩余周数调整）" : "(prorated)"}
            </span>
          ) : null}
        </div>
      ) : null}

      {classes.length > 0 && selectableClasses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg font-medium text-navy-800 dark:text-white mb-2">
            {tx(
              "registerPage.allEnrolled",
              "All set! Your student is already enrolled in all available classes."
            )}
          </p>
          <p className="text-sm text-charcoal/60 dark:text-navy-400 mb-4">
            {tx("registerPage.allEnrolledHint", "You can manage enrollments in the portal.")}
          </p>
          <a
            href="/portal"
            className="inline-flex rounded-lg bg-navy-800 text-white px-6 py-2.5 font-semibold"
          >
            {tx("registerPage.goToPortal", "Go to Portal")}
          </a>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {selectableClasses.length > 0 ? (
        <>
          {!existingStudent ? (
            <>
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
            </>
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
              : existingStudent
                ? tx("registerPage.linkMyClasses", "Link My Classes")
                : paymentMethod === "card"
                ? tx("registerPage.continuePayment", "Continue to Payment")
                : paymentMethod === "etransfer"
                  ? tx("registerPage.reserveSpot", "Reserve My Spot")
                  : tx("registerPage.submitForApproval", "Submit for Approval")}
          </button>
          <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
            {tx("registerPage.paymentCadOnly", "All payments are processed in CAD.")}
          </p>

          <div className="mt-4 space-y-2">
            <div className="my-2 flex items-center gap-3">
              <div className="flex-1 border-t border-warm-200 dark:border-navy-700" />
              <span className="text-xs uppercase tracking-wider text-charcoal/50 dark:text-navy-400">
                {tx("registerPage.or", "or")}
              </span>
              <div className="flex-1 border-t border-warm-200 dark:border-navy-700" />
            </div>

            {hasExistingEnrollments ? (
              <a
                href="/portal"
                className="block w-full rounded-lg border-2 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 py-2.5 text-center font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                {tx("registerPage.skipToPortal", "Continue to Portal - I'm all set")}
              </a>
            ) : null}

            <a
              href="/book"
              className="block w-full rounded-lg border-2 border-warm-300 dark:border-navy-600 text-navy-700 dark:text-navy-200 py-2.5 text-center font-medium hover:bg-warm-50 dark:hover:bg-navy-800 transition-colors"
            >
              {tx("registerPage.privateOnly", "I only need private coaching → Book a consultation")}
            </a>
          </div>
        </>
      ) : null}
    </div>
  );
}

