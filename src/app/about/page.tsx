import Link from "next/link";

const ACCENT = "#985F2E";
const ACCENT2 = "#7A4A22";
const BORDER = "#E5E5E5";
const MUTED = "#666666";
const SURFACE = "#F5F5F5";

const values = [
  {
    title: "Quality over quantity",
    body: "We believe a single well-crafted piece is worth more than a hundred rushed ones. Every story published here deserves to be read.",
  },
  {
    title: "Writers first",
    body: "No paywalls between you and your audience. No algorithmic black boxes. Your words reach readers because they're good — full stop.",
  },
  {
    title: "Open conversation",
    body: "Ideas sharpen through dialogue. We build tools that make it easy to respond, discuss, and disagree — respectfully.",
  },
  {
    title: "Built to last",
    body: "Trends fade. We care about writing that holds up — stories you'd still want to read years from now.",
  },
];

const team = [
  { name: "Karan Shukla", role: "Founder & Developer", initials: "KS" },
  { name: "Design Team", role: "UI / UX", initials: "DT" },
  { name: "Editorial", role: "Content & Curation", initials: "ED" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#fff", color: "#171C20", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: "repeating-linear-gradient(-45deg, rgba(152,95,46,0.06) 0px, rgba(152,95,46,0.06) 1px, #fff 1px, #fff 20px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 72px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, marginBottom: 20 }}>About Inkwell</p>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 24 }}>
            A home for writing<br />that actually matters.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: MUTED, maxWidth: 580 }}>
            Inkwell is an independent blogging platform built for writers who care about craft — and readers who want something worth their time.
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20 }}>The story</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 16, lineHeight: 1.8, color: "#333" }}>
            <p>
              Inkwell started with a simple frustration: most writing platforms optimise for engagement metrics, not the quality of the writing itself. Endless feeds, notification badges, and recommendation engines pull writers toward what goes viral rather than what endures.
            </p>
            <p>
              We set out to build something different — a clean, distraction-free space where a well-told story is the only thing that counts. No follower counts plastered on every post. No "trending" feeds driven by outrage. Just writing, and people who want to read it.
            </p>
            <p>
              Today, Inkwell is home to writers across technology, design, science, culture, and everything in between. We're small by choice, and proud of it.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 40 }}>What we stand for</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {values.map((v) => (
              <div key={v.title} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ width: 32, height: 3, background: ACCENT, borderRadius: 2, marginBottom: 16 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTED }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 40 }}>The team</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {team.map((m) => (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 14, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px", minWidth: 220 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT2}, #5C3518)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                  {m.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}>Ready to write?</h2>
          <p style={{ fontSize: 15, color: MUTED, marginBottom: 32 }}>Join the writers already sharing their ideas on Inkwell.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/write"
              style={{ padding: "12px 28px", background: ACCENT, color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            >
              Start writing
            </Link>
            <Link
              href="/articles"
              style={{ padding: "12px 28px", background: "#fff", color: "#1A1A1A", border: `1.5px solid ${BORDER}`, borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            >
              Browse articles
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
