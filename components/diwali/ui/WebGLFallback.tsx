"use client";

import { useId } from "react";

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: 6 + ((i * 53) % 86),
  size: 2 + (i % 3),
  delay: (i % 7) * 0.65,
  duration: 4 + (i % 5),
}));

function FallbackDiya({ className = "" }: { className?: string }) {
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg
      viewBox="0 0 160 210"
      aria-hidden
      className={className}
      fill="none"
    >
      <defs>
        <radialGradient id={`halo-${id}`} cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#ffcf7a" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ff7a1a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`flame-${id}`} x1="80" y1="42" x2="80" y2="128">
          <stop offset="0%" stopColor="#fff9e6" />
          <stop offset="40%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#ff7a1a" />
        </linearGradient>
        <linearGradient id={`clay-${id}`} x1="20" y1="140" x2="140" y2="180">
          <stop offset="0%" stopColor="#c46a2c" />
          <stop offset="55%" stopColor="#8f3f15" />
          <stop offset="100%" stopColor="#5a2408" />
        </linearGradient>
        <linearGradient id={`rim-${id}`} x1="20" y1="140" x2="140" y2="150">
          <stop offset="0%" stopColor="#f8e3a1" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="112" rx="74" ry="72" fill={`url(#halo-${id})`} />
      <g className="animate-flicker">
        <path
          d="M80 52c16 19 24 33 24 46a24 24 0 0 1-48 0c0-13 8-27 24-46Z"
          fill={`url(#flame-${id})`}
        />
        <path
          d="M80 76c7 9 11 16 11 22a11 11 0 0 1-22 0c0-6 4-13 11-22Z"
          fill="#fff6cf"
          opacity="0.9"
        />
      </g>
      <ellipse cx="80" cy="146" rx="58" ry="16" fill={`url(#rim-${id})`} />
      <path
        d="M22 146c9 27 107 27 116 0-11 21-105 21-116 0Z"
        fill={`url(#clay-${id})`}
      />
      <ellipse cx="80" cy="147" rx="42" ry="9" fill="#2a0e04" opacity="0.85" />
      <circle cx="80" cy="147" r="5" fill="#ffb347" opacity="0.7" />
      <ellipse cx="80" cy="182" rx="64" ry="10" fill="#000" opacity="0.32" />
    </svg>
  );
}

export default function WebGLFallback({ scene }: { scene: number }) {
  const accent =
    scene === 3
      ? "radial-gradient(ellipse at 50% 50%, rgba(255,79,139,0.20), transparent 62%)"
      : "radial-gradient(ellipse at 50% 50%, rgba(255,122,26,0.20), transparent 62%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0" style={{ background: accent }} />
      <div className="absolute inset-0">
        {PARTICLES.map((particle, i) => (
          <span
            key={i}
            className="absolute animate-twinkle rounded-full bg-gold-200"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              boxShadow: "0 0 10px rgba(248,227,161,0.9)",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[14%] flex items-end justify-between px-[7%] sm:px-[12%]">
        <FallbackDiya className="h-32 w-28 animate-float-soft opacity-90 sm:h-48 sm:w-40" />
        <FallbackDiya className="h-24 w-20 animate-float-soft opacity-80 [animation-delay:-2.6s] sm:h-40 sm:w-32" />
      </div>
    </div>
  );
}
