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

export const WISH = {
  recipientName: "Priya",
  senderName: "Kanchan",
};

export const SCENES = [
  {
    id: "welcome",
    label: "Welcome",
    announcement:
      "Scene one. A little light for you. Some people make the world brighter just by being in it, and you are one of them. This little celebration is just for you.",
  },
  {
    id: "light",
    label: "Light",
    announcement:
      "Scene two. A prayer, lit for you. As this diya is lit, may your heart find peace, your home find warmth, and your face keep its brightest smile.",
  },
  {
    id: "gift",
    label: "Magic",
    announcement:
      "Scene three. A little something. If every star could be wrapped and every happy moment tied with a ribbon, they would all be on their way to you today.",
  },
  {
    id: "celebration",
    label: "Celebration",
    announcement:
      "Scene four. Let the magic glow. May your days shine brighter, your heart stay light, and every quiet dream find its perfect beginning.",
  },
  {
    id: "greeting",
    label: "Greeting",
    announcement:
      "Scene five. Happy Diwali. May this Festival of Lights bring you endless happiness, good health, peace, and the courage to chase everything you have ever wished for. You deserve all the light in the world.",
  },
] as const;
