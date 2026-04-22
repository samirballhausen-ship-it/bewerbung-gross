/**
 * Custom SVG Icon Library — KEINE Lucide, KEINE Emojis.
 * Eigenes Vokabular fuer die Bewerbungs-Site. Alle Icons nutzen
 * currentColor, sodass sie ueber Tailwind text-* gefaerbt werden.
 *
 * Konventionen:
 * - 24x24 ViewBox fuer UI-Icons (stroke 1.5, round)
 * - Speziell-Sizes fuer Decorative (Spirale, Wave, Pfeil, Mark)
 * - Alle props: className, optional size override
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size = 24): Partial<SVGProps<SVGSVGElement>> => ({
  width: size,
  height: size,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

// ============================================================
// LOGO MARKS
// ============================================================

/**
 * GROSS-Mark — geometrische "G"-Adaption.
 * Kreissegment offen mit interner Horizontale.
 * 64x64, Stroke 2 fuer Logo-Praesenz.
 */
export function GrossMark({ size = 32, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Kreis-Segment, oeffnet sich rechts */}
      <path d="M 50 18 A 22 22 0 1 0 50 46" />
      {/* Interner Akzent-Strich */}
      <line x1="34" y1="32" x2="50" y2="32" />
      {/* Mini-Punkt am inneren Endpunkt */}
      <circle cx="50" cy="32" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================================
// SECTION MARKERS
// ============================================================

export function WerkstattGlyph({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...baseProps(size)}
      {...rest}
    >
      {/* Hobel-Silhouette */}
      <path d="M 3 14 L 21 14 L 19 18 L 5 18 Z" />
      <line x1="9" y1="14" x2="9" y2="11" />
      <line x1="9" y1="11" x2="13" y2="11" />
      <line x1="13" y1="11" x2="13" y2="14" />
    </svg>
  );
}

export function BauplanGlyph({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...baseProps(size)}
      {...rest}
    >
      {/* Aufgerollte Zeichnung */}
      <path d="M 5 5 L 19 5 L 19 17 L 5 17 Z" />
      <line x1="5" y1="9" x2="19" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="8" y2="20" />
      <line x1="16" y1="17" x2="16" y2="20" />
    </svg>
  );
}

export function CodeGlyph({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...baseProps(size)}
      {...rest}
    >
      {/* Geometrisches Klammern-Set */}
      <path d="M 8 6 L 3 12 L 8 18" />
      <path d="M 16 6 L 21 12 L 16 18" />
      <line x1="13" y1="5" x2="11" y2="19" />
    </svg>
  );
}

export function HandshakeGlyph({ size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      {...baseProps(size)}
      {...rest}
    >
      {/* Zwei sich treffende Linien — Begegnung */}
      <path d="M 3 12 L 11 12 L 13 14 L 21 14" />
      <path d="M 3 14 L 11 14" />
      <circle cx="11" cy="13" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================================
// DECORATIVE
// ============================================================

/**
 * Fibonacci-Spirale Annaeherung — Quartal-Boegen mit goldener Skalierung.
 * Decorativer Divider, KEINE Funktion.
 */
export function SpiraleGlyph({ size = 120, className, ...rest }: IconProps) {
  // Goldene Skalierung: jedes Quadrat 1/phi des vorherigen
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M 60 60 A 50 50 0 0 1 60 110" />
      <path d="M 60 110 A 31 31 0 0 1 60 79" opacity="0.7" />
      <path d="M 60 79 A 19 19 0 0 1 60 99" opacity="0.5" />
      <path d="M 60 99 A 12 12 0 0 1 60 87" opacity="0.35" />
    </svg>
  );
}

export function PfeilLong({ size = 64, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 16"
      width={size}
      height={(size * 16) / 64}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <line x1="0" y1="8" x2="58" y2="8" />
      <path d="M 50 3 L 60 8 L 50 13" />
    </svg>
  );
}

export function PlusCross({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      {...baseProps(size)}
      {...rest}
    >
      <line x1="8" y1="2" x2="8" y2="14" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}

/**
 * Wave-Line fuer Footer-Divider.
 * Sehr breit, sehr flach, atmet leicht.
 */
export function WaveLine({ className, ...rest }: { className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1440 40"
      width="100%"
      height={40}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.6}
      strokeLinecap="round"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M 0 20 Q 360 5, 720 20 T 1440 20" />
      <path d="M 0 22 Q 360 30, 720 22 T 1440 22" opacity="0.4" />
    </svg>
  );
}

/**
 * Cursor-Glyph — kleiner geometrischer Indikator fuer Hover-States.
 */
export function CursorIndicator({ size = 12, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={className}
      {...baseProps(size)}
      strokeWidth={1.5}
      {...rest}
    >
      <circle cx="6" cy="6" r="4" />
      <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
