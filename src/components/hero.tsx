"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useScrollProgress } from "@/lib/use-scroll-progress";

const HeroStage = dynamic(
  () => import("@/components/hero-stage").then((m) => m.HeroStage),
  { ssr: false }
);

/**
 * HERO 00 — Sticky 3D-Centerpiece mit Scroll-Choreographie.
 *
 * Architektur:
 * - <section h="200dvh"> als Scroll-Spielraum
 * - <div sticky top-0 h-screen> haelt 3D-Stage festgepinnt
 * - useScrollProgress liefert 0..1 progress
 * - HeroStage liest progress via ref, animiert Mark/Wordmark/Material/Camera
 *
 * Annotations sind ueberlagert und faden mit progress aus.
 */
export function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { ref, progressRef, progress } = useScrollProgress();

  // Annotations fade out as we scroll
  const annotationOpacity = Math.max(0, 1 - progress * 1.6);

  return (
    <section
      ref={ref as React.Ref<HTMLDivElement>}
      id="hero"
      className="relative w-full bg-volumetric"
      style={{ height: "200dvh" }}
    >
      {/* Sticky pin */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* 3D Stage */}
        {mounted && (
          <div className="absolute inset-0">
            <HeroStage progressRef={progressRef} />
          </div>
        )}

        {/* Subtle film-grain overlay */}
        <div className="absolute inset-0 bg-grain pointer-events-none" />

        {/* Annotations (fade with scroll) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: annotationOpacity, transition: "opacity 200ms linear" }}
        >
          <div className="absolute top-24 left-6 md:left-12 lg:left-20 z-[2]">
            <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
              AKT 00 · STUDIO-ANSICHT
            </div>
            <div className="font-mono text-[0.6rem] tracking-[0.4em] text-platinum uppercase">
              MARK · WORDMARK
            </div>
          </div>

          <div className="absolute top-24 right-6 md:right-12 lg:right-20 z-[2] text-right">
            <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
              INITIATIVBEWERBUNG
            </div>
            <div className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-400 uppercase">
              SAMIR BALLHAUSEN
            </div>
          </div>

          <div className="absolute left-6 md:left-12 lg:left-20 top-1/2 -translate-y-1/2 z-[2] hidden md:block">
            <div
              className="font-mono text-[0.55rem] tracking-[0.4em] text-bone-500 uppercase"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              GROSS · MESSE &amp; EVENT
            </div>
          </div>

          <div className="absolute right-6 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 z-[2] hidden md:block">
            <div
              className="font-mono text-[0.55rem] tracking-[0.4em] text-platinum uppercase"
              style={{ writingMode: "vertical-rl" }}
            >
              REV · 2026.04
            </div>
          </div>
        </div>

        {/* Bottom: anchor — fades but scroll hint stays */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-4 pointer-events-none">
          <div
            className="font-mono text-[0.55rem] tracking-[0.5em] text-bone-500 uppercase"
            style={{ opacity: annotationOpacity }}
          >
            Hofheim a. Ts. · Juli 2026
          </div>
          <div
            className="font-display text-sm tracking-[0.32em] uppercase text-bone-200"
            style={{ opacity: annotationOpacity }}
          >
            die Begegnung
          </div>
          <div className="h-12 w-px bg-gradient-to-b from-bone-500/60 to-transparent animate-pulse-line mt-4" />
          <div
            className="font-mono text-[0.5rem] tracking-[0.4em] text-bone-500 uppercase"
            style={{ opacity: annotationOpacity }}
          >
            {progress < 0.05 ? "Scroll" : `${Math.round(progress * 100)}%`}
          </div>
        </div>
      </div>
    </section>
  );
}
