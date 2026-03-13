const standaloneBlogPostPaths: Record<string, string> = {
  "guide-to-debate-in-canada": "/guide-to-debate-in-canada",
};

export function getBlogPostHref(slug: string): string {
  return standaloneBlogPostPaths[slug] ?? `/blog/${slug}`;
}
