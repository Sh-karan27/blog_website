"use client";

import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { Camera, Save, X, Eye, EyeOff, Lock, User } from "lucide-react";
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
  tag: string[]; // ← add this
}

interface ProfileStats {
  followers: string;
  following: number;
}
interface UserChannel {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profileImage: { url: string };
  coverImage: { url: string };
  followerCount: number;
  followingToCount: number;
  isFollowing: boolean;
  createdAt: string;
}

// ── Static data ────────────────────────────────────────────────
const PROFILE = {
  name: "Julian Sterling",
  role: "Lead Curator",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDa_O00kt0fk2FJBbyqU8t3YJYHRVIa1vX0kodFebIKQj8DN85cMVZqrvJ2XYh1gD3XrLYYi4a8_Wyka4f1Kvy1ZbL6g14RMqX0XNwAEqOhidYD1ahIOCi2ZlNDT_7m9VuegTOJm9Yq3ptLTJziP-k8i5KAOCPaQww-ePlX-HVyl2oG557FDtpEV72lHAe65gHej-z9fRp5R0-gR28AGvJHNei1o8rkZdd_UDO6Qtbd4TFDha-WwKh5nn-aTLIPPzjGbp-GPv2Dh6c",
  tags: ["DESIGN ETHICS", "DIGITAL ANTHROPOLOGY"],
  bio1: "As a lead curator at The Digital Curator, Julian explores the intersection of brutalist architecture and modern interface design. With over a decade of experience in digital ethnography, he challenges the industry's obsession with frictionless experiences, advocating instead for meaningful friction and structural honesty.",
  bio2: "His work has been featured in international design biennials and serves as a blueprint for the next generation of intentional creators.",
  stats: { followers: "12.8k", following: 45 } as ProfileStats,
};

const FEATURES = [
  {
    icon: "visibility",
    title: "Visionary Approach",
    desc: "Pioneering the 'Slow Tech' movement, focusing on long-form digital engagement over ephemeral scrolling habits.",
    cta: "Read Manifesto",
  },
  {
    icon: "verified",
    title: "Editorial Standards",
    desc: "A commitment to rigorous verification and scholarly depth, ensuring every curation stands the test of time.",
    cta: "View Ethics",
  },
  {
    icon: "public",
    title: "Global Influence",
    desc: "Connecting diverse design philosophies from Tokyo to Berlin, fostering a truly international curation landscape.",
    cta: "Network",
  },
];

const MOST_VIEWED = [
  {
    title: "The Architecture of Infinite Scrolled Feeds",
    views: "42.5k",
    read: "12 Min Read",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA59JWrseYaipnUu0tLXnNvy-sGVNzCv3Tj2sWlp7GwTFZ-Inq5BoZzywz4iaqXaXnb2Yh1m5V-JfsFXleiCRyK6aah72dMN4XX90ROO_YaVIPwv7hBzhwgDlbj2nkHLfbugulgriIfLgUydTOJTvusGXxre9KM28eUC4gVWBjBqvGpji23v8e_ZBeuvu4SkspO6F0Nn4PtlUhPUPdJOAD2KM9TVu2dPyWt0-1vh4EmilYIXVzVdUFJASO4pg93BK9wORiPI5NoVug",
  },
  {
    title: "Minimalism vs. Brutalism: A 2024 Taxonomy",
    views: "38.1k",
    read: "15 Min Read",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2EO4EwkSGwh1CsZbZZUPDcs9bux2LpN1lEHJZ4v1juvYGZExtxFyOagQgGQ-mH2_YlReSbQbl7HoiW9RkSSJGZSK7JQDXQHbkyueW_csQj4vM4iAz9ouROSNDZT77AZ7NApc4xQb88yQRpJFniFjYJ2V596g4nu0ISlazZz5kchGAHj1zJQwLjhlrNIZ8L1VddZkXGgPlmru1S3bNMd3E-sLz2IA5ai9oychutCIw99O4qntc8OWpEJRIYEqDl6nOSHZoCepV9mo",
  },
  {
    title: "Beyond Screens: The Future of Spatial Computing",
    views: "31.2k",
    read: "22 Min Read",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDb_a5mi1SXAdz_QFGRFKYiGWsk9KFhfkN5uwdZJKqyTIisjMl8GKqd0gxc-sZzf_YvkUbirE7eO6M6HiAZmI7RLwvAwjROlW5ubmjPHQeH4zGQVEKitw7ie9QY1sZEQFwxUZ8lalQ8j2905LvpV9XHiZIGjfPG6rOFhihsioQ0DJT388VKXxVNkUy4dTPomNJZE6sM-riB8Ba9mK09ly0UtdIcQSSrcIVgTTnBxgiKbbwv5cXOrV5p297D56MVRyl60f_cDgYNc",
  },
];

const MOST_LIKED = [
  {
    title: "The Ethical Implications of Generative Aesthetics",
    likes: "12.8k",
    comments: 428,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7dS-9hKGDcRD8jLifHM3IuNIisXHb3OpgOR6wehdpaJ1gvwxTiwhAR0critsKyGqVny6pa47RJmm0-As8JsMxTTOVNOplUb-6cE2ozgIP64xMywS2G-Ce64g_4iqW9F78Ry-e9-wEP30LJa-PNLdhSjWOFhXM66oiHeYxcury-o7fD0ybJpHVUviz_fAWqVdKRsMGRe2xBbjWMKQ6iVXUcwmB5WGXVHVER38eSKNpUy70PdZ4gFiS_YapMEz7E1rxZMhCYC9nQeg",
  },
  {
    title: "Why We Still Love Retro Digital Typography",
    likes: "9.4k",
    comments: 156,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIkn5uxWdzKYIupZHqule9JsY6qQ754RQmdfaMD0YHU0fB_BIBC9myTuukn7J71bNeSBPFXAAusMR10-KeGUIzyogjCSDi02tDpV3AOViYUMEKH69VhjtoivVbqmT3yNd9HbJM9lEaoM7l7s4eX4B6LESgb7vhT9aeUerkpEzr43u4rycwu5jejaxyx9dovD7a7ZnS8RWkd7XRunn5akOMA88RMCdX6PfG93BFRX1eb1ho3tu0hcOIX8rk6w7fM1SXxyIiyB0cI98",
  },
  {
    title: "The Archive as a Living Digital Organism",
    likes: "8.2k",
    comments: 204,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAraZYeiictbj-UCcDtMPf8lDwxbd_HUa4PX97a9uGK9aGNFCkdP01CLtMA1Dok9Bc2huhbx1k5zysaFq1bOZD23EFDOJULl4lAofBZZXYGHeOEO3hvJC_PJBlBmJqB_OQYUGBSMXbjMfFUNhPPvodZOj_Yd7OkCp5uuRyTrxYj54xnUdsnxKBj_Lj4VU9j9QaJomP10fnVxynLecuX_g5tcTLU-RDCl_SF5tFOVYkdM7A6LszT2huR6GdzpEgXkevXWVOyz9erV0A",
  },
];

// ── Helper ─────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// ── Component ──────────────────────────────────────────────────
const CuratorProfile = () => {
  const { profileId } = useParams() as { profileId: string };
  const router = useRouter();
  const [userChannel, setUserChannel] = useState<UserChannel | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const isOwner = currentUserId === profileId;

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
  const [mostLiked, setMostLiked] = useState<Blog[]>([]);
  const [mostViewed, setMostViewed] = useState<Blog[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const meRes = await axiosInstance.get("/users/current-user");
        const me = meRes.data?.data;
        setCurrentUserId(me?._id);

        const blogsRes = await axiosInstance.get(`/blog/u/${profileId}`, {
          params: { page: 1, limit: 1 },
        });
        const blogsData = blogsRes.data?.data;
        const firstBlog = Array.isArray(blogsData)
          ? blogsData[0]
          : blogsData?.blogs?.[0];
        const uname = firstBlog?.author?.username;

        if (uname) {
          const channelRes = await axiosInstance.get(`/users/c/${uname}`);
          const channelData = channelRes.data?.data;
          const channel = Array.isArray(channelData)
            ? channelData[0]
            : channelData;
          setUserChannel(channel);
          if (me?._id === profileId) {
            setUsername(channel?.username ?? "");
            setEmail(channel?.email ?? "");
            setBio(channel?.bio ?? "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchAll = async () => {
      try {
        setLoadingPosts(true);
        const [recentRes, likedRes, viewedRes] = await Promise.all([
          axiosInstance.get(`/blog/u/${profileId}`, {
            params: {
              page: 1,
              limit: 5,
              sortBy: "createdAt",
              sortType: "desc",
            },
          }),
          axiosInstance.get(`/blog/u/${profileId}`, {
            params: {
              page: 1,
              limit: 3,
              sortBy: "likeCount",
              sortType: "desc",
            },
          }),
          axiosInstance.get(`/blog/u/${profileId}`, {
            params: { page: 1, limit: 3, sortBy: "views", sortType: "desc" },
          }),
        ]);
        const extract = (res: any): Blog[] => {
          const data = res.data?.data;
          return Array.isArray(data) ? data : (data?.blogs ?? []);
        };
        setRecentPosts(extract(recentRes));
        setMostLiked(extract(likedRes));
        setMostViewed(extract(viewedRes));
      } catch (err) {
        console.error("Failed to fetch profile posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();
    fetchAll();
  }, [profileId]);

  const handleSaveDetails = async () => {
    if (!username && !email && !bio)
      return toast.error("At least one field required");
    try {
      setSavingDetails(true);
      const res = await axiosInstance.patch("/users/update-account", {
        username,
        email,
        bio,
      });
      setUserChannel((prev) => (prev ? { ...prev, ...res.data.data } : prev));
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword)
      return toast.error("All fields required");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");
    if (newPassword.length < 6) return toast.error("Min 6 characters");
    try {
      setSavingPassword(true);
      await axiosInstance.post("/users/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Password changed");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      setUploadingProfile(true);
      const res = await axiosInstance.patch("/users/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.data.profileImage.url;
      setUserChannel((prev) =>
        prev ? { ...prev, profileImage: { url } } : prev,
      );
      localStorage.setItem("profileImage", url);
      toast.success("Profile image updated");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("coverImage", file);
    try {
      setUploadingCover(true);
      const res = await axiosInstance.patch("/users/cover-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserChannel((prev) =>
        prev ? { ...prev, coverImage: res.data.data.coverImage } : prev,
      );
      toast.success("Cover image updated");
    } catch {
      toast.error("Failed to upload cover");
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="bg-[#f6faff] min-h-screen font-sans text-[#171c20]">
      <main className="pt-24 pb-20">
        {/* ── Hero / Profile ── */}
        {/* ── Hero / Profile ── */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-8 mb-16 sm:mb-24">
          {/* Cover image — only visible strip, owner can edit */}
          {(userChannel?.coverImage?.url || isOwner) && (
            <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-[#c9e6ff] to-[#006591]/20 group">
              {userChannel?.coverImage?.url && (
                <img
                  src={userChannel.coverImage.url}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              )}
              {isOwner && (
                <>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                  <button
                    onClick={() => coverImageRef.current?.click()}
                    disabled={uploadingCover}
                    className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium rounded-lg transition-all backdrop-blur-sm"
                  >
                    {uploadingCover ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    {uploadingCover ? "Uploading..." : "Change Cover"}
                  </button>
                  <input
                    ref={coverImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageChange}
                  />
                </>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
            {/* Avatar — keep original size/style, just add edit overlay for owner */}
            <div className="relative group flex-shrink-0 mx-auto md:mx-0">
              <div className="w-48 h-60 sm:w-64 sm:h-80 bg-[#dee3e9] overflow-hidden rounded-xl shadow-lg">
                <img
                  src={userChannel?.profileImage?.url || PROFILE.avatar}
                  alt={userChannel?.username || PROFILE.name}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              {isOwner && (
                <>
                  <button
                    onClick={() => profileImageRef.current?.click()}
                    disabled={uploadingProfile}
                    className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
                  >
                    {uploadingProfile ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                  <input
                    ref={profileImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </>
              )}
              <div className="absolute -bottom-4 -right-4 bg-[#006591] px-3 sm:px-4 py-2 text-white text-xs uppercase tracking-widest rounded-sm shadow-xl">
                {userChannel?.isFollowing ? "Following" : PROFILE.role}
              </div>
            </div>

            {/* Bio — use real data, fallback to static */}
            <div className="flex-1 max-w-3xl mt-6 md:mt-0">
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                {PROFILE.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#dee3e9] text-[#003751] text-[11px] font-bold tracking-widest uppercase rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-[#171c20] mb-6 sm:mb-8 leading-[0.9]">
                {userChannel?.username || PROFILE.name}
              </h1>
              <p className="text-base sm:text-xl text-[#3e4850] leading-relaxed">
                {userChannel?.bio || PROFILE.bio1}
              </p>
              <p className="text-base sm:text-xl text-[#3e4850] mt-4 leading-relaxed">
                {PROFILE.bio2}
              </p>

              {/* Stats — use real data */}
              <div className="grid grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-[#bec8d2]/20 max-w-sm">
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-[#006591] tracking-tighter">
                    {userChannel?.followerCount ?? 0}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#6e7881] mt-1">
                    Followers
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-[#006591] tracking-tighter">
                    {userChannel?.followingToCount ?? 0}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#6e7881] mt-1">
                    Following
                  </div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-[#006591] tracking-tighter">
                    {recentPosts.length}+
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#6e7881] mt-1">
                    Posts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── Owner Settings — only shown to profile owner ── */}
        {isOwner && (
          <section className="max-w-screen-2xl mx-auto px-4 sm:px-8 mb-16 sm:mb-24">
            <div className="border border-[#bec8d2]/30 rounded-2xl overflow-hidden">
              <div className="flex border-b border-[#bec8d2]/30 bg-white">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
                    activeTab === "profile"
                      ? "border-[#006591] text-[#006591]"
                      : "border-transparent text-[#6e7881] hover:text-[#171c20]"
                  }`}
                >
                  <User className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
                    activeTab === "password"
                      ? "border-[#006591] text-[#006591]"
                      : "border-transparent text-[#6e7881] hover:text-[#171c20]"
                  }`}
                >
                  <Lock className="w-4 h-4" /> Change Password
                </button>
              </div>

              <div className="bg-white p-6 sm:p-8">
                {activeTab === "profile" && (
                  <div className="max-w-lg space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#171c20] mb-1.5">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border border-[#bec8d2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006591] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171c20] mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-[#bec8d2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006591] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171c20] mb-1.5">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-[#bec8d2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006591] focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveDetails}
                        disabled={savingDetails}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#006591] text-white text-sm font-semibold rounded-xl hover:bg-[#0ea5e9] disabled:opacity-50 transition-all"
                      >
                        {savingDetails ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {savingDetails ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => {
                          setUsername(userChannel?.username ?? "");
                          setEmail(userChannel?.email ?? "");
                          setBio(userChannel?.bio ?? "");
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 text-[#6e7881] text-sm font-semibold rounded-xl hover:bg-[#f0f4fa] transition-all"
                      >
                        <X className="w-4 h-4" /> Reset
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "password" && (
                  <div className="max-w-lg space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#171c20] mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showOld ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-[#bec8d2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006591] focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOld((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7881]"
                        >
                          {showOld ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171c20] mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-[#bec8d2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006591] focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7881]"
                        >
                          {showNew ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171c20] mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          confirmPassword && newPassword !== confirmPassword
                            ? "border-red-300 focus:ring-red-400"
                            : "border-[#bec8d2] focus:ring-[#006591] focus:border-transparent"
                        }`}
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={
                          savingPassword ||
                          (!!confirmPassword && newPassword !== confirmPassword)
                        }
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#006591] text-white text-sm font-semibold rounded-xl hover:bg-[#0ea5e9] disabled:opacity-50 transition-all"
                      >
                        {savingPassword ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        {savingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Feature Bento ── */}
        <section className="bg-[#f0f4fa] py-16 sm:py-24 mb-16 sm:mb-24">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-white p-8 sm:p-10 group hover:shadow-2xl transition-all duration-500 rounded-xl flex flex-col justify-between h-auto sm:h-[400px]"
                >
                  <div>
                    <span className="material-symbols-outlined text-4xl text-[#006591] mb-6 block">
                      {f.icon}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#171c20] mb-4">
                      {f.title}
                    </h3>
                    <p className="text-[#3e4850] leading-relaxed text-sm sm:text-base">
                      {f.desc}
                    </p>
                  </div>
                  <div className="text-[#006591] font-bold text-sm tracking-widest uppercase mt-6 sm:mt-4 flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    {f.cta}{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recent Publications (LIVE API) ── */}
        {/* ── Recent Publications ── */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-8 mb-16 sm:mb-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
            <div>
              <span className="text-[#006591] text-[11px] font-black tracking-[0.3em] uppercase mb-2 block">
                Latest Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-[#171c20]">
                Recent Publications
              </h2>
            </div>
            <button
              onClick={() => router.push("/articles")}
              className="text-sm font-bold border-b-2 border-[#89ceff] text-[#3e4850] hover:text-[#006591] transition-colors pb-1 whitespace-nowrap"
            >
              View Archive
            </button>
          </div>

          {loadingPosts ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
              <div className="lg:col-span-7 h-80 bg-[#dee3e9] rounded-xl" />
              <div className="lg:col-span-5 space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-[#dee3e9] rounded-xl" />
                ))}
              </div>
            </div>
          ) : recentPosts.length === 0 ? (
            <p className="text-[#6e7881] text-center py-16">
              No publications found.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Featured — first post */}
              <Link
                href={`/blog/${recentPosts[0]._id}`}
                className="lg:col-span-7 group cursor-pointer block"
              >
                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-[#e4e8ee] mb-5 relative">
                  <img
                    src={recentPosts[0].coverImage?.url}
                    alt={recentPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black text-[#006591] uppercase tracking-widest">
                    Essay
                  </span>
                  <span className="text-[#bec8d2]">·</span>
                  <span className="text-xs font-medium text-[#6e7881]">
                    {formatDate(recentPosts[0].createdAt)}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171c20] mb-3 leading-tight group-hover:text-[#006591] transition-colors line-clamp-2">
                  {recentPosts[0].title}
                </h3>
                <p className="text-[#3e4850] text-sm sm:text-base leading-relaxed line-clamp-3 mb-3">
                  {recentPosts[0].description}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#6e7881] font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      favorite
                    </span>
                    {recentPosts[0].likeCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      chat_bubble
                    </span>
                    {recentPosts[0].commentCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      visibility
                    </span>
                    {recentPosts[0].views ?? 0}
                  </span>
                </div>
              </Link>

              {/* Sidebar — posts 2 to 5 */}
              <div className="lg:col-span-5 flex flex-col divide-y divide-[#e4e8ee]">
                {recentPosts.slice(1).map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post._id}`}
                    className="flex gap-5 group py-5 first:pt-0 last:pb-0"
                  >
                    <div className="w-28 h-28 flex-shrink-0 bg-[#e4e8ee] rounded-lg overflow-hidden">
                      <img
                        src={post.coverImage?.url}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-[10px] font-black tracking-[0.2em] text-[#006591] uppercase mb-1 block">
                        {post.tag?.[0] ?? "Essay"}
                      </span>
                      <h4 className="text-sm font-bold text-[#171c20] mb-1.5 leading-snug group-hover:text-[#006591] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[#6e7881] leading-relaxed line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Trending & Popular ── */}
        {/* ── Trending & Popular ── */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-8 mb-24 sm:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 border-t border-[#bec8d2]/20 pt-12 sm:pt-16">
            {/* Most Viewed */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <span
                  className="material-symbols-outlined text-[#006591]"
                  style={{ fontSize: "22px" }}
                >
                  trending_up
                </span>
                <h2 className="text-2xl font-extrabold tracking-tighter text-[#171c20]">
                  Most Viewed
                </h2>
              </div>
              <div className="flex flex-col divide-y divide-[#e4e8ee]">
                {loadingPosts
                  ? [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-[#dee3e9] rounded-xl animate-pulse mb-4"
                      />
                    ))
                  : mostViewed.map((item) => (
                      <Link
                        key={item._id}
                        href={`/blog/${item._id}`}
                        className="flex gap-4 py-5 group first:pt-0 last:pb-0"
                      >
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#eaeef4]">
                          <img
                            src={item.coverImage?.url}
                            alt={item.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-[#171c20] mb-2 group-hover:text-[#006591] transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-4 text-xs font-bold text-[#6e7881]">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                visibility
                              </span>
                              {item.views ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                schedule
                              </span>
                              {Math.max(
                                1,
                                Math.ceil((item.views ?? 500) / 500),
                              )}{" "}
                              Min Read
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
              </div>
            </div>

            {/* Most Liked */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <span
                  className="material-symbols-outlined text-[#006591]"
                  style={{
                    fontSize: "22px",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  favorite
                </span>
                <h2 className="text-2xl font-extrabold tracking-tighter text-[#171c20]">
                  Most Liked
                </h2>
              </div>
              <div className="flex flex-col divide-y divide-[#e4e8ee]">
                {loadingPosts
                  ? [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-[#dee3e9] rounded-xl animate-pulse mb-4"
                      />
                    ))
                  : mostLiked.map((item) => (
                      <Link
                        key={item._id}
                        href={`/blog/${item._id}`}
                        className="flex gap-4 py-5 group first:pt-0 last:pb-0"
                      >
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#eaeef4]">
                          <img
                            src={item.coverImage?.url}
                            alt={item.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-[#171c20] mb-2 group-hover:text-[#006591] transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-4 text-xs font-bold text-[#6e7881]">
                            <span className="flex items-center gap-1 text-[#006591]">
                              <span
                                className="material-symbols-outlined text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                favorite
                              </span>
                              {item.likeCount ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                chat_bubble
                              </span>
                              {item.commentCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="bg-[#000] px-8 sm:px-12 py-12 sm:py-16 rounded-3xl relative overflow-hidden shadow-2xl">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, #c9e6ff, transparent), radial-gradient(circle at bottom left, #a5a5a5d1, transparent)",
              }}
            />
            <div className="relative z-10 text-center">
              <span className="text-[#ffffff] text-xs font-black tracking-[0.4em] uppercase mb-4 block">
                Stay Informed
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-4 sm:mb-6 leading-none">
                The Weekly Curation
              </h2>
              <p className="text-[#c9e6ff] text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
                Receive a deep dive into Julian's latest research and a
                hand-picked collection of exceptional digital artifacts every
                Sunday morning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 border-0 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#89ceff] outline-none transition-all"
                />
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#000000] font-bold rounded-xl hover:bg-[#676869] transition-colors active:scale-95">
                  Subscribe
                </button>
              </div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-6">
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
