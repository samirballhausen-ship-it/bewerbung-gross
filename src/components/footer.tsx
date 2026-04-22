import { Logo } from "@/components/logo";
import { WaveLine, HandshakeGlyph } from "@/components/icons";

/**
 * Footer — discrete. Wave-Divider oben, Logo, Steven-Mai-Dank,
 * Mail-Link. Kein Adress-Footprint.
 */
export function Footer() {
  return (
    <footer className="relative w-full mt-32 pt-16">
      <div className="text-platinum/15 absolute -top-5 left-0 right-0">
        <WaveLine />
      </div>

      <div className="relative px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1440px] grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-5">
            <Logo size="md" sub="Bewerbung 2026" className="mb-8" />
            <div className="flex items-start gap-3 text-bone-400 max-w-[42ch]">
              <HandshakeGlyph size={22} className="text-platinum/60 shrink-0 mt-1" />
              <p className="leading-relaxed">
                Mein Dank an{" "}
                <span className="text-bone-100">Steven Mai</span> — Senior
                Projektleitung bei GROSS und mein Dozent für Technisches
                Zeichnen an der HWK Wiesbaden.
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 md:text-right space-y-3 mt-12 md:mt-0">
            <a
              href="mailto:samir.ballhausen@gmail.com"
              className="inline-block font-display text-2xl text-bone-100 hover:text-platinum transition-colors duration-500"
            >
              samir.ballhausen@gmail.com
            </a>
            <div className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-500 uppercase">
              Samir Ballhausen · Rhein-Main · Hessen
            </div>
            <div className="flex gap-6 md:justify-end pt-6">
              <span className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-500 uppercase">
                Anschreiben + CV folgen als PDF
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-bone-500/10 mx-auto max-w-[1440px] flex justify-between items-center">
          <span className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase">
            Initiativbewerbung · 2026 · v0.2
          </span>
          <span className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase hidden md:inline">
            Bestens für Maximilian Bitter
          </span>
        </div>
      </div>
    </footer>
  );
}
