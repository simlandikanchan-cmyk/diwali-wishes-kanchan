"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX_SHADER = /* glsl */ `
  attribute float aScale;
  attribute float aSpeed;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;

  void main() {
    vec3 p = position;
    float range = 10.0;
    p.y = mod(p.y + uTime * aSpeed, range) - range * 0.5;
    p.x += sin(uTime * 0.14 + aPhase) * 0.32;
    p.z += cos(uTime * 0.11 + aPhase * 1.7) * 0.22;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (24.0 / max(1.0, -mv.z));
    vTwinkle = 0.5 + 0.5 * sin(uTime * 1.5 + aPhase * 6.2831);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vTwinkle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha = pow(alpha, 2.1);
    vec3 color = mix(uColor, vec3(1.0, 0.96, 0.82), smoothstep(0.2, 0.0, d));
    gl_FragColor = vec4(color, alpha * vTwinkle);
  }
`;

type AmbientParticlesProps = {
  count?: number;
  reduced?: boolean;
};

export default function AmbientParticles({
  count = 420,
  reduced = false,
}: AmbientParticlesProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 17;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1;
      scales[i] = 0.6 + Math.random() * 2.2;
      speeds[i] = 0.06 + Math.random() * 0.3;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color("#ffd58a") },
    }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={1}>
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
  );
}
