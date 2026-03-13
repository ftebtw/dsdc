import Link from "next/link";
import { redirect } from "next/navigation";
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
