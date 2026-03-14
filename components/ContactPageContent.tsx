"use client";

import ContactForm from "@/components/ContactForm";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ContactPageContent() {
  const { t } = useI18n();

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
          <h1 className="mb-5 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t("contactPage.title")}
          </h1>
          <p className="mx-auto max-w-3xl text-lg font-sans leading-relaxed text-white/80">
            {t("contactPage.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 dark:bg-gold-500/20">
                  <MessageCircle className="h-5 w-5 text-gold-500 dark:text-gold-400" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-navy-800 dark:text-white">
                  {t("contactPage.cardTitle")}
                </h2>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200">
                  {t("contactPage.cardBody")}
                </p>
              </div>

              <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-gold-500 dark:text-gold-400" />
                    <div>
                      <h3 className="font-semibold text-navy-800 dark:text-white">
                        {t("contactPage.emailTitle")}
                      </h3>
                      <a
                        href="mailto:education.dsdc@gmail.com"
                        className="text-charcoal/75 underline underline-offset-4 hover:text-navy-800 dark:text-navy-200 dark:hover:text-gold-300"
                      >
                        education.dsdc@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 h-5 w-5 text-gold-500 dark:text-gold-400" />
                    <div>
                      <h3 className="font-semibold text-navy-800 dark:text-white">
                        {t("contactPage.responseTitle")}
                      </h3>
                      <p className="text-charcoal/75 dark:text-navy-200">
                        {t("contactPage.responseBody")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
