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
  const [switching, setSwitching] = useState(false);
  const isPortal = pathname?.startsWith("/portal") ?? false;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  async function handleClick() {
    if (switching) return;
    const nextLocale = locale === "en" ? "zh" : "en";
    toggleLocale();

    if (isPortal) {
      setSwitching(true);
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
      setSwitching(false);
    }
  }

  if (pathname === "/portal/login") return null;
  if (pathname?.startsWith("/studio")) return null;
  if (!visible) return null;

  return (
    <button
      type="button"
      disabled={switching}
      onClick={() => {
        void handleClick();
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-navy-800/15 dark:border-white/15 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-navy-800 dark:text-navy-100 shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-gold-400"
      aria-label={locale === "en" ? "Switch to Chinese" : "Switch to English"}
    >
      <Globe className="h-4 w-4 text-navy-600 dark:text-navy-300" />
      {locale === "en" ? "\u5207\u6362\u4e2d\u6587" : "Switch to English"}
    </button>
  );
}
