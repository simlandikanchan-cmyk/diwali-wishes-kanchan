"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import GoldDivider from "../ui/GoldDivider";
import ShimmerButton from "../ui/ShimmerButton";
import { useSceneMotion } from "../ui/motion";

type GiftSceneProps = {
  open: boolean;
  onOpen: () => void;
  busy: boolean;
};

export default function GiftScene({ open, onOpen, busy }: GiftSceneProps) {
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
          A Little Something
        </motion.p>

        <motion.h2
          variants={item}
          className="display-title text-[clamp(1.65rem,6.9vw,4.2rem)] text-ivory"
        >
          If I Could Gift You
          <span className="mt-1 block bg-gradient-to-b from-gold-50 via-gold-200 to-gold-500 bg-clip-text font-serif italic text-transparent">
            the Whole World...
          </span>
        </motion.h2>

        <motion.div variants={item} className="w-full max-w-[15rem]">
          <GoldDivider />
        </motion.div>

        <motion.p variants={item} className="scene-copy max-w-[32rem]">
          I&apos;d wrap up every star, every happy moment, and every little
          reason to smile — and send them all to you today.
        </motion.p>

        <motion.div variants={item} className="pt-1 sm:pt-2">
          <ShimmerButton
            onClick={onOpen}
            disabled={busy || open}
            ariaLabel="Unwrap this little surprise made for you"
            icon={<Gift className="h-4 w-4" strokeWidth={2} />}
          >
            Unwrap the Magic
          </ShimmerButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
