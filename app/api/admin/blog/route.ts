import { NextRequest, NextResponse } from "next/server";
import { getBlogPostsSync } from "@/lib/blogPosts";
import type { BlogPost } from "@/lib/blogPosts";
import path from "path";
import fs from "fs";

const BLOG_POSTS_PATH = path.join(process.cwd(), "content", "blog-posts.json");

function checkAuth(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return token === adminPassword;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = getBlogPostsSync();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { posts: BlogPost[] };
  try {
    body = await request.json();
    if (!Array.isArray(body.posts)) {
      return NextResponse.json({ error: "Expected { posts: BlogPost[] }" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const dir = path.dirname(BLOG_POSTS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BLOG_POSTS_PATH, JSON.stringify(body.posts, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (err) {
    // e.g. read-only filesystem on Vercel - return the JSON so client can save manually
    return NextResponse.json({
      success: false,
      message: "Could not write file (e.g. read-only in production). Save the posts manually.",
      posts: body.posts,
    });
  }
}
