"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

type LegalPage = "privacy" | "terms" | "cancellation";

type LegalSubsection = {
  headingKey: string;
  paragraphKeys?: string[];
  bulletKeys?: string[];
};

type LegalSection = {
  headingKey: string;
  paragraphKeys?: string[];
  bulletKeys?: string[];
  subsections?: LegalSubsection[];
  showContactEmail?: boolean;
};

const pageConfig: Record<
  LegalPage,
  {
    titleKey: string;
    subtitleKey: string;
    sections: LegalSection[];
  }
> = {
  privacy: {
    titleKey: "legal.privacy.title",
    subtitleKey: "legal.privacy.subtitle",
    sections: [
      {
        headingKey: "legal.privacy.sections.collection.title",
        paragraphKeys: ["legal.privacy.sections.collection.body"],
        bulletKeys: [
          "legal.privacy.sections.collection.item1",
          "legal.privacy.sections.collection.item2",
          "legal.privacy.sections.collection.item3",
          "legal.privacy.sections.collection.item4",
          "legal.privacy.sections.collection.item5",
          "legal.privacy.sections.collection.item6",
        ],
      },
      {
        headingKey: "legal.privacy.sections.thirdParties.title",
        paragraphKeys: ["legal.privacy.sections.thirdParties.body"],
        subsections: [
          { headingKey: "legal.privacy.sections.thirdParties.stripeTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.stripeBody"] },
          { headingKey: "legal.privacy.sections.thirdParties.calendlyTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.calendlyBody"] },
          { headingKey: "legal.privacy.sections.thirdParties.supabaseTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.supabaseBody"] },
          { headingKey: "legal.privacy.sections.thirdParties.sanityTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.sanityBody"] },
          { headingKey: "legal.privacy.sections.thirdParties.resendTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.resendBody"] },
          { headingKey: "legal.privacy.sections.thirdParties.googleTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.googleBody"] },
          { headingKey: "legal.privacy.sections.thirdParties.metaTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.metaBody"] },
          { headingKey: "legal.privacy.sections.thirdParties.vercelTitle", paragraphKeys: ["legal.privacy.sections.thirdParties.vercelBody"] },
        ],
      },
      {
        headingKey: "legal.privacy.sections.usage.title",
        paragraphKeys: ["legal.privacy.sections.usage.body"],
        bulletKeys: [
          "legal.privacy.sections.usage.item1",
          "legal.privacy.sections.usage.item2",
          "legal.privacy.sections.usage.item3",
          "legal.privacy.sections.usage.item4",
          "legal.privacy.sections.usage.item5",
        ],
      },
      {
        headingKey: "legal.privacy.sections.retention.title",
        paragraphKeys: [
          "legal.privacy.sections.retention.body1",
          "legal.privacy.sections.retention.body2",
        ],
      },
      {
        headingKey: "legal.privacy.sections.cookies.title",
        paragraphKeys: [
          "legal.privacy.sections.cookies.body1",
          "legal.privacy.sections.cookies.body2",
        ],
      },
      {
        headingKey: "legal.privacy.sections.children.title",
        paragraphKeys: ["legal.privacy.sections.children.body"],
      },
      {
        headingKey: "legal.privacy.sections.rights.title",
        paragraphKeys: ["legal.privacy.sections.rights.body"],
        bulletKeys: [
          "legal.privacy.sections.rights.item1",
          "legal.privacy.sections.rights.item2",
          "legal.privacy.sections.rights.item3",
        ],
      },
      {
        headingKey: "legal.privacy.sections.contact.title",
        paragraphKeys: ["legal.privacy.sections.contact.body"],
        showContactEmail: true,
      },
    ],
  },
  terms: {
    titleKey: "legal.terms.title",
    subtitleKey: "legal.terms.subtitle",
    sections: [
      { headingKey: "legal.terms.sections.acceptance.title", paragraphKeys: ["legal.terms.sections.acceptance.body"] },
      { headingKey: "legal.terms.sections.services.title", paragraphKeys: ["legal.terms.sections.services.body"] },
      { headingKey: "legal.terms.sections.accounts.title", paragraphKeys: ["legal.terms.sections.accounts.body"] },
      { headingKey: "legal.terms.sections.payments.title", paragraphKeys: ["legal.terms.sections.payments.body"] },
      { headingKey: "legal.terms.sections.enrollment.title", paragraphKeys: ["legal.terms.sections.enrollment.body"] },
      {
        headingKey: "legal.terms.sections.conduct.title",
        paragraphKeys: ["legal.terms.sections.conduct.body"],
        bulletKeys: [
          "legal.terms.sections.conduct.item1",
          "legal.terms.sections.conduct.item2",
          "legal.terms.sections.conduct.item3",
          "legal.terms.sections.conduct.item4",
        ],
      },
      { headingKey: "legal.terms.sections.ip.title", paragraphKeys: ["legal.terms.sections.ip.body"] },
      { headingKey: "legal.terms.sections.liability.title", paragraphKeys: ["legal.terms.sections.liability.body"] },
      { headingKey: "legal.terms.sections.termination.title", paragraphKeys: ["legal.terms.sections.termination.body"] },
      { headingKey: "legal.terms.sections.law.title", paragraphKeys: ["legal.terms.sections.law.body"] },
      {
        headingKey: "legal.terms.sections.contact.title",
        paragraphKeys: ["legal.terms.sections.contact.body"],
        showContactEmail: true,
      },
    ],
  },
  cancellation: {
    titleKey: "legal.cancellation.title",
    subtitleKey: "legal.cancellation.subtitle",
    sections: [
      { headingKey: "legal.cancellation.sections.window.title", paragraphKeys: ["legal.cancellation.sections.window.body"] },
      { headingKey: "legal.cancellation.sections.noMidSemester.title", paragraphKeys: ["legal.cancellation.sections.noMidSemester.body"] },
      { headingKey: "legal.cancellation.sections.firstClass.title", paragraphKeys: ["legal.cancellation.sections.firstClass.body"] },
      { headingKey: "legal.cancellation.sections.request.title", paragraphKeys: ["legal.cancellation.sections.request.body"] },
      { headingKey: "legal.cancellation.sections.processing.title", paragraphKeys: ["legal.cancellation.sections.processing.body"] },
      {
        headingKey: "legal.cancellation.sections.contact.title",
        paragraphKeys: ["legal.cancellation.sections.contact.body"],
        showContactEmail: true,
      },
    ],
  },
};

function LegalBullets({ keys }: { keys: string[] }) {
  const { t } = useI18n();
  return (
    <ul className="mt-4 space-y-2">
      {keys.map((key) => (
        <li key={key} className="flex gap-3 text-charcoal/75 dark:text-navy-200 leading-relaxed">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-400" />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LegalPageClient({ page }: { page: LegalPage }) {
  const { t } = useI18n();
  const config = pageConfig[page];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-16 pt-32 md:pb-20 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
            {t("legal.lastUpdated")}
          </p>
          <h1 className="mb-5 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t(config.titleKey)}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/80 font-sans leading-relaxed">
            {t(config.subtitleKey)}
          </p>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {config.sections.map((section) => (
              <section key={section.headingKey}>
                <h2 className="mb-4 text-2xl font-bold text-navy-800 dark:text-white md:text-3xl">
                  {t(section.headingKey)}
                </h2>

                {section.paragraphKeys?.map((key) => (
                  <p
                    key={key}
                    className="mb-4 text-base leading-relaxed text-charcoal/75 dark:text-navy-200 md:text-lg"
                  >
                    {t(key)}
                  </p>
                ))}

                {section.bulletKeys ? <LegalBullets keys={section.bulletKeys} /> : null}

                {section.subsections?.map((subsection) => (
                  <div key={subsection.headingKey} className="mt-6 rounded-2xl border border-warm-200 bg-warm-50 p-5 dark:border-navy-700 dark:bg-navy-800/70">
                    <h3 className="mb-3 text-lg font-semibold text-navy-800 dark:text-white md:text-xl">
                      {t(subsection.headingKey)}
                    </h3>
                    {subsection.paragraphKeys?.map((key) => (
                      <p
                        key={key}
                        className="mb-3 text-base leading-relaxed text-charcoal/75 dark:text-navy-200"
                      >
                        {t(key)}
                      </p>
                    ))}
                    {subsection.bulletKeys ? <LegalBullets keys={subsection.bulletKeys} /> : null}
                  </div>
                ))}

                {section.showContactEmail ? (
                  <p className="mt-4 text-base font-medium text-navy-800 dark:text-white">
                    <a
                      href={`mailto:${t("legal.contactEmail")}`}
                      className="text-gold-600 underline underline-offset-4 transition-colors hover:text-gold-500"
                    >
                      {t("legal.contactEmail")}
                    </a>
                  </p>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-warm-200 bg-warm-50 p-6 text-sm text-charcoal/70 dark:border-navy-700 dark:bg-navy-800/70 dark:text-navy-300">
            <p>
              {t("legal.footerNote")}{" "}
              <Link
                href="/book"
                className="text-gold-600 underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                {t("nav.book")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
