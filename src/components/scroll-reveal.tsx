"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  as?: "div" | "section" | "article" | "p" | "li";
}

/**
 * Intersection-Observer Reveal — performance-neutral via CSS-Transition.
 * Trigger: Element zu N% sichtbar. Setzt data-reveal="visible".
 * CSS in globals.css steuert Opacity + translateY.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.18,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // prefers-reduced-motion: alles sichtbar lassen, kein Hide
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-reveal", "visible");
      return;
    }

    // Initial-Check: ist Element schon im Viewport? Dann visible lassen.
    const rect = el.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight * 0.85 && rect.bottom > 0;

    if (inViewport) {
      el.setAttribute("data-reveal", "visible");
      return;
    }

    // Below fold: erst hide, dann observer
    el.setAttribute("data-reveal", "hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.setAttribute("data-reveal", "visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  // ref typing across multiple HTML element variants — cast is safe because
  // we only read getAttribute/setAttribute on the underlying Element.
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLParagraphElement & HTMLLIElement>}
      data-reveal=""
      className={cn(className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
