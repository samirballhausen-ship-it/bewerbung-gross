"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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

const FRAME_MS    = 650;
const FADE_MS     = 750;
const LOGO_INTRO  = 1400;  // particle convergence + flash
const LOGO_HOLD   = 3600;  // logo fully visible
const LOGO_OUTRO  = 800;   // fade out
const PAUSE_TOP   = LOGO_INTRO + LOGO_HOLD + LOGO_OUTRO;
const PAUSE_BOT   = 1600;

// ── Logo canvas: particle convergence → flash → identity reveal ──
function useLogoCanvas(
  ref: React.RefObject<HTMLCanvasElement | null>,
  phase: "in" | "hold" | "out" | "idle",
) {
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (phase === "idle") return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    startRef.current = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    // ── Particles that converge toward center ──
    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const makeParticles = () => Array.from({ length: 180 }, (_, i) => {
      const angle = (i / 180) * Math.PI * 2 + Math.random() * 0.3;
      const edge  = 0.52 + Math.random() * 0.2;
      return {
        x:     Math.cos(angle) * W() * edge + W() / 2,
        y:     Math.sin(angle) * H() * edge + H() / 2,
        size:  Math.random() * 1.5 + 0.5,
        speed: 0.012 + Math.random() * 0.014,
        alpha: 0.4 + Math.random() * 0.5,
        hue:   Math.random() > 0.7 ? 195 : 210,
      };
    });

    const particles = makeParticles();

    // ── Orbit dots for hold phase ──
    const orbiters = Array.from({ length: 10 }, (_, i) => ({
      angle:  (i / 10) * Math.PI * 2,
      r:      i % 2 === 0 ? 0.19 : 0.26,
      speed:  0.008 + (i % 3) * 0.005,
      size:   i % 2 === 0 ? 2 : 1.2,
      alpha:  0.6 + (i % 4) * 0.1,
    }));

    // ── Ring state for expand animation ──
    const rings = [
      { r: 0, alpha: 0.7, width: 1.2, speed: 1.8 },
      { r: 0, alpha: 0.45, width: 0.8, speed: 1.1 },
      { r: 0, alpha: 0.25, width: 0.5, speed: 0.65 },
    ];
    let ringsStarted = false;

    const draw = () => {
      const now = performance.now() - startRef.current;
      const w = W(); const h = H();
      const cx = w / 2; const cy = h / 2;
      const dim = Math.min(w, h);

      ctx.clearRect(0, 0, w, h);

      // ── PHASE: IN — particles converge ──
      if (phase === "in") {
        const t = Math.min(1, now / LOGO_INTRO);

        // Global alpha: fade in over first 30%
        const ga = Math.min(1, t / 0.3);

        // Particles move toward center
        particles.forEach(p => {
          const dx = cx - p.x;
          const dy = cy - p.y;
          p.x += dx * p.speed;
          p.y += dy * p.speed;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const fade = Math.min(1, dist / (dim * 0.15));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.alpha * fade * ga})`;
          ctx.fill();
        });

        // Flash burst in last 30% of intro
        const flashT = Math.max(0, (t - 0.7) / 0.3);
        if (flashT > 0) {
          const r = flashT * dim * 0.45;
          const flashA = Math.sin(flashT * Math.PI) * 0.9;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0,   `rgba(255,255,255,${flashA * 0.95})`);
          g.addColorStop(0.2, `rgba(180,220,255,${flashA * 0.7})`);
          g.addColorStop(0.6, `rgba(0,180,216,${flashA * 0.3})`);
          g.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // ── PHASE: HOLD — rings + orbiters ──
      if (phase === "hold") {
        const t = Math.min(1, now / LOGO_HOLD);

        // Start rings on first frame of hold
        if (!ringsStarted) {
          ringsStarted = true;
          rings.forEach((r, i) => { r.r = 0 + i * dim * 0.04; });
        }

        // Expand rings
        rings.forEach(ring => {
          ring.r += ring.speed;
          if (ring.r > dim * 0.58) ring.r = 0;
          const a = (1 - ring.r / (dim * 0.58)) * ring.alpha;
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,180,216,${a})`;
          ctx.lineWidth = ring.width;
          ctx.stroke();
        });

        // Central soft glow
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, dim * 0.32);
        grd.addColorStop(0,   "rgba(0,180,216,0.06)");
        grd.addColorStop(0.5, "rgba(0,180,216,0.025)");
        grd.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);

        // Orbiting dots
        orbiters.forEach(orb => {
          orb.angle += orb.speed;
          const r = orb.r * dim;
          const px = cx + Math.cos(orb.angle) * r;
          const py = cy + Math.sin(orb.angle) * r * 0.5;

          // Trail
          const trailLen = 6;
          for (let j = 0; j < trailLen; j++) {
            const ta = orb.angle - j * 0.12;
            const tx = cx + Math.cos(ta) * r;
            const ty = cy + Math.sin(ta) * r * 0.5;
            ctx.beginPath();
            ctx.arc(tx, ty, orb.size * (1 - j / trailLen), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,200,230,${orb.alpha * (1 - j / trailLen) * 0.6})`;
            ctx.fill();
          }

          // Core
          const g2 = ctx.createRadialGradient(px, py, 0, px, py, orb.size * 5);
          g2.addColorStop(0, `rgba(200,240,255,${orb.alpha})`);
          g2.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g2;
          ctx.beginPath();
          ctx.arc(px, py, orb.size * 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, orb.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220,245,255,${orb.alpha})`;
          ctx.fill();
        });

        // Crosshair
        const ch = 22 * Math.min(1, t * 6);
        const ca = 0.25 * Math.min(1, t * 6);
        ctx.strokeStyle = `rgba(0,180,216,${ca})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(cx - ch, cy); ctx.lineTo(cx + ch, cy);
        ctx.moveTo(cx, cy - ch); ctx.lineTo(cx, cy + ch);
        ctx.stroke();
      }

      // ── PHASE: OUT — fade everything ──
      if (phase === "out") {
        const fade = Math.max(0, 1 - now / LOGO_OUTRO);
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, dim * 0.35);
        grd.addColorStop(0,   `rgba(0,180,216,${0.05 * fade})`);
        grd.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);

        rings.forEach(ring => {
          ring.r += ring.speed * 0.5;
          if (ring.r > dim * 0.58) return;
          const a = (1 - ring.r / (dim * 0.58)) * ring.alpha * fade;
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,180,216,${a})`;
          ctx.lineWidth = ring.width;
          ctx.stroke();
        });
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
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

  useLogoCanvas(logoCanvasRef, logoPhase);

  // ── Background particles ──
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
      const cx = w/2; const cy = h/2;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w,h)*0.55);
      grd.addColorStop(0, "rgba(0,180,216,0.025)"); grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
      pts.forEach(p => {
        const dx=p.x-cx; const dy=p.y-cy;
        const dist=Math.sqrt(dx*dx+dy*dy);
        const fade=Math.min(1,dist/(Math.max(w,h)*0.4));
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(184,196,208,${p.a*fade*0.5})`; ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=w; if(p.x>w)p.x=0;
        if(p.y<0)p.y=h; if(p.y>h)p.y=0;
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

  // ── Tick ──
  const tick = useCallback(() => {
    if (!activeRef.current || pausingRef.current) return;
    const next = frameRef.current + dirRef.current;

    if (next >= TOTAL) {
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

  // Overlay opacity: ramps up during "in", full during "hold", ramps down during "out"
  const overlayOpacity = showLogo ? (logoPhase === "out" ? 0 : 1) : 0;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh", background: "var(--color-void-900)" }}
    >
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Top labels */}
      <div className="absolute top-10 md:top-14 inset-x-0 z-30 flex justify-between px-6 md:px-14 pointer-events-none">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[0.48rem] md:text-[0.52rem] tracking-[0.44em] text-bone-500 uppercase">Aufbau · Prozess</span>
          <span className="font-mono text-[0.42rem] tracking-[0.36em] text-bone-500 uppercase opacity-50">Gross Messe &amp; Event</span>
        </div>
        <div className="text-right flex flex-col gap-1">
          <span className="font-mono text-[0.48rem] md:text-[0.52rem] tracking-[0.38em] uppercase transition-colors duration-500"
            style={{ color: isBuilding ? "var(--color-platinum)" : "rgba(200,196,190,0.35)" }}>
            {isBuilding ? "Aufbau" : "Abbau"}
          </span>
          <span className="font-mono text-[0.4rem] tracking-[0.26em] text-bone-500 uppercase opacity-60 tabular-nums">
            {String(frame + 1).padStart(2, "0")}&thinsp;/&thinsp;{TOTAL}
          </span>
        </div>
      </div>

      {/* Portal wrapper */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative" style={{ width: "70vw", maxWidth: "calc(76vh * 16 / 9)", aspectRatio: "16 / 9" }}>

          {/* Outer glow */}
          <div className="absolute pointer-events-none" style={{ inset: "-32px", borderRadius: "6px",
            background: "radial-gradient(ellipse at center, rgba(0,180,216,0.07) 0%, rgba(0,180,216,0.025) 50%, transparent 75%)",
            filter: "blur(12px)" }} />
          <div className="absolute pointer-events-none" style={{ inset: "-16px", borderRadius: "4px",
            boxShadow: "0 0 60px rgba(0,180,216,0.12), 0 0 120px rgba(0,180,216,0.06), inset 0 0 60px rgba(0,180,216,0.04)" }} />

          {/* Corners */}
          {[
            { top: -1, left: -1,     borderTop: "1px solid", borderLeft: "1px solid"  },
            { top: -1, right: -1,    borderTop: "1px solid", borderRight: "1px solid" },
            { bottom: -1, left: -1,  borderBottom: "1px solid", borderLeft: "1px solid"  },
            { bottom: -1, right: -1, borderBottom: "1px solid", borderRight: "1px solid" },
          ].map((s, i) => (
            <div key={i} className="absolute pointer-events-none"
              style={{ ...s, width: 20, height: 20, borderColor: "rgba(0,180,216,0.45)" }} />
          ))}
          {[25,50,75].map(p => (
            <div key={`t${p}`} className="absolute pointer-events-none" style={{ left:`${p}%`,top:-5,width:1,height:5,background:"rgba(0,180,216,0.25)",transform:"translateX(-50%)" }} />
          ))}
          {[25,50,75].map(p => (
            <div key={`b${p}`} className="absolute pointer-events-none" style={{ left:`${p}%`,bottom:-5,width:1,height:5,background:"rgba(0,180,216,0.25)",transform:"translateX(-50%)" }} />
          ))}

          {/* Frames (masked) */}
          <div className="absolute inset-0 overflow-hidden rounded-sm" style={{
            maskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 38%, rgba(0,0,0,0.85) 52%, rgba(0,0,0,0.4) 68%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 38%, rgba(0,0,0,0.85) 52%, rgba(0,0,0,0.4) 68%, transparent 85%)",
          }}>
            {FRAMES.map((name, i) => (
              <div key={name} className="absolute inset-0" style={{
                opacity: i === frame ? 1 : 0,
                transition: `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
                willChange: "opacity",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${BASE}/messestand/${name}`} alt="" className="w-full h-full object-cover"
                  loading={i < 4 ? "eager" : "lazy"} draggable={false} />
              </div>
            ))}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(5,7,16,0.45) 100%)" }} />
          </div>

          {/* ── BLACK OVERLAY — fades in for logo ── */}
          <div className="absolute inset-0 pointer-events-none rounded-sm z-[6]"
            style={{
              background: "black",
              opacity: overlayOpacity,
              transition: logoPhase === "in"
                ? `opacity ${LOGO_INTRO * 0.6}ms ease-in`
                : logoPhase === "out"
                ? `opacity ${LOGO_OUTRO}ms ease-out`
                : "none",
            }} />

          {/* ── LOGO CANVAS ── */}
          {showLogo && (
            <canvas ref={logoCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-[7]" />
          )}

          {/* ── LOGO + TEXT (rendered above canvas) ── */}
          {showLogo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-[8] pointer-events-none"
              style={{
                opacity: logoPhase === "in" ? 0 : logoPhase === "out" ? 0 : 1,
                animation: logoPhase === "in"
                  ? `logoReveal ${LOGO_INTRO}ms ease forwards`
                  : logoPhase === "out"
                  ? `logoDismiss ${LOGO_OUTRO}ms ease forwards`
                  : undefined,
              }}
            >
              <div className="flex flex-col items-center gap-4 md:gap-6">
                {/* Logo mark */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE}/gross-logo.png`}
                  alt="GROSS Messe & Event"
                  style={{
                    height: "clamp(32px, 5vh, 62px)",
                    width: "auto",
                    filter: "brightness(0) invert(1)",
                    opacity: 0.95,
                  }}
                  draggable={false}
                />

                {/* Divider */}
                <div style={{
                  width: "clamp(50px, 10vw, 100px)", height: "1px",
                  background: "linear-gradient(to right, transparent, rgba(0,180,216,0.6), transparent)",
                }} />

                {/* Tagline */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-white uppercase tracking-[0.52em]"
                    style={{ fontSize: "clamp(0.4rem, 1vw, 0.65rem)" }}>
                    Messebau mit System
                  </span>
                  <span className="font-mono uppercase tracking-[0.38em]"
                    style={{ fontSize: "clamp(0.32rem, 0.7vw, 0.48rem)", color: "rgba(0,180,216,0.7)" }}>
                    seit 1986
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom labels */}
      <div className="absolute bottom-8 md:bottom-12 inset-x-0 z-30 flex flex-col items-center gap-4 pointer-events-none px-6">
        <span key={stage.text}
          className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.42em] text-bone-400 uppercase"
          style={{ animation: "portalFadeUp 0.5s ease forwards" }}>
          {stage.text}
        </span>
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
        @keyframes logoReveal {
          0%   { opacity: 0; transform: scale(0.88) translateY(8px); }
          60%  { opacity: 0; }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes logoDismiss {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.06); }
        }
      `}</style>
    </section>
  );
}
