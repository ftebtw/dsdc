export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>
) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }

  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", eventName, params);
  }
}

type MetaStandardEvent =
  | "Lead"
  | "ViewContent"
  | "Contact"
  | "Schedule"
  | "CompleteRegistration";

export function trackMetaStandardEvent(
  eventName: MetaStandardEvent,
  params?: Record<string, string | number>
) {
  if (typeof window === "undefined") return false;

  const w = window as unknown as {
    fbq?: (...args: unknown[]) => void;
  };

  if (!w.fbq) return false;

  w.fbq("track", eventName, params);
  return true;
}

export function trackViewContent(params: Record<string, string | number>) {
  return trackMetaStandardEvent("ViewContent", params);
}

export function trackContact(params: Record<string, string | number>) {
  return trackMetaStandardEvent("Contact", params);
}

// Google Ads conversion tag for real consultation bookings and form leads.
const GOOGLE_ADS_CONVERSION_ID = "AW-390603959/uChFCKeu14ccELfJoLoB";

// Fire a real Google Ads conversion event. Meta standard events should be
// tracked separately so each page can send the exact payload required.
export function trackConversion(options: {
  source: "calendly_booking" | "contact_form" | "other";
  value?: number;
  currency?: string;
}) {
  const { source, value = 1, currency = "CAD" } = options;

  if (typeof window === "undefined") return;

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
  };

  if (w.gtag) {
    w.gtag("event", "conversion", {
      send_to: GOOGLE_ADS_CONVERSION_ID,
      value,
      currency,
    });
    w.gtag("event", "generate_lead", {
      value,
      currency,
      source,
    });
  }
}
