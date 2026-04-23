"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Frame order: 01, 01b, 02, 02b … 14, 14b, 15 ──
const FRAMES: string[] = [];
for (let i = 1; i <= 14; i++) {
  FRAMES.push(`frame${String(i).padStart(2, "0")}.png`);
  FRAMES.push(`frame${String(i).padStart(2, "0")}b.png`);
}
FRAMES.push("frame15.png");
const TOTAL = FRAMES.length; // 29

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// ── Construction stage labels ──
const STAGE_LABELS = [
  { from: 0,    to: 0.07, text: "Standort bereit." },
  { from: 0.07, to: 0.17, text: "Planung aktiv." },
  { from: 0.17, to: 0.30, text: "Grundkonstruktion." },
  { from: 0.30, to: 0.45, text: "Skelett steht." },
  { from: 0.45, to: 0.62, text: "Hülle entsteht." },
  { from: 0.62, to: 0.78, text: "Ausbau läuft." },
  { from: 0.78, to: 0.93, text: "Finishing." },
  { from: 0.93, to: 1.01, text: "Wir schaffen Raum für Kommunikation." },
];

const FRAME_MS   = 380;
const FADE_MS    = 560;
const PAUSE_TOP  = 3200;
const PAUSE_BOT  = 1600;

export function MessestandSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [frame, setFrame]     = useState(0);
  const [dir, setDir]         = useState<1 | -1>(1);
  const [pausing, setPausing] = useState(false);
  const [active, setActive]   = useState(false);  // in viewport?
  const activeRef = useRef(false);
  const pausingRef = useRef(false);
  const frameRef  = useRef(0);
  const dirRef    = useRef<1 | -1>(1);

  // ── Sync refs ──
  useEffect(() => { activeRef.current  = active; },  [active]);
  useEffect(() => { pausingRef.current = pausing; }, [pausing]);
  useEffect(() => { frameRef.current   = frame; },   [frame]);
  useEffect(() => { dirRef.current     = dir; },     [dir]);

  // ── Intersection Observer: start / stop on visibility ──
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Animation tick ──
  const tick = useCallback(() => {
    if (!activeRef.current || pausingRef.current) return;

    const next = frameRef.current + dirRef.current;

    if (next >= TOTAL) {
      setPausing(true);
      pausingRef.current = true;
      timerRef.current = setTimeout(() => {
        setPausing(false);
        pausingRef.current = false;
        setDir(-1);
        dirRef.current = -1;
        tick();
      }, PAUSE_TOP);
      return;
    }
    if (next < 0) {
      setPausing(true);
      pausingRef.current = true;
      timerRef.current = setTimeout(() => {
        setPausing(false);
        pausingRef.current = false;
        setDir(1);
        dirRef.current = 1;
        tick();
      }, PAUSE_BOT);
      return;
    }

    frameRef.current = next;
    setFrame(next);
    timerRef.current = setTimeout(tick, FRAME_MS);
  }, []);

  // ── Start / stop when viewport visibility changes ──
  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(tick, FRAME_MS);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, tick]);

  const progress = frame / (TOTAL - 1);
  const stage = STAGE_LABELS.find(s => progress >= s.from && progress < s.to)
    ?? STAGE_LABELS[STAGE_LABELS.length - 1];
  const isBuilding = dir === 1;
  const isComplete = frame === TOTAL - 1 && pausing;

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "100dvh" }}
      aria-label="Messestand Aufbau Animation"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-void-900">

        {/* ── FRAMES ── */}
        <div className="absolute inset-0">
          {FRAMES.map((name, i) => (
            <div
              key={name}
              className="absolute inset-0"
              style={{
                opacity: i === frame ? 1 : 0,
                transition: `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
                willChange: "opacity",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}/messestand/${name}`}
                alt=""
                className="w-full h-full object-cover"
                loading={i < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* ── VIGNETTE ── */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,7,16,0.7) 100%)",
          }}
        />

        {/* ── GRAIN ── */}
        <div className="absolute inset-0 bg-grain pointer-events-none z-10 opacity-60" />

        {/* ── TOP LEFT ── */}
        <div className="absolute top-20 md:top-24 left-5 md:left-12 lg:left-20 z-20 pointer-events-none">
          <div className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.44em] text-bone-500 uppercase mb-1">
            AUFBAU · PROZESS
          </div>
          <div className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.44em] text-platinum uppercase">
            GROSS MESSE &amp; EVENT
          </div>
        </div>

        {/* ── TOP RIGHT ── */}
        <div className="absolute top-20 md:top-24 right-5 md:right-12 lg:right-20 z-20 text-right pointer-events-none">
          <div
            className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.38em] uppercase mb-1 transition-colors duration-500"
            style={{ color: isBuilding ? "var(--color-platinum)" : "rgba(200,196,190,0.38)" }}
          >
            {isBuilding ? "AUFBAU" : "ABBAU"}
          </div>
          <div className="font-mono text-[0.46rem] md:text-[0.5rem] tracking-[0.28em] text-bone-500 uppercase tabular-nums">
            {String(frame + 1).padStart(2, "0")} / {TOTAL}
          </div>
        </div>

        {/* ── SIDE LABEL ── */}
        <div
          className="absolute left-5 md:left-12 lg:left-20 top-1/2 z-20 hidden md:block pointer-events-none"
          style={{ transform: "translateY(-50%) rotate(180deg)", writingMode: "vertical-rl" }}
        >
          <span className="font-mono text-[0.48rem] tracking-[0.44em] text-bone-500 uppercase opacity-40">
            Messebau mit System seit 1986
          </span>
        </div>

        {/* ── STAGE LABEL — CENTRE ── */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none gap-3">
          {isComplete && (
            <p
              className="font-display text-display-md text-bone-100 text-center px-8 md:px-0"
              style={{ opacity: isComplete ? 1 : 0, transition: "opacity 1s ease" }}
            >
              Wir schaffen Raum<br className="hidden md:block" /> für Kommunikation.
            </p>
          )}
        </div>

        {/* ── BOTTOM OVERLAY ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none px-5 md:px-12 lg:px-20 pb-8 md:pb-12 flex flex-col gap-4">

          {/* Stage text */}
          <div className="flex justify-center">
            <span
              key={stage.text}
              className="font-mono text-[0.52rem] md:text-[0.58rem] tracking-[0.4em] text-bone-400 uppercase"
              style={{ animation: "fadeUp 0.5s ease forwards" }}
            >
              {stage.text}
            </span>
          </div>

          {/* Segment dots */}
          <div className="flex items-center gap-[3px] justify-center flex-wrap">
            {FRAMES.map((name, i) => {
              const isMain = !name.includes("b");
              const isActive = i === frame;
              const isPassed = isBuilding ? i < frame : i > frame;
              return (
                <div
                  key={name}
                  style={{
                    height: "2px",
                    borderRadius: "1px",
                    transition: "background 0.3s ease, width 0.3s ease",
                    width: isActive ? (isMain ? "24px" : "14px") : (isMain ? "14px" : "8px"),
                    background: isActive
                      ? "var(--color-platinum)"
                      : isPassed
                      ? "rgba(184,196,208,0.25)"
                      : "rgba(226,221,213,0.1)",
                  }}
                />
              );
            })}
          </div>

          {/* Bottom text row */}
          <div className="flex justify-between items-center">
            <span className="font-mono text-[0.46rem] tracking-[0.44em] text-bone-500 uppercase opacity-60">
              Raum für Kommunikation
            </span>
            <span className="font-mono text-[0.44rem] tracking-[0.28em] text-bone-500 uppercase opacity-40 tabular-nums">
              {Math.round(progress * 100).toString().padStart(2, "0")}%
            </span>
          </div>
        </div>

        {/* ── PAUSE PULSE ── */}
        {pausing && (
          <div
            className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--color-platinum)",
                animation: "pulseRing 1.6s ease-out infinite",
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(184,196,208,0.5); }
          70%  { box-shadow: 0 0 0 20px rgba(184,196,208,0); }
          100% { box-shadow: 0 0 0 0 rgba(184,196,208,0); }
        }
      `}</style>
    </section>
  );
}
