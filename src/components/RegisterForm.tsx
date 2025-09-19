"use client";
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

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));

      // Clear error when file is selected
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

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

  const handleSubmit = (): void => {
    if (validateForm()) {
      console.log("Registration submitted:", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        profileImage: formData.profileImage,
        coverImage: formData.coverImage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-black/60">
              Join us and start your journey today.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Username Field */}
            <div>
              <label className="sr-only" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                placeholder="Username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="rounded-lg shadow-sm -space-y-px">
              <div>
                <label className="sr-only" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-t-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none rounded-b-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
            {(errors.password || errors.confirmPassword) && (
              <div className="space-y-1">
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Bio Field */}
            <div>
              <label className="sr-only" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-black/10 placeholder-black/50 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm resize-none"
                placeholder="Tell us about yourself (optional)"
              />
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-black/80 mb-2">
                Profile Image *
              </label>
              <input
                id="profileImage"
                name="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-black/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {errors.profileImage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.profileImage}
                </p>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-black/80 mb-2">
                Cover Image (optional)
              </label>
              <input
                id="coverImage"
                name="coverImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-black/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <button
                onClick={handleSubmit}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                Create Account
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-sm text-black/60">
            Already have an account?{" "}
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
