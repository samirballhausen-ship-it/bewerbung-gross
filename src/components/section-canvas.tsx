"use client";

import { useEffect, useRef } from "react";

type Variant = "wireframe-mesh" | "plotter-grid" | "particle-field" | "blueprint-rays";

/**
 * SectionCanvas — leichtgewichtige Hintergrund-Schicht pro Section.
 * Vier Varianten — alle CAD/Engineering-Aesthetik.
 *
 * - wireframe-mesh:   subtiles Vertex-Mesh das langsam atmet
 * - plotter-grid:     scrollendes Raster mit Achsen-Akzent
 * - particle-field:   sparse Drift-Partikel mit Linien-Verbindungen bei Naehe
 * - blueprint-rays:   konzentrische Bezugsstrahlen aus Bottom-Left
 */
export function SectionCanvas({ variant }: { variant: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.parentElement?.clientWidth ?? window.innerWidth;
      h = canvas.parentElement?.clientHeight ?? window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const isMobile = w < 768;

    // Variant-specific state
    let particles: { x: number; y: number; vx: number; vy: number }[] = [];
    let meshPoints: { x: number; y: number; ox: number; oy: number }[] = [];

    if (variant === "particle-field") {
      const count = isMobile ? 30 : 70;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
    }

    if (variant === "wireframe-mesh") {
      const cols = isMobile ? 8 : 14;
      const rows = isMobile ? 10 : 14;
      const dx = w / (cols - 1);
      const dy = h / (rows - 1);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          meshPoints.push({
            x: i * dx,
            y: j * dy,
            ox: i * dx,
            oy: j * dy,
          });
        }
      }
    }

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      if (variant === "plotter-grid") {
        const cell = isMobile ? 56 : 80;
        const offsetY = (t * 8) % cell; // slow downward drift
        ctx.strokeStyle = "rgba(184, 196, 208, 0.08)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = 0; x < w; x += cell) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = -cell + offsetY; y < h; y += cell) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Accent vertical line that travels horizontally
        const accentX = ((t * 30) % (w + 200)) - 100;
        ctx.strokeStyle = "rgba(184, 196, 208, 0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(accentX, 0);
        ctx.lineTo(accentX, h);
        ctx.stroke();
      }

      if (variant === "wireframe-mesh") {
        for (const p of meshPoints) {
          // gentle wave displacement
          p.x = p.ox + Math.sin(t * 0.6 + p.oy * 0.01) * 8;
          p.y = p.oy + Math.cos(t * 0.5 + p.ox * 0.01) * 6;
        }
        // Connect neighbours
        ctx.strokeStyle = "rgba(184, 196, 208, 0.1)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const cols = isMobile ? 8 : 14;
        const rows = isMobile ? 10 : 14;
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const idx = i * rows + j;
            const p = meshPoints[idx];
            if (i < cols - 1) {
              const r = meshPoints[(i + 1) * rows + j];
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(r.x, r.y);
            }
            if (j < rows - 1) {
              const b = meshPoints[i * rows + (j + 1)];
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(b.x, b.y);
            }
          }
        }
        ctx.stroke();
        // Vertex dots
        ctx.fillStyle = "rgba(184, 196, 208, 0.4)";
        for (const p of meshPoints) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (variant === "particle-field") {
        // Move particles
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }
        // Connect close ones
        ctx.strokeStyle = "rgba(184, 196, 208, 0.16)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const maxDist = isMobile ? 110 : 160;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < maxDist) {
              ctx.globalAlpha = (1 - d / maxDist) * 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
            }
          }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Particle dots
        ctx.fillStyle = "rgba(184, 196, 208, 0.55)";
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (variant === "blueprint-rays") {
        const ox = w * 0.05;
        const oy = h * 0.95;
        ctx.strokeStyle = "rgba(184, 196, 208, 0.12)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const rays = isMobile ? 6 : 10;
        for (let i = 0; i < rays; i++) {
          const angle = (-Math.PI / 2) + (i / rays) * (Math.PI / 2.4);
          const len = w * 1.2;
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox + Math.cos(angle) * len, oy + Math.sin(angle) * len);
        }
        ctx.stroke();
        // Concentric arcs that pulse
        ctx.strokeStyle = "rgba(184, 196, 208, 0.16)";
        for (let i = 1; i <= 4; i++) {
          const r = (i * w * 0.18) + Math.sin(t + i) * 8;
          ctx.beginPath();
          ctx.arc(ox, oy, r, -Math.PI / 2, 0);
          ctx.stroke();
        }
      }

      if (!reduced) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="section-canvas"
      aria-hidden="true"
    />
  );
}
