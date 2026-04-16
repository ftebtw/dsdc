"use client";

import { useEffect } from "react";
import { trackContact } from "@/lib/analytics";

export default function GlobalContactTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const mailtoLink = target.closest('a[href^="mailto:"]');
      if (!(mailtoLink instanceof HTMLAnchorElement)) return;

      trackContact({
        content_name: "Email Link",
        content_category: "Contact",
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
