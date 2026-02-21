import { defineField, defineType } from "sanity";
import { localizedStringField, localizedTextField } from "./helpers";

export const pricingPageContent = defineType({
  name: "pricingPageContent",
  title: "Pricing Page Content",
  type: "document",
  liveEdit: true,
  fields: [
    defineField({
      name: "pricingPage",
      title: "Pricing Page",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("noHiddenFees", "No Hidden Fees Tag"),
        localizedStringField("groupClasses", "Group Classes Label"),
        localizedStringField("currency", "Currency Label"),
        defineField({
          name: "currencyOptions",
          title: "Currency Options",
          type: "object",
          fields: [
            localizedStringField("CAD", "CAD Label"),
            localizedStringField("USD", "USD Label"),
            localizedStringField("RMB", "RMB Label"),
          ],
        }),
        localizedTextField("currencyDisclaimer", "Currency Disclaimer"),
        localizedStringField("currencyFallback", "Fallback Message"),
        localizedStringField("privateCoaching", "Private Coaching Heading"),
        localizedTextField("privateNote", "Private Coaching Note"),
        localizedStringField("cta", "CTA"),
        localizedTextField("ctaSubtext", "CTA Subtext"),
        localizedStringField("noviceIntermediate", "Novice/Intermediate Title"),
        localizedStringField("noviceIntermediateDesc", "Novice/Intermediate Description"),
        localizedStringField("publicSpeaking", "Public Speaking Title"),
        localizedStringField("publicSpeakingDesc", "Public Speaking Description"),
        localizedStringField("wsc", "WSC Title"),
        localizedStringField("wscDesc", "WSC Description"),
        localizedStringField("advanced", "Advanced Title"),
        localizedStringField("advancedDesc", "Advanced Description"),
        localizedStringField("private", "Private Label"),
        localizedStringField("privateDesc", "Private Description"),
        localizedStringField("perHour", "Per Hour Label"),
        localizedStringField("varies", "Varies Label"),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Pricing Page Content" };
    },
  },
});
