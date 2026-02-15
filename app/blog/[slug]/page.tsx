import Link from "next/link";
import { getBlogPostsSync } from "@/lib/blogPosts";
import BlogPostContent from "@/components/BlogPostContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
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

  return <BlogPostContent post={post} allPosts={posts} />;
}
