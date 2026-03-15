import { notFound, redirect } from "next/navigation";
import { getBlogPostHref } from "@/lib/blogPostPaths";
import { getBlogPostsSync } from "@/lib/blogPosts";
import BlogPostContent from "@/components/BlogPostContent";

interface Props {
  params: Promise<{ slug: string }>;
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

  const datePublished = post.publishedAt ?? post.date;
  const dateModified = post.updatedAt ?? datePublished;
  const articleImage = post.mainImage
    ? post.mainImage.startsWith("http")
      ? post.mainImage
      : `https://dsdc.ca${post.mainImage}`
    : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: "DSDC",
    },
    publisher: {
      "@type": "Organization",
      name: "DSDC",
      url: "https://dsdc.ca",
    },
    description: post.excerpt,
    ...(articleImage ? { image: articleImage } : {}),
  };

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
