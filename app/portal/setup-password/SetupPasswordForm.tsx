"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SetupPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-warm-100 dark:bg-navy-800 px-3 py-2 text-charcoal/60 dark:text-navy-400"
        />
      </div>
      <div>
        <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Create Password</label>
        <input
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Confirm Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-navy-800 text-white py-2.5 font-semibold disabled:opacity-60"
      >
        {loading ? "Setting up..." : "Set Password & Enter Portal"}
      </button>
    </form>
  );
}
