import axiosInstance from "@/lib/axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const AVATAR_COLORS = [
  "linear-gradient(135deg,#7A4A22,#5A3820)",
  "linear-gradient(135deg,#7A4A22,#995F2F)",
  "#8B5CF6",
  "#F59E0B",
  "#14B8A6",
  "#EC4899",
  "#3B82F6",
  "#22C55E",
];

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(username: string) {
  return (username || "??").slice(0, 2).toUpperCase();
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const TOPICS = [
  "Technology", "Design", "Development", "Productivity", "Startup",
  "AI & ML", "Career", "Open Source", "Writing", "Philosophy",
  "Science", "Finance", "Data Science", "DevOps", "UX Research", "Leadership",
];

const HomeContent = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const getBlogs = async (
    page: number = 1,
    query: string = "a",
    sortBy?: string,
    sortType?: "asc" | "desc",
  ) => {
    try {
      const params: any = { page, limit: 10 };
      if (query) params.query = query;
      if (sortBy) params.sortBy = sortBy;
      if (sortType) params.sortType = sortType;
      const res = await axiosInstance.get("/blog", { params });
      return res.data;
    } catch (err: any) {
      console.error("Error fetching blogs:", err.response?.data || err.message);
      throw err;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await getBlogs();
        if (response?.statusCode === 200) {
          setBlogs(response.data);
          setHasMore(response?.hasMore);
        }
      } catch (err) {
        console.error("Failed to load blogs", err);
      }
    })();
  }, []);

  const featured = blogs[0];
  const trending = blogs.slice(0, 5);
  const recent = blogs.slice(1);

  // Deduplicate authors from the blogs list
  const authorMap = new Map<string, any>();
  blogs.forEach((b) => {
    const a = b.authorDetails;
    if (!a) return;
    const key = a._id || a.username;
    if (!authorMap.has(key)) {
      authorMap.set(key, { ...a, blogCount: 0, likeTotal: 0 });
    }
    const entry = authorMap.get(key);
    if (entry) { entry.blogCount++; entry.likeTotal += b.likeCount || 0; }
  });
  const authors = Array.from(authorMap.values()).slice(0, 4);

  return (
    <div className="bg-white min-h-screen">

      {/* ══════════════ HERO ══════════════ */}
      <section
        className="relative overflow-hidden flex items-end"
        style={{ minHeight: 540 }}
        aria-label="Featured article"
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #995F2F 0%, #7A4A22 45%, #995F2F 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(-45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 16px)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(26,14,4,0.62)" }} />

        {featured?.coverImage?.url && (
          <div
            className="absolute right-16 top-1/2 -translate-y-1/2 hidden lg:block rounded-xl overflow-hidden"
            style={{ width: 300, height: 200, opacity: 0.55, border: "1px solid rgba(153,95,47,0.12)" }}
            aria-hidden="true"
          >
            <img src={featured.coverImage.url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className="relative z-10 w-full max-w-screen-2xl mx-auto px-6"
          style={{ paddingBottom: 64, paddingTop: 96 }}
        >
          {featured ? (
            <>
              <div className="flex items-center gap-3 mb-[18px]">
                {featured.tag?.[0] && (
                  <span
                    className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white"
                    style={{ background: "rgba(153,95,47,0.85)" }}
                  >
                    {featured.tag[0]}
                  </span>
                )}
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>8 min read</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Featured</span>
              </div>

              <h1
                className="font-black text-white"
                style={{
                  fontSize: "clamp(30px, 3.8vw, 52px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.08,
                  maxWidth: 580,
                  marginBottom: 18,
                  textWrap: "pretty" as any,
                }}
              >
                {featured.title}
              </h1>

              {featured.description && (
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.68)", maxWidth: 460, lineHeight: 1.75, marginBottom: 28 }}>
                  {featured.description}
                </p>
              )}

              <div className="flex items-center gap-3.5 mb-7" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ background: getAvatarColor(featured.authorDetails?.username || "") }}
                  >
                    {featured.authorDetails?.profileImage?.url ? (
                      <img src={featured.authorDetails.profileImage.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(featured.authorDetails?.username || "")
                    )}
                  </div>
                  {featured.authorDetails?.username}
                </div>
                <span>·</span>
                <span>
                  {new Date(featured.createdAt).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <HeartIcon />
                  {featured.likeCount ?? 0}
                </span>
              </div>

              <Link
                href={`/blog/${featured._id}`}
                className="inline-block px-6 py-3 rounded-lg font-bold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: "#995F2F" }}
              >
                Read Story →
              </Link>
            </>
          ) : (
            <div className="animate-pulse">
              <div style={{ height: 24, width: 200, background: "rgba(255,255,255,0.1)", borderRadius: 6, marginBottom: 20 }} />
              <div style={{ height: 48, width: "55%", background: "rgba(255,255,255,0.1)", borderRadius: 8, marginBottom: 18 }} />
              <div style={{ height: 18, width: "38%", background: "rgba(255,255,255,0.08)", borderRadius: 6 }} />
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ TRENDING BAR ══════════════ */}
      {trending.length > 0 && (
        <div
          role="region"
          aria-label="Trending articles"
          style={{ background: "#F5F0EB", borderTop: "1px solid #E5E5E5", borderBottom: "1px solid #E5E5E5" }}
        >
          <div className="max-w-screen-2xl mx-auto px-6">
            <div style={{ padding: "14px 0 10px" }}>
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: "#666666" }}>
                Trending Now
              </span>
            </div>
            <div
              className="flex overflow-x-auto"
              style={{ borderTop: "1px solid #E5E5E5", scrollbarWidth: "none" }}
            >
              {trending.map((post, idx) => (
                <Link
                  key={post._id}
                  href={`/blog/${post._id}`}
                  className="flex items-start gap-3.5 flex-shrink-0 transition-colors"
                  style={{
                    padding: "16px 24px",
                    minWidth: 230,
                    borderRight: idx < trending.length - 1 ? "1px solid #E5E5E5" : "none",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#EDE8E3")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    className="font-black leading-none flex-shrink-0"
                    style={{ fontSize: 30, letterSpacing: "-0.04em", color: "#D5C5B5", minWidth: 38 }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div
                      className="font-bold line-clamp-2"
                      style={{ fontSize: 13, letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: 5, color: "#1A0E04" }}
                    >
                      {post.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#666666" }}>
                      {post.authorDetails?.username}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ RECENT POSTS ══════════════ */}
      <section className="py-[72px]" aria-labelledby="recent-hd">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2
              id="recent-hd"
              className="font-extrabold tracking-tight"
              style={{ fontSize: 22, color: "#1A0E04" }}
            >
              Recent Posts
            </h2>
            <Link
              href="/articles"
              className="text-sm font-semibold transition-colors hover:text-[#995F2F]"
              style={{ color: "#666666" }}
            >
              View all →
            </Link>
          </div>

          {blogs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl overflow-hidden"
                  style={{ border: "1px solid #E5E5E5" }}
                >
                  <div className="aspect-[16/9] bg-[#F5F0EB]" />
                  <div className="p-5">
                    <div className="h-3 bg-[#EDE8E3] rounded w-16 mb-3" />
                    <div className="h-4 bg-[#EDE8E3] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#EDE8E3] rounded w-full mb-1" />
                    <div className="h-3 bg-[#EDE8E3] rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((post, i) => (
                <article
                  key={post._id || i}
                  className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <Link href={`/blog/${post._id}`} className="flex flex-col flex-1">
                    <div className="aspect-[16/9] w-full overflow-hidden bg-[#F5F0EB] flex-shrink-0">
                      {post.coverImage?.url ? (
                        <img
                          src={post.coverImage.url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F5F0EB] to-[#E5D5C5]" />
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      {post.tag?.[0] && (
                        <div className="flex gap-1.5 mb-2.5 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: "rgba(153,95,47,0.1)", color: "#995F2F" }}
                          >
                            {post.tag[0]}
                          </span>
                        </div>
                      )}

                      <h3
                        className="font-extrabold line-clamp-2 mb-2 transition-colors group-hover:text-[#995F2F]"
                        style={{ fontSize: 15, letterSpacing: "-0.01em", lineHeight: 1.35, color: "#1A0E04" }}
                      >
                        {post.title}
                      </h3>

                      {post.description && (
                        <p
                          className="line-clamp-3 flex-1 mb-4"
                          style={{ fontSize: 13, color: "#666666", lineHeight: 1.65 }}
                        >
                          {post.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ background: getAvatarColor(post.authorDetails?.username || "") }}
                          >
                            {post.authorDetails?.profileImage?.url ? (
                              <img src={post.authorDetails.profileImage.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              getInitials(post.authorDetails?.username || "")
                            )}
                          </div>
                          <div>
                            <div
                              className="font-semibold"
                              style={{ fontSize: 12, color: "#1A0E04", lineHeight: 1.2 }}
                            >
                              {post.authorDetails?.username}
                            </div>
                            <div style={{ fontSize: 11, color: "#666666" }}>
                              {new Date(post.createdAt).toLocaleDateString("en-US", {
                                month: "short", day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5" style={{ color: "#666666" }}>
                          <span className="flex items-center gap-0.5 text-xs">
                            <HeartIcon /> {post.likeCount ?? 0}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs">
                            <CommentIcon /> {post.commentCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                className="px-8 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-[#995F2F] hover:text-white hover:border-[#995F2F]"
                style={{ borderColor: "#995F2F", color: "#995F2F" }}
              >
                View More Articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ POPULAR AUTHORS ══════════════ */}
      {authors.length > 0 && (
        <section
          aria-labelledby="authors-hd"
          style={{
            background: "#F5F0EB",
            borderTop: "1px solid #E5E5E5",
            borderBottom: "1px solid #E5E5E5",
            padding: "64px 0",
          }}
        >
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2
                id="authors-hd"
                className="font-extrabold tracking-tight"
                style={{ fontSize: 22, color: "#1A0E04" }}
              >
                Popular Authors
              </h2>
              <Link
                href="/articles"
                className="text-sm font-semibold transition-colors hover:text-[#995F2F]"
                style={{ color: "#666666" }}
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {authors.map((author) => (
                <Link
                  key={author._id || author.username}
                  href={`/profile/${author._id}`}
                  className="block text-center rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    padding: "28px 20px 24px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center text-white font-extrabold text-xl"
                    style={{ background: getAvatarColor(author.username || "") }}
                  >
                    {author.profileImage?.url ? (
                      <img src={author.profileImage.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(author.username || "")
                    )}
                  </div>
                  <div
                    className="font-bold mb-1"
                    style={{ fontSize: 15, letterSpacing: "-0.01em", color: "#1A0E04" }}
                  >
                    {author.username}
                  </div>
                  <div className="mb-3" style={{ fontSize: 12, color: "#666666" }}>
                    {author.likeTotal} likes · {author.blogCount} {author.blogCount === 1 ? "post" : "posts"}
                  </div>
                  <span
                    className="inline-block px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors"
                    style={{ borderColor: "#E5E5E5", color: "#995F2F" }}
                  >
                    View Profile
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ EXPLORE TOPICS ══════════════ */}
      <section className="py-[72px]" aria-labelledby="topics-hd">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="mb-8">
            <h2
              id="topics-hd"
              className="font-extrabold tracking-tight"
              style={{ fontSize: 22, color: "#1A0E04" }}
            >
              Explore Topics
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {TOPICS.map((topic) => (
              <Link
                key={topic}
                href="/articles"
                className="px-5 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-all duration-150 hover:text-[#995F2F] hover:bg-[#F5F0EB] hover:border-[#995F2F]/30"
                style={{
                  background: "#FFFFFF",
                  color: "#1A0E04",
                  borderColor: "#E5E5E5",
                  textDecoration: "none",
                }}
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomeContent;
