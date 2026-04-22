import { SectionFrame } from "@/components/section-frame";
import { Reveal } from "@/components/scroll-reveal";

const BEWEISE = [
  {
    label: "Case 01",
    titel: "Konfigurator-Plattform",
    desc: "Kunden konfigurieren ihre Lösung visuell, sehen Preis und Lieferzeit live.",
    tags: ["React", "TypeScript", "3D"],
  },
  {
    label: "Case 02",
    titel: "Technische Zeichnung",
    desc: "Werk- und Detailzeichnung aus dem aktuellen Meister-Kurs.",
    tags: ["AutoCAD", "Maßstab 1:5", "DIN"],
  },
  {
    label: "Case 03",
    titel: "Ladenbau-Projekt",
    desc: "Eines der von mir koordinierten Aufbau-Projekte — Bilder folgen.",
    tags: ["Steck-Regal", "Aufbau", "Vor Ort"],
  },
];

/**
 * 05 — WIE ICH DENKE
 * Case-Studies als kleine Dossiers. Heute Stubs, später Bilder + Detail-Texte.
 */
export function WieIchDenke() {
  return (
    <SectionFrame
      id="cases"
      index="05"
      eyebrow="Wie ich denke"
      canvas="wireframe-mesh"
      title={
        <>
          Drei Beweise,
          <br />
          keine Behauptung.
        </>
      }
    >
      <Reveal>
        <p className="text-lede max-w-[58ch] mb-16">
          Drei kleine Dossiers — keine Show, kein Reel. Was ich kann zeige
          ich am liebsten an konkreten Sachen, nicht an Adjektiven.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        {BEWEISE.map((b, i) => (
          <Reveal key={b.label} delay={i * 120}>
            <article className="group">
              {/* Visual Placeholder — wird später Bild */}
              <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-gradient-to-br from-void-700 to-void-900 border border-bone-500/15">
                <div className="absolute inset-0 bg-grain" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-500 uppercase">
                    Bild folgt
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="font-mono text-[0.65rem] tracking-[0.4em] text-platinum uppercase">
                    {b.label}
                  </span>
                </div>
              </div>
              <h3 className="font-display text-xl text-bone-100 mb-3">
                {b.titel}
              </h3>
              <p className="text-bone-300 text-sm leading-relaxed mb-4">
                {b.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {b.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[0.6rem] tracking-[0.2em] text-bone-400 uppercase border border-bone-500/30 px-2 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionFrame>
  );
}
