"use client";

import React, { useState } from "react";
import Link from "next/link";
import InkwellLogo from "./InkwellLogo";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-12 pb-14">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-[17px] mb-4">
              <InkwellLogo width={15} height={19} />
              Inkwell
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">
              Write. Connect. Be&nbsp;Read.
              <br />
              Long-form writing for people who build things.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-400 mb-5">Platform</p>
            <ul className="space-y-3 text-sm font-medium text-zinc-500">
              <li>
                <Link href="/articles" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Articles</Link>
              </li>
              <li>
                <Link href="/write" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Write</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-400 mb-5">Legal</p>
            <ul className="space-y-3 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Content policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-400 mb-5">Newsletter</p>
            <p className="text-sm text-zinc-500 mb-4">One essay digest per week. No noise.</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-medium">
          <span>© 2026 Inkwell</span>
          <span>Made with care for writers everywhere.</span>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email for newsletter"
        className="flex-1 h-10 px-4 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent min-w-0"
        suppressHydrationWarning
      />
      <button
        className="h-10 px-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-white transition-colors shrink-0"
        suppressHydrationWarning
      >
        Join
      </button>
    </div>
  );
}
