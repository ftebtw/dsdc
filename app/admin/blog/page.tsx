"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  Download,
  Lock,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import type { BlogPost, BlogSection } from "@/lib/blogPosts";

const CATEGORIES = [
  "Parents & Pricing",
  "Competitive Debate",
  "World Scholar's Cup",
  "Student Tips",
  "Public Speaking",
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPost, setNewPost] = useState<BlogPost | null>(null);

  const fetchPosts = useCallback(async (authToken?: string) => {
    const res = await fetch("/api/admin/blog", {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    if (res.status === 401) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      setPosts(data);
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (authenticated && posts.length === 0 && !newPost) {
      fetchPosts();
    }
  }, [authenticated, posts.length, newPost, fetchPosts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchPosts(password);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const toSave = newPost ? [newPost, ...posts] : posts;
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(password ? { Authorization: `Bearer ${password}` } : {}),
      },
      body: JSON.stringify({ posts: toSave }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage({ type: "ok", text: "Saved to content/blog-posts.json. Redeploy or refresh to see on site." });
      if (newPost) {
        setPosts([newPost, ...posts]);
        setNewPost(null);
      }
      setEditingIndex(null);
    } else {
      setMessage({
        type: "err",
        text: data.message || "Save failed.",
      });
      if (data.posts) {
        setMessage((m) => ({
          type: "err",
          text: (m?.text || "") + " Use Export below to download JSON and add content/blog-posts.json to your repo.",
        }));
      }
    }
  };

  const handleExport = () => {
    const toExport = newPost ? [newPost, ...posts] : posts;
    const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "blog-posts.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage({ type: "ok", text: "Downloaded blog-posts.json. Save to content/blog-posts.json in your repo and commit." });
  };

  const startNewPost = () => {
    setNewPost({
      slug: "",
      title: "",
      excerpt: "",
      date: new Date().toISOString().slice(0, 10),
      author: "DSDC Team",
      category: "Competitive Debate",
      readTime: "5 min read",
      sections: [{ type: "paragraph", content: "" }],
    });
    setEditingIndex(-1);
  };

  const updatePost = (index: number, updates: Partial<BlogPost>) => {
    if (index === -1 && newPost) setNewPost({ ...newPost, ...updates });
    else setPosts((prev) => prev.map((p, i) => (i === index ? { ...p, ...updates } : p)));
  };

  const updateSection = (postIndex: number, sectionIndex: number, updates: Partial<BlogSection>) => {
    const upd = (p: BlogPost) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === sectionIndex ? { ...s, ...updates } : s)),
    });
    if (postIndex === -1 && newPost) setNewPost(upd(newPost));
    else setPosts((prev) => prev.map((p, i) => (i === postIndex ? upd(p) : p)));
  };

  const addSection = (postIndex: number, afterIndex: number) => {
    const newSection: BlogSection = { type: "paragraph", content: "" };
    const upd = (p: BlogPost) => ({
      ...p,
      sections: [
        ...p.sections.slice(0, afterIndex + 1),
        newSection,
        ...p.sections.slice(afterIndex + 1),
      ],
    });
    if (postIndex === -1 && newPost) setNewPost(upd(newPost));
    else setPosts((prev) => prev.map((p, i) => (i === postIndex ? upd(p) : p)));
  };

  const removeSection = (postIndex: number, sectionIndex: number) => {
    const upd = (p: BlogPost) => ({
      ...p,
      sections: p.sections.filter((_, i) => i !== sectionIndex),
    });
    if (postIndex === -1 && newPost) setNewPost(upd(newPost));
    else setPosts((prev) => prev.map((p, i) => (i === postIndex ? upd(p) : p)));
  };

  const removePost = (index: number) => {
    if (index === -1) setNewPost(null);
    else setPosts((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const currentPost = editingIndex === -1 ? newPost : editingIndex !== null ? posts[editingIndex] : null;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-warm-100 dark:bg-navy-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl p-8 max-w-sm w-full border border-warm-200 dark:border-navy-700">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-navy-600 dark:text-navy-300" />
            <h1 className="text-xl font-bold text-navy-800 dark:text-white">Admin Login</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg mb-4"
          />
          <button type="submit" className="w-full py-3 bg-navy-800 text-white font-semibold rounded-lg hover:bg-navy-700">
            Log in
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-100 dark:bg-navy-900 flex items-center justify-center">
        <p className="text-charcoal/60 dark:text-navy-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-navy-900">
      <header className="bg-white dark:bg-navy-800 border-b border-warm-200 dark:border-navy-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-navy-600 dark:text-navy-200 hover:text-navy-800 dark:hover:text-white font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-700 font-medium text-navy-700 dark:text-navy-100 hover:bg-warm-50 dark:hover:bg-navy-600"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-400 text-navy-900 font-semibold hover:bg-gold-300 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save to file"}
            </button>
          </div>
        </div>
        {message && (
          <div
            className={`max-w-5xl mx-auto px-4 pb-3 text-sm ${
              message.type === "ok" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">Blog Editor</h1>
          <button
            type="button"
            onClick={startNewPost}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white font-medium hover:bg-navy-700"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>

        {/* List of posts */}
        <div className="space-y-2 mb-10">
          {newPost && (
            <div className="bg-gold-50 dark:bg-gold-900/30 border border-gold-200 dark:border-gold-700 rounded-xl p-4 flex items-center justify-between">
              <span className="font-medium text-navy-800 dark:text-white">(New post)</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(editingIndex === -1 ? null : -1)}
                  className="p-2 text-navy-600 dark:text-navy-200 hover:bg-white dark:hover:bg-navy-700 rounded-lg"
                >
                  {editingIndex === -1 ? <ChevronUp className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => removePost(-1)} className="p-2 text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-navy-700 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {posts.map((post, i) => (
            <div
              key={post.slug}
              className="bg-white dark:bg-navy-800 border border-warm-200 dark:border-navy-700 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <span className="font-medium text-navy-800 dark:text-white">{post.title}</span>
                <span className="text-charcoal/50 dark:text-navy-400 text-sm ml-2">/{post.slug}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                  className="p-2 text-navy-600 dark:text-navy-200 hover:bg-warm-50 dark:hover:bg-navy-700 rounded-lg"
                >
                  {editingIndex === i ? <ChevronUp className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => removePost(i)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-navy-700 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit form */}
        {currentPost && (editingIndex !== null || newPost) && (
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-warm-200 dark:border-navy-700 p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-navy-800 dark:text-white">
              {editingIndex === -1 ? "New Post" : "Edit Post"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={currentPost.slug}
                  onChange={(e) => updatePost(editingIndex ?? -1, { slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })}
                  placeholder="my-post-slug"
                  className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">Date</label>
                <input
                  type="date"
                  value={currentPost.date}
                  onChange={(e) => updatePost(editingIndex ?? -1, { date: e.target.value })}
                  className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">Title</label>
              <input
                type="text"
                value={currentPost.title}
                onChange={(e) => updatePost(editingIndex ?? -1, { title: e.target.value })}
                className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">Excerpt</label>
              <textarea
                value={currentPost.excerpt}
                onChange={(e) => updatePost(editingIndex ?? -1, { excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">Author</label>
                <input
                  type="text"
                  value={currentPost.author}
                  onChange={(e) => updatePost(editingIndex ?? -1, { author: e.target.value })}
                  className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">Category</label>
                <select
                  value={currentPost.category}
                  onChange={(e) => updatePost(editingIndex ?? -1, { category: e.target.value })}
                  className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">Read time</label>
                <input
                  type="text"
                  value={currentPost.readTime}
                  onChange={(e) => updatePost(editingIndex ?? -1, { readTime: e.target.value })}
                  placeholder="5 min read"
                  className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-navy-700">Sections</label>
                <button
                  type="button"
                  onClick={() => addSection(editingIndex ?? -1, currentPost.sections.length - 1)}
                  className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  + Add section
                </button>
              </div>
              <div className="space-y-4">
                {currentPost.sections.map((section, si) => (
                  <div key={si} className="border border-warm-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={section.type}
                        onChange={(e) =>
                          updateSection(editingIndex ?? -1, si, {
                            type: e.target.value as BlogSection["type"],
                          })
                        }
                        className="px-3 py-1.5 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg text-sm"
                      >
                        <option value="paragraph">Paragraph</option>
                        <option value="heading">Heading</option>
                        <option value="subheading">Subheading</option>
                        <option value="list">List</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSection(editingIndex ?? -1, si)}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {section.type !== "list" ? (
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(editingIndex ?? -1, si, { content: e.target.value })}
                        rows={section.type === "paragraph" ? 4 : 1}
                        className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg text-sm"
                        placeholder={section.type === "paragraph" ? "Body text..." : "Heading text"}
                      />
                    ) : (
                      <>
                        <input
                          type="text"
                          value={section.content}
                          onChange={(e) => updateSection(editingIndex ?? -1, si, { content: e.target.value })}
                          placeholder="Optional list title"
                          className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg text-sm"
                        />
                        <textarea
                          value={(section.items || []).join("\n")}
                          onChange={(e) =>
                            updateSection(editingIndex ?? -1, si, {
                              items: e.target.value.split("\n").filter(Boolean),
                            })
                          }
                          rows={4}
                          className="w-full px-4 py-2 border border-warm-300 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100 rounded-lg text-sm"
                          placeholder="One list item per line"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
