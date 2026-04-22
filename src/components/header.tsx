"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Manifest" },
  { href: "/projekte/", label: "Projekte" },
  { href: "/manifest/", label: "Wie ich denke" },
  { href: "/kontakt/", label: "Kontakt" },
];

/**
 * Header — fixed top-bar mit Logo + dezenter Navigation.
 *
 * Mobile: nur Logo + Menu-Toggle (toggle haengt UI-State an html-Class).
 * Desktop: Logo links, Nav rechts mit Active-Indicator.
 *
 * Atmet leicht — Border-Bottom faded ein bei Scroll (CSS-only via
 * scroll-driven animation in globals.css).
 */
export function Header() {
  const pathname = usePathname();
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 px-6 py-5 md:px-12 md:py-6 lg:px-20"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="mx-auto max-w-[1440px] flex items-center justify-between"
        style={{ pointerEvents: "auto" }}
      >
        <Link href="/" aria-label="Zur Startseite" className="group">
          <Logo size="sm" sub="Initiativbewerbung" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden md:flex items-center gap-10">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href.replace(/\/$/, ""));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative font-mono text-[0.65rem] tracking-[0.32em] uppercase transition-colors duration-500",
                  active ? "text-bone-100" : "text-bone-500 hover:text-bone-200"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-2 left-0 right-0 h-px bg-platinum origin-left transition-transform duration-500",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Mobile placeholder — keine Hamburger-Menue noetig auf 4-Page-Site,
            stattdessen direkter Anchor zum Kontakt unten */}
        <Link
          href="/kontakt/"
          className="md:hidden font-mono text-[0.6rem] tracking-[0.32em] uppercase text-platinum"
        >
          Kontakt →
        </Link>
      </div>
    </header>
  );
}
