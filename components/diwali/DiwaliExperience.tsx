"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import * as THREE from "three";
import { useDiwaliAudio } from "@/hooks/useDiwaliAudio";
import { SCENES, type PointerState, type Scene3DProps } from "./types";
import CelebrationScene from "./scenes/CelebrationScene";
import FinalScene from "./scenes/FinalScene";
import GiftScene from "./scenes/GiftScene";
import LightScene from "./scenes/LightScene";
import WelcomeScene from "./scenes/WelcomeScene";
import AmbientParticles from "./three/AmbientParticles";
import Diya from "./three/Diya";
import GiftBox from "./three/GiftBox";
import GoldenBurst from "./three/GoldenBurst";
import Lanterns from "./three/Lanterns";
import { FallingPetals } from "./three/Petals";
import GlowSprite from "./three/GlowSprite";
import Rangoli from "./three/Rangoli";
import FireworksOverlay from "./ui/FireworksOverlay";
import { CornerFlourish, OrnamentalBackdrop } from "./ui/Ornaments";
import SceneProgress from "./ui/SceneProgress";
import TopBar from "./ui/TopBar";
import WebGLFallback from "./ui/WebGLFallback";

function ResponsiveGroup({ children }: { children: ReactNode }) {
  const { size } = useThree();
  const scale = THREE.MathUtils.clamp(
    Math.min(size.width / 1150, size.height / 520),
    0.58,
    1,
  );

  return <group scale={scale}>{children}</group>;
}

type StageProps = {
  active: boolean;
  children: ReactNode;
};

function Stage({ active, children }: StageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const value = useRef(active ? 1 : 0);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const target = active ? 1 : 0;
    const k = 1 - Math.exp(-delta * 4.2);
    value.current += (target - value.current) * k;
    const current = value.current;
    const scale = Math.max(0.001, current);

    group.scale.setScalar(scale);
    group.position.y = (1 - current) * -0.45;
    group.rotation.y = (1 - current) * 0.32;
    group.visible = current > 0.01;
  });

  return (
    <group ref={groupRef} visible={active}>
      {children}
    </group>
  );
}

function SceneLights({ scene }: { scene: number }) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const warmRef = useRef<THREE.PointLight>(null);
  const rimRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const d = 1 - Math.exp(-delta * 2.6);

    if (keyRef.current) {
      const target = scene === 2 ? 1.32 : scene >= 3 ? 1.18 : 1.08;
      keyRef.current.intensity += (target - keyRef.current.intensity) * d;
    }
    if (warmRef.current) {
      const target = scene >= 3 ? 0.95 : scene === 2 ? 0.7 : 0.45;
      warmRef.current.intensity += (target - warmRef.current.intensity) * d;
    }
    if (rimRef.current) {
      const target = scene >= 3 ? 0.62 : 0.3;
      rimRef.current.intensity += (target - rimRef.current.intensity) * d;
    }
  });

  return (
    <>
      <ambientLight intensity={0.34} color="#8a6a3a" />
      <hemisphereLight args={["#ffd9a0", "#0a0518", 0.32]} />
      <directionalLight
        ref={keyRef}
        position={[4, 6, 5]}
        intensity={1.08}
        color="#ffe5b8"
      />
      <pointLight
        ref={warmRef}
        position={[0, 1.4, 2.4]}
        intensity={0.45}
        color="#ffb347"
        distance={12}
        decay={2}
      />
      <pointLight
        ref={rimRef}
        position={[-4.5, 2.6, -2]}
        intensity={0.3}
        color="#4ee0cf"
        distance={16}
        decay={2}
      />
    </>
  );
}

type ParallaxGroupProps = {
  pointer: MutableRefObject<PointerState>;
  reduced: boolean;
  children: ReactNode;
};

function ParallaxGroup({ pointer, reduced, children }: ParallaxGroupProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const k = 1 - Math.exp(-delta * 2.4);
    const targetX = reduced ? 0 : pointer.current.x * 0.14;
    const targetY = reduced ? 0 : -pointer.current.y * 0.09;
    group.rotation.y += (targetX - group.rotation.y) * k;
    group.rotation.x += (targetY - group.rotation.x) * k;
  });

  return <group ref={groupRef}>{children}</group>;
}

type CameraRigProps = {
  scene: number;
  pointer: MutableRefObject<PointerState>;
  reduced: boolean;
};

function CameraRig({ scene, pointer, reduced }: CameraRigProps) {
  const { camera } = useThree();
  const focus = useRef(new THREE.Vector3(0, 0.4, 0));

  useFrame((_, delta) => {
    const kx = 1 - Math.exp(-delta * 2.6);
    const kz = 1 - Math.exp(-delta * 1.8);
    const px = reduced ? 0 : pointer.current.x;
    const py = reduced ? 0 : pointer.current.y;
    const focusY =
      scene === 1 ? 0.25 : scene === 2 ? 0.55 : scene >= 3 ? 0.35 : 0.2;
    const targetZ = scene === 2 ? 6.3 : scene >= 3 ? 7.3 : 6.7;
    const targetX = px * 0.5;
    const targetY = 0.6 - py * 0.3;

    camera.position.x += (targetX - camera.position.x) * kx;
    camera.position.y += (targetY - camera.position.y) * kx;
    camera.position.z += (targetZ - camera.position.z) * kz;

    focus.current.set(0, focusY, 0);
    camera.lookAt(focus.current);
  });

  return null;
}

const SIDE_DIYAS: Array<{ position: [number, number, number]; scale: number }> = [
  { position: [-2.7, -0.62, -1.1], scale: 0.88 },
  { position: [2.7, -0.62, -1.1], scale: 0.88 },
];

const ARC_DIYAS: Array<{ position: [number, number, number]; scale: number }> =
  Array.from({ length: 7 }, (_, index) => {
    const angle = Math.PI * 1.12 + (index / 6) * Math.PI * 0.76;
    return {
      position: [
        Math.cos(angle) * 3.4,
        -0.68,
        Math.sin(angle) * 2.2 - 0.55,
      ] as [number, number, number],
      scale: 0.55,
    };
  });

function MiniDiya({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.27, 0.16, 0.13, 20]} />
        <meshStandardMaterial
          color="#a4511f"
          roughness={0.55}
          metalness={0.16}
          emissive="#2a0f04"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <coneGeometry args={[0.035, 0.16, 10, 1, true]} />
        <meshBasicMaterial
          color="#ffcf7a"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <GlowSprite
        position={[0, 0.3, 0]}
        scale={1.15}
        color="#ff9d3c"
        opacity={0.42}
      />
    </group>
  );
}

type SceneContentsProps = Scene3DProps & { burst: boolean; compact: boolean };

function SceneContents({
  scene,
  lit,
  giftOpen,
  pointer,
  reduced,
  burst,
  compact,
}: SceneContentsProps) {
  return (
    <>
      <SceneLights scene={scene} />

      <ResponsiveGroup>
        <ParallaxGroup pointer={pointer} reduced={reduced}>
          <Lanterns count={compact ? 8 : 16} reduced={reduced} />
          <AmbientParticles
            count={compact ? 180 : reduced ? 240 : 440}
            reduced={reduced}
          />
          <FallingPetals
            active={scene >= 3}
            count={compact ? 24 : 60}
            reduced={reduced}
          />
          <Rangoli
            active={scene >= 2}
            reduced={reduced}
            opacity={scene >= 3 ? 0.9 : 0.55}
          />

          <Stage active={scene <= 1}>
            <group position={[0, -0.65, 0]}>
              <Diya lit={scene === 1 && lit} scale={1.5} reduced={reduced} />
              <GlowSprite
                position={[0, 0.95, 0]}
                scale={scene === 1 && lit ? 4.6 : 2.6}
                color="#ff9d3c"
                opacity={scene === 1 && lit ? 0.42 : 0.16}
              />
            </group>
          </Stage>

          <Stage active={scene === 2}>
            <group position={[0, -0.45, 0]}>
              <GiftBox open={giftOpen} reduced={reduced} scale={1.25} />
            </group>
            {SIDE_DIYAS.map((item) => (
              <Diya
                key={`gift-diya-${item.position[0]}`}
                position={item.position}
                scale={item.scale}
                lit={scene === 2}
                reduced={reduced}
              />
            ))}
          </Stage>

          <Stage active={scene >= 3}>
            <group position={[0, -0.78, 0]}>
              <Diya
                lit={scene >= 3}
                scale={scene >= 4 ? 1.62 : 1.38}
                reduced={reduced}
              />
              <GlowSprite
                position={[0, 1, 0]}
                scale={scene >= 4 ? 6 : 4.8}
                color="#ff9d3c"
                opacity={scene >= 4 ? 0.5 : 0.38}
              />
            </group>

            {SIDE_DIYAS.map((item) => (
              <Diya
                key={`celebration-diya-${item.position[0]}`}
                position={item.position}
                scale={item.scale}
                lit={scene >= 3}
                reduced={reduced}
              />
            ))}

            {ARC_DIYAS.map((item) => (
              <MiniDiya
                key={`arc-diya-${item.position[0].toFixed(2)}`}
                position={item.position}
                scale={item.scale}
              />
            ))}
          </Stage>

          <GoldenBurst
            trigger={burst}
            position={[0, 0.55, 0]}
            color="#ffcf7a"
            radius={scene >= 4 ? 3.2 : 2.4}
            count={scene >= 4 ? (compact ? 120 : 160) : compact ? 90 : 120}
            reduced={reduced}
          />
        </ParallaxGroup>
      </ResponsiveGroup>

      <CameraRig scene={scene} pointer={pointer} reduced={reduced} />
    </>
  );
}

export default function DiwaliExperience() {
  const reduce = useReducedMotion() ?? false;
  const {
    enabled: soundOn,
    toggle: toggleSound,
    start: startSound,
    play,
  } = useDiwaliAudio();
  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const busyRef = useRef(false);

  const [scene, setScene] = useState(0);
  const [lit, setLit] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [wishRevealed, setWishRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [compact, setCompact] = useState(false);

  const transitionTimer = useRef<number | null>(null);
  const burstTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebgl(Boolean(context));
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  const markBusy = useCallback((value: boolean) => {
    busyRef.current = value;
    setBusy(value);
  }, []);

  const fireBurst = useCallback((duration = 1600) => {
    setBurst(true);
    if (burstTimer.current) window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurst(false), duration);
  }, []);

  useEffect(() => {
    if (!wishRevealed && scene !== 4) return;
    fireBurst(1800);
  }, [wishRevealed, scene, fireBurst]);

  useEffect(
    () => () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
      if (burstTimer.current) {
        window.clearTimeout(burstTimer.current);
      }
    },
    [],
  );

  const goTo = useCallback(
    (next: number) => {
      markBusy(true);
      setScene(next);
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(
        () => markBusy(false),
        reduce ? 280 : 620,
      );
    },
    [markBusy, reduce],
  );

  const handleBegin = useCallback(() => {
    if (busyRef.current) return;
    startSound();
    goTo(1);
  }, [goTo, startSound]);

  const handleLight = useCallback(() => {
    if (busyRef.current || lit) return;
    markBusy(true);
    setLit(true);
    setPulse((value) => value + 1);
    play("sparkle");
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(
      () => goTo(2),
      reduce ? 550 : 1500,
    );
  }, [markBusy, goTo, lit, play, reduce]);

  const handleGiftOpen = useCallback(() => {
    if (busyRef.current || giftOpen) return;
    markBusy(true);
    setGiftOpen(true);
    setPulse((value) => value + 1);
    play("chime");
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(
      () => goTo(3),
      reduce ? 700 : 1800,
    );
  }, [markBusy, goTo, giftOpen, play, reduce]);

  const handleReveal = useCallback(() => {
    if (busyRef.current || wishRevealed) return;
    markBusy(true);
    setWishRevealed(true);
    setPulse((value) => value + 1);
    fireBurst(1800);
    play("sparkle");
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(
      () => goTo(4),
      reduce ? 800 : 2100,
    );
  }, [markBusy, goTo, wishRevealed, fireBurst, play, reduce]);

  const handleRestart = useCallback(() => {
    if (busyRef.current) return;
    setLit(false);
    setGiftOpen(false);
    setWishRevealed(false);
    setBurst(false);
    play("whoosh");
    goTo(0);
  }, [goTo, play]);

  const advance = useCallback(() => {
    if (busyRef.current) return;
    if (scene === 0) handleBegin();
    else if (scene === 1) handleLight();
    else if (scene === 2) handleGiftOpen();
    else if (scene === 3) handleReveal();
  }, [
    scene,
    handleBegin,
    handleLight,
    handleGiftOpen,
    handleReveal,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      advance();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advance]);

  const handleSpark = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (scene < 3) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a")) return;
      setPulse((value) => value + 1);
      fireBurst(1400);
      play("sparkle");
    },
    [scene, fireBurst, play],
  );

  return (
    <main
      onPointerDown={handleSpark}
      className="relative flex h-[100svh] min-h-[460px] w-full flex-col overflow-hidden bg-midnight-950 text-ivory"
    >
      <OrnamentalBackdrop />

      <TopBar
        scene={scene}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onRestart={handleRestart}
        busy={busy}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="no-scrollbar relative order-1 flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-none lg:overflow-visible">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,1,10,0.94)_0%,rgba(3,1,10,0.68)_76%,rgba(3,1,10,0.24)_100%)] lg:bg-[linear-gradient(90deg,rgba(3,1,10,0.96)_0%,rgba(3,1,10,0.8)_58%,rgba(3,1,10,0)_100%)]"
          />
          <div className="relative z-10 flex min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              {scene === 0 ? (
                <WelcomeScene key="welcome" onBegin={handleBegin} busy={busy} />
              ) : null}
              {scene === 1 ? (
                <LightScene
                  key="light"
                  lit={lit}
                  onLight={handleLight}
                  busy={busy}
                />
              ) : null}
              {scene === 2 ? (
                <GiftScene
                  key="gift"
                  open={giftOpen}
                  onOpen={handleGiftOpen}
                  busy={busy}
                />
              ) : null}
              {scene === 3 ? (
                <CelebrationScene
                  key="celebration"
                  revealed={wishRevealed}
                  onReveal={handleReveal}
                  busy={busy}
                />
              ) : null}
              {scene === 4 ? (
                <FinalScene
                  key="greeting"
                  onRestart={handleRestart}
                  busy={busy}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative order-2 h-[32svh] min-h-[170px] w-full shrink-0 overflow-hidden border-t border-gold-200/10 [@media(max-height:520px)]:h-[26svh] [@media(max-height:520px)]:min-h-[110px] lg:h-auto lg:min-h-0 lg:border-l lg:border-t-0">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_62%,rgba(255,122,26,0.16),transparent_66%)]"
          />

          <div className="pointer-events-none absolute inset-0 z-[1]">
            {webgl === null ? null : webgl ? (
              <Canvas
                dpr={compact ? [1, 1.5] : [1, 1.8]}
                camera={{
                  position: [0, 0.6, 6.8],
                  fov: 42,
                  near: 0.1,
                  far: 100,
                }}
                gl={{
                  alpha: true,
                  antialias: true,
                  powerPreference: "high-performance",
                }}
                onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
              >
                <Suspense fallback={null}>
                  <SceneContents
                    scene={scene}
                    lit={lit}
                    giftOpen={giftOpen}
                    wishRevealed={wishRevealed}
                    pointer={pointer}
                    reduced={reduce}
                    burst={burst}
                    compact={compact}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <WebGLFallback scene={scene} />
            )}
          </div>

          <FireworksOverlay
            active={scene >= 3}
            subtle={scene === 3 && !wishRevealed}
            reduced={reduce}
            pulse={pulse}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_50%_55%,transparent_45%,rgba(3,1,10,0.5)_100%)]"
          />

          <CornerFlourish className="pointer-events-none absolute left-3 top-3 z-[3] h-12 w-12 text-gold-300/20 sm:h-20 sm:w-20" />
          <CornerFlourish className="pointer-events-none absolute bottom-3 right-3 z-[3] h-12 w-12 rotate-180 text-gold-300/20 sm:h-20 sm:w-20" />
        </div>
      </div>

      <SceneProgress scene={scene} />

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {SCENES[scene].announcement}
      </p>
    </main>
  );
}
