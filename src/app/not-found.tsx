"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 min-h-[70vh]">
      <div className="text-center max-w-md py-20">
        <p
          className="text-[96px] sm:text-[128px] font-bold tracking-[-0.05em] leading-none text-zinc-100 dark:text-zinc-900 select-none"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="text-2xl font-bold tracking-[-0.02em] -mt-6 mb-3 relative">
          Page not found
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-8">
          The story you&apos;re looking for was moved, unpublished, or never written.
          Perhaps it&apos;s waiting for you to write it.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="h-10 px-5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium inline-flex items-center hover:bg-zinc-700 dark:hover:bg-white transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/write"
            className="h-10 px-5 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium inline-flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Write a story
          </Link>
        </div>
      </div>
    </main>
  );
}
