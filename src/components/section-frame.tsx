import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionFrameProps {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}

/**
 * Section-Container — standardisiert Padding, Grid, Eyebrow-Index.
 * Editorial-Grid: 12 Spalten Desktop, asymmetrisch, viel Negative Space.
 * Inhalt wird per Children eingekippt.
 */
export function SectionFrame({
  id,
  index,
  eyebrow,
  title,
  children,
  className,
  align = "left",
}: SectionFrameProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full px-6 py-32 md:px-12 md:py-44 lg:px-20",
        className
      )}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-x-6 gap-y-12 md:gap-x-8">
        {/* Index-Marker oben links — wie Kapitel-Nummer im Magazin */}
        <header
          className={cn(
            "col-span-12 flex flex-col gap-3 md:col-span-3",
            align === "right" && "md:order-2 md:col-start-10"
          )}
        >
          <span className="font-mono text-xs tracking-[0.4em] text-bone-500">
            {index}
          </span>
          <span className="text-eyebrow">{eyebrow}</span>
        </header>

        {/* Titel + Inhalt */}
        <div
          className={cn(
            "col-span-12 md:col-span-9",
            align === "right" && "md:order-1 md:col-start-1 md:col-end-10"
          )}
        >
          <h2 className="font-display text-display-lg text-bone-100 mb-12 max-w-[16ch]">
            {title}
          </h2>
          <div className="space-y-8 text-bone-200">{children}</div>
        </div>
      </div>
    </section>
  );
}
