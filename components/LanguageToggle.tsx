"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface LanguageToggleProps {
  variant?: "light" | "dark";
}

export default function LanguageToggle({ variant = "dark" }: LanguageToggleProps) {
  const { locale, toggleLocale } = useI18n();

  const isLight = variant === "light";
  const isEn = locale === "en";

  return (
    <button
      onClick={toggleLocale}
      className={`relative inline-flex items-center gap-2 pl-3.5 pr-1 py-2 min-h-[44px] text-sm font-medium rounded-full border
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400
                  ${
                    isLight
                      ? "border-white/40 text-white hover:border-white/60"
                      : "border-navy-200 text-navy-800 hover:border-navy-300 dark:border-navy-500 dark:text-navy-100 dark:hover:border-navy-400"
                  }`}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 shrink-0" />

      {/* Language options with sliding pill */}
      <div className="relative flex items-center">
        {/* Sliding highlight pill */}
        <motion.div
          className={`absolute top-0 bottom-0 rounded-full ${
            isLight ? "bg-white/20" : "bg-navy-800/10 dark:bg-white/10"
          }`}
          initial={false}
          animate={{
            left: isEn ? 0 : "calc(50% + 2px)",
            width: isEn ? "calc(50% - 2px)" : "calc(50% - 2px)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <span
          className={`relative z-10 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity duration-200 ${
            isEn ? "opacity-100" : "opacity-50"
          }`}
        >
          EN
        </span>
        <span
          className={`relative z-10 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity duration-200 ${
            !isEn ? "opacity-100" : "opacity-50"
          }`}
        >
          中文
        </span>
      </div>
    </button>
  );
}
