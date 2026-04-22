import { SectionFrame } from "@/components/section-frame";
import { Reveal } from "@/components/scroll-reveal";

/**
 * 01 — WER ICH BIN
 * Inhaltliche Quelle: 02-samir-positioning/alleinstellung.md
 * Stub-Texte werden spaeter durch Samirs Daten ersetzt.
 */
export function WerIchBin() {
  return (
    <SectionFrame
      id="wer-ich-bin"
      index="01"
      eyebrow="Wer ich bin"
      canvas="wireframe-mesh"
      title={
        <>
          Schreiner-Geselle.
          <br />
          Meister-Anwärter.
          <br />
          <span className="text-bone-400">Mehr.</span>
        </>
      }
    >
      <Reveal>
        <p className="text-lede max-w-[58ch]">
          Geboren 2002 in Mainz, aufgewachsen in Büttelborn.
          Seit 02/2023 Schreiner-Geselle, aktuell in der Vollzeit-Fortbildung
          zum Tischlermeister an der HWK Wiesbaden — Teil III läuft, Prüfung
          im Mai 2026.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <p className="text-lede max-w-[58ch] text-bone-300">
          Fünf Jahre bei einer Schreinerei mit Ladenbau-Schwerpunkt — Lehre und
          Anstellung. Kein Möbelbau-Spezialist, kein CNC-Veteran.
          Aufbau-Organisation auf der Baustelle, Team-Koordination,
          Entscheidungen unter Zeitdruck.
        </p>
      </Reveal>

      <Reveal delay={240}>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-3xl">
          {[
            { label: "Geselle seit", value: "02/2023" },
            { label: "Meisterprüfung", value: "Mai 2026" },
            { label: "CAD aktiv", value: "9 Monate" },
            { label: "Standort", value: "Büttelborn" },
          ].map((stat) => (
            <div key={stat.label} className="border-t border-bone-500/30 pt-4">
              <div className="text-eyebrow mb-2">{stat.label}</div>
              <div className="font-display text-2xl text-bone-100">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </SectionFrame>
  );
}
