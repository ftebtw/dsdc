"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { portalT } from "@/lib/portal/parent-i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  userRole: string;
};

export default function BugReportModal({ open, onClose, userEmail, userRole }: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [description, setDescription] = useState("");
  const [page, setPage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setPage(window.location.pathname + window.location.search);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit() {
    if (!description.trim()) return;
    setLoading(true);

    try {
      await fetch("/api/portal/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          page,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }

    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
          <p className="text-center text-lg font-semibold text-navy-800 dark:text-white mb-2">
            {t("portal.bugReport.thanksTitle", "Thank you.")}
          </p>
          <p className="text-center text-sm text-charcoal/70 dark:text-navy-300 mb-4">
            {t("portal.bugReport.thanksBody", "Your bug report has been submitted. We'll look into it.")}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setDescription("");
              onClose();
            }}
            className="w-full rounded-lg bg-navy-800 text-white py-2 text-sm font-medium dark:bg-gold-300 dark:text-navy-900"
          >
            {t("portal.common.close", "Close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy-800 dark:text-white">
            {t("portal.reportBug", "Report a Bug")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-warm-100 dark:hover:bg-navy-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.bugReport.pageUrl", "Page URL")}
            </label>
            <input
              type="text"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-500 bg-warm-50 dark:bg-navy-900 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.bugReport.prompt", "What happened? What did you expect?")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t("portal.bugReport.placeholder", "Describe the bug...")}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm resize-none"
            />
          </div>

          <p className="text-xs text-charcoal/50 dark:text-navy-400">
            {t("portal.bugReport.submittingAs", "Submitting as")} {userEmail} ({userRole})
          </p>

          <button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={loading || !description.trim()}
            className="w-full rounded-lg bg-navy-800 text-white py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200"
          >
            {loading
              ? t("portal.common.sending", "Sending...")
              : t("portal.bugReport.submit", "Submit Bug Report")}
          </button>
        </div>
      </div>
    </div>
  );
}
