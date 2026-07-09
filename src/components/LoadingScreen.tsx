/* Inkwell Mono — fullscreen loading state */
export default function LoadingScreen({ status }: { status?: string }) {
  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center">
        <div className="loading-logo flex items-center gap-2.5 mb-8">
          <svg width="22" height="28" viewBox="0 0 200 210" fill="none" aria-hidden="true" className="text-zinc-900 dark:text-zinc-100">
            <g transform="translate(100,110) rotate(25) translate(-100,-110)">
              <rect x="83" y="22" width="34" height="22" rx="4" fill="currentColor" />
              <path d="M 83 44 C 78 56, 56 80, 56 94 L 100 110 L 144 94 C 144 80, 122 56, 117 44 Z" fill="currentColor" />
            </g>
          </svg>
          <span className="text-2xl font-black tracking-[-0.03em] text-zinc-900 dark:text-zinc-100">Inkwell</span>
        </div>

        <div
          className="relative w-40 h-[3px] rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden"
          role="progressbar"
          aria-label="Loading"
        >
          <div className="loading-bar-fill absolute inset-y-0 left-[-40%] w-2/5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
        </div>

        {status && (
          <p className="mt-5 text-xs font-medium text-zinc-400 dark:text-zinc-600">{status}</p>
        )}
      </div>
    </main>
  );
}
