import axiosInstance from "@/lib/axios";
import React, { useEffect, useState } from "react";

const HomeContent = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const getBlogs = async (
    page: number = 1,
    query: string = "",
    sortBy?: string,
    sortType?: "asc" | "desc"
  ) => {
    try {
      const params: any = { page, limit: 10 };

      if (query) params.query = query;
      if (sortBy) params.sortBy = sortBy;
      if (sortType) params.sortType = sortType;

      const res = await axiosInstance.get("/blog", { params });
      return res.data; // { statusCode, data, message }
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

  return (
    <div className="font-display bg-white">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <section className="relative h-[500px] rounded-xl bg-cover bg-center text-white">
          <div className="absolute inset-0 rounded-xl bg-black/50"></div>
          <div
            className="absolute inset-0 bg-cover bg-center rounded-xl"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBaRAEqRyNElOTYhweta4spMmswZRCqYXimDDqb63u8uUlrx8cRMemmtkKkAUyXyuJs8w2Bo1GXDHnF5TjWn_Kyt-OwU1x2C8rnxpAeHGD4rnbVc_1VPBeb35wMESf2LNDvF_EFg215uGIac3E0YdSPi4N3jVI4cunjops9a3fYIgEFdsSWor2ey0SrA8SZOODrWGZgZH3hRJGp0LTX2E5khSIIKpXCpxS-ndoXY9SuYVhdX_ANkFrGccEVEbsnP3D3zxsExC9Cp5I")',
            }}
          ></div>
          <div className="relative z-10 flex h-full flex-col items-start justify-end p-8 md:p-12">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Stay Ahead in the Tech World
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-200">
              Get the latest insights, trends, and analysis on technology,
              innovation, and digital transformation.
            </p>
            <button className="mt-8 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-hover">
              Explore Articles
            </button>
          </div>
        </section>

        {/* Recent Posts Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Recent Posts
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {blogs.length > 0 ? (
              blogs.map((post, i) => (
                <article
                  key={post._id || i}
                  className="flex flex-col items-start justify-between"
                >
                  <div className="relative w-full">
                    <div
                      className="aspect-[16/9] w-full rounded-lg bg-cover bg-center sm:aspect-[2/1] lg:aspect-[3/2]"
                      style={{
                        backgroundImage: `url("${post.coverImage?.url || ""}")`,
                      }}
                    ></div>
                    <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                  </div>

                  <div className="max-w-xl">
                    <div className="group relative mt-4">
                      <h3 className="text-lg font-semibold leading-6 text-black">
                        <a href="#">
                          <span className="absolute inset-0 line-clamp-1"></span>
                          {post.title}
                        </a>
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {post.description}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        by {post.authorDetails?.username} • {post.likeCount}{" "}
                        Likes • {post.commentCount} Comments
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-gray-500 mt-6">Loading blogs...</p>
            )}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button className="mt-8 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-hover">
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
