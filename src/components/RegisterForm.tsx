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

const getPasswordStrength = (pw: string): number => {
  if (!pw) return 0;
  if (pw.length < 4) return 1;
  if (pw.length < 6) return 2;
  if (pw.length < 10) return 3;
  return 4;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-[#985F2E]", "bg-green-500"];
const strengthText = ["", "text-red-500", "text-yellow-500", "text-[#985F2E]", "text-green-500"];

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
    setSuccess(null);
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("bio", formData.bio);
      if (formData.profileImage) data.append("profileImage", formData.profileImage);
      if (formData.coverImage) data.append("coverImage", formData.coverImage);
      const res = await axiosInstance.post("/users/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Account created successfully! You can now log in.");
      console.log("✅ Registered:", res.data);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-[#E5E5E5] focus:ring-[#985F2E]/30 focus:border-[#985F2E]"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-[420px] flex-col justify-between p-12 flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #985F2E 0%, #7A4A22 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-20 right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
            </svg>
            <span className="text-2xl font-black tracking-tighter text-white">Inkwell</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white leading-tight mb-4">
            Start your writing journey today
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-10">
            Join a community of thoughtful writers and curious readers.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {[
            { step: "01", label: "Create account", done: true },
            { step: "02", label: "Write your first story", done: false },
            { step: "03", label: "Find readers", done: false },
            { step: "04", label: "Build your following", done: false },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${s.done ? "bg-white text-[#985F2E]" : "bg-white/20 text-white"}`}>
                {s.done ? "✓" : s.step}
              </div>
              <span className={`text-sm font-semibold ${s.done ? "text-white" : "text-white/50"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <svg className="w-6 h-6 text-[#985F2E]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
            </svg>
            <span className="text-xl font-black tracking-tighter text-gray-900">Inkwell</span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-8">Start your journey with us</p>

          {apiError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {apiError}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              {success}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="space-y-4"
          >
            {/* Username + Email row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className={inputClass("username")}
                />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
              </div>
              <div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className={inputClass("email")}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className={inputClass("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? strengthColor[pwStrength] : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthText[pwStrength]}`}>
                    {strengthLabel[pwStrength]}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className={inputClass("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Bio */}
            <div>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Bio (optional) — tell people a bit about yourself"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#985F2E]/30 focus:border-[#985F2E] resize-none transition-all"
                maxLength={160}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {formData.bio.length}/160
              </p>
            </div>

            {/* Profile Image upload */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Profile Image <span className="text-red-500">*</span>
              </p>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-[#985F2E] hover:bg-[#FBF7F4]"
                style={{ borderColor: errors.profileImage ? "#ef4444" : "#E5E5E5", minHeight: "100px" }}>
                {profilePreview ? (
                  <div className="flex items-center gap-3 p-4">
                    <img src={profilePreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-[#985F2E]" />
                    <span className="text-sm text-[#985F2E] font-medium">Change photo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-5">
                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <p className="text-xs text-gray-400">Click to upload profile photo</p>
                  </div>
                )}
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {errors.profileImage && <p className="text-xs text-red-500 mt-1">{errors.profileImage}</p>}
            </div>

            {/* Cover Image */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Cover Image <span className="text-gray-400">(optional)</span></p>
              <label className="flex items-center gap-3 w-full px-4 py-3 border border-dashed border-[#E5E5E5] rounded-xl cursor-pointer hover:border-[#985F2E] hover:bg-[#FBF7F4] transition-all">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-400">
                  {formData.coverImage ? formData.coverImage.name : "Upload cover image"}
                </span>
                <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#985F2E] text-white font-bold hover:bg-[#7A4A22] transition-all disabled:opacity-50 flex items-center justify-center shadow-sm hover:shadow-md mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-[#985F2E] hover:text-[#7A4A22] transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
