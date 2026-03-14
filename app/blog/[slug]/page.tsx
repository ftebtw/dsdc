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

  const comparisonSchema =
    slug === "best-debate-programs-vancouver"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Best Debate Programs in Vancouver for Kids (2026)",
          author: { "@type": "Organization", name: "DSDC" },
          datePublished: "2026-03-13",
          about: [
            {
              "@type": "EducationalOrganization",
              name: "DSDC",
              description:
                "Online debate academy founded in Vancouver in 2017. Small classes of 8-12 students, personalized written feedback, $30-50/hr.",
              url: "https://dsdc.ca",
              foundingDate: "2017",
              areaServed: "Vancouver, Canada",
            },
            {
              "@type": "EducationalOrganization",
              name: "FDT Academy",
              description:
                "In-person and online debate academy on West Broadway, Vancouver. Founded 2016. 40+ instructors.",
              url: "https://fdtacademy.com",
              areaServed: "Vancouver, Canada",
            },
            {
              "@type": "EducationalOrganization",
              name: "Vancouver Debate Academy",
              description:
                "Debate academy in Kerrisdale, Vancouver. 5-level training system. BC Ministry certified.",
              url: "https://vancouverdebate.ca",
              areaServed: "Vancouver, Canada",
            },
            {
              "@type": "EducationalOrganization",
              name: "BL Debate Academy",
              description:
                "Debate academy on West Broadway, Vancouver. Specializes in US and Canadian formats. Founded 2016.",
              url: "https://www.bldebate.ca",
              areaServed: "Vancouver, Canada",
            },
          ],
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {comparisonSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
        />
      ) : null}
      <BlogPostContent post={post} allPosts={posts} />
    </>
  );
}
