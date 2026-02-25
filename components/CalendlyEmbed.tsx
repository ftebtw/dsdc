"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

export default function CalendlyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const loadCalendlyScript = () => {
      if (typeof window !== "undefined" && (window as any).Calendly) {
        setLoaded(true);
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${CALENDLY_SCRIPT_SRC}"]`
      );

      if (existingScript) {
        if ((window as any).Calendly) {
          setLoaded(true);
          return;
        }
        const onLoad = () => setLoaded(true);
        existingScript.addEventListener("load", onLoad, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = CALENDLY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => setLoaded(true);
      document.body.appendChild(script);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadCalendlyScript();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {!loaded ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900"
          style={{ minWidth: "320px", height: "700px" }}
        >
          <Calendar className="h-10 w-10 text-gold-400 animate-pulse mb-3" />
          <p className="text-sm text-charcoal/60 dark:text-navy-400">Loading calendar...</p>
        </div>
      ) : null}
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/rebecca-dsdc"
        style={{ minWidth: "320px", height: "700px" }}
      />
    </div>
  );
}
