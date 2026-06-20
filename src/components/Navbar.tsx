"use client";
import axiosInstance from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
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
      <header className="fixed top-0 w-full z-50 bg-[#985F2E] shadow-md">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-14 sm:h-16 max-w-screen-2xl mx-auto">

          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-4 lg:gap-8 min-w-0">
            <div
              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
              onClick={() => router.push("/")}
            >
              <InkDrop className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="text-lg sm:text-xl font-black tracking-tighter text-white">Inkwell</span>
            </div>

            {/* Desktop nav links */}
            <nav id="inkwell-desktop-nav" style={{ display: "none", alignItems: "center", gap: 12 }}>
              {[
                { label: "Home", href: "/" },
                { label: "Articles", href: "/articles" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      textDecoration: "none", whiteSpace: "nowrap",
                      padding: "4px 12px", borderRadius: 6,
                      background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "transparent"; } }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <style>{`
              @media (min-width: 768px) {
                #inkwell-desktop-nav { display: flex !important; }
              }
            `}</style>
          </div>

          {/* Right: Write + Avatar + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Write — hidden on mobile */}
            <button
              onClick={() => router.push("/write")}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-[#985F2E] text-xs sm:text-sm font-bold rounded-lg hover:bg-[#F5F0EB] transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white/60 hover:ring-white transition-all"
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

            {/* Hamburger — mobile + tablet */}
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

      {/* Mobile / tablet fullscreen menu */}
      <div
        className={`md:hidden fixed inset-0 z-[100] bg-[#1A0E04] flex flex-col transition-all duration-300 ease-in-out ${
          menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {/* Top bar */}
        <div className="flex justify-between items-center px-5 sm:px-8 py-4 border-b border-white/10">
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
              className="text-white text-3xl sm:text-4xl font-bold tracking-tight py-4 sm:py-5 border-b border-white/10 hover:pl-3 hover:text-white/60 transition-all duration-200"
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bottom: logout */}
        <div className="px-5 sm:px-8 py-6 border-t border-white/10">
          <button
            onClick={logoutUser}
            className="text-red-400 text-sm font-medium hover:text-red-300 transition-colors py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
