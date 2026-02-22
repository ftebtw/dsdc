import Link from "next/link";
import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function resolveLocale(value: string | undefined): "en" | "zh" {
  return value === "zh" ? "zh" : "en";
}

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; lang?: string }>;
}) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/register");
  }

  const locale = resolveLocale(params.lang);
  const copy =
    locale === "zh"
      ? {
          title: "报名已确认！",
          subtitle: "您的付款已完成。课程详情已发送至您的邮箱。",
          home: "返回首页",
          portal: "前往学生门户",
          heading: "已报名课程",
          empty: "我们正在处理您的报名，请稍后刷新。",
        }
      : {
          title: "You're enrolled!",
          subtitle: "Payment is complete. Class details have been sent to your email.",
          home: "Back to Home",
          portal: "Go to Portal",
          heading: "Enrolled classes",
          empty: "We are finalizing your enrollment details. Please refresh shortly.",
        };

  const sessionId = params.session_id;
  if (!sessionId) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 pt-28 pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6">
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white">{copy.title}</h1>
            <p className="mt-3 text-sm text-charcoal/70 dark:text-navy-300">{copy.empty}</p>
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

  let items: Array<{ name: string; amount: number | null }> = [];
  try {
    const stripe = getStripeClient();
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      expand: ["data.price.product"],
      limit: 30,
    });
    items = lineItems.data.map((item) => ({
      name:
        item.description ||
        (typeof item.price?.product !== "string" && item.price?.product && !item.price.product.deleted
          ? item.price.product.name
          : "Class"),
      amount: item.amount_total ?? null,
    }));
  } catch {
    items = [];
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 pt-28 pb-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">{copy.title}</h1>
          <p className="mt-3 text-sm text-charcoal/70 dark:text-navy-300">{copy.subtitle}</p>

          <h2 className="mt-6 text-lg font-semibold text-navy-900 dark:text-white">{copy.heading}</h2>
          {items.length === 0 ? (
            <p className="mt-2 text-sm text-charcoal/70 dark:text-navy-300">{copy.empty}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {items.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  className="rounded-lg border border-warm-200 dark:border-navy-700 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-navy-900 dark:text-white">{item.name}</span>
                  {typeof item.amount === "number" ? (
                    <span className="ml-2 text-charcoal/70 dark:text-navy-300">
                      {(item.amount / 100).toLocaleString(locale === "zh" ? "zh-CN" : "en-CA", {
                        style: "currency",
                        currency: "CAD",
                      })}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

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
