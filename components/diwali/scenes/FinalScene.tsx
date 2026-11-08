"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { WISH } from "../types";
import GoldDivider from "../ui/GoldDivider";
import ShimmerButton from "../ui/ShimmerButton";
import { useSceneMotion } from "../ui/motion";

type FinalSceneProps = {
  onRestart: () => void;
  busy: boolean;
};

export default function FinalScene({ onRestart, busy }: FinalSceneProps) {
  const { container, item } = useSceneMotion();
  const greeting = WISH.recipientName
    ? `Happy Diwali, ${WISH.recipientName}!`
    : "Happy Diwali!";

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="scene-section"
    >
      <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center gap-3.5 sm:gap-4 lg:mx-0 lg:items-start lg:gap-5">
        <motion.h1
          variants={item}
          className="text-gold-gradient max-w-full font-display font-bold leading-[1.1] sm:leading-[0.94]"
        >
          <span className="block text-[clamp(1.5rem,7.4vw,4.4rem)] tracking-[0.14em] sm:tracking-[0.11em]">
            HAPPY
          </span>
          <span className="mt-1 block text-[clamp(1.7rem,8.6vw,5rem)] tracking-[0.06em] sm:mt-1.5 sm:tracking-[0.05em]">
            DIWALI
          </span>
        </motion.h1>

        <motion.div variants={item} className="w-full max-w-[15rem]">
          <GoldDivider />
        </motion.div>

        <motion.p variants={item} className="scene-copy max-w-[32rem]">
          May this Festival of Lights bring you endless happiness, good health,
          peace, and the courage to chase everything you&apos;ve ever wished
          for.
        </motion.p>

        <motion.p
          variants={item}
          className="font-accent text-[clamp(0.78rem,2.1vw,0.95rem)] font-medium leading-relaxed tracking-[0.08em] text-gold-100/85 text-balance"
        >
          You deserve all the light in the world — today and always.
        </motion.p>

        <motion.div
          variants={item}
          className="flex max-w-[32rem] flex-col items-center gap-1 lg:items-start"
        >
          <p className="font-accent text-[clamp(0.82rem,2.4vw,1rem)] font-medium leading-relaxed tracking-[0.06em] text-gold-200/90 text-balance">
            {greeting}
          </p>
          <p className="font-accent text-[clamp(0.72rem,2vw,0.86rem)] leading-relaxed tracking-[0.1em] text-gold-200/65">
            With love, {WISH.senderName}{" "}
            <span className="text-rose" aria-hidden>
              ❤
            </span>
          </p>
        </motion.div>

        <motion.div variants={item} className="pt-1 sm:pt-2">
          <ShimmerButton
            onClick={onRestart}
            disabled={busy}
            ariaLabel="Celebrate again from the beginning"
            icon={<RotateCcw className="h-4 w-4" strokeWidth={2} />}
          >
            Celebrate Again
          </ShimmerButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
