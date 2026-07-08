"use client";

import { useId } from "react";

/* Inkwell pen-nib mark — Inkwell Mono design system */
export default function InkwellLogo({
  width = 16,
  height = 21,
}: {
  width?: number;
  height?: number;
}) {
  const maskId = useId();
  return (
    <svg width={width} height={height} viewBox="0 0 200 210" fill="none" aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect x="40" y="20" width="130" height="95" fill="white" />
          <path d="M 100 110 L 92 48 C 86 66, 85 91, 100 110 Z" fill="black" />
          <path d="M 100 110 C 115 91, 114 66, 108 48 L 100 110 Z" fill="black" />
          <rect x="99.2" y="48" width="1.6" height="61" fill="black" />
          <circle cx="100" cy="75" r="5" fill="black" />
        </mask>
      </defs>
      <g transform="translate(100,110) rotate(25) translate(-100,-110)">
        <rect x="83" y="22" width="34" height="22" rx="4" fill="currentColor" />
        <g mask={`url(#${maskId})`}>
          <path
            d="M 83 44 C 78 56, 56 80, 56 94 L 100 110 L 144 94 C 144 80, 122 56, 117 44 Z"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
}
