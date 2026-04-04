"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, User, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { getBlogPostHref } from "@/lib/blogPostPaths";
import { addZhPrefix, hasChineseVersion } from "@/lib/localeRouting";
import AnimatedSection from "./AnimatedSection";
import type { BlogPost } from "@/lib/blogPosts";

const categoryColors: Record<string, string> = {
  "Parents & Resources": "bg-green-50 text-green-700",
  "Parents & Pricing": "bg-green-50 text-green-700",
  "Competitive Debate": "bg-blue-50 text-blue-700",
  "World Scholar's Cup": "bg-purple-50 text-purple-700",
  "Student Tips": "bg-orange-50 text-orange-700",
  "Public Speaking": "bg-pink-50 text-pink-700",
};

function renderInlineContent(content: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const tokenRegex = /(<cite href="([^"]+)">([^<]+)<\/cite>|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = tokenRegex.exec(content);

  while (match) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      const href = match[2];
      const text = match[3];
      parts.push(
        <cite key={`cite-${href}-${match.index}`} className="not-italic">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-navy-700 underline underline-offset-4 transition-colors hover:text-gold-500 dark:text-gold-300 dark:hover:text-gold-200"
          >
            {text}
          </a>
        </cite>,
      );
    } else if (match[4] && match[5]) {
      const href = match[5];
      const text = match[4];
      parts.push(
        href.startsWith("/") ? (
          <Link
            key={`${href}-${match.index}`}
            href={href}
            className="text-gold-600 hover:text-gold-500 underline underline-offset-4 transition-colors"
          >
            {text}
          </Link>
        ) : (
          <a
            key={`${href}-${match.index}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-gold-600 hover:text-gold-500 underline underline-offset-4 transition-colors"
          >
            {text}
          </a>
        ),
      );
    } else if (match[6]) {
      parts.push(
        <strong key={`strong-${match.index}`} className="font-semibold text-navy-800 dark:text-white">
          {match[6]}
        </strong>,
      );
    }

    lastIndex = tokenRegex.lastIndex;
    match = tokenRegex.exec(content);
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

export default function BlogPostContent({
  post,
  allPosts,
}: {
  post: BlogPost;
  allPosts: BlogPost[];
}) {
  const { t, locale } = useI18n();
  const localizeHref = (href: string) => (locale === "zh" && hasChineseVersion(href) ? addZhPrefix(href) : href);
  const related = allPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (a.category === post.category ? -1 : 1))
    .slice(0, 2);
  const recommendedPrograms =
    locale === "zh"
      ? [
          {
            href: localizeHref("/classes"),
            title: "浏览全部课程",
            description: "比较 DSDC 的辩论、公共演讲和竞赛课程层级。",
          },
          {
            href: localizeHref("/debate-classes-vancouver"),
            title: "查看温哥华辩论课程",
            description: "了解我们面向温哥华和大温地区学生的辩论课程。",
          },
          {
            href: localizeHref("/debate-classes-toronto"),
            title: "查看多伦多辩论课程",
            description: "看看 GTA 家庭如何通过 DSDC 参加在线辩论与公共演讲课程。",
          },
          {
            href: localizeHref("/online-debate-classes"),
            title: "了解在线辩论课程",
            description: "查看在线课程如何运作，以及孩子将如何逐步成长。",
          },
          {
            href: localizeHref("/register"),
            title: "开始报名",
            description: "准备好后可以直接进入报名流程。",
          },
          {
            href: localizeHref("/pricing"),
            title: "查看课程价格",
            description: "了解公开透明的课程定价与不同项目的费用范围。",
          },
        ]
      : [
          {
            href: "/classes",
            title: "Compare all classes",
            description: "See every DSDC debate, public speaking, and competitive program in one place.",
          },
          {
            href: "/debate-classes-vancouver",
            title: "Explore Vancouver debate classes",
            description: "Visit our Vancouver landing page for debate classes, public speaking classes, and local FAQs.",
          },
          {
            href: "/debate-classes-toronto",
            title: "Explore Toronto debate classes",
            description: "See how Toronto and GTA families use DSDC for online debate and public speaking coaching.",
          },
          {
            href: "/online-debate-classes",
            title: "See how online debate classes work",
            description: "Learn how weekly live Zoom coaching, feedback, and progression work at DSDC.",
          },
          {
            href: "/register",
            title: "Start registration",
            description: "Ready to move forward? Begin the DSDC registration flow here.",
          },
          {
            href: "/pricing",
            title: "See pricing",
            description: "Review transparent DSDC pricing before choosing the right program.",
          },
        ];

  return (
    <>
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
              {t("blog.backToBlog")}
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
            {post.authorProfile?.title ? <span className="text-white/40 hidden sm:inline" aria-hidden="true">|</span> : null}
            {post.authorProfile?.title ? <span>{post.authorProfile.title}</span> : null}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </motion.div>
        </div>
      </section>

      <article className="py-12 md:py-16 bg-white dark:bg-navy-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.authorProfile ? (
            <AnimatedSection delay={0.05}>
              <aside className="mb-10 rounded-2xl border border-warm-200 bg-warm-50 p-5 dark:border-navy-700 dark:bg-navy-800/80">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/50 dark:text-navy-300">
                  Written by
                </p>
                <div className="mt-2">
                  <Link
                    href={post.authorProfile.url.replace("https://dsdc.ca", "")}
                    className="text-xl font-bold text-navy-800 transition-colors hover:text-gold-500 dark:text-white dark:hover:text-gold-300"
                  >
                    {post.authorProfile.name}
                  </Link>
                  <p className="mt-1 text-sm font-medium text-gold-600 dark:text-gold-300">
                    {post.authorProfile.title} | {post.authorProfile.credential}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200">
                  {post.authorProfile.description}
                </p>
              </aside>
            </AnimatedSection>
          ) : null}

          <div className="prose-custom">
            {post.sections.map((section, i) => {
              const singleInternalLinkMatch =
                section.type === "paragraph"
                  ? section.content.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/)
                  : null;

              if (section.type === "heading") {
                return (
                  <AnimatedSection key={i} delay={0.05}>
                    <h2 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white mt-10 mb-4 font-serif">
                      {section.content}
                    </h2>
                  </AnimatedSection>
                );
              }

              if (section.type === "subheading") {
                return (
                  <AnimatedSection key={i} delay={0.05}>
                    <h3 className="text-xl md:text-2xl font-bold text-navy-800 dark:text-white mt-8 mb-3 font-serif">
                      {section.content}
                    </h3>
                  </AnimatedSection>
                );
              }

              if (section.type === "list") {
                return (
                  <AnimatedSection key={i} delay={0.05}>
                    {section.content ? (
                      <p className="text-charcoal/70 dark:text-navy-200 font-semibold mb-2 font-sans">
                        {renderInlineContent(section.content)}
                      </p>
                    ) : null}
                    <ul className="space-y-2 mb-6 ml-1">
                      {section.items?.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">
                          <span className="w-2 h-2 bg-gold-400 rounded-full mt-2 shrink-0" />
                          <span>{renderInlineContent(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedSection>
                );
              }

              if (singleInternalLinkMatch) {
                return (
                  <AnimatedSection key={i} delay={0.05}>
                    <div className="mb-6">
                      <Link
                        href={singleInternalLinkMatch[2]}
                        className="inline-block rounded-lg bg-gold-300 px-8 py-3.5 font-bold text-navy-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-200 hover:shadow-xl"
                      >
                        {singleInternalLinkMatch[1]}
                      </Link>
                    </div>
                  </AnimatedSection>
                );
              }

              return (
                <AnimatedSection key={i} delay={0.05}>
                  <p className="text-charcoal/70 dark:text-navy-200 text-lg leading-relaxed mb-6 font-sans">
                    {renderInlineContent(section.content)}
                  </p>
                </AnimatedSection>
              );
            })}
          </div>

          {post.faqItems?.length ? (
            <AnimatedSection delay={0.07}>
              <section className="mt-10 rounded-2xl border border-warm-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
                <h2 className="text-2xl font-bold text-navy-800 dark:text-white font-serif">
                  Frequently Asked Questions About Choosing a Debate Program
                </h2>
                <div className="mt-5 space-y-3">
                  {post.faqItems.map((item) => (
                    <details
                      key={item.question}
                      className="group overflow-hidden rounded-xl border border-warm-200 bg-warm-50 shadow-sm dark:border-navy-700 dark:bg-navy-900"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-white dark:hover:bg-navy-800">
                        <span className="pr-4 text-sm sm:text-base font-semibold text-navy-800 dark:text-navy-100 font-sans">
                          {item.question}
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                          +
                        </span>
                      </summary>
                      <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:text-base font-sans">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </AnimatedSection>
          ) : null}

          <AnimatedSection delay={0.08}>
            <section className="mt-10 rounded-2xl border border-warm-200 bg-warm-50 p-6 dark:border-navy-700 dark:bg-navy-800/80">
              <h2 className="text-xl font-bold text-navy-800 dark:text-white font-serif">
                {locale === "zh" ? "继续了解 DSDC 课程" : "Explore DSDC Programs"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200">
                {locale === "zh"
                  ? "如果这篇文章对您有帮助，下面这些页面可以继续帮助您了解课程、地点和报名方式。"
                  : "If this article was helpful, these next steps make it easier to compare classes, learn about locations, and get started."}
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {recommendedPrograms.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-warm-200 bg-white p-4 transition-colors hover:border-gold-300 hover:bg-gold-50 dark:border-navy-700 dark:bg-navy-900 dark:hover:border-gold-400 dark:hover:bg-navy-800"
                  >
                    <p className="font-semibold text-navy-800 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-charcoal/65 dark:text-navy-300">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="mt-12 p-6 sm:p-8 bg-navy-800 dark:bg-navy-700 rounded-2xl text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-serif">
                {t("blog.readyTitle")}
              </h3>
              <p className="text-white/60 text-sm sm:text-base mb-6 font-sans max-w-lg mx-auto">
                {t("blog.readySubtitle")}
              </p>
              <Link
                href={localizeHref("/book")}
                className="inline-block px-8 py-3.5 bg-gold-300 text-navy-900 font-bold rounded-lg hover:bg-gold-200 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("hero.cta")}
              </Link>
              <p className="mt-4 text-sm text-white/80 font-sans">
                Ready to start?{" "}
                <Link href={localizeHref("/book")} className="underline underline-offset-4 hover:text-gold-300 transition-colors">
                  Book a free consultation
                </Link>{" "}
                ,{" "}
                <Link href={localizeHref("/classes")} className="underline underline-offset-4 hover:text-gold-300 transition-colors">
                  explore our classes
                </Link>
                , or{" "}
                <Link href={localizeHref("/pricing")} className="underline underline-offset-4 hover:text-gold-300 transition-colors">
                  see our pricing
                </Link>
                .
              </p>
            </div>
          </AnimatedSection>

          {post.citationSources?.length ? (
            <AnimatedSection delay={0.12}>
              <section className="mt-10 rounded-2xl border border-warm-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
                <h2 className="text-xl font-bold text-navy-800 dark:text-white font-serif">
                  Sources Cited
                </h2>
                <ul className="mt-4 space-y-3">
                  {post.citationSources.map((citation) => (
                    <li key={citation.url} className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200">
                      <cite className="not-italic">
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-navy-700 underline underline-offset-4 transition-colors hover:text-gold-500 dark:text-gold-300 dark:hover:text-gold-200"
                        >
                          {citation.title}
                        </a>
                      </cite>
                      {citation.publisher ? ` - ${citation.publisher}` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            </AnimatedSection>
          ) : null}
        </div>
      </article>

      <section className="py-12 md:py-16 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-8 text-navy-800 dark:text-white">{t("blog.relatedPosts")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map((p, i) => (
              <AnimatedSection key={p.slug} delay={i * 0.1}>
                <Link href={getBlogPostHref(p.slug)} className="group block">
                  <article className="bg-white dark:bg-navy-800 rounded-xl border border-warm-200 dark:border-navy-700 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[p.category] || "bg-gray-50 dark:bg-navy-700 text-gray-700 dark:text-navy-200"}`}>
                        {p.category}
                      </span>
                      <span className="text-charcoal/40 dark:text-navy-400 text-xs font-sans">{p.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-2 group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors font-serif leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-charcoal/50 dark:text-navy-200 text-sm leading-relaxed font-sans line-clamp-2">{p.excerpt}</p>
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
