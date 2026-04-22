import { GrossMark } from "@/components/icons";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "mark";
  /** Text under wordmark, optional. */
  sub?: string;
}

const SIZE_MAP = {
  sm: { mark: 22, text: "text-base", gap: "gap-2", tracking: "tracking-[0.18em]", sub: "text-[0.55rem] tracking-[0.4em]" },
  md: { mark: 32, text: "text-2xl", gap: "gap-3", tracking: "tracking-[0.16em]", sub: "text-[0.6rem] tracking-[0.42em]" },
  lg: { mark: 56, text: "text-5xl", gap: "gap-5", tracking: "tracking-[0.14em]", sub: "text-xs tracking-[0.42em]" },
};

/**
 * Logo — adaptiertes GROSS-Wordmark mit Custom Mark-Glyph.
 *
 * Adaption-Disclaimer: Dies ist KEIN Pixel-Tracing des Original-Wordmarks
 * (das waere Pseudo-Authentizitaet bei einem 183px PNG). Stattdessen
 * Bricolage Bold UPPERCASE mit tighter Tracking + eigener Mark-Glyph
 * der die G-Geometrie aufgreift. Skaliert sauber, eigene Stimme.
 */
export function Logo({
  className,
  size = "md",
  variant = "full",
  sub,
}: LogoProps) {
  const s = SIZE_MAP[size];

  if (variant === "mark") {
    return <GrossMark size={s.mark} className={cn("text-bone-100", className)} />;
  }

  return (
    <div className={cn("inline-flex items-center", s.gap, className)}>
      <GrossMark size={s.mark} className="text-platinum" />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-bold uppercase text-bone-100",
            s.text,
            s.tracking
          )}
        >
          GROSS
        </span>
        {sub && (
          <span
            className={cn(
              "font-mono text-bone-500 uppercase mt-1.5",
              s.sub
            )}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
