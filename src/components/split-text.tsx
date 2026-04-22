"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * SplitText — buchstabenweise Stagger-Reveal ohne GSAP-Premium.
 *
 * Nutzt CSS-Variable `--char-delay` pro Span, ein einziger Animation-Style
 * in globals.css. Sichtbar nach Mount, respektiert prefers-reduced-motion.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  step = 28,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  /** initial delay in ms */
  delay?: number;
  /** ms between each character */
  step?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-char]").forEach((c) => {
        c.style.opacity = "1";
        c.style.transform = "none";
      });
      return;
    }
    requestAnimationFrame(() => {
      el.setAttribute("data-split-active", "true");
    });
  }, [text]);

  // Preserve word grouping so the natural line-wrap stays intact.
  const words = text.split(" ");
  let charIdx = 0;

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn("split-text inline-block", className)}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {Array.from(word).map((char) => {
            const i = charIdx++;
            return (
              <span
                key={i}
                data-char
                className="inline-block"
                style={{
                  ["--char-delay" as string]: `${delay + i * step}ms`,
                }}
              >
                {char}
              </span>
            );
          })}
          {wi < words.length - 1 && (
            <span data-char className="inline-block" style={{ width: "0.28em" }}>
              {" "}
            </span>
          )}
        </span>
      ))}
    </Tag>
  );
}
