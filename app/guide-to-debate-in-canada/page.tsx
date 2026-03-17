import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import BlogPostContent from "@/components/BlogPostContent";
import { getBlogPostsSync } from "@/lib/blogPosts";
import { buildArticleSchema } from "@/lib/structuredData";

const guideSlug = "guide-to-debate-in-canada";

export const metadata: Metadata = {
  title: "The Complete Guide to High School Debate in Canada (2026) | DSDC",
  description:
    "Everything you need to know about competitive debate in Canada - national organizations, provincial associations, debate formats (CNDF, BP, World Schools), how tournaments work, the path to nationals, and how to get started. The most complete guide available.",
  alternates: {
    canonical: "https://dsdc.ca/guide-to-debate-in-canada",
  },
  openGraph: {
    title: "The Complete Guide to High School Debate in Canada (2026) | DSDC",
    description:
      "Everything you need to know about competitive debate in Canada - national organizations, provincial associations, debate formats (CNDF, BP, World Schools), how tournaments work, the path to nationals, and how to get started. The most complete guide available.",
    url: "https://dsdc.ca/guide-to-debate-in-canada",
    siteName: "DSDC",
    type: "article",
    images: [
      {
        url: "https://dsdc.ca/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC debate students competing internationally",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Complete Guide to High School Debate in Canada (2026) | DSDC",
    description:
      "Everything you need to know about competitive debate in Canada - national organizations, provincial associations, debate formats (CNDF, BP, World Schools), how tournaments work, the path to nationals, and how to get started. The most complete guide available.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function GuideToDebateInCanadaPage() {
  const posts = getBlogPostsSync();
  const post = posts.find((item) => item.slug === guideSlug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd id="guide-to-debate-article-schema" data={buildArticleSchema(post, "/guide-to-debate-in-canada")} />
      <BlogPostContent post={post} allPosts={posts} />
    </>
  );
}
