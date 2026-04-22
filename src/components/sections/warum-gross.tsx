import { SectionFrame } from "@/components/section-frame";
import { Reveal } from "@/components/scroll-reveal";

const ZEITACHSE = [
  {
    jahr: "1986",
    titel: "Gegründet",
    text: "Familienunternehmen, zweite Generation unter Maximilian Bitter. Hofheim am Taunus.",
  },
  {
    jahr: "Heute",
    titel: "Zwanzig Köpfe",
    text: "Schnell, unkompliziert und flexibel — eure eigenen Worte. Premium-Messebau für ein wachsendes Kundenfeld.",
  },
  {
    jahr: "2028",
    titel: "Was möglich wäre",
    text: "Konfiguratoren für wiederkehrende Stand-Typen. KI-gestützte Angebots-Visualisierung. Die digitale Schicht über das, was ihr handwerklich schon meistert.",
  },
];

/**
 * 03 — WARUM GROSS
 * Zeitachse als Kapitel-Navigation. Sanfte Brücke ins "was möglich wäre" —
 * keine Besserwisserei, ein Vorschlag.
 */
export function WarumGross() {
  return (
    <SectionFrame
      id="warum-gross"
      index="03"
      eyebrow="Warum GROSS"
      canvas="blueprint-rays"
      title={
        <>
          Drei Punkte
          <br />
          auf einer Linie.
        </>
      }
    >
      <Reveal>
        <p className="text-lede max-w-[58ch] mb-16">
          Vierzig Jahre Messebau, zwei Generationen, ein klarer Ton:
          schnell, unkompliziert, flexibel. Was mich anzieht, ist nicht
          eine offene Stelle — es ist die Form, in der ihr arbeitet.
        </p>
      </Reveal>

      <div className="relative">
        {/* Vertikale Zeitlinie */}
        <div className="absolute left-0 md:left-8 top-2 bottom-2 w-px bg-gradient-to-b from-bone-500/10 via-bone-500/40 to-bone-500/10" />

        <div className="space-y-16">
          {ZEITACHSE.map((punkt, i) => (
            <Reveal key={punkt.jahr} delay={i * 100}>
              <div className="relative pl-8 md:pl-24">
                <div className="absolute left-[-3px] md:left-[29px] top-3 h-1.5 w-1.5 rounded-full bg-platinum shadow-[0_0_20px_rgba(184,196,208,0.6)]" />
                <div className="font-mono text-xs tracking-[0.4em] text-platinum uppercase mb-3">
                  {punkt.jahr}
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-bone-100 mb-4 max-w-[20ch]">
                  {punkt.titel}
                </h3>
                <p className="text-lede max-w-[52ch]">{punkt.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
