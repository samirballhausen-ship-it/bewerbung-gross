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

const FRAME_MS   = 380;
const FADE_MS    = 560;
// Pause at top = logo animation duration (logo fades in at 0, fades out at LOGO_HOLD)
const LOGO_INTRO = 900;   // ms for logo to fade in
const LOGO_HOLD  = 3800;  // ms logo is fully visible
const LOGO_OUTRO = 700;   // ms for logo to fade out
const PAUSE_TOP  = LOGO_INTRO + LOGO_HOLD + LOGO_OUTRO; // ~5400ms total
const PAUSE_BOT  = 1600;

// ── Logo canvas animation ──
function useLogoCanvas(
  ref: React.RefObject<HTMLCanvasElement | null>,
  running: boolean,
  phase: "in" | "hold" | "out" | "idle",
) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !running) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Radar rings
    const rings = [
      { phase: 0,        speed: 0.012, maxR: 0.55, alpha: 0.5, width: 1.2 },
      { phase: Math.PI,  speed: 0.009, maxR: 0.65, alpha: 0.35, width: 0.8 },
      { phase: Math.PI/2,speed: 0.006, maxR: 0.75, alpha: 0.22, width: 0.6 },
    ];

    // Orbit particles (2 rings of 6)
    const orbiters = Array.from({ length: 12 }, (_, i) => ({
      angle:  (i / 12) * Math.PI * 2,
      radius: i % 2 === 0 ? 0.18 : 0.24,  // fraction of min(W,H)
      speed:  0.009 + (i % 3) * 0.004,
      size:   i % 2 === 0 ? 1.8 : 1.2,
      alpha:  0.55 + (i % 3) * 0.12,
    }));

    const draw = () => {
      const w = W(); const h = H();
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const dim = Math.min(w, h);

      // Phase-based global alpha
      let ga = 0;
      if (phase === "in")   ga = Math.min(1, t / (LOGO_INTRO / 16));
      if (phase === "hold") ga = 1;
      if (phase === "out")  ga = Math.max(0, 1 - t / (LOGO_OUTRO / 16));

      // Central radial glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, dim * 0.45);
      grd.addColorStop(0,   `rgba(0,180,216,${0.10 * ga})`);
      grd.addColorStop(0.4, `rgba(0,180,216,${0.05 * ga})`);
      grd.addColorStop(1,   "rgba(0,180,216,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Radar rings
      rings.forEach(ring => {
        const r = (((t * ring.speed + ring.phase) % Math.PI) / Math.PI) * dim * ring.maxR;
        const a = Math.sin((t * ring.speed + ring.phase) % Math.PI) * ring.alpha * ga;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,180,216,${a})`;
        ctx.lineWidth = ring.width;
        ctx.stroke();
      });

      // Orbit particles
      orbiters.forEach(orb => {
        orb.angle += orb.speed;
        const r = orb.radius * dim;
        const px = cx + Math.cos(orb.angle) * r;
        const py = cy + Math.sin(orb.angle) * r * 0.55; // elliptical
        const a = orb.alpha * ga;

        // Glow halo
        const g2 = ctx.createRadialGradient(px, py, 0, px, py, orb.size * 4);
        g2.addColorStop(0,   `rgba(184,196,208,${a * 0.8})`);
        g2.addColorStop(1,   `rgba(184,196,208,0)`);
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(px, py, orb.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, orb.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,220,${a})`;
        ctx.fill();
      });

      // Fine crosshair at center
      const ch = 18 * ga;
      ctx.strokeStyle = `rgba(0,180,216,${0.3 * ga})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - ch, cy); ctx.lineTo(cx + ch, cy);
      ctx.moveTo(cx, cy - ch); ctx.lineTo(cx, cy + ch);
      ctx.stroke();

      t++;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);
}

export function MessestandSection() {
  const sectionRef    = useRef<HTMLElement>(null);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgCanvasRef   = useRef<HTMLCanvasElement>(null);
  const logoCanvasRef = useRef<HTMLCanvasElement>(null);

  const [frame, setFrame]         = useState(0);
  const [dir, setDir]             = useState<1 | -1>(1);
  const [pausing, setPausing]     = useState(false);
  const [active, setActive]       = useState(false);
  const [logoPhase, setLogoPhase] = useState<"in" | "hold" | "out" | "idle">("idle");

  const activeRef  = useRef(false);
  const pausingRef = useRef(false);
  const frameRef   = useRef(0);
  const dirRef     = useRef<1 | -1>(1);

  useEffect(() => { activeRef.current  = active;  }, [active]);
  useEffect(() => { pausingRef.current = pausing; }, [pausing]);
  useEffect(() => { frameRef.current   = frame;   }, [frame]);
  useEffect(() => { dirRef.current     = dir;     }, [dir]);

  // ── Logo canvas animation ──
  useLogoCanvas(logoCanvasRef, logoPhase !== "idle", logoPhase);

  // ── Background particles canvas ──
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
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
      const w = canvas.offsetWidth; const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2; const cy = h / 2;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
      grd.addColorStop(0,   "rgba(0,180,216,0.025)");
      grd.addColorStop(1,   "rgba(0,180,216,0)");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);

      pts.forEach(p => {
        const dx = p.x - cx; const dy = p.y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const fade = Math.min(1, dist / (Math.max(w, h) * 0.4));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,196,208,${p.a * fade * 0.5})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // ── IntersectionObserver ──
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Animation tick ──
  const tick = useCallback(() => {
    if (!activeRef.current || pausingRef.current) return;
    const next = frameRef.current + dirRef.current;

    if (next >= TOTAL) {
      // Reached frame 15 — logo sequence
      setPausing(true); pausingRef.current = true;
      setLogoPhase("in");
      timerRef.current = setTimeout(() => {
        setLogoPhase("hold");
        timerRef.current = setTimeout(() => {
          setLogoPhase("out");
          timerRef.current = setTimeout(() => {
            setLogoPhase("idle");
            setPausing(false); pausingRef.current = false;
            setDir(-1); dirRef.current = -1;
            tick();
          }, LOGO_OUTRO);
        }, LOGO_HOLD);
      }, LOGO_INTRO);
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
    if (active) { timerRef.current = setTimeout(tick, FRAME_MS); }
    else { if (timerRef.current) clearTimeout(timerRef.current); }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, tick]);

  const progress   = frame / (TOTAL - 1);
  const stage      = STAGE_LABELS.find(s => progress >= s.from && progress < s.to)
                      ?? STAGE_LABELS[STAGE_LABELS.length - 1];
  const isBuilding = dir === 1;
  const showLogo   = logoPhase !== "idle";

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh", background: "var(--color-void-900)" }}
    >
      {/* ── BG PARTICLES ── */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* ── TOP LABELS ── */}
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
          <span className="font-mono text-[0.4rem] tracking-[0.26em] text-bone-500 uppercase opacity-60 tabular-nums">
            {String(frame + 1).padStart(2, "0")}&thinsp;/&thinsp;{TOTAL}
          </span>
        </div>
      </div>

      {/* ── PORTAL WRAPPER ── */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className="relative"
          style={{ width: "70vw", maxWidth: "calc(76vh * 16 / 9)", aspectRatio: "16 / 9" }}
        >
          {/* Outer glow ring */}
          <div className="absolute pointer-events-none" style={{
            inset: "-32px", borderRadius: "6px",
            background: "radial-gradient(ellipse at center, rgba(0,180,216,0.07) 0%, rgba(0,180,216,0.025) 50%, transparent 75%)",
            filter: "blur(12px)",
          }} />

          {/* Box shadow glow */}
          <div className="absolute pointer-events-none" style={{
            inset: "-16px", borderRadius: "4px",
            boxShadow: "0 0 60px rgba(0,180,216,0.12), 0 0 120px rgba(0,180,216,0.06), inset 0 0 60px rgba(0,180,216,0.04)",
          }} />

          {/* Corner decorations */}
          {[
            { top: -1, left: -1,     borderTop: "1px solid", borderLeft: "1px solid"  },
            { top: -1, right: -1,    borderTop: "1px solid", borderRight: "1px solid" },
            { bottom: -1, left: -1,  borderBottom: "1px solid", borderLeft: "1px solid"  },
            { bottom: -1, right: -1, borderBottom: "1px solid", borderRight: "1px solid" },
          ].map((s, i) => (
            <div key={i} className="absolute pointer-events-none" style={{ ...s, width: 20, height: 20, borderColor: "rgba(0,180,216,0.45)" }} />
          ))}

          {/* Tick marks */}
          {[25, 50, 75].map(p => (
            <div key={`t${p}`} className="absolute pointer-events-none" style={{ left: `${p}%`, top: -5, width: 1, height: 5, background: "rgba(0,180,216,0.25)", transform: "translateX(-50%)" }} />
          ))}
          {[25, 50, 75].map(p => (
            <div key={`b${p}`} className="absolute pointer-events-none" style={{ left: `${p}%`, bottom: -5, width: 1, height: 5, background: "rgba(0,180,216,0.25)", transform: "translateX(-50%)" }} />
          ))}

          {/* ── PORTAL IMAGE (masked) ── */}
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
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse at center, transparent 50%, rgba(5,7,16,0.45) 100%)",
            }} />
          </div>

          {/* ── LOGO FINALE OVERLAY ── */}
          {showLogo && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
              style={{
                opacity: logoPhase === "in" ? 0 : logoPhase === "out" ? 0 : 1,
                animation: logoPhase === "in"
                  ? `logoIn ${LOGO_INTRO}ms ease forwards`
                  : logoPhase === "out"
                  ? `logoOut ${LOGO_OUTRO}ms ease forwards`
                  : undefined,
              }}
            >
              {/* Logo canvas behind */}
              <canvas
                ref={logoCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Logo + name */}
              <div className="relative z-10 flex flex-col items-center gap-5">
                {/* Logo */}
                <div style={{ filter: "brightness(0) invert(1)", opacity: 0.92 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${BASE}/gross-logo.png`}
                    alt="GROSS Messe & Event"
                    style={{ height: "clamp(28px, 4.5vh, 54px)", width: "auto" }}
                    draggable={false}
                  />
                </div>

                {/* Thin divider line */}
                <div style={{
                  width: "clamp(60px, 12vw, 120px)",
                  height: "1px",
                  background: "linear-gradient(to right, transparent, rgba(184,196,208,0.4), transparent)",
                }} />

                {/* Name + tagline */}
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="font-mono uppercase text-platinum"
                    style={{ fontSize: "clamp(0.38rem, 0.9vw, 0.62rem)", letterSpacing: "0.48em" }}
                  >
                    Messebau mit System
                  </span>
                  <span
                    className="font-mono uppercase text-bone-500"
                    style={{ fontSize: "clamp(0.32rem, 0.7vw, 0.5rem)", letterSpacing: "0.4em" }}
                  >
                    seit 1986
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM LABELS ── */}
      <div className="absolute bottom-8 md:bottom-12 inset-x-0 z-30 flex flex-col items-center gap-4 pointer-events-none px-6">
        <span
          key={stage.text}
          className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.42em] text-bone-400 uppercase"
          style={{ animation: "portalFadeUp 0.5s ease forwards" }}
        >
          {stage.text}
        </span>

        {/* Dots */}
        <div className="flex items-center gap-[3px]">
          {FRAMES.map((name, i) => {
            const isMain   = !name.includes("b");
            const isActive = i === frame;
            const isPassed = isBuilding ? i < frame : i > frame;
            return (
              <div key={name} style={{
                height: "2px", borderRadius: "1px",
                transition: "background 0.3s, width 0.3s",
                width: isActive ? (isMain ? "22px" : "12px") : (isMain ? "12px" : "6px"),
                background: isActive ? "var(--color-platinum)" : isPassed ? "rgba(184,196,208,0.22)" : "rgba(226,221,213,0.09)",
              }} />
            );
          })}
        </div>

        <div className="flex w-full max-w-sm justify-between">
          <span className="font-mono text-[0.42rem] tracking-[0.4em] text-bone-500 uppercase opacity-50">Messebau mit System</span>
          <span className="font-mono text-[0.42rem] tracking-[0.26em] text-bone-500 uppercase opacity-40 tabular-nums">
            {Math.round(progress * 100).toString().padStart(2, "0")}%
          </span>
        </div>
      </div>

      <style>{`
        @keyframes portalFadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes logoOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.04); }
        }
      `}</style>
    </section>
  );
}
