"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/utils";

/**
 * Boot-Portal v2 — Hi-Tech CAD-Plotter Construction.
 *
 * 4 Akte (3.6s gesamt):
 * - Akt 1 (0–800ms):    Schwarz, technisches Raster fade-in, Achsenkreuz + Maße
 * - Akt 2 (800–1900ms): Konstruktionslinien zeichnen sich (SVG stroke-dashoffset),
 *                       Bemaßungspfeile + Hilfspunkte erscheinen
 * - Akt 3 (1900–2800ms): Linien verdichten sich zur G-Form, Konturen werden bold
 * - Akt 4 (2800–3600ms): Crossfade Konstruktion → echtes GROSS-Logo,
 *                        Hero materialisiert
 *
 * Skips bei prefers-reduced-motion. Sessionstorage: einmal pro Tab.
 *
 * Aesthetik: Engineering-Plotter, Sterile-Praezision, kein Magic-Glitter.
 */

export function BootPortal({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [act, setAct] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Stage transitions via setTimeout — separate from RAF so canvas
  // doesn't lose state on re-renders.
  // Akt 5 = Logo zeigt sich gross, scaled bis 640px, haelt fest
  // Akt 6 = Tueroeffnung (top/bottom split, Hero dahinter sichtbar)
  // Akt 7 = Boot raus, Hero uebernimmt
  useEffect(() => {
    const timers = [
      setTimeout(() => setAct(2), 700),
      setTimeout(() => setAct(3), 1700),
      setTimeout(() => setAct(4), 2500), // crossfade auf echtes Logo
      setTimeout(() => setAct(5), 3300), // Logo wird gross, haelt
      setTimeout(() => setAct(6), 4400), // Tueroeffnung
      setTimeout(() => setAct(7), 5400), // Boot disappears
      setTimeout(() => onComplete(), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const isMobile = w < 768;
    const cellSize = isMobile ? 40 : 56;
    const start = performance.now();
    let raf = 0;

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const draw = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);

      // ===== AKT 1: Grid fade-in (0–800ms) =====
      const gridProgress = Math.min(1, t / 800);
      const gridAlpha = easeInOut(gridProgress) * 0.18;

      ctx.strokeStyle = `rgba(184, 196, 208, ${gridAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = (w / 2) % cellSize; x < w; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = (h / 2) % cellSize; y < h; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Stronger crosshair through center
      const cx = w / 2;
      const cy = h / 2;
      const crosshairAlpha = easeInOut(Math.min(1, (t - 200) / 600)) * 0.45;
      ctx.strokeStyle = `rgba(184, 196, 208, ${crosshairAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();

      // ===== AKT 2: Konstruktionslinien (800–1900ms) — handled in SVG layer =====

      // ===== AKT 3: Verdichtung (1900–2800ms) — handled in SVG layer =====

      // ===== AKT 4: Stage 4 fadeout grid =====
      // (grid stays but slightly fades when act 4)

      if (t < 5800) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Doors slide apart in Akt 6
  const doorTransform = act >= 6 ? "translateY(-110%)" : "translateY(0)";
  const doorTransformBottom = act >= 6 ? "translateY(110%)" : "translateY(0)";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      data-act={act}
      style={{
        opacity: act === 7 ? 0 : 1,
        transition: "opacity 400ms cubic-bezier(0.65, 0, 0.35, 1)",
        pointerEvents: act >= 7 ? "none" : "auto",
        background: "transparent",
      }}
    >
      {/* TOP DOOR — slides up in Akt 6 */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-void-900 overflow-hidden"
        style={{
          transform: doorTransform,
          transition: "transform 1100ms cubic-bezier(0.83, 0, 0.17, 1)",
          willChange: "transform",
        }}
      >
        {/* Door edge — thin platinum line at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-platinum to-transparent opacity-80" />
      </div>

      {/* BOTTOM DOOR — slides down in Akt 6 */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-void-900 overflow-hidden"
        style={{
          transform: doorTransformBottom,
          transition: "transform 1100ms cubic-bezier(0.83, 0, 0.17, 1)",
          willChange: "transform",
        }}
      >
        {/* Door edge — thin platinum line at the top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-platinum to-transparent opacity-80" />
      </div>

      {/* Door-content overlay — everything renders inside the doors so it splits with them */}
      <div className="absolute inset-0 pointer-events-none">
      </div>

      {/* All content inside this container — independent of doors */}
      <div
        className="absolute inset-0"
        style={{
          opacity: act >= 6 ? 0 : 1,
          transition: "opacity 600ms cubic-bezier(0.83, 0, 0.17, 1) 100ms",
          pointerEvents: act >= 6 ? "none" : "auto",
        }}
      >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {/* SVG Konstruktion — zentriert */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="boot-svg"
          aria-hidden="true"
          style={{
            opacity: act >= 4 ? 0 : 1,
            transition: "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Bezugspunkte — kleine Plus-Marker */}
          {act >= 2 &&
            [
              [80, 80],
              [240, 80],
              [80, 240],
              [240, 240],
              [160, 160],
            ].map(([px, py], i) => (
              <g
                key={i}
                className="boot-point"
                style={{ animationDelay: `${850 + i * 60}ms` }}
              >
                <line x1={px - 6} y1={py} x2={px + 6} y2={py} stroke="#b8c4d0" strokeWidth="1" />
                <line x1={px} y1={py - 6} x2={px} y2={py + 6} stroke="#b8c4d0" strokeWidth="1" />
              </g>
            ))}

          {/* Bounding-Box */}
          {act >= 2 && (
            <rect
              x="60"
              y="60"
              width="200"
              height="200"
              fill="none"
              stroke="rgba(184, 196, 208, 0.35)"
              strokeWidth="0.6"
              strokeDasharray="3 4"
              className="boot-stroke"
              pathLength={1000}
              style={{ animationDelay: "900ms" }}
            />
          )}

          {/* Bemaßungspfeile rechts */}
          {act >= 2 && (
            <g
              opacity={act >= 4 ? 0 : 0.6}
              style={{ transition: "opacity 400ms" }}
            >
              <line x1="278" y1="60" x2="278" y2="260" stroke="#b8c4d0" strokeWidth="0.5" />
              <line x1="274" y1="60" x2="282" y2="60" stroke="#b8c4d0" strokeWidth="0.5" />
              <line x1="274" y1="260" x2="282" y2="260" stroke="#b8c4d0" strokeWidth="0.5" />
              <text x="290" y="164" fill="#b8c4d0" fontSize="9" fontFamily="monospace">
                200
              </text>
            </g>
          )}

          {/* Bemaßung unten */}
          {act >= 2 && (
            <g
              opacity={act >= 4 ? 0 : 0.6}
              style={{ transition: "opacity 400ms" }}
            >
              <line x1="60" y1="278" x2="260" y2="278" stroke="#b8c4d0" strokeWidth="0.5" />
              <line x1="60" y1="274" x2="60" y2="282" stroke="#b8c4d0" strokeWidth="0.5" />
              <line x1="260" y1="274" x2="260" y2="282" stroke="#b8c4d0" strokeWidth="0.5" />
              <text x="155" y="294" fill="#b8c4d0" fontSize="9" fontFamily="monospace">
                200
              </text>
            </g>
          )}

          {/* G-Konstruktion: outer arc + inner accent */}
          {act >= 2 && (
            <>
              {/* Outer G-arc — opens to the right */}
              <path
                d="M 230 90 A 70 70 0 1 0 230 230"
                fill="none"
                stroke="#e8e6df"
                strokeWidth={act >= 3 ? 5 : 1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1000}
                className="boot-stroke"
                style={{
                  animationDelay: "1000ms",
                  transition: "stroke-width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
              {/* Inner horizontal stroke — the iconic "G-bar" */}
              <line
                x1="160"
                y1="160"
                x2="230"
                y2="160"
                stroke="#e8e6df"
                strokeWidth={act >= 3 ? 5 : 1.4}
                strokeLinecap="round"
                pathLength={1000}
                className="boot-stroke"
                style={{
                  animationDelay: "1500ms",
                  transition: "stroke-width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
              {/* End-cap dot */}
              <circle
                cx="230"
                cy="160"
                r={act >= 3 ? 4 : 2}
                fill="#e8e6df"
                opacity={act >= 2 ? 1 : 0}
                style={{ transition: "r 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
            </>
          )}
        </svg>

        {/* Echtes Logo — crossfaded in act 4, dann scaled big in act 5 */}
        <img
          src={asset("/gross-logo.png")}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{
            width: act >= 5 ? "min(640px, 70vw)" : "280px",
            height: "auto",
            opacity: act >= 4 ? 1 : 0,
            transform: act >= 5 ? "scale(1.15)" : act >= 4 ? "scale(1)" : "scale(0.92)",
            transition:
              "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), width 1100ms cubic-bezier(0.22, 1, 0.36, 1), transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
            filter:
              "brightness(0) invert(1) drop-shadow(0 0 50px rgba(184,196,208,0.5)) drop-shadow(0 0 100px rgba(184,196,208,0.25))",
          }}
        />
      </div>

      {/* Top-Left: spec annotation */}
      <div className="absolute top-8 left-8 font-mono text-[0.6rem] tracking-[0.32em] uppercase text-bone-500 leading-relaxed">
        <div>SAMIR.BALLHAUSEN.WORKS</div>
        <div>REV-2026.04 · INITIATIVBEWERBUNG</div>
      </div>

      {/* Top-Right: ticking spec */}
      <div className="absolute top-8 right-8 font-mono text-[0.6rem] tracking-[0.32em] uppercase text-bone-500 text-right">
        <div>STATUS · LOADING</div>
        <div className="text-platinum mt-1">
          {act === 1 && "GRID INIT"}
          {act === 2 && "REFERENCE POINTS"}
          {act === 3 && "CONSTRUCT WORDMARK"}
          {act >= 4 && "READY"}
        </div>
      </div>

      {/* Bottom: progress bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="w-48 h-px bg-bone-500/20 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-platinum"
            style={{
              width: `${Math.min(100, (act - 1) * 20 + 8)}%`,
              transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
        <span className="font-mono text-[0.55rem] tracking-[0.4em] text-bone-500 uppercase">
          GROSS · MESSE &amp; EVENT
        </span>
      </div>
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
    const seen = sessionStorage.getItem("gross_booted_v3") === "1";
    if (reduced || seen) {
      setBooted(true);
    } else {
      setBooted(false);
      // Lock scroll while boot is on
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("gross_booted_v3", "1");
    document.body.style.overflow = "";
    setBooted(true);
  };

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
