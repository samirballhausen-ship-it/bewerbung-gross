"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { useIsMobile } from "@/lib/use-media-query";

const HeroStage = dynamic(
  () => import("@/components/hero-stage").then((m) => m.HeroStage),
  { ssr: false }
);

const ACTS_DESKTOP = [
  { eyebrow: "Akt 00", title: "Studio · Volle Ansicht" },
  { eyebrow: "Akt 01", title: "Mark · Zentriert" },
  { eyebrow: "Akt 02", title: "Profil · Seitenansicht" },
  { eyebrow: "Akt 03", title: "Aufsicht · Top-Down" },
  { eyebrow: "Akt 04", title: "Detail · Material" },
  { eyebrow: "Akt 05", title: "Distanz · Pull-Out" },
] as const;

const ACTS_MOBILE = [
  { eyebrow: "Akt 00", title: "Volle Ansicht" },
  { eyebrow: "Akt 01", title: "Mark · Bronze" },
  { eyebrow: "Akt 02", title: "Aufsicht" },
  { eyebrow: "Akt 03", title: "Pull-Out" },
] as const;

export function Experience() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isMobile = useIsMobile();
  const acts = isMobile ? ACTS_MOBILE : ACTS_DESKTOP;
  const { ref, progressRef, progress } = useScrollProgress();

  // Determine which act we're currently in
  const currentActIndex = Math.min(
    acts.length - 1,
    Math.floor(progress * acts.length)
  );
  const currentAct = acts[currentActIndex];

  return (
    <section
      ref={ref as React.Ref<HTMLDivElement>}
      id="experience"
      className="relative w-full bg-volumetric"
      style={{ height: `${acts.length * 100}dvh` }}
    >
      {/* Sticky 3D Stage */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {mounted && (
          <div className="absolute inset-0">
            <HeroStage progressRef={progressRef} isMobile={isMobile} />
          </div>
        )}

        <div className="absolute inset-0 bg-grain pointer-events-none" />

        {/* Top-left: title */}
        <div className="absolute top-20 md:top-24 left-5 md:left-12 lg:left-20 z-[2] pointer-events-none">
          <div className="font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
            INITIATIVBEWERBUNG · 2026
          </div>
          <div className="font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.4em] text-platinum uppercase">
            SAMIR BALLHAUSEN
          </div>
        </div>

        {/* Top-right: progress counter */}
        <div className="absolute top-20 md:top-24 right-5 md:right-12 lg:right-20 z-[2] text-right pointer-events-none">
          <div className="font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase mb-1">
            FORTSCHRITT
          </div>
          <div className="font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.4em] text-bone-300 uppercase">
            {Math.round(progress * 100).toString().padStart(2, "0")} / 100
          </div>
        </div>

        {/* Side-marker left — desktop only */}
        <div className="absolute left-12 lg:left-20 top-1/2 -translate-y-1/2 z-[2] hidden md:block pointer-events-none">
          <div
            className="font-mono text-[0.55rem] tracking-[0.4em] text-bone-500 uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            GROSS · MESSE &amp; EVENT
          </div>
        </div>

        {/* Bottom: current Akt-Marker (one element, swaps on scroll) */}
        <div className="absolute bottom-8 md:bottom-12 inset-x-0 z-[2] flex flex-col items-center gap-3 px-6 pointer-events-none">
          <div className="w-32 md:w-40 h-px bg-bone-500/20 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-platinum transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="text-center">
            <div className="font-mono text-[0.55rem] tracking-[0.4em] text-platinum uppercase mb-1">
              {currentAct.eyebrow}
            </div>
            <div className="font-display text-base md:text-lg text-bone-100">
              {currentAct.title}
            </div>
          </div>
          {progress < 0.05 && (
            <div className="font-mono text-[0.5rem] tracking-[0.4em] text-bone-500 uppercase mt-2">
              Scroll
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
