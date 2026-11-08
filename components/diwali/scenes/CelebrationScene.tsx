"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import GoldDivider from "../ui/GoldDivider";
import ShimmerButton from "../ui/ShimmerButton";
import { useSceneMotion } from "../ui/motion";

type CelebrationSceneProps = {
  revealed: boolean;
  onReveal: () => void;
  busy: boolean;
};

export default function CelebrationScene({
  revealed,
  onReveal,
  busy,
}: CelebrationSceneProps) {
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
          Let the Magic Glow
        </motion.p>

        <motion.h2
          variants={item}
          className="display-title text-[clamp(1.65rem,6.9vw,4.2rem)] text-ivory"
        >
          May Your Days
          <span className="mt-1 block bg-gradient-to-b from-gold-50 via-gold-200 to-gold-500 bg-clip-text font-serif italic text-transparent">
            Shine a Little Brighter.
          </span>
        </motion.h2>

        <motion.div variants={item} className="w-full max-w-[15rem]">
          <GoldDivider />
        </motion.div>

        <motion.p variants={item} className="scene-copy max-w-[32rem]">
          May this Diwali fill your world with laughter, your heart with hope,
          and every quiet dream with its perfect beginning.
        </motion.p>

        <motion.div variants={item} className="pt-1 sm:pt-2">
          <ShimmerButton
            onClick={onReveal}
            disabled={busy || revealed}
            ariaLabel="Reveal your wish and continue"
            icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
          >
            Reveal Your Wish
          </ShimmerButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
