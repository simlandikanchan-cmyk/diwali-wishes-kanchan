"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SIZE = 1024;

function createRangoliTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255, 190, 90, 0.7)";
  ctx.shadowBlur = 16;

  [486, 468, 436].forEach((radius, index) => {
    ctx.beginPath();
    ctx.strokeStyle =
      index === 0
        ? "rgba(248,227,161,0.55)"
        : index === 1
          ? "rgba(212,164,55,0.32)"
          : "rgba(248,227,161,0.4)";
    ctx.lineWidth = index === 0 ? 2.4 : 1.3;
    if (index === 2) ctx.setLineDash([9, 15]);
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  const petals = 24;
  for (let i = 0; i < petals; i += 1) {
    ctx.save();
    ctx.rotate((i / petals) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, -176);
    ctx.bezierCurveTo(48, -248, 48, -376, 0, -430);
    ctx.bezierCurveTo(-48, -376, -48, -248, 0, -176);
    ctx.strokeStyle =
      i % 2 === 0 ? "rgba(248,227,161,0.46)" : "rgba(255,111,156,0.3)";
    ctx.lineWidth = i % 2 === 0 ? 1.8 : 1.2;
    ctx.stroke();
    ctx.restore();
  }

  const inner = 16;
  for (let i = 0; i < inner; i += 1) {
    ctx.save();
    ctx.rotate((i / inner) * Math.PI * 2 + Math.PI / inner);
    ctx.beginPath();
    ctx.moveTo(0, -146);
    ctx.quadraticCurveTo(36, -208, 0, -284);
    ctx.quadraticCurveTo(-36, -208, 0, -146);
    ctx.strokeStyle = "rgba(248,227,161,0.4)";
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.restore();
  }

  [152, 118, 80].forEach((radius, index) => {
    ctx.beginPath();
    ctx.strokeStyle =
      index === 1 ? "rgba(78,224,207,0.32)" : "rgba(248,227,161,0.46)";
    ctx.lineWidth = 1.3;
    if (index === 2) ctx.setLineDash([4, 9]);
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  const dots = 48;
  for (let i = 0; i < dots; i += 1) {
    const angle = (i / dots) * Math.PI * 2;
    const radius = 332;
    ctx.beginPath();
    ctx.fillStyle =
      i % 4 === 0 ? "rgba(255,111,156,0.55)" : "rgba(248,227,161,0.5)";
    ctx.arc(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      i % 3 === 0 ? 4 : 2.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  for (let i = 0; i < 8; i += 1) {
    ctx.save();
    ctx.rotate((i / 8) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, -118);
    ctx.lineTo(0, -176);
    ctx.strokeStyle = "rgba(248,227,161,0.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 116);
  glow.addColorStop(0, "rgba(255,246,207,0.5)");
  glow.addColorStop(0.5, "rgba(255,122,26,0.2)");
  glow.addColorStop(1, "rgba(255,122,26,0)");
  ctx.beginPath();
  ctx.fillStyle = glow;
  ctx.arc(0, 0, 116, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < 16; i += 1) {
    const radius = i % 2 === 0 ? 64 : 23;
    const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(255,220,140,0.24)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,246,207,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

type RangoliProps = {
  active?: boolean;
  reduced?: boolean;
  opacity?: number;
  scale?: number;
  position?: [number, number, number];
};

export default function Rangoli({
  active = true,
  reduced = false,
  opacity = 0.85,
  scale = 1,
  position = [0, -0.92, -0.5],
}: RangoliProps) {
  const spinnerRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => createRangoliTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-delta * 2.4);

    if (spinnerRef.current && !reduced) {
      spinnerRef.current.rotation.y += d * 0.055;
    }

    const material = materialRef.current;
    if (material) {
      const target = active ? opacity : 0;
      material.opacity += (target - material.opacity) * k;
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={spinnerRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial
            ref={materialRef}
            map={texture}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}
