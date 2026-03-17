import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import BlogPostContent from "@/components/BlogPostContent";
import { getBlogPostHref } from "@/lib/blogPostPaths";
import { getBlogPostsSync } from "@/lib/blogPosts";
import { SITE_NAME, SITE_OG_IMAGE_URL, SITE_URL, absoluteUrl, buildArticleSchema } from "@/lib/structuredData";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = getBlogPostsSync();
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    return {};
  }

  const href = getBlogPostHref(slug);
  const canonical = `${SITE_URL}${href}`;
  const image = post.mainImage ? absoluteUrl(post.mainImage) : SITE_OG_IMAGE_URL;
  const title = `${post.title} | ${SITE_NAME}`;

  return {
    title,
    description: post.excerpt,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: post.excerpt,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const href = getBlogPostHref(slug);
  if (href !== `/blog/${slug}`) {
    redirect(href);
  }

  const posts = getBlogPostsSync();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd id={`article-schema-${post.slug}`} data={buildArticleSchema(post, href)} />
      <BlogPostContent post={post} allPosts={posts} />
    </>
  );
}
