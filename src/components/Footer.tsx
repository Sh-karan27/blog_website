"use client";

import React, { useState } from "react";
import Link from "next/link";

const T = {
  accent:      "#985F2E",
  accentHover: "#7A4A22",
  surface:     "#FFFFFF",
  text2:       "#1A1A1A",
  muted:       "#666666",
  border:      "#E5E5E5",
  borderStrong:"#CCCCCC",
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const isExternal = href === "#";
  return isExternal ? (
    <a
      href={href}
      style={{ fontSize: 14, color: hovered ? T.accent : T.text2, textDecoration: "none", transition: "color 0.15s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  ) : (
    <Link
      href={href}
      style={{ fontSize: 14, color: hovered ? T.accent : T.text2, textDecoration: "none", transition: "color 0.15s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: T.surface, borderTop: `1px solid ${T.border}`, paddingTop: 64, paddingBottom: 32 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

        {/* 4-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }} className="max-md:grid-cols-2 max-md:gap-8">

          {/* Brand + newsletter */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: T.accent }}>
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <path d="M14 2C14 2 23 11 23 17.5C23 22.1 19 25.5 14 25.5C9 25.5 5 22.1 5 17.5C5 11 14 2 14 2Z" fill="#985F2E" />
                <path d="M14 12C14 12 17.5 15.5 17.5 18C17.5 19.9 15.9 21 14 21C12.1 21 10.5 19.9 10.5 18C10.5 15.5 14 12 14 12Z" fill="#985F2E" fillOpacity="0.32" />
              </svg>
              Inkwell
            </Link>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginTop: 10, maxWidth: 260 }}>
              Write. Connect. Be Read. A modern platform for writers who mean business and readers who seek depth.
            </p>
            <NewsletterForm />
          </div>

          {/* Platform */}
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: T.muted, marginBottom: 14 }}>Platform</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/articles">Articles</FooterLink>
              <FooterLink href="/write">Write a Story</FooterLink>
              <FooterLink href="#">Explore Authors</FooterLink>
              <FooterLink href="#">Topics</FooterLink>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: T.muted, marginBottom: 14 }}>Legal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Cookie Policy</FooterLink>
              <FooterLink href="#">DMCA</FooterLink>
            </div>
          </div>

          {/* Social */}
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, color: T.muted, marginBottom: 14 }}>Social</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FooterLink href="#">Twitter / X</FooterLink>
              <FooterLink href="#">GitHub</FooterLink>
              <FooterLink href="#">LinkedIn</FooterLink>
              <FooterLink href="#">Discord</FooterLink>
              <FooterLink href="#">RSS Feed</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 28, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: T.muted }}>
          <span>© 2026 Inkwell. All rights reserved.</span>
          <span className="hidden sm:inline">Made with care for writers everywhere.</span>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Newsletter email"
        style={{
          flex: 1, padding: "8px 12px", border: `1.5px solid ${focused ? T.accent : T.border}`,
          borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none",
          background: T.surface, color: "#000000", transition: "border-color 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(152,95,46,0.12)" : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: T.accent, color: "white", border: "none", cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap" }}
        onMouseEnter={e => (e.currentTarget.style.background = T.accentHover)}
        onMouseLeave={e => (e.currentTarget.style.background = T.accent)}
      >
        Subscribe
      </button>
    </div>
  );
}
