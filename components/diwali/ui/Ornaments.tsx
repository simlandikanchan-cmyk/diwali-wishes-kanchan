"use client";

import { useId } from "react";

export function DiyaMark({ className = "" }: { className?: string }) {
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden
      className={`h-9 w-9 ${className}`}
      fill="none"
    >
      <defs>
        <linearGradient id={`flame-${id}`} x1="18" y1="4" x2="18" y2="20">
          <stop offset="0%" stopColor="#fff6cf" />
          <stop offset="45%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#ff7a1a" />
        </linearGradient>
        <linearGradient id={`bowl-${id}`} x1="4" y1="22" x2="32" y2="32">
          <stop offset="0%" stopColor="#f8e3a1" />
          <stop offset="55%" stopColor="#d4a437" />
          <stop offset="100%" stopColor="#8f6508" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" stroke="rgba(248,227,161,0.28)" />
      <path
        d="M18 7.2c3.1 3.7 4.6 6.3 4.6 8.6a4.6 4.6 0 0 1-9.2 0c0-2.3 1.5-4.9 4.6-8.6Z"
        fill={`url(#flame-${id})`}
      />
      <path
        d="M7 21.4c2.9 3.7 6.8 5.4 11 5.4s8.1-1.7 11-5.4c-2.4 5.7-6.3 8.4-11 8.4S9.4 27.1 7 21.4Z"
        fill={`url(#bowl-${id})`}
      />
      <path
        d="M9.5 23.6c2.4 2.2 5.2 3.3 8.5 3.3s6.1-1.1 8.5-3.3"
        stroke="rgba(255,249,230,0.5)"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Mandala({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 24 }, (_, i) => i);
  const outer = Array.from({ length: 16 }, (_, i) => i);
  const spokes = [0, 45, 90, 135];

  return (
    <svg
      viewBox="-200 -200 400 400"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
    >
      <circle r="188" strokeWidth="0.6" strokeDasharray="2 6" />
      <circle r="168" strokeWidth="0.3" />
      <circle r="150" strokeWidth="0.5" />
      <circle r="96" strokeWidth="0.8" />
      <circle r="44" strokeWidth="0.8" />
      {petals.map((i) => (
        <path
          key={`p-${i}`}
          d="M0 -48C16 -74 16 -112 0 -142C-16 -112 -16 -74 0 -48"
          strokeWidth="0.7"
          transform={`rotate(${i * 15})`}
        />
      ))}
      {outer.map((i) => (
        <path
          key={`o-${i}`}
          d="M0 -150L8 -168L0 -186L-8 -168Z"
          strokeWidth="0.6"
          transform={`rotate(${i * 22.5})`}
        />
      ))}
      {spokes.map((angle) => (
        <line
          key={`s-${angle}`}
          x1="0"
          y1="-188"
          x2="0"
          y2="188"
          strokeWidth="0.25"
          transform={`rotate(${angle})`}
        />
      ))}
    </svg>
  );
}

export function JaaliPattern({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden className={className}>
      <defs>
        <pattern
          id="jaali-pattern"
          width="68"
          height="68"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M34 2 66 34 34 66 2 34Z"
            stroke="#d4a437"
            strokeWidth="0.5"
            fill="none"
          />
          <circle
            cx="34"
            cy="34"
            r="9"
            stroke="#d4a437"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M2 2 66 66M66 2 2 66"
            stroke="#d4a437"
            strokeWidth="0.22"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jaali-pattern)" />
    </svg>
  );
}

export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <path
        d="M4 118V46C4 23 23 4 46 4H118"
        strokeWidth="0.9"
      />
      <path
        d="M14 118V48C14 29 29 14 48 14H118"
        strokeWidth="0.4"
        strokeDasharray="2 5"
      />
      <path
        d="M34 96c0-19 15-34 34-34"
        strokeWidth="0.5"
      />
      <circle cx="44" cy="44" r="3.4" strokeWidth="0.7" />
      <path
        d="M44 30 47 40 57 44 47 48 44 58 41 48 31 44 41 40Z"
        strokeWidth="0.6"
      />
    </svg>
  );
}

export function OrnamentalBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_118%,rgba(255,122,26,0.16),transparent_58%),radial-gradient(ellipse_at_82%_-12%,rgba(212,164,55,0.13),transparent_46%),radial-gradient(ellipse_at_8%_-4%,rgba(78,224,207,0.055),transparent_40%)]" />
      <Mandala className="absolute left-1/2 top-1/2 h-[min(94vh,860px)] w-[min(94vh,860px)] -translate-x-1/2 -translate-y-1/2 animate-spin-slower text-gold-300/[0.07]" />
      <Mandala className="absolute left-1/2 top-1/2 h-[min(58vh,540px)] w-[min(58vh,540px)] -translate-x-1/2 -translate-y-1/2 animate-spin-reverse text-gold-200/[0.045]" />
      <JaaliPattern className="absolute inset-0 h-full w-full opacity-[0.045]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-midnight-950/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-midnight-950/90 to-transparent" />
      <div className="absolute inset-0 bg-grain opacity-[0.035] mix-blend-soft-light" />
    </div>
  );
}
