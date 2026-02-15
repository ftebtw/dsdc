"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  /** When true, use light colors (e.g. over hero video) */
  variant?: "light" | "dark";
}

export default function ThemeToggle({ variant = "dark" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLightVariant = variant === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center p-2.5 min-h-[44px] min-w-[44px] rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-transparent ${
        isLightVariant
          ? "border-white/40 text-white hover:bg-white/10"
          : "border-warm-300 text-charcoal hover:bg-warm-100 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-700"
      }`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
