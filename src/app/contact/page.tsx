"use client";

import { useState } from "react";

const ACCENT = "#985F2E";
const BORDER = "#E5E5E5";
const MUTED = "#666666";
const SURFACE = "#F5F5F5";

const channels = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    value: "hello@inkwell.dev",
    sub: "We reply within 24 hours",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    label: "GitHub",
    value: "github.com/Sh-karan27",
    sub: "Open issues & contributions",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M21 2H3v16h5v4l4-4h5l4-4V2z" />
        <line x1="9" y1="9" x2="9" y2="9" /><line x1="12" y1="9" x2="12" y2="9" /><line x1="15" y1="9" x2="15" y2="9" />
      </svg>
    ),
    label: "Support",
    value: "support@inkwell.dev",
    sub: "Technical help & bug reports",
  },
];

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("sent");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: `1.5px solid ${BORDER}`,
    borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fff",
    color: "#1A1A1A", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ background: "#fff", color: "#171C20", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: "repeating-linear-gradient(-45deg, rgba(152,95,46,0.06) 0px, rgba(152,95,46,0.06) 1px, #fff 1px, #fff 20px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 72px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, marginBottom: 20 }}>Get in touch</p>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>
            We'd love to<br />hear from you.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: MUTED }}>
            Questions, feedback, partnership ideas, or just want to say hello — drop us a message.
          </p>
        </div>
      </section>

      <div className="contact-grid" style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 80px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>

        {/* Contact form */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 28 }}>Send a message</h2>

          {status === "sent" ? (
            <div style={{ border: `1.5px solid #22C55E`, borderRadius: 12, padding: "32px 28px", background: "rgba(34,197,94,0.05)", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Message sent!</h3>
              <p style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              <button
                onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                style={{ padding: "8px 20px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="name-email-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} required style={{ ...inputStyle, appearance: "none" }}>
                  <option value="">Select a topic…</option>
                  <option value="general">General question</option>
                  <option value="bug">Bug report</option>
                  <option value="feature">Feature request</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Message</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange} required
                  placeholder="Tell us what's on your mind…"
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  padding: "12px 28px", background: status === "sending" ? "#C8A882" : ACCENT,
                  color: "#fff", border: "none", borderRadius: 8, fontSize: 14,
                  fontWeight: 700, cursor: status === "sending" ? "not-allowed" : "pointer",
                  alignSelf: "flex-start", transition: "background 0.15s",
                }}
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: 88 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 20 }}>Other ways to reach us</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {channels.map((c) => (
              <div key={c.label} style={{ display: "flex", gap: 14, padding: "16px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                <div style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A", marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 3 }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, padding: "20px", background: "rgba(152,95,46,0.07)", border: `1px solid rgba(152,95,46,0.2)`, borderRadius: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A", marginBottom: 6 }}>Response time</div>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
              We aim to respond to all messages within <strong style={{ color: "#1A1A1A" }}>24 hours</strong> on business days.
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        input:focus, textarea:focus, select:focus { border-color: ${ACCENT} !important; box-shadow: 0 0 0 3px rgba(152,95,46,0.12); }
        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-grid aside { position: static !important; }
          .name-email-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
