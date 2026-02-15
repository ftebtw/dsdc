"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, User, Tag, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { blogPosts, getPostBySlug } from "@/lib/blogPosts";
import AnimatedSection from "@/components/AnimatedSection";

const categoryColors: Record<string, string> = {
  "Parents & Pricing": "bg-green-50 text-green-700",
  "Competitive Debate": "bg-blue-50 text-blue-700",
  "World Scholar's Cup": "bg-purple-50 text-purple-700",
  "Student Tips": "bg-orange-50 text-orange-700",
  "Public Speaking": "bg-pink-50 text-pink-700",
};

export default function BlogPostPage() {
  const { slug } = useParams() as { slug: string };
  const { t } = useI18n();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-gold-500 hover:text-gold-600 font-semibold">
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Find related posts (same category, excluding current)
  const related = blogPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (a.category === post.category ? -1 : 1))
    .slice(0, 2);

  return (
    <>
      {/* BlogPosting Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { "@type": "Organization", name: "DSDC", url: "https://dsdc.ca" },
            publisher: {
              "@type": "Organization",
              name: "DSDC",
              url: "https://dsdc.ca",
              logo: { "@type": "ImageObject", url: "https://dsdc.ca/images/logos/logo-full.png" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://dsdc.ca/blog/${post.slug}` },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-sans mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-4"
          >
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] || "bg-gray-50 text-gray-700"}`}>
              {post.category}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 text-white/50 text-sm font-sans"
          >
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose-custom">
            {post.sections.map((section, i) => {
              if (section.type === "heading") {
                return (
                  <AnimatedSection key={i} delay={0.05}>
                    <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mt-10 mb-4 font-serif">
                      {section.content}
                    </h2>
                  </AnimatedSection>
                );
              }
              if (section.type === "subheading") {
                return (
                  <AnimatedSection key={i} delay={0.05}>
                    <h3 className="text-xl md:text-2xl font-bold text-navy-800 mt-8 mb-3 font-serif">
                      {section.content}
                    </h3>
                  </AnimatedSection>
                );
              }
              if (section.type === "list") {
                return (
                  <AnimatedSection key={i} delay={0.05}>
                    {section.content && (
                      <p className="text-charcoal/70 font-semibold mb-2 font-sans">{section.content}</p>
                    )}
                    <ul className="space-y-2 mb-6 ml-1">
                      {section.items?.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-charcoal/70 leading-relaxed font-sans">
                          <span className="w-2 h-2 bg-gold-400 rounded-full mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedSection>
                );
              }
              return (
                <AnimatedSection key={i} delay={0.05}>
                  <p className="text-charcoal/70 text-lg leading-relaxed mb-6 font-sans">
                    {section.content}
                  </p>
                </AnimatedSection>
              );
            })}
          </div>

          {/* CTA */}
          <AnimatedSection delay={0.1}>
            <div className="mt-12 p-6 sm:p-8 bg-navy-800 rounded-2xl text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-serif">
                Ready to Get Started?
              </h3>
              <p className="text-white/60 text-sm sm:text-base mb-6 font-sans max-w-lg mx-auto">
                Book a free 15-minute consultation with our team to find the right class for your child.
              </p>
              <Link
                href="/book"
                className="inline-block px-8 py-3.5 bg-gold-300 text-navy-900 font-bold rounded-lg hover:bg-gold-200 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("hero.cta")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-12 md:py-16 bg-warm-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-8">{t("blog.relatedPosts")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map((p, i) => (
              <AnimatedSection key={p.slug} delay={i * 0.1}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <article className="bg-white rounded-xl border border-warm-200 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[p.category] || "bg-gray-50 text-gray-700"}`}>
                        {p.category}
                      </span>
                      <span className="text-charcoal/40 text-xs font-sans">{p.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-800 mb-2 group-hover:text-gold-500 transition-colors font-serif leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-charcoal/50 text-sm leading-relaxed font-sans line-clamp-2">{p.excerpt}</p>
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
