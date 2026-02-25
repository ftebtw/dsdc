"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Message = { type: "success" | "error"; text: string };

type Props = {
  displayName: string;
  email: string;
  timezone: string;
};

export default function AccountSettingsForm({ displayName, email }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [newName, setNewName] = useState(displayName);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState<Message | null>(null);

  const [newEmail, setNewEmail] = useState(email);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<Message | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  async function handleNameUpdate() {
    if (!newName.trim() || newName.trim() === displayName) return;
    setNameLoading(true);
    setNameMessage(null);

    const res = await fetch("/api/portal/profile/display-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: newName.trim() }),
    });

    setNameLoading(false);
    if (res.ok) {
      setNameMessage({ type: "success", text: "Display name updated." });
      router.refresh();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setNameMessage({ type: "error", text: data.error || "Failed to update." });
    }
  }

  async function handleEmailUpdate() {
    if (!newEmail.trim() || newEmail.trim().toLowerCase() === email.toLowerCase()) return;
    setEmailLoading(true);
    setEmailMessage(null);

    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });

    setEmailLoading(false);
    if (error) {
      setEmailMessage({ type: "error", text: error.message });
    } else {
      setEmailMessage({
        type: "success",
        text: "Verification email sent to your new address. Please check your inbox to confirm.",
      });
    }
  }

  async function handlePasswordUpdate() {
    if (!newPassword || newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError) {
      setPasswordLoading(false);
      setPasswordMessage({ type: "error", text: "Current password is incorrect." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setPasswordLoading(false);
    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  const msgStyle = (msg: Message) =>
    msg.type === "success"
      ? "text-sm text-green-700 dark:text-green-400"
      : "text-sm text-red-600";

  return (
    <div className="space-y-8 max-w-lg">
      <section>
        <h3 className="font-semibold text-navy-800 dark:text-white mb-3">Display Name</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
            maxLength={120}
          />
          <button
            type="button"
            onClick={() => {
              void handleNameUpdate();
            }}
            disabled={nameLoading || newName.trim() === displayName}
            className="rounded-lg bg-navy-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200"
          >
            {nameLoading ? "Saving..." : "Save"}
          </button>
        </div>
        {nameMessage ? <p className={`mt-1 ${msgStyle(nameMessage)}`}>{nameMessage.text}</p> : null}
      </section>

      <hr className="border-warm-200 dark:border-navy-700" />

      <section>
        <h3 className="font-semibold text-navy-800 dark:text-white mb-1">Email Address</h3>
        <p className="text-xs text-charcoal/60 dark:text-navy-400 mb-3">
          Changing your email will send a verification link to the new address.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              void handleEmailUpdate();
            }}
            disabled={emailLoading || newEmail.trim().toLowerCase() === email.toLowerCase()}
            className="rounded-lg bg-navy-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200"
          >
            {emailLoading ? "Sending..." : "Update"}
          </button>
        </div>
        {emailMessage ? <p className={`mt-1 ${msgStyle(emailMessage)}`}>{emailMessage.text}</p> : null}
      </section>

      <hr className="border-warm-200 dark:border-navy-700" />

      <section>
        <h3 className="font-semibold text-navy-800 dark:text-white mb-3">Change Password</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              void handlePasswordUpdate();
            }}
            disabled={passwordLoading || !currentPassword || !newPassword}
            className="rounded-lg bg-navy-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200"
          >
            {passwordLoading ? "Updating..." : "Change Password"}
          </button>
        </div>
        {passwordMessage ? <p className={`mt-1 ${msgStyle(passwordMessage)}`}>{passwordMessage.text}</p> : null}
      </section>
    </div>
  );
}
