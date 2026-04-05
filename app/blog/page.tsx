import { getBlogPostsSync } from "@/lib/blogPosts";
import { getLocalizedBlogPosts } from "@/lib/blogLocalizations";
import { getRequestLocale } from "@/lib/requestLocale";
import BlogListingContent from "@/components/BlogListingContent";

export default async function BlogPage() {
  const locale = await getRequestLocale();
  const posts = getLocalizedBlogPosts(getBlogPostsSync(), locale);
  return <BlogListingContent initialPosts={posts} />;
}
