"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent";

const inputClass =
  "w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-shadow";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "General question", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">Contact</p>
          <h1 className="text-4xl font-bold tracking-[-0.03em] leading-[1.1] mb-6">We read everything.</h1>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mb-10">
            Questions, bug reports, partnership ideas, or just a note about something you read —
            this inbox is checked by humans, daily.
          </p>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
              </span>
              <a href="mailto:hello@inkwell.blog" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                hello@inkwell.blog
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l2.5 2.5" />
                </svg>
              </span>
              <span className="text-zinc-500">Typical reply time: under 24 hours</span>
            </div>
          </div>
        </div>

        {status === "sent" ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-10 text-center">
            <p className="text-sm font-semibold mb-2">Message sent</p>
            <p className="text-sm text-zinc-500 mb-6">Thanks for reaching out — we&apos;ll get back to you within 24 hours.</p>
            <button
              onClick={() => {
                setStatus("idle");
                setForm({ name: "", email: "", topic: "General question", message: "" });
              }}
              className="h-9 px-4 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-zinc-200 dark:border-zinc-800 p-7">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="topic">Topic</label>
              <select id="topic" name="topic" value={form.topic} onChange={handleChange} className={inputClass}>
                <option>General question</option>
                <option>Bug report</option>
                <option>Account help</option>
                <option>Partnership</option>
                <option>Press</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                placeholder="What's on your mind?"
                className={`${inputClass} h-auto py-2 resize-none`}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full h-10 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
