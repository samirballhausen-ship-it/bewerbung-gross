/**
 * Footer — discrete. Dank an Steven Mai in einer Zeile.
 * Impressum-Link vorbereitet (Stub).
 */
export function Footer() {
  return (
    <footer className="relative w-full border-t border-bone-500/15 px-6 py-16 md:px-12 lg:px-20 mt-32">
      <div className="mx-auto max-w-[1440px] grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-6">
          <p className="text-bone-400 max-w-[42ch] leading-relaxed">
            Mein Dank an{" "}
            <span className="text-bone-100">Steven Mai</span> — Senior
            Projektleitung bei GROSS und mein Dozent für Technisches Zeichnen
            an der HWK Wiesbaden. Diese Begegnung wäre ohne ihn nicht zustande
            gekommen.
          </p>
        </div>

        <div className="col-span-12 md:col-span-6 md:text-right space-y-2">
          <div className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-500 uppercase">
            Samir Ballhausen
          </div>
          <div className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-500 uppercase">
            Rhein-Main · Hessen
          </div>
          <div className="flex gap-6 md:justify-end pt-4">
            <a
              href="mailto:samir.ballhausen@gmail.com"
              className="font-mono text-[0.65rem] tracking-[0.4em] text-bone-500 uppercase hover:text-bone-200 transition-colors"
            >
              Mail
            </a>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t border-bone-500/10 mx-auto max-w-[1440px]">
        <span className="font-mono text-[0.6rem] tracking-[0.4em] text-bone-500 uppercase">
          Bewerbung · 2026 · v0.1
        </span>
      </div>
    </footer>
  );
}
