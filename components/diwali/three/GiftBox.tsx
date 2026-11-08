"use client";

import { useEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GlowSprite from "./GlowSprite";
import { PetalBurst } from "./Petals";

type GiftBoxProps = {
  open: boolean;
  reduced?: boolean;
  position?: [number, number, number];
  scale?: number;
};

export default function GiftBox({
  open,
  reduced = false,
  position = [0, 0, 0],
  scale = 1,
}: GiftBoxProps) {
  const lidRef = useRef<THREE.Group>(null);
  const magicRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const beamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const boxRef = useRef<THREE.Group>(null);
  const openAmount = useRef(0);

  const beamGeometry = useMemo(
    () => new THREE.ConeGeometry(0.5, 1.7, 32, 1, true),
    [],
  );

  useEffect(() => () => beamGeometry.dispose(), [beamGeometry]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    openAmount.current +=
      ((open ? 1 : 0) - openAmount.current) * Math.min(1, d * 3);
    const amount = openAmount.current;
    const t = state.clock.elapsedTime;

    if (lidRef.current) {
      lidRef.current.rotation.x = -amount * 1.75;
    }

    if (magicRef.current) {
      const magicScale = Math.max(0.001, amount);
      magicRef.current.scale.setScalar(magicScale);
      magicRef.current.rotation.y += d * 0.9;
      magicRef.current.rotation.x = Math.sin(t * 0.6) * 0.25;
      magicRef.current.position.y = 0.92 + Math.sin(t * 1.4) * 0.04 * amount;
    }

    if (beamRef.current) {
      beamRef.current.scale.set(0.65 + amount * 0.6, 0.4 + amount * 1.1, 0.65 + amount * 0.6);
      beamRef.current.rotation.y = t * 0.25;
    }

    if (beamMaterialRef.current) {
      beamMaterialRef.current.opacity = amount * 0.26;
    }

    if (lightRef.current) {
      lightRef.current.intensity = amount * 16;
    }

    if (boxRef.current) {
      boxRef.current.rotation.y = reduced ? 0 : Math.sin(t * 0.35) * 0.07;
    }
  });

  return (
    <group ref={boxRef} position={position} scale={scale}>
      <RoundedBox
        args={[1.35, 0.95, 1.35]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.48, 0]}
      >
        <meshStandardMaterial
          color="#d6a23c"
          metalness={1}
          roughness={0.22}
          emissive="#3a2300"
          emissiveIntensity={0.35}
        />
      </RoundedBox>

      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[1.38, 0.97, 0.24]} />
        <meshStandardMaterial
          color="#7a1626"
          metalness={0.45}
          roughness={0.38}
        />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.24, 0.97, 1.38]} />
        <meshStandardMaterial
          color="#7a1626"
          metalness={0.45}
          roughness={0.38}
        />
      </mesh>

      <mesh position={[0, 0.955, 0]}>
        <boxGeometry args={[1.22, 0.02, 1.22]} />
        <meshStandardMaterial
          color="#1a0c05"
          roughness={0.8}
          emissive="#ff9d3c"
          emissiveIntensity={0.4}
        />
      </mesh>

      <mesh position={[0, 0.48, 0.695]}>
        <torusGeometry args={[0.16, 0.022, 10, 40]} />
        <meshStandardMaterial
          color="#f8e3a1"
          metalness={1}
          roughness={0.2}
          emissive="#5a3800"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, 0.48, 0.69]}>
        <circleGeometry args={[0.14, 32]} />
        <meshStandardMaterial
          color="#8f1d2e"
          roughness={0.4}
          metalness={0.4}
          emissive="#5a0b16"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[0, 0.48, 0.71]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial
          color="#ffe9a8"
          metalness={1}
          roughness={0.18}
          emissive="#7a5200"
          emissiveIntensity={1.2}
        />
      </mesh>

      <group ref={lidRef} position={[0, 0.98, -0.7]}>
        <RoundedBox
          args={[1.42, 0.18, 1.42]}
          radius={0.05}
          smoothness={4}
          position={[0, 0.09, 0.71]}
        >
          <meshStandardMaterial
            color="#e3b84f"
            metalness={1}
            roughness={0.18}
            emissive="#3f2800"
            emissiveIntensity={0.4}
          />
        </RoundedBox>

        <mesh position={[0, 0.185, 0.71]}>
          <boxGeometry args={[1.44, 0.02, 0.24]} />
          <meshStandardMaterial
            color="#8f1d2e"
            metalness={0.45}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0.185, 0.71]}>
          <boxGeometry args={[0.24, 0.02, 1.44]} />
          <meshStandardMaterial
            color="#8f1d2e"
            metalness={0.45}
            roughness={0.35}
          />
        </mesh>

        <mesh
          position={[0, 0.27, 0.71]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 0.62, 1]}
        >
          <torusGeometry args={[0.14, 0.032, 10, 32]} />
          <meshStandardMaterial
            color="#f8e3a1"
            metalness={1}
            roughness={0.18}
            emissive="#5a3800"
            emissiveIntensity={0.9}
          />
        </mesh>
        <mesh
          position={[0, 0.27, 0.71]}
          rotation={[Math.PI / 2, Math.PI / 3, 0]}
          scale={[1, 0.62, 1]}
        >
          <torusGeometry args={[0.14, 0.032, 10, 32]} />
          <meshStandardMaterial
            color="#f8e3a1"
            metalness={1}
            roughness={0.18}
            emissive="#5a3800"
            emissiveIntensity={0.9}
          />
        </mesh>
        <mesh position={[0, 0.27, 0.71]}>
          <sphereGeometry args={[0.055, 16, 12]} />
          <meshStandardMaterial
            color="#fff2c2"
            metalness={1}
            roughness={0.15}
            emissive="#7a5200"
            emissiveIntensity={1.3}
          />
        </mesh>
      </group>

      <mesh ref={magicRef} position={[0, 0.92, 0]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#ffe9a8"
          metalness={0.85}
          roughness={0.18}
          emissive="#ffb347"
          emissiveIntensity={2.6}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={beamRef} position={[0, 1.55, 0]} geometry={beamGeometry}>
        <meshBasicMaterial
          ref={beamMaterialRef}
          color="#ffcf7a"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 1.1, 0]}
        color="#ffb347"
        intensity={0}
        distance={5.5}
        decay={2}
      />

      <GlowSprite
        position={[0, 0.62, 0]}
        scale={2.6}
        color="#ff9d3c"
        opacity={0.22}
      />

      <PetalBurst active={open} reduced={reduced} />
    </group>
  );
}
