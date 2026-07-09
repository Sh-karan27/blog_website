"use client";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtil";
import InkwellLogo from "./InkwellLogo";
import ThemeToggle from "./ThemeToggle";

const inputClass =
  "w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-shadow";

export default function LoginComponent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("profileImage", user?.profileImage?.url);
      localStorage.setItem("userId", user?._id);
      router.push("/");
      showSuccessToast("Login successful!");
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Something went wrong");
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
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
            &ldquo;The discipline of writing something down is the first step toward making it happen.&rdquo;
          </p>
          <cite className="text-sm text-zinc-400 not-italic">— Lee Iacocca</cite>
        </blockquote>
        <p className="text-xs text-zinc-500">Write. Connect. Be Read.</p>
      </div>

      {/* ── Form ── */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold tracking-tight mb-10">
            <InkwellLogo width={16} height={21} />
            Inkwell
          </Link>

          <h1 className="text-2xl font-bold tracking-[-0.02em] mb-1.5">Welcome back</h1>
          <p className="text-sm text-zinc-500 mb-8">Log in to keep writing.</p>

          {error && (
            <div className="mb-5 px-3.5 py-2.5 rounded-md border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-sm text-red-600 dark:text-red-400">
              {error}
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
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2 dark:ring-offset-zinc-950"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
