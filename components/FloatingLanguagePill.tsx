"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function FloatingLanguagePill() {
  const { locale, toggleLocale } = useI18n();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Never render this on portal/studio/auth routes.
  const hidden =
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/studio") ||
    pathname?.startsWith("/auth");

  useEffect(() => {
    const seen = localStorage.getItem("dsdc-lang-pill-seen");
    if (seen) {
      setDismissed(true);
      return;
    }

    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;
  if (dismissed) return null;

  const handleClick = () => {
    // Safety net: do not use public locale toggle on portal routes.
    if (window.location.pathname.startsWith("/portal")) return;

    toggleLocale();
    localStorage.setItem("dsdc-lang-pill-seen", "1");
    setTimeout(() => setDismissed(true), 2000);
  };

  const handleDismiss = () => {
    localStorage.setItem("dsdc-lang-pill-seen", "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: [0, -6, 0],
            scale: 1,
          }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 },
            y: {
              duration: 2,
              repeat: 3,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 0.5,
            },
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
        >
          <motion.button
            onClick={handleDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/20 text-charcoal/60 hover:bg-charcoal/30 hover:text-charcoal/80 dark:bg-white/15 dark:text-white/50 dark:hover:bg-white/25 dark:hover:text-white/80 text-xs transition-colors"
            aria-label="Dismiss"
          >
            x
          </motion.button>

          <button
            onClick={handleClick}
            className="flex items-center gap-2 rounded-full bg-navy-800 dark:bg-navy-700 text-white px-4 py-2.5 shadow-lg hover:bg-navy-700 dark:hover:bg-navy-600 transition-colors duration-200 ring-2 ring-gold-300/40"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {locale === "en" ? "\u5207\u6362\u4e2d\u6587" : "Switch to English"}
            </span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
