import { Reveal } from "@/components/scroll-reveal";
import { Footer } from "@/components/footer";
import { SpiraleGlyph } from "@/components/icons";

export const metadata = {
  title: "Wie ich denke — Samir Ballhausen für GROSS",
};

/**
 * /manifest — Editorial Langform "Wie ich denke".
 * Heute: Skelett mit Platzhalter-Manifest. Wird mit Samirs Eigentext gefuellt.
 */
export default function Page() {
  return (
    <main className="relative min-h-screen pt-32">
      <article className="relative w-full px-6 py-32 md:px-12 md:py-44 lg:px-20">
        <div className="mx-auto max-w-[820px]">
          <header className="mb-20">
            <span className="font-mono text-xs tracking-[0.4em] text-bone-500 uppercase">
              Manifest · 01
            </span>
            <h1 className="font-display text-display-lg text-bone-100 mt-6 max-w-[14ch]">
              Handwerk und
              <br />
              Maschine sind
              <br />
              <span className="text-bone-400">keine Gegner.</span>
            </h1>
          </header>

          <Reveal>
            <p className="text-lede mb-12">
              Es gibt eine alte Geschichte im Handwerk: Wer mit der Hand
              arbeitet, ehrt die Tradition. Wer mit der Maschine arbeitet,
              verliert sie. Ich glaube, die Geschichte ist falsch.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-lede mb-12 text-bone-300">
              Mein Großvater hat noch jede Verbindung von Hand gefräst. Mein
              Vater hat schon Schablonen genutzt. Meine Generation hat eine
              CNC zur Verfügung — und entscheidet trotzdem jeden Morgen, ob
              die Verbindung sichtbar bleibt oder nicht. Die Entscheidung
              ist es. Nicht die Sehnen am Handrücken.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="text-lede mb-12 text-bone-300">
              Was ich an GROSS sehe ist genau dieses Verhältnis — gewachsen
              über vierzig Jahre. Maschine in der Halle, aber Mensch auf
              der Baustelle. Plan im CAD, aber Hand am Material. Das ist
              das was bleibt.
            </p>
          </Reveal>

          <Reveal delay={450}>
            <div className="my-24 flex justify-center">
              <SpiraleGlyph size={140} className="text-platinum/30" />
            </div>
          </Reveal>

          <Reveal delay={600}>
            <p className="font-display text-2xl text-bone-100 max-w-[28ch] leading-tight">
              Diese Seite füllt sich noch. Was ich am Ende geschrieben
              haben will: <em className="text-platinum not-italic">drei
              Texte</em> die zusammen ein Bild ergeben.
            </p>
          </Reveal>
        </div>
      </article>
      <Footer />
    </main>
  );
}
