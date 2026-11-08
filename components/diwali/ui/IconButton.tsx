"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type IconButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
  className?: string;
};

export default function IconButton({
  label,
  onClick,
  children,
  disabled = false,
  active = false,
  className = "",
}: IconButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      whileHover={disabled || reduce ? undefined : { scale: 1.06 }}
      whileTap={disabled || reduce ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-200 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-900 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11 ${
        active
          ? "border-gold-300/60 bg-gold-400/20 text-gold-100 shadow-glow-gold"
          : "border-white/10 bg-midnight-900/55 text-gold-200/80 backdrop-blur-md hover:border-gold-300/40 hover:text-gold-100"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
