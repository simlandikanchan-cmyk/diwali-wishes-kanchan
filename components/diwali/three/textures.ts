import * as THREE from "three";

function makeGlowCanvas(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  return canvas;
}

export function createGlowTexture(): THREE.CanvasTexture {
  const canvas = makeGlowCanvas();

  if (!canvas) {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,246,207,0.85)");
  gradient.addColorStop(0.46, "rgba(255,190,90,0.32)");
  gradient.addColorStop(1, "rgba(255,140,40,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createShadowTexture(): THREE.CanvasTexture {
  const canvas = makeGlowCanvas();

  if (!canvas) {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.26)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createPetalTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 64, 96);

  const gradient = ctx.createLinearGradient(0, 4, 0, 92);
  gradient.addColorStop(0, "#fff2c2");
  gradient.addColorStop(0.38, "#ffd166");
  gradient.addColorStop(0.78, "#ff9d3c");
  gradient.addColorStop(1, "#e2631a");

  ctx.beginPath();
  ctx.moveTo(32, 3);
  ctx.bezierCurveTo(59, 24, 58, 69, 32, 93);
  ctx.bezierCurveTo(6, 69, 5, 24, 32, 3);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(150, 62, 8, 0.32)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 12);
  ctx.quadraticCurveTo(38, 52, 32, 88);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
