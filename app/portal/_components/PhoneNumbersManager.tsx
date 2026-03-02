"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { portalT } from "@/lib/portal/parent-i18n";

type PhoneEntry = {
  id: string;
  label: string;
  phone_number: string;
};

export default function PhoneNumbersManager({
  initialPhones,
}: {
  initialPhones: PhoneEntry[];
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  const [phones, setPhones] = useState<PhoneEntry[]>(initialPhones);
  const [newLabel, setNewLabel] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAdd() {
    if (!newNumber.trim()) return;
    setLoading(true);
    setError(null);

    const response = await fetch("/api/portal/phone-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newLabel.trim() || "Phone",
        phoneNumber: newNumber.trim(),
      }),
    });
    const data = (await response.json()) as { error?: string; phoneNumber?: PhoneEntry };
    setLoading(false);

    if (!response.ok || !data.phoneNumber) {
      setError(data.error || "Failed to add phone number.");
      return;
    }

    setPhones((prev) => [...prev, data.phoneNumber!]);
    setNewLabel("");
    setNewNumber("");
  }

  async function onDelete(id: string) {
    const response = await fetch("/api/portal/phone-numbers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      setPhones((prev) => prev.filter((phone) => phone.id !== id));
    }
  }

  return (
    <div className="space-y-3">
      {phones.length === 0 ? (
        <p className="text-sm text-charcoal/60 dark:text-navy-400">
          {t("portal.settings.noPhones", "No phone numbers added.")}
        </p>
      ) : (
        <div className="space-y-2">
          {phones.map((phone) => (
            <div
              key={phone.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 px-3 py-2"
            >
              <div className="text-sm">
                {phone.label ? (
                  <span className="font-medium text-navy-800 dark:text-white mr-2">
                    {phone.label}:
                  </span>
                ) : null}
                <span className="text-charcoal/80 dark:text-navy-200">{phone.phone_number}</span>
              </div>
              <button
                onClick={() => onDelete(phone.id)}
                className="text-red-500 text-xs hover:underline shrink-0"
              >
                {t("portal.common.remove", "Remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
            {t("portal.settings.phoneLabel", "Label")}
          </label>
          <input
            placeholder={t("portal.settings.phoneLabelPlaceholder", "e.g. Mom, Dad, Home")}
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
            {t("portal.settings.phoneNumber", "Phone Number")}
          </label>
          <input
            type="tel"
            placeholder="604-555-1234"
            value={newNumber}
            onChange={(event) => setNewNumber(event.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            void onAdd();
          }}
          disabled={loading || !newNumber.trim()}
          className="rounded-lg bg-navy-800 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200 shrink-0"
        >
          {loading ? t("portal.settings.saving", "Saving...") : t("portal.settings.addPhone", "Add")}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
