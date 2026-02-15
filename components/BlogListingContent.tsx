"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";
import type { BlogPost } from "@/lib/blogPosts";

const categoryColors: Record<string, string> = {
  "Parents & Pricing": "bg-green-50 text-green-700",
  "Competitive Debate": "bg-blue-50 text-blue-700",
  "World Scholar's Cup": "bg-purple-50 text-purple-700",
  "Student Tips": "bg-orange-50 text-orange-700",
  "Public Speaking": "bg-pink-50 text-pink-700",
};

export default function BlogListingContent({ initialPosts }: { initialPosts: BlogPost[] }) {
  const { t } = useI18n();
  const [featured, ...rest] = initialPosts;

  if (initialPosts.length === 0) {
    return (
      <section className="py-20 text-center">
        <p className="text-charcoal/60 dark:text-navy-300">No posts yet.</p>
      </section>
    );
  }

  return (
    <>
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            {t("blog.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 font-sans max-w-2xl mx-auto"
          >
            {t("blog.subtitle")}
          </motion.p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="bg-warm-50 dark:bg-navy-800 rounded-2xl p-6 sm:p-10 border border-warm-200 dark:border-navy-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[featured.category] || "bg-gray-50 dark:bg-navy-700 text-gray-700 dark:text-navy-200"}`}>
                    {featured.category}
                  </span>
                  <span className="text-charcoal/40 dark:text-navy-400 text-sm font-sans flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(featured.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-charcoal/40 dark:text-navy-400 text-sm font-sans flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-4 group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors font-serif">
                  {featured.title}
                </h2>
                <p className="text-charcoal/60 dark:text-navy-200 text-lg leading-relaxed mb-6 font-sans max-w-3xl">
                  {featured.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-gold-500 dark:text-gold-400 font-semibold text-sm group-hover:gap-3 transition-all font-sans">
                  Read Article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-navy-800 dark:text-white">{t("blog.allPosts")}</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <AnimatedSection key={post.slug} delay={(i % 3) * 0.1}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="bg-white dark:bg-navy-800 rounded-xl border border-warm-200 dark:border-navy-700 p-5 sm:p-6 h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[post.category] || "bg-gray-50 dark:bg-navy-700 text-gray-700 dark:text-navy-200"}`}>
                        {post.category}
                      </span>
                      <span className="text-charcoal/40 dark:text-navy-400 text-xs font-sans flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-3 group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors font-serif leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-charcoal/50 dark:text-navy-200 text-sm leading-relaxed flex-grow mb-4 font-sans">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-warm-200 dark:border-navy-700">
                      <span className="text-charcoal/40 dark:text-navy-400 text-xs font-sans">
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gold-500 dark:text-gold-400 font-semibold text-xs group-hover:gap-2 transition-all font-sans">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
