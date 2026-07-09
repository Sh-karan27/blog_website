/* Inkwell Mono — fullscreen loading state */
export default function LoadingScreen({ status = "Loading" }: { status?: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-col items-center">
        <div className="mb-9">
          <svg width="46" height="58" viewBox="0 0 200 210" fill="none" aria-hidden="true" className="text-zinc-900 dark:text-zinc-100">
            <g className="nib-wrap">
              <rect x="83" y="22" width="34" height="22" rx="4" fill="currentColor" />
              <path d="M 83 44 C 78 56, 56 80, 56 94 L 100 110 L 144 94 C 144 80, 122 56, 117 44 Z" fill="currentColor" />
              <path className="ink-channel" d="M 100 50 L 100 108" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="100" cy="75" r="5" fill="#fff" />
            </g>
          </svg>
        </div>

        <p className="text-xl font-black tracking-[-0.03em] mb-1">Inkwell</p>
        <p className="dot-line text-[11px] font-semibold tracking-[0.28em] uppercase text-zinc-400 mb-8">
          {status}
        </p>

        <div className="w-52 h-[3px] rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div className="bar-fill h-full w-full rounded-full bg-zinc-900 dark:bg-zinc-100" />
        </div>
      </div>
    </main>
  );
}
