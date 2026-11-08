"use client";

import { useEffect, useRef } from "react";

type FireworksOverlayProps = {
  active: boolean;
  subtle?: boolean;
  reduced: boolean;
  pulse: number;
};

type Particle = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

const COLORS = [
  "#ffd27a",
  "#ffb347",
  "#ff7a1a",
  "#ff4f8b",
  "#4ee0cf",
  "#fff2c2",
  "#e3b84f",
];

export default function FireworksOverlay({
  active,
  subtle = false,
  reduced,
  pulse,
}: FireworksOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boostRef = useRef(0);

  useEffect(() => {
    if (pulse > 0) boostRef.current += 1;
  }, [pulse]);

  useEffect(() => {
    if (!active || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    const particles: Particle[] = [];
    const parent = canvas.parentElement;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer =
      typeof ResizeObserver !== "undefined" && parent
        ? new ResizeObserver(() => resize())
        : null;
    observer?.observe(parent as Element);

    const spawn = (bx?: number, by?: number, amount = subtle ? 24 : 44) => {
      const x = bx ?? width * (0.12 + Math.random() * 0.76);
      const y = by ?? height * (0.06 + Math.random() * 0.4);
      const count = Math.min(amount, 64);
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed =
          (subtle ? 46 : 78) + Math.random() * (subtle ? 80 : 180);
        const maxLife = 0.9 + Math.random() * 1.25;
        const color =
          Math.random() < 0.72
            ? COLORS[Math.floor(Math.random() * COLORS.length)]
            : `hsl(${Math.floor(Math.random() * 360)} 90% 70%)`;
        particles.push({
          x,
          y,
          px: x,
          py: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          size: 0.9 + Math.random() * 2,
          color,
        });
      }
      if (particles.length > 880) {
        particles.splice(0, particles.length - 880);
      }
    };

    let last = performance.now();
    let elapsed = 0;
    let nextSpawn = subtle ? 1.4 : 0.6;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      if (boostRef.current > 0) {
        boostRef.current -= 1;
        spawn(width * 0.5, height * 0.3, 58);
        nextSpawn = elapsed + 1.2;
      } else if (elapsed > nextSpawn) {
        spawn();
        nextSpawn = elapsed + (subtle ? 2.8 : 1.8) + Math.random() * 1.3;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.px = p.x;
        p.py = p.y;
        p.vy += (subtle ? 30 : 56) * dt;
        p.vx *= 1 - 0.85 * dt;
        p.vy *= 1 - 0.22 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      particles.length = 0;
      ctx.clearRect(0, 0, width, height);
    };
  }, [active, reduced, subtle]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[2] h-full w-full transition-opacity duration-1000 ${
        active && !reduced ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
