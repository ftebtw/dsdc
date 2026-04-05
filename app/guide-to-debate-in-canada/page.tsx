import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import BlogPostContent from "@/components/BlogPostContent";
import { getBlogPostsSync } from "@/lib/blogPosts";
import { getLocalizedBlogPost, getLocalizedBlogPosts } from "@/lib/blogLocalizations";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";
import { buildArticleSchema } from "@/lib/structuredData";

const guideSlug = "guide-to-debate-in-canada";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/guide-to-debate-in-canada",
    title:
      locale === "zh"
        ? "加拿大中学生辩论完整指南 | DSDC"
        : "The Complete Guide to High School Debate in Canada (2026) | DSDC",
    description:
      locale === "zh"
        ? "了解加拿大中学生辩论体系、各省协会、常见赛制、比赛路径，以及孩子如何开始学习辩论。适合家长和学生的中文入门指南。"
        : "Everything you need to know about competitive debate in Canada - national organizations, provincial associations, debate formats (CNDF, BP, World Schools), how tournaments work, the path to nationals, and how to get started. The most complete guide available.",
    images: [
      {
        url: "/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC debate students competing internationally",
      },
    ],
    openGraphType: "article",
    hasChineseVersion: true,
  });
}

export default async function GuideToDebateInCanadaPage() {
  const locale = await getRequestLocale();
  const rawPosts = getBlogPostsSync();
  const posts = getLocalizedBlogPosts(rawPosts, locale);
  const post = getLocalizedBlogPost(rawPosts, guideSlug, locale);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd
        id="guide-to-debate-article-schema"
        data={buildArticleSchema(post, locale === "zh" ? "/zh/guide-to-debate-in-canada" : "/guide-to-debate-in-canada", locale)}
      />
      <BlogPostContent post={post} allPosts={posts} />
    </>
  );
}
