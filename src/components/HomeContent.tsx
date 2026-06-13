"use client";

import axiosInstance from "@/lib/axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

/* ── design tokens ── */
const T = {
  accent:      "#985F2E",
  accentHover: "#7A4A22",
  accentDim:   "rgba(152,95,46,0.1)",
  accentDim2:  "rgba(152,95,46,0.18)",
  secondary:   "#7A4A22",
  bg:          "#FFFFFF",
  surface:     "#FFFFFF",
  surfaceAlt:  "#F5F5F5",
  text:        "#000000",
  text2:       "#1A1A1A",
  muted:       "#666666",
  border:      "#E5E5E5",
  borderStrong:"#CCCCCC",
  success:     "#22C55E",
  shSm:        "0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)",
  shMd:        "0 4px 12px rgba(0,0,0,0.09),0 2px 4px rgba(0,0,0,0.04)",
};

const AVATAR_COLORS = [
  "linear-gradient(135deg,#7A4A22,#5C3518)",
  "linear-gradient(135deg,#7A4A22,#985F2E)",
  "#8B5CF6","#F59E0B","#14B8A6","#EC4899","#3B82F6","#22C55E",
];
function getAvatarColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(u: string) { return (u || "??").slice(0, 2).toUpperCase(); }

const TAG_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  design:      { bg: T.accentDim,  color: T.accent,   border: "rgba(152,95,46,0.2)" },
  technology:  { bg: T.accentDim,  color: T.accent,   border: "rgba(152,95,46,0.2)" },
  development: { bg: "rgba(122,74,34,0.1)", color: T.secondary, border: "rgba(122,74,34,0.2)" },
  career:      { bg: "rgba(34,197,94,0.1)",  color: "#22C55E",  border: "rgba(34,197,94,0.2)" },
  "open source":{ bg:"rgba(34,197,94,0.1)", color: "#22C55E",  border: "rgba(34,197,94,0.2)" },
  ai:          { bg: "rgba(139,92,246,0.1)", color: "#8B5CF6",  border: "rgba(139,92,246,0.2)" },
  startup:     { bg: "rgba(245,158,11,0.1)", color: "#F59E0B",  border: "rgba(245,158,11,0.2)" },
};
function tagStyle(tag?: string) {
  const key = (tag || "").toLowerCase();
  return TAG_COLORS[key] ?? { bg: T.surfaceAlt, color: T.muted, border: T.border };
}

const TOPICS = [
  "Technology","Design","Development","Productivity","Startup",
  "AI & ML","Career","Open Source","Writing","Philosophy",
  "Science","Finance","Data Science","DevOps","UX Research","Leadership",
];

function HeartSVG() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function CommentSVG() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Avatar({ user, size = 28, fontSize = 10 }: { user: any; size?: number; fontSize?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: getAvatarColor(user?.username || ""),
        color: "white", fontWeight: 800, fontSize,
      }}
    >
      {user?.profileImage?.url
        ? <img src={user.profileImage.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials(user?.username || "")}
    </div>
  );
}

export default function HomeContent() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/blog", { params: { page: 1, limit: 10, query: "a" } });
        if (res.data?.statusCode === 200) {
          setBlogs(res.data.data);
          setHasMore(res.data.hasMore);
        }
      } catch {}
    })();
  }, []);

  const featured = blogs[0];
  const trending  = blogs.slice(0, 5);
  const recent    = blogs.slice(1);

  const authorMap = new Map<string, any>();
  blogs.forEach((b) => {
    const a = b.authorDetails; if (!a) return;
    const key = a._id || a.username;
    if (!authorMap.has(key)) authorMap.set(key, { ...a, blogCount: 0, likeTotal: 0 });
    const e = authorMap.get(key);
    if (e) { e.blogCount++; e.likeTotal += b.likeCount || 0; }
  });
  const authors = Array.from(authorMap.values()).slice(0, 4);

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh" }}>

      {/* ══════════ HERO ══════════ */}
      <section
        style={{ background: "linear-gradient(135deg,#FDF6F0 0%,#FBF0E8 60%,#FDF4EE 100%)", borderBottom: `1px solid ${T.border}` }}
        aria-label="Featured article"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px" }}>
          {featured ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="max-lg:grid-cols-1">
              {/* Left: text */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  {featured.tag?.[0] && (
                    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, background: T.accentDim, color: T.accent, border: "1px solid rgba(152,95,46,0.2)" }}>
                      {featured.tag[0]}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>Featured</span>
                </div>

                <h1 style={{ fontSize: "clamp(28px,3.4vw,48px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, color: T.text, marginBottom: 16 }}>
                  {featured.title}
                </h1>

                {featured.description && (
                  <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.75, marginBottom: 28, maxWidth: 480 }}>
                    {featured.description}
                  </p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, fontSize: 13, color: T.muted }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Avatar user={featured.authorDetails} size={28} fontSize={10} />
                    <span style={{ fontWeight: 600, color: T.text2 }}>{featured.authorDetails?.username}</span>
                  </div>
                  <span>·</span>
                  <span>{new Date(featured.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span>·</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <HeartSVG /> {featured.likeCount ?? 0}
                  </span>
                </div>

                <Link
                  href={`/blog/${featured._id}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 600, background: T.accent, color: "white", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.accentHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = T.accent)}
                >
                  Read Story →
                </Link>
              </div>

              {/* Right: cover image */}
              <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", background: T.surfaceAlt, boxShadow: T.shMd }}>
                {featured.coverImage?.url ? (
                  <img src={featured.coverImage.url} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(-45deg,#EFEFEF 0px,#EFEFEF 1.5px,#F8F9FA 1.5px,#F8F9FA 14px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "#999", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Cover Photo</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* skeleton */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }} className="max-lg:grid-cols-1">
              <div>
                <div style={{ height: 20, width: 120, background: "#E5E5E5", borderRadius: 6, marginBottom: 20 }} />
                <div style={{ height: 44, width: "80%", background: "#E5E5E5", borderRadius: 8, marginBottom: 12 }} />
                <div style={{ height: 44, width: "60%", background: "#E5E5E5", borderRadius: 8, marginBottom: 20 }} />
                <div style={{ height: 16, width: "70%", background: "#EEEEEE", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 16, width: "50%", background: "#EEEEEE", borderRadius: 6, marginBottom: 32 }} />
                <div style={{ height: 44, width: 140, background: "#E5E5E5", borderRadius: 10 }} />
              </div>
              <div style={{ borderRadius: 16, aspectRatio: "16/9", background: "#E5E5E5" }} />
            </div>
          )}
        </div>
      </section>

      {/* ══════════ TRENDING BAR ══════════ */}
      {trending.length > 0 && (
        <div role="region" aria-label="Trending articles" style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          {/* label row */}
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ padding: "12px 0" }}>
              <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" as const, fontWeight: 700, color: T.muted }}>Trending Now</span>
            </div>
          </div>
          {/* full-width separator + items row */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex" }}>
              {trending.map((post, idx) => (
                <TrendingItem key={post._id} post={post} idx={idx} total={trending.length} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ RECENT POSTS ══════════ */}
      <section style={{ padding: "72px 0" }} aria-labelledby="recent-hd">
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
            <h2 id="recent-hd" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: T.accent }}>Recent Posts</h2>
            <Link
              href="/articles"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "transparent", color: T.muted, border: `1.5px solid ${T.border}`, textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.borderStrong; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
            >
              View all →
            </Link>
          </div>

          {blogs.length === 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(i => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}`, background: T.surface }}>
                  <div style={{ aspectRatio: "16/9", background: T.surfaceAlt }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ height: 12, width: 64, background: T.surfaceAlt, borderRadius: 6, marginBottom: 12 }} />
                    <div style={{ height: 16, width: "75%", background: T.surfaceAlt, borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 12, width: "100%", background: T.surfaceAlt, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{ display: "grid", gap: 24 }}
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {recent.map((post, i) => (
                <BlogCard key={post._id || i} post={post} />
              ))}
            </div>
          )}

          {hasMore && (
            <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
              <button
                style={{ padding: "12px 32px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: "transparent", color: T.text2, border: `1.5px solid ${T.border}`, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text2; e.currentTarget.style.borderColor = T.border; }}
              >
                View More Articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ POPULAR AUTHORS ══════════ */}
      {authors.length > 0 && (
        <section
          aria-labelledby="authors-hd"
          style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "64px 0" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
              <h2 id="authors-hd" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: T.accent }}>Popular Authors</h2>
              <a
                href="#"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "transparent", color: T.muted, border: `1.5px solid ${T.border}`, textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.borderStrong; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
              >
                See all →
              </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="max-md:grid-cols-2">
              {authors.map((author) => (
                <AuthorBento key={author._id || author.username} author={author} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ EXPLORE TOPICS ══════════ */}
      <section style={{ padding: "72px 0" }} aria-labelledby="topics-hd">
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
            <h2 id="topics-hd" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: T.accent }}>Explore Topics</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
            {TOPICS.map(topic => (
              <TopicPill key={topic} label={topic} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Trending Item ── */
function TrendingItem({ post, idx, total }: { post: any; idx: number; total: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/blog/${post._id}`}
      style={{
        flex: "1 1 0",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "16px 20px",
        borderRight: idx < total - 1 ? `1px solid ${T.border}` : "none",
        textDecoration: "none",
        color: "inherit",
        background: hovered ? T.surfaceAlt : "transparent",
        transition: "background 0.15s",
        minWidth: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: T.borderStrong, lineHeight: 1, flexShrink: 0, minWidth: 32 }}>
        {String(idx + 1).padStart(2, "0")}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: 4, color: T.text, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {post.title}
        </div>
        <div style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {post.authorDetails?.username}
        </div>
      </div>
    </Link>
  );
}

/* ── Blog Card ── */
function BlogCard({ post }: { post: any }) {
  const [hovered, setHovered] = useState(false);
  const ts = tagStyle(post.tag?.[0]);

  return (
    <article
      style={{
        background: "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden",
        boxShadow: hovered ? T.shMd : T.shSm, transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.2s", cursor: "pointer", display: "flex", flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.location.href = `/blog/${post._id}`}
    >
      {/* cover */}
      <div style={{ aspectRatio: "16/9", width: "100%", overflow: "hidden" }}>
        {post.coverImage?.url ? (
          <img src={post.coverImage.url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.5s" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(-45deg,#F5F5F5 0px,#F5F5F5 1.5px,#FFFFFF 1.5px,#FFFFFF 14px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 10px", background: "#FFFFFF", borderRadius: 6, border: `1px solid ${T.border}` }}>cover photo</span>
          </div>
        )}
      </div>

      {/* body */}
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        {post.tag?.[0] && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" as const }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>
              {post.tag[0]}
            </span>
          </div>
        )}

        <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.35, color: hovered ? T.accent : T.text, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", transition: "color 0.15s" }}>
          {post.title}
        </h3>

        {post.description && (
          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 16, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {post.description}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar user={post.authorDetails} size={28} fontSize={10} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{post.authorDetails?.username}</div>
              <div style={{ fontSize: 11, color: T.muted }}>
                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.muted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}><HeartSVG />{post.likeCount ?? 0}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}><CommentSVG />{post.commentCount ?? 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Author Bento ── */
function AuthorBento({ author }: { author: any }) {
  const [hovered, setHovered] = useState(false);
  const [following, setFollowing] = useState(false);

  return (
    <div
      style={{
        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
        padding: "28px 20px 24px", textAlign: "center",
        boxShadow: hovered ? T.shMd : T.shSm, transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/profile/${author._id}`} style={{ textDecoration: "none" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: getAvatarColor(author.username || ""), color: "white", fontWeight: 800, fontSize: 20 }}>
          {author.profileImage?.url
            ? <img src={author.profileImage.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initials(author.username || "")}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 3, color: T.text }}>{author.username}</div>
      </Link>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>
        {author.likeTotal} likes · {author.blogCount} {author.blogCount === 1 ? "post" : "posts"}
      </div>
      <div style={{ marginBottom: 16 }}>
        <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, background: T.surfaceAlt, color: T.muted, border: `1px solid ${T.border}` }}>
          Writer
        </span>
      </div>
      <button
        onClick={() => setFollowing(f => !f)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
          background: following ? "transparent" : "transparent",
          color: following ? T.success : T.accent,
          border: `1.5px solid ${following ? T.success : T.accent}`,
          cursor: "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={e => { if (!following) { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "white"; } }}
        onMouseLeave={e => { if (!following) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.accent; } }}
      >
        {following ? "Following ✓" : "Follow"}
      </button>
    </div>
  );
}

/* ── Topic Pill ── */
function TopicPill({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/articles"
      style={{
        padding: "8px 18px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
        background: hovered ? T.accentDim : T.surface,
        color: hovered ? T.accent : T.text,
        border: `1.5px solid ${hovered ? "rgba(152,95,46,0.3)" : T.border}`,
        textDecoration: "none", transition: "all 0.15s", display: "inline-block",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  );
}
