import { Reveal } from "@/components/scroll-reveal";
import { Footer } from "@/components/footer";
import { HandshakeGlyph, PfeilLong } from "@/components/icons";

export const metadata = {
  title: "Kontakt — Samir Ballhausen für GROSS",
};

/**
 * /kontakt — kein Formular. Ein Atmosphaere-Raum mit zwei Wegen:
 * (a) direkter Mail-Kontakt, (b) ueber Steven Mai.
 */
export default function Page() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <section className="relative flex-1 flex items-center w-full px-6 py-32 md:px-12 md:py-44 lg:px-20 overflow-hidden">
        {/* Hintergrund-Aura */}
        <div className="hero-aura" />

        <div className="relative z-10 mx-auto max-w-[1100px] w-full">
          <Reveal>
            <span className="font-mono text-xs tracking-[0.4em] text-bone-500 uppercase">
              Kontakt
            </span>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="font-display text-display-xl text-bone-100 mt-6 mb-16 max-w-[12ch]">
              Zwei
              <br />
              Wege
              <br />
              <span className="text-bone-400">rein.</span>
            </h1>
          </Reveal>

          <div className="grid grid-cols-1 gap-px bg-bone-500/20 md:grid-cols-2 mt-12">
            <Reveal delay={250}>
              <a
                href="mailto:samir.ballhausen@gmail.com?subject=Bewerbung%20GROSS%20Messe%20%26%20Event"
                className="group block bg-void-900 hover:bg-void-800 transition-colors duration-700 p-10 md:p-14"
              >
                <span className="text-eyebrow mb-6 block">Direkt</span>
                <h2 className="font-display text-3xl text-bone-100 mb-4">
                  Per Mail
                </h2>
                <p className="text-bone-300 leading-relaxed mb-8 max-w-[36ch]">
                  Eine Zeile reicht. Antwort innerhalb von 24 Stunden,
                  meistens schneller.
                </p>
                <div className="flex items-center gap-4 text-platinum">
                  <span className="font-display">
                    samir.ballhausen@gmail.com
                  </span>
                  <PfeilLong
                    size={48}
                    className="opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500"
                  />
                </div>
              </a>
            </Reveal>

            <Reveal delay={350}>
              <div className="bg-void-900 p-10 md:p-14">
                <span className="text-eyebrow mb-6 block">Vermittelt</span>
                <h2 className="font-display text-3xl text-bone-100 mb-4">
                  Über Steven Mai
                </h2>
                <p className="text-bone-300 leading-relaxed mb-8 max-w-[36ch]">
                  Steven hat diese Begegnung initiiert. Wenn du lieber mit
                  ihm sprichst — er kennt meine Arbeit aus dem Kurs.
                </p>
                <div className="flex items-center gap-3 text-bone-400">
                  <HandshakeGlyph size={20} />
                  <span className="font-mono text-xs tracking-[0.32em] uppercase">
                    Senior PL · GROSS · HWK Wiesbaden
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={500}>
            <p className="text-lede mt-20 max-w-[58ch] text-bone-400">
              Die Bewerbungsunterlagen — Anschreiben, Lebenslauf — folgen
              als PDF im Anhang der Mail. Wenn ihr lieber zuerst lest und
              danach entscheidet, ob ein Gespräch sinnvoll ist: völlig in
              Ordnung.
            </p>
          </Reveal>
        </div>
      </section>
      <Footer />
    </main>
  );
}
