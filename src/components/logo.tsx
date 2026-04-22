import { asset, cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** Optional sub-text under wordmark. */
  sub?: string;
  /** "light" inverts (white on dark), "dark" leaves natural (dark on light). */
  tone?: "light" | "dark";
}

const SIZE_MAP = {
  xs: { h: 18, sub: "text-[0.5rem] tracking-[0.4em] mt-1" },
  sm: { h: 26, sub: "text-[0.55rem] tracking-[0.4em] mt-1.5" },
  md: { h: 38, sub: "text-[0.6rem] tracking-[0.42em] mt-2" },
  lg: { h: 64, sub: "text-xs tracking-[0.42em] mt-3" },
};

/**
 * Logo — echtes GROSS-Wordmark als <img>.
 *
 * Das Original-PNG ist dark-on-transparent. Auf dunklem BG via CSS-Filter
 * `invert + brightness` zu Off-White umgekehrt — kein neues Asset noetig.
 * Aspect-Ratio des Originals: 183x44 ≈ 4.16:1.
 */
export function Logo({
  className,
  size = "md",
  sub,
  tone = "light",
}: LogoProps) {
  const s = SIZE_MAP[size];
  const width = Math.round(s.h * (183 / 44));

  return (
    <div className={cn("inline-flex flex-col leading-none", className)}>
      <img
        src={asset("/gross-logo.png")}
        alt="GROSS Messe & Event"
        width={width}
        height={s.h}
        style={{
          height: s.h,
          width: "auto",
          filter:
            tone === "light"
              ? "invert(1) brightness(2.5) contrast(1.05)"
              : "none",
        }}
      />
      {sub && (
        <span
          className={cn(
            "font-mono uppercase",
            tone === "light" ? "text-bone-500" : "text-void-500",
            s.sub
          )}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
