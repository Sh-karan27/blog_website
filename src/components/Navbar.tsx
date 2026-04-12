"use client";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
    <>
      <header className="fixed top-0 w-full z-50 bg-base-100/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(23,28,32,0.06)] border-b border-base-200">
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-screen-2xl mx-auto">
          {/* Left: Logo + Nav Links — ORIGINAL STRUCTURE */}
          <div className="flex items-center gap-8">
            {/* Logo — UNCHANGED */}
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

            {/* Nav Links — visible always on desktop, hidden only on mobile */}
            <nav className="flex items-center gap-6 lg:gap-8 text-sm tracking-wide font-medium max-md:hidden">
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
              <a
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Right: Avatar (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Avatar Dropdown — desktop only */}
            <div className="relative max-md:hidden" ref={dropdownRef}>
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

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded-md hover:bg-base-200 transition-colors"
            >
              <span className="block w-5 h-[2px] bg-black rounded" />
              <span className="block w-5 h-[2px] bg-black rounded" />
              <span className="block w-5 h-[2px] bg-black rounded" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={`md:hidden fixed inset-0 z-[100] bg-black flex flex-col transition-all duration-500 ease-in-out ${
          menuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {/* Top bar: logo + X */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              router.push("/");
              setMenuOpen(false);
            }}
          >
            <div className="h-7 w-7 text-white">
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
            <span className="text-xl font-bold tracking-tighter text-white">
              Tech Insights
            </span>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-6 pt-8 flex-1">
          {[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ].map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-white text-4xl font-bold tracking-tight py-5 border-b border-white/10 hover:pl-3 hover:text-white/60 transition-all duration-200"
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bottom: user actions */}
        <div className="px-6 py-8 border-t border-white/10 flex flex-col gap-2">
          <button
            onClick={() => {
              router.push("/profile");
              setMenuOpen(false);
            }}
            className="w-full text-left text-white/60 text-sm hover:text-white transition-colors py-2"
          >
            Profile
          </button>
          <button
            onClick={() => {
              router.push("/settings");
              setMenuOpen(false);
            }}
            className="w-full text-left text-white/60 text-sm hover:text-white transition-colors py-2"
          >
            Settings
          </button>
          <button
            onClick={logoutUser}
            className="w-full text-left text-red-400 text-sm hover:text-red-300 transition-colors py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
