import { Hero } from "@/components/hero";
import { WerIchBin } from "@/components/sections/wer-ich-bin";
import { WasIchMitbringe } from "@/components/sections/was-ich-mitbringe";
import { WarumGross } from "@/components/sections/warum-gross";
import { WasIchTunWuerde } from "@/components/sections/was-ich-tun-wuerde";
import { WieIchDenke } from "@/components/sections/wie-ich-denke";
import { DasAngebot } from "@/components/sections/das-angebot";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="relative w-full">
      <Hero />
      <WerIchBin />
      <WasIchMitbringe />
      <WarumGross />
      <WasIchTunWuerde />
      <WieIchDenke />
      <DasAngebot />
      <Footer />
    </main>
  );
}
