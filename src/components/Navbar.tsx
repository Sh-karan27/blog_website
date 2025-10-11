"use client";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const profileImage =
    typeof window !== "undefined" ? localStorage.getItem("profileImage") : null;

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

  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
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
              ></path>
            </svg>
          </div>
          <span className="text-xl font-bold">Tech Insights</span>
        </div>

        {/* Center: Nav Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <a href="/" className="hover:text-primary transition-colors">
            Home
          </a>
          <a href="/articles" className="hover:text-primary transition-colors">
            Articles
          </a>
          <a href="/about" className="hover:text-primary transition-colors">
            About
          </a>
          <a href="/contact" className="hover:text-primary transition-colors">
            Contact
          </a>
        </div>

        {/* Right: Subscribe + Avatar */}
        <div className="flex items-center gap-4">
          <button className="btn btn-primary hidden sm:flex">Subscribe</button>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="User avatar"
                  src={
                    profileImage ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a onClick={() => router.push("/profile")}>Profile</a>
              </li>
              <li>
                <a onClick={() => router.push("/settings")}>Settings</a>
              </li>
              <li>
                <a onClick={logoutUser}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
