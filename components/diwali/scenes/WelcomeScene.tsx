"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GoldDivider from "../ui/GoldDivider";
import ShimmerButton from "../ui/ShimmerButton";
import { useSceneMotion } from "../ui/motion";

type WelcomeSceneProps = {
  onBegin: () => void;
  busy: boolean;
};

export default function WelcomeScene({ onBegin, busy }: WelcomeSceneProps) {
  const { container, item } = useSceneMotion();

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex min-h-full w-full flex-col justify-center px-5 py-6 text-center sm:px-8 sm:py-8 lg:px-10 lg:py-10 lg:text-left xl:px-14"
    >
      <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center gap-4 sm:gap-5 lg:mx-0 lg:items-start lg:gap-6">
        <motion.p variants={item} className="eyebrow">
          A Festival of Lights
        </motion.p>

        <motion.h1
          variants={item}
          className="display-title text-[clamp(1.75rem,7.4vw,4.4rem)] text-ivory"
        >
          Something Magical
          <span className="mt-1 block bg-gradient-to-b from-gold-50 via-gold-200 to-gold-500 bg-clip-text font-serif italic text-transparent">
            Is About to Begin.
          </span>
        </motion.h1>

        <motion.div variants={item} className="w-full max-w-[15rem]">
          <GoldDivider />
        </motion.div>

        <motion.p variants={item} className="scene-copy max-w-[32rem]">
          A celebration of light, happiness, and beautiful new beginnings.
        </motion.p>

        <motion.div variants={item} className="pt-1 sm:pt-2">
          <ShimmerButton
            onClick={onBegin}
            disabled={busy}
            ariaLabel="Let's begin the Diwali experience"
            icon={<ArrowRight className="h-4 w-4" strokeWidth={2.2} />}
          >
            Let&apos;s Begin
          </ShimmerButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
