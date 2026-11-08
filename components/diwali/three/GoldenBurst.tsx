"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowTexture } from "./textures";

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSpeed;
  uniform float uProgress;
  uniform float uRadius;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    float eased = 1.0 - pow(1.0 - uProgress, 3.0);
    vec3 p = position + aDir * aSpeed * uRadius * eased;
    p.y += uProgress * 0.35 * aSpeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 - uProgress * 0.6) * uPixelRatio * (26.0 / max(1.0, -mv.z));
    vAlpha = pow(1.0 - uProgress, 1.4);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= alpha;
    gl_FragColor = vec4(uColor, alpha * vAlpha);
  }
`;

type GoldenBurstProps = {
  trigger: boolean;
  position?: [number, number, number];
  color?: string;
  radius?: number;
  count?: number;
  reduced?: boolean;
};

export default function GoldenBurst({
  trigger,
  position = [0, 0, 0],
  color = "#ffcf7a",
  radius = 2,
  count = 120,
  reduced = false,
}: GoldenBurstProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const flashRef = useRef<THREE.SpriteMaterial>(null);
  const lastTriggerRef = useRef(false);
  const startRef = useRef(0);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const dirs = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 0.95 + 0.05,
        Math.random() * 2 - 1,
      );
      if (direction.lengthSq() < 0.001) direction.set(0, 1, 0);
      direction.normalize();

      dirs[i * 3] = direction.x;
      dirs[i * 3 + 1] = direction.y;
      dirs[i * 3 + 2] = direction.z;
      speeds[i] = 0.35 + Math.random() * 0.85;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aDir", new THREE.BufferAttribute(dirs, 3));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uRadius: { value: radius },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color(color) },
    }),
    [radius, color],
  );

  const flashTexture = useMemo(() => createGlowTexture(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => flashTexture.dispose(), [flashTexture]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    const now = state.clock.elapsedTime;

    if (trigger && !lastTriggerRef.current) {
      lastTriggerRef.current = true;
      startRef.current = now;
    }

    if (!trigger) {
      lastTriggerRef.current = false;
      material.uniforms.uProgress.value = 0;
      if (flashRef.current) flashRef.current.opacity = 0;
      return;
    }

    const duration = reduced ? 0.7 : 1.55;
    const progress = Math.min(1, (now - startRef.current) / duration);
    material.uniforms.uProgress.value = progress;

    if (flashRef.current) {
      flashRef.current.opacity = Math.max(0, (1 - progress) * 0.65);
    }
  });

  return (
    <group position={position}>
      <points geometry={geometry} frustumCulled={false} renderOrder={3}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <sprite scale={[3.2, 3.2, 1]} renderOrder={3}>
        <spriteMaterial
          ref={flashRef}
          map={flashTexture}
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}
