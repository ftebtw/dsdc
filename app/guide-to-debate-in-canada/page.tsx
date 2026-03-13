import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostContent from "@/components/BlogPostContent";
import { getBlogPostsSync } from "@/lib/blogPosts";

const guideSlug = "guide-to-debate-in-canada";

export const metadata: Metadata = {
  title: "The Complete Guide to High School Debate in Canada (2026) | DSDC",
  description:
    "Everything you need to know about competitive debate in Canada — national organizations, provincial associations, debate formats (CNDF, BP, World Schools), how tournaments work, the path to nationals, and how to get started. The most complete guide available.",
  alternates: {
    canonical: "https://dsdc.ca/guide-to-debate-in-canada",
  },
  openGraph: {
    title: "The Complete Guide to High School Debate in Canada (2026) | DSDC",
    description:
      "Everything you need to know about competitive debate in Canada — national organizations, provincial associations, debate formats (CNDF, BP, World Schools), how tournaments work, the path to nationals, and how to get started. The most complete guide available.",
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
      "Everything you need to know about competitive debate in Canada — national organizations, provincial associations, debate formats (CNDF, BP, World Schools), how tournaments work, the path to nationals, and how to get started. The most complete guide available.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Complete Guide to High School Debate in Canada",
  author: {
    "@type": "Organization",
    name: "DSDC",
  },
  publisher: {
    "@type": "Organization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  datePublished: "2026-03-13",
  description:
    "Everything you need to know about competitive debate in Canada — organizations, formats, tournaments, the path to nationals, and how to get started.",
};

export default function GuideToDebateInCanadaPage() {
  const posts = getBlogPostsSync();
  const post = posts.find((item) => item.slug === guideSlug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostContent post={post} allPosts={posts} />
    </>
  );
}
