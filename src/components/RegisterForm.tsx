"use client";
import axiosInstance from "@/lib/axios";
import React, { useState, ChangeEvent } from "react";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
  profileImage: File | null;
  coverImage: File | null;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  profileImage?: string;
}

export default function RegisterComponent() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    profileImage: null,
    coverImage: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.profileImage) {
      newErrors.profileImage = "Profile image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);
    setSuccess(null);

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("bio", formData.bio);

      if (formData.profileImage) {
        data.append("profileImage", formData.profileImage);
      }
      if (formData.coverImage) {
        data.append("coverImage", formData.coverImage);
      }

      const res = await axiosInstance.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Account created successfully!");
      console.log("✅ Registered:", res.data);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-black text-white rounded-2xl p-8 space-y-6">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Create account
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Start your journey with us
              </p>
            </div>

            {/* Error / Success */}
            {apiError && (
              <p className="text-red-400 text-sm text-center">{apiError}</p>
            )}
            {success && (
              <p className="text-green-400 text-sm text-center">{success}</p>
            )}

            {/* FORM (Enter works automatically) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Username */}
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/40 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              />

              {/* Email */}
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/40 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              />

              {/* Password */}
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/40 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              />

              {/* Confirm Password */}
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/40 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              />

              {/* Bio */}
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Bio (optional)"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/40 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-none transition"
              />

              {/* Profile Image */}
              <div>
                <p className="text-xs text-white/50 mb-1">Profile Image *</p>
                <input
                  type="file"
                  name="profileImage"
                  onChange={handleFileChange}
                  className="w-full text-sm file:bg-white file:text-black file:px-4 file:py-2 file:rounded-md file:border-0 hover:file:bg-gray-200"
                />
              </div>

              {/* Cover Image */}
              <div>
                <p className="text-xs text-white/50 mb-1">Cover Image</p>
                <input
                  type="file"
                  name="coverImage"
                  onChange={handleFileChange}
                  className="w-full text-sm file:bg-white file:text-black file:px-4 file:py-2 file:rounded-md file:border-0 hover:file:bg-gray-200"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-black/60">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-black hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
