"use client";

import { useEffect } from "react";
import { trackConversion, trackMetaStandardEvent } from "@/lib/analytics";

// Listens for Calendly's postMessage event_scheduled and fires a real
// conversion event on actual booking. Replaces the old on-page-load gtag
// fire that was counting every visitor as a conversion.
//
// Calendly's embedded widget emits window postMessage events with an e.data
// object of shape { event: "calendly.event_scheduled", payload: {...} }.
// We only trust postMessages where the origin is calendly.com.
export default function BookConversionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function isCalendlyEvent(event: MessageEvent): boolean {
      if (!event.origin || !event.origin.includes("calendly.com")) return false;
      if (!event.data || typeof event.data !== "object") return false;
      const data = event.data as { event?: unknown };
      return typeof data.event === "string" && data.event.startsWith("calendly.");
    }

    function handleMessage(event: MessageEvent) {
      if (!isCalendlyEvent(event)) return;
      const data = event.data as { event: string };
      if (data.event === "calendly.event_scheduled") {
        trackConversion({
          source: "calendly_booking",
          value: 1,
          currency: "CAD",
        });
        trackMetaStandardEvent("Lead", {
          content_name: "Calendly Consultation Booked",
          content_category: "Consultation",
          source: "calendly",
        });
        trackMetaStandardEvent("Schedule", {
          content_name: "Consultation Scheduled via Calendly",
        });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
