"use client";

import { useState } from "react";
import { portalT } from "@/lib/portal/parent-i18n";

type Step = "email" | "code" | "success";

export default function ParentLinkStudentForm({ locale = "en" }: { locale?: "en" | "zh" }) {
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [step, setStep] = useState<Step>("email");
  const [studentEmail, setStudentEmail] = useState("");
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    if (!studentEmail.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/link-student/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail: studentEmail.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        studentName?: string;
        maskedEmail?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error || t("portal.linkStudent.sendCodeError", "Could not send verification code."));
        setLoading(false);
        return;
      }

      setStudentName(data.studentName || studentEmail);
      setMaskedEmail(data.maskedEmail || studentEmail);
      setStep("code");
    } catch (error) {
      console.error("[parent-link] error:", error);
      setError(t("portal.linkStudent.genericError", "Something went wrong. Please try again."));
    }

    setLoading(false);
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/link-student/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), studentEmail: studentEmail.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        studentName?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error || t("portal.linkStudent.verifyFailed", "Verification failed."));
        setLoading(false);
        return;
      }

      setStudentName(data.studentName || studentEmail);
      setStep("success");
    } catch (error) {
      console.error("[parent-link] error:", error);
      setError(t("portal.linkStudent.genericError", "Something went wrong. Please try again."));
    }

    setLoading(false);
  }

  if (step === "success") {
    return (
      <div className="rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-2xl">
          ✓
        </div>
        <p className="font-semibold text-green-800 dark:text-green-200">
          {t("portal.common.successLinked", "Successfully linked to")} {studentName}!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold text-sm"
        >
          {t("portal.common.refreshPage", "Refresh Page")}
        </button>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} className="max-w-md space-y-3">
        <div className="rounded-lg bg-warm-50 dark:bg-navy-800 px-3 py-2 text-sm">
          <p className="text-charcoal/70 dark:text-navy-300">
            {t("portal.linkStudent.codeSentPrefix", "A 6-digit verification code has been sent to")}{" "}
            <span className="font-semibold text-navy-800 dark:text-white">{maskedEmail}</span>.
          </p>
          <p className="text-charcoal/60 dark:text-navy-400 mt-1">
            {t(
              "portal.linkStudent.codeSentHelp",
              "Ask your student to check their email and share the code with you."
            )}
          </p>
        </div>

        <label className="block">
          <span className="text-sm text-navy-700 dark:text-navy-200">
            {t("portal.linkStudent.enterCode", "Enter verification code")}
          </span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 font-mono tracking-[0.25em] text-center text-lg"
            placeholder="000000"
          />
        </label>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-60"
          >
            {loading
              ? t("portal.linkStudent.verifyingButton", "Verifying...")
              : t("portal.linkStudent.verifyButton", "Verify & Link")}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="px-3 py-2 rounded-lg border border-warm-300 dark:border-navy-600 text-sm"
          >
            {t("portal.common.back", "Back")}
          </button>
        </div>

        <p className="text-xs text-charcoal/50 dark:text-navy-400">
          {t("portal.linkStudent.codeExpires", "Code expires in 30 minutes.")}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="ml-1 underline"
          >
            {t("portal.linkStudent.resendCode", "Resend code")}
          </button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="max-w-md space-y-3">
      <label className="block">
        <span className="text-sm text-navy-700 dark:text-navy-200">
          {t("portal.linkStudent.studentEmail", "Student's email address")}
        </span>
        <input
          type="email"
          required
          value={studentEmail}
          onChange={(event) => setStudentEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          placeholder="student@example.com"
        />
      </label>

      <p className="text-xs text-charcoal/60 dark:text-navy-400">
        {t(
          "portal.linkStudent.emailInstructions",
          "A verification code will be sent to this email. The student must share the code with you to confirm the link."
        )}
      </p>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-60"
      >
        {loading
          ? t("portal.common.sending", "Sending...")
          : t("portal.linkStudent.sendCodeButton", "Send Verification Code")}
      </button>
    </form>
  );
}
