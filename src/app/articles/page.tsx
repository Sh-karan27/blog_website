"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Heart, MessageSquare, Eye, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const ACCENT = "#995F2F";
const ACCENT2 = "#7A4A22";
const BORDER = "#E5E5E5";
const TEXT_MUTED = "#666666";
const SURFACE_ALT = "#F5F5F5";

interface BlogCard {
  _id: string;
  title: string;
  description: string;
  coverImage?: { url: string };
  tag?: string[];
  views: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  authorDetails?: { _id: string; username: string; profileImage?: { url: string } };
}

interface Pagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

const SORT_OPTIONS = [
  { label: "Most Recent", sortBy: "createdAt", sortType: "desc" },
  { label: "Most Liked",  sortBy: "likeCount",  sortType: "desc" },
  { label: "Most Viewed", sortBy: "views",       sortType: "desc" },
];

const POPULAR_TAGS = ["Technology", "Design", "Development", "AI", "Startup", "Career", "Open Source", "Productivity"];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtNum(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}
function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function ArticlesPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogCard[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeSort, setActiveSort] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const sort = SORT_OPTIONS[activeSort];
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sortBy: sort.sortBy,
        sortType: sort.sortType,
      };
      if (debouncedQuery) params.query = debouncedQuery;
      if (activeTag) params.tag = activeTag;

      const res = await axiosInstance.get("/blog/", { params });
      setBlogs(res.data.data.blogs);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, activeSort, debouncedQuery, activeTag]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSortChange = (idx: number) => { setActiveSort(idx); setPage(1); };
  const handleTagClick = (tag: string) => { setActiveTag(prev => prev === tag ? null : tag); setPage(1); };
  const clearTag = () => { setActiveTag(null); setPage(1); };

  const totalPages = pagination?.totalPages ?? 1;
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: "#171C20" }}>
      <style>{`
        .ac-title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ac-desc  { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .article-card:hover .ac-title-text { color: ${ACCENT}; }
        .article-card { transition: background 0.15s; }
        .article-card:hover { background: ${SURFACE_ALT}; border-radius: 12px; }
        .sort-pill { transition: all 0.15s; }
        .sort-pill:hover { background: ${SURFACE_ALT}; color: #1A1A1A; }
        .tag-chip { transition: all 0.15s; cursor: pointer; }
        .tag-chip:hover { background: rgba(153,95,47,0.1); color: ${ACCENT}; border-color: rgba(153,95,47,0.25); }
        .page-btn { transition: all 0.15s; }
        .page-btn:hover:not(:disabled):not(.active) { background: ${SURFACE_ALT}; color: #1A1A1A; }
        .search-input:focus { border-color: ${ACCENT} !important; box-shadow: 0 0 0 3px rgba(153,95,47,0.12); }
        .search-input { outline: none; }
        @media (max-width: 900px) { .articles-layout { grid-template-columns: 1fr !important; } .sidebar { display: none; } .mobile-search { display: block !important; } }
        @media (max-width: 600px) { .article-card-grid { grid-template-columns: 100px 1fr !important; gap: 12px !important; } .ac-body { padding: 0 12px !important; } }
        .ink-tip { position: relative; cursor: default; }
        .ink-tip::after {
          content: attr(data-tip);
          position: absolute; bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%) scale(0.9);
          background: #1A1A1A; color: #fff;
          font-size: 11px; font-weight: 600; white-space: nowrap;
          padding: 4px 8px; border-radius: 6px;
          pointer-events: none; opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
          z-index: 99;
        }
        .ink-tip:hover::after { opacity: 1; transform: translateX(-50%) scale(1); }
      `}</style>

      {/* Page header */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, padding: "40px 0 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "#171C20" }}>All Articles</h1>
          <p style={{ fontSize: 14, color: TEXT_MUTED, marginTop: 6 }}>
            {pagination ? `${pagination.totalCount.toLocaleString()} stories published` : "Loading…"}
          </p>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="mobile-search" style={{ display: "none", padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
        <SearchBox value={query} onChange={setQuery} />
      </div>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="articles-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 48, padding: "48px 0 80px", alignItems: "start" }}>

          {/* ── Sidebar ── */}
          <aside className="sidebar" style={{ position: "sticky", top: 80 }}>
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: TEXT_MUTED, marginBottom: 12, display: "block" }}>Search</span>
              <SearchBox value={query} onChange={setQuery} />
            </div>

            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: TEXT_MUTED, marginBottom: 12, display: "block" }}>Sort by</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SORT_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.label}
                    className="sort-pill"
                    onClick={() => handleSortChange(i)}
                    style={{
                      padding: "8px 12px", borderRadius: 8, fontSize: 13,
                      fontWeight: activeSort === i ? 700 : 500,
                      color: activeSort === i ? ACCENT : TEXT_MUTED,
                      background: activeSort === i ? "rgba(153,95,47,0.1)" : "transparent",
                      border: "none", textAlign: "left", width: "100%", cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: TEXT_MUTED, marginBottom: 12, display: "block" }}>Popular Tags</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {POPULAR_TAGS.map(tag => (
                  <button
                    key={tag}
                    className="tag-chip"
                    onClick={() => handleTagClick(tag)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 9999,
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
                      background: activeTag === tag ? "rgba(153,95,47,0.18)" : SURFACE_ALT,
                      color: activeTag === tag ? ACCENT : TEXT_MUTED,
                      border: `1px solid ${activeTag === tag ? ACCENT : BORDER}`,
                      cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div>
            {/* Active filter chip */}
            {activeTag && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: TEXT_MUTED }}>Filtered by:</span>
                <button
                  onClick={clearTag}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", background: "rgba(153,95,47,0.18)", color: ACCENT,
                    border: `1px solid rgba(153,95,47,0.3)`, borderRadius: 9999,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {activeTag}
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Article list */}
            <div role="list">
              {loading ? (
                <ArticleSkeletons />
              ) : blogs.length === 0 ? (
                <EmptyState query={debouncedQuery} tag={activeTag} onClear={() => { setQuery(""); setDebouncedQuery(""); setActiveTag(null); }} />
              ) : (
                blogs.map((blog, i) => (
                  <ArticleCard key={blog._id} blog={blog} first={i === 0} onClick={() => router.push(`/blog/${blog._id}`)} />
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && pagination && totalPages > 1 && (
              <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 48 }} aria-label="Pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  style={pageBtnStyle(false, page === 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                {pageNumbers.map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: TEXT_MUTED, fontSize: 13 }}>…</span>
                  ) : (
                    <button
                      key={p}
                      className={`page-btn${page === p ? " active" : ""}`}
                      onClick={() => setPage(p as number)}
                      aria-current={page === p ? "page" : undefined}
                      style={pageBtnStyle(page === p, false)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="page-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  style={pageBtnStyle(false, page === totalPages)}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Search box ── */
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED, pointerEvents: "none" }} />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles"
        className="search-input"
        style={{
          width: "100%", padding: "9px 12px 9px 38px",
          border: `1.5px solid ${BORDER}`, borderRadius: 8,
          fontSize: 13, fontFamily: "inherit",
          background: "#fff", color: "#1A1A1A",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      />
    </div>
  );
}

/* ── Article card ── */
function ArticleCard({ blog, first, onClick }: { blog: BlogCard; first: boolean; onClick: () => void }) {
  const author = blog.authorDetails;
  return (
    <div
      role="listitem"
      className="article-card"
      onClick={onClick}
      style={{
        display: "grid", cursor: "pointer",
        borderBottom: `1px solid ${BORDER}`,
        borderTop: first ? `1px solid ${BORDER}` : undefined,
        padding: "24px 0",
      }}
    >
      <div className="article-card-grid" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0 }}>
        {/* Thumbnail */}
        <div style={{ aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", background: SURFACE_ALT, flexShrink: 0 }}>
          {blog.coverImage?.url ? (
            <img src={blog.coverImage.url} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `repeating-linear-gradient(-45deg, #EFEFEF 0, #EFEFEF 1.5px, #F8F9FA 1.5px, #F8F9FA 14px)` }} />
          )}
        </div>

        {/* Body */}
        <div className="ac-body" style={{ padding: "0 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Tags */}
            {blog.tag && blog.tag.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {blog.tag.slice(0, 2).map(t => (
                  <span key={t} style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "rgba(153,95,47,0.12)", color: ACCENT, border: "1px solid rgba(153,95,47,0.2)" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {/* Title */}
            <div className="ac-title" style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.015em", lineHeight: 1.3, marginBottom: 8 }}>
              <span className="ac-title-text" style={{ transition: "color 0.15s" }}>{blog.title}</span>
            </div>
            {/* Description */}
            <div className="ac-desc" style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, marginBottom: 16 }}>
              {blog.description}
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: TEXT_MUTED, flexWrap: "wrap" }}>
            {author && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <AuthorAvatar author={author} size={20} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{author.username}</span>
              </div>
            )}
            <span>{fmtDate(blog.createdAt)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Heart size={12} />
              {fmtNum(blog.likeCount)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <MessageSquare size={12} />
              {fmtNum(blog.commentCount)}
            </span>
            <span className="ink-tip" data-tip={`${blog.views} views`} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Eye size={12} />
              {fmtNum(blog.views)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthorAvatar({ author, size }: { author: { username: string; profileImage?: { url: string } }; size: number }) {
  if (author.profileImage?.url) {
    return <img src={author.profileImage.url} alt={author.username} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT2},#5A3820)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>
      {initials(author.username)}
    </div>
  );
}

/* ── Skeleton loaders ── */
function ArticleSkeletons() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0, borderBottom: `1px solid ${BORDER}`, borderTop: i === 0 ? `1px solid ${BORDER}` : undefined, padding: "24px 0" }}>
          <div style={{ aspectRatio: "4/3", borderRadius: 12, background: "#F0F0F0", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ height: 12, width: 60, borderRadius: 6, background: "#F0F0F0", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 16, width: "80%", borderRadius: 6, background: "#F0F0F0", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 16, width: "60%", borderRadius: 6, background: "#F0F0F0", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, width: "90%", borderRadius: 6, background: "#F0F0F0", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, width: "70%", borderRadius: 6, background: "#F0F0F0", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      ))}
    </>
  );
}

/* ── Empty state ── */
function EmptyState({ query, tag, onClear }: { query: string; tag: string | null; onClear: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", borderTop: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8, color: "#1A1A1A" }}>No articles found</h3>
      <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 24 }}>
        {query ? `No results for "${query}"${tag ? ` in ${tag}` : ""}` : tag ? `No articles tagged "${tag}"` : "No articles published yet."}
      </p>
      <button
        onClick={onClear}
        style={{ padding: "8px 20px", borderRadius: 8, background: ACCENT, color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
      >
        Clear filters
      </button>
    </div>
  );
}

/* ── Helpers ── */
function pageBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    width: 36, height: 36, borderRadius: 8,
    border: `1.5px solid ${active ? ACCENT : BORDER}`,
    background: active ? ACCENT : "#fff",
    color: active ? "white" : disabled ? "#CCC" : TEXT_MUTED,
    fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: disabled ? 0.4 : 1,
  };
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
