"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

type RegistrationRole = "student" | "parent";

type RegisterResponse = {
  loginEmail: string;
  loginPassword: string;
  studentId: string;
  parentId: string | null;
  studentNeedsPasswordSetup: boolean;
  role: RegistrationRole;
  error?: string;
};

function isLocale(value: string | null): value is "en" | "zh" {
  return value === "en" || value === "zh";
}

export default function RegisterForm() {
  const { t, locale, toggleLocale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const localeSyncedRef = useRef(false);

  const [role, setRole] = useState<RegistrationRole>("student");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentDisplayName, setParentDisplayName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
            displayName,
            email,
            password,
            locale: resolvedLocale,
            timezone,
          }
        : {
            role,
            parentDisplayName,
            parentEmail,
            parentPassword,
            studentName,
            studentEmail,
            locale: resolvedLocale,
            timezone,
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

      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.loginEmail,
        password: data.loginPassword,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const nextParams = new URLSearchParams();
      nextParams.set("student", data.studentId);
      nextParams.set("lang", resolvedLocale);
      if (data.parentId) nextParams.set("parent", data.parentId);
      if (data.studentNeedsPasswordSetup) nextParams.set("setup", "1");
      router.push(`/register/classes?${nextParams.toString()}`);
      router.refresh();
    } catch {
      setError(tx("registerPage.error", "Registration failed. Please try again."));
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6 sm:p-8">
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
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.displayName", "Display name")}
              </span>
              <input
                type="text"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.email", "Email")}
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
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
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
              />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.parentName", "Parent display name")}
              </span>
              <input
                type="text"
                required
                value={parentDisplayName}
                onChange={(event) => setParentDisplayName(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.parentEmail", "Parent email")}
              </span>
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.parentPassword", "Parent password")}
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={parentPassword}
                onChange={(event) => setParentPassword(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.studentName", "Student name")}
              </span>
              <input
                type="text"
                required
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1 text-navy-700 dark:text-navy-200">
                {tx("registerPage.studentEmail", "Student email")}
              </span>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
              />
            </label>
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
