"use client";

import Link from "next/link";

const InkDrop = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
  </svg>
);

const suggestedArticles = [
  {
    label: "tech",
    title: "The Quiet Revolution: How Small Teams Are Rewriting the Rules",
    author: "Sarah Chen",
    time: "8 min",
  },
  {
    label: "design",
    title: "Designing for Clarity: A Manifesto Against Complexity",
    author: "Emma Walsh",
    time: "9 min",
  },
  {
    label: "AI",
    title: "AI Won't Take Your Job, But Here's What Might",
    author: "Priya Kumar",
    time: "7 min",
  },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#985F2E] shadow-md">
        <div className="flex justify-between items-center px-4 sm:px-8 h-16 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <InkDrop className="w-6 h-6 text-white" />
            <span className="text-xl font-black tracking-tighter text-white">Inkwell</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: "About", href: "/about" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="text-white/80 hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center pt-16 px-6 py-20">
        <div className="text-center max-w-[520px]">
          {/* 404 number */}
          <div
            className="font-black leading-none mb-2 text-[#985F2E] select-none"
            style={{
              fontSize: "clamp(96px, 15vw, 160px)",
              letterSpacing: "-0.05em",
              animation: "inkwell-shimmer 3s ease-in-out infinite",
            }}
            aria-hidden="true"
          >
            404
          </div>

          {/* Floating ink drops */}
          <div className="relative mx-auto my-8 w-[120px] h-[60px]" aria-hidden="true">
            <span
              className="absolute rounded-full bg-[#985F2E] opacity-[0.12]"
              style={{
                width: 16, height: 16, top: 10, left: 10,
                animation: "inkwell-float 4s ease-in-out infinite",
              }}
            />
            <span
              className="absolute rounded-full opacity-[0.12]"
              style={{
                width: 24, height: 24, top: 0, left: "50%",
                background: "#0EA5E9",
                animation: "inkwell-float2 4s ease-in-out 0.8s infinite",
              }}
            />
            <span
              className="absolute rounded-full bg-[#985F2E] opacity-[0.12]"
              style={{
                width: 14, height: 14, top: 14, right: 10,
                animation: "inkwell-float 4s ease-in-out 1.6s infinite",
              }}
            />
          </div>

          <h1 className="text-[28px] font-black tracking-[-0.02em] mb-3 text-gray-900">
            Page not found
          </h1>
          <p className="text-base text-[#6E7881] leading-[1.7] mb-9 max-w-[380px] mx-auto">
            The page you're looking for may have been moved, deleted, or never existed.
            Let's get you somewhere good.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#985F2E] text-white text-sm font-bold rounded-xl hover:bg-[#7A4A22] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Go Home
            </Link>
            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#E4E8EE] text-[#171C20] text-sm font-bold rounded-xl hover:bg-[#F0F4FA] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Write a Story
            </Link>
          </div>
        </div>
      </main>

      {/* Suggested articles strip */}
      <section className="bg-[#F0F4FA] border-t border-[#E4E8EE] py-10">
        <p className="text-center text-[11px] text-[#6E7881] font-bold tracking-[0.06em] uppercase mb-6">
          You might enjoy
        </p>
        <div className="max-w-[840px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestedArticles.map((article, i) => (
            <Link
              key={i}
              href="/"
              className="flex items-start gap-2.5 p-3.5 border border-[#E4E8EE] rounded-2xl bg-white hover:bg-[#FDF6EF] hover:border-[#985F2E]/25 hover:-translate-y-px transition-all no-underline text-inherit"
            >
              {/* Thumbnail placeholder */}
              <div className="w-14 h-[42px] rounded-lg bg-[#F0F4FA] flex-shrink-0 flex items-center justify-center overflow-hidden">
                <span className="text-[7px] font-mono text-[#6E7881] uppercase tracking-wide">{article.label}</span>
              </div>
              <div>
                <p className="text-[13px] font-bold leading-[1.35] text-gray-900 line-clamp-2 hover:text-[#985F2E] transition-colors">
                  {article.title}
                </p>
                <p className="text-[11px] text-[#6E7881] mt-1">
                  {article.author} · {article.time}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes inkwell-shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.7; }
          100% { opacity: 1; }
        }
        @keyframes inkwell-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes inkwell-float2 {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
