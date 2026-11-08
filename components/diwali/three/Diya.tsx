"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowTexture, createShadowTexture } from "./textures";

type DiyaProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  lit?: boolean;
  reduced?: boolean;
};

export default function Diya({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  lit = false,
  reduced = false,
}: DiyaProps) {
  const flameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.SpriteMaterial>(null);
  const litAmount = useRef(lit ? 1 : 0);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  const bowlGeometry = useMemo(() => {
    const pairs: Array<[number, number]> = [
      [0.001, 0.0],
      [0.34, 0.0],
      [0.46, 0.03],
      [0.54, 0.1],
      [0.6, 0.2],
      [0.635, 0.31],
      [0.625, 0.38],
      [0.58, 0.42],
      [0.535, 0.42],
      [0.5, 0.36],
      [0.46, 0.28],
      [0.4, 0.2],
      [0.27, 0.15],
      [0.001, 0.14],
    ];
    const points = pairs.map(([x, y]) => new THREE.Vector2(x, y));
    const geometry = new THREE.LatheGeometry(points, 64);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const glowTexture = useMemo(() => createGlowTexture(), []);
  const shadowTexture = useMemo(() => createShadowTexture(), []);

  useEffect(
    () => () => {
      bowlGeometry.dispose();
      glowTexture.dispose();
      shadowTexture.dispose();
    },
    [bowlGeometry, glowTexture, shadowTexture],
  );

  useFrame((state, delta) => {
    const target = lit ? 1 : 0;
    const k = 1 - Math.exp(-delta * 3.4);
    litAmount.current += (target - litAmount.current) * k;
    const amount = litAmount.current;
    const t = state.clock.elapsedTime;

    const flicker = reduced
      ? 0.5
      : 0.5 +
        0.5 *
          Math.sin(t * 9.1 + phase) *
          Math.sin(t * 13.7 + phase * 1.3);

    if (flameRef.current) {
      const flame = flameRef.current;
      const visible = amount > 0.02;
      flame.visible = visible;
      const s = Math.max(0.0001, amount);
      flame.scale.set(
        s * (1 + flicker * 0.07),
        s * (1 + flicker * 0.13),
        s * (1 + flicker * 0.07),
      );
      flame.rotation.z = reduced
        ? 0
        : Math.sin(t * 3.2 + phase) * 0.055 * amount;
      flame.position.y = 0.43 + amount * 0.015;
    }

    if (lightRef.current) {
      lightRef.current.intensity =
        amount * (reduced ? 6 : 4.5 + flicker * 8);
    }

    if (glowRef.current) {
      glowRef.current.opacity = amount * (reduced ? 0.5 : 0.4 + flicker * 0.22);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        geometry={bowlGeometry}
        position={[0, 0, 0]}
        castShadow={false}
        receiveShadow={false}
      >
        <meshStandardMaterial
          color="#a4511f"
          roughness={0.52}
          metalness={0.16}
          emissive="#2a0f04"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.36, 0.56]} scale={[1.5, 0.5, 1.1]}>
        <sphereGeometry args={[0.12, 24, 16]} />
        <meshStandardMaterial
          color="#9c4a1b"
          roughness={0.55}
          metalness={0.14}
          emissive="#250d03"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh position={[0, 0.415, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.585, 0.016, 12, 96]} />
        <meshStandardMaterial
          color="#e3b84f"
          roughness={0.24}
          metalness={1}
          emissive="#4a2c00"
          emissiveIntensity={0.55}
        />
      </mesh>

      <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.53, 0.009, 10, 96]} />
        <meshStandardMaterial
          color="#d4a437"
          roughness={0.3}
          metalness={1}
          emissive="#3a2200"
          emissiveIntensity={0.45}
        />
      </mesh>

      <mesh position={[0, 0.325, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.47, 48]} />
        <meshStandardMaterial
          color="#2b0d02"
          roughness={0.16}
          metalness={0.65}
          emissive="#ff6a00"
          emissiveIntensity={0.22}
        />
      </mesh>

      <mesh position={[0, 0.38, 0]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.012, 0.017, 0.12, 8]} />
        <meshStandardMaterial color="#241007" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshBasicMaterial
          color="#ff6a1a"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={flameRef} position={[0, 0.43, 0]} visible={lit}>
        <mesh position={[0, 0.16, 0]}>
          <coneGeometry args={[0.085, 0.32, 24, 1, true]} />
          <meshBasicMaterial
            color="#ff8a1e"
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.045, 0.2, 20, 1, true]} />
          <meshBasicMaterial
            color="#ffe6a3"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <sprite position={[0, 0.16, 0]} scale={[1.5, 1.5, 1]} renderOrder={2}>
          <spriteMaterial
            ref={glowRef}
            map={glowTexture}
            color="#ffb347"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      </group>

      <pointLight
        ref={lightRef}
        position={[0, 0.62, 0]}
        color="#ffa64d"
        intensity={0}
        distance={4.5}
        decay={2}
      />

      <mesh
        position={[0, 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={0}
      >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
