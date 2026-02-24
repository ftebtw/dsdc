"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function FloatingLanguagePill() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, toggleLocale } = useI18n();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isPortal = pathname?.startsWith("/portal") ?? false;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wasDismissed = localStorage.getItem("dsdc-lang-pill-dismissed");
      if (wasDismissed === "true") {
        setDismissed(true);
        return;
      }
    }
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  async function handleClick() {
    const nextLocale = locale === "en" ? "zh" : "en";
    toggleLocale();

    if (isPortal) {
      try {
        await fetch("/api/portal/profile/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
        });
      } catch {
        // Locale is already toggled locally; ignore network failure here.
      }
      router.refresh();
    }

    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("dsdc-lang-pill-dismissed", "true");
    }
  }

  if (pathname === "/portal/login") return null;
  if (pathname?.startsWith("/studio")) return null;
  if (dismissed || !visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        void handleClick();
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-navy-800/15 dark:border-white/15 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-navy-800 dark:text-navy-100 shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
      aria-label={locale === "en" ? "Switch to Chinese" : "Switch to English"}
    >
      <Globe className="h-4 w-4 text-navy-600 dark:text-navy-300" />
      {locale === "en" ? "\u5207\u6362\u4e2d\u6587" : "Switch to English"}
    </button>
  );
}
