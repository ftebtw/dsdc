"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  Star,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";
import AnimatedSection from "@/components/AnimatedSection";
import CalendlyEmbed from "@/components/CalendlyEmbed";
import BookConversionTracker from "@/components/BookConversionTracker";

export default function BookPage() {
  const { t, messages } = useI18n();
  const expectItems = ((messages.bookPage as { expectItems?: string[] } | undefined)?.expectItems ??
    []) as string[];

  return (
    <>
      {/* Listens for Calendly bookings and fires real conversion events
          (gtag + Meta Pixel Lead/Schedule) only on actual bookings. */}
      <BookConversionTracker />

      {/* Compact hero — small so the Calendly widget is near the top */}
      <section className="relative pt-28 pb-10 md:pt-32 md:pb-12 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-gold-300/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-gold-200"
          >
            <Star className="h-3.5 w-3.5 fill-gold-300 text-gold-300" />
            100% WSC qualification rate since 2020 · 1,000+ students coached
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Book a Free 15-Minute Consultation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg text-white/85 font-sans max-w-2xl mx-auto leading-relaxed"
          >
            A consultation with one an expert from our team. No commitment, no sales pressure.
          </motion.p>
        </div>
      </section>

      {/* Primary booking section — two-column on desktop, Calendly-first on mobile */}
      <section className="py-10 md:py-14 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 items-start">
            {/* Left: What happens on the call — on mobile, appears BELOW Calendly */}
            <AnimatedSection className="order-2 lg:order-1">
              <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-6 md:p-8 lg:sticky lg:top-24">
                <h2 className="text-xl md:text-2xl font-bold text-navy-800 dark:text-white mb-4 font-serif">
                  What happens on the call
                </h2>
                <p className="mb-5 text-sm md:text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
                  A friendly 15-minute Zoom call. We ask about your child, recommend a class, and leave the
                  decision entirely to you.
                </p>
                <ul className="space-y-3 mb-6">
                  {expectItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-500 dark:text-gold-400" />
                      <span className="text-sm text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-warm-200 dark:border-navy-700 text-xs text-charcoal/60 dark:text-navy-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold-500 dark:text-gold-400" />
                    <span className="font-sans">15 minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-gold-500 dark:text-gold-400" />
                    <span className="font-sans">Via Zoom</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Calendly widget — on mobile, appears FIRST so users can book without scrolling */}
            <AnimatedSection delay={0.1} className="order-1 lg:order-2">
              <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold-400/10 dark:bg-gold-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-navy-800 dark:text-white font-serif">
                    Pick a time that works for you
                  </h2>
                </div>
                <div className="rounded-xl overflow-hidden border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900">
                  <CalendlyEmbed />
                </div>
                <p className="mt-4 text-center text-xs text-charcoal/55 dark:text-navy-400 font-sans">
                  Your info stays private. We only use it to contact you about this consultation.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Proof numbers strip */}
      <section className="py-10 md:py-14 bg-white dark:bg-navy-900/30 border-y border-warm-200 dark:border-navy-700">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">2017</div>
              <div className="mt-1.5 text-xs md:text-sm text-charcoal/70 dark:text-navy-200 font-sans">
                Founded in Vancouver
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">1,000+</div>
              <div className="mt-1.5 text-xs md:text-sm text-charcoal/70 dark:text-navy-200 font-sans">
                Students coached
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">100%</div>
              <div className="mt-1.5 text-xs md:text-sm text-charcoal/70 dark:text-navy-200 font-sans">
                WSC qualification since 2020
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">20+</div>
              <div className="mt-1.5 text-xs md:text-sm text-charcoal/70 dark:text-navy-200 font-sans">
                Expert coaches
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing transparency callout */}
      <section className="py-10 md:py-14 bg-warm-100 dark:bg-navy-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800 md:p-8">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="flex-1">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300">
                  Pricing, published openly
                </div>
                <h2 className="mb-2 text-xl md:text-2xl font-bold text-navy-800 dark:text-white font-serif">
                  $30-50 CAD per hour, no hidden fees
                </h2>
                <p className="text-sm md:text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
                  Unlike most Canadian debate academies, we publish our full pricing online. No sales calls required
                  to see costs.
                </p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 rounded-lg bg-navy-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-950 dark:hover:bg-gold-200"
              >
                See full pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — the exact booking blockers */}
      <section className="py-10 md:py-14 bg-white dark:bg-navy-900/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="mb-8 text-center text-2xl md:text-3xl font-bold text-navy-800 dark:text-white font-serif">
              Common questions before you book
            </h2>
          </AnimatedSection>
          <div className="space-y-3">
            {[
              {
                q: "Is this really free?",
                a: "Yes - completely. The 15-minute consultation is free, there's no credit card needed, and we never bill you for the call itself. If DSDC isn't the right fit for your child, we'll tell you honestly.",
              },
              {
                q: "Will you pressure me to sign up?",
                a: "No. The call is a conversation, not a sales pitch. We ask about your child's grade, confidence, and goals, recommend a class level, and leave the decision entirely to you. Many families book the consultation and don't enroll until weeks later.",
              },
              {
                q: "Can I reschedule if something comes up?",
                a: "Yes. The confirmation email has a reschedule link. Change the time as many times as you need.",
              },
              {
                q: "What does my child need to join if we decide to enroll?",
                a: "A computer with webcam and microphone, a reliable internet connection, Zoom (free download), and a quiet place to speak. That's it.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                  <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                    {item.q}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-charcoal/60 dark:text-navy-300 font-sans">
            More answers on our{" "}
            <Link href="/faq" className="underline underline-offset-4 hover:text-gold-500 dark:text-gold-300">
              full FAQ page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Demoted fallback form */}
      <section className="py-10 md:py-14 bg-warm-100 dark:bg-navy-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-2xl md:text-3xl font-bold text-navy-800 dark:text-white font-serif">
                Can&apos;t find a time that works?
              </h2>
              <p className="text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed max-w-xl mx-auto">
                Send us a message instead. We reply within 24 hours.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <ContactForm />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
