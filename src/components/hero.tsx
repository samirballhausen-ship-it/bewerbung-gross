"use client";

import { useEffect, useRef, useState } from "react";

const MORPH_TOKENS = [
  "Samir Ballhausen",
  "Schreiner. Zeichner.",
  "Ladenbau im Blut.",
  "Möglichmacher.",
];

/**
 * HERO 00 — Dunkelraum, Aura, morphende Headline.
 * Aesthetik: cinematic first frame. Kein Bild, kein 3D — nur Licht und Text.
 * R3F-Volumen kommt in Session 3, wenn Skelett trägt.
 */
export function Hero() {
  const [tokenIndex, setTokenIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const headlineRef = useRef<HTMLHeadingElement>(null);

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

    const interval = setInterval(tick, 3400);
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
      {/* Volumetric breathing aura */}
      <div className="hero-aura" />

      {/* Top bar — discrete metadata */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 lg:px-20">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-500 uppercase">
            Initiativbewerbung · 2026
          </span>
          <span className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-400 uppercase">
            an GROSS Messe &amp; Event
          </span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#angebot"
            className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-400 uppercase hover:text-bone-100 transition-colors"
          >
            Angebot
          </a>
          <a
            href="#kontakt"
            className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-400 uppercase hover:text-bone-100 transition-colors"
          >
            Kontakt
          </a>
        </div>
      </header>

      {/* Centerpiece */}
      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-10">
            <span className="text-eyebrow mb-8 block">
              00 · Eine Begegnung in vier Akten
            </span>

            <h1
              ref={headlineRef}
              className="font-display text-display-xl text-bone-100"
              aria-label={MORPH_TOKENS[0]}
            >
              <span
                className="inline-block transition-all duration-700"
                style={{
                  opacity: phase === "in" ? 1 : 0,
                  transform:
                    phase === "in"
                      ? "translateY(0) blur(0)"
                      : "translateY(0.4em)",
                  filter: phase === "in" ? "blur(0px)" : "blur(8px)",
                }}
              >
                {MORPH_TOKENS[tokenIndex]}
              </span>
            </h1>

            <p className="text-lede mt-12 max-w-[42ch]">
              Diese Seite ist keine Mappe. Sie ist eine Begegnung — auf
              Augenhöhe, in eurem Tempo, mit allem was ich für euch
              mitbringen würde.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-2 flex flex-col gap-2 lg:items-end">
            <span className="font-mono text-[0.65rem] tracking-[0.32em] text-bone-500 uppercase">
              Hofheim a. Ts.
            </span>
            <span className="font-mono text-[0.65rem] tracking-[0.32em] text-bone-500 uppercase">
              ab Juli 2026
            </span>
            <span className="font-mono text-[0.65rem] tracking-[0.32em] text-bone-500 uppercase">
              2 Tage / Woche
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-3">
        <span className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase">
          Scroll
        </span>
        <div className="h-12 w-px bg-gradient-to-b from-bone-500/60 to-transparent" />
      </div>
    </section>
  );
}
