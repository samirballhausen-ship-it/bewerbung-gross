"use client";

import { useEffect, useState } from "react";
import { SplitText } from "@/components/split-text";
import { Magnetic } from "@/components/magnetic";
import { GrossMark, PfeilLong } from "@/components/icons";

const MORPH_TOKENS = [
  "Schreiner. Zeichner.",
  "Ladenbau im Blut.",
  "Möglichmacher.",
];

/**
 * HERO 00 — Cinematic first frame.
 *
 * Layer:
 * - Volumetric breathing aura (CSS) — schon in globals.css
 * - Floating drift-lines (CSS keyframes)
 * - Initial Headline mit SplitText buchstabenweise (Samir Ballhausen)
 * - Sub-Headline morpht durch 3 Tokens
 * - Magnetic CTA-Buttons
 * - Discrete Top-Mark in der oberen rechten Ecke (Spiegelt Nav-Logo)
 */
export function Hero() {
  const [tokenIndex, setTokenIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      setPhase("out");
      setTimeout(() => {
        if (!mounted) return;
        setTokenIndex((i) => (i + 1) % MORPH_TOKENS.length);
        setPhase("in");
      }, 700);
    };

    const interval = setInterval(tick, 3600);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-volumetric bg-grain"
    >
      {/* Layered Aura */}
      <div className="hero-aura" />
      <div className="hero-aura-secondary" />

      {/* Drift Lines — sehr subtile horizontale Lichtspuren */}
      <div className="hero-drift-lines" aria-hidden="true">
        <span style={{ animationDelay: "0s",   top: "32%" }} />
        <span style={{ animationDelay: "4s",   top: "58%" }} />
        <span style={{ animationDelay: "8s",   top: "76%" }} />
      </div>

      {/* Centerpiece */}
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-10">
            <div className="flex items-center gap-4 mb-12">
              <span className="h-px w-10 bg-platinum/60" />
              <span className="text-eyebrow">
                Initiativbewerbung · Akt 00
              </span>
            </div>

            <h1
              className="font-display text-display-xl text-bone-100"
              aria-label="Samir Ballhausen"
            >
              <SplitText text="Samir" delay={300} step={36} />
              <br />
              <SplitText text="Ballhausen" delay={600} step={36} />
            </h1>

            <div
              className="mt-6 font-display text-display-md text-platinum max-w-[20ch] h-[1.2em]"
              aria-live="polite"
            >
              <span
                className="inline-block transition-all duration-700"
                style={{
                  opacity: phase === "in" ? 1 : 0,
                  transform: phase === "in" ? "translateY(0)" : "translateY(0.3em)",
                  filter: phase === "in" ? "blur(0px)" : "blur(6px)",
                }}
              >
                {MORPH_TOKENS[tokenIndex]}
              </span>
            </div>

            <p className="text-lede mt-12 max-w-[44ch] text-bone-300">
              Diese Seite ist keine Mappe. Sie ist eine Begegnung —
              auf Augenhöhe, in eurem Tempo, mit allem was ich für
              euch mitbringen würde.
            </p>

            <div className="mt-16 flex flex-col sm:flex-row gap-4 sm:gap-8 sm:items-center">
              <Magnetic strength={0.35}>
                <a
                  href="#angebot"
                  className="group inline-flex items-center gap-4 border border-bone-200/40 px-8 py-5 text-bone-100 hover:bg-bone-100 hover:text-void-900 transition-colors duration-700"
                >
                  <span className="font-display text-base">Das Angebot lesen</span>
                  <PfeilLong size={48} className="opacity-70 group-hover:opacity-100" />
                </a>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a
                  href="/kontakt/"
                  className="font-mono text-[0.7rem] tracking-[0.32em] uppercase text-bone-400 hover:text-bone-100 transition-colors"
                >
                  Direkt Kontakt →
                </a>
              </Magnetic>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-2 flex flex-col gap-2 lg:items-end mt-12 lg:mt-0">
            <span className="font-mono text-[0.65rem] tracking-[0.32em] text-bone-500 uppercase">
              Hofheim a. Ts.
            </span>
            <span className="font-mono text-[0.65rem] tracking-[0.32em] text-bone-500 uppercase">
              ab Juli 2026
            </span>
            <span className="font-mono text-[0.65rem] tracking-[0.32em] text-bone-500 uppercase">
              2 Tage / Woche
            </span>
            <div className="mt-6 text-platinum/40 hidden lg:block">
              <GrossMark size={36} />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-3">
        <span className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase">
          Scroll
        </span>
        <div className="h-12 w-px bg-gradient-to-b from-bone-500/60 to-transparent animate-pulse-line" />
      </div>
    </section>
  );
}
