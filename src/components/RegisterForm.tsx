"use client";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtil";
import InkwellLogo from "./InkwellLogo";
import ThemeToggle from "./ThemeToggle";

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

const getPasswordStrength = (pw: string): number => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const strengthLabel = ["Password strength", "Weak", "Fair", "Good", "Strong"];
const strengthBarClass = [
  "bg-zinc-200 dark:bg-zinc-800",
  "bg-red-500/70",
  "bg-amber-500/70",
  "bg-zinc-500",
  "bg-zinc-900 dark:bg-zinc-100",
];

const inputClass =
  "w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-shadow";
const inputErrorClass =
  "w-full h-10 px-3 rounded-md border border-red-400 dark:border-red-700 bg-white dark:bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800 focus:border-transparent transition-shadow";

export default function RegisterComponent() {
  const router = useRouter();
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
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const pwStrength = getPasswordStrength(formData.password);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      if (name === "profileImage") {
        setProfilePreview(URL.createObjectURL(files[0]));
      }
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
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("bio", formData.bio);
      if (formData.profileImage) data.append("profileImage", formData.profileImage);
      if (formData.coverImage) data.append("coverImage", formData.coverImage);
      await axiosInstance.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessToast("Account created successfully! You can now log in.");
      router.push("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      setApiError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <ThemeToggle className="fixed top-5 right-5 z-50 w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors" />

      {/* ── Brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 dark:bg-zinc-900 text-zinc-100 p-12 border-r border-zinc-800 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-lg">
          <InkwellLogo width={18} height={24} />
          Inkwell
        </Link>
        <blockquote className="max-w-md">
          <p className="text-3xl font-bold tracking-[-0.02em] leading-snug mb-6">
            &ldquo;There is no greater agony than bearing an untold story inside you.&rdquo;
          </p>
          <cite className="text-sm text-zinc-400 not-italic">— Maya Angelou</cite>
        </blockquote>
        <p className="text-xs text-zinc-500">Write. Connect. Be Read.</p>
      </div>

      {/* ── Form ── */}
      <div className="flex justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-sm py-4">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold tracking-tight mb-8">
            <InkwellLogo width={16} height={21} />
            Inkwell
          </Link>

          <h1 className="text-2xl font-bold tracking-[-0.02em] mb-1.5">Create your account</h1>
          <p className="text-sm text-zinc-500 mb-8">Join thousands of writers and readers.</p>

          {apiError && (
            <div className="mb-5 px-3.5 py-2.5 rounded-md border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-sm text-red-600 dark:text-red-400">
              {apiError}
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="sarahwrites"
                className={errors.username ? inputErrorClass : inputClass}
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={errors.email ? inputErrorClass : inputClass}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="8+ characters"
                  className={`${errors.password ? inputErrorClass : inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  aria-label="Show or hide password"
                >
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex gap-1.5 mt-2" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? strengthBarClass[pwStrength] : strengthBarClass[0]}`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">{strengthLabel[pwStrength]}</p>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repeat password"
                className={errors.confirmPassword ? inputErrorClass : inputClass}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="bio">
                Bio <span className="text-zinc-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={2}
                maxLength={160}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="A line or two about you…"
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent resize-none transition-shadow"
              />
              <p className="text-xs text-zinc-400 text-right mt-1">{formData.bio.length}/160</p>
            </div>

            <div>
              <span className="block text-sm font-medium mb-1.5">
                Profile image <span className="text-red-500">*</span>
              </span>
              <label
                className={`w-full rounded-md border border-dashed py-6 flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
                  errors.profileImage ? "border-red-400 dark:border-red-700" : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {profilePreview ? (
                  <div className="flex items-center gap-3">
                    <img src={profilePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Change photo</span>
                  </div>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
                    </svg>
                    <span className="text-xs font-medium">Click to upload profile photo</span>
                  </>
                )}
                <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {errors.profileImage && <p className="text-xs text-red-500 mt-1">{errors.profileImage}</p>}
            </div>

            <div>
              <span className="block text-sm font-medium mb-1.5">
                Cover image <span className="text-zinc-400 font-normal">(optional)</span>
              </span>
              <label className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-zinc-400 shrink-0">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-zinc-400 truncate">
                  {formData.coverImage ? formData.coverImage.name : "Upload cover image"}
                </span>
                <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2 dark:ring-offset-zinc-950"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
