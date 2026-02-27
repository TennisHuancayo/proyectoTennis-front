import Image from "next/image";

import { Hero } from "@/components/landing/Hero";
import { Sponsors } from "@/components/landing/Sponsors";
import { Pricing } from "@/components/landing/Pricing";
import { News } from "@/components/landing/News";
import { CourtReservation } from "@/components/landing/CourtReservation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Sponsors />
      <Pricing />
      <CourtReservation />
      <News />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/51999999999?text=Hola%20Romina,%20quisiera%20más%20información%20sobre%20las%20clases."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
      </a>
    </div>
  );
}
