"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  Award,
  Users,
  DollarSign,
  ShieldCheck,
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
      {/* Listens for real Calendly bookings and fires gtag + Meta Pixel Lead
          events only on actual conversions. Replaces the old on-page-load
          fire that counted every visitor as a conversion. */}
      <BookConversionTracker />

      {/* Hero */}
      <section className="relative pt-32 pb-14 md:pt-40 md:pb-16 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Proof pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-300/40 bg-gold-300/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-gold-200"
          >
            <Star className="h-3.5 w-3.5 fill-gold-300 text-gold-300" />
            100% WSC qualification rate since 2020 · 1,000+ students coached
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Book a Free 15-Minute Consultation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/85 font-sans max-w-2xl mx-auto leading-relaxed"
          >
            Find the right online debate or public speaking class for your child. Taught live by coaches from
            Canada&apos;s National Debate Team. No commitment, no sales pressure.
          </motion.p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-warm-200 bg-warm-50 py-6 dark:border-navy-700 dark:bg-navy-900/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div className="flex items-center justify-center gap-3">
              <Award className="h-5 w-5 text-gold-500 dark:text-gold-400 shrink-0" />
              <span className="text-sm font-semibold text-navy-800 dark:text-navy-100 font-sans">
                Canadian National Debate Team coaches
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <ShieldCheck className="h-5 w-5 text-gold-500 dark:text-gold-400 shrink-0" />
              <span className="text-sm font-semibold text-navy-800 dark:text-navy-100 font-sans">
                100% WSC qualification rate since 2020
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <DollarSign className="h-5 w-5 text-gold-500 dark:text-gold-400 shrink-0" />
              <span className="text-sm font-semibold text-navy-800 dark:text-navy-100 font-sans">
                Transparent pricing, no sales calls
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What to expect — moved ABOVE Calendly so bouncing users see it first */}
      <section className="py-12 md:py-16 bg-white dark:bg-navy-900/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-3 text-2xl md:text-3xl font-bold text-navy-800 dark:text-white font-serif">
                What happens on the call
              </h2>
              <p className="mb-8 text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
                A friendly 15-minute Zoom call. No sales pitch, no credit card, no commitment. We&apos;d rather place
                your child in the right class than push them into the wrong one.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <ul className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
              {expectItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 dark:border-navy-700 dark:bg-navy-800"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-500 dark:text-gold-400" />
                  <span className="text-sm md:text-base text-charcoal/80 dark:text-navy-200 font-sans leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      {/* Calendly — primary CTA */}
      <section className="py-12 md:py-16 bg-warm-100 dark:bg-navy-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-5 sm:p-8 md:p-10">
              <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-400/10 dark:bg-gold-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gold-500 dark:text-gold-400" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-navy-800 dark:text-white font-serif">
                    Pick a time that works for you
                  </h2>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-charcoal/65 dark:text-navy-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gold-500 dark:text-gold-400" />
                    <span className="font-sans">15 minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-gold-500 dark:text-gold-400" />
                    <span className="font-sans">Via Zoom</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900">
                <CalendlyEmbed />
              </div>

              <p className="mt-5 text-center text-xs text-charcoal/55 dark:text-navy-400 font-sans">
                Your info stays private. We only use it to contact you about this consultation - we never sell data
                or run follow-up marketing calls.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Proof numbers strip */}
      <section className="py-12 md:py-16 bg-white dark:bg-navy-900/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="mb-10 text-center text-2xl md:text-3xl font-bold text-navy-800 dark:text-white font-serif">
              Why families book with DSDC
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">2017</div>
              <div className="mt-2 text-sm text-charcoal/70 dark:text-navy-200 font-sans">
                Founded in Vancouver
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">1,000+</div>
              <div className="mt-2 text-sm text-charcoal/70 dark:text-navy-200 font-sans">Students coached</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">100%</div>
              <div className="mt-2 text-sm text-charcoal/70 dark:text-navy-200 font-sans">
                WSC qualification rate since 2020
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold-500 dark:text-gold-400">20+</div>
              <div className="mt-2 text-sm text-charcoal/70 dark:text-navy-200 font-sans">
                Coaches from UBC, SFU, National Team
              </div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-warm-200 bg-warm-50 p-5 dark:border-navy-700 dark:bg-navy-800">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-gold-500 dark:text-gold-400" />
              <div>
                <div className="text-sm font-bold text-navy-800 dark:text-white">
                  Small groups, personalized feedback
                </div>
                <p className="mt-1 text-sm text-charcoal/65 dark:text-navy-300 font-sans leading-relaxed">
                  Classes of 8-12 students with written feedback every week, not a lecture hall.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-warm-200 bg-warm-50 p-5 dark:border-navy-700 dark:bg-navy-800">
              <Award className="mt-0.5 h-5 w-5 shrink-0 text-gold-500 dark:text-gold-400" />
              <div>
                <div className="text-sm font-bold text-navy-800 dark:text-white">
                  Canadian National Team coaching
                </div>
                <p className="mt-1 text-sm text-charcoal/65 dark:text-navy-300 font-sans leading-relaxed">
                  Our coaches include Canadian National Debate Team members and top Canadian university debaters.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-warm-200 bg-warm-50 p-5 dark:border-navy-700 dark:bg-navy-800">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-500 dark:text-gold-400" />
              <div>
                <div className="text-sm font-bold text-navy-800 dark:text-white">
                  Beginner-friendly to advanced
                </div>
                <p className="mt-1 text-sm text-charcoal/65 dark:text-navy-300 font-sans leading-relaxed">
                  No experience needed. Placement based on your child, not a fixed template.
                </p>
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
                  to see costs. Group classes are $720-$1,200 per 12-week term depending on level.
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

      {/* FAQ — the three exact blockers */}
      <section className="py-12 md:py-16 bg-white dark:bg-navy-900/30">
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
                a: "Yes - completely. The 15-minute consultation is free, there's no credit card needed, and we never bill you for the call itself. If DSDC isn't the right fit for your child, we'll tell you honestly and sometimes even suggest alternatives.",
              },
              {
                q: "Will you pressure me to sign up?",
                a: "No. The call is a conversation, not a sales pitch. We ask about your child's grade, confidence, and goals, recommend a class level, and leave the decision entirely to you. Many families book the consultation and don't enroll until weeks later - that's completely normal.",
              },
              {
                q: "Can I reschedule if something comes up?",
                a: "Yes. The confirmation email has a reschedule link. Change the time as many times as you need - life happens.",
              },
              {
                q: "What does my child need to join a class if we decide to enroll?",
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
            Want more answers?{" "}
            <Link href="/faq" className="underline underline-offset-4 hover:text-gold-500 dark:text-gold-300">
              Browse the full FAQ →
            </Link>
          </p>
        </div>
      </section>

      {/* Secondary fallback form — demoted below primary CTA */}
      <section className="py-12 md:py-16 bg-warm-100 dark:bg-navy-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-2xl md:text-3xl font-bold text-navy-800 dark:text-white font-serif">
                Can&apos;t find a time that works?
              </h2>
              <p className="text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed max-w-xl mx-auto">
                Send us a message instead. We reply to every email within 24 hours - usually much faster.
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
