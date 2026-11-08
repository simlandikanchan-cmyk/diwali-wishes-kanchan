import type { MutableRefObject } from "react";

export type PointerState = {
  x: number;
  y: number;
};

export type Scene3DProps = {
  scene: number;
  lit: boolean;
  giftOpen: boolean;
  wishRevealed: boolean;
  pointer: MutableRefObject<PointerState>;
  reduced: boolean;
};

export const SCENES = [
  {
    id: "welcome",
    label: "Welcome",
    announcement:
      "Scene one. A Festival of Lights. Something magical is about to begin. A celebration of light, happiness, and beautiful new beginnings.",
  },
  {
    id: "light",
    label: "Light",
    announcement:
      "Scene two. Spread the light. Every light begins with a spark. May every little flame bring hope, warmth, and happiness into your life.",
  },
  {
    id: "gift",
    label: "Magic",
    announcement:
      "Scene three. A little surprise. Happiness is meant to be shared. Every celebration becomes more special when shared with the people who matter.",
  },
  {
    id: "celebration",
    label: "Celebration",
    announcement:
      "Scene four. Let the magic glow. Let your world shine brighter. May your days sparkle with joy, your home glow with peace, and your dreams shine with possibilities.",
  },
  {
    id: "greeting",
    label: "Greeting",
    announcement:
      "Scene five. Happy Diwali. May this Festival of Lights bring happiness, prosperity, peace, and endless new beginnings. Wishing you and your family a beautiful Diwali.",
  },
] as const;
