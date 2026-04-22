"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Smooth-Scroll Provider — normiert Scroll-Verhalten zwischen
 * Apple-Trackpad und Windows-Mausrad. Voraussetzung fuer ScrollTrigger
 * ohne ruckelnde Choreographien. prefers-reduced-motion wird respektiert.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
