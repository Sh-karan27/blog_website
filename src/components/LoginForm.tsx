"use client";
import React, { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtil";

export default function LoginComponent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

      router.push("/");
      showSuccessToast("Login successful!");
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Something went wrong");
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-black text-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-8 space-y-6">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-white/60">Sign in to continue</p>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/40 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              />

              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/20 placeholder-white/40 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {/* Forgot */}
            <div className="text-right">
              <a className="text-sm text-white/50 hover:text-white transition cursor-pointer">
                Forgot password?
              </a>
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Log In"
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-black/60">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="font-semibold text-black hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
