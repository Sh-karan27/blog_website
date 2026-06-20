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
  const [activeTab, setActiveTab] = useState<"viewed" | "liked">("viewed");

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
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: 4, sortBy: "likeCount", sortType: "desc" } }),
          axiosInstance.get(`/blog/u/${profileId}`, { params: { page: 1, limit: 4, sortBy: "views", sortType: "desc" } }),
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
    } catch {
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
      <main className="pt-0 pb-24">

        {/* ── Cover Banner ── */}
        <div
          className="relative w-full h-[240px] group cursor-pointer overflow-hidden"
          style={!displayCover ? { background: "linear-gradient(135deg, #995F2F 0%, #7A4A22 50%, #7A4A22 100%)" } : undefined}
        >
          {displayCover && (
            <img src={displayCover} alt="Cover" className="w-full h-full object-cover" />
          )}
          {isOwner && (
            <>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              <button
                onClick={() => coverImageRef.current?.click()}
                disabled={uploadingCover}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1.5 bg-black/55 hover:bg-black/80 text-white text-[12px] font-semibold rounded-full border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-[3] backdrop-blur-sm"
              >
                {uploadingCover ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                {uploadingCover ? "Uploading..." : "Change Cover"}
              </button>
              <input ref={coverImageRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
            </>
          )}
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">

          {/* ── Profile Row ── */}
          <div className="relative pb-7 border-b border-[#E5E5E5] mb-8">
            {/* Avatar */}
            <div className="absolute top-[-36px] left-0 w-[88px] h-[88px]">
              <div className="w-[88px] h-[88px] rounded-full border-4 border-white shadow-lg bg-[#985F2E] flex items-center justify-center text-[28px] font-black text-white overflow-hidden">
                {displayImage ? (
                  <img src={displayImage} alt={displayUsername ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <span>{displayUsername?.[0]?.toUpperCase() ?? "?"}</span>
                )}
              </div>
              {isOwner && (
                <>
                  <button
                    onClick={() => profileImageRef.current?.click()}
                    disabled={uploadingProfile}
                    className="absolute bottom-0.5 right-0.5 w-[26px] h-[26px] rounded-full bg-[#985F2E] border-2 border-white flex items-center justify-center z-10"
                    title="Change photo"
                  >
                    {uploadingProfile ? (
                      <div className="w-[9px] h-[9px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-[11px] h-[11px] text-white" />
                    )}
                  </button>
                  <input ref={profileImageRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                </>
              )}
            </div>

            {/* Info row */}
            <div className="pt-[60px] flex items-start justify-between flex-wrap gap-4">
              <div>
                {loadingProfile ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-8 bg-[#E5E5E5] rounded w-40" />
                    <div className="h-4 bg-[#E5E5E5] rounded w-52" />
                    <div className="h-4 bg-[#E5E5E5] rounded w-72" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-[32px] font-black tracking-[-0.025em] mb-1.5 text-[#171c20] leading-tight">
                      {displayUsername ?? "..."}
                    </h1>
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      {displayCreatedAt && (
                        <span className="px-2.5 py-[3px] rounded-full text-[11px] font-bold tracking-[0.04em] uppercase bg-[#F5F0EB] text-[#6e7881] border border-[#E5E5E5]">
                          Since {new Date(displayCreatedAt).getFullYear()}
                        </span>
                      )}
                      <span className="px-2.5 py-[3px] rounded-full text-[11px] font-bold tracking-[0.04em] uppercase bg-[#F5F0EB] text-[#985F2E] border border-[rgba(153,95,47,0.2)]">
                        ✦ Writer
                      </span>
                    </div>
                    {displayBio && (
                      <p className="text-[15px] text-[#6e7881] leading-[1.65] max-w-[520px]">{displayBio}</p>
                    )}
                    {displayEmail && (
                      <p className="mt-2.5 text-[13px] text-[#6e7881]">{displayEmail}</p>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2 items-center">
                {isOwner ? (
                  <>
                    <Link
                      href="/settings"
                      className="px-4 py-1.5 text-xs font-bold rounded-lg border border-[#E5E5E5] text-[#3e4850] hover:border-[#985F2E] hover:text-[#985F2E] transition-all"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href="/write"
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#985F2E] text-white hover:bg-[#7A4A22] transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Write
                    </Link>
                  </>
                ) : (
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
            </div>
          </div>

          {/* ── Stats Bento ── */}
          <div className="grid grid-cols-3 gap-[1px] bg-[#E5E5E5] border border-[#E5E5E5] rounded-xl overflow-hidden mb-12">
            {[
              { value: userChannel?.followerCount ?? 0, label: "Followers" },
              { value: userChannel?.followingCount ?? 0, label: "Following" },
              { value: recentPosts.length > 0 ? `${recentPosts.length}+` : "0", label: "Articles" },
            ].map((s) => (
              <div key={s.label} className="bg-[#FAFAFA] text-center px-5 py-6">
                <span className="block text-[32px] font-black tracking-[-0.03em] text-[#985F2E] leading-none mb-1">
                  {s.value}
                </span>
                <span className="text-[12px] uppercase tracking-[0.08em] font-bold text-[#6e7881]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── About Strip ── */}
          {displayBio && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 max-w-3xl py-8 border-b border-[#E5E5E5] mb-2">
              <div className="w-1 self-stretch min-h-12 rounded-full bg-[#985F2E] flex-shrink-0" />
              <p className="flex-1 text-xl italic leading-[1.5] text-[#3e4850] tracking-[-0.01em]">{displayBio}</p>
              {displayCreatedAt && (
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#6e7881] whitespace-nowrap sm:self-end font-semibold">
                  Member since {new Date(displayCreatedAt).getFullYear()}
                </div>
              )}
            </div>
          )}

          {/* ── Recent Publications ── */}
          <section className="mt-16 mb-16">
            <div className="flex items-baseline justify-between mb-6 gap-4">
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-[#985F2E]">
                Recent Publications
              </span>
              <button
                onClick={() => router.push("/articles")}
                className="text-[13px] font-semibold text-[#6e7881] hover:text-[#985F2E] transition-colors whitespace-nowrap"
              >
                View all →
              </button>
            </div>

            {loadingPosts ? (
              <div className="animate-pulse space-y-6">
                <div className="aspect-[16/9] bg-[#E5E5E5] rounded-xl" />
                {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-[#E5E5E5] rounded-xl" />)}
              </div>
            ) : recentPosts.length === 0 ? (
              <p className="text-center py-12 text-[15px] text-[#6e7881]">No publications yet.</p>
            ) : (
              <div className="flex flex-col">
                {/* Featured first post */}
                <Link href={`/blog/${recentPosts[0]._id}`} className="block bg-[#F5F0EB] rounded-xl overflow-hidden mb-7 group">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={recentPosts[0].coverImage?.url}
                      alt={recentPosts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 sm:p-7 border-l-4 border-[#985F2E]">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="px-2 py-[3px] rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-[#985F2E]/10 text-[#985F2E]">
                        {recentPosts[0].tag?.[0] ?? "Essay"}
                      </span>
                      <span className="text-[12px] text-[#6e7881]">{formatDate(recentPosts[0].createdAt)}</span>
                    </div>
                    <h3 className="text-[26px] font-black tracking-[-0.025em] leading-snug text-[#171c20] mb-3 group-hover:text-[#985F2E] transition-colors line-clamp-2">
                      {recentPosts[0].title}
                    </h3>
                    <p className="text-[15px] text-[#6e7881] leading-relaxed mb-4 max-w-[620px] line-clamp-3">
                      {recentPosts[0].description}
                    </p>
                    <div className="flex items-center gap-4 text-[12px] text-[#6e7881]">
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {recentPosts[0].likeCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        {recentPosts[0].commentCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {recentPosts[0].views ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Standard list rows */}
                {recentPosts.slice(1).map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post._id}`}
                    className="grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] gap-3.5 sm:gap-5 py-6 border-t border-[#E5E5E5] group"
                  >
                    <div className="h-[72px] sm:h-[100px] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={post.coverImage?.url}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <span className="inline-block px-2 py-[3px] rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-[#985F2E]/10 text-[#985F2E] mb-2 self-start">
                        {post.tag?.[0] ?? "Essay"}
                      </span>
                      <h4 className="text-[18px] font-bold tracking-[-0.01em] leading-snug text-[#171c20] mb-1.5 group-hover:text-[#985F2E] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-[14px] text-[#3e4850] leading-[1.55] mb-3 line-clamp-2 hidden sm:block">
                        {post.description}
                      </p>
                      <div className="flex items-center justify-between gap-3 text-[12px] text-[#6e7881]">
                        <span>{post.likeCount ?? 0} likes · {post.commentCount ?? 0} comments · {post.views ?? 0} views</span>
                        <span className="whitespace-nowrap hidden sm:block">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Tabbed Ranking ── */}
          <section className="mb-24">
            <div className="inline-flex gap-1 p-1 bg-[#F5F0EB] rounded-full mb-7">
              {(["viewed", "liked"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full font-bold text-[13px] transition-all ${
                    activeTab === tab
                      ? "bg-[#985F2E] text-white"
                      : "bg-transparent text-[#6e7881] hover:text-[#985F2E]"
                  }`}
                >
                  {tab === "viewed" ? "Most Viewed" : "Most Liked"}
                </button>
              ))}
            </div>

            {loadingPosts ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-[#E5E5E5] rounded-xl" />)}
              </div>
            ) : (
              <div key={activeTab} className="flex flex-col animate-fadeIn">
                {(activeTab === "viewed" ? mostViewed : mostLiked).map((item, i) => (
                  <Link
                    key={item._id}
                    href={`/blog/${item._id}`}
                    className={`grid grid-cols-[44px_72px_1fr] gap-4 py-4 group ${i > 0 ? "border-t border-[#E5E5E5]" : ""}`}
                  >
                    <div className="text-[36px] font-black leading-none text-[#E5E5E5] tracking-[-0.04em] text-center self-center">
                      {i + 1}
                    </div>
                    <div className="w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0 self-center">
                      <img
                        src={item.coverImage?.url}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                    <div className="self-center min-w-0">
                      <h4 className="text-[16px] font-bold tracking-[-0.01em] leading-snug text-[#171c20] mb-1.5 group-hover:text-[#985F2E] transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[13px] font-bold text-[#985F2E]">
                          {activeTab === "viewed" ? `${item.views ?? 0} views` : `${item.likeCount ?? 0} likes`}
                        </span>
                        <span className="text-[12px] text-[#6e7881]">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default CuratorProfile;
