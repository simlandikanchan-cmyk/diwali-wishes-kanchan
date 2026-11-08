"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 18,
  mass: 0.9,
};

export function useSceneMotion() {
  const reduce = useReducedMotion() ?? false;

  const transition: Transition = reduce
    ? { duration: 0.18, ease: "easeOut" }
    : softSpring;

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.14,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: reduce ? 0.1 : 0.34, ease: "easeIn" },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 26, scale: reduce ? 1 : 0.985 },
    show: { opacity: 1, y: 0, scale: 1, transition },
    exit: {
      opacity: 0,
      y: reduce ? 0 : -14,
      transition: { duration: reduce ? 0.1 : 0.3 },
    },
  };

  return { reduce, transition, container, item };
}
