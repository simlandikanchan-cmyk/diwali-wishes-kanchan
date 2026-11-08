"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createPetalTexture } from "./textures";

const PETAL_COLORS = ["#ffcf5c", "#ffb347", "#ff8a2a", "#ffd98a", "#fff2c2"];

type PetalData = {
  x: number;
  y: number;
  z: number;
  speed: number;
  sway: number;
  phase: number;
  spinX: number;
  spinY: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
};

type FallingPetalsProps = {
  active: boolean;
  count?: number;
  reduced?: boolean;
};

export function FallingPetals({
  active,
  count = 60,
  reduced = false,
}: FallingPetalsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());

  const data = useMemo<PetalData[]>(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 7.4,
        z: (Math.random() - 0.5) * 4 - 0.5,
        speed: 0.16 + Math.random() * 0.32,
        sway: 0.35 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        spinX: (Math.random() - 0.5) * 1.4,
        spinY: (Math.random() - 0.5) * 1.2,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        scale: 0.65 + Math.random() * 0.75,
      })),
    [count],
  );

  const texture = useMemo(() => createPetalTexture(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.22, 0.3), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [texture],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = dummyRef.current;
    const color = new THREE.Color();

    data.forEach((petal, index) => {
      dummy.position.set(petal.x, petal.y, petal.z);
      dummy.rotation.set(petal.rotX, petal.rotY, petal.rotZ);
      dummy.scale.setScalar(petal.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, color.set(PETAL_COLORS[index % PETAL_COLORS.length]));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!active) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const dummy = dummyRef.current;

    for (let i = 0; i < data.length; i += 1) {
      const petal = data[i];
      petal.y -= petal.speed * d * (reduced ? 0.45 : 1);
      petal.x += Math.sin(t * 0.7 + petal.phase) * petal.sway * d * 0.35;

      if (petal.y < -3.9) {
        petal.y = 3.9;
        petal.x = (Math.random() - 0.5) * 9;
        petal.z = (Math.random() - 0.5) * 4 - 0.5;
      }

      dummy.position.set(petal.x, petal.y, petal.z);
      dummy.rotation.set(
        reduced ? petal.rotX : petal.rotX + t * petal.spinX,
        reduced ? petal.rotY : petal.rotY + t * petal.spinY,
        reduced ? petal.rotZ : petal.rotZ + Math.sin(t * 0.9 + petal.phase) * 0.5,
      );
      dummy.scale.setScalar(petal.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      position={[0, 0, 0.4]}
      visible={active}
      frustumCulled={false}
    />
  );
}

type BurstPetal = {
  dir: THREE.Vector3;
  speed: number;
  spin: THREE.Vector3;
  rot: THREE.Euler;
  scale: number;
};

type PetalBurstProps = {
  active: boolean;
  reduced?: boolean;
};

export function PetalBurst({ active, reduced = false }: PetalBurstProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const startRef = useRef(0);
  const lastActiveRef = useRef(false);
  const count = 44;

  const petals = useMemo<BurstPetal[]>(
    () =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const radial = 0.45 + Math.random() * 1.15;
        return {
          dir: new THREE.Vector3(
            Math.cos(angle) * radial,
            0.7 + Math.random() * 1.1,
            Math.sin(angle) * radial,
          ).normalize(),
          speed: 1.4 + Math.random() * 1.6,
          spin: new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
          ),
          rot: new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          ),
          scale: 0.7 + Math.random() * 0.9,
        };
      }),
    [],
  );

  const texture = useMemo(() => createPetalTexture(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.18, 0.25), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [texture],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new THREE.Color();
    for (let i = 0; i < count; i += 1) {
      mesh.setColorAt(i, color.set(PETAL_COLORS[i % PETAL_COLORS.length]));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = state.clock.elapsedTime;

    if (active && !lastActiveRef.current) {
      lastActiveRef.current = true;
      startRef.current = t;
    }

    if (!active) {
      lastActiveRef.current = false;
      mesh.visible = false;
      material.opacity = 0;
      return;
    }

    const elapsed = t - startRef.current;
    if (elapsed > 4) {
      mesh.visible = false;
      return;
    }

    mesh.visible = true;
    material.opacity = Math.max(0, Math.min(1, 1 - Math.max(0, elapsed - 2.4) / 1.4));

    const dummy = dummyRef.current;
    const gravity = reduced ? 0.7 : 1.6;

    for (let i = 0; i < petals.length; i += 1) {
      const petal = petals[i];
      const distance = petal.speed * elapsed;
      dummy.position.set(
        petal.dir.x * distance,
        0.85 + petal.dir.y * distance - gravity * elapsed * elapsed,
        petal.dir.z * distance,
      );
      dummy.rotation.set(
        petal.rot.x + petal.spin.x * elapsed,
        petal.rot.y + petal.spin.y * elapsed,
        petal.rot.z + petal.spin.z * elapsed,
      );
      dummy.scale.setScalar(petal.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      visible={false}
      frustumCulled={false}
    />
  );
}
