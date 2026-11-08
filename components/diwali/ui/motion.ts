"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 74,
  damping: 20,
  mass: 1,
};

const easeOutSoft = [0.22, 1, 0.36, 1] as const;

export function useSceneMotion() {
  const reduce = useReducedMotion() ?? false;

  const enter: Transition = reduce
    ? { duration: 0.18, ease: "easeOut" }
    : { duration: 0.85, ease: easeOutSoft };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: reduce ? 0.15 : 0.45,
        ease: easeOutSoft,
        staggerChildren: reduce ? 0 : 0.11,
        delayChildren: reduce ? 0 : 0.16,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: reduce ? 0.1 : 0.38, ease: [0.4, 0, 1, 1] },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.982 },
    show: { opacity: 1, y: 0, scale: 1, transition: enter },
    exit: {
      opacity: 0,
      y: reduce ? 0 : -12,
      scale: reduce ? 1 : 0.994,
      transition: { duration: reduce ? 0.1 : 0.32, ease: [0.4, 0, 1, 1] },
    },
  };

  return { reduce, transition: enter, container, item };
}
