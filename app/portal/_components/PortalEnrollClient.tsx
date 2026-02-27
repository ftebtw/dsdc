"use client";

import { useMemo, useState } from "react";

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

type Props = {
  studentId: string;
  parentId: string | null;
  termName: string;
  weeksRemaining: number;
  totalWeeks: number;
  classes: ClassOption[];
  locale: "en" | "zh";
  returnTo: string;
};

type CheckoutResponse = {
  url?: string;
  redirectUrl?: string;
  error?: string;
};

const copy = {
  en: {
    selectClasses: "Select Classes",
    alreadyEnrolled: "Already enrolled",
    spots: "spots left",
    paymentMethod: "Payment Method",
    card: "Credit or Debit Card",
    etransfer: "E-Transfer",
    alreadyPaid: "I already paid (admin verifies)",
    enroll: "Enroll and Pay",
    enrollEtransfer: "Reserve Spot (E-Transfer)",
    enrollAlreadyPaid: "Link Classes (Pending Approval)",
    noClasses: "No classes available for enrollment this term.",
    processing: "Processing...",
    prorated: "Prorated for remaining weeks",
    selectAtLeast: "Select at least one class to continue.",
    genericError: "Something went wrong. Please try again.",
    coach: "Coach",
  },
  zh: {
    selectClasses: "选择课程",
    alreadyEnrolled: "已报名",
    spots: "剩余名额",
    paymentMethod: "付款方式",
    card: "信用卡或借记卡",
    etransfer: "E-Transfer 转账",
    alreadyPaid: "已付款（管理员验证）",
    enroll: "报名并付款",
    enrollEtransfer: "预留名额（E-Transfer）",
    enrollAlreadyPaid: "关联课程（等待审批）",
    noClasses: "本学期暂无可报名课程。",
    processing: "处理中...",
    prorated: "按剩余周数计费",
    selectAtLeast: "请至少选择一门课程后继续。",
    genericError: "发生错误，请重试。",
    coach: "教练",
  },
} as const;

export default function PortalEnrollClient({
  studentId,
  parentId,
  termName,
  weeksRemaining,
  totalWeeks,
  classes,
  locale,
  returnTo,
}: Props) {
  const c = copy[locale] || copy.en;
  const [selected, setSelected] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "etransfer" | "already_paid">("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectableClasses = useMemo(
    () => classes.filter((classRow) => !classRow.alreadyEnrolled && classRow.spotsRemaining > 0),
    [classes]
  );

  function toggleClass(classId: string) {
    setSelected((current) =>
      current.includes(classId)
        ? current.filter((id) => id !== classId)
        : [...current, classId]
    );
  }

  async function submit() {
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
            parentId: parentId || undefined,
            locale,
          }),
        });
        const payload = (await response.json()) as CheckoutResponse;
        if (!response.ok || !payload.url) {
          setError(payload.error || c.genericError);
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
            locale,
          }),
        });
        const payload = (await response.json()) as CheckoutResponse;
        if (!response.ok || !payload.redirectUrl) {
          setError(payload.error || c.genericError);
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
          locale,
        }),
      });

      const payload = (await response.json()) as CheckoutResponse;
      if (!response.ok) {
        setError(payload.error || c.genericError);
        setLoading(false);
        return;
      }
      window.location.assign(returnTo);
      return;
    } catch (error) {
      console.error("[portal-enroll] error:", error);
      setError(c.genericError);
    }

    setLoading(false);
  }

  if (classes.length === 0) {
    return <p className="text-sm text-charcoal/70 dark:text-navy-300">{c.noClasses}</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-charcoal/70 dark:text-navy-300">{termName}</p>

      {weeksRemaining < totalWeeks ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {c.prorated}: {weeksRemaining}/{totalWeeks}
        </p>
      ) : null}

      {classes.some((classRow) => classRow.alreadyEnrolled) ? (
        <div className="space-y-2">
          {classes
            .filter((classRow) => classRow.alreadyEnrolled)
            .map((classRow) => (
              <div
                key={classRow.id}
                className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-4 py-3 dark:border-green-700 dark:bg-green-900/20"
              >
                <div>
                  <p className="font-semibold text-navy-800 dark:text-white">{classRow.name}</p>
                  <p className="text-xs text-charcoal/60 dark:text-navy-300">
                    {classRow.typeLabel} - {classRow.scheduleText}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {c.alreadyEnrolled}
                </span>
              </div>
            ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <h3 className="font-semibold text-navy-800 dark:text-white">{c.selectClasses}</h3>
        {selectableClasses.map((classRow) => {
          const isSelected = selected.includes(classRow.id);
          return (
            <button
              key={classRow.id}
              type="button"
              onClick={() => toggleClass(classRow.id)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                isSelected
                  ? "border-gold-400 bg-gold-50 ring-2 ring-gold-300 dark:bg-gold-900/20"
                  : "border-warm-200 bg-white hover:border-gold-300 dark:border-navy-600 dark:bg-navy-800"
              }`}
            >
              <p className="font-semibold text-navy-800 dark:text-white">{classRow.name}</p>
              <p className="mt-0.5 text-xs text-charcoal/60 dark:text-navy-300">
                {classRow.typeLabel} - {classRow.scheduleText}
              </p>
              <p className="mt-0.5 text-xs text-charcoal/60 dark:text-navy-300">
                {c.coach}: {classRow.coachName} - {classRow.spotsRemaining} {c.spots}
              </p>
            </button>
          );
        })}
      </div>

      {selected.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-navy-800 dark:text-white">{c.paymentMethod}</h3>
          <div className="flex flex-wrap gap-3">
            {(["card", "etransfer", "already_paid"] as const).map((method) => {
              const label =
                method === "card"
                  ? c.card
                  : method === "etransfer"
                    ? c.etransfer
                    : c.alreadyPaid;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    paymentMethod === method
                      ? "border-gold-400 bg-gold-50 ring-2 ring-gold-300 dark:bg-gold-900/20"
                      : "border-warm-200 dark:border-navy-600"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        disabled={loading || selected.length === 0}
        onClick={() => {
          void submit();
        }}
        className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-300 px-6 py-3 font-bold text-navy-900 shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? c.processing
          : selected.length === 0
            ? c.selectAtLeast
            : paymentMethod === "card"
              ? c.enroll
              : paymentMethod === "etransfer"
                ? c.enrollEtransfer
                : c.enrollAlreadyPaid}
      </button>
    </div>
  );
}
