"use client";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const InkDrop = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
  </svg>
);

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
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

  const profileHref = userId ? `/profile/${userId}` : "/settings";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "My Profile", href: profileHref },
    { label: "Settings", href: "/settings" },
  ];

  if (!mounted) return null;

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#985F2E] shadow-md">
        <div className="flex justify-between items-center px-4 sm:px-8 h-16 max-w-screen-2xl mx-auto">

          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
              onClick={() => router.push("/")}
            >
              <InkDrop className="w-6 h-6 text-white" />
              <span className="text-xl font-black tracking-tighter text-white">Inkwell</span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right: Write + Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => router.push("/write")}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white text-[#985F2E] text-sm font-bold rounded-lg hover:bg-[#F5F0EB] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write
            </button>

            {/* Avatar dropdown — desktop */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                className="p-0 bg-transparent border-none cursor-pointer rounded-full"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <img
                  alt="User avatar"
                  src={profileImage || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/60 hover:ring-white transition-all"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 py-1 border border-[#E5E5E5] overflow-hidden">
                  <button
                    onClick={() => { router.push(profileHref); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F5F5] transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { router.push("/settings"); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F5F5] transition-colors"
                  >
                    Settings
                  </button>
                  <div className="border-t border-[#E5E5E5] my-1" />
                  <button
                    onClick={logoutUser}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded-md hover:bg-white/10 transition-colors"
            >
              <span className="block w-5 h-[2px] bg-white rounded" />
              <span className="block w-5 h-[2px] bg-white rounded" />
              <span className="block w-5 h-[2px] bg-white rounded" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={`md:hidden fixed inset-0 z-[100] bg-[#1A0E04] flex flex-col transition-all duration-500 ease-in-out ${
          menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {/* Top bar */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { router.push("/"); setMenuOpen(false); }}
          >
            <InkDrop className="w-6 h-6 text-[#985F2E]" />
            <span className="text-xl font-black tracking-tighter text-white">Inkwell</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-6 pt-8 flex-1">
          {[
            { label: "Home", href: "/" },
            { label: "Write", href: "/write" },
            { label: "My Profile", href: profileHref },
            { label: "Settings", href: "/settings" },
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

        {/* Bottom actions */}
        <div className="px-6 py-8 border-t border-white/10 flex flex-col gap-2">
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
