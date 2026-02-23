"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type PendingClass = {
  id: string;
  name: string;
  typeLabel: string;
  scheduleText: string;
};

type Props = {
  localeHint: "en" | "zh";
  state: "pending" | "sent" | "expired";
  token: string;
  studentId: string;
  classes: PendingClass[];
  totalAmountCad: number;
  etransferEmail: string;
  expiresAt: string | null;
  sentAt: string | null;
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function EtransferPendingClient({
  localeHint,
  state: initialState,
  token,
  classes,
  totalAmountCad,
  etransferEmail,
  expiresAt,
  sentAt,
}: Props) {
  const { t, locale, toggleLocale } = useI18n();
  const localeSyncedRef = useRef(false);
  const [state, setState] = useState<"pending" | "sent" | "expired">(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>("00:00:00");

  useEffect(() => {
    if (localeSyncedRef.current) return;
    if (localeHint !== locale) toggleLocale();
    localeSyncedRef.current = true;
  }, [locale, localeHint, toggleLocale]);

  useEffect(() => {
    if (state !== "pending" || !expiresAt) return;
    const expiresMs = new Date(expiresAt).getTime();
    const tick = () => {
      const remaining = expiresMs - Date.now();
      if (remaining <= 0) {
        setCountdown("00:00:00");
        setState("expired");
        return;
      }
      setCountdown(formatCountdown(remaining));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, state]);

  const amountLabel = useMemo(
    () =>
      new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalAmountCad),
    [locale, totalAmountCad]
  );

  function tx(key: string, fallback: string) {
    const value = t(key);
    return value === key ? fallback : value;
  }

  async function markSent() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/register/etransfer-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || tx("registerPage.etransferError", "Could not confirm your transfer."));
        setLoading(false);
        return;
      }
      setState("sent");
      setLoading(false);
    } catch {
      setError(tx("registerPage.etransferError", "Could not confirm your transfer."));
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6 sm:p-8">
      {state === "pending" ? (
        <>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
            {tx("registerPage.etransferPending.title", "Your spot is reserved!")}
          </h1>
          <div className="mt-4 rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-800/70 p-4">
            <p className="text-sm font-semibold text-navy-900 dark:text-white">
              {tx("registerPage.etransferPending.instructions", "Send your Interac e-Transfer to:")}
            </p>
            <p className="mt-1 text-sm text-charcoal/80 dark:text-navy-200">{etransferEmail}</p>
            <p className="mt-2 text-sm text-charcoal/80 dark:text-navy-200">
              {tx("registerPage.etransferPending.amount", "Total amount")}: {amountLabel}
            </p>
            <p className="mt-2 text-xs text-charcoal/70 dark:text-navy-300">
              {tx(
                "registerPage.etransferPending.messageNote",
                "Please include your full name and 'DSDC Enrollment' in the transfer message."
              )}
            </p>
          </div>
          <p className="mt-3 text-sm text-charcoal/75 dark:text-navy-200">
            {locale === 'zh'
              ? '\u7535\u5b50\u8f6c\u8d26\u8bf4\u660e\u5df2\u53d1\u9001\u81f3\u60a8\u7684\u90ae\u7bb1\u3002'
              : 'E-transfer instructions have been sent to your email.'}
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            {locale === 'zh'
              ? '\u6ca1\u6536\u5230\u90ae\u4ef6\uff1f\u8bf7\u68c0\u67e5\u60a8\u7684\u5783\u573e\u90ae\u4ef6/\u5783\u573e\u7bb1\u6587\u4ef6\u5939\u3002'
              : "Don't see the email? Please check your spam or junk folder."}
          </p>

          <div className="mt-5 space-y-2">
            {classes.map((classRow) => (
              <div
                key={classRow.id}
                className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-800/60 p-3"
              >
                <p className="font-semibold text-navy-900 dark:text-white">{classRow.name}</p>
                <p className="text-sm text-charcoal/70 dark:text-navy-200">{classRow.typeLabel}</p>
                <p className="text-xs text-charcoal/65 dark:text-navy-300">{classRow.scheduleText}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-charcoal/70 dark:text-navy-300">
            {tx("registerPage.etransferPending.timeRemaining", "Time remaining")}:{" "}
            <span className="font-semibold text-navy-900 dark:text-white">{countdown}</span>
          </p>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              void markSent();
            }}
            className="mt-5 w-full rounded-lg bg-navy-800 text-white py-2.5 font-semibold disabled:opacity-60"
          >
            {loading
              ? tx("registerPage.etransferPending.markingSent", "Submitting...")
              : tx("registerPage.etransferPending.markSent", "I Have Sent the E-Transfer")}
          </button>
          <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
            {tx(
              "registerPage.etransferPending.expiryNote",
              "If you don't confirm within 24 hours, your spot reservation will expire."
            )}
          </p>
        </>
      ) : null}

      {state === "sent" ? (
        <>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">
            {tx("registerPage.etransferPending.sentTitle", "We've received your notification!")}
          </h1>
          <p className="mt-3 text-sm text-charcoal/75 dark:text-navy-200">
            {tx(
              "registerPage.etransferPending.sentBody",
              "Your enrollment is pending admin confirmation. You'll receive an email once your e-transfer is verified."
            )}
          </p>
          <p className="mt-2 text-sm text-charcoal/75 dark:text-navy-200">
            {tx(
              "registerPage.etransferPending.moreInfo",
              "If we need more information (e.g. we can't locate the e-transfer), we'll reach out via email or phone."
            )}
          </p>
          {sentAt ? (
            <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-400">
              {tx("registerPage.etransferPending.sentAt", "Marked as sent at")}:{" "}
              {new Date(sentAt).toLocaleString()}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-charcoal/75 dark:text-navy-200">education.dsdc@gmail.com</p>
        </>
      ) : null}

      {state === "expired" ? (
        <>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
            {tx("registerPage.etransferPending.expired", "Your reservation has expired.")}
          </h1>
          <a
            href="/register"
            className="mt-5 inline-flex rounded-lg bg-navy-800 text-white px-4 py-2 font-semibold"
          >
            {tx("registerPage.etransferPending.registerAgain", "Register again")}
          </a>
        </>
      ) : null}
    </div>
  );
}
