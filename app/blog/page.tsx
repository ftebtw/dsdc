import { getBlogPostsSync } from "@/lib/blogPosts";
import BlogListingContent from "@/components/BlogListingContent";

export default function BlogPage() {
  const posts = getBlogPostsSync();
  return <BlogListingContent initialPosts={posts} />;
}
