import { SectionFrame } from "@/components/section-frame";
import { Reveal } from "@/components/scroll-reveal";

/**
 * 06 — DAS ANGEBOT
 * Sachlich am Ende: Rahmen, Kontakt, Mail-Button.
 * Kein Pathos, kein "Vielen Dank für Ihre Aufmerksamkeit".
 */
export function DasAngebot() {
  return (
    <SectionFrame
      id="angebot"
      index="06"
      eyebrow="Das Angebot"
      canvas="blueprint-rays"
      title={
        <>
          Sachlich,
          <br />
          ohne Drama.
        </>
      }
    >
      <Reveal>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2 max-w-2xl mb-16">
          {[
            { k: "Rahmen", v: "Midijob, 2 Tage / Woche" },
            { k: "Brutto", v: "ca. 1.250 – 1.500 € / Monat" },
            { k: "Sozialvers.", v: "Über die Anstellung" },
            { k: "Start", v: "Juli 2026 (BAföG-Ende Mai)" },
            { k: "Ort", v: "Hofheim a. Ts., 2 Tage vor Ort" },
            { k: "Urlaub", v: "10 Tage bereits Juni 2026" },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-baseline gap-4 border-b border-bone-500/20 pb-3"
            >
              <span className="text-eyebrow w-32 shrink-0">{row.k}</span>
              <span className="font-display text-lg text-bone-100">
                {row.v}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div id="kontakt" className="border-t border-bone-500/20 pt-12">
          <p className="text-lede max-w-[58ch] mb-8 text-bone-300">
            Zur konkreten Gestaltung — Stunden, Stundensatz, Tage —
            bin ich offen. Wichtiger ist mir die Passung der Rolle.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="mailto:samir.ballhausen@gmail.com?subject=Bewerbung%20GROSS%20Messe%20%26%20Event"
              className="group inline-flex items-center gap-4 border border-bone-200/30 px-8 py-5 text-bone-100 hover:bg-bone-200 hover:text-void-900 transition-colors duration-500"
            >
              <span className="font-display text-base">
                samir.ballhausen@gmail.com
              </span>
              <span className="font-mono text-sm group-hover:translate-x-1 transition-transform duration-500">
                →
              </span>
            </a>
            <span className="font-mono text-[0.65rem] tracking-[0.32em] text-bone-500 uppercase sm:ml-4">
              oder einfach Steven Mai fragen
            </span>
          </div>
        </div>
      </Reveal>
    </SectionFrame>
  );
}
