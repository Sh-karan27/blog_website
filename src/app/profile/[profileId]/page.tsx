"use client";

import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage: { url: string };
  author: { username: string; profileImage: { url: string } };
  createdAt: string;
  likeCount: number;
  views: number;
  commentCount: number;
  tag: string[];
}

interface CurrentUser {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profileImage: { url: string; public_id: string };
  coverImage: { url: string; public_id: string };
  createdAt: string;
  followerCount: number;
  followingToCount: number;
  isFollowing: boolean;
  isOwner: boolean;
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

const FEATURES = [
  {
    icon: "👁",
    title: "Visionary Approach",
    desc: "Pioneering the 'Slow Tech' movement, focusing on long-form digital engagement over ephemeral scrolling habits.",
    cta: "Read Manifesto",
  },
  {
    icon: "✓",
    title: "Editorial Standards",
    desc: "A commitment to rigorous verification and scholarly depth, ensuring every curation stands the test of time.",
    cta: "View Ethics",
  },
  {
    icon: "🌐",
    title: "Global Influence",
    desc: "Connecting diverse design philosophies from Tokyo to Berlin, fostering a truly international curation landscape.",
    cta: "Network",
  },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const CuratorProfile = () => {
  const { profileId } = useParams() as { profileId: string };
  const router = useRouter();

  const [userChannel, setUserChannel] = useState<UserChannel | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
  const [mostLiked, setMostLiked] = useState<Blog[]>([]);
  const [mostViewed, setMostViewed] = useState<Blog[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwner = userChannel?.isOwner;

  useEffect(() => {
    if (!profileId) return;

    const fetchAll = async () => {
      try {
        setLoadingProfile(true);
        setLoadingPosts(true);

        const [profileRes, recentRes, likedRes, viewedRes] = await Promise.all([
          axiosInstance.get(`/users/c/${profileId}`),
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: 5, sortBy: "createdAt", sortType: "desc" } }),
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: 3, sortBy: "likeCount", sortType: "desc" } }),
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: 3, sortBy: "views", sortType: "desc" } }),
        ]);

        const user = profileRes.data?.data?.[0];
        if (user) {
          const mappedUser: UserChannel = {
            _id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
            followerCount: user.followerCount,
            followingCount: user.followingToCount,
            isFollowing: user.isFollowing,
            isFollower: user.isFollower,
            isOwner: user.isOwner,
            createdAt: user.createdAt,
          };
          setUserChannel(mappedUser);
          setIsFollowing(user.isFollowing ?? false);
        }

        const extract = (res: any): Blog[] => res.data?.data?.blogs ?? [];
        setRecentPosts(extract(recentRes));
        setMostLiked(extract(likedRes));
        setMostViewed(extract(viewedRes));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoadingProfile(false);
        setLoadingPosts(false);
      }
    };

    fetchAll();
  }, [profileId]);

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
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };

  const displayImage = userChannel?.profileImage?.url;
  const displayCover = userChannel?.coverImage?.url;
  const displayUsername = userChannel?.username;
  const displayEmail = userChannel?.email;
  const displayBio = userChannel?.bio;
  const displayCreatedAt = userChannel?.createdAt;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans text-[#171c20]">
      <main className="pt-0 pb-20">
        {/* ── Cover Banner ── */}
        <div className="relative w-full h-48 sm:h-64 group">
          {displayCover ? (
            <img src={displayCover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#985F2E] to-[#7A4A22]" />
          )}
          {isOwner && (
            <>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              <button
                onClick={() => coverImageRef.current?.click()}
                disabled={uploadingCover}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white text-sm font-medium rounded-lg transition-all backdrop-blur-sm"
              >
                {uploadingCover ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {uploadingCover ? "Uploading..." : "Change Cover"}
              </button>
              <input ref={coverImageRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
            </>
          )}
        </div>

        {/* ── Profile Image + Name Row ── */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-14 mb-10">
            {/* Avatar */}
            <div className="relative group flex-shrink-0 z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#E5E5E5]">
                {displayImage ? (
                  <img src={displayImage} alt={displayUsername ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#985F2E] to-[#7A4A22] flex items-center justify-center text-white text-2xl font-bold">
                    {displayUsername?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              {isOwner && (
                <>
                  <button
                    onClick={() => profileImageRef.current?.click()}
                    disabled={uploadingProfile}
                    className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
                  >
                    {uploadingProfile ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                  <input ref={profileImageRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                </>
              )}
            </div>

            {/* Name + Email */}
            <div className="pb-1">
              <div className="flex items-center gap-4 sm:mt-14">
                <h2 className="text-xl sm:text-2xl font-black text-[#171c20] leading-none">
                  {displayUsername ?? "..."}
                </h2>

                {!isOwner && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 shadow-sm border ${
                      isFollowing
                        ? "bg-[#1A0E04] text-white border-transparent hover:bg-black"
                        : "bg-[#985F2E] text-white border-transparent hover:bg-[#7A4A22]"
                    } ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {followLoading ? "Please wait..." : isFollowing ? "Following" : userChannel?.isFollower ? "Follow Back" : "Follow"}
                  </button>
                )}
              </div>

              {displayEmail && (
                <p className="text-sm text-[#6e7881] mt-2">{displayEmail}</p>
              )}
            </div>
          </div>

          {/* Bio + Stats */}
          <div className="max-w-3xl mb-16 sm:mb-24">
            {loadingProfile ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-[#E5E5E5] rounded w-24" />
                <div className="h-12 bg-[#E5E5E5] rounded w-64" />
                <div className="h-4 bg-[#E5E5E5] rounded w-full" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="px-3 py-1 bg-[#F5F0EB] text-[#985F2E] text-[11px] font-black tracking-widest uppercase rounded-full">
                    Writer
                  </span>
                  {displayCreatedAt && (
                    <span className="px-3 py-1 bg-[#F5F0EB] text-[#985F2E] text-[11px] font-black tracking-widest uppercase rounded-full">
                      Since {new Date(displayCreatedAt).getFullYear()}
                    </span>
                  )}
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-[#171c20] mb-6 sm:mb-8 leading-[0.9]">
                  {displayUsername ?? "..."}
                </h1>

                {displayBio && (
                  <p className="text-base sm:text-xl text-[#3e4850] leading-relaxed">{displayBio}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-[#E5E5E5] max-w-sm">
                  {[
                    { value: userChannel?.followerCount ?? 0, label: "Followers" },
                    { value: userChannel?.followingCount ?? 0, label: "Following" },
                    { value: `${recentPosts.length}+`, label: "Posts" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl sm:text-4xl font-black text-[#985F2E] tracking-tighter">
                        {s.value}
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#6e7881] mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Feature Bento ── */}
        <section className="bg-[#F5F0EB] py-16 sm:py-24 mb-16 sm:mb-24">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-white p-8 sm:p-10 group hover:shadow-xl transition-all duration-500 rounded-xl flex flex-col justify-between h-auto sm:h-[380px]"
                >
                  <div>
                    <span className="text-4xl mb-6 block">{f.icon}</span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#171c20] mb-4">{f.title}</h3>
                    <p className="text-[#3e4850] leading-relaxed text-sm sm:text-base">{f.desc}</p>
                  </div>
                  <div className="text-[#985F2E] font-black text-sm tracking-widest uppercase mt-6 sm:mt-4 flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    {f.cta} →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recent Publications ── */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-8 mb-16 sm:mb-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
            <div>
              <span className="text-[#985F2E] text-[11px] font-black tracking-[0.3em] uppercase mb-2 block">Latest Works</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#171c20]">Recent Publications</h2>
            </div>
            <button
              onClick={() => router.push("/articles")}
              className="text-sm font-bold border-b-2 border-[#985F2E] text-[#3e4850] hover:text-[#985F2E] transition-colors pb-1 whitespace-nowrap"
            >
              View Archive
            </button>
          </div>

          {loadingPosts ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
              <div className="lg:col-span-7 h-80 bg-[#E5E5E5] rounded-xl" />
              <div className="lg:col-span-5 space-y-6">
                {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-[#E5E5E5] rounded-xl" />)}
              </div>
            </div>
          ) : recentPosts.length === 0 ? (
            <p className="text-[#6e7881] text-center py-16">No publications found.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <Link href={`/blog/${recentPosts[0]._id}`} className="lg:col-span-7 group cursor-pointer block">
                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-[#E5E5E5] mb-5 relative">
                  <img
                    src={recentPosts[0].coverImage?.url}
                    alt={recentPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black text-[#985F2E] uppercase tracking-widest">Essay</span>
                  <span className="text-[#E5E5E5]">·</span>
                  <span className="text-xs font-medium text-[#6e7881]">{formatDate(recentPosts[0].createdAt)}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171c20] mb-3 leading-tight group-hover:text-[#985F2E] transition-colors line-clamp-2">
                  {recentPosts[0].title}
                </h3>
                <p className="text-[#3e4850] text-sm sm:text-base leading-relaxed line-clamp-3 mb-3">
                  {recentPosts[0].description}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#6e7881] font-medium">
                  <span>{recentPosts[0].likeCount ?? 0} likes</span>
                  <span>{recentPosts[0].commentCount ?? 0} comments</span>
                  <span>{recentPosts[0].views ?? 0} views</span>
                </div>
              </Link>

              <div className="lg:col-span-5 flex flex-col divide-y divide-[#E5E5E5]">
                {recentPosts.slice(1).map((post) => (
                  <Link key={post._id} href={`/blog/${post._id}`} className="flex gap-5 group py-5 first:pt-0 last:pb-0">
                    <div className="w-28 h-28 flex-shrink-0 bg-[#E5E5E5] rounded-lg overflow-hidden">
                      <img
                        src={post.coverImage?.url}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-[10px] font-black tracking-[0.2em] text-[#985F2E] uppercase mb-1 block">
                        {post.tag?.[0] ?? "Essay"}
                      </span>
                      <h4 className="text-sm font-bold text-[#171c20] mb-1.5 leading-snug group-hover:text-[#985F2E] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[#6e7881] leading-relaxed line-clamp-2">{post.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Trending & Popular ── */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-8 mb-24 sm:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 border-t border-[#E5E5E5] pt-12 sm:pt-16">
            {[
              { title: "Most Viewed", posts: mostViewed, stat: (item: Blog) => `${item.views ?? 0} views` },
              { title: "Most Liked", posts: mostLiked, stat: (item: Blog) => `${item.likeCount ?? 0} likes` },
            ].map(({ title, posts, stat }) => (
              <div key={title}>
                <h2 className="text-2xl font-black tracking-tighter text-[#171c20] mb-8">{title}</h2>
                <div className="flex flex-col divide-y divide-[#E5E5E5]">
                  {loadingPosts
                    ? [1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-[#E5E5E5] rounded-xl animate-pulse mb-4" />
                      ))
                    : posts.map((item) => (
                        <Link key={item._id} href={`/blog/${item._id}`} className="flex gap-4 py-5 group first:pt-0 last:pb-0">
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#E5E5E5]">
                            <img
                              src={item.coverImage?.url}
                              alt={item.title}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-[#171c20] mb-2 group-hover:text-[#985F2E] transition-colors leading-snug line-clamp-2">
                              {item.title}
                            </h4>
                            <span className="text-xs font-bold text-[#985F2E]">{stat(item)}</span>
                          </div>
                        </Link>
                      ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="bg-[#1A0E04] px-8 sm:px-12 py-12 sm:py-16 rounded-3xl relative overflow-hidden shadow-2xl">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle at top right, #985F2E, transparent), radial-gradient(circle at bottom left, #7A4A22, transparent)",
              }}
            />
            <div className="relative z-10 text-center">
              <span className="text-white text-xs font-black tracking-[0.4em] uppercase mb-4 block">Stay Informed</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 sm:mb-6 leading-none">
                The Weekly Curation
              </h2>
              <p className="text-[#A89080] text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
                Receive a deep dive into the latest research and a hand-picked collection of exceptional ideas every Sunday morning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 border-0 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#985F2E] outline-none transition-all"
                />
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#985F2E] text-white font-bold rounded-xl hover:bg-[#7A4A22] transition-colors">
                  Subscribe
                </button>
              </div>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mt-6">
                Zero spam. Only high-resolution insights.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CuratorProfile;
