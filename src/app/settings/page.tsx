"use client";

import axiosInstance from "@/lib/axios";
import { useEffect, useRef, useState } from "react";
import { Camera, Pencil, Lock, User, Save, X, Eye, EyeOff } from "lucide-react";
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

const SettingsPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Image upload state
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  // Fetch current user
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

  // Update account details
  const handleSaveDetails = async () => {
    if (!username && !email && !bio) {
      toast.error("At least one field is required");
      return;
    }
    try {
      setSavingDetails(true);
      const res = await axiosInstance.patch("/users/update-account", {
        username,
        email,
        bio,
      });
      setUser(res.data.data);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setSavingDetails(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setSavingPassword(true);
      await axiosInstance.post("/users/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  // Upload profile image
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
      setUser((prev) =>
        prev ? { ...prev, profileImage: res.data.data.profileImage } : prev,
      );
      // Update localStorage so navbar reflects new image
      localStorage.setItem("profileImage", res.data.data.profileImage.url);
      toast.success("Profile image updated");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to upload profile image",
      );
    } finally {
      setUploadingProfile(false);
    }
  };

  // Upload cover image
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
      setUser((prev) =>
        prev ? { ...prev, coverImage: res.data.data.coverImage } : prev,
      );
      toast.success("Cover image updated");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to upload cover image",
      );
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Cover Image ── */}
      <div className="relative w-full h-48 sm:h-64 bg-gradient-to-r from-gray-200 to-gray-300 group">
        {user.coverImage?.url ? (
          <img
            src={user.coverImage.url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200" />
        )}

        {/* Cover image overlay + edit button */}
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
        <input
          ref={coverImageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverImageChange}
        />
      </div>

      {/* ── Profile Image + Name ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <div className="relative flex items-end gap-5 -mt-14 mb-8">
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
              {user.profileImage?.url ? (
                <img
                  src={user.profileImage.url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
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
            <input
              ref={profileImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
          </div>

          <div className="pb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {user.username}
            </h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "password"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock className="w-4 h-4" />
            Password
          </button>
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Account Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people a little about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleSaveDetails}
                disabled={savingDetails}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  setUsername(user.username ?? "");
                  setEmail(user.email ?? "");
                  setBio(user.bio ?? "");
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ── Password Tab ── */}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Change Password
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Make sure your new password is at least 6 characters long.
            </p>

            <div className="space-y-5">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOld ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleChangePassword}
                disabled={
                  savingPassword ||
                  (!!confirmPassword && newPassword !== confirmPassword)
                }
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
  );
};

export default SettingsPage;
