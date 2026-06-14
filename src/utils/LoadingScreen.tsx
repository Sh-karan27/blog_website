"use client";

import React from "react";

export default function LoadingScreen({ status = "Loading…" }: { status?: string }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');

        @keyframes draw-ink {
          to { stroke-dashoffset: 0; }
        }
        .ink-stroke {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: draw-ink 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }
        .ink-glow {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: draw-ink 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }
        @keyframes bar-sweep {
          0%   { width: 0%;   margin-left: 0;    }
          45%  { width: 65%;  margin-left: 0;    }
          55%  { width: 65%;  margin-left: 35%;  }
          100% { width: 0%;   margin-left: 100%; }
        }
        .inkwell-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: #995F2F;
          animation: bar-sweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}>

        {/* Full fountain pen SVG — exact from loading-screen-light.html */}
        <svg width="140" height="190" viewBox="0 0 250 310" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="nibMask">
              <rect x="60" y="135" width="120" height="65" fill="white"/>
              <path d="M 120 195 L 112 145 C 107 160, 106 180, 120 195 Z" fill="black"/>
              <path d="M 120 195 C 134 180, 133 160, 128 145 L 120 195 Z" fill="black"/>
              <rect x="119.3" y="145" width="1.4" height="49" fill="black"/>
              <circle cx="120" cy="168" r="4.5" fill="black"/>
            </mask>
          </defs>

          {/* Full pen rotated 28° around tip (120, 195) */}
          <g transform="translate(120,195) rotate(28) translate(-120,-195)">
            {/* End cap */}
            <path d="M 110 28 L 130 28 L 130 36 C 130 42, 125 44, 120 44 C 115 44, 110 42, 110 36 Z" fill="#7A4A22"/>
            <rect x="110" y="36" width="20" height="4" rx="1" fill="#995F2F"/>
            {/* Barrel body */}
            <rect x="110" y="40" width="20" height="100" fill="#995F2F"/>
            {/* Clip */}
            <rect x="130" y="44" width="4" height="88" rx="2" fill="#7A4A22"/>
            <ellipse cx="132" cy="133" rx="4" ry="3" fill="#6A3C18"/>
            {/* Transition ring */}
            <rect x="108" y="140" width="24" height="5" rx="2.5" fill="#7A4A22"/>
            {/* Grip section */}
            <rect x="111" y="145" width="18" height="22" fill="#7A4A22" rx="1"/>
            <line x1="111" y1="150" x2="129" y2="150" stroke="#995F2F" strokeWidth="1" opacity="0.5"/>
            <line x1="111" y1="155" x2="129" y2="155" stroke="#995F2F" strokeWidth="1" opacity="0.5"/>
            <line x1="111" y1="160" x2="129" y2="160" stroke="#995F2F" strokeWidth="1" opacity="0.5"/>
            {/* Nib collar ring */}
            <rect x="109" y="167" width="22" height="4" rx="2" fill="#6A3C18"/>
            {/* Nib body */}
            <g mask="url(#nibMask)">
              <path d="M 112 145 C 108 153, 88 172, 88 182 L 120 195 L 152 182 C 152 172, 132 153, 128 145 Z" fill="#995F2F"/>
            </g>
          </g>

          {/* Ink stroke S-curve flowing from tip — draws in on load */}
          <path className="ink-glow"
            d="M 120 195 C 132 208, 145 222, 143 238 C 141 254, 128 262, 114 269 C 102 275, 88 276, 80 281"
            stroke="#995F2F" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.10"/>
          <path className="ink-stroke"
            d="M 120 195 C 132 208, 145 222, 143 238 C 141 254, 128 262, 114 269 C 102 275, 88 276, 80 281"
            stroke="#995F2F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.72"/>
          <circle cx="120" cy="195" r="2" fill="#995F2F" opacity="0.5"/>
        </svg>

        {/* Wordmark */}
        <span style={{
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: "#000",
          lineHeight: 1,
          marginTop: 16,
          marginBottom: 32,
        }}>
          Inkwell
        </span>

        {/* Progress bar */}
        <div style={{
          width: 160,
          height: 2,
          borderRadius: 99,
          background: "#F0F0F0",
          overflow: "hidden",
          marginBottom: 13,
        }}>
          <div className="inkwell-bar-fill" />
        </div>

        {/* Status label */}
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#CCCCCC",
        }}>
          {status}
        </span>

      </div>
    </>
  );
}
