"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createGlowTexture } from "./textures";

type GlowSpriteProps = {
  color?: string;
  scale?: number;
  opacity?: number;
  position?: [number, number, number];
};

export default function GlowSprite({
  color = "#ffb347",
  scale = 1.8,
  opacity = 0.55,
  position = [0, 0, 0],
}: GlowSpriteProps) {
  const texture = useMemo(() => createGlowTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={[scale, scale, 1]} renderOrder={2}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}
