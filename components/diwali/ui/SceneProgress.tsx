"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SCENES } from "../types";

type SceneProgressProps = {
  scene: number;
};

export default function SceneProgress({ scene }: SceneProgressProps) {
  const reduce = useReducedMotion();

  return (
    <div className="relative z-30 flex flex-none justify-center px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1 sm:px-4 sm:pb-[max(0.9rem,env(safe-area-inset-bottom))]">
      <div className="glass-chip flex items-center gap-3 rounded-full px-4 py-2.5 shadow-lg shadow-black/30 sm:gap-5 sm:px-5">
        <span className="hidden font-sans text-[0.56rem] uppercase tracking-[0.32em] text-gold-200/60 sm:inline">
          Scene {String(scene + 1).padStart(2, "0")} / 05
        </span>
        <div
          role="list"
          aria-label="Scene progress"
          className="flex items-center gap-2 sm:gap-3"
        >
          {SCENES.map((item, index) => {
            const active = index === scene;
            const complete = index < scene;
            return (
              <div
                key={item.id}
                role="listitem"
                aria-current={active ? "step" : undefined}
                className="flex items-center gap-2"
              >
                <motion.span
                  className="block h-[6px] rounded-full"
                  initial={false}
                  animate={{
                    width: active ? 26 : 7,
                    backgroundColor: complete
                      ? "rgba(240,207,116,0.55)"
                      : active
                        ? "rgba(248,227,161,0.98)"
                        : "rgba(255,255,255,0.16)",
                    boxShadow: active
                      ? "0 0 16px rgba(240,190,90,0.65)"
                      : "0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={
                    reduce
                      ? { duration: 0.15 }
                      : { type: "spring", stiffness: 200, damping: 22 }
                  }
                />
                <span
                  className={`hidden text-[0.53rem] uppercase tracking-[0.24em] transition-colors duration-300 sm:block ${
                    active
                      ? "text-gold-100"
                      : complete
                        ? "text-gold-200/50"
                        : "text-white/25"
                  }`}
                >
                  {item.label}
                </span>
                <span className="sr-only">
                  {active ? "Current scene: " : ""}
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
