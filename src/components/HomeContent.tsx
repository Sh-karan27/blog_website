"use client";

import axiosInstance from "@/lib/axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const TOPICS = [
  "Engineering", "Design", "Databases", "AI", "Career",
  "Open Source", "Writing", "Reliability", "Culture", "Tooling",
];

function initials(u: string) {
  return (u || "??").slice(0, 2).toUpperCase();
}

function fmtDate(d: string, withYear = false) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

function readTime(post: any) {
  const words = (post.content || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function Avatar({ user, className, textClass = "text-[9px]" }: { user: any; className: string; textClass?: string }) {
  return (
    <span className={`${className} rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 overflow-hidden shrink-0 ${textClass}`}>
      {user?.profileImage?.url ? (
        <img src={user.profileImage.url} alt="" className="w-full h-full object-cover" />
      ) : (
        initials(user?.username || "")
      )}
    </span>
  );
}

function CoverImage({ post, aspect, label }: { post: any; aspect: string; label?: string }) {
  if (post?.coverImage?.url) {
    return (
      <div className={`${aspect} w-full overflow-hidden`}>
        <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`img-ph ${aspect} flex items-end p-4`}>
      <span className="relative z-10 font-mono text-[10px] text-zinc-400">{label ?? "cover"}</span>
    </div>
  );
}

export default function HomeContent() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/blog", { params: { page: 1, limit: 10, query: "a" } });
        if (res.data?.statusCode === 200) {
          setBlogs(res.data.data.blogs);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const featured = blogs[0];
  const trending = blogs.slice(1, 5).length > 0 ? blogs.slice(1, 5) : blogs.slice(0, 4);
  const recent = blogs.slice(1);

  return (
    <main>
      {/* ══ HERO ══ */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 md:pt-28 md:pb-20">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-zinc-400 mb-7 flex items-center gap-3">
            <span className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /> Featured essay
            {featured?.tag?.[0] ? ` · ${featured.tag[0]}` : ""}
          </p>

          {loading || !featured ? (
            /* skeleton */
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-end animate-pulse">
              <div>
                <div className="h-14 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800 mb-4" />
                <div className="h-14 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800 mb-8" />
                <div className="h-4 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800 mb-2" />
                <div className="h-4 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800 mb-10" />
                <div className="h-11 w-44 rounded-full bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="rounded-2xl aspect-[4/3] bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-end">
              <div>
                <h1 className="text-[44px] sm:text-6xl xl:text-[76px] font-black tracking-[-0.045em] leading-[0.98] mb-8">
                  <Link href={`/blog/${featured._id}`} className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors duration-300">
                    {featured.title}
                  </Link>
                </h1>
                {featured.description && (
                  <p className="text-lg xl:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mb-10">
                    {featured.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-5">
                  <Link
                    href={`/blog/${featured._id}`}
                    className="h-11 px-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold inline-flex items-center gap-2 hover:bg-zinc-700 dark:hover:bg-white transition-all hover:gap-3 shadow-sm"
                  >
                    Read the essay <span aria-hidden="true">→</span>
                  </Link>
                  <div className="flex items-center gap-3 text-sm">
                    <Avatar user={featured.authorDetails} className="w-9 h-9 ring-2 ring-white dark:ring-zinc-950" textClass="text-[11px]" />
                    <div className="leading-tight">
                      <p className="font-semibold">{featured.authorDetails?.username}</p>
                      <p className="text-zinc-400 text-xs">
                        {fmtDate(featured.createdAt)} · {readTime(featured)} min read
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/blog/${featured._id}`} className="group block">
                <div className="card-media rounded-2xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]">
                  <CoverImage post={featured} aspect="aspect-[4/3]" label="featured cover · 4:3" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══ TRENDING ══ */}
      {trending.length > 0 && (
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
            <h2 className="text-[11px] font-bold tracking-[0.28em] uppercase text-zinc-400 mb-10 flex items-center gap-3">
              <span className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /> Trending this week
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8">
              {trending.map((post, idx) => (
                <Link
                  key={post._id}
                  href={`/blog/${post._id}`}
                  className={`group relative ${idx > 0 ? "lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800 lg:pl-6" : ""}`}
                >
                  <span className="block text-[13px] font-bold text-zinc-300 dark:text-zinc-700 tabular-nums mb-3">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-bold tracking-[-0.01em] leading-snug mb-2 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    {post.authorDetails?.username} · {readTime(post)} min
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ RECENT ══ */}
      <section>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-[11px] font-bold tracking-[0.28em] uppercase text-zinc-400 mb-3 flex items-center gap-3">
                <span className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /> Latest
              </h2>
              <p className="text-3xl font-black tracking-[-0.03em]">Recent stories</p>
            </div>
            <Link
              href="/articles"
              className="hidden sm:inline-flex h-9 px-4 rounded-full border border-zinc-200 dark:border-zinc-800 text-[13px] font-semibold items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-100 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-xl aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 mb-5" />
                  <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800 mb-3" />
                  <div className="h-5 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800 mb-3" />
                  <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-zinc-500 py-10">No stories yet. Be the first to write one.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {recent.map((post) => (
                <Link key={post._id} href={`/blog/${post._id}`} className="group block">
                  <div className="card-media rounded-xl mb-5">
                    <CoverImage post={post} aspect="aspect-[16/10]" />
                  </div>
                  {post.tag?.[0] && (
                    <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-2.5">
                      {post.tag[0]}
                    </p>
                  )}
                  <h3 className="text-[19px] font-bold tracking-[-0.02em] leading-snug mb-2.5 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-2">{post.description}</p>
                  )}
                  <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                    <Avatar user={post.authorDetails} className="w-6 h-6" />
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                      {post.authorDetails?.username}
                    </span>
                    <span>{fmtDate(post.createdAt)}</span>
                    <span className="ml-auto font-medium">♡ {post.likeCount ?? 0} · {post.commentCount ?? 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ STATEMENT BAND ══ */}
      <section className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-zinc-500 mb-8">Why Inkwell</p>
          <p className="text-3xl sm:text-5xl font-black tracking-[-0.04em] leading-[1.08] max-w-4xl mx-auto mb-10">
            Writing that takes its time,
            <br className="hidden sm:block" /> for readers who give it theirs.
          </p>
          <Link
            href="/write"
            className="h-11 px-6 rounded-full bg-white text-zinc-900 text-sm font-semibold inline-flex items-center gap-2 hover:bg-zinc-200 transition-all hover:gap-3"
          >
            Start writing <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ══ TOPICS ══ */}
      <section>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <h2 className="text-[11px] font-bold tracking-[0.28em] uppercase text-zinc-400 mb-8 flex items-center gap-3">
            <span className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" /> Explore topics
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {TOPICS.map((topic) => (
              <Link
                key={topic}
                href="/articles"
                className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-[13.5px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 dark:hover:border-zinc-100 transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
