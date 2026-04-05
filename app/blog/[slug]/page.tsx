import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import BlogPostContent from "@/components/BlogPostContent";
import { getBlogPostHref } from "@/lib/blogPostPaths";
import { getBlogPostsSync } from "@/lib/blogPosts";
import { getLocalizedBlogPost, getLocalizedBlogPosts, hasChineseBlogTranslation } from "@/lib/blogLocalizations";
import { addZhPrefix } from "@/lib/localeRouting";
import { getRequestLocale } from "@/lib/requestLocale";
import { SITE_NAME, SITE_OG_IMAGE_URL, SITE_URL, absoluteUrl, buildArticleSchema, buildFaqSchema } from "@/lib/structuredData";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const posts = getBlogPostsSync();
  const post = getLocalizedBlogPost(posts, slug, locale);

  if (!post) {
    return {};
  }

  const href = getBlogPostHref(slug);
  const canonicalHref = locale === "zh" && hasChineseBlogTranslation(slug) ? addZhPrefix(href) : href;
  const canonical = `${SITE_URL}${canonicalHref}`;
  const image = post.mainImage ? absoluteUrl(post.mainImage) : SITE_OG_IMAGE_URL;
  const title = `${post.title} | ${SITE_NAME}`;

  return {
    title,
    description: post.excerpt,
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}${href}`,
        ...(hasChineseBlogTranslation(slug) ? { zh: `${SITE_URL}${addZhPrefix(href)}` } : {}),
        "x-default": `${SITE_URL}${href}`,
      },
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
  const locale = await getRequestLocale();
  const href = getBlogPostHref(slug);
  if (href !== `/blog/${slug}`) {
    redirect(href);
  }

  const posts = getLocalizedBlogPosts(getBlogPostsSync(), locale);
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd
        id={`article-schema-${post.slug}`}
        data={buildArticleSchema(post, locale === "zh" && hasChineseBlogTranslation(slug) ? addZhPrefix(href) : href, locale)}
      />
      {post.faqItems?.length ? <JsonLd id={`faq-schema-${post.slug}`} data={buildFaqSchema(post.faqItems)} /> : null}
      <BlogPostContent post={post} allPosts={posts} />
    </>
  );
}
