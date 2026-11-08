"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import IconButton from "./IconButton";
import { DiyaMark } from "./Ornaments";

type TopBarProps = {
  scene: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  busy: boolean;
};

export default function TopBar({
  scene,
  soundOn,
  onToggleSound,
  onRestart,
  busy,
}: TopBarProps) {
  return (
    <header className="relative z-30 flex flex-none items-center justify-between px-4 pb-1.5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold-300/25 bg-midnight-900/60 backdrop-blur-md">
          <DiyaMark />
          <span className="absolute inset-0 animate-flicker rounded-full bg-gold-400/10 blur-md" />
        </span>
        <div className="leading-none">
          <p className="font-display text-[0.78rem] tracking-[0.34em] text-gold-100">
            DIWALI
          </p>
          <p className="mt-1.5 font-sans text-[0.5rem] uppercase tracking-[0.36em] text-white/40">
            A Wish for You
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          label={soundOn ? "Mute sound" : "Enable sound"}
          onClick={onToggleSound}
          active={soundOn}
        >
          {soundOn ? (
            <Volume2 className="h-[18px] w-[18px]" strokeWidth={1.7} />
          ) : (
            <VolumeX className="h-[18px] w-[18px]" strokeWidth={1.7} />
          )}
        </IconButton>

        <AnimatePresence initial={false}>
          {scene > 0 ? (
            <motion.div
              key="restart"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <IconButton
                label="Restart the experience"
                onClick={onRestart}
                disabled={busy}
              >
                <RotateCcw className="h-[17px] w-[17px]" strokeWidth={1.7} />
              </IconButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
