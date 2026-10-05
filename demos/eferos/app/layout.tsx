import type { Metadata, Viewport } from "next";
import { business } from "@/business.config";
import { allowIndexing, baseOpenGraph, siteUrl } from "@/lib/site";
import { clinicJsonLd } from "@/lib/jsonld";
import { archivo, newsreader, plexMono } from "./fonts";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RevealObserver from "@/components/RevealObserver";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${business.name} · Mairena del Aljarafe`,
    template: `%s · ${business.name}`,
  },
  description: business.description,
  applicationName: business.name,
  alternates: { canonical: "/" },
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    ...baseOpenGraph,
    title: `${business.name} · Mairena del Aljarafe`,
    description: business.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// Activa las animaciones de entrada antes del primer pintado, solo si el
// navegador las soporta y el usuario no ha pedido reducir el movimiento.
const revealBoot = `try{if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reveal-ready')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBoot }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd()) }}
        />
      </head>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
