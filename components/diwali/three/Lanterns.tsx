"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowTexture } from "./textures";

const COLORS = ["#ffcf7a", "#ffb347", "#ff6f9c", "#4ee0cf", "#fff2c2"];

type Lantern = {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  phase: number;
  opacity: number;
  color: string;
};

type LanternsProps = {
  count?: number;
  reduced?: boolean;
  active?: boolean;
};

export default function Lanterns({
  count = 16,
  reduced = false,
  active = true,
}: LanternsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => createGlowTexture(), []);

  const lanterns = useMemo<Lantern[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        x: (Math.random() - 0.5) * 15,
        y: (Math.random() - 0.5) * 10,
        z: -3.2 - Math.random() * 6,
        scale: 0.3 + Math.random() * 0.95,
        speed: 0.1 + Math.random() * 0.24,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.24 + Math.random() * 0.3,
        color: COLORS[index % COLORS.length],
      })),
    [count],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || reduced) return;

    const t = state.clock.elapsedTime;
    group.children.forEach((child, index) => {
      const lantern = lanterns[index];
      if (!lantern) return;

      const wrapped = (((lantern.y + t * lantern.speed + 5) % 10) + 10) % 10 - 5;
      child.position.set(
        lantern.x + Math.sin(t * 0.22 + lantern.phase) * 0.55,
        wrapped,
        lantern.z,
      );
      const pulse = 0.86 + 0.14 * Math.sin(t * 0.9 + lantern.phase);
      child.scale.setScalar(lantern.scale * pulse);
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {lanterns.map((lantern, index) => (
        <sprite
          key={`lantern-${index}`}
          position={[lantern.x, lantern.y, lantern.z]}
          scale={[lantern.scale, lantern.scale, 1]}
          renderOrder={0}
        >
          <spriteMaterial
            map={texture}
            color={lantern.color}
            transparent
            opacity={lantern.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}
