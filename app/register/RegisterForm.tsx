"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type RegistrationRole = "student" | "parent";

type RegisterResponse = {
  studentId: string;
  parentId: string | null;
  studentNeedsPasswordSetup: boolean;
  role: RegistrationRole;
  loginEmail: string;
  loginPassword: string;
  verificationSent?: boolean;
  verificationEmail?: string;
  error?: string;
};

function isLocale(value: string | null): value is "en" | "zh" {
  return value === "en" || value === "zh";
}

export default function RegisterForm() {
  const { t, locale, toggleLocale } = useI18n();
  const params = useSearchParams();
  const localeSyncedRef = useRef(false);

  const [role, setRole] = useState<RegistrationRole>("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const langParam = params.get("lang");
  const resolvedLocale = useMemo<"en" | "zh">(() => {
    if (isLocale(langParam)) return langParam;
    return locale === "zh" ? "zh" : "en";
  }, [langParam, locale]);

  useEffect(() => {
    if (!isLocale(langParam)) return;
    if (localeSyncedRef.current) return;
    if (langParam !== locale) {
      toggleLocale();
    }
    localeSyncedRef.current = true;
  }, [langParam, locale, toggleLocale]);

  useEffect(() => {
    try {
      const savedCode = localStorage.getItem("dsdc-referral-code");
      if (savedCode) {
        setReferralCode(savedCode);
      }
    } catch (error) {
      console.error("[register] error:", error);
      // ignore localStorage access errors
    }
  }, []);

  function tx(key: string, fallback: string): string {
    const value = t(key);
    return value === key ? fallback : value;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Vancouver";
    const payload =
      role === "student"
        ? {
            role,
            firstName,
            lastName,
            email,
            password,
            locale: resolvedLocale,
            timezone,
            referralCode: referralCode || undefined,
          }
        : {
            role,
            parentFirstName,
            parentLastName,
            parentEmail,
            parentPassword,
            locale: resolvedLocale,
            timezone,
            referralCode: referralCode || undefined,
          };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as RegisterResponse;
      if (!response.ok || data.error) {
        setError(data.error || tx("registerPage.error", "Registration failed. Please try again."));
        setLoading(false);
        return;
      }

      // Show verification screen - do not sign in before email confirmation.
      if (data.verificationSent) {
        setRegisteredEmail(data.verificationEmail || data.loginEmail);
        setShowVerifyEmail(true);
        setLoading(false);
        return;
      }

      // Fallback for unexpected API response shape.
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.loginEmail,
        password: data.loginPassword,
      });

      if (signInError) {
        const signInMessage = signInError.message.toLowerCase();
        if (
          signInMessage.includes("email not confirmed") ||
          signInMessage.includes("email_not_confirmed")
        ) {
          setRegisteredEmail(data.loginEmail);
          setShowVerifyEmail(true);
          setLoading(false);
          return;
        }

        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.role === "parent") {
        window.location.href = "/portal/parent/dashboard";
        return;
      }

      const nextParams = new URLSearchParams();
      nextParams.set("student", data.studentId);
      nextParams.set("lang", resolvedLocale);
      if (data.parentId) nextParams.set("parent", data.parentId);
      if (data.studentNeedsPasswordSetup) nextParams.set("setup", "1");
      window.location.href = `/register/classes?${nextParams.toString()}`;
    } catch (error) {
      console.error("[register] error:", error);
      setError(tx("registerPage.error", "Registration failed. Please try again."));
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  if (showVerifyEmail) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border-2 border-warm-300 dark:border-navy-600 shadow-lg bg-white dark:bg-navy-800 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 dark:bg-gold-900/30">
            <svg className="h-8 w-8 text-gold-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">
            {tx("registerPage.checkEmail", "Check Your Email")}
          </h2>

          <p className="text-charcoal/70 dark:text-navy-300 mb-2">
            {tx("registerPage.verifyMessage", "We sent a verification link to:")}
          </p>

          <p className="font-semibold text-navy-900 dark:text-white mb-4">{registeredEmail}</p>

          <p className="text-sm text-charcoal/60 dark:text-navy-400 mb-6">
            {tx(
              "registerPage.verifyInstructions",
              "Click the link in the email to verify your account and continue with registration. Check your spam or junk folder if you don't see it."
            )}
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setShowVerifyEmail(false);
                setError(null);
              }}
              className="w-full rounded-lg border-2 border-warm-300 dark:border-navy-600 py-2.5 text-sm font-medium text-navy-700 dark:text-navy-200 hover:bg-warm-50 dark:hover:bg-navy-700 transition-colors"
            >
              {tx("registerPage.backToRegister", "<- Back to registration")}
            </button>

            <Link
              href="/portal/login"
              className="block w-full rounded-lg bg-navy-800 text-white py-2.5 text-sm font-semibold text-center hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200 transition-colors"
            >
              {tx("registerPage.alreadyVerified", "Already verified? Sign in")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-warm-200 dark:border-navy-600 bg-white/95 dark:bg-navy-800/95 shadow-xl dark:shadow-black/30 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.16em] text-charcoal/60 dark:text-navy-300">
        {tx("registerPage.badge", "Quick Enrollment")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-white">
        {tx("registerPage.title", "Create your account")}
      </h1>
      <p className="mt-2 text-sm text-charcoal/70 dark:text-navy-300">
        {tx("registerPage.subtitle", "Create an account in under a minute, then choose classes and pay securely.")}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-warm-100 dark:bg-navy-800 p-1">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            role === "student"
              ? "bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm"
              : "text-charcoal/70 dark:text-navy-300"
          }`}
        >
          {tx("registerPage.studentRole", "I'm a Student")}
        </button>
        <button
          type="button"
          onClick={() => setRole("parent")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            role === "parent"
              ? "bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm"
              : "text-charcoal/70 dark:text-navy-300"
          }`}
        >
          {tx("registerPage.parentRole", "I'm a Parent")}
        </button>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        {role === "student" ? (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                  {tx("registerPage.firstName", "First name")}
                </span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                  {tx("registerPage.lastName", "Last name")}
                </span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.email", "Email")}
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.password", "Password")}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
              />
            </label>
          </>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                  {tx("registerPage.firstName", "First name")}
                </span>
                <input
                  type="text"
                  required
                  value={parentFirstName}
                  onChange={(event) => setParentFirstName(event.target.value)}
                  className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                  {tx("registerPage.lastName", "Last name")}
                </span>
                <input
                  type="text"
                  required
                  value={parentLastName}
                  onChange={(event) => setParentLastName(event.target.value)}
                  className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.parentEmail", "Email")}
              </span>
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.parentPassword", "Password")}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={parentPassword}
                onChange={(event) => setParentPassword(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400 px-3 py-2"
              />
            </label>
            <p className="text-sm text-charcoal/60 dark:text-navy-300 bg-warm-50 dark:bg-navy-800 rounded-lg px-3 py-2">
              {tx(
                "registerPage.linkStudentLater",
                "After creating your account, you can link your student using an invite code from the portal."
              )}
            </p>
          </>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy-800 text-white py-2.5 font-semibold disabled:opacity-60"
        >
          {loading
            ? tx("registerPage.creating", "Creating account...")
            : role === "parent"
              ? tx("registerPage.createParentAccount", "Create Parent Account")
              : tx("registerPage.continue", "Continue to class selection")}
        </button>
      </form>

      <p className="mt-4 text-xs text-charcoal/60 dark:text-navy-300">
        {tx("registerPage.portalHint", "Already have an account?")}{" "}
        <Link href="/portal/login" className="underline text-navy-700 dark:text-navy-200">
          {tx("registerPage.portalLogin", "Portal Login")}
        </Link>
      </p>
    </div>
  );
}

