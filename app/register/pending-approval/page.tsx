export const dynamic = 'force-dynamic';

import Link from "next/link";

function resolveLocale(value: string | undefined): "en" | "zh" {
  return value === "zh" ? "zh" : "en";
}

export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = resolveLocale(params.lang);
  const copy =
    locale === "zh"
      ? {
          title: "\u62a5\u540d\u5df2\u63d0\u4ea4\uff01",
          subtitle:
            "\u60a8\u7684\u9009\u8bfe\u7533\u8bf7\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u7ba1\u7406\u5458\u5ba1\u6838\u3002\u6211\u4eec\u5c06\u6838\u5b9e\u60a8\u7684\u4ed8\u6b3e\u5e76\u786e\u8ba4\u60a8\u7684\u62a5\u540d\u3002\u5ba1\u6838\u901a\u8fc7\u540e\u60a8\u5c06\u6536\u5230\u90ae\u4ef6\u901a\u77e5\u3002",
          home: "\u8fd4\u56de\u9996\u9875",
          portal: "\u524d\u5f80\u95e8\u6237",
        }
      : {
          title: "Enrollment Submitted!",
          subtitle:
            "Your class selection has been submitted for admin approval. We'll verify your payment and confirm your enrollment shortly. You'll receive an email once approved.",
          home: "Back to Home",
          portal: "Go to Portal",
        };

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 pt-28 pb-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">{copy.title}</h1>
          <p className="mt-3 text-sm text-charcoal/70 dark:text-navy-300">{copy.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="px-4 py-2 rounded-lg border border-warm-300 dark:border-navy-600">
              {copy.home}
            </Link>
            <Link href="/portal" className="px-4 py-2 rounded-lg bg-navy-800 text-white">
              {copy.portal}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
