import { SectionFrame } from "@/components/section-frame";
import { Reveal } from "@/components/scroll-reveal";

const FELDER = [
  {
    nr: "01",
    titel: "Ladenbau & Aufbau-Organisation",
    text: "Fünf Jahre Schreinerei Feldmann, Schwerpunkt Ladenbau. Steck-Regalsysteme, Wandverkleidungen, Türen und Fenster. Verantwortung für Aufbau-Koordination kleinerer Projekte — Termine halten, Team führen, Probleme vor Ort lösen.",
    proof: "Referenzen auf Anfrage.",
  },
  {
    nr: "02",
    titel: "Schreiner-Handwerk",
    text: "HWK-Gesellenbrief 02/2023. Aktuelle Meister-Vorbereitung an der HWK Wiesbaden. Materialverständnis aus der Werkstatt heraus — was hält, was bricht, wann etwas teurer und wann etwas billiger zu fertigen ist.",
    proof: "Meisterprüfung Mai 2026.",
  },
  {
    nr: "03",
    titel: "Technisches Zeichnen & CAD",
    text: "Aktiv im Meister-Kurs Technisches Zeichnen bei Steven Mai. CAD-Praxis aus eigenen Konfigurator-Projekten und Möbel-Visualisierungen. Kann Werk- und Detailzeichnungen lesen — und produzieren.",
    proof: "Zeichnungen aus dem Kurs einsehbar.",
  },
  {
    nr: "04",
    titel: "Digitale Werkzeuge & KI",
    text: "Eigene Tool-Pipeline für Konfiguratoren, Angebots-Visualisierung, Social-Media-Automation. Pragmatisch, nicht akademisch. Kann zeigen, was Sinn macht — und was nicht.",
    proof: "Demo auf Wunsch.",
  },
];

/**
 * 02 — WAS ICH MITBRINGE
 * Vier Felder als Editorial-Grid. Inhaltliche Stubs aus alleinstellung.md +
 * wunschrolle.md, werden mit echten Beispielen angereichert.
 */
export function WasIchMitbringe() {
  return (
    <SectionFrame
      id="was-ich-mitbringe"
      index="02"
      eyebrow="Was ich mitbringe"
      canvas="plotter-grid"
      title={
        <>
          Vier Felder,
          <br />
          eine Person.
        </>
      }
      align="right"
    >
      <div className="grid grid-cols-1 gap-px bg-bone-500/20 md:grid-cols-2 mt-8">
        {FELDER.map((feld, i) => (
          <Reveal key={feld.nr} delay={i * 80} className="bg-void-900 p-8 md:p-10">
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono text-xs tracking-[0.32em] text-bone-500">
                {feld.nr}
              </span>
              <div className="h-px w-10 bg-bone-500/40 mt-3" />
            </div>
            <h3 className="font-display text-2xl text-bone-100 mb-4 max-w-[18ch]">
              {feld.titel}
            </h3>
            <p className="text-bone-300 leading-relaxed mb-6">{feld.text}</p>
            <span className="text-eyebrow text-platinum">→ {feld.proof}</span>
          </Reveal>
        ))}
      </div>
    </SectionFrame>
  );
}
