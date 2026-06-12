import axiosInstance from "@/lib/axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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
  const rest = blogs.slice(1);

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #995F2F 0%, #7A4A22 100%)",
          minHeight: "480px",
        }}
      >
        {/* Decorative dots */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-start justify-center" style={{ minHeight: "480px" }}>
          <span className="inline-block text-[11px] font-black tracking-[0.3em] uppercase text-white/60 mb-4">
            The Writing Platform
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[1.0] max-w-2xl mb-6">
            Stay Ahead in the World of Ideas
          </h1>
          <p className="text-lg text-white/70 max-w-xl mb-10 leading-relaxed">
            Get the latest insights, long-form essays, and analysis on technology, innovation, and digital culture.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/articles"
              className="px-6 py-3 bg-white text-[#995F2F] font-bold rounded-lg hover:bg-[#F5F0EB] transition-colors shadow-lg"
            >
              Explore Articles
            </a>
            <a
              href="/write"
              className="px-6 py-3 bg-transparent border-2 border-white/40 text-white font-semibold rounded-lg hover:border-white hover:bg-white/10 transition-all"
            >
              Start Writing
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-8">

        {/* ── Featured Post ── */}
        {featured && (
          <section className="py-14 border-b border-[#E5E5E5]">
            <span className="text-[11px] font-black tracking-[0.3em] uppercase text-[#995F2F] mb-3 block">
              Featured
            </span>
            <Link href={`/blog/${featured._id}`} className="group flex flex-col lg:flex-row gap-8">
              <div className="lg:w-3/5 aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {featured.coverImage?.url ? (
                  <img
                    src={featured.coverImage.url}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#F5F0EB] to-[#E5D5C5]" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-gray-900 group-hover:text-[#995F2F] transition-colors mb-4 leading-tight line-clamp-3">
                  {featured.title}
                </h2>
                <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6">
                  {featured.description}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E5E5E5] overflow-hidden flex-shrink-0">
                    {featured.authorDetails?.profileImage?.url && (
                      <img
                        src={featured.authorDetails.profileImage.url}
                        alt={featured.authorDetails.username}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {featured.authorDetails?.username}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {featured.likeCount} likes · {featured.commentCount} comments
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ── Recent Posts ── */}
        <section className="py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-[#995F2F] mb-2 block">
                Latest Works
              </span>
              <h2 className="text-3xl font-black tracking-tight text-gray-900">
                Recent Posts
              </h2>
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/9] rounded-xl bg-gray-100 mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <article key={post._id || i} className="group">
                  <Link href={`/blog/${post._id}`} className="block">
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
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

                    <div className="px-1">
                      {post.tag?.[0] && (
                        <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-[#995F2F] mb-2">
                          {post.tag[0]}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#995F2F] transition-colors line-clamp-2 mb-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {post.authorDetails?.profileImage?.url && (
                            <img
                              src={post.authorDetails.profileImage.url}
                              alt={post.authorDetails.username}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {post.authorDetails?.username}
                        </span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-400">
                          {post.likeCount} likes
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 border-2 border-[#995F2F] text-[#995F2F] font-bold rounded-lg hover:bg-[#995F2F] hover:text-white transition-all">
                View More Articles
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomeContent;
