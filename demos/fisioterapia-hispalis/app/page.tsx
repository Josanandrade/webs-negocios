import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyCta } from "@/components/StickyCta";
import { Areas } from "@/components/sections/Areas";
import { CaseFinder } from "@/components/sections/CaseFinder";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { Professional } from "@/components/sections/Professional";
import { Reviews } from "@/components/sections/Reviews";
import { Visit } from "@/components/sections/Visit";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <CaseFinder />
        <Areas />
        <Professional />
        <Method />
        <Reviews />
        <Faq />
        <Visit />
        <FinalCta />
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}
