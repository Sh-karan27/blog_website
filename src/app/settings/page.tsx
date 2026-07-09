"use client";

import axiosInstance from "@/lib/axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profileImage: { url: string; public_id: string };
  coverImage: { url: string; public_id: string };
  followerCount: number;
  followingToCount: number;
  createdAt: string;
}

type Tab = "profile" | "password" | "danger";

const inputClass =
  "w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-shadow";

const strengthColors = ["bg-red-500/70", "bg-amber-500/70", "bg-zinc-500", "bg-zinc-900 dark:bg-zinc-100"];

function passwordStrength(v: string) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s;
}

const SettingsPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/users/current-user");
        const data = res.data.data;
        setUser(data);
        setUsername(data.username ?? "");
        setEmail(data.email ?? "");
        setBio(data.bio ?? "");
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSaveDetails = async () => {
    if (!username && !email && !bio) { toast.error("At least one field is required"); return; }
    try {
      setSavingDetails(true);
      const res = await axiosInstance.patch("/users/update-account", { username, email, bio });
      setUser(res.data.data);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) { toast.error("All password fields are required"); return; }
    if (newPassword !== confirmPassword) { toast.error("New passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      setSavingPassword(true);
      await axiosInstance.post("/users/change-password", { oldPassword, newPassword });
      toast.success("Password changed successfully");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setSavingPassword(false);
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
      setUser((prev) => prev ? { ...prev, profileImage: res.data.data.profileImage } : prev);
      localStorage.setItem("profileImage", res.data.data.profileImage.url);
      toast.success("Profile image updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to upload profile image");
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
      setUser((prev) => prev ? { ...prev, coverImage: res.data.data.coverImage } : prev);
      toast.success("Cover image updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load profile
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "password", label: "Password" },
    { key: "danger", label: "Danger zone" },
  ];

  const strength = passwordStrength(newPassword);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold tracking-[-0.02em] mb-8">Settings</h1>

      {/* Cover + avatar */}
      <div className="mb-12">
        <div className="group relative img-ph h-36 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
          {user.coverImage?.url ? (
            <img src={user.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-[10px] text-zinc-400">cover image</span>
          )}
          <button
            onClick={() => coverImageRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-3 right-3 h-8 px-3 rounded-md bg-zinc-950/70 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
          >
            {uploadingCover ? "Uploading…" : "Change cover"}
          </button>
          <input ref={coverImageRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
        </div>
        <div className="group relative w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950 flex items-center justify-center text-xl font-bold text-zinc-600 dark:text-zinc-300 -mt-10 ml-6 overflow-hidden">
          {user.profileImage?.url ? (
            <img src={user.profileImage.url} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            user.username?.[0]?.toUpperCase()
          )}
          <button
            onClick={() => profileImageRef.current?.click()}
            disabled={uploadingProfile}
            className="absolute inset-0 rounded-full bg-zinc-950/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Change avatar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input ref={profileImageRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 mb-8">
        <div className="flex gap-6 text-sm" role="tablist" aria-label="Settings sections">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key
                  ? "pb-3 font-medium border-b-2 border-zinc-900 dark:border-zinc-100 -mb-px"
                  : "pb-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border-b-2 border-transparent -mb-px transition-colors"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <section className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="username">Username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={3}
              maxLength={160}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a little about yourself…"
              className={`${inputClass} h-auto py-2 resize-none`}
            />
            <p className="mt-1 text-xs text-zinc-400 text-right">{bio.length} / 160</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSaveDetails}
              disabled={savingDetails}
              className="h-9 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-60"
            >
              {savingDetails ? "Saving…" : "Save changes"}
            </button>
            <button
              onClick={() => { setUsername(user.username ?? ""); setEmail(user.email ?? ""); setBio(user.bio ?? ""); }}
              className="h-9 px-4 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-8 border-t border-zinc-200 dark:border-zinc-800">
            {[
              { value: user.followerCount ?? 0, label: "Followers" },
              { value: user.followingToCount ?? 0, label: "Following" },
              { value: "Writer", label: "Role" },
              { value: new Date(user.createdAt).getFullYear(), label: "Member since" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold tracking-[-0.01em]">{s.value}</p>
                <p className="text-[11px] text-zinc-400 uppercase tracking-[0.15em] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Password tab */}
      {activeTab === "password" && (
        <section className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="current-pw">Current password</label>
            <div className="relative">
              <input
                id="current-pw"
                type={showOld ? "text" : "password"}
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowOld((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label="Show or hide password"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="new-pw">New password</label>
            <input
              id="new-pw"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
            <div className="flex gap-1.5 mt-2" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength ? strengthColors[strength - 1] : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="confirm-pw">Confirm new password</label>
            <input
              id="confirm-pw"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
            {mismatch && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Passwords don&apos;t match.</p>}
          </div>
          <button
            onClick={handleChangePassword}
            disabled={savingPassword || mismatch}
            className="h-9 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-60"
          >
            {savingPassword ? "Updating…" : "Update password"}
          </button>
        </section>
      )}

      {/* Danger tab */}
      {activeTab === "danger" && (
        <section className="max-w-md">
          <div className="rounded-lg border border-red-600/30 p-6">
            <h2 className="font-bold tracking-[-0.01em] mb-1.5">Delete account</h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-5">
              This permanently removes your profile, all your articles, and your reading history.
              This action cannot be undone.
            </p>
            <button
              disabled
              title="Coming soon"
              className="h-9 px-4 rounded-md bg-red-600/90 text-white text-sm font-medium opacity-60 cursor-not-allowed"
            >
              Delete my account
            </button>
          </div>
        </section>
      )}
    </main>
  );
};

export default SettingsPage;
