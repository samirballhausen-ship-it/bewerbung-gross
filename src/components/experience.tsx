"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useScrollProgress } from "@/lib/use-scroll-progress";

const HeroStage = dynamic(
  () => import("@/components/hero-stage").then((m) => m.HeroStage),
  { ssr: false }
);

/**
 * Experience — eine kontinuierliche 3D-Welt, sticky ueber 5 Akte.
 *
 * Architektur:
 * - Outer: 600dvh (5 Akt-Bildschirme + 1 fuer Pull-Out) als Scroll-Spielraum
 * - Sticky-Pin: 3D-Stage haelt fest waehrend ganze Reise
 * - Section-Marker als overlays an Stage-Positionen (top: nx100vh)
 * - useScrollProgress liefert globalen 0..1 progress
 * - HeroStage liest progress, fuehrt Multi-Stop Camera + DOF + Material aus
 *
 * Inhalt-Stubs sind absichtlich minimal — Akt-Marker statt Texte.
 */

const ACTS = [
  { eyebrow: "Akt 00", title: "Studio · Volle Ansicht", side: "left" },
  { eyebrow: "Akt 01", title: "Mark · Zentriert", side: "right" },
  { eyebrow: "Akt 02", title: "Profil · Seitenansicht", side: "left" },
  { eyebrow: "Akt 03", title: "Aufsicht · Top-Down", side: "right" },
  { eyebrow: "Akt 04", title: "Detail · Material", side: "left" },
  { eyebrow: "Akt 05", title: "Distanz · Pull-Out", side: "right" },
] as const;

export function Experience() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { ref, progressRef, progress } = useScrollProgress();

  return (
    <section
      ref={ref as React.Ref<HTMLDivElement>}
      id="experience"
      className="relative w-full bg-volumetric"
      style={{ height: `${ACTS.length * 100}dvh` }}
    >
      {/* Sticky 3D Stage */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {mounted && (
          <div className="absolute inset-0">
            <HeroStage progressRef={progressRef} />
          </div>
        )}

        <div className="absolute inset-0 bg-grain pointer-events-none" />

        {/* Top-left always-on: title */}
        <div className="absolute top-24 left-6 md:left-12 lg:left-20 z-[2] pointer-events-none">
          <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
            INITIATIVBEWERBUNG · 2026
          </div>
          <div className="font-mono text-[0.6rem] tracking-[0.4em] text-platinum uppercase">
            SAMIR BALLHAUSEN
          </div>
        </div>

        {/* Top-right always-on: act counter */}
        <div className="absolute top-24 right-6 md:right-12 lg:right-20 z-[2] text-right pointer-events-none">
          <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
            FORTSCHRITT
          </div>
          <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-300 uppercase">
            {Math.round(progress * 100).toString().padStart(2, "0")} / 100
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

        {/* Bottom progress + scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-32 h-px bg-bone-500/20 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-platinum"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div
            className="font-mono text-[0.55rem] tracking-[0.4em] text-bone-500 uppercase"
            style={{ opacity: progress < 0.05 ? 1 : 0.4 }}
          >
            {progress < 0.05 ? "Scroll" : ACTS[Math.min(ACTS.length - 1, Math.floor(progress * ACTS.length))].title}
          </div>
        </div>
      </div>

      {/* Act-Marker overlays — positioned at multiples of 100dvh */}
      <div className="absolute inset-0 pointer-events-none">
        {ACTS.map((act, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-[100dvh] flex items-end pb-32"
            style={{ top: `${i * 100}dvh` }}
          >
            <div
              className={`w-full px-6 md:px-12 lg:px-20 ${
                act.side === "right" ? "text-right" : "text-left"
              }`}
            >
              <div
                className="font-mono text-[0.6rem] tracking-[0.4em] text-platinum uppercase mb-2"
                style={{ opacity: 0.85 }}
              >
                {act.eyebrow}
              </div>
              <div
                className="font-display text-2xl md:text-3xl text-bone-100 max-w-[18ch]"
                style={{
                  display: act.side === "right" ? "inline-block" : "block",
                }}
              >
                {act.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
