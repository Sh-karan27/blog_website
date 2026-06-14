"use client";

import React from "react";

export default function LoadingScreen({ status = "Loading…" }: { status?: string }) {
  return (
    <>
      <style>{`
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
        overflow: "hidden",
      }}>
        {/* Logo block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 40 }}>
          {/* Pen nib SVG icon */}
          <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8 L40 8 C44 8 47 11 47 16 L28 52 L9 16 C9 11 12 8 16 8Z" fill="#995F2F"/>
            <line x1="28" y1="19" x2="28" y2="49" stroke="white" strokeWidth="1.5" opacity="0.35"/>
            <ellipse cx="28" cy="21" rx="4" ry="3" fill="white" opacity="0.28"/>
          </svg>

          {/* Wordmark */}
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#000000",
          }}>
            Inkwell
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: 160,
          height: 2,
          borderRadius: 99,
          background: "#F0F0F0",
          overflow: "hidden",
          marginBottom: 16,
        }}>
          <div className="inkwell-bar-fill" />
        </div>

        {/* Status label */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
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
