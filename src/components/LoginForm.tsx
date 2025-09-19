"use client";
import React, { useState } from "react";

export default function LoginComponent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    console.log("Login submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Main Content */}
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
            <input name="remember" type="hidden" value="true" />

            <div className="rounded-lg shadow-sm -space-y-px">
              <div>
                <label className="sr-only" htmlFor="email-address">
                  Username or Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none rounded-t-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                  placeholder="Username or Email"
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
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                Log In
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-sm text-black/60">
            Don't have an account?{" "}
            <a
              href="#"
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
