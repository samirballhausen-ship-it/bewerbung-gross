"use client";

import { useEffect, useRef, useState } from "react";
import { GrossMark } from "@/components/icons";

/**
 * Boot-Portal — 2.4s cinematischer Eintritt.
 *
 * Sequenz:
 * - 0.0–0.3s : Schwarzer Vollbildschirm, Zentral-Punkt atmet
 * - 0.3–0.7s : 220 Partikel-Explosion spiralig nach aussen mit Glow
 * - 0.7–1.2s : Partikel rotieren, kompaktieren langsam
 * - 1.2–1.7s : GROSS-Mark materialisiert, Partikel werden dimmer
 * - 1.7–2.0s : Wordmark "GROSS" fade-in, Tracking expandiert
 * - 2.0–2.4s : Vollstaendiger Loader Fade-Out, Hero wird sichtbar
 *
 * Skips automatisch bei prefers-reduced-motion (instant). Sessionstorage:
 * Boot zeigt sich nur einmal pro Tab — Returning Visitors springen direkt rein.
 */

const PARTICLE_COUNT = 220;
const PARTICLE_COUNT_MOBILE = 100;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  glow: number;
  phase: number; // initial spawn angle index
}

export function BootPortal({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0); // 0=particles 1=mark 2=wordmark 3=fade

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;

    // Initialize particles at center, with spiral spawn velocity
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = i * GOLDEN_ANGLE;
      const speed = 0.6 + Math.random() * 1.4;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 0.6 + Math.random() * 1.4,
        glow: 0.4 + Math.random() * 0.6,
        phase: i,
      };
    });

    const start = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      const t = now - start;

      // Stage transitions
      if (t > 2000 && stage < 3) setStage(3);
      else if (t > 1600 && stage < 2) setStage(2);
      else if (t > 1100 && stage < 1) setStage(1);

      // Background fade-fill (Trail)
      ctx.fillStyle = "rgba(5, 7, 16, 0.18)";
      ctx.fillRect(0, 0, w, h);

      // Compute global progress for particle behaviour
      const explodeProgress = Math.min(1, t / 700);
      const compactProgress = Math.max(0, Math.min(1, (t - 700) / 500));
      const dimProgress = Math.max(0, Math.min(1, (t - 1100) / 500));
      const fadeProgress = Math.max(0, Math.min(1, (t - 2000) / 400));

      // Center pulse (only first 300ms)
      if (t < 350) {
        const pulse = (Math.sin(t * 0.02) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 4 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 196, 208, ${0.6 + pulse * 0.4})`;
        ctx.shadowBlur = 24;
        ctx.shadowColor = "rgba(184, 196, 208, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Particles
      ctx.shadowBlur = 0;
      for (const p of particles) {
        // Phase 1: explode (0-700ms)
        if (t < 700) {
          p.x += p.vx;
          p.y += p.vy;
        }
        // Phase 2: spiral compact (700-1100ms)
        else if (t < 1100) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) + 0.06; // slow rotation
          const newDist = dist * (1 - compactProgress * 0.18); // gentle pull-in
          p.x = cx + Math.cos(angle) * newDist;
          p.y = cy + Math.sin(angle) * newDist;
        }
        // Phase 3: dim + slow drift outward
        else if (t < 1700) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const angle = Math.atan2(dy, dx) + 0.02;
          const dist = Math.sqrt(dx * dx + dy * dy) * 1.005;
          p.x = cx + Math.cos(angle) * dist;
          p.y = cy + Math.sin(angle) * dist;
        }
        // Phase 4: scatter upward (light dust effect)
        else {
          p.x += p.vx * 0.3;
          p.y -= 0.6 + Math.random() * 0.4;
        }

        // Render
        const baseAlpha = explodeProgress * (1 - dimProgress * 0.7) * (1 - fadeProgress);
        const alpha = p.glow * baseAlpha;
        if (alpha > 0.02) {
          ctx.fillStyle = `rgba(184, 196, 208, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (t < 2400) {
        raf = requestAnimationFrame(loop);
      } else {
        onComplete();
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onComplete, stage]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-void-900 overflow-hidden"
      data-stage={stage}
      style={{
        opacity: stage === 3 ? 0 : 1,
        transition: "opacity 400ms cubic-bezier(0.65, 0, 0.35, 1)",
        pointerEvents: stage === 3 ? "none" : "auto",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {/* Mark — fades in at stage 1 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: stage >= 1 ? 1 : 0,
          transform: stage >= 1 ? "scale(1)" : "scale(0.85)",
          transition:
            "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="text-platinum drop-shadow-[0_0_40px_rgba(184,196,208,0.4)]">
          <GrossMark size={88} />
        </div>
      </div>

      {/* Wordmark — fades in at stage 2, tracking expands */}
      <div
        className="absolute inset-x-0 bottom-1/2 mb-[-100px] flex justify-center pointer-events-none"
        style={{
          opacity: stage >= 2 ? 1 : 0,
          transition: "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <span
          className="font-display font-bold uppercase text-bone-100 text-2xl"
          style={{
            letterSpacing: stage >= 2 ? "0.18em" : "0em",
            transition: "letter-spacing 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          GROSS
        </span>
      </div>

      {/* Subtle skip hint — appears at 1.4s */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          opacity: stage >= 1 ? 0.4 : 0,
          transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <span className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase">
          Initiativbewerbung wird vorbereitet
        </span>
      </div>
    </div>
  );
}

/**
 * BootGate — wrapper that shows the BootPortal once per session,
 * then renders children. Respects prefers-reduced-motion.
 */
export function BootGate({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState<boolean | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("gross_booted") === "1";
    if (reduced || seen) {
      setBooted(true);
    } else {
      setBooted(false);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("gross_booted", "1");
    setBooted(true);
  };

  // SSR + initial render before hydration: render children, no boot.
  if (booted === null) return <>{children}</>;

  return (
    <>
      {!booted && <BootPortal onComplete={handleComplete} />}
      <div
        style={{
          opacity: booted ? 1 : 0,
          transition: booted ? "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1) 200ms" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
