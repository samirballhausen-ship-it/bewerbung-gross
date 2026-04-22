"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroStage = dynamic(
  () => import("@/components/hero-stage").then((m) => m.HeroStage),
  { ssr: false }
);

/**
 * HERO 00 — Centerpiece-World statt Text-Hero.
 *
 * 3D Wireframe-Frame mit zentralem G-Glyph schwebt im Raum.
 * Camera-Drift + Mouse-Parallax. Atmosphaerische Particle-Wolke.
 *
 * KEINE Inhalts-Texte mehr im Hero — nur Bottom-Anker mit Eyebrow,
 * Side-Marker, Scroll-Hint. Inhalte kommen spaeter als floatende
 * Panels die punktuell andocken.
 */
export function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      id="hero"
      className="relative w-full h-[100dvh] overflow-hidden bg-volumetric"
    >
      {/* 3D Stage — fills the section */}
      {mounted && (
        <div className="absolute inset-0">
          <HeroStage />
        </div>
      )}

      {/* Subtle film-grain overlay */}
      <div className="absolute inset-0 bg-grain pointer-events-none" />

      {/* Top-left annotation */}
      <div className="absolute top-24 left-6 md:left-12 lg:left-20 z-[2] pointer-events-none">
        <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
          AKT 00 · ANSICHT
        </div>
        <div className="font-mono text-[0.6rem] tracking-[0.4em] text-platinum uppercase">
          STRUKTUR · ROTATION
        </div>
      </div>

      {/* Top-right annotation */}
      <div className="absolute top-24 right-6 md:right-12 lg:right-20 z-[2] text-right pointer-events-none">
        <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
          INITIATIVBEWERBUNG
        </div>
        <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-400 uppercase">
          SAMIR BALLHAUSEN
        </div>
      </div>

      {/* Bottom: anchor — minimal, kein Hero-Headline */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-4 pointer-events-none">
        <div className="font-mono text-[0.55rem] tracking-[0.5em] text-bone-500 uppercase">
          Hofheim a. Ts. · Juli 2026
        </div>
        <div className="font-display text-sm tracking-[0.32em] uppercase text-bone-200">
          die Begegnung
        </div>
        <div className="h-12 w-px bg-gradient-to-b from-bone-500/60 to-transparent animate-pulse-line mt-4" />
        <div className="font-mono text-[0.5rem] tracking-[0.4em] text-bone-500 uppercase">
          Scroll
        </div>
      </div>

      {/* Side-marker left */}
      <div className="absolute left-6 md:left-12 lg:left-20 top-1/2 -translate-y-1/2 z-[2] hidden md:block pointer-events-none">
        <div
          className="font-mono text-[0.55rem] tracking-[0.4em] text-bone-500 uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          GROSS · MESSE &amp; EVENT
        </div>
      </div>

      {/* Side-marker right */}
      <div className="absolute right-6 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 z-[2] hidden md:block pointer-events-none">
        <div
          className="font-mono text-[0.55rem] tracking-[0.4em] text-platinum uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          REV · 2026.04
        </div>
      </div>
    </section>
  );
}
