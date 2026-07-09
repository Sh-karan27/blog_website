"use client";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import InkwellLogo from "./InkwellLogo";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedImage = localStorage.getItem("profileImage");
    const storedUserId = localStorage.getItem("userId");
    if (storedImage) setProfileImage(storedImage);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const logoutUser = async () => {
    try {
      await axiosInstance.post("/users/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      router.push("/login");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const pathname = usePathname();
  const profileHref = userId ? `/profile/${userId}` : "/settings";

  if (!mounted) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-[17px] shrink-0">
            <InkwellLogo width={17} height={22} />
            Inkwell
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 text-[13.5px]">
            {NAV_LINKS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "px-3.5 py-2 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-900"
                      : "px-3.5 py-2 rounded-full font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/write"
              className="hidden md:inline-flex h-9 px-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13.5px] font-semibold items-center hover:bg-zinc-700 dark:hover:bg-white transition-colors shadow-sm"
            >
              Write
            </Link>

            {/* Avatar dropdown — desktop */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                className="w-9 h-9 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 ring-2 ring-white dark:ring-zinc-950 cursor-pointer"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="Account menu"
              >
                {profileImage ? (
                  <img alt="User avatar" src={profileImage} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                    IN
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg z-50 py-1 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <button
                    onClick={() => { router.push(profileHref); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { router.push("/settings"); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Settings
                  </button>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
                  <button
                    onClick={logoutUser}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600/90 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <span className="block w-4 h-[1.5px] bg-zinc-900 dark:bg-zinc-100 rounded" />
              <span className="block w-4 h-[1.5px] bg-zinc-900 dark:bg-zinc-100 rounded" />
              <span className="block w-4 h-[1.5px] bg-zinc-900 dark:bg-zinc-100 rounded" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet fullscreen menu */}
      <div
        className={`md:hidden fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col transition-all duration-300 ease-in-out ${
          menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {/* Top bar */}
        <div className="flex justify-between items-center px-5 sm:px-8 h-16 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 font-extrabold tracking-tight text-[17px]"
          >
            <InkwellLogo width={17} height={22} />
            Inkwell
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-5 sm:px-8 pt-6 flex-1 overflow-y-auto">
          {[
            { label: "Home", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: "Write", href: "/write" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "My Profile", href: profileHref },
            { label: "Settings", href: "/settings" },
          ].map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] py-4 sm:py-5 border-b border-zinc-100 dark:border-zinc-900 hover:pl-3 hover:text-zinc-400 dark:hover:text-zinc-500 transition-all duration-200"
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bottom: logout */}
        <div className="px-5 sm:px-8 py-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={logoutUser}
            className="text-red-600/90 dark:text-red-400 text-sm font-medium hover:text-red-600 transition-colors py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
