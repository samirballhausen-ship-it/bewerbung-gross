import { SectionFrame } from "@/components/section-frame";
import { Reveal } from "@/components/scroll-reveal";

const ROLLEN = [
  {
    nr: "I",
    titel: "Technische Planung",
    sub: "Zuarbeit für Michael Breitkopf",
    text: "Werk- und Detailzeichnungen produzieren wo Kapazität endet. CAD-Aufbau für wiederkehrende Stand-Typologien. Aus der Werkstatt-Perspektive denken — was ist fertigbar, was kostet Zeit, was nicht.",
  },
  {
    nr: "II",
    titel: "Fertigungs-Zuarbeit",
    sub: "Brücke Werkstatt ↔ Plan",
    text: "Vorbereitung, Material-Disposition, Abstimmung mit Tobias Weist und Team. Die kleinen Reibungspunkte zwischen Plan und Werkstatt aufnehmen, dokumentieren, glätten.",
  },
  {
    nr: "III",
    titel: "Digitale Piloten",
    sub: "In dem Umfang der realistisch ist",
    text: "Ein Konfigurator für wiederkehrende Stand-Typen. Eine KI-gestützte Angebots-Visualisierung. Ein Social-Media-Workflow. Was daraus wächst, entscheiden wir gemeinsam.",
  },
];

/**
 * 04 — WAS ICH FÜR EUCH TUN WÜRDE
 * Drei Karten als Rollen-Vorschlag. Nicht "Stelle X" — Gestaltungs-Vorschlag.
 */
export function WasIchTunWuerde() {
  return (
    <SectionFrame
      id="rolle"
      index="04"
      eyebrow="Was ich für euch tun würde"
      canvas="particle-field"
      title={
        <>
          Ein Vorschlag,
          <br />
          drei Schichten.
        </>
      }
      align="right"
    >
      <Reveal>
        <p className="text-lede max-w-[58ch] mb-12">
          Nicht "ich bewerbe mich auf Stelle X". Sondern: hier ist eine Form,
          in der ich für euch nützlich werden könnte. Die Größe der einzelnen
          Schicht entscheiden wir gemeinsam.
        </p>
      </Reveal>

      <div className="space-y-px bg-bone-500/20">
        {ROLLEN.map((rolle, i) => (
          <Reveal key={rolle.nr} delay={i * 100} className="block">
            <div className="group relative bg-void-900 px-8 py-12 md:px-12 md:py-16 hover:bg-void-800 transition-colors duration-700">
              <div className="grid grid-cols-12 gap-6 items-baseline">
                <div className="col-span-12 md:col-span-1">
                  <span className="font-display text-4xl md:text-5xl text-platinum/60 group-hover:text-platinum transition-colors duration-700">
                    {rolle.nr}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <h3 className="font-display text-3xl text-bone-100 mb-2">
                    {rolle.titel}
                  </h3>
                  <span className="text-eyebrow">{rolle.sub}</span>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <p className="text-bone-300 leading-relaxed">{rolle.text}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionFrame>
  );
}
