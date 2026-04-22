"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useScrollProgress — returns 0..1 based on scroll position relative to
 * a target element (typically the sticky hero section). 0 = section top
 * at viewport top. 1 = section bottom at viewport top.
 *
 * Read via ref to avoid re-render storm; the consumer can either subscribe
 * to state (for React-driven anim) or read currentRef in RAF.
 */
export function useScrollProgress(): {
  progress: number;
  ref: React.RefObject<HTMLElement | null>;
  progressRef: React.MutableRefObject<number>;
} {
  const ref = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = -1;

    const update = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        const p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
        progressRef.current = p;
        // Throttle re-renders: only update if change > 0.01
        if (Math.abs(p - last) > 0.005) {
          last = p;
          setProgress(p);
        }
      }
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { progress, ref, progressRef };
}
