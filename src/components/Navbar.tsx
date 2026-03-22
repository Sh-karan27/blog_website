"use client";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) setProfileImage(storedImage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutUser = async () => {
    try {
      await axiosInstance.post("/users/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/login");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  if (!mounted) return null;

  return (
    <header className="fixed top-0 w-full z-50 bg-base-100/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(23,28,32,0.06)] border-b border-base-200">
      <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Left: Logo + Nav Links together */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => router.push("/")}
          >
            <div className="h-7 w-7 text-primary">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tighter">
              Tech Insights
            </span>
          </div>

          {/* Nav Links */}
          <nav className=" md:flex items-center gap-6 lg:gap-8 text-sm tracking-wide font-medium">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <a
              href="/articles"
              className="hover:text-primary transition-colors"
            >
              Articles
            </a>
            <a href="/about" className="hover:text-primary transition-colors">
              About
            </a>
            <a href="/contact" className="hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
        </div>

        {/* Right: Avatar Dropdown */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            className="p-0 bg-transparent border-none cursor-pointer rounded-full"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <img
              alt="User avatar"
              src={
                profileImage ||
                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              }
              className="w-10 h-10 rounded-full object-cover ring-2 ring-base-300 hover:ring-primary transition-all"
            />
          </button>

          {dropdownOpen && (
            <ul className="menu menu-sm absolute right-0 mt-2 w-52 bg-base-100 rounded-box shadow-lg z-50 p-2 border border-base-200">
              <li>
                <button
                  onClick={() => {
                    router.push("/profile");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left"
                >
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/settings");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left"
                >
                  Settings
                </button>
              </li>
              <li>
                <button
                  onClick={logoutUser}
                  className="w-full text-left text-error"
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
