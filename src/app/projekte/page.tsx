import { SectionFrame } from "@/components/section-frame";
import { Reveal } from "@/components/scroll-reveal";
import { Footer } from "@/components/footer";
import { SpiraleGlyph } from "@/components/icons";

export const metadata = {
  title: "Projekte — Samir Ballhausen für GROSS",
};

/**
 * /projekte — Werkschau-Skelett.
 * Spaeter: CAD-Zeichnungen, Ladenbau-Bilder, Konfigurator-Demos.
 * Heute: Page existiert, Header funktioniert, Inhalt ist Stub.
 */
export default function Page() {
  return (
    <main className="relative min-h-screen pt-32">
      <section className="relative w-full px-6 py-32 md:px-12 md:py-44 lg:px-20 overflow-hidden">
        <div className="mx-auto max-w-[1440px] grid grid-cols-12 gap-x-6">
          <header className="col-span-12 md:col-span-3">
            <span className="font-mono text-xs tracking-[0.4em] text-bone-500">
              §
            </span>
            <span className="text-eyebrow mt-3 block">Werkschau</span>
          </header>
          <div className="col-span-12 md:col-span-9">
            <h1 className="font-display text-display-xl text-bone-100 mb-12 max-w-[14ch]">
              Drei Sachen,
              <br />
              die ich gebaut habe.
            </h1>
            <Reveal>
              <p className="text-lede max-w-[58ch]">
                Diese Seite füllt sich in den naechsten Tagen mit konkreten
                Belegen — Werkzeichnungen aus dem Meister-Kurs,
                Ladenbau-Aufbauten, einer Demo des Konfigurator-Pilots. Was
                ich kann zeige ich am liebsten an Sachen, nicht an
                Adjektiven.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-32 flex justify-center">
                <SpiraleGlyph size={120} className="text-platinum/20" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
