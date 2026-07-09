import Link from "next/link";

const values = [
  {
    title: "Reading first",
    body: "Every product decision starts with the reading experience. If a feature makes reading worse, it doesn't ship.",
  },
  {
    title: "Writers own their work",
    body: "Your words, your audience, your export button. Leave anytime and take everything with you.",
  },
  {
    title: "Quiet by design",
    body: "No streaks, no badges, no push notifications begging for attention. The work is the reward.",
  },
];

const stats = [
  { value: "12k+", label: "Writers" },
  { value: "84k", label: "Stories" },
  { value: "2.1M", label: "Monthly readers" },
];

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">About</p>
      <h1 className="text-4xl font-bold tracking-[-0.03em] leading-[1.1] mb-8">
        A place for writing that takes its time.
      </h1>

      <div className="text-[17px] leading-[1.75] text-zinc-700 dark:text-zinc-300 space-y-6">
        <p>
          Inkwell is a long-form publishing platform for people who build things — engineers,
          designers, founders, and the writers who make sense of their work. No infinite feeds
          engineered for outrage. No engagement bait. Just essays worth the twenty minutes they
          ask of you.
        </p>
        <p>
          We believe the best technical writing is personal. It comes from someone who shipped
          the code, sat in the meeting, made the mistake. Inkwell exists to give that writing a
          home with the typography and reading experience it deserves.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 my-14">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-950 p-6">
            <p className="text-2xl font-bold tracking-[-0.02em]">{s.value}</p>
            <p className="text-xs text-zinc-400 uppercase tracking-[0.15em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold tracking-[-0.02em] mb-5">What we stand for</h2>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {values.map((v) => (
          <div key={v.title} className="py-5 grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-6">
            <h3 className="text-sm font-semibold">{v.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex gap-3">
        <Link
          href="/register"
          className="h-10 px-5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium inline-flex items-center hover:bg-zinc-700 dark:hover:bg-white transition-colors"
        >
          Start writing
        </Link>
        <Link
          href="/articles"
          className="h-10 px-5 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium inline-flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          Browse articles
        </Link>
      </div>
    </main>
  );
}
