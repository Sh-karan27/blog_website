"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Search } from "lucide-react";

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
  { label: "Most recent", sortBy: "createdAt", sortType: "desc" },
  { label: "Most liked", sortBy: "likeCount", sortType: "desc" },
  { label: "Most viewed", sortBy: "views", sortType: "desc" },
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
    <main className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
      {/* ══ HEADER ══ */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-[-0.02em] mb-2">All articles</h1>
        <p className="text-sm text-zinc-500">
          {pagination ? `${pagination.totalCount.toLocaleString()} stories` : "Loading…"}
        </p>
      </div>

      {/* Mobile search */}
      <div className="lg:hidden mb-8">
        <SearchBox value={query} onChange={setQuery} />
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-12 items-start">
        {/* ══ SIDEBAR ══ */}
        <aside className="hidden lg:block sticky top-24 space-y-8">
          <SearchBox value={query} onChange={setQuery} />

          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-400 mb-3">Sort by</p>
            <div className="flex flex-col gap-1 text-sm" role="radiogroup" aria-label="Sort order">
              {SORT_OPTIONS.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => handleSortChange(i)}
                  role="radio"
                  aria-checked={activeSort === i}
                  className={
                    activeSort === i
                      ? "text-left px-3 py-1.5 rounded-md font-medium bg-zinc-100 dark:bg-zinc-900"
                      : "text-left px-3 py-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-400 mb-3">Popular tags</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={
                    activeTag === tag
                      ? "px-2.5 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium"
                      : "px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors"
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ══ RESULTS ══ */}
        <div>
          {/* Active filter chip */}
          {activeTag && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-zinc-400">Filtered by</span>
              <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-xs font-medium">
                {activeTag}
                <button
                  onClick={clearTag}
                  className="w-4 h-4 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  aria-label="Clear tag filter"
                >
                  ✕
                </button>
              </span>
            </div>
          )}

          {/* Article list */}
          {loading ? (
            <ArticleSkeletons />
          ) : blogs.length === 0 ? (
            <EmptyState
              query={debouncedQuery}
              tag={activeTag}
              onClear={() => { setQuery(""); setDebouncedQuery(""); setActiveTag(null); }}
            />
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {blogs.map((blog, i) => (
                <ArticleRow key={blog._id} blog={blog} first={i === 0} onClick={() => router.push(`/blog/${blog._id}`)} />
              ))}
            </div>
          )}

          {/* ══ PAGINATION ══ */}
          {!loading && pagination && totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-1 mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800"
              aria-label="Pagination"
            >
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className={`h-8 px-3 rounded-md text-sm ${
                  page === 1
                    ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                }`}
              >
                ← Prev
              </button>
              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-zinc-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    aria-current={page === p ? "page" : undefined}
                    className={
                      page === p
                        ? "w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium"
                        : "w-8 h-8 rounded-md text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    }
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className={`h-8 px-3 rounded-md text-sm ${
                  page === totalPages
                    ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                }`}
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}

/* ── Search box ── */
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 focus-within:border-transparent transition-shadow">
      <Search size={13} className="text-zinc-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search…"
        aria-label="Search articles"
        className="flex-1 bg-transparent outline-none placeholder:text-zinc-400 min-w-0"
      />
    </div>
  );
}

/* ── Article row ── */
function ArticleRow({ blog, first, onClick }: { blog: BlogCard; first: boolean; onClick: () => void }) {
  const author = blog.authorDetails;
  return (
    <a
      onClick={(e) => { e.preventDefault(); onClick(); }}
      href={`/blog/${blog._id}`}
      className={`group grid sm:grid-cols-[200px_1fr] gap-6 py-7 cursor-pointer ${first ? "first:pt-0" : ""}`}
    >
      {/* Thumbnail */}
      {blog.coverImage?.url ? (
        <div className="aspect-video sm:aspect-[4/3] rounded-md overflow-hidden">
          <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="img-ph aspect-video sm:aspect-[4/3] rounded-md flex items-center justify-center">
          <span className="font-mono text-[10px] text-zinc-400">cover</span>
        </div>
      )}

      {/* Body */}
      <div className="min-w-0">
        {blog.tag && blog.tag.length > 0 && (
          <div className="flex gap-1.5 mb-2.5">
            {blog.tag.slice(0, 2).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {t}
              </span>
            ))}
          </div>
        )}
        <h2 className="text-lg font-bold tracking-[-0.01em] leading-snug mb-2 group-hover:underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-4 line-clamp-2">
          {blog.title}
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-3 line-clamp-2">{blog.description}</p>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          {author && (
            <>
              <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-semibold text-zinc-600 dark:text-zinc-300 overflow-hidden shrink-0">
                {author.profileImage?.url ? (
                  <img src={author.profileImage.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials(author.username)
                )}
              </span>
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">{author.username}</span>
            </>
          )}
          <span>· {fmtDate(blog.createdAt)}</span>
          <span className="ml-auto">♡ {fmtNum(blog.likeCount)} · {fmtNum(blog.commentCount)}</span>
        </div>
      </div>
    </a>
  );
}

/* ── Skeleton loaders ── */
function ArticleSkeletons() {
  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid sm:grid-cols-[200px_1fr] gap-6 py-7 first:pt-0">
          <div className="aspect-video sm:aspect-[4/3] rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-3 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ query, tag, onClear }: { query: string; tag: string | null; onClear: () => void }) {
  return (
    <div className="text-center py-20 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xl font-bold tracking-[-0.02em] mb-2">No articles found</h3>
      <p className="text-sm text-zinc-500 mb-6">
        {query
          ? `No results for "${query}"${tag ? ` in ${tag}` : ""}`
          : tag
          ? `No articles tagged "${tag}"`
          : "No articles published yet."}
      </p>
      <button
        onClick={onClear}
        className="h-9 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}

/* ── Helpers ── */
function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
