"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type ShimmerButtonProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export default function ShimmerButton({
  children,
  onClick,
  disabled = false,
  icon,
  className = "",
  ariaLabel,
}: ShimmerButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled || reduce ? undefined : { scale: 1.035 }}
      whileTap={disabled || reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={`group relative inline-flex min-h-[3.1rem] items-center justify-center overflow-hidden whitespace-nowrap rounded-full border border-[#fbe7ab]/70 px-6 py-3.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#241503] transition-opacity duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-100 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-900 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[3.5rem] sm:px-9 sm:py-4 sm:text-[0.7rem] sm:tracking-[0.24em] ${className}`}
      style={{
        background:
          "linear-gradient(120deg, #fff6cf 0%, #f4d98d 20%, #d4a437 46%, #f8e3a1 64%, #bf8b14 100%)",
        boxShadow:
          "0 18px 50px -18px rgba(240,190,90,0.7), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -2px 8px rgba(120,80,10,0.35)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.65), transparent 62%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-y-4 left-0 w-1/3 animate-shimmer bg-white/45 blur-md"
      />
      <span className="relative flex items-center gap-2.5">
        {children}
        {icon ? (
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {icon}
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}
