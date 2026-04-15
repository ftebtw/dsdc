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

// Google Ads conversion tag for consultation bookings and lead form submissions.
// This is the same send_to used in the old on-page-load script in app/book/page.tsx,
// now fired only on actual conversion (Calendly schedule or contact form submit).
const GOOGLE_ADS_CONVERSION_ID = "AW-390603959/uChFCKeu14ccELfJoLoB";

// Fire a real conversion event. Use this when the user actually completes a
// high-intent action (books a consultation, submits the contact form).
// Fires:
//   - gtag conversion (Google Ads bidding signal)
//   - fbq Lead (Meta Pixel standard event, optimizable by Meta Ads Manager)
//   - optional second fbq event (e.g. "Schedule" when the action is a booking)
export function trackConversion(options: {
  source: "calendly_booking" | "contact_form" | "other";
  value?: number;
  currency?: string;
  additionalFbqEvent?: "Schedule" | "CompleteRegistration";
}) {
  const { source, value = 1, currency = "CAD", additionalFbqEvent } = options;

  if (typeof window === "undefined") return;

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
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

  if (w.fbq) {
    w.fbq("track", "Lead", { value, currency, content_name: source });
    if (additionalFbqEvent) {
      w.fbq("track", additionalFbqEvent, { value, currency, content_name: source });
    }
  }
}
