"use client";

import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import LoadingScreen from "@/components/LoadingScreen";

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage: { url: string };
  createdAt: string;
  likeCount: number;
  views: number;
  commentCount: number;
  tag: string[];
}

interface UserChannel {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profileImage: { url: string };
  coverImage: { url: string };
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollower: boolean;
  isOwner: boolean;
  createdAt: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtN = (n: number) => {
  const v = n ?? 0;
  return v > 999 ? (v / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(v);
};

const readTime = (post: Pick<Blog, "content">) =>
  Math.max(1, Math.ceil((post.content || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length / 200));

const GRID_PAGE_SIZE = 6;

export default function ProfilePage() {
  const { profileId } = useParams() as { profileId: string };

  const [userChannel, setUserChannel] = useState<UserChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [publishedPosts, setPublishedPosts] = useState<Blog[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalReads, setTotalReads] = useState(0);
  const [popularPosts, setPopularPosts] = useState<Blog[]>([]);

  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"published" | "popular" | "about">("published");

  const isOwner = userChannel?.isOwner;

  useEffect(() => {
    if (!profileId) return;

    (async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const [profileRes, publishedRes, popularRes, readsRes] = await Promise.all([
          axiosInstance.get(`/users/c/${profileId}`),
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: GRID_PAGE_SIZE + 1, sortBy: "createdAt", sortType: "desc" } }),
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: 5, sortBy: "views", sortType: "desc" } }),
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: 200, sortBy: "views", sortType: "desc" } }),
        ]);

        const user = profileRes.data?.data?.[0];
        if (!user) {
          setNotFound(true);
          return;
        }

        setUserChannel({
          _id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          profileImage: user.profileImage,
          coverImage: user.coverImage,
          followerCount: user.followerCount ?? 0,
          followingCount: user.followingToCount ?? 0,
          isFollowing: user.isFollowing,
          isFollower: user.isFollower,
          isOwner: user.isOwner,
          createdAt: user.createdAt,
        });
        setIsFollowing(user.isFollowing ?? false);

        setPublishedPosts(publishedRes.data?.data?.blogs ?? []);
        setTotalArticles(publishedRes.data?.data?.pagination?.totalCount ?? 0);
        setHasMorePosts(publishedRes.data?.data?.pagination?.hasMore ?? false);
        setPostsPage(1);

        setPopularPosts(popularRes.data?.data?.blogs ?? []);

        const readsBlogs: Blog[] = readsRes.data?.data?.blogs ?? [];
        setTotalReads(readsBlogs.reduce((sum, b) => sum + (b.views ?? 0), 0));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = postsPage + 1;
      const res = await axiosInstance.get(`/blog/u/${profileId}`, {
        params: { page: nextPage, limit: GRID_PAGE_SIZE, sortBy: "createdAt", sortType: "desc" },
      });
      setPublishedPosts((prev) => [...prev, ...(res.data?.data?.blogs ?? [])]);
      setHasMorePosts(res.data?.data?.pagination?.hasMore ?? false);
      setPostsPage(nextPage);
    } catch {
      toast.error("Failed to load more articles");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      setUploadingProfile(true);
      const res = await axiosInstance.patch("/users/profile-image", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const profileImage = res.data.data.profileImage;
      setUserChannel((prev) => (prev ? { ...prev, profileImage } : prev));
      localStorage.setItem("profileImage", profileImage.url);
      toast.success("Profile image updated");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("coverImage", file);
    try {
      setUploadingCover(true);
      const res = await axiosInstance.patch("/users/cover-image", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const coverImage = res.data.data.coverImage;
      setUserChannel((prev) => (prev ? { ...prev, coverImage } : prev));
      toast.success("Cover image updated");
    } catch {
      toast.error("Failed to upload cover");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileId) return;
    try {
      setFollowLoading(true);
      const res = await axiosInstance.post(`/follow/p/${profileId}`);
      const following = res.data?.data?.following;
      setIsFollowing(following);
      setUserChannel((prev) =>
        prev ? { ...prev, followerCount: following ? prev.followerCount + 1 : prev.followerCount - 1 } : prev,
      );
      toast.success(res.data?.message);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <LoadingScreen status="Loading profile…" />;

  if (notFound || !userChannel) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400 text-sm">
        Profile not found
      </div>
    );
  }

  const featured = publishedPosts[0];
  const gridPosts = publishedPosts.slice(1);
  const writtenAboutTags = Array.from(
    new Set([...publishedPosts, ...popularPosts].flatMap((p) => p.tag ?? [])),
  ).slice(0, 8);

  return (
    <div>
      {/* ══ COVER ══ */}
      <div className="group relative cover-ph h-52 sm:h-64">
        {userChannel.coverImage?.url && (
          <img src={userChannel.coverImage.url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {isOwner && (
          <>
            <button
              onClick={() => coverImageRef.current?.click()}
              disabled={uploadingCover}
              className="absolute bottom-4 right-4 z-10 h-9 px-3.5 rounded-full bg-zinc-950/70 dark:bg-white/15 text-white text-[13px] font-medium inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
            >
              {uploadingCover ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              {uploadingCover ? "Uploading…" : "Change cover"}
            </button>
            <input ref={coverImageRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
          </>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        {/* ══ IDENTITY ══ */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-14 mb-8">
          <div className="flex items-end gap-5">
            <div className="group relative w-28 h-28 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950 flex items-center justify-center text-3xl font-black text-zinc-500 dark:text-zinc-300 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] shrink-0 overflow-hidden">
              {userChannel.profileImage?.url ? (
                <img src={userChannel.profileImage.url} alt={userChannel.username} className="w-full h-full object-cover" />
              ) : (
                userChannel.username?.[0]?.toUpperCase() ?? "?"
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => profileImageRef.current?.click()}
                    disabled={uploadingProfile}
                    className="absolute inset-0 rounded-full bg-zinc-950/55 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Change avatar"
                  >
                    {uploadingProfile ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-[18px] h-[18px]" />
                    )}
                  </button>
                  <input ref={profileImageRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                </>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-3xl font-black tracking-[-0.03em] mb-1.5">{userChannel.username}</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                @{userChannel.username}
                {userChannel.createdAt && ` · Joined ${new Date(userChannel.createdAt).getFullYear()}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 pb-1">
            {isOwner ? (
              <>
                <Link
                  href="/settings"
                  className="h-10 px-4 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-semibold inline-flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Edit profile
                </Link>
                <Link
                  href="/write"
                  className="h-10 px-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold inline-flex items-center gap-2 hover:bg-zinc-700 dark:hover:bg-white transition-colors shadow-sm"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Write
                </Link>
              </>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`h-10 px-5 rounded-full text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60 ${
                  isFollowing
                    ? "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white"
                }`}
              >
                {followLoading ? "Please wait…" : isFollowing ? "Following" : userChannel.isFollower ? "Follow back" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* ══ BIO ══ */}
        {userChannel.bio && (
          <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mb-6">{userChannel.bio}</p>
        )}
        {userChannel.email && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500 mb-10">
            <span className="inline-flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
              {userChannel.email}
            </span>
          </div>
        )}

        {/* ══ STATS BENTO ══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-16">
          {[
            { value: fmtN(userChannel.followerCount), label: "Followers" },
            { value: fmtN(userChannel.followingCount), label: "Following" },
            { value: fmtN(totalArticles), label: "Articles" },
            { value: fmtN(totalReads), label: "Total reads" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-zinc-950 p-5">
              <p className="text-2xl font-black tracking-[-0.02em]">{s.value}</p>
              <p className="text-[11px] text-zinc-400 uppercase tracking-[0.16em] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ══ CONTENT TABS ══ */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 mb-10">
          <div className="flex gap-7 text-sm -mb-px" role="tablist" aria-label="Profile content">
            {[
              { key: "published" as const, label: "Published", count: totalArticles },
              { key: "popular" as const, label: "Popular" },
              { key: "about" as const, label: "About" },
            ].map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                onClick={() => setActiveTab(t.key)}
                className={`pb-3.5 border-b-2 transition-colors ${
                  activeTab === t.key
                    ? "font-semibold border-zinc-900 dark:border-zinc-100"
                    : "font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent"
                }`}
              >
                {t.label} {t.count !== undefined && <span className="text-zinc-400 font-normal">{t.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ══ PANEL: PUBLISHED ══ */}
        {activeTab === "published" && (
          <section className="pb-20">
            {publishedPosts.length === 0 ? (
              <p className="text-center py-16 text-sm text-zinc-400">No published articles yet.</p>
            ) : (
              <>
                {featured && (
                  <Link
                    href={`/blog/${featured._id}`}
                    className="group grid md:grid-cols-2 gap-7 items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-[0_20px_48px_-24px_rgba(0,0,0,0.25)] transition-all mb-12"
                  >
                    <div className="card-media rounded-xl">
                      <div className="img-ph aspect-[16/10]">
                        {featured.coverImage?.url && (
                          <img src={featured.coverImage.url} alt={featured.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                    <div className="px-3 md:px-2 py-2">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {featured.tag?.[0] ?? "Essay"}
                        </span>
                        <span className="text-xs text-zinc-400">{fmtDate(featured.createdAt)}</span>
                      </div>
                      <h3 className="text-2xl font-black tracking-[-0.02em] leading-tight mb-3 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                        {featured.title}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed mb-5 line-clamp-2">{featured.description}</p>
                      <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                        <span>♡ {fmtN(featured.likeCount)}</span>
                        <span>{fmtN(featured.commentCount)} comments</span>
                        <span>{fmtN(featured.views)} views</span>
                        <span className="ml-auto">{readTime(featured)} min read</span>
                      </div>
                    </div>
                  </Link>
                )}

                {gridPosts.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-12">
                    {gridPosts.map((post) => (
                      <Link key={post._id} href={`/blog/${post._id}`} className="group block">
                        <div className="card-media rounded-xl mb-4">
                          <div className="img-ph aspect-[16/10]">
                            {post.coverImage?.url && (
                              <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-2">{post.tag?.[0] ?? "Essay"}</p>
                        <h3 className="text-[17px] font-bold tracking-[-0.01em] leading-snug mb-2 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-3 line-clamp-2">{post.description}</p>
                        <p className="text-xs text-zinc-400 font-medium">
                          {fmtDate(post.createdAt)} · ♡ {fmtN(post.likeCount)} · {readTime(post)} min
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {hasMorePosts && (
                  <div className="flex justify-center mt-14">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="h-10 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-60"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ══ PANEL: POPULAR ══ */}
        {activeTab === "popular" && (
          <section className="pb-20">
            {popularPosts.length === 0 ? (
              <p className="text-center py-16 text-sm text-zinc-400">No articles yet.</p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {popularPosts.map((post, i) => (
                  <Link key={post._id} href={`/blog/${post._id}`} className="group flex items-center gap-5 py-5">
                    <span className="text-4xl font-black text-zinc-200 dark:text-zinc-800 tabular-nums w-12 text-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="card-media rounded-lg w-24 h-16 shrink-0">
                      <div className="img-ph w-24 h-16">
                        {post.coverImage?.url && (
                          <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold tracking-[-0.01em] leading-snug mb-1 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">
                        {fmtN(post.views)} views · ♡ {fmtN(post.likeCount)} · {fmtDate(post.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══ PANEL: ABOUT ══ */}
        {activeTab === "about" && (
          <section className="pb-20">
            <div className="grid md:grid-cols-[1fr_260px] gap-12 max-w-4xl">
              <div>
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-4">Biography</h2>
                <div className="text-[15px] leading-[1.75] text-zinc-600 dark:text-zinc-300 space-y-4">
                  {userChannel.bio ? <p>{userChannel.bio}</p> : <p className="text-zinc-400">This writer hasn&apos;t added a bio yet.</p>}
                </div>

                {writtenAboutTags.length > 0 && (
                  <>
                    <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mt-10 mb-4">Writes about</h2>
                    <div className="flex flex-wrap gap-2">
                      {writtenAboutTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-[13px] font-medium text-zinc-600 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <aside>
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-4">Details</h2>
                <dl className="space-y-4 text-sm">
                  {userChannel.createdAt && (
                    <div className="flex items-center gap-3 text-zinc-500">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      Joined {fmtDate(userChannel.createdAt)}
                    </div>
                  )}
                  {userChannel.email && (
                    <div className="flex items-center gap-3 text-zinc-500">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-10 5L2 7" />
                      </svg>
                      {userChannel.email}
                    </div>
                  )}
                </dl>
              </aside>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
