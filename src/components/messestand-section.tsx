"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

const FRAMES: string[] = [];
for (let i = 1; i <= 14; i++) {
  FRAMES.push(`frame${String(i).padStart(2, "0")}.png`);
  FRAMES.push(`frame${String(i).padStart(2, "0")}b.png`);
}
FRAMES.push("frame15.png");
const TOTAL = FRAMES.length;
const BASE  = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const STAGE_LABELS = [
  { from: 0,    to: 0.07, text: "Standort bereit." },
  { from: 0.07, to: 0.18, text: "Planung aktiv." },
  { from: 0.18, to: 0.32, text: "Grundkonstruktion." },
  { from: 0.32, to: 0.47, text: "Skelett steht." },
  { from: 0.47, to: 0.63, text: "Hülle entsteht." },
  { from: 0.63, to: 0.79, text: "Ausbau läuft." },
  { from: 0.79, to: 0.93, text: "Finishing." },
  { from: 0.93, to: 1.01, text: "Wir schaffen Raum für Kommunikation." },
];

const FRAME_MS  = 380;
const FADE_MS   = 560;
const PAUSE_TOP = 3200;
const PAUSE_BOT = 1600;

// ── Particle type ──
interface Particle {
  id: number;
  x: number;    // % from portal center, -50..50
  y: number;    // % from portal center
  size: number;
  duration: number;
  delay: number;
  orbit: number; // radius multiplier
}

export function MessestandSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);

  const [frame, setFrame]     = useState(0);
  const [dir, setDir]         = useState<1 | -1>(1);
  const [pausing, setPausing] = useState(false);
  const [active, setActive]   = useState(false);

  const activeRef  = useRef(false);
  const pausingRef = useRef(false);
  const frameRef   = useRef(0);
  const dirRef     = useRef<1 | -1>(1);

  useEffect(() => { activeRef.current  = active;  }, [active]);
  useEffect(() => { pausingRef.current = pausing; }, [pausing]);
  useEffect(() => { frameRef.current   = frame;   }, [frame]);
  useEffect(() => { dirRef.current     = dir;     }, [dir]);

  // ── Particles (generated once, stable across renders) ──
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x:        (Math.random() - 0.5) * 130,
      y:        (Math.random() - 0.5) * 110,
      size:     Math.random() * 1.8 + 0.6,
      duration: Math.random() * 9 + 5,
      delay:    Math.random() * 8,
      orbit:    Math.random() * 0.4 + 0.8,
    })), []
  );

  // ── Canvas particle animation ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 55 }, () => ({
      x:  Math.random() * canvas.offsetWidth,
      y:  Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.6) * 0.2,
      r:  Math.random() * 1.4 + 0.3,
      a:  Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const cx = canvas.offsetWidth  / 2;
      const cy = canvas.offsetHeight / 2;
      const pw = canvas.offsetWidth  * 0.62;
      const ph = canvas.offsetHeight * 0.72;

      // Soft portal glow on canvas (extra layer under the DOM glow)
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(pw, ph) * 0.7);
      grd.addColorStop(0,   "rgba(0,180,216,0.03)");
      grd.addColorStop(0.6, "rgba(0,180,216,0.015)");
      grd.addColorStop(1,   "rgba(0,180,216,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Particles
      pts.forEach(p => {
        // Drift away from portal center (edge-biased)
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const fade = Math.min(1, dist / (Math.max(pw, ph) * 0.55));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,196,208,${p.a * fade * 0.55})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0)  p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth)  p.x = 0;
        if (p.y < 0)  p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;
      });

      t += 0.008;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // ── IntersectionObserver ──
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Animation tick ──
  const tick = useCallback(() => {
    if (!activeRef.current || pausingRef.current) return;
    const next = frameRef.current + dirRef.current;

    if (next >= TOTAL) {
      setPausing(true); pausingRef.current = true;
      timerRef.current = setTimeout(() => {
        setPausing(false); pausingRef.current = false;
        setDir(-1); dirRef.current = -1;
        tick();
      }, PAUSE_TOP);
      return;
    }
    if (next < 0) {
      setPausing(true); pausingRef.current = true;
      timerRef.current = setTimeout(() => {
        setPausing(false); pausingRef.current = false;
        setDir(1); dirRef.current = 1;
        tick();
      }, PAUSE_BOT);
      return;
    }

    frameRef.current = next;
    setFrame(next);
    timerRef.current = setTimeout(tick, FRAME_MS);
  }, []);

  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(tick, FRAME_MS);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, tick]);

  const progress   = frame / (TOTAL - 1);
  const stage      = STAGE_LABELS.find(s => progress >= s.from && progress < s.to)
                      ?? STAGE_LABELS[STAGE_LABELS.length - 1];
  const isBuilding = dir === 1;
  const isComplete = frame === TOTAL - 1 && pausing;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh", background: "var(--color-void-900)" }}
    >
      {/* ── CANVAS PARTICLES (background layer) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* ── SECTION LABELS (outside portal) ── */}
      <div className="absolute top-10 md:top-14 inset-x-0 z-30 flex justify-between px-6 md:px-14 pointer-events-none">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[0.48rem] md:text-[0.52rem] tracking-[0.44em] text-bone-500 uppercase">
            Aufbau · Prozess
          </span>
          <span className="font-mono text-[0.42rem] tracking-[0.36em] text-bone-500 uppercase opacity-50">
            Gross Messe &amp; Event
          </span>
        </div>
        <div className="text-right flex flex-col gap-1">
          <span
            className="font-mono text-[0.48rem] md:text-[0.52rem] tracking-[0.38em] uppercase transition-colors duration-500"
            style={{ color: isBuilding ? "var(--color-platinum)" : "rgba(200,196,190,0.35)" }}
          >
            {isBuilding ? "Aufbau" : "Abbau"}
          </span>
          <span className="font-mono text-[0.4rem] tracking-[0.26em] text-bone-500 uppercase tabular-nums opacity-60">
            {String(frame + 1).padStart(2, "0")}&thinsp;/&thinsp;{TOTAL}
          </span>
        </div>
      </div>

      {/* ── PORTAL WRAPPER (centred) ── */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative" style={{ width: "70vw", maxWidth: "calc(76vh * 16 / 9)", aspectRatio: "16 / 9" }}>

          {/* Outer glow ring */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: "-32px",
              borderRadius: "6px",
              background: "radial-gradient(ellipse at center, rgba(0,180,216,0.07) 0%, rgba(0,180,216,0.025) 50%, transparent 75%)",
              filter: "blur(12px)",
            }}
          />

          {/* Secondary warm glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: "-16px",
              borderRadius: "4px",
              boxShadow: "0 0 60px rgba(0,180,216,0.12), 0 0 120px rgba(0,180,216,0.06), inset 0 0 60px rgba(0,180,216,0.04)",
            }}
          />

          {/* Corner decorations */}
          {[
            { top: -1, left: -1,  borderTop: "1px solid", borderLeft: "1px solid"  },
            { top: -1, right: -1, borderTop: "1px solid", borderRight: "1px solid" },
            { bottom: -1, left: -1,  borderBottom: "1px solid", borderLeft: "1px solid"  },
            { bottom: -1, right: -1, borderBottom: "1px solid", borderRight: "1px solid" },
          ].map((style, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                ...style,
                width: 20, height: 20,
                borderColor: "rgba(0,180,216,0.45)",
              }}
            />
          ))}

          {/* Tick marks along edges */}
          {[25, 50, 75].map(pct => (
            <div key={`t${pct}`} className="absolute pointer-events-none" style={{
              left: `${pct}%`, top: -5, width: 1, height: 5,
              background: "rgba(0,180,216,0.25)", transform: "translateX(-50%)",
            }} />
          ))}
          {[25, 50, 75].map(pct => (
            <div key={`b${pct}`} className="absolute pointer-events-none" style={{
              left: `${pct}%`, bottom: -5, width: 1, height: 5,
              background: "rgba(0,180,216,0.25)", transform: "translateX(-50%)",
            }} />
          ))}

          {/* ── THE PORTAL IMAGE (with soft mask fade) ── */}
          <div
            className="absolute inset-0 overflow-hidden rounded-sm"
            style={{
              maskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 38%, rgba(0,0,0,0.85) 52%, rgba(0,0,0,0.4) 68%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 38%, rgba(0,0,0,0.85) 52%, rgba(0,0,0,0.4) 68%, transparent 85%)",
            }}
          >
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

            {/* Inner vignette on top of frames */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, transparent 50%, rgba(5,7,16,0.45) 100%)",
              }}
            />
          </div>

          {/* ── COMPLETE STATE: claim text overlay ── */}
          {isComplete && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              style={{ animation: "portalFadeIn 1s ease forwards" }}
            >
              <p
                className="font-display text-center text-bone-100 px-8"
                style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.6rem)", lineHeight: 1.25, letterSpacing: "-0.02em" }}
              >
                Wir schaffen<br />Raum für Kommunikation.
              </p>
            </div>
          )}

          {/* ── PULSE at pause ── */}
          {pausing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "rgba(0,180,216,0.8)",
                animation: "portalPulse 1.6s ease-out infinite",
              }} />
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM LABELS (outside portal) ── */}
      <div className="absolute bottom-8 md:bottom-12 inset-x-0 z-30 flex flex-col items-center gap-4 pointer-events-none px-6">

        {/* Stage text */}
        <span
          key={stage.text}
          className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.42em] text-bone-400 uppercase"
          style={{ animation: "portalFadeUp 0.5s ease forwards" }}
        >
          {stage.text}
        </span>

        {/* Segment dots */}
        <div className="flex items-center gap-[3px]">
          {FRAMES.map((name, i) => {
            const isMain   = !name.includes("b");
            const isActive = i === frame;
            const isPassed = isBuilding ? i < frame : i > frame;
            return (
              <div
                key={name}
                style={{
                  height: "2px", borderRadius: "1px",
                  transition: "background 0.3s, width 0.3s",
                  width: isActive ? (isMain ? "22px" : "12px") : (isMain ? "12px" : "6px"),
                  background: isActive
                    ? "var(--color-platinum)"
                    : isPassed
                    ? "rgba(184,196,208,0.22)"
                    : "rgba(226,221,213,0.09)",
                }}
              />
            );
          })}
        </div>

        {/* Bottom text row */}
        <div className="flex w-full max-w-sm justify-between">
          <span className="font-mono text-[0.42rem] tracking-[0.4em] text-bone-500 uppercase opacity-50">
            Messebau mit System
          </span>
          <span className="font-mono text-[0.42rem] tracking-[0.26em] text-bone-500 uppercase opacity-40 tabular-nums">
            {Math.round(progress * 100).toString().padStart(2, "0")}%
          </span>
        </div>
      </div>

      <style>{`
        @keyframes portalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes portalFadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes portalPulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,180,216,0.5); }
          70%  { box-shadow: 0 0 0 18px rgba(0,180,216,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,180,216,0); }
        }
      `}</style>
    </section>
  );
}
