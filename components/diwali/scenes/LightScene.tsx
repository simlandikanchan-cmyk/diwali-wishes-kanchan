"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import GoldDivider from "../ui/GoldDivider";
import ShimmerButton from "../ui/ShimmerButton";
import { useSceneMotion } from "../ui/motion";

type LightSceneProps = {
  lit: boolean;
  onLight: () => void;
  busy: boolean;
};

export default function LightScene({ lit, onLight, busy }: LightSceneProps) {
  const { container, item } = useSceneMotion();

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="scene-section"
    >
      <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center gap-4 sm:gap-5 lg:mx-0 lg:items-start lg:gap-6">
        <motion.p variants={item} className="eyebrow">
          A Prayer, Lit for You
        </motion.p>

        <motion.h2
          variants={item}
          className="display-title text-[clamp(1.65rem,6.9vw,4.2rem)] text-ivory"
        >
          May Your Light
          <span className="mt-1 block bg-gradient-to-b from-gold-50 via-gold-200 to-gold-500 bg-clip-text font-serif italic text-transparent">
            Never Fade.
          </span>
        </motion.h2>

        <motion.div variants={item} className="w-full max-w-[15rem]">
          <GoldDivider />
        </motion.div>

        <motion.p variants={item} className="scene-copy max-w-[32rem]">
          As I light this diya, I&apos;m wishing you peace in your heart, warmth
          in your home, and a smile that never leaves your face.
        </motion.p>

        <motion.div variants={item} className="pt-1 sm:pt-2">
          <ShimmerButton
            onClick={onLight}
            disabled={busy || lit}
            ariaLabel="Light the diya and continue"
            icon={<Flame className="h-4 w-4" strokeWidth={2} />}
          >
            Light the Diya
          </ShimmerButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
