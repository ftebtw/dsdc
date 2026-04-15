import type { MetadataRoute } from "next";
import { getBlogPostsSync } from "@/lib/blogPosts";
import { hasChineseBlogTranslation } from "@/lib/blogLocalizations";
import { getBlogPostHref } from "@/lib/blogPostPaths";
import { addZhPrefix, hasChineseVersion } from "@/lib/localeRouting";
import { getLocalizedLastModified } from "@/lib/pageMetadata";

type StaticSitemapEntry = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
  files: string[];
  includeZh?: boolean;
};

const baseUrl = "https://dsdc.ca";

const staticEntries: StaticSitemapEntry[] = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    files: ["app/page.tsx", "components/Hero.tsx", "components/FinalCTA.tsx"],
    includeZh: true,
  },
  {
    path: "/classes",
    changeFrequency: "monthly",
    priority: 0.9,
    files: ["app/classes/page.tsx", "app/classes/layout.tsx", "app/classes/ClassesPageClient.tsx"],
    includeZh: true,
  },
  {
    path: "/pricing",
    changeFrequency: "monthly",
    priority: 0.8,
    files: ["app/pricing/layout.tsx", "app/pricing/page.tsx", "app/pricing/PricingPageClient.tsx"],
    includeZh: true,
  },
  {
    path: "/about",
    changeFrequency: "monthly",
    priority: 0.7,
    files: ["app/about/page.tsx", "components/AboutPageContent.tsx"],
    includeZh: true,
  },
  {
    path: "/contact",
    changeFrequency: "monthly",
    priority: 0.7,
    files: ["app/contact/page.tsx", "components/ContactPageContent.tsx"],
    includeZh: true,
  },
  {
    path: "/faq",
    changeFrequency: "monthly",
    priority: 0.7,
    files: ["app/faq/page.tsx", "components/FaqPageContent.tsx"],
    includeZh: true,
  },
  {
    path: "/team",
    changeFrequency: "monthly",
    priority: 0.7,
    files: ["app/team/layout.tsx", "app/team/page.tsx", "components/CoachCard.tsx"],
    includeZh: true,
  },
  {
    path: "/awards",
    changeFrequency: "monthly",
    priority: 0.7,
    files: ["app/awards/layout.tsx", "app/awards/page.tsx", "app/awards/AwardsPageClient.tsx"],
    includeZh: true,
  },
  {
    path: "/blog",
    changeFrequency: "weekly",
    priority: 0.8,
    files: ["app/blog/layout.tsx", "app/blog/page.tsx", "components/BlogListingContent.tsx", "lib/blogLocalizations.ts"],
    includeZh: true,
  },
  {
    path: "/register",
    changeFrequency: "monthly",
    priority: 0.8,
    files: ["app/register/layout.tsx", "app/register/page.tsx", "app/register/RegisterForm.tsx"],
  },
  {
    path: "/book",
    changeFrequency: "monthly",
    priority: 0.75,
    files: ["app/book/layout.tsx", "app/book/page.tsx"],
  },
  {
    path: "/compare",
    changeFrequency: "monthly",
    priority: 0.75,
    files: ["app/compare/page.tsx"],
  },
  {
    path: "/online-debate-classes",
    changeFrequency: "monthly",
    priority: 0.9,
    files: ["app/online-debate-classes/page.tsx", "components/OnlineDebateClassesPageZh.tsx"],
    includeZh: true,
  },
  {
    path: "/debate-classes-canada",
    changeFrequency: "monthly",
    priority: 0.9,
    files: ["app/debate-classes-canada/page.tsx"],
  },
  {
    path: "/debate-classes-vancouver",
    changeFrequency: "monthly",
    priority: 0.9,
    files: ["app/debate-classes-vancouver/page.tsx", "components/VancouverLandingPageZh.tsx"],
    includeZh: true,
  },
  {
    path: "/debate-classes-toronto",
    changeFrequency: "monthly",
    priority: 0.85,
    files: ["app/debate-classes-toronto/page.tsx", "components/TorontoLandingPageZh.tsx"],
    includeZh: true,
  },
  {
    path: "/debate-classes-calgary",
    changeFrequency: "monthly",
    priority: 0.75,
    files: ["app/debate-classes-calgary/page.tsx", "lib/regionalLandingPages.ts", "components/RegionalDebateLandingPage.tsx"],
  },
  {
    path: "/debate-classes-ottawa",
    changeFrequency: "monthly",
    priority: 0.74,
    files: ["app/debate-classes-ottawa/page.tsx", "lib/regionalLandingPages.ts", "components/RegionalDebateLandingPage.tsx"],
  },
  {
    path: "/debate-classes-ontario",
    changeFrequency: "monthly",
    priority: 0.76,
    files: ["app/debate-classes-ontario/page.tsx", "lib/regionalLandingPages.ts", "components/RegionalDebateLandingPage.tsx"],
  },
  {
    path: "/debate-classes-alberta",
    changeFrequency: "monthly",
    priority: 0.76,
    files: ["app/debate-classes-alberta/page.tsx", "lib/regionalLandingPages.ts", "components/RegionalDebateLandingPage.tsx"],
  },
  {
    path: "/world-scholars-cup-coaching",
    changeFrequency: "monthly",
    priority: 0.8,
    files: ["app/world-scholars-cup-coaching/page.tsx"],
  },
  {
    path: "/debate-classes-for-beginners",
    changeFrequency: "monthly",
    priority: 0.8,
    files: ["app/debate-classes-for-beginners/page.tsx"],
  },
  {
    path: "/public-speaking-classes-for-kids",
    changeFrequency: "monthly",
    priority: 0.85,
    files: ["app/public-speaking-classes-for-kids/page.tsx"],
  },
  {
    path: "/debate-classes-for-kids",
    changeFrequency: "monthly",
    priority: 0.85,
    files: ["app/debate-classes-for-kids/page.tsx"],
  },
  {
    path: "/public-speaking-classes-for-teens",
    changeFrequency: "monthly",
    priority: 0.84,
    files: ["app/public-speaking-classes-for-teens/page.tsx"],
  },
  {
    path: "/guide-to-debate-in-canada",
    changeFrequency: "yearly",
    priority: 0.6,
    files: ["app/guide-to-debate-in-canada/page.tsx", "lib/blogLocalizations.ts", "content/blog-posts.json"],
    includeZh: true,
  },
];

function absolutePath(path: string) {
  return `${baseUrl}${path === "/" ? "" : path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getBlogPostsSync();

  const primaryEntries: MetadataRoute.Sitemap = staticEntries.map((entry) => ({
    url: absolutePath(entry.path),
    lastModified: getLocalizedLastModified(entry.files),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const zhEntries: MetadataRoute.Sitemap = staticEntries
    .filter((entry) => entry.includeZh && hasChineseVersion(entry.path))
    .map((entry) => ({
      url: absolutePath(addZhPrefix(entry.path)),
      lastModified: getLocalizedLastModified(entry.files),
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.slug !== "guide-to-debate-in-canada")
    .map((post) => ({
      url: `${baseUrl}${getBlogPostHref(post.slug)}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt ?? post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const zhBlogEntries: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.slug !== "guide-to-debate-in-canada" && hasChineseBlogTranslation(post.slug))
    .map((post) => ({
      url: `${baseUrl}${addZhPrefix(getBlogPostHref(post.slug))}`,
      lastModified: getLocalizedLastModified(["lib/blogLocalizations.ts", "content/blog-posts.json"]),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  return [...primaryEntries, ...zhEntries, ...blogEntries, ...zhBlogEntries];
}
