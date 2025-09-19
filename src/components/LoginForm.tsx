"use client";
import React, { useState } from "react";
import axiosInstance from "@/lib/axios"; // your axios instance
import { useRouter } from "next/navigation";

export default function LoginComponent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // clear error on input
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const { accessToken, refreshToken, user } = response.data.data;

      // Save tokens in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("Login successful", user);

      // Redirect to home page or dashboard
      router.push("/");
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-black/60">
              Sign in to continue to your account.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="rounded-lg shadow-sm -space-y-px">
              <div>
                <label className="sr-only" htmlFor="email-address">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none rounded-t-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-b-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-sm text-black/60">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
