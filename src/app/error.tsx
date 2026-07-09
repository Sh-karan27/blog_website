"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center px-6 min-h-[70vh]">
      <div className="text-center max-w-lg py-20">
        <p
          className="text-[96px] sm:text-[128px] font-black tracking-[-0.05em] leading-none text-zinc-100 dark:text-zinc-900 select-none"
          aria-hidden="true"
        >
          500
        </p>
        <h1 className="text-2xl font-bold tracking-[-0.02em] -mt-6 mb-3 relative">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-7 max-w-md mx-auto">
          An unexpected error interrupted your reading. Our team has been notified.
          Try again in a moment — your draft is safe.
        </p>

        {error.digest && (
          <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-400 mb-9">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
            Ref: {error.digest}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="h-11 px-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold inline-flex items-center gap-2 hover:bg-zinc-700 dark:hover:bg-white transition-all hover:gap-3 shadow-sm"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Try again
          </button>
          <Link
            href="/"
            className="h-11 px-5 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-medium inline-flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Go home
          </Link>
        </div>

        <p className="text-xs text-zinc-400 mt-8">
          Still stuck?{" "}
          <Link
            href="/contact"
            className="underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Contact support
          </Link>
        </p>
      </div>
    </main>
  );
}
