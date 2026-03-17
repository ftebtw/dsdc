import enMessages from "@/messages/en.json";

const siteFaqMessages = ((enMessages.faq as { items?: Array<{ q: string; a: string }> } | undefined)?.items ??
  []) as Array<{ q: string; a: string }>;

export const siteFaqItems = siteFaqMessages.map((item) => ({
  question: item.q,
  answer: item.a,
}));
