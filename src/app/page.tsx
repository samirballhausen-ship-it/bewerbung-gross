import { Experience } from "@/components/experience";
import { MessestandSection } from "@/components/messestand-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="relative w-full">
      <Experience />
      <MessestandSection />
      <Footer />
    </main>
  );
}
