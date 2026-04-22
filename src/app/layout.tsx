import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { LenisProvider } from "@/components/lenis-provider";
import { CursorGlow } from "@/components/cursor-glow";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samir Ballhausen — Bewerbung GROSS Messe & Event",
  description:
    "Schreiner-Geselle, Meister-Anwaerter, technischer Zeichner, Digital-Pilot. Initiativbewerbung fuer GROSS Messe & Event.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body>
        <LenisProvider>
          <CursorGlow />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
