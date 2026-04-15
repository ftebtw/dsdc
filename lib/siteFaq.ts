import { faqEntries } from "@/lib/faqEntries";

// Short-form FAQ items (question + answer) used in aggregated FAQPage schema
// on the homepage and /faq index. The rich per-question body content lives in
// faqEntries.ts and is rendered by /faq/[slug] pages.
export const siteFaqItems = faqEntries.map((entry) => ({
  question: entry.question,
  answer: entry.answer,
}));
